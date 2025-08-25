import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'

export const dashboardRoutes = new Hono<{ Bindings: Env }>()

// Get dashboard overview
dashboardRoutes.get('/overview', async (c) => {
  try {
    return c.json({
      success: true,
      data: {
        totalBalance: {
          usd: 125000,
          btc: 3.45,
          eth: 25.8,
          change24h: 2.3
        },
        activeTrades: {
          total: 8,
          profitable: 6,
          losing: 2,
          success_rate: 75
        },
        artemisStatus: {
          status: 'active',
          confidence: 85,
          last_decision: 'خرید BTC/USDT',
          next_action: '2 دقیقه',
          active_agents: 15
        },
        systemHealth: {
          overall: 92,
          trading_engine: 95,
          ai_system: 90,
          connectivity: 88,
          data_feed: 94
        },
        todayStats: {
          trades_executed: 24,
          profit_made: 2847.50,
          best_trade: 'ETH/USDT +$420',
          ai_predictions: 18,
          accuracy: 78.5
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت اطلاعات داشبورد' }, 500)
  }
})

// Get portfolio distribution
dashboardRoutes.get('/portfolio', async (c) => {
  try {
    return c.json({
      success: true,
      data: {
        distribution: [
          { symbol: 'BTC', name: 'Bitcoin', percentage: 35, value: 43750, change: 1.2, color: '#F7931A' },
          { symbol: 'ETH', name: 'Ethereum', percentage: 25, value: 31250, change: -0.8, color: '#627EEA' },
          { symbol: 'USDT', name: 'Tether', percentage: 15, value: 18750, change: 0.0, color: '#26A17B' },
          { symbol: 'BNB', name: 'Binance Coin', percentage: 10, value: 12500, change: 2.1, color: '#F3BA2F' },
          { symbol: 'ADA', name: 'Cardano', percentage: 8, value: 10000, change: 3.4, color: '#0033AD' },
          { symbol: 'SOL', name: 'Solana', percentage: 4, value: 5000, change: -1.5, color: '#9945FF' },
          { symbol: 'DOT', name: 'Polkadot', percentage: 3, value: 3750, change: 0.7, color: '#E6007A' }
        ],
        total_value: 125000,
        daily_change: 2847.50,
        daily_change_percent: 2.3
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت اطلاعات پورتفولیو' }, 500)
  }
})

// Get recent activities
dashboardRoutes.get('/activities', async (c) => {
  try {
    return c.json({
      success: true,
      data: [
        {
          id: 1,
          type: 'trade_buy',
          title: 'خرید BTC/USDT',
          description: 'آرتمیس تصمیم به خرید 0.15 BTC گرفت',
          amount: '$6,450',
          profit: '+$125',
          time: '2 دقیقه پیش',
          status: 'completed',
          confidence: 88
        },
        {
          id: 2,
          type: 'trade_sell',
          title: 'فروش ETH/USDT',
          description: 'فروش 2.5 ETH با سود 3.2%',
          amount: '$4,200',
          profit: '+$135',
          time: '8 دقیقه پیش',
          status: 'completed',
          confidence: 92
        },
        {
          id: 3,
          type: 'prediction',
          title: 'پیش‌بینی قیمت BTC',
          description: 'AI Agent #7 پیش‌بینی صعودی ارائه داد',
          amount: '$43,200 → $44,500',
          profit: '+3%',
          time: '15 دقیقه پیش',
          status: 'active',
          confidence: 75
        },
        {
          id: 4,
          type: 'news_analysis',
          title: 'تحلیل اخبار',
          description: 'تأثیر مثبت اخبار Fed بر بازار کریپتو',
          impact: 'مثبت',
          time: '23 دقیقه پیش',
          status: 'analyzed',
          confidence: 85
        },
        {
          id: 5,
          type: 'system_update',
          title: 'بروزرسانی الگوریتم',
          description: 'Agent #12 الگوریتم معاملاتی خود را بهبود داد',
          improvement: '+2.1% accuracy',
          time: '35 دقیقه پیش',
          status: 'updated',
          confidence: null
        }
      ]
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت فعالیت‌های اخیر' }, 500)
  }
})

// Get market data
dashboardRoutes.get('/market', async (c) => {
  try {
    return c.json({
      success: true,
      data: {
        top_gainers: [
          { symbol: 'SOL', name: 'Solana', price: '$156.43', change: '+8.7%', volume: '$2.4B' },
          { symbol: 'ADA', name: 'Cardano', price: '$0.45', change: '+6.2%', volume: '$890M' },
          { symbol: 'MATIC', name: 'Polygon', price: '$0.89', change: '+5.1%', volume: '$445M' }
        ],
        top_losers: [
          { symbol: 'DOGE', name: 'Dogecoin', price: '$0.082', change: '-3.4%', volume: '$1.2B' },
          { symbol: 'SHIB', name: 'Shiba Inu', price: '$0.000009', change: '-2.8%', volume: '$567M' },
          { symbol: 'LTC', name: 'Litecoin', price: '$94.23', change: '-1.9%', volume: '$789M' }
        ],
        market_sentiment: {
          fear_greed_index: 72,
          sentiment: 'greedy',
          trend: 'bullish',
          volume_24h: '$45.6B',
          market_cap: '$1.78T'
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت اطلاعات بازار' }, 500)
  }
})

// Get widget configuration
dashboardRoutes.get('/widgets', async (c) => {
  try {
    return c.json({
      success: true,
      data: {
        available_widgets: [
          { id: 'portfolio_chart', name: 'نمودار پورتفولیو', size: 'large', enabled: true },
          { id: 'active_trades', name: 'معاملات فعال', size: 'medium', enabled: true },
          { id: 'artemis_status', name: 'وضعیت آرتمیس', size: 'medium', enabled: true },
          { id: 'market_overview', name: 'بررسی کلی بازار', size: 'large', enabled: true },
          { id: 'recent_activities', name: 'فعالیت‌های اخیر', size: 'medium', enabled: true },
          { id: 'ai_predictions', name: 'پیش‌بینی‌های AI', size: 'medium', enabled: false },
          { id: 'news_feed', name: 'خوراک اخبار', size: 'medium', enabled: true },
          { id: 'system_health', name: 'سلامت سیستم', size: 'small', enabled: true }
        ],
        layout: [
          { widget: 'portfolio_chart', position: { x: 0, y: 0, w: 8, h: 4 } },
          { widget: 'artemis_status', position: { x: 8, y: 0, w: 4, h: 2 } },
          { widget: 'active_trades', position: { x: 8, y: 2, w: 4, h: 2 } },
          { widget: 'market_overview', position: { x: 0, y: 4, w: 6, h: 3 } },
          { widget: 'recent_activities', position: { x: 6, y: 4, w: 6, h: 3 } },
          { widget: 'news_feed', position: { x: 0, y: 7, w: 8, h: 2 } },
          { widget: 'system_health', position: { x: 8, y: 7, w: 4, h: 2 } }
        ]
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت تنظیمات ویجت‌ها' }, 500)
  }
})

// Save widget configuration
dashboardRoutes.post('/widgets', async (c) => {
  try {
    const { layout, enabled_widgets } = await c.req.json()
    
    // In production, save to database
    // await env.DB.prepare('UPDATE user_settings SET widget_layout = ?, enabled_widgets = ? WHERE user_id = ?')
    //   .bind(JSON.stringify(layout), JSON.stringify(enabled_widgets), userId).run()
    
    return c.json({
      success: true,
      message: 'تنظیمات ویجت‌ها ذخیره شد'
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در ذخیره تنظیمات' }, 500)
  }
})