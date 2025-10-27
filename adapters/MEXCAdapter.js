/**
 * MEXC Exchange Adapter
 * Real exchange integration with MEXC spot trading
 */

const ExchangeAdapter = require('./ExchangeAdapter');
const axios = require('axios');
const crypto = require('crypto');
const { logger } = require('../utils/logMasking');

class MEXCAdapter extends ExchangeAdapter {
  constructor(config) {
    super({
      name: 'MEXC',
      testnet: false,
      ...config
    });
    
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseUrl = config.baseUrl || 'https://api.mexc.com';
    this.recvWindow = config.recvWindow || 5000;
    
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('MEXC API key and secret are required');
    }
  }

  /**
   * Generate HMAC SHA256 signature for MEXC API
   * @param {string} queryString - Query string to sign
   * @returns {string} - Lowercase hex signature
   */
  _generateSignature(queryString) {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex')
      .toLowerCase();
  }

  /**
   * Make a signed API request
   * @param {string} method - HTTP method
   * @param {string} endpoint - API endpoint
   * @param {Object} params - Request parameters
   * @returns {Promise<Object>} - API response
   */
  async _signedRequest(method, endpoint, params = {}) {
    const timestamp = Date.now();
    const allParams = {
      ...params,
      timestamp
    };
    
    // Build query string (sorted by key)
    const queryString = Object.keys(allParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(allParams[key])}`)
      .join('&');
    
    // Generate signature
    const signature = this._generateSignature(queryString);
    
    // Full query string with signature
    const fullQueryString = `${queryString}&signature=${signature}`;
    
    const url = `${this.baseUrl}${endpoint}?${fullQueryString}`;
    
    try {
      const config = {
        method,
        url,
        headers: {
          'X-MEXC-APIKEY': this.apiKey
        }
      };
      
      logger.debug('[MEXC] Request:', { method, endpoint, params: { ...params, signature: '***' } });
      
      const response = await axios(config);
      return response.data;
    } catch (error) {
      logger.error('[MEXC] API Error:', {
        endpoint,
        status: error.response?.status,
        message: error.response?.data?.msg || error.message,
        code: error.response?.data?.code
      });
      
      throw new Error(`MEXC API Error: ${error.response?.data?.msg || error.message}`);
    }
  }

  async initialize() {
    try {
      // Test connection by getting server time
      const response = await axios.get(`${this.baseUrl}/api/v3/time`);
      const serverTime = response.data.serverTime;
      
      logger.info('[MEXC] Initialized successfully', { serverTime });
      
      // Test authentication
      await this.testConnection();
      
      return true;
    } catch (error) {
      logger.error('[MEXC] Initialization failed:', error.message);
      throw error;
    }
  }

  async placeOrder(orderParams) {
    const { symbol, side, type, quantity, price, clientOrderId } = orderParams;
    
    const params = {
      symbol: symbol.toUpperCase(),
      side: side.toUpperCase(),
      type: type.toUpperCase()
    };
    
    // Add quantity or quoteOrderQty
    if (type.toLowerCase() === 'market' && side.toLowerCase() === 'buy') {
      // For market buy, can use quoteOrderQty (amount in quote asset)
      params.quoteOrderQty = quantity;
    } else {
      params.quantity = quantity;
    }
    
    // Add price for limit orders
    if (type.toLowerCase() === 'limit' && price) {
      params.price = price;
    }
    
    // Add client order ID if provided
    if (clientOrderId) {
      params.newClientOrderId = clientOrderId;
    }
    
    try {
      const result = await this._signedRequest('POST', '/api/v3/order', params);
      
      logger.info('[MEXC] Order placed:', {
        orderId: result.orderId,
        symbol,
        side,
        type
      });
      
      return {
        success: true,
        orderId: result.orderId.toString(),
        clientOrderId: result.clientOrderId,
        status: this.mapOrderStatus(result.status),
        executedQty: parseFloat(result.executedQty || 0),
        avgPrice: parseFloat(result.price || 0),
        transactTime: result.transactTime
      };
    } catch (error) {
      logger.error('[MEXC] Place order failed:', error.message);
      throw error;
    }
  }

  async cancelOrder(orderId, symbol) {
    try {
      const result = await this._signedRequest('DELETE', '/api/v3/order', {
        symbol: symbol.toUpperCase(),
        orderId
      });
      
      logger.info('[MEXC] Order cancelled:', { orderId, symbol });
      
      return {
        success: true,
        orderId: result.orderId.toString(),
        status: this.mapOrderStatus(result.status)
      };
    } catch (error) {
      logger.error('[MEXC] Cancel order failed:', error.message);
      throw error;
    }
  }

  async getOrder(orderId, symbol) {
    try {
      const result = await this._signedRequest('GET', '/api/v3/order', {
        symbol: symbol.toUpperCase(),
        orderId
      });
      
      return {
        orderId: result.orderId.toString(),
        clientOrderId: result.clientOrderId,
        symbol: result.symbol,
        side: result.side.toLowerCase(),
        type: result.type.toLowerCase(),
        quantity: parseFloat(result.origQty),
        price: parseFloat(result.price),
        status: this.mapOrderStatus(result.status),
        executedQty: parseFloat(result.executedQty),
        avgPrice: parseFloat(result.price),
        timestamp: result.time,
        updateTime: result.updateTime
      };
    } catch (error) {
      logger.error('[MEXC] Get order failed:', error.message);
      throw error;
    }
  }

  async getBalance(asset = null) {
    try {
      const result = await this._signedRequest('GET', '/api/v3/account', {});
      
      if (asset) {
        const assetUpper = asset.toUpperCase();
        const balance = result.balances.find(b => b.asset === assetUpper);
        
        if (!balance) {
          return {
            asset: assetUpper,
            free: 0,
            locked: 0,
            total: 0
          };
        }
        
        return {
          asset: assetUpper,
          free: parseFloat(balance.free),
          locked: parseFloat(balance.locked),
          total: parseFloat(balance.free) + parseFloat(balance.locked)
        };
      }
      
      // Return all balances
      const balances = {};
      for (const balance of result.balances) {
        const free = parseFloat(balance.free);
        const locked = parseFloat(balance.locked);
        
        // Only include non-zero balances
        if (free > 0 || locked > 0) {
          balances[balance.asset] = {
            free,
            locked,
            total: free + locked
          };
        }
      }
      
      return balances;
    } catch (error) {
      logger.error('[MEXC] Get balance failed:', error.message);
      throw error;
    }
  }

  async testConnection() {
    try {
      // Test authenticated endpoint
      await this._signedRequest('GET', '/api/v3/account', {});
      logger.info('[MEXC] Connection test successful');
      return true;
    } catch (error) {
      logger.error('[MEXC] Connection test failed:', error.message);
      return false;
    }
  }

  mapOrderStatus(exchangeStatus) {
    const statusMap = {
      'NEW': ExchangeAdapter.OrderStatus.PENDING,
      'PARTIALLY_FILLED': ExchangeAdapter.OrderStatus.PARTIAL,
      'FILLED': ExchangeAdapter.OrderStatus.FILLED,
      'CANCELED': ExchangeAdapter.OrderStatus.CANCELLED,
      'PENDING_CANCEL': ExchangeAdapter.OrderStatus.CANCELLED,
      'REJECTED': ExchangeAdapter.OrderStatus.REJECTED,
      'EXPIRED': ExchangeAdapter.OrderStatus.EXPIRED
    };
    
    return statusMap[exchangeStatus] || ExchangeAdapter.OrderStatus.PENDING;
  }

  async getExchangeInfo() {
    try {
      const response = await axios.get(`${this.baseUrl}/api/v3/exchangeInfo`);
      return {
        exchangeName: this.name,
        symbols: response.data.symbols.map(s => s.symbol),
        serverTime: response.data.serverTime
      };
    } catch (error) {
      logger.error('[MEXC] Get exchange info failed:', error.message);
      throw error;
    }
  }
}

module.exports = MEXCAdapter;
