/**
 * 🏦 TITAN Trading System - Exchange Connector Interface
 * 
 * Universal exchange connector providing:
 * - Standardized Exchange API Interface
 * - Multi-Exchange Support (Binance, Coinbase, Kraken, etc.)
 * - Real-time Data Streaming
 * - Order Management & Execution
 * - Account & Portfolio Sync
 * - Error Handling & Retry Logic
 * - Rate Limiting & Compliance
 * 
 * Features:
 * ✅ Unified API interface for all exchanges
 * ✅ Real-time market data streaming
 * ✅ Advanced order types support
 * ✅ Portfolio synchronization
 * ✅ Risk management integration
 * ✅ Comprehensive error handling
 */

export interface ExchangeConfig {
  exchange: ExchangeType;
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string; // For some exchanges like Coinbase Pro
  sandbox?: boolean;
  testMode?: boolean;
  
  // Rate limiting
  rateLimitPerSecond?: number;
  rateLimitPerMinute?: number;
  rateLimitPerHour?: number;
  
  // Connection settings
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  
  // WebSocket settings
  enableWebSocket?: boolean;
  pingInterval?: number;
  reconnectDelay?: number;
  maxReconnectAttempts?: number;
}

export type ExchangeType = 'binance' | 'coinbase' | 'kraken' | 'kucoin' | 'bybit' | 'okx' | 'bitfinex' | 'huobi';

export interface ExchangeCredentials {
  apiKey: string;
  apiSecret: string;
  passphrase?: string;
  uid?: string; // For some exchanges
}

export interface ExchangeInfo {
  name: string;
  type: ExchangeType;
  status: ExchangeStatus;
  features: ExchangeFeatures;
  limits: ExchangeLimits;
  fees: ExchangeFees;
  markets: Market[];
}

export type ExchangeStatus = 'connected' | 'disconnected' | 'error' | 'maintenance' | 'rate_limited';

export interface ExchangeFeatures {
  spot: boolean;
  futures: boolean;
  options: boolean;
  margin: boolean;
  lending: boolean;
  staking: boolean;
  webSocket: boolean;
  orderTypes: OrderType[];
  timeframes: Timeframe[];
}

export interface ExchangeLimits {
  minOrderSize: number;
  maxOrderSize: number;
  minPrice: number;
  maxPrice: number;
  pricePrecision: number;
  quantityPrecision: number;
  requestsPerSecond: number;
  requestsPerMinute: number;
  requestsPerHour: number;
}

export interface ExchangeFees {
  maker: number; // Maker fee percentage
  taker: number; // Taker fee percentage
  withdrawal: Record<string, number>; // Withdrawal fees by asset
  deposit: Record<string, number>; // Deposit fees by asset
}

export interface Market {
  id: string;
  symbol: string;
  base: string;
  quote: string;
  baseId: string;
  quoteId: string;
  active: boolean;
  type: 'spot' | 'futures' | 'option' | 'swap';
  spot: boolean;
  futures: boolean;
  option: boolean;
  swap: boolean;
  linear?: boolean;
  inverse?: boolean;
  contractSize?: number;
  expiry?: string;
  strike?: number;
  optionType?: 'call' | 'put';
  precision: {
    amount: number;
    price: number;
  };
  limits: {
    amount: {
      min: number;
      max: number;
    };
    price: {
      min: number;
      max: number;
    };
    cost: {
      min: number;
      max: number;
    };
  };
  info: any;
}

export interface Ticker {
  symbol: string;
  timestamp: number;
  datetime: string;
  high: number;
  low: number;
  bid: number;
  bidVolume: number;
  ask: number;
  askVolume: number;
  vwap?: number;
  open: number;
  close: number;
  last: number;
  previousClose?: number;
  change: number;
  percentage: number;
  average?: number;
  baseVolume: number;
  quoteVolume: number;
  info: any;
}

export interface OrderBook {
  symbol: string;
  bids: [number, number][]; // [price, amount]
  asks: [number, number][]; // [price, amount]
  timestamp: number;
  datetime: string;
  nonce?: number;
}

export interface Trade {
  id: string;
  order?: string;
  info: any;
  timestamp: number;
  datetime: string;
  symbol: string;
  type: OrderType;
  side: 'buy' | 'sell';
  amount: number;
  price: number;
  cost: number;
  fee?: TradeFee;
  takerOrMaker: 'taker' | 'maker';
}

