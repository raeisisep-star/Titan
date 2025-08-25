import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'
import ExchangeService from '../../services/exchange-service'

export const tradingRoutes = new Hono<{ Bindings: Env }>()

// Get active trades
tradingRoutes.get('/active', async (c) => {
  try {
    return c.json({
      success: true,
      data: [
        {
          id: 1,
          pair: 'BTC/USDT',
          type: 'BUY',
          entry_price: 43200,
          current_price: 43450,
          quantity: 0.15,
          profit_loss: 37.50,
          profit_percentage: 0.58,
          status: 'open',
          ai_agent: 'Agent #7',
          confidence: 88,
          opened_at: '2024-08-22T10:15:00Z',
          target_price: 44500,
          stop_loss: 42800
        },
        {
          id: 2,
          pair: 'ETH/USDT',
          type: 'SELL',
          entry_price: 2850,
          current_price: 2820,
          quantity: 2.5,
          profit_loss: -75.00,
          profit_percentage: -1.05,
          status: 'open',
          ai_agent: 'Agent #12',
          confidence: 75,
          opened_at: '2024-08-22T09:45:00Z',
          target_price: 2750,
          stop_loss: 2900
        },
        {
          id: 3,
          pair: 'ADA/USDT',
          type: 'BUY',
          entry_price: 0.45,
          current_price: 0.47,
          quantity: 10000,
          profit_loss: 200.00,
          profit_percentage: 4.44,
          status: 'open',
          ai_agent: 'Agent #3',
          confidence: 92,
          opened_at: '2024-08-22T08:30:00Z',
          target_price: 0.52,
          stop_loss: 0.42
        }
      ]
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت معاملات فعال' }, 500)
  }
})

// Get trading history
tradingRoutes.get('/history', async (c) => {
  try {
    return c.json({
      success: true,
      data: [
        {
          id: 101,
          pair: 'SOL/USDT',
          type: 'BUY',
          entry_price: 156.20,
          exit_price: 162.30,
          quantity: 5,
          profit_loss: 30.50,
          profit_percentage: 3.91,
          status: 'closed',
          ai_agent: 'Agent #5',
          confidence: 85,
          opened_at: '2024-08-22T07:15:00Z',
          closed_at: '2024-08-22T09:20:00Z',
          duration: '2h 5m'
        },
        {
          id: 102,
          pair: 'MATIC/USDT',
          type: 'SELL',
          entry_price: 0.89,
          exit_price: 0.85,
          quantity: 1000,
          profit_loss: 40.00,
          profit_percentage: 4.49,
          status: 'closed',
          ai_agent: 'Agent #9',
          confidence: 78,
          opened_at: '2024-08-21T15:30:00Z',
          closed_at: '2024-08-21T18:45:00Z',
          duration: '3h 15m'
        }
      ]
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت تاریخچه معاملات' }, 500)
  }
})

// Execute manual trade
tradingRoutes.post('/execute', async (c) => {
  try {
    const { pair, type, quantity, price } = await c.req.json()
    
    if (!pair || !type || !quantity) {
      return c.json({ success: false, message: 'اطلاعات معامله ناقص است' }, 400)
    }

    // Simulate trade execution
    const tradeId = Math.floor(Math.random() * 10000) + 1000
    
    return c.json({
      success: true,
      message: 'معامله با موفقیت اجرا شد',
      data: {
        trade_id: tradeId,
        pair,
        type,
        quantity,
        price: price || 'market',
        status: 'executed',
        executed_at: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در اجرای معامله' }, 500)
  }
})

// Get trading signals
tradingRoutes.get('/signals', async (c) => {
  try {
    return c.json({
      success: true,
      data: [
        {
          id: 1,
          pair: 'BTC/USDT',
          signal: 'BUY',
          strength: 'strong',
          confidence: 92,
          price: 43200,
          target: 44500,
          stop_loss: 42800,
          ai_agent: 'Agent #1',
          reasons: ['RSI oversold', 'Breaking resistance', 'Volume increase'],
          created_at: '2024-08-22T11:30:00Z'
        },
        {
          id: 2,
          pair: 'ETH/USDT',
          signal: 'SELL',
          strength: 'medium',
          confidence: 76,
          price: 2820,
          target: 2750,
          stop_loss: 2880,
          ai_agent: 'Agent #4',
          reasons: ['Bearish divergence', 'Resistance rejection'],
          created_at: '2024-08-22T11:25:00Z'
        }
      ]
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت سیگنال‌های معاملاتی' }, 500)
  }
})

// Get trading performance
tradingRoutes.get('/performance', async (c) => {
  try {
    return c.json({
      success: true,
      data: {
        total_trades: 156,
        winning_trades: 124,
        losing_trades: 32,
        win_rate: 79.5,
        total_profit: 12450.75,
        average_profit: 79.81,
        max_profit: 850.25,
        max_loss: -125.50,
        sharpe_ratio: 2.34,
        max_drawdown: 3.2,
        profit_factor: 3.8,
        monthly_performance: [
          { month: 'فروردین', profit: 2340.50, trades: 28 },
          { month: 'اردیبهشت', profit: 1890.25, trades: 24 },
          { month: 'خرداد', profit: 3120.75, trades: 32 },
          { month: 'تیر', profit: 2580.40, trades: 26 },
          { month: 'مرداد', profit: 2518.85, trades: 28 }
        ]
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت عملکرد معاملاتی' }, 500)
  }
})

// Get autopilot status
tradingRoutes.get('/autopilot', async (c) => {
  try {
    const { AutopilotEngine } = await import('./autopilot')
    const autopilot = AutopilotEngine.getInstance()
    const config = autopilot.getConfig()
    const stats = autopilot.getTradingStats()
    const activeTrades = autopilot.getActiveTrades()

    return c.json({
      success: true,
      data: {
        enabled: config.enabled,
        mode: config.mode === 'semi_auto' ? 'نیمه‌خودکار' : 'تمام‌خودکار',
        max_concurrent_trades: config.max_concurrent_trades,
        current_trades: activeTrades.length,
        risk_level: config.risk_level,
        target_profit: config.target_profit,
        current_progress: stats.total_profit,
        progress_percentage: stats.progress_percentage,
        budget: config.budget,
        budget_used: stats.budget_used,
        success_rate: stats.success_rate,
        emergency_stop: config.emergency_stop,
        last_action: activeTrades.length > 0 ? {
          action: `${activeTrades[0]?.type} ${activeTrades[0]?.pair}`,
          agent: `Agent #${activeTrades[0]?.ai_agent_id}`,
          time: activeTrades[0] ? getTimeAgo(activeTrades[0].opened_at) : 'نامشخص',
          result: activeTrades[0]?.status
        } : null
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت وضعیت خودکار' }, 500)
  }
})

// Update autopilot settings
tradingRoutes.post('/autopilot', async (c) => {
  try {
    const settings = await c.req.json()
    const { AutopilotEngine } = await import('./autopilot')
    const autopilot = AutopilotEngine.getInstance()
    
    // Update autopilot configuration
    autopilot.updateConfig(settings)
    
    return c.json({
      success: true,
      message: 'تنظیمات خودکار به‌روزرسانی شد',
      data: autopilot.getConfig()
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در به‌روزرسانی تنظیمات' }, 500)
  }
})

// Start autopilot
tradingRoutes.post('/autopilot/start', async (c) => {
  try {
    const { AutopilotEngine } = await import('./autopilot')
    const autopilot = AutopilotEngine.getInstance()
    
    const success = autopilot.enableAutopilot()
    
    if (!success) {
      return c.json({
        success: false,
        message: 'امکان شروع خودکار وجود ندارد - سیستم در حالت توقف اضطراری است'
      }, 400)
    }

    return c.json({
      success: true,
      message: 'سیستم خودکار فعال شد - شروع اسکن برای فرصت‌های معاملاتی',
      data: autopilot.getConfig()
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در فعال‌سازی خودکار' }, 500)
  }
})

// Stop autopilot
tradingRoutes.post('/autopilot/stop', async (c) => {
  try {
    const { AutopilotEngine } = await import('./autopilot')
    const autopilot = AutopilotEngine.getInstance()
    
    autopilot.disableAutopilot()

    return c.json({
      success: true,
      message: 'سیستم خودکار متوقف شد',
      data: autopilot.getConfig()
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در متوقف کردن خودکار' }, 500)
  }
})

// Emergency stop autopilot
tradingRoutes.post('/autopilot/emergency-stop', async (c) => {
  try {
    const { AutopilotEngine } = await import('./autopilot')
    const autopilot = AutopilotEngine.getInstance()
    
    autopilot.emergencyStop()

    return c.json({
      success: true,
      message: 'توقف اضطراری فعال شد - تمام معاملات متوقف شدند',
      data: {
        emergency_stop: true,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در فعال‌سازی توقف اضطراری' }, 500)
  }
})

// Get opportunities detected by autopilot
tradingRoutes.get('/opportunities', async (c) => {
  try {
    // Simulated opportunities detected by AI agents
    return c.json({
      success: true,
      data: [
        {
          id: 1,
          exchange: 'Binance',
          pair: 'BTC/USDT',
          opportunity_type: 'technical_breakout',
          confidence: 88.5,
          expected_profit: 2.3,
          risk_score: 3.2,
          ai_agent: 'Technical Analyst',
          expiry_time: '5 دقیقه',
          reasoning: 'شکست مقاومت کلیدی با حجم بالا',
          action_required: 'BUY'
        },
        {
          id: 2,
          exchange: 'Coinbase vs Binance',
          pair: 'ETH/USD',
          opportunity_type: 'arbitrage',
          confidence: 95.2,
          expected_profit: 0.8,
          risk_score: 1.5,
          ai_agent: 'Arbitrage Hunter',
          expiry_time: '2 دقیقه',
          reasoning: 'اختلاف قیمت 0.8% بین دو صرافی',
          action_required: 'ARBITRAGE'
        },
        {
          id: 3,
          exchange: 'Kraken',
          pair: 'SOL/USDT',
          opportunity_type: 'momentum',
          confidence: 82.7,
          expected_profit: 4.1,
          risk_score: 4.8,
          ai_agent: 'Momentum Trader',
          expiry_time: '10 دقیقه',
          reasoning: 'مومنتوم صعودی قوی با حمایت اخبار مثبت',
          action_required: 'BUY'
        },
        {
          id: 4,
          exchange: 'Multiple',
          pair: 'ADA/USDT',
          opportunity_type: 'news_based',
          confidence: 76.3,
          expected_profit: 3.2,
          risk_score: 5.1,
          ai_agent: 'News Analyzer',
          expiry_time: '30 دقیقه',
          reasoning: 'اخبار مثبت توسعه شبکه کاردانو',
          action_required: 'BUY'
        }
      ]
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت فرصت‌های معاملاتی' }, 500)
  }
})

// Get live market data
tradingRoutes.get('/market/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol')
    const exchange = c.req.query('exchange') || 'mock'
    
    const exchangeService = new ExchangeService(c.env)
    const marketData = await exchangeService.getMarketData(symbol, exchange)
    
    return c.json({
      success: true,
      data: marketData
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت اطلاعات بازار' }, 500)
  }
})

// Get order book
tradingRoutes.get('/orderbook/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol')
    const exchange = c.req.query('exchange') || 'mock'
    
    const exchangeService = new ExchangeService(c.env)
    const orderBook = await exchangeService.getOrderBook(symbol, exchange)
    
    return c.json({
      success: true,
      data: orderBook
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت دفتر سفارشات' }, 500)
  }
})

// Place new order
tradingRoutes.post('/order', async (c) => {
  try {
    const { symbol, side, type, quantity, price, exchange } = await c.req.json()
    
    if (!symbol || !side || !type || !quantity || !exchange) {
      return c.json({ success: false, message: 'اطلاعات سفارش ناقص است' }, 400)
    }
    
    const exchangeService = new ExchangeService(c.env)
    const orderResponse = await exchangeService.placeOrder({
      symbol,
      side,
      type,
      quantity,
      price,
      exchange
    })
    
    return c.json({
      success: true,
      message: 'سفارش با موفقیت ثبت شد',
      data: orderResponse
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در ثبت سفارش' }, 500)
  }
})

// Cancel order
tradingRoutes.delete('/order/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId')
    const symbol = c.req.query('symbol')
    const exchange = c.req.query('exchange') || 'mock'
    
    if (!symbol) {
      return c.json({ success: false, message: 'نماد ارز الزامی است' }, 400)
    }
    
    const exchangeService = new ExchangeService(c.env)
    const success = await exchangeService.cancelOrder(orderId, symbol, exchange)
    
    if (success) {
      return c.json({
        success: true,
        message: 'سفارش لغو شد'
      })
    } else {
      return c.json({ success: false, message: 'امکان لغو سفارش وجود ندارد' }, 400)
    }
  } catch (error) {
    return c.json({ success: false, message: 'خطا در لغو سفارش' }, 500)
  }
})

// Get order status
tradingRoutes.get('/order/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId')
    const symbol = c.req.query('symbol')
    const exchange = c.req.query('exchange') || 'mock'
    
    if (!symbol) {
      return c.json({ success: false, message: 'نماد ارز الزامی است' }, 400)
    }
    
    const exchangeService = new ExchangeService(c.env)
    const orderStatus = await exchangeService.getOrderStatus(orderId, symbol, exchange)
    
    return c.json({
      success: true,
      data: orderStatus
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت وضعیت سفارش' }, 500)
  }
})

// Get available exchanges
tradingRoutes.get('/exchanges', async (c) => {
  try {
    const exchangeService = new ExchangeService(c.env)
    const exchanges = exchangeService.getAvailableExchanges()
    
    // Check health of each exchange
    const exchangeHealth = await Promise.all(
      exchanges.map(async (exchange) => {
        const isHealthy = await exchangeService.checkExchangeHealth(exchange)
        return { name: exchange, healthy: isHealthy }
      })
    )
    
    return c.json({
      success: true,
      data: {
        exchanges: exchangeHealth,
        total_exchanges: exchanges.length,
        healthy_exchanges: exchangeHealth.filter(e => e.healthy).length
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت اطلاعات صرافی‌ها' }, 500)
  }
})

// Get account balances
tradingRoutes.get('/balances', async (c) => {
  try {
    const exchange = c.req.query('exchange') || 'mock'
    
    const exchangeService = new ExchangeService(c.env)
    const balances = await exchangeService.getBalances(exchange)
    const portfolioValue = await exchangeService.calculatePortfolioValue(exchange)
    
    return c.json({
      success: true,
      data: {
        balances,
        total_portfolio_value: portfolioValue,
        exchange,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت موجودی حساب' }, 500)
  }
})

// Execute AI trading strategy
tradingRoutes.post('/ai-trade', async (c) => {
  try {
    const { symbol, strategy, risk_level, amount, exchange } = await c.req.json()
    
    if (!symbol || !strategy || !amount) {
      return c.json({ success: false, message: 'اطلاعات معامله ناقص است' }, 400)
    }
    
    const exchangeService = new ExchangeService(c.env)
    
    // Get current market data
    const marketData = await exchangeService.getMarketData(symbol, exchange || 'mock')
    
    // Simple AI trading logic based on strategy
    let side: 'buy' | 'sell' = 'buy'
    let quantity = amount / marketData.price
    
    if (strategy === 'momentum') {
      side = marketData.changePercent24h > 2 ? 'buy' : 'sell'
    } else if (strategy === 'mean_reversion') {
      side = marketData.changePercent24h < -3 ? 'buy' : 'sell'
    } else if (strategy === 'dca') {
      side = 'buy' // Dollar Cost Averaging always buys
      quantity = amount / marketData.price
    }
    
    // Adjust quantity based on risk level
    const riskMultiplier = risk_level === 'high' ? 1.5 : risk_level === 'low' ? 0.5 : 1
    quantity *= riskMultiplier
    
    // Place the order
    const orderResponse = await exchangeService.placeOrder({
      symbol,
      side,
      type: 'market',
      quantity: Math.round(quantity * 100000) / 100000, // Round to 5 decimal places
      exchange: exchange || 'mock'
    })
    
    return c.json({
      success: true,
      message: 'معامله AI با موفقیت اجرا شد',
      data: {
        strategy,
        market_analysis: {
          current_price: marketData.price,
          change_24h: marketData.changePercent24h,
          recommendation: side.toUpperCase()
        },
        order: orderResponse,
        risk_assessment: {
          level: risk_level || 'medium',
          multiplier: riskMultiplier
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در اجرای معامله AI' }, 500)
  }
})

// Helper function to calculate time ago  
function getTimeAgo(timestamp: string): string {
  const now = new Date().getTime()
  const past = new Date(timestamp).getTime()
  const diffMinutes = Math.floor((now - past) / (1000 * 60))
  
  if (diffMinutes < 1) return 'اکنون'
  if (diffMinutes < 60) return `${diffMinutes} دقیقه پیش`
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours} ساعت پیش`
  
  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} روز پیش`
}

export default tradingRoutes