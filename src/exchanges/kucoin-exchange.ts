/**
 * TITAN Trading System - KuCoin Exchange Integration
 * Real KuCoin API implementation with authentication
 */

import { BaseExchange, type ExchangeCredentials, type ExchangeEndpoints, type ExchangeLimits } from './base-exchange'
import type { MarketData, OrderBook, TradeOrder, OrderResponse, Balance } from '../services/exchange-service'
import { ExchangeAuth, CryptoHelper } from '../utils/crypto-helpers'

export interface KuCoinCredentials extends ExchangeCredentials {
  passphrase: string
}

export class KuCoinExchange extends BaseExchange {
  private passphrase: string

  constructor(credentials: KuCoinCredentials) {
    const endpoints: ExchangeEndpoints = {
      baseUrl: 'https://api.kucoin.com',
      sandboxUrl: 'https://openapi-sandbox.kucoin.com',
      ticker: '/api/v1/market/stats',
      orderBook: '/api/v1/market/orderbook/level2_20',
      trades: '/api/v1/fills',
      balance: '/api/v1/accounts',
      placeOrder: '/api/v1/orders',
      cancelOrder: '/api/v1/orders/{orderId}',
      orderStatus: '/api/v1/orders/{orderId}',
      serverTime: '/api/v1/timestamp',
      exchangeInfo: '/api/v1/symbols'
    }

    const limits: ExchangeLimits = {
      requestsPerMinute: 600,  // 10 requests per second
      ordersPerSecond: 45      // 45 orders per 10 seconds
    }

    super('KuCoin', credentials, endpoints, limits)
    this.passphrase = credentials.passphrase
  }

  /**
   * Create authenticated headers for KuCoin API
   */
  async createAuthHeaders(method: string, endpoint: string, body: string = ''): Promise<Headers> {
    const timestamp = CryptoHelper.timestamp().toString()
    const requestPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    
    const signature = await ExchangeAuth.createKuCoinSignature(
      timestamp,
      method,
      requestPath,
      body,
      this.credentials.apiSecret
    )

    const passphraseSignature = await ExchangeAuth.createKuCoinPassphrase(
      this.passphrase,
      this.credentials.apiSecret
    )

    return CryptoHelper.createHeaders({
      'KC-API-KEY': this.credentials.apiKey,
      'KC-API-SIGN': signature,
      'KC-API-TIMESTAMP': timestamp,
      'KC-API-PASSPHRASE': passphraseSignature,
      'KC-API-KEY-VERSION': '2'
    })
  }

  /**
   * Transform symbol to KuCoin format (BTC-USDT)
   */
  transformSymbol(symbol: string): string {
    // Convert BTCUSDT to BTC-USDT format
    const normalized = symbol.toUpperCase()
    
    // Handle common mappings
    const mappings: Record<string, string> = {
      'BTCUSDT': 'BTC-USDT',
      'ETHUSDT': 'ETH-USDT',
      'SOLUSDT': 'SOL-USDT',
      'ADAUSDT': 'ADA-USDT',
      'DOTUSDT': 'DOT-USDT',
      'MATICUSDT': 'MATIC-USDT',
      'LINKUSDT': 'LINK-USDT',
      'AVAXUSDT': 'AVAX-USDT',
      'UNIUSDT': 'UNI-USDT'
    }

    if (mappings[normalized]) {
      return mappings[normalized]
    }

    // General transformation: add hyphen before USDT
    if (normalized.endsWith('USDT')) {
      const base = normalized.slice(0, -4) // Remove 'USDT'
      return `${base}-USDT`
    }

    // If already in correct format, return as is
    if (normalized.includes('-')) {
      return normalized
    }

    // Default fallback
    return normalized
  }

  /**
   * Parse KuCoin market data response
   */
  parseMarketData(data: any): MarketData {
    // KuCoin wraps response in { code, data }
    const ticker = data.data || data

    return {
      symbol: this.reverseTransformSymbol(ticker.symbol || 'BTC-USDT'),
      price: parseFloat(ticker.last || ticker.price),
      volume24h: parseFloat(ticker.volValue || ticker.volume || 0),
      change24h: parseFloat(ticker.changePrice || 0),
      changePercent24h: parseFloat(ticker.changeRate || 0) * 100,
      high24h: parseFloat(ticker.high || 0),
      low24h: parseFloat(ticker.low || 0),
      timestamp: new Date().toISOString(),
      exchange: 'kucoin'
    }
  }

  /**
   * Parse KuCoin order book response
   */
  parseOrderBook(data: any): OrderBook {
    // KuCoin wraps response in { code, data }
    const orderbook = data.data || data

    return {
      symbol: this.reverseTransformSymbol(orderbook.symbol || 'BTC-USDT'),
      bids: (orderbook.bids || []).map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
      asks: (orderbook.asks || []).map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
      timestamp: new Date(orderbook.time || Date.now()).toISOString(),
      exchange: 'kucoin'
    }
  }

