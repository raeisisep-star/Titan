import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Define interfaces
interface Alert {
  id: string
  type: 'price' | 'technical' | 'news' | 'portfolio'
  symbol?: string
  title: string
  message: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: number
  isRead: boolean
  actionRequired?: boolean
  data?: any
}

interface AlertRule {
  id: string
  userId: string
  type: 'price' | 'technical' | 'news' | 'portfolio'
  symbol?: string
  condition: string
  target: number
  operator: 'greater' | 'less' | 'equal' | 'crosses_above' | 'crosses_below'
  isActive: boolean
  createdAt: number
  triggeredCount: number
  lastTriggered?: number
}

interface NewsItem {
  id: string
  title: string
  summary: string
  source: string
  url: string
  publishedAt: number
  sentiment: 'positive' | 'negative' | 'neutral'
  impact: 'low' | 'medium' | 'high'
  symbols: string[]
}

// Get all alerts for user
app.get('/alerts/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    const limit = parseInt(c.req.query('limit') || '50')
    const unreadOnly = c.req.query('unread') === 'true'
    
    const alerts = generateMockAlerts(userId, limit, unreadOnly)
    
    return c.json({
      success: true,
      data: alerts,
      unreadCount: alerts.filter(a => !a.isRead).length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Alerts fetch error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch alerts',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get alert rules for user
app.get('/rules/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const rules = generateMockAlertRules(userId)
    
    return c.json({
      success: true,
      data: rules,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Alert rules fetch error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch alert rules',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Create new alert rule
app.post('/rules', async (c) => {
  try {
    const ruleData = await c.req.json()
    
    const newRule: AlertRule = {
      id: `rule_${Date.now()}`,
      userId: ruleData.userId,
      type: ruleData.type,
      symbol: ruleData.symbol,
      condition: ruleData.condition,
      target: ruleData.target,
      operator: ruleData.operator,
      isActive: true,
      createdAt: Date.now(),
      triggeredCount: 0
    }
    
    // In real app, save to database
    
    return c.json({
      success: true,
      data: newRule,
      message: 'Alert rule created successfully'
    })
    
  } catch (error) {
    console.error('Alert rule creation error:', error)
    return c.json({
      success: false,
      error: 'Failed to create alert rule',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Mark alert as read
app.patch('/alerts/:alertId/read', async (c) => {
  try {
    const alertId = c.req.param('alertId')
    
    // In real app, update in database
    
    return c.json({
      success: true,
      message: 'Alert marked as read'
    })
    
  } catch (error) {
    console.error('Mark alert read error:', error)
    return c.json({
      success: false,
      error: 'Failed to mark alert as read',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get crypto news with sentiment analysis
app.get('/news', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '20')
    const symbol = c.req.query('symbol')
    
    const news = await fetchCryptoNews(limit, symbol)
    
    return c.json({
      success: true,
      data: news,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('News fetch error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch news',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Check for triggered alerts (would be called by a cron job)
app.post('/check-triggers/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    const triggeredAlerts = await checkAlertTriggers(userId)
    
    return c.json({
      success: true,
      data: triggeredAlerts,
      triggeredCount: triggeredAlerts.length,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Alert trigger check error:', error)
    return c.json({
      success: false,
      error: 'Failed to check alert triggers',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Helper functions
function generateMockAlerts(userId: string, limit: number, unreadOnly: boolean): Alert[] {
  const alerts: Alert[] = [
    {
      id: 'alert_1',
      type: 'price',
      symbol: 'BTC',
      title: 'هشدار قیمت بیت‌کوین',
      message: 'قیمت بیت‌کوین به بالای $100,000 رسید',
      severity: 'high',
      timestamp: Date.now() - 5 * 60 * 1000,
      isRead: false,
      actionRequired: true,
      data: { currentPrice: 100150, targetPrice: 100000 }
    },
    {
      id: 'alert_2',
      type: 'technical',
      symbol: 'ETH',
      title: 'سیگنال تکنیکال اتریوم',
      message: 'RSI اتریوم به زیر 30 رسید - سیگنال خرید',
      severity: 'medium',
      timestamp: Date.now() - 15 * 60 * 1000,
      isRead: false,
      data: { rsi: 28, recommendation: 'buy' }
    },
    {
      id: 'alert_3',
      type: 'news',
      title: 'اخبار مهم بازار',
      message: 'SEC گزارش جدیدی درباره ETF های بیت‌کوین منتشر کرد',
      severity: 'medium',
      timestamp: Date.now() - 30 * 60 * 1000,
      isRead: true,
      data: { source: 'CoinDesk', impact: 'high' }
    },
    {
      id: 'alert_4',
      type: 'portfolio',
      title: 'هشدار پورتفولیو',
      message: 'سود کل پورتفولیو از 25% گذشت',
      severity: 'low',
      timestamp: Date.now() - 60 * 60 * 1000,
      isRead: false,
      data: { currentROI: 25.3, targetROI: 25 }
    },
    {
      id: 'alert_5',
      type: 'technical',
      symbol: 'BNB',
      title: 'عبور از میانگین متحرک',
      message: 'قیمت BNB از بالای SMA 50 عبور کرد',
      severity: 'medium',
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      isRead: true,
      data: { currentPrice: 650, sma50: 645 }
    },
    {
      id: 'alert_6',
      type: 'price',
      symbol: 'ADA',
      title: 'کاهش قیمت کاردانو',
      message: 'قیمت ADA بیش از 5% در 24 ساعت کاهش یافت',
      severity: 'high',
      timestamp: Date.now() - 3 * 60 * 60 * 1000,
      isRead: false,
      actionRequired: true,
      data: { change24h: -5.2, currentPrice: 0.45 }
    }
  ]
  
  const filteredAlerts = unreadOnly ? alerts.filter(a => !a.isRead) : alerts
  
  return filteredAlerts.slice(0, limit).sort((a, b) => b.timestamp - a.timestamp)
}

function generateMockAlertRules(userId: string): AlertRule[] {
  return [
    {
      id: 'rule_1',
      userId,
      type: 'price',
      symbol: 'BTC',
      condition: 'Price crosses above',
      target: 100000,
      operator: 'crosses_above',
      isActive: true,
      createdAt: Date.now() - 24 * 60 * 60 * 1000,
      triggeredCount: 1,
      lastTriggered: Date.now() - 5 * 60 * 1000
    },
    {
      id: 'rule_2',
      userId,
      type: 'technical',
      symbol: 'ETH',
      condition: 'RSI below',
      target: 30,
      operator: 'less',
      isActive: true,
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      triggeredCount: 3,
      lastTriggered: Date.now() - 15 * 60 * 1000
    },
    {
      id: 'rule_3',
      userId,
      type: 'portfolio',
      condition: 'Portfolio ROI above',
      target: 25,
      operator: 'greater',
      isActive: true,
      createdAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
      triggeredCount: 1,
      lastTriggered: Date.now() - 60 * 60 * 1000
    },
    {
      id: 'rule_4',
      userId,
      type: 'price',
      symbol: 'SOL',
      condition: 'Price drops below',
      target: 200,
      operator: 'less',
      isActive: false,
      createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
      triggeredCount: 0
    }
  ]
}

async function fetchCryptoNews(limit: number, symbol?: string): Promise<NewsItem[]> {
  // In real app, integrate with news APIs like CoinGecko News, CryptoNews API, etc.
  const mockNews: NewsItem[] = [
    {
      id: 'news_1',
      title: 'Bitcoin Reaches New All-Time High Above $100,000',
      summary: 'Bitcoin has surged past the psychological $100,000 barrier amid increased institutional adoption and positive regulatory developments.',
      source: 'CoinDesk',
      url: 'https://coindesk.com/bitcoin-100k',
      publishedAt: Date.now() - 30 * 60 * 1000,
      sentiment: 'positive',
      impact: 'high',
      symbols: ['BTC']
    },
    {
      id: 'news_2',
      title: 'Ethereum 2.0 Staking Rewards Increase',
      summary: 'Ethereum staking rewards have increased to 5.2% APY as more validators join the network.',
      source: 'CoinTelegraph',
      url: 'https://cointelegraph.com/eth-staking',
      publishedAt: Date.now() - 60 * 60 * 1000,
      sentiment: 'positive',
      impact: 'medium',
      symbols: ['ETH']
    },
    {
      id: 'news_3',
      title: 'SEC Delays Decision on Spot Ethereum ETF',
      summary: 'The SEC has postponed its decision on several spot Ethereum ETF applications until next quarter.',
      source: 'The Block',
      url: 'https://theblock.co/sec-eth-etf',
      publishedAt: Date.now() - 2 * 60 * 60 * 1000,
      sentiment: 'neutral',
      impact: 'medium',
      symbols: ['ETH']
    },
    {
      id: 'news_4', 
      title: 'Major Exchange Announces Support for New DeFi Protocols',
      summary: 'Binance announces support for several new DeFi protocols including advanced yield farming strategies.',
      source: 'Binance Blog',
      url: 'https://binance.com/defi-support',
      publishedAt: Date.now() - 4 * 60 * 60 * 1000,
      sentiment: 'positive',
      impact: 'low',
      symbols: ['BNB', 'DeFi']
    },
    {
      id: 'news_5',
      title: 'Central Bank Digital Currency Pilot Program Launched',
      summary: 'The European Central Bank has launched a pilot program for its digital euro, affecting crypto market sentiment.',
      source: 'Reuters',
      url: 'https://reuters.com/cbdc-pilot',
      publishedAt: Date.now() - 6 * 60 * 60 * 1000,
      sentiment: 'neutral',
      impact: 'high',
      symbols: ['BTC', 'ETH', 'CBDC']
    }
  ]
  
  let filteredNews = mockNews
  
  if (symbol) {
    filteredNews = mockNews.filter(news => 
      news.symbols.some(s => s.toLowerCase().includes(symbol.toLowerCase()))
    )
  }
  
  return filteredNews.slice(0, limit).sort((a, b) => b.publishedAt - a.publishedAt)
}

async function checkAlertTriggers(userId: string): Promise<Alert[]> {
  // This function would be called by a background job to check if any alert rules should trigger
  const triggeredAlerts: Alert[] = []
  
  // Mock checking current market conditions against user's alert rules
  const mockTriggers = [
    {
      type: 'price' as const,
      symbol: 'BTC',
      title: 'قیمت بیت‌کوین از هدف عبور کرد',
      message: 'قیمت BTC از $95,000 عبور کرد',
      severity: 'medium' as const,
      data: { currentPrice: 95150, targetPrice: 95000 }
    }
  ]
  
  mockTriggers.forEach(trigger => {
    triggeredAlerts.push({
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: trigger.type,
      symbol: trigger.symbol,
      title: trigger.title,
      message: trigger.message,
      severity: trigger.severity,
      timestamp: Date.now(),
      isRead: false,
      actionRequired: trigger.severity === 'high' || trigger.severity === 'critical',
      data: trigger.data
    })
  })
  
  return triggeredAlerts
}

export default app