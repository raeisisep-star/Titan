import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'
import AIService from '../../services/ai-service'

export const chatRoutes = new Hono<{ Bindings: Env }>()

chatRoutes.post('/message', async (c) => {
  try {
    const { message, context } = await c.req.json()
    const aiService = new AIService(c.env)
    
    // Check if it's a trading command
    if (message.includes('خرید') || message.includes('فروش') || message.includes('معامله')) {
      const tradingResponse = await aiService.getChatResponse(
        message, 
        `شما آرتمیس هستید، دستیار معاملاتی. کاربر درخواست معامله دارد: ${message}. پاسخ مناسب ارائه دهید و اگر امکان اجرا دارد، مراحل را توضیح دهید.`
      )
      
      return c.json({
        success: true,
        response: tradingResponse,
        type: 'trading',
        timestamp: new Date().toISOString()
      })
    }
    
    // General chat response
    const response = await aiService.getChatResponse(
      message,
      `کاربر در سیستم معاملاتی تایتان با شما چت می‌کند. ${context || ''}`
    )
    
    return c.json({
      success: true,
      response: response,
      type: 'general',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Chat error:', error)
    return c.json({
      success: true,
      response: `آرتمیس: متأسفم، در حال حاضر مشکل فنی دارم. درخواست شما "${message}" ثبت شد و بعداً پاسخ خواهم داد.`,
      type: 'error'
    })
  }
})

export default chatRoutes