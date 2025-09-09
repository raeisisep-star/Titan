/**
 * TITAN Trading System - AI Manager
 * 
 * Central management system for all AI operations in the trading platform.
 * Provides a simplified interface for complex AI operations and manages
 * the orchestration between different AI services and trading components.
 */

import { AIServicesFactory, AIRoutingConfig, AIUsageStats, AICapability } from './ai-factory';
import { BaseAIService, MarketAnalysis, TradingSignal, TradingStrategy } from './base-ai-service';

export interface AIManagerConfig {
  openaiApiKey?: string;
  geminiApiKey?: string;
  claudeApiKey?: string;
  defaultRoutingConfig?: AIRoutingConfig;
  enableCaching?: boolean;
  cacheTTL?: number; // Cache time-to-live in milliseconds
  maxConcurrentRequests?: number;
  enableRealTimeAnalysis?: boolean;
}

export interface MarketInsights {
  overview: {
    trend: 'bullish' | 'bearish' | 'neutral' | 'volatile';
    confidence: number;
    timeframe: string;
    lastUpdated: string;
  };
  technicalAnalysis: {
    support: number[];
    resistance: number[];
    indicators: Record<string, any>;
    patterns: string[];
  };
  sentimentAnalysis: {
    overall: 'positive' | 'negative' | 'neutral';
    score: number; // -1 to 1
    sources: string[];
    keyFactors: string[];
  };
  riskAssessment: {
    level: 'low' | 'medium' | 'high' | 'extreme';
    factors: string[];
    recommendations: string[];
  };
  predictions: {
    shortTerm: { direction: string; confidence: number; timeframe: string };
    mediumTerm: { direction: string; confidence: number; timeframe: string };
    longTerm: { direction: string; confidence: number; timeframe: string };
  };
}

export interface AITradingRecommendation {
  action: 'buy' | 'sell' | 'hold' | 'wait';
  confidence: number;
  reasoning: string[];
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskReward: number;
  timeframe: string;
  maxPosition: number;
  aiProvider: string;
  generatedAt: string;
}

export interface AIAnalysisRequest {
  symbol: string;
  marketData?: any;
  timeframe?: string;
  analysisType?: 'quick' | 'detailed' | 'comprehensive';
  includeSignals?: boolean;
  includeSentiment?: boolean;
  includeRisk?: boolean;
  userPreferences?: any;
  context?: string;
}

/**
 * AI Manager - Central orchestrator for all AI operations
 * 
 * Features:
 * - Unified interface for all AI services
 * - Intelligent caching and performance optimization  
 * - Real-time market analysis coordination
 * - Trading recommendation generation
 * - Natural language processing for user queries
 * - Analytics and usage monitoring
 */
export class AIManager {
  private aiFactory: AIServicesFactory;
  private config: AIManagerConfig;
  private cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
  private activeRequests: Map<string, Promise<any>> = new Map();
  private analysisQueue: Array<() => Promise<void>> = [];
  private isProcessingQueue: boolean = false;

  constructor(config: AIManagerConfig) {
    this.config = {
      enableCaching: true,
      cacheTTL: 5 * 60 * 1000, // 5 minutes default
      maxConcurrentRequests: 10,
      enableRealTimeAnalysis: true,
      ...config
    };

    this.aiFactory = new AIServicesFactory({
      openaiApiKey: config.openaiApiKey,
      geminiApiKey: config.geminiApiKey,
      claudeApiKey: config.claudeApiKey
    });

    this.startCacheCleanup();
  }

  /**
   * Start automatic cache cleanup
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now - item.timestamp > item.ttl) {
          this.cache.delete(key);
        }
      }
    }, 60000); // Cleanup every minute
  }

  /**
   * Generate cache key for requests
   */
  private getCacheKey(operation: string, params: any): string {
    return `${operation}:${JSON.stringify(params)}`;
  }

