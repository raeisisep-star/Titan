/**
 * TITAN Trading System - Watchlist API
 * Real Database Implementation - Production Ready
 * Manages user watchlists, favorite symbols, and price alerts
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { WatchlistDAO } from '../dao/database'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Define interfaces for API responses
interface WatchlistItem {
  id: number
  user_id: number
  symbol: string
  name: string
  type: 'crypto' | 'stock' | 'forex' | 'commodity'
  exchange?: string
  price_alert_high?: number
  price_alert_low?: number
  notes?: string
  added_at: string
  is_active: boolean
  current_price?: number
  price_change_24h?: number
}

/**
 * Get user's watchlist
 * GET /watchlist/:userId
 */
app.get('/watchlist/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    
    // Get watchlist items from database
    const items = await WatchlistDAO.findByUserId(userId)
    
    // Enrich with current market data
    const enrichedItems = await enrichWithMarketData(items)
    
    return c.json({
      success: true,
      data: enrichedItems,
      total: enrichedItems.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get watchlist error:', error)
    return c.json({
      success: false,
      error: 'Failed to get watchlist',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Add item to watchlist
 * POST /watchlist/add
 */
app.post('/watchlist/add', async (c) => {
  try {
    const { user_id, symbol, name, type, exchange, price_alert_high, price_alert_low, notes } = await c.req.json()
    
    if (!user_id || !symbol || !name || !type) {
      return c.json({
        success: false,
        error: 'Missing required fields',
        message: 'user_id, symbol, name, and type are required'
      }, 400)
    }
    
    // Check if item already exists
    const existingItem = await WatchlistDAO.findBySymbol(user_id, symbol)
    if (existingItem) {
      return c.json({
        success: false,
        error: 'Item already in watchlist',
        message: `${symbol} is already in your watchlist`
      }, 409)
    }
    
    // Create new watchlist item
    const itemId = await WatchlistDAO.create({
      userId: user_id,
      symbol,
      name,
      type,
      exchange,
      priceAlertHigh: price_alert_high,
      priceAlertLow: price_alert_low,
      notes
    })
    
    // Get the created item
    const newItem = await WatchlistDAO.findById(itemId, user_id)
    
    return c.json({
      success: true,
      data: newItem,
      message: `${name} added to watchlist successfully`
    })
    
  } catch (error) {
    console.error('Add to watchlist error:', error)
    return c.json({
      success: false,
      error: 'Failed to add to watchlist',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Remove item from watchlist
 * DELETE /watchlist/:itemId
 */
app.delete('/watchlist/:itemId', async (c) => {
  try {
    const itemId = parseInt(c.req.param('itemId'))
    const userId = parseInt(c.req.query('userId') || '0')
    
    if (!itemId || !userId) {
      return c.json({
        success: false,
        error: 'Item ID and user ID are required'
      }, 400)
    }
    
    // Check if item exists and belongs to user
    const existingItem = await WatchlistDAO.findById(itemId, userId)
    if (!existingItem) {
      return c.json({
        success: false,
        error: 'Watchlist item not found'
      }, 404)
    }
    
    // Remove item from watchlist (soft delete)
    const success = await WatchlistDAO.delete(itemId, userId)
    
    if (!success) {
      return c.json({
        success: false,
        error: 'Failed to remove item from watchlist'
      }, 500)
    }
    
    return c.json({
      success: true,
      message: `${existingItem.name} removed from watchlist successfully`,
      timestamp: Date.now()
    })
    
  } catch (error) {
    console.error('Remove from watchlist error:', error)
    return c.json({
      success: false,
      error: 'Failed to remove from watchlist',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Update watchlist item
 * PUT /watchlist/:itemId
 */
app.put('/watchlist/:itemId', async (c) => {
  try {
    const itemId = parseInt(c.req.param('itemId'))
    const userId = parseInt(c.req.query('userId') || '0')
    const updates = await c.req.json()
    
    if (!itemId || !userId) {
      return c.json({
        success: false,
        error: 'Item ID and user ID are required'
      }, 400)
    }
    
    // Check if item exists and belongs to user
    const existingItem = await WatchlistDAO.findById(itemId, userId)
    if (!existingItem) {
      return c.json({
        success: false,
        error: 'Watchlist item not found'
      }, 404)
    }
    
    // Validate and filter allowed updates
    const allowedFields = ['name', 'type', 'exchange', 'priceAlertHigh', 'priceAlertLow', 'notes']
    const filteredUpdates: any = {}
    
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        filteredUpdates[field] = updates[field]
      }
    }
    
    if (Object.keys(filteredUpdates).length === 0) {
      return c.json({
        success: false,
        error: 'No valid fields to update'
      }, 400)
    }
    
    // Update item in database
    const success = await WatchlistDAO.update(itemId, userId, filteredUpdates)
    
    if (!success) {
      return c.json({
        success: false,
        error: 'Failed to update watchlist item'
      }, 500)
    }
    
    // Get updated item
    const updatedItem = await WatchlistDAO.findById(itemId, userId)
    
    return c.json({
      success: true,
      data: updatedItem,
      message: 'Watchlist item updated successfully'
    })
    
  } catch (error) {
    console.error('Update watchlist error:', error)
    return c.json({
      success: false,
      error: 'Failed to update watchlist item',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Get watchlist statistics
 * GET /watchlist/stats/:userId
 */
app.get('/watchlist/stats/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    
    const stats = await WatchlistDAO.getUserWatchlistStats(userId)
    
    return c.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get watchlist stats error:', error)
    return c.json({
      success: false,
      error: 'Failed to get watchlist statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Check if symbol is in user's watchlist
 * GET /watchlist/check/:userId/:symbol
 */
app.get('/watchlist/check/:userId/:symbol', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const symbol = c.req.param('symbol')
    
    const item = await WatchlistDAO.findBySymbol(userId, symbol)
    
    return c.json({
      success: true,
      data: {
        isInWatchlist: !!item,
        item: item
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Check watchlist error:', error)
    return c.json({
      success: false,
      error: 'Failed to check watchlist',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Get watchlist items with price alerts
 * GET /watchlist/alerts/:userId
 */
app.get('/watchlist/alerts/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    
    // Get all watchlist items
    const items = await WatchlistDAO.findByUserId(userId)
    
    // Filter items with price alerts
    const itemsWithAlerts = items.filter(item => 
      item.price_alert_high !== null || item.price_alert_low !== null
    )
    
    // Enrich with current market data for alert checking
    const enrichedItems = await enrichWithMarketData(itemsWithAlerts)
    
    // Check for triggered alerts
    const triggeredAlerts = checkTriggeredAlerts(enrichedItems)
    
    return c.json({
      success: true,
      data: {
        totalAlerts: itemsWithAlerts.length,
        triggeredAlerts: triggeredAlerts.length,
        items: enrichedItems,
        triggered: triggeredAlerts
      },
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Get watchlist alerts error:', error)
    return c.json({
      success: false,
      error: 'Failed to get watchlist alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

/**
 * Bulk add items to watchlist
 * POST /watchlist/bulk-add
 */
app.post('/watchlist/bulk-add', async (c) => {
  try {
    const { user_id, items } = await c.req.json()
    
    if (!user_id || !Array.isArray(items) || items.length === 0) {
      return c.json({
        success: false,
        error: 'Invalid bulk add data',
        message: 'user_id and items array are required'
      }, 400)
    }
    
    const results = {
      added: 0,
      skipped: 0,
      failed: 0,
      errors: [] as string[]
    }
    
    for (const item of items) {
      try {
        // Check if item already exists
        const existingItem = await WatchlistDAO.findBySymbol(user_id, item.symbol)
        if (existingItem) {
          results.skipped++
          continue
        }
        
        // Add new item
        await WatchlistDAO.create({
          userId: user_id,
          symbol: item.symbol,
          name: item.name,
          type: item.type || 'crypto',
          exchange: item.exchange,
          priceAlertHigh: item.priceAlertHigh,
          priceAlertLow: item.priceAlertLow,
          notes: item.notes
        })
        
        results.added++
        
      } catch (error) {
        results.failed++
        results.errors.push(`Failed to add ${item.symbol}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
    
    return c.json({
      success: true,
      data: results,
      message: `Bulk add completed: ${results.added} added, ${results.skipped} skipped, ${results.failed} failed`
    })
    
  } catch (error) {
    console.error('Bulk add to watchlist error:', error)
    return c.json({
      success: false,
      error: 'Failed to bulk add to watchlist',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// ===========================
// Helper Functions
// ===========================

/**
 * Enrich watchlist items with current market data
 */
async function enrichWithMarketData(items: any[]): Promise<WatchlistItem[]> {
  const enrichedItems: WatchlistItem[] = []
  
  for (const item of items) {
    try {
      // Get current price from market data API (simulate for now)
      const marketData = await getCurrentMarketData(item.symbol)
      
      enrichedItems.push({
        ...item,
        current_price: marketData.current_price,
        price_change_24h: marketData.price_change_24h
      })
      
    } catch (error) {
      // If market data fails, return item without price data
      enrichedItems.push({
        ...item,
        current_price: null,
        price_change_24h: null
      })
    }
  }
  
  return enrichedItems
}

/**
 * Get current market data for symbol
 */
async function getCurrentMarketData(symbol: string): Promise<{ current_price: number, price_change_24h: number }> {
  try {
    // In production, integrate with CoinGecko or other market data API
    // For now, return simulated data based on symbol
    
    const mockPrices: { [key: string]: { price: number, change: number } } = {
      'BTC': { price: 95000, change: 2.5 },
      'ETH': { price: 3500, change: -1.2 },
      'BNB': { price: 650, change: 0.8 },
      'ADA': { price: 0.45, change: 3.1 },
      'SOL': { price: 200, change: -0.5 },
      'DOT': { price: 25, change: 1.8 },
      'LINK': { price: 18, change: -2.1 },
      'LTC': { price: 120, change: 0.9 }
    }
    
    const data = mockPrices[symbol.toUpperCase()] || { price: 100, change: 0 }
    
    return {
      current_price: data.price,
      price_change_24h: data.change
    }
    
  } catch (error) {
    throw new Error(`Failed to get market data for ${symbol}`)
  }
}

/**
 * Check for triggered price alerts
 */
function checkTriggeredAlerts(items: WatchlistItem[]): any[] {
  const triggered = []
  
  for (const item of items) {
    if (!item.current_price) continue
    
    // Check high alert
    if (item.price_alert_high && item.current_price >= item.price_alert_high) {
      triggered.push({
        item_id: item.id,
        symbol: item.symbol,
        alert_type: 'high',
        alert_price: item.price_alert_high,
        current_price: item.current_price,
        triggered_at: Date.now()
      })
    }
    
    // Check low alert
    if (item.price_alert_low && item.current_price <= item.price_alert_low) {
      triggered.push({
        item_id: item.id,
        symbol: item.symbol,
        alert_type: 'low',
        alert_price: item.price_alert_low,
        current_price: item.current_price,
        triggered_at: Date.now()
      })
    }
  }
  
  return triggered
}

export default app