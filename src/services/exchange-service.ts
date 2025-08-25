// TITAN Exchange Service - Multiple Exchange Integration
import type { Env } from '../types/cloudflare'

export interface ExchangeConfig {
  name: string
  apiKey?: string
  apiSecret?: string
  sandbox?: boolean
  rateLimit?: number // requests per minute
  endpoints: {
    baseUrl: string
    ticker: string
    orderBook: string
    trades: string
    balance: string
    placeOrder: string
    cancelOrder: string
    orderStatus: string
  }
}

export interface MarketData {
  symbol: string
  price: number
  volume24h: number
  change24h: number
  changePercent24h: number
  high24h: number
  low24h: number
  timestamp: string
  exchange: string
}

export interface OrderBook {
  symbol: string
  bids: [number, number][] // [price, quantity]
  asks: [number, number][]
  timestamp: string
  exchange: string
}

export interface TradeOrder {
  id?: string
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop_loss' | 'take_profit'
  quantity: number
  price?: number
  stopPrice?: number
  timeInForce?: 'GTC' | 'IOC' | 'FOK'
  exchange: string
}

export interface OrderResponse {
  orderId: string
  symbol: string
  side: 'buy' | 'sell'
  status: 'new' | 'partially_filled' | 'filled' | 'canceled' | 'rejected'
  quantity: number
  executedQuantity: number
  price: number
  averagePrice?: number
  timestamp: string
  exchange: string
}

export interface Balance {
  asset: string
  free: number
  locked: number
  total: number
  usdValue?: number
}

export class ExchangeService {
  private env: Env
  private exchanges: Map<string, ExchangeConfig> = new Map()
  private rateLimiter: Map<string, number[]> = new Map()

  constructor(env: Env) {
    this.env = env
    this.initializeExchanges()
  }

  private initializeExchanges() {
    // Binance Configuration
    const binanceTestnet = this.env.BINANCE_TESTNET === 'true'
    this.exchanges.set('binance', {
      name: 'Binance',
      apiKey: this.env.BINANCE_API_KEY,
      apiSecret: this.env.BINANCE_API_SECRET,
      sandbox: binanceTestnet,
      rateLimit: 1200, // requests per minute
      endpoints: {
        baseUrl: binanceTestnet ? 'https://testnet.binance.vision' : 'https://api.binance.com',
        ticker: '/api/v3/ticker/24hr',
        orderBook: '/api/v3/depth',
        trades: '/api/v3/myTrades',
        balance: '/api/v3/account',
        placeOrder: '/api/v3/order',
        cancelOrder: '/api/v3/order',
        orderStatus: '/api/v3/order'
      }
    })

    // Coinbase Pro Configuration
    const coinbaseSandbox = this.env.COINBASE_SANDBOX === 'true'
    this.exchanges.set('coinbase', {
      name: 'Coinbase Pro',
      apiKey: this.env.COINBASE_API_KEY,
      apiSecret: this.env.COINBASE_API_SECRET,
      sandbox: coinbaseSandbox,
      rateLimit: 10, // requests per second
      endpoints: {
        baseUrl: coinbaseSandbox ? 'https://api-public.sandbox.pro.coinbase.com' : 'https://api.pro.coinbase.com',
        ticker: '/products/{symbol}/ticker',
        orderBook: '/products/{symbol}/book',
        trades: '/fills',
        balance: '/accounts',
        placeOrder: '/orders',
        cancelOrder: '/orders/{id}',
        orderStatus: '/orders/{id}'
      }
    })

    // KuCoin Configuration
    const kucoinSandbox = this.env.KUCOIN_SANDBOX === 'true'
    this.exchanges.set('kucoin', {
      name: 'KuCoin',
      apiKey: this.env.KUCOIN_API_KEY,
      apiSecret: this.env.KUCOIN_API_SECRET,
      sandbox: kucoinSandbox,
      rateLimit: 600,
      endpoints: {
        baseUrl: kucoinSandbox ? 'https://openapi-sandbox.kucoin.com' : 'https://api.kucoin.com',
        ticker: '/api/v1/market/stats',
        orderBook: '/api/v1/market/orderbook/level2_20',
        trades: '/api/v1/fills',
        balance: '/api/v1/accounts',
        placeOrder: '/api/v1/orders',
        cancelOrder: '/api/v1/orders/{orderId}',
        orderStatus: '/api/v1/orders/{orderId}'
      }
    })

    // Mock Exchange for Testing
    this.exchanges.set('mock', {
      name: 'Mock Exchange',
      sandbox: true,
      rateLimit: 1000,
      endpoints: {
        baseUrl: 'https://mock-exchange.titan.com',
        ticker: '/ticker',
        orderBook: '/orderbook',
        trades: '/trades',
        balance: '/balance',
        placeOrder: '/order',
        cancelOrder: '/order/cancel',
        orderStatus: '/order/status'
      }
    })
  }

