// TITAN AI Service Integration
// مجهز به آرتمیس AI برای تحلیل بازار و پیش‌بینی قیمت

import type { Env } from '../types/cloudflare'

export interface AIAnalysisRequest {
  type: 'market_analysis' | 'price_prediction' | 'trade_signal' | 'portfolio_optimization' | 'risk_assessment'
  data: {
    symbol?: string
    timeframe?: string
    price_data?: any[]
    portfolio_data?: any[]
    market_sentiment?: string
    technical_indicators?: any
  }
  context?: string
}

export interface AIAnalysisResponse {
  success: boolean
  analysis: {
    summary: string
    confidence: number
    recommendations: string[]
    signals: {
      buy: number    // 0-100
      sell: number   // 0-100  
      hold: number   // 0-100
    }
    price_targets?: {
      short_term: number
      medium_term: number
      long_term: number
    }
    risk_level: 'low' | 'medium' | 'high' | 'critical'
    timeframe: string
  }
  metadata: {
    model_used: string
    processing_time: number
    timestamp: string
    tokens_used?: number
  }
}

export interface MarketData {
  symbol: string
  price: number
  change_24h: number
  volume_24h: number
  market_cap: number
  price_history: Array<{
    timestamp: number
    price: number
    volume: number
  }>
}

export class AIService {
  private env: Env
  private openaiKey: string
  private anthropicKey: string
  private coingeckoKey: string

  constructor(env: Env) {
    this.env = env
    this.openaiKey = env.OPENAI_API_KEY || ''
    this.anthropicKey = env.ANTHROPIC_API_KEY || ''
    this.coingeckoKey = env.COINGECKO_API_KEY || ''
  }

  // OpenAI GPT Analysis
  async analyzeWithOpenAI(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.openaiKey) {
      throw new Error('OpenAI API key not configured')
    }

    const startTime = Date.now()
    