  /**
   * Parse KuCoin balance response
   */
  parseBalance(data: any): Balance[] {
    // KuCoin wraps response in { code, data }
    const accounts = data.data || data
    const accountList = Array.isArray(accounts) ? accounts : [accounts]

    return accountList
      .filter((account: any) => parseFloat(account.balance) > 0)
      .map((account: any) => ({
        asset: account.currency,
        free: parseFloat(account.available || 0),
        locked: parseFloat(account.holds || 0),
        total: parseFloat(account.balance || 0)
      }))
  }

  /**
   * Parse KuCoin order response
   */
  parseOrderResponse(data: any): OrderResponse {
    // KuCoin wraps response in { code, data }
    const order = data.data || data

    // Map KuCoin status to our standard status
    const statusMap: Record<string, OrderResponse['status']> = {
      'active': 'new',
      'open': 'new',
      'done': 'filled',
      'cancelled': 'canceled',
      'cancel': 'canceled'
    }

    return {
      orderId: order.orderId || order.id,
      symbol: this.reverseTransformSymbol(order.symbol),
      side: order.side as 'buy' | 'sell',
      status: statusMap[order.status] || 'new',
      quantity: parseFloat(order.size || order.amount || 0),
      executedQuantity: parseFloat(order.dealSize || order.filledSize || 0),
      price: parseFloat(order.price || 0),
      averagePrice: order.dealFunds && order.dealSize 
        ? parseFloat(order.dealFunds) / parseFloat(order.dealSize)
        : undefined,
      timestamp: new Date(order.createdAt || Date.now()).toISOString(),
      exchange: 'kucoin'
    }
  }

  /**
   * Prepare order parameters in KuCoin format
   */
  protected prepareOrderParams(order: TradeOrder): Record<string, any> {
    const params: Record<string, any> = {
      symbol: order.symbol,
      side: order.side,
      type: this.mapOrderType(order.type),
      size: order.quantity.toString()
    }

    // Add client order ID for tracking
    params.clientOid = `TITAN_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`

    // Add price for limit orders
    if (order.type === 'limit' && order.price) {
      params.price = order.price.toString()
    }

    // Add stop price for stop orders
    if ((order.type === 'stop_loss' || order.type === 'take_profit') && order.stopPrice) {
      params.stop = order.type === 'stop_loss' ? 'loss' : 'entry'
      params.stopPrice = order.stopPrice.toString()
      if (order.price) {
        params.price = order.price.toString()
      }
    }

    // Add time in force
    if (order.timeInForce) {
      params.timeInForce = order.timeInForce
    }

    return params
  }

  /**
   * Map our order types to KuCoin order types
   */
  private mapOrderType(type: string): string {
    const typeMap: Record<string, string> = {
      'market': 'market',
      'limit': 'limit',
      'stop_loss': 'limit', // KuCoin uses 'limit' with stop parameter
      'take_profit': 'limit'
    }
    return typeMap[type] || 'market'
  }

  /**
   * Reverse transform symbol from KuCoin format to our format
   */
  private reverseTransformSymbol(kucoinSymbol: string): string {
    // Convert BTC-USDT back to BTCUSDT
    const mappings: Record<string, string> = {
      'BTC-USDT': 'BTCUSDT',
      'ETH-USDT': 'ETHUSDT',
      'SOL-USDT': 'SOLUSDT',
      'ADA-USDT': 'ADAUSDT',
      'DOT-USDT': 'DOTUSDT',
      'MATIC-USDT': 'MATICUSDT',
      'LINK-USDT': 'LINKUSDT',
      'AVAX-USDT': 'AVAXUSDT',
      'UNI-USDT': 'UNIUSDT'
    }

    if (mappings[kucoinSymbol]) {
      return mappings[kucoinSymbol]
    }

    // General transformation: remove hyphen
    return kucoinSymbol.replace('-', '')
  }

  /**
   * Override makeRequest to handle KuCoin response format
   */
  protected async makeRequest<T>(
    method: string,
    endpoint: string,
    params: Record<string, any> = {},
    requiresAuth: boolean = false
  ) {
    const result = await super.makeRequest(method, endpoint, params, requiresAuth)
    
    if (result.success && result.data) {
      // KuCoin wraps all responses in { code, data, msg }
      const kucoinResponse = result.data as any
      if (kucoinResponse.code === '200000' && kucoinResponse.data !== undefined) {
        return {
          ...result,
          data: kucoinResponse.data as T
        }
      } else if (kucoinResponse.code !== '200000') {
        return {
          success: false,
          error: `KuCoin API Error ${kucoinResponse.code}: ${kucoinResponse.msg || 'Unknown error'}`
        }
      }
    }
    
    return result
  }

  /**
   * Parse rate limit from KuCoin response headers
   */
  protected parseRateLimit(response: Response): number | undefined {
    const remaining = response.headers.get('X-RateLimit-Remaining')
    return remaining ? parseInt(remaining) : undefined
  }

  protected parseRateLimitUsed(response: Response): number | undefined {
    const limit = response.headers.get('X-RateLimit-Limit')
    const remaining = response.headers.get('X-RateLimit-Remaining')
    
    if (limit && remaining) {
      return parseInt(limit) - parseInt(remaining)
    }
    return undefined
  }

