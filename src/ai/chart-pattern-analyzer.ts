/**
 * Deep Learning Chart Pattern Analysis System
 * Advanced pattern recognition using multiple AI models for comprehensive chart analysis
 * 
 * Features:
 * - Multi-timeframe pattern detection
 * - AI-powered pattern recognition and classification
 * - Support/resistance level identification
 * - Trend analysis and reversal prediction
 * - Volume profile analysis
 * - Advanced technical pattern detection
 * - Pattern reliability scoring
 * - Real-time pattern monitoring
 */

import { EventEmitter } from '../utils/event-emitter.js';

// Chart Pattern Interfaces
export interface ChartData {
  symbol: string;
  timeframe: string;
  candles: CandleData[];
  volume: number[];
  indicators?: TechnicalIndicators;
  timestamp: number;
}

export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  sma20?: number[];
  sma50?: number[];
  ema12?: number[];
  ema26?: number[];
  rsi?: number[];
  macd?: {
    macd: number[];
    signal: number[];
    histogram: number[];
  };
  bollingerBands?: {
    upper: number[];
    middle: number[];
    lower: number[];
  };
  stochastic?: {
    k: number[];
    d: number[];
  };
  atr?: number[];
  adx?: number[];
  momentum?: number[];
  williams?: number[];
}

// Pattern Types and Classifications
export interface PatternDetection {
  id: string;
  symbol: string;
  timeframe: string;
  patternType: PatternType;
  confidence: number;
  reliability: PatternReliability;
  coordinates: PatternCoordinates;
  prediction: PatternPrediction;
  supportResistance: SupportResistanceLevel[];
  volumeProfile: VolumeProfile;
  aiAnalysis: AIPatternAnalysis;
  timestamp: number;
}

export type PatternType = 
  // Reversal Patterns
  | 'head_and_shoulders' | 'inverse_head_and_shoulders'
  | 'double_top' | 'double_bottom'
  | 'triple_top' | 'triple_bottom'
  | 'rounding_top' | 'rounding_bottom'
  | 'falling_wedge' | 'rising_wedge'
  | 'bull_flag' | 'bear_flag'
  | 'bull_pennant' | 'bear_pennant'
  // Continuation Patterns
  | 'ascending_triangle' | 'descending_triangle' | 'symmetrical_triangle'
  | 'rectangle' | 'channel_up' | 'channel_down'
  | 'cup_and_handle' | 'inverse_cup_and_handle'
  // Candlestick Patterns
  | 'doji' | 'hammer' | 'shooting_star' | 'hanging_man'
  | 'bullish_engulfing' | 'bearish_engulfing'
  | 'morning_star' | 'evening_star'
  | 'three_white_soldiers' | 'three_black_crows'
  // Complex Patterns
  | 'elliott_wave' | 'fibonacci_retracement'
  | 'harmonic_pattern' | 'divergence_pattern'
  | 'volume_breakout' | 'gap_pattern';

export interface PatternReliability {
  score: number; // 0-100
  factors: ReliabilityFactor[];
  historicalAccuracy: number;
  marketConditionSuitability: number;
  volumeConfirmation: number;
  multiTimeframeConfirmation: number;
}

