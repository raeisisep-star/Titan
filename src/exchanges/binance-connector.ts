/**
 * 🟡 TITAN Trading System - Binance Exchange Connector
 * 
 * Comprehensive Binance API integration featuring:
 * - Spot Trading API Integration
 * - Real-time Market Data Streaming
 * - Advanced Order Management
 * - Account Information & Portfolio Sync
 * - WebSocket Data Feeds
 * - Error Handling & Rate Limiting
 * 
 * Features:
 * ✅ Full Binance REST API support
 * ✅ Real-time WebSocket streams
 * ✅ Advanced order types
 * ✅ Market data feeds
 * ✅ Account management
 * ✅ Error handling & retry logic
 */

import ExchangeConnector, {
  type ExchangeConfig,
  type ExchangeCredentials,
  type ExchangeInfo,
  type Market,
  type Ticker,
  type OrderBook,
  type Trade,
  type OHLCV,
  type Order,
  type Balance,
  type Position,
  type OrderType,
  type Timeframe,
  type ExchangeStatus,
  type ExchangeFeatures,
  type ExchangeLimits,
  type ExchangeFees
} from './exchange-connector';

import { createHmac } from 'crypto';

/**
 * 🟡 Binance-specific interfaces
 */
interface BinanceExchangeInfo {
  timezone: string;
  serverTime: number;
  rateLimits: BinanceRateLimit[];
  symbols: BinanceSymbol[];
}

interface BinanceRateLimit {
  rateLimitType: 'REQUEST_WEIGHT' | 'ORDERS' | 'RAW_REQUESTS';
  interval: 'SECOND' | 'MINUTE' | 'DAY';
  intervalNum: number;
  limit: number;
}

interface BinanceSymbol {
  symbol: string;
  status: string;
  baseAsset: string;
  baseAssetPrecision: number;
  quoteAsset: string;
  quotePrecision: number;
  orderTypes: string[];
  icebergAllowed: boolean;
  ocoAllowed: boolean;
  filters: BinanceFilter[];
  permissions: string[];
}

interface BinanceFilter {
  filterType: string;
  minPrice?: string;
  maxPrice?: string;
  tickSize?: string;
  multiplierUp?: string;
  multiplierDown?: string;
  avgPriceMins?: number;
  minQty?: string;
  maxQty?: string;
  stepSize?: string;
  minNotional?: string;
  applyToMarket?: boolean;
  limit?: number;
  maxNumOrders?: number;
  maxNumAlgoOrders?: number;
}

interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  prevClosePrice: string;
  lastPrice: string;
  lastQty: string;
  bidPrice: string;
  bidQty: string;
  askPrice: string;
  askQty: string;
  openPrice: string;
  highPrice: string;
  lowPrice: string;
  volume: string;
  quoteVolume: string;
  openTime: number;
  closeTime: number;
  firstId: number;
  lastId: number;
  count: number;
}

interface BinanceOrderBook {
  lastUpdateId: number;
  bids: [string, string][];
  asks: [string, string][];
}

interface BinanceTrade {
  id: number;
  price: string;
  qty: string;
  quoteQty: string;
  time: number;
  isBuyerMaker: boolean;
  isBestMatch: boolean;
}

interface BinanceOrder {
  symbol: string;
  orderId: number;
  orderListId: number;
  clientOrderId: string;
  price: string;
  origQty: string;
  executedQty: string;
  cummulativeQuoteQty: string;
  status: string;
  timeInForce: string;
  type: string;
  side: string;
  stopPrice?: string;
  icebergQty?: string;
  time: number;
  updateTime: number;
  isWorking: boolean;
  workingTime: number;
  origQuoteOrderQty: string;
  selfTradePreventionMode: string;
}

interface BinanceBalance {
  asset: string;
  free: string;
  locked: string;
}

interface BinanceAccountInfo {
  makerCommission: number;
  takerCommission: number;
  buyerCommission: number;
  sellerCommission: number;
  canTrade: boolean;
  canWithdraw: boolean;
  canDeposit: boolean;
  updateTime: number;
  accountType: string;
  balances: BinanceBalance[];
  permissions: string[];
}

