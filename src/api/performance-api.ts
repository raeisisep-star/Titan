import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Define interfaces
interface Trade {
  id: string
  symbol: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  fee: number
  timestamp: number
  status: 'completed' | 'pending' | 'cancelled'
  strategy?: string
  notes?: string
}

interface PerformanceMetrics {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  totalVolume: number
  totalFees: number
  netPnL: number
  averageWin: number
  averageLoss: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  roi: number
  dailyReturns: number[]
  monthlyReturns: { month: string, return: number }[]
  topPerformers: { symbol: string, pnl: number, roi: number }[]
  tradingFrequency: { date: string, count: number }[]
}

interface Portfolio {
  totalValue: number
  totalInvested: number
  totalPnL: number
  roi: number
  holdings: {
    symbol: string
    amount: number
    averagePrice: number
    currentPrice: number
    value: number
    pnl: number
    pnlPercent: number
  }[]
}

// Get comprehensive performance metrics
app.get('/metrics/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // In a real application, fetch from database
    // For demo, we'll generate realistic mock data
    const trades = generateMockTrades(userId)
    const metrics = calculatePerformanceMetrics(trades)
    
    return c.json({
      success: true,
      data: metrics,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Performance metrics error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch performance metrics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get portfolio performance
app.get('/portfolio/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const portfolio = await generatePortfolioData(userId)
    
    return c.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Portfolio performance error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch portfolio performance',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get P&L breakdown by time period
app.get('/pnl/:userId/:period', async (c) => {
  try {
    const userId = c.req.param('userId')
    const period = c.req.param('period') // daily, weekly, monthly, yearly
    
    const pnlBreakdown = generatePnLBreakdown(userId, period)
    
    return c.json({
      success: true,
      data: pnlBreakdown,
      period,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('P&L breakdown error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch P&L breakdown',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get trading statistics
app.get('/stats/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const stats = generateTradingStats(userId)
    
    return c.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Trading stats error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch trading statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Helper functions
function generateMockTrades(userId: string): Trade[] {
  const trades: Trade[] = []
  const symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL', 'DOT', 'LINK', 'LTC']
  const strategies = ['DCA', 'Swing', 'Scalping', 'Trend Following', 'Mean Reversion']
  
  const now = Date.now()
  const thirtyDaysAgo = now - (30 * 24 * 60 * 60 * 1000)
  
  for (let i = 0; i < 150; i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const type = Math.random() > 0.5 ? 'buy' : 'sell'
    const amount = Math.random() * 2 + 0.1 // 0.1 to 2.1
    const price = Math.random() * 50000 + 1000 // $1000 to $51000
    const fee = (amount * price) * 0.001 // 0.1% fee
    const timestamp = Math.random() * (now - thirtyDaysAgo) + thirtyDaysAgo
    const strategy = strategies[Math.floor(Math.random() * strategies.length)]
    
    trades.push({
      id: `trade_${i + 1}`,
      symbol,
      type,
      amount,
      price,
      fee,
      timestamp,
      status: Math.random() > 0.95 ? 'pending' : 'completed',
      strategy,
      notes: `Automated trade via ${strategy} strategy`
    })
  }
  
  return trades.sort((a, b) => b.timestamp - a.timestamp)
}

function calculatePerformanceMetrics(trades: Trade[]): PerformanceMetrics {
  const completedTrades = trades.filter(t => t.status === 'completed')
  
  // Group trades by symbol to calculate P&L
  const symbolTrades: { [key: string]: Trade[] } = {}
  completedTrades.forEach(trade => {
    if (!symbolTrades[trade.symbol]) {
      symbolTrades[trade.symbol] = []
    }
    symbolTrades[trade.symbol].push(trade)
  })
  
  let totalPnL = 0
  let totalVolume = 0
  let totalFees = 0
  let wins = 0
  let losses = 0
  let winAmounts: number[] = []
  let lossAmounts: number[] = []
  const topPerformers: { symbol: string, pnl: number, roi: number }[] = []
  
  // Calculate P&L for each symbol
  for (const [symbol, symbolTradeList] of Object.entries(symbolTrades)) {
    let position = 0
    let investedAmount = 0
    let symbolPnL = 0
    
    for (const trade of symbolTradeList.sort((a, b) => a.timestamp - b.timestamp)) {
      totalVolume += trade.amount * trade.price
      totalFees += trade.fee
      
      if (trade.type === 'buy') {
        position += trade.amount
        investedAmount += trade.amount * trade.price
      } else {
        const soldValue = trade.amount * trade.price
        const costBasis = (investedAmount / position) * trade.amount
        const tradePnL = soldValue - costBasis - trade.fee
        
        symbolPnL += tradePnL
        totalPnL += tradePnL
        
        if (tradePnL > 0) {
          wins++
          winAmounts.push(tradePnL)
        } else {
          losses++
          lossAmounts.push(Math.abs(tradePnL))
        }
        
        position -= trade.amount
        investedAmount -= costBasis
      }
    }
    
    const symbolROI = investedAmount > 0 ? (symbolPnL / investedAmount) * 100 : 0
    topPerformers.push({ symbol, pnl: symbolPnL, roi: symbolROI })
  }
  
  const totalTrades = wins + losses
  const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0
  const averageWin = winAmounts.length > 0 ? winAmounts.reduce((a, b) => a + b, 0) / winAmounts.length : 0
  const averageLoss = lossAmounts.length > 0 ? lossAmounts.reduce((a, b) => a + b, 0) / lossAmounts.length : 0
  const profitFactor = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? Infinity : 0
  const netPnL = totalPnL - totalFees
  const roi = totalVolume > 0 ? (netPnL / totalVolume) * 100 : 0
  
  // Generate daily returns (mock data)
  const dailyReturns = Array.from({ length: 30 }, () => (Math.random() - 0.5) * 0.1) // -5% to +5%
  
  // Generate monthly returns
  const monthlyReturns = [
    { month: 'فروردین', return: 12.5 },
    { month: 'اردیبهشت', return: -3.2 },
    { month: 'خرداد', return: 8.7 },
    { month: 'تیر', return: 15.3 },
    { month: 'مرداد', return: -1.8 },
    { month: 'شهریور', return: 22.1 }
  ]
  
  // Calculate Sharpe ratio (simplified)
  const avgReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length
  const stdDev = Math.sqrt(dailyReturns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / dailyReturns.length)
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(365) : 0
  
  // Calculate max drawdown (simplified)
  let peak = 0
  let maxDrawdown = 0
  let runningTotal = 0
  
  for (const ret of dailyReturns) {
    runningTotal += ret
    if (runningTotal > peak) {
      peak = runningTotal
    }
    const drawdown = (peak - runningTotal) / peak * 100
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
    }
  }
  
  // Generate trading frequency data
  const tradingFrequency = Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 10) + 1
  }))
  
  return {
    totalTrades,
    winningTrades: wins,
    losingTrades: losses,
    winRate,
    totalPnL,
    totalVolume,
    totalFees,
    netPnL,
    averageWin,
    averageLoss,
    profitFactor,
    sharpeRatio,
    maxDrawdown,
    roi,
    dailyReturns,
    monthlyReturns,
    topPerformers: topPerformers.sort((a, b) => b.pnl - a.pnl).slice(0, 5),
    tradingFrequency
  }
}

async function generatePortfolioData(userId: string): Promise<Portfolio> {
  const symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL']
  const holdings = []
  let totalValue = 0
  let totalInvested = 0
  
  for (const symbol of symbols) {
    const amount = Math.random() * 5 + 0.1
    const averagePrice = Math.random() * 40000 + 5000
    const currentPrice = averagePrice * (0.8 + Math.random() * 0.4) // ±20% from average
    const value = amount * currentPrice
    const invested = amount * averagePrice
    const pnl = value - invested
    const pnlPercent = (pnl / invested) * 100
    
    holdings.push({
      symbol,
      amount,
      averagePrice,
      currentPrice,
      value,
      pnl,
      pnlPercent
    })
    
    totalValue += value
    totalInvested += invested
  }
  
  const totalPnL = totalValue - totalInvested
  const roi = (totalPnL / totalInvested) * 100
  
  return {
    totalValue,
    totalInvested,
    totalPnL,
    roi,
    holdings: holdings.sort((a, b) => b.value - a.value)
  }
}

function generatePnLBreakdown(userId: string, period: string) {
  const now = new Date()
  let data: { date: string, pnl: number, volume: number }[] = []
  
  switch (period) {
    case 'daily':
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
        data.push({
          date: date.toISOString().split('T')[0],
          pnl: (Math.random() - 0.5) * 2000, // -$1000 to +$1000
          volume: Math.random() * 50000 + 10000 // $10k to $60k
        })
      }
      break
      
    case 'weekly':
      for (let i = 11; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000)
        data.push({
          date: `Week ${12 - i}`,
          pnl: (Math.random() - 0.5) * 10000, // -$5000 to +$5000
          volume: Math.random() * 200000 + 50000 // $50k to $250k
        })
      }
      break
      
    case 'monthly':
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      for (let i = 0; i < 12; i++) {
        data.push({
          date: months[i],
          pnl: (Math.random() - 0.5) * 20000, // -$10000 to +$10000
          volume: Math.random() * 500000 + 100000 // $100k to $600k
        })
      }
      break
      
    default:
      data = generatePnLBreakdown(userId, 'daily')
  }
  
  return {
    period,
    data,
    summary: {
      totalPnL: data.reduce((sum, item) => sum + item.pnl, 0),
      totalVolume: data.reduce((sum, item) => sum + item.volume, 0),
      averagePnL: data.reduce((sum, item) => sum + item.pnl, 0) / data.length,
      bestPeriod: data.reduce((best, current) => current.pnl > best.pnl ? current : best),
      worstPeriod: data.reduce((worst, current) => current.pnl < worst.pnl ? current : worst)
    }
  }
}

function generateTradingStats(userId: string) {
  return {
    streaks: {
      currentWinStreak: Math.floor(Math.random() * 10) + 1,
      currentLossStreak: 0,
      longestWinStreak: Math.floor(Math.random() * 20) + 5,
      longestLossStreak: Math.floor(Math.random() * 8) + 2
    },
    timing: {
      bestTradingHour: Math.floor(Math.random() * 24),
      worstTradingHour: Math.floor(Math.random() * 24),
      averageHoldTime: Math.floor(Math.random() * 72) + 2, // 2-74 hours
      fastestTrade: Math.floor(Math.random() * 30) + 1, // 1-30 minutes
      longestTrade: Math.floor(Math.random() * 168) + 24 // 24-192 hours
    },
    performance: {
      bestDay: {
        date: '2024-01-15',
        pnl: Math.floor(Math.random() * 5000) + 1000,
        trades: Math.floor(Math.random() * 20) + 5
      },
      worstDay: {
        date: '2024-01-08',
        pnl: -(Math.floor(Math.random() * 3000) + 500),
        trades: Math.floor(Math.random() * 15) + 3
      },
      consistency: Math.floor(Math.random() * 30) + 60, // 60-90%
      reliability: Math.floor(Math.random() * 25) + 70 // 70-95%
    },
    risk: {
      averageRiskPerTrade: Math.random() * 3 + 1, // 1-4%
      maxRiskTaken: Math.random() * 8 + 5, // 5-13%
      riskRewardRatio: Math.random() * 2 + 1.5, // 1.5-3.5
      volatilityExposure: Math.random() * 40 + 30 // 30-70%
    }
  }
}

export default app