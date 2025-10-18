/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 🛡️ RISK MANAGEMENT SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * سیستم مدیریت ریسک پیشرفته
 * - محاسبه اندازه پوزیشن
 * - مدیریت Stop Loss و Take Profit
 * - محدودیت‌های ریسک
 * - تنوع‌بخشی پرتفولیو
 */

class RiskManagementService {
  constructor(pool) {
    this.pool = pool;
    
    // Risk parameters
    this.params = {
      // Maximum risk per trade as % of portfolio
      maxRiskPerTrade: 0.02, // 2%
      
      // Maximum total exposure as % of portfolio
      maxTotalExposure: 0.80, // 80%
      
      // Maximum position size as % of portfolio
      maxPositionSize: 0.25, // 25%
      
      // Stop loss parameters
      defaultStopLoss: 0.05, // 5% default stop loss
      maxStopLoss: 0.15, // 15% maximum stop loss
      
      // Take profit parameters
      minRiskReward: 1.5, // Minimum 1.5:1 risk-reward ratio
      defaultTakeProfit: 0.10, // 10% default take profit
      
      // Diversification
      maxSymbolAllocation: 0.30, // Max 30% in single symbol
      minDiversification: 5, // At least 5 different symbols
      
      // Drawdown limits
      maxDrawdown: 0.20, // Maximum 20% portfolio drawdown
      dailyLossLimit: 0.05, // Maximum 5% daily loss
      
      // Leverage
      maxLeverage: 2.0, // Maximum 2x leverage
      
      // Volatility adjustment
      highVolatilityThreshold: 0.30, // 30% considered high volatility
      lowVolatilityThreshold: 0.10 // 10% considered low volatility
    };
    
    console.log('🛡️ Risk Management Service initialized');
    console.log(`   Max risk per trade: ${this.params.maxRiskPerTrade * 100}%`);
    console.log(`   Max position size: ${this.params.maxPositionSize * 100}%`);
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * POSITION SIZING
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Calculate optimal position size based on risk parameters
   */
  async calculatePositionSize(userId, params) {
    const {
      symbol,
      entryPrice,
      stopLoss,
      riskPerTrade, // Optional override
      strategy
    } = params;
    
    // Get portfolio value
    const portfolio = await this.getPortfolioData(userId);
    
    // Determine risk amount
    const riskAmount = portfolio.totalValue * (riskPerTrade || this.params.maxRiskPerTrade);
    
    // Calculate risk per unit
    const riskPerUnit = Math.abs(entryPrice - stopLoss);
    
    // Calculate position size
    let positionSize = riskAmount / riskPerUnit;
    
    // Apply maximum position size constraint
    const maxPositionValue = portfolio.totalValue * this.params.maxPositionSize;
    const maxPositionSize = maxPositionValue / entryPrice;
    
    if (positionSize * entryPrice > maxPositionValue) {
      positionSize = maxPositionSize;
    }
    
    // Adjust for volatility
    const volatility = await this.getSymbolVolatility(symbol);
    positionSize = this.adjustForVolatility(positionSize, volatility);
    
    // Adjust for existing exposure
    const existingExposure = await this.getSymbolExposure(userId, symbol);
    if (existingExposure > this.params.maxSymbolAllocation) {
      return {
        positionSize: 0,
        reason: 'Maximum symbol allocation reached',
        recommended: false
      };
    }
    
    return {
      positionSize,
      positionValue: positionSize * entryPrice,
      riskAmount,
      riskPercent: (riskAmount / portfolio.totalValue) * 100,
      maxDrawdown: (riskPerUnit / entryPrice) * 100,
      recommended: true,
      volatilityAdjusted: volatility > this.params.highVolatilityThreshold
    };
  }
  
  /**
   * Adjust position size based on volatility
   */
  adjustForVolatility(positionSize, volatility) {
    if (volatility > this.params.highVolatilityThreshold) {
      // Reduce position size by 30% for high volatility
      return positionSize * 0.7;
    } else if (volatility < this.params.lowVolatilityThreshold) {
      // Increase position size by 20% for low volatility
      return positionSize * 1.2;
    }
    return positionSize;
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * STOP LOSS & TAKE PROFIT CALCULATION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Calculate optimal stop loss and take profit levels
   */
  async calculateProtectionLevels(params) {
    const {
      symbol,
      entryPrice,
      side,
      strategy,
      riskRewardRatio
    } = params;
    
    // Get symbol statistics
    const stats = await this.getSymbolStatistics(symbol);
    
    // Calculate stop loss based on ATR (Average True Range)
    const atr = stats.atr || (entryPrice * this.params.defaultStopLoss);
    
    let stopLoss, takeProfit;
    
    if (side === 'BUY') {
      // For long positions
      stopLoss = entryPrice - (atr * 2); // 2x ATR below entry
      
      // Calculate take profit based on risk-reward ratio
      const risk = entryPrice - stopLoss;
      const reward = risk * (riskRewardRatio || this.params.minRiskReward);
      takeProfit = entryPrice + reward;
      
    } else {
      // For short positions
      stopLoss = entryPrice + (atr * 2); // 2x ATR above entry
      
      const risk = stopLoss - entryPrice;
      const reward = risk * (riskRewardRatio || this.params.minRiskReward);
      takeProfit = entryPrice - reward;
    }
    
    // Validate levels
    const stopLossPercent = Math.abs(entryPrice - stopLoss) / entryPrice;
    if (stopLossPercent > this.params.maxStopLoss) {
      // Adjust if stop loss is too wide
      if (side === 'BUY') {
        stopLoss = entryPrice * (1 - this.params.maxStopLoss);
      } else {
        stopLoss = entryPrice * (1 + this.params.maxStopLoss);
      }
    }
    
    return {
      stopLoss: parseFloat(stopLoss.toFixed(2)),
      takeProfit: parseFloat(takeProfit.toFixed(2)),
      riskAmount: Math.abs(entryPrice - stopLoss),
      rewardAmount: Math.abs(takeProfit - entryPrice),
      riskRewardRatio: Math.abs(takeProfit - entryPrice) / Math.abs(entryPrice - stopLoss),
      stopLossPercent: (Math.abs(entryPrice - stopLoss) / entryPrice * 100).toFixed(2),
      takeProfitPercent: (Math.abs(takeProfit - entryPrice) / entryPrice * 100).toFixed(2)
    };
  }
  
  /**
   * Calculate trailing stop loss
   */
  calculateTrailingStop(currentPrice, entryPrice, side, trailPercent = 0.03) {
    if (side === 'BUY') {
      // For long positions, trail below current price
      return currentPrice * (1 - trailPercent);
    } else {
      // For short positions, trail above current price
      return currentPrice * (1 + trailPercent);
    }
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * RISK VALIDATION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Validate if trade meets risk requirements
   */
  async validateTradeRisk(userId, tradeParams) {
    const validation = {
      passed: true,
      warnings: [],
      errors: [],
      metrics: {}
    };
    
    const portfolio = await this.getPortfolioData(userId);
    const { symbol, side, quantity, entryPrice, stopLoss } = tradeParams;
    
    // Check 1: Position size
    const positionValue = quantity * entryPrice;
    const positionPercent = positionValue / portfolio.totalValue;
    validation.metrics.positionPercent = positionPercent;
    
    if (positionPercent > this.params.maxPositionSize) {
      validation.errors.push('Position size exceeds maximum allowed');
      validation.passed = false;
    }
    
    // Check 2: Risk per trade
    const risk = Math.abs(entryPrice - stopLoss) * quantity;
    const riskPercent = risk / portfolio.totalValue;
    validation.metrics.riskPercent = riskPercent;
    
    if (riskPercent > this.params.maxRiskPerTrade) {
      validation.errors.push('Risk per trade exceeds maximum allowed');
      validation.passed = false;
    }
    
    // Check 3: Total exposure
    const totalExposure = await this.getTotalExposure(userId);
    const newExposure = totalExposure + positionValue;
    const exposurePercent = newExposure / portfolio.totalValue;
    validation.metrics.exposurePercent = exposurePercent;
    
    if (exposurePercent > this.params.maxTotalExposure) {
      validation.warnings.push('Total portfolio exposure is high');
    }
    
    // Check 4: Symbol concentration
    const symbolExposure = await this.getSymbolExposure(userId, symbol);
    const newSymbolExposure = symbolExposure + positionPercent;
    validation.metrics.symbolExposure = newSymbolExposure;
    
    if (newSymbolExposure > this.params.maxSymbolAllocation) {
      validation.errors.push(`${symbol} allocation exceeds maximum`);
      validation.passed = false;
    }
    
    // Check 5: Daily loss limit
    const dailyLoss = await this.getDailyLoss(userId);
    const dailyLossPercent = dailyLoss / portfolio.totalValue;
    validation.metrics.dailyLossPercent = dailyLossPercent;
    
    if (dailyLossPercent > this.params.dailyLossLimit) {
      validation.errors.push('Daily loss limit reached');
      validation.passed = false;
    }
    
    // Check 6: Drawdown
    const drawdown = await this.getCurrentDrawdown(userId);
    validation.metrics.drawdown = drawdown;
    
    if (drawdown > this.params.maxDrawdown) {
      validation.errors.push('Maximum drawdown limit reached');
      validation.passed = false;
    }
    
    return validation;
  }
  
  /**
   * Check if emergency stop should be triggered
   */
  async shouldEmergencyStop(userId) {
    const portfolio = await this.getPortfolioData(userId);
    const drawdown = await this.getCurrentDrawdown(userId);
    const dailyLoss = await this.getDailyLoss(userId);
    
    // Emergency conditions
    const emergencyStop = 
      drawdown > this.params.maxDrawdown ||
      dailyLoss / portfolio.totalValue > this.params.dailyLossLimit;
    
    if (emergencyStop) {
      // Log emergency stop
      await this.pool.query(`
        INSERT INTO risk_events (
          user_id, event_type, severity, description, metrics
        ) VALUES ($1, 'EMERGENCY_STOP', 'CRITICAL', $2, $3)
      `, [
        userId,
        'Emergency stop triggered due to risk limits',
        JSON.stringify({ drawdown, dailyLoss, portfolioValue: portfolio.totalValue })
      ]);
    }
    
    return {
      emergencyStop,
      reason: emergencyStop ? 'Risk limits exceeded' : null,
      drawdown,
      dailyLoss
    };
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PORTFOLIO DIVERSIFICATION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Analyze portfolio diversification
   */
  async analyzePortfolioDiversification(userId) {
    const positions = await this.pool.query(`
      SELECT 
        symbol,
        quantity,
        average_price,
        quantity * average_price as position_value
      FROM portfolio_positions
      WHERE user_id = $1
    `, [userId]);
    
    const portfolio = await this.getPortfolioData(userId);
    const totalValue = portfolio.totalValue;
    
    // Calculate concentration metrics
    const symbolCount = positions.rows.length;
    const allocations = positions.rows.map(p => ({
      symbol: p.symbol,
      value: p.position_value,
      percent: (p.position_value / totalValue) * 100
    }));
    
    // Calculate Herfindahl index (concentration measure)
    const herfindahl = allocations.reduce((sum, a) => {
      return sum + Math.pow(a.percent / 100, 2);
    }, 0);
    
    // Diversification score (0-100, higher is better)
    const diversificationScore = symbolCount >= this.params.minDiversification 
      ? Math.min(100, (1 - herfindahl) * 100)
      : (symbolCount / this.params.minDiversification) * 50;
    
    return {
      symbolCount,
      minRequired: this.params.minDiversification,
      allocations,
      herfindahlIndex: herfindahl,
      diversificationScore: diversificationScore.toFixed(1),
      recommendation: symbolCount < this.params.minDiversification
        ? `Add ${this.params.minDiversification - symbolCount} more symbols for better diversification`
        : 'Portfolio is well diversified'
    };
  }
  
  /**
   * Suggest portfolio rebalancing
   */
  async suggestRebalancing(userId) {
    const diversification = await this.analyzePortfolioDiversification(userId);
    const suggestions = [];
    
    for (const allocation of diversification.allocations) {
      if (allocation.percent > this.params.maxSymbolAllocation * 100) {
        suggestions.push({
          action: 'REDUCE',
          symbol: allocation.symbol,
          currentPercent: allocation.percent,
          targetPercent: this.params.maxSymbolAllocation * 100,
          reason: 'Over-allocated'
        });
      }
    }
    
    if (diversification.symbolCount < this.params.minDiversification) {
      suggestions.push({
        action: 'DIVERSIFY',
        reason: 'Add more symbols to portfolio',
        target: this.params.minDiversification - diversification.symbolCount
      });
    }
    
    return {
      needed: suggestions.length > 0,
      suggestions,
      diversificationScore: diversification.diversificationScore
    };
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * HELPER METHODS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  async getPortfolioData(userId) {
    const result = await this.pool.query(`
      SELECT 
        SUM(quantity * average_price) as total_value,
        COUNT(DISTINCT symbol) as symbol_count
      FROM portfolio_positions
      WHERE user_id = $1
    `, [userId]);
    
    const userBalance = await this.pool.query(`
      SELECT balance FROM users WHERE id = $1
    `, [userId]);
    
    return {
      totalValue: parseFloat(result.rows[0]?.total_value || 0) + parseFloat(userBalance.rows[0]?.balance || 0),
      investedValue: parseFloat(result.rows[0]?.total_value || 0),
      cash: parseFloat(userBalance.rows[0]?.balance || 0),
      symbolCount: parseInt(result.rows[0]?.symbol_count || 0)
    };
  }
  
  async getSymbolExposure(userId, symbol) {
    const result = await this.pool.query(`
      SELECT 
        quantity * average_price as position_value
      FROM portfolio_positions
      WHERE user_id = $1 AND symbol = $2
    `, [userId, symbol]);
    
    if (!result.rows[0]) return 0;
    
    const portfolio = await this.getPortfolioData(userId);
    return result.rows[0].position_value / portfolio.totalValue;
  }
  
  async getTotalExposure(userId) {
    const result = await this.pool.query(`
      SELECT SUM(quantity * average_price) as total_exposure
      FROM portfolio_positions
      WHERE user_id = $1
    `, [userId]);
    
    return parseFloat(result.rows[0]?.total_exposure || 0);
  }
  
  async getDailyLoss(userId) {
    const result = await this.pool.query(`
      SELECT 
        SUM(CASE 
          WHEN side = 'SELL' THEN (price * quantity - fee)
          WHEN side = 'BUY' THEN -(price * quantity + fee)
        END) as pnl
      FROM trades
      WHERE user_id = $1 
        AND DATE(created_at) = CURRENT_DATE
        AND status = 'FILLED'
    `, [userId]);
    
    const pnl = parseFloat(result.rows[0]?.pnl || 0);
    return pnl < 0 ? Math.abs(pnl) : 0;
  }
  
  async getCurrentDrawdown(userId) {
    const result = await this.pool.query(`
      SELECT 
        MAX(total_value) as peak_value,
        (SELECT SUM(quantity * average_price) FROM portfolio_positions WHERE user_id = $1) as current_value
      FROM portfolio_history
      WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '30 days'
    `, [userId]);
    
    const peak = parseFloat(result.rows[0]?.peak_value || 0);
    const current = parseFloat(result.rows[0]?.current_value || 0);
    
    if (peak === 0) return 0;
    
    return (peak - current) / peak;
  }
  
  async getSymbolVolatility(symbol) {
    // Calculate 30-day volatility
    const result = await this.pool.query(`
      SELECT STDDEV(price) / AVG(price) as volatility
      FROM market_prices
      WHERE symbol = $1 AND updated_at >= NOW() - INTERVAL '30 days'
    `, [symbol]);
    
    return parseFloat(result.rows[0]?.volatility || 0.15); // Default 15% volatility
  }
  
  async getSymbolStatistics(symbol) {
    const result = await this.pool.query(`
      SELECT 
        AVG(high - low) as atr,
        STDDEV(close) as stddev,
        AVG(close) as avg_price
      FROM market_candles
      WHERE symbol = $1 AND timestamp >= NOW() - INTERVAL '14 days'
    `, [symbol]);
    
    return {
      atr: parseFloat(result.rows[0]?.atr || 0),
      stddev: parseFloat(result.rows[0]?.stddev || 0),
      avgPrice: parseFloat(result.rows[0]?.avg_price || 0)
    };
  }
}

// Singleton instance
let riskManagementService;

function getRiskManagementService(pool) {
  if (!riskManagementService) {
    riskManagementService = new RiskManagementService(pool);
  }
  return riskManagementService;
}

module.exports = { RiskManagementService, getRiskManagementService };
