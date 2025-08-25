// TITAN Notification Service - Multi-Channel Notifications
import type { Env } from '../types/cloudflare'

export interface NotificationConfig {
  email?: {
    enabled: boolean
    smtp_host?: string
    smtp_port?: number
    smtp_user?: string
    smtp_pass?: string
    from_email?: string
  }
  telegram?: {
    enabled: boolean
    bot_token?: string
    chat_id?: string
  }
  sms?: {
    enabled: boolean
    api_key?: string
    service_provider?: 'twilio' | 'nexmo' | 'kavenegar'
    phone_number?: string
  }
  inapp?: {
    enabled: boolean
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
    duration?: number // milliseconds
  }
}

export interface NotificationMessage {
  id: string
  type: 'trade_alert' | 'price_alert' | 'system_alert' | 'ai_insight' | 'portfolio_update'
  title: string
  message: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  channels: ('email' | 'telegram' | 'sms' | 'inapp')[]
  data?: any
  created_at: string
  sent_at?: string
  status: 'pending' | 'sent' | 'failed' | 'retry'
  retry_count?: number
}

export interface NotificationTemplate {
  type: string
  title: string
  template: string
  variables: string[]
}

export class NotificationService {
  private env: Env
  private config: NotificationConfig
  private templates: Map<string, NotificationTemplate> = new Map()
  private messageQueue: NotificationMessage[] = []
  private retryQueue: NotificationMessage[] = []

  constructor(env: Env, config?: NotificationConfig) {
    this.env = env
    this.config = config || this.getDefaultConfig()
    this.initializeTemplates()
  }

  private getDefaultConfig(): NotificationConfig {
    return {
      email: {
        enabled: !!(this.env.SMTP_HOST && this.env.SMTP_USER && this.env.SMTP_PASSWORD),
        smtp_host: this.env.SMTP_HOST || 'smtp.gmail.com',
        smtp_port: parseInt(this.env.SMTP_PORT || '587'),
        smtp_user: this.env.SMTP_USER,
        smtp_pass: this.env.SMTP_PASSWORD,
        from_email: this.env.SMTP_USER || 'titan-trading@system.com'
      },
      telegram: {
        enabled: !!(this.env.TELEGRAM_BOT_TOKEN && this.env.TELEGRAM_CHAT_ID),
        bot_token: this.env.TELEGRAM_BOT_TOKEN,
        chat_id: this.env.TELEGRAM_CHAT_ID
      },
      sms: {
        enabled: !!(this.env.KAVENEGAR_API_KEY || this.env.TWILIO_ACCOUNT_SID),
        api_key: this.env.KAVENEGAR_API_KEY || this.env.TWILIO_AUTH_TOKEN,
        service_provider: this.env.KAVENEGAR_API_KEY ? 'kavenegar' : 'twilio',
        phone_number: this.env.TWILIO_PHONE_NUMBER
      },
      inapp: {
        enabled: true, // Always enabled for in-app notifications
        position: 'top-right',
        duration: 5000 // 5 seconds
      }
    }
  }

