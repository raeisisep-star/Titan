/**
 * Portfolio Routes - Complete Implementation
 * All routes with metadata signatures for production safety
 */

import { Hono } from 'hono'
import { PortfolioService } from '../services/PortfolioService'

const app = new Hono()

// Route handlers expect DB to be available in context
app.get('/advanced', async (c) => {
  try {
    const user = c.get('user')
    if (!user || !user.id) {
      return c.json({ 
        error: 'User not authenticated',
        meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
      }, 401)
    }

    const userId = parseInt(user.id)
    const env = c.env as any
    
    if (!env.DB) {
      console.error('❌ Database not available in context')
      return c.json({ 
        error: 'Database connection not available',
        meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
      }, 500)
    }

    const portfolioService = new PortfolioService(env.DB)
    const result = await portfolioService.getAdvancedPortfolio(userId)

    console.log('✅ /api/portfolio/advanced - Portfolio data retrieved')
    return c.json(result)
  } catch (error: any) {
    console.error('❌ /api/portfolio/advanced Error:', error)
    return c.json({ 
      error: error.message || 'Failed to fetch portfolio data',
      meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
    }, 500)
  }
})

app.get('/transactions', async (c) => {
  try {
    const user = c.get('user')
    if (!user || !user.id) {
      return c.json({ 
        error: 'User not authenticated',
        meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
      }, 401)
    }

    const userId = parseInt(user.id)
    const limit = parseInt(c.req.query('limit') || '50')
    const env = c.env as any
    
    if (!env.DB) {
      console.error('❌ Database not available in context')
      return c.json({ 
        error: 'Database connection not available',
        meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
      }, 500)
    }

    const portfolioService = new PortfolioService(env.DB)
    const result = await portfolioService.getTransactions(userId, limit)

    console.log(`✅ /api/portfolio/transactions - ${result.transactions.length} transactions retrieved`)
    return c.json(result)
  } catch (error: any) {
    console.error('❌ /api/portfolio/transactions Error:', error)
    return c.json({ 
      error: error.message || 'Failed to fetch transactions',
      meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
    }, 500)
  }
})

export default app
