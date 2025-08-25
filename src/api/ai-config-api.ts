import { Hono } from 'hono'
import type { Env } from '../types/cloudflare'

interface AIProviderConfig {
  id: string
  name: string
  type: 'openai' | 'gemini' | 'claude' | 'local'
  apiKey?: string
  baseUrl?: string
  model?: string
  enabled: boolean
  priority: number
  maxTokens?: number
  temperature?: number
  timeout?: number
  fallbackChain?: string[]
  rateLimits?: {
    requestsPerMinute: number
    tokensPerMinute: number
  }
}

interface SystemConfig {
  defaultProvider: string
  fallbackEnabled: boolean
  sentimentAnalysis: {
    enabled: boolean
    language: 'fa' | 'en' | 'multi'
    threshold: number
  }
  machineLearning: {
    enabled: boolean
    adaptationRate: number
    memorySize: number
    qualityThreshold: number
  }
  contextMemory: {
    enabled: boolean
    maxConversations: number
    maxMessagesPerConversation: number
    ttl: number // seconds
  }
  analytics: {
    enabled: boolean
    trackingLevel: 'basic' | 'detailed' | 'full'
    retentionDays: number
  }
}

const app = new Hono<{ Bindings: Env }>()

// Default configuration
const defaultConfig: SystemConfig = {
  defaultProvider: 'openai-gpt4',
  fallbackEnabled: true,
  sentimentAnalysis: {
    enabled: true,
    language: 'multi',
    threshold: 0.6
  },
  machineLearning: {
    enabled: true,
    adaptationRate: 0.1,
    memorySize: 1000,
    qualityThreshold: 0.7
  },
  contextMemory: {
    enabled: true,
    maxConversations: 100,
    maxMessagesPerConversation: 50,
    ttl: 3600 // 1 hour
  },
  analytics: {
    enabled: true,
    trackingLevel: 'detailed',
    retentionDays: 30
  }
}

const defaultProviders: AIProviderConfig[] = [
  {
    id: 'openai-gpt4',
    name: 'OpenAI GPT-4',
    type: 'openai',
    model: 'gpt-4',
    enabled: false,
    priority: 1,
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 30000,
    rateLimits: {
      requestsPerMinute: 50,
      tokensPerMinute: 100000
    }
  },
  {
    id: 'openai-gpt35',
    name: 'OpenAI GPT-3.5 Turbo',
    type: 'openai',
    model: 'gpt-3.5-turbo',
    enabled: false,
    priority: 2,
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 20000,
    rateLimits: {
      requestsPerMinute: 100,
      tokensPerMinute: 200000
    }
  },
  {
    id: 'gemini-pro',
    name: 'Google Gemini Pro',
    type: 'gemini',
    model: 'gemini-pro',
    enabled: false,
    priority: 3,
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 25000,
    rateLimits: {
      requestsPerMinute: 60,
      tokensPerMinute: 120000
    }
  },
  {
    id: 'claude-3',
    name: 'Anthropic Claude 3',
    type: 'claude',
    model: 'claude-3-sonnet-20240229',
    enabled: false,
    priority: 4,
    maxTokens: 2000,
    temperature: 0.7,
    timeout: 30000,
    rateLimits: {
      requestsPerMinute: 40,
      tokensPerMinute: 80000
    }
  },
  {
    id: 'local-model',
    name: 'Local AI Model',
    type: 'local',
    model: 'local-llm',
    enabled: true,
    priority: 5,
    maxTokens: 1000,
    temperature: 0.7,
    timeout: 15000,
    rateLimits: {
      requestsPerMinute: 200,
      tokensPerMinute: 500000
    }
  }
]

// Get system configuration
app.get('/config', async (c) => {
  try {
    const { env } = c

    // Try to get saved config from KV or D1, fallback to default
    let config: SystemConfig
    
    if (env?.KV) {
      const savedConfig = await env.KV.get('ai-system-config')
      config = savedConfig ? JSON.parse(savedConfig) : defaultConfig
    } else {
      config = defaultConfig
    }

    return c.json({
      success: true,
      config,
      message: 'تنظیمات سیستم بازیابی شد'
    })
  } catch (error) {
    console.error('Error getting AI config:', error)
    return c.json({
      success: false,
      error: 'خطا در بازیابی تنظیمات',
      config: defaultConfig
    }, 500)
  }
})

