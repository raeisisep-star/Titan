// TITAN Watchlist API - مدیریت لیست مورد علاقه
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from '../types/cloudflare'

interface WatchlistItem {
  id: string
  user_id: string
  symbol: string
  name: string
  type: 'crypto' | 'stock' | 'forex'
  exchange?: string
  price_alert_high?: number
  price_alert_low?: number
  notes?: string
  added_at: string
  is_active: boolean
}

interface PriceData {
  symbol: string
  price: number
  change_24h: number
  change_percentage_24h: number
  volume_24h: number
  market_cap?: number
  last_updated: string
}

export const watchlistApi = new Hono<{ Bindings: Env }>()

watchlistApi.use('/*', cors())

// Get user's watchlist
watchlistApi.get('/list/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // For now, return demo data - later will integrate with D1 database
    const demoWatchlist: WatchlistItem[] = [
      {
        id: 'w1',
        user_id: userId,
        symbol: 'BTCUSDT',
        name: 'Bitcoin',
        type: 'crypto',
        exchange: 'binance',
        price_alert_high: 50000,
        price_alert_low: 40000,
        notes: 'هدف اصلی پرتفولیو',
        added_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'w2',
        user_id: userId,
        symbol: 'ETHUSDT',
        name: 'Ethereum',
        type: 'crypto',
        exchange: 'binance',
        price_alert_high: 3000,
        price_alert_low: 2000,
        notes: 'DeFi play',
        added_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'w3',
        user_id: userId,
        symbol: 'SOLUSDT',
        name: 'Solana',
        type: 'crypto',
        exchange: 'binance',
        added_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'w4',
        user_id: userId,
        symbol: 'ADAUSDT',
        name: 'Cardano',
        type: 'crypto',
        exchange: 'binance',
        added_at: new Date().toISOString(),
        is_active: true
      },
      {
        id: 'w5',
        user_id: userId,
        symbol: 'DOTUSDT',
        name: 'Polkadot',
        type: 'crypto',
        exchange: 'binance',
        added_at: new Date().toISOString(),
        is_active: true
      }
    ]

    return c.json({
      success: true,
      data: demoWatchlist,
      count: demoWatchlist.length,
      message: 'Watchlist retrieved successfully'
    })

  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to get watchlist'
    }, 500)
  }
})

