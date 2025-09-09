/**
 * TITAN Trading System - AI Services Factory
 * 
 * This factory provides unified management and intelligent routing for all AI services.
 * It automatically selects the best AI service based on the type of analysis required,
 * manages fallbacks, load balancing, and cost optimization across providers.
 */

import { BaseAIService, AIRequest, AIResponse, MarketAnalysis, TradingSignal, TradingStrategy } from './base-ai-service';
import { OpenAIService } from './openai-service';
import { GeminiService } from './gemini-service';
import { ClaudeService } from './claude-service';

export interface AIServiceProvider {
  name: 'openai' | 'gemini' | 'claude';
  service: BaseAIService;
  strengths: AICapability[];
  costEfficiency: 'high' | 'medium' | 'low';
  responseTime: 'fast' | 'medium' | 'slow';
  reliability: number; // 0-1 scale
}

export type AICapability = 
  | 'market_analysis'
  | 'technical_analysis' 
  | 'sentiment_analysis'
  | 'pattern_recognition'
  | 'risk_assessment'
  | 'strategy_generation'
  | 'natural_language'
  | 'reasoning'
  | 'multi_modal'
  | 'real_time_analysis';

export interface AIRoutingConfig {
  preferredProvider?: 'openai' | 'gemini' | 'claude';
  maxCostPerRequest?: number;
  prioritizeSpeed?: boolean;
  prioritizeCost?: boolean;
  prioritizeAccuracy?: boolean;
  fallbackEnabled?: boolean;
  loadBalancing?: boolean;
}

export interface AIUsageStats {
  totalRequests: number;
  totalCost: number;
  averageResponseTime: number;
  successRate: number;
  providerBreakdown: Record<string, {
    requests: number;
    cost: number;
    avgResponseTime: number;
    successRate: number;
  }>;
}

/**
 * AI Services Factory - Central hub for all AI operations
 * 
 * Features:
 * - Intelligent service routing based on task requirements
 * - Automatic fallback mechanisms
 * - Cost optimization and usage tracking
 * - Load balancing across providers
 * - Performance monitoring and analytics
 */
export class AIServicesFactory {
  private providers: Map<string, AIServiceProvider> = new Map();
  private usageStats: AIUsageStats = {
    totalRequests: 0,
    totalCost: 0,
    averageResponseTime: 0,
    successRate: 0,
    providerBreakdown: {}
  };
  private requestHistory: Array<{
    timestamp: number;
    provider: string;
    success: boolean;
    cost: number;
    responseTime: number;
  }> = [];

  constructor(config?: {
    openaiApiKey?: string;
    geminiApiKey?: string;
    claudeApiKey?: string;
  }) {
    this.initializeProviders(config);
  }

  /**
   * Initialize all AI service providers
   */
  private initializeProviders(config?: any): void {
    try {
      // OpenAI Provider
      if (config?.openaiApiKey) {
        const openaiService = new OpenAIService(config.openaiApiKey);
        this.providers.set('openai', {
          name: 'openai',
          service: openaiService,
          strengths: ['technical_analysis', 'natural_language', 'strategy_generation'],
          costEfficiency: 'medium',
          responseTime: 'medium',
          reliability: 0.95
        });
      }

      // Gemini Provider
      if (config?.geminiApiKey) {
        const geminiService = new GeminiService(config.geminiApiKey);
        this.providers.set('gemini', {
          name: 'gemini',
          service: geminiService,
          strengths: ['multi_modal', 'real_time_analysis', 'pattern_recognition'],
          costEfficiency: 'high',
          responseTime: 'fast',
          reliability: 0.92
        });
      }

      // Claude Provider
      if (config?.claudeApiKey) {
        const claudeService = new ClaudeService(config.claudeApiKey);
        this.providers.set('claude', {
          name: 'claude',
          service: claudeService,
          strengths: ['reasoning', 'market_analysis', 'risk_assessment', 'sentiment_analysis'],
          costEfficiency: 'medium',
          responseTime: 'medium',
          reliability: 0.97
        });
      }

      console.log(`Initialized ${this.providers.size} AI service providers`);
    } catch (error) {
      console.error('Error initializing AI providers:', error);
      throw new Error('Failed to initialize AI services factory');
    }
  }