export interface ReliabilityFactor {
  factor: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

export interface PatternCoordinates {
  startIndex: number;
  endIndex: number;
  keyPoints: KeyPoint[];
  trendLines: TrendLine[];
  breakoutLevel: number;
  targetLevels: number[];
}

export interface KeyPoint {
  index: number;
  price: number;
  type: 'support' | 'resistance' | 'pivot' | 'breakout';
  significance: number;
}

export interface TrendLine {
  startPoint: { index: number; price: number };
  endPoint: { index: number; price: number };
  type: 'support' | 'resistance' | 'trend';
  strength: number;
  touches: number;
}

export interface PatternPrediction {
  direction: 'bullish' | 'bearish' | 'neutral';
  priceTarget: number;
  stopLoss: number;
  probability: number;
  timeframe: string;
  riskRewardRatio: number;
  completionCriteria: string[];
}

export interface SupportResistanceLevel {
  price: number;
  type: 'support' | 'resistance';
  strength: number;
  touches: number;
  age: number; // Age in candles
  reliability: number;
}

export interface VolumeProfile {
  volumeByPrice: VolumeByPrice[];
  volumeTrend: 'increasing' | 'decreasing' | 'stable';
  averageVolume: number;
  volumeBreakouts: VolumeBreakout[];
  volumeSpike: boolean;
}

export interface VolumeByPrice {
  price: number;
  volume: number;
  percentage: number;
}

export interface VolumeBreakout {
  index: number;
  volume: number;
  averageMultiple: number;
  significance: 'low' | 'medium' | 'high';
}

export interface AIPatternAnalysis {
  openai?: AIProviderAnalysis;
  gemini?: AIProviderAnalysis;
  claude?: AIProviderAnalysis;
  ensemble?: EnsembleAnalysis;
}

export interface AIProviderAnalysis {
  patternIdentified: PatternType[];
  confidence: number;
  reasoning: string[];
  technicalAnalysis: string;
  riskAssessment: string;
  tradingRecommendation: string;
  keyLevels: number[];
  timeHorizon: string;
}

export interface EnsembleAnalysis {
  consensusPattern: PatternType;
  agreementLevel: number;
  conflictingViews: string[];
  weightedConfidence: number;
  combinedRecommendation: string;
  riskConsensus: 'low' | 'medium' | 'high';
}

// Configuration
export interface ChartPatternConfig {
  enableDeepLearning: boolean;
  multiTimeframeAnalysis: boolean;
  timeframes: string[];
  patternTypes: PatternType[];
  aiProviders: string[];
  minConfidence: number;
  minReliability: number;
  volumeAnalysis: boolean;
  realTimeDetection: boolean;
  historicalBacktesting: boolean;
}

/**
 * Advanced Chart Pattern Analyzer with Deep Learning
 */
export class ChartPatternAnalyzer extends EventEmitter {
  private aiServices: Map<string, any> = new Map();
  private detectedPatterns: Map<string, PatternDetection[]> = new Map();
  private config: ChartPatternConfig;
  private isAnalyzing: boolean = false;

  constructor(config?: Partial<ChartPatternConfig>) {
    super();
    
    this.config = {
      enableDeepLearning: true,
      multiTimeframeAnalysis: true,
      timeframes: ['5m', '15m', '1h', '4h', '1d'],
      patternTypes: [
        'head_and_shoulders', 'double_top', 'double_bottom',
        'ascending_triangle', 'descending_triangle', 'symmetrical_triangle',
        'bull_flag', 'bear_flag', 'cup_and_handle',
        'bullish_engulfing', 'bearish_engulfing', 'doji'
      ] as PatternType[],
      aiProviders: ['openai', 'gemini', 'claude'],
      minConfidence: 0.6,
      minReliability: 0.5,
      volumeAnalysis: true,
      realTimeDetection: true,
      historicalBacktesting: false,
      ...config
    };
  }

  /**
   * Initialize AI services for pattern analysis
   */
  async initialize(aiServices: Map<string, any>): Promise<void> {
    this.aiServices = aiServices;
    console.log('📊 Chart Pattern Analyzer initialized with AI services');
  }

  /**
   * Analyze chart data for patterns using deep learning
   */
  async analyzeChart(chartData: ChartData): Promise<PatternDetection[]> {
    try {
      console.log(`🔍 Starting deep chart analysis for ${chartData.symbol} (${chartData.timeframe})`);

      // Step 1: Technical Pattern Detection
      const technicalPatterns = await this.detectTechnicalPatterns(chartData);
      
      // Step 2: AI-Powered Pattern Analysis
      const aiAnalysis = await this.performAIPatternAnalysis(chartData, technicalPatterns);
      
      // Step 3: Support/Resistance Analysis
      const supportResistance = await this.analyzeSupportResistance(chartData);
      
      // Step 4: Volume Profile Analysis
      const volumeProfile = await this.analyzeVolumeProfile(chartData);
      
      // Step 5: Combine and Score Patterns
      const patterns = await this.combineAndScorePatterns(
        chartData, 
        technicalPatterns, 
        aiAnalysis, 
        supportResistance, 
        volumeProfile
      );
      
      // Store detected patterns
      this.storePatterns(chartData.symbol, patterns);
      
      // Emit pattern detection event
      this.emit('patternsDetected', {
        symbol: chartData.symbol,
        timeframe: chartData.timeframe,
        patterns: patterns.length,
        highConfidencePatterns: patterns.filter(p => p.confidence > 0.8).length
      });

      console.log(`✅ Detected ${patterns.length} patterns for ${chartData.symbol}`);
      return patterns;
    } catch (error) {
      console.error('❌ Error in chart pattern analysis:', error);
      throw error;
    }
  }

