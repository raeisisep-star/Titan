/**
 * TITAN Trading System - OpenAI/ChatGPT Integration
 * Advanced market analysis and trading insights using GPT models
 */

import { BaseAIService, type AICredentials, type AIRequest, type AIResponse, type MarketAnalysis, type TradingSignal, type TradingStrategy } from './base-ai-service'
import type { Env } from '../types/cloudflare'

interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface OpenAIRequest {
  model: string
  messages: OpenAIMessage[]
  max_tokens?: number
  temperature?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

interface OpenAIResponse {
  id: string
  object: string
  created: number
  model: string
  choices: {
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenAIService extends BaseAIService {
  private readonly baseUrl: string = 'https://api.openai.com/v1'
  private readonly model: string
  
  // Pricing per 1K tokens (as of 2024)
  private readonly pricing = {
    'gpt-4-turbo': { input: 0.01, output: 0.03 },
    'gpt-4': { input: 0.03, output: 0.06 },
    'gpt-3.5-turbo': { input: 0.001, output: 0.002 }
  }

  constructor(credentials: AICredentials, env: Env) {
    super('OpenAI', credentials, env, 60) // 60 requests per minute for OpenAI
    this.model = credentials.model || env.OPENAI_MODEL || 'gpt-4-turbo'
  }

  /**
   * Make request to OpenAI API
   */
  async makeRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.validateCredentials()) {
      return {
        success: false,
        error: 'Invalid OpenAI API credentials',
        timestamp: new Date().toISOString()
      }
    }

    if (!this.checkRateLimit()) {
      const waitTime = this.rateLimiter.getWaitTimeMs()
      return {
        success: false,
        error: `Rate limit exceeded. Wait ${Math.ceil(waitTime / 1000)}s`,
        timestamp: new Date().toISOString()
      }
    }

    try {
      const messages: OpenAIMessage[] = [
        {
          role: 'system',
          content: this.getSystemPrompt()
        }
      ]

      // Add context if provided
      if (request.context) {
        messages.push({
          role: 'system',
          content: `Context: ${request.context}`
        })
      }

      // Add market data if provided
      if (request.marketData) {
        messages.push({
          role: 'system',
          content: `Market Data: ${this.formatMarketDataForAI(request.marketData)}`
        })
      }

      // Add user prompt
      messages.push({
        role: 'user',
        content: request.prompt
      })

      const openaiRequest: OpenAIRequest = {
        model: this.model,
        messages,
        max_tokens: request.maxTokens || this.credentials.maxTokens || 2000,
        temperature: request.temperature ?? this.credentials.temperature ?? 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1
      }

      const response = await this.makeHttpRequest<OpenAIResponse>(
        `${this.baseUrl}/chat/completions`,
        {
          method: 'POST',
          headers: this.createHeaders(),
          body: JSON.stringify(openaiRequest)
        }
      )

      const content = response.choices[0]?.message?.content || ''
      const usage = response.usage
      const cost = this.calculateCost(usage.prompt_tokens, usage.completion_tokens)

      return {
        success: true,
        data: this.cleanResponseText(content),
        usage: {
          promptTokens: usage.prompt_tokens,
          completionTokens: usage.completion_tokens,
          totalTokens: usage.total_tokens,
          cost
        },
        confidence: this.extractConfidence(content),
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        success: false,
        error: `OpenAI API error: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Analyze market data and provide insights
   */
  async analyzeMarket(symbol: string, marketData: any, context?: string): Promise<AIResponse<MarketAnalysis>> {
    const prompt = `
Analyze the market data for ${symbol} and provide a comprehensive trading analysis.

Please provide your analysis in the following JSON format:
{
  "symbol": "${symbol}",
  "overallSentiment": "BULLISH|BEARISH|NEUTRAL",
  "confidenceScore": 0-100,
  "keyInsights": ["insight1", "insight2", "insight3"],
  "technicalAnalysis": {
    "trend": "UPWARD|DOWNWARD|SIDEWAYS",
    "support": [price1, price2],
    "resistance": [price1, price2],
    "indicators": {
      "rsi": 0-100,
      "macd": "BULLISH|BEARISH|NEUTRAL",
      "bollinger": "OVERBOUGHT|OVERSOLD|NORMAL"
    }
  },
  "fundamentalAnalysis": {
    "newsImpact": "POSITIVE|NEGATIVE|NEUTRAL",
    "marketEvents": ["event1", "event2"],
    "economicFactors": ["factor1", "factor2"]
  },
  "priceTargets": {
    "bullish": number,
    "bearish": number,
    "neutral": number
  },
  "timeframe": "SHORT_TERM|MEDIUM_TERM|LONG_TERM",
  "riskAssessment": "detailed risk assessment text"
}

Focus on:
1. Technical indicators analysis
2. Market sentiment evaluation
3. Risk assessment
4. Price target calculations
5. Trading opportunities identification
    `

    try {
      const response = await this.makeRequest({
        prompt,
        marketData,
        context,
        temperature: 0.3 // Lower temperature for more analytical responses
      })

      if (!response.success) {
        return response as AIResponse<MarketAnalysis>
      }

      // Try to parse JSON response
      let analysisData: MarketAnalysis
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0])
          analysisData.timestamp = new Date().toISOString()
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        // Fallback: extract information from text
        analysisData = this.parseMarketAnalysisFromText(response.data, symbol)
      }

      return {
        success: true,
        data: analysisData,
        usage: response.usage,
        confidence: response.confidence,
        reasoning: response.data,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        success: false,
        error: `Market analysis failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Generate trading signal based on market analysis
   */
  async generateTradingSignal(symbol: string, marketData: any, userPreferences?: any): Promise<AIResponse<TradingSignal>> {
    const riskTolerance = userPreferences?.riskTolerance || 'MEDIUM'
    const tradingStyle = userPreferences?.tradingStyle || 'DAY_TRADING'
    const capital = userPreferences?.capital || 10000

    const prompt = `
Generate a trading signal for ${symbol} based on the current market conditions.

User Preferences:
- Risk Tolerance: ${riskTolerance}
- Trading Style: ${tradingStyle}
- Available Capital: $${capital}

Please provide your signal in the following JSON format:
{
  "symbol": "${symbol}",
  "action": "BUY|SELL|HOLD|WAIT",
  "confidence": 0-100,
  "reasoning": "detailed explanation",
  "targetPrice": number,
  "stopLoss": number,
  "takeProfit": number,
  "timeframe": "SCALP|INTRADAY|SWING|POSITION",
  "riskLevel": "LOW|MEDIUM|HIGH",
  "expectedReturn": percentage,
  "marketSentiment": "BULLISH|BEARISH|NEUTRAL"
}

Consider:
1. Current price action and momentum
2. Technical indicator signals
3. Risk/reward ratio
4. Market volatility
5. User's risk profile
6. Entry and exit timing
7. Position sizing recommendations
    `

    try {
      const response = await this.makeRequest({
        prompt,
        marketData,
        context: this.createMarketContext(marketData, `User Risk: ${riskTolerance}, Style: ${tradingStyle}`),
        temperature: 0.2 // Low temperature for consistent signal generation
      })

      if (!response.success) {
        return response as AIResponse<TradingSignal>
      }

      // Parse trading signal from response
      let signalData: TradingSignal
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          signalData = JSON.parse(jsonMatch[0])
          signalData.timestamp = new Date().toISOString()
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        // Fallback: extract signal from text
        signalData = this.parseTradingSignalFromText(response.data, symbol)
      }

      return {
        success: true,
        data: signalData,
        usage: response.usage,
        confidence: response.confidence,
        reasoning: response.data,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        success: false,
        error: `Trading signal generation failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Generate automated trading strategy
   */
  async generateTradingStrategy(requirements: any): Promise<AIResponse<TradingStrategy>> {
    const {
      riskTolerance = 'MEDIUM',
      capital = 10000,
      tradingStyle = 'DAY_TRADING',
      preferredAssets = ['BTC', 'ETH'],
      timeCommitment = '2-4 hours daily'
    } = requirements

    const prompt = `
Create a comprehensive trading strategy based on the following requirements:

Requirements:
- Risk Tolerance: ${riskTolerance}
- Available Capital: $${capital}
- Trading Style: ${tradingStyle}
- Preferred Assets: ${preferredAssets.join(', ')}
- Time Commitment: ${timeCommitment}

Please provide the strategy in the following JSON format:
{
  "name": "strategy name",
  "description": "detailed description",
  "type": "SCALPING|DAY_TRADING|SWING_TRADING|POSITION",
  "symbols": ["BTC", "ETH", ...],
  "entryConditions": ["condition1", "condition2", ...],
  "exitConditions": ["condition1", "condition2", ...],
  "riskManagement": {
    "maxRiskPerTrade": percentage,
    "stopLossPercent": percentage,
    "takeProfitPercent": percentage,
    "maxPositions": number
  },
  "performance": {
    "expectedWinRate": percentage,
    "expectedReturn": percentage,
    "maxDrawdown": percentage
  },
  "aiConfidence": 0-100
}

Focus on:
1. Clear entry and exit rules
2. Risk management parameters
3. Position sizing guidelines
4. Performance expectations
5. Market condition adaptability
    `

    try {
      const response = await this.makeRequest({
        prompt,
        temperature: 0.4, // Moderate creativity for strategy generation
        maxTokens: 3000
      })

      if (!response.success) {
        return response as AIResponse<TradingStrategy>
      }

      // Parse strategy from response
      let strategyData: TradingStrategy
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          strategyData = JSON.parse(jsonMatch[0])
          strategyData.timestamp = new Date().toISOString()
        } else {
          throw new Error('No JSON found in response')
        }
      } catch (parseError) {
        // Fallback: create basic strategy from text
        strategyData = this.parseStrategyFromText(response.data, requirements)
      }

      return {
        success: true,
        data: strategyData,
        usage: response.usage,
        confidence: response.confidence,
        reasoning: response.data,
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        success: false,
        error: `Strategy generation failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Process natural language trading queries
   */
  async processNaturalLanguage(query: string, context?: any): Promise<AIResponse<string>> {
    const prompt = `
You are ARTEMIS, the AI trading assistant for TITAN Trading System. 
Answer the following trading-related question in a helpful and professional manner.

User Question: ${query}

Guidelines:
1. Provide clear, actionable advice
2. Include relevant market insights when applicable
3. Always mention risk considerations
4. Use professional but friendly tone
5. If you need more information, ask specific questions
6. Avoid giving financial advice, focus on education and analysis

Respond in Persian (Farsi) if the question is in Persian, otherwise respond in English.
    `

    try {
      const response = await this.makeRequest({
        prompt,
        context: context ? JSON.stringify(context) : undefined,
        temperature: 0.7, // Higher creativity for conversational responses
        maxTokens: 1500
      })

      return response
    } catch (error) {
      return {
        success: false,
        error: `Natural language processing failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Get system prompt for OpenAI
   */
  private getSystemPrompt(): string {
    return `
You are ARTEMIS, an advanced AI trading analyst for the TITAN Trading System. You specialize in cryptocurrency market analysis, risk assessment, and trading strategy development.

Your capabilities include:
- Technical analysis and chart pattern recognition
- Market sentiment analysis
- Risk assessment and management
- Trading signal generation
- Strategy development and optimization
- Real-time market data interpretation

Guidelines:
1. Always prioritize risk management
2. Provide confidence scores for your analyses
3. Use data-driven insights
4. Consider market volatility and liquidity
5. Adapt to different trading styles and risk profiles
6. Explain your reasoning clearly
7. Never guarantee profits, always mention risks
8. Stay updated with market conditions

Respond in a professional, analytical tone with clear actionable insights.
    `
  }

  /**
   * Calculate token cost based on OpenAI pricing
   */
  protected calculateCost(promptTokens: number, completionTokens: number): number {
    const pricing = this.pricing[this.model] || this.pricing['gpt-3.5-turbo']
    const inputCost = (promptTokens / 1000) * pricing.input
    const outputCost = (completionTokens / 1000) * pricing.output
    return inputCost + outputCost
  }

  /**
   * Parse market analysis from text when JSON parsing fails
   */
  private parseMarketAnalysisFromText(text: string, symbol: string): MarketAnalysis {
    // Extract sentiment
    const bullishKeywords = ['bullish', 'buy', 'positive', 'upward', 'growth']
    const bearishKeywords = ['bearish', 'sell', 'negative', 'downward', 'decline']
    
    const lowerText = text.toLowerCase()
    const bullishScore = bullishKeywords.reduce((score, word) => 
      score + (lowerText.split(word).length - 1), 0)
    const bearishScore = bearishKeywords.reduce((score, word) => 
      score + (lowerText.split(word).length - 1), 0)

    let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL'
    if (bullishScore > bearishScore) sentiment = 'BULLISH'
    else if (bearishScore > bullishScore) sentiment = 'BEARISH'

    return {
      symbol,
      overallSentiment: sentiment,
      confidenceScore: this.extractConfidence(text),
      keyInsights: text.split('\n').filter(line => 
        line.includes('•') || line.includes('-') || line.includes('1.') || line.includes('2.')
      ).slice(0, 3),
      technicalAnalysis: {
        trend: sentiment === 'BULLISH' ? 'UPWARD' : sentiment === 'BEARISH' ? 'DOWNWARD' : 'SIDEWAYS',
        support: [],
        resistance: [],
        indicators: {}
      },
      fundamentalAnalysis: {
        newsImpact: 'NEUTRAL',
        marketEvents: [],
        economicFactors: []
      },
      priceTargets: {
        bullish: 0,
        bearish: 0,
        neutral: 0
      },
      timeframe: 'SHORT_TERM',
      riskAssessment: 'Moderate risk based on current market conditions',
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Parse trading signal from text when JSON parsing fails
   */
  private parseTradingSignalFromText(text: string, symbol: string): TradingSignal {
    const lowerText = text.toLowerCase()
    
    let action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT' = 'HOLD'
    if (lowerText.includes('buy') || lowerText.includes('long')) action = 'BUY'
    else if (lowerText.includes('sell') || lowerText.includes('short')) action = 'SELL'
    else if (lowerText.includes('wait')) action = 'WAIT'

    return {
      symbol,
      action,
      confidence: this.extractConfidence(text),
      reasoning: text.substring(0, 200) + '...',
      timeframe: 'INTRADAY',
      riskLevel: 'MEDIUM',
      marketSentiment: action === 'BUY' ? 'BULLISH' : action === 'SELL' ? 'BEARISH' : 'NEUTRAL',
      timestamp: new Date().toISOString()
    }
  }

  /**
   * Parse strategy from text when JSON parsing fails
   */
  private parseStrategyFromText(text: string, requirements: any): TradingStrategy {
    return {
      name: `AI Generated ${requirements.tradingStyle} Strategy`,
      description: text.substring(0, 300) + '...',
      type: requirements.tradingStyle || 'DAY_TRADING',
      symbols: requirements.preferredAssets || ['BTC', 'ETH'],
      entryConditions: ['Technical confirmation', 'Volume validation'],
      exitConditions: ['Take profit hit', 'Stop loss triggered'],
      riskManagement: {
        maxRiskPerTrade: 2,
        stopLossPercent: 3,
        takeProfitPercent: 6,
        maxPositions: 3
      },
      performance: {
        expectedWinRate: 60,
        expectedReturn: 15,
        maxDrawdown: 10
      },
      aiConfidence: this.extractConfidence(text),
      timestamp: new Date().toISOString()
    }
  }
}

export default OpenAIService