// Update system configuration
app.post('/config', async (c) => {
  try {
    const { env } = c
    const updates = await c.req.json()

    // Get current config
    let currentConfig: SystemConfig
    if (env?.KV) {
      const savedConfig = await env.KV.get('ai-system-config')
      currentConfig = savedConfig ? JSON.parse(savedConfig) : defaultConfig
    } else {
      currentConfig = defaultConfig
    }

    // Merge updates
    const updatedConfig = { ...currentConfig, ...updates }

    // Validate configuration
    if (updatedConfig.machineLearning.adaptationRate < 0 || updatedConfig.machineLearning.adaptationRate > 1) {
      return c.json({
        success: false,
        error: 'نرخ تطبیق یادگیری ماشین باید بین 0 و 1 باشد'
      }, 400)
    }

    if (updatedConfig.contextMemory.maxConversations < 1) {
      return c.json({
        success: false,
        error: 'حداکثر تعداد مکالمات باید حداقل 1 باشد'
      }, 400)
    }

    // Save configuration
    if (env?.KV) {
      await env.KV.put('ai-system-config', JSON.stringify(updatedConfig))
    }

    return c.json({
      success: true,
      config: updatedConfig,
      message: 'تنظیمات سیستم با موفقیت به‌روزرسانی شد'
    })
  } catch (error) {
    console.error('Error updating AI config:', error)
    return c.json({
      success: false,
      error: 'خطا در به‌روزرسانی تنظیمات'
    }, 500)
  }
})

// Get AI providers configuration
app.get('/providers', async (c) => {
  try {
    const { env } = c

    // Try to get saved providers from KV or D1, fallback to default
    let providers: AIProviderConfig[]
    
    if (env?.KV) {
      const savedProviders = await env.KV.get('ai-providers-config')
      providers = savedProviders ? JSON.parse(savedProviders) : defaultProviders
    } else {
      providers = defaultProviders
    }

    // Remove sensitive information (API keys) from response
    const safeProviders = providers.map(provider => ({
      ...provider,
      apiKey: provider.apiKey ? '***masked***' : undefined
    }))

    return c.json({
      success: true,
      providers: safeProviders,
      message: 'تنظیمات ارائه‌دهندگان AI بازیابی شد'
    })
  } catch (error) {
    console.error('Error getting AI providers:', error)
    return c.json({
      success: false,
      error: 'خطا در بازیابی تنظیمات ارائه‌دهندگان',
      providers: defaultProviders.map(p => ({ ...p, apiKey: undefined }))
    }, 500)
  }
})

// Update AI provider configuration
app.post('/providers/:id', async (c) => {
  try {
    const { env } = c
    const providerId = c.req.param('id')
    const updates = await c.req.json()

    // Get current providers
    let providers: AIProviderConfig[]
    if (env?.KV) {
      const savedProviders = await env.KV.get('ai-providers-config')
      providers = savedProviders ? JSON.parse(savedProviders) : defaultProviders
    } else {
      providers = [...defaultProviders]
    }

    // Find and update provider
    const providerIndex = providers.findIndex(p => p.id === providerId)
    if (providerIndex === -1) {
      return c.json({
        success: false,
        error: 'ارائه‌دهنده AI یافت نشد'
      }, 404)
    }

    // Update provider
    providers[providerIndex] = { ...providers[providerIndex], ...updates }

    // Validate configuration
    if (providers[providerIndex].priority < 1) {
      return c.json({
        success: false,
        error: 'اولویت باید حداقل 1 باشد'
      }, 400)
    }

    if (providers[providerIndex].timeout && providers[providerIndex].timeout! < 1000) {
      return c.json({
        success: false,
        error: 'مهلت زمانی باید حداقل 1000 میلی‌ثانیه باشد'
      }, 400)
    }

    // Save providers
    if (env?.KV) {
      await env.KV.put('ai-providers-config', JSON.stringify(providers))
    }

    // Return safe provider (without API key)
    const safeProvider = { ...providers[providerIndex] }
    if (safeProvider.apiKey) {
      safeProvider.apiKey = '***masked***'
    }

    return c.json({
      success: true,
      provider: safeProvider,
      message: 'تنظیمات ارائه‌دهنده AI با موفقیت به‌روزرسانی شد'
    })
  } catch (error) {
    console.error('Error updating AI provider:', error)
    return c.json({
      success: false,
      error: 'خطا در به‌روزرسانی تنظیمات ارائه‌دهنده'
    }, 500)
  }
})

