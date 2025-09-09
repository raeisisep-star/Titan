/**
 * AI Performance Learning System
 * Revolutionary system that continuously learns from trading results and improves AI model performance
 * 
 * Features:
 * - Real-time performance tracking and analysis
 * - Adaptive model weight adjustment based on actual results
 * - Multi-dimensional performance metrics
 * - Sophisticated learning algorithms
 * - Performance decay and recovery modeling
 * - Cross-validation and backtesting integration
 */

import { EventEmitter } from '../utils/event-emitter.js';

// Performance Tracking Interfaces
export interface TradeResult {
  id: string;
  symbol: string;
  aiProvider: string;
  prediction: TradePrediction;
  actualOutcome: TradeOutcome;
  executionTime: number;
  marketConditions: MarketConditions;
  profit?: number;
  success: boolean;
  confidence: number;
  timeframe: string;
  timestamp: number;
}

export interface TradePrediction {
  direction: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  priceTarget: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high';
  reasoning: string[];
}

export interface TradeOutcome {
  actualDirection: 'bullish' | 'bearish' | 'neutral';
  actualPrice: number;
  priceChange: number;
  actualRisk: 'low' | 'medium' | 'high';
  marketVolatility: number;
  duration: number;
}

export interface MarketConditions {
  trend: 'uptrend' | 'downtrend' | 'sideways';
  volatility: number;
  volume: number;
  sentiment: number; // -1 to 1
  technicalIndicators: {
    rsi: number;
    macd: number;
    bb_position: number;
    momentum: number;
  };
}

// Performance Metrics
export interface AIModelPerformance {
  provider: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    profitability: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    avgReturn: number;
    consistencyScore: number;
  };
  weightings: {
    current: number;
    historical: number;
    momentum: number;
    volatilityAdjusted: number;
  };
  performance: {
    shortTerm: PerformanceWindow; // Last 24h
    mediumTerm: PerformanceWindow; // Last 7 days
    longTerm: PerformanceWindow; // Last 30 days
  };
  learningData: {
    totalTrades: number;
    successfulTrades: number;
    averageConfidence: number;
    bestConditions: MarketConditions;
    worstConditions: MarketConditions;
    improvementTrend: number;
  };
}

export interface PerformanceWindow {
  startTime: number;
  endTime: number;
  trades: number;
  successRate: number;
  profit: number;
  volatility: number;
  confidence: number;
  learningRate: number;
}

// Learning Configuration
export interface LearningConfig {
  adaptiveLearning: boolean;
  learningRate: number;
  decayFactor: number;
  minSampleSize: number;
  confidenceThreshold: number;
  performanceWindows: {
    shortTerm: number; // 24 hours
    mediumTerm: number; // 7 days
    longTerm: number; // 30 days
  };
  weightingFactors: {
    accuracy: number;
    profitability: number;
    consistency: number;
    recentPerformance: number;
  };
}

/**
 * AI Performance Learning Engine
 * Continuously learns from trading results and optimizes AI model performance
 */
export class AIPerformanceLearner extends EventEmitter {
  private tradeResults: Map<string, TradeResult[]> = new Map();
  private modelPerformance: Map<string, AIModelPerformance> = new Map();
  private learningConfig: LearningConfig;
  private isLearning: boolean = false;
  private lastUpdate: number = 0;

  constructor(config?: Partial<LearningConfig>) {
    super();
    
    this.learningConfig = {
      adaptiveLearning: true,
      learningRate: 0.1,
      decayFactor: 0.95,
      minSampleSize: 10,
      confidenceThreshold: 0.6,
      performanceWindows: {
        shortTerm: 24 * 60 * 60 * 1000, // 24 hours
        mediumTerm: 7 * 24 * 60 * 60 * 1000, // 7 days
        longTerm: 30 * 24 * 60 * 60 * 1000, // 30 days
      },
      weightingFactors: {
        accuracy: 0.3,
        profitability: 0.4,
        consistency: 0.2,
        recentPerformance: 0.1,
      },
      ...config
    };

    this.initializeModelPerformance();
  }

