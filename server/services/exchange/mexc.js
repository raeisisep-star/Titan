// MEXC Exchange Public API Service
// No KYC required - only public market data endpoints

const axios = require('axios');

const MEXC_BASE_URL = process.env.MEXC_BASE_URL || 'https://api.mexc.com';
const TIMEOUT = 8000; // 8 seconds

const api = axios.create({
  baseURL: MEXC_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for logging
api.interceptors.request.use(
  config => {
    console.log(`🔌 MEXC API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  error => {
    console.error('❌ MEXC API Request Error:', error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  response => {
    console.log(`✅ MEXC API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  error => {
    const status = error.response?.status || 'N/A';
    const message = error.response?.data?.msg || error.message;
    console.error(`❌ MEXC API Error: [${status}] ${message}`);
    return Promise.reject(error);
  }
);

/**
 * Get current price for a symbol
 * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
 * @returns {Promise<{symbol: string, price: number, timestamp: number}>}
 */
async function getPrice(symbol) {
  try {
    const { data } = await api.get('/api/v3/ticker/price', {
      params: { symbol: symbol.toUpperCase() }
    });
    
    return {
      symbol: data.symbol,
      price: parseFloat(data.price),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`Failed to get price for ${symbol}:`, error.message);
    throw new Error(`MEXC API Error: ${error.message}`);
  }
}

/**
 * Get 24hr ticker price change statistics
 * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
 * @returns {Promise<Object>}
 */
async function getTicker24hr(symbol) {
  try {
    const { data } = await api.get('/api/v3/ticker/24hr', {
      params: { symbol: symbol.toUpperCase() }
    });
    
    return {
      symbol: data.symbol,
      priceChange: parseFloat(data.priceChange),
      priceChangePercent: parseFloat(data.priceChangePercent),
      lastPrice: parseFloat(data.lastPrice),
      highPrice: parseFloat(data.highPrice),
      lowPrice: parseFloat(data.lowPrice),
      volume: parseFloat(data.volume),
      quoteVolume: parseFloat(data.quoteVolume),
      openTime: data.openTime,
      closeTime: data.closeTime
    };
  } catch (error) {
    console.error(`Failed to get 24hr ticker for ${symbol}:`, error.message);
    throw new Error(`MEXC API Error: ${error.message}`);
  }
}

/**
 * Get historical kline/candlestick data
 * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
 * @param {string} interval - Time interval (1m, 5m, 15m, 30m, 1h, 4h, 1d, 1w, 1M)
 * @param {number} limit - Number of data points (default: 500, max: 1000)
 * @returns {Promise<Array>}
 */
async function getKlines(symbol, interval = '1h', limit = 500) {
  try {
    // MEXC interval mapping (lowercase input -> MEXC format)
    const intervalMap = {
      '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
      '1h': '60m', '2h': '120m', '4h': '4h', '6h': '6h', '8h': '8h', '12h': '12h',
      '1d': '1d', '3d': '3d', '1w': '1W', '1M': '1M'
    };
    
    const mexcInterval = intervalMap[interval.toLowerCase()] || interval;
    
    // Validate interval
    if (!intervalMap[interval.toLowerCase()]) {
      throw new Error(`Invalid interval: ${interval}. Must be one of: 1m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M`);
    }

    const { data } = await api.get('/api/v3/klines', {
      params: {
        symbol: symbol.toUpperCase(),
        interval: mexcInterval,
        limit: Math.min(limit, 1000) // MEXC max is 1000
      }
    });
    
    // Transform MEXC response to standardized format
    return data.map(candle => ({
      time: parseInt(candle[0]),           // Open time
      open: parseFloat(candle[1]),         // Open price
      high: parseFloat(candle[2]),         // High price
      low: parseFloat(candle[3]),          // Low price
      close: parseFloat(candle[4]),        // Close price
      volume: parseFloat(candle[5]),       // Volume
      closeTime: parseInt(candle[6]),      // Close time
      quoteVolume: parseFloat(candle[7]),  // Quote asset volume
      trades: parseInt(candle[8])          // Number of trades
    }));
  } catch (error) {
    console.error(`Failed to get klines for ${symbol}:`, error.message);
    throw new Error(`MEXC API Error: ${error.message}`);
  }
}

/**
 * Get order book depth
 * @param {string} symbol - Trading pair (e.g., 'BTCUSDT')
 * @param {number} limit - Depth limit (5, 10, 20, 50, 100, 500, 1000, 5000)
 * @returns {Promise<{bids: Array, asks: Array, lastUpdateId: number}>}
 */
async function getDepth(symbol, limit = 50) {
  try {
    const validLimits = [5, 10, 20, 50, 100, 500, 1000, 5000];
    const depthLimit = validLimits.includes(limit) ? limit : 50;

    const { data } = await api.get('/api/v3/depth', {
      params: {
        symbol: symbol.toUpperCase(),
        limit: depthLimit
      }
    });
    
    return {
      lastUpdateId: data.lastUpdateId,
      bids: data.bids.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      })),
      asks: data.asks.map(([price, quantity]) => ({
        price: parseFloat(price),
        quantity: parseFloat(quantity)
      })),
      timestamp: Date.now()
    };
  } catch (error) {
    console.error(`Failed to get depth for ${symbol}:`, error.message);
    throw new Error(`MEXC API Error: ${error.message}`);
  }
}

/**
 * Get exchange information (symbol info, trading rules, etc.)
 * @param {string} symbol - Optional specific symbol
 * @returns {Promise<Object>}
 */
async function getExchangeInfo(symbol = null) {
  try {
    const params = symbol ? { symbol: symbol.toUpperCase() } : {};
    const { data } = await api.get('/api/v3/exchangeInfo', { params });
    
    if (symbol) {
      const symbolInfo = data.symbols.find(s => s.symbol === symbol.toUpperCase());
      return symbolInfo || null;
    }
    
    return data;
  } catch (error) {
    console.error(`Failed to get exchange info:`, error.message);
    throw new Error(`MEXC API Error: ${error.message}`);
  }
}

module.exports = {
  getPrice,
  getTicker24hr,
  getKlines,
  getDepth,
  getExchangeInfo
};
