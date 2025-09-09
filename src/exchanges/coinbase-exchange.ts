/**
 * TITAN Trading System - Coinbase Pro Exchange Integration
 * Real Coinbase Pro API implementation with authentication
 */

import { BaseExchange, type ExchangeCredentials, type ExchangeEndpoints, type ExchangeLimits } from './base-exchange'
import type { MarketData, OrderBook, TradeOrder, OrderResponse, Balance } from '../services/exchange-service'
import { ExchangeAuth, CryptoHelper } from '../utils/crypto-helpers'

export interface CoinbaseCredentials extends ExchangeCredentials {
  passphrase: string
}

export class CoinbaseExchange extends BaseExchange {
  private passphrase: string

  constructor(credentials: CoinbaseCredentials) {
    const endpoints: ExchangeEndpoints = {
      baseUrl: 'https://api.exchange.coinbase.com',
      sandboxUrl: 'https://api-public.sandbox.exchange.coinbase.com',
      ticker: '/products/{symbol}/ticker',
      orderBook: '/products/{symbol}/book',
      trades: '/fills',
      balance: '/accounts',
      placeOrder: '/orders',
      cancelOrder: '/orders/{id}',
      orderStatus: '/orders/{id}',
      serverTime: '/time',
      exchangeInfo: '/products'
    }

    const limits: ExchangeLimits = {
      requestsPerMinute: 600,  // 10 requests per second = 600 per minute
      ordersPerSecond: 5       // 5 orders per second
    }

    super('Coinbase', credentials, endpoints, limits)
    this.passphrase = credentials.passphrase
  }

  /**
   * Create authenticated headers for Coinbase Pro API
   */
  async createAuthHeaders(method: string, endpoint: string, body: string = ''): Promise<Headers> {
    const timestamp = CryptoHelper.unixTimestamp().toString()
    const requestPath = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    
    const signature = await ExchangeAuth.createCoinbaseSignature(
      timestamp,
      method,
      requestPath,
      body,
      this.credentials.apiSecret
    )

    return CryptoHelper.createHeaders({
      'CB-ACCESS-KEY': this.credentials.apiKey,
      'CB-ACCESS-SIGN': signature,
      'CB-ACCESS-TIMESTAMP': timestamp,
      'CB-ACCESS-PASSPHRASE': this.passphrase
    })
  }

  /**
   * Transform symbol to Coinbase format (BTC-USD)
   */
  transformSymbol(symbol: string): string {
    // Convert BTCUSDT to BTC-USD format
    const normalized = symbol.toUpperCase()
    
    // Handle common mappings
    const mappings: Record<string, string> = {
      'BTCUSDT': 'BTC-USD',
      'ETHUSDT': 'ETH-USD',
      'SOLUSDT': 'SOL-USD',
      'ADAUSDT': 'ADA-USD',
      'DOTUSDT': 'DOT-USD',
      'MATICUSDT': 'MATIC-USD',
      'LINKUSDT': 'LINK-USD',
      'AVAXUSDT': 'AVAX-USD',
      'UNIUSDT': 'UNI-USD'
    }

    if (mappings[normalized]) {
      return mappings[normalized]
    }

    // General transformation: remove USDT and add -USD
    if (normalized.endsWith('USDT')) {
      const base = normalized.slice(0, -4) // Remove 'USDT'
      return `${base}-USD`
    }

    // If already in correct format, return as is
    if (normalized.includes('-')) {
      return normalized
    }

    // Default fallback
    return normalized
  }

  /**
   * Parse Coinbase market data response
   */
  parseMarketData(data: any): MarketData {
    const price = parseFloat(data.price)
    const volume = parseFloat(data.volume)
    
    // Calculate 24h change (Coinbase doesn't provide this directly in ticker)
    const high = data.high ? parseFloat(data.high) : price * 1.05
    const low = data.low ? parseFloat(data.low) : price * 0.95
    const change24h = (high - low) / 2 // Approximation

    return {
      symbol: data.trade_id ? this.reverseTransformSymbol(data.product_id || 'BTC-USD') : 'BTCUSDT',
      price,
      volume24h: volume,
      change24h,
      changePercent24h: (change24h / price) * 100,
      high24h: high,
      low24h: low,
      timestamp: data.time || new Date().toISOString(),
      exchange: 'coinbase'
    }
  }

