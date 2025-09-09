/**
 * TITAN Trading System - Base AI Service
 * Abstract base class for all AI service integrations
 */

import type { Env } from '../types/cloudflare'
import { CryptoHelper } from '../utils/crypto-helpers'

export interface AICredentials {
  apiKey: string
  baseUrl?: string
  model?: string
  maxTokens?: number
  temperature?: number
}

export interface AIRequest {
  prompt: string
  context?: string
  marketData?: any
  tradingHistory?: any
  userPreferences?: any
  maxTokens?: number
  temperature?: number
}

export interface AIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
    cost?: number
  }
  confidence?: number
  reasoning?: string
  timestamp: string
}

export interface TradingSignal {
  symbol: string
  action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT'
  confidence: number
  reasoning: string
  targetPrice?: number
  stopLoss?: number
  takeProfit?: number
  timeframe: string
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'
  expectedReturn?: number
  marketSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  timestamp: string
}

export interface MarketAnalysis {
  symbol: string
  overallSentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL'
  confidenceScore: number
  keyInsights: string[]
  technicalAnalysis: {
    trend: 'UPWARD' | 'DOWNWARD' | 'SIDEWAYS'
    support: number[]
    resistance: number[]
    indicators: {
      rsi?: number
      macd?: string
      bollinger?: string
    }
  }
  fundamentalAnalysis: {
    newsImpact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
    marketEvents: string[]
    economicFactors: string[]
  }
  priceTargets: {
    bullish: number
    bearish: number
    neutral: number
  }
  timeframe: string
  riskAssessment: string
  timestamp: string
}

export interface TradingStrategy {
  name: string
  description: string
  type: 'SCALPING' | 'DAY_TRADING' | 'SWING_TRADING' | 'POSITION'
  symbols: string[]
  entryConditions: string[]
  exitConditions: string[]
  riskManagement: {
    maxRiskPerTrade: number
    stopLossPercent: number
    takeProfitPercent: number
    maxPositions: number
  }
  performance: {
    expectedWinRate: number
    expectedReturn: number
    maxDrawdown: number
  }
  aiConfidence: number
  backtestResults?: any
  timestamp: string
}

export abstract class BaseAIService {
  protected serviceName: string
  protected credentials: AICredentials
  protected env: Env
  protected rateLimiter: ReturnType<typeof CryptoHelper.createRateLimiter>

  constructor(serviceName: string, credentials: AICredentials, env: Env, requestsPerMinute: number = 60) {
    this.serviceName = serviceName
    this.credentials = credentials
    this.env = env
    this.rateLimiter = CryptoHelper.createRateLimiter(requestsPerMinute)
  }

  // Abstract methods that must be implemented by each AI service
  abstract makeRequest(request: AIRequest): Promise<AIResponse>
  abstract analyzeMarket(symbol: string, marketData: any, context?: string): Promise<AIResponse<MarketAnalysis>>
  abstract generateTradingSignal(symbol: string, marketData: any, userPreferences?: any): Promise<AIResponse<TradingSignal>>
  abstract generateTradingStrategy(requirements: any): Promise<AIResponse<TradingStrategy>>
  abstract processNaturalLanguage(query: string, context?: any): Promise<AIResponse<string>>

  /**
   * Validate API credentials
   */
  protected validateCredentials(): boolean {
    return !!(this.credentials.apiKey && this.credentials.apiKey.length > 10)
  }

  /**
   * Check rate limiting
   */
  protected checkRateLimit(): boolean {
    return this.rateLimiter.canMakeRequest()
  }

