/**
 * TITAN Trading System - Exchange Factory
 * Unified management of all exchange integrations
 */

import type { Env } from '../types/cloudflare'
import { BaseExchange } from './base-exchange'
import BinanceExchange from './binance-exchange'
import CoinbaseExchange, { type CoinbaseCredentials } from './coinbase-exchange'
import KuCoinExchange, { type KuCoinCredentials } from './kucoin-exchange'
import type { MarketData, OrderBook, TradeOrder, OrderResponse, Balance } from '../services/exchange-service'

export interface ExchangeFactoryConfig {
  env: Env
  enabledExchanges?: string[]
  defaultExchange?: string
}

export interface ExchangeInfo {
  name: string
  displayName: string
  enabled: boolean
  configured: boolean
  authenticated: boolean
  sandbox: boolean
  status: string
  rateLimitRemaining?: number
  lastError?: string
}

export interface AggregatedMarketData extends MarketData {
  exchanges: {
    [exchange: string]: MarketData
  }
  bestBid?: { exchange: string; price: number }
  bestAsk?: { exchange: string; price: number }
  avgPrice: number
  priceSpread: number
}

export class ExchangeFactory {
  private exchanges: Map<string, BaseExchange> = new Map()
  private env: Env
  private enabledExchanges: string[]
  private defaultExchange: string

  constructor(config: ExchangeFactoryConfig) {
    this.env = config.env
    this.enabledExchanges = config.enabledExchanges || ['binance', 'coinbase', 'kucoin']
    this.defaultExchange = config.defaultExchange || 'binance'
    
    this.initializeExchanges()
  }

  /**
   * Initialize all configured exchanges
   */
  private initializeExchanges() {
    // Initialize Binance
    if (this.enabledExchanges.includes('binance') && this.env.BINANCE_API_KEY) {
      try {
        const binance = new BinanceExchange({
          apiKey: this.env.BINANCE_API_KEY,
          apiSecret: this.env.BINANCE_API_SECRET || '',
          sandbox: this.env.BINANCE_TESTNET === 'true'
        })
        this.exchanges.set('binance', binance)
      } catch (error) {
        console.warn('Failed to initialize Binance exchange:', error)
      }
    }

    // Initialize Coinbase Pro
    if (this.enabledExchanges.includes('coinbase') && this.env.COINBASE_API_KEY) {
      try {
        const coinbaseCredentials: CoinbaseCredentials = {
          apiKey: this.env.COINBASE_API_KEY,
          apiSecret: this.env.COINBASE_API_SECRET || '',
          passphrase: this.env.COINBASE_PASSPHRASE || '',
          sandbox: this.env.COINBASE_SANDBOX === 'true'
        }
        const coinbase = new CoinbaseExchange(coinbaseCredentials)
        this.exchanges.set('coinbase', coinbase)
      } catch (error) {
        console.warn('Failed to initialize Coinbase exchange:', error)
      }
    }

    // Initialize KuCoin
    if (this.enabledExchanges.includes('kucoin') && this.env.KUCOIN_API_KEY) {
      try {
        const kucoinCredentials: KuCoinCredentials = {
          apiKey: this.env.KUCOIN_API_KEY,
          apiSecret: this.env.KUCOIN_API_SECRET || '',
          passphrase: this.env.KUCOIN_PASSPHRASE || '',
          sandbox: this.env.KUCOIN_SANDBOX === 'true'
        }
        const kucoin = new KuCoinExchange(kucoinCredentials)
        this.exchanges.set('kucoin', kucoin)
      } catch (error) {
        console.warn('Failed to initialize KuCoin exchange:', error)
      }
    }
  }

  /**
   * Get exchange by name
   */
  public getExchange(name: string): BaseExchange | null {
    return this.exchanges.get(name.toLowerCase()) || null
  }

  /**
   * Get all available exchanges
   */
  public getAvailableExchanges(): string[] {
    return Array.from(this.exchanges.keys())
  }

  /**
   * Get enabled exchanges
   */
  public getEnabledExchanges(): string[] {
    return this.enabledExchanges
  }

  /**
   * Get default exchange
   */
  public getDefaultExchange(): BaseExchange | null {
    return this.getExchange(this.defaultExchange)
  }

  /**
   * Test connections to all exchanges
   */
  public async testAllConnections(): Promise<{ [exchange: string]: any }> {
    const results: { [exchange: string]: any } = {}
    
    for (const [name, exchange] of this.exchanges) {
      try {
        const status = await exchange.testConnection()
        results[name] = {
          success: status.connected,
          status,
          message: status.connected ? 'Connection successful' : status.error || 'Connection failed'
        }
      } catch (error) {
        results[name] = {
          success: false,
          error: error.message
        }
      }
    }
    
    return results
  }

