// TITAN Database API Endpoints
import { Hono } from 'hono'
import { DatabaseService } from '../services/database-service'
import type { Env } from '../types/cloudflare'

const app = new Hono<{ Bindings: Env }>()

// Database health check
app.get('/health', async (c) => {
  try {
    const dbService = new DatabaseService(c.env)
    const health = await dbService.healthCheck()
    
    return c.json({
      success: true,
      data: health,
      message: 'Database health check completed'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Database health check failed'
    }, 500)
  }
})

// Get dashboard statistics
app.get('/stats', async (c) => {
  try {
    const dbService = new DatabaseService(c.env)
    const userId = c.req.query('user_id') ? parseInt(c.req.query('user_id')!) : undefined
    const stats = await dbService.getDashboardStats(userId)
    
    return c.json({
      success: true,
      data: stats,
      message: 'Dashboard statistics retrieved'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve statistics'
    }, 500)
  }
})

// Get user information
app.get('/users/:username', async (c) => {
  try {
    const username = c.req.param('username')
    const dbService = new DatabaseService(c.env)
    const user = await dbService.getUserByUsername(username)
    
    if (!user) {
      return c.json({
        success: false,
        message: 'User not found'
      }, 404)
    }
    
    // Remove sensitive information
    const { password_hash, ...safeUser } = user
    
    return c.json({
      success: true,
      data: safeUser,
      message: 'User information retrieved'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve user'
    }, 500)
  }
})

// Get trading accounts for a user
app.get('/users/:userId/accounts', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    if (isNaN(userId)) {
      return c.json({
        success: false,
        message: 'Invalid user ID'
      }, 400)
    }
    
    const dbService = new DatabaseService(c.env)
    const accounts = await dbService.getTradingAccountsByUserId(userId)
    
    // Remove sensitive API keys from response
    const safeAccounts = accounts.map(account => {
      const { api_key_encrypted, api_secret_encrypted, passphrase_encrypted, ...safeAccount } = account
      return {
        ...safeAccount,
        has_api_key: !!api_key_encrypted,
        has_secret: !!api_secret_encrypted,
        has_passphrase: !!passphrase_encrypted
      }
    })
    
    return c.json({
      success: true,
      data: safeAccounts,
      message: 'Trading accounts retrieved'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve trading accounts'
    }, 500)
  }
})

// Get portfolios for a user
app.get('/users/:userId/portfolios', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    if (isNaN(userId)) {
      return c.json({
        success: false,
        message: 'Invalid user ID'
      }, 400)
    }
    
    const dbService = new DatabaseService(c.env)
    const portfolios = await dbService.getPortfoliosByUserId(userId)
    
    return c.json({
      success: true,
      data: portfolios,
      message: 'Portfolios retrieved'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve portfolios'
    }, 500)
  }
})

// Get trades for a user
app.get('/users/:userId/trades', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const limit = parseInt(c.req.query('limit') || '50')
    
    if (isNaN(userId)) {
      return c.json({
        success: false,
        message: 'Invalid user ID'
      }, 400)
    }
    
    const dbService = new DatabaseService(c.env)
    const trades = await dbService.getTradesByUserId(userId, limit)
    
    return c.json({
      success: true,
      data: trades,
      count: trades.length,
      message: 'Trades retrieved'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve trades'
    }, 500)
  }
})

// Get trades by symbol
app.get('/trades/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol').toUpperCase()
    const userId = c.req.query('user_id') ? parseInt(c.req.query('user_id')!) : undefined
    const limit = parseInt(c.req.query('limit') || '20')
    
    const dbService = new DatabaseService(c.env)
    const trades = await dbService.getTradesBySymbol(symbol, userId, limit)
    
    return c.json({
      success: true,
      data: trades,
      count: trades.length,
      message: `Trades for ${symbol} retrieved`
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve trades'
    }, 500)
  }
})

// Create a new trade record
app.post('/trades', async (c) => {
  try {
    const tradeData = await c.req.json()
    
    // Validate required fields
    if (!tradeData.user_id || !tradeData.trading_account_id || !tradeData.symbol || 
        !tradeData.side || !tradeData.type || !tradeData.quantity) {
      return c.json({
        success: false,
        message: 'Missing required trade fields'
      }, 400)
    }
    
    const dbService = new DatabaseService(c.env)
    const trade = await dbService.createTrade(tradeData)
    
    return c.json({
      success: true,
      data: trade,
      message: 'Trade record created'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to create trade'
    }, 500)
  }
})