  /**
   * Get rate limiter status
   */
  public getRateLimitStatus() {
    return {
      remaining: this.rateLimiter.getRemainingRequests(),
      waitTime: this.rateLimiter.getWaitTimeMs()
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  protected async makeHttpRequest<T>(
    url: string,
    options: RequestInit,
    retries: number = 3
  ): Promise<T> {
    return await CryptoHelper.withRetry(async () => {
      const response = await fetch(url, options)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      return await response.json() as T
    }, retries, 1000)
  }

  /**
   * Create standardized headers for API requests
   */
  protected createHeaders(additionalHeaders: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      'User-Agent': 'TITAN-Trading-System/1.0',
      'Authorization': `Bearer ${this.credentials.apiKey}`,
      ...additionalHeaders
    }
  }

  /**
   * Calculate estimated cost for tokens (override in subclasses)
   */
  protected calculateCost(promptTokens: number, completionTokens: number): number {
    // Base implementation - override in specific AI services
    return 0
  }

  /**
   * Format market data for AI consumption
   */
  protected formatMarketDataForAI(marketData: any): string {
    if (!marketData) return 'No market data available'

    return `
Market Data for ${marketData.symbol}:
- Current Price: $${marketData.price}
- 24h Change: ${marketData.changePercent24h?.toFixed(2)}%
- 24h High: $${marketData.high24h}
- 24h Low: $${marketData.low24h}
- 24h Volume: ${marketData.volume24h?.toLocaleString()}
- Exchange: ${marketData.exchange}
- Timestamp: ${marketData.timestamp}
    `.trim()
  }

  /**
   * Format trading history for AI consumption
   */
  protected formatTradingHistoryForAI(history: any[]): string {
    if (!history || history.length === 0) return 'No trading history available'

    return history.slice(-5).map(trade => 
      `${trade.side?.toUpperCase()} ${trade.quantity} ${trade.symbol} at $${trade.price} (${trade.status})`
    ).join('\n')
  }

  /**
   * Create market context for AI analysis
   */
  protected createMarketContext(marketData: any, additionalContext?: string): string {
    const marketInfo = this.formatMarketDataForAI(marketData)
    const timestamp = new Date().toISOString()
    
    let context = `
Current Market Analysis Context:
${marketInfo}

Analysis Time: ${timestamp}
Market Session: ${this.getMarketSession()}
    `.trim()

    if (additionalContext) {
      context += `\n\nAdditional Context:\n${additionalContext}`
    }

    return context
  }

  /**
   * Determine current market session
   */
  private getMarketSession(): string {
    const hour = new Date().getUTCHours()
    
    if (hour >= 13 && hour < 21) return 'US Market Hours'
    if (hour >= 8 && hour < 17) return 'European Market Hours'
    if (hour >= 23 || hour < 8) return 'Asian Market Hours'
    return 'Overlap Hours'
  }

  /**
   * Validate AI response structure
   */
  protected validateResponse<T>(response: any, requiredFields: string[]): AIResponse<T> {
    const missingFields = requiredFields.filter(field => !response.hasOwnProperty(field))
    
    if (missingFields.length > 0) {
      return {
        success: false,
        error: `Invalid AI response: missing fields ${missingFields.join(', ')}`,
        timestamp: new Date().toISOString()
      }
    }

    return {
      success: true,
      data: response as T,
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Extract confidence score from AI response
   */
  protected extractConfidence(text: string): number {
    // Look for confidence patterns in AI response
    const confidencePatterns = [
      /confidence[:\s]+(\d+)%/i,
      /(\d+)%\s+confidence/i,
      /certainty[:\s]+(\d+)%/i,
      /probability[:\s]+(\d+)%/i
    ]

    for (const pattern of confidencePatterns) {
      const match = text.match(pattern)
      if (match) {
        const confidence = parseInt(match[1])
        if (confidence >= 0 && confidence <= 100) {
          return confidence
        }
      }
    }

    // Default confidence based on response quality
    if (text.length > 200) return 75
    if (text.length > 100) return 60
    return 50
  }

  /**
   * Clean and format AI response text
   */
  protected cleanResponseText(text: string): string {
    return text
      .replace(/^\s*[\[\{].*?[\]\}]\s*/, '') // Remove JSON brackets
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove markdown bold
      .replace(/\*(.*?)\*/g, '$1') // Remove markdown italic
      .trim()
  }

  /**
   * Test AI service connection
   */
  public async testConnection(): Promise<AIResponse<any>> {
    if (!this.validateCredentials()) {
      return {
        success: false,
        error: `Invalid credentials for ${this.serviceName}`,
        timestamp: new Date().toISOString()
      }
    }

    if (!this.checkRateLimit()) {
      return {
        success: false,
        error: `Rate limit exceeded for ${this.serviceName}`,
        timestamp: new Date().toISOString()
      }
    }

    try {
      // Simple test request
      const testResponse = await this.makeRequest({
        prompt: 'Hello, please respond with "Connection successful" to test the API.',
        maxTokens: 50,
        temperature: 0
      })

      return {
        success: true,
        data: {
          service: this.serviceName,
          status: 'connected',
          testResponse: testResponse.data
        },
        timestamp: new Date().toISOString()
      }
    } catch (error) {
      return {
        success: false,
        error: `Connection test failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Get service information
   */
  public getServiceInfo() {
    return {
      name: this.serviceName,
      model: this.credentials.model || 'default',
      maxTokens: this.credentials.maxTokens || 2000,
      rateLimitStatus: this.getRateLimitStatus(),
      hasValidCredentials: this.validateCredentials()
    }
  }
}

export default BaseAIService