/**
 * TITAN Trading System - AI Services API Routes (Phase 6)
 * Advanced AI & Machine Learning Integration API Layer
 */

import { Hono } from 'hono'
import { AIModelManager } from '../services/ai/ai-model-manager'
import { MarketAnalyzer } from '../services/intelligence/market-analyzer'
import { StrategyGenerator } from '../services/strategy-ai/strategy-generator'

const app = new Hono()

// Initialize AI services
const aiModelManager = new AIModelManager()
const marketAnalyzer = new MarketAnalyzer()
const strategyGenerator = new StrategyGenerator()

// Rate limiting middleware (simplified for Cloudflare Workers)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()
const rateLimit = (maxRequests: number = 10, windowMs: number = 60000) => {
  return async (c: any, next: any) => {
    const clientIP = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown'
    const now = Date.now()
    
    if (!rateLimitMap.has(clientIP)) {
      rateLimitMap.set(clientIP, { count: 1, resetTime: now + windowMs })
      return await next()
    }
    
    const clientData = rateLimitMap.get(clientIP)!
    
    if (now > clientData.resetTime) {
      clientData.count = 1
      clientData.resetTime = now + windowMs
      return await next()
    }
    
    if (clientData.count >= maxRequests) {
      return c.json({
        success: false,
        error: 'Rate limit exceeded. Too many AI requests.',
        resetTime: clientData.resetTime
      }, 429)
    }
    
    clientData.count++
    return await next()
  }
}

// Apply rate limiting to all AI routes
app.use('*', rateLimit(10, 60000)) // 10 requests per minute

// AI Model Management Routes

/**
 * @route GET /models
 * @description Get all available AI models
 */