  /**
   * Select the best AI provider for a specific capability
   */
  private selectProvider(
    capability: AICapability,
    config?: AIRoutingConfig
  ): AIServiceProvider | null {
    const availableProviders = Array.from(this.providers.values());
    
    if (availableProviders.length === 0) {
      throw new Error('No AI providers available');
    }

    // If preferred provider is specified and available
    if (config?.preferredProvider) {
      const preferred = this.providers.get(config.preferredProvider);
      if (preferred) {
        return preferred;
      }
    }

    // Filter providers by capability
    const capableProviders = availableProviders.filter(provider => 
      provider.strengths.includes(capability)
    );

    if (capableProviders.length === 0) {
      // Fallback to any available provider
      return availableProviders[0];
    }

    // Score providers based on configuration preferences
    const scoredProviders = capableProviders.map(provider => {
      let score = provider.reliability * 100; // Base score from reliability

      // Cost optimization
      if (config?.prioritizeCost) {
        const costScore = provider.costEfficiency === 'high' ? 30 : 
                         provider.costEfficiency === 'medium' ? 15 : 0;
        score += costScore;
      }

      // Speed optimization  
      if (config?.prioritizeSpeed) {
        const speedScore = provider.responseTime === 'fast' ? 25 :
                          provider.responseTime === 'medium' ? 12 : 0;
        score += speedScore;
      }

      // Accuracy optimization (reliability already included in base)
      if (config?.prioritizeAccuracy) {
        score += provider.reliability * 20;
      }

      // Load balancing - prefer less used providers
      if (config?.loadBalancing) {
        const providerStats = this.usageStats.providerBreakdown[provider.name];
        if (providerStats) {
          const usageRatio = providerStats.requests / this.usageStats.totalRequests;
          score += (1 - usageRatio) * 15; // Bonus for less used providers
        }
      }

      return { provider, score };
    });

    // Sort by score and return best provider
    scoredProviders.sort((a, b) => b.score - a.score);
    return scoredProviders[0].provider;
  }

  /**
   * Execute request with automatic provider selection and fallback
   */
  private async executeWithFallback<T>(
    operation: (service: BaseAIService) => Promise<AIResponse<T>>,
    capability: AICapability,
    config?: AIRoutingConfig,
    maxRetries: number = 2
  ): Promise<AIResponse<T>> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    let attemptCount = 0;

    // Try primary provider
    const primaryProvider = this.selectProvider(capability, config);
    if (primaryProvider) {
      try {
        const result = await operation(primaryProvider.service);
        this.recordUsage(primaryProvider.name, true, result.cost || 0, Date.now() - startTime);
        return result;
      } catch (error) {
        lastError = error as Error;
        attemptCount++;
        console.warn(`Primary AI provider ${primaryProvider.name} failed:`, error);
      }
    }

    // Try fallback providers if enabled
    if (config?.fallbackEnabled !== false && attemptCount < maxRetries) {
      const allProviders = Array.from(this.providers.values())
        .filter(p => p !== primaryProvider)
        .sort((a, b) => b.reliability - a.reliability);

      for (const provider of allProviders) {
        if (attemptCount >= maxRetries) break;
        
        try {
          console.log(`Trying fallback provider: ${provider.name}`);
          const result = await operation(provider.service);
          this.recordUsage(provider.name, true, result.cost || 0, Date.now() - startTime);
          return result;
        } catch (error) {
          lastError = error as Error;
          attemptCount++;
          console.warn(`Fallback AI provider ${provider.name} failed:`, error);
        }
      }
    }

