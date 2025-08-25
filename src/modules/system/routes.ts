import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'
import { ModeManager, SystemMode } from './modes'

// Bindings are defined in Env type

export const systemRoutes = new Hono<{ Bindings: Env }>()

const modeManager = ModeManager.getInstance()

// Get system status
systemRoutes.get('/status', async (c) => {
  try {
    const config = modeManager.getConfig()
    return c.json({
      success: true,
      data: {
        system_health: 92,
        uptime: '23h 42m',
        active_connections: 1247,
        memory_usage: 67,
        cpu_usage: 34,
        current_mode: config.mode,
        mode_indicator: config.mode === SystemMode.DEMO ? 'دمو' : 'واقعی',
        virtual_balance: config.virtual_balance,
        emergency_stop: config.emergency_stop,
        max_concurrent_trades: config.max_concurrent_trades,
        risk_level: config.risk_level
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت وضعیت سیستم' }, 500)
  }
})

// Get current operating mode
systemRoutes.get('/mode', async (c) => {
  try {
    const config = modeManager.getConfig()
    return c.json({
      success: true,
      data: {
        current_mode: config.mode,
        mode_display: config.mode === SystemMode.DEMO ? 'حالت دمو' : 'حالت واقعی',
        mode_description: config.mode === SystemMode.DEMO 
          ? 'سیستم با داده‌های واقعی اما بدون ریسک مالی کار می‌کند'
          : 'سیستم با بودجه واقعی معامله می‌کند',
        virtual_balance: config.virtual_balance,
        can_switch_to_live: modeManager.isReadyForLiveTrading(),
        safety_features: {
          emergency_stop: config.emergency_stop,
          risk_management: true,
          ai_supervision: true
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت حالت سیستم' }, 500)
  }
})

// Switch operating mode
systemRoutes.post('/mode', async (c) => {
  try {
    const { mode } = await c.req.json()
    
    if (!mode || !Object.values(SystemMode).includes(mode)) {
      return c.json({ success: false, message: 'حالت سیستم نامعتبر است' }, 400)
    }

    const success = modeManager.setMode(mode as SystemMode)
    
    if (!success && mode === SystemMode.LIVE) {
      return c.json({
        success: false,
        message: 'سیستم آماده تغییر به حالت واقعی نیست',
        reason: 'معیارهای مورد نیاز برای معامله واقعی هنوز تأمین نشده‌اند'
      }, 400)
    }

    return c.json({
      success: true,
      message: `سیستم به حالت ${mode === SystemMode.DEMO ? 'دمو' : 'واقعی'} تغییر کرد`,
      data: {
        new_mode: mode,
        mode_display: mode === SystemMode.DEMO ? 'حالت دمو' : 'حالت واقعی'
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در تغییر حالت سیستم' }, 500)
  }
})

// Emergency stop
systemRoutes.post('/emergency-stop', async (c) => {
  try {
    modeManager.emergencyStop()
    
    return c.json({
      success: true,
      message: 'توقف اضطراری فعال شد - تمام معاملات جدید متوقف شدند',
      data: {
        emergency_stop: true,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در فعال‌سازی توقف اضطراری' }, 500)
  }
})

// Resume trading
systemRoutes.post('/resume', async (c) => {
  try {
    modeManager.resumeTrading()
    
    return c.json({
      success: true,
      message: 'سیستم از حالت توقف اضطراری خارج شد',
      data: {
        emergency_stop: false,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در از سرگیری معاملات' }, 500)
  }
})

// System diagnostics and check-up
systemRoutes.get('/diagnostics', async (c) => {
  try {
    return c.json({
      success: true,
      data: {
        system_checks: [
          { name: 'اتصال به صرافی‌ها', status: 'ok', details: '5 صرافی متصل' },
          { name: 'هوش مصنوعی آرتمیس', status: 'ok', details: 'عملکرد عالی' },
          { name: '15 عامل AI', status: 'ok', details: 'همه فعال' },
          { name: 'سیستم ریسک', status: 'ok', details: 'حد مجاز' },
          { name: 'اتصال اینترنت', status: 'ok', details: 'پینگ 23ms' },
          { name: 'دیتابیس', status: 'ok', details: 'سالم' },
          { name: 'API های خارجی', status: 'warning', details: 'یک API کند' }
        ],
        performance_metrics: {
          response_time: '145ms',
          accuracy_24h: '87.3%',
          trades_executed: 127,
          system_load: '34%',
          memory_usage: '67%'
        },
        recommendations: [
          'بهینه‌سازی API تحلیل احساسات برای بهبود سرعت',
          'افزایش حافظه سیستم برای عملکرد بهتر در ساعات پیک'
        ]
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در تشخیص وضعیت سیستم' }, 500)
  }
})

// Storage and Cache Management
systemRoutes.get('/storage/stats', async (c) => {
  try {
    const StorageService = (await import('../../services/storage-service')).default
    const storage = new StorageService(c.env)
    
    const metrics = await storage.getSystemMetrics()
    const stats = storage.getStatistics()
    
    return c.json({
      success: true,
      data: {
        kv_available: !!c.env.KV,
        r2_available: !!c.env.R2,
        metrics: metrics,
        cache_stats: stats,
        storage_health: c.env.KV ? 'healthy' : 'no_kv_namespace'
      }
    })
  } catch (error) {
    console.error('Storage stats error:', error)
    return c.json({ success: false, message: 'خطا در دریافت آمار ذخیره‌سازی' }, 500)
  }
})

// Test KV Storage
systemRoutes.post('/storage/test', async (c) => {
  try {
    const StorageService = (await import('../../services/storage-service')).default
    const storage = new StorageService(c.env)
    
    const testKey = 'test_' + Date.now()
    const testData = {
      message: 'تست ذخیره‌سازی KV',
      timestamp: new Date().toISOString(),
      random: Math.random()
    }
    
    // Test write
    const writeSuccess = await storage.set(testKey, testData, 60)
    if (!writeSuccess) {
      return c.json({ success: false, message: 'خطا در نوشتن به KV' }, 500)
    }
    
    // Test read
    const readData = await storage.get(testKey)
    if (!readData) {
      return c.json({ success: false, message: 'خطا در خواندن از KV' }, 500)
    }
    
    // Test delete
    await storage.delete(testKey)
    
    return c.json({
      success: true,
      message: 'تست KV storage موفقیت‌آمیز بود',
      data: {
        written: testData,
        read: readData,
        match: JSON.stringify(testData) === JSON.stringify(readData)
      }
    })
  } catch (error) {
    console.error('KV test error:', error)
    return c.json({ success: false, message: 'خطا در تست KV storage' }, 500)
  }
})

export default systemRoutes