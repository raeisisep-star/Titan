// TITAN Notification API Endpoints
import { Hono } from 'hono'
import { NotificationService } from '../../services/notification-service'
import type { Env } from '../../types/cloudflare'

const app = new Hono<{ Bindings: Env }>()

// Get notification configuration status
app.get('/config', async (c) => {
  try {
    const notificationService = new NotificationService(c.env)
    const config = notificationService.getConfig()
    
    // Return configuration status without sensitive data
    const configStatus = {
      email: {
        enabled: config.email?.enabled || false,
        configured: !!(config.email?.smtp_host && config.email?.smtp_user),
        host: config.email?.smtp_host,
        from: config.email?.from_email
      },
      telegram: {
        enabled: config.telegram?.enabled || false,
        configured: !!(config.telegram?.bot_token && config.telegram?.chat_id),
        chat_id: config.telegram?.chat_id
      },
      sms: {
        enabled: config.sms?.enabled || false,
        configured: !!config.sms?.api_key,
        provider: config.sms?.service_provider,
        phone: config.sms?.phone_number
      },
      inapp: {
        enabled: config.inapp?.enabled || false,
        configured: true, // Always available
        position: config.inapp?.position || 'top-right',
        duration: config.inapp?.duration || 5000
      }
    }
    
    return c.json({
      success: true,
      data: configStatus,
      message: 'Notification configuration retrieved'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to get notification configuration'
    }, 500)
  }
})

// Test notification functionality
app.post('/test', async (c) => {
  try {
    const { channel, message, recipient } = await c.req.json()
    
    if (!channel) {
      return c.json({
        success: false,
        error: 'Channel is required',
        message: 'Please specify a notification channel to test'
      }, 400)
    }

    const validChannels = ['email', 'telegram', 'sms', 'inapp']
    if (!validChannels.includes(channel)) {
      return c.json({
        success: false,
        error: 'Invalid channel',
        message: `Channel must be one of: ${validChannels.join(', ')}`
      }, 400)
    }

    const notificationService = new NotificationService(c.env)
    const result = await notificationService.testNotification(channel, recipient, message)
    
    return c.json({
      success: result.success,
      message: result.message,
      data: {
        channel,
        recipient: recipient || 'default',
        tested_at: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Notification test failed'
    }, 500)
  }
})

// Send trade notification
app.post('/trade', async (c) => {
  try {
    const { symbol, side, price, quantity, agent } = await c.req.json()
    
    const required = ['symbol', 'side', 'price', 'quantity']
    for (const field of required) {
      if (!await c.req.json()[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`,
          message: 'Please provide all required trade information'
        }, 400)
      }
    }

    const notificationService = new NotificationService(c.env)
    const notification = await notificationService.sendTradeAlert(
      symbol, 
      side, 
      parseFloat(price), 
      parseFloat(quantity), 
      agent || 'ARTEMIS'
    )
    
    return c.json({
      success: true,
      data: {
        notification_id: notification.id,
        title: notification.title,
        channels: notification.channels,
        status: notification.status
      },
      message: 'Trade notification sent'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to send trade notification'
    }, 500)
  }
})

// Send price alert
app.post('/price-alert', async (c) => {
  try {
    const { symbol, price, target, direction } = await c.req.json()
    
    const required = ['symbol', 'price', 'target', 'direction']
    for (const field of required) {
      if (!await c.req.json()[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`,
          message: 'Please provide all required price alert information'
        }, 400)
      }
    }

    if (!['above', 'below'].includes(direction)) {
      return c.json({
        success: false,
        error: 'Invalid direction',
        message: 'Direction must be "above" or "below"'
      }, 400)
    }

    const notificationService = new NotificationService(c.env)
    const notification = await notificationService.sendPriceAlert(
      symbol, 
      parseFloat(price), 
      parseFloat(target), 
      direction
    )
    
    return c.json({
      success: true,
      data: {
        notification_id: notification.id,
        title: notification.title,
        channels: notification.channels,
        status: notification.status
      },
      message: 'Price alert sent'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to send price alert'
    }, 500)
  }
})

