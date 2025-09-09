/**
 * TITAN Trading System - Google Gemini Integration  
 * Multi-modal AI analysis with advanced reasoning capabilities
 */

import { BaseAIService, type AICredentials, type AIRequest, type AIResponse, type MarketAnalysis, type TradingSignal, type TradingStrategy } from './base-ai-service'
import type { Env } from '../types/cloudflare'

interface GeminiContent {
  parts: Array<{
    text?: string
    inlineData?: {
      mimeType: string
      data: string
    }
  }>
  role?: 'user' | 'model'
}

interface GeminiRequest {
  contents: GeminiContent[]
  generationConfig?: {
    temperature?: number
    topK?: number
    topP?: number
    maxOutputTokens?: number
    stopSequences?: string[]
  }
  safetySettings?: Array<{
    category: string
    threshold: string
  }>
}

interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string
      }>
      role: string
    }
    finishReason: string
    index: number
    safetyRatings: Array<{
      category: string
      probability: string
    }>
  }>
  usageMetadata: {
    promptTokenCount: number
    candidatesTokenCount: number
    totalTokenCount: number
  }
}

export class GeminiService extends BaseAIService {
  private readonly baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta'
  private readonly model: string

  // Gemini pricing (as of 2024)
  private readonly pricing = {
    'gemini-1.5-pro': { input: 0.007, output: 0.021 }, // per 1K tokens
    'gemini-1.5-flash': { input: 0.00035, output: 0.00105 }
  }

  constructor(credentials: AICredentials, env: Env) {
    super('Gemini', credentials, env, 60) // 60 requests per minute
    this.model = credentials.model || env.GOOGLE_MODEL || 'gemini-1.5-pro'
  }