/**
 * 🟡 Binance Exchange Connector Implementation
 */
export class BinanceConnector extends ExchangeConnector {
  private baseURL: string;
  private wsBaseURL: string;
  private listenKey?: string;

  constructor(config: ExchangeConfig, credentials?: ExchangeCredentials) {
    super(config, credentials);
    
    // Set API endpoints
    this.baseURL = config.sandbox 
      ? 'https://testnet.binance.vision/api'
      : 'https://api.binance.com/api';
    
    this.wsBaseURL = config.sandbox
      ? 'wss://testnet.binance.vision/ws'
      : 'wss://stream.binance.com:9443/ws';

    console.log('🟡 Binance Connector initialized');
  }

  // ============================================================================
  // CONNECTION MANAGEMENT
  // ============================================================================

  async connect(): Promise<void> {
    console.log('🔌 Connecting to Binance...');
    
    try {
      // Test connectivity
      const serverTime = await this.getServerTime();
      console.log(`⏰ Binance server time: ${new Date(serverTime).toISOString()}`);
      
      // Test API credentials if provided
      if (this.credentials) {
        await this.getAccountInfo();
        console.log('🔑 API credentials validated');
        
        // Start user data stream
        await this.startUserDataStream();
      }
      
      console.log('✅ Connected to Binance successfully');
      
    } catch (error) {
      console.error('❌ Failed to connect to Binance:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    console.log('🔌 Disconnecting from Binance...');
    
    try {
      // Stop user data stream
      if (this.listenKey) {
        await this.stopUserDataStream();
      }
      
      // Cleanup resources
      this.cleanup();
      
      console.log('✅ Disconnected from Binance');
      
    } catch (error) {
      console.error('❌ Error during Binance disconnect:', error);
    }
  }

  // ============================================================================
  // MARKET DATA METHODS
  // ============================================================================

  async getExchangeInfo(): Promise<ExchangeInfo> {
    const binanceInfo: BinanceExchangeInfo = await this.makeRequest('GET', `${this.baseURL}/v3/exchangeInfo`);
    
    // Convert Binance data to standard format
    const markets: Market[] = binanceInfo.symbols.map(symbol => ({
      id: symbol.symbol,
      symbol: symbol.symbol,
      base: symbol.baseAsset,
      quote: symbol.quoteAsset,
      baseId: symbol.baseAsset,
      quoteId: symbol.quoteAsset,
      active: symbol.status === 'TRADING',
      type: 'spot' as const,
      spot: true,
      futures: false,
      option: false,
      swap: false,
      precision: {
        amount: symbol.baseAssetPrecision,
        price: symbol.quotePrecision
      },
      limits: this.parseSymbolLimits(symbol.filters),
      info: symbol
    }));

    const features: ExchangeFeatures = {
      spot: true,
      futures: false,
      options: false,
      margin: true,
      lending: false,
      staking: true,
      webSocket: true,
      orderTypes: ['market', 'limit', 'stop_market', 'stop_limit'],
      timeframes: ['1m', '3m', '5m', '15m', '30m', '1h', '2h', '4h', '6h', '8h', '12h', '1d', '3d', '1w', '1M']
    };

    const limits: ExchangeLimits = {
      minOrderSize: 0.00000001,
      maxOrderSize: 9000000000,
      minPrice: 0.00000001,
      maxPrice: 1000000,
      pricePrecision: 8,
      quantityPrecision: 8,
      requestsPerSecond: 10,
      requestsPerMinute: 1200,
      requestsPerHour: 100000
    };

    const fees: ExchangeFees = {
      maker: 0.001, // 0.1%
      taker: 0.001, // 0.1%
      withdrawal: {},
      deposit: {}
    };

    return {
      name: 'Binance',
      type: 'binance',
      status: 'connected',
      features,
      limits,
      fees,
      markets
    };
  }

  async getMarkets(): Promise<Market[]> {
    const exchangeInfo = await this.getExchangeInfo();
    return exchangeInfo.markets;
  }

  async getTicker(symbol: string): Promise<Ticker> {
    const binanceTicker: BinanceTicker = await this.makeRequest(
      'GET', 
      `${this.baseURL}/v3/ticker/24hr?symbol=${symbol}`
    );

    return {
      symbol: binanceTicker.symbol,
      timestamp: binanceTicker.closeTime,
      datetime: new Date(binanceTicker.closeTime).toISOString(),
      high: parseFloat(binanceTicker.highPrice),
      low: parseFloat(binanceTicker.lowPrice),
      bid: parseFloat(binanceTicker.bidPrice),
      bidVolume: parseFloat(binanceTicker.bidQty),
      ask: parseFloat(binanceTicker.askPrice),
      askVolume: parseFloat(binanceTicker.askQty),
      vwap: parseFloat(binanceTicker.weightedAvgPrice),
      open: parseFloat(binanceTicker.openPrice),
      close: parseFloat(binanceTicker.lastPrice),
      last: parseFloat(binanceTicker.lastPrice),
      previousClose: parseFloat(binanceTicker.prevClosePrice),
      change: parseFloat(binanceTicker.priceChange),
      percentage: parseFloat(binanceTicker.priceChangePercent),
      baseVolume: parseFloat(binanceTicker.volume),
      quoteVolume: parseFloat(binanceTicker.quoteVolume),
      info: binanceTicker
    };
  }

  async getOrderBook(symbol: string, limit: number = 100): Promise<OrderBook> {
    const binanceOrderBook: BinanceOrderBook = await this.makeRequest(
      'GET', 
      `${this.baseURL}/v3/depth?symbol=${symbol}&limit=${limit}`
    );

    return {
      symbol,
      bids: binanceOrderBook.bids.map(([price, amount]) => [parseFloat(price), parseFloat(amount)]),
      asks: binanceOrderBook.asks.map(([price, amount]) => [parseFloat(price), parseFloat(amount)]),
      timestamp: Date.now(),
      datetime: new Date().toISOString(),
      nonce: binanceOrderBook.lastUpdateId
    };
  }

  async getTrades(symbol: string, limit: number = 100): Promise<Trade[]> {
    const binanceTrades: BinanceTrade[] = await this.makeRequest(
      'GET', 
      `${this.baseURL}/v3/trades?symbol=${symbol}&limit=${limit}`
    );

    return binanceTrades.map(trade => ({
      id: trade.id.toString(),
      info: trade,
      timestamp: trade.time,
      datetime: new Date(trade.time).toISOString(),
      symbol,
      type: 'market' as OrderType,
      side: trade.isBuyerMaker ? 'sell' : 'buy',
      amount: parseFloat(trade.qty),
      price: parseFloat(trade.price),
      cost: parseFloat(trade.quoteQty),
      takerOrMaker: trade.isBuyerMaker ? 'maker' : 'taker'
    }));
  }

  async getOHLCV(symbol: string, timeframe: Timeframe, since?: number, limit: number = 500): Promise<OHLCV[]> {
    let url = `${this.baseURL}/v3/klines?symbol=${symbol}&interval=${this.mapTimeframe(timeframe)}&limit=${limit}`;
    
    if (since) {
      url += `&startTime=${since}`;
    }

    const klines: [number, string, string, string, string, string, number, string, number, string, string, string][] = 
      await this.makeRequest('GET', url);

    return klines.map(kline => ({
      timestamp: kline[0],
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5])
    }));
  }

