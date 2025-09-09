/**
 * TITAN Trading System - Advanced AI Routes
 * 
 * API endpoints for Phase 5 advanced AI features including real-time monitoring,
 * market predictions, and automated strategy execution.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { validator } from 'hono/validator';

// Import AI components
import { 
  MarketMonitor, 
  initializeMarketMonitor, 
  getMarketMonitor,
  type MarketMonitorConfig 
} from '../ai/market-monitor';
import { 
  PredictionEngine, 
  initializePredictionEngine, 
  getPredictionEngine,
  type PredictionConfig 
} from '../ai/prediction-engine';
import { 
  StrategyExecutor, 
  initializeStrategyExecutor, 
  getStrategyExecutor,
  type StrategyConfig 
} from '../ai/strategy-executor';

// Initialize advanced AI routes
const advancedAIRoutes = new Hono();

// Enable CORS
advancedAIRoutes.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Error handler
advancedAIRoutes.onError((err, c) => {
  console.error('Advanced AI Route Error:', err);
  return c.json({
    success: false,
    error: 'Advanced AI service error',
    message: err.message,
    timestamp: new Date().toISOString()
  }, 500);
});

// ============================================
// MARKET MONITOR ROUTES
// ============================================

/**
 * GET /monitor/status - Get market monitor status
 */