  /**
   * Initialize performance tracking for AI models
   */
  private initializeModelPerformance(): void {
    const providers = ['openai', 'gemini', 'claude', 'ensemble'];
    
    providers.forEach(provider => {
      this.modelPerformance.set(provider, {
        provider,
        metrics: {
          accuracy: 0.5,
          precision: 0.5,
          recall: 0.5,
          f1Score: 0.5,
          profitability: 0.0,
          sharpeRatio: 0.0,
          maxDrawdown: 0.0,
          winRate: 0.5,
          avgReturn: 0.0,
          consistencyScore: 0.5,
        },
        weightings: {
          current: provider === 'ensemble' ? 0.4 : 0.2,
          historical: 0.5,
          momentum: 0.0,
          volatilityAdjusted: 0.5,
        },
        performance: {
          shortTerm: this.createEmptyPerformanceWindow(),
          mediumTerm: this.createEmptyPerformanceWindow(),
          longTerm: this.createEmptyPerformanceWindow(),
        },
        learningData: {
          totalTrades: 0,
          successfulTrades: 0,
          averageConfidence: 0.5,
          bestConditions: this.getDefaultMarketConditions(),
          worstConditions: this.getDefaultMarketConditions(),
          improvementTrend: 0.0,
        },
      });
      
      this.tradeResults.set(provider, []);
    });
  }

  /**
   * Record a trade result for performance learning
   */
  async recordTradeResult(result: TradeResult): Promise<void> {
    try {
      // Store trade result
      const results = this.tradeResults.get(result.aiProvider) || [];
      results.push(result);
      this.tradeResults.set(result.aiProvider, results);

      // Update performance metrics
      await this.updateModelPerformance(result.aiProvider, result);

      // Trigger learning process if enabled
      if (this.learningConfig.adaptiveLearning) {
        await this.performAdaptiveLearning(result.aiProvider);
      }

      // Emit learning event
      this.emit('tradeRecorded', {
        provider: result.aiProvider,
        result,
        updatedPerformance: this.modelPerformance.get(result.aiProvider)
      });

      console.log(`📈 Trade result recorded for ${result.aiProvider}: ${result.success ? 'SUCCESS' : 'FAILURE'}`);
    } catch (error) {
      console.error('❌ Error recording trade result:', error);
      throw error;
    }
  }

  /**
   * Update model performance based on trade result
   */
  private async updateModelPerformance(provider: string, result: TradeResult): Promise<void> {
    const performance = this.modelPerformance.get(provider);
    if (!performance) return;

    const results = this.tradeResults.get(provider) || [];
    
    // Calculate new metrics
    const totalTrades = results.length;
    const successfulTrades = results.filter(r => r.success).length;
    const recentResults = results.slice(-50); // Last 50 trades for recent metrics

    // Update basic metrics
    performance.metrics.accuracy = this.calculateAccuracy(results);
    performance.metrics.precision = this.calculatePrecision(results);
    performance.metrics.recall = this.calculateRecall(results);
    performance.metrics.f1Score = this.calculateF1Score(performance.metrics.precision, performance.metrics.recall);
    performance.metrics.winRate = successfulTrades / Math.max(totalTrades, 1);
    performance.metrics.profitability = this.calculateProfitability(results);
    performance.metrics.sharpeRatio = this.calculateSharpeRatio(results);
    performance.metrics.maxDrawdown = this.calculateMaxDrawdown(results);
    performance.metrics.avgReturn = this.calculateAverageReturn(results);
    performance.metrics.consistencyScore = this.calculateConsistencyScore(results);

    // Update performance windows
    performance.performance.shortTerm = this.calculatePerformanceWindow(
      results, 
      this.learningConfig.performanceWindows.shortTerm
    );
    performance.performance.mediumTerm = this.calculatePerformanceWindow(
      results, 
      this.learningConfig.performanceWindows.mediumTerm
    );
    performance.performance.longTerm = this.calculatePerformanceWindow(
      results, 
      this.learningConfig.performanceWindows.longTerm
    );

    // Update learning data
    performance.learningData.totalTrades = totalTrades;
    performance.learningData.successfulTrades = successfulTrades;
    performance.learningData.averageConfidence = this.calculateAverageConfidence(results);
    performance.learningData.bestConditions = this.identifyBestConditions(results);
    performance.learningData.worstConditions = this.identifyWorstConditions(results);
    performance.learningData.improvementTrend = this.calculateImprovementTrend(results);

    // Update model weightings based on performance
    await this.updateModelWeightings(provider, performance);
  }