// Send system alert
app.post('/system', async (c) => {
  try {
    const { title, message, priority } = await c.req.json()
    
    if (!title || !message) {
      return c.json({
        success: false,
        error: 'Title and message are required',
        message: 'Please provide both title and message for system alert'
      }, 400)
    }

    const validPriorities = ['low', 'medium', 'high', 'critical']
    const alertPriority = priority && validPriorities.includes(priority) ? priority : 'medium'

    const notificationService = new NotificationService(c.env)
    const notification = await notificationService.sendSystemAlert(title, message, alertPriority)
    
    return c.json({
      success: true,
      data: {
        notification_id: notification.id,
        title: notification.title,
        priority: notification.priority,
        channels: notification.channels,
        status: notification.status
      },
      message: 'System alert sent'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to send system alert'
    }, 500)
  }
})

// Get notification statistics
app.get('/stats', async (c) => {
  try {
    const notificationService = new NotificationService(c.env)
    const stats = notificationService.getNotificationStats()
    
    return c.json({
      success: true,
      data: stats,
      message: 'Notification statistics retrieved'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to get notification statistics'
    }, 500)
  }
})

// Get notification history
app.get('/history', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50')
    const offset = parseInt(c.req.query('offset') || '0')
    
    const notificationService = new NotificationService(c.env)
    const history = notificationService.getNotificationHistory()
    
    const paginatedHistory = history.slice(offset, offset + limit)
    
    return c.json({
      success: true,
      data: {
        notifications: paginatedHistory,
        pagination: {
          total: history.length,
          limit,
          offset,
          has_more: offset + limit < history.length
        }
      },
      message: 'Notification history retrieved'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to get notification history'
    }, 500)
  }
})

// Process notification queue manually
app.post('/process-queue', async (c) => {
  try {
    const notificationService = new NotificationService(c.env)
    await notificationService.processQueue()
    
    return c.json({
      success: true,
      message: 'Notification queue processed successfully',
      processed_at: new Date().toISOString()
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to process notification queue'
    }, 500)
  }
})

// Send custom notification with template
app.post('/custom', async (c) => {
  try {
    const { type, data, priority, channels } = await c.req.json()
    
    if (!type || !data) {
      return c.json({
        success: false,
        error: 'Type and data are required',
        message: 'Please provide notification type and data'
      }, 400)
    }

    const notificationService = new NotificationService(c.env)
    const notification = await notificationService.sendNotification(
      type, 
      data, 
      priority || 'medium', 
      channels
    )
    
    return c.json({
      success: true,
      data: {
        notification_id: notification.id,
        title: notification.title,
        type: notification.type,
        priority: notification.priority,
        channels: notification.channels,
        status: notification.status
      },
      message: 'Custom notification sent'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to send custom notification'
    }, 500)
  }
})

// Get in-app notifications for polling
app.get('/inapp', async (c) => {
  try {
    if (!c.env.KV) {
      return c.json({
        success: false,
        message: 'KV storage not available'
      }, 500)
    }

    // Get active notifications list
    const activeKey = 'active_notifications'
    const activeListStr = await c.env.KV.get(activeKey)
    
    if (!activeListStr) {
      return c.json({
        success: true,
        notifications: [],
        message: 'No active notifications'
      })
    }

    const activeIds = JSON.parse(activeListStr)
    const notifications = []

    // Retrieve each notification
    for (const notificationId of activeIds.slice(0, 10)) { // Limit to 10 recent
      try {
        const notificationStr = await c.env.KV.get(`inapp_notification_${notificationId}`)
        if (notificationStr) {
          const notification = JSON.parse(notificationStr)
          notifications.push(notification)
        }
      } catch (error) {
        console.log('Error parsing notification:', notificationId, error)
      }
    }

    // Clear retrieved notifications from active list (they've been displayed)
    if (notifications.length > 0) {
      const retrievedIds = notifications.map(n => n.id)
      const remainingIds = activeIds.filter(id => !retrievedIds.includes(id))
      
      if (remainingIds.length > 0) {
        await c.env.KV.put(activeKey, JSON.stringify(remainingIds), { expirationTtl: 3600 })
      } else {
        await c.env.KV.delete(activeKey)
      }
    }

    return c.json({
      success: true,
      notifications,
      count: notifications.length,
      message: `Retrieved ${notifications.length} in-app notifications`
    })
    
  } catch (error) {
    console.error('Error retrieving in-app notifications:', error)
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve in-app notifications'
    }, 500)
  }
})

export default app