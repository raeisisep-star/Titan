/**
 * TITAN Trading System - Automated Strategy Execution Engine
 * 
 * Advanced automated trading system that executes AI-generated strategies
 * with sophisticated risk management and performance optimization.
 */

import { getAIManager, AIManager, AITradingRecommendation } from './ai-manager';
import { getPredictionEngine, MarketPrediction, EnsemblePrediction } from './prediction-engine';
import { getMarketMonitor, MarketSnapshot, MarketAlert } from './market-monitor';

export interface StrategyConfig {
  enableAutoExecution: boolean;
  maxPositions: number;
  maxPositionSize: number; // USD
  riskPerTrade: number; // 0-1 (percentage of portfolio)
  stopLossPercent: number;
  takeProfitPercent: number;
  confidenceThreshold: number;
  enableDiversification: boolean;
  maxCorrelatedPositions: number;
  enableEmergencyStop: boolean;
  maxDrawdownPercent: number;
  cooldownPeriodMs: number;
  enableAdaptiveRisk: boolean;
  backtestBeforeExecution: boolean;
}

export interface TradingPosition {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  pnlPercent: number;
  openTime: Date;
  status: 'open' | 'closed' | 'pending';
  strategy: string;
  aiSignal: AITradingRecommendation;
  risk: {
    level: 'low' | 'medium' | 'high';
    score: number;
    factors: string[];
  };
  metadata: {
    exchange: string;
    orderId?: string;
    fees: number;
    slippage: number;
  };
}

export interface StrategyPerformance {
  id: string;
  name: string;
  totalTrades: number;
  winRate: number;
  avgReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  totalPnl: number;
  avgHoldTime: number;
  lastExecution: Date;
  isActive: boolean;
  riskScore: number;
}

export interface ExecutionOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop_market' | 'stop_limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce: 'GTC' | 'IOC' | 'FOK';
  status: 'pending' | 'filled' | 'cancelled' | 'failed';
  aiRationale: string;
  riskAssessment: any;
  createdAt: Date;
  filledAt?: Date;
}

export interface PortfolioState {
  totalValue: number;
  availableBalance: number;
  totalPnl: number;
  dailyPnl: number;
  positions: TradingPosition[];
  openOrders: ExecutionOrder[];
  riskMetrics: {
    totalRisk: number;
    concentrationRisk: number;
    correlationRisk: number;
    volatilityRisk: number;
  };
  performance: {
    winRate: number;
    sharpeRatio: number;
    maxDrawdown: number;
    totalReturn: number;
  };
}

/**
 * Automated Strategy Execution Engine
 * 
 * Features:
 * - AI-driven strategy execution
 * - Advanced risk management
 * - Real-time position monitoring
 * - Portfolio optimization
 * - Emergency stop mechanisms
 */
export class StrategyExecutor {
  private aiManager: AIManager;
  private config: StrategyConfig;
  private portfolio: PortfolioState;
  private positions: Map<string, TradingPosition> = new Map();
  private orders: Map<string, ExecutionOrder> = new Map();
  private strategies: Map<string, StrategyPerformance> = new Map();
  private isRunning: boolean = false;
  private emergencyStop: boolean = false;
  private lastExecution: Map<string, number> = new Map();
  private performanceHistory: Array<{
    timestamp: Date;
    totalValue: number;
    pnl: number;
    positions: number;
  }> = [];

  constructor(config: StrategyConfig) {
    this.config = {
      enableAutoExecution: false, // Safety default
      maxPositions: 10,
      maxPositionSize: 10000,
      riskPerTrade: 0.02, // 2% per trade
      stopLossPercent: 0.05, // 5% stop loss
      takeProfitPercent: 0.10, // 10% take profit
      confidenceThreshold: 0.75,
      enableDiversification: true,
      maxCorrelatedPositions: 3,
      enableEmergencyStop: true,
      maxDrawdownPercent: 0.15, // 15% max drawdown
      cooldownPeriodMs: 5 * 60 * 1000, // 5 minutes
      enableAdaptiveRisk: true,
      backtestBeforeExecution: true,
      ...config
    };

    this.aiManager = getAIManager();
    this.initializePortfolio();
    
    console.log('🤖 Strategy Execution Engine initialized');
  }

