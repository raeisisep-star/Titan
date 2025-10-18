/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🟢 MEXC API INTEGRATION
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * یکپارچه‌سازی کامل با MEXC Exchange API
 * - قیمت‌های لحظه‌ای
 * - داده‌های بازار
 * - معاملات
 */

const axios = require('axios');
const crypto = require('crypto');

class MexcIntegration {
  constructor(pool) {
    this.pool = pool;
    
    // API Configuration
    this.baseURL = 'https://api.mexc.com';
    
    // API Keys
    this.apiKey = process.env.MEXC_API_KEY;
    this.secretKey = process.env.MEXC_SECRET_KEY;
    
    // Cache
    this.priceCache = new Map();
    this.cacheExpiry = 5000; // 5 seconds
    
    console.log('🟢 MEXC Integration initialized');
    console.log('   API Key:', this.apiKey ? '✅ Configured' : '❌ Not configured');
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * MARKET DATA
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get current price for symbol
   */
  async getPrice(symbol) {
    try {
      // Check cache first
      const cached = this.priceCache.get(symbol);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
        return cached.data;
      }
      
      const response = await axios.get(`${this.baseURL}/api/v3/ticker/price`, {
        params: { symbol }
      });
      
      const data = {
        symbol: response.data.symbol,
        price: parseFloat(response.data.price),
        timestamp: Date.now()
      };
      
      // Update cache
      this.priceCache.set(symbol, {
        data,
        timestamp: Date.now()
      });
      
      // Store in database
      await this.storePriceInDB(data);
      
      return data;
      
    } catch (error) {
      console.error(`❌ MEXC getPrice error for ${symbol}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Get prices for all symbols
   */
  async getPrices(symbols = []) {
    try {
      const response = await axios.get(`${this.baseURL}/api/v3/ticker/price`);
      
      let prices = response.data.map(item => ({
        symbol: item.symbol,
        price: parseFloat(item.price),
        timestamp: Date.now()
      }));
      
      // Filter by symbols if provided
      if (symbols.length > 0) {
        prices = prices.filter(p => symbols.includes(p.symbol));
      }
      
      // Update cache and database
      for (const price of prices) {
        this.priceCache.set(price.symbol, {
          data: price,
          timestamp: Date.now()
        });
        await this.storePriceInDB(price);
      }
      
      return prices;
      
    } catch (error) {
      console.error('❌ MEXC getPrices error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get 24hr ticker statistics
   */
  async get24hrTicker(symbol) {
    try {
      const response = await axios.get(`${this.baseURL}/api/v3/ticker/24hr`, {
        params: { symbol }
      });
      
      return {
        symbol: response.data.symbol,
        priceChange: parseFloat(response.data.priceChange),
        priceChangePercent: parseFloat(response.data.priceChangePercent),
        lastPrice: parseFloat(response.data.lastPrice),
        volume: parseFloat(response.data.volume),
        quoteVolume: parseFloat(response.data.quoteVolume),
        highPrice: parseFloat(response.data.highPrice),
        lowPrice: parseFloat(response.data.lowPrice),
        openPrice: parseFloat(response.data.openPrice),
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error(`❌ MEXC 24hr ticker error for ${symbol}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Get all 24hr tickers
   */
  async getAll24hrTickers() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v3/ticker/24hr`);
      
      return response.data.map(item => ({
        symbol: item.symbol,
        priceChange: parseFloat(item.priceChange),
        priceChangePercent: parseFloat(item.priceChangePercent),
        lastPrice: parseFloat(item.lastPrice),
        volume: parseFloat(item.volume),
        quoteVolume: parseFloat(item.quoteVolume),
        highPrice: parseFloat(item.highPrice),
        lowPrice: parseFloat(item.lowPrice)
      }));
      
    } catch (error) {
      console.error('❌ MEXC all 24hr tickers error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get historical klines/candles
   */
  async getKlines(symbol, interval = '1h', limit = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/api/v3/klines`, {
        params: {
          symbol,
          interval,
          limit
        }
      });
      
      const candles = response.data.map(item => ({
        symbol,
        interval,
        openTime: item[0],
        open: parseFloat(item[1]),
        high: parseFloat(item[2]),
        low: parseFloat(item[3]),
        close: parseFloat(item[4]),
        volume: parseFloat(item[5]),
        closeTime: item[6],
        quoteVolume: parseFloat(item[7])
      }));
      
      // Store in database
      for (const candle of candles) {
        await this.storeCandleInDB(candle);
      }
      
      return candles;
      
    } catch (error) {
      console.error(`❌ MEXC klines error for ${symbol}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Get order book depth
   */
  async getOrderBook(symbol, limit = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/api/v3/depth`, {
        params: { symbol, limit }
      });
      
      return {
        symbol,
        lastUpdateId: response.data.lastUpdateId,
        bids: response.data.bids.slice(0, 20).map(([price, qty]) => ({
          price: parseFloat(price),
          quantity: parseFloat(qty)
        })),
        asks: response.data.asks.slice(0, 20).map(([price, qty]) => ({
          price: parseFloat(price),
          quantity: parseFloat(qty)
        })),
        timestamp: Date.now()
      };
      
    } catch (error) {
      console.error(`❌ MEXC order book error for ${symbol}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Get recent trades
   */
  async getRecentTrades(symbol, limit = 100) {
    try {
      const response = await axios.get(`${this.baseURL}/api/v3/trades`, {
        params: { symbol, limit }
      });
      
      return response.data.map(trade => ({
        id: trade.id,
        symbol,
        price: parseFloat(trade.price),
        quantity: parseFloat(trade.qty),
        time: trade.time,
        isBuyerMaker: trade.isBuyerMaker
      }));
      
    } catch (error) {
      console.error(`❌ MEXC recent trades error for ${symbol}:`, error.message);
      throw error;
    }
  }
  
  /**
   * Get exchange information
   */
  async getExchangeInfo() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v3/exchangeInfo`);
      
      return {
        timezone: response.data.timezone,
        serverTime: response.data.serverTime,
        symbols: response.data.symbols.map(s => ({
          symbol: s.symbol,
          status: s.status,
          baseAsset: s.baseAsset,
          quoteAsset: s.quoteAsset,
          isSpotTradingAllowed: s.isSpotTradingAllowed
        }))
      };
      
    } catch (error) {
      console.error('❌ MEXC exchange info error:', error.message);
      throw error;
    }
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * DATABASE OPERATIONS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Store price in database
   */
  async storePriceInDB(priceData) {
    try {
      await this.pool.query(`
        INSERT INTO market_prices (
          symbol, price, volume, high, low,
          change_24h, exchange, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, 'mexc', NOW())
        ON CONFLICT (symbol, exchange)
        DO UPDATE SET
          price = EXCLUDED.price,
          volume = EXCLUDED.volume,
          high = EXCLUDED.high,
          low = EXCLUDED.low,
          change_24h = EXCLUDED.change_24h,
          updated_at = NOW()
      `, [
        priceData.symbol,
        priceData.price,
        priceData.volume || 0,
        priceData.high || priceData.price,
        priceData.low || priceData.price,
        priceData.priceChangePercent || 0
      ]);
    } catch (error) {
      if (error.code !== '42P01') {
        console.error('❌ Store price error:', error.message);
      }
    }
  }
  
  /**
   * Store candle in database
   */
  async storeCandleInDB(candle) {
    try {
      await this.pool.query(`
        INSERT INTO market_candles (
          symbol, interval, timestamp,
          open, high, low, close, volume,
          exchange
        ) VALUES ($1, $2, to_timestamp($3/1000.0), $4, $5, $6, $7, $8, 'mexc')
        ON CONFLICT (symbol, interval, timestamp, exchange) DO NOTHING
      `, [
        candle.symbol,
        candle.interval,
        candle.openTime,
        candle.open,
        candle.high,
        candle.low,
        candle.close,
        candle.volume
      ]);
    } catch (error) {
      if (error.code !== '42P01') {
        console.error('❌ Store candle error:', error.message);
      }
    }
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * UTILITY METHODS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Test connection to MEXC
   */
  async testConnection() {
    try {
      await axios.get(`${this.baseURL}/api/v3/ping`);
      console.log('✅ MEXC connection: OK');
      return true;
    } catch (error) {
      console.error('❌ MEXC connection: FAILED');
      return false;
    }
  }
  
  /**
   * Get server time
   */
  async getServerTime() {
    try {
      const response = await axios.get(`${this.baseURL}/api/v3/time`);
      return response.data.serverTime;
    } catch (error) {
      console.error('❌ Get server time error:', error.message);
      return Date.now();
    }
  }
}

// Singleton instance
let mexcIntegration;

function getMexcIntegration(pool) {
  if (!mexcIntegration) {
    mexcIntegration = new MexcIntegration(pool);
  }
  return mexcIntegration;
}

module.exports = { MexcIntegration, getMexcIntegration };
