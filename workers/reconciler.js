/**
 * Order Reconciliation Worker
 * 
 * Periodically syncs order status from exchange to database
 * Ensures data consistency between local orders and exchange state
 * 
 * Query Strategy:
 * - Targets orders with external_order_id (placed on exchange)
 * - Focuses on incomplete orders (pending, partial, new)
 * - Skips recently synced orders (last_synced_at < 5 minutes ago)
 * - Processes in batches (200 orders at a time)
 * 
 * Reconciliation Flow:
 * 1. Query stale orders from database
 * 2. Fetch order status from exchange (with circuit breaker)
 * 3. Map exchange status to internal status
 * 4. Update database with latest info
 * 5. Log activity for audit trail
 * 6. Track metrics (discrepancies, errors, sync rate)
 * 
 * Run with PM2:
 * pm2 start workers/reconciler.js --name "reconciler" --cron-restart="* * * * *"
 */

require('dotenv').config();
const { Pool } = require('pg');
const ExchangeFactory = require('../adapters/ExchangeFactory');
const { CircuitBreaker, withRetry } = require('../utils/circuitBreaker');
const { logger } = require('../utils/logMasking');

// Configuration
const RECONCILIATION_INTERVAL_MS = process.env.RECONCILIATION_INTERVAL_MS || 45000; // 45 seconds
const STALE_THRESHOLD_MINUTES = process.env.RECONCILIATION_STALE_MINUTES || 5;
const BATCH_SIZE = process.env.RECONCILIATION_BATCH_SIZE || 200;
const MAX_RETRIES = 3;

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5, // Smaller pool for worker
});

// Exchange adapter
let exchange;
let exchangeCircuitBreaker;

// Metrics
const metrics = {
  totalReconciled: 0,
  discrepanciesFound: 0,
  errors: 0,
  lastRunTimestamp: null,
  lastRunDuration: 0,
  stateTransitions: {
    'pending->filled': 0,
    'pending->cancelled': 0,
    'pending->rejected': 0,
    'partial->filled': 0,
    'partial->cancelled': 0,
    'new->filled': 0,
    'new->cancelled': 0,
    'new->rejected': 0
  }
};

/**
 * Initialize exchange adapter and circuit breaker
 */
async function initializeExchange() {
  try {
    exchange = ExchangeFactory.createFromEnv();
    await exchange.initialize();
    
    exchangeCircuitBreaker = new CircuitBreaker({
      name: 'exchange-reconciliation',
      failureThreshold: 5,
      successThreshold: 2,
      windowMs: 60000,
      openDurationMs: 120000 // 2 minutes for reconciliation
    });
    
    logger.info('[Reconciler] Exchange initialized', {
      exchange: exchange.name,
      testnet: exchange.isTestnet
    });
    
    return true;
  } catch (error) {
    logger.error('[Reconciler] Failed to initialize exchange:', error.message);
    return false;
  }
}

/**
 * Query stale orders that need reconciliation
 */
async function queryStaleOrders() {
  const query = `
    SELECT 
      id, 
      symbol, 
      external_order_id, 
      status AS current_status,
      qty,
      filled_qty,
      avg_price,
      side,
      order_type,
      exchange,
      created_at,
      last_synced_at
    FROM orders
    WHERE external_order_id IS NOT NULL
      AND status IN ('pending', 'partial', 'new')
      AND (
        last_synced_at IS NULL 
        OR last_synced_at < NOW() - INTERVAL '${STALE_THRESHOLD_MINUTES} minutes'
      )
    ORDER BY last_synced_at ASC NULLS FIRST
    LIMIT $1
  `;
  
  const result = await pool.query(query, [BATCH_SIZE]);
  return result.rows;
}

/**
 * Fetch order status from exchange with circuit breaker
 */
async function fetchOrderFromExchange(order) {
  return await exchangeCircuitBreaker.execute(async () => {
    return await withRetry(
      `getOrder-${order.external_order_id}`,
      async () => {
        return await exchange.getOrder(order.external_order_id, order.symbol);
      },
      { maxRetries: MAX_RETRIES, initialDelayMs: 300, maxDelayMs: 2000 }
    );
  });
}

/**
 * Update order in database with exchange data
 */
async function updateOrderInDatabase(order, exchangeData) {
  const updateQuery = `
    UPDATE orders
    SET 
      status = $1,
      filled_qty = COALESCE($2, filled_qty),
      avg_price = COALESCE($3, avg_price),
      last_synced_at = NOW(),
      updated_at = NOW()
    WHERE id = $4
    RETURNING id, status, filled_qty, avg_price
  `;
  
  const result = await pool.query(updateQuery, [
    exchangeData.status,
    exchangeData.executedQty || null,
    exchangeData.avgPrice || null,
    order.id
  ]);
  
  return result.rows[0];
}

/**
 * Log reconciliation activity
 */
async function logReconciliationActivity(order, oldStatus, newStatus, exchangeData) {
  const activityQuery = `
    INSERT INTO activities (
      user_id, 
      action, 
      details, 
      timestamp
    ) 
    VALUES (
      (SELECT user_id FROM orders WHERE id = $1),
      'reconciliation.update',
      $2,
      NOW()
    )
  `;
  
  const details = {
    orderId: order.id,
    externalOrderId: order.external_order_id,
    symbol: order.symbol,
    exchange: order.exchange,
    oldStatus: oldStatus,
    newStatus: newStatus,
    executedQty: exchangeData.executedQty,
    avgPrice: exchangeData.avgPrice,
    reconciliationTimestamp: new Date().toISOString()
  };
  
  await pool.query(activityQuery, [order.id, JSON.stringify(details)]);
}

/**
 * Reconcile a single order
 */