export interface TradeFee {
  currency: string;
  cost: number;
  rate: number;
}

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Order {
  id: string;
  clientOrderId?: string;
  info: any;
  timestamp: number;
  datetime: string;
  lastTradeTimestamp?: number;
  symbol: string;
  type: OrderType;
  timeInForce?: TimeInForce;
  side: 'buy' | 'sell';
  amount: number;
  price?: number;
  stopPrice?: number;
  cost: number;
  average?: number;
  filled: number;
  remaining: number;
  status: OrderStatus;
  fee?: TradeFee;
  trades?: Trade[];
}

export type OrderType = 'market' | 'limit' | 'stop_market' | 'stop_limit' | 'take_profit_market' | 'take_profit_limit';
export type TimeInForce = 'GTC' | 'IOC' | 'FOK' | 'PO'; // Good Till Cancel, Immediate Or Cancel, Fill Or Kill, Post Only
export type OrderStatus = 'open' | 'closed' | 'canceled' | 'expired' | 'rejected' | 'pending';
export type Timeframe = '1m' | '3m' | '5m' | '15m' | '30m' | '1h' | '2h' | '4h' | '6h' | '8h' | '12h' | '1d' | '3d' | '1w' | '1M';

export interface Balance {
  currency: string;
  free: number; // Available for trading
  used: number; // Locked in orders
  total: number; // Total balance
}

export interface Position {
  info: any;
  id?: string;
  symbol: string;
  timestamp: number;
  datetime: string;
  side: 'long' | 'short';
  size: number; // Position size
  notional?: number; // Position notional value
  entryPrice?: number;
  markPrice?: number;
  unrealizedPnl?: number;
  realizedPnl?: number;
  percentage?: number;
  marginType?: 'cross' | 'isolated';
  leverage?: number;
  liquidationPrice?: number;
  maintenanceMargin?: number;
  initialMargin?: number;
  contracts?: number;
}

export interface DepositAddress {
  currency: string;
  address: string;
  tag?: string;
  network?: string;
  info: any;
}

export interface Transaction {
  info: any;
  id: string;
  txid?: string;
  timestamp: number;
  datetime: string;
  currency: string;
  amount: number;
  address: string;
  addressTo?: string;
  addressFrom?: string;
  tag?: string;
  tagTo?: string;
  tagFrom?: string;
  status: 'pending' | 'ok' | 'failed' | 'canceled';
  type: 'deposit' | 'withdrawal';
  fee?: TradeFee;
  network?: string;
}

// WebSocket data interfaces
export interface WebSocketMessage {
  channel: string;
  symbol?: string;
  data: any;
  timestamp: number;
}

export interface MarketDataUpdate {
  type: 'ticker' | 'orderbook' | 'trades' | 'kline';
  symbol: string;
  data: Ticker | OrderBook | Trade[] | OHLCV;
  timestamp: number;
}

export interface AccountUpdate {
  type: 'balance' | 'order' | 'position' | 'execution';
  data: Balance[] | Order | Position | Trade;
  timestamp: number;
}

/**
 * 🏦 Abstract Exchange Connector Interface
 */
export abstract class ExchangeConnector {
  protected config: ExchangeConfig;
  protected credentials?: ExchangeCredentials;
  protected rateLimiter: RateLimiter;
  protected wsConnections: Map<string, WebSocket> = new Map();
  protected subscriptions: Set<string> = new Set();
  protected reconnectTimers: Map<string, NodeJS.Timeout> = new Map();

  constructor(config: ExchangeConfig, credentials?: ExchangeCredentials) {
    this.config = {
      sandbox: false,
      testMode: false,
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableWebSocket: true,
      pingInterval: 30000,
      reconnectDelay: 5000,
      maxReconnectAttempts: 10,
      ...config
    };
    
    this.credentials = credentials;
    this.rateLimiter = new RateLimiter({
      requestsPerSecond: config.rateLimitPerSecond || 10,
      requestsPerMinute: config.rateLimitPerMinute || 600,
      requestsPerHour: config.rateLimitPerHour || 36000
    });

    console.log(`🏦 ${config.exchange} Exchange Connector initialized`);
  }

  // ============================================================================
  // ABSTRACT METHODS (Must be implemented by each exchange)
  // ============================================================================

