// Storage Service Layer for Cloudflare KV and R2
// مدیریت ذخیره‌سازی داده‌ها و cache

import type { Env } from '../types/cloudflare'

export interface CacheItem<T = any> {
  data: T
  timestamp: number
  ttl?: number // Time to live in seconds
}

export interface StorageMetrics {
  total_keys: number
  cache_hits: number
  cache_misses: number
  last_updated: string
}

export class StorageService {
  private env: Env
  private cacheHits = 0
  private cacheMisses = 0

  constructor(env: Env) {
    this.env = env
  }

  // KV Operations
  async get<T = any>(key: string): Promise<T | null> {
    if (!this.env.KV) {
      console.warn('KV namespace not available')
      return null
    }

    try {
      const value = await this.env.KV.get(key)
      if (!value) {
        this.cacheMisses++
        return null
      }

      this.cacheHits++
      const parsed = JSON.parse(value) as CacheItem<T>
      
      // Check TTL
      if (parsed.ttl && Date.now() > parsed.timestamp + (parsed.ttl * 1000)) {
        await this.delete(key)
        this.cacheMisses++
        return null
      }

      return parsed.data
    } catch (error) {
      console.error('KV get error:', error)
      this.cacheMisses++
      return null
    }
  }

  async set<T = any>(key: string, data: T, ttl?: number): Promise<boolean> {
    if (!this.env.KV) {
      console.warn('KV namespace not available')
      return false
    }

    try {
      const cacheItem: CacheItem<T> = {
        data,
        timestamp: Date.now(),
        ttl
      }

      const options: KVNamespacePutOptions = {}
      if (ttl) {
        options.expirationTtl = ttl
      }

      await this.env.KV.put(key, JSON.stringify(cacheItem), options)
      return true
    } catch (error) {
      console.error('KV set error:', error)
      return false
    }
  }

  async delete(key: string): Promise<boolean> {
    if (!this.env.KV) {
      return false
    }

    try {
      await this.env.KV.delete(key)
      return true
    } catch (error) {
      console.error('KV delete error:', error)
      return false
    }
  }

  async list(prefix?: string): Promise<string[]> {
    if (!this.env.KV) {
      return []
    }

    try {
      const result = await this.env.KV.list({ prefix })
      return result.keys.map(key => key.name)
    } catch (error) {
      console.error('KV list error:', error)
      return []
    }
  }

  // Cache Management for Trading Data
  async cacheMarketData(symbol: string, data: any, ttl: number = 60): Promise<void> {
    await this.set(`market_data:${symbol}`, data, ttl)
  }

  async getMarketData(symbol: string): Promise<any> {
    return await this.get(`market_data:${symbol}`)
  }

  // Cache AI Responses to reduce API calls
  async cacheAIResponse(prompt: string, response: any, ttl: number = 300): Promise<void> {
    const key = `ai_response:${this.hashString(prompt)}`
    await this.set(key, response, ttl)
  }

  async getCachedAIResponse(prompt: string): Promise<any> {
    const key = `ai_response:${this.hashString(prompt)}`
    return await this.get(key)
  }

  // Cache User Sessions
  async cacheUserSession(userId: string, sessionData: any, ttl: number = 3600): Promise<void> {
    await this.set(`session:${userId}`, sessionData, ttl)
  }

  async getUserSession(userId: string): Promise<any> {
    return await this.get(`session:${userId}`)
  }

  async deleteUserSession(userId: string): Promise<boolean> {
    return await this.delete(`session:${userId}`)
  }

  // Cache Trading Signals
  async cacheTradingSignal(signalId: string, signal: any, ttl: number = 300): Promise<void> {
    await this.set(`signal:${signalId}`, signal, ttl)
    
    // Also add to list of active signals
    const activeSignals = await this.get<string[]>('active_signals') || []
    if (!activeSignals.includes(signalId)) {
      activeSignals.push(signalId)
      await this.set('active_signals', activeSignals, ttl)
    }
  }

  async getTradingSignal(signalId: string): Promise<any> {
    return await this.get(`signal:${signalId}`)
  }

  async getActiveTradingSignals(): Promise<any[]> {
    const signalIds = await this.get<string[]>('active_signals') || []
    const signals = []
    
    for (const id of signalIds) {
      const signal = await this.getTradingSignal(id)
      if (signal) {
        signals.push(signal)
      }
    }
    
    return signals
  }

