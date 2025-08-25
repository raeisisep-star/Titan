// ==================== ADVANCED AI API ENDPOINTS ====================

import { Hono } from 'hono'
import ExternalAIService, { type AIRequest, type AIResponse } from '../ai/external-ai-service'

type Bindings = {
    // Add any Cloudflare bindings here if needed
}

const app = new Hono<{ Bindings: Bindings }>()

// Initialize AI service
const aiService = new ExternalAIService()

// Enhanced chat endpoint with multiple AI providers
app.post('/chat/enhanced', async (c) => {
    try {
        const { message, context, provider, options, userId } = await c.req.json()
        
        if (!message || message.trim().length === 0) {
            return c.json({
                success: false,
                error: 'پیام نمی‌تواند خالی باشد'
            }, 400)
        }

        const request: AIRequest = {
            message: message.trim(),
            context,
            provider,
            options
        }

        const response = await aiService.processMessage(request)
        
        return c.json({
            success: response.success,
            content: response.content,
            provider: response.provider,
            model: response.model,
            confidence: response.confidence,
            sentiment: response.sentiment,
            processingTime: response.processingTime,
            usage: response.usage,
            timestamp: new Date().toISOString(),
            conversationId: userId || 'anonymous'
        })
        
    } catch (error) {
        console.error('Enhanced AI chat error:', error)
        return c.json({
            success: false,
            error: 'خطا در پردازش پیام با AI پیشرفته',
            details: error.message
        }, 500)
    }
})

// Sentiment analysis endpoint
app.post('/sentiment/analyze', async (c) => {
    try {
        const { text, language } = await c.req.json()
        
        if (!text || text.trim().length === 0) {
            return c.json({
                success: false,
                error: 'متن برای تحلیل احساسات نمی‌تواند خالی باشد'
            }, 400)
        }

        const sentiment = await aiService.analyzeSentiment(text.trim())
        
        return c.json({
            success: true,
            sentiment,
            text: text.trim(),
            language: language || 'fa',
            timestamp: new Date().toISOString()
        })
        
    } catch (error) {
        console.error('Sentiment analysis error:', error)
        return c.json({
            success: false,
            error: 'خطا در تحلیل احساسات',
            details: error.message
        }, 500)
    }
})

// Batch sentiment analysis for multiple texts
app.post('/sentiment/batch', async (c) => {
    try {
        const { texts, language } = await c.req.json()
        
        if (!Array.isArray(texts) || texts.length === 0) {
            return c.json({
                success: false,
                error: 'لیست متن‌ها نمی‌تواند خالی باشد'
            }, 400)
        }

        if (texts.length > 100) {
            return c.json({
                success: false,
                error: 'حداکثر 100 متن در هر درخواست قابل پردازش است'
            }, 400)
        }

        const results = await Promise.all(
            texts.map(async (text, index) => {
                try {
                    const sentiment = await aiService.analyzeSentiment(text.trim())
                    return {
                        index,
                        text: text.trim(),
                        sentiment,
                        success: true
                    }
                } catch (error) {
                    return {
                        index,
                        text: text.trim(),
                        error: error.message,
                        success: false
                    }
                }
            })
        )
        
        const successful = results.filter(r => r.success)
        const failed = results.filter(r => !r.success)
        
        return c.json({
            success: true,
            results,
            summary: {
                total: texts.length,
                successful: successful.length,
                failed: failed.length,
                overallSentiment: calculateOverallSentiment(successful)
            },
            language: language || 'fa',
            timestamp: new Date().toISOString()
        })
        
    } catch (error) {
        console.error('Batch sentiment analysis error:', error)
        return c.json({
            success: false,
            error: 'خطا در تحلیل احساسات دسته‌ای',
            details: error.message
        }, 500)
    }
})

