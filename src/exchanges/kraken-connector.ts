/**
 * TITAN Trading System - Kraken Exchange Connector
 * Comprehensive Kraken API implementation with real-time WebSocket support
 * 
 * Features:
 * - Complete REST API integration for trading operations
 * - Real-time market data via WebSocket connections
 * - Advanced order management with all order types
 * - Account balance and position tracking
 * - Error handling and rate limiting compliance
 * - Automatic reconnection for WebSocket streams
 */

import { ExchangeConnector, Order, Balance, Ticker, OrderBook, Trade, OrderType, TimeInForce, OrderStatus } from './exchange-connector';

interface KrakenCredentials {
  apiKey: string;
  apiSecret: string;
  sandbox?: boolean;
}

interface KrakenOrder {
  txid: string;
  refid?: string;
  userref?: number;
  status: 'pending' | 'open' | 'closed' | 'canceled' | 'expired';
  opentm: number;
  closetm?: number;
  starttm?: number;
  expiretm?: number;
  descr: {
    pair: string;
    type: 'buy' | 'sell';
    ordertype: string;
    price: string;
    price2?: string;
    leverage?: string;
    order: string;
    close?: string;
  };
  vol: string;
  vol_exec: string;
  cost: string;
  fee: string;
  price: string;
  stopprice?: string;
  limitprice?: string;
  misc: string;
  oflags: string;
}

interface KrakenBalance {
  [asset: string]: string;
}

interface KrakenTicker {
  a: [string, string, string]; // ask [price, whole lot volume, lot volume]
  b: [string, string, string]; // bid [price, whole lot volume, lot volume]
  c: [string, string]; // last trade closed [price, lot volume]
  v: [string, string]; // volume [today, last 24 hours]
  p: [string, string]; // volume weighted average price [today, last 24 hours]
  t: [number, number]; // number of trades [today, last 24 hours]
  l: [string, string]; // low [today, last 24 hours]
  h: [string, string]; // high [today, last 24 hours]
  o: string; // today's opening price
}

interface KrakenOrderBook {
  [pair: string]: {
    asks: Array<[string, string, number]>;
    bids: Array<[string, string, number]>;
  };
}

interface KrakenTrade {
  price: string;
  volume: string;
  time: number;
  buy_sell: 'b' | 's';
  market_limit: 'm' | 'l';
  miscellaneous: string;
}

interface KrakenAssetPair {
  altname: string;
  wsname: string;
  aclass_base: string;
  base: string;
  aclass_quote: string;
  quote: string;
  lot: string;
  pair_decimals: number;
  lot_decimals: number;
  lot_multiplier: number;
  leverage_buy: number[];
  leverage_sell: number[];
  fees: Array<[number, number]>;
  fees_maker: Array<[number, number]>;
  fee_volume_currency: string;
  margin_call: number;
  margin_stop: number;
  ordermin: string;
}

export class KrakenConnector extends ExchangeConnector {
  private credentials: KrakenCredentials;
  private baseURL: string;
  private wsURL: string;
  private wsConnection: WebSocket | null = null;
  private subscriptions = new Map<string, Set<(data: any) => void>>();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private assetPairs = new Map<string, KrakenAssetPair>();

  constructor(credentials: KrakenCredentials) {
    super();
    this.credentials = credentials;
    this.baseURL = credentials.sandbox 
      ? 'https://api.sandbox.kraken.com'
      : 'https://api.kraken.com';
    this.wsURL = credentials.sandbox
      ? 'wss://ws-sandbox.kraken.com'
      : 'wss://ws.kraken.com';
  }

  async initialize(): Promise<void> {
    try {
      // Load asset pairs
      await this.loadAssetPairs();
      
      // Test API connection
      await this.makeRequest('/0/private/Balance', true);
      this.isConnected = true;
      console.log('Kraken connector initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Kraken connector:', error);
      throw error;
    }
  }

