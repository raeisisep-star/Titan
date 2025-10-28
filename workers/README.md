# Workers - Background Job Processors

This directory contains background workers for asynchronous tasks that run independently from the main API server.

---

## 📦 Available Workers

### 1. **Reconciliation Worker** (`reconciler.js`)

**Purpose:** Periodically syncs order status from exchange to database to ensure data consistency.

**Configuration:**
```javascript
// Environment Variables (set in ecosystem.config.js or .env)
RECONCILIATION_INTERVAL_MS=45000      // Run every 45 seconds
RECONCILIATION_STALE_MINUTES=5        // Sync orders not updated in 5+ minutes
RECONCILIATION_BATCH_SIZE=200         // Process 200 orders per cycle
```

**Features:**
- ✅ Automatic order status synchronization
- ✅ Circuit breaker protection for exchange API failures
- ✅ Exponential backoff retry logic
- ✅ Activity logging for audit trail
- ✅ Metrics tracking (discrepancies, errors, sync rate)
- ✅ Graceful shutdown on SIGTERM/SIGINT

**Query Strategy:**
```sql
-- Orders eligible for reconciliation:
SELECT id, symbol, external_order_id, status
FROM orders
WHERE external_order_id IS NOT NULL          -- Has been placed on exchange
  AND status IN ('pending', 'partial', 'new') -- Incomplete orders only
  AND (
    last_synced_at IS NULL                   -- Never synced
    OR last_synced_at < NOW() - INTERVAL '5 minutes'  -- Stale sync
  )
ORDER BY last_synced_at ASC NULLS FIRST      -- Oldest first
LIMIT 200;                                    -- Batch processing
```

**Reconciliation Flow:**
1. Query stale orders from database
2. Fetch order status from exchange (with circuit breaker + retry)
3. Map exchange status to internal status
4. Update database: `status`, `executed_qty`, `avg_price`, `last_synced_at`
5. Log activity with action `reconciliation.update`
6. Track metrics for monitoring

**Circuit Breaker Configuration:**
```javascript
{
  name: 'exchange-reconciliation',
  failureThreshold: 5,        // Open after 5 failures in window
  successThreshold: 2,        // Close after 2 successes in half-open
  windowMs: 60000,            // 1 minute failure window
  openDurationMs: 120000      // Stay open for 2 minutes
}
```

**Retry Configuration:**
```javascript
{
  maxRetries: 3,              // Maximum 3 retry attempts
  initialDelayMs: 300,        // Start with 300ms delay
  maxDelayMs: 2000,           // Cap at 2 seconds
  backoffMultiplier: 2        // Exponential backoff (300ms → 600ms → 1200ms)
}
```

**Metrics Tracked:**
- `totalReconciled`: Total orders successfully reconciled
- `discrepanciesFound`: Orders with status/quantity mismatches
- `errors`: Failed reconciliation attempts
- `lastRunTimestamp`: When last cycle completed
- `lastRunDuration`: How long last cycle took (ms)
- `stateTransitions`: Counts of status changes (e.g., pending→filled)

**PM2 Management:**
```bash
# Start with PM2
pm2 start ecosystem.config.js --only reconciler

# Check status
pm2 status reconciler

# View logs
pm2 logs reconciler --lines 100

# Restart
pm2 restart reconciler

# Stop
pm2 stop reconciler

# Monitor in real-time
pm2 logs reconciler --raw
```

**Standalone Execution** (for testing):
```bash
# Set environment variables
export DATABASE_URL="postgresql://titan_user:password@localhost:5433/titan_trading"
export EXCHANGE_NAME="paper"
export RECONCILIATION_INTERVAL_MS=30000

# Run directly
node workers/reconciler.js

# Or with test JWT
TEST_JWT="<jwt-token>" node workers/reconciler.js
```

**Health Indicators:**

✅ **Healthy:**
- Circuit breaker state: CLOSED
- Reconciliation cycle duration: < 10 seconds
- Discrepancy rate: < 1%
- Errors per hour: < 5
- Last run: within last 60 seconds

⚠️ **Warning:**
- Circuit breaker state: HALF_OPEN
- Reconciliation cycle duration: 10-30 seconds
- Discrepancy rate: 1-5%
- Errors per hour: 5-20
- Last run: 60-300 seconds ago

🚨 **Critical:**
- Circuit breaker state: OPEN
- Reconciliation cycle duration: > 30 seconds
- Discrepancy rate: > 5%
- Errors per hour: > 20
- Last run: > 300 seconds ago

**Troubleshooting:**

See [INCIDENT-RUNBOOK.md](../INCIDENT-RUNBOOK.md) → **Incident 7: Order Reconciliation Issues**

---

## 🔧 Development

### Adding a New Worker

1. **Create worker file:** `workers/my-worker.js`

```javascript
require('dotenv').config();
const { logger } = require('../utils/logMasking');

async function main() {
  logger.info('[MyWorker] Starting...');
  
  // Your worker logic here
  
  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.info('[MyWorker] Shutting down...');
    process.exit(0);
  });
}

if (require.main === module) {
  main().catch(error => {
    logger.error('[MyWorker] Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { main };
```

2. **Add to PM2 config:** `ecosystem.config.js`

```javascript
{
  name: 'my-worker',
  script: './workers/my-worker.js',
  instances: 1,
  exec_mode: 'fork',
  env: {
    // Worker-specific environment variables
  },
  error_file: './logs/my-worker-error.log',
  out_file: './logs/my-worker-out.log'
}
```

3. **Test standalone:**
```bash
node workers/my-worker.js
```

4. **Deploy with PM2:**
```bash
pm2 start ecosystem.config.js --only my-worker
```

### Best Practices

- ✅ Use `logger` from `utils/logMasking.js` for consistent logging
- ✅ Implement graceful shutdown (SIGTERM/SIGINT handlers)
- ✅ Use circuit breakers for external API calls
- ✅ Implement retry logic with exponential backoff
- ✅ Track metrics for monitoring
- ✅ Log activities for audit trail
- ✅ Use environment variables for configuration
- ✅ Write integration tests
- ✅ Document in INCIDENT-RUNBOOK.md

---

## 📚 Related Documentation

- [INCIDENT-RUNBOOK.md](../INCIDENT-RUNBOOK.md) - Troubleshooting guide
- [SECURITY.md](../SECURITY.md) - Security best practices
- [README.md](../README.md) - Main project documentation
- [migrations/README.md](../migrations/README.md) - Database migrations

---

**Last Updated:** 2025-10-28  
**Maintained By:** Backend Team