advancedAIRoutes.get('/monitor/status', async (c) => {
  try {
    const monitor = getMarketMonitor();
    
    if (!monitor) {
      return c.json({
        success: false,
        data: {
          status: 'not_initialized',
          message: 'Market monitor not initialized'
        }
      });
    }

    const stats = monitor.getStats();
    const snapshots = monitor.getMarketSnapshots();
    
    return c.json({
      success: true,
      data: {
        status: 'active',
        stats,
        symbolsCount: Object.keys(snapshots).length,
        lastUpdate: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get monitor status',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * POST /monitor/start - Start market monitoring
 */
advancedAIRoutes.post('/monitor/start',
  validator('json', (value, c) => {
    const { symbols, intervals } = value;
    
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return c.json({
        success: false,
        error: 'Validation error',
        message: 'Symbols array is required'
      }, 400);
    }
    
    return value as MarketMonitorConfig;
  }),
  async (c) => {
    try {
      const config = c.req.valid('json');
      
      let monitor = getMarketMonitor();
      
      if (!monitor) {
        monitor = initializeMarketMonitor(config);
      }
      
      await monitor.start();
      
      return c.json({
        success: true,
        data: {
          message: 'Market monitoring started',
          symbols: config.symbols,
          intervals: config.intervals || ['1m', '5m', '15m', '1h'],
          status: 'active'
        }
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to start monitoring',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /monitor/stop - Stop market monitoring
 */
advancedAIRoutes.post('/monitor/stop', async (c) => {
  try {
    const monitor = getMarketMonitor();
    
    if (!monitor) {
      return c.json({
        success: false,
        message: 'Monitor not running'
      });
    }
    
    await monitor.stop();
    
    return c.json({
      success: true,
      data: {
        message: 'Market monitoring stopped',
        status: 'stopped'
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to stop monitoring',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * GET /monitor/snapshots - Get current market snapshots
 */
advancedAIRoutes.get('/monitor/snapshots', async (c) => {
  try {
    const monitor = getMarketMonitor();
    
    if (!monitor) {
      return c.json({
        success: false,
        error: 'Monitor not initialized'
      }, 404);
    }
    
    const snapshots = monitor.getMarketSnapshots();
    
    return c.json({
      success: true,
      data: snapshots,
      count: Object.keys(snapshots).length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get snapshots',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * GET /monitor/alerts - Get recent market alerts
 */
advancedAIRoutes.get('/monitor/alerts', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const severity = c.req.query('severity');
    
    const monitor = getMarketMonitor();
    
    if (!monitor) {
      return c.json({
        success: false,
        error: 'Monitor not initialized'
      }, 404);
    }
    
    let alerts = monitor.getRecentAlerts(limit);
    
    // Filter by severity if specified
    if (severity) {
      alerts = alerts.filter(alert => alert.severity === severity);
    }
    
    return c.json({
      success: true,
      data: alerts,
      count: alerts.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get alerts',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * POST /monitor/symbols/add - Add symbol to monitoring
 */
advancedAIRoutes.post('/monitor/symbols/add',
  validator('json', (value, c) => {
    const { symbol } = value;
    
    if (!symbol || typeof symbol !== 'string') {
      return c.json({
        success: false,
        error: 'Symbol is required'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const { symbol } = c.req.valid('json');
      const monitor = getMarketMonitor();
      
      if (!monitor) {
        return c.json({
          success: false,
          error: 'Monitor not initialized'
        }, 404);
      }
      
      await monitor.addSymbol(symbol.toUpperCase());
      
      return c.json({
        success: true,
        data: {
          message: `Added ${symbol} to monitoring`,
          symbol: symbol.toUpperCase()
        }
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to add symbol',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * DELETE /monitor/symbols/:symbol - Remove symbol from monitoring
 */
advancedAIRoutes.delete('/monitor/symbols/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const monitor = getMarketMonitor();
    
    if (!monitor) {
      return c.json({
        success: false,
        error: 'Monitor not initialized'
      }, 404);
    }
    
    await monitor.removeSymbol(symbol.toUpperCase());
    
    return c.json({
      success: true,
      data: {
        message: `Removed ${symbol} from monitoring`,
        symbol: symbol.toUpperCase()
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to remove symbol',
      message: (error as Error).message
    }, 500);
  }
});

// ============================================
// PREDICTION ENGINE ROUTES
// ============================================

/**
 * POST /predictions/initialize - Initialize prediction engine
 */
advancedAIRoutes.post('/predictions/initialize',
  validator('json', (value, c) => {
    return value as PredictionConfig;
  }),
  async (c) => {
    try {
      const config = c.req.valid('json');
      const engine = initializePredictionEngine(config);
      
      return c.json({
        success: true,
        data: {
          message: 'Prediction engine initialized',
          config: {
            models: config.models || ['ensemble', 'openai', 'gemini', 'claude'],
            timeframes: config.timeframes || ['5m', '15m', '1h', '4h', '1d'],
            enableEnsemble: config.enableEnsemble ?? true
          }
        }
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to initialize prediction engine',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /predictions/generate - Generate market predictions
 */
advancedAIRoutes.post('/predictions/generate',
  validator('json', (value, c) => {
    const { symbol, marketData } = value;
    
    if (!symbol || typeof symbol !== 'string') {
      return c.json({
        success: false,
        error: 'Symbol is required'
      }, 400);
    }
    
    return value;
  }),
  async (c) => {
    try {
      const { symbol, marketData } = c.req.valid('json');
      const engine = getPredictionEngine();
      
      if (!engine) {
        return c.json({
          success: false,
          error: 'Prediction engine not initialized'
        }, 404);
      }
      
      const prediction = await engine.generatePredictions(symbol.toUpperCase(), marketData);
      
      return c.json({
        success: true,
        data: prediction,
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to generate predictions',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * GET /predictions/:symbol - Get predictions for symbol
 */
advancedAIRoutes.get('/predictions/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol').toUpperCase();
    const engine = getPredictionEngine();
    
    if (!engine) {
      return c.json({
        success: false,
        error: 'Prediction engine not initialized'
      }, 404);
    }
    
    const predictions = engine.getPredictions(symbol);
    const latestPrediction = engine.getLatestPrediction(symbol);
    
    return c.json({
      success: true,
      data: {
        symbol,
        latest: latestPrediction,
        history: predictions,
        count: predictions.length
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get predictions',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * GET /predictions/stats - Get prediction statistics
 */
advancedAIRoutes.get('/predictions/stats', async (c) => {
  try {
    const engine = getPredictionEngine();
    
    if (!engine) {
      return c.json({
        success: false,
        error: 'Prediction engine not initialized'
      }, 404);
    }
    
    const stats = engine.getPredictionStats();
    const performance = engine.getModelPerformance();
    
    return c.json({
      success: true,
      data: {
        statistics: stats,
        modelPerformance: Object.fromEntries(performance),
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get prediction stats',
      message: (error as Error).message
    }, 500);
  }
});

// ============================================
// STRATEGY EXECUTOR ROUTES
// ============================================

/**
 * POST /executor/initialize - Initialize strategy executor
 */
advancedAIRoutes.post('/executor/initialize',
  validator('json', (value, c) => {
    return value as StrategyConfig;
  }),
  async (c) => {
    try {
      const config = c.req.valid('json');
      const executor = initializeStrategyExecutor(config);
      
      return c.json({
        success: true,
        data: {
          message: 'Strategy executor initialized',
          config: {
            enableAutoExecution: config.enableAutoExecution || false,
            maxPositions: config.maxPositions || 10,
            riskPerTrade: config.riskPerTrade || 0.02,
            confidenceThreshold: config.confidenceThreshold || 0.75
          }
        }
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: 'Failed to initialize strategy executor',
        message: (error as Error).message
      }, 500);
    }
  }
);

/**
 * POST /executor/start - Start automated strategy execution
 */
advancedAIRoutes.post('/executor/start', async (c) => {
  try {
    const executor = getStrategyExecutor();
    
    if (!executor) {
      return c.json({
        success: false,
        error: 'Strategy executor not initialized'
      }, 404);
    }
    
    await executor.start();
    
    return c.json({
      success: true,
      data: {
        message: 'Strategy execution started',
        status: 'active',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to start strategy executor',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * POST /executor/stop - Stop strategy execution
 */
advancedAIRoutes.post('/executor/stop', async (c) => {
  try {
    const executor = getStrategyExecutor();
    
    if (!executor) {
      return c.json({
        success: false,
        error: 'Strategy executor not initialized'
      }, 404);
    }
    
    await executor.stop();
    
    return c.json({
      success: true,
      data: {
        message: 'Strategy execution stopped',
        status: 'stopped',
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to stop strategy executor',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * GET /executor/status - Get strategy executor status
 */
advancedAIRoutes.get('/executor/status', async (c) => {
  try {
    const executor = getStrategyExecutor();
    
    if (!executor) {
      return c.json({
        success: false,
        data: {
          status: 'not_initialized',
          message: 'Strategy executor not initialized'
        }
      });
    }
    
    const stats = executor.getExecutionStats();
    
    return c.json({
      success: true,
      data: {
        status: stats.isRunning ? 'active' : 'stopped',
        stats,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get executor status',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * GET /executor/portfolio - Get current portfolio state
 */
advancedAIRoutes.get('/executor/portfolio', async (c) => {
  try {
    const executor = getStrategyExecutor();
    
    if (!executor) {
      return c.json({
        success: false,
        error: 'Strategy executor not initialized'
      }, 404);
    }
    
    const portfolio = executor.getPortfolio();
    
    return c.json({
      success: true,
      data: portfolio,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get portfolio',
      message: (error as Error).message
    }, 500);
  }
});

// ============================================
// COMPREHENSIVE AI STATUS
// ============================================

/**
 * GET /status/comprehensive - Get comprehensive AI system status
 */
advancedAIRoutes.get('/status/comprehensive', async (c) => {
  try {
    const monitor = getMarketMonitor();
    const engine = getPredictionEngine();
    const executor = getStrategyExecutor();
    
    const status = {
      marketMonitor: {
        initialized: !!monitor,
        status: monitor ? 'active' : 'not_initialized',
        stats: monitor ? monitor.getStats() : null,
        symbolsCount: monitor ? Object.keys(monitor.getMarketSnapshots()).length : 0
      },
      predictionEngine: {
        initialized: !!engine,
        status: engine ? 'active' : 'not_initialized',
        stats: engine ? engine.getPredictionStats() : null
      },
      strategyExecutor: {
        initialized: !!executor,
        status: executor ? (executor.getExecutionStats().isRunning ? 'active' : 'stopped') : 'not_initialized',
        stats: executor ? executor.getExecutionStats() : null
      },
      system: {
        timestamp: new Date().toISOString(),
        uptime: Date.now(), // Use timestamp instead of process.uptime
        phase: 'Phase 5: Advanced AI Features'
      }
    };
    
    return c.json({
      success: true,
      data: status
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to get comprehensive status',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * POST /initialize/all - Initialize all AI systems with default config
 */
advancedAIRoutes.post('/initialize/all', async (c) => {
  try {
    // Default configurations
    const monitorConfig: MarketMonitorConfig = {
      symbols: ['BTC', 'ETH', 'BNB'],
      intervals: ['1m', '5m', '15m', '1h'],
      enableAlerts: true,
      enableAutoSignals: true,
      aiUpdateInterval: 30000,
      significanceThreshold: 0.02,
      maxConcurrentAnalysis: 3,
      enablePredictiveAnalysis: true,
      enableSentimentTracking: true
    };
    
    const predictionConfig: PredictionConfig = {
      models: ['ensemble', 'openai', 'gemini', 'claude'],
      timeframes: ['5m', '15m', '1h', '4h', '1d'],
      enableEnsemble: true,
      confidenceThreshold: 0.6,
      historicalDataPoints: 100,
      enableModelWeighting: true,
      enableAdaptiveLearning: true
    };
    
    const executorConfig: StrategyConfig = {
      enableAutoExecution: false, // Safety default
      maxPositions: 5,
      maxPositionSize: 5000,
      riskPerTrade: 0.01, // Conservative 1%
      stopLossPercent: 0.05,
      takeProfitPercent: 0.10,
      confidenceThreshold: 0.8,
      enableDiversification: true,
      maxCorrelatedPositions: 2,
      enableEmergencyStop: true,
      maxDrawdownPercent: 0.10,
      cooldownPeriodMs: 5 * 60 * 1000,
      enableAdaptiveRisk: true,
      backtestBeforeExecution: true
    };
    
    // Initialize all systems
    const monitor = initializeMarketMonitor(monitorConfig);
    const engine = initializePredictionEngine(predictionConfig);
    const executor = initializeStrategyExecutor(executorConfig);
    
    return c.json({
      success: true,
      data: {
        message: 'All AI systems initialized successfully',
        systems: {
          marketMonitor: 'initialized',
          predictionEngine: 'initialized',
          strategyExecutor: 'initialized (auto-execution disabled)'
        },
        configurations: {
          monitorConfig,
          predictionConfig,
          executorConfig
        },
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to initialize AI systems',
      message: (error as Error).message
    }, 500);
  }
});

/**
 * POST /demo/start - Start demo with safe settings
 */
advancedAIRoutes.post('/demo/start', async (c) => {
  try {
    // Initialize with safe demo settings
    const monitor = initializeMarketMonitor({
      symbols: ['BTC', 'ETH'],
      intervals: ['5m', '15m', '1h'],
      enableAlerts: true,
      enableAutoSignals: true,
      aiUpdateInterval: 60000, // 1 minute for demo
      significanceThreshold: 0.05,
      maxConcurrentAnalysis: 2,
      enablePredictiveAnalysis: true,
      enableSentimentTracking: true
    });
    
    const engine = initializePredictionEngine({
      models: ['gemini', 'claude'], // Faster models for demo
      timeframes: ['15m', '1h'],
      enableEnsemble: true,
      confidenceThreshold: 0.7,
      historicalDataPoints: 50,
      enableModelWeighting: false,
      enableAdaptiveLearning: false
    });
    
    // Start monitoring
    await monitor.start();
    
    return c.json({
      success: true,
      data: {
        message: 'Demo started successfully',
        mode: 'demo',
        features: {
          marketMonitoring: 'active',
          predictions: 'active',
          autoTrading: 'disabled (demo mode)'
        },
        symbols: ['BTC', 'ETH'],
        intervals: ['5m', '15m', '1h'],
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to start demo',
      message: (error as Error).message
    }, 500);
  }
});

export default advancedAIRoutes;