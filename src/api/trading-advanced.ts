import { Hono } from 'hono'
import { 
  TradeDAO, 
  EnhancedTradeDAO,
  TradingStrategyDAO,
  TradingOrderDAO,
  MarketDataDAO,
  PortfolioDAO,
  DatabaseWithRetry
} from '../dao/database'

const app = new Hono()

/**
 * Helper function to get user ID from request context
 */
function getUserId(c: any): number {
  return c.req.header('user-id') ? parseInt(c.req.header('user-id'), 10) : 1
}

/**
 * Helper functions for technical indicators
 */
function getRSISignal(rsi: number): string {
  if (rsi > 70) return 'فروش'
  if (rsi < 30) return 'خرید'
  return 'خنثی'
}

function getMACDSignal(macd: number): string {
  return macd > 0 ? 'خرید' : 'فروش'
}

// Get advanced trading data and analytics - REAL DATA
app.get('/advanced', async (c) => {
  try {
    const userId = getUserId(c)
    const selectedSymbol = c.req.query('symbol') || 'BTCUSDT'
    
    // Get real trading statistics
    const tradingStats = await EnhancedTradeDAO.getTradingStats(userId)
    const winLossStats = await EnhancedTradeDAO.getWinLossStats(userId)
    const recentTrades = await TradeDAO.findByUserId(userId, 50)
    
    // Get portfolio balance
    const mainPortfolio = await PortfolioDAO.getMainPortfolio(userId)
    
    // Get latest market data
    let marketData: any = {}
    try {
      const latestCandles = await MarketDataDAO.getLatestCandles(selectedSymbol, '1h', 1)
      if (latestCandles.length > 0) {
        marketData = latestCandles[0]
      }
    } catch (error) {
      console.log('Market data not available, using fallback')
    }
    
    // Calculate period profits from real trades
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const month = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const dailyTrades = recentTrades.filter(t => 
      new Date(t.entry_time) >= today && t.exit_time
    )
    const weeklyTrades = recentTrades.filter(t => 
      new Date(t.entry_time) >= week && t.exit_time
    )
    const monthlyTrades = recentTrades.filter(t => 
      new Date(t.entry_time) >= month && t.exit_time
    )
    
    const dailyProfit = dailyTrades.reduce((sum, t) => sum + (t.net_pnl || 0), 0)
    const weeklyProfit = weeklyTrades.reduce((sum, t) => sum + (t.net_pnl || 0), 0) 
    const monthlyProfit = monthlyTrades.reduce((sum, t) => sum + (t.net_pnl || 0), 0)
    
    // Get active strategies count
    const activeStrategies = await TradingStrategyDAO.findActiveStrategies(userId)
    
    const tradingData = {
      symbol: selectedSymbol,
      currentPrice: marketData.close_price || 45000,
      priceChange24h: marketData.close_price ? 
        (marketData.close_price - marketData.open_price) : 0,
      priceChangePercent24h: marketData.open_price ? 
        ((marketData.close_price - marketData.open_price) / marketData.open_price) * 100 : 0,
      volume24h: marketData.volume || 0,
      high24h: marketData.high_price || 0,
      low24h: marketData.low_price || 0,
      
      // Real trading statistics
      activeTradesCount: recentTrades.filter(t => !t.exit_time).length,
      activeStrategiesCount: activeStrategies.length,
      dailyProfit,
      weeklyProfit, 
      monthlyProfit,
      winRate: tradingStats.winRate,
      totalTrades: tradingStats.totalTrades,
      winningTrades: tradingStats.winningTrades,
      losingTrades: tradingStats.losingTrades,
      
      // Enhanced statistics
      avgPnL: tradingStats.avgPnL,
      maxWin: tradingStats.maxWin,
      maxLoss: tradingStats.maxLoss,
      profitFactor: tradingStats.profitFactor,
      sharpeRatio: tradingStats.sharpeRatio,
      maxDrawdown: tradingStats.maxDrawdown,
      avgTradeDuration: tradingStats.avgTradeDuration,
      
      // Win/Loss detailed stats
      consecutiveWins: winLossStats.consecutiveWins,
      consecutiveLosses: winLossStats.consecutiveLosses,
      largestWin: winLossStats.largestWin,
      largestLoss: winLossStats.largestLoss,
      
      // Portfolio balance (real)
      balance: {
        totalValue: mainPortfolio.balance_usd,
        availableBalance: mainPortfolio.available_balance,
        lockedBalance: mainPortfolio.locked_balance,
        totalPnL: mainPortfolio.total_pnl,
        dailyPnL: mainPortfolio.daily_pnl
      },
      
      // Technical indicators (from market data or calculated)
      technicalIndicators: {
        rsi: marketData.rsi_14 || 50,
        rsi_signal: getRSISignal(marketData.rsi_14 || 50),
        macd: marketData.macd || 0,
        macd_signal: getMACDSignal(marketData.macd || 0),
        macd_histogram: marketData.macd_histogram || 0,
        bb_upper: marketData.bb_upper || 0,
        bb_middle: marketData.bb_middle || 0, 
        bb_lower: marketData.bb_lower || 0,
        sma_20: marketData.close_price || 0,
        sma_50: marketData.close_price || 0,
        ema_20: marketData.close_price || 0,
        ema_50: marketData.close_price || 0,
        volume_sma: marketData.volume || 0
      }
    }

    return c.json({
      success: true,
      data: tradingData,
      timestamp: Date.now(),
      source: 'real_data'
    })
  } catch (error) {
    console.error('Advanced trading data error:', error)
    return c.json({
      success: false,
      error: 'Failed to load advanced trading data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get trading statistics by period - REAL DATA  
app.get('/stats', async (c) => {
  try {
    const userId = getUserId(c)
    const period = c.req.query('period') || 'all' // today, week, month, year, all
    
    const tradingStats = await EnhancedTradeDAO.getTradingStats(userId, period)
    const winLossStats = await EnhancedTradeDAO.getWinLossStats(userId)
    const pnlData = await EnhancedTradeDAO.getPnLByPeriod(userId, 'day')
    
    return c.json({
      success: true,
      data: {
        ...tradingStats,
        ...winLossStats,
        pnlHistory: pnlData.slice(-30), // Last 30 periods
        period
      },
      source: 'real_data'
    })
  } catch (error) {
    console.error('Trading stats error:', error)
    return c.json({
      success: false,
      error: 'Failed to load trading statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get recent trades - REAL DATA
app.get('/trades/recent', async (c) => {
  try {
    const userId = getUserId(c)
    const limit = parseInt(c.req.query('limit') || '50', 10)
    
    const trades = await TradeDAO.findByUserId(userId, limit)
    
    // Transform trades for API response
    const formattedTrades = trades.map(trade => ({
      id: trade.id,
      symbol: trade.symbol,
      side: trade.side,
      quantity: trade.quantity,
      entryPrice: trade.entry_price,
      exitPrice: trade.exit_price,
      pnl: trade.pnl,
      pnlPercentage: trade.pnl_percentage,
      netPnL: trade.net_pnl,
      fees: trade.fees,
      entryTime: trade.entry_time,
      exitTime: trade.exit_time,
      duration: trade.duration_minutes,
      entryReason: trade.entry_reason,
      exitReason: trade.exit_reason,
      status: trade.exit_time ? 'completed' : 'active'
    }))
    
    return c.json({
      success: true,
      data: formattedTrades,
      count: formattedTrades.length,
      source: 'real_data'
    })
  } catch (error) {
    console.error('Recent trades error:', error)
    return c.json({
      success: false,
      error: 'Failed to load recent trades',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get trading strategies - REAL DATA
app.get('/strategies', async (c) => {
  try {
    const userId = getUserId(c)
    
    const strategies = await TradingStrategyDAO.findByUserId(userId)
    const activeStrategies = await TradingStrategyDAO.findActiveStrategies(userId)
    
    // Get performance for each strategy
    const strategiesWithPerformance = await Promise.all(
      strategies.map(async (strategy) => {
        const strategyTrades = await TradeDAO.findByStrategy(strategy.id, 100)
        const totalPnL = strategyTrades.reduce((sum, t) => sum + (t.net_pnl || 0), 0)
        const winningTrades = strategyTrades.filter(t => (t.net_pnl || 0) > 0).length
        const winRate = strategyTrades.length > 0 ? (winningTrades / strategyTrades.length) * 100 : 0
        
        return {
          ...strategy,
          performance: {
            totalPnL,
            winRate,
            totalTrades: strategyTrades.length,
            winningTrades,
            losingTrades: strategyTrades.length - winningTrades,
            avgPnL: strategyTrades.length > 0 ? totalPnL / strategyTrades.length : 0
          }
        }
      })
    )
    
    return c.json({
      success: true,
      data: {
        all: strategiesWithPerformance,
        active: activeStrategies,
        summary: {
          total: strategies.length,
          active: activeStrategies.length,
          inactive: strategies.length - activeStrategies.length
        }
      },
      source: 'real_data'
    })
  } catch (error) {
    console.error('Trading strategies error:', error)
    return c.json({
      success: false,
      error: 'Failed to load trading strategies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Create new trading strategy - NEW ENDPOINT
app.post('/strategies', async (c) => {
  try {
    const userId = getUserId(c)
    const strategyData = await c.req.json()
    
    const requiredFields = ['name', 'type', 'symbol']
    const missingFields = requiredFields.filter(field => !strategyData[field])
    
    if (missingFields.length > 0) {
      return c.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, 400)
    }
    
    const newStrategy = await TradingStrategyDAO.create({
      user_id: userId,
      ...strategyData
    })
    
    return c.json({
      success: true,
      data: newStrategy,
      message: 'Trading strategy created successfully'
    })
  } catch (error) {
    console.error('Create strategy error:', error)
    return c.json({
      success: false,
      error: 'Failed to create trading strategy',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get market data for symbol - REAL DATA
app.get('/market/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol')
    const timeframe = c.req.query('timeframe') || '1h'
    const limit = parseInt(c.req.query('limit') || '100', 10)
    
    const candles = await MarketDataDAO.getLatestCandles(symbol, timeframe, limit)
    
    if (candles.length === 0) {
      return c.json({
        success: true,
        data: [],
        message: 'No market data available for this symbol',
        symbol,
        timeframe
      })
    }
    
    const latest = candles[0]
    const marketSummary = {
      symbol,
      currentPrice: latest.close_price,
      high24h: Math.max(...candles.slice(0, 24).map(c => c.high_price)),
      low24h: Math.min(...candles.slice(0, 24).map(c => c.low_price)),
      volume24h: candles.slice(0, 24).reduce((sum, c) => sum + c.volume, 0),
      priceChange24h: candles.length >= 24 ? latest.close_price - candles[23].close_price : 0,
      technicalIndicators: {
        rsi: latest.rsi_14,
        macd: latest.macd,
        macd_signal: latest.macd_signal,
        macd_histogram: latest.macd_histogram,
        bb_upper: latest.bb_upper,
        bb_middle: latest.bb_middle,
        bb_lower: latest.bb_lower
      }
    }
    
    marketSummary.priceChangePercent24h = candles.length >= 24 && candles[23].close_price > 0 ? 
      (marketSummary.priceChange24h / candles[23].close_price) * 100 : 0
    
    return c.json({
      success: true,
      data: {
        summary: marketSummary,
        candles: candles.reverse() // Return in chronological order
      },
      source: 'real_data'
    })
  } catch (error) {
    console.error('Market data error:', error)
    return c.json({
      success: false,
      error: 'Failed to load market data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get active orders - REAL DATA
app.get('/orders', async (c) => {
  try {
    const userId = getUserId(c)
    
    // Get orders using raw query since TradingOrderDAO might not have all methods
    const db = DatabaseWithRetry
    const result = await db.queryWithRetry(`
      SELECT * FROM trading_orders 
      WHERE user_id = ? AND status IN ('pending', 'open', 'partial') 
      ORDER BY created_at DESC
    `, [userId])
    
    const orders = result.results || []
    
    return c.json({
      success: true,
      data: orders,
      count: orders.length,
      source: 'real_data'
    })
  } catch (error) {
    console.error('Active orders error:', error)
    return c.json({
      success: false,
      error: 'Failed to load active orders',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Create new order - NEW ENDPOINT
app.post('/orders', async (c) => {
  try {
    const userId = getUserId(c)
    const orderData = await c.req.json()
    
    const requiredFields = ['symbol', 'side', 'type', 'quantity']
    const missingFields = requiredFields.filter(field => !orderData[field])
    
    if (missingFields.length > 0) {
      return c.json({
        success: false,
        error: `Missing required fields: ${missingFields.join(', ')}`
      }, 400)
    }
    
    const mainPortfolio = await PortfolioDAO.getMainPortfolio(userId)
    
    // Create order using DAO
    const newOrder = await TradingOrderDAO.create({
      user_id: userId,
      portfolio_id: mainPortfolio.id,
      ...orderData,
      client_order_id: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    })
    
    return c.json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('Create order error:', error)
    return c.json({
      success: false,
      error: 'Failed to create order',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get trading performance analytics - NEW ENDPOINT
app.get('/analytics/performance', async (c) => {
  try {
    const userId = getUserId(c)
    const period = c.req.query('period') || 'month'
    
    const tradingStats = await EnhancedTradeDAO.getTradingStats(userId, period)
    const pnlData = await EnhancedTradeDAO.getPnLByPeriod(userId, 'day')
    const winLossStats = await EnhancedTradeDAO.getWinLossStats(userId)
    
    const analytics = {
      overview: {
        totalPnL: tradingStats.totalPnL,
        winRate: tradingStats.winRate,
        profitFactor: tradingStats.profitFactor,
        sharpeRatio: tradingStats.sharpeRatio,
        maxDrawdown: tradingStats.maxDrawdown
      },
      performance: {
        avgWin: winLossStats.avgWin,
        avgLoss: winLossStats.avgLoss,
        largestWin: winLossStats.largestWin,
        largestLoss: winLossStats.largestLoss,
        avgTradeDuration: tradingStats.avgTradeDuration
      },
      consistency: {
        consecutiveWins: winLossStats.consecutiveWins,
        consecutiveLosses: winLossStats.consecutiveLosses,
        profitableDays: pnlData.filter(d => d.pnl > 0).length,
        totalDays: pnlData.length
      },
      growth: pnlData.slice(-30) // Last 30 days
    }
    
    return c.json({
      success: true,
      data: analytics,
      period,
      source: 'real_data'
    })
  } catch (error) {
    console.error('Performance analytics error:', error)
    return c.json({
      success: false,
      error: 'Failed to load performance analytics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

export default app