// Market Data Routes
// Public MEXC API endpoints (No KYC required)

const express = require('express');
const router = express.Router();
const mexc = require('../services/exchange/mexc');
const cache = require('../services/cache');

/**
 * GET /api/market/price/:symbol
 * Get current price for a symbol
 */
router.get('/price/:symbol', cache.middleware(60), async (req, res, next) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    const data = await mexc.getPrice(symbol);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Market price error:', error);
    next(error);
  }
});

/**
 * GET /api/market/ticker/:symbol
 * Get 24hr ticker price change statistics
 */
router.get('/ticker/:symbol', cache.middleware(30), async (req, res, next) => {
  try {
    const { symbol } = req.params;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    const data = await mexc.getTicker24hr(symbol);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Market ticker error:', error);
    next(error);
  }
});

/**
 * GET /api/market/history/:symbol
 * Get historical kline/candlestick data
 * Query params:
 *   - interval: 1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1M (default: 1h)
 *   - limit: number of candles (default: 500, max: 1000)
 */
router.get('/history/:symbol', cache.middleware(60), async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { interval = '1h', limit = '500' } = req.query;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    const limitNum = parseInt(limit, 10);
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 1000) {
      return res.status(400).json({
        success: false,
        error: 'Limit must be between 1 and 1000'
      });
    }

    const data = await mexc.getKlines(symbol, interval, limitNum);
    
    res.json({
      success: true,
      data: {
        symbol,
        interval,
        candles: data
      }
    });
  } catch (error) {
    console.error('Market history error:', error);
    next(error);
  }
});

/**
 * GET /api/market/depth/:symbol
 * Get order book depth
 * Query params:
 *   - limit: 5, 10, 20, 50, 100, 500, 1000, 5000 (default: 50)
 */
router.get('/depth/:symbol', cache.middleware(10), async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const { limit = '50' } = req.query;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        error: 'Symbol is required'
      });
    }

    const limitNum = parseInt(limit, 10);
    const data = await mexc.getDepth(symbol, limitNum);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Market depth error:', error);
    next(error);
  }
});

/**
 * GET /api/market/info
 * Get exchange information for all symbols
 */
router.get('/info', cache.middleware(300), async (req, res, next) => {
  try {
    const data = await mexc.getExchangeInfo(null);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Market info error:', error);
    next(error);
  }
});

/**
 * GET /api/market/info/:symbol
 * Get exchange information for a specific symbol
 */
router.get('/info/:symbol', cache.middleware(300), async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const data = await mexc.getExchangeInfo(symbol);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Market info error:', error);
    next(error);
  }
});

module.exports = router;
