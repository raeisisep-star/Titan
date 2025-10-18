/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📈 BACKTESTING API ROUTES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * API endpoints for backtesting strategies
 */

const { getBacktestingEngine } = require('../services/backtesting-engine');

module.exports = function(app, pool, redisClient) {
  
  const backtestEngine = getBacktestingEngine(pool);
  
  // Auth middleware
  const authMiddleware = async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }
    
    const token = authHeader.substring(7);
    const result = await pool.query(
      'SELECT user_id FROM user_sessions WHERE session_token = $1 AND is_active = true',
      [token]
    );
    
    if (result.rows.length === 0) {
      return c.json({ success: false, error: 'Invalid or expired token' }, 401);
    }
    
    c.set('userId', result.rows[0].user_id);
    await next();
  };
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * BACKTEST EXECUTION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Run a backtest
   * POST /api/backtest/run
   */
  app.post('/api/backtest/run', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      const params = await c.req.json();
      
      // Validate params
      if (!params.strategyId || !params.symbol || !params.startDate || !params.endDate) {
        return c.json({
          success: false,
          error: 'Missing required parameters: strategyId, symbol, startDate, endDate'
        }, 400);
      }
      
      // Run backtest
      const results = await backtestEngine.runBacktest(userId, params);
      
      return c.json({
        success: true,
        data: results,
        message: 'Backtest completed successfully',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error running backtest:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to run backtest'
      }, 500);
    }
  });
  
  /**
   * Run quick backtest (last 30 days)
   * POST /api/backtest/quick
   */
  app.post('/api/backtest/quick', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      const { strategyId, symbol } = await c.req.json();
      
      if (!strategyId || !symbol) {
        return c.json({
          success: false,
          error: 'Missing required parameters: strategyId, symbol'
        }, 400);
      }
      
      // Set dates for last 30 days
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      
      const params = {
        strategyId,
        symbol,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        timeframe: '1h',
        initialCapital: 10000
      };
      
      const results = await backtestEngine.runBacktest(userId, params);
      
      return c.json({
        success: true,
        data: results,
        message: 'Quick backtest completed (30 days)',
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error running quick backtest:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to run quick backtest'
      }, 500);
    }
  });
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * BACKTEST HISTORY
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get backtest history
   * GET /api/backtest/history
   */
  app.get('/api/backtest/history', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      const limit = parseInt(c.req.query('limit') || '50');
      
      const history = await backtestEngine.getBacktestHistory(userId, limit);
      
      return c.json({
        success: true,
        data: {
          backtests: history,
          count: history.length
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error getting backtest history:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get backtest history'
      }, 500);
    }
  });
  
  /**
   * Get specific backtest details
   * GET /api/backtest/:id
   */
  app.get('/api/backtest/:id', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      const backtestId = c.req.param('id');
      
      const result = await pool.query(`
        SELECT 
          br.*,
          ts.name as strategy_name,
          ts.description as strategy_description
        FROM backtest_results br
        LEFT JOIN trading_strategies ts ON br.strategy_id = ts.id
        WHERE br.id = $1 AND br.user_id = $2
      `, [backtestId, userId]);
      
      if (result.rows.length === 0) {
        return c.json({
          success: false,
          error: 'Backtest not found'
        }, 404);
      }
      
      const backtest = result.rows[0];
      const resultsData = JSON.parse(backtest.results_data);
      
      return c.json({
        success: true,
        data: {
          id: backtest.id,
          strategy: {
            id: backtest.strategy_id,
            name: backtest.strategy_name,
            description: backtest.strategy_description
          },
          symbol: backtest.symbol,
          timeframe: backtest.timeframe,
          period: {
            start: backtest.start_date,
            end: backtest.end_date
          },
          capital: {
            initial: parseFloat(backtest.initial_capital),
            final: parseFloat(backtest.final_equity)
          },
          metrics: {
            totalReturn: parseFloat(backtest.total_return),
            totalReturnPercent: ((parseFloat(backtest.final_equity) - parseFloat(backtest.initial_capital)) / parseFloat(backtest.initial_capital) * 100).toFixed(2),
            winRate: parseFloat(backtest.win_rate),
            maxDrawdown: parseFloat(backtest.max_drawdown),
            sharpeRatio: parseFloat(backtest.sharpe_ratio),
            profitFactor: backtest.profit_factor,
            totalTrades: parseInt(backtest.total_trades)
          },
          trades: resultsData.trades,
          equity: resultsData.equity,
          createdAt: backtest.created_at
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error getting backtest details:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get backtest details'
      }, 500);
    }
  });
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * STRATEGY COMPARISON
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Compare multiple strategies
   * POST /api/backtest/compare
   */
  app.post('/api/backtest/compare', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      const { strategyIds, symbol, startDate, endDate, timeframe = '1h' } = await c.req.json();
      
      if (!strategyIds || !Array.isArray(strategyIds) || strategyIds.length < 2) {
        return c.json({
          success: false,
          error: 'Please provide at least 2 strategy IDs to compare'
        }, 400);
      }
      
      if (!symbol || !startDate || !endDate) {
        return c.json({
          success: false,
          error: 'Missing required parameters: symbol, startDate, endDate'
        }, 400);
      }
      
      // Run backtest for each strategy
      const comparisons = [];
      
      for (const strategyId of strategyIds) {
        try {
          const result = await backtestEngine.runBacktest(userId, {
            strategyId,
            symbol,
            startDate,
            endDate,
            timeframe
          });
          
          comparisons.push({
            strategyId,
            strategyName: result.strategy,
            metrics: result.metrics,
            finalEquity: result.equity[result.equity.length - 1].value
          });
        } catch (error) {
          console.error(`Error backtesting strategy ${strategyId}:`, error);
          comparisons.push({
            strategyId,
            error: error.message
          });
        }
      }
      
      // Rank strategies by Sharpe ratio
      const validComparisons = comparisons.filter(c => !c.error);
      validComparisons.sort((a, b) => parseFloat(b.metrics.sharpeRatio) - parseFloat(a.metrics.sharpeRatio));
      
      return c.json({
        success: true,
        data: {
          comparisons,
          bestStrategy: validComparisons.length > 0 ? validComparisons[0] : null,
          period: { startDate, endDate },
          symbol,
          timeframe
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error comparing strategies:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to compare strategies'
      }, 500);
    }
  });
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * OPTIMIZATION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Optimize strategy parameters
   * POST /api/backtest/optimize
   */
  app.post('/api/backtest/optimize', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      const { strategyId, symbol, startDate, endDate, parameterRanges } = await c.req.json();
      
      if (!strategyId || !symbol || !startDate || !endDate) {
        return c.json({
          success: false,
          error: 'Missing required parameters'
        }, 400);
      }
      
      // This is a placeholder for parameter optimization
      // In production, this would use grid search or genetic algorithms
      
      return c.json({
        success: true,
        data: {
          message: 'Strategy optimization is under development',
          suggestedParameters: {
            shortMA: 10,
            longMA: 20,
            stopLoss: 0.02,
            takeProfit: 0.05
          }
        },
        timestamp: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('Error optimizing strategy:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to optimize strategy'
      }, 500);
    }
  });
  
  console.log('✅ Backtesting API routes loaded (6 endpoints)');
};