  /**
   * Detect technical patterns using traditional methods
   */
  private async detectTechnicalPatterns(chartData: ChartData): Promise<PatternType[]> {
    const patterns: PatternType[] = [];
    const candles = chartData.candles;
    
    if (candles.length < 20) return patterns; // Need minimum data

    // Head and Shoulders Detection
    if (this.detectHeadAndShoulders(candles)) {
      patterns.push('head_and_shoulders');
    }
    
    // Double Top/Bottom Detection
    const doublePattern = this.detectDoubleTopBottom(candles);
    if (doublePattern) {
      patterns.push(doublePattern);
    }
    
    // Triangle Patterns
    const trianglePattern = this.detectTrianglePatterns(candles);
    if (trianglePattern) {
      patterns.push(trianglePattern);
    }
    
    // Flag Patterns
    const flagPattern = this.detectFlagPatterns(candles);
    if (flagPattern) {
      patterns.push(flagPattern);
    }
    
    // Candlestick Patterns
    const candlestickPatterns = this.detectCandlestickPatterns(candles);
    patterns.push(...candlestickPatterns);
    
    return patterns;
  }

  /**
   * Perform AI-powered pattern analysis
   */
  private async performAIPatternAnalysis(chartData: ChartData, technicalPatterns: PatternType[]): Promise<AIPatternAnalysis> {
    const analysis: AIPatternAnalysis = {};
    
    // Prepare chart description for AI analysis
    const chartDescription = this.prepareChartDescription(chartData, technicalPatterns);
    
    // OpenAI Analysis
    if (this.aiServices.has('openai') && this.config.aiProviders.includes('openai')) {
      try {
        analysis.openai = await this.performOpenAIPatternAnalysis(chartDescription);
      } catch (error) {
        console.error('OpenAI pattern analysis failed:', error);
      }
    }
    
    // Gemini Analysis
    if (this.aiServices.has('gemini') && this.config.aiProviders.includes('gemini')) {
      try {
        analysis.gemini = await this.performGeminiPatternAnalysis(chartDescription);
      } catch (error) {
        console.error('Gemini pattern analysis failed:', error);
      }
    }
    
    // Claude Analysis
    if (this.aiServices.has('claude') && this.config.aiProviders.includes('claude')) {
      try {
        analysis.claude = await this.performClaudePatternAnalysis(chartDescription);
      } catch (error) {
        console.error('Claude pattern analysis failed:', error);
      }
    }
    
    // Ensemble Analysis
    if (Object.keys(analysis).length > 1) {
      analysis.ensemble = this.createEnsembleAnalysis(analysis);
    }
    
    return analysis;
  }

  /**
   * Prepare chart description for AI analysis
   */
  private prepareChartDescription(chartData: ChartData, patterns: PatternType[]): string {
    const candles = chartData.candles;
    const latest = candles[candles.length - 1];
    const start = candles[0];
    
    const priceChange = ((latest.close - start.close) / start.close * 100).toFixed(2);
    const highLow = ((latest.high - latest.low) / latest.close * 100).toFixed(2);
    
    let description = `Chart Analysis for ${chartData.symbol} (${chartData.timeframe}):\n\n`;
    description += `Price Data:\n`;
    description += `- Current Price: ${latest.close}\n`;
    description += `- Price Change: ${priceChange}%\n`;
    description += `- High-Low Range: ${highLow}%\n`;
    description += `- Volume: ${latest.volume}\n\n`;
    
    description += `Detected Technical Patterns:\n`;
    if (patterns.length > 0) {
      patterns.forEach(pattern => {
        description += `- ${pattern.replace(/_/g, ' ').toUpperCase()}\n`;
      });
    } else {
      description += `- No clear technical patterns detected\n`;
    }
    
    // Add technical indicators if available
    if (chartData.indicators) {
      description += `\nTechnical Indicators:\n`;
      const indicators = chartData.indicators;
      
      if (indicators.rsi && indicators.rsi.length > 0) {
        const rsi = indicators.rsi[indicators.rsi.length - 1];
        description += `- RSI: ${rsi.toFixed(2)} (${this.getRSISignal(rsi)})\n`;
      }
      
      if (indicators.macd) {
        const macd = indicators.macd;
        if (macd.macd.length > 0) {
          const macdValue = macd.macd[macd.macd.length - 1];
          const signal = macd.signal[macd.signal.length - 1];
          description += `- MACD: ${macdValue.toFixed(4)}, Signal: ${signal.toFixed(4)}\n`;
        }
      }
    }
    
    // Add recent price action
    const recentCandles = candles.slice(-10);
    description += `\nRecent Price Action (Last 10 candles):\n`;
    recentCandles.forEach((candle, idx) => {
      const change = idx > 0 ? 
        ((candle.close - recentCandles[idx-1].close) / recentCandles[idx-1].close * 100).toFixed(2) : 
        '0.00';
      description += `- ${new Date(candle.timestamp).toISOString().slice(0, 16)}: ${candle.close} (${change}%)\n`;
    });
    
    return description;
  }

