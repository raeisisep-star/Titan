/**
 * TITAN Trading System - AI Routes
 * 
 * API endpoints for AI-powered trading features including market analysis,
 * trading signals, natural language processing, and AI-generated strategies.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { validator } from 'hono/validator';
import { getAIManager, AIManager, AIAnalysisRequest, MarketInsights, AITradingRecommendation } from '../ai/ai-manager';

// Initialize AI routes
const aiRoutes = new Hono();

// Enable CORS for AI endpoints
aiRoutes.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Error handler for AI routes
aiRoutes.onError((err, c) => {
  console.error('AI Route Error:', err);
  return c.json({
    success: false,
    error: 'AI service error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

/**
 * GET /ai/health - Check AI services health
 */
aiRoutes.get('/health', async (c) => {
  try {
    const aiManager = getAIManager();
    const health = await aiManager.getServiceHealth();
    
    return c.json({
      success: true,
      data: health,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to check AI health',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * GET /ai/providers - Get available AI providers and capabilities
 */
aiRoutes.get('/providers', async (c) => {
  try {
    const aiManager = getAIManager();
    const providers = aiManager['aiFactory'].getAvailableProviders();
    
    return c.json({
      success: true,
      data: {
        providers,
        count: providers.length
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get providers',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * GET /ai/stats - Get usage statistics
 */
aiRoutes.get('/stats', async (c) => {
  try {
    const aiManager = getAIManager();
    const stats = aiManager['aiFactory'].getUsageStats();
    
    return c.json({
      success: true,
      data: stats
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get statistics',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * POST /ai/analyze - Comprehensive market analysis
 */
aiRoutes.post('/analyze', 
  validator('json', (value, c) => {
    const { symbol, marketData, timeframe, analysisType } = value;
    
    if (!symbol || typeof symbol !== 'string') {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Symbol is required and must be a string'
      }, 400);
    }
    
    return value as AIAnalysisRequest;
  }),
  async (c) => {
    try {
      const request = c.req.valid('json');
      const aiManager = getAIManager();
      
      const insights = await aiManager.analyzeSymbol({
        ...request,
        includeSentiment: request.includeSentiment ?? true,
        includeRisk: request.includeRisk ?? true
      });
      
      return c.json({
        success: true,
        data: insights,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Analysis failed',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /ai/signal - Generate trading signal
 */
aiRoutes.post('/signal',
  validator('json', (value, c) => {
    const { symbol, marketData } = value;
    
    if (!symbol || typeof symbol !== 'string') {
      return c.json({
        success: false,
        error: 'Validation error', 
        message: 'Symbol is required'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const { symbol, marketData, userPreferences } = c.req.valid('json');
      const aiManager = getAIManager();
      
      const recommendation = await aiManager.generateRecommendation(
        symbol,
        marketData || {},
        userPreferences
      );
      
      return c.json({
        success: true,
        data: recommendation,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Signal generation failed',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /ai/strategy - Generate trading strategy
 */
aiRoutes.post('/strategy',
  validator('json', (value, c) => {
    const { riskTolerance, timeframe, capital } = value;
    
    if (!riskTolerance || !timeframe || !capital) {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Risk tolerance, timeframe, and capital are required'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const requirements = c.req.valid('json');
      const aiManager = getAIManager();
      
      const strategy = await aiManager.generateStrategy(requirements);
      
      return c.json({
        success: true,
        data: strategy,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Strategy generation failed',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /ai/query - Natural language processing
 */
aiRoutes.post('/query',
  validator('json', (value, c) => {
    const { query } = value;
    
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Query is required and must be a non-empty string'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const { query, context } = c.req.valid('json');
      const aiManager = getAIManager();
      
      const response = await aiManager.processQuery(query, context);
      
      return c.json({
        success: true,
        data: response,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Query processing failed',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /ai/batch-analyze - Batch analysis for multiple symbols
 */
aiRoutes.post('/batch-analyze',
  validator('json', (value, c) => {
    const { symbols } = value;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Symbols array is required and must not be empty'
      }, 400);
    }
    
    if (symbols.length > 50) {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Maximum 50 symbols allowed per batch request'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const { symbols, marketData = {}, options = {} } = c.req.valid('json');
      const aiManager = getAIManager();
      
      const results = await aiManager.batchAnalyze(symbols, marketData, options);
      
      return c.json({
        success: true,
        data: {
          results,
          processedCount: symbols.length,
          successCount: Object.values(results).filter(r => !r.error).length
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Batch analysis failed',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /ai/sentiment - Analyze market sentiment
 */
aiRoutes.post('/sentiment',
  validator('json', (value, c) => {
    const { text, symbol } = value;
    
    if (!text || typeof text !== 'string') {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Text is required for sentiment analysis'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const { text, symbol, context } = c.req.valid('json');
      const aiManager = getAIManager();
      
      const sentiment = await aiManager['aiFactory'].analyzeSentiment(text, { symbol, ...context });
      
      return c.json({
        success: true,
        data: sentiment.data,
        provider: sentiment.provider,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Sentiment analysis failed',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /ai/risk-assessment - Assess trading risk
 */
aiRoutes.post('/risk-assessment',
  validator('json', (value, c) => {
    const { position, marketConditions } = value;
    
    if (!position || !marketConditions) {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Position and market conditions are required'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const { position, marketConditions } = c.req.valid('json');
      const aiManager = getAIManager();
      
      const riskAssessment = await aiManager['aiFactory'].assessRisk(position, marketConditions);
      
      return c.json({
        success: true,
        data: riskAssessment.data,
        provider: riskAssessment.provider,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Risk assessment failed',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /ai/pattern-detection - Detect market patterns
 */
aiRoutes.post('/pattern-detection',
  validator('json', (value, c) => {
    const { marketData, timeframe } = value;
    
    if (!marketData || !timeframe) {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Market data and timeframe are required'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const { marketData, timeframe } = c.req.valid('json');
      const aiManager = getAIManager();
      
      const patterns = await aiManager['aiFactory'].detectPatterns(marketData, timeframe);
      
      return c.json({
        success: true,
        data: patterns.data,
        provider: patterns.provider,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Pattern detection failed',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /ai/cost-estimate - Estimate AI usage costs
 */
aiRoutes.post('/cost-estimate',
  validator('json', (value, c) => {
    const { operations } = value;
    
    if (!operations || !Array.isArray(operations)) {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Operations array is required'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const { operations } = c.req.valid('json');
      const aiManager = getAIManager();
      
      const estimate = aiManager.estimateUsageCost(operations);
      
      return c.json({
        success: true,
        data: estimate
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Cost estimation failed',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * PUT /ai/config - Update AI routing configuration
 */
aiRoutes.put('/config',
  validator('json', (value, c) => {
    const { routingConfig } = value;
    
    if (!routingConfig || typeof routingConfig !== 'object') {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Routing config object is required'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const { routingConfig } = c.req.valid('json');
      const aiManager = getAIManager();
      
      aiManager.setRoutingConfig(routingConfig);
      
      return c.json({
        success: true,
        data: {
          message: 'AI routing configuration updated successfully',
          config: aiManager.getConfig()
        }
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Configuration update failed',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * DELETE /ai/cache - Clear AI caches
 */
aiRoutes.delete('/cache', async (c) => {
  try {
    const aiManager = getAIManager();
    aiManager.clearCache();
    
    return c.json({
      success: true,
      data: {
        message: 'AI caches cleared successfully'
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Cache clearing failed',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * GET /ai/capabilities - Get detailed AI capabilities
 */
aiRoutes.get('/capabilities', async (c) => {
  try {
    return c.json({
      success: true,
      data: {
        capabilities: [
          {
            name: 'market_analysis',
            description: 'Comprehensive market trend and technical analysis',
            providers: ['openai', 'gemini', 'claude'],
            inputTypes: ['ohlcv', 'indicators', 'volume'],
            outputTypes: ['trends', 'signals', 'insights']
          },
          {
            name: 'trading_signals',
            description: 'AI-generated buy/sell/hold recommendations',
            providers: ['openai', 'gemini', 'claude'],
            inputTypes: ['market_data', 'user_preferences'],
            outputTypes: ['action', 'confidence', 'reasoning']
          },
          {
            name: 'sentiment_analysis',
            description: 'Market sentiment from news and social data',
            providers: ['claude', 'gemini'],
            inputTypes: ['text', 'news', 'social_media'],
            outputTypes: ['sentiment', 'confidence', 'factors']
          },
          {
            name: 'risk_assessment',
            description: 'Position and portfolio risk evaluation',
            providers: ['claude', 'openai'],
            inputTypes: ['positions', 'market_conditions'],
            outputTypes: ['risk_level', 'recommendations', 'metrics']
          },
          {
            name: 'strategy_generation',
            description: 'Automated trading strategy creation',
            providers: ['claude', 'openai'],
            inputTypes: ['requirements', 'constraints', 'goals'],
            outputTypes: ['strategy', 'rules', 'backtesting']
          },
          {
            name: 'natural_language',
            description: 'Natural language query processing',
            providers: ['openai', 'gemini', 'claude'],
            inputTypes: ['questions', 'commands'],
            outputTypes: ['answers', 'actions', 'suggestions']
          },
          {
            name: 'pattern_recognition',
            description: 'Chart pattern and trend identification',
            providers: ['gemini', 'claude'],
            inputTypes: ['price_data', 'volume_data'],
            outputTypes: ['patterns', 'probabilities', 'implications']
          }
        ],
        providers: {
          openai: {
            name: 'OpenAI GPT-4',
            strengths: ['technical_analysis', 'natural_language', 'strategy_generation'],
            costEfficiency: 'medium',
            responseTime: 'medium'
          },
          gemini: {
            name: 'Google Gemini',
            strengths: ['multi_modal', 'real_time_analysis', 'pattern_recognition'],
            costEfficiency: 'high',
            responseTime: 'fast'
          },
          claude: {
            name: 'Anthropic Claude',
            strengths: ['reasoning', 'market_analysis', 'risk_assessment'],
            costEfficiency: 'medium',
            responseTime: 'medium'
          }
        }
      }
    });
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get capabilities',
      message: (error as Error).message
    }, 500);
  }
});

export default aiRoutes;