import { Hono } from 'hono'

const app = new Hono()

// Get portfolio holdings and metrics
app.get('/holdings', async (c) => {
  try {
    // Mock portfolio data
    const mockHoldings = [
      {
        symbol: 'BTC',
        amount: 2.5,
        avgPrice: 42500,
        currentPrice: 45000,
        value: 112500,
        pnl: 6250,
        pnlPercent: 5.88,
        allocation: 45,
        volatility: 28.5,
        lastUpdate: Date.now() - 300000
      },
      {
        symbol: 'ETH',
        amount: 15,
        avgPrice: 2850,
        currentPrice: 3200,
        value: 48000,
        pnl: 5250,
        pnlPercent: 12.28,
        allocation: 35,
        volatility: 32.1,
        lastUpdate: Date.now() - 180000
      },
      {
        symbol: 'ADA',
        amount: 5000,
        avgPrice: 0.52,
        currentPrice: 0.48,
        value: 2400,
        pnl: -200,
        pnlPercent: -7.69,
        allocation: 20,
        volatility: 45.2,
        lastUpdate: Date.now() - 120000
      }
    ]

    const allocation = mockHoldings.map(h => ({
      symbol: h.symbol,
      percentage: h.allocation
    }))

    return c.json({
      success: true,
      data: mockHoldings,
      allocation
    })
  } catch (error) {
    console.error('Portfolio holdings error:', error)
    return c.json({
      success: false,
      error: 'Failed to load portfolio holdings'
    }, 500)
  }
})

// Get advanced portfolio analytics
app.get('/advanced', async (c) => {
  try {
    // Generate advanced portfolio metrics
    const currentTime = Date.now()
    const symbols = ['BTC', 'ETH', 'ADA', 'DOT', 'LINK', 'UNI', 'AAVE', 'MATIC']
    
    const portfolioData = {
      totalValue: 287500 + (Math.random() - 0.5) * 50000,
      totalPnL: 15750 + (Math.random() - 0.3) * 10000,
      totalROI: 5.8 + (Math.random() - 0.2) * 8,
      dailyChange: (Math.random() - 0.4) * 2000,
      winRate: 68 + Math.random() * 20,
      sharpeRatio: 1.85 + Math.random() * 0.8,
      maxDrawdown: -(Math.random() * 12 + 3),
      calmarRatio: 0.95 + Math.random() * 0.6,
      sortinoRatio: 2.1 + Math.random() * 0.9,
      var95: -(Math.random() * 8000 + 2000),
      beta: 0.85 + Math.random() * 0.6,
      alpha: Math.random() * 8 - 2,
      volatility: Math.random() * 25 + 15,
      holdings: symbols.map((symbol, index) => ({
        symbol,
        amount: Math.random() * 100 + 10,
        avgPrice: Math.random() * 50000 + 1000,
        currentPrice: Math.random() * 55000 + 1200,
        value: Math.random() * 50000 + 10000,
        pnl: Math.random() * 10000 - 2000,
        pnlPercent: Math.random() * 20 - 5,
        allocation: Math.random() * 25 + 5,
        volatility: Math.random() * 30 + 10,
        lastUpdate: currentTime - Math.random() * 3600000
      }))
    }

    // Generate performance data
    const performanceData = {
      labels: [],
      data: []
    }
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(currentTime - i * 24 * 60 * 60 * 1000)
      performanceData.labels.push(date.toLocaleDateString('fa-IR'))
      
      const baseValue = 250000
      const randomWalk = (Math.random() - 0.5) * 5000
      const trend = (30 - i) * 300 // Slight upward trend
      
      performanceData.data.push(baseValue + randomWalk + trend)
    }

    return c.json({
      success: true,
      data: portfolioData,
      performance: performanceData,
      timestamp: currentTime
    })
  } catch (error) {
    console.error('Advanced portfolio error:', error)
    return c.json({
      success: false,
      error: 'Failed to load advanced portfolio data'
    }, 500)
  }
})

// Get portfolio performance metrics
app.get('/performance', async (c) => {
  try {
    const mockPerformance = {
      totalReturn: 15.75,
      annualizedReturn: 12.3,
      sharpeRatio: 1.85,
      maxDrawdown: -8.5,
      winRate: 68.5,
      profitFactor: 2.1,
      calmarRatio: 1.45,
      sortinoRatio: 2.3
    }

    return c.json({
      success: true,
      data: mockPerformance
    })
  } catch (error) {
    console.error('Portfolio performance error:', error)
    return c.json({
      success: false,
      error: 'Failed to load portfolio performance'
    }, 500)
  }
})

// Get portfolio risk metrics
app.get('/risk', async (c) => {
  try {
    const mockRisk = {
      var95: -12500.50,
      var99: -18750.75,
      beta: 0.85,
      alpha: 2.3,
      volatility: 18.5,
      correlation: {
        btc: 0.65,
        eth: 0.72,
        market: 0.58
      }
    }

    return c.json({
      success: true,
      data: mockRisk
    })
  } catch (error) {
    console.error('Portfolio risk error:', error)
    return c.json({
      success: false,
      error: 'Failed to load portfolio risk metrics'
    }, 500)
  }
})

export default app