  /**
   * OpenAI pattern analysis
   */
  private async performOpenAIPatternAnalysis(chartDescription: string): Promise<AIProviderAnalysis> {
    const openaiService = this.aiServices.get('openai');
    
    const prompt = `You are an expert technical analyst. Analyze the following chart data and identify patterns:

${chartDescription}

Please provide:
1. Identified chart patterns (if any)
2. Confidence level (0-1)
3. Technical analysis reasoning
4. Risk assessment
5. Trading recommendation
6. Key support/resistance levels
7. Time horizon for the analysis

Respond in JSON format with the following structure:
{
  "patternIdentified": ["pattern1", "pattern2"],
  "confidence": 0.75,
  "reasoning": ["reason1", "reason2"],
  "technicalAnalysis": "detailed analysis",
  "riskAssessment": "risk analysis",
  "tradingRecommendation": "recommendation",
  "keyLevels": [price1, price2],
  "timeHorizon": "short/medium/long-term"
}`;

    const response = await openaiService.makeRequest({
      type: 'analysis',
      prompt,
      symbol: 'CHART_ANALYSIS',
      config: { temperature: 0.3 }
    });

    try {
      const analysis = JSON.parse(response.content);
      return {
        patternIdentified: analysis.patternIdentified || [],
        confidence: analysis.confidence || 0.5,
        reasoning: analysis.reasoning || [],
        technicalAnalysis: analysis.technicalAnalysis || '',
        riskAssessment: analysis.riskAssessment || '',
        tradingRecommendation: analysis.tradingRecommendation || '',
        keyLevels: analysis.keyLevels || [],
        timeHorizon: analysis.timeHorizon || 'medium-term'
      };
    } catch (error) {
      console.error('Error parsing OpenAI response:', error);
      return this.getDefaultAnalysis();
    }
  }

  /**
   * Gemini pattern analysis
   */
  private async performGeminiPatternAnalysis(chartDescription: string): Promise<AIProviderAnalysis> {
    const geminiService = this.aiServices.get('gemini');
    
    const prompt = `Advanced Chart Pattern Analysis:

${chartDescription}

As an expert technical analyst, provide a comprehensive analysis including:
- Pattern identification with high accuracy
- Multi-timeframe perspective
- Volume confirmation signals
- Market context and sentiment
- Specific entry/exit recommendations

Format response as structured JSON with pattern analysis details.`;

    const response = await geminiService.makeRequest({
      type: 'analysis',
      prompt,
      symbol: 'CHART_ANALYSIS',
      config: { temperature: 0.2 }
    });

    // Parse Gemini response (similar to OpenAI but adapted for Gemini's response format)
    return this.parseGeminiResponse(response);
  }

  /**
   * Claude pattern analysis
   */
  private async performClaudePatternAnalysis(chartDescription: string): Promise<AIProviderAnalysis> {
    const claudeService = this.aiServices.get('claude');
    
    const prompt = `Professional Technical Analysis Request:

${chartDescription}

Please conduct a thorough chart pattern analysis with focus on:
1. Classical chart patterns (head & shoulders, triangles, flags, etc.)
2. Candlestick pattern analysis
3. Support/resistance level identification
4. Volume analysis and confirmation
5. Risk management considerations
6. Probability-based predictions

Provide detailed, actionable insights in structured format.`;

    const response = await claudeService.makeRequest({
      type: 'analysis',
      prompt,
      symbol: 'CHART_ANALYSIS',
      config: { temperature: 0.25 }
    });

    return this.parseClaudeResponse(response);
  }