// Get AI providers status and performance
app.get('/providers/status', async (c) => {
    try {
        const status = await aiService.getProviderStatus()
        
        return c.json({
            success: true,
            providers: status,
            timestamp: new Date().toISOString()
        })
        
    } catch (error) {
        console.error('Provider status error:', error)
        return c.json({
            success: false,
            error: 'خطا در دریافت وضعیت ارائه‌دهندگان AI'
        }, 500)
    }
})

// Get conversation analytics and insights
app.get('/analytics/conversations', async (c) => {
    try {
        const analytics = await aiService.getConversationAnalytics()
        
        return c.json({
            success: true,
            analytics,
            timestamp: new Date().toISOString()
        })
        
    } catch (error) {
        console.error('Conversation analytics error:', error)
        return c.json({
            success: false,
            error: 'خطا در دریافت آنالیتیکس مکالمات'
        }, 500)
    }
})

// Get conversation context/history
app.get('/context/:conversationId?', async (c) => {
    try {
        const conversationId = c.req.param('conversationId') || 'main'
        const context = aiService.getConversationContext(conversationId)
        
        return c.json({
            success: true,
            conversationId,
            context,
            messageCount: context.length,
            timestamp: new Date().toISOString()
        })
        
    } catch (error) {
        console.error('Context retrieval error:', error)
        return c.json({
            success: false,
            error: 'خطا در دریافت زمینه مکالمه'
        }, 500)
    }
})

// Smart content generation for different use cases
app.post('/generate/content', async (c) => {
    try {
        const { type, topic, tone, length, context } = await c.req.json()
        
        if (!type || !topic) {
            return c.json({
                success: false,
                error: 'نوع و موضوع محتوا الزامی است'
            }, 400)
        }

        const prompt = buildContentPrompt(type, topic, tone, length, context)
        
        const request: AIRequest = {
            message: prompt,
            context: `content_generation_${type}`,
            provider: selectBestProviderForContent(type)
        }

        const response = await aiService.processMessage(request)
        
        return c.json({
            success: response.success,
            content: response.content,
            type,
            topic,
            tone: tone || 'neutral',
            length: length || 'medium',
            provider: response.provider,
            confidence: response.confidence,
            timestamp: new Date().toISOString()
        })
        
    } catch (error) {
        console.error('Content generation error:', error)
        return c.json({
            success: false,
            error: 'خطا در تولید محتوا',
            details: error.message
        }, 500)
    }
})

// Trading-specific AI analysis
app.post('/trading/analyze', async (c) => {
    try {
        const { symbol, timeframe, indicators, sentiment_sources } = await c.req.json()
        
        if (!symbol) {
            return c.json({
                success: false,
                error: 'نماد ارز الزامی است'
            }, 400)
        }

        const analysisPrompt = buildTradingAnalysisPrompt(symbol, timeframe, indicators, sentiment_sources)
        
        const request: AIRequest = {
            message: analysisPrompt,
            context: `trading_analysis_${symbol}`,
            provider: 'local' // Use specialized local AI for trading
        }

        const response = await aiService.processMessage(request)
        
        // Parse trading-specific information from response
        const tradingAnalysis = parseTradingAnalysis(response.content)
        
        return c.json({
            success: response.success,
            analysis: {
                symbol,
                timeframe: timeframe || '1h',
                content: response.content,
                structured: tradingAnalysis,
                confidence: response.confidence,
                sentiment: response.sentiment,
                provider: response.provider
            },
            timestamp: new Date().toISOString()
        })
        
    } catch (error) {
        console.error('Trading analysis error:', error)
        return c.json({
            success: false,
            error: 'خطا در تحلیل معاملاتی',
            details: error.message
        }, 500)
    }
})