    try {
      const prompt = this.buildAnalysisPrompt(request)
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.openaiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `شما آرتمیس هستید، هوش مصنوعی پیشرفته برای تحلیل بازارهای مالی. شما باید:
              1. تحلیل دقیق و علمی ارائه دهید
              2. پاسخ‌ها را به فارسی و به صورت ساختارمند بدهید  
              3. درصد اطمینان و سطح ریسک را مشخص کنید
              4. توصیه‌های عملی و قابل اجرا ارائه دهید
              5. از اطلاعات بازار و شاخص‌های تکنیکال استفاده کنید`
            },
            {
              role: 'user', 
              content: prompt
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const result = await response.json()
      const analysisText = result.choices[0]?.message?.content || ''
      
      return {
        success: true,
        analysis: this.parseAIResponse(analysisText, request.type),
        metadata: {
          model_used: 'gpt-4o-mini',
          processing_time: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          tokens_used: result.usage?.total_tokens || 0
        }
      }
      
    } catch (error) {
      console.error('OpenAI analysis failed:', error)
      throw new Error(`OpenAI analysis failed: ${error.message}`)
    }
  }

  // Anthropic Claude Analysis
  async analyzeWithAnthropic(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
    if (!this.anthropicKey) {
      throw new Error('Anthropic API key not configured')
    }

    const startTime = Date.now()
    
    try {
      const prompt = this.buildAnalysisPrompt(request)
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': this.anthropicKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 1500,
          system: `شما آرتمیس هستید، هوش مصنوعی تخصصی برای تحلیل بازارهای مالی و ارزهای دیجیتال. 
          وظیفه شما ارائه تحلیل‌های دقیق، علمی و قابل اعتماد است.`,
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ]
        })
      })

      if (!response.ok) {
        throw new Error(`Anthropic API error: ${response.status}`)
      }

      const result = await response.json()
      const analysisText = result.content[0]?.text || ''
      
      return {
        success: true,
        analysis: this.parseAIResponse(analysisText, request.type),
        metadata: {
          model_used: 'claude-3-haiku',
          processing_time: Date.now() - startTime,
          timestamp: new Date().toISOString(),
          tokens_used: result.usage?.input_tokens + result.usage?.output_tokens || 0
        }
      }
      
    } catch (error) {
      console.error('Anthropic analysis failed:', error)
      throw new Error(`Anthropic analysis failed: ${error.message}`)
    }
  }

  // Get market data from CoinGecko
  async getMarketData(symbol: string, days: number = 7): Promise<MarketData> {
    try {
      const coinId = this.getCoinGeckoId(symbol)
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }
      
      if (this.coingeckoKey) {
        headers['X-Cg-Pro-Api-Key'] = this.coingeckoKey
      }
      
      // Get current price and basic info
      const priceResponse = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`,
        { headers }
      )
      
      if (!priceResponse.ok) {
        throw new Error(`CoinGecko API error: ${priceResponse.status}`)
      }
      
      const priceData = await priceResponse.json()
      const coinData = priceData[coinId]
      
      // Get historical data
      const historyResponse = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}`,
        { headers }
      )
      
      const historyData = await historyResponse.json()
      
      return {
        symbol: symbol.toUpperCase(),
        price: coinData.usd,
        change_24h: coinData.usd_24h_change || 0,
        volume_24h: coinData.usd_24h_vol || 0,
        market_cap: coinData.usd_market_cap || 0,
        price_history: historyData.prices?.map(([timestamp, price]: [number, number], index: number) => ({
          timestamp,
          price,
          volume: historyData.total_volumes?.[index]?.[1] || 0
        })) || []
      }
      
    } catch (error) {
      console.error('Failed to fetch market data:', error)
      throw new Error(`Failed to fetch market data for ${symbol}: ${error.message}`)
    }
  }

  // Build analysis prompt based on request type
  private buildAnalysisPrompt(request: AIAnalysisRequest): string {
    const { type, data, context } = request
    
    let basePrompt = `لطفاً تحلیل جامعی از موارد زیر ارائه دهید:\n\n`
    
    if (data.symbol) {
      basePrompt += `نماد: ${data.symbol}\n`
    }
    
    if (data.price_data && data.price_data.length > 0) {
      basePrompt += `داده‌های قیمت: ${JSON.stringify(data.price_data.slice(-10))}\n`
    }
    
    switch (type) {
      case 'market_analysis':
        basePrompt += `
نوع تحلیل: تحلیل کلی بازار
لطفاً موارد زیر را بررسی کنید:
- وضعیت کلی بازار و ترند فعلی
- عوامل مؤثر بر قیمت
- سطوح حمایت و مقاومت
- پیش‌بینی کوتاه‌مدت و میان‌مدت
- میزان ریسک سرمایه‌گذاری

پاسخ خود را در قالب JSON با فیلدهای زیر ارائه دهید:
{
  "summary": "خلاصه تحلیل",
  "confidence": درصد اطمینان (0-100),
  "recommendations": ["توصیه 1", "توصیه 2"],
  "signals": {"buy": 0-100, "sell": 0-100, "hold": 0-100},
  "risk_level": "low/medium/high/critical",
  "timeframe": "کوتاه‌مدت/میان‌مدت/بلندمدت"
}
        `
        break
        
      case 'price_prediction':
        basePrompt += `
نوع تحلیل: پیش‌بینی قیمت
لطفاً موارد زیر را تحلیل کنید:
- روند آتی قیمت 
- اهداف قیمتی احتمالی
- نقاط ورود و خروج مناسب
- عوامل ریسک

پاسخ خود را در قالب JSON ارائه دهید و حتماً price_targets را شامل کنید.
        `
        break
        
      case 'trade_signal':
        basePrompt += `
نوع تحلیل: سیگنال معاملاتی
لطفاً سیگنال خرید/فروش و دلایل آن را ارائه دهید:
- قدرت سیگنال
- نقطه ورود پیشنهادی
- حد ضرر (Stop Loss)
- اهداف سود (Take Profit)
        `
        break
        
      case 'portfolio_optimization':
        basePrompt += `
نوع تحلیل: بهینه‌سازی پورتفولیو
${data.portfolio_data ? `داده‌های پورتفولیو فعلی: ${JSON.stringify(data.portfolio_data)}` : ''}
لطفاً توصیه‌هایی برای بهبود پورتفولیو ارائه دهید.
        `
        break
        
      case 'risk_assessment':
        basePrompt += `
نوع تحلیل: ارزیابی ریسک
لطفاً سطح ریسک فعلی و راهکارهای کاهش آن را بررسی کنید.
        `
        break
    }
    
    if (context) {
      basePrompt += `\n\nاطلاعات اضافی: ${context}`
    }
    
    return basePrompt
  }

  // Parse AI response and structure it
  private parseAIResponse(responseText: string, type: string): any {
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          summary: parsed.summary || responseText.substring(0, 200) + '...',
          confidence: parsed.confidence || 75,
          recommendations: parsed.recommendations || ['بررسی دقیق‌تر بازار', 'مدیریت ریسک'],
          signals: parsed.signals || { buy: 33, sell: 33, hold: 34 },
          risk_level: parsed.risk_level || 'medium',
          timeframe: parsed.timeframe || 'میان‌مدت',
          price_targets: parsed.price_targets
        }
      }
    } catch (error) {
      console.log('Could not parse JSON from AI response, using fallback')
    }
    
    // Fallback: create structured response from text
    return {
      summary: responseText.length > 500 ? responseText.substring(0, 500) + '...' : responseText,
      confidence: this.extractConfidence(responseText),
      recommendations: this.extractRecommendations(responseText),
      signals: this.extractSignals(responseText, type),
      risk_level: this.extractRiskLevel(responseText),
      timeframe: 'میان‌مدت'
    }
  }

  // Helper methods for parsing text responses
  private extractConfidence(text: string): number {
    const confidenceRegex = /(\d{1,3})[\s]*[٪%]/
    const match = text.match(confidenceRegex)
    return match ? parseInt(match[1]) : 75
  }

  private extractRecommendations(text: string): string[] {
    const recommendations = []
    if (text.includes('خرید') || text.includes('buy')) recommendations.push('فرصت خرید احتمالی')
    if (text.includes('فروش') || text.includes('sell')) recommendations.push('در نظر گیری فروش')
    if (text.includes('نگهداری') || text.includes('hold')) recommendations.push('نگهداری موقعیت فعلی')
    if (text.includes('ریسک')) recommendations.push('مدیریت دقیق ریسک')
    
    return recommendations.length > 0 ? recommendations : ['بررسی بیشتر بازار', 'مدیریت ریسک']
  }

  private extractSignals(text: string, type: string): any {
    let buySignal = 33, sellSignal = 33, holdSignal = 34
    
    if (text.includes('صعودی') || text.includes('خرید توصیه')) {
      buySignal = 60; sellSignal = 20; holdSignal = 20
    } else if (text.includes('نزولی') || text.includes('فروش توصیه')) {
      buySignal = 20; sellSignal = 60; holdSignal = 20  
    } else if (text.includes('نگهداری') || text.includes('خنثی')) {
      buySignal = 25; sellSignal = 25; holdSignal = 50
    }
    
    return { buy: buySignal, sell: sellSignal, hold: holdSignal }
  }

  private extractRiskLevel(text: string): string {
    if (text.includes('ریسک بالا') || text.includes('خطرناک')) return 'high'
    if (text.includes('ریسک پایین') || text.includes('امن')) return 'low'
    if (text.includes('ریسک بحرانی') || text.includes('بسیار خطرناک')) return 'critical'
    return 'medium'
  }

  // Map trading symbols to CoinGecko IDs
  private getCoinGeckoId(symbol: string): string {
    const symbolMap: Record<string, string> = {
      'BTC': 'bitcoin',
      'ETH': 'ethereum',
      'BNB': 'binancecoin',
      'ADA': 'cardano',
      'SOL': 'solana',
      'XRP': 'ripple',
      'DOT': 'polkadot',
      'DOGE': 'dogecoin',
      'AVAX': 'avalanche-2',
      'MATIC': 'matic-network',
      'LINK': 'chainlink',
      'UNI': 'uniswap',
      'LTC': 'litecoin',
      'ALGO': 'algorand',
      'VET': 'vechain',
      'ICP': 'internet-computer',
      'FTM': 'fantom',
      'ATOM': 'cosmos',
      'NEAR': 'near',
      'MANA': 'decentraland'
    }
    
    return symbolMap[symbol.toUpperCase()] || symbol.toLowerCase()
  }

  // Test AI service connectivity
  async testAIServices(): Promise<{
    openai: { available: boolean; message: string }
    anthropic: { available: boolean; message: string }
    coingecko: { available: boolean; message: string }
  }> {
    const results = {
      openai: { available: false, message: 'غیرفعال' },
      anthropic: { available: false, message: 'غیرفعال' },
      coingecko: { available: false, message: 'غیرفعال' }
    }

    // Test OpenAI
    if (this.openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${this.openaiKey}` }
        })
        results.openai = {
          available: response.ok,
          message: response.ok ? 'متصل و فعال' : `خطا: ${response.status}`
        }
      } catch (error) {
        results.openai.message = 'خطا در اتصال'
      }
    } else {
      results.openai.message = 'API Key تنظیم نشده'
    }

    // Test Anthropic
    if (this.anthropicKey) {
      try {
        // Anthropic doesn't have a simple endpoint to test, so we'll just check if key exists
        results.anthropic = {
          available: true,
          message: 'API Key تنظیم شده'
        }
      } catch (error) {
        results.anthropic.message = 'خطا در تنظیمات'
      }
    } else {
      results.anthropic.message = 'API Key تنظیم نشده'
    }

    // Test CoinGecko  
    try {
      const headers: Record<string, string> = {}
      if (this.coingeckoKey) {
        headers['X-Cg-Pro-Api-Key'] = this.coingeckoKey
      }
      
      const response = await fetch('https://api.coingecko.com/api/v3/ping', { headers })
      results.coingecko = {
        available: response.ok,
        message: response.ok 
          ? (this.coingeckoKey ? 'متصل (Pro)' : 'متصل (رایگان)') 
          : `خطا: ${response.status}`
      }
    } catch (error) {
      results.coingecko.message = 'خطا در اتصال'
    }

    return results
  }

  // Quick analysis method for testing
  async quickAnalysis(symbol: string, analysisType: string = 'market_analysis'): Promise<AIAnalysisResponse> {
    try {
      // Get market data first
      const marketData = await this.getMarketData(symbol)
      
      const request: AIAnalysisRequest = {
        type: analysisType as any,
        data: {
          symbol,
          price_data: marketData.price_history,
          market_sentiment: marketData.change_24h > 0 ? 'مثبت' : 'منفی'
        },
        context: `تحلیل سریع برای ${symbol} - قیمت فعلی: $${marketData.price}`
      }

      // Try OpenAI first, fallback to Anthropic
      if (this.openaiKey) {
        return await this.analyzeWithOpenAI(request)
      } else if (this.anthropicKey) {
        return await this.analyzeWithAnthropic(request)
      } else {
        throw new Error('هیچ سرویس AI تنظیم نشده است')
      }
      
    } catch (error) {
      console.error('Quick analysis failed:', error)
      throw error
    }
  }
}

export default AIService