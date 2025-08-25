// TITAN AI API Endpoints
// آرتمیس AI - تحلیل‌گر بازار و پیش‌بین قیمت

import { Hono } from 'hono'
import { AIService } from '../services/ai-service'
import type { Env } from '../types/cloudflare'

const app = new Hono<{ Bindings: Env }>()

// Test AI services connectivity
app.get('/test', async (c) => {
  try {
    const aiService = new AIService(c.env)
    const testResults = await aiService.testAIServices()
    
    return c.json({
      success: true,
      services: testResults,
      message: 'AI services test completed'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to test AI services'
    }, 500)
  }
})

// Get market data for a symbol
app.get('/market/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol')
    const days = parseInt(c.req.query('days') || '7')
    
    if (!symbol) {
      return c.json({
        success: false,
        message: 'Symbol is required'
      }, 400)
    }
    
    const aiService = new AIService(c.env)
    const marketData = await aiService.getMarketData(symbol, days)
    
    return c.json({
      success: true,
      data: marketData,
      message: `Market data retrieved for ${symbol}`
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to retrieve market data'
    }, 500)
  }
})

// Quick analysis for a symbol
app.get('/analysis/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol')
    const type = c.req.query('type') || 'market_analysis'
    
    if (!symbol) {
      return c.json({
        success: false,
        message: 'Symbol is required'
      }, 400)
    }
    
    const aiService = new AIService(c.env)
    const analysis = await aiService.quickAnalysis(symbol, type)
    
    return c.json({
      success: true,
      data: analysis,
      message: `AI analysis completed for ${symbol}`
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'AI analysis failed'
    }, 500)
  }
})

// Custom analysis with detailed parameters
app.post('/analyze', async (c) => {
  try {
    const request = await c.req.json()
    
    if (!request.type || !request.data) {
      return c.json({
        success: false,
        message: 'Analysis type and data are required'
      }, 400)
    }
    
    const aiService = new AIService(c.env)
    let analysis
    
    // Choose AI provider based on availability or preference
    const provider = request.provider || 'auto'
    
    switch (provider) {
      case 'openai':
        analysis = await aiService.analyzeWithOpenAI(request)
        break
      case 'anthropic':
        analysis = await aiService.analyzeWithAnthropic(request)
        break
      case 'auto':
      default:
        // Try OpenAI first, fallback to Anthropic
        try {
          analysis = await aiService.analyzeWithOpenAI(request)
        } catch (openaiError) {
          console.log('OpenAI failed, trying Anthropic:', openaiError.message)
          analysis = await aiService.analyzeWithAnthropic(request)
        }
        break
    }
    
    return c.json({
      success: true,
      data: analysis,
      message: 'AI analysis completed successfully'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'AI analysis failed'
    }, 500)
  }
})

