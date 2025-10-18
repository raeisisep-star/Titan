/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 ANALYTICS & MONITORING REAL API ROUTES
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Comprehensive analytics for portfolio, trading, AI, and system metrics
 */

const { getAnalyticsService } = require('../services/analytics-service');

module.exports = function(app, pool, redisClient) {
  
  const analyticsService = getAnalyticsService(pool);
  
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
   * PORTFOLIO ANALYTICS ENDPOINTS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get portfolio performance metrics
   * GET /api/analytics/portfolio/performance
   * Query params: timeframe (7d, 30d, 90d, 1y, all)
   */
  app.get('/api/analytics/portfolio/performance', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      const timeframe = c.req.query('timeframe') || '30d';
      const performance = await analyticsService.getPortfolioPerformance(userId, timeframe);

      return c.json({
        success: true,
        data: performance,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting portfolio performance:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get portfolio performance'
      }, 500);
    }
  });

  /**
   * Get portfolio allocation breakdown
   * GET /api/analytics/portfolio/allocation
   */
  app.get('/api/analytics/portfolio/allocation', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');

      const allocation = await analyticsService.getPortfolioAllocation(userId);

      return c.json({
        success: true,
        data: allocation,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting portfolio allocation:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get portfolio allocation'
      }, 500);
    }
  });

  /**
   * Get portfolio history over time
   * GET /api/analytics/portfolio/history
   * Query params: timeframe (7d, 30d, 90d, 1y, all)
   */
  app.get('/api/analytics/portfolio/history', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      
      const timeframe = c.req.query('timeframe') || '30d';
      const performance = await analyticsService.getPortfolioPerformance(userId, timeframe);

      return c.json({
        success: true,
        data: {
          history: performance.history,
          summary: {
            startValue: performance.performance.startValue,
            currentValue: performance.current.totalValue,
            profitLoss: performance.performance.profitLoss,
            profitLossPercent: performance.performance.profitLossPercent,
            peakValue: performance.performance.peakValue,
            drawdown: performance.performance.drawdown
          }
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting portfolio history:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get portfolio history'
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * TRADING ANALYTICS ENDPOINTS
   * ═══════════════════════════════════════════════════════════════════════════
   */

  /**
   * Get trading statistics
   * GET /api/analytics/trading/stats
   * Query params: timeframe (7d, 30d, 90d, 1y, all)
   */
  app.get('/api/analytics/trading/stats', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      
      const timeframe = c.req.query('timeframe') || '30d';
      const stats = await analyticsService.getTradingStats(userId, timeframe);

      return c.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting trading stats:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get trading stats'
      }, 500);
    }
  });

  /**
   * Get trading activity timeline
   * GET /api/analytics/trading/timeline
   * Query params: timeframe (7d, 30d, 90d, 1y, all), limit (default: 50)
   */
  app.get('/api/analytics/trading/timeline', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      
      const timeframe = c.req.query('timeframe') || '30d';
      const limit = parseInt(c.req.query('limit') || '50');
      const timeline = await analyticsService.getTradingTimeline(userId, timeframe, limit);

      return c.json({
        success: true,
        data: {
          trades: timeline,
          count: timeline.length,
          timeframe,
          limit
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting trading timeline:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get trading timeline'
      }, 500);
    }
  });

  /**
   * Get trading performance by symbol
   * GET /api/analytics/trading/by-symbol
   * Query params: timeframe (7d, 30d, 90d, 1y, all)
   */
  app.get('/api/analytics/trading/by-symbol', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      
      const timeframe = c.req.query('timeframe') || '30d';
      const interval = analyticsService.getTimeframeInterval(timeframe);

      const result = await pool.query(`
        SELECT 
          symbol,
          COUNT(*) as trade_count,
          SUM(CASE WHEN side = 'BUY' THEN quantity * price ELSE -quantity * price END) as net_investment,
          SUM(fee) as total_fees,
          AVG(price) as avg_price
        FROM trades
        WHERE user_id = $1 AND created_at >= NOW() - $2::interval
        GROUP BY symbol
        ORDER BY trade_count DESC
      `, [userId, interval]);

      return c.json({
        success: true,
        data: {
          symbols: result.rows.map(row => ({
            symbol: row.symbol,
            tradeCount: parseInt(row.trade_count),
            netInvestment: parseFloat(row.net_investment || 0).toFixed(2),
            totalFees: parseFloat(row.total_fees || 0).toFixed(2),
            avgPrice: parseFloat(row.avg_price || 0).toFixed(2)
          })),
          timeframe
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting trading by symbol:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get trading by symbol'
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * AI ANALYTICS ENDPOINTS
   * ═══════════════════════════════════════════════════════════════════════════
   */

  /**
   * Get AI agents performance metrics
   * GET /api/analytics/ai/agents
   * Query params: timeframe (7d, 30d, 90d, 1y, all)
   */
  app.get('/api/analytics/ai/agents', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      
      const timeframe = c.req.query('timeframe') || '30d';
      const agentsPerf = await analyticsService.getAIAgentsPerformance(userId, timeframe);

      return c.json({
        success: true,
        data: agentsPerf,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting AI agents performance:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get AI agents performance'
      }, 500);
    }
  });

  /**
   * Get AI decisions analysis
   * GET /api/analytics/ai/decisions
   * Query params: timeframe (7d, 30d, 90d, 1y, all)
   */
  app.get('/api/analytics/ai/decisions', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      
      const timeframe = c.req.query('timeframe') || '30d';
      const decisions = await analyticsService.getAIDecisionsAnalysis(userId, timeframe);

      return c.json({
        success: true,
        data: decisions,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting AI decisions:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get AI decisions'
      }, 500);
    }
  });

  /**
   * Get AI provider usage statistics
   * GET /api/analytics/ai/providers
   * Query params: timeframe (7d, 30d, 90d, 1y, all)
   */
  app.get('/api/analytics/ai/providers', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      
      const timeframe = c.req.query('timeframe') || '30d';
      const interval = analyticsService.getTimeframeInterval(timeframe);

      const result = await pool.query(`
        SELECT 
          provider,
          COUNT(*) as usage_count,
          AVG(response_time) as avg_response_time,
          COUNT(CASE WHEN status = 'success' THEN 1 END) as successful_calls,
          COUNT(CASE WHEN status = 'error' THEN 1 END) as failed_calls
        FROM ai_logs
        WHERE user_id = $1 AND created_at >= NOW() - $2::interval
        GROUP BY provider
        ORDER BY usage_count DESC
      `, [userId, interval]);

      return c.json({
        success: true,
        data: {
          providers: result.rows.map(row => ({
            provider: row.provider,
            usageCount: parseInt(row.usage_count),
            avgResponseTime: parseFloat(row.avg_response_time || 0).toFixed(2),
            successfulCalls: parseInt(row.successful_calls),
            failedCalls: parseInt(row.failed_calls),
            successRate: row.usage_count > 0 
              ? ((row.successful_calls / row.usage_count) * 100).toFixed(2)
              : 0
          })),
          timeframe
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting AI providers stats:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get AI providers stats'
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * SYSTEM ANALYTICS ENDPOINTS
   * ═══════════════════════════════════════════════════════════════════════════
   */

  /**
   * Get system-wide metrics
   * GET /api/analytics/system/metrics
   * Query params: timeframe (7d, 30d, 90d, 1y, all)
   */
  app.get('/api/analytics/system/metrics', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      
      const timeframe = c.req.query('timeframe') || '30d';
      const metrics = await analyticsService.getSystemMetrics(timeframe);

      return c.json({
        success: true,
        data: metrics,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting system metrics:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get system metrics'
      }, 500);
    }
  });

  /**
   * Get user activity tracking
   * GET /api/analytics/user/activity
   * Query params: timeframe (7d, 30d, 90d, 1y, all)
   */
  app.get('/api/analytics/user/activity', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      
      const timeframe = c.req.query('timeframe') || '30d';
      const activity = await analyticsService.getUserActivity(userId, timeframe);

      return c.json({
        success: true,
        data: activity,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting user activity:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get user activity'
      }, 500);
    }
  });

  /**
   * Get database health metrics
   * GET /api/analytics/system/health
   */
  app.get('/api/analytics/system/health', async (c) => {
    try {
      // Database connection check
      const dbCheck = await pool.query('SELECT NOW() as time, version() as version');
      
      // Get database size
      const sizeResult = await pool.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);
      
      // Get active connections
      const connResult = await pool.query(`
        SELECT count(*) as active_connections 
        FROM pg_stat_activity 
        WHERE state = 'active'
      `);
      
      // Get table counts
      const tablesResult = await pool.query(`
        SELECT 
          schemaname,
          COUNT(*) as table_count
        FROM pg_tables 
        WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
        GROUP BY schemaname
      `);

      return c.json({
        success: true,
        data: {
          database: {
            connected: true,
            version: dbCheck.rows[0].version,
            size: sizeResult.rows[0].size,
            activeConnections: parseInt(connResult.rows[0].active_connections),
            tables: tablesResult.rows
          },
          server: {
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            nodeVersion: process.version,
            platform: process.platform
          },
          status: 'healthy'
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting system health:', error);
      return c.json({
        success: false,
        data: {
          database: { connected: false },
          status: 'unhealthy',
          error: error.message
        },
        timestamp: new Date().toISOString()
      }, 500);
    }
  });

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * DASHBOARD SUMMARY ENDPOINT
   * ═══════════════════════════════════════════════════════════════════════════
   */

  /**
   * Get complete dashboard summary (combines multiple analytics)
   * GET /api/analytics/dashboard
   * Query params: timeframe (7d, 30d, 90d, 1y, all)
   */
  app.get('/api/analytics/dashboard', authMiddleware, async (c) => {
    try {
      const userId = c.get('userId');
      
      const timeframe = c.req.query('timeframe') || '30d';

      // Fetch all analytics in parallel for better performance
      const [
        portfolioPerf,
        portfolioAlloc,
        tradingStats,
        aiAgentsPerf,
        aiDecisions
      ] = await Promise.all([
        analyticsService.getPortfolioPerformance(userId, timeframe),
        analyticsService.getPortfolioAllocation(userId),
        analyticsService.getTradingStats(userId, timeframe),
        analyticsService.getAIAgentsPerformance(userId, timeframe),
        analyticsService.getAIDecisionsAnalysis(userId, timeframe)
      ]);

      return c.json({
        success: true,
        data: {
          portfolio: {
            current: portfolioPerf.current,
            performance: portfolioPerf.performance,
            allocation: portfolioAlloc
          },
          trading: tradingStats,
          ai: {
            agents: aiAgentsPerf,
            decisions: aiDecisions
          },
          timeframe
        },
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error getting dashboard summary:', error);
      return c.json({
        success: false,
        error: error.message || 'Failed to get dashboard summary'
      }, 500);
    }
  });

  console.log('✅ Analytics API routes loaded (13 endpoints)');
};
