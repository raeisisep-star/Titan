/**
 * TITAN Trading System - Binance Exchange Integration
 * Real Binance API implementation with authentication
 */

import { BaseExchange, type ExchangeCredentials, type ExchangeEndpoints, type ExchangeLimits } from './base-exchange'
import type { MarketData, OrderBook, TradeOrder, OrderResponse, Balance } from '../services/exchange-service'
import { ExchangeAuth, CryptoHelper } from '../utils/crypto-helpers'

export class BinanceExchange extends BaseExchange {
  constructor(credentials: ExchangeCredentials) {
    const endpoints: ExchangeEndpoints = {
      baseUrl: 'https://api.binance.com',
      sandboxUrl: 'https://testnet.binance.vision',
      ticker: '/api/v3/ticker/24hr',
      orderBook: '/api/v3/depth',
      trades: '/api/v3/myTrades',
      balance: '/api/v3/account',
      placeOrder: '/api/v3/order',
      cancelOrder: '/api/v3/order',
      orderStatus: '/api/v3/order',
      serverTime: '/api/v3/time',
      exchangeInfo: '/api/v3/exchangeInfo'
    }

    const limits: ExchangeLimits = {
      requestsPerMinute: 1200, // 1200 requests per minute
      ordersPerSecond: 10,     // 10 orders per second
      weightPerMinute: 12000   // 12000 weight per minute
    }

    super('Binance', credentials, endpoints, limits)
  }