  /**
   * Perform adaptive learning to optimize model performance
   */
  private async performAdaptiveLearning(provider: string): Promise<void> {
    const performance = this.modelPerformance.get(provider);
    if (!performance) return;

    const results = this.tradeResults.get(provider) || [];
    
    // Only learn if we have sufficient data
    if (results.length < this.learningConfig.minSampleSize) return;

    try {
      // Analyze performance patterns
      const patterns = await this.analyzePerformancePatterns(results);
      
      // Adjust learning parameters based on patterns
      const adjustments = await this.calculateLearningAdjustments(patterns, performance);
      
      // Apply adjustments
      await this.applyLearningAdjustments(provider, adjustments);
      
      // Update improvement trend
      performance.learningData.improvementTrend = adjustments.improvementScore;
      
      this.emit('learningCompleted', {
        provider,
        patterns,
        adjustments,
        performance
      });

      console.log(`🧠 Adaptive learning completed for ${provider} - Improvement: ${adjustments.improvementScore.toFixed(3)}`);
    } catch (error) {
      console.error(`❌ Error in adaptive learning for ${provider}:`, error);
    }
  }

  /**
   * Analyze performance patterns to identify learning opportunities
   */
  private async analyzePerformancePatterns(results: TradeResult[]): Promise<any> {
    const recentResults = results.slice(-100); // Last 100 trades
    
    return {
      marketConditionPerformance: this.analyzeMarketConditionPerformance(recentResults),
      confidenceLevelPerformance: this.analyzeConfidenceLevelPerformance(recentResults),
      timeframePerformance: this.analyzeTimeframePerformance(recentResults),
      trendPerformance: this.analyzeTrendPerformance(recentResults),
      volatilityPerformance: this.analyzeVolatilityPerformance(recentResults),
      learningVelocity: this.calculateLearningVelocity(recentResults),
    };
  }

  /**
   * Calculate learning adjustments based on performance analysis
   */
  private async calculateLearningAdjustments(patterns: any, performance: AIModelPerformance): Promise<any> {
    const currentAccuracy = performance.metrics.accuracy;
    const targetAccuracy = 0.75; // Target 75% accuracy
    
    const accuracyGap = targetAccuracy - currentAccuracy;
    const improvementPotential = Math.max(0, accuracyGap);
    
    return {
      weightAdjustment: this.calculateWeightAdjustment(patterns, performance),
      confidenceAdjustment: this.calculateConfidenceAdjustment(patterns),
      learningRateAdjustment: this.calculateLearningRateAdjustment(patterns),
      improvementScore: improvementPotential,
      recommendedActions: this.generateRecommendedActions(patterns, performance),
    };
  }

  /**
   * Apply learning adjustments to improve model performance
   */
  private async applyLearningAdjustments(provider: string, adjustments: any): Promise<void> {
    const performance = this.modelPerformance.get(provider);
    if (!performance) return;

    // Apply weight adjustments
    const weightChange = adjustments.weightAdjustment * this.learningConfig.learningRate;
    performance.weightings.current = Math.max(0.1, Math.min(1.0, 
      performance.weightings.current + weightChange
    ));

    // Apply momentum-based adjustments
    performance.weightings.momentum = adjustments.learningRateAdjustment;

    // Update volatility adjustment
    performance.weightings.volatilityAdjusted = this.calculateVolatilityAdjustedWeight(performance);

    console.log(`🎯 Learning adjustments applied to ${provider}: Weight ${performance.weightings.current.toFixed(3)}, Momentum ${performance.weightings.momentum.toFixed(3)}`);
  }