  /**
   * Parse Coinbase order book response
   */
  parseOrderBook(data: any): OrderBook {
    return {
      symbol: this.reverseTransformSymbol(data.product_id || 'BTC-USD'),
      bids: (data.bids || []).map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
      asks: (data.asks || []).map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
      timestamp: new Date().toISOString(),
      exchange: 'coinbase'
    }
  }

  /**
   * Parse Coinbase balance response
   */
  parseBalance(data: any): Balance[] {
    const accounts = Array.isArray(data) ? data : [data]

    return accounts
      .filter((account: any) => parseFloat(account.balance) > 0 || parseFloat(account.hold) > 0)
      .map((account: any) => ({
        asset: account.currency,
        free: parseFloat(account.available || account.balance) - parseFloat(account.hold || 0),
        locked: parseFloat(account.hold || 0),
        total: parseFloat(account.balance || 0)
      }))
  }

  /**
   * Parse Coinbase order response
   */
  parseOrderResponse(data: any): OrderResponse {
    // Map Coinbase status to our standard status
    const statusMap: Record<string, OrderResponse['status']> = {
      'pending': 'new',
      'open': 'new',
      'active': 'new',
      'done': 'filled',
      'cancelled': 'canceled',
      'rejected': 'rejected'
    }

    return {
      orderId: data.id,
      symbol: this.reverseTransformSymbol(data.product_id),
      side: data.side as 'buy' | 'sell',
      status: statusMap[data.status] || 'new',
      quantity: parseFloat(data.size || data.specified_funds || 0),
      executedQuantity: parseFloat(data.filled_size || 0),
      price: parseFloat(data.price || 0),
      averagePrice: data.executed_value && data.filled_size 
        ? parseFloat(data.executed_value) / parseFloat(data.filled_size)
        : undefined,
      timestamp: data.created_at || new Date().toISOString(),
      exchange: 'coinbase'
    }
  }

  /**
   * Prepare order parameters in Coinbase format
   */
  protected prepareOrderParams(order: TradeOrder): Record<string, any> {
    const params: Record<string, any> = {
      product_id: order.symbol,
      side: order.side,
      type: this.mapOrderType(order.type)
    }

    if (order.type === 'market') {
      // For market orders, Coinbase uses 'size' for buy orders and 'funds' for sell orders
      if (order.side === 'buy') {
        params.funds = order.quantity.toString() // USD amount
      } else {
        params.size = order.quantity.toString() // Crypto amount
      }
    } else if (order.type === 'limit') {
      params.size = order.quantity.toString()
      params.price = order.price?.toString()
    }

    // Add time in force
    if (order.timeInForce) {
      params.time_in_force = this.mapTimeInForce(order.timeInForce)
    }

    // Add stop price for stop orders
    if (order.type === 'stop_loss' && order.stopPrice) {
      params.stop_price = order.stopPrice.toString()
      params.stop = 'loss'
    } else if (order.type === 'take_profit' && order.stopPrice) {
      params.stop_price = order.stopPrice.toString()
      params.stop = 'entry'
    }

    return params
  }

  /**
   * Map our order types to Coinbase order types
   */
  private mapOrderType(type: string): string {
    const typeMap: Record<string, string> = {
      'market': 'market',
      'limit': 'limit',
      'stop_loss': 'stop',
      'take_profit': 'stop'
    }
    return typeMap[type] || 'market'
  }