  /**
   * Initialize portfolio state
   */
  private initializePortfolio(): void {
    this.portfolio = {
      totalValue: 100000, // $100k starting value
      availableBalance: 100000,
      totalPnl: 0,
      dailyPnl: 0,
      positions: [],
      openOrders: [],
      riskMetrics: {
        totalRisk: 0,
        concentrationRisk: 0,
        correlationRisk: 0,
        volatilityRisk: 0
      },
      performance: {
        winRate: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        totalReturn: 0
      }
    };
  }

  /**
   * Start automated strategy execution
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ Strategy Executor already running');
      return;
    }

    if (!this.config.enableAutoExecution) {
      console.warn('⚠️ Auto-execution disabled. Enable in config to start.');
      return;
    }

    console.log('🚀 Starting Automated Strategy Execution...');
    this.isRunning = true;
    this.emergencyStop = false;

    // Start main execution loop
    this.startExecutionLoop();

    // Start monitoring loops
    this.startPositionMonitoring();
    this.startRiskMonitoring();
    this.startPerformanceTracking();

    console.log('✅ Strategy Executor is now active');
  }

  /**
   * Stop strategy execution
   */
  async stop(): Promise<void> {
    console.log('🛑 Stopping Strategy Executor...');
    this.isRunning = false;

    // Close all positions if emergency stop
    if (this.emergencyStop) {
      await this.closeAllPositions('Emergency stop triggered');
    }

    console.log('✅ Strategy Executor stopped');
  }

  /**
   * Start main execution loop
   */
  private startExecutionLoop(): void {
    const executionLoop = async () => {
      if (!this.isRunning || this.emergencyStop) return;

      try {
        // Check for new trading opportunities
        await this.scanForOpportunities();

        // Process pending orders
        await this.processOrders();

        // Update positions
        await this.updatePositions();

        // Rebalance portfolio if needed
        if (this.config.enableDiversification) {
          await this.rebalancePortfolio();
        }

      } catch (error) {
        console.error('❌ Execution loop error:', error);
        
        // Trigger emergency stop on critical errors
        if (this.config.enableEmergencyStop) {
          await this.triggerEmergencyStop('Critical execution error');
        }
      }

      // Schedule next iteration
      if (this.isRunning) {
        setTimeout(executionLoop, 30000); // 30 seconds
      }
    };

    executionLoop();
  }

  /**
   * Scan for trading opportunities
   */
  private async scanForOpportunities(): Promise<void> {
    try {
      const predictionEngine = getPredictionEngine();
      const marketMonitor = getMarketMonitor();
      
      if (!predictionEngine || !marketMonitor) {
        console.warn('⚠️ Prediction engine or market monitor not available');
        return;
      }

      const snapshots = marketMonitor.getMarketSnapshots();
      
      for (const [symbol, snapshot] of Object.entries(snapshots)) {
        // Check cooldown period
        const lastExecution = this.lastExecution.get(symbol) || 0;
        if (Date.now() - lastExecution < this.config.cooldownPeriodMs) {
          continue;
        }

        // Get AI predictions and recommendations
        const [prediction, recommendation] = await Promise.all([
          predictionEngine.generatePredictions(symbol, {
            price: snapshot.price,
            volume: snapshot.volume,
            indicators: snapshot.indicators
          }),
          this.aiManager.generateRecommendation(symbol, {
            price: snapshot.price,
            volume: snapshot.volume,
            indicators: snapshot.indicators
          })
        ]);

        // Evaluate trading opportunity
        await this.evaluateTradingOpportunity(symbol, snapshot, prediction, recommendation);
      }

    } catch (error) {
      console.error('❌ Error scanning opportunities:', error);
    }
  }

  /**
   * Evaluate trading opportunity
   */
  private async evaluateTradingOpportunity(
    symbol: string,
    snapshot: MarketSnapshot,
    prediction: EnsemblePrediction,
    recommendation: AITradingRecommendation
  ): Promise<void> {
    try {
      // Check minimum confidence threshold
      if (recommendation.confidence < this.config.confidenceThreshold) {
        return;
      }

      // Check if we already have a position in this symbol
      const existingPosition = Array.from(this.positions.values())
        .find(pos => pos.symbol === symbol && pos.status === 'open');
      
      if (existingPosition && recommendation.action === 'hold') {
        return; // No action needed
      }

      // Check portfolio constraints
      if (!this.canOpenNewPosition(symbol, recommendation)) {
        return;
      }

      // Perform risk assessment
      const riskAssessment = await this.assessTradeRisk(symbol, snapshot, prediction, recommendation);
      
      if (riskAssessment.level === 'high' && !this.config.enableAdaptiveRisk) {
        console.log(`⚠️ Skipping high-risk trade for ${symbol}`);
        return;
      }

      // Calculate position size
      const positionSize = this.calculatePositionSize(recommendation, riskAssessment);
      
      if (positionSize < 100) { // Minimum $100 position
        return;
      }

      // Create execution order
      const order = await this.createExecutionOrder(
        symbol,
        recommendation,
        positionSize,
        riskAssessment
      );

      if (order) {
        console.log(`📈 Created ${recommendation.action} order for ${symbol}: $${positionSize}`);
        this.lastExecution.set(symbol, Date.now());
      }

    } catch (error) {
      console.error(`❌ Error evaluating opportunity for ${symbol}:`, error);
    }
  }

