/**
 * TITAN Trading System - Base Exchange Interface
 * Abstract base class for all exchange implementations
 */

import type { MarketData, OrderBook, TradeOrder, OrderResponse, Balance } from '../services/exchange-service'
import { CryptoHelper } from '../utils/crypto-helpers'

export interface ExchangeCredentials {
  apiKey: string
  apiSecret: string
  passphrase?: string
  sandbox?: boolean
}

export interface ExchangeEndpoints {
  baseUrl: string
  sandboxUrl?: string
  ticker: string
  orderBook: string
  trades: string
  balance: string
  placeOrder: string
  cancelOrder: string
  orderStatus: string
  serverTime?: string
  exchangeInfo?: string
}

export interface ExchangeLimits {
  requestsPerMinute: number
  ordersPerSecond?: number
  weightPerMinute?: number
}

export interface ExchangeStatus {
  connected: boolean
  authenticated: boolean
  lastPing?: number
  serverTime?: number
  rateLimitRemaining?: number
  error?: string
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  rateLimitUsed?: number
  rateLimitRemaining?: number
  retryAfter?: number
}

export abstract class BaseExchange {
  protected name: string
  protected credentials: ExchangeCredentials
  protected endpoints: ExchangeEndpoints
  protected limits: ExchangeLimits
  protected rateLimiter: ReturnType<typeof CryptoHelper.createRateLimiter>
  protected status: ExchangeStatus = {
    connected: false,
    authenticated: false
  }

  constructor(
    name: string,
    credentials: ExchangeCredentials,
    endpoints: ExchangeEndpoints,
    limits: ExchangeLimits
  ) {
    this.name = name
    this.credentials = credentials
    this.endpoints = endpoints
    this.limits = limits
    this.rateLimiter = CryptoHelper.createRateLimiter(limits.requestsPerMinute)
  }

  // Abstract methods that must be implemented by each exchange
  abstract createAuthHeaders(method: string, endpoint: string, body?: string): Promise<Headers>
  abstract transformSymbol(symbol: string): string
  abstract parseMarketData(data: any): MarketData
  abstract parseOrderBook(data: any): OrderBook
  abstract parseBalance(data: any): Balance[]
  abstract parseOrderResponse(data: any): OrderResponse

  /**
   * Get base URL (sandbox or production)
   */
  protected getBaseUrl(): string {
    return this.credentials.sandbox && this.endpoints.sandboxUrl 
      ? this.endpoints.sandboxUrl 
      : this.endpoints.baseUrl
  }

