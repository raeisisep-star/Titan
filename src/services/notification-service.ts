/**
 * Notification Service - Real notification delivery system
 * Handles Telegram, Email, SMS, and Push notifications
 */

export interface NotificationPayload {
  type: 'alert_triggered' | 'alert_created' | 'alert_deleted' | 'system_notification';
  title: string;
  message: string;
  data?: any;
  priority: 'high' | 'medium' | 'low';
  userId: string;
  alertId?: string;
}

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  enabled: boolean;
}

export interface EmailConfig {
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPass: string;
  from: string;
  enabled: boolean;
}

export interface SMSConfig {
  apiKey: string;
  sender: string;
  enabled: boolean;
}

export interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  enabled: boolean;
}

export class NotificationService {
  private telegramConfig: TelegramConfig;
  private emailConfig: EmailConfig;
  private smsConfig: SMSConfig;
  private whatsappConfig: WhatsAppConfig;

  constructor() {
    // Initialize configurations from environment variables
    this.telegramConfig = {
      botToken: process.env.TELEGRAM_BOT_TOKEN || '',
      chatId: process.env.TELEGRAM_CHAT_ID || '',
      enabled: !!process.env.TELEGRAM_BOT_TOKEN
    };

    this.emailConfig = {
      smtpHost: process.env.SMTP_HOST || 'smtp.gmail.com',
      smtpPort: parseInt(process.env.SMTP_PORT || '587'),
      smtpUser: process.env.SMTP_USER || '',
      smtpPass: process.env.SMTP_PASS || '',
      from: process.env.EMAIL_FROM || 'noreply@titan.com',
      enabled: !!process.env.SMTP_USER
    };

    this.smsConfig = {
      apiKey: process.env.KAVENEGAR_API_KEY || '',
      sender: process.env.SMS_SENDER || '10008663',
      enabled: !!process.env.KAVENEGAR_API_KEY
    };

    this.whatsappConfig = {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
      enabled: !!process.env.WHATSAPP_ACCESS_TOKEN
    };
  }

  /**
   * Send notification through all enabled channels
   */
  async sendNotification(payload: NotificationPayload, userSettings: any): Promise<{
    success: boolean;
    results: Record<string, boolean>;
    errors: Record<string, string>;
  }> {
    const results: Record<string, boolean> = {};
    const errors: Record<string, string> = {};

    // Send through enabled channels
    if (userSettings.telegramNotifications && this.telegramConfig.enabled) {
      try {
        await this.sendTelegramNotification(payload, userSettings.telegramChatId);
        results.telegram = true;
      } catch (error) {
        results.telegram = false;
        errors.telegram = error.message;
      }
    }

    if (userSettings.emailNotifications && this.emailConfig.enabled) {
      try {
        await this.sendEmailNotification(payload, userSettings.emailAddress);
        results.email = true;
      } catch (error) {
        results.email = false;
        errors.email = error.message;
      }
    }

    if (userSettings.smsNotifications && this.smsConfig.enabled) {
      try {
        await this.sendSMSNotification(payload, userSettings.phoneNumber);
        results.sms = true;
      } catch (error) {
        results.sms = false;
        errors.sms = error.message;
      }
    }

    if (userSettings.whatsappNotifications && this.whatsappConfig.enabled) {
      try {
        await this.sendWhatsAppNotification(payload, userSettings.whatsappPhoneNumber);
        results.whatsapp = true;
      } catch (error) {
        results.whatsapp = false;
        errors.whatsapp = error.message;
      }
    }

    // Always try push notification (handled by frontend)
    if (userSettings.pushNotifications) {
      results.push = true; // Frontend will handle this
    }

    const success = Object.values(results).some(result => result === true);

    return {
      success,
      results,
      errors
    };
  }

