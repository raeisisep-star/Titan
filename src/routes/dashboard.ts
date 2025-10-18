/**
 * Dashboard Routes - Comprehensive Dashboard API
 * The most important endpoint that combines all data
 */

import { Hono } from 'hono'
import { DashboardService } from '../services/DashboardService'

const app = new Hono()

/**
 * GET /api/dashboard/comprehensive-real
 * Returns ALL dashboard data with metadata signature
 * This is the CRITICAL endpoint that Frontend depends on
 */
app.get('/comprehensive-real', async (c) => {
  try {
    const user: any = (c as any).get('user')
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

    console.log('🔄 Loading comprehensive dashboard data for user:', userId)

    const dashboardService = new DashboardService(env.DB)
    const result = await dashboardService.getComprehensiveDashboard(userId)

    console.log('✅ /api/dashboard/comprehensive-real - Dashboard data retrieved')
    return c.json(result)
  } catch (error: any) {
    console.error('❌ /api/dashboard/comprehensive-real Error:', error)
    return c.json({ 
      error: error.message || 'Failed to fetch dashboard data',
      meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
    }, 500)
  }
})

/**
 * GET /api/dashboard/quick-stats
 * Returns quick summary statistics
 */
app.get('/quick-stats', async (c) => {
  try {
    const user: any = (c as any).get('user')
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

    const dashboardService = new DashboardService(env.DB)
    const result = await dashboardService.getComprehensiveDashboard(userId)

    // Return only quick stats
    const quickStats = {
      totalBalance: result.data.portfolio.totalBalance,
      dailyChange: result.data.portfolio.dailyChange,
      totalPnL: result.data.portfolio.totalPnL,
      activeTrades: result.data.trading.activeTrades,
      winRate: result.data.portfolio.winRate
    }

    console.log('✅ /api/dashboard/quick-stats - Quick stats retrieved')
    return c.json({
      stats: quickStats,
      meta: result.meta
    })
  } catch (error: any) {
    console.error('❌ /api/dashboard/quick-stats Error:', error)
    return c.json({ 
      error: error.message || 'Failed to fetch quick stats',
      meta: { source: 'none', ts: Date.now(), stale: true, ttlMs: 0 }
    }, 500)
  }
})

export default app
