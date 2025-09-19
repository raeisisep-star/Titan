/**
 * TITAN Trading System - MEXC Exchange API Integration
 * Real market data and account information
 */

interface MexcConfig {
  apiKey: string
  secretKey: string
  baseUrl: string
  testnet?: boolean
}

interface MarketTicker {
  symbol: string
  price: string
  priceChange: string
  priceChangePercent: string
  high24h: string
  low24h: string
  volume24h: string
  quoteVolume24h: string
}

interface AccountBalance {
  asset: string
  free: string
  locked: string
  total: string
}

interface Kline {
  openTime: number
  open: string
  high: string
  low: string
  close: string
  volume: string
  closeTime: number
  quoteVolume: string
  count: number
}

export class MexcApiClient {
  private config: MexcConfig
  
  constructor(config: MexcConfig) {
    this.config = {
      baseUrl: 'https://api.mexc.com',
      testnet: false,
      ...config
    }
  }

  // =============================================================================
  // AUTHENTICATION & SIGNATURE
  // =============================================================================

  private async createSignature(timestamp: number, params: string): Promise<string> {
    const message = `${timestamp}${params}`
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(this.config.secretKey),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}, method: string = 'GET'): Promise<any> {
    const timestamp = Date.now()
    const queryString = new URLSearchParams(params).toString()
    
    let url = `${this.config.baseUrl}${endpoint}`
    let body = ''
    
    if (method === 'GET' && queryString) {
      url += `?${queryString}`
    } else if (method === 'POST') {
      body = queryString
    }
    
    // Create signature for private endpoints
    let headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
    
    if (endpoint.includes('/account') || endpoint.includes('/order')) {
      const signature = await this.createSignature(timestamp, method === 'GET' ? queryString : body)
      headers['X-MEXC-APIKEY'] = this.config.apiKey
      headers['X-MEXC-TIMESTAMP'] = timestamp.toString()
      headers['X-MEXC-SIGNATURE'] = signature
    }
    
    const response = await fetch(url, {
      method,
      headers,
      body: method === 'POST' ? body : undefined
    })
    
    if (!response.ok) {
      const error = await response.text()
      throw new Error(`MEXC API Error: ${response.status} - ${error}`)
    }
    
    return response.json()
  }

  // =============================================================================
  // PUBLIC MARKET DATA
  // =============================================================================

  async getServerTime(): Promise<{ serverTime: number }> {
    return this.makeRequest('/api/v3/time')
  }

  async getExchangeInfo(): Promise<any> {
    return this.makeRequest('/api/v3/exchangeInfo')
  }

  async getTicker24h(symbol?: string): Promise<MarketTicker[]> {
    const params = symbol ? { symbol } : {}
    const result = await this.makeRequest('/api/v3/ticker/24hr', params)
    return Array.isArray(result) ? result : [result]
  }

  async getTickerPrice(symbol?: string): Promise<any> {
    const params = symbol ? { symbol } : {}
    return this.makeRequest('/api/v3/ticker/price', params)
  }

  async getOrderBook(symbol: string, limit: number = 100): Promise<any> {
    return this.makeRequest('/api/v3/depth', { symbol, limit })
  }

  async getKlines(symbol: string, interval: string = '1m', limit: number = 100): Promise<Kline[]> {
    const response = await this.makeRequest('/api/v3/klines', { symbol, interval, limit })
    
    return response.map((kline: any[]) => ({
      openTime: kline[0],
      open: kline[1],
      high: kline[2], 
      low: kline[3],
      close: kline[4],
      volume: kline[5],
      closeTime: kline[6],
      quoteVolume: kline[7],
      count: kline[8]
    }))
  }

  async getRecentTrades(symbol: string, limit: number = 100): Promise<any> {
    return this.makeRequest('/api/v3/trades', { symbol, limit })
  }

  // =============================================================================
  // ACCOUNT INFORMATION (PRIVATE)
  // =============================================================================

  async getAccountInfo(): Promise<any> {
    return this.makeRequest('/api/v3/account')
  }

  async getAccountBalances(): Promise<AccountBalance[]> {
    const account = await this.getAccountInfo()
    
    return account.balances
      .filter((balance: any) => parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0)
      .map((balance: any) => ({
        asset: balance.asset,
        free: balance.free,
        locked: balance.locked,
        total: (parseFloat(balance.free) + parseFloat(balance.locked)).toString()
      }))
  }

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  async getPopularSymbols(): Promise<string[]> {
    const tickers = await this.getTicker24h()
    
    // Sort by 24h volume and get top symbols
    return tickers
      .filter(ticker => ticker.symbol.endsWith('USDT'))
      .sort((a, b) => parseFloat(b.quoteVolume24h) - parseFloat(a.quoteVolume24h))
      .slice(0, 20)
      .map(ticker => ticker.symbol)
  }

  async getMarketSummary(): Promise<{
    totalMarkets: number
    totalVolume24h: string
    topGainers: MarketTicker[]
    topLosers: MarketTicker[]
  }> {
    const tickers = await this.getTicker24h()
    const usdtPairs = tickers.filter(ticker => ticker.symbol.endsWith('USDT'))
    
    const totalVolume = usdtPairs.reduce((sum, ticker) => {
      return sum + parseFloat(ticker.quoteVolume24h || '0')
    }, 0)
    
    const sorted = usdtPairs.sort((a, b) => parseFloat(b.priceChangePercent) - parseFloat(a.priceChangePercent))
    
    return {
      totalMarkets: usdtPairs.length,
      totalVolume24h: totalVolume.toFixed(2),
      topGainers: sorted.slice(0, 5),
      topLosers: sorted.slice(-5).reverse()
    }
  }

  // =============================================================================
  // HEALTH CHECK
  // =============================================================================

  async healthCheck(): Promise<{ 
    connected: boolean
    serverTime?: number
    latency?: number
    error?: string 
  }> {
    try {
      const startTime = Date.now()
      const result = await this.getServerTime()
      const latency = Date.now() - startTime
      
      return {
        connected: true,
        serverTime: result.serverTime,
        latency
      }
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

export const mexcClient = new MexcApiClient({
  apiKey: 'mx0vglOOPfQVfyrRtY',
  secretKey: '2b757e788ac64909a3032a0394080fd5',
  baseUrl: 'https://api.mexc.com'
})