  /**
   * Get KuCoin server time
   */
  public async getServerTime(): Promise<any> {
    return await this.makeRequest('GET', '/api/v1/timestamp')
  }

  /**
   * Get all trading symbols
   */
  public async getSymbols(): Promise<any> {
    return await this.makeRequest('GET', '/api/v1/symbols')
  }

  /**
   * Get 24hr stats for all symbols or specific symbol
   */
  public async get24hrStats(symbol?: string): Promise<any> {
    if (symbol) {
      const transformedSymbol = this.transformSymbol(symbol)
      return await this.makeRequest('GET', `/api/v1/market/stats?symbol=${transformedSymbol}`)
    }
    return await this.makeRequest('GET', '/api/v1/market/allTickers')
  }

  /**
   * Get market list
   */
  public async getMarkets(): Promise<any> {
    return await this.makeRequest('GET', '/api/v1/markets')
  }

  /**
   * Get part order book (aggregated)
   */
  public async getPartOrderBook(symbol: string, level?: number): Promise<any> {
    const transformedSymbol = this.transformSymbol(symbol)
    const endpoint = level 
      ? `/api/v1/market/orderbook/level2_${level}?symbol=${transformedSymbol}`
      : `/api/v1/market/orderbook/level2_20?symbol=${transformedSymbol}`
    
    return await this.makeRequest('GET', endpoint)
  }

  /**
   * Get full order book (atomic)
   */
  public async getFullOrderBook(symbol: string): Promise<any> {
    const transformedSymbol = this.transformSymbol(symbol)
    return await this.makeRequest('GET', `/api/v3/market/orderbook/level2?symbol=${transformedSymbol}`)
  }

  /**
   * Get trade histories
   */
  public async getTradeHistory(symbol: string): Promise<any> {
    const transformedSymbol = this.transformSymbol(symbol)
    return await this.makeRequest('GET', `/api/v1/market/histories?symbol=${transformedSymbol}`)
  }

  /**
   * Get klines (candlesticks)
   */
  public async getKlines(symbol: string, type: string, startAt?: number, endAt?: number): Promise<any> {
    const transformedSymbol = this.transformSymbol(symbol)
    let endpoint = `/api/v1/market/candles?symbol=${transformedSymbol}&type=${type}`
    
    if (startAt) endpoint += `&startAt=${startAt}`
    if (endAt) endpoint += `&endAt=${endAt}`
    
    return await this.makeRequest('GET', endpoint)
  }

  /**
   * Get all accounts
   */
  public async getAllAccounts(currency?: string, type?: string): Promise<any> {
    const params: Record<string, any> = {}
    if (currency) params.currency = currency
    if (type) params.type = type
    
    return await this.makeRequest('GET', '/api/v1/accounts', params, true)
  }

  /**
   * Get account by ID
   */
  public async getAccountById(accountId: string): Promise<any> {
    return await this.makeRequest('GET', `/api/v1/accounts/${accountId}`, {}, true)
  }

  /**
   * Get account ledgers
   */
  public async getAccountLedgers(currency?: string, direction?: string, bizType?: string): Promise<any> {
    const params: Record<string, any> = {}
    if (currency) params.currency = currency
    if (direction) params.direction = direction
    if (bizType) params.bizType = bizType
    
    return await this.makeRequest('GET', '/api/v1/accounts/ledgers', params, true)
  }

  /**
   * Get all orders
   */
  public async getAllOrders(
    symbol?: string, 
    side?: string, 
    type?: string, 
    status?: string,
    startAt?: number,
    endAt?: number
  ): Promise<any> {
    const params: Record<string, any> = {}
    if (symbol) params.symbol = this.transformSymbol(symbol)
    if (side) params.side = side
    if (type) params.type = type
    if (status) params.status = status
    if (startAt) params.startAt = startAt
    if (endAt) params.endAt = endAt
    
    return await this.makeRequest('GET', '/api/v1/orders', params, true)
  }

  /**
   * Get recent orders
   */
  public async getRecentOrders(): Promise<any> {
    return await this.makeRequest('GET', '/api/v1/limit/orders', {}, true)
  }

  /**
   * Cancel all orders by symbol
   */
  public async cancelAllOrdersBySymbol(symbol: string): Promise<any> {
    const transformedSymbol = this.transformSymbol(symbol)
    return await this.makeRequest('DELETE', `/api/v1/orders?symbol=${transformedSymbol}`, {}, true)
  }

  /**
   * Get fills (trade history)
   */
  public async getFills(
    orderId?: string,
    symbol?: string,
    side?: string,
    type?: string,
    startAt?: number,
    endAt?: number
  ): Promise<any> {
    const params: Record<string, any> = {}
    if (orderId) params.orderId = orderId
    if (symbol) params.symbol = this.transformSymbol(symbol)
    if (side) params.side = side
    if (type) params.type = type
    if (startAt) params.startAt = startAt
    if (endAt) params.endAt = endAt
    
    return await this.makeRequest('GET', '/api/v1/fills', params, true)
  }
}

export default KuCoinExchange