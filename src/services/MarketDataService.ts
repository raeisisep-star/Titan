/**
 * Market Data Service - Real-time price data from Binance
 * Complete implementation with metadata signatures
 */

export interface PriceData {
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  lastUpdate: number
}

export interface MarketPrices {
  [symbol: string]: PriceData
}

export interface FearGreedIndex {
  value: number
  classification: string
  lastUpdate: number
}

export interface MetadataSignature {
  source: 'real' | 'bff' | 'mock'
  ts: number
  ttlMs: number
  stale: boolean
}

export class MarketDataService {
  private binanceAPI = 'https://api.binance.com/api/v3'
  private db: any
  private priceCache: Map<string, { data: PriceData; timestamp: number }> = new Map()
  private cacheTTL = 10000 // 10 seconds

  constructor(db: any) {
    this.db = db
  }

  /**
   * Fetch real-time prices from Binance API
   */
  async fetchRealTimePrices(symbols: string[]): Promise<{
    prices: MarketPrices
    meta: MetadataSignature
  }> {
    try {
      const now = Date.now()
      const prices: MarketPrices = {}

      // Check cache first
      const needsFetch: string[] = []
      for (const symbol of symbols) {
        const cached = this.priceCache.get(symbol)
        if (cached && (now - cached.timestamp) < this.cacheTTL) {
          prices[symbol] = cached.data
        } else {
          needsFetch.push(symbol)
        }
      }

      // Fetch uncached symbols from Binance
      if (needsFetch.length > 0) {
        const fetchPromises = needsFetch.map(symbol => this.fetchBinancePrice(symbol))
        const results = await Promise.allSettled(fetchPromises)

        results.forEach((result, index) => {
          const symbol = needsFetch[index]
          if (result.status === 'fulfilled' && result.value) {
            prices[symbol] = result.value
            this.priceCache.set(symbol, { data: result.value, timestamp: now })
            
            // Store in database for historical tracking
            this.storePriceInDB(symbol, result.value).catch(err => 
              console.error('Failed to store price in DB:', err)
            )
          } else {
            // Fallback to database if API fails
            this.getPriceFromDB(symbol).then(dbPrice => {
              if (dbPrice) {
                prices[symbol] = dbPrice
              }
            }).catch(err => console.error('Failed to get price from DB:', err))
          }
        })
      }

      return {
        prices,
        meta: {
          source: 'real',
          ts: Date.now(),
          ttlMs: 10000, // 10 seconds for real-time data
          stale: false
        }
      }
    } catch (error) {
      console.error('❌ MarketDataService.fetchRealTimePrices Error:', error)
      
      // Fallback to database
      const dbPrices = await this.getAllPricesFromDB(symbols)
      return {
        prices: dbPrices,
        meta: {
          source: 'bff', // Backend for frontend (cached data)
          ts: Date.now(),
          ttlMs: 30000,
          stale: true
        }
      }
    }
  }

  /**
   * Fetch price from Binance API
   */
  private async fetchBinancePrice(symbol: string): Promise<PriceData | null> {
    try {
      const response = await fetch(`${this.binanceAPI}/ticker/24hr?symbol=${symbol}`)
      
      if (!response.ok) {
        console.warn(`Binance API returned ${response.status} for ${symbol}`)
        return null
      }

      const data = await response.json()

      return {
        price: parseFloat(data.lastPrice),
        change24h: parseFloat(data.priceChangePercent),
        volume24h: parseFloat(data.volume),
        high24h: parseFloat(data.highPrice),
        low24h: parseFloat(data.lowPrice),
        lastUpdate: data.closeTime
      }
    } catch (error) {
      console.error(`Failed to fetch ${symbol} from Binance:`, error)
      return null
    }
  }

  /**
   * Store price in database for caching
   */
  private async storePriceInDB(symbol: string, priceData: PriceData): Promise<void> {
    try {
      const query = `
        INSERT INTO market_data (
          symbol, 
          timeframe, 
          open_price, 
          high_price, 
          low_price, 
          close_price, 
          volume, 
          timestamp
        ) VALUES (?, '1m', ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(symbol, timeframe, timestamp) DO UPDATE SET
          close_price = excluded.close_price,
          high_price = excluded.high_price,
          low_price = excluded.low_price,
          volume = excluded.volume
      `

      await this.db.prepare(query).bind(
        symbol,
        priceData.price,
        priceData.high24h,
        priceData.low24h,
        priceData.price,
        priceData.volume24h
      ).run()
    } catch (error) {
      console.error('Failed to store price in DB:', error)
    }
  }

  /**
   * Get price from database (fallback)
   */
  private async getPriceFromDB(symbol: string): Promise<PriceData | null> {
    try {
      const query = `
        SELECT 
          close_price,
          high_price,
          low_price,
          volume,
          strftime('%s', timestamp) as last_update
        FROM market_data
        WHERE symbol = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `

      const result = await this.db.prepare(query).bind(symbol).first()

      if (!result) return null

      return {
        price: result.close_price,
        change24h: 0, // Not available in historical data
        volume24h: result.volume,
        high24h: result.high_price,
        low24h: result.low_price,
        lastUpdate: parseInt(result.last_update) * 1000
      }
    } catch (error) {
      console.error('Failed to get price from DB:', error)
      return null
    }
  }

  /**
   * Get all prices from database (fallback)
   */
  private async getAllPricesFromDB(symbols: string[]): Promise<MarketPrices> {
    const prices: MarketPrices = {}

    for (const symbol of symbols) {
      const priceData = await this.getPriceFromDB(symbol)
      if (priceData) {
        prices[symbol] = priceData
      }
    }

    return prices
  }

  /**
   * Get Fear & Greed Index
   * Note: This is a placeholder - in production, use a real Fear & Greed API
   */
  async getFearGreedIndex(): Promise<{
    index: FearGreedIndex
    meta: MetadataSignature
  }> {
    try {
      // For now, calculate a simple sentiment index based on BTC price change
      const btcPriceResult = await this.fetchRealTimePrices(['BTCUSDT'])
      const btcPrice = btcPriceResult.prices['BTCUSDT']

      let value = 50 // Neutral default
      let classification = 'Neutral'

      if (btcPrice) {
        const change = btcPrice.change24h
        
        if (change > 5) {
          value = 75
          classification = 'Greed'
        } else if (change > 10) {
          value = 90
          classification = 'Extreme Greed'
        } else if (change < -5) {
          value = 25
          classification = 'Fear'
        } else if (change < -10) {
          value = 10
          classification = 'Extreme Fear'
        }
      }

      return {
        index: {
          value,
          classification,
          lastUpdate: Date.now()
        },
        meta: {
          source: 'real',
          ts: Date.now(),
          ttlMs: 60000, // 1 minute
          stale: false
        }
      }
    } catch (error) {
      console.error('❌ MarketDataService.getFearGreedIndex Error:', error)
      
      return {
        index: {
          value: 50,
          classification: 'Neutral',
          lastUpdate: Date.now()
        },
        meta: {
          source: 'bff',
          ts: Date.now(),
          ttlMs: 60000,
          stale: true
        }
      }
    }
  }

  /**
   * Clear price cache (for testing)
   */
  clearCache(): void {
    this.priceCache.clear()
  }
}
