/**
 * TITAN Trading System - Exchange API Routes
 * RESTful API endpoints for exchange management and trading operations
 * 
 * Features:
 * - Exchange configuration and management
 * - Smart order placement and management
 * - Real-time market data aggregation
 * - Portfolio balance tracking
 * - Arbitrage opportunity detection
 * - WebSocket subscriptions for real-time updates
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { 
  ExchangeManagementService, 
  ExchangeName 
} from '../services/exchange-management-service';
import { OrderType, TimeInForce } from '../exchanges/exchange-connector';

type Bindings = {
  DB: D1Database;
};

// Global exchange management service instance
let exchangeService: ExchangeManagementService | null = null;

const exchangeRoutes = new Hono<{ Bindings: Bindings }>();

// Enable CORS for all exchange routes
exchangeRoutes.use('/*', cors());

/**
 * Initialize exchange management service
 */
exchangeRoutes.post('/initialize', async (c) => {
  try {
    if (!exchangeService) {
      exchangeService = new ExchangeManagementService();
    }
    
    await exchangeService.initialize();
    
    return c.json({
      success: true,
      message: 'Exchange management service initialized successfully',
      connectedExchanges: exchangeService.getConnectedExchanges()
    });
  } catch (error) {
    console.error('Failed to initialize exchange service:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Configure exchange credentials and settings
 */
exchangeRoutes.post('/configure/:exchangeName', async (c) => {
  try {
    const exchangeName = c.req.param('exchangeName') as ExchangeName;
    const config = await c.req.json();
    
    if (!exchangeService) {
      exchangeService = new ExchangeManagementService();
    }
    
    await exchangeService.configureExchange({
      name: exchangeName,
      enabled: config.enabled || false,
      credentials: config.credentials || {},
      priority: config.priority || 1,
      maxOrderSize: config.maxOrderSize,
      tradingPairs: config.tradingPairs || []
    });
    
    return c.json({
      success: true,
      message: `Exchange ${exchangeName} configured successfully`
    });
  } catch (error) {
    console.error('Failed to configure exchange:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

/**
 * Get exchange configurations
 */
exchangeRoutes.get('/configurations', async (c) => {
  try {
    if (!exchangeService) {
      return c.json({
        success: true,
        configurations: []
      });
    }
    
    const configurations = exchangeService.getExchangeConfigs().map(config => ({
      ...config,
      credentials: {} // Don't expose credentials in API response
    }));
    
    return c.json({
      success: true,
      configurations
    });
  } catch (error) {
    console.error('Failed to get exchange configurations:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get connected exchanges
 */
exchangeRoutes.get('/status', async (c) => {
  try {
    const connectedExchanges = exchangeService?.getConnectedExchanges() || [];
    
    return c.json({
      success: true,
      isInitialized: exchangeService !== null,
      connectedExchanges,
      totalExchanges: connectedExchanges.length
    });
  } catch (error) {
    console.error('Failed to get exchange status:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Create smart order
 */
exchangeRoutes.post('/orders/smart', async (c) => {
  try {
    if (!exchangeService) {
      throw new Error('Exchange service not initialized');
    }
    
    const orderRequest = await c.req.json();
    
    // Validate required fields
    if (!orderRequest.symbol || !orderRequest.type || !orderRequest.side || !orderRequest.amount) {
      return c.json({
        success: false,
        error: 'Missing required fields: symbol, type, side, amount'
      }, 400);
    }
    
    const result = await exchangeService.createSmartOrder({
      symbol: orderRequest.symbol,
      type: orderRequest.type as OrderType,
      side: orderRequest.side,
      amount: parseFloat(orderRequest.amount),
      price: orderRequest.price ? parseFloat(orderRequest.price) : undefined,
      timeInForce: orderRequest.timeInForce as TimeInForce,
      preferredExchange: orderRequest.preferredExchange as ExchangeName,
      strategy: orderRequest.strategy || 'best_price',
      maxSlippage: orderRequest.maxSlippage ? parseFloat(orderRequest.maxSlippage) : undefined
    });
    
    return c.json({
      success: true,
      result
    });
  } catch (error) {
    console.error('Failed to create smart order:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

/**
 * Cancel order
 */
exchangeRoutes.delete('/orders/:exchangeName/:orderId', async (c) => {
  try {
    if (!exchangeService) {
      throw new Error('Exchange service not initialized');
    }
    
    const exchangeName = c.req.param('exchangeName') as ExchangeName;
    const orderId = c.req.param('orderId');
    
    const success = await exchangeService.cancelOrder(exchangeName, orderId);
    
    return c.json({
      success,
      message: success ? 'Order cancelled successfully' : 'Failed to cancel order'
    });
  } catch (error) {
    console.error('Failed to cancel order:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 400);
  }
});

/**
 * Get portfolio balances across all exchanges
 */
exchangeRoutes.get('/balances', async (c) => {
  try {
    if (!exchangeService) {
      throw new Error('Exchange service not initialized');
    }
    
    const balances = await exchangeService.getPortfolioBalances();
    
    return c.json({
      success: true,
      balances
    });
  } catch (error) {
    console.error('Failed to get portfolio balances:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get aggregated ticker data
 */
exchangeRoutes.get('/ticker/:symbol', async (c) => {
  try {
    if (!exchangeService) {
      throw new Error('Exchange service not initialized');
    }
    
    const symbol = c.req.param('symbol');
    const ticker = await exchangeService.getAggregatedTicker(symbol);
    
    if (!ticker) {
      return c.json({
        success: false,
        error: 'No ticker data available for symbol'
      }, 404);
    }
    
    return c.json({
      success: true,
      ticker
    });
  } catch (error) {
    console.error('Failed to get aggregated ticker:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get aggregated order book
 */
exchangeRoutes.get('/orderbook/:symbol', async (c) => {
  try {
    if (!exchangeService) {
      throw new Error('Exchange service not initialized');
    }
    
    const symbol = c.req.param('symbol');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : undefined;
    
    const orderBook = await exchangeService.getAggregatedOrderBook(symbol, limit);
    
    if (!orderBook) {
      return c.json({
        success: false,
        error: 'No order book data available for symbol'
      }, 404);
    }
    
    return c.json({
      success: true,
      orderBook
    });
  } catch (error) {
    console.error('Failed to get aggregated order book:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Detect arbitrage opportunities
 */
exchangeRoutes.post('/arbitrage/scan', async (c) => {
  try {
    if (!exchangeService) {
      throw new Error('Exchange service not initialized');
    }
    
    const { symbols } = await c.req.json();
    
    if (!symbols || !Array.isArray(symbols)) {
      return c.json({
        success: false,
        error: 'Invalid symbols array'
      }, 400);
    }
    
    const opportunities = await exchangeService.detectArbitrageOpportunities(symbols);
    
    return c.json({
      success: true,
      opportunities,
      count: opportunities.length
    });
  } catch (error) {
    console.error('Failed to detect arbitrage opportunities:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * WebSocket endpoint for real-time ticker updates
 */
exchangeRoutes.get('/ws/ticker/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    
    // Check if request is WebSocket upgrade
    const upgradeHeader = c.req.header('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return c.json({
        success: false,
        error: 'WebSocket upgrade required'
      }, 400);
    }
    
    // In a full implementation, you would handle WebSocket upgrades here
    // For now, return information about the WebSocket endpoint
    return c.json({
      success: true,
      message: 'WebSocket ticker endpoint',
      symbol,
      endpoint: `/api/exchanges/ws/ticker/${symbol}`,
      note: 'Use WebSocket client to connect to this endpoint for real-time updates'
    });
  } catch (error) {
    console.error('WebSocket ticker error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * WebSocket endpoint for real-time order book updates
 */
exchangeRoutes.get('/ws/orderbook/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    
    // Check if request is WebSocket upgrade
    const upgradeHeader = c.req.header('Upgrade');
    if (upgradeHeader !== 'websocket') {
      return c.json({
        success: false,
        error: 'WebSocket upgrade required'
      }, 400);
    }
    
    // In a full implementation, you would handle WebSocket upgrades here
    // For now, return information about the WebSocket endpoint
    return c.json({
      success: true,
      message: 'WebSocket order book endpoint',
      symbol,
      endpoint: `/api/exchanges/ws/orderbook/${symbol}`,
      note: 'Use WebSocket client to connect to this endpoint for real-time updates'
    });
  } catch (error) {
    console.error('WebSocket order book error:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get trading history for a specific symbol across all exchanges
 */
exchangeRoutes.get('/trades/:symbol', async (c) => {
  try {
    if (!exchangeService) {
      throw new Error('Exchange service not initialized');
    }
    
    const symbol = c.req.param('symbol');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!) : 100;
    
    // This would need to be implemented in the exchange management service
    // For now, return a placeholder
    return c.json({
      success: true,
      message: 'Trading history endpoint',
      symbol,
      limit,
      note: 'Implementation pending - requires aggregated trade history from exchange management service'
    });
  } catch (error) {
    console.error('Failed to get trading history:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get exchange-specific market data
 */
exchangeRoutes.get('/markets/:exchangeName/:symbol', async (c) => {
  try {
    const exchangeName = c.req.param('exchangeName');
    const symbol = c.req.param('symbol');
    
    return c.json({
      success: true,
      message: 'Exchange-specific market data endpoint',
      exchange: exchangeName,
      symbol,
      note: 'Implementation pending - requires direct exchange connector access'
    });
  } catch (error) {
    console.error('Failed to get exchange market data:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Disconnect all exchanges
 */
exchangeRoutes.post('/disconnect', async (c) => {
  try {
    if (exchangeService) {
      exchangeService.disconnect();
      exchangeService = null;
    }
    
    return c.json({
      success: true,
      message: 'All exchanges disconnected successfully'
    });
  } catch (error) {
    console.error('Failed to disconnect exchanges:', error);
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default exchangeRoutes;