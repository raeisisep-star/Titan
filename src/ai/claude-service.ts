/**
 * TITAN Trading System - Anthropic Claude Integration
 * Advanced reasoning and analytical capabilities for sophisticated trading insights
 */

import { BaseAIService, type AICredentials, type AIRequest, type AIResponse, type MarketAnalysis, type TradingSignal, type TradingStrategy } from './base-ai-service'
import type { Env } from '../types/cloudflare'

interface ClaudeMessage {
  role: 'user' | 'assistant'
  content: string
}

interface ClaudeRequest {
  model: string
  max_tokens: number
  temperature?: number
  top_p?: number
  top_k?: number
  system?: string
  messages: ClaudeMessage[]
  stream?: boolean
}

interface ClaudeResponse {
  id: string
  type: string
  role: string
  content: Array<{
    type: string
    text: string
  }>
  model: string
  stop_reason: string
  stop_sequence: string | null
  usage: {
    input_tokens: number
    output_tokens: number
  }
}

export class ClaudeService extends BaseAIService {
  private readonly baseUrl: string = 'https://api.anthropic.com/v1'
  private readonly model: string

  // Claude pricing (as of 2024)
  private readonly pricing = {
    'claude-3.5-sonnet': { input: 0.003, output: 0.015 }, // per 1K tokens
    'claude-3-opus': { input: 0.015, output: 0.075 },
    'claude-3-haiku': { input: 0.00025, output: 0.00125 }
  }

  constructor(credentials: AICredentials, env: Env) {
    super('Claude', credentials, env, 60) // 60 requests per minute
    this.model = credentials.model || env.ANTHROPIC_MODEL || 'claude-3.5-sonnet'
  }