  // Rate limiting check
  private checkRateLimit(exchange: string): boolean {
    const config = this.exchanges.get(exchange)
    if (!config) return false

    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const limit = config.rateLimit || 100

    if (!this.rateLimiter.has(exchange)) {
      this.rateLimiter.set(exchange, [])
    }

    const requests = this.rateLimiter.get(exchange)!
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < windowMs)
    
    if (validRequests.length >= limit) {
      return false
    }

    validRequests.push(now)
    this.rateLimiter.set(exchange, validRequests)
    return true
  }

  // Get market data from exchange
  public async getMarketData(symbol: string, exchange = 'mock'): Promise<MarketData> {
    if (!this.checkRateLimit(exchange)) {
      throw new Error(`Rate limit exceeded for ${exchange}`)
    }

    if (exchange === 'mock') {
      return this.getMockMarketData(symbol)
    }

    const config = this.exchanges.get(exchange)
    if (!config) {
      throw new Error(`Exchange ${exchange} not configured`)
    }

    try {
      // For production, implement actual API calls to exchanges
      // For now, return mock data with real-looking structure
      return this.getMockMarketData(symbol, exchange)
    } catch (error) {
      console.error(`Error fetching market data from ${exchange}:`, error)
      // Fallback to mock data
      return this.getMockMarketData(symbol, exchange)
    }
  }

  // Get order book
  public async getOrderBook(symbol: string, exchange = 'mock'): Promise<OrderBook> {
    if (!this.checkRateLimit(exchange)) {
      throw new Error(`Rate limit exceeded for ${exchange}`)
    }

    if (exchange === 'mock') {
      return this.getMockOrderBook(symbol)
    }

    // Implement actual exchange API calls here
    return this.getMockOrderBook(symbol, exchange)
  }

  // Place order
  public async placeOrder(order: TradeOrder): Promise<OrderResponse> {
    const exchange = order.exchange
    
    if (!this.checkRateLimit(exchange)) {
      throw new Error(`Rate limit exceeded for ${exchange}`)
    }

    if (exchange === 'mock') {
      return this.placeMockOrder(order)
    }

    const config = this.exchanges.get(exchange)
    if (!config) {
      throw new Error(`Exchange ${exchange} not configured`)
    }

    // For production, implement actual order placement
    // For now, simulate order placement
    return this.placeMockOrder(order)
  }

  // Cancel order
  public async cancelOrder(orderId: string, symbol: string, exchange = 'mock'): Promise<boolean> {
    if (!this.checkRateLimit(exchange)) {
      throw new Error(`Rate limit exceeded for ${exchange}`)
    }

    if (exchange === 'mock') {
      return true // Mock always succeeds
    }

    // Implement actual order cancellation
    return true
  }

  // Get order status
  public async getOrderStatus(orderId: string, symbol: string, exchange = 'mock'): Promise<OrderResponse> {
    if (!this.checkRateLimit(exchange)) {
      throw new Error(`Rate limit exceeded for ${exchange}`)
    }

    // Implement actual order status check
    return {
      orderId,
      symbol,
      side: 'buy',
      status: 'filled',
      quantity: 1,
      executedQuantity: 1,
      price: 43200,
      averagePrice: 43200,
      timestamp: new Date().toISOString(),
      exchange
    }
  }

  // Get account balances
  public async getBalances(exchange = 'mock'): Promise<Balance[]> {
    if (!this.checkRateLimit(exchange)) {
      throw new Error(`Rate limit exceeded for ${exchange}`)
    }

    if (exchange === 'mock') {
      return this.getMockBalances()
    }

    const config = this.exchanges.get(exchange)
    if (!config || !config.apiKey || !config.apiSecret) {
      throw new Error(`Exchange ${exchange} not properly configured with API credentials`)
    }

    try {
      // For production, implement actual API calls
      console.log(`Fetching balances from ${exchange} (${config.sandbox ? 'testnet' : 'production'})`)
      return this.getMockBalances()
    } catch (error) {
      console.error(`Error fetching balances from ${exchange}:`, error)
      return this.getMockBalances()
    }
  }

  // Test connection to exchange
  public async testConnection(exchange: string): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const config = this.exchanges.get(exchange)
      if (!config) {
        return { success: false, message: `Exchange ${exchange} not configured` }
      }

      if (exchange === 'mock') {
        return { 
          success: true, 
          message: 'Mock exchange connection successful',
          data: { exchange: 'mock', sandbox: true, status: 'connected' }
        }
      }

      if (!config.apiKey || !config.apiSecret) {
        return { 
          success: false, 
          message: `API credentials not configured for ${exchange}` 
        }
      }

      // Test with a simple endpoint that doesn't require authentication
      const testUrl = `${config.endpoints.baseUrl}${config.endpoints.ticker}?symbol=BTCUSDT`
      const response = await fetch(testUrl)
      
      if (response.ok) {
        return {
          success: true,
          message: `Connection to ${exchange} successful (${config.sandbox ? 'testnet' : 'production'})`,
          data: {
            exchange,
            sandbox: config.sandbox,
            status: 'connected',
            hasApiKey: !!config.apiKey,
            hasApiSecret: !!config.apiSecret
          }
        }
      } else {
        return {
          success: false,
          message: `Connection failed: ${response.status} ${response.statusText}`
        }
      }

    } catch (error) {
      return {
        success: false,
        message: `Connection error: ${error.message}`
      }
    }
  }

  // Get exchange configuration status
  public getExchangeStatus(): { [key: string]: any } {
    const status: { [key: string]: any } = {}
    
    for (const [name, config] of this.exchanges) {
      status[name] = {
        name: config.name,
        configured: !!config.apiKey && !!config.apiSecret,
        sandbox: config.sandbox,
        rateLimit: config.rateLimit,
        hasApiKey: !!config.apiKey,
        hasApiSecret: !!config.apiSecret,
        baseUrl: config.endpoints.baseUrl
      }
    }

    return status
  }

  // Create authenticated headers for Binance
  private createBinanceHeaders(endpoint: string, params: any = {}): Headers {
    const config = this.exchanges.get('binance')
    if (!config?.apiKey || !config?.apiSecret) {
      throw new Error('Binance API credentials not configured')
    }

    const timestamp = Date.now()
    const queryString = new URLSearchParams({ ...params, timestamp: timestamp.toString() }).toString()
    
    // Create signature using HMAC SHA256
    const signature = this.hmacSha256(queryString, config.apiSecret)
    
    const headers = new Headers()
    headers.set('X-MBX-APIKEY', config.apiKey)
    headers.set('Content-Type', 'application/json')
    
    return headers
  }

  // Create authenticated headers for Coinbase Pro
  private createCoinbaseHeaders(method: string, requestPath: string, body: string = ''): Headers {
    const config = this.exchanges.get('coinbase')
    if (!config?.apiKey || !config?.apiSecret) {
      throw new Error('Coinbase API credentials not configured')
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const message = timestamp + method + requestPath + body
    const signature = this.hmacSha256(message, Buffer.from(config.apiSecret, 'base64'))
    
    const headers = new Headers()
    headers.set('CB-ACCESS-KEY', config.apiKey)
    headers.set('CB-ACCESS-SIGN', signature)
    headers.set('CB-ACCESS-TIMESTAMP', timestamp.toString())
    headers.set('CB-ACCESS-PASSPHRASE', this.env.COINBASE_PASSPHRASE || '')
    headers.set('Content-Type', 'application/json')
    
    return headers
  }

  // Create authenticated headers for KuCoin
  private createKuCoinHeaders(method: string, endpoint: string, body: string = ''): Headers {
    const config = this.exchanges.get('kucoin')
    if (!config?.apiKey || !config?.apiSecret) {
      throw new Error('KuCoin API credentials not configured')
    }

    const timestamp = Date.now()
    const str_to_sign = timestamp + method + endpoint + body
    const signature = this.hmacSha256(str_to_sign, config.apiSecret)
    const passphrase = this.hmacSha256(this.env.KUCOIN_PASSPHRASE || '', config.apiSecret)
    
    const headers = new Headers()
    headers.set('KC-API-KEY', config.apiKey)
    headers.set('KC-API-SIGN', signature)
    headers.set('KC-API-TIMESTAMP', timestamp.toString())
    headers.set('KC-API-PASSPHRASE', passphrase)
    headers.set('KC-API-KEY-VERSION', '2')
    headers.set('Content-Type', 'application/json')
    
    return headers
  }

  // HMAC SHA256 helper function
  private hmacSha256(message: string, secret: string | Buffer): string {
    // Note: In a real implementation, you would use crypto.createHmac
    // For Cloudflare Workers, you might need to use the Web Crypto API
    // This is a placeholder - implement proper HMAC-SHA256
    const encoder = new TextEncoder()
    const keyBuffer = typeof secret === 'string' ? encoder.encode(secret) : secret
    const messageBuffer = encoder.encode(message)
    
    // Placeholder - implement actual HMAC-SHA256 using Web Crypto API
    return Buffer.from(messageBuffer).toString('base64')
  }

  // Get available exchanges
  public getAvailableExchanges(): string[] {
    return Array.from(this.exchanges.keys())
  }

  // Check exchange health
  public async checkExchangeHealth(exchange: string): Promise<boolean> {
    try {
      await this.getMarketData('BTCUSDT', exchange)
      return true
    } catch (error) {
      return false
    }
  }

  // Mock data generators for testing
  private getMockMarketData(symbol: string, exchange = 'mock'): MarketData {
    const basePrice = this.getBasePrice(symbol)
    const change = (Math.random() - 0.5) * 0.1 // ±5% change
    const price = basePrice * (1 + change)

    return {
      symbol,
      price: Math.round(price * 100) / 100,
      volume24h: Math.random() * 1000000000,
      change24h: change * basePrice,
      changePercent24h: change * 100,
      high24h: price * 1.05,
      low24h: price * 0.95,
      timestamp: new Date().toISOString(),
      exchange
    }
  }

  private getMockOrderBook(symbol: string, exchange = 'mock'): OrderBook {
    const price = this.getBasePrice(symbol)
    const spread = price * 0.001 // 0.1% spread

    const bids: [number, number][] = []
    const asks: [number, number][] = []

    for (let i = 0; i < 10; i++) {
      bids.push([price - spread - (i * spread * 0.1), Math.random() * 100])
      asks.push([price + spread + (i * spread * 0.1), Math.random() * 100])
    }

    return {
      symbol,
      bids: bids.sort((a, b) => b[0] - a[0]), // Highest bid first
      asks: asks.sort((a, b) => a[0] - b[0]), // Lowest ask first
      timestamp: new Date().toISOString(),
      exchange
    }
  }

  private placeMockOrder(order: TradeOrder): OrderResponse {
    const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
    const executionDelay = Math.random() * 2 // 0-2 seconds

    return {
      orderId,
      symbol: order.symbol,
      side: order.side,
      status: Math.random() > 0.1 ? 'filled' : 'partially_filled', // 90% fill rate
      quantity: order.quantity,
      executedQuantity: order.quantity * (0.8 + Math.random() * 0.2), // 80-100% execution
      price: order.price || this.getBasePrice(order.symbol),
      averagePrice: order.price || this.getBasePrice(order.symbol),
      timestamp: new Date(Date.now() + executionDelay * 1000).toISOString(),
      exchange: order.exchange
    }
  }

  private getMockBalances(): Balance[] {
    const assets = ['BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'ADA', 'DOT', 'MATIC']
    return assets.map(asset => ({
      asset,
      free: Math.random() * 100,
      locked: Math.random() * 10,
      total: 0,
      usdValue: Math.random() * 10000
    })).map(balance => ({
      ...balance,
      total: balance.free + balance.locked
    }))
  }

  private getBasePrice(symbol: string): number {
    const prices: { [key: string]: number } = {
      'BTCUSDT': 43200,
      'ETHUSDT': 2820,
      'SOLUSDT': 156.43,
      'ADAUSDT': 0.45,
      'BNBUSDT': 600,
      'DOTUSDT': 8.45,
      'MATICUSDT': 0.89,
      'LINKUSDT': 15.67,
      'AVAXUSDT': 42.18,
      'UNIUSDT': 8.92
    }
    return prices[symbol.toUpperCase()] || 100
  }

  // Portfolio value calculation
  public async calculatePortfolioValue(exchange = 'mock'): Promise<number> {
    const balances = await this.getBalances(exchange)
    let totalValue = 0

    for (const balance of balances) {
      if (balance.usdValue) {
        totalValue += balance.usdValue
      } else {
        // Calculate USD value for non-USD assets
        try {
          const marketData = await this.getMarketData(`${balance.asset}USDT`, exchange)
          totalValue += balance.total * marketData.price
        } catch (error) {
          console.warn(`Could not get price for ${balance.asset}`)
        }
      }
    }

    return Math.round(totalValue * 100) / 100
  }
}

export default ExchangeService