  /**
   * Calculate accuracy metric
   */
  private calculateAccuracy(results: TradeResult[]): number {
    if (results.length === 0) return 0.5;
    const correct = results.filter(r => r.success).length;
    return correct / results.length;
  }

  /**
   * Calculate precision metric
   */
  private calculatePrecision(results: TradeResult[]): number {
    const bullishPredictions = results.filter(r => r.prediction.direction === 'bullish');
    if (bullishPredictions.length === 0) return 0.5;
    
    const correctBullish = bullishPredictions.filter(r => 
      r.actualOutcome.actualDirection === 'bullish' && r.success
    ).length;
    
    return correctBullish / bullishPredictions.length;
  }

  /**
   * Calculate recall metric
   */
  private calculateRecall(results: TradeResult[]): number {
    const actualBullish = results.filter(r => r.actualOutcome.actualDirection === 'bullish');
    if (actualBullish.length === 0) return 0.5;
    
    const predictedBullish = actualBullish.filter(r => 
      r.prediction.direction === 'bullish' && r.success
    ).length;
    
    return predictedBullish / actualBullish.length;
  }

  /**
   * Calculate F1 Score
   */
  private calculateF1Score(precision: number, recall: number): number {
    if (precision + recall === 0) return 0;
    return 2 * (precision * recall) / (precision + recall);
  }

  /**
   * Calculate profitability metric
   */
  private calculateProfitability(results: TradeResult[]): number {
    if (results.length === 0) return 0;
    const totalProfit = results.reduce((sum, r) => sum + (r.profit || 0), 0);
    return totalProfit / results.length;
  }

