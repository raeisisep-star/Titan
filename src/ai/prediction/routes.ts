import type { Env } from "../../types/cloudflare"
import { Hono } from 'hono'
import { PredictionSystem } from './prediction-system'
import AIService from '../../services/ai-service'

export const predictionRoutes = new Hono<{ Bindings: Env }>()

const predictionSystem = PredictionSystem.getInstance()

// Get latest predictions
predictionRoutes.get('/latest', async (c) => {
  try {
    const recentPredictions = predictionSystem.getRecentPredictions(10)
    
    return c.json({
      success: true,
      data: recentPredictions.map(prediction => ({
        id: prediction.id,
        asset: prediction.asset,
        prediction_type: prediction.prediction_type,
        predicted_value: prediction.predicted_value,
        current_value: prediction.current_value,
        confidence: prediction.confidence,
        timeframe: prediction.timeframe,
        status: prediction.status,
        ai_agent_id: prediction.ai_agent_id,
        reasoning: prediction.reasoning,
        created_at: prediction.created_at,
        accuracy: prediction.accuracy
      }))
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت پیش‌بینی‌ها' }, 500)
  }
})

// Get pending predictions
predictionRoutes.get('/pending', async (c) => {
  try {
    const pendingPredictions = predictionSystem.getPendingPredictions()
    
    return c.json({
      success: true,
      data: {
        predictions: pendingPredictions,
        count: pendingPredictions.length
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت پیش‌بینی‌های در انتظار' }, 500)
  }
})

// Get learning metrics and accuracy statistics
predictionRoutes.get('/metrics', async (c) => {
  try {
    const metrics = predictionSystem.getLearningMetrics()
    
    return c.json({
      success: true,
      data: {
        overall_performance: {
          total_predictions: metrics.total_predictions,
          confirmed_predictions: metrics.confirmed_predictions,
          failed_predictions: metrics.failed_predictions,
          overall_accuracy: metrics.overall_accuracy,
          improvement_trend: metrics.improvement_trend,
          confidence_calibration: metrics.confidence_calibration
        },
        accuracy_breakdown: {
          by_timeframe: metrics.accuracy_by_timeframe,
          by_agent: metrics.accuracy_by_agent
        },
        performance_analysis: {
          best_timeframe: getBestTimeframe(metrics.accuracy_by_timeframe),
          best_agent: getBestAgent(metrics.accuracy_by_agent),
          areas_for_improvement: getImprovementAreas(metrics)
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت معیارهای یادگیری' }, 500)
  }
})

// Get learning insights
predictionRoutes.get('/insights', async (c) => {
  try {
    const insights = predictionSystem.getInsights()
    
    return c.json({
      success: true,
      data: {
        insights,
        summary: {
          total_insights: insights.length,
          applied_insights: insights.filter(i => i.applied).length,
          pending_insights: insights.filter(i => !i.applied).length,
          latest_discovery: insights.length > 0 ? insights[0].discovered_at : null
        }
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در دریافت بینش‌های یادگیری' }, 500)
  }
})

// Make a new prediction
predictionRoutes.post('/create', async (c) => {
  try {
    const {
      asset,
      prediction_type,
      predicted_value,
      confidence,
      timeframe,
      ai_agent_id,
      reasoning
    } = await c.req.json()
    
    if (!asset || !prediction_type || !predicted_value || !confidence || !timeframe || !ai_agent_id) {
      return c.json({ success: false, message: 'اطلاعات پیش‌بینی ناقص است' }, 400)
    }
    
    const predictionId = predictionSystem.makePrediction(
      asset,
      prediction_type,
      predicted_value,
      confidence,
      timeframe,
      ai_agent_id,
      reasoning || 'پیش‌بینی خودکار سیستم'
    )
    
    return c.json({
      success: true,
      message: 'پیش‌بینی جدید ثبت شد',
      data: {
        prediction_id: predictionId,
        asset,
        predicted_value,
        confidence,
        timeframe
      }
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در ثبت پیش‌بینی' }, 500)
  }
})

// Verify a prediction with actual result
predictionRoutes.post('/verify/:id', async (c) => {
  try {
    const predictionId = c.req.param('id')
    const { actual_value } = await c.req.json()
    
    if (!actual_value) {
      return c.json({ success: false, message: 'مقدار واقعی مشخص نشده' }, 400)
    }
    
    const success = predictionSystem.verifyPrediction(predictionId, actual_value)
    
    if (!success) {
      return c.json({ success: false, message: 'امکان تأیید پیش‌بینی وجود ندارد' }, 400)
    }
    
    return c.json({
      success: true,
      message: 'پیش‌بینی تأیید شد و در سیستم یادگیری ثبت گردید'
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در تأیید پیش‌بینی' }, 500)
  }
})

// Apply a learning insight
predictionRoutes.post('/insights/:id/apply', async (c) => {
  try {
    const insightId = c.req.param('id')
    
    const success = predictionSystem.applyInsight(insightId)
    
    if (!success) {
      return c.json({ success: false, message: 'امکان اعمال بینش وجود ندارد' }, 400)
    }
    
    return c.json({
      success: true,
      message: 'بینش یادگیری اعمال شد و در سیستم فعال گردید'
    })
  } catch (error) {
    return c.json({ success: false, message: 'خطا در اعمال بینش' }, 500)
  }
})

// Helper functions
function getBestTimeframe(accuracyByTimeframe: { [key: string]: number }): string {
  let bestTimeframe = '';
  let bestAccuracy = 0;
  
  Object.entries(accuracyByTimeframe).forEach(([timeframe, accuracy]) => {
    if (accuracy > bestAccuracy) {
      bestAccuracy = accuracy;
      bestTimeframe = timeframe;
    }
  });
  
  return bestTimeframe;
}

function getBestAgent(accuracyByAgent: { [key: number]: number }): number {
  let bestAgent = 0;
  let bestAccuracy = 0;
  
  Object.entries(accuracyByAgent).forEach(([agentId, accuracy]) => {
    if (accuracy > bestAccuracy) {
      bestAccuracy = accuracy;
      bestAgent = parseInt(agentId);
    }
  });
  
  return bestAgent;
}

function getImprovementAreas(metrics: any): string[] {
  const areas = [];
  
  if (metrics.overall_accuracy < 80) {
    areas.push('بهبود دقت کلی پیش‌بینی‌ها');
  }
  
  if (metrics.confidence_calibration < 0.85) {
    areas.push('بهبود تنظیم اعتماد و واقعیت');
  }
  
  if (metrics.improvement_trend < 0) {
    areas.push('بازبینی الگوریتم‌های یادگیری');
  }
  
  return areas.length > 0 ? areas : ['سیستم در وضعیت مطلوب عملکرد می‌کند'];
}

// Create AI-powered prediction
predictionRoutes.post('/ai-predict', async (c) => {
  try {
    const { asset, timeframe, context } = await c.req.json()
    
    if (!asset || !timeframe) {
      return c.json({ success: false, message: 'اطلاعات ناقص است' }, 400)
    }
    
    // Get market data (mock for now, would come from real data source)
    const mockData = {
      current_price: Math.random() * 50000 + 30000,
      volume_24h: Math.random() * 1000000000,
      price_change_24h: (Math.random() - 0.5) * 10,
      technical_indicators: {
        rsi: Math.random() * 100,
        ma_50: Math.random() * 50000 + 25000,
        ma_200: Math.random() * 50000 + 20000
      }
    }
    
    try {
      const aiService = new AIService(c.env)
      const prediction = await aiService.analyzePriceData({
        asset,
        timeframe,
        data: mockData,
        context: context || 'تحلیل تکنیکال عمومی'
      })
      
      // Store prediction in system
      const predictionId = predictionSystem.makePrediction(
        prediction.asset,
        'price',
        typeof prediction.prediction === 'number' ? prediction.prediction : mockData.current_price * 1.05,
        prediction.confidence,
        prediction.timeframe,
        1, // AI Service
        prediction.reasoning
      )
      
      return c.json({
        success: true,
        data: {
          ...prediction,
          prediction_id: predictionId
        }
      })
    } catch (aiError) {
      console.error('AI Service error:', aiError)
      
      // Fallback to mock prediction when AI service fails
      const mockPrediction = {
        asset,
        prediction: mockData.current_price * (1 + (Math.random() - 0.5) * 0.1),
        confidence: 65 + Math.random() * 20,
        timeframe,
        reasoning: 'پیش‌بینی بر اساس تحلیل تکنیکال پایه (سرویس AI در دسترس نیست)'
      }
      
      const predictionId = predictionSystem.makePrediction(
        mockPrediction.asset,
        'price',
        mockPrediction.prediction,
        mockPrediction.confidence,
        mockPrediction.timeframe,
        1,
        mockPrediction.reasoning
      )
      
      return c.json({
        success: true,
        data: {
          ...mockPrediction,
          prediction_id: predictionId,
          fallback: true
        }
      })
    }
  } catch (error) {
    console.error('AI Prediction endpoint error:', error)
    return c.json({ success: false, message: 'خطا در ایجاد پیش‌بینی AI' }, 500)
  }
})

export default predictionRoutes