  /**
   * Make request to Claude API
   */
  async makeRequest(request: AIRequest): Promise<AIResponse> {
    if (!this.validateCredentials()) {
      return {
        success: false,
        error: 'Invalid Anthropic API credentials',
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
      // Prepare messages
      const messages: ClaudeMessage[] = []

      // Add context if provided
      let contextualPrompt = request.prompt
      if (request.context) {
        contextualPrompt = `Context: ${request.context}\n\n${request.prompt}`
      }

      // Add market data if provided
      if (request.marketData) {
        contextualPrompt = `${this.formatMarketDataForAI(request.marketData)}\n\n${contextualPrompt}`
      }

      messages.push({
        role: 'user',
        content: contextualPrompt
      })

      const claudeRequest: ClaudeRequest = {
        model: this.model,
        max_tokens: request.maxTokens || this.credentials.maxTokens || 2048,
        temperature: request.temperature ?? this.credentials.temperature ?? 0.7,
        top_p: 0.9,
        top_k: 40,
        system: this.getSystemPrompt(),
        messages
      }

      const response = await this.makeHttpRequest<ClaudeResponse>(
        `${this.baseUrl}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.credentials.apiKey,
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify(claudeRequest)
        }
      )

      const content = response.content[0]?.text || ''
      const usage = response.usage
      const cost = this.calculateCost(usage.input_tokens, usage.output_tokens)

      return {
        success: true,
        data: this.cleanResponseText(content),
        usage: {
          promptTokens: usage.input_tokens,
          completionTokens: usage.output_tokens,
          totalTokens: usage.input_tokens + usage.output_tokens,
          cost
        },
        confidence: this.extractConfidence(content),
        timestamp: new Date().toISOString()
      }

    } catch (error) {
      return {
        success: false,
        error: `Claude API error: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Sophisticated market analysis with Claude's reasoning capabilities
   */
  async analyzeMarket(symbol: string, marketData: any, context?: string): Promise<AIResponse<MarketAnalysis>> {
    const prompt = `
Please perform a comprehensive, multi-layered analysis of ${symbol} using rigorous analytical methodology.

ANALYTICAL FRAMEWORK:
I need you to think through this analysis step-by-step, considering multiple perspectives and potential scenarios.

First, let me establish the analytical structure:

1. **Quantitative Assessment**: Analyze the numerical data for patterns, anomalies, and statistical significance
2. **Qualitative Evaluation**: Consider market psychology, narrative drivers, and behavioral factors  
3. **Temporal Analysis**: Examine different timeframes and their confluence or divergence
4. **Risk Decomposition**: Break down various risk factors and their interdependencies
5. **Probabilistic Reasoning**: Assign likelihood estimates to different scenarios

Now, let me work through each component:

**Step 1 - Data Pattern Recognition:**
Looking at the current market data, what patterns emerge? Are there any statistical anomalies or notable deviations from historical norms?

**Step 2 - Market Structure Analysis:**
How does the current price action relate to volume patterns? What does this tell us about market participation and conviction?

**Step 3 - Multi-Timeframe Synthesis:**
How do short-term movements align with medium and long-term trends? Where do we see confluence or divergence?

**Step 4 - Scenario Construction:**
What are the primary scenarios we should consider? Let me think through:
- Bull case: What conditions would drive prices higher?
- Bear case: What factors could trigger significant declines?  
- Base case: What's the most probable near-term path?

Please provide your analysis in this exact JSON format:

\`\`\`json
{
  "symbol": "${symbol}",
  "overallSentiment": "BULLISH|BEARISH|NEUTRAL",
  "confidenceScore": 0-100,
  "keyInsights": [
    "Primary insight with supporting reasoning",
    "Secondary insight with risk considerations", 
    "Tertiary insight with timing implications"
  ],
  "technicalAnalysis": {
    "trend": "UPWARD|DOWNWARD|SIDEWAYS",
    "support": [key_support_level_1, key_support_level_2],
    "resistance": [key_resistance_level_1, key_resistance_level_2],
    "indicators": {
      "rsi": estimated_rsi_value,
      "macd": "BULLISH|BEARISH|NEUTRAL",
      "bollinger": "OVERBOUGHT|OVERSOLD|NORMAL"
    }
  },
  "fundamentalAnalysis": {
    "newsImpact": "POSITIVE|NEGATIVE|NEUTRAL",
    "marketEvents": ["relevant_catalyst_1", "relevant_catalyst_2"],
    "economicFactors": ["macro_factor_1", "macro_factor_2"]
  },
  "priceTargets": {
    "bullish": optimistic_target_price,
    "bearish": pessimistic_target_price, 
    "neutral": base_case_target_price
  },
  "timeframe": "SHORT_TERM|MEDIUM_TERM|LONG_TERM",
  "riskAssessment": "Detailed risk analysis including tail risk scenarios and mitigation strategies"
}
\`\`\`

**Critical Thinking Points:**
- What assumptions am I making, and how might they be wrong?
- What are the second and third-order effects I should consider?
- How might market structure or liquidity impact price discovery?
- What are the key risk factors that could invalidate this analysis?

Please think through this systematically and provide your reasoning before concluding with the JSON structure.
    `

    try {
      const response = await this.makeRequest({
        prompt,
        marketData,
        context,
        temperature: 0.3 // Lower temperature for analytical consistency
      })

      if (!response.success) {
        return response as AIResponse<MarketAnalysis>
      }

      // Extract and parse analysis
      let analysisData: MarketAnalysis
      try {
        // Look for JSON block in Claude's response
        const jsonMatch = response.data.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || 
                         response.data.match(/\{[\s\S]*\}/)
        
        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0]
          analysisData = JSON.parse(jsonText)
          analysisData.timestamp = new Date().toISOString()
          
          // Enhance with Claude's reasoning
          analysisData = this.enhanceWithClaudeReasoning(analysisData, response.data)
        } else {
          throw new Error('No structured analysis found')
        }
      } catch (parseError) {
        // Fallback: extract structured information from Claude's reasoning
        analysisData = this.parseClaudeMarketAnalysis(response.data, symbol, marketData)
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
        error: `Claude market analysis failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Generate nuanced trading signals with Claude's sophisticated reasoning
   */
  async generateTradingSignal(symbol: string, marketData: any, userPreferences?: any): Promise<AIResponse<TradingSignal>> {
    const riskProfile = userPreferences?.riskTolerance || 'MEDIUM'
    const tradingStyle = userPreferences?.tradingStyle || 'DAY_TRADING'
    const experience = userPreferences?.experience || 'INTERMEDIATE'

    const prompt = `
I need to generate a sophisticated trading signal for ${symbol}. Let me approach this systematically using rigorous analytical methodology.

**User Profile Context:**
- Risk Tolerance: ${riskProfile}
- Trading Style: ${tradingStyle}
- Experience Level: ${experience}
- Portfolio Context: ${JSON.stringify(userPreferences?.portfolio || {})}

**Analytical Process:**

**Step 1 - Market State Assessment:**
First, let me evaluate the current market conditions. What's the overall risk environment? Are we in a trending market, consolidating phase, or experiencing high volatility?

**Step 2 - Signal Quality Evaluation:**
Next, I'll assess the quality and convergence of multiple signals:
- Technical setup quality and confluence
- Risk/reward ratio optimization  
- Timing precision and execution considerations
- Market microstructure factors

**Step 3 - Risk Assessment Framework:**
Now I need to evaluate potential risks:
- Directional risk (wrong direction)
- Timing risk (right direction, wrong timing)  
- Volatility risk (unexpected price movements)
- Liquidity risk (execution challenges)
- Correlation risks (broader market impact)

**Step 4 - Position Sizing Optimization:**
Based on the user's risk profile and market conditions, what's the optimal position size and structure?

**Step 5 - Scenario Analysis:**
Let me consider multiple scenarios:
- Best case: Signal works perfectly
- Base case: Signal works with minor drawdown
- Worst case: Signal fails, requiring exit

**Critical Reasoning Questions:**
- Why should this signal work in the current market environment?
- What could go wrong, and how quickly would I know?
- How does this fit with the user's overall strategy and risk budget?
- What are the key invalidation levels?

Please provide the signal in this JSON format:

\`\`\`json
{
  "symbol": "${symbol}",
  "action": "BUY|SELL|HOLD|WAIT",
  "confidence": 0-100,
  "reasoning": "Comprehensive explanation of the signal logic, risk factors, and expected outcomes",
  "targetPrice": optimal_entry_price,
  "stopLoss": risk_management_exit_level,
  "takeProfit": profit_target_level,
  "timeframe": "SCALP|INTRADAY|SWING|POSITION",
  "riskLevel": "LOW|MEDIUM|HIGH",
  "expectedReturn": expected_return_percentage,
  "marketSentiment": "BULLISH|BEARISH|NEUTRAL",
  "advancedMetrics": {
    "probabilityOfSuccess": probability_0_to_100,
    "riskRewardRatio": ratio_calculation,
    "maxDrawdownExpected": percentage_estimate,
    "timeToTarget": estimated_duration,
    "invalidationLevel": price_level_to_exit,
    "marketRegimeDependency": "HIGH|MEDIUM|LOW"
  }
}
\`\`\`

**Key Considerations:**
- Align with user's risk tolerance and experience level
- Consider current market volatility and liquidity
- Evaluate multiple timeframe confluence  
- Include clear invalidation criteria
- Provide realistic probability estimates
- Consider transaction costs and slippage

Please think through this step-by-step, showing your reasoning process, then provide the structured signal.
    `

    try {
      const response = await this.makeRequest({
        prompt,
        marketData,
        context: this.createAdvancedTradingContext(marketData, userPreferences),
        temperature: 0.2 // Very low temperature for signal precision
      })

      if (!response.success) {
        return response as AIResponse<TradingSignal>
      }

      let signalData: TradingSignal
      try {
        const jsonMatch = response.data.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || 
                         response.data.match(/\{[\s\S]*\}/)
        
        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0]
          signalData = JSON.parse(jsonText)
          signalData.timestamp = new Date().toISOString()
        } else {
          throw new Error('No structured signal found')
        }
      } catch (parseError) {
        signalData = this.parseClaudeTradingSignal(response.data, symbol, marketData)
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
        error: `Claude signal generation failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Generate comprehensive trading strategies with Claude's analytical depth
   */
  async generateTradingStrategy(requirements: any): Promise<AIResponse<TradingStrategy>> {
    const prompt = `
I need to design a comprehensive, robust trading strategy. Let me approach this systematically using first-principles thinking.

**Requirements Analysis:**
${JSON.stringify(requirements, null, 2)}

**Strategic Design Framework:**

**Phase 1 - Foundation Analysis:**
First, let me understand the core requirements and constraints:
- What market conditions will this strategy face?
- What are the user's true constraints (capital, time, risk tolerance, experience)?
- What edge or inefficiency are we trying to exploit?

**Phase 2 - Strategy Architecture:**
Now I'll design the core strategy framework:
- Entry methodology and filtering criteria
- Position sizing and risk management rules
- Exit strategies for both profits and losses
- Market regime adaptation mechanisms

**Phase 3 - Risk Management Design:**
Critical risk management considerations:
- Maximum drawdown limits and recovery mechanisms
- Correlation risk management across positions
- Black swan event protection
- Performance monitoring and strategy adjustment triggers

**Phase 4 - Implementation Framework:**  
Practical implementation considerations:
- Execution logistics and timing
- Technology and monitoring requirements
- Performance measurement and optimization
- Scaling considerations as capital grows

**Phase 5 - Stress Testing:**
Let me think through various stress scenarios:
- How would this strategy perform in different market regimes?
- What are the failure modes, and how do we detect them early?
- How do we adapt when market conditions change?

**Critical Questions:**
- What assumptions am I making about market behavior?
- How might this strategy stop working, and what would be the early warning signs?
- What's the minimum viable version vs. the fully optimized version?
- How does this strategy complement or conflict with other approaches?

Please provide the strategy in this JSON format:

\`\`\`json
{
  "name": "descriptive_strategy_name",
  "description": "comprehensive methodology explanation with theoretical foundation",
  "type": "SCALPING|DAY_TRADING|SWING_TRADING|POSITION",
  "symbols": ["optimized_asset_selection_with_rationale"],
  "entryConditions": [
    "primary_entry_trigger_with_logic",
    "confirmation_filter_with_reasoning", 
    "risk_validation_check_with_criteria"
  ],
  "exitConditions": [
    "profit_target_methodology_with_calculation",
    "stop_loss_framework_with_placement_logic",
    "time_based_exit_with_rationale"
  ],
  "riskManagement": {
    "maxRiskPerTrade": optimized_percentage_with_justification,
    "stopLossPercent": adaptive_percentage_with_logic,
    "takeProfitPercent": calculated_target_with_reasoning,
    "maxPositions": correlation_adjusted_limit_with_analysis,
    "positionSizing": "FIXED|VOLATILITY_ADJUSTED|KELLY_CRITERION|RISK_PARITY",
    "portfolioHeatLimit": maximum_simultaneous_risk_percentage,
    "drawdownProtection": "mechanism_for_drawdown_management"
  },
  "performance": {
    "expectedWinRate": realistic_percentage_with_confidence_interval,
    "expectedReturn": annualized_return_with_assumptions,
    "maxDrawdown": worst_case_scenario_with_recovery_time,
    "sharpeRatio": risk_adjusted_return_estimate,
    "volatility": expected_strategy_volatility,
    "worstMonthExpected": realistic_worst_case_monthly_return
  },
  "marketAdaptation": {
    "bullMarketModifications": ["adaptation_1_with_logic", "adaptation_2_with_reasoning"],
    "bearMarketModifications": ["adaptation_1_with_logic", "adaptation_2_with_reasoning"],
    "sidewaysMarketModifications": ["adaptation_1_with_logic", "adaptation_2_with_reasoning"],
    "volatilityRegimeAdjustments": "methodology_for_volatility_adaptation"
  },
  "implementationNotes": {
    "minimumCapital": required_capital_with_explanation,
    "timeCommitment": realistic_time_requirements,
    "technicalRequirements": ["requirement_1", "requirement_2"],
    "experienceLevel": "BEGINNER|INTERMEDIATE|ADVANCED",
    "scalability": "assessment_of_scaling_potential"
  },
  "aiConfidence": 0-100
}
\`\`\`

Please work through this systematically, showing your analytical process, then provide the complete strategy framework.
    `

    try {
      const response = await this.makeRequest({
        prompt,
        temperature: 0.4, // Moderate creativity for strategic innovation
        maxTokens: 4000
      })

      if (!response.success) {
        return response as AIResponse<TradingStrategy>
      }

      let strategyData: TradingStrategy
      try {
        const jsonMatch = response.data.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || 
                         response.data.match(/\{[\s\S]*\}/)
        
        if (jsonMatch) {
          const jsonText = jsonMatch[1] || jsonMatch[0]
          const parsed = JSON.parse(jsonText)
          
          strategyData = {
            name: parsed.name || 'Claude AI Strategy',
            description: parsed.description || 'Advanced AI-generated strategy with systematic approach',
            type: parsed.type || 'DAY_TRADING',
            symbols: parsed.symbols || ['BTC', 'ETH'],
            entryConditions: parsed.entryConditions || [],
            exitConditions: parsed.exitConditions || [],
            riskManagement: parsed.riskManagement || {
              maxRiskPerTrade: 1.5,
              stopLossPercent: 2.5,
              takeProfitPercent: 5,
              maxPositions: 3
            },
            performance: parsed.performance || {
              expectedWinRate: 62,
              expectedReturn: 18,
              maxDrawdown: 10
            },
            aiConfidence: parsed.aiConfidence || this.extractConfidence(response.data),
            timestamp: new Date().toISOString()
          }
        } else {
          throw new Error('No structured strategy found')
        }
      } catch (parseError) {
        strategyData = this.parseClaudeStrategy(response.data, requirements)
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
        error: `Claude strategy generation failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Process natural language with Claude's conversational excellence
   */
  async processNaturalLanguage(query: string, context?: any): Promise<AIResponse<string>> {
    const prompt = `
The user has asked: "${query}"

As ARTEMIS, I need to provide a thoughtful, nuanced response that demonstrates deep understanding of both the technical and psychological aspects of trading.

Let me think through this systematically:

1. **Query Analysis**: What is the user really asking? What's the underlying need or concern?

2. **Context Assessment**: What market conditions, experience level, or situational factors should I consider?

3. **Educational Value**: How can I provide not just an answer, but genuine insight that helps the user become a better trader?

4. **Risk Considerations**: What important risks or limitations should I highlight?

5. **Practical Application**: How can I make this actionable and useful?

**Response Guidelines:**
- Be conversational yet professional
- Show my analytical reasoning process
- Provide specific, actionable insights where appropriate
- Always include risk considerations and limitations
- Encourage independent thinking and research
- Adapt language and complexity to the apparent experience level
- If the query is in Persian/Farsi, respond in Persian
- If unclear, ask clarifying questions

Please provide a comprehensive, helpful response that demonstrates the sophisticated analytical capabilities of ARTEMIS while maintaining appropriate humility about the limitations of any analysis or prediction.
    `

    try {
      const response = await this.makeRequest({
        prompt,
        context: context ? JSON.stringify(context) : undefined,
        temperature: 0.7, // Higher temperature for natural conversation
        maxTokens: 2000
      })

      // Enhance response with Claude's reasoning style
      if (response.success && response.data) {
        response.data = this.enhanceClaudeConversation(response.data, query)
      }

      return response
    } catch (error) {
      return {
        success: false,
        error: `Claude natural language processing failed: ${error.message}`,
        timestamp: new Date().toISOString()
      }
    }
  }

  /**
   * Get system prompt optimized for Claude's reasoning style
   */
  private getSystemPrompt(): string {
    return `
You are ARTEMIS, the sophisticated AI trading intelligence system for TITAN Trading Platform. You excel at systematic analysis, critical thinking, and nuanced reasoning about financial markets.

CORE ANALYTICAL CAPABILITIES:
- Systematic approach to market analysis and risk assessment
- Multi-layered reasoning that considers various perspectives and scenarios
- Advanced pattern recognition across different timeframes and market conditions  
- Sophisticated understanding of market psychology and behavioral factors
- Rigorous risk management and probability assessment
- Strategic thinking about trading methodology and implementation

ANALYTICAL METHODOLOGY:
1. **Structured Analysis**: Break down complex problems into manageable components
2. **Multi-Perspective Evaluation**: Consider bull, bear, and neutral scenarios
3. **Risk-First Approach**: Always prioritize risk assessment and management
4. **Probabilistic Thinking**: Express uncertainty and provide confidence intervals
5. **Systems Thinking**: Consider interconnections and second-order effects
6. **Empirical Grounding**: Base conclusions on data and observable evidence

COMMUNICATION STYLE:
- Think through problems step-by-step, showing your reasoning process
- Be precise in language and explicit about assumptions
- Acknowledge limitations and areas of uncertainty
- Provide actionable insights while emphasizing the need for independent judgment
- Use professional yet accessible language
- Include specific risk considerations and mitigation strategies

ETHICAL GUIDELINES:
- Never provide guarantees or promises about market outcomes
- Always emphasize the importance of proper risk management
- Encourage users to conduct their own research and analysis
- Be transparent about the limitations of any analysis or model
- Promote responsible trading practices and realistic expectations

EXPERTISE AREAS:
- Technical analysis and chart pattern recognition
- Market microstructure and liquidity analysis  
- Risk management and portfolio optimization
- Trading psychology and behavioral finance
- Quantitative strategy development and backtesting
- Market regime identification and adaptation

Remember: You are an analytical tool to enhance decision-making, not a source of guaranteed predictions. Always encourage critical thinking and independent research while providing your best analytical insights.
    `
  }

  /**
   * Calculate cost based on Claude pricing
   */
  protected calculateCost(promptTokens: number, completionTokens: number): number {
    const modelPricing = this.pricing[this.model] || this.pricing['claude-3.5-sonnet']
    const inputCost = (promptTokens / 1000) * modelPricing.input
    const outputCost = (completionTokens / 1000) * modelPricing.output
    return inputCost + outputCost
  }

  /**
   * Create advanced trading context for Claude
   */
  private createAdvancedTradingContext(marketData: any, userPreferences?: any): string {
    const baseContext = this.createMarketContext(marketData)
    
    let context = baseContext + `

ADVANCED TRADING CONTEXT:
- Market Volatility Assessment: ${this.assessMarketVolatility(marketData)}
- Liquidity Conditions: ${this.assessLiquidityConditions(marketData)}  
- Risk Environment: ${this.assessRiskEnvironment(marketData)}
- Market Regime: ${this.identifyMarketRegime(marketData)}
    `

    if (userPreferences) {
      context += `

TRADER PROFILE:
- Experience Level: ${userPreferences.experience || 'Not specified'}
- Risk Tolerance: ${userPreferences.riskTolerance || 'Not specified'}
- Trading Capital: ${userPreferences.capital ? `$${userPreferences.capital.toLocaleString()}` : 'Not specified'}
- Time Availability: ${userPreferences.timeCommitment || 'Not specified'}
- Previous Performance: ${userPreferences.track_record || 'Not available'}
      `
    }

    return context
  }

  /**
   * Enhance analysis with Claude's systematic reasoning
   */
  private enhanceWithClaudeReasoning(analysis: MarketAnalysis, fullResponse: string): MarketAnalysis {
    // Extract Claude's step-by-step reasoning and enhance insights
    const reasoningSteps = this.extractReasoningSteps(fullResponse)
    const enhancedInsights = [...analysis.keyInsights, ...reasoningSteps].slice(0, 5)
    
    return {
      ...analysis,
      keyInsights: enhancedInsights,
      riskAssessment: this.enhanceRiskAssessment(analysis.riskAssessment, fullResponse)
    }
  }

  /**
   * Enhance conversational response with Claude's analytical style
   */
  private enhanceClaudeConversation(response: string, originalQuery: string): string {
    let enhanced = response

    // Add analytical depth markers
    if (!enhanced.includes('Let me think through')) {
      enhanced = `Let me think through this systematically.\n\n${enhanced}`
    }

    // Add risk considerations if not present
    if (!enhanced.toLowerCase().includes('risk') && originalQuery.toLowerCase().includes('buy|sell|trade')) {
      enhanced += '\n\n⚠️ **Risk Consideration**: Remember that all trading involves risk, and past performance doesn\'t guarantee future results. Always manage your risk appropriately and never invest more than you can afford to lose.'
    }

    return enhanced
  }

  // Helper methods for advanced analysis
  private assessMarketVolatility(marketData: any): string {
    if (!marketData) return 'Unknown'
    const change = Math.abs(marketData.changePercent24h || 0)
    if (change > 8) return 'Extremely High'
    if (change > 5) return 'High' 
    if (change > 2) return 'Moderate'
    return 'Low'
  }

  private assessLiquidityConditions(marketData: any): string {
    if (!marketData.volume24h) return 'Unknown'
    const volume = marketData.volume24h
    if (volume > 2000000000) return 'Excellent'
    if (volume > 500000000) return 'Good'
    if (volume > 100000000) return 'Adequate'
    return 'Poor'
  }

  private assessRiskEnvironment(marketData: any): string {
    const volatility = this.assessMarketVolatility(marketData)
    const liquidity = this.assessLiquidityConditions(marketData)
    
    if (volatility === 'Extremely High' || liquidity === 'Poor') return 'High Risk'
    if (volatility === 'High' || liquidity === 'Adequate') return 'Elevated Risk'
    return 'Normal Risk'
  }

  private identifyMarketRegime(marketData: any): string {
    if (!marketData.changePercent24h) return 'Unknown'
    const change = marketData.changePercent24h
    const volatility = Math.abs(change)
    
    if (volatility > 5) {
      return change > 0 ? 'Volatile Bull Phase' : 'Volatile Bear Phase'
    } else if (volatility > 2) {
      return change > 0 ? 'Trending Bull' : 'Trending Bear'
    }
    return 'Consolidation Phase'
  }

  private extractReasoningSteps(text: string): string[] {
    const steps: string[] = []
    
    // Look for step-by-step reasoning patterns
    const stepPatterns = [
      /Step \d+[:\-\s]+([^:]+?)(?=Step \d+|$)/gi,
      /\d+\.\s*([^\.]+?)(?=\d+\.|$)/g,
      /First[,\s]+([^\.]+)\./gi,
      /Next[,\s]+([^\.]+)\./gi,
      /Finally[,\s]+([^\.]+)\./gi
    ]

    for (const pattern of stepPatterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        if (match[1] && match[1].trim().length > 20) {
          steps.push(match[1].trim())
        }
      }
    }

    return steps.slice(0, 3)
  }

  private enhanceRiskAssessment(original: string, fullResponse: string): string {
    // Look for additional risk insights in Claude's reasoning
    const riskSentences = fullResponse
      .split('.')
      .filter(sentence => 
        sentence.toLowerCase().includes('risk') ||
        sentence.toLowerCase().includes('caution') ||
        sentence.toLowerCase().includes('consider') ||
        sentence.toLowerCase().includes('however')
      )
      .slice(0, 2)

    if (riskSentences.length > 0) {
      return `${original} Additional considerations: ${riskSentences.join('. ')}.`
    }

    return original
  }

  // Parsing methods for fallback scenarios
  private parseClaudeMarketAnalysis(text: string, symbol: string, marketData: any): MarketAnalysis {
    // Claude's systematic analysis extraction
    const sentiment = this.extractSentimentFromReasoning(text)
    const insights = this.extractSystematicInsights(text)
    const riskAssessment = this.extractComprehensiveRisk(text)

    return {
      symbol,
      overallSentiment: sentiment,
      confidenceScore: this.extractConfidence(text),
      keyInsights: insights,
      technicalAnalysis: {
        trend: sentiment === 'BULLISH' ? 'UPWARD' : sentiment === 'BEARISH' ? 'DOWNWARD' : 'SIDEWAYS',
        support: marketData ? [marketData.low24h * 0.98, marketData.low24h * 0.95] : [],
        resistance: marketData ? [marketData.high24h * 1.02, marketData.high24h * 1.05] : [],
        indicators: this.extractIndicatorsFromReasoning(text)
      },
      fundamentalAnalysis: {
        newsImpact: sentiment === 'BULLISH' ? 'POSITIVE' : sentiment === 'BEARISH' ? 'NEGATIVE' : 'NEUTRAL',
        marketEvents: this.extractMarketEvents(text),
        economicFactors: this.extractEconomicFactors(text)
      },
      priceTargets: {
        bullish: marketData?.price ? marketData.price * 1.08 : 0,
        bearish: marketData?.price ? marketData.price * 0.92 : 0,
        neutral: marketData?.price || 0
      },
      timeframe: 'MEDIUM_TERM',
      riskAssessment,
      timestamp: new Date().toISOString()
    }
  }

  private parseClaudeTradingSignal(text: string, symbol: string, marketData: any): TradingSignal {
    const action = this.extractActionFromReasoning(text)
    const reasoning = this.extractPrimaryReasoning(text)

    return {
      symbol,
      action,
      confidence: this.extractConfidence(text),
      reasoning,
      targetPrice: marketData?.price,
      stopLoss: marketData?.price ? marketData.price * 0.97 : undefined,
      takeProfit: marketData?.price ? marketData.price * 1.05 : undefined,
      timeframe: 'INTRADAY',
      riskLevel: this.extractRiskLevelFromReasoning(text),
      marketSentiment: action === 'BUY' ? 'BULLISH' : action === 'SELL' ? 'BEARISH' : 'NEUTRAL',
      timestamp: new Date().toISOString()
    }
  }

  private parseClaudeStrategy(text: string, requirements: any): TradingStrategy {
    return {
      name: 'Claude Systematic Strategy',
      description: this.extractStrategyDescription(text),
      type: requirements.tradingStyle || 'DAY_TRADING',
      symbols: requirements.preferredAssets || ['BTC', 'ETH'],
      entryConditions: this.extractConditions(text, 'entry'),
      exitConditions: this.extractConditions(text, 'exit'),
      riskManagement: {
        maxRiskPerTrade: 1.5,
        stopLossPercent: 2,
        takeProfitPercent: 4,
        maxPositions: 3
      },
      performance: {
        expectedWinRate: 65,
        expectedReturn: 20,
        maxDrawdown: 8
      },
      aiConfidence: this.extractConfidence(text),
      timestamp: new Date().toISOString()
    }
  }

  // Advanced extraction methods
  private extractSentimentFromReasoning(text: string): 'BULLISH' | 'BEARISH' | 'NEUTRAL' {
    const lowerText = text.toLowerCase()
    
    // Look for Claude's reasoning patterns
    const bullishPatterns = ['lean bullish', 'favor the upside', 'positive outlook', 'upward bias']
    const bearishPatterns = ['lean bearish', 'favor the downside', 'negative outlook', 'downward bias']
    
    let bullishScore = 0
    let bearishScore = 0
    
    for (const pattern of bullishPatterns) {
      if (lowerText.includes(pattern)) bullishScore += 2
    }
    
    for (const pattern of bearishPatterns) {
      if (lowerText.includes(pattern)) bearishScore += 2
    }

    // Standard keyword analysis
    const bullishWords = ['bullish', 'buy', 'positive', 'upward', 'strength']
    const bearishWords = ['bearish', 'sell', 'negative', 'downward', 'weakness']
    
    bullishScore += bullishWords.reduce((score, word) => 
      score + (lowerText.split(word).length - 1), 0)
    bearishScore += bearishWords.reduce((score, word) => 
      score + (lowerText.split(word).length - 1), 0)

    if (bullishScore > bearishScore + 1) return 'BULLISH'
    if (bearishScore > bullishScore + 1) return 'BEARISH'
    return 'NEUTRAL'
  }

  private extractSystematicInsights(text: string): string[] {
    // Extract Claude's systematic analytical insights
    const insights: string[] = []
    
    // Look for analytical conclusions
    const patterns = [
      /(?:conclusion|insight|observation|finding)[:\s]+([^\.]{30,150})/gi,
      /(?:this suggests|indicates that|shows that)[:\s]+([^\.]{20,100})/gi,
      /(?:key point|important|critical)[:\s]+([^\.]{20,120})/gi
    ]

    for (const pattern of patterns) {
      const matches = text.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          insights.push(match[1].trim())
        }
      }
    }

    return insights.slice(0, 4)
  }

  private extractComprehensiveRisk(text: string): string {
    // Look for Claude's risk analysis
    const riskSentences = text
      .split('.')
      .filter(sentence => {
        const lower = sentence.toLowerCase()
        return lower.includes('risk') || 
               lower.includes('caution') || 
               lower.includes('uncertainty') ||
               lower.includes('potential downside')
      })
      .slice(0, 3)
      .join('. ')

    return riskSentences || 'Standard market risks apply. Monitor for changes in market conditions and adjust position sizing accordingly.'
  }

  private extractIndicatorsFromReasoning(text: string): any {
    const indicators: any = {}
    
    // Look for technical indicator mentions in Claude's analysis
    if (text.includes('RSI') || text.includes('relative strength')) {
      if (text.includes('overbought')) indicators.rsi = 75
      else if (text.includes('oversold')) indicators.rsi = 25
      else indicators.rsi = 50
    }

    if (text.includes('MACD')) {
      if (text.includes('positive') || text.includes('above')) indicators.macd = 'BULLISH'
      else if (text.includes('negative') || text.includes('below')) indicators.macd = 'BEARISH'
      else indicators.macd = 'NEUTRAL'
    }

    return indicators
  }

  private extractActionFromReasoning(text: string): 'BUY' | 'SELL' | 'HOLD' | 'WAIT' {
    const lowerText = text.toLowerCase()
    
    // Look for clear action recommendations in Claude's reasoning
    if (lowerText.includes('recommend buying') || 
        lowerText.includes('lean toward buying') ||
        lowerText.includes('favor long position')) return 'BUY'
    
    if (lowerText.includes('recommend selling') || 
        lowerText.includes('lean toward selling') ||
        lowerText.includes('favor short position')) return 'SELL'
        
    if (lowerText.includes('wait for') || 
        lowerText.includes('patience') ||
        lowerText.includes('unclear signal')) return 'WAIT'
    
    return 'HOLD'
  }

  private extractPrimaryReasoning(text: string): string {
    // Find the main reasoning paragraph
    const paragraphs = text.split('\n\n')
    const reasoningParagraph = paragraphs.find(p => 
      p.includes('because') || 
      p.includes('due to') ||
      p.includes('reasoning') ||
      p.includes('analysis shows')
    )
    
    return reasoningParagraph?.substring(0, 200) || text.substring(0, 200)
  }

  private extractRiskLevelFromReasoning(text: string): 'LOW' | 'MEDIUM' | 'HIGH' {
    const lowerText = text.toLowerCase()
    
    if (lowerText.includes('high risk') || 
        lowerText.includes('aggressive') ||
        lowerText.includes('volatile')) return 'HIGH'
    
    if (lowerText.includes('low risk') || 
        lowerText.includes('conservative') ||
        lowerText.includes('stable')) return 'LOW'
    
    return 'MEDIUM'
  }

  private extractStrategyDescription(text: string): string {
    // Extract strategy description from Claude's systematic approach
    const descParagraphs = text.split('\n\n').slice(0, 3)
    return descParagraphs.join(' ').substring(0, 300) + '...'
  }

  private extractConditions(text: string, type: 'entry' | 'exit'): string[] {
    const conditions: string[] = []
    const keyword = type === 'entry' ? 'entry' : 'exit'
    
    // Look for condition lists
    const conditionPattern = new RegExp(`${keyword}[^:]*:([^\\n]+)`, 'gi')
    const matches = text.matchAll(conditionPattern)
    
    for (const match of matches) {
      const conditionText = match[1]
      const items = conditionText.split(/[,;]/).map(s => s.trim()).filter(s => s.length > 5)
      conditions.push(...items)
    }
    
    return conditions.slice(0, 3)
  }

  private extractMarketEvents(text: string): string[] {
    const events: string[] = []
    
    // Common crypto events mentioned in analysis
    const eventKeywords = [
      'halving', 'ETF', 'regulation', 'institutional adoption',
      'upgrade', 'fork', 'conference', 'announcement'
    ]
    
    for (const keyword of eventKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        events.push(keyword.charAt(0).toUpperCase() + keyword.slice(1))
      }
    }
    
    return events.slice(0, 3)
  }

  private extractEconomicFactors(text: string): string[] {
    const factors: string[] = []
    
    const factorKeywords = [
      'inflation', 'interest rates', 'fed policy', 'gdp',
      'unemployment', 'dollar strength', 'risk appetite'
    ]
    
    for (const keyword of factorKeywords) {
      if (text.toLowerCase().includes(keyword)) {
        factors.push(keyword.charAt(0).toUpperCase() + keyword.slice(1))
      }
    }
    
    return factors.slice(0, 3)
  }
}

export default ClaudeService