  /**
   * Test authentication for all exchanges
   */
  public async testAllAuthentication(): Promise<{ [exchange: string]: any }> {
    const results: { [exchange: string]: any } = {}
    
    for (const [name, exchange] of this.exchanges) {
      try {
        const status = await exchange.testAuth()
        results[name] = {
          success: status.authenticated,
          status,
          message: status.authenticated ? 'Authentication successful' : status.error || 'Authentication failed'
        }
      } catch (error) {
        results[name] = {
          success: false,
          error: error.message
        }
      }
    }
    
    return results
  }

  /**
   * Get market data from specific exchange or best available
   */
  public async getMarketData(symbol: string, exchange?: string): Promise<MarketData | null> {
    const targetExchange = exchange ? this.getExchange(exchange) : this.getDefaultExchange()
    
    if (!targetExchange) {
      throw new Error(`Exchange ${exchange || this.defaultExchange} not available`)
    }
    
    const result = await targetExchange.getMarketData(symbol)
    return result.success ? result.data || null : null
  }

  /**
   * Get aggregated market data from multiple exchanges
   */
  public async getAggregatedMarketData(symbol: string, exchanges?: string[]): Promise<AggregatedMarketData | null> {
    const targetExchanges = exchanges || this.getAvailableExchanges()
    const marketDataMap: { [exchange: string]: MarketData } = {}
    const prices: number[] = []
    let bestBid: { exchange: string; price: number } | undefined
    let bestAsk: { exchange: string; price: number } | undefined

    // Fetch data from all requested exchanges
    for (const exchangeName of targetExchanges) {
      const exchange = this.getExchange(exchangeName)
      if (!exchange) continue

      try {
        const result = await exchange.getMarketData(symbol)
        if (result.success && result.data) {
          marketDataMap[exchangeName] = result.data
          prices.push(result.data.price)

          // Track best bid/ask (simplified - using current price)
          if (!bestBid || result.data.price > bestBid.price) {
            bestBid = { exchange: exchangeName, price: result.data.price }
          }
          if (!bestAsk || result.data.price < bestAsk.price) {
            bestAsk = { exchange: exchangeName, price: result.data.price }
          }
        }
      } catch (error) {
        console.warn(`Failed to get market data from ${exchangeName}:`, error)
      }
    }

    if (prices.length === 0) {
      return null
    }

    // Calculate aggregated metrics
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)
    const priceSpread = ((maxPrice - minPrice) / avgPrice) * 100

    // Use data from default exchange as base, or first available
    const baseExchange = targetExchanges.find(name => marketDataMap[name]) || targetExchanges[0]
    const baseData = marketDataMap[baseExchange]