  // ============================================================================
  // ACCOUNT & TRADING METHODS
  // ============================================================================

  async getBalances(): Promise<Balance[]> {
    if (!this.credentials) {
      throw new Error('API credentials required for account operations');
    }

    const accountInfo = await this.getAccountInfo();
    
    return accountInfo.balances
      .filter(balance => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
      .map(balance => ({
        currency: balance.asset,
        free: parseFloat(balance.free),
        used: parseFloat(balance.locked),
        total: parseFloat(balance.free) + parseFloat(balance.locked)
      }));
  }

  async getPositions(symbols?: string[]): Promise<Position[]> {
    // Binance Spot doesn't have positions, return empty array
    // This would be implemented for Binance Futures
    return [];
  }

  async createOrder(
    symbol: string, 
    type: OrderType, 
    side: 'buy' | 'sell', 
    amount: number, 
    price?: number, 
    params?: any
  ): Promise<Order> {
    if (!this.credentials) {
      throw new Error('API credentials required for trading operations');
    }

    const orderData: any = {
      symbol,
      side: side.toUpperCase(),
      type: this.mapOrderType(type),
      quantity: amount.toFixed(8),
      timestamp: Date.now()
    };

    if (price && (type === 'limit' || type === 'stop_limit')) {
      orderData.price = price.toFixed(8);
    }

    if (params?.timeInForce) {
      orderData.timeInForce = params.timeInForce;
    }

    const binanceOrder: BinanceOrder = await this.makeAuthenticatedRequest('POST', '/v3/order', orderData);

    return this.convertBinanceOrder(binanceOrder);
  }

  async cancelOrder(id: string, symbol: string): Promise<Order> {
    if (!this.credentials) {
      throw new Error('API credentials required for trading operations');
    }

    const orderData = {
      symbol,
      orderId: parseInt(id),
      timestamp: Date.now()
    };

    const binanceOrder: BinanceOrder = await this.makeAuthenticatedRequest('DELETE', '/v3/order', orderData);

    return this.convertBinanceOrder(binanceOrder);
  }

  async getOrder(id: string, symbol: string): Promise<Order> {
    if (!this.credentials) {
      throw new Error('API credentials required for account operations');
    }

    const orderData = {
      symbol,
      orderId: parseInt(id),
      timestamp: Date.now()
    };

    const binanceOrder: BinanceOrder = await this.makeAuthenticatedRequest('GET', '/v3/order', orderData);

    return this.convertBinanceOrder(binanceOrder);
  }

  async getOrders(symbol?: string, since?: number, limit: number = 100): Promise<Order[]> {
    if (!this.credentials) {
      throw new Error('API credentials required for account operations');
    }

    const orderData: any = {
      timestamp: Date.now()
    };

    if (symbol) orderData.symbol = symbol;
    if (since) orderData.startTime = since;
    if (limit) orderData.limit = limit;

    const binanceOrders: BinanceOrder[] = await this.makeAuthenticatedRequest('GET', '/v3/allOrders', orderData);

    return binanceOrders.map(order => this.convertBinanceOrder(order));
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    if (!this.credentials) {
      throw new Error('API credentials required for account operations');
    }

    const orderData: any = {
      timestamp: Date.now()
    };

    if (symbol) orderData.symbol = symbol;

    const binanceOrders: BinanceOrder[] = await this.makeAuthenticatedRequest('GET', '/v3/openOrders', orderData);

    return binanceOrders.map(order => this.convertBinanceOrder(order));
  }

  async getMyTrades(symbol?: string, since?: number, limit: number = 100): Promise<Trade[]> {
    if (!this.credentials) {
      throw new Error('API credentials required for account operations');
    }

    if (!symbol) {
      throw new Error('Symbol is required for myTrades endpoint');
    }

    const tradeData: any = {
      symbol,
      timestamp: Date.now()
    };

    if (since) tradeData.startTime = since;
    if (limit) tradeData.limit = limit;

    const binanceTrades: any[] = await this.makeAuthenticatedRequest('GET', '/v3/myTrades', tradeData);

    return binanceTrades.map(trade => ({
      id: trade.id.toString(),
      order: trade.orderId.toString(),
      info: trade,
      timestamp: trade.time,
      datetime: new Date(trade.time).toISOString(),
      symbol: trade.symbol,
      type: 'limit' as OrderType,
      side: trade.isBuyer ? 'buy' : 'sell',
      amount: parseFloat(trade.qty),
      price: parseFloat(trade.price),
      cost: parseFloat(trade.quoteQty),
      fee: {
        currency: trade.commissionAsset,
        cost: parseFloat(trade.commission),
        rate: 0
      },
      takerOrMaker: trade.isMaker ? 'maker' : 'taker'
    }));
  }

  // ============================================================================
  // WEBSOCKET METHODS
  // ============================================================================

  async subscribeToTicker(symbol: string, callback: (data: Ticker) => void): Promise<void> {
    const stream = `${symbol.toLowerCase()}@ticker`;
    const ws = new WebSocket(`${this.wsBaseURL}/${stream}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const ticker = this.convertWebSocketTicker(data);
      callback(ticker);
    };
    
    this.wsConnections.set(stream, ws);
    this.subscriptions.add(stream);
  }

  async subscribeToOrderBook(symbol: string, callback: (data: OrderBook) => void): Promise<void> {
    const stream = `${symbol.toLowerCase()}@depth20@100ms`;
    const ws = new WebSocket(`${this.wsBaseURL}/${stream}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const orderBook = this.convertWebSocketOrderBook(data, symbol);
      callback(orderBook);
    };
    
    this.wsConnections.set(stream, ws);
    this.subscriptions.add(stream);
  }

  async subscribeToTrades(symbol: string, callback: (data: Trade[]) => void): Promise<void> {
    const stream = `${symbol.toLowerCase()}@trade`;
    const ws = new WebSocket(`${this.wsBaseURL}/${stream}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const trade = this.convertWebSocketTrade(data, symbol);
      callback([trade]);
    };
    
    this.wsConnections.set(stream, ws);
    this.subscriptions.add(stream);
  }

  async subscribeToOHLCV(symbol: string, timeframe: Timeframe, callback: (data: OHLCV) => void): Promise<void> {
    const stream = `${symbol.toLowerCase()}@kline_${this.mapTimeframe(timeframe)}`;
    const ws = new WebSocket(`${this.wsBaseURL}/${stream}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.k && data.k.x) { // Only closed klines
        const kline = this.convertWebSocketKline(data.k);
        callback(kline);
      }
    };
    
    this.wsConnections.set(stream, ws);
    this.subscriptions.add(stream);
  }