// Add item to watchlist
watchlistApi.post('/add', async (c) => {
  try {
    const body = await c.req.json()
    const { user_id, symbol, name, type, exchange, price_alert_high, price_alert_low, notes } = body

    if (!user_id || !symbol || !name || !type) {
      return c.json({
        success: false,
        message: 'user_id, symbol, name, and type are required'
      }, 400)
    }

    const newItem: WatchlistItem = {
      id: `w_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      user_id,
      symbol: symbol.toUpperCase(),
      name,
      type,
      exchange,
      price_alert_high,
      price_alert_low,
      notes,
      added_at: new Date().toISOString(),
      is_active: true
    }

    // Later: Store in D1 database
    // For now, just return success with the created item

    return c.json({
      success: true,
      data: newItem,
      message: `${name} added to watchlist`
    })

  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to add to watchlist'
    }, 500)
  }
})

// Remove item from watchlist
watchlistApi.delete('/remove/:itemId', async (c) => {
  try {
    const itemId = c.req.param('itemId')
    
    if (!itemId) {
      return c.json({
        success: false,
        message: 'Item ID is required'
      }, 400)
    }

    // Later: Remove from D1 database
    // For now, just return success

    return c.json({
      success: true,
      message: 'Item removed from watchlist'
    })

  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to remove from watchlist'
    }, 500)
  }
})

// Update watchlist item (alerts, notes)
watchlistApi.put('/update/:itemId', async (c) => {
  try {
    const itemId = c.req.param('itemId')
    const body = await c.req.json()
    
    if (!itemId) {
      return c.json({
        success: false,
        message: 'Item ID is required'
      }, 400)
    }

    // Later: Update in D1 database
    // For now, just return success with updated data

    return c.json({
      success: true,
      data: { id: itemId, ...body, updated_at: new Date().toISOString() },
      message: 'Watchlist item updated'
    })

  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to update watchlist item'
    }, 500)
  }
})

// Get real-time prices for watchlist
watchlistApi.get('/prices/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // Get user's watchlist first
    const watchlistResponse = await c.req.url.replace(/\/prices\/.*/, `/list/${userId}`)
    
    // Fetch real-time prices from CoinGecko
    const symbols = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot']
    const coingeckoUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${symbols.join(',')}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`
    
    const priceResponse = await fetch(coingeckoUrl)
    const priceData = await priceResponse.json()

    // Transform to our format
    const pricesFormatted: PriceData[] = [
      {
        symbol: 'BTCUSDT',
        price: priceData.bitcoin?.usd || 0,
        change_24h: priceData.bitcoin?.usd_24h_change || 0,
        change_percentage_24h: priceData.bitcoin?.usd_24h_change || 0,
        volume_24h: priceData.bitcoin?.usd_24h_vol || 0,
        market_cap: priceData.bitcoin?.usd_market_cap || 0,
        last_updated: new Date().toISOString()
      },
      {
        symbol: 'ETHUSDT',
        price: priceData.ethereum?.usd || 0,
        change_24h: priceData.ethereum?.usd_24h_change || 0,
        change_percentage_24h: priceData.ethereum?.usd_24h_change || 0,
        volume_24h: priceData.ethereum?.usd_24h_vol || 0,
        market_cap: priceData.ethereum?.usd_market_cap || 0,
        last_updated: new Date().toISOString()
      },
      {
        symbol: 'SOLUSDT',
        price: priceData.solana?.usd || 0,
        change_24h: priceData.solana?.usd_24h_change || 0,
        change_percentage_24h: priceData.solana?.usd_24h_change || 0,
        volume_24h: priceData.solana?.usd_24h_vol || 0,
        market_cap: priceData.solana?.usd_market_cap || 0,
        last_updated: new Date().toISOString()
      },
      {
        symbol: 'ADAUSDT',
        price: priceData.cardano?.usd || 0,
        change_24h: priceData.cardano?.usd_24h_change || 0,
        change_percentage_24h: priceData.cardano?.usd_24h_change || 0,
        volume_24h: priceData.cardano?.usd_24h_vol || 0,
        market_cap: priceData.cardano?.usd_market_cap || 0,
        last_updated: new Date().toISOString()
      },
      {
        symbol: 'DOTUSDT',
        price: priceData.polkadot?.usd || 0,
        change_24h: priceData.polkadot?.usd_24h_change || 0,
        change_percentage_24h: priceData.polkadot?.usd_24h_change || 0,
        volume_24h: priceData.polkadot?.usd_24h_vol || 0,
        market_cap: priceData.polkadot?.usd_market_cap || 0,
        last_updated: new Date().toISOString()
      }
    ]

    return c.json({
      success: true,
      data: pricesFormatted,
      count: pricesFormatted.length,
      message: 'Real-time prices retrieved',
      last_updated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Error fetching prices:', error)
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch real-time prices'
    }, 500)
  }
})

// Search for symbols to add to watchlist
watchlistApi.get('/search/:query', async (c) => {
  try {
    const query = c.req.param('query')
    
    if (!query || query.length < 2) {
      return c.json({
        success: false,
        message: 'Query must be at least 2 characters'
      }, 400)
    }

    // Search CoinGecko for cryptocurrencies
    const searchUrl = `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(query)}`
    const searchResponse = await fetch(searchUrl)
    const searchData = await searchResponse.json()

    const results = searchData.coins?.slice(0, 10).map(coin => ({
      symbol: coin.symbol?.toUpperCase(),
      name: coin.name,
      type: 'crypto',
      id: coin.id,
      thumb: coin.thumb,
      market_cap_rank: coin.market_cap_rank
    })) || []

    return c.json({
      success: true,
      data: results,
      count: results.length,
      message: `Found ${results.length} results for "${query}"`
    })

  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Search failed'
    }, 500)
  }
})

export default watchlistApi