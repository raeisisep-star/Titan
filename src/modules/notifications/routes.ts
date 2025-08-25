import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'
import { NotificationService } from '../../services/notification-service'

export const notificationRoutes = new Hono<{ Bindings: Env }>()

// Get notification configuration
notificationRoutes.get('/config', async (c) => {
  try {
    const notificationService = new NotificationService(c.env)
    const config = notificationService.getConfig()
    
    return c.json({
      success: true,
      data: {
        email: {
          enabled: config.email?.enabled || false,
          configured: !!(config.email?.smtp_user && config.email?.smtp_pass)
        },
        telegram: {
          enabled: config.telegram?.enabled || false,
          configured: !!(config.telegram?.bot_token && config.telegram?.chat_id)
        },
        sms: {
          enabled: config.sms?.enabled || false,
          configured: !!(config.sms?.api_key && config.sms?.phone_number),
          provider: config.sms?.service_provider || 'kavenegar'
        },
        discord: {
          enabled: config.discord?.enabled || false,
          configured: !!config.discord?.webhook_url
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت تنظیمات اعلان‌ها' }, 500)
  }
})

// Update notification configuration
notificationRoutes.post('/config', async (c) => {
  try {
    const settings = await c.req.json()
    const notificationService = new NotificationService(c.env)
    
    notificationService.updateConfig(settings)
    
    return c.json({
      success: true,
      message: 'تنظیمات اعلان‌ها به‌روزرسانی شد',
      data: notificationService.getConfig()
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در به‌روزرسانی تنظیمات' }, 500)
  }
})

// Send test notification
notificationRoutes.post('/test', async (c) => {
  try {
    const { channels, message } = await c.req.json()
    const notificationService = new NotificationService(c.env)
    
    const testData = {
      message: message || 'این یک پیام تست از سیستم تایتان است',
      timestamp: new Date().toLocaleString('fa-IR'),
      system: 'TITAN Trading System'
    }
    
    const notification = await notificationService.sendNotification(
      'system_alert',
      {
        alertType: 'تست سیستم',
        message: testData.message,
        status: 'فعال',
        priority: 'متوسط',
        timestamp: testData.timestamp
      },
      channels,
      'medium'
    )
    
    // Process the notification immediately
    await notificationService.processQueue()
    
    return c.json({
      success: true,
      message: 'پیام تست ارسال شد',
      data: {
        notification_id: notification.id,
        channels: notification.channels,
        status: notification.status
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در ارسال پیام تست' }, 500)
  }
})

// Get notification history
notificationRoutes.get('/history', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    const type = c.req.query('type')
    
    const notificationService = new NotificationService(c.env)
    let history = notificationService.getNotificationHistory()
    
    // Filter by type if provided
    if (type) {
      history = history.filter(notification => notification.type === type)
    }
    
    // Apply limit
    history = history.slice(0, limit)
    
    return c.json({
      success: true,
      data: {
        notifications: history,
        total: history.length,
        filter: { type, limit }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت تاریخچه اعلان‌ها' }, 500)
  }
})

// Get notification statistics
notificationRoutes.get('/stats', async (c) => {
  try {
    const notificationService = new NotificationService(c.env)
    const stats = notificationService.getNotificationStats()
    
    return c.json({
      success: true,
      data: {
        overview: {
          total_notifications: stats.total,
          sent_successfully: stats.sent,
          failed_notifications: stats.failed,
          pending_notifications: stats.pending,
          success_rate: Math.round(stats.success_rate * 100) / 100
        },
        breakdown: {
          by_type: stats.by_type,
          by_channel: stats.by_channel
        },
        performance: {
          success_rate: stats.success_rate,
          most_used_type: Object.entries(stats.by_type)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A',
          most_used_channel: Object.entries(stats.by_channel)
            .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت آمار اعلان‌ها' }, 500)
  }
})

// Send trade notification
notificationRoutes.post('/trade', async (c) => {
  try {
    const tradeData = await c.req.json()
    const notificationService = new NotificationService(c.env)
    
    let notification
    if (tradeData.action === 'opened') {
      notification = await notificationService.notifyTradeExecuted({
        symbol: tradeData.symbol,
        side: tradeData.side.toUpperCase(),
        type: tradeData.type.toUpperCase(),
        price: tradeData.price,
        quantity: tradeData.quantity,
        value: (tradeData.price * tradeData.quantity).toFixed(2),
        target: tradeData.target || 'نامشخص',
        stopLoss: tradeData.stopLoss || 'نامشخص',
        agent: tradeData.agent || 'سیستم خودکار',
        timestamp: new Date().toLocaleString('fa-IR')
      })
    } else if (tradeData.action === 'closed') {
      notification = await notificationService.notifyTradeClosed({
        symbol: tradeData.symbol,
        side: tradeData.side.toUpperCase(),
        entryPrice: tradeData.entryPrice,
        exitPrice: tradeData.exitPrice,
        pnl: tradeData.pnl,
        pnlPercent: tradeData.pnlPercent,
        duration: tradeData.duration || 'نامشخص',
        reason: tradeData.reason || 'اجرای استراتژی',
        timestamp: new Date().toLocaleString('fa-IR')
      })
    }
    
    if (notification) {
      await notificationService.processQueue()
      
      return c.json({
        success: true,
        message: 'اعلان معامله ارسال شد',
        data: {
          notification_id: notification.id,
          type: notification.type
        }
      })
    } else {
      return c.json({ success: false, message: 'نوع عملیات معامله نامشخص است' }, 400)
    }
  } catch (error) {
    return c.json({ success: false, message: 'خطا در ارسال اعلان معامله' }, 500)
  }
})

// Send price alert notification
notificationRoutes.post('/price-alert', async (c) => {
  try {
    const alertData = await c.req.json()
    const notificationService = new NotificationService(c.env)
    
    const notification = await notificationService.notifyPriceAlert({
      symbol: alertData.symbol,
      currentPrice: alertData.currentPrice,
      change24h: alertData.change24h || 0,
      changeAmount: alertData.changeAmount || 0,
      targetPrice: alertData.targetPrice,
      status: alertData.currentPrice >= alertData.targetPrice ? 'هدف رسیده' : 'در حال پیگیری',
      timestamp: new Date().toLocaleString('fa-IR')
    })
    
    await notificationService.processQueue()
    
    return c.json({
      success: true,
      message: 'هشدار قیمت ارسال شد',
      data: {
        notification_id: notification.id
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در ارسال هشدار قیمت' }, 500)
  }
})

// Send AI insight notification
notificationRoutes.post('/ai-insight', async (c) => {
  try {
    const insightData = await c.req.json()
    const notificationService = new NotificationService(c.env)
    
    const notification = await notificationService.notifyAIInsight({
      subject: insightData.subject || 'بینش هوش مصنوعی',
      confidence: insightData.confidence || 85,
      recommendation: insightData.recommendation || 'بررسی بازار',
      analysis: insightData.analysis || 'تحلیل جامع بازار انجام شد',
      timestamp: new Date().toLocaleString('fa-IR')
    })
    
    await notificationService.processQueue()
    
    return c.json({
      success: true,
      message: 'بینش هوش مصنوعی ارسال شد',
      data: {
        notification_id: notification.id
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در ارسال بینش هوش مصنوعی' }, 500)
  }
})

// Send portfolio update notification
notificationRoutes.post('/portfolio', async (c) => {
  try {
    const portfolioData = await c.req.json()
    const notificationService = new NotificationService(c.env)
    
    const notification = await notificationService.notifyPortfolioUpdate({
      totalValue: portfolioData.totalValue || 0,
      change24h: portfolioData.change24h || 0,
      changeAmount: portfolioData.changeAmount || 0,
      totalPnL: portfolioData.totalPnL || 0,
      topAsset: portfolioData.topAsset || 'BTC',
      distribution: portfolioData.distribution || 'متنوع',
      timestamp: new Date().toLocaleString('fa-IR')
    })
    
    await notificationService.processQueue()
    
    return c.json({
      success: true,
      message: 'گزارش پرتفوی ارسال شد',
      data: {
        notification_id: notification.id
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در ارسال گزارش پرتفوی' }, 500)
  }
})

// Send system alert notification
notificationRoutes.post('/system-alert', async (c) => {
  try {
    const { type, message, priority } = await c.req.json()
    const notificationService = new NotificationService(c.env)
    
    const notification = await notificationService.notifySystemAlert({
      alertType: type || 'هشدار سیستم',
      message: message || 'رویداد مهم سیستم رخ داده است',
      status: 'فعال',
      priority: priority || 'متوسط',
      timestamp: new Date().toLocaleString('fa-IR')
    }, priority || 'medium')
    
    await notificationService.processQueue()
    
    return c.json({
      success: true,
      message: 'هشدار سیستم ارسال شد',
      data: {
        notification_id: notification.id,
        priority: notification.priority
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در ارسال هشدار سیستم' }, 500)
  }
})

// Process notification queue manually
notificationRoutes.post('/process-queue', async (c) => {
  try {
    const notificationService = new NotificationService(c.env)
    await notificationService.processQueue()
    
    const stats = notificationService.getNotificationStats()
    
    return c.json({
      success: true,
      message: 'صف اعلان‌ها پردازش شد',
      data: {
        processed: stats.pending,
        total_sent: stats.sent
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در پردازش صف اعلان‌ها' }, 500)
  }
})

export default notificationRoutes