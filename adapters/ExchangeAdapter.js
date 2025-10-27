/**
 * Exchange Adapter Interface
 * Abstract base class for exchange integrations
 */

class ExchangeAdapter {
  /**
   * Constructor
   * @param {Object} config - Exchange configuration
   */
  constructor(config) {
    if (new.target === ExchangeAdapter) {
      throw new Error('ExchangeAdapter is an abstract class and cannot be instantiated directly');
    }
    
    this.config = config;
    this.name = config.name || 'Unknown Exchange';
    this.isTestnet = config.testnet || false;
  }

  /**
   * Initialize exchange connection and validate credentials
   * @returns {Promise<boolean>} - True if successful
   */
  async initialize() {
    throw new Error('Method initialize() must be implemented');
  }

  /**
   * Place an order on the exchange
   * @param {Object} orderParams - Order parameters
   * @param {string} orderParams.symbol - Trading pair (e.g., 'BTCUSDT')
   * @param {string} orderParams.side - 'buy' or 'sell'
   * @param {string} orderParams.type - 'market' or 'limit'
   * @param {string} orderParams.quantity - Amount to trade
   * @param {string} [orderParams.price] - Price for limit orders
   * @param {string} [orderParams.clientOrderId] - Custom order ID
   * @returns {Promise<Object>} - Order result with exchange order ID
   */
  async placeOrder(orderParams) {
    throw new Error('Method placeOrder() must be implemented');
  }

  /**
   * Cancel an order on the exchange
   * @param {string} orderId - Exchange order ID
   * @param {string} symbol - Trading pair
   * @returns {Promise<Object>} - Cancellation result
   */
  async cancelOrder(orderId, symbol) {
    throw new Error('Method cancelOrder() must be implemented');
  }

  /**
   * Get order details from exchange
   * @param {string} orderId - Exchange order ID
   * @param {string} symbol - Trading pair
   * @returns {Promise<Object>} - Order details
   */
  async getOrder(orderId, symbol) {
    throw new Error('Method getOrder() must be implemented');
  }

  /**
   * Get account balance
   * @param {string} [asset] - Specific asset (e.g., 'USDT'), or all if omitted
   * @returns {Promise<Object>} - Balance information
   */
  async getBalance(asset = null) {
    throw new Error('Method getBalance() must be implemented');
  }

  /**
   * Test connection to exchange
   * @returns {Promise<boolean>} - True if connection successful
   */
  async testConnection() {
    throw new Error('Method testConnection() must be implemented');
  }

  /**
   * Map exchange-specific order status to standardized status
   * @param {string} exchangeStatus - Status from exchange
   * @returns {string} - Standardized status
   */
  mapOrderStatus(exchangeStatus) {
    throw new Error('Method mapOrderStatus() must be implemented');
  }

  /**
   * Get exchange info (trading rules, symbols, etc.)
   * @returns {Promise<Object>} - Exchange information
   */
  async getExchangeInfo() {
    throw new Error('Method getExchangeInfo() must be implemented');
  }
}

/**
 * Standardized order status mapping
 */
ExchangeAdapter.OrderStatus = {
  PENDING: 'pending',
  PARTIAL: 'partial',
  FILLED: 'filled',
  CANCELLED: 'cancelled',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

/**
 * Standardized order sides
 */
ExchangeAdapter.OrderSide = {
  BUY: 'buy',
  SELL: 'sell'
};

/**
 * Standardized order types
 */
ExchangeAdapter.OrderType = {
  MARKET: 'market',
  LIMIT: 'limit',
  STOP_LOSS: 'stop_loss',
  STOP_LOSS_LIMIT: 'stop_loss_limit'
};

module.exports = ExchangeAdapter;