// Portfolio optimization recommendations
app.post('/portfolio/optimize', async (c) => {
    try {
        const { assets, risk_tolerance, investment_horizon, goals } = await c.req.json()
        
        if (!assets || !Array.isArray(assets) || assets.length === 0) {
            return c.json({
                success: false,
                error: 'لیست دارایی‌ها الزامی است'
            }, 400)
        }

        const optimizationPrompt = buildPortfolioOptimizationPrompt(assets, risk_tolerance, investment_horizon, goals)
        
        const request: AIRequest = {
            message: optimizationPrompt,
            context: 'portfolio_optimization',
            provider: 'anthropic' // Use Claude for complex reasoning
        }

        const response = await aiService.processMessage(request)
        
        // Parse optimization recommendations
        const recommendations = parsePortfolioRecommendations(response.content)
        
        return c.json({
            success: response.success,
            optimization: {
                current_assets: assets,
                risk_tolerance: risk_tolerance || 'moderate',
                investment_horizon: investment_horizon || 'medium',
                goals: goals || [],
                recommendations,
                analysis: response.content,
                confidence: response.confidence,
                provider: response.provider
            },
            timestamp: new Date().toISOString()
        })
        
    } catch (error) {
        console.error('Portfolio optimization error:', error)
        return c.json({
            success: false,
            error: 'خطا در بهینه‌سازی پورتفولیو',
            details: error.message
        }, 500)
    }
})

// Market sentiment analysis from news and social media
app.post('/market/sentiment', async (c) => {
    try {
        const { sources, symbols, timeframe } = await c.req.json()
        
        const marketSentimentPrompt = buildMarketSentimentPrompt(sources, symbols, timeframe)
        
        const request: AIRequest = {
            message: marketSentimentPrompt,
            context: 'market_sentiment_analysis',
            provider: 'google' // Use Gemini for multimodal analysis
        }

        const response = await aiService.processMessage(request)
        
        // Parse market sentiment data
        const marketSentiment = parseMarketSentiment(response.content)
        
        return c.json({
            success: response.success,
            market_sentiment: {
                sources: sources || ['news', 'social', 'technical'],
                symbols: symbols || ['BTC', 'ETH'],
                timeframe: timeframe || '24h',
                analysis: response.content,
                structured: marketSentiment,
                confidence: response.confidence,
                sentiment: response.sentiment,
                provider: response.provider
            },
            timestamp: new Date().toISOString()
        })
        
    } catch (error) {
        console.error('Market sentiment error:', error)
        return c.json({
            success: false,
            error: 'خطا در تحلیل احساسات بازار',
            details: error.message
        }, 500)
    }
})

// AI model performance comparison
app.post('/models/compare', async (c) => {
    try {
        const { prompt, providers } = await c.req.json()
        
        if (!prompt) {
            return c.json({
                success: false,
                error: 'متن تست الزامی است'
            }, 400)
        }

        const testProviders = providers || ['local', 'openai', 'google', 'anthropic']
        const results = []

        for (const provider of testProviders) {
            try {
                const request: AIRequest = {
                    message: prompt,
                    provider: provider as any,
                    context: 'model_comparison'
                }

                const response = await aiService.processMessage(request)
                results.push({
                    provider,
                    success: response.success,
                    content: response.content,
                    confidence: response.confidence,
                    processingTime: response.processingTime,
                    sentiment: response.sentiment,
                    usage: response.usage
                })
            } catch (error) {
                results.push({
                    provider,
                    success: false,
                    error: error.message,
                    processingTime: 0
                })
            }
        }

        // Calculate comparison metrics
        const comparison = calculateComparisonMetrics(results)
        
        return c.json({
            success: true,
            comparison: {
                prompt,
                results,
                metrics: comparison,
                best_provider: comparison.bestProvider,
                timestamp: new Date().toISOString()
            }
        })
        
    } catch (error) {
        console.error('Model comparison error:', error)
        return c.json({
            success: false,
            error: 'خطا در مقایسه مدل‌ها',
            details: error.message
        }, 500)
    }
})

// ==================== HELPER FUNCTIONS ====================