  /**
   * Map our time in force to Coinbase format
   */
  private mapTimeInForce(timeInForce: string): string {
    const map: Record<string, string> = {
      'GTC': 'GTC',
      'IOC': 'IOC',
      'FOK': 'FOK'
    }
    return map[timeInForce] || 'GTC'
  }

  /**
   * Reverse transform symbol from Coinbase format to our format
   */
  private reverseTransformSymbol(coinbaseSymbol: string): string {
    // Convert BTC-USD back to BTCUSDT
    const mappings: Record<string, string> = {
      'BTC-USD': 'BTCUSDT',
      'ETH-USD': 'ETHUSDT',
      'SOL-USD': 'SOLUSDT',
      'ADA-USD': 'ADAUSDT',
      'DOT-USD': 'DOTUSDT',
      'MATIC-USD': 'MATICUSDT',
      'LINK-USD': 'LINKUSDT',
      'AVAX-USD': 'AVAXUSDT',
      'UNI-USD': 'UNIUSDT'
    }

    if (mappings[coinbaseSymbol]) {
      return mappings[coinbaseSymbol]
    }

    // General transformation: replace -USD with USDT
    if (coinbaseSymbol.endsWith('-USD')) {
      const base = coinbaseSymbol.slice(0, -4) // Remove '-USD'
      return `${base}USDT`
    }

    return coinbaseSymbol.replace('-', '')
  }

  /**
   * Parse rate limit from Coinbase response headers
   */
  protected parseRateLimit(response: Response): number | undefined {
    const remaining = response.headers.get('cb-after')
    return remaining ? parseInt(remaining) : undefined
  }

  protected parseRateLimitUsed(response: Response): number | undefined {
    // Coinbase doesn't provide explicit rate limit usage
    return undefined
  }

  /**
   * Get Coinbase server time
   */
  public async getServerTime(): Promise<any> {
    return await this.makeRequest('GET', '/time')
  }

  /**
   * Get all trading pairs
   */
  public async getProducts(): Promise<any> {
    return await this.makeRequest('GET', '/products')
  }

  /**
   * Get product order book
   */
  public async getProductOrderBook(productId: string, level: number = 2): Promise<any> {
    const endpoint = `/products/${productId}/book?level=${level}`
    return await this.makeRequest('GET', endpoint)
  }

  /**
   * Get product ticker
   */
  public async getProductTicker(productId: string): Promise<any> {
    const endpoint = `/products/${productId}/ticker`
    return await this.makeRequest('GET', endpoint)
  }

  /**
   * Get product trades
   */
  public async getProductTrades(productId: string, limit?: number): Promise<any> {
    let endpoint = `/products/${productId}/trades`
    if (limit) {
      endpoint += `?limit=${limit}`
    }
    return await this.makeRequest('GET', endpoint)
  }

  /**
   * Get account by ID
   */
  public async getAccount(accountId: string): Promise<any> {
    return await this.makeRequest('GET', `/accounts/${accountId}`, {}, true)
  }

  /**
   * Get account history
   */
  public async getAccountHistory(accountId: string): Promise<any> {
    return await this.makeRequest('GET', `/accounts/${accountId}/ledger`, {}, true)
  }

  /**
   * Get all orders (with optional filters)
   */
  public async getAllOrders(productId?: string, status?: string): Promise<any> {
    const params: Record<string, any> = {}
    if (productId) params.product_id = productId
    if (status) params.status = status
    
    return await this.makeRequest('GET', '/orders', params, true)
  }

  /**
   * Get fills (trade history)
   */
  public async getFills(productId?: string, orderId?: string): Promise<any> {
    const params: Record<string, any> = {}
    if (productId) params.product_id = productId
    if (orderId) params.order_id = orderId
    
    return await this.makeRequest('GET', '/fills', params, true)
  }

  /**
   * Cancel all orders
   */
  public async cancelAllOrders(productId?: string): Promise<any> {
    const params = productId ? { product_id: productId } : {}
    return await this.makeRequest('DELETE', '/orders', params, true)
  }
}

export default CoinbaseExchange