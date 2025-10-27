/**
 * Paper Trading Adapter
 * Mock exchange for testing without real money
 */

const ExchangeAdapter = require('./ExchangeAdapter');
const crypto = require('crypto');

class PaperTradingAdapter extends ExchangeAdapter {
  constructor(config = {}) {
    super({
      name: 'Paper Trading',
      testnet: true,
      ...config
    });
    
    // Mock state
    this.orders = new Map();
    this.balances = {
      USDT: { free: 10000, locked: 0 },
      BTC: { free: 0.1, locked: 0 },
      ETH: { free: 1.0, locked: 0 }
    };
    
    // Simulated prices
    this.prices = {
      BTCUSDT: 45000,
      ETHUSDT: 2500,
      BNBUSDT: 350
    };
  }

  async initialize() {
    console.log('[PaperTrading] Initialized successfully');
    return true;
  }

  async placeOrder(orderParams) {
    const { symbol, side, type, quantity, price, clientOrderId } = orderParams;
    
    // Generate mock order ID
    const orderId = clientOrderId || `PAPER_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    
    // Simulate order
    const order = {
      orderId,
      clientOrderId,
      symbol,
      side,
      type,
      quantity: parseFloat(quantity),
      price: price ? parseFloat(price) : this.prices[symbol],
      status: 'NEW',
      executedQty: 0,
      timestamp: Date.now(),
      updateTime: Date.now()
    };
    
    // For market orders, execute immediately
    if (type === 'market') {
      order.status = 'FILLED';
      order.executedQty = order.quantity;
      order.avgPrice = this.prices[symbol];
      
      // Update balances
      this._updateBalances(order);
    } else {
      order.status = 'NEW';
    }
    
    this.orders.set(orderId, order);
    
    console.log(`[PaperTrading] Order placed: ${orderId} - ${side} ${quantity} ${symbol} @ ${type}`);
    
    return {
      success: true,
      orderId,
      clientOrderId,
      status: this.mapOrderStatus(order.status),
      executedQty: order.executedQty,
      avgPrice: order.avgPrice || order.price
    };
  }

  async cancelOrder(orderId, symbol) {
    const order = this.orders.get(orderId);
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    if (order.status === 'FILLED') {
      throw new Error(`Cannot cancel filled order: ${orderId}`);
    }
    
    order.status = 'CANCELED';
    order.updateTime = Date.now();
    
    console.log(`[PaperTrading] Order cancelled: ${orderId}`);
    
    return {
      success: true,
      orderId,
      status: this.mapOrderStatus(order.status)
    };
  }

  async getOrder(orderId, symbol) {
    const order = this.orders.get(orderId);
    
    if (!order) {
      throw new Error(`Order not found: ${orderId}`);
    }
    
    return {
      orderId: order.orderId,
      clientOrderId: order.clientOrderId,
      symbol: order.symbol,
      side: order.side,
      type: order.type,
      quantity: order.quantity,
      price: order.price,
      status: this.mapOrderStatus(order.status),
      executedQty: order.executedQty,
      avgPrice: order.avgPrice,
      timestamp: order.timestamp,
      updateTime: order.updateTime
    };
  }

  async getBalance(asset = null) {
    if (asset) {
      const balance = this.balances[asset.toUpperCase()];
      if (!balance) {
        return { free: 0, locked: 0, total: 0 };
      }
      return {
        asset: asset.toUpperCase(),
        free: balance.free,
        locked: balance.locked,
        total: balance.free + balance.locked
      };
    }
    
    // Return all balances
    const balances = {};
    for (const [asset, balance] of Object.entries(this.balances)) {
      balances[asset] = {
        free: balance.free,
        locked: balance.locked,
        total: balance.free + balance.locked
      };
    }
    return balances;
  }

  async testConnection() {
    return true;
  }

  mapOrderStatus(exchangeStatus) {
    const statusMap = {
      'NEW': ExchangeAdapter.OrderStatus.PENDING,
      'PARTIALLY_FILLED': ExchangeAdapter.OrderStatus.PARTIAL,
      'FILLED': ExchangeAdapter.OrderStatus.FILLED,
      'CANCELED': ExchangeAdapter.OrderStatus.CANCELLED,
      'REJECTED': ExchangeAdapter.OrderStatus.REJECTED,
      'EXPIRED': ExchangeAdapter.OrderStatus.EXPIRED
    };
    
    return statusMap[exchangeStatus] || ExchangeAdapter.OrderStatus.PENDING;
  }

  async getExchangeInfo() {
    return {
      exchangeName: this.name,
      symbols: Object.keys(this.prices),
      serverTime: Date.now()
    };
  }

  // Helper: Update balances after order execution
  _updateBalances(order) {
    const { symbol, side, quantity, avgPrice } = order;
    
    // Parse symbol (e.g., BTCUSDT -> BTC + USDT)
    const baseAsset = symbol.replace('USDT', '');
    const quoteAsset = 'USDT';
    
    if (side === 'buy') {
      // Deduct USDT, add base asset
      const cost = quantity * avgPrice;
      if (this.balances[quoteAsset]) {
        this.balances[quoteAsset].free -= cost;
      }
      if (!this.balances[baseAsset]) {
        this.balances[baseAsset] = { free: 0, locked: 0 };
      }
      this.balances[baseAsset].free += quantity;
    } else {
      // Deduct base asset, add USDT
      if (this.balances[baseAsset]) {
        this.balances[baseAsset].free -= quantity;
      }
      const proceeds = quantity * avgPrice;
      if (!this.balances[quoteAsset]) {
        this.balances[quoteAsset] = { free: 0, locked: 0 };
      }
      this.balances[quoteAsset].free += proceeds;
    }
  }
}

module.exports = PaperTradingAdapter;