  abstract async connect(): Promise<void>;
  abstract async disconnect(): Promise<void>;
  abstract async getExchangeInfo(): Promise<ExchangeInfo>;
  abstract async getMarkets(): Promise<Market[]>;
  abstract async getTicker(symbol: string): Promise<Ticker>;
  abstract async getOrderBook(symbol: string, limit?: number): Promise<OrderBook>;
  abstract async getTrades(symbol: string, limit?: number): Promise<Trade[]>;
  abstract async getOHLCV(symbol: string, timeframe: Timeframe, since?: number, limit?: number): Promise<OHLCV[]>;

  // Account & Trading methods
  abstract async getBalances(): Promise<Balance[]>;
  abstract async getPositions(symbols?: string[]): Promise<Position[]>;
  abstract async createOrder(symbol: string, type: OrderType, side: 'buy' | 'sell', amount: number, price?: number, params?: any): Promise<Order>;
  abstract async cancelOrder(id: string, symbol: string): Promise<Order>;
  abstract async getOrder(id: string, symbol: string): Promise<Order>;
  abstract async getOrders(symbol?: string, since?: number, limit?: number): Promise<Order[]>;
  abstract async getOpenOrders(symbol?: string): Promise<Order[]>;
  abstract async getMyTrades(symbol?: string, since?: number, limit?: number): Promise<Trade[]>;

  // WebSocket methods
  abstract async subscribeToTicker(symbol: string, callback: (data: Ticker) => void): Promise<void>;
  abstract async subscribeToOrderBook(symbol: string, callback: (data: OrderBook) => void): Promise<void>;
  abstract async subscribeToTrades(symbol: string, callback: (data: Trade[]) => void): Promise<void>;
  abstract async subscribeToOHLCV(symbol: string, timeframe: Timeframe, callback: (data: OHLCV) => void): Promise<void>;
  abstract async subscribeToOrders(callback: (data: Order) => void): Promise<void>;
  abstract async subscribeToBalances(callback: (data: Balance[]) => void): Promise<void>;
  abstract async unsubscribe(channel: string, symbol?: string): Promise<void>;

  // ============================================================================
  // COMMON METHODS (Implemented for all exchanges)
  // ============================================================================

  /**
   * 🔑 Set API credentials
   */
  setCredentials(credentials: ExchangeCredentials): void {
    this.credentials = credentials;
    console.log(`🔑 API credentials set for ${this.config.exchange}`);
  }

  /**
   * ⚙️ Update configuration
   */
  updateConfig(newConfig: Partial<ExchangeConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log(`⚙️ Configuration updated for ${this.config.exchange}`);
  }

  /**
   * 📊 Get connection status
   */
  getStatus(): ExchangeStatus {
    // This would be implemented based on connection state
    return 'connected';
  }

  /**
   * 🔄 Test connectivity
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getExchangeInfo();
      return true;
    } catch (error) {
      console.error(`❌ Connection test failed for ${this.config.exchange}:`, error);
      return false;
    }
  }

  /**
   * 📈 Get multiple tickers
   */
  async getTickers(symbols?: string[]): Promise<Record<string, Ticker>> {
    const tickers: Record<string, Ticker> = {};
    
    if (symbols) {
      for (const symbol of symbols) {
        try {
          tickers[symbol] = await this.getTicker(symbol);
        } catch (error) {
          console.error(`❌ Failed to get ticker for ${symbol}:`, error);
        }
      }
    }
    
    return tickers;
  }

  /**
   * 💰 Get balance for specific currency
   */
  async getBalance(currency: string): Promise<Balance | null> {
    try {
      const balances = await this.getBalances();
      return balances.find(b => b.currency === currency) || null;
    } catch (error) {
      console.error(`❌ Failed to get balance for ${currency}:`, error);
      return null;
    }
  }

  /**
   * 📋 Get order history with filters
   */
  async getOrderHistory(
    symbol?: string, 
    status?: OrderStatus[], 
    since?: number, 
    limit?: number
  ): Promise<Order[]> {
    try {
      const orders = await this.getOrders(symbol, since, limit);
      
      if (status && status.length > 0) {
        return orders.filter(order => status.includes(order.status));
      }
      
      return orders;
    } catch (error) {
      console.error(`❌ Failed to get order history:`, error);
      return [];
    }
  }

  /**
   * 🎯 Create market order (simplified)
   */
  async createMarketOrder(symbol: string, side: 'buy' | 'sell', amount: number): Promise<Order> {
    return this.createOrder(symbol, 'market', side, amount);
  }