// Update trade status
app.put('/trades/:tradeId/status', async (c) => {
  try {
    const tradeId = parseInt(c.req.param('tradeId'))
    const { status, ...updateData } = await c.req.json()
    
    if (isNaN(tradeId) || !status) {
      return c.json({
        success: false,
        message: 'Invalid trade ID or status'
      }, 400)
    }
    
    const dbService = new DatabaseService(c.env)
    await dbService.updateTradeStatus(tradeId, status, updateData)
    
    return c.json({
      success: true,
      message: 'Trade status updated'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to update trade status'
    }, 500)
  }
})

// Store AI analysis result
app.post('/ai-analyses', async (c) => {
  try {
    const analysisData = await c.req.json()
    
    // Validate required fields
    if (!analysisData.symbol || !analysisData.analysis_type || 
        !analysisData.ai_provider || !analysisData.analysis_result) {
      return c.json({
        success: false,
        message: 'Missing required analysis fields'
      }, 400)
    }
    
    const dbService = new DatabaseService(c.env)
    const analysis = await dbService.storeAIAnalysis(analysisData)
    
    return c.json({
      success: true,
      data: analysis,
      message: 'AI analysis stored'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to store AI analysis'
    }, 500)
  }
})

// Get recent AI analyses
app.get('/ai-analyses', async (c) => {
  try {
    const symbol = c.req.query('symbol')?.toUpperCase()
    const analysisType = c.req.query('type')
    const limit = parseInt(c.req.query('limit') || '10')
    
    const dbService = new DatabaseService(c.env)
    const analyses = await dbService.getRecentAIAnalyses(symbol, analysisType, limit)
    
    return c.json({
      success: true,
      data: analyses,
      count: analyses.length,
      message: 'AI analyses retrieved'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve AI analyses'
    }, 500)
  }
})

// Get AI analysis by ID
app.get('/ai-analyses/:analysisId', async (c) => {
  try {
    const analysisId = parseInt(c.req.param('analysisId'))
    
    if (isNaN(analysisId)) {
      return c.json({
        success: false,
        message: 'Invalid analysis ID'
      }, 400)
    }
    
    const dbService = new DatabaseService(c.env)
    const analysis = await dbService.getAIAnalysisById(analysisId)
    
    if (!analysis) {
      return c.json({
        success: false,
        message: 'Analysis not found'
      }, 404)
    }
    
    return c.json({
      success: true,
      data: analysis,
      message: 'AI analysis retrieved'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve AI analysis'
    }, 500)
  }
})

// Get latest market data
app.get('/market-data', async (c) => {
  try {
    const symbol = c.req.query('symbol')?.toUpperCase()
    
    const dbService = new DatabaseService(c.env)
    const marketData = await dbService.getLatestMarketData(symbol)
    
    return c.json({
      success: true,
      data: marketData,
      count: marketData.length,
      message: 'Market data retrieved'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve market data'
    }, 500)
  }
})

// Update market data
app.post('/market-data', async (c) => {
  try {
    const marketData = await c.req.json()
    
    if (!marketData.symbol || marketData.price === undefined) {
      return c.json({
        success: false,
        message: 'Symbol and price are required'
      }, 400)
    }
    
    const dbService = new DatabaseService(c.env)
    await dbService.updateMarketData(marketData)
    
    return c.json({
      success: true,
      message: 'Market data updated'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to update market data'
    }, 500)
  }
})

// Get notifications for a user
app.get('/users/:userId/notifications', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'))
    const limit = parseInt(c.req.query('limit') || '50')
    
    if (isNaN(userId)) {
      return c.json({
        success: false,
        message: 'Invalid user ID'
      }, 400)
    }
    
    const dbService = new DatabaseService(c.env)
    const notifications = await dbService.getNotificationsByUserId(userId, limit)
    
    return c.json({
      success: true,
      data: notifications,
      count: notifications.length,
      message: 'Notifications retrieved'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve notifications'
    }, 500)
  }
})

// Store notification
app.post('/notifications', async (c) => {
  try {
    const notificationData = await c.req.json()
    
    if (!notificationData.type || !notificationData.title || !notificationData.message) {
      return c.json({
        success: false,
        message: 'Type, title, and message are required'
      }, 400)
    }
    
    const dbService = new DatabaseService(c.env)
    const notificationId = await dbService.storeNotification(notificationData)
    
    return c.json({
      success: true,
      data: { id: notificationId },
      message: 'Notification stored'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to store notification'
    }, 500)
  }
})

// Cleanup expired data
app.post('/cleanup', async (c) => {
  try {
    const dbService = new DatabaseService(c.env)
    await dbService.cleanupExpiredData()
    
    return c.json({
      success: true,
      message: 'Database cleanup completed'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Database cleanup failed'
    }, 500)
  }
})

export default app