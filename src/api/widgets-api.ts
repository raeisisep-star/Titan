import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Define interfaces
interface Widget {
  id: string
  type: 'portfolio_summary' | 'market_overview' | 'watchlist' | 'trading_signals' | 'news_feed' | 'performance_chart' | 'fear_greed' | 'top_movers' | 'ai_recommendations'
  title: string
  position: { x: number, y: number }
  size: { width: number, height: number }
  isVisible: boolean
  settings: any
}

interface UserLayout {
  userId: string
  layoutName: string
  widgets: Widget[]
  createdAt: number
  updatedAt: number
}

interface ThemeSettings {
  userId: string
  theme: 'dark' | 'light' | 'auto'
  accentColor: string
  fontFamily: 'vazir' | 'system' | 'roboto'
  fontSize: 'small' | 'medium' | 'large'
  compactMode: boolean
  animations: boolean
  rtlMode: boolean
}

// Get user's widget layout
app.get('/layout/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // Generate default layout for demo
    const defaultLayout = generateDefaultLayout(userId)
    
    return c.json({
      success: true,
      data: defaultLayout,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Layout fetch error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch layout',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Save user's widget layout
app.post('/layout', async (c) => {
  try {
    const layoutData = await c.req.json()
    
    // In real app, save to database
    const savedLayout: UserLayout = {
      userId: layoutData.userId,
      layoutName: layoutData.layoutName || 'default',
      widgets: layoutData.widgets,
      createdAt: layoutData.createdAt || Date.now(),
      updatedAt: Date.now()
    }
    
    return c.json({
      success: true,
      data: savedLayout,
      message: 'Layout saved successfully'
    })
    
  } catch (error) {
    console.error('Layout save error:', error)
    return c.json({
      success: false,
      error: 'Failed to save layout',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get available widget types
app.get('/types', (c) => {
  const widgetTypes = [
    {
      id: 'portfolio_summary',
      title: 'خلاصه پورتفولیو',
      description: 'نمای کلی ارزش کل و سود/زیان',
      icon: '💰',
      defaultSize: { width: 2, height: 1 },
      category: 'portfolio'
    },
    {
      id: 'market_overview',
      title: 'نمای کلی بازار',
      description: 'آمار کلی بازار کریپتو',
      icon: '📊',
      defaultSize: { width: 2, height: 1 },
      category: 'market'
    },
    {
      id: 'watchlist',
      title: 'لیست مورد علاقه',
      description: 'ارزهای دیجیتال مورد علاقه شما',
      icon: '🎯',
      defaultSize: { width: 3, height: 2 },
      category: 'trading'
    },
    {
      id: 'trading_signals',
      title: 'سیگنال‌های معاملاتی',
      description: 'توصیه‌های خرید و فروش',
      icon: '📈',
      defaultSize: { width: 2, height: 2 },
      category: 'trading'
    },
    {
      id: 'news_feed',
      title: 'اخبار کریپتو',
      description: 'آخرین اخبار بازار',
      icon: '📰',
      defaultSize: { width: 2, height: 2 },
      category: 'news'
    },
    {
      id: 'performance_chart',
      title: 'نمودار عملکرد',
      description: 'نمودار P&L پورتفولیو',
      icon: '📈',
      defaultSize: { width: 3, height: 2 },
      category: 'analytics'
    },
    {
      id: 'fear_greed',
      title: 'شاخص ترس و طمع',
      description: 'احساسات بازار',
      icon: '😰',
      defaultSize: { width: 1, height: 1 },
      category: 'market'
    },
    {
      id: 'top_movers',
      title: 'بالاترین تغییرات',
      description: 'برترین برندگان و بازندگان',
      icon: '🚀',
      defaultSize: { width: 2, height: 2 },
      category: 'market'
    },
    {
      id: 'ai_recommendations',
      title: 'توصیه‌های آرتمیس',
      description: 'تحلیل‌های هوش مصنوعی',
      icon: '🤖',
      defaultSize: { width: 2, height: 1 },
      category: 'ai'
    }
  ]
  
  return c.json({
    success: true,
    data: widgetTypes
  })
})

// Get user's theme settings
app.get('/theme/:userId', async (c) => {
  try {
    const userId = c.req.param('userId')
    
    // Default theme settings
    const defaultTheme: ThemeSettings = {
      userId,
      theme: 'dark',
      accentColor: '#3B82F6',
      fontFamily: 'vazir',
      fontSize: 'medium',
      compactMode: false,
      animations: true,
      rtlMode: true
    }
    
    return c.json({
      success: true,
      data: defaultTheme,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Theme fetch error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch theme settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Save user's theme settings
app.post('/theme', async (c) => {
  try {
    const themeData = await c.req.json()
    
    // In real app, save to database
    
    return c.json({
      success: true,
      data: themeData,
      message: 'Theme settings saved successfully'
    })
    
  } catch (error) {
    console.error('Theme save error:', error)
    return c.json({
      success: false,
      error: 'Failed to save theme settings',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get available themes and colors
app.get('/options', (c) => {
  const themeOptions = {
    themes: [
      { id: 'dark', name: 'تیره', preview: '#1F2937' },
      { id: 'light', name: 'روشن', preview: '#F9FAFB' },
      { id: 'auto', name: 'خودکار', preview: 'gradient' }
    ],
    accentColors: [
      { id: '#3B82F6', name: 'آبی', color: '#3B82F6' },
      { id: '#10B981', name: 'سبز', color: '#10B981' },
      { id: '#8B5CF6', name: 'بنفش', color: '#8B5CF6' },
      { id: '#F59E0B', name: 'نارنجی', color: '#F59E0B' },
      { id: '#EF4444', name: 'قرمز', color: '#EF4444' },
      { id: '#06B6D4', name: 'فیروزه‌ای', color: '#06B6D4' },
      { id: '#84CC16', name: 'لیمویی', color: '#84CC16' },
      { id: '#EC4899', name: 'صورتی', color: '#EC4899' }
    ],
    fontFamilies: [
      { id: 'vazir', name: 'وزیر', preview: 'font-vazir' },
      { id: 'system', name: 'سیستم', preview: 'font-system' },
      { id: 'roboto', name: 'روبوتو', preview: 'font-roboto' }
    ],
    fontSizes: [
      { id: 'small', name: 'کوچک', size: '14px' },
      { id: 'medium', name: 'متوسط', size: '16px' },
      { id: 'large', name: 'بزرگ', size: '18px' }
    ]
  }
  
  return c.json({
    success: true,
    data: themeOptions
  })
})

// Helper function to generate default layout
function generateDefaultLayout(userId: string): UserLayout {
  const defaultWidgets: Widget[] = [
    {
      id: 'portfolio_summary_1',
      type: 'portfolio_summary',
      title: 'خلاصه پورتفولیو',
      position: { x: 0, y: 0 },
      size: { width: 2, height: 1 },
      isVisible: true,
      settings: {}
    },
    {
      id: 'market_overview_1',
      type: 'market_overview',
      title: 'نمای کلی بازار',
      position: { x: 2, y: 0 },
      size: { width: 2, height: 1 },
      isVisible: true,
      settings: {}
    },
    {
      id: 'fear_greed_1',
      type: 'fear_greed',
      title: 'شاخص ترس و طمع',
      position: { x: 4, y: 0 },
      size: { width: 1, height: 1 },
      isVisible: true,
      settings: {}
    },
    {
      id: 'watchlist_1',
      type: 'watchlist',
      title: 'لیست مورد علاقه',
      position: { x: 0, y: 1 },
      size: { width: 3, height: 2 },
      isVisible: true,
      settings: { limit: 10 }
    },
    {
      id: 'trading_signals_1',
      type: 'trading_signals',
      title: 'سیگنال‌های معاملاتی',
      position: { x: 3, y: 1 },
      size: { width: 2, height: 2 },
      isVisible: true,
      settings: {}
    },
    {
      id: 'performance_chart_1',
      type: 'performance_chart',
      title: 'نمودار عملکرد',
      position: { x: 0, y: 3 },
      size: { width: 3, height: 2 },
      isVisible: true,
      settings: { period: 'daily' }
    },
    {
      id: 'top_movers_1',
      type: 'top_movers',
      title: 'بالاترین تغییرات',
      position: { x: 3, y: 3 },
      size: { width: 2, height: 2 },
      isVisible: true,
      settings: { limit: 5 }
    },
    {
      id: 'news_feed_1',
      type: 'news_feed',
      title: 'اخبار کریپتو',
      position: { x: 0, y: 5 },
      size: { width: 2, height: 2 },
      isVisible: true,
      settings: { limit: 5 }
    },
    {
      id: 'ai_recommendations_1',
      type: 'ai_recommendations',
      title: 'توصیه‌های آرتمیس',
      position: { x: 2, y: 5 },
      size: { width: 3, height: 1 },
      isVisible: true,
      settings: {}
    }
  ]
  
  return {
    userId,
    layoutName: 'default',
    widgets: defaultWidgets,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
}

export default app