// Get multiple market analyses
app.post('/bulk-analysis', async (c) => {
  try {
    const { symbols, type } = await c.req.json()
    
    if (!symbols || !Array.isArray(symbols)) {
      return c.json({
        success: false,
        message: 'Symbols array is required'
      }, 400)
    }
    
    const aiService = new AIService(c.env)
    const analyses = []
    
    // Process symbols in parallel (limit to 5 to avoid rate limits)
    const batchSize = 5
    for (let i = 0; i < symbols.length; i += batchSize) {
      const batch = symbols.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (symbol: string) => {
        try {
          const analysis = await aiService.quickAnalysis(symbol, type || 'market_analysis')
          return {
            symbol,
            success: true,
            analysis
          }
        } catch (error) {
          return {
            symbol,
            success: false,
            error: error.message
          }
        }
      })
      
      const batchResults = await Promise.all(batchPromises)
      analyses.push(...batchResults)
      
      // Add delay between batches to respect rate limits
      if (i + batchSize < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
    
    const successful = analyses.filter(a => a.success).length
    const failed = analyses.filter(a => !a.success).length
    
    return c.json({
      success: true,
      data: {
        analyses,
        summary: {
          total: symbols.length,
          successful,
          failed
        }
      },
      message: `Bulk analysis completed: ${successful}/${symbols.length} successful`
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Bulk analysis failed'
    }, 500)
  }
})

// Artemis AI Chat Interface
app.post('/chat', async (c) => {
  try {
    const { message, context, history } = await c.req.json()
    
    if (!message) {
      return c.json({
        success: false,
        message: 'Message is required'
      }, 400)
    }
    
    const aiService = new AIService(c.env)
    
    // Build analysis request based on chat message
    let analysisRequest = {
      type: 'market_analysis' as const,
      data: {},
      context: `سوال کاربر: ${message}`
    }
    
    // Detect if user is asking about specific symbol
    const symbolMatch = message.match(/\b(BTC|ETH|BNB|ADA|SOL|XRP|DOT|DOGE|AVAX|MATIC|LINK|UNI|LTC|ALGO|VET|ICP|FTM|ATOM|NEAR|MANA)\b/i)
    if (symbolMatch) {
      const symbol = symbolMatch[1].toUpperCase()
      try {
        const marketData = await aiService.getMarketData(symbol)
        analysisRequest.data = {
          symbol,
          price_data: marketData.price_history.slice(-24), // Last 24 hours
          market_sentiment: marketData.change_24h > 0 ? 'مثبت' : 'منفی'
        }
        analysisRequest.context += `\nداده‌های بازار ${symbol}: قیمت فعلی $${marketData.price}, تغییر 24 ساعته: ${marketData.change_24h.toFixed(2)}%`
      } catch (error) {
        console.log('Could not fetch market data for chat, continuing without it')
      }
    }
    
    // Add chat history context if provided
    if (history && Array.isArray(history) && history.length > 0) {
      const recentHistory = history.slice(-3) // Last 3 messages
      analysisRequest.context += `\n\nتاریخچه مکالمه:\n${recentHistory.map((h: any) => `${h.role}: ${h.content}`).join('\n')}`
    }
    
    let response
    try {
      response = await aiService.analyzeWithOpenAI(analysisRequest)
    } catch (error) {
      console.log('OpenAI chat failed, trying Anthropic')
      response = await aiService.analyzeWithAnthropic(analysisRequest)
    }
    
    return c.json({
      success: true,
      data: {
        message: response.analysis.summary,
        confidence: response.analysis.confidence,
        recommendations: response.analysis.recommendations,
        signals: response.analysis.signals,
        metadata: response.metadata
      },
      message: 'آرتمیس پاسخ داد'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'خطا در پاسخ آرتمیس'
    }, 500)
  }
})

// Portfolio optimization
app.post('/portfolio/optimize', async (c) => {
  try {
    const { portfolio, target_allocation, risk_tolerance } = await c.req.json()
    
    if (!portfolio || !Array.isArray(portfolio)) {
      return c.json({
        success: false,
        message: 'Portfolio data is required'
      }, 400)
    }
    
    const aiService = new AIService(c.env)
    
    const analysisRequest = {
      type: 'portfolio_optimization' as const,
      data: {
        portfolio_data: portfolio,
        target_allocation,
        risk_tolerance
      },
      context: `بهینه‌سازی پورتفولیو با ${portfolio.length} دارایی و تحمل ریسک ${risk_tolerance || 'متوسط'}`
    }
    
    let optimization
    try {
      optimization = await aiService.analyzeWithOpenAI(analysisRequest)
    } catch (error) {
      optimization = await aiService.analyzeWithAnthropic(analysisRequest)
    }
    
    return c.json({
      success: true,
      data: optimization,
      message: 'Portfolio optimization completed'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Portfolio optimization failed'
    }, 500)
  }
})

// Risk assessment
app.post('/risk/assess', async (c) => {
  try {
    const { positions, market_conditions, timeframe } = await c.req.json()
    
    const aiService = new AIService(c.env)
    
    const analysisRequest = {
      type: 'risk_assessment' as const,
      data: {
        portfolio_data: positions,
        market_sentiment: market_conditions,
        timeframe
      },
      context: `ارزیابی ریسک برای ${timeframe || 'کوتاه‌مدت'} در شرایط بازار ${market_conditions || 'عادی'}`
    }
    
    let assessment
    try {
      assessment = await aiService.analyzeWithOpenAI(analysisRequest)
    } catch (error) {
      assessment = await aiService.analyzeWithAnthropic(analysisRequest)
    }
    
    return c.json({
      success: true,
      data: assessment,
      message: 'Risk assessment completed'
    })
    
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Risk assessment failed'
    }, 500)
  }
})

export default app