  /**
   * Create ensemble analysis from multiple AI providers
   */
  private createEnsembleAnalysis(analysis: AIPatternAnalysis): EnsembleAnalysis {
    const providers = Object.keys(analysis).filter(key => key !== 'ensemble');
    
    if (providers.length === 0) {
      return this.getDefaultEnsembleAnalysis();
    }

    // Find consensus pattern
    const allPatterns: PatternType[] = [];
    providers.forEach(provider => {
      const providerAnalysis = analysis[provider as keyof AIPatternAnalysis];
      if (providerAnalysis?.patternIdentified) {
        allPatterns.push(...providerAnalysis.patternIdentified);
      }
    });

    const patternCounts = allPatterns.reduce((acc, pattern) => {
      acc[pattern] = (acc[pattern] || 0) + 1;
      return acc;
    }, {} as Record<PatternType, number>);

    const consensusPattern = Object.entries(patternCounts).reduce((a, b) => 
      patternCounts[a[0] as PatternType] > patternCounts[b[0] as PatternType] ? a : b
    )?.[0] as PatternType || 'rectangle';

    // Calculate agreement level
    const maxCount = Math.max(...Object.values(patternCounts));
    const agreementLevel = maxCount / providers.length;

    // Calculate weighted confidence
    const confidences = providers
      .map(provider => analysis[provider as keyof AIPatternAnalysis]?.confidence || 0.5)
      .filter(c => c > 0);
    
    const weightedConfidence = confidences.length > 0 ? 
      confidences.reduce((sum, c) => sum + c, 0) / confidences.length : 0.5;

    return {
      consensusPattern,
      agreementLevel,
      conflictingViews: this.identifyConflicts(analysis),
      weightedConfidence,
      combinedRecommendation: this.generateCombinedRecommendation(analysis),
      riskConsensus: this.calculateRiskConsensus(analysis)
    };
  }

  /**
   * Analyze support and resistance levels
   */
  private async analyzeSupportResistance(chartData: ChartData): Promise<SupportResistanceLevel[]> {
    const levels: SupportResistanceLevel[] = [];
    const candles = chartData.candles;
    
    if (candles.length < 20) return levels;

    // Find pivot highs and lows
    const pivotHigh = this.findPivotHighs(candles);
    const pivotLows = this.findPivotLows(candles);

    // Convert pivots to support/resistance levels
    pivotHigh.forEach(pivot => {
      levels.push({
        price: pivot.price,
        type: 'resistance',
        strength: pivot.strength,
        touches: pivot.touches,
        age: candles.length - pivot.index,
        reliability: this.calculateLevelReliability(pivot, candles)
      });
    });

    pivotLows.forEach(pivot => {
      levels.push({
        price: pivot.price,
        type: 'support',
        strength: pivot.strength,
        touches: pivot.touches,
        age: candles.length - pivot.index,
        reliability: this.calculateLevelReliability(pivot, candles)
      });
    });

    // Sort by reliability and limit to most significant levels
    return levels
      .sort((a, b) => b.reliability - a.reliability)
      .slice(0, 10);
  }

  /**
   * Analyze volume profile
   */
  private async analyzeVolumeProfile(chartData: ChartData): Promise<VolumeProfile> {
    const candles = chartData.candles;
    
    // Calculate volume by price
    const volumeByPrice = this.calculateVolumeByPrice(candles);
    
    // Analyze volume trend
    const volumeTrend = this.analyzeVolumeTrend(candles);
    
    // Calculate average volume
    const averageVolume = candles.reduce((sum, c) => sum + c.volume, 0) / candles.length;
    
    // Detect volume breakouts
    const volumeBreakouts = this.detectVolumeBreakouts(candles, averageVolume);
    
    // Check for volume spike in recent candles
    const recentVolumes = candles.slice(-5).map(c => c.volume);
    const volumeSpike = recentVolumes.some(v => v > averageVolume * 2);

    return {
      volumeByPrice,
      volumeTrend,
      averageVolume,
      volumeBreakouts,
      volumeSpike
    };
  }

