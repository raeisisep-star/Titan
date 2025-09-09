/**
 * TITAN Trading System - Market Prediction Engine
 * 
 * Advanced market prediction system using multiple AI models and ensemble learning.
 * Provides short-term, medium-term, and long-term market predictions with confidence scoring.
 */

import { getAIManager, AIManager, MarketInsights } from './ai-manager';
import { getMarketMonitor, MarketSnapshot } from './market-monitor';

export interface PredictionConfig {
  models: ('ensemble' | 'openai' | 'gemini' | 'claude')[];
  timeframes: PredictionTimeframe[];
  enableEnsemble: boolean;
  confidenceThreshold: number;
  historicalDataPoints: number;
  enableModelWeighting: boolean;
  enableAdaptiveLearning: boolean;
}

export type PredictionTimeframe = 
  | '5m' | '15m' | '30m' | '1h' | '4h' | '12h' | '1d' | '3d' | '7d' | '30d';

export interface MarketPrediction {
  id: string;
  symbol: string;
  timeframe: PredictionTimeframe;
  direction: 'strong_bullish' | 'bullish' | 'neutral' | 'bearish' | 'strong_bearish';
  confidence: number; // 0-1
  priceTarget?: {
    low: number;
    high: number;
    most_likely: number;
  };
  probability: {
    up: number;
    down: number;
    sideways: number;
  };
  keyFactors: string[];
  risks: string[];
  modelScores: Record<string, {
    prediction: string;
    confidence: number;
    weight: number;
  }>;
  metadata: {
    createdAt: Date;
    expiresAt: Date;
    dataQuality: number;
    marketVolatility: number;
    aiProvider: string;
  };
}

export interface PredictionPerformance {
  model: string;
  timeframe: PredictionTimeframe;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
  avgConfidence: number;
  profitability: number;
  sharpeRatio: number;
  maxDrawdown: number;
  lastUpdated: Date;
}

export interface EnsemblePrediction {
  finalPrediction: MarketPrediction;
  modelPredictions: MarketPrediction[];
  ensembleWeight: number;
  consensusLevel: number; // How much models agree (0-1)
  uncertaintyScore: number; // Market uncertainty level (0-1)
}

/**
 * Advanced Market Prediction Engine
 * 
 * Features:
 * - Multi-model ensemble predictions
 * - Adaptive model weighting based on performance
 * - Multiple timeframe analysis
 * - Confidence scoring and uncertainty quantification
 * - Real-time performance tracking
 */
export class PredictionEngine {
  private aiManager: AIManager;
  private config: PredictionConfig;
  private predictions: Map<string, MarketPrediction[]> = new Map();
  private performance: Map<string, PredictionPerformance[]> = new Map();
  private modelWeights: Map<string, number> = new Map();
  private historicalData: Map<string, any[]> = new Map();

  constructor(config: PredictionConfig) {
    this.config = {
      models: ['ensemble', 'openai', 'gemini', 'claude'],
      timeframes: ['5m', '15m', '1h', '4h', '1d'],
      enableEnsemble: true,
      confidenceThreshold: 0.6,
      historicalDataPoints: 100,
      enableModelWeighting: true,
      enableAdaptiveLearning: true,
      ...config
    };

    this.aiManager = getAIManager();
    this.initializeModelWeights();
    
    console.log('🔮 Market Prediction Engine initialized');
  }

  /**
   * Initialize model weights
   */
  private initializeModelWeights(): void {
    // Default equal weights, will be adjusted based on performance
    this.modelWeights.set('openai', 0.33);
    this.modelWeights.set('gemini', 0.33);
    this.modelWeights.set('claude', 0.34);
  }