async function reconcileOrder(order) {
  try {
    // Fetch order status from exchange
    const exchangeData = await fetchOrderFromExchange(order);
    
    // Check if status changed
    const oldStatus = order.current_status;
    const newStatus = exchangeData.status;
    
    if (oldStatus !== newStatus || 
        order.filled_qty !== exchangeData.executedQty ||
        order.avg_price !== exchangeData.avgPrice) {
      
      // Update database
      const updated = await updateOrderInDatabase(order, exchangeData);
      
      // Log activity
      await logReconciliationActivity(order, oldStatus, newStatus, exchangeData);
      
      // Track metrics
      metrics.discrepanciesFound++;
      const transitionKey = `${oldStatus}->${newStatus}`;
      if (metrics.stateTransitions[transitionKey] !== undefined) {
        metrics.stateTransitions[transitionKey]++;
      }
      
      logger.info('[Reconciler] Order reconciled', {
        orderId: order.id,
        externalOrderId: order.external_order_id,
        symbol: order.symbol,
        oldStatus,
        newStatus,
        executedQty: exchangeData.executedQty,
        avgPrice: exchangeData.avgPrice
      });
      
      return { success: true, updated: true };
    } else {
      // No changes, just update last_synced_at
      await pool.query(
        'UPDATE orders SET last_synced_at = NOW() WHERE id = $1',
        [order.id]
      );
      
      return { success: true, updated: false };
    }
  } catch (error) {
    metrics.errors++;
    
    logger.error('[Reconciler] Failed to reconcile order', {
      orderId: order.id,
      externalOrderId: order.external_order_id,
      symbol: order.symbol,
      error: error.message,
      code: error.code
    });
    
    // If circuit is open, don't mark as error (it's expected)
    if (error.code === 'CIRCUIT_OPEN' || error.code === 'CIRCUIT_HALF_OPEN_LIMIT') {
      return { success: false, circuitOpen: true };
    }
    
    return { success: false, error: error.message };
  }
}

/**
 * Main reconciliation cycle
 */
async function runReconciliation() {
  const startTime = Date.now();
  metrics.lastRunTimestamp = new Date().toISOString();
  
  try {
    logger.info('[Reconciler] Starting reconciliation cycle');
    
    // Query stale orders
    const staleOrders = await queryStaleOrders();
    
    if (staleOrders.length === 0) {
      logger.info('[Reconciler] No stale orders found');
      metrics.lastRunDuration = Date.now() - startTime;
      return;
    }
    
    logger.info(`[Reconciler] Found ${staleOrders.length} stale orders to reconcile`);
    
    // Process orders in parallel (with concurrency limit)
    const CONCURRENCY_LIMIT = 10;
    const results = [];
    
    for (let i = 0; i < staleOrders.length; i += CONCURRENCY_LIMIT) {
      const batch = staleOrders.slice(i, i + CONCURRENCY_LIMIT);
      const batchResults = await Promise.all(
        batch.map(order => reconcileOrder(order))
      );
      results.push(...batchResults);
      
      // Small delay between batches to avoid overwhelming exchange API
      if (i + CONCURRENCY_LIMIT < staleOrders.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    // Calculate summary
    const successful = results.filter(r => r.success).length;
    const updated = results.filter(r => r.updated).length;
    const circuitOpenCount = results.filter(r => r.circuitOpen).length;
    
    metrics.totalReconciled += successful;
    metrics.lastRunDuration = Date.now() - startTime;
    
    logger.info('[Reconciler] Reconciliation cycle completed', {
      total: staleOrders.length,
      successful,
      updated,
      errors: metrics.errors,
      circuitOpen: circuitOpenCount,
      duration: metrics.lastRunDuration
    });
    
    // Log circuit breaker state
    const cbMetrics = exchangeCircuitBreaker.getMetrics();
    logger.info('[Reconciler] Circuit breaker status', {
      state: cbMetrics.state,
      totalCalls: cbMetrics.metrics.totalCalls,
      rejectedCalls: cbMetrics.metrics.rejectedCalls
    });
    
  } catch (error) {
    metrics.errors++;
    logger.error('[Reconciler] Reconciliation cycle failed:', error.message);
  }
}

/**
 * Get current metrics (for monitoring endpoint)
 */
function getMetrics() {
  return {
    ...metrics,
    circuitBreaker: exchangeCircuitBreaker ? exchangeCircuitBreaker.getMetrics() : null
  };
}

/**
 * Main entry point
 */
async function main() {
  logger.info('[Reconciler] Starting order reconciliation worker', {
    intervalMs: RECONCILIATION_INTERVAL_MS,
    staleThresholdMinutes: STALE_THRESHOLD_MINUTES,
    batchSize: BATCH_SIZE
  });
  
  // Initialize exchange
  const initialized = await initializeExchange();
  if (!initialized) {
    logger.error('[Reconciler] Failed to initialize, exiting');
    process.exit(1);
  }
  
  // Run immediately on startup
  await runReconciliation();
  
  // Schedule periodic runs
  setInterval(async () => {
    await runReconciliation();
  }, RECONCILIATION_INTERVAL_MS);
  
  // Handle graceful shutdown
  process.on('SIGTERM', async () => {
    logger.info('[Reconciler] Received SIGTERM, shutting down gracefully');
    await pool.end();
    process.exit(0);
  });
  
  process.on('SIGINT', async () => {
    logger.info('[Reconciler] Received SIGINT, shutting down gracefully');
    await pool.end();
    process.exit(0);
  });
}

// Start worker if run directly
if (require.main === module) {
  main().catch(error => {
    logger.error('[Reconciler] Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  runReconciliation,
  getMetrics
};