  /**
   * Send Telegram notification
   */
  async sendTelegramNotification(payload: NotificationPayload, chatId?: string): Promise<void> {
    if (!this.telegramConfig.enabled) {
      throw new Error('Telegram notifications not configured');
    }

    const targetChatId = chatId || this.telegramConfig.chatId;
    if (!targetChatId) {
      throw new Error('Telegram chat ID not provided');
    }

    // Format message for Telegram
    const telegramMessage = this.formatTelegramMessage(payload);

    const telegramApiUrl = `https://api.telegram.org/bot${this.telegramConfig.botToken}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: targetChatId,
        text: telegramMessage,
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Telegram API error: ${error}`);
    }

    console.log(`✅ Telegram notification sent successfully to ${targetChatId}`);
  }

  /**
   * Send Email notification
   */
  async sendEmailNotification(payload: NotificationPayload, emailAddress: string): Promise<void> {
    if (!this.emailConfig.enabled) {
      throw new Error('Email notifications not configured');
    }

    if (!emailAddress) {
      throw new Error('Email address not provided');
    }

    // In Cloudflare Workers, we can use a service like Resend, SendGrid, or Mailgun
    // For this example, I'll show how to integrate with a simple API

    const emailContent = this.formatEmailContent(payload);

    // Example using a generic email API (replace with your preferred service)
    const emailApiUrl = process.env.EMAIL_API_URL || 'https://api.resend.com/emails';
    const emailApiKey = process.env.EMAIL_API_KEY || '';

    if (!emailApiKey) {
      throw new Error('Email API key not configured');
    }

    const response = await fetch(emailApiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${emailApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: this.emailConfig.from,
        to: [emailAddress],
        subject: payload.title,
        html: emailContent
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Email API error: ${error}`);
    }

    console.log(`✅ Email notification sent successfully to ${emailAddress}`);
  }

  /**
   * Send SMS notification (using Kavenegar for Iran)
   */
  async sendSMSNotification(payload: NotificationPayload, phoneNumber: string): Promise<void> {
    if (!this.smsConfig.enabled) {
      throw new Error('SMS notifications not configured');
    }

    if (!phoneNumber) {
      throw new Error('Phone number not provided');
    }

    // Format message for SMS (remove emojis and limit length)
    const smsMessage = this.formatSMSMessage(payload);

    // Kavenegar API (popular Iranian SMS service)
    const kavenegarUrl = `https://api.kavenegar.com/v1/${this.smsConfig.apiKey}/sms/send.json`;

    const response = await fetch(kavenegarUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        sender: this.smsConfig.sender,
        receptor: phoneNumber,
        message: smsMessage
      })
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`SMS API error: ${error}`);
    }

    console.log(`✅ SMS notification sent successfully to ${phoneNumber}`);
  }

  /**
   * Send WhatsApp notification (using WhatsApp Business API)
   */
  async sendWhatsAppNotification(payload: NotificationPayload, phoneNumber: string): Promise<void> {
    if (!this.whatsappConfig.enabled) {
      throw new Error('WhatsApp notifications not configured');
    }

    if (!phoneNumber) {
      throw new Error('Phone number not provided');
    }

    // Clean and format phone number for WhatsApp (remove + and ensure proper format)
    const cleanPhoneNumber = phoneNumber.replace(/\+/g, '').replace(/\s/g, '');
    
    // Format message for WhatsApp
    const whatsappMessage = this.formatWhatsAppMessage(payload);

    // WhatsApp Business API endpoint
    const whatsappUrl = `https://graph.facebook.com/v18.0/${this.whatsappConfig.phoneNumberId}/messages`;

    const messagePayload = {
      messaging_product: "whatsapp",
      recipient_type: "individual", 
      to: cleanPhoneNumber,
      type: "text",
      text: {
        preview_url: false,
        body: whatsappMessage
      }
    };

    const response = await fetch(whatsappUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.whatsappConfig.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messagePayload)
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`WhatsApp API error: ${error}`);
    }

    const responseData = await response.json();
    console.log(`✅ WhatsApp notification sent successfully to ${phoneNumber}`, responseData);
  }

  /**
   * Format Telegram message
   */
  private formatTelegramMessage(payload: NotificationPayload): string {
    let message = `🚀 *تایتان - سیستم معاملات*\n\n`;
    
    // Add appropriate emoji based on type
    const typeEmojis = {
      'alert_triggered': '🚨',
      'alert_created': '✅',
      'alert_deleted': '🗑️',
      'system_notification': '📢'
    };

    message += `${typeEmojis[payload.type] || '📣'} *${payload.title}*\n\n`;
    message += `${payload.message}\n\n`;

    // Add alert-specific data
    if (payload.data) {
      if (payload.data.symbol) {
        message += `💰 *نماد:* ${payload.data.symbol}\n`;
      }
      if (payload.data.currentPrice) {
        message += `💲 *قیمت فعلی:* $${payload.data.currentPrice}\n`;
      }
      if (payload.data.targetPrice) {
        message += `🎯 *قیمت هدف:* $${payload.data.targetPrice}\n`;
      }
      if (payload.data.change) {
        const changeEmoji = payload.data.change > 0 ? '📈' : '📉';
        message += `${changeEmoji} *تغییر:* ${payload.data.change}%\n`;
      }
    }

    message += `\n⏰ ${new Date().toLocaleString('fa-IR')}`;

    return message;
  }

  /**
   * Format email content
   */
  private formatEmailContent(payload: NotificationPayload): string {
    return `
      <!DOCTYPE html>
      <html dir="rtl" lang="fa">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${payload.title}</title>
        <style>
          body { font-family: 'Tahoma', sans-serif; direction: rtl; background-color: #f5f5f5; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 10px; text-align: center; }
          .content { padding: 20px; }
          .footer { text-align: center; color: #666; font-size: 12px; padding: 10px; }
          .alert-info { background-color: #f0f9ff; border-right: 4px solid #0ea5e9; padding: 15px; margin: 15px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 تایتان - سیستم معاملات</h1>
            <h2>${payload.title}</h2>
          </div>
          <div class="content">
            <p>${payload.message}</p>
            ${payload.data ? `
              <div class="alert-info">
                <strong>جزئیات هشدار:</strong><br>
                ${payload.data.symbol ? `نماد: ${payload.data.symbol}<br>` : ''}
                ${payload.data.currentPrice ? `قیمت فعلی: $${payload.data.currentPrice}<br>` : ''}
                ${payload.data.targetPrice ? `قیمت هدف: $${payload.data.targetPrice}<br>` : ''}
                ${payload.data.change ? `تغییر: ${payload.data.change}%<br>` : ''}
              </div>
            ` : ''}
            <p><strong>زمان:</strong> ${new Date().toLocaleString('fa-IR')}</p>
          </div>
          <div class="footer">
            این ایمیل از سیستم خودکار تایتان ارسال شده است.<br>
            برای لغو اشتراک، به تنظیمات حساب کاربری خود مراجعه کنید.
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Format SMS message (simple text, no formatting)
   */
  private formatSMSMessage(payload: NotificationPayload): string {
    let message = `تایتان: ${payload.title}\n`;
    message += payload.message;
    
    // Keep it short for SMS
    if (message.length > 160) {
      message = message.substring(0, 157) + '...';
    }
    
    return message;
  }

  /**
   * Format WhatsApp message
   */
  private formatWhatsAppMessage(payload: NotificationPayload): string {
    let message = `🚀 *تایتان - سیستم معاملات*\n\n`;
    
    // Add appropriate emoji based on type
    const typeEmojis = {
      'alert_triggered': '🚨',
      'alert_created': '✅', 
      'alert_deleted': '🗑️',
      'system_notification': '📢'
    };

    message += `${typeEmojis[payload.type] || '📣'} *${payload.title}*\n\n`;
    message += `${payload.message}\n\n`;

    // Add alert-specific data
    if (payload.data) {
      if (payload.data.symbol) {
        message += `💰 *نماد:* ${payload.data.symbol}\n`;
      }
      if (payload.data.currentPrice) {
        message += `💲 *قیمت فعلی:* $${payload.data.currentPrice}\n`;
      }
      if (payload.data.targetPrice) {
        message += `🎯 *قیمت هدف:* $${payload.data.targetPrice}\n`;
      }
      if (payload.data.changePercent) {
        message += `📊 *تغییر:* ${payload.data.changePercent > 0 ? '+' : ''}${payload.data.changePercent}%\n`;
      }
    }

    message += `\n⏰ ${new Date().toLocaleString('fa-IR', { timeZone: 'Asia/Tehran' })}`;
    message += `\n\n💻 سیستم تایتان - معاملات هوشمند`;

    return message;
  }

  /**
   * Test notification delivery
   */
  async testNotification(type: 'telegram' | 'email' | 'sms' | 'whatsapp', userSettings: any): Promise<boolean> {
    const testPayload: NotificationPayload = {
      type: 'system_notification',
      title: 'تست اطلاع‌رسانی',
      message: 'این یک پیام آزمایشی از سیستم تایتان است. اگر این پیام را دریافت کردید، اطلاع‌رسانی‌ها به درستی کار می‌کنند.',
      priority: 'low',
      userId: userSettings.userId,
      data: {
        testTime: new Date().toLocaleString('fa-IR')
      }
    };

    try {
      switch (type) {
        case 'telegram':
          await this.sendTelegramNotification(testPayload, userSettings.telegramChatId);
          break;
        case 'email':
          await this.sendEmailNotification(testPayload, userSettings.emailAddress);
          break;
        case 'sms':
          await this.sendSMSNotification(testPayload, userSettings.phoneNumber);
          break;
        case 'whatsapp':
          await this.sendWhatsAppNotification(testPayload, userSettings.whatsappPhoneNumber);
          break;
      }
      return true;
    } catch (error) {
      console.error(`Test notification failed for ${type}:`, error);
      return false;
    }
  }

  /**
   * Get service status
   */
  getServiceStatus(): {
    telegram: boolean;
    email: boolean;
    sms: boolean;
    configurations: any;
  } {
    return {
      telegram: this.telegramConfig.enabled,
      email: this.emailConfig.enabled,
      sms: this.smsConfig.enabled,
      configurations: {
        telegram: {
          configured: !!this.telegramConfig.botToken,
          chatId: !!this.telegramConfig.chatId
        },
        email: {
          configured: !!this.emailConfig.smtpUser,
          from: this.emailConfig.from
        },
        sms: {
          configured: !!this.smsConfig.apiKey,
          sender: this.smsConfig.sender
        }
      }
    };
  }

  /**
   * Send alert notification specifically
   */
  async sendAlertNotification(alert: any, currentPrice: number, userSettings: any): Promise<void> {
    const payload: NotificationPayload = {
      type: 'alert_triggered',
      title: `هشدار فعال شد: ${alert.alertName}`,
      message: `هشدار ${alert.symbol} در قیمت $${currentPrice} فعال شد.`,
      priority: 'high',
      userId: alert.userId,
      alertId: alert.id,
      data: {
        symbol: alert.symbol,
        currentPrice: currentPrice,
        targetPrice: alert.targetPrice,
        alertType: alert.alertType,
        change: alert.percentageChange
      }
    };

    const result = await this.sendNotification(payload, userSettings);
    
    if (!result.success) {
      console.error('Alert notification failed:', result.errors);
    } else {
      console.log('Alert notification sent successfully:', result.results);
    }
  }
}

// Export singleton instance
export const notificationService = new NotificationService();