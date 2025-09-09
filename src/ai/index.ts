/**
 * TITAN Trading System - AI Module Index
 * 
 * Central export point for all AI-related modules and services.
 * Provides unified access to AI capabilities for the trading system.
 */

// Base AI Service
export { 
  BaseAIService,
  type AIRequest,
  type AIResponse,
  type MarketAnalysis,
  type TradingSignal,
  type TradingStrategy,
  type AIServiceConfig,
  type RateLimitConfig
} from './base-ai-service';

// AI Service Implementations
export { OpenAIService } from './openai-service';
export { GeminiService } from './gemini-service';
export { ClaudeService } from './claude-service';

// AI Services Factory
export { 
  AIServicesFactory,
  type AIServiceProvider,
  type AICapability,
  type AIRoutingConfig,
  type AIUsageStats,
  defaultAIFactory,
  AIUtils
} from './ai-factory';

// AI Manager
export { 
  AIManager,
  type AIManagerConfig,
  type MarketInsights,
  type AITradingRecommendation,
  type AIAnalysisRequest,
  defaultAIManager,
  initializeAIManager,
  getAIManager
} from './ai-manager';

/**
 * Quick initialization function for AI services
 */
export function initializeAI(config: {
  openaiApiKey?: string;
  geminiApiKey?: string;
  claudeApiKey?: string;
  enableCaching?: boolean;
  defaultRoutingConfig?: any;
}) {
  const { initializeAIManager } = require('./ai-manager');
  return initializeAIManager(config);
}

/**
 * Quick access to AI utilities
 */
export const AI = {
  /**
   * Get AI manager instance
   */
  getManager() {
    const { getAIManager } = require('./ai-manager');
    return getAIManager();
  },

  /**
   * Quick market analysis
   */
  async analyzeMarket(symbol: string, marketData: any) {
    const manager = this.getManager();
    return await manager.analyzeSymbol({
      symbol,
      marketData,
      analysisType: 'quick'
    });
  },

  /**
   * Generate trading signal
   */
  async generateSignal(symbol: string, marketData: any) {
    const manager = this.getManager();
    return await manager.generateRecommendation(symbol, marketData);
  },

  /**
   * Ask AI in natural language
   */
  async ask(question: string, context?: any) {
    const manager = this.getManager();
    const result = await manager.processQuery(question, context);
    return result.response;
  },

  /**
   * Get AI service health
   */
  async getHealth() {
    const manager = this.getManager();
    return await manager.getServiceHealth();
  },

  /**
   * Estimate costs for operations
   */
  estimateCost(operations: Array<{
    type: string;
    count: number;
    inputSize: number;
    outputSize?: number;
  }>) {
    const manager = this.getManager();
    return manager.estimateUsageCost(operations as any);
  }
};

export default {
  BaseAIService,
  OpenAIService,
  GeminiService,
  ClaudeService,
  AIServicesFactory,
  AIManager,
  initializeAI,
  AI
};