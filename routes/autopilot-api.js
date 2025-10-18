/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🤖 AUTOPILOT API ENDPOINTS
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * APIهای مدیریت سیستم Autopilot:
 * - شروع session
 * - توقف/pause/resume session
 * - دریافت status
 * - دریافت trades
 * - تنظیمات و پیکربندی
 */

const { getAutopilotEngine } = require('../services/autopilot-engine');
const { getRiskManagement } = require('../services/risk-management');
const { getTradeExecutionService } = require('../services/trade-execution');
const { getAIProvidersService } = require('../services/ai-providers');

module.exports = function(app, pool, redisClient) {
  
  // Initialize services
  const aiService = getAIProvidersService();
  const riskManagement = getRiskManagement(pool);
  const tradeExecution = getTradeExecutionService(pool, riskManagement);
  const autopilotEngine = getAutopilotEngine(pool, redisClient, aiService);

  // ═══════════════════════════════════════════════════════════════════════════
  // AUTH MIDDLEWARE
  // ═══════════════════════════════════════════════════════════════════════════
  
  const authMiddleware = async (c, next) => {
    const authHeader = c.req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ success: false, error: 'Authentication required' }, 401);
    }

    const token = authHeader.substring(7);

    try {
      const result = await pool.query(
        'SELECT user_id FROM user_sessions WHERE session_token = $1 AND is_active = true',
        [token]
      );

      if (result.rows.length === 0) {
        return c.json({ success: false, error: 'Invalid or expired token' }, 401);
      }

      c.set('userId', result.rows[0].user_id);
      await next();
    } catch (error) {
      return c.json({ success: false, error: 'Authentication error' }, 500);
    }
  };

  console.log('🤖 Loading Autopilot API endpoints...');

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * START AUTOPILOT SESSION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.post('/api/autopilot/start', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();

      const {
        initialBalance,
        targetAmount,
        mode = 'balanced',
        strategies = ['momentum', 'mean_reversion'],
        maxDailyLoss = 0.05,
        maxPositions = 5,
        stopLossPercent = 0.03,
        takeProfitPercent = 0.10,
        enabledAgents = ['agent_01', 'agent_02', 'agent_03']
      } = body;

      // Validate inputs
      if (!initialBalance || !targetAmount) {
        return c.json({
          success: false,
          error: 'initialBalance and targetAmount are required'
        }, 400);
      }

      if (initialBalance <= 0 || targetAmount <= initialBalance) {
        return c.json({
          success: false,
          error: 'Invalid balance or target amount'
        }, 400);
      }

      // Start autopilot session
      const result = await autopilotEngine.startSession(userId, {
        initialBalance,
        targetAmount,
        mode,
        strategies,
        maxDailyLoss,
        maxPositions,
        stopLossPercent,
        takeProfitPercent,
        enabledAgents
      });

      return c.json(result);

    } catch (error) {
      console.error('❌ Error starting autopilot:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * STOP AUTOPILOT SESSION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.post('/api/autopilot/stop/:sessionId', authMiddleware, async (c) => {
    try {
      const sessionId = c.req.param('sessionId');
      const body = await c.req.json();
      const reason = body.reason || 'user_requested';

      const result = await autopilotEngine.stopSession(sessionId, reason);

      return c.json(result);

    } catch (error) {
      console.error('❌ Error stopping autopilot:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PAUSE AUTOPILOT SESSION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.post('/api/autopilot/pause/:sessionId', authMiddleware, async (c) => {
    try {
      const sessionId = c.req.param('sessionId');

      const result = await autopilotEngine.pauseSession(sessionId);

      return c.json(result);

    } catch (error) {
      console.error('❌ Error pausing autopilot:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * RESUME AUTOPILOT SESSION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.post('/api/autopilot/resume/:sessionId', authMiddleware, async (c) => {
    try {
      const sessionId = c.req.param('sessionId');

      const result = await autopilotEngine.resumeSession(sessionId);

      return c.json(result);

    } catch (error) {
      console.error('❌ Error resuming autopilot:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * GET AUTOPILOT SESSION STATUS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.get('/api/autopilot/status/:sessionId', authMiddleware, async (c) => {
    try {
      const sessionId = c.req.param('sessionId');

      const status = await autopilotEngine.getSessionStatus(sessionId);

      return c.json({
        success: true,
        status
      });

    } catch (error) {
      console.error('❌ Error getting autopilot status:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * GET AUTOPILOT SESSION TRADES
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.get('/api/autopilot/trades/:sessionId', authMiddleware, async (c) => {
    try {
      const sessionId = c.req.param('sessionId');
      const limit = parseInt(c.req.query('limit') || '50');

      const trades = await autopilotEngine.getSessionTrades(sessionId, limit);

      return c.json({
        success: true,
        trades
      });

    } catch (error) {
      console.error('❌ Error getting autopilot trades:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * GET ALL USER AUTOPILOT SESSIONS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.get('/api/autopilot/sessions', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');

      const result = await pool.query(`
        SELECT 
          id,
          status,
          mode,
          initial_balance,
          current_balance,
          target_amount,
          strategies,
          started_at,
          stopped_at,
          stop_reason,
          (current_balance - initial_balance) as profit_loss,
          ((current_balance - initial_balance) / initial_balance * 100) as profit_loss_percent,
          ((current_balance - initial_balance) / (target_amount - initial_balance) * 100) as progress
        FROM autopilot_sessions
        WHERE user_id = $1
        ORDER BY started_at DESC
        LIMIT 20
      `, [userId]);

      return c.json({
        success: true,
        sessions: result.rows
      });

    } catch (error) {
      console.error('❌ Error getting autopilot sessions:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * GET AUTOPILOT PERFORMANCE METRICS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.get('/api/autopilot/performance/:sessionId', authMiddleware, async (c) => {
    try {
      const sessionId = c.req.param('sessionId');

      // Get session data
      const sessionResult = await pool.query(`
        SELECT * FROM autopilot_sessions WHERE id = $1
      `, [sessionId]);

      if (sessionResult.rows.length === 0) {
        return c.json({
          success: false,
          error: 'Session not found'
        }, 404);
      }

      const session = sessionResult.rows[0];

      // Get trades statistics
      const tradesResult = await pool.query(`
        SELECT 
          COUNT(*) as total_trades,
          SUM(CASE WHEN side = 'buy' THEN 1 ELSE 0 END) as buy_trades,
          SUM(CASE WHEN side = 'sell' THEN 1 ELSE 0 END) as sell_trades,
          AVG(CASE WHEN side = 'sell' THEN 
            (price - (SELECT AVG(price) FROM trades t2 WHERE t2.symbol = trades.symbol AND t2.side = 'buy' AND t2.user_id = trades.user_id))
            ELSE NULL 
          END) as avg_profit_per_trade
        FROM trades
        WHERE autopilot_session_id = $1
      `, [sessionId]);

      const trades = tradesResult.rows[0];

      // Calculate metrics
      const progress = ((parseFloat(session.current_balance) - parseFloat(session.initial_balance)) / 
                       (parseFloat(session.target_amount) - parseFloat(session.initial_balance))) * 100;

      const profitLoss = parseFloat(session.current_balance) - parseFloat(session.initial_balance);
      const profitLossPercent = (profitLoss / parseFloat(session.initial_balance)) * 100;

      // Calculate win rate
      const winRate = trades.sell_trades > 0 
        ? (parseInt(trades.sell_trades) / parseInt(trades.total_trades)) * 100
        : 0;

      return c.json({
        success: true,
        performance: {
          sessionId,
          status: session.status,
          mode: session.mode,
          initialBalance: parseFloat(session.initial_balance),
          currentBalance: parseFloat(session.current_balance),
          targetAmount: parseFloat(session.target_amount),
          progress: Math.min(Math.max(progress, 0), 100),
          profitLoss: profitLoss.toFixed(2),
          profitLossPercent: profitLossPercent.toFixed(2),
          totalTrades: parseInt(trades.total_trades),
          buyTrades: parseInt(trades.buy_trades),
          sellTrades: parseInt(trades.sell_trades),
          winRate: winRate.toFixed(2),
          avgProfitPerTrade: parseFloat(trades.avg_profit_per_trade || 0).toFixed(2),
          startedAt: session.started_at,
          stoppedAt: session.stopped_at,
          duration: session.stopped_at 
            ? Math.floor((new Date(session.stopped_at) - new Date(session.started_at)) / 1000)
            : Math.floor((new Date() - new Date(session.started_at)) / 1000)
        }
      });

    } catch (error) {
      console.error('❌ Error getting autopilot performance:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * GET RISK METRICS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.get('/api/autopilot/risk-metrics', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');

      const metrics = await riskManagement.getRiskMetrics(userId);

      return c.json({
        success: true,
        metrics
      });

    } catch (error) {
      console.error('❌ Error getting risk metrics:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * VALIDATE TRADE BEFORE EXECUTION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.post('/api/autopilot/validate-trade', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      const body = await c.req.json();

      const validation = await riskManagement.validateTrade(userId, body);

      return c.json({
        success: true,
        validation
      });

    } catch (error) {
      console.error('❌ Error validating trade:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * CALCULATE POSITION SIZE
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.post('/api/autopilot/calculate-position-size', authMiddleware, async (c) => {
    try {
      const body = await c.req.json();
      const {
        portfolioValue,
        entryPrice,
        stopLoss
      } = body;

      const positionSize = riskManagement.calculatePositionSizeByRisk(
        portfolioValue,
        entryPrice,
        stopLoss
      );

      return c.json({
        success: true,
        positionSize
      });

    } catch (error) {
      console.error('❌ Error calculating position size:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * EXECUTE MANUAL TRADE (With risk checks)
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.post('/api/autopilot/execute-trade', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      const tradeData = await c.req.json();

      const result = await tradeExecution.executeTrade(userId, tradeData);

      return c.json(result);

    } catch (error) {
      console.error('❌ Error executing trade:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * GET AUTOPILOT STRATEGIES
   * ═══════════════════════════════════════════════════════════════════════════
   */
  app.get('/api/autopilot/strategies', authMiddleware, async (c) => {
    try {
      const strategies = [
        {
          id: 'momentum',
          name: 'Momentum Trading',
          description: 'Follows strong price trends and momentum indicators',
          risk: 'high',
          timeframe: 'short',
          winRate: 65,
          recommended: true
        },
        {
          id: 'mean_reversion',
          name: 'Mean Reversion',
          description: 'Trades based on price returning to average',
          risk: 'medium',
          timeframe: 'medium',
          winRate: 58,
          recommended: true
        },
        {
          id: 'breakout',
          name: 'Breakout Trading',
          description: 'Identifies and trades price breakouts',
          risk: 'high',
          timeframe: 'short',
          winRate: 62,
          recommended: false
        },
        {
          id: 'scalping',
          name: 'Scalping',
          description: 'Very short-term trades for small profits',
          risk: 'very_high',
          timeframe: 'very_short',
          winRate: 55,
          recommended: false
        },
        {
          id: 'swing',
          name: 'Swing Trading',
          description: 'Medium-term position trading',
          risk: 'low',
          timeframe: 'long',
          winRate: 70,
          recommended: true
        }
      ];

      return c.json({
        success: true,
        strategies
      });

    } catch (error) {
      console.error('❌ Error getting strategies:', error);
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });

  console.log('✅ Autopilot API endpoints loaded');
  console.log('   POST /api/autopilot/start');
  console.log('   POST /api/autopilot/stop/:sessionId');
  console.log('   POST /api/autopilot/pause/:sessionId');
  console.log('   POST /api/autopilot/resume/:sessionId');
  console.log('   GET  /api/autopilot/status/:sessionId');
  console.log('   GET  /api/autopilot/trades/:sessionId');
  console.log('   GET  /api/autopilot/sessions');
  console.log('   GET  /api/autopilot/performance/:sessionId');
  console.log('   GET  /api/autopilot/risk-metrics');
  console.log('   POST /api/autopilot/validate-trade');
  console.log('   POST /api/autopilot/calculate-position-size');
  console.log('   POST /api/autopilot/execute-trade');
  console.log('   GET  /api/autopilot/strategies');
};