  /**
   * Make authenticated API request
   */
  protected async makeRequest<T>(
    method: string,
    endpoint: string,
    params: Record<string, any> = {},
    requiresAuth: boolean = false
  ): Promise<ApiResponse<T>> {
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
      let url = `${baseUrl}${endpoint}`
      let body = ''

      // Prepare request based on method
      if (method === 'GET') {
        if (Object.keys(params).length > 0) {
          const queryString = CryptoHelper.encodeParams(params)
          url += `?${queryString}`
        }
      } else {
        body = JSON.stringify(params)
      }

      // Create headers
      let headers = CryptoHelper.createHeaders()
      
      if (requiresAuth) {
        if (!this.credentials.apiKey || !this.credentials.apiSecret) {
          return {
            success: false,
            error: `API credentials not configured for ${this.name}`
          }
        }
        
        headers = await this.createAuthHeaders(method, endpoint, body)
      }

      // Make request with retry logic
      const response = await CryptoHelper.withRetry(async () => {
        return await fetch(url, {
          method,
          headers,
          body: method !== 'GET' ? body : undefined
        })
      }, 3, 1000)

      // Parse response
      const responseText = await response.text()
      const data = CryptoHelper.safeJsonParse<T>(responseText)

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP ${response.status}: ${data?.message || data?.msg || responseText}`,
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

  /**
   * Parse rate limit information from response headers
   */
  protected parseRateLimit(response: Response): number | undefined {
    // Each exchange has different headers, implement in subclasses
    return undefined
  }

  protected parseRateLimitUsed(response: Response): number | undefined {
    // Each exchange has different headers, implement in subclasses
    return undefined
  }

  /**
   * Test connection to exchange
   */
  public async testConnection(): Promise<ExchangeStatus> {
    try {
      // Try to get server time or exchange info (public endpoint)
      const endpoint = this.endpoints.serverTime || this.endpoints.exchangeInfo || this.endpoints.ticker
      const testEndpoint = endpoint.includes('{symbol}') 
        ? endpoint.replace('{symbol}', 'BTCUSDT') 
        : endpoint

      const result = await this.makeRequest('GET', testEndpoint)
      
      if (result.success) {
        this.status = {
          connected: true,
          authenticated: false,
          lastPing: Date.now(),
          rateLimitRemaining: result.rateLimitRemaining
        }
      } else {
        this.status = {
          connected: false,
          authenticated: false,
          error: result.error
        }
      }

      return this.status
    } catch (error) {
      this.status = {
        connected: false,
        authenticated: false,
        error: error.message
      }
      return this.status
    }
  }

  /**
   * Test authentication
   */
  public async testAuth(): Promise<ExchangeStatus> {
    try {
      // Try to get account info or balances
      const result = await this.getBalances()
      
      if (result.success) {
        this.status = {
          connected: true,
          authenticated: true,
          lastPing: Date.now(),
          rateLimitRemaining: result.rateLimitRemaining
        }
      } else {
        this.status = {
          connected: this.status.connected,
          authenticated: false,
          error: result.error
        }
      }

      return this.status
    } catch (error) {
      this.status = {
        connected: this.status.connected,
        authenticated: false,
        error: error.message
      }
      return this.status
    }
  }

  /**
   * Get market data for a symbol
   */
  public async getMarketData(symbol: string): Promise<ApiResponse<MarketData>> {
    const transformedSymbol = this.transformSymbol(symbol)
    const endpoint = this.endpoints.ticker.replace('{symbol}', transformedSymbol)
    
    const result = await this.makeRequest<any>('GET', endpoint)
    
    if (result.success && result.data) {
      try {
        const marketData = this.parseMarketData(result.data)
        marketData.exchange = this.name.toLowerCase()
        return {
          success: true,
          data: marketData,
          rateLimitUsed: result.rateLimitUsed,
          rateLimitRemaining: result.rateLimitRemaining
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to parse market data: ${error.message}`
        }
      }
    }
    
    return result
  }

  /**
   * Get order book for a symbol
   */
  public async getOrderBook(symbol: string, limit: number = 20): Promise<ApiResponse<OrderBook>> {
    const transformedSymbol = this.transformSymbol(symbol)
    const endpoint = this.endpoints.orderBook.replace('{symbol}', transformedSymbol)
    const params = limit > 0 ? { limit } : {}
    
    const result = await this.makeRequest<any>('GET', endpoint, params)
    
    if (result.success && result.data) {
      try {
        const orderBook = this.parseOrderBook(result.data)
        orderBook.exchange = this.name.toLowerCase()
        return {
          success: true,
          data: orderBook,
          rateLimitUsed: result.rateLimitUsed,
          rateLimitRemaining: result.rateLimitRemaining
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to parse order book: ${error.message}`
        }
      }
    }
    
    return result
  }

  /**
   * Get account balances
   */
  public async getBalances(): Promise<ApiResponse<Balance[]>> {
    const result = await this.makeRequest<any>('GET', this.endpoints.balance, {}, true)
    
    if (result.success && result.data) {
      try {
        const balances = this.parseBalance(result.data)
        return {
          success: true,
          data: balances,
          rateLimitUsed: result.rateLimitUsed,
          rateLimitRemaining: result.rateLimitRemaining
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to parse balances: ${error.message}`
        }
      }
    }
    
    return result
  }

  /**
   * Place an order
   */
  public async placeOrder(order: TradeOrder): Promise<ApiResponse<OrderResponse>> {
    const transformedSymbol = this.transformSymbol(order.symbol)
    const orderParams = this.prepareOrderParams({
      ...order,
      symbol: transformedSymbol
    })
    
    const result = await this.makeRequest<any>('POST', this.endpoints.placeOrder, orderParams, true)
    
    if (result.success && result.data) {
      try {
        const orderResponse = this.parseOrderResponse(result.data)
        orderResponse.exchange = this.name.toLowerCase()
        return {
          success: true,
          data: orderResponse,
          rateLimitUsed: result.rateLimitUsed,
          rateLimitRemaining: result.rateLimitRemaining
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to parse order response: ${error.message}`
        }
      }
    }
    
    return result
  }

  /**
   * Cancel an order
   */
  public async cancelOrder(orderId: string, symbol: string): Promise<ApiResponse<boolean>> {
    const transformedSymbol = this.transformSymbol(symbol)
    const endpoint = this.endpoints.cancelOrder
      .replace('{orderId}', orderId)
      .replace('{id}', orderId)
      .replace('{symbol}', transformedSymbol)
    
    const params: Record<string, any> = {}
    
    // Some exchanges require symbol in body for cancellation
    if (!endpoint.includes(transformedSymbol)) {
      params.symbol = transformedSymbol
    }
    
    const result = await this.makeRequest<any>('DELETE', endpoint, params, true)
    
    return {
      success: result.success,
      data: result.success,
      error: result.error,
      rateLimitUsed: result.rateLimitUsed,
      rateLimitRemaining: result.rateLimitRemaining
    }
  }

  /**
   * Get order status
   */
  public async getOrderStatus(orderId: string, symbol: string): Promise<ApiResponse<OrderResponse>> {
    const transformedSymbol = this.transformSymbol(symbol)
    const endpoint = this.endpoints.orderStatus
      .replace('{orderId}', orderId)
      .replace('{id}', orderId)
      .replace('{symbol}', transformedSymbol)
    
    const params: Record<string, any> = {}
    
    // Some exchanges require symbol in query for order status
    if (!endpoint.includes(transformedSymbol)) {
      params.symbol = transformedSymbol
    }
    
    const result = await this.makeRequest<any>('GET', endpoint, params, true)
    
    if (result.success && result.data) {
      try {
        const orderResponse = this.parseOrderResponse(result.data)
        orderResponse.exchange = this.name.toLowerCase()
        return {
          success: true,
          data: orderResponse,
          rateLimitUsed: result.rateLimitUsed,
          rateLimitRemaining: result.rateLimitRemaining
        }
      } catch (error) {
        return {
          success: false,
          error: `Failed to parse order status: ${error.message}`
        }
      }
    }
    
    return result
  }

  /**
   * Prepare order parameters (exchange-specific formatting)
   */
  protected prepareOrderParams(order: TradeOrder): Record<string, any> {
    // Base implementation, override in exchange-specific classes
    return {
      symbol: order.symbol,
      side: order.side.toUpperCase(),
      type: order.type.toUpperCase(),
      quantity: order.quantity,
      ...(order.price && { price: order.price }),
      ...(order.stopPrice && { stopPrice: order.stopPrice }),
      ...(order.timeInForce && { timeInForce: order.timeInForce })
    }
  }

  /**
   * Get exchange status
   */
  public getStatus(): ExchangeStatus {
    return { ...this.status }
  }

  /**
   * Get exchange name
   */
  public getName(): string {
    return this.name
  }

  /**
   * Get rate limiter status
   */
  public getRateLimitStatus() {
    return {
      remaining: this.rateLimiter.getRemainingRequests(),
      waitTime: this.rateLimiter.getWaitTimeMs()
    }
  }

  /**
   * Validate credentials
   */
  public validateCredentials(): boolean {
    return CryptoHelper.validateApiKey(this.credentials.apiKey, this.name) &&
           CryptoHelper.validateApiSecret(this.credentials.apiSecret, this.name)
  }
}

export default BaseExchange