    // All providers failed
    this.recordUsage('unknown', false, 0, Date.now() - startTime);
    throw new Error(`All AI providers failed. Last error: ${lastError?.message}`);
  }

  /**
   * Record usage statistics
   */
  private recordUsage(
    provider: string,
    success: boolean,
    cost: number,
    responseTime: number
  ): void {
    this.usageStats.totalRequests++;
    this.usageStats.totalCost += cost;

    // Update provider breakdown
    if (!this.usageStats.providerBreakdown[provider]) {
      this.usageStats.providerBreakdown[provider] = {
        requests: 0,
        cost: 0,
        avgResponseTime: 0,
        successRate: 0
      };
    }

    const providerStats = this.usageStats.providerBreakdown[provider];
    providerStats.requests++;
    providerStats.cost += cost;
    
    // Update average response time
    providerStats.avgResponseTime = 
      (providerStats.avgResponseTime * (providerStats.requests - 1) + responseTime) / providerStats.requests;

    // Update success rate
    const successCount = Math.round(providerStats.successRate * (providerStats.requests - 1)) + (success ? 1 : 0);
    providerStats.successRate = successCount / providerStats.requests;

    // Update global averages
    this.usageStats.averageResponseTime = 
      (this.usageStats.averageResponseTime * (this.usageStats.totalRequests - 1) + responseTime) / this.usageStats.totalRequests;

    const totalSuccessCount = Object.values(this.usageStats.providerBreakdown)
      .reduce((sum, stats) => sum + Math.round(stats.successRate * stats.requests), 0);
    this.usageStats.successRate = totalSuccessCount / this.usageStats.totalRequests;

    // Add to history (keep last 1000 records)
    this.requestHistory.push({
      timestamp: Date.now(),
      provider,
      success,
      cost,
      responseTime
    });
    
    if (this.requestHistory.length > 1000) {
      this.requestHistory.shift();
    }
  }

  /**
   * Analyze market data using the best available AI service
   */
  async analyzeMarket(
    symbol: string,
    marketData: any,
    context?: string,
    config?: AIRoutingConfig
  ): Promise<AIResponse<MarketAnalysis>> {
    return this.executeWithFallback(
      (service) => service.analyzeMarket(symbol, marketData, context),
      'market_analysis',
      config
    );
  }

  /**
   * Generate trading signals using AI
   */
  async generateTradingSignal(
    symbol: string,
    marketData: any,
    userPreferences?: any,
    config?: AIRoutingConfig
  ): Promise<AIResponse<TradingSignal>> {
    return this.executeWithFallback(
      (service) => service.generateTradingSignal(symbol, marketData, userPreferences),
      'technical_analysis',
      config
    );
  }

  /**
   * Generate comprehensive trading strategy
   */
  async generateTradingStrategy(
    requirements: any,
    config?: AIRoutingConfig
  ): Promise<AIResponse<TradingStrategy>> {
    return this.executeWithFallback(
      (service) => service.generateTradingStrategy(requirements),
      'strategy_generation',
      config
    );
  }

  /**
   * Process natural language queries about trading
   */
  async processNaturalLanguage(
    query: string,
    context?: any,
    config?: AIRoutingConfig
  ): Promise<AIResponse<string>> {
    return this.executeWithFallback(
      (service) => service.processNaturalLanguage(query, context),
      'natural_language',
      config
    );
  }

  /**
   * Perform sentiment analysis on market news/data
   */
  async analyzeSentiment(
    text: string,
    context?: any,
    config?: AIRoutingConfig
  ): Promise<AIResponse<{
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    keyFactors: string[];
    marketImpact: 'high' | 'medium' | 'low';
  }>> {
    return this.executeWithFallback(
      (service) => service.processNaturalLanguage(
        `Analyze the sentiment of this market-related text and provide a structured analysis: "${text}"`,
        context
      ),
      'sentiment_analysis',
      config
    ) as Promise<AIResponse<any>>;
  }

  /**
   * Assess risk for trading positions or strategies
   */
  async assessRisk(
    position: any,
    marketConditions: any,
    config?: AIRoutingConfig
  ): Promise<AIResponse<{
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    riskScore: number; // 0-100
    riskFactors: string[];
    recommendations: string[];
    maxPositionSize: number;
  }>> {
    return this.executeWithFallback(
      (service) => service.processNaturalLanguage(
        `Assess the risk for this trading position given current market conditions`,
        { position, marketConditions }
      ),
      'risk_assessment',
      config
    ) as Promise<AIResponse<any>>;
  }

  /**
   * Detect patterns in market data
   */
  async detectPatterns(
    marketData: any,
    timeframe: string,
    config?: AIRoutingConfig
  ): Promise<AIResponse<{
    patterns: Array<{
      type: string;
      confidence: number;
      description: string;
      implications: string[];
    }>;
    trendAnalysis: {
      direction: 'up' | 'down' | 'sideways';
      strength: number;
      duration: string;
    };
  }>> {
    return this.executeWithFallback(
      (service) => service.processNaturalLanguage(
        `Detect and analyze patterns in this market data for ${timeframe} timeframe`,
        { marketData, timeframe }
      ),
      'pattern_recognition',
      config
    ) as Promise<AIResponse<any>>;
  }

  /**
   * Get usage statistics and analytics
   */
  getUsageStats(): AIUsageStats {
    return { ...this.usageStats };
  }

  /**
   * Get available providers and their capabilities
   */
  getAvailableProviders(): Array<{
    name: string;
    strengths: AICapability[];
    status: 'active' | 'inactive';
    reliability: number;
  }> {
    return Array.from(this.providers.values()).map(provider => ({
      name: provider.name,
      strengths: provider.strengths,
      status: 'active',
      reliability: provider.reliability
    }));
  }

  /**
   * Test all providers and return health status
   */
  async testProviders(): Promise<Record<string, {
    status: 'healthy' | 'degraded' | 'unhealthy';
    responseTime?: number;
    error?: string;
  }>> {
    const results: Record<string, any> = {};

    for (const [name, provider] of this.providers) {
      const startTime = Date.now();
      try {
        await provider.service.processNaturalLanguage('Test connection');
        results[name] = {
          status: 'healthy',
          responseTime: Date.now() - startTime
        };
      } catch (error) {
        results[name] = {
          status: 'unhealthy',
          error: (error as Error).message
        };
      }
    }

    return results;
  }

  /**
   * Get cost estimation for a request type
   */
  estimateCost(
    requestType: AICapability,
    inputSize: number,
    outputSize: number = 500,
    provider?: 'openai' | 'gemini' | 'claude'
  ): number {
    const targetProvider = provider ? this.providers.get(provider) : 
                          this.selectProvider(requestType);
    
    if (!targetProvider) {
      return 0;
    }

    // Estimate based on provider (simplified calculation)
    const baseMultiplier = {
      'openai': 0.002,
      'gemini': 0.001,
      'claude': 0.003
    };

    const multiplier = baseMultiplier[targetProvider.name] || 0.002;
    return (inputSize + outputSize) * multiplier / 1000;
  }

  /**
   * Clear usage statistics
   */
  clearStats(): void {
    this.usageStats = {
      totalRequests: 0,
      totalCost: 0,
      averageResponseTime: 0,
      successRate: 0,
      providerBreakdown: {}
    };
    this.requestHistory = [];
  }

  /**
   * Set provider configuration
   */
  configureProvider(
    providerName: 'openai' | 'gemini' | 'claude',
    config: any
  ): void {
    const provider = this.providers.get(providerName);
    if (provider && provider.service.configure) {
      provider.service.configure(config);
    }
  }

  /**
   * Enable/disable specific providers
   */
  setProviderStatus(
    providerName: 'openai' | 'gemini' | 'claude',
    enabled: boolean
  ): void {
    if (enabled && !this.providers.has(providerName)) {
      console.warn(`Cannot enable ${providerName}: provider not initialized`);
    } else if (!enabled && this.providers.has(providerName)) {
      this.providers.delete(providerName);
    }
  }
}

