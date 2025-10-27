/**
 * Exchange Factory
 * Creates appropriate exchange adapter based on configuration
 */

const PaperTradingAdapter = require('./PaperTradingAdapter');
const MEXCAdapter = require('./MEXCAdapter');

class ExchangeFactory {
  /**
   * Create exchange adapter
   * @param {string} exchangeName - Name of exchange ('paper', 'mexc')
   * @param {Object} config - Exchange configuration
   * @returns {ExchangeAdapter} - Exchange adapter instance
   */
  static create(exchangeName, config = {}) {
    switch (exchangeName.toLowerCase()) {
      case 'paper':
        return new PaperTradingAdapter(config);
      
      case 'mexc':
        return new MEXCAdapter({
          apiKey: config.apiKey || process.env.MEXC_API_KEY,
          apiSecret: config.apiSecret || process.env.MEXC_API_SECRET,
          baseUrl: config.baseUrl || process.env.MEXC_BASE_URL || 'https://api.mexc.com',
          ...config
        });
      
      default:
        throw new Error(`Unsupported exchange: ${exchangeName}`);
    }
  }

  /**
   * Create exchange from environment variables
   * @returns {ExchangeAdapter} - Exchange adapter instance
   */
  static createFromEnv() {
    const exchangeName = process.env.EXCHANGE_NAME || 'paper';
    
    if (exchangeName === 'paper') {
      return ExchangeFactory.create('paper');
    }
    
    if (exchangeName === 'mexc') {
      if (!process.env.MEXC_API_KEY || !process.env.MEXC_API_SECRET) {
        console.warn('[Exchange] MEXC credentials not found, using Paper Trading');
        return ExchangeFactory.create('paper');
      }
      
      return ExchangeFactory.create('mexc', {
        apiKey: process.env.MEXC_API_KEY,
        apiSecret: process.env.MEXC_API_SECRET,
        baseUrl: process.env.MEXC_BASE_URL
      });
    }
    
    throw new Error(`Unsupported EXCHANGE_NAME: ${exchangeName}`);
  }

  /**
   * List supported exchanges
   * @returns {Array<string>} - List of exchange names
   */
  static getSupportedExchanges() {
    return ['paper', 'mexc'];
  }
}

module.exports = ExchangeFactory;