app.get('/models', async (c) => {
  try {
    const models = await aiModelManager.getAvailableModels()
    
    return c.json({
      success: true,
      data: models,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get AI models:', error)
    return c.json({
      success: false,
      error: 'Failed to retrieve AI models',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route POST /models/load
 * @description Load a specific AI model
 */
app.post('/models/load', async (c) => {
  try {
    const { modelId, config } = await c.req.json()
    
    if (!modelId) {
      return c.json({
        success: false,
        error: 'Missing required field: modelId',
        timestamp: new Date().toISOString()
      }, 400)
    }

    const result = await aiModelManager.loadModel(modelId, config)
    
    return c.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to load AI model:', error)
    return c.json({
      success: false,
      error: 'Failed to load AI model',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route POST /predict
 * @description Generate AI predictions using loaded models
 */
app.post('/predict', async (c) => {
  try {
    const { modelId, inputData, predictionType } = await c.req.json()
    
    if (!modelId || !inputData) {
      return c.json({
        success: false,
        error: 'Missing required fields: modelId, inputData',
        timestamp: new Date().toISOString()
      }, 400)
    }

    const prediction = await aiModelManager.predict({
      modelId,
      inputData,
      predictionType: predictionType || 'price'
    })
    
    return c.json({
      success: true,
      data: prediction,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to generate prediction:', error)
    return c.json({
      success: false,
      error: 'Failed to generate prediction',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route POST /predict/ensemble
 * @description Generate ensemble predictions using multiple models
 */
app.post('/predict/ensemble', async (c) => {
  try {
    const { modelIds, inputData, weights, predictionType } = await c.req.json()
    
    if (!modelIds || !inputData || !Array.isArray(modelIds)) {
      return c.json({
        success: false,
        error: 'Missing required fields: modelIds (array), inputData',
        timestamp: new Date().toISOString()
      }, 400)
    }

    const predictions = await aiModelManager.ensemblePredict({
      modelIds,
      inputData,
      weights: weights || {},
      predictionType: predictionType || 'price'
    })
    
    return c.json({
      success: true,
      data: predictions,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to generate ensemble predictions:', error)
    return c.json({
      success: false,
      error: 'Failed to generate ensemble predictions',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route POST /models/train
 * @description Train or retrain AI models
 */
app.post('/models/train', async (c) => {
  try {
    const { modelId, trainingData, config } = await c.req.json()
    
    if (!modelId || !trainingData) {
      return c.json({
        success: false,
        error: 'Missing required fields: modelId, trainingData',
        timestamp: new Date().toISOString()
      }, 400)
    }

    const result = await aiModelManager.trainModel({
      modelId,
      trainingData,
      config: config || {}
    })
    
    return c.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to train model:', error)
    return c.json({
      success: false,
      error: 'Failed to train model',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Market Intelligence Routes

/**
 * @route GET /intelligence/market-conditions
 * @description Get current market conditions analysis
 */
app.get('/intelligence/market-conditions', async (c) => {
  try {
    const symbol = c.req.query('symbol') || 'BTCUSDT'
    const timeframe = c.req.query('timeframe') || '1h'
    
    const marketConditions = await marketAnalyzer.analyzeMarketConditions({
      symbol,
      timeframe
    })
    
    return c.json({
      success: true,
      data: marketConditions,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to analyze market conditions:', error)
    return c.json({
      success: false,
      error: 'Failed to analyze market conditions',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route POST /intelligence/sentiment
 * @description Analyze market sentiment from multiple sources
 */
app.post('/intelligence/sentiment', async (c) => {
  try {
    const { sources, symbols, timeRange } = await c.req.json()
    
    const sentimentAnalysis = await marketAnalyzer.analyzeSentiment({
      sources: sources || ['news', 'social', 'technical'],
      symbols: symbols || ['BTCUSDT'],
      timeRange: timeRange || { hours: 24 }
    })
    
    return c.json({
      success: true,
      data: sentimentAnalysis,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to analyze sentiment:', error)
    return c.json({
      success: false,
      error: 'Failed to analyze sentiment',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route POST /intelligence/anomalies
 * @description Detect market anomalies and unusual patterns
 */
app.post('/intelligence/anomalies', async (c) => {
  try {
    const { symbol, timeframe, lookback } = await c.req.json()
    
    if (!symbol) {
      return c.json({
        success: false,
        error: 'Missing required field: symbol',
        timestamp: new Date().toISOString()
      }, 400)
    }

    const anomalies = await marketAnalyzer.detectAnomalies({
      symbol,
      timeframe: timeframe || '1h',
      lookbackPeriod: lookback || 168 // 1 week default
    })
    
    return c.json({
      success: true,
      data: anomalies,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to detect anomalies:', error)
    return c.json({
      success: false,
      error: 'Failed to detect anomalies',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route POST /intelligence/forecast
 * @description Generate market forecasts using AI models
 */
app.post('/intelligence/forecast', async (c) => {
  try {
    const { symbol, horizon, confidence } = await c.req.json()
    
    if (!symbol) {
      return c.json({
        success: false,
        error: 'Missing required field: symbol',
        timestamp: new Date().toISOString()
      }, 400)
    }

    const forecast = await marketAnalyzer.generateForecast({
      symbol,
      timeHorizon: horizon || '24h',
      confidenceLevel: confidence || 0.95
    })
    
    return c.json({
      success: true,
      data: forecast,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to generate forecast:', error)
    return c.json({
      success: false,
      error: 'Failed to generate forecast',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// Trading Strategy AI Routes

/**
 * @route POST /strategy/generate
 * @description Generate AI-powered trading strategies
 */
app.post('/strategy/generate', async (c) => {
  try {
    const { 
      marketConditions, 
      riskProfile, 
      objectives, 
      constraints, 
      symbols 
    } = await c.req.json()
    
    const strategy = await strategyGenerator.generateStrategy({
      marketConditions: marketConditions || {},
      riskProfile: riskProfile || 'moderate',
      objectives: objectives || ['profit_maximization'],
      constraints: constraints || {},
      targetSymbols: symbols || ['BTCUSDT']
    })
    
    return c.json({
      success: true,
      data: strategy,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to generate strategy:', error)
    return c.json({
      success: false,
      error: 'Failed to generate strategy',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route POST /strategy/backtest
 * @description Backtest trading strategies using historical data
 */
app.post('/strategy/backtest', async (c) => {
  try {
    const { strategy, period, initialCapital, symbols } = await c.req.json()
    
    if (!strategy) {
      return c.json({
        success: false,
        error: 'Missing required field: strategy',
        timestamp: new Date().toISOString()
      }, 400)
    }

    const backtestResult = await strategyGenerator.backtestStrategy({
      strategy,
      backtestPeriod: period || { days: 30 },
      initialCapital: initialCapital || 10000,
      symbols: symbols || ['BTCUSDT']
    })
    
    return c.json({
      success: true,
      data: backtestResult,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to backtest strategy:', error)
    return c.json({
      success: false,
      error: 'Failed to backtest strategy',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route POST /strategy/optimize
 * @description Optimize trading strategy parameters using genetic algorithms
 */
app.post('/strategy/optimize', async (c) => {
  try {
    const { strategy, optimizationConfig, constraints } = await c.req.json()
    
    if (!strategy) {
      return c.json({
        success: false,
        error: 'Missing required field: strategy',
        timestamp: new Date().toISOString()
      }, 400)
    }

    const optimizedStrategy = await strategyGenerator.optimizeStrategy({
      strategy,
      config: optimizationConfig || {},
      constraints: constraints || {}
    })
    
    return c.json({
      success: true,
      data: optimizedStrategy,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to optimize strategy:', error)
    return c.json({
      success: false,
      error: 'Failed to optimize strategy',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route GET /strategy/rankings
 * @description Get ranked list of AI-generated strategies
 */
app.get('/strategy/rankings', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')
    const sortBy = c.req.query('sortBy') || 'risk_adjusted_return'
    
    const rankings = await strategyGenerator.getStrategyRankings({
      limit,
      sortBy,
      includeBacktestResults: true
    })
    
    return c.json({
      success: true,
      data: rankings,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get strategy rankings:', error)
    return c.json({
      success: false,
      error: 'Failed to get strategy rankings',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

// AI Services Status and Health Routes

/**
 * @route GET /status
 * @description Get overall AI services status and health
 */
app.get('/status', async (c) => {
  try {
    const status = {
      aiModelManager: {
        status: 'operational',
        loadedModels: await aiModelManager.getLoadedModels(),
        lastPrediction: await aiModelManager.getLastPredictionTime()
      },
      marketAnalyzer: {
        status: 'operational',
        activeAnalysis: await marketAnalyzer.getActiveAnalysisCount(),
        lastUpdate: await marketAnalyzer.getLastUpdateTime()
      },
      strategyGenerator: {
        status: 'operational',
        activeStrategies: await strategyGenerator.getActiveStrategiesCount(),
        lastGeneration: await strategyGenerator.getLastGenerationTime()
      },
      timestamp: new Date().toISOString()
    }

    return c.json({
      success: true,
      data: status,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to get AI services status:', error)
    return c.json({
      success: false,
      error: 'Failed to get AI services status',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

/**
 * @route POST /cleanup
 * @description Cleanup AI services resources and cache
 */
app.post('/cleanup', async (c) => {
  try {
    await Promise.all([
      aiModelManager.cleanup(),
      marketAnalyzer.cleanup(),
      strategyGenerator.cleanup()
    ])
    
    return c.json({
      success: true,
      message: 'AI services cleanup completed successfully',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Failed to cleanup AI services:', error)
    return c.json({
      success: false,
      error: 'Failed to cleanup AI services',
      timestamp: new Date().toISOString()
    }, 500)
  }
})

export default app