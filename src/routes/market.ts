/**
 * Market Data Routes - Complete Implementation
 * Real-time prices from Binance with metadata signatures
 */

import { Hono } from 'hono'
import { MarketDataService } from '../services/MarketDataService'

const app = new Hono()

app.get('/prices', async (c) => {
  try {
    const symbolsParam = c.req.query('symbols')
    const symbols = symbolsParam 
      ? symbolsParam.split(',').map(s => s.trim())
      : ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'ADAUSDT']

    const env = c.env as any
    
    if (!env.DB) {
      console.error('❌ Database not available in context')
      return c.json({ 
        error: 'Database connection not available',
        meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
      }, 500)
    }

    const marketDataService = new MarketDataService(env.DB)
    const result = await marketDataService.fetchRealTimePrices(symbols)

    console.log(`✅ /api/market/prices - Prices fetched for ${symbols.length} symbols`)
    return c.json(result)
  } catch (error: any) {
    console.error('❌ /api/market/prices Error:', error)
    return c.json({ 
      error: error.message || 'Failed to fetch market prices',
      prices: {},
      meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
    }, 500)
  }
})

app.get('/fear-greed', async (c) => {
  try {
    const env = c.env as any
    
    if (!env.DB) {
      console.error('❌ Database not available in context')
      return c.json({ 
        error: 'Database connection not available',
        meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
      }, 500)
    }

    const marketDataService = new MarketDataService(env.DB)
    const result = await marketDataService.getFearGreedIndex()

    console.log(`✅ /api/market/fear-greed - Index value: ${result.index.value}`)
    return c.json(result)
  } catch (error: any) {
    console.error('❌ /api/market/fear-greed Error:', error)
    return c.json({ 
      error: error.message || 'Failed to fetch fear & greed index',
      index: { value: 50, classification: 'Neutral', lastUpdate: Date.now() },
      meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
    }, 500)
  }
})

export default app