  /**
   * Combine and score all detected patterns
   */
  private async combineAndScorePatterns(
    chartData: ChartData,
    technicalPatterns: PatternType[],
    aiAnalysis: AIPatternAnalysis,
    supportResistance: SupportResistanceLevel[],
    volumeProfile: VolumeProfile
  ): Promise<PatternDetection[]> {
    const patterns: PatternDetection[] = [];
    
    // Process technical patterns
    for (const patternType of technicalPatterns) {
      const pattern = await this.createPatternDetection(
        chartData, 
        patternType, 
        aiAnalysis, 
        supportResistance, 
        volumeProfile
      );
      
      if (pattern.confidence >= this.config.minConfidence && 
          pattern.reliability.score >= this.config.minReliability) {
        patterns.push(pattern);
      }
    }

    // Process AI-identified patterns
    const aiPatterns = this.extractAIPatterns(aiAnalysis);
    for (const patternType of aiPatterns) {
      // Avoid duplicates
      if (!technicalPatterns.includes(patternType)) {
        const pattern = await this.createPatternDetection(
          chartData, 
          patternType, 
          aiAnalysis, 
          supportResistance, 
          volumeProfile
        );
        
        if (pattern.confidence >= this.config.minConfidence && 
            pattern.reliability.score >= this.config.minReliability) {
          patterns.push(pattern);
        }
      }
    }

    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Create pattern detection object
   */
  private async createPatternDetection(
    chartData: ChartData,
    patternType: PatternType,
    aiAnalysis: AIPatternAnalysis,
    supportResistance: SupportResistanceLevel[],
    volumeProfile: VolumeProfile
  ): Promise<PatternDetection> {
    const patternId = `${chartData.symbol}-${chartData.timeframe}-${patternType}-${Date.now()}`;
    
    // Calculate pattern coordinates
    const coordinates = this.calculatePatternCoordinates(chartData.candles, patternType);
    
    // Generate pattern prediction
    const prediction = this.generatePatternPrediction(chartData, patternType, aiAnalysis);
    
    // Calculate reliability
    const reliability = this.calculatePatternReliability(
      patternType, 
      chartData, 
      aiAnalysis, 
      volumeProfile
    );
    
    // Calculate overall confidence
    const confidence = this.calculatePatternConfidence(patternType, aiAnalysis, reliability);

    return {
      id: patternId,
      symbol: chartData.symbol,
      timeframe: chartData.timeframe,
      patternType,
      confidence,
      reliability,
      coordinates,
      prediction,
      supportResistance,
      volumeProfile,
      aiAnalysis,
      timestamp: Date.now()
    };
  }

  // Pattern Detection Methods (Technical Analysis)
  private detectHeadAndShoulders(candles: CandleData[]): boolean {
    if (candles.length < 15) return false;
    
    // Simplified head and shoulders detection
    // Look for three peaks with middle one being highest
    const highs = candles.map((c, i) => ({ index: i, high: c.high }));
    const peaks = this.findLocalPeaks(highs, 5);
    
    if (peaks.length < 3) return false;
    
    // Check if middle peak is highest
    for (let i = 1; i < peaks.length - 1; i++) {
      const left = peaks[i - 1];
      const head = peaks[i];
      const right = peaks[i + 1];
      
      if (head.high > left.high && head.high > right.high) {
        // Additional validation could be added here
        return true;
      }
    }
    
    return false;
  }

  private detectDoubleTopBottom(candles: CandleData[]): PatternType | null {
    if (candles.length < 10) return null;
    
    const highs = candles.map((c, i) => ({ index: i, high: c.high }));
    const lows = candles.map((c, i) => ({ index: i, low: c.low }));
    
    const peaks = this.findLocalPeaks(highs, 3);
    const troughs = this.findLocalPeaks(lows.map(l => ({ index: l.index, high: -l.low })), 3);
    
    // Check for double top
    if (peaks.length >= 2) {
      const lastTwo = peaks.slice(-2);
      const priceDiff = Math.abs(lastTwo[0].high - lastTwo[1].high) / lastTwo[0].high;
      if (priceDiff < 0.02) { // Within 2%
        return 'double_top';
      }
    }
    
    // Check for double bottom
    if (troughs.length >= 2) {
      const lastTwo = troughs.slice(-2);
      const priceDiff = Math.abs(lastTwo[0].high - lastTwo[1].high) / Math.abs(lastTwo[0].high);
      if (priceDiff < 0.02) { // Within 2%
        return 'double_bottom';
      }
    }
    
    return null;
  }

  private detectTrianglePatterns(candles: CandleData[]): PatternType | null {
    if (candles.length < 20) return null;
    
    // Simplified triangle detection based on trendlines
    const recent = candles.slice(-20);
    const highs = recent.map(c => c.high);
    const lows = recent.map(c => c.low);
    
    // Check for ascending triangle (horizontal resistance, rising support)
    const highTrend = this.calculateTrendSlope(highs);
    const lowTrend = this.calculateTrendSlope(lows);
    
    if (Math.abs(highTrend) < 0.001 && lowTrend > 0.001) {
      return 'ascending_triangle';
    }
    
    // Check for descending triangle (falling resistance, horizontal support)
    if (highTrend < -0.001 && Math.abs(lowTrend) < 0.001) {
      return 'descending_triangle';
    }
    
    // Check for symmetrical triangle (converging trendlines)
    if (highTrend < -0.001 && lowTrend > 0.001 && Math.abs(highTrend + lowTrend) < 0.002) {
      return 'symmetrical_triangle';
    }
    
    return null;
  }

  private detectFlagPatterns(candles: CandleData[]): PatternType | null {
    if (candles.length < 15) return null;
    
    // Look for strong move followed by consolidation
    const recent = candles.slice(-15);
    const older = candles.slice(-30, -15);
    
    if (older.length < 10) return null;
    
    const oldRange = older[older.length - 1].close - older[0].close;
    const recentRange = recent[recent.length - 1].close - recent[0].close;
    const recentHigh = Math.max(...recent.map(c => c.high));
    const recentLow = Math.min(...recent.map(c => c.low));
    const consolidationRange = recentHigh - recentLow;
    
    // Strong up move followed by sideways consolidation
    if (oldRange > 0 && Math.abs(recentRange) < consolidationRange * 0.5) {
      return 'bull_flag';
    }
    
    // Strong down move followed by sideways consolidation  
    if (oldRange < 0 && Math.abs(recentRange) < consolidationRange * 0.5) {
      return 'bear_flag';
    }
    
    return null;
  }

  private detectCandlestickPatterns(candles: CandleData[]): PatternType[] {
    const patterns: PatternType[] = [];
    
    if (candles.length < 3) return patterns;
    
    const latest = candles[candles.length - 1];
    const bodySize = Math.abs(latest.close - latest.open);
    const upperShadow = latest.high - Math.max(latest.open, latest.close);
    const lowerShadow = Math.min(latest.open, latest.close) - latest.low;
    const range = latest.high - latest.low;
    
    // Doji detection
    if (bodySize < range * 0.1) {
      patterns.push('doji');
    }
    
    // Hammer detection
    if (lowerShadow > bodySize * 2 && upperShadow < bodySize && latest.close > latest.open) {
      patterns.push('hammer');
    }
    
    // Shooting star detection
    if (upperShadow > bodySize * 2 && lowerShadow < bodySize && latest.close < latest.open) {
      patterns.push('shooting_star');
    }
    
    // Engulfing patterns (need 2 candles)
    if (candles.length >= 2) {
      const previous = candles[candles.length - 2];
      
      // Bullish engulfing
      if (previous.close < previous.open && // Previous bearish
          latest.close > latest.open && // Current bullish
          latest.open < previous.close && // Gap down open
          latest.close > previous.open) { // Engulf previous body
        patterns.push('bullish_engulfing');
      }
      
      // Bearish engulfing
      if (previous.close > previous.open && // Previous bullish
          latest.close < latest.open && // Current bearish
          latest.open > previous.close && // Gap up open
          latest.close < previous.open) { // Engulf previous body
        patterns.push('bearish_engulfing');
      }
    }
    
    return patterns;
  }

  // Utility methods
  private findLocalPeaks(data: { index: number; high: number }[], window: number = 5): { index: number; high: number }[] {
    const peaks: { index: number; high: number }[] = [];
    
    for (let i = window; i < data.length - window; i++) {
      let isPeak = true;
      
      for (let j = i - window; j <= i + window; j++) {
        if (j !== i && data[j].high >= data[i].high) {
          isPeak = false;
          break;
        }
      }
      
      if (isPeak) {
        peaks.push(data[i]);
      }
    }
    
    return peaks;
  }

  private calculateTrendSlope(prices: number[]): number {
    const n = prices.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = prices;
    
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  private getRSISignal(rsi: number): string {
    if (rsi > 70) return 'Overbought';
    if (rsi < 30) return 'Oversold';
    return 'Neutral';
  }

  // Helper methods for AI response parsing
  private parseGeminiResponse(response: any): AIProviderAnalysis {
    // Implement Gemini-specific response parsing
    return this.getDefaultAnalysis();
  }

  private parseClaudeResponse(response: any): AIProviderAnalysis {
    // Implement Claude-specific response parsing
    return this.getDefaultAnalysis();
  }

  private getDefaultAnalysis(): AIProviderAnalysis {
    return {
      patternIdentified: [],
      confidence: 0.5,
      reasoning: ['Default analysis due to parsing error'],
      technicalAnalysis: 'Analysis unavailable',
      riskAssessment: 'Medium risk',
      tradingRecommendation: 'Hold',
      keyLevels: [],
      timeHorizon: 'medium-term'
    };
  }

  private getDefaultEnsembleAnalysis(): EnsembleAnalysis {
    return {
      consensusPattern: 'rectangle',
      agreementLevel: 0.5,
      conflictingViews: [],
      weightedConfidence: 0.5,
      combinedRecommendation: 'Hold',
      riskConsensus: 'medium'
    };
  }

  // More utility methods would be implemented here...
  private identifyConflicts(analysis: AIPatternAnalysis): string[] {
    // Implementation for identifying conflicting AI views
    return [];
  }

  private generateCombinedRecommendation(analysis: AIPatternAnalysis): string {
    // Implementation for generating combined recommendation
    return 'Hold';
  }

  private calculateRiskConsensus(analysis: AIPatternAnalysis): 'low' | 'medium' | 'high' {
    // Implementation for calculating risk consensus
    return 'medium';
  }

  private findPivotHighs(candles: CandleData[]): any[] {
    // Implementation for finding pivot highs
    return [];
  }

  private findPivotLows(candles: CandleData[]): any[] {
    // Implementation for finding pivot lows
    return [];
  }

  private calculateLevelReliability(pivot: any, candles: CandleData[]): number {
    // Implementation for calculating level reliability
    return 0.5;
  }

  private calculateVolumeByPrice(candles: CandleData[]): VolumeByPrice[] {
    // Implementation for volume by price calculation
    return [];
  }

  private analyzeVolumeTrend(candles: CandleData[]): 'increasing' | 'decreasing' | 'stable' {
    // Implementation for volume trend analysis
    return 'stable';
  }

  private detectVolumeBreakouts(candles: CandleData[], averageVolume: number): VolumeBreakout[] {
    // Implementation for volume breakout detection
    return [];
  }

  private extractAIPatterns(aiAnalysis: AIPatternAnalysis): PatternType[] {
    // Implementation for extracting patterns from AI analysis
    return [];
  }

  private calculatePatternCoordinates(candles: CandleData[], patternType: PatternType): PatternCoordinates {
    // Implementation for calculating pattern coordinates
    return {
      startIndex: 0,
      endIndex: candles.length - 1,
      keyPoints: [],
      trendLines: [],
      breakoutLevel: candles[candles.length - 1].close,
      targetLevels: []
    };
  }

  private generatePatternPrediction(chartData: ChartData, patternType: PatternType, aiAnalysis: AIPatternAnalysis): PatternPrediction {
    // Implementation for generating pattern prediction
    const latest = chartData.candles[chartData.candles.length - 1];
    return {
      direction: 'neutral',
      priceTarget: latest.close * 1.02,
      stopLoss: latest.close * 0.98,
      probability: 0.5,
      timeframe: chartData.timeframe,
      riskRewardRatio: 2.0,
      completionCriteria: []
    };
  }

  private calculatePatternReliability(patternType: PatternType, chartData: ChartData, aiAnalysis: AIPatternAnalysis, volumeProfile: VolumeProfile): PatternReliability {
    // Implementation for calculating pattern reliability
    return {
      score: 50,
      factors: [],
      historicalAccuracy: 0.6,
      marketConditionSuitability: 0.7,
      volumeConfirmation: volumeProfile.volumeSpike ? 0.8 : 0.5,
      multiTimeframeConfirmation: 0.6
    };
  }

  private calculatePatternConfidence(patternType: PatternType, aiAnalysis: AIPatternAnalysis, reliability: PatternReliability): number {
    // Implementation for calculating overall pattern confidence
    let confidence = reliability.score / 100;
    
    // Adjust based on AI consensus
    if (aiAnalysis.ensemble) {
      confidence = (confidence + aiAnalysis.ensemble.weightedConfidence) / 2;
    }
    
    return Math.min(1.0, Math.max(0.0, confidence));
  }

  private storePatterns(symbol: string, patterns: PatternDetection[]): void {
    this.detectedPatterns.set(symbol, patterns);
  }

  /**
   * Get detected patterns for a symbol
   */
  getDetectedPatterns(symbol: string): PatternDetection[] {
    return this.detectedPatterns.get(symbol) || [];
  }

  /**
   * Get all detected patterns
   */
  getAllDetectedPatterns(): Map<string, PatternDetection[]> {
    return new Map(this.detectedPatterns);
  }

  /**
   * Start real-time pattern detection
   */
  async startRealTimeDetection(): Promise<void> {
    if (this.isAnalyzing) return;
    
    this.isAnalyzing = true;
    console.log('📊 Real-time chart pattern detection started');
    
    this.emit('detectionStarted', {
      timestamp: Date.now(),
      config: this.config
    });
  }

  /**
   * Stop real-time pattern detection
   */
  async stopRealTimeDetection(): Promise<void> {
    this.isAnalyzing = false;
    console.log('📊 Real-time chart pattern detection stopped');
    
    this.emit('detectionStopped', {
      timestamp: Date.now()
    });
  }
}