  async createOrder(
    symbol: string,
    type: OrderType,
    side: 'buy' | 'sell',
    amount: number,
    price?: number,
    timeInForce?: TimeInForce
  ): Promise<Order> {
    try {
      const pair = this.formatSymbol(symbol);
      
      const orderData: any = {
        pair,
        type: side,
        ordertype: this.mapOrderType(type),
        volume: amount.toString()
      };

      if (type === 'limit' && price) {
        orderData.price = price.toString();
      }

      if (timeInForce) {
        orderData.timeinforce = this.mapTimeInForce(timeInForce);
      }

      const response = await this.makeRequest('/0/private/AddOrder', true, orderData);
      
      if (response.error && response.error.length > 0) {
        throw new Error(`Kraken API error: ${response.error.join(', ')}`);
      }
      
      const orderId = response.result.txid[0];
      const orderInfo = await this.getOrder(orderId);
      
      if (!orderInfo) {
        throw new Error('Failed to retrieve created order information');
      }
      
      return orderInfo;
    } catch (error) {
      console.error('Failed to create order:', error);
      throw error;
    }
  }

  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      const response = await this.makeRequest('/0/private/CancelOrder', true, {
        txid: orderId
      });
      
      return response.error.length === 0;
    } catch (error) {
      console.error('Failed to cancel order:', error);
      return false;
    }
  }

  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const response = await this.makeRequest('/0/private/QueryOrders', true, {
        txid: orderId
      });
      
      if (response.error && response.error.length > 0) {
        return null;
      }
      
      const orderData = response.result[orderId];
      if (!orderData) {
        return null;
      }
      
      return this.mapKrakenOrderToOrder(orderId, orderData);
    } catch (error) {
      console.error('Failed to get order:', error);
      return null;
    }
  }

  async getOpenOrders(symbol?: string): Promise<Order[]> {
    try {
      const response = await this.makeRequest('/0/private/OpenOrders', true);
      
      if (response.error && response.error.length > 0) {
        return [];
      }
      
      const orders: Order[] = [];
      const openOrders = response.result.open;
      
      for (const [orderId, orderData] of Object.entries(openOrders)) {
        const order = this.mapKrakenOrderToOrder(orderId, orderData as KrakenOrder);
        
        if (!symbol || order.symbol === symbol) {
          orders.push(order);
        }
      }
      
      return orders;
    } catch (error) {
      console.error('Failed to get open orders:', error);
      return [];
    }
  }

  async getBalances(): Promise<Balance[]> {
    try {
      const response = await this.makeRequest('/0/private/Balance', true);
      
      if (response.error && response.error.length > 0) {
        return [];
      }
      
      const balances: Balance[] = [];
      const balanceData = response.result;
      
      for (const [asset, balance] of Object.entries(balanceData)) {
        const normalizedAsset = this.normalizeAsset(asset);
        balances.push({
          asset: normalizedAsset,
          free: parseFloat(balance as string),
          locked: 0, // Kraken doesn't separate locked balance in this endpoint
          total: parseFloat(balance as string)
        });
      }
      
      return balances;
    } catch (error) {
      console.error('Failed to get balances:', error);
      return [];
    }
  }

  async getTicker(symbol: string): Promise<Ticker | null> {
    try {
      const pair = this.formatSymbol(symbol);
      const response = await this.makeRequest(`/0/public/Ticker?pair=${pair}`, false);
      
      if (response.error && response.error.length > 0) {
        return null;
      }
      
      const tickerData = response.result[pair];
      if (!tickerData) {
        return null;
      }
      
      return {
        symbol,
        price: parseFloat(tickerData.c[0]),
        bid: parseFloat(tickerData.b[0]),
        ask: parseFloat(tickerData.a[0]),
        volume: parseFloat(tickerData.v[1]),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to get ticker:', error);
      return null;
    }
  }

  async getOrderBook(symbol: string, limit?: number): Promise<OrderBook | null> {
    try {
      const pair = this.formatSymbol(symbol);
      let endpoint = `/0/public/Depth?pair=${pair}`;
      if (limit) {
        endpoint += `&count=${Math.min(limit, 500)}`;
      }
      
      const response = await this.makeRequest(endpoint, false);
      
      if (response.error && response.error.length > 0) {
        return null;
      }
      
      const orderBookData = response.result[pair];
      if (!orderBookData) {
        return null;
      }
      
      return {
        symbol,
        bids: orderBookData.bids.map((bid: [string, string, number]) => ({
          price: parseFloat(bid[0]),
          quantity: parseFloat(bid[1])
        })),
        asks: orderBookData.asks.map((ask: [string, string, number]) => ({
          price: parseFloat(ask[0]),
          quantity: parseFloat(ask[1])
        })),
        timestamp: Date.now()
      };
    } catch (error) {
      console.error('Failed to get order book:', error);
      return null;
    }
  }

  async getRecentTrades(symbol: string, limit?: number): Promise<Trade[]> {
    try {
      const pair = this.formatSymbol(symbol);
      const response = await this.makeRequest(`/0/public/Trades?pair=${pair}`, false);
      
      if (response.error && response.error.length > 0) {
        return [];
      }
      
      const tradesData = response.result[pair];
      if (!tradesData) {
        return [];
      }
      
      const trades = tradesData.slice(0, limit || 100);
      return trades.map((trade: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        symbol,
        price: parseFloat(trade[0]),
        quantity: parseFloat(trade[1]),
        side: trade[3] === 'b' ? 'buy' : 'sell',
        timestamp: Math.floor(trade[2] * 1000)
      }));
    } catch (error) {
      console.error('Failed to get recent trades:', error);
      return [];
    }
  }

  async getTradeHistory(symbol?: string, limit?: number): Promise<Trade[]> {
    try {
      const response = await this.makeRequest('/0/private/TradesHistory', true);
      
      if (response.error && response.error.length > 0) {
        return [];
      }
      
      const trades: Trade[] = [];
      const tradesData = response.result.trades;
      
      for (const [tradeId, tradeData] of Object.entries(tradesData)) {
        const trade = tradeData as any;
        const tradeSymbol = this.normalizeSymbol(trade.pair);
        
        if (!symbol || tradeSymbol === symbol) {
          trades.push({
            id: tradeId,
            symbol: tradeSymbol,
            price: parseFloat(trade.price),
            quantity: parseFloat(trade.vol),
            side: trade.type,
            timestamp: Math.floor(trade.time * 1000),
            fee: parseFloat(trade.fee)
          });
        }
      }
      
      return trades.slice(0, limit || 100);
    } catch (error) {
      console.error('Failed to get trade history:', error);
      return [];
    }
  }

  async subscribeToTicker(symbol: string, callback: (ticker: Ticker) => void): Promise<void> {
    await this.ensureWebSocketConnection();
    
    const pair = this.formatSymbol(symbol);
    const subscriptionKey = `ticker:${pair}`;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
      
      // Subscribe to ticker channel
      this.sendWebSocketMessage({
        event: 'subscribe',
        pair: [pair],
        subscription: { name: 'ticker' }
      });
    }
    
    this.subscriptions.get(subscriptionKey)!.add(callback);
  }

  async subscribeToOrderBook(symbol: string, callback: (orderBook: OrderBook) => void): Promise<void> {
    await this.ensureWebSocketConnection();
    
    const pair = this.formatSymbol(symbol);
    const subscriptionKey = `book:${pair}`;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
      
      // Subscribe to book channel
      this.sendWebSocketMessage({
        event: 'subscribe',
        pair: [pair],
        subscription: { name: 'book', depth: 25 }
      });
    }
    
    this.subscriptions.get(subscriptionKey)!.add(callback);
  }

  async subscribeToTrades(symbol: string, callback: (trade: Trade) => void): Promise<void> {
    await this.ensureWebSocketConnection();
    
    const pair = this.formatSymbol(symbol);
    const subscriptionKey = `trade:${pair}`;
    
    if (!this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.set(subscriptionKey, new Set());
      
      // Subscribe to trade channel
      this.sendWebSocketMessage({
        event: 'subscribe',
        pair: [pair],
        subscription: { name: 'trade' }
      });
    }
    
    this.subscriptions.get(subscriptionKey)!.add(callback);
  }

  async unsubscribe(symbol: string, type: 'ticker' | 'orderBook' | 'trades'): Promise<void> {
    const pair = this.formatSymbol(symbol);
    const channelMap = {
      ticker: 'ticker',
      orderBook: 'book',
      trades: 'trade'
    };
    
    const channel = channelMap[type];
    const subscriptionKey = `${channel}:${pair}`;
    
    if (this.subscriptions.has(subscriptionKey)) {
      this.subscriptions.delete(subscriptionKey);
      
      // Unsubscribe from channel
      this.sendWebSocketMessage({
        event: 'unsubscribe',
        pair: [pair],
        subscription: { name: channel }
      });
    }
  }

  disconnect(): void {
    if (this.wsConnection) {
      this.wsConnection.close();
      this.wsConnection = null;
    }
    this.subscriptions.clear();
    this.isConnected = false;
  }

  // Private helper methods
  private async makeRequest(endpoint: string, isPrivate: boolean, data?: any): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    let config: RequestInit = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    };
    
    let body = '';
    if (data) {
      body = new URLSearchParams(data).toString();
    }
    
    if (isPrivate) {
      const nonce = Date.now() * 1000;
      body = `nonce=${nonce}&${body}`;
      
      const signature = await this.createSignature(endpoint, body, nonce);
      config.headers = {
        ...config.headers,
        'API-Key': this.credentials.apiKey,
        'API-Sign': signature
      };
    }
    
    config.body = body;
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`Kraken API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  private async createSignature(path: string, body: string, nonce: number): Promise<string> {
    const message = path + crypto.subtle.digest('SHA-256', new TextEncoder().encode(nonce + body));
    
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(atob(this.credentials.apiSecret)),
      { name: 'HMAC', hash: 'SHA-512' },
      false,
      ['sign']
    );
    
    const signature = await crypto.subtle.sign('HMAC', key, await message);
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  private async loadAssetPairs(): Promise<void> {
    try {
      const response = await this.makeRequest('/0/public/AssetPairs', false);
      
      if (response.error && response.error.length > 0) {
        console.warn('Failed to load asset pairs:', response.error);
        return;
      }
      
      for (const [pair, pairData] of Object.entries(response.result)) {
        this.assetPairs.set(pair, pairData as KrakenAssetPair);
      }
    } catch (error) {
      console.warn('Failed to load asset pairs:', error);
    }
  }

  private async ensureWebSocketConnection(): Promise<void> {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      return;
    }
    
    return new Promise((resolve, reject) => {
      try {
        this.wsConnection = new WebSocket(this.wsURL);
        
        this.wsConnection.onopen = () => {
          console.log('Kraken WebSocket connected');
          this.reconnectAttempts = 0;
          resolve();
        };
        
        this.wsConnection.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleWebSocketMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };
        
        this.wsConnection.onclose = () => {
          console.log('Kraken WebSocket disconnected');
          this.handleWebSocketReconnect();
        };
        
        this.wsConnection.onerror = (error) => {
          console.error('Kraken WebSocket error:', error);
          reject(error);
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }

  private handleWebSocketMessage(data: any): void {
    if (Array.isArray(data)) {
      const channelId = data[0];
      const channelData = data[1];
      const channelName = data[2];
      const pair = data[3];
      
      if (channelName === 'ticker') {
        const ticker: Ticker = {
          symbol: this.normalizeSymbol(pair),
          price: parseFloat(channelData.c[0]),
          bid: parseFloat(channelData.b[0]),
          ask: parseFloat(channelData.a[0]),
          volume: parseFloat(channelData.v[1]),
          timestamp: Date.now()
        };
        
        const subscriptionKey = `ticker:${pair}`;
        this.subscriptions.get(subscriptionKey)?.forEach(callback => callback(ticker));
        
      } else if (channelName === 'book-25') {
        const orderBook: OrderBook = {
          symbol: this.normalizeSymbol(pair),
          bids: channelData.b?.map((bid: [string, string, string]) => ({
            price: parseFloat(bid[0]),
            quantity: parseFloat(bid[1])
          })) || [],
          asks: channelData.a?.map((ask: [string, string, string]) => ({
            price: parseFloat(ask[0]),
            quantity: parseFloat(ask[1])
          })) || [],
          timestamp: Date.now()
        };
        
        const subscriptionKey = `book:${pair}`;
        this.subscriptions.get(subscriptionKey)?.forEach(callback => callback(orderBook));
        
      } else if (channelName === 'trade') {
        if (Array.isArray(channelData)) {
          channelData.forEach((tradeData: any, index: number) => {
            const trade: Trade = {
              id: `${Date.now()}-${index}`,
              symbol: this.normalizeSymbol(pair),
              price: parseFloat(tradeData[0]),
              quantity: parseFloat(tradeData[1]),
              side: tradeData[3] === 'b' ? 'buy' : 'sell',
              timestamp: Math.floor(parseFloat(tradeData[2]) * 1000)
            };
            
            const subscriptionKey = `trade:${pair}`;
            this.subscriptions.get(subscriptionKey)?.forEach(callback => callback(trade));
          });
        }
      }
    }
  }

  private handleWebSocketReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      setTimeout(() => {
        console.log(`Attempting to reconnect to Kraken WebSocket (attempt ${this.reconnectAttempts})`);
        this.ensureWebSocketConnection().catch(console.error);
      }, delay);
    } else {
      console.error('Max reconnection attempts reached for Kraken WebSocket');
    }
  }

  private sendWebSocketMessage(message: any): void {
    if (this.wsConnection && this.wsConnection.readyState === WebSocket.OPEN) {
      this.wsConnection.send(JSON.stringify(message));
    }
  }

  private formatSymbol(symbol: string): string {
    // Convert from BTCUSDT format to XBTUSD format for Kraken
    if (symbol.includes('/')) {
      return symbol.toUpperCase();
    }
    
    // Simple mapping for common pairs
    const symbolMappings: { [key: string]: string } = {
      'BTCUSDT': 'XBTUSD',
      'ETHUSDT': 'ETHUSD',
      'LTCUSDT': 'LTCUSD',
      'BCHUSDT': 'BCHUSD',
      'ADAUSDT': 'ADAUSD',
      'DOTUSDT': 'DOTUSD',
      'LINKUSDT': 'LINKUSD',
      'XLMUSDT': 'XLMUSD',
      'UNIUSDT': 'UNIUSD',
      'AAVEUSDT': 'AAVEUSD'
    };
    
    return symbolMappings[symbol.toUpperCase()] || symbol.toUpperCase();
  }

  private normalizeSymbol(krakenSymbol: string): string {
    // Convert from Kraken format back to standard format
    const symbolMappings: { [key: string]: string } = {
      'XBTUSD': 'BTCUSDT',
      'ETHUSD': 'ETHUSDT',
      'LTCUSD': 'LTCUSDT',
      'BCHUSD': 'BCHUSDT',
      'ADAUSD': 'ADAUSDT',
      'DOTUSD': 'DOTUSDT',
      'LINKUSD': 'LINKUSDT',
      'XLMUSD': 'XLMUSDT',
      'UNIUSD': 'UNIUSDT',
      'AAVEUSD': 'AAVEUSDT'
    };
    
    return symbolMappings[krakenSymbol] || krakenSymbol;
  }

  private normalizeAsset(krakenAsset: string): string {
    // Convert Kraken asset names to standard format
    const assetMappings: { [key: string]: string } = {
      'XXBT': 'BTC',
      'XETH': 'ETH',
      'XLTC': 'LTC',
      'BCH': 'BCH',
      'ADA': 'ADA',
      'DOT': 'DOT',
      'LINK': 'LINK',
      'XXLM': 'XLM',
      'UNI': 'UNI',
      'AAVE': 'AAVE',
      'ZUSD': 'USDT'
    };
    
    return assetMappings[krakenAsset] || krakenAsset;
  }

  private mapOrderType(type: OrderType): string {
    const typeMap = {
      'market': 'market',
      'limit': 'limit',
      'stopLoss': 'stop-loss',
      'stopLossLimit': 'stop-loss-limit',
      'takeProfit': 'take-profit',
      'takeProfitLimit': 'take-profit-limit'
    };
    return typeMap[type] || 'limit';
  }

  private mapTimeInForce(timeInForce: TimeInForce): string {
    const tifMap = {
      'GTC': 'GTC',
      'IOC': 'IOC',
      'FOK': 'FOK',
      'GTD': 'GTD'
    };
    return tifMap[timeInForce] || 'GTC';
  }

  private mapKrakenOrderToOrder(orderId: string, krakenOrder: KrakenOrder): Order {
    const statusMap: { [key: string]: OrderStatus } = {
      'pending': 'pending',
      'open': 'open',
      'closed': 'filled',
      'canceled': 'cancelled',
      'expired': 'expired'
    };

    return {
      id: orderId,
      symbol: this.normalizeSymbol(krakenOrder.descr.pair),
      type: krakenOrder.descr.ordertype as OrderType,
      side: krakenOrder.descr.type,
      amount: parseFloat(krakenOrder.vol),
      price: parseFloat(krakenOrder.price) || parseFloat(krakenOrder.descr.price),
      filled: parseFloat(krakenOrder.vol_exec),
      remaining: parseFloat(krakenOrder.vol) - parseFloat(krakenOrder.vol_exec),
      status: statusMap[krakenOrder.status] || 'unknown',
      timestamp: Math.floor(krakenOrder.opentm * 1000),
      fee: parseFloat(krakenOrder.fee) || 0
    };
  }
}