  /**
   * Create authenticated headers for Binance API
   */
  async createAuthHeaders(method: string, endpoint: string, body?: string): Promise<Headers> {
    const timestamp = CryptoHelper.timestamp()
    const params = new URLSearchParams()
    params.append('timestamp', timestamp.toString())

    // Add recvWindow for better reliability
    params.append('recvWindow', '5000')

    // For POST requests, add body parameters to query string for signature
    if (body && method !== 'GET') {
      const bodyParams = JSON.parse(body)
      for (const [key, value] of Object.entries(bodyParams)) {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString())
        }
      }
    }

    // Create signature
    const queryString = params.toString()
    const signature = await ExchangeAuth.createBinanceSignature(queryString, this.credentials.apiSecret)
    params.append('signature', signature)

    const headers = CryptoHelper.createHeaders({
      'X-MBX-APIKEY': this.credentials.apiKey
    })

    // For GET requests, modify the endpoint with signed parameters
    if (method === 'GET') {
      // This will be handled by the makeRequest method
    }

    return headers
  }

  /**
   * Override makeRequest to handle Binance-specific query string signing
   */
  protected async makeRequest<T>(
    method: string,
    endpoint: string,
    params: Record<string, any> = {},
    requiresAuth: boolean = false
  ) {
    if (requiresAuth) {
      // For Binance, we need to add timestamp and signature to query string
      const timestamp = CryptoHelper.timestamp()
      const allParams = {
        ...params,
        timestamp,
        recvWindow: 5000
      }

      // Create query string
      const queryString = CryptoHelper.encodeParams(allParams)
      
      // Create signature
      const signature = await ExchangeAuth.createBinanceSignature(queryString, this.credentials.apiSecret)
      const signedQueryString = `${queryString}&signature=${signature}`

      // Check rate limiting
      if (!this.rateLimiter.canMakeRequest()) {
        const waitTime = this.rateLimiter.getWaitTimeMs()
        return {
          success: false,
          error: `Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`,
          retryAfter: waitTime
        }
      }

      try {
        const baseUrl = this.getBaseUrl()
        const url = `${baseUrl}${endpoint}?${signedQueryString}`

        const headers = CryptoHelper.createHeaders({
          'X-MBX-APIKEY': this.credentials.apiKey
        })

        const response = await CryptoHelper.withRetry(async () => {
          return await fetch(url, {
            method,
            headers,
            body: method !== 'GET' && method !== 'DELETE' ? JSON.stringify(params) : undefined
          })
        }, 3, 1000)

        const responseText = await response.text()
        const data = CryptoHelper.safeJsonParse<T>(responseText)

        if (!response.ok) {
          return {
            success: false,
            error: `HTTP ${response.status}: ${data?.msg || data?.message || responseText}`,
            rateLimitRemaining: this.parseRateLimit(response)
          }
        }

        return {
          success: true,
          data,
          rateLimitUsed: this.parseRateLimitUsed(response),
          rateLimitRemaining: this.parseRateLimit(response)
        }

      } catch (error) {
        return {
          success: false,
          error: `Network error: ${error.message}`
        }
      }
    }

    // For non-authenticated requests, use base implementation
    return super.makeRequest(method, endpoint, params, requiresAuth)
  }

  /**
   * Transform symbol to Binance format (BTCUSDT)
   */
  transformSymbol(symbol: string): string {
    // Remove any separators and convert to uppercase
    return symbol.replace(/[-_\/]/g, '').toUpperCase()
  }

  /**
   * Parse Binance market data response
   */
  parseMarketData(data: any): MarketData {
    // Handle both single ticker and array response
    const ticker = Array.isArray(data) ? data[0] : data

    return {
      symbol: ticker.symbol,
      price: parseFloat(ticker.lastPrice || ticker.price),
      volume24h: parseFloat(ticker.volume),
      change24h: parseFloat(ticker.priceChange),
      changePercent24h: parseFloat(ticker.priceChangePercent),
      high24h: parseFloat(ticker.highPrice),
      low24h: parseFloat(ticker.lowPrice),
      timestamp: new Date().toISOString(),
      exchange: 'binance'
    }
  }

  /**
   * Parse Binance order book response
   */
  parseOrderBook(data: any): OrderBook {
    return {
      symbol: data.symbol || 'UNKNOWN',
      bids: data.bids.map((bid: string[]) => [parseFloat(bid[0]), parseFloat(bid[1])]),
      asks: data.asks.map((ask: string[]) => [parseFloat(ask[0]), parseFloat(ask[1])]),
      timestamp: new Date().toISOString(),
      exchange: 'binance'
    }
  }

  /**
   * Parse Binance balance response
   */
  parseBalance(data: any): Balance[] {
    // Binance returns account info with balances array
    const balances = data.balances || data

    return balances
      .filter((balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
      .map((balance: any) => ({
        asset: balance.asset,
        free: parseFloat(balance.free),
        locked: parseFloat(balance.locked),
        total: parseFloat(balance.free) + parseFloat(balance.locked)
      }))
  }

  /**
   * Parse Binance order response
   */
  parseOrderResponse(data: any): OrderResponse {
    // Map Binance status to our standard status
    const statusMap: Record<string, OrderResponse['status']> = {
      'NEW': 'new',
      'PARTIALLY_FILLED': 'partially_filled',
      'FILLED': 'filled',
      'CANCELED': 'canceled',
      'REJECTED': 'rejected',
      'EXPIRED': 'canceled'
    }

    return {
      orderId: data.orderId?.toString() || data.clientOrderId,
      symbol: data.symbol,
      side: data.side.toLowerCase() as 'buy' | 'sell',
      status: statusMap[data.status] || 'new',
      quantity: parseFloat(data.origQty || data.quantity),
      executedQuantity: parseFloat(data.executedQty || 0),
      price: parseFloat(data.price || 0),
      averagePrice: data.avgPrice ? parseFloat(data.avgPrice) : undefined,
      timestamp: new Date(data.time || data.transactTime || Date.now()).toISOString(),
      exchange: 'binance'
    }
  }

  /**
   * Prepare order parameters in Binance format
   */
  protected prepareOrderParams(order: TradeOrder): Record<string, any> {
    const params: Record<string, any> = {
      symbol: order.symbol,
      side: order.side.toUpperCase(),
      type: this.mapOrderType(order.type),
      quantity: order.quantity.toString()
    }

    // Add price for limit orders
    if (order.type === 'limit' && order.price) {
      params.price = order.price.toString()
    }

    // Add stop price for stop orders
    if ((order.type === 'stop_loss' || order.type === 'take_profit') && order.stopPrice) {
      params.stopPrice = order.stopPrice.toString()
    }

    // Add time in force
    if (order.timeInForce) {
      params.timeInForce = order.timeInForce
    } else if (order.type === 'limit') {
      params.timeInForce = 'GTC' // Default to Good Till Canceled for limit orders
    }

    return params
  }

  /**
   * Map our order types to Binance order types
   */
  private mapOrderType(type: string): string {
    const typeMap: Record<string, string> = {
      'market': 'MARKET',
      'limit': 'LIMIT',
      'stop_loss': 'STOP_LOSS_LIMIT',
      'take_profit': 'TAKE_PROFIT_LIMIT'
    }
    return typeMap[type] || 'MARKET'
  }

  /**
   * Parse rate limit from Binance response headers
   */
  protected parseRateLimit(response: Response): number | undefined {
    const remaining = response.headers.get('x-mbx-used-weight-1m')
    return remaining ? parseInt(remaining) : undefined
  }

  protected parseRateLimitUsed(response: Response): number | undefined {
    const used = response.headers.get('x-mbx-used-weight-1m')
    return used ? parseInt(used) : undefined
  }

  /**
   * Get Binance server time
   */
  public async getServerTime(): Promise<number> {
    const result = await this.makeRequest<{ serverTime: number }>('GET', '/api/v3/time')
    return result.success ? result.data!.serverTime : Date.now()
  }

  /**
   * Get exchange information
   */
  public async getExchangeInfo(): Promise<any> {
    const result = await this.makeRequest('GET', '/api/v3/exchangeInfo')
    return result
  }

  /**
   * Get 24hr ticker statistics
   */
  public async get24hrStats(symbol?: string): Promise<any> {
    const endpoint = symbol 
      ? `/api/v3/ticker/24hr?symbol=${this.transformSymbol(symbol)}`
      : '/api/v3/ticker/24hr'
    
    return await this.makeRequest('GET', endpoint)
  }

  /**
   * Get recent trades
   */
  public async getRecentTrades(symbol: string, limit: number = 500): Promise<any> {
    const transformedSymbol = this.transformSymbol(symbol)
    const endpoint = `/api/v3/trades?symbol=${transformedSymbol}&limit=${limit}`
    
    return await this.makeRequest('GET', endpoint)
  }

  /**
   * Get account trade history
   */
  public async getTradeHistory(symbol: string, limit: number = 500): Promise<any> {
    const transformedSymbol = this.transformSymbol(symbol)
    const endpoint = `/api/v3/myTrades?symbol=${transformedSymbol}&limit=${limit}`
    
    return await this.makeRequest('GET', endpoint, {}, true)
  }

  /**
   * Get all open orders
   */
  public async getOpenOrders(symbol?: string): Promise<any> {
    const params: Record<string, any> = {}
    if (symbol) {
      params.symbol = this.transformSymbol(symbol)
    }
    
    return await this.makeRequest('GET', '/api/v3/openOrders', params, true)
  }

  /**
   * Cancel all open orders for a symbol
   */
  public async cancelAllOrders(symbol: string): Promise<any> {
    const transformedSymbol = this.transformSymbol(symbol)
    return await this.makeRequest('DELETE', '/api/v3/openOrders', { symbol: transformedSymbol }, true)
  }
}

export default BinanceExchange