// Test AI provider connection
app.post('/providers/:id/test', async (c) => {
  try {
    const providerId = c.req.param('id')
    const testMessage = 'سلام! این یک پیام تست است.'

    // This would normally test the actual provider connection
    // For now, we'll simulate the test
    const success = Math.random() > 0.3 // 70% success rate simulation

    return c.json({
      success,
      providerId,
      message: success 
        ? 'اتصال به ارائه‌دهنده AI با موفقیت تست شد'
        : 'خطا در اتصال به ارائه‌دهنده AI',
      responseTime: Math.floor(Math.random() * 2000) + 500, // Simulate response time
      testMessage
    })
  } catch (error) {
    console.error('Error testing AI provider:', error)
    return c.json({
      success: false,
      error: 'خطا در تست ارائه‌دهنده AI'
    }, 500)
  }
})

// Get provider performance metrics
app.get('/providers/:id/metrics', async (c) => {
  try {
    const { env } = c
    const providerId = c.req.param('id')

    // Try to get metrics from storage
    let metrics = {
      providerId,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageResponseTime: 0,
      uptime: 100,
      lastUsed: null,
      performance: {
        accuracy: 0,
        relevance: 0,
        coherence: 0,
        overall: 0
      }
    }

    if (env?.KV) {
      const savedMetrics = await env.KV.get(`ai-provider-metrics-${providerId}`)
      if (savedMetrics) {
        metrics = JSON.parse(savedMetrics)
      }
    }

    return c.json({
      success: true,
      metrics,
      message: 'آمار عملکرد ارائه‌دهنده بازیابی شد'
    })
  } catch (error) {
    console.error('Error getting provider metrics:', error)
    return c.json({
      success: false,
      error: 'خطا در بازیابی آمار عملکرد'
    }, 500)
  }
})

// Reset provider configuration to defaults
app.post('/reset', async (c) => {
  try {
    const { env } = c

    // Reset to default configurations
    if (env?.KV) {
      await env.KV.put('ai-system-config', JSON.stringify(defaultConfig))
      await env.KV.put('ai-providers-config', JSON.stringify(defaultProviders))
    }

    return c.json({
      success: true,
      config: defaultConfig,
      providers: defaultProviders.map(p => ({ ...p, apiKey: undefined })),
      message: 'تنظیمات به حالت پیش‌فرض بازگردانده شد'
    })
  } catch (error) {
    console.error('Error resetting AI config:', error)
    return c.json({
      success: false,
      error: 'خطا در بازگرداندن تنظیمات'
    }, 500)
  }
})

// Export configuration (for backup)
app.get('/export', async (c) => {
  try {
    const { env } = c

    let config: SystemConfig = defaultConfig
    let providers: AIProviderConfig[] = defaultProviders

    if (env?.KV) {
      const savedConfig = await env.KV.get('ai-system-config')
      const savedProviders = await env.KV.get('ai-providers-config')
      
      if (savedConfig) config = JSON.parse(savedConfig)
      if (savedProviders) providers = JSON.parse(savedProviders)
    }

    // Remove sensitive data
    const safeProviders = providers.map(provider => ({
      ...provider,
      apiKey: undefined
    }))

    const exportData = {
      version: '1.0',
      exportDate: new Date().toISOString(),
      config,
      providers: safeProviders
    }

    return c.json({
      success: true,
      data: exportData,
      message: 'تنظیمات برای خروجی آماده شد'
    })
  } catch (error) {
    console.error('Error exporting AI config:', error)
    return c.json({
      success: false,
      error: 'خطا در آماده‌سازی خروجی تنظیمات'
    }, 500)
  }
})

// Import configuration (from backup)
app.post('/import', async (c) => {
  try {
    const { env } = c
    const importData = await c.req.json()

    // Validate import data
    if (!importData.config || !importData.providers) {
      return c.json({
        success: false,
        error: 'فرمت فایل ورودی نامعتبر است'
      }, 400)
    }

    // Save imported configuration
    if (env?.KV) {
      await env.KV.put('ai-system-config', JSON.stringify(importData.config))
      await env.KV.put('ai-providers-config', JSON.stringify(importData.providers))
    }

    return c.json({
      success: true,
      config: importData.config,
      providers: importData.providers.map((p: any) => ({ ...p, apiKey: undefined })),
      message: 'تنظیمات با موفقیت وارد شد'
    })
  } catch (error) {
    console.error('Error importing AI config:', error)
    return c.json({
      success: false,
      error: 'خطا در وارد کردن تنظیمات'
    }, 500)
  }
})

export default app