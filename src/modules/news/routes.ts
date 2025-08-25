import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'
import { NewsAnalysisSystem } from './news-analysis'
import AIService from '../../services/ai-service'

export const newsRoutes = new Hono<{ Bindings: Env }>()

const newsSystem = NewsAnalysisSystem.getInstance()

// Get latest news
newsRoutes.get('/latest', async (c) => {
  try {
    const recentNews = newsSystem.getRecentNews(24)
    
    return c.json({
      success: true,
      data: recentNews.map(news => ({
        id: news.id,
        title: news.title,
        summary: news.summary,
        source: news.source,
        published_at: news.published_at,
        relevance_score: news.relevance_score,
        impact_score: news.impact_score,
        market_impact: news.market_impact,
        affected_assets: news.affected_assets,
        categories: news.categories,
        verified: news.verified,
        ai_analysis: {
          sentiment: news.ai_analysis.sentiment,
          confidence: news.ai_analysis.confidence,
          prediction: news.ai_analysis.prediction
        }
      }))
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت اخبار' }, 500)
  }
})

// Get high impact news
newsRoutes.get('/high-impact', async (c) => {
  try {
    const highImpactNews = newsSystem.getHighImpactNews()
    
    return c.json({
      success: true,
      data: {
        news: highImpactNews,
        count: highImpactNews.length,
        analysis: {
          average_impact: highImpactNews.reduce((sum, n) => sum + n.impact_score, 0) / highImpactNews.length,
          most_relevant: highImpactNews[0] || null
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت اخبار پرتأثیر' }, 500)
  }
})

// Get market sentiment
newsRoutes.get('/sentiment', async (c) => {
  try {
    const sentiment = newsSystem.getMarketSentiment()
    const impactAnalysis = newsSystem.getNewsImpactAnalysis()
    
    return c.json({
      success: true,
      data: {
        market_sentiment: sentiment,
        news_analysis: impactAnalysis,
        interpretation: {
          sentiment_level: sentiment.overall_sentiment,
          market_mood: getSentimentDescription(sentiment.overall_sentiment),
          fear_greed_description: getFearGreedDescription(sentiment.fear_greed_index),
          recommendation: getTradingRecommendation(sentiment.fear_greed_index)
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت احساسات بازار' }, 500)
  }
})

// Get economic calendar
newsRoutes.get('/economic-calendar', async (c) => {
  try {
    const upcomingEvents = newsSystem.getUpcomingEvents()
    
    return c.json({
      success: true,
      data: {
        upcoming_events: upcomingEvents,
        important_events: upcomingEvents.filter(e => e.importance === 'high'),
        next_major_event: upcomingEvents.find(e => e.importance === 'high') ?? null,
        calendar_summary: {
          total_events: upcomingEvents.length,
          high_impact: upcomingEvents.filter(e => e.importance === 'high').length,
          medium_impact: upcomingEvents.filter(e => e.importance === 'medium').length,
          low_impact: upcomingEvents.filter(e => e.importance === 'low').length
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت تقویم اقتصادی' }, 500)
  }
})

// Get news by category
newsRoutes.get('/category/:category', async (c) => {
  try {
    const category = c.req.param('category')
    const categoryNews = newsSystem.getNewsByCategory(category)
    
    return c.json({
      success: true,
      data: {
        category,
        news: categoryNews,
        count: categoryNews.length
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت اخبار دسته‌بندی شده' }, 500)
  }
})

// Analyze external news
newsRoutes.post('/analyze', async (c) => {
  try {
    const { title, content, source } = await c.req.json()
    
    if (!title || !content || !source) {
      return c.json({ success: false, message: 'اطلاعات خبر ناقص است' }, 400)
    }
    
    const analyzedNews = newsSystem.analyzeNews(title, content, source)
    
    return c.json({
      success: true,
      message: 'خبر تحلیل و در سیستم ثبت شد',
      data: {
        news_id: analyzedNews.id,
        analysis_results: {
          relevance_score: analyzedNews.relevance_score,
          impact_score: analyzedNews.impact_score,
          credibility_score: analyzedNews.credibility_score,
          market_impact: analyzedNews.market_impact,
          ai_analysis: analyzedNews.ai_analysis
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در تحلیل خبر' }, 500)
  }
})

// Get news analysis dashboard
newsRoutes.get('/dashboard', async (c) => {
  try {
    const recentNews = newsSystem.getRecentNews(24)
    const sentiment = newsSystem.getMarketSentiment()
    const upcomingEvents = newsSystem.getUpcomingEvents().slice(0, 5)
    const impactAnalysis = newsSystem.getNewsImpactAnalysis()
    
    return c.json({
      success: true,
      data: {
        summary: {
          total_news_24h: recentNews.length,
          positive_news: recentNews.filter(n => n.market_impact === 'positive').length,
          negative_news: recentNews.filter(n => n.market_impact === 'negative').length,
          verified_news: recentNews.filter(n => n.verified).length,
          avg_credibility: recentNews.reduce((sum, n) => sum + n.credibility_score, 0) / recentNews.length
        },
        market_sentiment: sentiment,
        impact_analysis: impactAnalysis,
        top_news: recentNews.slice(0, 5),
        upcoming_events: upcomingEvents,
        categories: getNewsCategories(recentNews)
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت داشبورد اخبار' }, 500)
  }
})

// Helper functions
function getSentimentDescription(sentiment: string): string {
  const descriptions = {
    'extreme_fear': 'ترس شدید - فرصت خرید احتمالی',
    'fear': 'ترس - بازار منفی',
    'neutral': 'خنثی - عدم اطمینان بازار',
    'greed': 'طمع - بازار مثبت',
    'extreme_greed': 'طمع شدید - احتیاط در خرید'
  };
  return descriptions[sentiment as keyof typeof descriptions] || 'نامشخص';
}

function getFearGreedDescription(index: number): string {
  if (index >= 80) return 'طمع شدید';
  if (index >= 60) return 'طمع';
  if (index >= 40) return 'خنثی';
  if (index >= 20) return 'ترس';
  return 'ترس شدید';
}

function getTradingRecommendation(index: number): string {
  if (index >= 80) return 'احتیاط در خرید - احتمال اصلاح قیمت';
  if (index >= 60) return 'شرایط مثبت برای نگهداری';
  if (index >= 40) return 'انتظار و نظارت بر بازار';
  if (index >= 20) return 'فرصت خرید تدریجی';
  return 'فرصت خرید قوی - ترس بیش از حد';
}

function getNewsCategories(news: any[]): { [key: string]: number } {
  const categories: { [key: string]: number } = {};
  
  news.forEach(item => {
    item.categories.forEach((cat: string) => {
      categories[cat] = (categories[cat] || 0) + 1;
    });
  });
  
  return categories;
}

// AI News Analysis
newsRoutes.post('/ai-analyze', async (c) => {
  try {
    const { text, title } = await c.req.json()
    
    if (!text || !title) {
      return c.json({ success: false, message: 'متن و عنوان خبر الزامی است' }, 400)
    }
    
    try {
      const aiService = new AIService(c.env)
      const sentiment = await aiService.analyzeNewsSentiment(text)
      
      // Store in news system
      const newsItem = newsSystem.addNews({
        title: title || 'خبر تحلیل شده',
        content: text,
        source: 'AI Analysis',
        category: 'market'
      })
      
      return c.json({
        success: true,
        data: {
          news_id: newsItem.id,
          sentiment: sentiment.sentiment,
          confidence: sentiment.confidence,
          impact: sentiment.impact,
          summary: sentiment.summary,
          market_effect: sentiment.impact > 7 ? 'high' : sentiment.impact > 4 ? 'medium' : 'low',
          timestamp: new Date().toISOString()
        }
      })
    } catch (aiError) {
      console.error('AI Service error:', aiError)
      
      // Fallback analysis when AI service fails
      const mockSentiment = {
        sentiment: 'positive',
        confidence: 70,
        impact: 6,
        summary: 'تحلیل پایه: خبر مثبت با تأثیر متوسط بر بازار'
      }
      
      const newsItem = newsSystem.addNews({
        title: title || 'خبر تحلیل شده',
        content: text,
        source: 'AI Analysis (Fallback)',
        category: 'market'
      })
      
      return c.json({
        success: true,
        data: {
          news_id: newsItem.id,
          sentiment: mockSentiment.sentiment,
          confidence: mockSentiment.confidence,
          impact: mockSentiment.impact,
          summary: mockSentiment.summary,
          market_effect: mockSentiment.impact > 7 ? 'high' : mockSentiment.impact > 4 ? 'medium' : 'low',
          timestamp: new Date().toISOString(),
          fallback: true
        }
      })
    }
  } catch (error) {
    console.error('AI News Analysis endpoint error:', error)
    return c.json({ success: false, message: 'خطا در تحلیل خبر با AI' }, 500)
  }
})

export default newsRoutes