/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📊 ANALYTICS SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * سرویس تحلیل و گزارش‌گیری
 * - تحلیل عملکرد پرتفولیو
 * - آمار معاملات
 * - متریک‌های AI
 * - گزارشات زمان‌واقعی
 */

class AnalyticsService {
  constructor(pool) {
    this.pool = pool;
    
    console.log('📊 Analytics Service initialized');
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PORTFOLIO ANALYTICS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get portfolio performance metrics
   */
  async getPortfolioPerformance(userId, timeframe = '30d') {
    try {
      const interval = this.getTimeframeInterval(timeframe);
      
      // Get current portfolio value
      const currentValue = await this.pool.query(`
        SELECT 
          COALESCE(SUM(p.quantity * p.entry_price), 0) as invested_value,
          COUNT(DISTINCT p.id) as positions_count
        FROM positions p
        INNER JOIN portfolios pf ON p.portfolio_id = pf.id
        WHERE pf.user_id = $1 AND p.status = 'open'
      `, [userId]);
      
      // Get user portfolio balance
      const balance = await this.pool.query(`
        SELECT COALESCE(SUM(available_balance), 0) as balance 
        FROM portfolios 
        WHERE user_id = $1
      `, [userId]);
      
      const totalValue = parseFloat(currentValue.rows[0].invested_value) + parseFloat(balance.rows[0].balance);
      
      // Get historical performance
      const history = await this.pool.query(`
        SELECT 
          DATE(ps.created_at) as date,
          AVG(ps.total_balance) as avg_value,
          MAX(ps.total_balance) as max_value,
          MIN(ps.total_balance) as min_value
        FROM portfolio_snapshots ps
        INNER JOIN portfolios pf ON ps.portfolio_id = pf.id
        WHERE pf.user_id = $1 AND ps.created_at >= NOW() - $2::interval
        GROUP BY DATE(ps.created_at)
        ORDER BY date
      `, [userId, interval]);
      
      // Calculate metrics
      const startValue = history.rows.length > 0 ? history.rows[0].avg_value : totalValue;
      const profitLoss = totalValue - startValue;
      const profitLossPercent = startValue > 0 ? (profitLoss / startValue) * 100 : 0;
      
      // Get peak value for drawdown calculation
      const peakValue = history.rows.length > 0 
        ? Math.max(...history.rows.map(r => parseFloat(r.max_value)))
        : totalValue;
      
      const drawdown = peakValue > 0 ? ((peakValue - totalValue) / peakValue) * 100 : 0;
      
      return {
        current: {
          totalValue,
          investedValue: parseFloat(currentValue.rows[0].invested_value),
          cash: parseFloat(balance.rows[0].balance),
          positionsCount: parseInt(currentValue.rows[0].positions_count)
        },
        performance: {
          profitLoss,
          profitLossPercent: profitLossPercent.toFixed(2),
          startValue,
          peakValue,
          drawdown: drawdown.toFixed(2),
          timeframe
        },
        history: history.rows.map(r => ({
          date: r.date,
          value: parseFloat(r.avg_value),
          high: parseFloat(r.max_value),
          low: parseFloat(r.min_value)
        }))
      };
      
    } catch (error) {
      console.error('❌ Portfolio performance error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get portfolio allocation breakdown
   */
  async getPortfolioAllocation(userId) {
    try {
      const result = await this.pool.query(`
        SELECT 
          m.symbol,
          p.quantity,
          p.entry_price as average_price,
          p.quantity * p.entry_price as position_value,
          p.quantity * p.entry_price as total_invested
        FROM positions p
        INNER JOIN portfolios pf ON p.portfolio_id = pf.id
        INNER JOIN markets m ON p.market_id = m.id
        WHERE pf.user_id = $1 AND p.status = 'open'
        ORDER BY position_value DESC
      `, [userId]);
      
      const totalValue = result.rows.reduce((sum, r) => sum + parseFloat(r.position_value), 0);
      
      return {
        totalValue,
        positions: result.rows.map(r => ({
          symbol: r.symbol,
          quantity: parseFloat(r.quantity),
          avgPrice: parseFloat(r.average_price),
          value: parseFloat(r.position_value),
          allocation: totalValue > 0 ? ((parseFloat(r.position_value) / totalValue) * 100).toFixed(2) : 0,
          invested: parseFloat(r.total_invested),
          pnl: parseFloat(r.position_value) - parseFloat(r.total_invested),
          pnlPercent: parseFloat(r.total_invested) > 0 
            ? (((parseFloat(r.position_value) - parseFloat(r.total_invested)) / parseFloat(r.total_invested)) * 100).toFixed(2)
            : 0
        }))
      };
      
    } catch (error) {
      console.error('❌ Portfolio allocation error:', error.message);
      throw error;
    }
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * TRADING ANALYTICS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get trading statistics
   */
  async getTradingStats(userId, timeframe = '30d') {
    try {
      const interval = this.getTimeframeInterval(timeframe);
      
      const result = await this.pool.query(`
        SELECT 
          COUNT(*) as total_trades,
          SUM(CASE WHEN side = 'BUY' THEN 1 ELSE 0 END) as buy_trades,
          SUM(CASE WHEN side = 'SELL' THEN 1 ELSE 0 END) as sell_trades,
          SUM(CASE WHEN status = 'FILLED' THEN 1 ELSE 0 END) as completed_trades,
          SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed_trades,
          AVG(price * quantity) as avg_trade_size,
          SUM(commission) as total_fees,
          COUNT(DISTINCT symbol) as symbols_traded,
          COUNT(DISTINCT DATE(executed_at)) as trading_days
        FROM trades
        WHERE user_id = $1 AND executed_at >= NOW() - $2::interval
      `, [userId, interval]);
      
      const stats = result.rows[0];
      
      // Get win rate (for closed positions)
      const winRate = await this.pool.query(`
        SELECT 
          COUNT(*) as closed_positions,
          SUM(CASE WHEN (exit_price - entry_price) * quantity > 0 THEN 1 ELSE 0 END) as winning_positions
        FROM (
          SELECT 
            symbol,
            AVG(CASE WHEN side = 'BUY' THEN price ELSE NULL END) as entry_price,
            AVG(CASE WHEN side = 'SELL' THEN price ELSE NULL END) as exit_price,
            SUM(CASE WHEN side = 'BUY' THEN quantity ELSE -quantity END) as quantity
          FROM trades
          WHERE user_id = $1 AND executed_at >= NOW() - $2::interval
          GROUP BY symbol
          HAVING SUM(CASE WHEN side = 'BUY' THEN quantity ELSE -quantity END) = 0
        ) closed_positions
      `, [userId, interval]);
      
      const closedCount = parseInt(winRate.rows[0]?.closed_positions || 0);
      const winningCount = parseInt(winRate.rows[0]?.winning_positions || 0);
      
      return {
        totalTrades: parseInt(stats.total_trades),
        buyTrades: parseInt(stats.buy_trades),
        sellTrades: parseInt(stats.sell_trades),
        completedTrades: parseInt(stats.completed_trades),
        failedTrades: parseInt(stats.failed_trades),
        avgTradeSize: parseFloat(stats.avg_trade_size || 0).toFixed(2),
        totalFees: parseFloat(stats.total_fees || 0).toFixed(2),
        symbolsTraded: parseInt(stats.symbols_traded),
        tradingDays: parseInt(stats.trading_days),
        winRate: closedCount > 0 ? ((winningCount / closedCount) * 100).toFixed(2) : 0,
        closedPositions: closedCount,
        winningPositions: winningCount,
        timeframe
      };
      
    } catch (error) {
      console.error('❌ Trading stats error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get trading activity timeline
   */
  async getTradingTimeline(userId, limit = 50) {
    try {
      const result = await this.pool.query(`
        SELECT 
          id,
          symbol,
          side,
          type,
          quantity,
          price,
          status,
          commission as fee,
          strategy,
          agent_id,
          executed_at
        FROM trades
        WHERE user_id = $1
        ORDER BY executed_at DESC
        LIMIT $2
      `, [userId, limit]);
      
      return result.rows.map(trade => ({
        id: trade.id,
        symbol: trade.symbol,
        side: trade.side,
        type: trade.type,
        quantity: parseFloat(trade.quantity),
        price: parseFloat(trade.price),
        value: parseFloat(trade.quantity) * parseFloat(trade.price),
        status: trade.status,
        fee: parseFloat(trade.fee || 0),
        strategy: trade.strategy,
        agentId: trade.agent_id,
        timestamp: trade.executed_at
      }));
      
    } catch (error) {
      console.error('❌ Trading timeline error:', error.message);
      throw error;
    }
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * AI ANALYTICS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get AI agents performance
   */
  async getAIAgentsPerformance() {
    try {
      const result = await this.pool.query(`
        SELECT 
          a.agent_id,
          a.name,
          a.type,
          a.status,
          COUNT(d.id) as total_decisions,
          AVG(d.confidence) as avg_confidence,
          SUM(CASE WHEN d.decision_type = 'BUY' THEN 1 ELSE 0 END) as buy_signals,
          SUM(CASE WHEN d.decision_type = 'SELL' THEN 1 ELSE 0 END) as sell_signals,
          SUM(CASE WHEN d.decision_type = 'HOLD' THEN 1 ELSE 0 END) as hold_signals,
          a.performance_metrics
        FROM ai_agents a
        LEFT JOIN ai_decisions d ON a.agent_id = d.agent_id 
          AND d.created_at >= NOW() - INTERVAL '30 days'
        GROUP BY a.agent_id, a.name, a.type, a.status, a.performance_metrics
        ORDER BY total_decisions DESC
      `);
      
      return result.rows.map(agent => ({
        agentId: agent.agent_id,
        name: agent.name,
        type: agent.type,
        status: agent.status,
        totalDecisions: parseInt(agent.total_decisions || 0),
        avgConfidence: parseFloat(agent.avg_confidence || 0).toFixed(2),
        signals: {
          buy: parseInt(agent.buy_signals || 0),
          sell: parseInt(agent.sell_signals || 0),
          hold: parseInt(agent.hold_signals || 0)
        },
        metrics: agent.performance_metrics
      }));
      
    } catch (error) {
      console.error('❌ AI agents performance error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get AI decisions analysis
   */
  async getAIDecisionsAnalysis(userId, timeframe = '7d') {
    try {
      const interval = this.getTimeframeInterval(timeframe);
      
      const result = await this.pool.query(`
        SELECT 
          DATE(d.created_at) as date,
          d.decision_type,
          COUNT(*) as count,
          AVG(d.confidence) as avg_confidence
        FROM ai_decisions d
        WHERE d.user_id = $1 AND d.created_at >= NOW() - $2::interval
        GROUP BY DATE(d.created_at), d.decision_type
        ORDER BY date, d.decision_type
      `, [userId, interval]);
      
      // Group by date
      const byDate = {};
      result.rows.forEach(row => {
        const date = row.date.toISOString().split('T')[0];
        if (!byDate[date]) {
          byDate[date] = { date, buy: 0, sell: 0, hold: 0, avgConfidence: 0 };
        }
        byDate[date][row.decision_type.toLowerCase()] = parseInt(row.count);
        byDate[date].avgConfidence = parseFloat(row.avg_confidence);
      });
      
      return Object.values(byDate);
      
    } catch (error) {
      console.error('❌ AI decisions analysis error:', error.message);
      throw error;
    }
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * SYSTEM METRICS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get system-wide metrics
   */
  async getSystemMetrics() {
    try {
      // Total users
      const users = await this.pool.query(`
        SELECT COUNT(*) as total FROM users
      `);
      
      // Active autopilot sessions
      const sessions = await this.pool.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'running' THEN 1 ELSE 0 END) as active
        FROM autopilot_sessions
      `);
      
      // Total trades (last 24h)
      const trades = await this.pool.query(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'FILLED' THEN 1 ELSE 0 END) as successful
        FROM trades
        WHERE executed_at >= NOW() - INTERVAL '24 hours'
      `);
      
      // AI decisions (last 24h)
      const aiDecisions = await this.pool.query(`
        SELECT COUNT(*) as total FROM ai_decisions
        WHERE created_at >= NOW() - INTERVAL '24 hours'
      `);
      
      // Total portfolio value
      const portfolioValue = await this.pool.query(`
        SELECT SUM(p.quantity * p.entry_price) as total
        FROM positions p
        WHERE p.status = 'open'
      `);
      
      return {
        users: {
          total: parseInt(users.rows[0].total)
        },
        autopilot: {
          totalSessions: parseInt(sessions.rows[0].total),
          activeSessions: parseInt(sessions.rows[0].active)
        },
        trades: {
          last24h: parseInt(trades.rows[0].total),
          successful: parseInt(trades.rows[0].successful)
        },
        ai: {
          decisionsLast24h: parseInt(aiDecisions.rows[0].total)
        },
        portfolio: {
          totalValue: parseFloat(portfolioValue.rows[0].total || 0)
        },
        timestamp: new Date()
      };
      
    } catch (error) {
      console.error('❌ System metrics error:', error.message);
      throw error;
    }
  }
  
  /**
   * Get user activity metrics
   */
  async getUserActivity(userId, timeframe = '7d') {
    try {
      const interval = this.getTimeframeInterval(timeframe);
      
      const result = await this.pool.query(`
        SELECT 
          DATE(activity_time) as date,
          COUNT(*) as actions
        FROM (
          SELECT executed_at as activity_time FROM trades WHERE user_id = $1
          UNION ALL
          SELECT started_at as activity_time FROM autopilot_sessions WHERE user_id = $1
          UNION ALL
          SELECT created_at as activity_time FROM ai_conversations WHERE user_id = $1
        ) activities
        WHERE activity_time >= NOW() - $2::interval
        GROUP BY DATE(activity_time)
        ORDER BY date
      `, [userId, interval]);
      
      return result.rows.map(row => ({
        date: row.date,
        actions: parseInt(row.actions)
      }));
      
    } catch (error) {
      console.error('❌ User activity error:', error.message);
      throw error;
    }
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * UTILITY METHODS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  getTimeframeInterval(timeframe) {
    const intervals = {
      '24h': '1 day',
      '7d': '7 days',
      '30d': '30 days',
      '90d': '90 days',
      '1y': '1 year'
    };
    return intervals[timeframe] || '30 days';
  }
}

// Singleton instance
let analyticsService;

function getAnalyticsService(pool) {
  if (!analyticsService) {
    analyticsService = new AnalyticsService(pool);
  }
  return analyticsService;
}

module.exports = { AnalyticsService, getAnalyticsService };