  /**
   * Check if we can open new position
   */
  private canOpenNewPosition(symbol: string, recommendation: AITradingRecommendation): boolean {
    const openPositions = Array.from(this.positions.values())
      .filter(pos => pos.status === 'open');

    // Check maximum positions
    if (openPositions.length >= this.config.maxPositions) {
      return false;
    }

    // Check if we have enough balance
    const requiredBalance = this.config.maxPositionSize * this.config.riskPerTrade;
    if (this.portfolio.availableBalance < requiredBalance) {
      return false;
    }

    // Check diversification rules
    if (this.config.enableDiversification) {
      const correlatedPositions = this.getCorrelatedPositions(symbol);
      if (correlatedPositions.length >= this.config.maxCorrelatedPositions) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get correlated positions
   */
  private getCorrelatedPositions(symbol: string): TradingPosition[] {
    // Simplified correlation - in production, use actual correlation data
    const cryptoCorrelation = ['BTC', 'ETH', 'BNB'];
    const isNewCrypto = cryptoCorrelation.includes(symbol);
    
    return Array.from(this.positions.values()).filter(pos => {
      if (pos.status !== 'open') return false;
      
      if (isNewCrypto) {
        return cryptoCorrelation.includes(pos.symbol);
      }
      
      return pos.symbol === symbol;
    });
  }

  /**
   * Assess trade risk
   */
  private async assessTradeRisk(
    symbol: string,
    snapshot: MarketSnapshot,
    prediction: EnsemblePrediction,
    recommendation: AITradingRecommendation
  ): Promise<{ level: 'low' | 'medium' | 'high'; score: number; factors: string[] }> {
    try {
      const riskFactors: string[] = [];
      let riskScore = 0;

      // Volatility risk
      const volatility = Math.abs(snapshot.change24h);
      if (volatility > 0.1) {
        riskScore += 0.3;
        riskFactors.push('High volatility (>10%)');
      }

      // Prediction uncertainty risk
      if (prediction.uncertaintyScore > 0.6) {
        riskScore += 0.2;
        riskFactors.push('High prediction uncertainty');
      }

      // Consensus risk
      if (prediction.consensusLevel < 0.5) {
        riskScore += 0.2;
        riskFactors.push('Low AI model consensus');
      }

      // Volume risk
      const avgVolume = 1000000; // Simplified
      if (snapshot.volume < avgVolume * 0.5) {
        riskScore += 0.15;
        riskFactors.push('Low trading volume');
      }

      // Market structure risk
      const openPositions = Array.from(this.positions.values())
        .filter(pos => pos.status === 'open');
      
      if (openPositions.length > this.config.maxPositions * 0.8) {
        riskScore += 0.15;
        riskFactors.push('High portfolio concentration');
      }

      // Determine risk level
      let level: 'low' | 'medium' | 'high';
      if (riskScore <= 0.3) {
        level = 'low';
      } else if (riskScore <= 0.6) {
        level = 'medium';
      } else {
        level = 'high';
      }

      return { level, score: riskScore, factors: riskFactors };

    } catch (error) {
      console.error('❌ Risk assessment error:', error);
      return { level: 'high', score: 1, factors: ['Risk assessment failed'] };
    }
  }

  /**
   * Calculate position size
   */
  private calculatePositionSize(
    recommendation: AITradingRecommendation,
    riskAssessment: any
  ): number {
    let baseSize = this.portfolio.totalValue * this.config.riskPerTrade;
    
    // Adjust for confidence
    const confidenceMultiplier = recommendation.confidence;
    baseSize *= confidenceMultiplier;
    
    // Adjust for risk
    const riskMultiplier = riskAssessment.level === 'low' ? 1.2 : 
                          riskAssessment.level === 'medium' ? 1.0 : 0.6;
    baseSize *= riskMultiplier;
    
    // Apply limits
    const maxSize = Math.min(this.config.maxPositionSize, this.portfolio.availableBalance * 0.9);
    return Math.min(baseSize, maxSize);
  }

  /**
   * Create execution order
   */
  private async createExecutionOrder(
    symbol: string,
    recommendation: AITradingRecommendation,
    positionSize: number,
    riskAssessment: any
  ): Promise<ExecutionOrder | null> {
    try {
      if (recommendation.action === 'hold') {
        return null;
      }

      const orderId = `order_${symbol}_${Date.now()}`;
      const side = recommendation.action === 'buy' ? 'buy' : 'sell';
      const currentPrice = recommendation.entryPrice || 0;
      
      const order: ExecutionOrder = {
        id: orderId,
        symbol,
        side,
        type: 'market', // Start with market orders for simplicity
        quantity: positionSize / currentPrice,
        timeInForce: 'GTC',
        status: 'pending',
        aiRationale: recommendation.reasoning.join('; '),
        riskAssessment,
        createdAt: new Date()
      };

      this.orders.set(orderId, order);
      
      // In production, submit to actual exchange
      await this.simulateOrderExecution(order);
      
      return order;

    } catch (error) {
      console.error('❌ Order creation error:', error);
      return null;
    }
  }

  /**
   * Simulate order execution (replace with real exchange integration)
   */
  private async simulateOrderExecution(order: ExecutionOrder): Promise<void> {
    // Simulate execution delay
    setTimeout(async () => {
      try {
        order.status = 'filled';
        order.filledAt = new Date();
        
        // Create position
        if (order.side === 'buy') {
          await this.createPosition(order);
        } else {
          await this.closePosition(order);
        }
        
        console.log(`✅ Order executed: ${order.side} ${order.quantity} ${order.symbol}`);
        
      } catch (error) {
        order.status = 'failed';
        console.error('❌ Order execution failed:', error);
      }
    }, 1000 + Math.random() * 2000); // 1-3 second delay
  }

  /**
   * Create new trading position
   */
  private async createPosition(order: ExecutionOrder): Promise<void> {
    const currentPrice = await this.getCurrentPrice(order.symbol);
    const stopLoss = currentPrice * (1 - this.config.stopLossPercent);
    const takeProfit = currentPrice * (1 + this.config.takeProfitPercent);
    
    const position: TradingPosition = {
      id: `pos_${order.symbol}_${Date.now()}`,
      symbol: order.symbol,
      side: 'long',
      size: order.quantity,
      entryPrice: currentPrice,
      currentPrice: currentPrice,
      stopLoss,
      takeProfit,
      pnl: 0,
      pnlPercent: 0,
      openTime: new Date(),
      status: 'open',
      strategy: 'ai_ensemble',
      aiSignal: {} as AITradingRecommendation, // Will be populated
      risk: order.riskAssessment,
      metadata: {
        exchange: 'simulated',
        orderId: order.id,
        fees: order.quantity * currentPrice * 0.001, // 0.1% fee
        slippage: 0
      }
    };

    this.positions.set(position.id, position);
    this.portfolio.availableBalance -= order.quantity * currentPrice;
    this.updatePortfolioMetrics();
  }

  /**
   * Close trading position
   */
  private async closePosition(order: ExecutionOrder): Promise<void> {
    // Find matching position to close
    const position = Array.from(this.positions.values())
      .find(pos => pos.symbol === order.symbol && pos.status === 'open');
    
    if (!position) {
      console.warn(`⚠️ No open position found for ${order.symbol}`);
      return;
    }

    const currentPrice = await this.getCurrentPrice(order.symbol);
    const pnl = (currentPrice - position.entryPrice) * position.size;
    const pnlPercent = (currentPrice - position.entryPrice) / position.entryPrice;

    position.status = 'closed';
    position.currentPrice = currentPrice;
    position.pnl = pnl;
    position.pnlPercent = pnlPercent;

    // Update portfolio
    this.portfolio.availableBalance += position.size * currentPrice;
    this.portfolio.totalPnl += pnl;
    this.updatePortfolioMetrics();

    console.log(`💰 Position closed: ${order.symbol} PnL: $${pnl.toFixed(2)} (${(pnlPercent * 100).toFixed(2)}%)`);
  }

  /**
   * Get current price (mock implementation)
   */
  private async getCurrentPrice(symbol: string): Promise<number> {
    const marketMonitor = getMarketMonitor();
    if (marketMonitor) {
      const snapshots = marketMonitor.getMarketSnapshots();
      return snapshots[symbol]?.price || 0;
    }
    
    // Fallback mock price
    const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 2500 : 100;
    return basePrice * (0.98 + Math.random() * 0.04); // ±2% variation
  }

  /**
   * Start position monitoring
   */
  private startPositionMonitoring(): void {
    const monitorPositions = async () => {
      if (!this.isRunning) return;

      try {
        const openPositions = Array.from(this.positions.values())
          .filter(pos => pos.status === 'open');

        for (const position of openPositions) {
          await this.updatePosition(position);
          await this.checkPositionRisks(position);
        }

      } catch (error) {
        console.error('❌ Position monitoring error:', error);
      }

      if (this.isRunning) {
        setTimeout(monitorPositions, 10000); // 10 seconds
      }
    };

    monitorPositions();
  }

  /**
   * Update individual position
   */
  private async updatePosition(position: TradingPosition): Promise<void> {
    const currentPrice = await this.getCurrentPrice(position.symbol);
    const pnl = (currentPrice - position.entryPrice) * position.size;
    const pnlPercent = (currentPrice - position.entryPrice) / position.entryPrice;

    position.currentPrice = currentPrice;
    position.pnl = pnl;
    position.pnlPercent = pnlPercent;

    // Check stop loss and take profit
    if (currentPrice <= position.stopLoss) {
      await this.triggerStopLoss(position);
    } else if (currentPrice >= position.takeProfit) {
      await this.triggerTakeProfit(position);
    }
  }

  /**
   * Check position risks
   */
  private async checkPositionRisks(position: TradingPosition): Promise<void> {
    // Check for excessive losses
    if (position.pnlPercent < -0.1) { // 10% loss
      console.warn(`⚠️ Large loss detected: ${position.symbol} ${(position.pnlPercent * 100).toFixed(2)}%`);
    }

    // Check position age
    const ageMs = Date.now() - position.openTime.getTime();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (ageMs > maxAge && Math.abs(position.pnlPercent) < 0.01) {
      console.log(`📅 Closing stale position: ${position.symbol}`);
      await this.closePositionById(position.id, 'Position timeout');
    }
  }

  /**
   * Trigger stop loss
   */
  private async triggerStopLoss(position: TradingPosition): Promise<void> {
    console.log(`🛑 Stop loss triggered: ${position.symbol} at $${position.currentPrice}`);
    await this.closePositionById(position.id, 'Stop loss');
  }

  /**
   * Trigger take profit
   */
  private async triggerTakeProfit(position: TradingPosition): Promise<void> {
    console.log(`🎯 Take profit triggered: ${position.symbol} at $${position.currentPrice}`);
    await this.closePositionById(position.id, 'Take profit');
  }

  /**
   * Close position by ID
   */
  private async closePositionById(positionId: string, reason: string): Promise<void> {
    const position = this.positions.get(positionId);
    if (!position || position.status !== 'open') return;

    const currentPrice = await this.getCurrentPrice(position.symbol);
    const pnl = (currentPrice - position.entryPrice) * position.size;
    
    position.status = 'closed';
    position.currentPrice = currentPrice;
    position.pnl = pnl;
    position.pnlPercent = (currentPrice - position.entryPrice) / position.entryPrice;

    this.portfolio.availableBalance += position.size * currentPrice;
    this.portfolio.totalPnl += pnl;
    this.updatePortfolioMetrics();

    console.log(`💼 Position closed (${reason}): ${position.symbol} PnL: $${pnl.toFixed(2)}`);
  }

  /**
   * Start risk monitoring
   */
  private startRiskMonitoring(): void {
    const monitorRisk = async () => {
      if (!this.isRunning) return;

      try {
        await this.updateRiskMetrics();
        await this.checkDrawdownLimits();
        await this.checkEmergencyConditions();

      } catch (error) {
        console.error('❌ Risk monitoring error:', error);
      }

      if (this.isRunning) {
        setTimeout(monitorRisk, 30000); // 30 seconds
      }
    };

    monitorRisk();
  }

  /**
   * Update risk metrics
   */
  private async updateRiskMetrics(): Promise<void> {
    const openPositions = Array.from(this.positions.values())
      .filter(pos => pos.status === 'open');

    if (openPositions.length === 0) {
      this.portfolio.riskMetrics = {
        totalRisk: 0,
        concentrationRisk: 0,
        correlationRisk: 0,
        volatilityRisk: 0
      };
      return;
    }

    // Calculate total risk exposure
    const totalExposure = openPositions.reduce((sum, pos) => 
      sum + Math.abs(pos.size * pos.currentPrice), 0);
    const totalRisk = totalExposure / this.portfolio.totalValue;

    // Calculate concentration risk
    const symbolExposure = new Map<string, number>();
    openPositions.forEach(pos => {
      const exposure = pos.size * pos.currentPrice;
      symbolExposure.set(pos.symbol, (symbolExposure.get(pos.symbol) || 0) + exposure);
    });
    
    const maxSymbolExposure = Math.max(...Array.from(symbolExposure.values()));
    const concentrationRisk = maxSymbolExposure / this.portfolio.totalValue;

    // Update risk metrics
    this.portfolio.riskMetrics = {
      totalRisk,
      concentrationRisk,
      correlationRisk: Math.min(1, openPositions.length / this.config.maxPositions),
      volatilityRisk: 0.5 // Simplified calculation
    };
  }

  /**
   * Check drawdown limits
   */
  private async checkDrawdownLimits(): Promise<void> {
    const currentDrawdown = this.calculateCurrentDrawdown();
    
    if (currentDrawdown > this.config.maxDrawdownPercent) {
      console.warn(`🚨 Maximum drawdown exceeded: ${(currentDrawdown * 100).toFixed(2)}%`);
      
      if (this.config.enableEmergencyStop) {
        await this.triggerEmergencyStop('Maximum drawdown exceeded');
      }
    }
  }

  /**
   * Calculate current drawdown
   */
  private calculateCurrentDrawdown(): number {
    if (this.performanceHistory.length === 0) return 0;

    const peak = Math.max(...this.performanceHistory.map(h => h.totalValue));
    const current = this.portfolio.totalValue;
    
    return (peak - current) / peak;
  }

  /**
   * Check emergency conditions
   */
  private async checkEmergencyConditions(): Promise<void> {
    // Check for rapid losses
    const recentHistory = this.performanceHistory.slice(-5); // Last 5 data points
    if (recentHistory.length >= 2) {
      const firstValue = recentHistory[0].totalValue;
      const lastValue = recentHistory[recentHistory.length - 1].totalValue;
      const rapidLoss = (firstValue - lastValue) / firstValue;
      
      if (rapidLoss > 0.05) { // 5% rapid loss
        console.warn('🚨 Rapid loss detected');
        
        if (this.config.enableEmergencyStop) {
          await this.triggerEmergencyStop('Rapid portfolio loss');
        }
      }
    }
  }

  /**
   * Trigger emergency stop
   */
  private async triggerEmergencyStop(reason: string): Promise<void> {
    console.error(`🚨 EMERGENCY STOP: ${reason}`);
    this.emergencyStop = true;
    
    // Close all open positions
    await this.closeAllPositions(reason);
    
    // Stop execution
    await this.stop();
  }

  /**
   * Close all positions
   */
  private async closeAllPositions(reason: string): Promise<void> {
    const openPositions = Array.from(this.positions.values())
      .filter(pos => pos.status === 'open');

    console.log(`🔄 Closing ${openPositions.length} positions: ${reason}`);
    
    for (const position of openPositions) {
      await this.closePositionById(position.id, reason);
    }
  }

  /**
   * Process pending orders
   */
  private async processOrders(): Promise<void> {
    const pendingOrders = Array.from(this.orders.values())
      .filter(order => order.status === 'pending');

    // In production, check order status from exchange
    // For now, assume orders execute quickly
  }

  /**
   * Update positions
   */
  private async updatePositions(): Promise<void> {
    const openPositions = Array.from(this.positions.values())
      .filter(pos => pos.status === 'open');

    for (const position of openPositions) {
      await this.updatePosition(position);
    }
  }

  /**
   * Rebalance portfolio
   */
  private async rebalancePortfolio(): Promise<void> {
    // Simplified rebalancing logic
    const openPositions = Array.from(this.positions.values())
      .filter(pos => pos.status === 'open');

    // Check for overexposure to any symbol
    const symbolExposure = new Map<string, number>();
    openPositions.forEach(pos => {
      const exposure = pos.size * pos.currentPrice;
      symbolExposure.set(pos.symbol, (symbolExposure.get(pos.symbol) || 0) + exposure);
    });

    const maxExposure = this.portfolio.totalValue * 0.3; // Max 30% per symbol
    
    for (const [symbol, exposure] of symbolExposure) {
      if (exposure > maxExposure) {
        console.log(`⚖️ Rebalancing ${symbol}: exposure ${(exposure/this.portfolio.totalValue*100).toFixed(1)}%`);
        // Would implement position size reduction here
      }
    }
  }

  /**
   * Start performance tracking
   */
  private startPerformanceTracking(): void {
    const trackPerformance = () => {
      if (!this.isRunning) return;

      this.updatePortfolioMetrics();
      this.recordPerformanceSnapshot();

      setTimeout(trackPerformance, 60000); // 1 minute
    };

    trackPerformance();
  }

  /**
   * Update portfolio metrics
   */
  private updatePortfolioMetrics(): void {
    const openPositions = Array.from(this.positions.values())
      .filter(pos => pos.status === 'open');
    
    const closedPositions = Array.from(this.positions.values())
      .filter(pos => pos.status === 'closed');

    // Calculate unrealized PnL
    const unrealizedPnl = openPositions.reduce((sum, pos) => sum + pos.pnl, 0);
    
    // Update portfolio values
    this.portfolio.totalValue = this.portfolio.availableBalance + unrealizedPnl;
    this.portfolio.positions = [...openPositions];
    
    // Calculate performance metrics
    if (closedPositions.length > 0) {
      const winningTrades = closedPositions.filter(pos => pos.pnl > 0).length;
      this.portfolio.performance.winRate = winningTrades / closedPositions.length;
      
      const totalReturn = (this.portfolio.totalValue - 100000) / 100000; // Starting value was 100k
      this.portfolio.performance.totalReturn = totalReturn;
    }
  }

  /**
   * Record performance snapshot
   */
  private recordPerformanceSnapshot(): void {
    const openPositions = Array.from(this.positions.values())
      .filter(pos => pos.status === 'open');

    const snapshot = {
      timestamp: new Date(),
      totalValue: this.portfolio.totalValue,
      pnl: this.portfolio.totalPnl,
      positions: openPositions.length
    };

    this.performanceHistory.push(snapshot);
    
    // Keep last 1000 snapshots
    if (this.performanceHistory.length > 1000) {
      this.performanceHistory.shift();
    }
  }

  /**
   * Get portfolio state
   */
  getPortfolio(): PortfolioState {
    return { ...this.portfolio };
  }

  /**
   * Get execution statistics
   */
  getExecutionStats(): {
    isRunning: boolean;
    emergencyStop: boolean;
    totalPositions: number;
    openPositions: number;
    totalOrders: number;
    pendingOrders: number;
    totalPnL: number;
    winRate: number;
  } {
    const positions = Array.from(this.positions.values());
    const orders = Array.from(this.orders.values());
    const openPositions = positions.filter(pos => pos.status === 'open');
    const closedPositions = positions.filter(pos => pos.status === 'closed');
    const pendingOrders = orders.filter(order => order.status === 'pending');
    
    const winningTrades = closedPositions.filter(pos => pos.pnl > 0).length;
    const winRate = closedPositions.length > 0 ? winningTrades / closedPositions.length : 0;

    return {
      isRunning: this.isRunning,
      emergencyStop: this.emergencyStop,
      totalPositions: positions.length,
      openPositions: openPositions.length,
      totalOrders: orders.length,
      pendingOrders: pendingOrders.length,
      totalPnL: this.portfolio.totalPnl,
      winRate
    };
  }
}

/**
 * Global strategy executor instance
 */
let globalStrategyExecutor: StrategyExecutor | null = null;

/**
 * Initialize global strategy executor
 */
export function initializeStrategyExecutor(config: StrategyConfig): StrategyExecutor {
  globalStrategyExecutor = new StrategyExecutor(config);
  return globalStrategyExecutor;
}

/**
 * Get global strategy executor instance
 */
export function getStrategyExecutor(): StrategyExecutor | null {
  return globalStrategyExecutor;
}

export default StrategyExecutor;