/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 MARKET DATA REAL API ROUTES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Real market data from Binance & MEXC
 */

const { getBinanceIntegration } = require('../services/binance-integration');
const { getMexcIntegration } = require('../services/mexc-integration');

module.exports = function(app, pool, redisClient) {
  
  const binance = getBinanceIntegration(pool);
  const mexc = getMexcIntegration(pool);
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PRICE ENDPOINTS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get current price for symbol
   * GET /api/market/price/:symbol
   */
  app.get('/api/market/price/:symbol', async (c) => {
    const symbol = c.req.param('symbol').toUpperCase();
    const exchange = c.req.query('exchange') || 'binance';
    
    try {
      let price;
      
      if (exchange === 'binance') {
        price = await binance.getPrice(symbol);
      } else if (exchange === 'mexc') {
        price = await mexc.getPrice(symbol);
      } else {
        return c.json({
          success: false,
          error: 'Invalid exchange. Use binance or mexc'
        }, 400);
      }
      
      return c.json({
        success: true,
        data: price,
        exchange
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Get prices for multiple symbols
   * GET /api/market/prices
   */
  app.get('/api/market/prices', async (c) => {
    const exchange = c.req.query('exchange') || 'binance';
    const symbolsParam = c.req.query('symbols');
    const symbols = symbolsParam ? symbolsParam.split(',').map(s => s.toUpperCase()) : [];
    
    try {
      let prices;
      
      if (exchange === 'binance') {
        prices = await binance.getPrices(symbols);
      } else if (exchange === 'mexc') {
        prices = await mexc.getPrices(symbols);
      } else {
        return c.json({
          success: false,
          error: 'Invalid exchange'
        }, 400);
      }
      
      return c.json({
        success: true,
        data: prices,
        count: prices.length,
        exchange
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Get 24hr ticker for symbol
   * GET /api/market/ticker/:symbol
   */
  app.get('/api/market/ticker/:symbol', async (c) => {
    const symbol = c.req.param('symbol').toUpperCase();
    const exchange = c.req.query('exchange') || 'binance';
    
    try {
      let ticker;
      
      if (exchange === 'binance') {
        ticker = await binance.get24hrTicker(symbol);
      } else if (exchange === 'mexc') {
        ticker = await mexc.get24hrTicker(symbol);
      } else {
        return c.json({
          success: false,
          error: 'Invalid exchange'
        }, 400);
      }
      
      return c.json({
        success: true,
        data: ticker,
        exchange
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Get all 24hr tickers
   * GET /api/market/tickers
   */
  app.get('/api/market/tickers', async (c) => {
    const exchange = c.req.query('exchange') || 'binance';
    const limit = parseInt(c.req.query('limit')) || 50;
    
    try {
      let tickers;
      
      if (exchange === 'binance') {
        tickers = await binance.getAll24hrTickers();
      } else if (exchange === 'mexc') {
        tickers = await mexc.getAll24hrTickers();
      } else {
        return c.json({
          success: false,
          error: 'Invalid exchange'
        }, 400);
      }
      
      // Sort by volume and limit
      tickers.sort((a, b) => b.quoteVolume - a.quoteVolume);
      tickers = tickers.slice(0, limit);
      
      return c.json({
        success: true,
        data: tickers,
        count: tickers.length,
        exchange
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * HISTORICAL DATA
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get klines/candles for symbol
   * GET /api/market/klines/:symbol
   */
  app.get('/api/market/klines/:symbol', async (c) => {
    const symbol = c.req.param('symbol').toUpperCase();
    const exchange = c.req.query('exchange') || 'binance';
    const interval = c.req.query('interval') || '1h';
    const limit = parseInt(c.req.query('limit')) || 100;
    
    try {
      let klines;
      
      if (exchange === 'binance') {
        klines = await binance.getKlines(symbol, interval, limit);
      } else if (exchange === 'mexc') {
        klines = await mexc.getKlines(symbol, interval, limit);
      } else {
        return c.json({
          success: false,
          error: 'Invalid exchange'
        }, 400);
      }
      
      return c.json({
        success: true,
        data: klines,
        count: klines.length,
        exchange,
        interval
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * ORDER BOOK & TRADES
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get order book for symbol
   * GET /api/market/orderbook/:symbol
   */
  app.get('/api/market/orderbook/:symbol', async (c) => {
    const symbol = c.req.param('symbol').toUpperCase();
    const exchange = c.req.query('exchange') || 'binance';
    const limit = parseInt(c.req.query('limit')) || 100;
    
    try {
      let orderBook;
      
      if (exchange === 'binance') {
        orderBook = await binance.getOrderBook(symbol, limit);
      } else if (exchange === 'mexc') {
        orderBook = await mexc.getOrderBook(symbol, limit);
      } else {
        return c.json({
          success: false,
          error: 'Invalid exchange'
        }, 400);
      }
      
      return c.json({
        success: true,
        data: orderBook,
        exchange
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Get recent trades for symbol
   * GET /api/market/trades/:symbol
   */
  app.get('/api/market/trades/:symbol', async (c) => {
    const symbol = c.req.param('symbol').toUpperCase();
    const exchange = c.req.query('exchange') || 'binance';
    const limit = parseInt(c.req.query('limit')) || 100;
    
    try {
      let trades;
      
      if (exchange === 'binance') {
        trades = await binance.getRecentTrades(symbol, limit);
      } else if (exchange === 'mexc') {
        trades = await mexc.getRecentTrades(symbol, limit);
      } else {
        return c.json({
          success: false,
          error: 'Invalid exchange'
        }, 400);
      }
      
      return c.json({
        success: true,
        data: trades,
        count: trades.length,
        exchange
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * EXCHANGE INFO & UTILITY
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get exchange information
   * GET /api/market/exchange-info
   */
  app.get('/api/market/exchange-info', async (c) => {
    const exchange = c.req.query('exchange') || 'binance';
    
    try {
      let info;
      
      if (exchange === 'binance') {
        info = await binance.getExchangeInfo();
      } else if (exchange === 'mexc') {
        info = await mexc.getExchangeInfo();
      } else {
        return c.json({
          success: false,
          error: 'Invalid exchange'
        }, 400);
      }
      
      return c.json({
        success: true,
        data: info,
        exchange
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Test exchange connection
   * GET /api/market/test-connection
   */
  app.get('/api/market/test-connection', async (c) => {
    const exchange = c.req.query('exchange') || 'binance';
    
    try {
      let connected;
      
      if (exchange === 'binance') {
        connected = await binance.testConnection();
      } else if (exchange === 'mexc') {
        connected = await mexc.testConnection();
      } else {
        return c.json({
          success: false,
          error: 'Invalid exchange'
        }, 400);
      }
      
      return c.json({
        success: true,
        connected,
        exchange
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * WEBSOCKET MANAGEMENT
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Subscribe to price updates (Binance only for now)
   * POST /api/market/subscribe
   */
  app.post('/api/market/subscribe', async (c) => {
    const body = await c.req.json();
    const { symbols } = body;
    
    if (!symbols || !Array.isArray(symbols)) {
      return c.json({
        success: false,
        error: 'symbols array required'
      }, 400);
    }
    
    try {
      // Subscribe to Binance WebSocket for each symbol
      binance.subscribeToMultiplePrices(symbols.map(s => s.toUpperCase()));
      
      return c.json({
        success: true,
        message: `Subscribed to ${symbols.length} symbols`,
        symbols: symbols.map(s => s.toUpperCase())
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Get subscribed symbols
   * GET /api/market/subscriptions
   */
  app.get('/api/market/subscriptions', async (c) => {
    try {
      const symbols = binance.getSubscribedSymbols();
      
      return c.json({
        success: true,
        symbols,
        count: symbols.length
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  console.log('✅ Market Data Real APIs loaded');
};
