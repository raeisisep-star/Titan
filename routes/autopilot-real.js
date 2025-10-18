/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🤖 AUTOPILOT REAL API ROUTES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * API endpoints for Autopilot trading system
 */

const { getAutopilotEngine } = require('../services/autopilot-engine');
const { getRiskManagementService } = require('../services/risk-management');

module.exports = function(app, pool, redisClient) {
  
  const autopilot = getAutopilotEngine(pool);
  const riskService = getRiskManagementService(pool);
  
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
   * AUTOPILOT SESSION MANAGEMENT
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Start Autopilot session
   * POST /api/autopilot/start
   */
  app.post('/api/autopilot/start', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const {
      targetAmount,
      initialBalance,
      mode = 'MODERATE',
      strategies = ['MOMENTUM', 'MEAN_REVERSION'],
      maxDuration = 24
    } = body;
    
    // Validate parameters
    if (!targetAmount || !initialBalance) {
      return c.json({
        success: false,
        error: 'targetAmount and initialBalance are required'
      }, 400);
    }
    
    if (!['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE'].includes(mode)) {
      return c.json({
        success: false,
        error: 'Invalid mode. Must be CONSERVATIVE, MODERATE, or AGGRESSIVE'
      }, 400);
    }
    
    // Start autopilot
    const result = await autopilot.startSession(userId, {
      targetAmount,
      initialBalance,
      mode,
      strategies,
      maxDuration
    });
    
    return c.json(result);
  });
  
  /**
   * Stop Autopilot session
   * POST /api/autopilot/stop
   */
  app.post('/api/autopilot/stop', authMiddleware, async (c) => {
    const userId = c.get('userId');
    
    const result = await autopilot.stopSession(userId, 'USER_STOPPED');
    
    return c.json(result);
  });
  
  /**
   * Get Autopilot status
   * GET /api/autopilot/status
   */
  app.get('/api/autopilot/status', authMiddleware, async (c) => {
    const userId = c.get('userId');
    
    try {
      // Get active session
      const sessionResult = await pool.query(`
        SELECT * FROM autopilot_sessions
        WHERE user_id = $1 AND status = 'running'
        ORDER BY started_at DESC
        LIMIT 1
      `, [userId]);
      
      if (sessionResult.rows.length === 0) {
        return c.json({
          success: true,
          active: false,
          message: 'No active autopilot session'
        });
      }
      
      const session = sessionResult.rows[0];
      
      // Get performance
      const performance = await autopilot.getSessionPerformance(session.id);
      
      // Get recent trades
      const tradesResult = await pool.query(`
        SELECT 
          at.*,
          t.status,
          t.created_at as executed_at
        FROM autopilot_trades at
        JOIN trades t ON at.trade_id = t.id
        WHERE at.session_id = $1
        ORDER BY t.created_at DESC
        LIMIT 10
      `, [session.id]);
      
      return c.json({
        success: true,
        active: true,
        session: {
          id: session.id,
          mode: session.mode,
          status: session.status,
          startedAt: session.started_at,
          strategies: session.strategies
        },
        performance,
        recentTrades: tradesResult.rows
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Get Autopilot history
   * GET /api/autopilot/history
   */
  app.get('/api/autopilot/history', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const limit = parseInt(c.req.query('limit')) || 10;
    
    try {
      const result = await pool.query(`
        SELECT 
          id,
          mode,
          status,
          initial_balance,
          target_amount,
          current_balance,
          total_trades,
          winning_trades,
          progress_percent,
          started_at,
          stopped_at,
          stop_reason,
          CASE 
            WHEN stopped_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (stopped_at - started_at)) / 3600
            ELSE EXTRACT(EPOCH FROM (NOW() - started_at)) / 3600
          END as duration_hours
        FROM autopilot_sessions
        WHERE user_id = $1
        ORDER BY started_at DESC
        LIMIT $2
      `, [userId, limit]);
      
      return c.json({
        success: true,
        sessions: result.rows.map(s => ({
          ...s,
          profit: parseFloat(s.current_balance) - parseFloat(s.initial_balance),
          profitPercent: ((parseFloat(s.current_balance) - parseFloat(s.initial_balance)) / parseFloat(s.initial_balance)) * 100,
          winRate: s.total_trades > 0 ? (s.winning_trades / s.total_trades * 100) : 0
        }))
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * RISK MANAGEMENT
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get risk analysis
   * GET /api/autopilot/risk-analysis
   */
  app.get('/api/autopilot/risk-analysis', authMiddleware, async (c) => {
    const userId = c.get('userId');
    
    try {
      // Get portfolio data
      const portfolio = await riskService.getPortfolioData(userId);
      
      // Get diversification analysis
      const diversification = await riskService.analyzePortfolioDiversification(userId);
      
      // Check emergency stop status
      const emergencyCheck = await riskService.shouldEmergencyStop(userId);
      
      // Get rebalancing suggestions
      const rebalancing = await riskService.suggestRebalancing(userId);
      
      return c.json({
        success: true,
        portfolio: {
          totalValue: portfolio.totalValue,
          investedValue: portfolio.investedValue,
          cash: portfolio.cash,
          symbolCount: portfolio.symbolCount
        },
        diversification: {
          score: diversification.diversificationScore,
          symbolCount: diversification.symbolCount,
          minRequired: diversification.minRequired,
          allocations: diversification.allocations,
          recommendation: diversification.recommendation
        },
        riskStatus: {
          emergencyStop: emergencyCheck.emergencyStop,
          drawdown: (emergencyCheck.drawdown * 100).toFixed(2),
          dailyLoss: emergencyCheck.dailyLoss
        },
        rebalancing
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Calculate position size
   * POST /api/autopilot/calculate-position
   */
  app.post('/api/autopilot/calculate-position', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const {
      symbol,
      entryPrice,
      stopLoss,
      riskPerTrade
    } = body;
    
    if (!symbol || !entryPrice || !stopLoss) {
      return c.json({
        success: false,
        error: 'symbol, entryPrice, and stopLoss are required'
      }, 400);
    }
    
    try {
      const result = await riskService.calculatePositionSize(userId, {
        symbol,
        entryPrice,
        stopLoss,
        riskPerTrade
      });
      
      return c.json({
        success: true,
        ...result
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Calculate protection levels
   * POST /api/autopilot/calculate-protection
   */
  app.post('/api/autopilot/calculate-protection', authMiddleware, async (c) => {
    const body = await c.req.json();
    
    const {
      symbol,
      entryPrice,
      side,
      riskRewardRatio
    } = body;
    
    if (!symbol || !entryPrice || !side) {
      return c.json({
        success: false,
        error: 'symbol, entryPrice, and side are required'
      }, 400);
    }
    
    try {
      const result = await riskService.calculateProtectionLevels({
        symbol,
        entryPrice,
        side,
        riskRewardRatio
      });
      
      return c.json({
        success: true,
        ...result
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PERFORMANCE & ANALYTICS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get session performance
   * GET /api/autopilot/performance/:sessionId
   */
  app.get('/api/autopilot/performance/:sessionId', authMiddleware, async (c) => {
    const userId = c.get('userId');
    const sessionId = c.req.param('sessionId');
    
    try {
      // Verify session belongs to user
      const check = await pool.query(`
        SELECT id FROM autopilot_sessions
        WHERE id = $1 AND user_id = $2
      `, [sessionId, userId]);
      
      if (check.rows.length === 0) {
        return c.json({
          success: false,
          error: 'Session not found'
        }, 404);
      }
      
      const performance = await autopilot.getSessionPerformance(sessionId);
      
      // Get trade details
      const tradesResult = await pool.query(`
        SELECT 
          at.*,
          t.status,
          t.price as execution_price,
          t.fee,
          t.created_at as executed_at
        FROM autopilot_trades at
        JOIN trades t ON at.trade_id = t.id
        WHERE at.session_id = $1
        ORDER BY t.created_at DESC
      `, [sessionId]);
      
      return c.json({
        success: true,
        performance,
        trades: tradesResult.rows
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Get AI agents performance
   * GET /api/autopilot/agents-performance
   */
  app.get('/api/autopilot/agents-performance', authMiddleware, async (c) => {
    try {
      const result = await pool.query(`
        SELECT 
          a.agent_id,
          a.name,
          a.type,
          COUNT(d.id) as total_decisions,
          AVG(d.confidence) as avg_confidence,
          SUM(CASE WHEN d.decision_type = 'BUY' THEN 1 ELSE 0 END) as buy_signals,
          SUM(CASE WHEN d.decision_type = 'SELL' THEN 1 ELSE 0 END) as sell_signals,
          a.performance_metrics
        FROM ai_agents a
        LEFT JOIN ai_decisions d ON a.agent_id = d.agent_id
        WHERE a.status = 'active'
        GROUP BY a.agent_id, a.name, a.type, a.performance_metrics
        ORDER BY a.agent_id
      `);
      
      return c.json({
        success: true,
        agents: result.rows.map(agent => ({
          agentId: agent.agent_id,
          name: agent.name,
          type: agent.type,
          totalDecisions: parseInt(agent.total_decisions || 0),
          avgConfidence: parseFloat(agent.avg_confidence || 0).toFixed(2),
          buySignals: parseInt(agent.buy_signals || 0),
          sellSignals: parseInt(agent.sell_signals || 0),
          metrics: agent.performance_metrics
        }))
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  /**
   * Get Autopilot statistics
   * GET /api/autopilot/statistics
   */
  app.get('/api/autopilot/statistics', authMiddleware, async (c) => {
    const userId = c.get('userId');
    
    try {
      const stats = await pool.query(`
        SELECT 
          COUNT(*) as total_sessions,
          SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as active_sessions,
          SUM(CASE WHEN stop_reason = 'TARGET_REACHED' THEN 1 ELSE 0 END) as successful_sessions,
          SUM(total_trades) as total_trades,
          SUM(winning_trades) as winning_trades,
          AVG(progress_percent) as avg_progress,
          SUM(current_balance - initial_balance) as total_profit
        FROM autopilot_sessions
        WHERE user_id = $1
      `, [userId]);
      
      const data = stats.rows[0];
      
      return c.json({
        success: true,
        statistics: {
          totalSessions: parseInt(data.total_sessions || 0),
          activeSessions: parseInt(data.active_sessions || 0),
          successfulSessions: parseInt(data.successful_sessions || 0),
          totalTrades: parseInt(data.total_trades || 0),
          winningTrades: parseInt(data.winning_trades || 0),
          winRate: data.total_trades > 0 ? (data.winning_trades / data.total_trades * 100).toFixed(2) : 0,
          avgProgress: parseFloat(data.avg_progress || 0).toFixed(2),
          totalProfit: parseFloat(data.total_profit || 0).toFixed(2)
        }
      });
      
    } catch (error) {
      return c.json({
        success: false,
        error: error.message
      }, 500);
    }
  });
  
  console.log('✅ Autopilot Real APIs loaded');
};
