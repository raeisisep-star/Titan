/**
 * TITAN Trading System - Real-time Market Monitor
 * 
 * Advanced real-time market monitoring system with continuous AI analysis.
 * Provides live market insights, alerts, and automated decision support.
 */

import { getAIManager, AIManager, MarketInsights, AITradingRecommendation } from './ai-manager';
import { EventEmitter } from '../utils/event-emitter';

export interface MarketMonitorConfig {
  symbols: string[];
  intervals: ('1m' | '5m' | '15m' | '1h' | '4h' | '1d')[];
  enableAlerts: boolean;
  enableAutoSignals: boolean;
  aiUpdateInterval: number; // milliseconds
  significanceThreshold: number; // 0-1, how significant changes need to be
  maxConcurrentAnalysis: number;
  enablePredictiveAnalysis: boolean;
  enableSentimentTracking: boolean;
}

export interface MarketAlert {
  id: string;
  symbol: string;
  type: 'price_movement' | 'volume_spike' | 'pattern_detected' | 'sentiment_change' | 'ai_signal';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  data: any;
  timestamp: Date;
  aiConfidence: number;
  actionRequired: boolean;
  suggestedActions: string[];
}

export interface MarketSnapshot {
  timestamp: Date;
  symbol: string;
  price: number;
  volume: number;
  change24h: number;
  marketCap?: number;
  indicators: Record<string, number>;
  aiInsights: MarketInsights;
  alerts: MarketAlert[];
  prediction: {
    shortTerm: { direction: 'up' | 'down' | 'sideways'; confidence: number; timeframe: string };
    mediumTerm: { direction: 'up' | 'down' | 'sideways'; confidence: number; timeframe: string };
  };
}

export interface MonitoringStats {
  uptime: number;
  totalAnalysis: number;
  alertsGenerated: number;
  accuracyRate: number;
  aiPerformance: {
    averageResponseTime: number;
    successRate: number;
    costPerAnalysis: number;
  };
  marketCoverage: {
    symbolsMonitored: number;
    intervalsTracked: number;
    dataPointsPerMinute: number;
  };
}

/**
 * Real-time Market Monitor with AI Analysis
 * 
 * Features:
 * - Continuous market data ingestion
 * - Real-time AI analysis and insights
 * - Intelligent alert system
 * - Predictive market analysis
 * - Performance tracking and optimization
 */
export class MarketMonitor extends EventEmitter {
  private config: MarketMonitorConfig;
  private aiManager: AIManager;
  private isRunning: boolean = false;
  private marketData: Map<string, MarketSnapshot> = new Map();
  private analysisQueue: Array<{ symbol: string; priority: number }> = [];
  private stats: MonitoringStats;
  private intervals: Map<string, NodeJS.Timeout> = new Map();
  private alertHistory: MarketAlert[] = [];
  private performanceMetrics: Map<string, number[]> = new Map();

  constructor(config: MarketMonitorConfig) {
    super();
    this.config = {
      aiUpdateInterval: 30000, // 30 seconds default
      significanceThreshold: 0.02, // 2% change threshold
      maxConcurrentAnalysis: 5,
      enablePredictiveAnalysis: true,
      enableSentimentTracking: true,
      ...config
    };
    
    this.aiManager = getAIManager();
    this.initializeStats();
    
    console.log(`🔍 Market Monitor initialized for ${config.symbols.length} symbols`);
  }

  /**
   * Initialize monitoring statistics
   */
  private initializeStats(): void {
    this.stats = {
      uptime: Date.now(),
      totalAnalysis: 0,
      alertsGenerated: 0,
      accuracyRate: 0,
      aiPerformance: {
        averageResponseTime: 0,
        successRate: 0,
        costPerAnalysis: 0
      },
      marketCoverage: {
        symbolsMonitored: this.config.symbols.length,
        intervalsTracked: this.config.intervals.length,
        dataPointsPerMinute: 0
      }
    };
  }

  /**
   * Start real-time monitoring
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ Market Monitor is already running');
      return;
    }

    console.log('🚀 Starting Real-time Market Monitor...');
    this.isRunning = true;
    this.emit('monitoring:started');

    // Start monitoring for each symbol
    for (const symbol of this.config.symbols) {
      await this.startSymbolMonitoring(symbol);
    }

    // Start AI analysis loop
    this.startAIAnalysisLoop();

    // Start alert processing
    this.startAlertProcessing();

    // Start performance tracking
    this.startPerformanceTracking();

    console.log(`✅ Market Monitor active for ${this.config.symbols.length} symbols`);
  }

  /**
   * Stop monitoring
   */
  async stop(): Promise<void> {
    if (!this.isRunning) return;

    console.log('🛑 Stopping Market Monitor...');
    this.isRunning = false;

    // Clear all intervals
    for (const [key, interval] of this.intervals) {
      clearInterval(interval);
    }
    this.intervals.clear();

    this.emit('monitoring:stopped');
    console.log('✅ Market Monitor stopped');
  }