  /**
   * 🎯 Create limit order (simplified)
   */
  async createLimitOrder(symbol: string, side: 'buy' | 'sell', amount: number, price: number): Promise<Order> {
    return this.createOrder(symbol, 'limit', side, amount, price);
  }

  /**
   * 🛑 Cancel all orders for symbol
   */
  async cancelAllOrders(symbol?: string): Promise<Order[]> {
    try {
      const openOrders = await this.getOpenOrders(symbol);
      const cancelPromises = openOrders.map(order => 
        this.cancelOrder(order.id, order.symbol)
      );
      
      return await Promise.all(cancelPromises);
    } catch (error) {
      console.error(`❌ Failed to cancel all orders:`, error);
      return [];
    }
  }

  /**
   * 📊 Calculate portfolio value
   */
  async getPortfolioValue(baseCurrency = 'USDT'): Promise<number> {
    try {
      const balances = await this.getBalances();
      let totalValue = 0;
      
      for (const balance of balances) {
        if (balance.total > 0) {
          if (balance.currency === baseCurrency) {
            totalValue += balance.total;
          } else {
            // Get conversion rate
            const symbol = `${balance.currency}/${baseCurrency}`;
            try {
              const ticker = await this.getTicker(symbol);
              totalValue += balance.total * ticker.last;
            } catch (error) {
              // If conversion not available, skip this balance
              console.warn(`⚠️ Could not convert ${balance.currency} to ${baseCurrency}`);
            }
          }
        }
      }
      
      return totalValue;
    } catch (error) {
      console.error(`❌ Failed to calculate portfolio value:`, error);
      return 0;
    }
  }

  /**
   * 🔄 Retry mechanism for API calls
   */
  protected async retry<T>(
    operation: () => Promise<T>,
    maxAttempts: number = this.config.retryAttempts || 3,
    delay: number = this.config.retryDelay || 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt === maxAttempts) {
          break;
        }
        
        console.warn(`⚠️ Attempt ${attempt} failed, retrying in ${delay}ms...`);
        await this.sleep(delay * attempt); // Exponential backoff
      }
    }
    
    throw lastError!;
  }

  /**
   * ⏱️ Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * 🔐 Generate signature for authenticated requests
   */
  protected abstract generateSignature(
    timestamp: number,
    method: string,
    path: string,
    body?: string
  ): string;

  /**
   * 🌐 Make HTTP request with rate limiting
   */
  protected async makeRequest(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    headers?: Record<string, string>,
    body?: any
  ): Promise<any> {
    await this.rateLimiter.checkLimit();
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'TITAN-Trading-System/1.0',
        ...headers
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(this.config.timeout || 30000)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return await response.json();
  }

  /**
   * 🧹 Cleanup resources
   */
  protected cleanup(): void {
    // Close WebSocket connections
    for (const [channel, ws] of this.wsConnections) {
      ws.close();
    }
    this.wsConnections.clear();
    
    // Clear reconnect timers
    for (const timer of this.reconnectTimers.values()) {
      clearTimeout(timer);
    }
    this.reconnectTimers.clear();
    
    // Clear subscriptions
    this.subscriptions.clear();
    
    console.log(`🧹 Cleaned up resources for ${this.config.exchange}`);
  }
}

/**
 * ⚡ Rate Limiter Class
 */
class RateLimiter {
  private requests: number[] = [];
  private config: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  };

  constructor(config: {
    requestsPerSecond: number;
    requestsPerMinute: number;
    requestsPerHour: number;
  }) {
    this.config = config;
  }

  async checkLimit(): Promise<void> {
    const now = Date.now();
    
    // Clean old requests
    this.requests = this.requests.filter(time => now - time < 3600000); // Keep last hour
    
    // Check per-second limit
    const lastSecond = this.requests.filter(time => now - time < 1000).length;
    if (lastSecond >= this.config.requestsPerSecond) {
      await this.sleep(1000 - (now % 1000));
    }
    
    // Check per-minute limit
    const lastMinute = this.requests.filter(time => now - time < 60000).length;
    if (lastMinute >= this.config.requestsPerMinute) {
      await this.sleep(60000 - (now % 60000));
    }
    
    // Check per-hour limit
    const lastHour = this.requests.length;
    if (lastHour >= this.config.requestsPerHour) {
      await this.sleep(3600000 - (now % 3600000));
    }
    
    this.requests.push(now);
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ExchangeConnector;