  // Cache News and Analysis
  async cacheNewsAnalysis(newsId: string, analysis: any, ttl: number = 1800): Promise<void> {
    await this.set(`news_analysis:${newsId}`, analysis, ttl)
  }

  async getNewsAnalysis(newsId: string): Promise<any> {
    return await this.get(`news_analysis:${newsId}`)
  }

  // System Metrics and Health
  async updateSystemMetrics(metrics: any): Promise<void> {
    await this.set('system_metrics', {
      ...metrics,
      cache_hits: this.cacheHits,
      cache_misses: this.cacheMisses,
      cache_hit_ratio: this.cacheHits / (this.cacheHits + this.cacheMisses) * 100,
      last_updated: new Date().toISOString()
    }, 300)
  }

  async getSystemMetrics(): Promise<StorageMetrics | null> {
    return await this.get<StorageMetrics>('system_metrics')
  }

  // Rate Limiting
  async checkRateLimit(key: string, limit: number, windowSeconds: number): Promise<{
    allowed: boolean
    remaining: number
    resetTime: number
  }> {
    const rateLimitKey = `rate_limit:${key}`
    const now = Date.now()
    const windowStart = now - (windowSeconds * 1000)
    
    const currentCount = await this.get<number>(rateLimitKey) || 0
    const allowed = currentCount < limit
    
    if (allowed) {
      await this.set(rateLimitKey, currentCount + 1, windowSeconds)
    }
    
    return {
      allowed,
      remaining: Math.max(0, limit - currentCount - 1),
      resetTime: now + (windowSeconds * 1000)
    }
  }

  // Feature Flags
  async getFeatureFlag(flag: string): Promise<boolean> {
    const flags = await this.get<Record<string, boolean>>('feature_flags') || {}
    return flags[flag] || false
  }

  async setFeatureFlag(flag: string, enabled: boolean): Promise<void> {
    const flags = await this.get<Record<string, boolean>>('feature_flags') || {}
    flags[flag] = enabled
    await this.set('feature_flags', flags, 86400) // 24 hours
  }

  // Configuration Management
  async getConfig(key: string): Promise<any> {
    return await this.get(`config:${key}`)
  }

  async setConfig(key: string, value: any): Promise<void> {
    await this.set(`config:${key}`, value, 86400) // 24 hours
  }

  // Analytics and Logging
  async logEvent(event: {
    type: string
    data: any
    timestamp?: number
    userId?: string
  }): Promise<void> {
    const logKey = `log:${event.type}:${Date.now()}`
    await this.set(logKey, {
      ...event,
      timestamp: event.timestamp || Date.now()
    }, 604800) // 7 days
  }

  async getEventLogs(type: string, limit: number = 100): Promise<any[]> {
    const keys = await this.list(`log:${type}:`)
    const logs = []
    
    // Get most recent logs
    const sortedKeys = keys.sort().reverse().slice(0, limit)
    
    for (const key of sortedKeys) {
      const log = await this.get(key)
      if (log) {
        logs.push(log)
      }
    }
    
    return logs
  }

  // Utility Functions
  private hashString(str: string): string {
    let hash = 0
    if (str.length === 0) return hash.toString()
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(36)
  }

  // Cleanup expired entries
  async cleanup(): Promise<number> {
    let cleaned = 0
    
    try {
      const keys = await this.list()
      for (const key of keys) {
        const value = await this.env.KV?.get(key)
        if (value) {
          try {
            const parsed = JSON.parse(value) as CacheItem
            if (parsed.ttl && Date.now() > parsed.timestamp + (parsed.ttl * 1000)) {
              await this.delete(key)
              cleaned++
            }
          } catch {
            // Invalid format, delete it
            await this.delete(key)
            cleaned++
          }
        }
      }
    } catch (error) {
      console.error('Cleanup error:', error)
    }
    
    return cleaned
  }

  // Statistics
  getStatistics() {
    return {
      cache_hits: this.cacheHits,
      cache_misses: this.cacheMisses,
      hit_ratio: this.cacheHits / (this.cacheHits + this.cacheMisses) || 0
    }
  }
}

export default StorageService