  /**
   * Start monitoring for a specific symbol
   */
  private async startSymbolMonitoring(symbol: string): Promise<void> {
    // Initialize market snapshot
    const snapshot: MarketSnapshot = {
      timestamp: new Date(),
      symbol,
      price: 0,
      volume: 0,
      change24h: 0,
      indicators: {},
      aiInsights: {} as MarketInsights,
      alerts: [],
      prediction: {
        shortTerm: { direction: 'sideways', confidence: 0, timeframe: '1h' },
        mediumTerm: { direction: 'sideways', confidence: 0, timeframe: '4h' }
      }
    };
    
    this.marketData.set(symbol, snapshot);

    // Set up data collection intervals for each timeframe
    for (const interval of this.config.intervals) {
      const intervalMs = this.getIntervalMs(interval);
      const intervalId = setInterval(async () => {
        await this.collectMarketData(symbol, interval);
      }, intervalMs);
      
      this.intervals.set(`${symbol}_${interval}`, intervalId);
    }

    // Add to analysis queue
    this.analysisQueue.push({ symbol, priority: 1 });
  }

  /**
   * Convert interval string to milliseconds
   */
  private getIntervalMs(interval: string): number {
    const multipliers = {
      '1m': 60 * 1000,
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000
    };
    return multipliers[interval] || 60 * 1000;
  }

  /**
   * Collect market data for symbol
   */
  private async collectMarketData(symbol: string, interval: string): Promise<void> {
    try {
      // Simulate market data collection (in production, this would connect to real APIs)
      const mockData = this.generateMockMarketData(symbol);
      
      const snapshot = this.marketData.get(symbol);
      if (!snapshot) return;

      // Update snapshot with new data
      const previousPrice = snapshot.price;
      snapshot.timestamp = new Date();
      snapshot.price = mockData.price;
      snapshot.volume = mockData.volume;
      snapshot.change24h = mockData.change24h;
      snapshot.indicators = mockData.indicators;

      // Check for significant price movements
      if (previousPrice > 0) {
        const priceChange = Math.abs((mockData.price - previousPrice) / previousPrice);
        if (priceChange >= this.config.significanceThreshold) {
          // Add to high-priority analysis queue
          this.analysisQueue.unshift({ symbol, priority: 10 });
          
          // Generate immediate alert
          await this.generateAlert({
            symbol,
            type: 'price_movement',
            severity: priceChange > 0.05 ? 'high' : 'medium',
            message: `Significant price movement detected: ${(priceChange * 100).toFixed(2)}%`,
            data: { priceChange, previousPrice, currentPrice: mockData.price },
            aiConfidence: 0.8,
            actionRequired: priceChange > 0.03,
            suggestedActions: priceChange > 0.03 ? ['Review position', 'Consider stop-loss adjustment'] : []
          });
        }
      }

      this.marketData.set(symbol, snapshot);
      this.emit('data:updated', { symbol, snapshot });
      
    } catch (error) {
      console.error(`❌ Error collecting data for ${symbol}:`, error);
      this.emit('error', { symbol, error });
    }
  }

  /**
   * Generate mock market data (replace with real API calls)
   */
  private generateMockMarketData(symbol: string) {
    const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 2500 : 100;
    const volatility = 0.02; // 2% volatility
    
    const priceChange = (Math.random() - 0.5) * volatility * 2;
    const price = basePrice * (1 + priceChange);
    const volume = Math.random() * 1000000;
    const change24h = (Math.random() - 0.5) * 0.1; // ±10%
    
    return {
      price,
      volume,
      change24h,
      indicators: {
        rsi: 30 + Math.random() * 40, // RSI between 30-70
        macd: (Math.random() - 0.5) * 0.1,
        bb_upper: price * 1.02,
        bb_lower: price * 0.98,
        volume_sma: volume * 0.8
      }
    };
  }

  /**
   * Start AI analysis loop
   */
  private startAIAnalysisLoop(): void {
    const analysisInterval = setInterval(async () => {
      if (!this.isRunning || this.analysisQueue.length === 0) return;

      // Process up to maxConcurrentAnalysis symbols
      const symbolsToAnalyze = this.analysisQueue
        .sort((a, b) => b.priority - a.priority)
        .slice(0, this.config.maxConcurrentAnalysis)
        .map(item => item.symbol);

      // Remove processed symbols from queue
      this.analysisQueue = this.analysisQueue.filter(
        item => !symbolsToAnalyze.includes(item.symbol)
      );

      // Perform AI analysis
      await Promise.all(
        symbolsToAnalyze.map(symbol => this.performAIAnalysis(symbol))
      );

    }, this.config.aiUpdateInterval);

    this.intervals.set('ai_analysis', analysisInterval);
  }

