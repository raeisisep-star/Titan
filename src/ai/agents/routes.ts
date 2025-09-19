import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'
import { AgentManager } from './specialized-agents'
import { AIService } from '../../services/ai-service'

export const agentRoutes = new Hono<{ Bindings: Env }>()

const agentManager = AgentManager.getInstance()

// Get all AI agents
agentRoutes.get('/list', async (c) => {
  try {
    const agents = agentManager.getAllAgents()
    const stats = agentManager.getSystemStats()
    
    return c.json({
      success: true,
      data: {
        agents,
        statistics: stats
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت لیست عامل‌ها' }, 500)
  }
})

// Get active agents only
agentRoutes.get('/active', async (c) => {
  try {
    const activeAgents = agentManager.getActiveAgents()
    
    return c.json({
      success: true,
      data: {
        active_agents: activeAgents,
        count: activeAgents.length,
        average_accuracy: activeAgents.reduce((sum, agent) => sum + agent.accuracy, 0) / activeAgents.length
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت عامل‌های فعال' }, 500)
  }
})

// Get specific agent details
agentRoutes.get('/:id', async (c) => {
  try {
    const agentId = parseInt(c.req.param('id'))
    const agent = agentManager.getAgent(agentId)
    
    if (!agent) {
      return c.json({ success: false, message: 'عامل مورد نظر یافت نشد' }, 404)
    }
    
    return c.json({
      success: true,
      data: agent
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت اطلاعات عامل' }, 500)
  }
})

// Update agent status
agentRoutes.patch('/:id/status', async (c) => {
  try {
    const agentId = parseInt(c.req.param('id'))
    const { status } = await c.req.json()
    
    if (!['active', 'inactive', 'training', 'error'].includes(status)) {
      return c.json({ success: false, message: 'وضعیت نامعتبر' }, 400)
    }
    
    const success = agentManager.updateAgentStatus(agentId, status)
    
    if (!success) {
      return c.json({ success: false, message: 'عامل مورد نظر یافت نشد' }, 404)
    }
    
    return c.json({
      success: true,
      message: `وضعیت عامل ${agentId} به ${status} تغییر کرد`
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در به‌روزرسانی وضعیت عامل' }, 500)
  }
})

// Get system performance overview
agentRoutes.get('/performance/overview', async (c) => {
  try {
    const stats = agentManager.getSystemStats()
    
    return c.json({
      success: true,
      data: {
        overview: stats,
        performance_breakdown: {
          technical_analysis: 91.2,
          fundamental_analysis: 84.6,
          risk_management: 95.8,
          news_analysis: 82.7,
          sentiment_analysis: 79.4,
          arbitrage_detection: 94.3
        },
        improvement_areas: [
          'بهبود تحلیل احساسات شبکه‌های اجتماعی',
          'افزایش دقت پیش‌بینی رویدادهای اقتصادی',
          'بهینه‌سازی الگوریتم‌های معاملات کوتاه‌مدت'
        ]
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت عملکرد سیستم' }, 500)
  }
})

// Real AI Analysis Endpoints
agentRoutes.post('/analyze', async (c) => {
  try {
    const { prompt, type = 'general' } = await c.req.json()
    const aiService = new AIService(c.env)
    
    let response
    switch (type) {
      case 'openai':
        response = await aiService.callOpenAI(prompt)
        break
      case 'gemini': 
        response = await aiService.callGemini(prompt)
        break
      case 'claude':
        response = await aiService.callClaude(prompt)
        break
      case 'consensus':
        response = await aiService.getConsensusResponse(prompt)
        break
      default:
        response = await aiService.getConsensusResponse(prompt)
    }
    
    return c.json({
      success: true,
      data: {
        analysis: response.text,
        confidence: response.confidence,
        source: response.source,
        usage: response.usage,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('AI Analysis error:', error)
    return c.json({ success: false, message: 'خطا در تحلیل AI' }, 500)
  }
})

// Price Prediction with AI
agentRoutes.post('/predict', async (c) => {
  try {
    const { asset, timeframe, data, context } = await c.req.json()
    const aiService = new AIService(c.env)
    
    const prediction = await aiService.analyzePriceData({
      asset,
      timeframe,
      data,
      context
    })
    
    return c.json({
      success: true,
      data: prediction
    })
  } catch (error) {
    console.error('Price prediction error:', error)
    return c.json({ success: false, message: 'خطا در پیش‌بینی قیمت' }, 500)
  }
})

// News Sentiment Analysis
agentRoutes.post('/sentiment', async (c) => {
  try {
    const { text } = await c.req.json()
    const aiService = new AIService(c.env)
    
    const sentiment = await aiService.analyzeNewsSentiment(text)
    
    return c.json({
      success: true,
      data: sentiment
    })
  } catch (error) {
    console.error('Sentiment analysis error:', error)
    return c.json({ success: false, message: 'خطا در تحلیل احساسات' }, 500)
  }
})

// AI Chat Assistant
agentRoutes.post('/chat', async (c) => {
  try {
    const { message, context } = await c.req.json()
    const aiService = new AIService(c.env)
    
    const response = await aiService.getChatResponse(message, context)
    
    return c.json({
      success: true,
      data: {
        response,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    console.error('AI Chat error:', error)
    return c.json({ success: false, message: 'خطا در چت با AI' }, 500)
  }
})

export default agentRoutes