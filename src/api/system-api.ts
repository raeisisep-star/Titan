// TITAN System Management API
import { Hono } from 'hono'
import type { Env } from '../types/cloudflare'
const app = new Hono<{ Bindings: Env }>()

// System Status Endpoint
app.get('/status', async (c) => {
  try {
    // Mock system metrics (in production this would come from actual monitoring)
    const startTime = Date.now()
    
    // Simulate system checks
    const components = [
      { name: 'مغز AI', status: 'online', responseTime: Math.floor(Math.random() * 20) + 10 },
      { name: 'آرتمیس پیشرفته', status: 'online', responseTime: Math.floor(Math.random() * 30) + 15 },
      { name: 'موتور معاملات', status: 'online', responseTime: Math.floor(Math.random() * 40) + 20 },
      { name: 'جریان داده‌ها', status: 'online', responseTime: Math.floor(Math.random() * 25) + 12 },
      { 
        name: 'همگام‌سازی اطلاعات', 
        status: Math.random() > 0.8 ? 'warning' : 'online',
        responseTime: Math.floor(Math.random() * 60) + 30
      }
    ]

    // Determine overall status
    const hasWarning = components.some(c => c.status === 'warning')
    const hasError = components.some(c => c.status === 'error')
    const overall = hasError ? 'error' : hasWarning ? 'warning' : 'online'

    // Generate realistic metrics
    const cpu = Math.floor(Math.random() * 30) + 10 // 10-40%
    const memory = Math.floor(Math.random() * 40) + 20 // 20-60%
    const network = Math.floor(Math.random() * 20) + 70 // 70-90%

    // Generate recent activities
    const activities = [
      {
        id: 1,
        type: 'ai',
        icon: '🧠',
        title: 'مغز AI',
        description: 'تولید بیش‌بینی‌ها',
        timestamp: new Date(Date.now() - Math.random() * 300000).toLocaleString('fa-IR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: 'active'
      },
      {
        id: 2, 
        type: 'trading',
        icon: '💰',
        title: 'موتور معاملات',
        description: 'اجرای استراتژی DCA',
        timestamp: new Date(Date.now() - Math.random() * 600000).toLocaleString('fa-IR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: 'active'
      },
      {
        id: 3,
        type: 'data',
        icon: '📊',
        title: 'جریان داده‌ها',
        description: 'دریافت قیمت‌های جدید از CoinGecko',
        timestamp: new Date(Date.now() - Math.random() * 900000).toLocaleString('fa-IR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: 'completed'
      },
      {
        id: 4,
        type: 'sync',
        icon: '🔄',
        title: 'همگام‌سازی اطلاعات',
        description: 'بروزرسانی پورتفولیو کاربران',
        timestamp: new Date(Date.now() - Math.random() * 1200000).toLocaleString('fa-IR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: 'pending'
      },
      {
        id: 5,
        type: 'notification',
        icon: '🔔',
        title: 'سیستم اعلانات',
        description: 'ارسال هشدار رسیدن به هدف قیمتی',
        timestamp: new Date(Date.now() - Math.random() * 1800000).toLocaleString('fa-IR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        status: 'completed'
      }
    ]

    const endTime = Date.now()
    const responseTime = endTime - startTime

    return c.json({
      success: true,
      status: 'healthy',
      overall,
      timestamp: new Date().toISOString(),
      lastUpdate: new Date().toLocaleString('fa-IR'),
      responseTime: `${responseTime}ms`,
      metrics: {
        cpu,
        memory,
        network,
        uptime: Math.floor(Math.random() * 86400) + 3600, // 1-25 hours in seconds
        activeConnections: Math.floor(Math.random() * 100) + 50
      },
      components,
      activities,
      version: '3.0.0',
      environment: 'production'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get system status',
      overall: 'error',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Get environment variables (return current environment values, masked for security)
app.get('/env-vars', async (c) => {
  try {
    const variables: Record<string, string> = {}
    
    // Common environment variables that TITAN uses
    const envKeys = [
      // Exchange APIs
      'BINANCE_API_KEY', 'BINANCE_SECRET_KEY', 'BINANCE_TESTNET',
      'COINBASE_API_KEY', 'COINBASE_SECRET_KEY', 'COINBASE_PASSPHRASE', 'COINBASE_SANDBOX',
      'KUCOIN_API_KEY', 'KUCOIN_SECRET_KEY', 'KUCOIN_PASSPHRASE', 'KUCOIN_SANDBOX',
      
      // Notification APIs
      'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASSWORD',
      'TELEGRAM_BOT_TOKEN', 'TELEGRAM_CHAT_ID',
      'KAVENEGAR_API_KEY', 'KAVENEGAR_SENDER', 'SMS_PHONE_NUMBER',
      
      // AI Services
      'OPENAI_API_KEY', 'ANTHROPIC_API_KEY', 'COINGECKO_API_KEY',
      
      // System
      'JWT_SECRET', 'DATABASE_URL'
    ]
    
    for (const key of envKeys) {
      const value = c.env[key] || ''
      
      // Mask sensitive values
      if (key.includes('SECRET') || key.includes('PASSWORD') || 
          key.includes('TOKEN') || key.includes('KEY')) {
        variables[key] = value ? '••••••••' : ''
      } else {
        variables[key] = value
      }
    }

    return c.json({
      success: true,
      variables,
      message: 'Environment variables retrieved from Cloudflare bindings'
    })
    
  } catch (error) {
    console.error('Error reading environment variables:', error)
    return c.json({
      success: false,
      message: 'Failed to read environment variables'
    }, 500)
  }
})

// Save environment variables (to KV storage for development)
app.post('/env-vars', async (c) => {
  try {
    const { variables } = await c.req.json()
    
    if (!variables || typeof variables !== 'object') {
      return c.json({
        success: false,
        message: 'Invalid variables data'
      }, 400)
    }

    // In Cloudflare Workers environment, we can't modify .dev.vars file directly
    // Instead, we'll store the configuration in KV for the UI, but note that
    // actual environment variables need to be set through wrangler or Cloudflare dashboard
    
    if (c.env.KV) {
      // Store non-sensitive environment variable configuration
      const envConfig = {
        updated_at: new Date().toISOString(),
        variables: {} as Record<string, string>
      }
      
      // Only store non-sensitive configuration values
      for (const [key, value] of Object.entries(variables)) {
        if (typeof value === 'string') {
          // Don't store masked values or sensitive data
          if (value !== '••••••••' && 
              !key.includes('SECRET') && 
              !key.includes('PASSWORD') && 
              !key.includes('TOKEN') && 
              !key.includes('KEY')) {
            envConfig.variables[key] = value
          }
        }
      }
      
      await c.env.KV.put('env_config', JSON.stringify(envConfig), { expirationTtl: 86400 })
    }

    return c.json({
      success: true,
      message: 'Environment configuration saved to KV storage. Note: Sensitive values must be set via Cloudflare dashboard or wrangler.toml'
    })
    
  } catch (error) {
    console.error('Error saving environment variables:', error)
    return c.json({
      success: false,
      message: 'Failed to save environment variables'
    }, 500)
  }
})

// Restart services (simulate restart in Cloudflare Workers)
app.post('/restart-services', async (c) => {
  try {
    console.log('🔄 Simulating service restart in Cloudflare Workers environment...')
    
    // In Cloudflare Workers, we can't actually restart processes
    // This endpoint provides feedback to the UI that restart is "completed"
    // Real restarts would need to be done via deployment or external process management
    
    // Store restart request in KV for logging
    if (c.env.KV) {
      const restartLog = {
        timestamp: new Date().toISOString(),
        status: 'simulated',
        environment: 'cloudflare-workers',
        message: 'Restart simulation completed - in production, services restart automatically on deployment'
      }
      
      await c.env.KV.put(`restart_log_${Date.now()}`, JSON.stringify(restartLog), { expirationTtl: 3600 })
    }
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return c.json({
      success: true,
      message: 'Service restart completed (simulated in Cloudflare Workers environment)'
    })
    
  } catch (error) {
    console.error('Error in restart simulation:', error)
    return c.json({
      success: false,
      message: 'Failed to process restart request'
    }, 500)
  }
})

// Get system status
app.get('/status', async (c) => {
  try {
    const status = {
      timestamp: new Date().toISOString(),
      services: {
        main: 'running',
        database: 'connected',
        notifications: 'active'
      },
      environment: process.env.NODE_ENV || 'development',
      uptime: process.uptime()
    }

    return c.json({
      success: true,
      status
    })
    
  } catch (error) {
    console.error('Error getting system status:', error)
    return c.json({
      success: false,
      message: 'Failed to get system status'
    }, 500)
  }
})

export default app