  /**
   * Get cached result if available and valid
   */
  private getCachedResult(key: string): any | null {
    if (!this.config.enableCaching) return null;
    
    const cached = this.cache.get(key);
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Cache result with TTL
   */
  private setCachedResult(key: string, data: any, customTTL?: number): void {
    if (!this.config.enableCaching) return;

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTTL || this.config.cacheTTL!
    });
  }

  /**
   * Execute operation with caching and deduplication
   */
  private async executeWithCache<T>(
    operation: string,
    params: any,
    executor: () => Promise<T>,
    customTTL?: number
  ): Promise<T> {
    const cacheKey = this.getCacheKey(operation, params);

    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      return cached;
    }

    // Check if same request is already in progress
    if (this.activeRequests.has(cacheKey)) {
      return await this.activeRequests.get(cacheKey);
    }

    // Execute new request
    const requestPromise = executor();
    this.activeRequests.set(cacheKey, requestPromise);

    try {
      const result = await requestPromise;
      this.setCachedResult(cacheKey, result, customTTL);
      return result;
    } finally {
      this.activeRequests.delete(cacheKey);
    }
  }

  /**
   * Comprehensive market analysis for a symbol
   */
  async analyzeSymbol(request: AIAnalysisRequest): Promise<MarketInsights> {
    return this.executeWithCache(
      'analyzeSymbol',
      request,
      async () => {
        const { symbol, marketData, analysisType = 'detailed' } = request;

        // Determine routing config based on analysis type
        const routingConfig: AIRoutingConfig = {
          ...this.config.defaultRoutingConfig,
          prioritizeSpeed: analysisType === 'quick',
          prioritizeAccuracy: analysisType === 'comprehensive',
          fallbackEnabled: true
        };

        // Perform market analysis
        const analysisResult = await this.aiFactory.analyzeMarket(
          symbol,
          marketData,
          request.context,
          routingConfig
        );

        // Perform sentiment analysis if requested
        let sentimentResult = null;
        if (request.includeSentiment) {
          try {
            sentimentResult = await this.aiFactory.analyzeSentiment(
              `Current market conditions for ${symbol}`,
              { symbol, marketData },
              routingConfig
            );
          } catch (error) {
            console.warn('Sentiment analysis failed:', error);
          }
        }

        // Perform risk assessment if requested
        let riskResult = null;
        if (request.includeRisk) {
          try {
            riskResult = await this.aiFactory.assessRisk(
              { symbol, marketData },
              marketData,
              routingConfig
            );
          } catch (error) {
            console.warn('Risk assessment failed:', error);
          }
        }

        // Compile comprehensive insights
        const insights: MarketInsights = {
          overview: {
            trend: analysisResult.data?.trend || 'neutral',
            confidence: analysisResult.data?.confidence || 0,
            timeframe: request.timeframe || '1d',
            lastUpdated: new Date().toISOString()
          },
          technicalAnalysis: {
            support: analysisResult.data?.support || [],
            resistance: analysisResult.data?.resistance || [],
            indicators: analysisResult.data?.indicators || {},
            patterns: analysisResult.data?.patterns || []
          },
          sentimentAnalysis: {
            overall: sentimentResult?.data?.sentiment === 'bullish' ? 'positive' :
                    sentimentResult?.data?.sentiment === 'bearish' ? 'negative' : 'neutral',
            score: sentimentResult?.data?.confidence || 0,
            sources: sentimentResult?.data?.keyFactors || [],
            keyFactors: sentimentResult?.data?.keyFactors || []
          },
          riskAssessment: {
            level: riskResult?.data?.riskLevel || 'medium',
            factors: riskResult?.data?.riskFactors || [],
            recommendations: riskResult?.data?.recommendations || []
          },
          predictions: {
            shortTerm: {
              direction: analysisResult.data?.shortTermOutlook || 'uncertain',
              confidence: analysisResult.data?.shortTermConfidence || 0,
              timeframe: '1-3 days'
            },
            mediumTerm: {
              direction: analysisResult.data?.mediumTermOutlook || 'uncertain',
              confidence: analysisResult.data?.mediumTermConfidence || 0,
              timeframe: '1-2 weeks'
            },
            longTerm: {
              direction: analysisResult.data?.longTermOutlook || 'uncertain',
              confidence: analysisResult.data?.longTermConfidence || 0,
              timeframe: '1-3 months'
            }
          }
        };

        return insights;
      },
      analysisType === 'quick' ? 2 * 60 * 1000 : // 2 minutes for quick analysis
      analysisType === 'detailed' ? 5 * 60 * 1000 : // 5 minutes for detailed
      10 * 60 * 1000 // 10 minutes for comprehensive
    );
  }

  /**
   * Generate AI-powered trading recommendation
   */
  async generateRecommendation(
    symbol: string,
    marketData: any,
    userPreferences?: any
  ): Promise<AITradingRecommendation> {
    return this.executeWithCache(
      'generateRecommendation',
      { symbol, marketData, userPreferences },
      async () => {
        const routingConfig: AIRoutingConfig = {
          ...this.config.defaultRoutingConfig,
          prioritizeAccuracy: true,
          fallbackEnabled: true
        };

        // Generate trading signal
        const signalResult = await this.aiFactory.generateTradingSignal(
          symbol,
          marketData,
          userPreferences,
          routingConfig
        );

        // Get market analysis for additional context
        const analysisResult = await this.aiFactory.analyzeMarket(
          symbol,
          marketData,
          'Generate trading recommendation',
          routingConfig
        );

        // Generate comprehensive recommendation
        const signal = signalResult.data;
        const analysis = analysisResult.data;

        const recommendation: AITradingRecommendation = {
          action: signal?.action || 'hold',
          confidence: signal?.confidence || 0,
          reasoning: [
            ...(signal?.reasoning || []),
            ...(analysis?.keyInsights || [])
          ],
          entryPrice: signal?.entryPrice,
          stopLoss: signal?.stopLoss,
          takeProfit: signal?.takeProfit,
          riskReward: signal?.riskReward || 0,
          timeframe: signal?.timeframe || '1d',
          maxPosition: signal?.positionSize || 1,
          aiProvider: signalResult.provider || 'unknown',
          generatedAt: new Date().toISOString()
        };

        return recommendation;
      },
      3 * 60 * 1000 // 3 minutes cache
    );
  }

  /**
   * Process natural language query about trading
   */
  async processQuery(
    query: string,
    context?: any
  ): Promise<{
    response: string;
    suggestions: string[];
    relatedActions: string[];
    confidence: number;
  }> {
    return this.executeWithCache(
      'processQuery',
      { query, context },
      async () => {
        const routingConfig: AIRoutingConfig = {
          ...this.config.defaultRoutingConfig,
          prioritizeSpeed: true,
          fallbackEnabled: true
        };

        const result = await this.aiFactory.processNaturalLanguage(
          query,
          context,
          routingConfig
        );

        return {
          response: result.data || 'I apologize, but I cannot process your query at the moment.',
          suggestions: [
            'Ask about market trends',
            'Request trading signals',
            'Get risk analysis',
            'Analyze specific symbols'
          ],
          relatedActions: [
            'analyze_market',
            'generate_signal',
            'assess_risk',
            'view_portfolio'
          ],
          confidence: result.confidence || 0
        };
      },
      1 * 60 * 1000 // 1 minute cache for queries
    );
  }

  /**
   * Generate automated trading strategy based on requirements
   */
  async generateStrategy(
    requirements: {
      riskTolerance: 'low' | 'medium' | 'high';
      timeframe: 'scalping' | 'day' | 'swing' | 'position';
      capital: number;
      goals: string[];
      constraints: string[];
    }
  ): Promise<TradingStrategy> {
    return this.executeWithCache(
      'generateStrategy',
      requirements,
      async () => {
        const routingConfig: AIRoutingConfig = {
          ...this.config.defaultRoutingConfig,
          prioritizeAccuracy: true,
          preferredProvider: 'claude', // Claude is best for strategy generation
          fallbackEnabled: true
        };

        const result = await this.aiFactory.generateTradingStrategy(
          requirements,
          routingConfig
        );

        return result.data || {
          name: 'Default Strategy',
          description: 'Basic trading strategy',
          rules: [],
          riskManagement: {},
          expectedReturn: 0,
          maxDrawdown: 0,
          timeframe: requirements.timeframe,
          complexity: 'simple'
        };
      },
      15 * 60 * 1000 // 15 minutes cache for strategies
    );
  }

  /**
   * Batch analyze multiple symbols
   */
  async batchAnalyze(
    symbols: string[],
    marketData: Record<string, any>,
    options: {
      analysisType?: 'quick' | 'detailed';
      includeSignals?: boolean;
      maxConcurrent?: number;
    } = {}
  ): Promise<Record<string, MarketInsights | AITradingRecommendation>> {
    const { analysisType = 'quick', includeSignals = false, maxConcurrent = 5 } = options;
    const results: Record<string, any> = {};

    // Process symbols in batches to avoid overwhelming the AI services
    for (let i = 0; i < symbols.length; i += maxConcurrent) {
      const batch = symbols.slice(i, i + maxConcurrent);
      
      const batchPromises = batch.map(async (symbol) => {
        try {
          if (includeSignals) {
            results[symbol] = await this.generateRecommendation(
              symbol,
              marketData[symbol] || {}
            );
          } else {
            results[symbol] = await this.analyzeSymbol({
              symbol,
              marketData: marketData[symbol] || {},
              analysisType
            });
          }
        } catch (error) {
          console.error(`Analysis failed for ${symbol}:`, error);
          results[symbol] = { error: (error as Error).message };
        }
      });

      await Promise.all(batchPromises);
    }

    return results;
  }

  /**
   * Get AI service health and performance metrics
   */
  async getServiceHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    providers: Record<string, any>;
    usageStats: AIUsageStats;
    cacheStats: {
      size: number;
      hitRate: number;
      totalHits: number;
      totalMisses: number;
    };
  }> {
    const [providerHealth, usageStats] = await Promise.all([
      this.aiFactory.testProviders(),
      Promise.resolve(this.aiFactory.getUsageStats())
    ]);

    // Calculate cache statistics
    const cacheStats = {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses to calculate
      totalHits: 0,
      totalMisses: 0
    };

    // Determine overall health status
    const healthyProviders = Object.values(providerHealth)
      .filter(provider => provider.status === 'healthy').length;
    const totalProviders = Object.keys(providerHealth).length;
    
    let status: 'healthy' | 'degraded' | 'unhealthy';
    if (healthyProviders === totalProviders) {
      status = 'healthy';
    } else if (healthyProviders > 0) {
      status = 'degraded';
    } else {
      status = 'unhealthy';
    }

    return {
      status,
      providers: providerHealth,
      usageStats,
      cacheStats
    };
  }

  /**
   * Configure AI routing preferences
   */
  setRoutingConfig(config: AIRoutingConfig): void {
    this.config.defaultRoutingConfig = { ...this.config.defaultRoutingConfig, ...config };
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear();
    this.activeRequests.clear();
  }

  /**
   * Get current configuration
   */
  getConfig(): AIManagerConfig {
    return { ...this.config };
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AIManagerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get usage and cost estimation
   */
  estimateUsageCost(
    operations: Array<{
      type: AICapability;
      count: number;
      inputSize: number;
      outputSize?: number;
    }>
  ): {
    totalCost: number;
    breakdown: Record<string, number>;
    recommendations: string[];
  } {
    let totalCost = 0;
    const breakdown: Record<string, number> = {};
    const recommendations: string[] = [];

    for (const operation of operations) {
      const cost = this.aiFactory.estimateCost(
        operation.type,
        operation.inputSize,
        operation.outputSize || 500
      ) * operation.count;
      
      totalCost += cost;
      breakdown[operation.type] = cost;
    }

    // Generate cost optimization recommendations
    if (totalCost > 10) {
      recommendations.push('Consider enabling aggressive caching to reduce API calls');
    }
    if (totalCost > 50) {
      recommendations.push('Use batch operations where possible to optimize costs');
    }

    return { totalCost, breakdown, recommendations };
  }
}

/**
 * Default AI Manager instance
 */
export let defaultAIManager: AIManager;

/**
 * Initialize AI Manager with configuration
 */
export function initializeAIManager(config: AIManagerConfig): AIManager {
  defaultAIManager = new AIManager(config);
  return defaultAIManager;
}

/**
 * Get or create default AI Manager instance
 */
export function getAIManager(): AIManager {
  if (!defaultAIManager) {
    defaultAIManager = new AIManager({
      openaiApiKey: process.env.OPENAI_API_KEY,
      geminiApiKey: process.env.GEMINI_API_KEY,
      claudeApiKey: process.env.CLAUDE_API_KEY
    });
  }
  return defaultAIManager;
}

export default AIManager;