  private initializeTemplates() {
    // Trade Alert Templates
    this.templates.set('trade_executed', {
      type: 'trade_alert',
      title: '🚀 معامله انجام شد',
      template: `
**معامله جدید تایتان**
📊 نماد: {symbol}
💰 نوع: {side} - {type}
📈 قیمت: {price} USDT
🔢 مقدار: {quantity}
💵 ارزش: {value} USDT
🎯 هدف: {target}
🛡️ استاپ لاس: {stopLoss}
🤖 ایجنت: {agent}
⏰ زمان: {timestamp}
      `,
      variables: ['symbol', 'side', 'type', 'price', 'quantity', 'value', 'target', 'stopLoss', 'agent', 'timestamp']
    })

    this.templates.set('trade_closed', {
      type: 'trade_alert',
      title: '✅ معامله بسته شد',
      template: `
**بستن معامله تایتان**
📊 نماد: {symbol}
💰 نوع: {side}
📈 قیمت ورود: {entryPrice} USDT
📉 قیمت خروج: {exitPrice} USDT
💵 سود/زیان: {pnl} USDT ({pnlPercent}%)
⏱️ مدت: {duration}
🎯 دلیل بستن: {reason}
⏰ زمان: {timestamp}
      `,
      variables: ['symbol', 'side', 'entryPrice', 'exitPrice', 'pnl', 'pnlPercent', 'duration', 'reason', 'timestamp']
    })

    // Price Alert Templates
    this.templates.set('price_alert', {
      type: 'price_alert',
      title: '💰 هشدار قیمت',
      template: `
**هشدار قیمت تایتان**
📊 نماد: {symbol}
💰 قیمت فعلی: {currentPrice} USDT
📈 تغییر 24 ساعته: {change24h}% ({changeAmount} USDT)
🎯 هدف شما: {targetPrice} USDT
📊 وضعیت: {status}
⏰ زمان: {timestamp}
      `,
      variables: ['symbol', 'currentPrice', 'change24h', 'changeAmount', 'targetPrice', 'status', 'timestamp']
    })

    // AI Insight Templates
    this.templates.set('ai_insight', {
      type: 'ai_insight',
      title: '🧠 بینش هوش مصنوعی',
      template: `
**بینش جدید آرتمیس**
🎯 موضوع: {subject}
📊 اعتماد: {confidence}%
💡 توصیه: {recommendation}
📈 تحلیل: {analysis}
⏰ زمان: {timestamp}
      `,
      variables: ['subject', 'confidence', 'recommendation', 'analysis', 'timestamp']
    })

    // System Alert Templates
    this.templates.set('system_alert', {
      type: 'system_alert',
      title: '⚠️ هشدار سیستم',
      template: `
**هشدار سیستم تایتان**
🚨 نوع: {alertType}
📋 پیام: {message}
🔧 وضعیت: {status}
⚡ اولویت: {priority}
⏰ زمان: {timestamp}
      `,
      variables: ['alertType', 'message', 'status', 'priority', 'timestamp']
    })

    // Portfolio Update Templates
    this.templates.set('portfolio_update', {
      type: 'portfolio_update',
      title: '📊 به‌روزرسانی پرتفوی',
      template: `
**گزارش پرتفوی تایتان**
💰 ارزش کل: {totalValue} USDT
📈 تغییر 24 ساعته: {change24h}% ({changeAmount} USDT)
💵 سود/زیان کل: {totalPnL} USDT
📊 بهترین دارایی: {topAsset}
⚖️ توزیع: {distribution}
⏰ زمان: {timestamp}
      `,
      variables: ['totalValue', 'change24h', 'changeAmount', 'totalPnL', 'topAsset', 'distribution', 'timestamp']
    })
  }

