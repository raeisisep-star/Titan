/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 📈 BACKTESTING ENGINE SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Advanced backtesting system for strategy validation
 * - Historical data simulation
 * - Performance metrics calculation
 * - Strategy comparison
 * - Risk-adjusted returns
 */

class BacktestingEngine {
  constructor(pool) {
    this.pool = pool;
    
    console.log('📈 Backtesting Engine initialized');
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * CORE BACKTESTING METHODS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Run backtest on historical data
   */
  async runBacktest(userId, params) {
    try {
      const {
        strategyId,
        symbol,
        timeframe,
        startDate,
        endDate,
        initialCapital = 10000,
        positionSize = 0.1, // 10% of capital per trade
        commission = 0.001 // 0.1% commission
      } = params;
      
      // Get strategy details
      const strategy = await this.getStrategy(userId, strategyId);
      if (!strategy) {
        throw new Error('Strategy not found');
      }
      
      // Get historical market data
      const marketData = await this.getHistoricalData(symbol, timeframe, startDate, endDate);
      
      // Initialize backtest state
      const state = {
        capital: initialCapital,
        position: null,
        trades: [],
        equity: [{ date: startDate, value: initialCapital }],
        maxDrawdown: 0,
        peakEquity: initialCapital
      };
      
      // Run simulation
      for (let i = 0; i < marketData.length; i++) {
        const candle = marketData[i];
        
        // Generate signal from strategy
        const signal = await this.generateSignal(strategy, marketData, i);
        
        // Execute trades based on signal
        if (signal && signal.action !== 'HOLD') {
          await this.executeBacktestTrade(state, signal, candle, positionSize, commission);
        }
        
        // Update equity
        this.updateEquity(state, candle);
      }
      
      // Close any open positions
      if (state.position) {
        const lastCandle = marketData[marketData.length - 1];
        await this.closePosition(state, lastCandle, commission);
      }
      
      // Calculate performance metrics
      const metrics = this.calculateMetrics(state, initialCapital);
      
      // Save backtest results
      const backtestId = await this.saveBacktestResults(userId, {
        strategyId,
        symbol,
        timeframe,
        startDate,
        endDate,
        initialCapital,
        trades: state.trades,
        equity: state.equity,
        metrics
      });
      
      return {
        id: backtestId,
        strategy: strategy.name,
        symbol,
        period: { startDate, endDate },
        trades: state.trades,
        equity: state.equity,
        metrics
      };
      
    } catch (error) {
      console.error('❌ Backtest error:', error.message);
      throw error;
    }
  }
  
  /**
   * Execute a backtest trade
   */
  async executeBacktestTrade(state, signal, candle, positionSize, commission) {
    const { capital, position } = state;
    
    if (signal.action === 'BUY' && !position) {
      // Open long position
      const investAmount = capital * positionSize;
      const quantity = investAmount / candle.close;
      const commissionCost = investAmount * commission;
      
      state.position = {
        type: 'LONG',
        entryPrice: candle.close,
        entryDate: candle.timestamp,
        quantity,
        investAmount: investAmount + commissionCost
      };
      
      state.capital -= (investAmount + commissionCost);
      
    } else if (signal.action === 'SELL' && position && position.type === 'LONG') {
      // Close long position
      await this.closePosition(state, candle, commission);
    }
  }
  
  /**
   * Close open position
   */
  async closePosition(state, candle, commission) {
    const { position, trades } = state;
    
    if (!position) return;
    
    const exitValue = position.quantity * candle.close;
    const commissionCost = exitValue * commission;
    const netExitValue = exitValue - commissionCost;
    
    const pnl = netExitValue - position.investAmount;
    const pnlPercent = (pnl / position.investAmount) * 100;
    
    // Record trade
    trades.push({
      type: position.type,
      entryPrice: position.entryPrice,
      entryDate: position.entryDate,
      exitPrice: candle.close,
      exitDate: candle.timestamp,
      quantity: position.quantity,
      pnl,
      pnlPercent,
      duration: new Date(candle.timestamp) - new Date(position.entryDate)
    });
    
    // Update capital
    state.capital += netExitValue;
    state.position = null;
  }
  
  /**
   * Update equity curve
   */
  updateEquity(state, candle) {
    let totalEquity = state.capital;
    
    // Add position value if open
    if (state.position) {
      totalEquity += state.position.quantity * candle.close;
    }
    
    // Track equity
    state.equity.push({
      date: candle.timestamp,
      value: totalEquity
    });
    
    // Update peak and drawdown
    if (totalEquity > state.peakEquity) {
      state.peakEquity = totalEquity;
    }
    
    const drawdown = ((state.peakEquity - totalEquity) / state.peakEquity) * 100;
    if (drawdown > state.maxDrawdown) {
      state.maxDrawdown = drawdown;
    }
  }
  
  /**
   * Calculate performance metrics
   */
  calculateMetrics(state, initialCapital) {
    const { trades, equity, maxDrawdown } = state;
    
    if (trades.length === 0) {
      return {
        totalTrades: 0,
        winRate: 0,
        totalReturn: 0,
        totalReturnPercent: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        profitFactor: 0,
        avgWin: 0,
        avgLoss: 0
      };
    }
    
    // Basic metrics
    const finalEquity = equity[equity.length - 1].value;
    const totalReturn = finalEquity - initialCapital;
    const totalReturnPercent = (totalReturn / initialCapital) * 100;
    
    // Win rate
    const winningTrades = trades.filter(t => t.pnl > 0);
    const losingTrades = trades.filter(t => t.pnl < 0);
    const winRate = (winningTrades.length / trades.length) * 100;
    
    // Average win/loss
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length
      : 0;
    
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length)
      : 0;
    
    // Profit factor
    const totalProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
    
    // Sharpe ratio (simplified)
    const returns = [];
    for (let i = 1; i < equity.length; i++) {
      const ret = (equity[i].value - equity[i-1].value) / equity[i-1].value;
      returns.push(ret);
    }
    
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0; // Annualized
    
    return {
      totalTrades: trades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: winRate.toFixed(2),
      totalReturn: totalReturn.toFixed(2),
      totalReturnPercent: totalReturnPercent.toFixed(2),
      maxDrawdown: maxDrawdown.toFixed(2),
      sharpeRatio: sharpeRatio.toFixed(2),
      profitFactor: profitFactor === Infinity ? 'Infinity' : profitFactor.toFixed(2),
      avgWin: avgWin.toFixed(2),
      avgLoss: avgLoss.toFixed(2),
      bestTrade: Math.max(...trades.map(t => t.pnl)).toFixed(2),
      worstTrade: Math.min(...trades.map(t => t.pnl)).toFixed(2)
    };
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * STRATEGY & DATA METHODS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Get strategy configuration
   */
  async getStrategy(userId, strategyId) {
    const result = await this.pool.query(`
      SELECT * FROM trading_strategies
      WHERE id = $1 AND user_id = $2
    `, [strategyId, userId]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  }
  
  /**
   * Get historical market data
   */
  async getHistoricalData(symbol, timeframe, startDate, endDate) {
    // First try to get from database
    const result = await this.pool.query(`
      SELECT * FROM market_data
      WHERE symbol = $1 
        AND timeframe = $2
        AND timestamp >= $3
        AND timestamp <= $4
      ORDER BY timestamp ASC
    `, [symbol, timeframe, startDate, endDate]);
    
    if (result.rows.length > 0) {
      return result.rows.map(row => ({
        timestamp: row.timestamp,
        open: parseFloat(row.open),
        high: parseFloat(row.high),
        low: parseFloat(row.low),
        close: parseFloat(row.close),
        volume: parseFloat(row.volume)
      }));
    }
    
    // If not in database, generate sample data (for demo)
    return this.generateSampleData(symbol, timeframe, startDate, endDate);
  }
  
  /**
   * Generate sample historical data
   */
  generateSampleData(symbol, timeframe, startDate, endDate) {
    const data = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    let price = 100; // Starting price
    
    const timeframeMs = this.getTimeframeMs(timeframe);
    
    while (currentDate <= end) {
      // Random walk simulation
      const change = (Math.random() - 0.48) * 2; // Slight upward bias
      const open = price;
      const high = price + Math.abs(Math.random() * 2);
      const low = price - Math.abs(Math.random() * 2);
      const close = price + change;
      const volume = Math.random() * 1000000;
      
      data.push({
        timestamp: new Date(currentDate),
        open,
        high,
        low,
        close,
        volume
      });
      
      price = close;
      currentDate = new Date(currentDate.getTime() + timeframeMs);
    }
    
    return data;
  }
  
  /**
   * Generate trading signal from strategy
   */
  async generateSignal(strategy, marketData, currentIndex) {
    // Simple strategy implementation
    // In production, this would parse strategy rules
    
    if (currentIndex < 20) return { action: 'HOLD' }; // Need history for indicators
    
    // Simple Moving Average Crossover
    const shortPeriod = 10;
    const longPeriod = 20;
    
    const shortMA = this.calculateSMA(marketData, currentIndex, shortPeriod);
    const longMA = this.calculateSMA(marketData, currentIndex, longPeriod);
    
    const prevShortMA = this.calculateSMA(marketData, currentIndex - 1, shortPeriod);
    const prevLongMA = this.calculateSMA(marketData, currentIndex - 1, longPeriod);
    
    // Buy signal: short MA crosses above long MA
    if (prevShortMA <= prevLongMA && shortMA > longMA) {
      return {
        action: 'BUY',
        reason: 'Short MA crossed above Long MA',
        confidence: 0.7
      };
    }
    
    // Sell signal: short MA crosses below long MA
    if (prevShortMA >= prevLongMA && shortMA < longMA) {
      return {
        action: 'SELL',
        reason: 'Short MA crossed below Long MA',
        confidence: 0.7
      };
    }
    
    return { action: 'HOLD' };
  }
  
  /**
   * Calculate Simple Moving Average
   */
  calculateSMA(data, currentIndex, period) {
    let sum = 0;
    for (let i = 0; i < period; i++) {
      sum += data[currentIndex - i].close;
    }
    return sum / period;
  }
  
  /**
   * Save backtest results to database
   */
  async saveBacktestResults(userId, results) {
    const result = await this.pool.query(`
      INSERT INTO backtest_results (
        user_id, strategy_id, symbol, timeframe,
        start_date, end_date, initial_capital,
        final_equity, total_return, win_rate,
        max_drawdown, sharpe_ratio, profit_factor,
        total_trades, results_data, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      RETURNING id
    `, [
      userId,
      results.strategyId,
      results.symbol,
      results.timeframe,
      results.startDate,
      results.endDate,
      results.initialCapital,
      results.equity[results.equity.length - 1].value,
      results.metrics.totalReturn,
      results.metrics.winRate,
      results.metrics.maxDrawdown,
      results.metrics.sharpeRatio,
      results.metrics.profitFactor,
      results.metrics.totalTrades,
      JSON.stringify({ trades: results.trades, equity: results.equity })
    ]);
    
    return result.rows[0].id;
  }
  
  /**
   * Get backtest history for user
   */
  async getBacktestHistory(userId, limit = 50) {
    const result = await this.pool.query(`
      SELECT 
        br.id,
        br.strategy_id,
        ts.name as strategy_name,
        br.symbol,
        br.timeframe,
        br.start_date,
        br.end_date,
        br.initial_capital,
        br.final_equity,
        br.total_return,
        br.win_rate,
        br.max_drawdown,
        br.sharpe_ratio,
        br.total_trades,
        br.created_at
      FROM backtest_results br
      LEFT JOIN trading_strategies ts ON br.strategy_id = ts.id
      WHERE br.user_id = $1
      ORDER BY br.created_at DESC
      LIMIT $2
    `, [userId, limit]);
    
    return result.rows.map(row => ({
      id: row.id,
      strategy: {
        id: row.strategy_id,
        name: row.strategy_name
      },
      symbol: row.symbol,
      timeframe: row.timeframe,
      period: {
        start: row.start_date,
        end: row.end_date
      },
      capital: {
        initial: parseFloat(row.initial_capital),
        final: parseFloat(row.final_equity)
      },
      metrics: {
        totalReturn: parseFloat(row.total_return),
        winRate: parseFloat(row.win_rate),
        maxDrawdown: parseFloat(row.max_drawdown),
        sharpeRatio: parseFloat(row.sharpe_ratio),
        totalTrades: parseInt(row.total_trades)
      },
      createdAt: row.created_at
    }));
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * UTILITY METHODS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Convert timeframe to milliseconds
   */
  getTimeframeMs(timeframe) {
    const timeframes = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return timeframes[timeframe] || timeframes['1h'];
  }
}

// Singleton instance
let backtestingEngine;

function getBacktestingEngine(pool) {
  if (!backtestingEngine) {
    backtestingEngine = new BacktestingEngine(pool);
  }
  return backtestingEngine;
}

module.exports = { BacktestingEngine, getBacktestingEngine };