  async subscribeToOrders(callback: (data: Order) => void): Promise<void> {
    if (!this.listenKey) {
      throw new Error('User data stream not started. Call connect() first.');
    }
    
    const ws = new WebSocket(`${this.wsBaseURL}/${this.listenKey}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === 'executionReport') {
        const order = this.convertWebSocketOrder(data);
        callback(order);
      }
    };
    
    this.wsConnections.set('userdata', ws);
    this.subscriptions.add('userdata');
  }

  async subscribeToBalances(callback: (data: Balance[]) => void): Promise<void> {
    if (!this.listenKey) {
      throw new Error('User data stream not started. Call connect() first.');
    }
    
    const ws = new WebSocket(`${this.wsBaseURL}/${this.listenKey}`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.e === 'outboundAccountPosition') {
        const balances = data.B.map((balance: any) => ({
          currency: balance.a,
          free: parseFloat(balance.f),
          used: parseFloat(balance.l),
          total: parseFloat(balance.f) + parseFloat(balance.l)
        }));
        callback(balances);
      }
    };
    
    this.wsConnections.set('userdata_balances', ws);
    this.subscriptions.add('userdata_balances');
  }

  async unsubscribe(channel: string, symbol?: string): Promise<void> {
    const streamKey = symbol ? `${symbol.toLowerCase()}@${channel}` : channel;
    
    const ws = this.wsConnections.get(streamKey);
    if (ws) {
      ws.close();
      this.wsConnections.delete(streamKey);
      this.subscriptions.delete(streamKey);
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  protected generateSignature(timestamp: number, method: string, path: string, body?: string): string {
    if (!this.credentials?.apiSecret) {
      throw new Error('API secret required for authenticated requests');
    }
    
    const queryString = body || '';
    return createHmac('sha256', this.credentials.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  private async makeAuthenticatedRequest(method: 'GET' | 'POST' | 'DELETE', path: string, data: any = {}): Promise<any> {
    if (!this.credentials) {
      throw new Error('API credentials required for authenticated requests');
    }

    const timestamp = Date.now();
    data.timestamp = timestamp;
    
    const queryString = new URLSearchParams(data).toString();
    const signature = this.generateSignature(timestamp, method, path, queryString);
    
    const url = `${this.baseURL}${path}?${queryString}&signature=${signature}`;
    const headers = {
      'X-MBX-APIKEY': this.credentials.apiKey
    };

    return this.makeRequest(method, url, headers);
  }

  private async getServerTime(): Promise<number> {
    const response = await this.makeRequest('GET', `${this.baseURL}/v3/time`);
    return response.serverTime;
  }

  private async getAccountInfo(): Promise<BinanceAccountInfo> {
    const data = { timestamp: Date.now() };
    return this.makeAuthenticatedRequest('GET', '/v3/account', data);
  }

  private async startUserDataStream(): Promise<void> {
    if (!this.credentials) return;
    
    const headers = { 'X-MBX-APIKEY': this.credentials.apiKey };
    const response = await this.makeRequest('POST', `${this.baseURL}/v3/userDataStream`, headers);
    this.listenKey = response.listenKey;
    
    // Keep alive every 30 minutes
    setInterval(() => {
      if (this.listenKey) {
        this.makeRequest('PUT', `${this.baseURL}/v3/userDataStream`, {
          'X-MBX-APIKEY': this.credentials!.apiKey
        }, { listenKey: this.listenKey });
      }
    }, 30 * 60 * 1000);
  }

  private async stopUserDataStream(): Promise<void> {
    if (!this.listenKey || !this.credentials) return;
    
    const headers = { 'X-MBX-APIKEY': this.credentials.apiKey };
    await this.makeRequest('DELETE', `${this.baseURL}/v3/userDataStream`, headers, { 
      listenKey: this.listenKey 
    });
    this.listenKey = undefined;
  }

  private mapTimeframe(timeframe: Timeframe): string {
    const mapping: Record<Timeframe, string> = {
      '1m': '1m', '3m': '3m', '5m': '5m', '15m': '15m', '30m': '30m',
      '1h': '1h', '2h': '2h', '4h': '4h', '6h': '6h', '8h': '8h', '12h': '12h',
      '1d': '1d', '3d': '3d', '1w': '1w', '1M': '1M'
    };
    return mapping[timeframe] || '1d';
  }

  private mapOrderType(type: OrderType): string {
    const mapping: Record<OrderType, string> = {
      'market': 'MARKET',
      'limit': 'LIMIT',
      'stop_market': 'STOP_LOSS',
      'stop_limit': 'STOP_LOSS_LIMIT',
      'take_profit_market': 'TAKE_PROFIT',
      'take_profit_limit': 'TAKE_PROFIT_LIMIT'
    };
    return mapping[type] || 'LIMIT';
  }

  private convertBinanceOrder(binanceOrder: BinanceOrder): Order {
    return {
      id: binanceOrder.orderId.toString(),
      clientOrderId: binanceOrder.clientOrderId,
      info: binanceOrder,
      timestamp: binanceOrder.time,
      datetime: new Date(binanceOrder.time).toISOString(),
      lastTradeTimestamp: binanceOrder.updateTime,
      symbol: binanceOrder.symbol,
      type: this.convertOrderType(binanceOrder.type),
      side: binanceOrder.side.toLowerCase() as 'buy' | 'sell',
      amount: parseFloat(binanceOrder.origQty),
      price: parseFloat(binanceOrder.price) || undefined,
      cost: parseFloat(binanceOrder.cummulativeQuoteQty),
      filled: parseFloat(binanceOrder.executedQty),
      remaining: parseFloat(binanceOrder.origQty) - parseFloat(binanceOrder.executedQty),
      status: this.convertOrderStatus(binanceOrder.status),
      average: parseFloat(binanceOrder.executedQty) > 0 
        ? parseFloat(binanceOrder.cummulativeQuoteQty) / parseFloat(binanceOrder.executedQty) 
        : undefined
    };
  }

  private convertOrderType(binanceType: string): OrderType {
    const mapping: Record<string, OrderType> = {
      'MARKET': 'market',
      'LIMIT': 'limit',
      'STOP_LOSS': 'stop_market',
      'STOP_LOSS_LIMIT': 'stop_limit',
      'TAKE_PROFIT': 'take_profit_market',
      'TAKE_PROFIT_LIMIT': 'take_profit_limit'
    };
    return mapping[binanceType] || 'limit';
  }

  private convertOrderStatus(binanceStatus: string): any {
    const mapping: Record<string, any> = {
      'NEW': 'open',
      'PARTIALLY_FILLED': 'open',
      'FILLED': 'closed',
      'CANCELED': 'canceled',
      'PENDING_CANCEL': 'pending',
      'REJECTED': 'rejected',
      'EXPIRED': 'expired'
    };
    return mapping[binanceStatus] || 'open';
  }

  private parseSymbolLimits(filters: BinanceFilter[]): any {
    const limits = {
      amount: { min: 0, max: 0 },
      price: { min: 0, max: 0 },
      cost: { min: 0, max: 0 }
    };

    for (const filter of filters) {
      switch (filter.filterType) {
        case 'LOT_SIZE':
          limits.amount.min = parseFloat(filter.minQty || '0');
          limits.amount.max = parseFloat(filter.maxQty || '0');
          break;
        case 'PRICE_FILTER':
          limits.price.min = parseFloat(filter.minPrice || '0');
          limits.price.max = parseFloat(filter.maxPrice || '0');
          break;
        case 'MIN_NOTIONAL':
          limits.cost.min = parseFloat(filter.minNotional || '0');
          break;
      }
    }

    return limits;
  }

  // WebSocket converters
  private convertWebSocketTicker(data: any): Ticker {
    return {
      symbol: data.s,
      timestamp: data.E,
      datetime: new Date(data.E).toISOString(),
      high: parseFloat(data.h),
      low: parseFloat(data.l),
      bid: parseFloat(data.b),
      bidVolume: parseFloat(data.B),
      ask: parseFloat(data.a),
      askVolume: parseFloat(data.A),
      vwap: parseFloat(data.w),
      open: parseFloat(data.o),
      close: parseFloat(data.c),
      last: parseFloat(data.c),
      previousClose: parseFloat(data.x),
      change: parseFloat(data.P),
      percentage: parseFloat(data.P),
      baseVolume: parseFloat(data.v),
      quoteVolume: parseFloat(data.q),
      info: data
    };
  }

  private convertWebSocketOrderBook(data: any, symbol: string): OrderBook {
    return {
      symbol,
      bids: data.bids.map((bid: [string, string]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
      asks: data.asks.map((ask: [string, string]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
      timestamp: Date.now(),
      datetime: new Date().toISOString()
    };
  }

  private convertWebSocketTrade(data: any, symbol: string): Trade {
    return {
      id: data.t.toString(),
      info: data,
      timestamp: data.T,
      datetime: new Date(data.T).toISOString(),
      symbol,
      type: 'market' as OrderType,
      side: data.m ? 'sell' : 'buy',
      amount: parseFloat(data.q),
      price: parseFloat(data.p),
      cost: parseFloat(data.q) * parseFloat(data.p),
      takerOrMaker: data.m ? 'maker' : 'taker'
    };
  }

  private convertWebSocketKline(klineData: any): OHLCV {
    return {
      timestamp: klineData.t,
      open: parseFloat(klineData.o),
      high: parseFloat(klineData.h),
      low: parseFloat(klineData.l),
      close: parseFloat(klineData.c),
      volume: parseFloat(klineData.v)
    };
  }

  private convertWebSocketOrder(data: any): Order {
    return {
      id: data.i.toString(),
      clientOrderId: data.c,
      info: data,
      timestamp: data.O,
      datetime: new Date(data.O).toISOString(),
      lastTradeTimestamp: data.T,
      symbol: data.s,
      type: this.convertOrderType(data.o),
      side: data.S.toLowerCase() as 'buy' | 'sell',
      amount: parseFloat(data.q),
      price: parseFloat(data.p) || undefined,
      cost: parseFloat(data.Z),
      filled: parseFloat(data.z),
      remaining: parseFloat(data.q) - parseFloat(data.z),
      status: this.convertOrderStatus(data.X),
      average: parseFloat(data.z) > 0 ? parseFloat(data.Z) / parseFloat(data.z) : undefined
    };
  }
}

export default BinanceConnector;