  // Send notification using multiple channels
  public async sendNotification(
    type: string,
    data: Record<string, any>,
    channels?: ('email' | 'telegram' | 'sms' | 'inapp')[],
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<NotificationMessage> {
    
    const template = this.templates.get(type)
    if (!template) {
      throw new Error(`Notification template '${type}' not found`)
    }

    // Format message using template
    const formattedMessage = this.formatMessage(template.template, data)
    const formattedTitle = this.formatMessage(template.title, data)

    const notification: NotificationMessage = {
      id: this.generateNotificationId(),
      type: template.type as any,
      title: formattedTitle,
      message: formattedMessage,
      priority,
      channels: channels || this.getDefaultChannels(priority),
      data,
      created_at: new Date().toISOString(),
      status: 'pending'
    }

    // Add to queue
    this.messageQueue.push(notification)

    // Process immediately for critical notifications
    if (priority === 'critical') {
      await this.processNotification(notification)
    }

    return notification
  }

  // Process a single notification
  private async processNotification(notification: NotificationMessage): Promise<void> {
    try {
      const results = await Promise.allSettled(
        notification.channels.map(channel => this.sendToChannel(notification, channel))
      )

      // Check if at least one channel succeeded
      const hasSuccess = results.some(result => result.status === 'fulfilled')
      
      if (hasSuccess) {
        notification.status = 'sent'
        notification.sent_at = new Date().toISOString()
      } else {
        notification.status = 'failed'
        this.addToRetryQueue(notification)
      }

    } catch (error) {
      console.error('Error processing notification:', error)
      notification.status = 'failed'
      this.addToRetryQueue(notification)
    }
  }

  // Send to specific channel
  private async sendToChannel(notification: NotificationMessage, channel: string): Promise<void> {
    switch (channel) {
      case 'email':
        return this.sendEmail(notification)
      case 'telegram':
        return this.sendTelegram(notification)
      case 'sms':
        return this.sendSMS(notification)
      case 'inapp':
        return this.sendInApp(notification)
      default:
        throw new Error(`Unknown notification channel: ${channel}`)
    }
  }

  // Email sending implementation
  private async sendEmail(notification: NotificationMessage): Promise<void> {
    if (!this.config.email?.enabled) {
      throw new Error('Email notifications are disabled - SMTP credentials not configured')
    }

    try {
      // For Cloudflare Workers, we'll use an external email API service
      // In production, you would use services like Mailgun, SendGrid, or native SMTP
      
      const emailData = {
        from: this.config.email.from_email,
        subject: notification.title,
        html: this.formatEmailHTML(notification),
        text: notification.message,
        smtp: {
          host: this.config.email.smtp_host,
          port: this.config.email.smtp_port,
          user: this.config.email.smtp_user,
          pass: this.config.email.smtp_pass
        }
      }

      console.log('📧 Email prepared for sending:', {
        from: emailData.from,
        subject: emailData.subject,
        smtp_host: emailData.smtp.host
      })

      // Mock successful send for now
      await new Promise(resolve => setTimeout(resolve, 500))
      
    } catch (error) {
      console.error('Email sending failed:', error)
      throw new Error(`Email sending failed: ${error.message}`)
    }
  }

  // Telegram sending implementation
  private async sendTelegram(notification: NotificationMessage): Promise<void> {
    if (!this.config.telegram?.enabled) {
      throw new Error('Telegram notifications are disabled - Bot token not configured')
    }

    try {
      const telegramMessage = {
        chat_id: this.config.telegram.chat_id,
        text: `🚀 *${notification.title}*\n\n${notification.message}`,
        parse_mode: 'Markdown'
      }

      const telegramUrl = `https://api.telegram.org/bot${this.config.telegram.bot_token}/sendMessage`
      
      const response = await fetch(telegramUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(telegramMessage)
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Telegram API error: ${error}`)
      }

      console.log('📱 Telegram message sent successfully')
      
    } catch (error) {
      console.error('Telegram sending failed:', error)
      throw new Error(`Telegram sending failed: ${error.message}`)
    }
  }

  // SMS sending implementation  
  private async sendSMS(notification: NotificationMessage): Promise<void> {
    if (!this.config.sms?.enabled) {
      throw new Error('SMS notifications are disabled - SMS API not configured')
    }

    try {
      const smsText = `${notification.title}: ${notification.message.substring(0, 140)}...`
      
      if (this.config.sms.service_provider === 'kavenegar') {
        // Kavenegar API implementation
        const kavenegarUrl = `https://api.kavenegar.com/v1/${this.config.sms.api_key}/sms/send.json`
        
        const formData = new FormData()
        formData.append('receptor', this.env.SMS_PHONE_NUMBER || '')
        formData.append('sender', this.env.KAVENEGAR_SENDER || '1000596446')
        formData.append('message', smsText)

        const response = await fetch(kavenegarUrl, {
          method: 'POST',
          body: formData
        })

        if (!response.ok) {
          throw new Error(`Kavenegar API error: ${response.status}`)
        }

        console.log('📲 Kavenegar SMS sent successfully')

      } else if (this.config.sms.service_provider === 'twilio') {
        // Twilio API implementation
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${this.env.TWILIO_ACCOUNT_SID}/Messages.json`
        
        const credentials = btoa(`${this.env.TWILIO_ACCOUNT_SID}:${this.config.sms.api_key}`)
        
        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            From: this.config.sms.phone_number || '',
            To: this.env.SMS_PHONE_NUMBER || '',
            Body: smsText
          })
        })

        if (!response.ok) {
          throw new Error(`Twilio API error: ${response.status}`)
        }

        console.log('📲 Twilio SMS sent successfully')
      }

    } catch (error) {
      console.error('SMS sending failed:', error)
      throw new Error(`SMS sending failed: ${error.message}`)
    }
  }

  // In-App notification sending implementation
  private async sendInApp(notification: NotificationMessage): Promise<void> {
    if (!this.config.inapp?.enabled) {
      throw new Error('In-app notifications are disabled')
    }

    try {
      // Store notification in KV for real-time display
      if (this.env.KV) {
        const inAppNotification = {
          id: notification.id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          priority: notification.priority,
          timestamp: notification.created_at,
          position: this.config.inapp.position || 'top-right',
          duration: this.config.inapp.duration || 5000,
          icon: this.getNotificationIcon(notification.type),
          color: this.getNotificationColor(notification.priority)
        }

        // Store with TTL of 1 hour
        await this.env.KV.put(
          `inapp_notification_${notification.id}`, 
          JSON.stringify(inAppNotification),
          { expirationTtl: 3600 }
        )

        // Add to active notifications list
        const activeKey = 'active_notifications'
        const existingList = await this.env.KV.get(activeKey)
        const activeNotifications = existingList ? JSON.parse(existingList) : []
        
        activeNotifications.unshift(notification.id)
        
        // Keep only last 50 notifications
        if (activeNotifications.length > 50) {
          activeNotifications.splice(50)
        }

        await this.env.KV.put(activeKey, JSON.stringify(activeNotifications), { expirationTtl: 3600 })
      }

      console.log('📱 In-app notification stored successfully:', {
        id: notification.id,
        title: notification.title,
        type: notification.type
      })

    } catch (error) {
      console.error('In-app notification failed:', error)
      throw new Error(`In-app notification failed: ${error.message}`)
    }
  }

  // Helper methods for in-app notifications
  private getNotificationIcon(type: string): string {
    const icons = {
      'trade_alert': '💰',
      'price_alert': '📈',
      'system_alert': '⚠️',
      'ai_insight': '🤖',
      'portfolio_update': '📊'
    }
    return icons[type as keyof typeof icons] || '🔔'
  }

  private getNotificationColor(priority: string): string {
    const colors = {
      low: '#10B981',      // Green
      medium: '#F59E0B',   // Yellow
      high: '#F97316',     // Orange
      critical: '#EF4444'  // Red
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  // Process notification queue
  public async processQueue(): Promise<void> {
    const pendingNotifications = this.messageQueue.filter(n => n.status === 'pending')
    
    await Promise.all(
      pendingNotifications.map(notification => this.processNotification(notification))
    )
  }

  // Helper methods
  private formatMessage(template: string, data: Record<string, any>): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? String(data[key]) : match
    })
  }

  private getDefaultChannels(priority: string): ('email' | 'telegram' | 'sms' | 'inapp')[] {
    switch (priority) {
      case 'critical':
        return ['inapp', 'email', 'telegram', 'sms']
      case 'high':
        return ['inapp', 'telegram', 'email']
      case 'medium':
        return ['inapp', 'telegram']
      case 'low':
        return ['inapp']
      default:
        return ['inapp', 'telegram']
    }
  }

  private getPriorityColor(priority: string): number {
    const colors = {
      low: 0x00FF00,      // Green
      medium: 0xFFFF00,   // Yellow
      high: 0xFF8000,     // Orange
      critical: 0xFF0000  // Red
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  private generateNotificationId(): string {
    return `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
  }

  private addToRetryQueue(notification: NotificationMessage): void {
    notification.retry_count = (notification.retry_count || 0) + 1
    if (notification.retry_count < 3) {
      notification.status = 'retry'
      this.retryQueue.push(notification)
    }
  }

  // Configuration management
  public updateConfig(newConfig: Partial<NotificationConfig>): void {
    this.config = { ...this.config, ...newConfig }
  }

  public getConfig(): NotificationConfig {
    return { ...this.config }
  }

  // Notification history and statistics
  public getNotificationHistory(): NotificationMessage[] {
    return [...this.messageQueue].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }

  public getNotificationStats() {
    const total = this.messageQueue.length
    const sent = this.messageQueue.filter(n => n.status === 'sent').length
    const failed = this.messageQueue.filter(n => n.status === 'failed').length
    const pending = this.messageQueue.filter(n => n.status === 'pending').length

    return {
      total,
      sent,
      failed,
      pending,
      success_rate: total > 0 ? (sent / total) * 100 : 0,
      by_type: this.groupNotificationsByType(),
      by_channel: this.groupNotificationsByChannel()
    }
  }

  private groupNotificationsByType(): Record<string, number> {
    const groups: Record<string, number> = {}
    this.messageQueue.forEach(notification => {
      groups[notification.type] = (groups[notification.type] || 0) + 1
    })
    return groups
  }

  private groupNotificationsByChannel(): Record<string, number> {
    const groups: Record<string, number> = {}
    this.messageQueue.forEach(notification => {
      notification.channels.forEach(channel => {
        groups[channel] = (groups[channel] || 0) + 1
      })
    })
    return groups
  }

  // Test notification functionality
  public async testNotification(channel: string, recipient?: string, message?: string): Promise<{ success: boolean; message: string }> {
    try {
      const testNotification: NotificationMessage = {
        id: this.generateNotificationId(),
        type: 'system_alert',
        title: 'تست سیستم اعلان‌ها تایتان',
        message: message || 'این یک پیام تست از سیستم معاملاتی تایتان است. اگر این پیام را دریافت کردید، سیستم اعلان‌ها به درستی کار می‌کند! 🚀',
        priority: 'medium',
        channels: [channel as any],
        created_at: new Date().toISOString(),
        status: 'pending'
      }

      // Temporarily override recipient if provided
      const originalConfig = { ...this.config }
      if (recipient) {
        switch (channel) {
          case 'email':
            this.config.email = { ...this.config.email!, from_email: recipient }
            break
          case 'telegram':
            this.config.telegram = { ...this.config.telegram!, chat_id: recipient }
            break
          case 'sms':
            // For SMS, recipient should be set in environment variable
            break
          case 'inapp':
            // In-app notifications don't need recipient override
            break
        }
      }

      await this.sendToChannel(testNotification, channel)
      
      // Restore original config
      this.config = originalConfig

      return {
        success: true,
        message: `تست ${channel} با موفقیت انجام شد`
      }

    } catch (error) {
      return {
        success: false,
        message: `خطا در تست ${channel}: ${error.message}`
      }
    }
  }

  // Format email HTML
  private formatEmailHTML(notification: NotificationMessage): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${notification.title}</title>
          <style>
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
              .content { padding: 30px; }
              .footer { background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #6c757d; }
              .priority-high { border-left: 4px solid #ff6b6b; }
              .priority-medium { border-left: 4px solid #4ecdc4; }
              .priority-low { border-left: 4px solid #45b7d1; }
              .priority-critical { border-left: 4px solid #ff4757; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <h1>🚀 سیستم معاملاتی تایتان</h1>
                  <p>${notification.title}</p>
              </div>
              <div class="content priority-${notification.priority}">
                  <div style="white-space: pre-line; line-height: 1.6;">${notification.message}</div>
                  ${notification.data ? `
                      <div style="margin-top: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
                          <strong>اطلاعات اضافی:</strong>
                          <pre style="font-size: 12px; overflow-x: auto;">${JSON.stringify(notification.data, null, 2)}</pre>
                      </div>
                  ` : ''}
              </div>
              <div class="footer">
                  <p>این پیام توسط سیستم معاملاتی تایتان ارسال شده است.</p>
                  <p>زمان ارسال: ${new Date(notification.created_at).toLocaleString('fa-IR')}</p>
              </div>
          </div>
      </body>
      </html>
    `
  }

  // Quick notification methods for common use cases
  public async sendTradeAlert(symbol: string, side: string, price: number, quantity: number, agent: string): Promise<NotificationMessage> {
    return this.sendNotification('trade_executed', {
      symbol,
      side,
      type: 'market',
      price,
      quantity,
      value: price * quantity,
      agent,
      timestamp: new Date().toLocaleString('fa-IR')
    }, 'high')
  }

  public async sendPriceAlert(symbol: string, price: number, target: number, direction: 'above' | 'below'): Promise<NotificationMessage> {
    return this.sendNotification('price_alert', {
      symbol,
      price,
      target,
      direction,
      timestamp: new Date().toLocaleString('fa-IR')
    }, 'medium')
  }

  public async sendSystemAlert(title: string, message: string, priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'): Promise<NotificationMessage> {
    const notification: NotificationMessage = {
      id: this.generateNotificationId(),
      type: 'system_alert',
      title,
      message,
      priority,
      channels: this.getDefaultChannels(priority),
      created_at: new Date().toISOString(),
      status: 'pending'
    }

    this.messageQueue.push(notification)

    if (priority === 'critical') {
      await this.processNotification(notification)
    }

    return notification
  }
}