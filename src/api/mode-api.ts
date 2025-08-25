import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Define interfaces
interface TradingMode {
  userId: string
  mode: 'demo' | 'live'
  demoBalance: {
    USDT: number
    BTC: number
    ETH: number
    BNB: number
    ADA: number
    SOL: number
    DOT: number
    LINK: number
    LTC: number
  }
  liveConnected: boolean
  exchangeKeys: {
    [key: string]: {
      apiKey: string
      secretKey: string
      isActive: boolean
      exchange: string
    }
  }
  createdAt: number
  updatedAt: number
}

interface VirtualTrade {
  id: string
  userId: string
  symbol: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  total: number
  fee: number
  timestamp: number
  status: 'pending' | 'completed' | 'cancelled'
  demoMode: boolean
}

interface DemoPortfolio {
  userId: string
  totalValue: number
  totalInvested: number
  totalPnL: number
  roi: number
  lastUpdated: number
  holdings: {
    [symbol: string]: {
      amount: number
      averagePrice: number
      currentPrice: number
      value: number
      pnl: number
      pnlPercent: number
    }
  }
}

// Get user's current trading mode
app.get('/status/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // Generate or get user's mode data
    const modeData = generateUserModeData(userId)
    
    return c.json({
      success: true,
      data: modeData,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Mode status error:', error)
    return c.json({
      success: false,
      error: 'Failed to get mode status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Switch trading mode (demo/live)
app.post('/switch', async (c) => {
  try {
    const { userId, mode, confirmation } = await c.req.json()
    
    if (!userId || !mode || !['demo', 'live'].includes(mode)) {
      return c.json({
        success: false,
        error: 'Invalid parameters',
        message: 'userId and valid mode (demo/live) are required'
      }, 400)
    }
    
    // For switching to live mode, require confirmation
    if (mode === 'live' && !confirmation) {
      return c.json({
        success: false,
        error: 'Confirmation required',
        message: 'Switching to live mode requires confirmation',
        requiresConfirmation: true
      }, 400)
    }
    
    // Update user's mode
    const updatedMode = updateUserMode(userId, mode)
    
    return c.json({
      success: true,
      data: updatedMode,
      message: `Trading mode switched to ${mode === 'demo' ? 'Demo' : 'Live'}`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Mode switch error:', error)
    return c.json({
      success: false,
      error: 'Failed to switch mode',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get demo wallet balance
app.get('/demo/wallet/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const demoWallet = generateDemoWallet(userId)
    
    return c.json({
      success: true,
      data: demoWallet,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Demo wallet error:', error)
    return c.json({
      success: false,
      error: 'Failed to get demo wallet',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Add funds to demo wallet
app.post('/demo/add-funds', async (c) => {
  try {
    const { userId, currency, amount } = await c.req.json()
    
    if (!userId || !currency || !amount || amount <= 0) {
      return c.json({
        success: false,
        error: 'Invalid parameters',
        message: 'userId, currency, and positive amount are required'
      }, 400)
    }
    
    // Add funds to demo wallet
    const updatedWallet = addDemoFunds(userId, currency, amount)
    
    return c.json({
      success: true,
      data: updatedWallet,
      message: `Added ${amount} ${currency} to demo wallet`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Add demo funds error:', error)
    return c.json({
      success: false,
      error: 'Failed to add demo funds',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Reset demo wallet to default
app.post('/demo/reset-wallet', async (c) => {
  try {
    const { userId } = await c.req.json()
    
    const resetWallet = resetDemoWallet(userId)
    
    return c.json({
      success: true,
      data: resetWallet,
      message: 'Demo wallet reset to default values',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Reset demo wallet error:', error)
    return c.json({
      success: false,
      error: 'Failed to reset demo wallet',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Execute demo trade
app.post('/demo/trade', async (c) => {
  try {
    const { userId, symbol, type, amount, price } = await c.req.json()
    
    if (!userId || !symbol || !type || !amount || !price) {
      return c.json({
        success: false,
        error: 'Invalid parameters',
        message: 'All trade parameters are required'
      }, 400)
    }
    
    const trade = executeDemoTrade(userId, symbol, type, amount, price)
    
    return c.json({
      success: true,
      data: trade,
      message: `Demo ${type} order executed successfully`,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Demo trade error:', error)
    return c.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to execute demo trade',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get demo portfolio
app.get('/demo/portfolio/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const portfolio = calculateDemoPortfolio(userId)
    
    return c.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Demo portfolio error:', error)
    return c.json({
      success: false,
      error: 'Failed to get demo portfolio',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get demo trading history
app.get('/demo/history/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const limit = parseInt(c.req.query('limit') || '50')
    
    const history = getDemoTradingHistory(userId, limit)
    
    return c.json({
      success: true,
      data: history,
      count: history.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Demo history error:', error)
    return c.json({
      success: false,
      error: 'Failed to get demo trading history',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Helper functions
function generateUserModeData(userId: string): TradingMode {
  return {
    userId,
    mode: 'demo', // Default to demo mode
    demoBalance: {
      USDT: 10000, // Default $10,000 USDT
      BTC: 0.1,    // Some BTC for testing
      ETH: 2.5,    // Some ETH for testing
      BNB: 20,     // Some BNB for testing
      ADA: 5000,   // Some ADA for testing
      SOL: 100,    // Some SOL for testing
      DOT: 500,    // Some DOT for testing
      LINK: 300,   // Some LINK for testing
      LTC: 50      // Some LTC for testing
    },
    liveConnected: false,
    exchangeKeys: {},
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

function updateUserMode(userId: string, mode: 'demo' | 'live'): TradingMode {
  const currentData = generateUserModeData(userId)
  return {
    ...currentData,
    mode,
    updatedAt: Date.now()
  }
}

function generateDemoWallet(userId: string) {
  const modeData = generateUserModeData(userId)
  
  // Simulate current prices for calculation
  const currentPrices = {
    USDT: 1,
    BTC: 95000,
    ETH: 3500,
    BNB: 650,
    ADA: 0.45,
    SOL: 200,
    DOT: 7.5,
    LINK: 15,
    LTC: 90
  }
  
  const wallet = {
    balances: modeData.demoBalance,
    totalValue: 0,
    breakdown: {} as any
  }
  
  // Calculate total value and breakdown
  for (const [symbol, amount] of Object.entries(modeData.demoBalance)) {
    const price = currentPrices[symbol as keyof typeof currentPrices] || 0
    const value = amount * price
    wallet.totalValue += value
    wallet.breakdown[symbol] = {
      amount,
      price,
      value,
      percentage: 0 // Will be calculated after total
    }
  }
  
  // Calculate percentages
  for (const symbol in wallet.breakdown) {
    wallet.breakdown[symbol].percentage = (wallet.breakdown[symbol].value / wallet.totalValue) * 100
  }
  
  return wallet
}

function addDemoFunds(userId: string, currency: string, amount: number) {
  // In real implementation, this would update the database
  const wallet = generateDemoWallet(userId)
  if (wallet.balances[currency as keyof typeof wallet.balances] !== undefined) {
    wallet.balances[currency as keyof typeof wallet.balances] += amount
  }
  return generateDemoWallet(userId) // Recalculate
}

function resetDemoWallet(userId: string) {
  // Reset to default values
  return generateDemoWallet(userId)
}

function executeDemoTrade(userId: string, symbol: string, type: 'buy' | 'sell', amount: number, price: number): VirtualTrade {
  const total = amount * price
  const fee = total * 0.001 // 0.1% fee
  
  // Check if user has sufficient balance (simplified)
  const wallet = generateDemoWallet(userId)
  
  if (type === 'buy') {
    if (wallet.balances.USDT < total + fee) {
      throw new Error('Insufficient USDT balance for this trade')
    }
  } else {
    const symbolBalance = wallet.balances[symbol as keyof typeof wallet.balances] || 0
    if (symbolBalance < amount) {
      throw new Error(`Insufficient ${symbol} balance for this trade`)
    }
  }
  
  const trade: VirtualTrade = {
    id: `demo_trade_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId,
    symbol,
    type,
    amount,
    price,
    total,
    fee,
    timestamp: Date.now(),
    status: 'completed',
    demoMode: true
  }
  
  // In real implementation, this would update the user's demo balance
  return trade
}

function calculateDemoPortfolio(userId: string): DemoPortfolio {
  const wallet = generateDemoWallet(userId)
  
  // Simulate some trading history for P&L calculation
  const totalInvested = 15000 // User started with some investments
  const currentValue = wallet.totalValue
  const totalPnL = currentValue - totalInvested
  const roi = (totalPnL / totalInvested) * 100
  
  const holdings: any = {}
  
  // Convert wallet balances to holdings format
  for (const [symbol, data] of Object.entries(wallet.breakdown)) {
    if (data.amount > 0) {
      // Simulate average price (slightly different from current for P&L)
      const avgPrice = data.price * (0.9 + Math.random() * 0.2) // ±10% variation
      const invested = data.amount * avgPrice
      
      holdings[symbol] = {
        amount: data.amount,
        averagePrice: avgPrice,
        currentPrice: data.price,
        value: data.value,
        pnl: data.value - invested,
        pnlPercent: ((data.value - invested) / invested) * 100
      }
    }
  }
  
  return {
    userId,
    totalValue: currentValue,
    totalInvested,
    totalPnL,
    roi,
    lastUpdated: Date.now(),
    holdings
  }
}

function getDemoTradingHistory(userId: string, limit: number): VirtualTrade[] {
  const trades: VirtualTrade[] = []
  const symbols = ['BTC', 'ETH', 'BNB', 'ADA', 'SOL']
  
  // Generate mock trading history
  for (let i = 0; i < Math.min(limit, 20); i++) {
    const symbol = symbols[Math.floor(Math.random() * symbols.length)]
    const type = Math.random() > 0.5 ? 'buy' : 'sell'
    const amount = Math.random() * 2 + 0.1
    const price = Math.random() * 50000 + 1000
    const total = amount * price
    
    trades.push({
      id: `demo_trade_${Date.now() - i * 3600000}`,
      userId,
      symbol,
      type,
      amount,
      price,
      total,
      fee: total * 0.001,
      timestamp: Date.now() - i * 3600000, // Spread over hours
      status: 'completed',
      demoMode: true
    })
  }
  
  return trades.sort((a, b) => b.timestamp - a.timestamp)
}

export default app