/**
 * Default AI Services Factory instance
 * Can be configured with environment variables
 */
export const defaultAIFactory = new AIServicesFactory({
  openaiApiKey: process.env.OPENAI_API_KEY,
  geminiApiKey: process.env.GEMINI_API_KEY,
  claudeApiKey: process.env.CLAUDE_API_KEY
});

/**
 * Utility functions for common AI operations
 */
export const AIUtils = {
  /**
   * Quick market analysis with automatic provider selection
   */
  async quickAnalysis(symbol: string, marketData: any): Promise<string> {
    try {
      const result = await defaultAIFactory.analyzeMarket(symbol, marketData, '', {
        prioritizeSpeed: true,
        fallbackEnabled: true
      });
      return result.data?.summary || 'Analysis unavailable';
    } catch (error) {
      return `Analysis failed: ${(error as Error).message}`;
    }
  },

  /**
   * Generate quick trading signal
   */
  async quickSignal(symbol: string, marketData: any): Promise<TradingSignal | null> {
    try {
      const result = await defaultAIFactory.generateTradingSignal(symbol, marketData, {}, {
        prioritizeSpeed: true,
        prioritizeCost: true
      });
      return result.data || null;
    } catch (error) {
      console.error('Quick signal generation failed:', error);
      return null;
    }
  },

  /**
   * Ask AI in natural language
   */
  async ask(question: string, context?: any): Promise<string> {
    try {
      const result = await defaultAIFactory.processNaturalLanguage(question, context, {
        prioritizeSpeed: true,
        fallbackEnabled: true
      });
      return result.data || 'No response available';
    } catch (error) {
      return `AI service unavailable: ${(error as Error).message}`;
    }
  }
};

export default AIServicesFactory;