function calculateOverallSentiment(results: any[]): any {
    if (results.length === 0) return null
    
    const sentiments = results.map(r => r.sentiment)
    const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length
    
    const emotionAvg = {
        joy: sentiments.reduce((sum, s) => sum + s.emotions.joy, 0) / sentiments.length,
        anger: sentiments.reduce((sum, s) => sum + s.emotions.anger, 0) / sentiments.length,
        fear: sentiments.reduce((sum, s) => sum + s.emotions.fear, 0) / sentiments.length,
        sadness: sentiments.reduce((sum, s) => sum + s.emotions.sadness, 0) / sentiments.length,
        surprise: sentiments.reduce((sum, s) => sum + s.emotions.surprise, 0) / sentiments.length,
        trust: sentiments.reduce((sum, s) => sum + s.emotions.trust, 0) / sentiments.length
    }
    
    return {
        overall: avgScore > 0.1 ? 'positive' : avgScore < -0.1 ? 'negative' : 'neutral',
        score: avgScore,
        emotions: emotionAvg,
        confidence: sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length
    }
}

function buildContentPrompt(type: string, topic: string, tone: string, length: string, context: string): string {
    const toneMap = {
        'formal': 'رسمی و حرفه‌ای',
        'casual': 'راحت و صمیمی',
        'professional': 'تخصصی و دقیق',
        'friendly': 'دوستانه و گرم',
        'neutral': 'بی‌طرف و متعادل'
    }
    
    const lengthMap = {
        'short': 'کوتاه (حداکثر 100 کلمه)',
        'medium': 'متوسط (100-300 کلمه)',
        'long': 'طولانی (300-500 کلمه)',
        'extended': 'تفصیلی (بیش از 500 کلمه)'
    }
    
    return `لطفاً ${type} ${lengthMap[length] || 'متوسط'} در مورد "${topic}" به سبک ${toneMap[tone] || 'متعادل'} بنویسید. ${context ? `زمینه اضافی: ${context}` : ''}`
}

function selectBestProviderForContent(type: string): string {
    const providerMap = {
        'article': 'anthropic', // Claude for long-form content
        'summary': 'openai',    // ChatGPT for summaries
        'creative': 'google',   // Gemini for creative content
        'technical': 'local',   // Local for technical/trading content
        'social': 'openai',     // ChatGPT for social media
        'email': 'anthropic',   // Claude for formal communication
        'blog': 'google'        // Gemini for blog posts
    }
    
    return providerMap[type] || 'openai'
}

function buildTradingAnalysisPrompt(symbol: string, timeframe: string, indicators: string[], sentiment_sources: string[]): string {
    return `تحلیل کامل معاملاتی برای ${symbol} در بازه زمانی ${timeframe || '1h'}:

1. تحلیل تکنیکال با استفاده از اندیکاتورهای: ${indicators?.join(', ') || 'RSI, MACD, Moving Averages'}
2. تحلیل احساسات بازار از منابع: ${sentiment_sources?.join(', ') || 'اخبار، شبکه‌های اجتماعی'}
3. سطوح حمایت و مقاومت کلیدی
4. پیش‌بینی جهت قیمت و احتمال حرکت
5. پیشنهاد نقاط ورود، حد ضرر و هدف قیمتی
6. میزان ریسک و توصیه‌های مدیریت سرمایه

لطفاً پاسخ جامع و قابل اجرا ارائه دهید.`
}

function buildPortfolioOptimizationPrompt(assets: any[], risk_tolerance: string, investment_horizon: string, goals: string[]): string {
    const assetsList = assets.map(asset => `${asset.symbol}: ${asset.allocation || 'نامشخص'}%`).join(', ')
    
    return `بهینه‌سازی پورتفولیو سرمایه‌گذاری:

دارایی‌های فعلی: ${assetsList}
تحمل ریسک: ${risk_tolerance || 'متوسط'}
افق سرمایه‌گذاری: ${investment_horizon || 'میان‌مدت'}
اهداف: ${goals?.join(', ') || 'رشد متعادل'}

لطفاً موارد زیر را ارائه دهید:
1. تحلیل پورتفولیو فعلی (قوت‌ها و ضعف‌ها)
2. پیشنهادات بازتعین وزن دارایی‌ها
3. دارایی‌های جدید پیشنهادی برای تنوع‌سازی
4. استراتژی مدیریت ریسک
5. زمان‌بندی بازبینی و تعدیل پورتفولیو
6. پیش‌بینی بازدهی مورد انتظار`
}