  /**
   * Perform AI analysis for a symbol
   */
  private async performAIAnalysis(symbol: string): Promise<void> {
    const startTime = Date.now();
    
    try {
      const snapshot = this.marketData.get(symbol);
      if (!snapshot) return;

      // Perform comprehensive AI analysis
      const [insights, recommendation] = await Promise.all([
        // Market analysis
        this.aiManager.analyzeSymbol({
          symbol,
          marketData: {
            price: snapshot.price,
            volume: snapshot.volume,
            indicators: snapshot.indicators
          },
          analysisType: 'detailed',
          includeSentiment: this.config.enableSentimentTracking,
          includeRisk: true
        }),
        
        // Trading signal generation
        this.aiManager.generateRecommendation(
          symbol,
          {
            price: snapshot.price,
            volume: snapshot.volume,
            indicators: snapshot.indicators
          }
        )
      ]);

      // Update snapshot with AI insights
      snapshot.aiInsights = insights;
      snapshot.timestamp = new Date();

      // Generate predictions if enabled
      if (this.config.enablePredictiveAnalysis) {
        snapshot.prediction = await this.generatePredictions(symbol, insights);
      }

      // Check for actionable signals
      if (this.config.enableAutoSignals && recommendation.confidence > 0.7) {
        await this.generateAlert({
          symbol,
          type: 'ai_signal',
          severity: recommendation.confidence > 0.9 ? 'high' : 'medium',
          message: `AI Signal: ${recommendation.action.toUpperCase()} (${recommendation.confidence * 100}% confidence)`,
          data: recommendation,
          aiConfidence: recommendation.confidence,
          actionRequired: recommendation.confidence > 0.8,
          suggestedActions: recommendation.reasoning
        });
      }

      // Update performance metrics
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(symbol, responseTime, true);
      this.stats.totalAnalysis++;

      this.marketData.set(symbol, snapshot);
      this.emit('analysis:completed', { symbol, insights, recommendation });

    } catch (error) {
      const responseTime = Date.now() - startTime;
      this.updatePerformanceMetrics(symbol, responseTime, false);
      
      console.error(`❌ AI Analysis failed for ${symbol}:`, error);
      this.emit('analysis:failed', { symbol, error });
    }
  }

  /**
   * Generate market predictions
   */
  private async generatePredictions(symbol: string, insights: MarketInsights) {
    try {
      const query = `Based on current market analysis for ${symbol}, provide short-term (1h) and medium-term (4h) price direction predictions with confidence levels.`;
      
      const response = await this.aiManager.processQuery(query, {
        symbol,
        insights,
        requestType: 'prediction'
      });

      // Parse AI response for predictions (simplified)
      const shortTerm = {
        direction: insights.overview.trend === 'bullish' ? 'up' : 
                  insights.overview.trend === 'bearish' ? 'down' : 'sideways',
        confidence: insights.overview.confidence / 100,
        timeframe: '1h'
      };

      const mediumTerm = {
        direction: insights.predictions.mediumTerm.direction || 'sideways',
        confidence: insights.predictions.mediumTerm.confidence || 0,
        timeframe: '4h'
      };

      return { shortTerm, mediumTerm };
    } catch (error) {
      console.warn(`⚠️ Prediction generation failed for ${symbol}:`, error);
      return {
        shortTerm: { direction: 'sideways' as const, confidence: 0, timeframe: '1h' },
        mediumTerm: { direction: 'sideways' as const, confidence: 0, timeframe: '4h' }
      };
    }
  }

  /**
   * Generate and process market alert
   */
  private async generateAlert(alertData: Omit<MarketAlert, 'id' | 'timestamp'>): Promise<void> {
    const alert: MarketAlert = {
      ...alertData,
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date()
    };

    this.alertHistory.push(alert);
    this.stats.alertsGenerated++;

    // Add alert to symbol snapshot
    const snapshot = this.marketData.get(alert.symbol);
    if (snapshot) {
      snapshot.alerts.push(alert);
      // Keep only last 10 alerts per symbol
      snapshot.alerts = snapshot.alerts.slice(-10);
    }

    this.emit('alert:generated', alert);
    
    // Log high-severity alerts
    if (alert.severity === 'high' || alert.severity === 'critical') {
      console.log(`🚨 ${alert.severity.toUpperCase()} ALERT: ${alert.message}`);
    }
  }

  /**
   * Start alert processing system
   */
  private startAlertProcessing(): void {
    // Clean up old alerts every 5 minutes
    const cleanupInterval = setInterval(() => {
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      this.alertHistory = this.alertHistory.filter(alert => 
        alert.timestamp.getTime() > cutoffTime
      );
    }, 5 * 60 * 1000);

    this.intervals.set('alert_cleanup', cleanupInterval);
  }