  /**
   * Make request to Gemini API
   */
  async makeRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.validateCredentials()) {
      return {
        success: false,
        error: 'Invalid Google API credentials',
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
      // Prepare content with system context
      const contents: GeminiContent[] = []

      // Add system message as user content (Gemini doesn't have separate system role)
      contents.push({
        parts: [{ text: this.getSystemPrompt() }],
        role: 'user'
      })

      contents.push({
        parts: [{ text: 'Understood. I am ARTEMIS, ready to assist with trading analysis.' }],
        role: 'model'
      })

      // Add context if provided
      if (request.context) {
        contents.push({
          parts: [{ text: `Context: ${request.context}` }],
          role: 'user'
        })
      }

      // Add market data if provided
      if (request.marketData) {
        contents.push({
          parts: [{ text: `Market Data Analysis:\n${this.formatMarketDataForAI(request.marketData)}` }],
          role: 'user'
        })
      }

      // Add main prompt
      contents.push({
        parts: [{ text: request.prompt }],
        role: 'user'
      })

      const geminiRequest: GeminiRequest = {
        contents,
        generationConfig: {
          temperature: request.temperature ?? this.credentials.temperature ?? 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: request.maxTokens || this.credentials.maxTokens || 2048
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      }

      const url = `${this.baseUrl}/models/${this.model}:generateContent?key=${this.credentials.apiKey}`
      
      const response = await this.makeHttpRequest<GeminiResponse>(
        url,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(geminiRequest)
        }
      )

      const content = response.candidates[0]?.content?.parts[0]?.text || ''
      const usage = response.usageMetadata
      const cost = this.calculateCost(usage.promptTokenCount, usage.candidatesTokenCount)

      return {
        success: true,
        data: this.cleanResponseText(content),
        usage: {
          promptTokens: usage.promptTokenCount,
          completionTokens: usage.candidatesTokenCount,
          totalTokens: usage.totalTokenCount,
          cost
        },
        confidence: this.extractConfidence(content),
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        success: false,
        error: `Gemini API error: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Advanced market analysis using Gemini's reasoning capabilities
   */
  async analyzeMarket(symbol: string, marketData: any, context?: string): Promise<AIResponse<MarketAnalysis>> {
    const prompt = `
As ARTEMIS AI, perform a comprehensive multi-dimensional analysis of ${symbol} using advanced reasoning.

ANALYSIS FRAMEWORK:
1. **Technical Pattern Recognition**: Identify chart patterns, trends, and momentum indicators
2. **Market Microstructure**: Analyze volume patterns, liquidity, and order flow
3. **Sentiment Analysis**: Evaluate market psychology and crowd behavior  
4. **Risk Assessment**: Calculate volatility metrics and downside protection
5. **Macro Context**: Consider broader market conditions and correlations

Please structure your analysis as a JSON object:
{
  "symbol": "${symbol}",
  "overallSentiment": "BULLISH|BEARISH|NEUTRAL",
  "confidenceScore": 0-100,
  "keyInsights": [
    "Primary technical observation",
    "Key market driver identification", 
    "Critical risk factor assessment"
  ],
  "technicalAnalysis": {
    "trend": "UPWARD|DOWNWARD|SIDEWAYS",
    "support": [price_level_1, price_level_2],
    "resistance": [price_level_1, price_level_2],
    "indicators": {
      "rsi": estimated_rsi_0_to_100,
      "macd": "BULLISH|BEARISH|NEUTRAL",
      "bollinger": "OVERBOUGHT|OVERSOLD|NORMAL"
    }
  },
  "fundamentalAnalysis": {
    "newsImpact": "POSITIVE|NEGATIVE|NEUTRAL",
    "marketEvents": ["relevant_event_1", "relevant_event_2"],
    "economicFactors": ["macro_factor_1", "macro_factor_2"]
  },
  "priceTargets": {
    "bullish": projected_high_price,
    "bearish": projected_low_price,
    "neutral": fair_value_price
  },
  "timeframe": "SHORT_TERM|MEDIUM_TERM|LONG_TERM",
  "riskAssessment": "Detailed risk evaluation with specific concerns and mitigation strategies"
}

SPECIAL FOCUS:
- Use advanced reasoning to identify non-obvious patterns
- Consider multi-timeframe confluence
- Evaluate market regime changes
- Assess tail risk scenarios
- Provide probabilistic outcomes rather than certainties
    `

    try {
      const response = await this.makeRequest({
        prompt,
        marketData,
        context,
        temperature: 0.4 // Balanced creativity and consistency
      })

      if (!response.success) {
        return response as AIResponse<MarketAnalysis>
      }

      // Parse analysis with enhanced error handling
      let analysisData: MarketAnalysis
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          analysisData = JSON.parse(jsonMatch[0])
          analysisData.timestamp = new Date().toISOString()
          
          // Enhance with Gemini-specific insights
          analysisData.keyInsights = this.enhanceInsights(analysisData.keyInsights, response.data)
        } else {
          throw new Error('No JSON structure found')
        }
      } catch (parseError) {
        analysisData = this.parseAdvancedMarketAnalysis(response.data, symbol, marketData)
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
        error: `Gemini market analysis failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Generate sophisticated trading signals with multi-factor analysis
   */
  async generateTradingSignal(symbol: string, marketData: any, userPreferences?: any): Promise<AIResponse<TradingSignal>> {
    const riskProfile = userPreferences?.riskTolerance || 'MEDIUM'
    const tradingHorizon = userPreferences?.tradingStyle || 'DAY_TRADING'
    const portfolio = userPreferences?.portfolio || {}

    const prompt = `
Generate an advanced trading signal for ${symbol} using multi-dimensional analysis.

USER PROFILE:
- Risk Tolerance: ${riskProfile}
- Trading Horizon: ${tradingHorizon}  
- Portfolio Context: ${JSON.stringify(portfolio)}

ANALYSIS REQUIREMENTS:
1. **Signal Strength**: Multi-timeframe confluence analysis
2. **Risk/Reward Optimization**: Calculate optimal position sizing
3. **Market Regime**: Identify current market phase and adapt strategy
4. **Execution Timing**: Precise entry/exit recommendations
5. **Scenario Planning**: Best/worst/expected case outcomes

Provide signal in JSON format:
{
  "symbol": "${symbol}",
  "action": "BUY|SELL|HOLD|WAIT",
  "confidence": 0-100,
  "reasoning": "Multi-factor reasoning with specific triggers and conditions",
  "targetPrice": optimal_entry_price,
  "stopLoss": risk_management_exit,
  "takeProfit": profit_target_exit,
  "timeframe": "SCALP|INTRADAY|SWING|POSITION",
  "riskLevel": "LOW|MEDIUM|HIGH",
  "expectedReturn": expected_return_percentage,
  "marketSentiment": "BULLISH|BEARISH|NEUTRAL",
  "additionalMetrics": {
    "probabilityOfSuccess": 0-100,
    "maxDrawdownRisk": percentage,
    "sharpeRatioEstimate": ratio,
    "correlationRisks": ["risk1", "risk2"]
  }
}

ADVANCED CONSIDERATIONS:
- Market microstructure and liquidity analysis
- Correlation with broader crypto market
- Macroeconomic impact assessment  
- Behavioral finance factors
- Black swan risk evaluation
    `

    try {
      const response = await this.makeRequest({
        prompt,
        marketData,
        context: this.createAdvancedContext(marketData, userPreferences),
        temperature: 0.3 // Lower temperature for signal precision
      })

      if (!response.success) {
        return response as AIResponse<TradingSignal>
      }

      let signalData: TradingSignal
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          signalData = JSON.parse(jsonMatch[0])
          signalData.timestamp = new Date().toISOString()
        } else {
          throw new Error('No JSON structure found')
        }
      } catch (parseError) {
        signalData = this.parseAdvancedTradingSignal(response.data, symbol, marketData)
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
        error: `Gemini signal generation failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Generate comprehensive trading strategies with advanced optimization
   */
  async generateTradingStrategy(requirements: any): Promise<AIResponse<TradingStrategy>> {
    const prompt = `
Design an advanced, adaptive trading strategy using sophisticated quantitative methods.

REQUIREMENTS ANALYSIS:
${JSON.stringify(requirements, null, 2)}

STRATEGY DEVELOPMENT FRAMEWORK:
1. **Market Regime Detection**: Identify and adapt to different market conditions
2. **Risk Parity Optimization**: Balance risk across positions and timeframes
3. **Behavioral Alpha**: Exploit systematic market inefficiencies
4. **Dynamic Allocation**: Adjust position sizes based on volatility and correlation
5. **Stress Testing**: Evaluate performance under extreme scenarios

Generate comprehensive strategy in JSON format:
{
  "name": "descriptive_strategy_name",
  "description": "detailed methodology and rationale",
  "type": "SCALPING|DAY_TRADING|SWING_TRADING|POSITION",
  "symbols": ["optimized_asset_selection"],
  "entryConditions": [
    "primary_signal_condition",
    "confirmation_filter",
    "risk_validation_check"
  ],
  "exitConditions": [
    "profit_target_logic", 
    "stop_loss_mechanism",
    "time_decay_exit"
  ],
  "riskManagement": {
    "maxRiskPerTrade": optimized_percentage,
    "stopLossPercent": adaptive_percentage,
    "takeProfitPercent": risk_adjusted_target,
    "maxPositions": correlation_adjusted_limit,
    "positionSizing": "FIXED|VOLATILITY_ADJUSTED|KELLY_CRITERION",
    "portfolioHeat": "maximum_simultaneous_risk"
  },
  "performance": {
    "expectedWinRate": backtested_percentage,
    "expectedReturn": annualized_return,
    "maxDrawdown": worst_case_scenario,
    "sharpeRatio": risk_adjusted_return,
    "calmarRatio": return_over_drawdown,
    "volatility": expected_price_volatility
  },
  "marketAdaptation": {
    "bullMarketAdjustments": ["adjustment1", "adjustment2"],
    "bearMarketAdjustments": ["adjustment1", "adjustment2"], 
    "sidewaysMarketAdjustments": ["adjustment1", "adjustment2"]
  },
  "aiConfidence": 0-100
}

ADVANCED FEATURES:
- Multi-timeframe signal confluence
- Volatility regime switching
- Correlation clustering analysis
- Sentiment integration factors
- Liquidity impact modeling
    `

    try {
      const response = await this.makeRequest({
        prompt,
        temperature: 0.5, // Moderate creativity for strategy innovation
        maxTokens: 4000
      })

      if (!response.success) {
        return response as AIResponse<TradingStrategy>
      }

      let strategyData: TradingStrategy
      try {
        const jsonMatch = response.data.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0])
          strategyData = {
            name: parsed.name || `Gemini AI Strategy`,
            description: parsed.description || 'Advanced AI-generated strategy',
            type: parsed.type || 'DAY_TRADING',
            symbols: parsed.symbols || ['BTC', 'ETH'],
            entryConditions: parsed.entryConditions || [],
            exitConditions: parsed.exitConditions || [],
            riskManagement: parsed.riskManagement || {
              maxRiskPerTrade: 2,
              stopLossPercent: 3,
              takeProfitPercent: 6,
              maxPositions: 3
            },
            performance: parsed.performance || {
              expectedWinRate: 65,
              expectedReturn: 20,
              maxDrawdown: 12
            },
            aiConfidence: parsed.aiConfidence || this.extractConfidence(response.data),
            timestamp: new Date().toISOString()
          }
        } else {
          throw new Error('No JSON structure found')
        }
      } catch (parseError) {
        strategyData = this.parseAdvancedStrategy(response.data, requirements)
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
        error: `Gemini strategy generation failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Process natural language with enhanced conversational AI
   */
  async processNaturalLanguage(query: string, context?: any): Promise<AIResponse<string>> {
    const prompt = `
As ARTEMIS AI, provide an intelligent, nuanced response to this trading query.

User Query: ${query}

RESPONSE GUIDELINES:
1. **Contextual Intelligence**: Consider market conditions and user background
2. **Educational Value**: Explain concepts and reasoning clearly  
3. **Risk Awareness**: Always highlight potential risks and limitations
4. **Actionable Insights**: Provide practical, implementable advice
5. **Multi-Perspective Analysis**: Consider different viewpoints and scenarios

CAPABILITIES TO LEVERAGE:
- Advanced pattern recognition
- Probabilistic reasoning  
- Causal inference
- Scenario analysis
- Risk quantification

Provide a comprehensive, helpful response that demonstrates deep market understanding while maintaining appropriate disclaimers about financial advice.

Language: Respond in Persian (Farsi) if the query is in Persian, otherwise in English.
    `

    try {
      const response = await this.makeRequest({
        prompt,
        context: context ? JSON.stringify(context) : undefined,
        temperature: 0.8, // Higher creativity for conversational responses
        maxTokens: 2000
      })

      // Enhance response with Gemini's reasoning capabilities
      if (response.success && response.data) {
        response.data = this.enhanceConversationalResponse(response.data, query)
      }

      return response
    } catch (error) {
      return {
        success: false,
        error: `Gemini natural language processing failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Get system prompt optimized for Gemini
   */
  private getSystemPrompt(): string {
    return `
You are ARTEMIS, the advanced AI trading intelligence system for TITAN Trading Platform. You possess sophisticated analytical capabilities including:

CORE COMPETENCIES:
- Advanced pattern recognition and trend analysis
- Multi-dimensional risk assessment and modeling
- Behavioral finance and market psychology insights
- Quantitative strategy development and optimization
- Real-time market microstructure analysis
- Probabilistic reasoning and scenario planning

ANALYTICAL FRAMEWORK:
- Technical Analysis: Chart patterns, indicators, momentum
- Fundamental Analysis: Market drivers, news impact, macro factors  
- Sentiment Analysis: Crowd behavior, fear/greed cycles
- Risk Management: Volatility modeling, correlation analysis
- Strategy Optimization: Backtesting, performance metrics

OPERATIONAL PRINCIPLES:
1. Always prioritize risk management over potential profits
2. Provide probabilistic rather than deterministic predictions
3. Consider multiple scenarios and contingency plans
4. Maintain awareness of model limitations and market regime changes
5. Adapt recommendations to user risk profile and objectives
6. Emphasize education and understanding over blind following
7. Include appropriate disclaimers about financial risk

RESPONSE QUALITY:
- Use precise, quantitative language when possible
- Provide confidence intervals and uncertainty estimates
- Explain reasoning and methodology transparently  
- Consider both bull and bear case scenarios
- Include relevant risk factors and mitigation strategies

Remember: You are an analytical tool to assist traders, not a source of guaranteed financial advice. Always encourage users to conduct their own research and consider their individual circumstances.
    `
  }

  /**
   * Calculate cost based on Gemini pricing
   */
  protected calculateCost(promptTokens: number, completionTokens: number): number {
    const pricing = this.pricing[this.model] || this.pricing['gemini-1.5-flash']
    const inputCost = (promptTokens / 1000) * pricing.input
    const outputCost = (completionTokens / 1000) * pricing.output
    return inputCost + outputCost
  }

  /**
   * Create advanced context for analysis
   */
  private createAdvancedContext(marketData: any, userPreferences?: any): string {
    const baseContext = this.createMarketContext(marketData)
    
    let advancedContext = baseContext + `

ADVANCED MARKET CONTEXT:
- Market Volatility: ${this.estimateVolatility(marketData)}
- Liquidity Assessment: ${this.assessLiquidity(marketData)}
- Trend Strength: ${this.calculateTrendStrength(marketData)}
- Market Phase: ${this.identifyMarketPhase(marketData)}
    `

    if (userPreferences) {
      advancedContext += `

USER CONTEXT:
- Risk Profile: ${userPreferences.riskTolerance || 'MEDIUM'}
- Experience Level: ${userPreferences.experience || 'INTERMEDIATE'}
- Capital Allocation: ${userPreferences.capital || 'Not specified'}
- Time Horizon: ${userPreferences.timeHorizon || 'Not specified'}
      `
    }

    return advancedContext
  }

  /**
   * Enhance insights with Gemini's advanced reasoning
   */
  private enhanceInsights(insights: string[], fullResponse: string): string[] {
    // Extract additional insights from the full response
    const additionalInsights = fullResponse
      .split('\n')
      .filter(line => 
        line.includes('insight') || 
        line.includes('key') || 
        line.includes('important') ||
        line.includes('critical')
      )
      .slice(0, 2)

    return [...insights, ...additionalInsights].slice(0, 5)
  }

  /**
   * Enhance conversational response with additional context
   */
  private enhanceConversationalResponse(response: string, originalQuery: string): string {
    // Add contextual enhancements based on query type
    if (originalQuery.toLowerCase().includes('risk')) {
      response += '\n\n💡 اضافی: همیشه مدیریت ریسک را در اولویت قرار دهید و بیش از آنچه می‌توانید از دست بدهید سرمایه‌گذاری نکنید.'
    }

    if (originalQuery.toLowerCase().includes('strategy')) {
      response += '\n\n📊 توصیه: هر استراتژی را قبل از استفاده واقعی با داده‌های تاریخی تست کنید.'
    }

    return response
  }

  // Helper methods for advanced analysis
  private estimateVolatility(marketData: any): string {
    if (!marketData.high24h || !marketData.low24h || !marketData.price) return 'Unknown'
    const dailyRange = ((marketData.high24h - marketData.low24h) / marketData.price) * 100
    if (dailyRange > 10) return 'High'
    if (dailyRange > 5) return 'Medium' 
    return 'Low'
  }

  private assessLiquidity(marketData: any): string {
    if (!marketData.volume24h) return 'Unknown'
    const volume = marketData.volume24h
    if (volume > 1000000000) return 'High'
    if (volume > 100000000) return 'Medium'
    return 'Low'
  }

  private calculateTrendStrength(marketData: any): string {
    if (!marketData.changePercent24h) return 'Unknown'
    const change = Math.abs(marketData.changePercent24h)
    if (change > 5) return 'Strong'
    if (change > 2) return 'Moderate'
    return 'Weak'
  }

  private identifyMarketPhase(marketData: any): string {
    if (!marketData.changePercent24h) return 'Unknown'
    const change = marketData.changePercent24h
    if (change > 3) return 'Bull Run'
    if (change < -3) return 'Bear Market'
    return 'Consolidation'
  }

  // Advanced parsing methods
  private parseAdvancedMarketAnalysis(text: string, symbol: string, marketData: any): MarketAnalysis {
    // Enhanced parsing with Gemini's advanced reasoning extraction
    const analysis = this.parseMarketAnalysisFromText(text, symbol)
    
    // Enhance with market data insights
    if (marketData) {
      analysis.technicalAnalysis.support = [marketData.low24h * 0.98, marketData.low24h * 0.95]
      analysis.technicalAnalysis.resistance = [marketData.high24h * 1.02, marketData.high24h * 1.05]
      
      analysis.priceTargets = {
        bullish: marketData.price * 1.1,
        bearish: marketData.price * 0.9,
        neutral: marketData.price
      }
    }

    return analysis
  }

  private parseAdvancedTradingSignal(text: string, symbol: string, marketData: any): TradingSignal {
    const signal = this.parseTradingSignalFromText(text, symbol)
    
    // Enhance with market data
    if (marketData) {
      signal.targetPrice = marketData.price
      signal.stopLoss = marketData.price * 0.97
      signal.takeProfit = marketData.price * 1.06
      signal.expectedReturn = 6
    }

    return signal
  }

  private parseAdvancedStrategy(text: string, requirements: any): TradingStrategy {
    return {
      name: 'Gemini Advanced Strategy',
      description: text.substring(0, 400) + '...',
      type: requirements.tradingStyle || 'DAY_TRADING',
      symbols: requirements.preferredAssets || ['BTC', 'ETH'],
      entryConditions: [
        'Multi-timeframe confluence',
        'Volume confirmation',
        'Risk/reward validation'
      ],
      exitConditions: [
        'Target achievement',
        'Stop loss trigger',
        'Momentum divergence'
      ],
      riskManagement: {
        maxRiskPerTrade: 1.5,
        stopLossPercent: 2.5,
        takeProfitPercent: 7.5,
        maxPositions: 4
      },
      performance: {
        expectedWinRate: 68,
        expectedReturn: 22,
        maxDrawdown: 8
      },
      aiConfidence: this.extractConfidence(text),
      timestamp: new Date().toISOString()
    }
  }

  // Inherit base class parsing methods
  private parseMarketAnalysisFromText(text: string, symbol: string): MarketAnalysis {
    // Use base class implementation with enhancements
    const bullishKeywords = ['bullish', 'buy', 'positive', 'upward', 'growth', 'rally', 'breakout']
    const bearishKeywords = ['bearish', 'sell', 'negative', 'downward', 'decline', 'crash', 'breakdown']
    
    const lowerText = text.toLowerCase()
    const bullishScore = bullishKeywords.reduce((score, word) => 
      score + (lowerText.split(word).length - 1), 0)
    const bearishScore = bearishKeywords.reduce((score, word) => 
      score + (lowerText.split(word).length - 1), 0)

    let sentiment: 'BULLISH' | 'BEARISH' | 'NEUTRAL' = 'NEUTRAL'
    if (bullishScore > bearishScore + 1) sentiment = 'BULLISH'
    else if (bearishScore > bullishScore + 1) sentiment = 'BEARISH'

    return {
      symbol,
      overallSentiment: sentiment,
      confidenceScore: this.extractConfidence(text),
      keyInsights: this.extractKeyInsights(text),
      technicalAnalysis: {
        trend: sentiment === 'BULLISH' ? 'UPWARD' : sentiment === 'BEARISH' ? 'DOWNWARD' : 'SIDEWAYS',
        support: [],
        resistance: [],
        indicators: this.extractIndicators(text)
      },
      fundamentalAnalysis: {
        newsImpact: sentiment === 'BULLISH' ? 'POSITIVE' : sentiment === 'BEARISH' ? 'NEGATIVE' : 'NEUTRAL',
        marketEvents: this.extractMarketEvents(text),
        economicFactors: this.extractEconomicFactors(text)
      },
      priceTargets: {
        bullish: 0,
        bearish: 0,
        neutral: 0
      },
      timeframe: 'MEDIUM_TERM',
      riskAssessment: this.extractRiskAssessment(text),
      timestamp: new Date().toISOString()
    }
  }

  private parseTradingSignalFromText(text: string, symbol: string): TradingSignal {
    const lowerText = text.toLowerCase()
    
    let action: 'BUY' | 'SELL' | 'HOLD' | 'WAIT' = 'HOLD'
    if (lowerText.includes('buy') || lowerText.includes('long') || lowerText.includes('bullish')) action = 'BUY'
    else if (lowerText.includes('sell') || lowerText.includes('short') || lowerText.includes('bearish')) action = 'SELL'
    else if (lowerText.includes('wait') || lowerText.includes('patience')) action = 'WAIT'

    return {
      symbol,
      action,
      confidence: this.extractConfidence(text),
      reasoning: this.extractReasoning(text),
      timeframe: 'INTRADAY',
      riskLevel: this.extractRiskLevel(text),
      marketSentiment: action === 'BUY' ? 'BULLISH' : action === 'SELL' ? 'BEARISH' : 'NEUTRAL',
      timestamp: new Date().toISOString()
    }
  }

  // Enhanced extraction methods
  private extractKeyInsights(text: string): string[] {
    return text
      .split('\n')
      .filter(line => 
        line.includes('•') || 
        line.includes('-') || 
        line.match(/^\d+\./) ||
        line.includes('insight') ||
        line.includes('key') ||
        line.includes('important')
      )
      .map(line => line.replace(/^[\d\.\-•\s]+/, '').trim())
      .filter(line => line.length > 10)
      .slice(0, 5)
  }

  private extractIndicators(text: string): any {
    const indicators: any = {}
    
    if (text.includes('overbought') || text.includes('RSI above 70')) {
      indicators.rsi = 75
    } else if (text.includes('oversold') || text.includes('RSI below 30')) {
      indicators.rsi = 25
    }

    if (text.includes('MACD bullish') || text.includes('positive MACD')) {
      indicators.macd = 'BULLISH'
    } else if (text.includes('MACD bearish') || text.includes('negative MACD')) {
      indicators.macd = 'BEARISH'
    }

    return indicators
  }

  private extractMarketEvents(text: string): string[] {
    const events: string[] = []
    
    if (text.includes('halving') || text.includes('halvening')) events.push('Bitcoin Halving')
    if (text.includes('ETF') || text.includes('exchange-traded fund')) events.push('ETF Development')
    if (text.includes('regulation') || text.includes('regulatory')) events.push('Regulatory Changes')
    if (text.includes('institutional') || text.includes('adoption')) events.push('Institutional Adoption')
    
    return events.slice(0, 3)
  }

  private extractEconomicFactors(text: string): string[] {
    const factors: string[] = []
    
    if (text.includes('inflation') || text.includes('CPI')) factors.push('Inflation Concerns')
    if (text.includes('interest rate') || text.includes('Fed')) factors.push('Monetary Policy')
    if (text.includes('DXY') || text.includes('dollar')) factors.push('USD Strength')
    if (text.includes('risk-on') || text.includes('risk-off')) factors.push('Risk Sentiment')
    
    return factors.slice(0, 3)
  }

  private extractRiskAssessment(text: string): string {
    if (text.includes('high risk') || text.includes('volatile')) {
      return 'High volatility environment with elevated risk levels. Consider reduced position sizes.'
    }
    if (text.includes('low risk') || text.includes('stable')) {
      return 'Relatively stable conditions with manageable risk factors.'
    }
    return 'Moderate risk with standard precautions recommended.'
  }

  private extractReasoning(text: string): string {
    // Extract the most relevant reasoning sentence
    const sentences = text.split('.')
    const reasoningSentence = sentences.find(s => 
      s.includes('because') || 
      s.includes('due to') || 
      s.includes('analysis shows') ||
      s.includes('indicates')
    )
    
    return reasoningSentence?.trim() || text.substring(0, 150) + '...'
  }

  private extractRiskLevel(text: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('high risk') || lowerText.includes('aggressive')) return 'HIGH'
    if (lowerText.includes('low risk') || lowerText.includes('conservative')) return 'LOW'
    return 'MEDIUM'
  }
}

export default GeminiService