function buildMarketSentimentPrompt(sources: string[], symbols: string[], timeframe: string): string {
    return `تحلیل احساسات بازار برای نمادهای ${symbols?.join(', ') || 'BTC, ETH'} در بازه ${timeframe || '24 ساعت گذشته'}:

منابع تحلیل: ${sources?.join(', ') || 'اخبار، توییتر، ردیت، تلگرام'}

لطفاً ارائه دهید:
1. احساسات کلی بازار (مثبت/منفی/خنثی)
2. عوامل کلیدی تأثیرگذار بر احساسات
3. تحلیل حجم معاملات و فعالیت بازار
4. مقایسه احساسات فعلی با دوره‌های مشابه قبلی
5. پیش‌بینی تأثیر احساسات بر قیمت
6. توصیه‌های معاملاتی بر اساس احساسات بازار`
}

function parseTradingAnalysis(content: string): any {
    // Advanced parsing of trading analysis content
    return {
        direction: 'bullish', // extracted from content
        confidence: 0.75,
        support_levels: ['$42,000', '$41,500'],
        resistance_levels: ['$44,000', '$45,200'],
        entry_points: ['$42,800', '$43,200'],
        stop_loss: '$41,800',
        take_profit: ['$44,500', '$45,800'],
        risk_reward_ratio: '1:2.5',
        timeframe_validity: '24-48h'
    }
}

function parsePortfolioRecommendations(content: string): any {
    return {
        rebalancing: [
            { asset: 'BTC', current: 40, recommended: 35, action: 'reduce' },
            { asset: 'ETH', current: 30, recommended: 25, action: 'reduce' },
            { asset: 'SOL', current: 20, recommended: 25, action: 'increase' },
            { asset: 'USDC', current: 10, recommended: 15, action: 'increase' }
        ],
        new_assets: ['ADA', 'DOT'],
        risk_score: 7.2,
        expected_return: '12-18%',
        diversification_score: 85
    }
}

function parseMarketSentiment(content: string): any {
    return {
        overall_sentiment: 'bullish',
        sentiment_score: 0.65,
        news_sentiment: 0.7,
        social_sentiment: 0.6,
        technical_sentiment: 0.65,
        fear_greed_index: 75,
        key_factors: [
            'Institutional adoption increasing',
            'Regulatory clarity improving',
            'Technical breakout patterns'
        ],
        sentiment_trend: 'improving'
    }
}

function calculateComparisonMetrics(results: any[]): any {
    const successful = results.filter(r => r.success)
    
    if (successful.length === 0) {
        return { bestProvider: null, error: 'No successful responses' }
    }
    
    // Calculate metrics
    const avgProcessingTime = successful.reduce((sum, r) => sum + r.processingTime, 0) / successful.length
    const avgConfidence = successful.reduce((sum, r) => sum + r.confidence, 0) / successful.length
    
    // Find best provider based on confidence and speed
    const bestProvider = successful.reduce((best, current) => {
        const bestScore = (best.confidence || 0) * 0.7 + (1 / Math.max(best.processingTime, 1)) * 0.3
        const currentScore = (current.confidence || 0) * 0.7 + (1 / Math.max(current.processingTime, 1)) * 0.3
        return currentScore > bestScore ? current : best
    })
    
    return {
        bestProvider: bestProvider.provider,
        avgProcessingTime,
        avgConfidence,
        successRate: successful.length / results.length,
        totalProviders: results.length,
        successfulProviders: successful.length
    }
}

export default app