  /**
   * Start performance tracking
   */
  private startPerformanceTracking(): void {
    const trackingInterval = setInterval(() => {
      this.updateStats();
      this.emit('stats:updated', this.stats);
    }, 60 * 1000); // Update every minute

    this.intervals.set('performance_tracking', trackingInterval);
  }

  /**
   * Update performance metrics
   */
  private updatePerformanceMetrics(symbol: string, responseTime: number, success: boolean): void {
    if (!this.performanceMetrics.has(symbol)) {
      this.performanceMetrics.set(symbol, []);
    }

    const metrics = this.performanceMetrics.get(symbol)!;
    metrics.push(success ? responseTime : -1);
    
    // Keep only last 100 measurements
    if (metrics.length > 100) {
      metrics.shift();
    }
  }

  /**
   * Update statistics
   */
  private updateStats(): void {
    const now = Date.now();
    this.stats.uptime = now - this.stats.uptime;

    // Calculate AI performance metrics
    const allMetrics = Array.from(this.performanceMetrics.values()).flat();
    const successfulMetrics = allMetrics.filter(m => m > 0);
    
    if (successfulMetrics.length > 0) {
      this.stats.aiPerformance.averageResponseTime = 
        successfulMetrics.reduce((sum, time) => sum + time, 0) / successfulMetrics.length;
      this.stats.aiPerformance.successRate = successfulMetrics.length / allMetrics.length;
    }

    // Calculate data points per minute
    this.stats.marketCoverage.dataPointsPerMinute = 
      this.config.symbols.length * this.config.intervals.length;
  }

  /**
   * Get current market snapshots
   */
  getMarketSnapshots(): Record<string, MarketSnapshot> {
    const snapshots: Record<string, MarketSnapshot> = {};
    for (const [symbol, snapshot] of this.marketData) {
      snapshots[symbol] = { ...snapshot };
    }
    return snapshots;
  }

  /**
   * Get monitoring statistics
   */
  getStats(): MonitoringStats {
    return { ...this.stats };
  }

  /**
   * Get recent alerts
   */
  getRecentAlerts(limit: number = 50): MarketAlert[] {
    return this.alertHistory
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  /**
   * Add symbol to monitoring
   */
  async addSymbol(symbol: string): Promise<void> {
    if (this.config.symbols.includes(symbol)) {
      console.warn(`⚠️ Symbol ${symbol} already being monitored`);
      return;
    }

    this.config.symbols.push(symbol);
    await this.startSymbolMonitoring(symbol);
    this.stats.marketCoverage.symbolsMonitored = this.config.symbols.length;
    
    console.log(`✅ Added ${symbol} to monitoring`);
    this.emit('symbol:added', { symbol });
  }

  /**
   * Remove symbol from monitoring
   */
  async removeSymbol(symbol: string): Promise<void> {
    const index = this.config.symbols.indexOf(symbol);
    if (index === -1) {
      console.warn(`⚠️ Symbol ${symbol} not being monitored`);
      return;
    }

    // Remove from config
    this.config.symbols.splice(index, 1);

    // Clear intervals for this symbol
    for (const interval of this.config.intervals) {
      const intervalKey = `${symbol}_${interval}`;
      const intervalId = this.intervals.get(intervalKey);
      if (intervalId) {
        clearInterval(intervalId);
        this.intervals.delete(intervalKey);
      }
    }

    // Remove data
    this.marketData.delete(symbol);
    this.performanceMetrics.delete(symbol);

    // Remove from analysis queue
    this.analysisQueue = this.analysisQueue.filter(item => item.symbol !== symbol);

    this.stats.marketCoverage.symbolsMonitored = this.config.symbols.length;
    
    console.log(`✅ Removed ${symbol} from monitoring`);
    this.emit('symbol:removed', { symbol });
  }

  /**
   * Update monitoring configuration
   */
  updateConfig(newConfig: Partial<MarketMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config:updated', this.config);
    console.log('✅ Monitor configuration updated');
  }
}

/**
 * Global market monitor instance
 */
let globalMarketMonitor: MarketMonitor | null = null;

/**
 * Initialize global market monitor
 */
export function initializeMarketMonitor(config: MarketMonitorConfig): MarketMonitor {
  if (globalMarketMonitor) {
    console.warn('⚠️ Market Monitor already initialized');
    return globalMarketMonitor;
  }

  globalMarketMonitor = new MarketMonitor(config);
  return globalMarketMonitor;
}

/**
 * Get global market monitor instance
 */
export function getMarketMonitor(): MarketMonitor | null {
  return globalMarketMonitor;
}

export default MarketMonitor;