  /**
   * Calculate Sharpe ratio
   */
  private calculateSharpeRatio(results: TradeResult[]): number {
    if (results.length < 2) return 0;
    
    const returns = results.map(r => r.profit || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    const stdDev = Math.sqrt(variance);
    
    return stdDev === 0 ? 0 : avgReturn / stdDev;
  }

  /**
   * Calculate maximum drawdown
   */
  private calculateMaxDrawdown(results: TradeResult[]): number {
    if (results.length === 0) return 0;
    
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;
    
    for (const result of results) {
      cumulative += result.profit || 0;
      peak = Math.max(peak, cumulative);
      const drawdown = (peak - cumulative) / Math.max(peak, 1);
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }
    
    return maxDrawdown;
  }

  /**
   * Calculate average return
   */
  private calculateAverageReturn(results: TradeResult[]): number {
    if (results.length === 0) return 0;
    const totalReturn = results.reduce((sum, r) => sum + (r.profit || 0), 0);
    return totalReturn / results.length;
  }

  /**
   * Calculate consistency score
   */
  private calculateConsistencyScore(results: TradeResult[]): number {
    if (results.length < 10) return 0.5;
    
    // Calculate rolling win rate over windows
    const windowSize = Math.min(10, Math.floor(results.length / 5));
    const winRates: number[] = [];
    
    for (let i = 0; i <= results.length - windowSize; i += windowSize) {
      const window = results.slice(i, i + windowSize);
      const winRate = window.filter(r => r.success).length / window.length;
      winRates.push(winRate);
    }
    
    // Calculate variance of win rates (lower variance = higher consistency)
    const avgWinRate = winRates.reduce((sum, wr) => sum + wr, 0) / winRates.length;
    const variance = winRates.reduce((sum, wr) => sum + Math.pow(wr - avgWinRate, 2), 0) / winRates.length;
    
    // Convert to consistency score (0-1, higher is better)
    return Math.max(0, 1 - variance * 4);
  }

  /**
   * Calculate performance for a specific time window
   */
  private calculatePerformanceWindow(results: TradeResult[], windowMs: number): PerformanceWindow {
    const now = Date.now();
    const startTime = now - windowMs;
    const windowResults = results.filter(r => r.timestamp >= startTime);
    
    if (windowResults.length === 0) {
      return this.createEmptyPerformanceWindow();
    }
    
    const successRate = windowResults.filter(r => r.success).length / windowResults.length;
    const profit = windowResults.reduce((sum, r) => sum + (r.profit || 0), 0);
    const confidence = windowResults.reduce((sum, r) => sum + r.confidence, 0) / windowResults.length;
    
    return {
      startTime,
      endTime: now,
      trades: windowResults.length,
      successRate,
      profit,
      volatility: this.calculateVolatility(windowResults),
      confidence,
      learningRate: this.calculateWindowLearningRate(windowResults),
    };
  }

  /**
   * Calculate volatility for results
   */
  private calculateVolatility(results: TradeResult[]): number {
    if (results.length < 2) return 0;
    
    const returns = results.map(r => r.profit || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate learning rate for a window of results
   */
  private calculateWindowLearningRate(results: TradeResult[]): number {
    if (results.length < 5) return this.learningConfig.learningRate;
    
    // Calculate improvement trend in the window
    const mid = Math.floor(results.length / 2);
    const firstHalf = results.slice(0, mid);
    const secondHalf = results.slice(mid);
    
    const firstHalfSuccess = firstHalf.filter(r => r.success).length / firstHalf.length;
    const secondHalfSuccess = secondHalf.filter(r => r.success).length / secondHalf.length;
    
    const improvement = secondHalfSuccess - firstHalfSuccess;
    
    // Adjust learning rate based on improvement
    if (improvement > 0.1) return this.learningConfig.learningRate * 1.2; // Learning well
    if (improvement < -0.1) return this.learningConfig.learningRate * 0.8; // Learning poorly
    return this.learningConfig.learningRate; // Stable
  }

  // Helper methods for pattern analysis
  private analyzeMarketConditionPerformance(results: TradeResult[]): any {
    const conditions = ['uptrend', 'downtrend', 'sideways'];
    return conditions.reduce((acc, condition) => {
      const conditionResults = results.filter(r => r.marketConditions.trend === condition);
      acc[condition] = {
        trades: conditionResults.length,
        successRate: conditionResults.length > 0 ? 
          conditionResults.filter(r => r.success).length / conditionResults.length : 0
      };
      return acc;
    }, {} as any);
  }

  private analyzeConfidenceLevelPerformance(results: TradeResult[]): any {
    const levels = [
      { name: 'low', min: 0, max: 0.5 },
      { name: 'medium', min: 0.5, max: 0.75 },
      { name: 'high', min: 0.75, max: 1.0 }
    ];
    
    return levels.reduce((acc, level) => {
      const levelResults = results.filter(r => 
        r.confidence >= level.min && r.confidence < level.max
      );
      acc[level.name] = {
        trades: levelResults.length,
        successRate: levelResults.length > 0 ? 
          levelResults.filter(r => r.success).length / levelResults.length : 0
      };
      return acc;
    }, {} as any);
  }

  private analyzeTimeframePerformance(results: TradeResult[]): any {
    const timeframes = ['5m', '15m', '1h', '4h', '1d'];
    return timeframes.reduce((acc, timeframe) => {
      const timeframeResults = results.filter(r => r.timeframe === timeframe);
      acc[timeframe] = {
        trades: timeframeResults.length,
        successRate: timeframeResults.length > 0 ? 
          timeframeResults.filter(r => r.success).length / timeframeResults.length : 0
      };
      return acc;
    }, {} as any);
  }

  private analyzeTrendPerformance(results: TradeResult[]): any {
    return this.analyzeMarketConditionPerformance(results);
  }

  private analyzeVolatilityPerformance(results: TradeResult[]): any {
    const lowVol = results.filter(r => r.marketConditions.volatility < 0.02);
    const medVol = results.filter(r => r.marketConditions.volatility >= 0.02 && r.marketConditions.volatility < 0.05);
    const highVol = results.filter(r => r.marketConditions.volatility >= 0.05);
    
    return {
      low: {
        trades: lowVol.length,
        successRate: lowVol.length > 0 ? lowVol.filter(r => r.success).length / lowVol.length : 0
      },
      medium: {
        trades: medVol.length,
        successRate: medVol.length > 0 ? medVol.filter(r => r.success).length / medVol.length : 0
      },
      high: {
        trades: highVol.length,
        successRate: highVol.length > 0 ? highVol.filter(r => r.success).length / highVol.length : 0
      }
    };
  }

  private calculateLearningVelocity(results: TradeResult[]): number {
    if (results.length < 10) return 0;
    
    // Calculate success rate improvement over time
    const windowSize = Math.floor(results.length / 5);
    const windows = [];
    
    for (let i = 0; i < results.length; i += windowSize) {
      const window = results.slice(i, i + windowSize);
      if (window.length >= windowSize) {
        windows.push(window.filter(r => r.success).length / window.length);
      }
    }
    
    if (windows.length < 2) return 0;
    
    // Calculate linear regression slope
    const n = windows.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = windows;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  // Helper methods for adjustments
  private calculateWeightAdjustment(patterns: any, performance: AIModelPerformance): number {
    const recentPerformance = performance.performance.shortTerm.successRate;
    const historicalPerformance = performance.metrics.accuracy;
    
    const performanceDelta = recentPerformance - historicalPerformance;
    return performanceDelta * 0.5; // 50% of performance delta
  }

  private calculateConfidenceAdjustment(patterns: any): number {
    // Adjust confidence based on confidence level performance
    const confidencePerf = patterns.confidenceLevelPerformance;
    const highConfidenceSuccess = confidencePerf.high?.successRate || 0.5;
    const lowConfidenceSuccess = confidencePerf.low?.successRate || 0.5;
    
    return (highConfidenceSuccess - lowConfidenceSuccess) * 0.1;
  }

  private calculateLearningRateAdjustment(patterns: any): number {
    const velocity = patterns.learningVelocity;
    
    if (velocity > 0.1) return 1.2; // Fast improvement, increase learning rate
    if (velocity < -0.1) return 0.8; // Degrading, decrease learning rate
    return 1.0; // Stable
  }

  private generateRecommendedActions(patterns: any, performance: AIModelPerformance): string[] {
    const actions: string[] = [];
    
    if (performance.metrics.accuracy < 0.6) {
      actions.push('Increase minimum confidence threshold');
      actions.push('Focus on high-confidence predictions');
    }
    
    if (performance.metrics.consistencyScore < 0.5) {
      actions.push('Reduce position sizes to improve consistency');
      actions.push('Implement stricter market condition filters');
    }
    
    if (patterns.learningVelocity < 0) {
      actions.push('Review and update model parameters');
      actions.push('Consider reducing learning rate temporarily');
    }
    
    return actions;
  }

  // Utility methods
  private calculateAverageConfidence(results: TradeResult[]): number {
    if (results.length === 0) return 0.5;
    return results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
  }

  private identifyBestConditions(results: TradeResult[]): MarketConditions {
    const successfulTrades = results.filter(r => r.success);
    if (successfulTrades.length === 0) return this.getDefaultMarketConditions();
    
    // Calculate average conditions for successful trades
    const avgConditions = successfulTrades.reduce((sum, trade) => {
      return {
        volatility: sum.volatility + trade.marketConditions.volatility,
        volume: sum.volume + trade.marketConditions.volume,
        sentiment: sum.sentiment + trade.marketConditions.sentiment,
        rsi: sum.rsi + trade.marketConditions.technicalIndicators.rsi,
        macd: sum.macd + trade.marketConditions.technicalIndicators.macd,
        bb_position: sum.bb_position + trade.marketConditions.technicalIndicators.bb_position,
        momentum: sum.momentum + trade.marketConditions.technicalIndicators.momentum,
      };
    }, {
      volatility: 0, volume: 0, sentiment: 0,
      rsi: 0, macd: 0, bb_position: 0, momentum: 0
    });
    
    const count = successfulTrades.length;
    return {
      trend: this.getMostCommonTrend(successfulTrades),
      volatility: avgConditions.volatility / count,
      volume: avgConditions.volume / count,
      sentiment: avgConditions.sentiment / count,
      technicalIndicators: {
        rsi: avgConditions.rsi / count,
        macd: avgConditions.macd / count,
        bb_position: avgConditions.bb_position / count,
        momentum: avgConditions.momentum / count,
      }
    };
  }

  private identifyWorstConditions(results: TradeResult[]): MarketConditions {
    const failedTrades = results.filter(r => !r.success);
    if (failedTrades.length === 0) return this.getDefaultMarketConditions();
    
    // Similar to best conditions but for failed trades
    const avgConditions = failedTrades.reduce((sum, trade) => {
      return {
        volatility: sum.volatility + trade.marketConditions.volatility,
        volume: sum.volume + trade.marketConditions.volume,
        sentiment: sum.sentiment + trade.marketConditions.sentiment,
        rsi: sum.rsi + trade.marketConditions.technicalIndicators.rsi,
        macd: sum.macd + trade.marketConditions.technicalIndicators.macd,
        bb_position: sum.bb_position + trade.marketConditions.technicalIndicators.bb_position,
        momentum: sum.momentum + trade.marketConditions.technicalIndicators.momentum,
      };
    }, {
      volatility: 0, volume: 0, sentiment: 0,
      rsi: 0, macd: 0, bb_position: 0, momentum: 0
    });
    
    const count = failedTrades.length;
    return {
      trend: this.getMostCommonTrend(failedTrades),
      volatility: avgConditions.volatility / count,
      volume: avgConditions.volume / count,
      sentiment: avgConditions.sentiment / count,
      technicalIndicators: {
        rsi: avgConditions.rsi / count,
        macd: avgConditions.macd / count,
        bb_position: avgConditions.bb_position / count,
        momentum: avgConditions.momentum / count,
      }
    };
  }

  private calculateImprovementTrend(results: TradeResult[]): number {
    if (results.length < 10) return 0;
    
    // Calculate recent vs historical performance
    const recentCount = Math.min(20, Math.floor(results.length * 0.3));
    const recent = results.slice(-recentCount);
    const historical = results.slice(0, -recentCount);
    
    const recentSuccess = recent.filter(r => r.success).length / recent.length;
    const historicalSuccess = historical.filter(r => r.success).length / historical.length;
    
    return recentSuccess - historicalSuccess;
  }

  private getMostCommonTrend(results: TradeResult[]): 'uptrend' | 'downtrend' | 'sideways' {
    const trends = results.map(r => r.marketConditions.trend);
    const trendCounts = trends.reduce((acc, trend) => {
      acc[trend] = (acc[trend] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const mostCommon = Object.entries(trendCounts).reduce((a, b) => 
      trendCounts[a[0]] > trendCounts[b[0]] ? a : b
    );
    
    return mostCommon[0] as 'uptrend' | 'downtrend' | 'sideways';
  }

  private updateModelWeightings(provider: string, performance: AIModelPerformance): Promise<void> {
    const config = this.learningConfig.weightingFactors;
    
    // Calculate composite score
    const compositeScore = 
      performance.metrics.accuracy * config.accuracy +
      Math.max(0, performance.metrics.profitability) * config.profitability +
      performance.metrics.consistencyScore * config.consistency +
      performance.performance.shortTerm.successRate * config.recentPerformance;
    
    // Update weighting based on composite score
    const targetWeight = Math.min(1.0, Math.max(0.1, compositeScore));
    const currentWeight = performance.weightings.current;
    const adjustment = (targetWeight - currentWeight) * this.learningConfig.learningRate;
    
    performance.weightings.current = currentWeight + adjustment;
    performance.weightings.historical = performance.metrics.accuracy;
    
    return Promise.resolve();
  }

  private calculateVolatilityAdjustedWeight(performance: AIModelPerformance): number {
    const baseWeight = performance.weightings.current;
    const volatility = performance.performance.shortTerm.volatility;
    
    // Adjust weight based on volatility (lower volatility = higher weight)
    const volatilityAdjustment = 1 - Math.min(0.5, volatility * 10);
    return baseWeight * volatilityAdjustment;
  }

  private createEmptyPerformanceWindow(): PerformanceWindow {
    const now = Date.now();
    return {
      startTime: now,
      endTime: now,
      trades: 0,
      successRate: 0.5,
      profit: 0,
      volatility: 0,
      confidence: 0.5,
      learningRate: this.learningConfig.learningRate,
    };
  }

  private getDefaultMarketConditions(): MarketConditions {
    return {
      trend: 'sideways',
      volatility: 0.02,
      volume: 1000000,
      sentiment: 0,
      technicalIndicators: {
        rsi: 50,
        macd: 0,
        bb_position: 0.5,
        momentum: 0,
      }
    };
  }

  /**
   * Get current model performance
   */
  getModelPerformance(provider: string): AIModelPerformance | null {
    return this.modelPerformance.get(provider) || null;
  }

  /**
   * Get all model performances
   */
  getAllModelPerformances(): Map<string, AIModelPerformance> {
    return new Map(this.modelPerformance);
  }

  /**
   * Get optimized model weights for ensemble
   */
  getOptimizedWeights(): Record<string, number> {
    const weights: Record<string, number> = {};
    let totalWeight = 0;
    
    // Collect current weights
    this.modelPerformance.forEach((performance, provider) => {
      weights[provider] = performance.weightings.volatilityAdjusted;
      totalWeight += weights[provider];
    });
    
    // Normalize weights to sum to 1
    if (totalWeight > 0) {
      Object.keys(weights).forEach(provider => {
        weights[provider] = weights[provider] / totalWeight;
      });
    }
    
    return weights;
  }

  /**
   * Get learning statistics
   */
  getLearningStats(): any {
    const stats = {
      totalModels: this.modelPerformance.size,
      totalTrades: 0,
      averageAccuracy: 0,
      bestPerformer: '',
      worstPerformer: '',
      learningEnabled: this.learningConfig.adaptiveLearning,
      lastUpdate: this.lastUpdate,
    };
    
    let bestScore = 0;
    let worstScore = 1;
    let totalAccuracy = 0;
    
    this.modelPerformance.forEach((performance, provider) => {
      stats.totalTrades += performance.learningData.totalTrades;
      totalAccuracy += performance.metrics.accuracy;
      
      if (performance.metrics.accuracy > bestScore) {
        bestScore = performance.metrics.accuracy;
        stats.bestPerformer = provider;
      }
      
      if (performance.metrics.accuracy < worstScore) {
        worstScore = performance.metrics.accuracy;
        stats.worstPerformer = provider;
      }
    });
    
    stats.averageAccuracy = totalAccuracy / this.modelPerformance.size;
    
    return stats;
  }

  /**
   * Start learning process
   */
  async startLearning(): Promise<void> {
    if (this.isLearning) return;
    
    this.isLearning = true;
    console.log('🎓 AI Performance Learning System started');
    
    this.emit('learningStarted', {
      timestamp: Date.now(),
      config: this.learningConfig
    });
  }

  /**
   * Stop learning process
   */
  async stopLearning(): Promise<void> {
    this.isLearning = false;
    console.log('🎓 AI Performance Learning System stopped');
    
    this.emit('learningStopped', {
      timestamp: Date.now(),
      finalStats: this.getLearningStats()
    });
  }

  /**
   * Reset learning data
   */
  async resetLearningData(): Promise<void> {
    this.tradeResults.clear();
    this.modelPerformance.clear();
    this.initializeModelPerformance();
    this.lastUpdate = Date.now();
    
    console.log('🔄 AI Performance Learning data reset');
    
    this.emit('learningReset', {
      timestamp: Date.now()
    });
  }
}