    return {
      ...baseData,
      price: avgPrice,
      avgPrice,
      priceSpread,
      bestBid,
      bestAsk,
      exchanges: marketDataMap,
      exchange: 'aggregated'
    }
  }

  /**
   * Get order book from specific exchange
   */
  public async getOrderBook(symbol: string, exchange?: string): Promise<OrderBook | null> {
    const targetExchange = exchange ? this.getExchange(exchange) : this.getDefaultExchange()
    
    if (!targetExchange) {
      throw new Error(`Exchange ${exchange || this.defaultExchange} not available`)
    }
    
    const result = await targetExchange.getOrderBook(symbol)
    return result.success ? result.data || null : null
  }

  /**
   * Get balances from specific exchange or all exchanges
   */
  public async getBalances(exchange?: string): Promise<{ [exchange: string]: Balance[] }> {
    const results: { [exchange: string]: Balance[] } = {}
    
    if (exchange) {
      const targetExchange = this.getExchange(exchange)
      if (targetExchange) {
        const result = await targetExchange.getBalances()
        if (result.success && result.data) {
          results[exchange] = result.data
        }
      }
    } else {
      // Get balances from all exchanges
      for (const [name, exchangeInstance] of this.exchanges) {
        try {
          const result = await exchangeInstance.getBalances()
          if (result.success && result.data) {
            results[name] = result.data
          }
        } catch (error) {
          console.warn(`Failed to get balances from ${name}:`, error)
        }
      }
    }
    
    return results
  }

  /**
   * Place order on specific exchange
   */
  public async placeOrder(order: TradeOrder, exchange?: string): Promise<OrderResponse | null> {
    const targetExchange = exchange ? this.getExchange(exchange) : this.getExchange(order.exchange)
    
    if (!targetExchange) {
      throw new Error(`Exchange ${exchange || order.exchange} not available`)
    }
    
    const result = await targetExchange.placeOrder(order)
    return result.success ? result.data || null : null
  }

  /**
   * Cancel order on specific exchange
   */
  public async cancelOrder(orderId: string, symbol: string, exchange: string): Promise<boolean> {
    const targetExchange = this.getExchange(exchange)
    
    if (!targetExchange) {
      throw new Error(`Exchange ${exchange} not available`)
    }
    
    const result = await targetExchange.cancelOrder(orderId, symbol)
    return result.success
  }

  /**
   * Get order status from specific exchange
   */
  public async getOrderStatus(orderId: string, symbol: string, exchange: string): Promise<OrderResponse | null> {
    const targetExchange = this.getExchange(exchange)
    
    if (!targetExchange) {
      throw new Error(`Exchange ${exchange} not available`)
    }
    
    const result = await targetExchange.getOrderStatus(orderId, symbol)
    return result.success ? result.data || null : null
  }

  /**
   * Get exchange information and status
   */
  public getExchangeInfo(): { [exchange: string]: ExchangeInfo } {
    const info: { [exchange: string]: ExchangeInfo } = {}
    
    for (const [name, exchange] of this.exchanges) {
      const status = exchange.getStatus()
      const rateLimitStatus = exchange.getRateLimitStatus()
      
      info[name] = {
        name,
        displayName: exchange.getName(),
        enabled: this.enabledExchanges.includes(name),
        configured: exchange.validateCredentials(),
        authenticated: status.authenticated,
        sandbox: false, // Would need to check exchange-specific config
        status: status.connected ? 'connected' : 'disconnected',
        rateLimitRemaining: rateLimitStatus.remaining,
        lastError: status.error
      }
    }
    
    return info
  }

  /**
   * Find best price across exchanges (for arbitrage opportunities)
   */
  public async findBestPrice(symbol: string, side: 'buy' | 'sell'): Promise<{
    exchange: string
    price: number
    data: MarketData
  } | null> {
    let bestPrice: number | null = null
    let bestExchange: string | null = null
    let bestData: MarketData | null = null
    
    for (const exchangeName of this.getAvailableExchanges()) {
      try {
        const marketData = await this.getMarketData(symbol, exchangeName)
        if (!marketData) continue
        
        const price = marketData.price
        
        if (bestPrice === null || 
            (side === 'buy' && price < bestPrice) || 
            (side === 'sell' && price > bestPrice)) {
          bestPrice = price
          bestExchange = exchangeName
          bestData = marketData
        }
      } catch (error) {
        console.warn(`Failed to get price from ${exchangeName}:`, error)
      }
    }
    
    if (bestPrice === null || !bestExchange || !bestData) {
      return null
    }
    
    return {
      exchange: bestExchange,
      price: bestPrice,
      data: bestData
    }
  }

  /**
   * Execute smart order routing (find best execution venue)
   */
  public async smartOrderRouting(order: TradeOrder): Promise<{
    recommendedExchange: string
    price: number
    reasoning: string
  } | null> {
    const symbol = order.symbol
    const side = order.side
    
    try {
      // Get market data from all exchanges
      const aggregatedData = await this.getAggregatedMarketData(symbol)
      if (!aggregatedData) {
        return null
      }
      
      // Find exchange with best price
      const bestPriceInfo = await this.findBestPrice(symbol, side)
      if (!bestPriceInfo) {
        return null
      }
      
      // Additional factors to consider:
      // 1. Liquidity (order book depth)
      // 2. Trading fees
      // 3. Rate limits
      // 4. Historical execution quality
      
      let reasoning = `Best ${side} price found on ${bestPriceInfo.exchange}`
      
      // Check price spread across exchanges
      if (aggregatedData.priceSpread > 1.0) {
        reasoning += ` (significant spread detected: ${aggregatedData.priceSpread.toFixed(2)}%)`
      }
      
      return {
        recommendedExchange: bestPriceInfo.exchange,
        price: bestPriceInfo.price,
        reasoning
      }
      
    } catch (error) {
      console.warn('Smart order routing failed:', error)
      return null
    }
  }

  /**
   * Calculate total portfolio value across all exchanges
   */
  public async getTotalPortfolioValue(): Promise<{
    totalUsd: number
    exchanges: { [exchange: string]: { usd: number; assets: Balance[] } }
  }> {
    const allBalances = await this.getBalances()
    let totalUsd = 0
    const exchangeBreakdown: { [exchange: string]: { usd: number; assets: Balance[] } } = {}
    
    for (const [exchangeName, balances] of Object.entries(allBalances)) {
      let exchangeUsd = 0
      
      for (const balance of balances) {
        if (balance.asset === 'USD' || balance.asset === 'USDT' || balance.asset === 'USDC') {
          exchangeUsd += balance.total
        } else {
          // Try to get USD value for other assets
          try {
            const marketData = await this.getMarketData(`${balance.asset}USDT`, exchangeName)
            if (marketData) {
              exchangeUsd += balance.total * marketData.price
            }
          } catch (error) {
            // Skip assets we can't price
          }
        }
      }
      
      exchangeBreakdown[exchangeName] = {
        usd: exchangeUsd,
        assets: balances
      }
      totalUsd += exchangeUsd
    }
    
    return {
      totalUsd,
      exchanges: exchangeBreakdown
    }
  }

  /**
   * Shutdown all exchanges and cleanup resources
   */
  public shutdown() {
    this.exchanges.clear()
  }
}

export default ExchangeFactory