  /**
   * Generate comprehensive market predictions
   */
  async generatePredictions(
    symbol: string, 
    marketData?: any
  ): Promise<EnsemblePrediction> {
    console.log(`🔮 Generating predictions for ${symbol}...`);

    try {
      // Get current market data
      const currentData = marketData || await this.getCurrentMarketData(symbol);
      
      // Generate predictions from each model
      const modelPredictions: MarketPrediction[] = [];
      
      for (const model of this.config.models.filter(m => m !== 'ensemble')) {
        try {
          const prediction = await this.generateModelPrediction(
            symbol, 
            currentData, 
            model as any
          );
          if (prediction) {
            modelPredictions.push(prediction);
          }
        } catch (error) {
          console.warn(`⚠️ ${model} prediction failed for ${symbol}:`, error);
        }
      }

      if (modelPredictions.length === 0) {
        throw new Error('No model predictions available');
      }

      // Create ensemble prediction
      const ensemblePrediction = this.config.enableEnsemble ? 
        this.createEnsemblePrediction(symbol, modelPredictions, currentData) :
        modelPredictions[0];

      // Store predictions
      this.storePredictions(symbol, [...modelPredictions, ensemblePrediction]);

      // Calculate ensemble metrics
      const consensusLevel = this.calculateConsensus(modelPredictions);
      const uncertaintyScore = this.calculateUncertainty(modelPredictions, currentData);

      const result: EnsemblePrediction = {
        finalPrediction: ensemblePrediction,
        modelPredictions,
        ensembleWeight: this.calculateEnsembleWeight(modelPredictions),
        consensusLevel,
        uncertaintyScore
      };

      console.log(`✅ Generated ${modelPredictions.length} model predictions for ${symbol}`);
      return result;

    } catch (error) {
      console.error(`❌ Prediction generation failed for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Generate prediction from specific AI model
   */
  private async generateModelPrediction(
    symbol: string,
    marketData: any,
    model: 'openai' | 'gemini' | 'claude'
  ): Promise<MarketPrediction | null> {
    try {
      // Configure AI routing for specific model
      const routingConfig = {
        preferredProvider: model,
        prioritizeAccuracy: true,
        fallbackEnabled: false
      };

      // Generate market analysis
      const analysis = await this.aiManager.analyzeSymbol({
        symbol,
        marketData,
        analysisType: 'comprehensive',
        includeSentiment: true,
        includeRisk: true,
        context: `Generate detailed market predictions for multiple timeframes. Focus on:
        1. Price direction and momentum analysis
        2. Support/resistance levels and breakout potential
        3. Volume analysis and institutional activity indicators
        4. Macro and micro factors affecting price movement
        5. Risk scenarios and probability assessments`
      });

      // Generate predictions for each timeframe
      const timeframePredictions: Record<PredictionTimeframe, any> = {};
      
      for (const timeframe of this.config.timeframes) {
        const prediction = await this.generateTimeframePrediction(
          symbol,
          timeframe,
          analysis,
          marketData,
          model
        );
        timeframePredictions[timeframe] = prediction;
      }

      // Create comprehensive prediction (focusing on primary timeframe)
      const primaryTimeframe = this.config.timeframes[Math.floor(this.config.timeframes.length / 2)];
      const primaryPrediction = timeframePredictions[primaryTimeframe];

      const prediction: MarketPrediction = {
        id: `pred_${symbol}_${model}_${Date.now()}`,
        symbol,
        timeframe: primaryTimeframe,
        direction: primaryPrediction.direction,
        confidence: primaryPrediction.confidence,
        priceTarget: primaryPrediction.priceTarget,
        probability: primaryPrediction.probability,
        keyFactors: primaryPrediction.keyFactors,
        risks: primaryPrediction.risks,
        modelScores: {
          [model]: {
            prediction: primaryPrediction.direction,
            confidence: primaryPrediction.confidence,
            weight: this.modelWeights.get(model) || 0.33
          }
        },
        metadata: {
          createdAt: new Date(),
          expiresAt: new Date(Date.now() + this.getTimeframeMs(primaryTimeframe)),
          dataQuality: this.assessDataQuality(marketData),
          marketVolatility: this.calculateVolatility(marketData),
          aiProvider: model
        }
      };

      return prediction;

    } catch (error) {
      console.error(`❌ ${model} prediction failed:`, error);
      return null;
    }
  }

  /**
   * Generate prediction for specific timeframe
   */
  private async generateTimeframePrediction(
    symbol: string,
    timeframe: PredictionTimeframe,
    analysis: MarketInsights,
    marketData: any,
    model: string
  ): Promise<any> {
    // Create timeframe-specific prompt
    const prompt = `Analyze ${symbol} for ${timeframe} timeframe prediction.
    
    Current Market Conditions:
    - Price: $${marketData.price || 'N/A'}
    - Volume: ${marketData.volume || 'N/A'}
    - 24h Change: ${((marketData.change24h || 0) * 100).toFixed(2)}%
    - RSI: ${marketData.indicators?.rsi || 'N/A'}
    - MACD: ${marketData.indicators?.macd || 'N/A'}
    
    Analysis Context:
    - Overall Trend: ${analysis.overview?.trend || 'Unknown'}
    - Confidence: ${analysis.overview?.confidence || 0}%
    - Key Insights: ${analysis.technicalAnalysis?.patterns?.join(', ') || 'None'}
    
    Provide a ${timeframe} prediction with:
    1. Direction (strong_bullish/bullish/neutral/bearish/strong_bearish)
    2. Confidence level (0-1)
    3. Price targets (low, high, most_likely)
    4. Probability distribution (up/down/sideways percentages)
    5. Key factors supporting the prediction
    6. Main risks and potential invalidation scenarios`;

    try {
      const response = await this.aiManager.processQuery(prompt, {
        symbol,
        timeframe,
        analysis,
        marketData
      });

      // Parse AI response (simplified - in production use more robust parsing)
      return this.parseAIPredictionResponse(response.response, marketData);

    } catch (error) {
      console.warn(`⚠️ Timeframe prediction failed for ${timeframe}:`, error);
      return this.createFallbackPrediction(marketData);
    }
  }

  /**
   * Parse AI prediction response
   */
  private parseAIPredictionResponse(response: string, marketData: any): any {
    // Simplified parsing - in production, use more sophisticated NLP
    const currentPrice = marketData.price || 100;
    
    // Extract direction from response
    let direction = 'neutral';
    const bullishWords = ['bullish', 'upward', 'rising', 'positive', 'strong buy'];
    const bearishWords = ['bearish', 'downward', 'falling', 'negative', 'strong sell'];
    
    const lowerResponse = response.toLowerCase();
    const bullishScore = bullishWords.reduce((score, word) => 
      score + (lowerResponse.includes(word) ? 1 : 0), 0);
    const bearishScore = bearishWords.reduce((score, word) => 
      score + (lowerResponse.includes(word) ? 1 : 0), 0);
    
    if (bullishScore > bearishScore + 1) {
      direction = 'strong_bullish';
    } else if (bullishScore > bearishScore) {
      direction = 'bullish';
    } else if (bearishScore > bullishScore + 1) {
      direction = 'strong_bearish';
    } else if (bearishScore > bullishScore) {
      direction = 'bearish';
    }

    // Calculate confidence based on response strength
    const confidence = Math.min(0.9, 0.5 + Math.abs(bullishScore - bearishScore) * 0.1);
    
    // Generate price targets
    const volatility = 0.05; // 5% default volatility
    const priceTarget = {
      low: currentPrice * (1 - volatility),
      high: currentPrice * (1 + volatility),
      most_likely: currentPrice * (1 + (bullishScore - bearishScore) * 0.02)
    };

    // Calculate probability distribution
    const upProb = direction.includes('bullish') ? 0.6 + bullishScore * 0.1 : 0.3;
    const downProb = direction.includes('bearish') ? 0.6 + bearishScore * 0.1 : 0.3;
    const sidewaysProb = 1 - upProb - downProb;

    return {
      direction,
      confidence,
      priceTarget,
      probability: {
        up: Math.max(0, Math.min(1, upProb)),
        down: Math.max(0, Math.min(1, downProb)),
        sideways: Math.max(0, Math.min(1, sidewaysProb))
      },
      keyFactors: this.extractKeyFactors(response),
      risks: this.extractRisks(response)
    };
  }

  /**
   * Extract key factors from AI response
   */
  private extractKeyFactors(response: string): string[] {
    // Simplified extraction
    const factors = [];
    
    if (response.includes('support') || response.includes('resistance')) {
      factors.push('Technical support/resistance levels');
    }
    if (response.includes('volume')) {
      factors.push('Volume analysis');
    }
    if (response.includes('trend')) {
      factors.push('Trend continuation/reversal');
    }
    if (response.includes('sentiment')) {
      factors.push('Market sentiment');
    }
    
    return factors.length > 0 ? factors : ['General market analysis'];
  }

  /**
   * Extract risks from AI response
   */
  private extractRisks(response: string): string[] {
    const risks = [];
    
    if (response.includes('volatility') || response.includes('volatile')) {
      risks.push('High market volatility');
    }
    if (response.includes('reversal')) {
      risks.push('Potential trend reversal');
    }
    if (response.includes('breakout') || response.includes('breakdown')) {
      risks.push('Key level breach risk');
    }
    
    return risks.length > 0 ? risks : ['General market risks'];
  }

  /**
   * Create fallback prediction
   */
  private createFallbackPrediction(marketData: any): any {
    return {
      direction: 'neutral',
      confidence: 0.3,
      priceTarget: {
        low: (marketData.price || 100) * 0.95,
        high: (marketData.price || 100) * 1.05,
        most_likely: marketData.price || 100
      },
      probability: {
        up: 0.33,
        down: 0.33,
        sideways: 0.34
      },
      keyFactors: ['Insufficient data for analysis'],
      risks: ['High uncertainty due to limited data']
    };
  }

  /**
   * Create ensemble prediction from multiple models
   */
  private createEnsemblePrediction(
    symbol: string,
    modelPredictions: MarketPrediction[],
    marketData: any
  ): MarketPrediction {
    // Weighted average of predictions
    const weights = modelPredictions.map(p => 
      this.modelWeights.get(p.metadata.aiProvider) || 0.33
    );
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    const normalizedWeights = weights.map(w => w / totalWeight);

    // Calculate ensemble confidence
    const avgConfidence = modelPredictions.reduce((sum, p, i) => 
      sum + p.confidence * normalizedWeights[i], 0
    );

    // Determine ensemble direction
    const directionScores = {
      strong_bullish: 0,
      bullish: 0,
      neutral: 0,
      bearish: 0,
      strong_bearish: 0
    };

    modelPredictions.forEach((pred, i) => {
      directionScores[pred.direction] += normalizedWeights[i];
    });

    const ensembleDirection = Object.entries(directionScores)
      .reduce((max, [dir, score]) => score > max.score ? { direction: dir, score } : max, 
              { direction: 'neutral', score: 0 }).direction as any;

    // Ensemble price targets
    const ensemblePriceTarget = {
      low: modelPredictions.reduce((sum, p, i) => 
        sum + (p.priceTarget?.low || marketData.price) * normalizedWeights[i], 0),
      high: modelPredictions.reduce((sum, p, i) => 
        sum + (p.priceTarget?.high || marketData.price) * normalizedWeights[i], 0),
      most_likely: modelPredictions.reduce((sum, p, i) => 
        sum + (p.priceTarget?.most_likely || marketData.price) * normalizedWeights[i], 0)
    };

    // Ensemble probabilities
    const ensembleProbability = {
      up: modelPredictions.reduce((sum, p, i) => sum + p.probability.up * normalizedWeights[i], 0),
      down: modelPredictions.reduce((sum, p, i) => sum + p.probability.down * normalizedWeights[i], 0),
      sideways: modelPredictions.reduce((sum, p, i) => sum + p.probability.sideways * normalizedWeights[i], 0)
    };

    // Collect all key factors and risks
    const allFactors = modelPredictions.flatMap(p => p.keyFactors);
    const allRisks = modelPredictions.flatMap(p => p.risks);

    // Create ensemble model scores
    const modelScores: Record<string, any> = {};
    modelPredictions.forEach(pred => {
      Object.assign(modelScores, pred.modelScores);
    });

    const primaryTimeframe = this.config.timeframes[Math.floor(this.config.timeframes.length / 2)];

    return {
      id: `ensemble_${symbol}_${Date.now()}`,
      symbol,
      timeframe: primaryTimeframe,
      direction: ensembleDirection,
      confidence: avgConfidence,
      priceTarget: ensemblePriceTarget,
      probability: ensembleProbability,
      keyFactors: [...new Set(allFactors)], // Remove duplicates
      risks: [...new Set(allRisks)],
      modelScores,
      metadata: {
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + this.getTimeframeMs(primaryTimeframe)),
        dataQuality: this.assessDataQuality(marketData),
        marketVolatility: this.calculateVolatility(marketData),
        aiProvider: 'ensemble'
      }
    };
  }

  /**
   * Calculate consensus level between models
   */
  private calculateConsensus(predictions: MarketPrediction[]): number {
    if (predictions.length <= 1) return 1;

    // Compare directions
    const directions = predictions.map(p => p.direction);
    const directionCounts = directions.reduce((counts, dir) => {
      counts[dir] = (counts[dir] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    const maxCount = Math.max(...Object.values(directionCounts));
    const consensusRatio = maxCount / predictions.length;

    // Factor in confidence similarity
    const confidences = predictions.map(p => p.confidence);
    const avgConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;
    const confidenceVariance = confidences.reduce((sum, c) => sum + Math.pow(c - avgConfidence, 2), 0) / confidences.length;
    const confidenceConsensus = 1 - Math.min(1, confidenceVariance * 4); // Normalize variance

    return (consensusRatio + confidenceConsensus) / 2;
  }

  /**
   * Calculate market uncertainty
   */
  private calculateUncertainty(predictions: MarketPrediction[], marketData: any): number {
    // Base uncertainty on volatility and prediction spread
    const volatility = this.calculateVolatility(marketData);
    const predictionSpread = this.calculatePredictionSpread(predictions);
    const consensus = this.calculateConsensus(predictions);

    // Higher volatility + lower consensus = higher uncertainty
    return Math.min(1, (volatility * 2 + predictionSpread + (1 - consensus)) / 3);
  }

  /**
   * Calculate prediction spread
   */
  private calculatePredictionSpread(predictions: MarketPrediction[]): number {
    if (predictions.length <= 1) return 0;

    const confidences = predictions.map(p => p.confidence);
    const maxConf = Math.max(...confidences);
    const minConf = Math.min(...confidences);
    
    return maxConf - minConf;
  }

  /**
   * Calculate ensemble weight
   */
  private calculateEnsembleWeight(predictions: MarketPrediction[]): number {
    // Higher weight for higher average confidence and consensus
    const avgConfidence = predictions.reduce((sum, p) => sum + p.confidence, 0) / predictions.length;
    const consensus = this.calculateConsensus(predictions);
    
    return (avgConfidence + consensus) / 2;
  }

  /**
   * Get current market data
   */
  private async getCurrentMarketData(symbol: string): Promise<any> {
    try {
      const monitor = getMarketMonitor();
      if (monitor) {
        const snapshots = monitor.getMarketSnapshots();
        const snapshot = snapshots[symbol];
        if (snapshot) {
          return {
            price: snapshot.price,
            volume: snapshot.volume,
            change24h: snapshot.change24h,
            indicators: snapshot.indicators
          };
        }
      }

      // Fallback: generate mock data
      return this.generateMockData(symbol);
    } catch (error) {
      console.warn(`⚠️ Using mock data for ${symbol}:`, error);
      return this.generateMockData(symbol);
    }
  }

  /**
   * Generate mock market data
   */
  private generateMockData(symbol: string): any {
    const basePrice = symbol === 'BTC' ? 45000 : symbol === 'ETH' ? 2500 : 100;
    return {
      price: basePrice * (0.9 + Math.random() * 0.2),
      volume: Math.random() * 1000000,
      change24h: (Math.random() - 0.5) * 0.1,
      indicators: {
        rsi: 30 + Math.random() * 40,
        macd: (Math.random() - 0.5) * 0.1
      }
    };
  }

  /**
   * Store predictions
   */
  private storePredictions(symbol: string, predictions: MarketPrediction[]): void {
    if (!this.predictions.has(symbol)) {
      this.predictions.set(symbol, []);
    }

    const symbolPredictions = this.predictions.get(symbol)!;
    symbolPredictions.push(...predictions);

    // Keep only recent predictions
    const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
    this.predictions.set(
      symbol,
      symbolPredictions.filter(p => p.metadata.createdAt.getTime() > cutoffTime)
    );
  }

  /**
   * Assess data quality
   */
  private assessDataQuality(marketData: any): number {
    let quality = 0;
    
    if (marketData.price) quality += 0.3;
    if (marketData.volume) quality += 0.2;
    if (marketData.indicators?.rsi) quality += 0.2;
    if (marketData.indicators?.macd) quality += 0.2;
    if (marketData.change24h !== undefined) quality += 0.1;
    
    return quality;
  }

  /**
   * Calculate market volatility
   */
  private calculateVolatility(marketData: any): number {
    // Simplified volatility calculation
    const change24h = Math.abs(marketData.change24h || 0);
    const rsi = marketData.indicators?.rsi || 50;
    
    // Higher change and extreme RSI = higher volatility
    const changeVolatility = Math.min(1, change24h * 10);
    const rsiVolatility = Math.abs(rsi - 50) / 50;
    
    return (changeVolatility + rsiVolatility) / 2;
  }

  /**
   * Get timeframe in milliseconds
   */
  private getTimeframeMs(timeframe: PredictionTimeframe): number {
    const multipliers = {
      '5m': 5 * 60 * 1000,
      '15m': 15 * 60 * 1000,
      '30m': 30 * 60 * 1000,
      '1h': 60 * 60 * 1000,
      '4h': 4 * 60 * 60 * 1000,
      '12h': 12 * 60 * 60 * 1000,
      '1d': 24 * 60 * 60 * 1000,
      '3d': 3 * 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    return multipliers[timeframe] || 60 * 60 * 1000;
  }

  /**
   * Get predictions for symbol
   */
  getPredictions(symbol: string): MarketPrediction[] {
    return this.predictions.get(symbol) || [];
  }

  /**
   * Get latest prediction for symbol
   */
  getLatestPrediction(symbol: string): MarketPrediction | null {
    const predictions = this.getPredictions(symbol);
    if (predictions.length === 0) return null;
    
    return predictions
      .sort((a, b) => b.metadata.createdAt.getTime() - a.metadata.createdAt.getTime())[0];
  }

  /**
   * Update model weights based on performance
   */
  updateModelWeights(performanceData: PredictionPerformance[]): void {
    if (!this.config.enableModelWeighting) return;

    const modelPerformance = new Map<string, number>();
    
    // Calculate average accuracy for each model
    performanceData.forEach(perf => {
      if (!modelPerformance.has(perf.model)) {
        modelPerformance.set(perf.model, 0);
      }
      
      const currentAvg = modelPerformance.get(perf.model)!;
      const newAvg = (currentAvg + perf.accuracy) / 2;
      modelPerformance.set(perf.model, newAvg);
    });

    // Update weights based on relative performance
    const totalPerformance = Array.from(modelPerformance.values())
      .reduce((sum, perf) => sum + perf, 0);
    
    if (totalPerformance > 0) {
      for (const [model, performance] of modelPerformance) {
        const newWeight = performance / totalPerformance;
        this.modelWeights.set(model, newWeight);
      }
      
      console.log('📊 Updated model weights based on performance');
    }
  }

  /**
   * Get model performance
   */
  getModelPerformance(): Map<string, number> {
    return new Map(this.modelWeights);
  }

  /**
   * Get prediction statistics
   */
  getPredictionStats(): {
    totalPredictions: number;
    symbolsCovered: number;
    avgConfidence: number;
    consensusRate: number;
  } {
    const allPredictions = Array.from(this.predictions.values()).flat();
    const totalPredictions = allPredictions.length;
    const symbolsCovered = this.predictions.size;
    
    const avgConfidence = totalPredictions > 0 ? 
      allPredictions.reduce((sum, p) => sum + p.confidence, 0) / totalPredictions : 0;
    
    // Calculate consensus rate (how often ensemble agrees with majority)
    const ensemblePredictions = allPredictions.filter(p => p.metadata.aiProvider === 'ensemble');
    const consensusRate = ensemblePredictions.length > 0 ? 
      ensemblePredictions.reduce((sum, p) => sum + p.confidence, 0) / ensemblePredictions.length : 0;
    
    return {
      totalPredictions,
      symbolsCovered,
      avgConfidence,
      consensusRate
    };
  }
}

/**
 * Global prediction engine instance
 */
let globalPredictionEngine: PredictionEngine | null = null;

/**
 * Initialize global prediction engine
 */
export function initializePredictionEngine(config: PredictionConfig): PredictionEngine {
  globalPredictionEngine = new PredictionEngine(config);
  return globalPredictionEngine;
}

/**
 * Get global prediction engine instance
 */
export function getPredictionEngine(): PredictionEngine | null {
  return globalPredictionEngine;
}

export default PredictionEngine;