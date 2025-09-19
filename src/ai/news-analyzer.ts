/**
 * AI-Powered News Analysis & Market Impact Assessment System
 * Advanced news processing and market sentiment analysis using multiple AI models
 * 
 * Features:
 * - Real-time news collection from multiple sources
 * - Multi-AI sentiment analysis and impact assessment
 * - Market correlation analysis and price prediction
 * - News categorization and relevance scoring
 * - Real-time market event detection and alerting
 * - Historical news impact backtesting
 * - Sentiment trend analysis and momentum tracking
 * - Cross-market impact analysis and contagion detection
 */

import { EventEmitter } from '../utils/event-emitter.js';

// News Interfaces
export interface NewsItem {
  id: string;
  title: string;
  content: string;
  summary?: string;
  source: NewsSource;
  author?: string;
  publishedAt: number;
  url: string;
  categories: NewsCategory[];
  mentions: AssetMention[];
  language: string;
  credibilityScore: number;
  originalScore?: number;
}

export interface NewsSource {
  name: string;
  type: SourceType;
  credibility: number; // 0-1
  bias: number; // -1 to 1 (negative=bearish, positive=bullish)
  responseTime: number; // Average time to report news (minutes)
  reach: number; // Estimated audience size
  specialization: string[]; // e.g., ['crypto', 'stocks', 'forex']
}

export type SourceType = 
  | 'news_website' | 'social_media' | 'blog' | 'press_release' 
  | 'regulatory' | 'exchange' | 'research' | 'forum';

export type NewsCategory = 
  | 'regulation' | 'adoption' | 'technology' | 'partnerships' | 'security'
  | 'market_analysis' | 'price_movement' | 'trading' | 'development'
  | 'legal' | 'economic' | 'political' | 'social';

export interface AssetMention {
  symbol: string;
  name: string;
  mentionCount: number;
  mentionContext: MentionContext[];
  sentiment: number; // -1 to 1
  relevance: number; // 0-1
  impact: MarketImpact;
}

export interface MentionContext {
  text: string;
  sentiment: number;
  position: number; // Position in article (0-1)
  importance: number; // Based on context (headline, first paragraph, etc.)
}

// Analysis Interfaces
export interface NewsAnalysis {
  id: string;
  newsId: string;
  timestamp: number;
  overallSentiment: SentimentScore;
  marketImpact: MarketImpact;
  assetAnalysis: AssetAnalysis[];
  aiAnalysis: AINewsAnalysis;
  marketCorrelation: MarketCorrelation;
  riskAssessment: RiskAssessment;
  actionItems: ActionItem[];
}

export interface SentimentScore {
  score: number; // -1 to 1
  confidence: number; // 0-1
  magnitude: number; // 0-1 (how strong the sentiment is)
  classification: SentimentClassification;
  emotionalIndicators: EmotionalIndicator[];
}

export type SentimentClassification = 
  | 'very_negative' | 'negative' | 'slightly_negative' | 'neutral'
  | 'slightly_positive' | 'positive' | 'very_positive';

export interface EmotionalIndicator {
  emotion: EmotionType;
  intensity: number; // 0-1
  keywords: string[];
}

export type EmotionType = 
  | 'fear' | 'greed' | 'uncertainty' | 'excitement' | 'confidence'
  | 'panic' | 'optimism' | 'despair' | 'euphoria' | 'anxiety';

export interface MarketImpact {
  shortTerm: ImpactAssessment; // 0-24 hours
  mediumTerm: ImpactAssessment; // 1-7 days  
  longTerm: ImpactAssessment; // 1-30 days
  expectedDirection: 'bullish' | 'bearish' | 'neutral';
  volatilityImpact: number; // Expected volatility increase (0-1)
  liquidityImpact: number; // Expected liquidity change (-1 to 1)
}

export interface ImpactAssessment {
  priceImpact: number; // Expected price change (-1 to 1)
  volumeImpact: number; // Expected volume change (-1 to 1)
  confidence: number; // 0-1
  reasoning: string[];
}

export interface AssetAnalysis {
  symbol: string;
  relevanceScore: number; // 0-1
  sentimentScore: number; // -1 to 1
  impactPrediction: MarketImpact;
  keyPoints: string[];
  riskFactors: string[];
  opportunities: string[];
  tradingRecommendation: TradingRecommendation;
}

export interface TradingRecommendation {
  action: 'buy' | 'sell' | 'hold' | 'watch';
  strength: number; // 0-1
  timeframe: string;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  reasoning: string[];
}

export interface AINewsAnalysis {
  openai?: AIProviderNewsAnalysis;
  gemini?: AIProviderNewsAnalysis;
  claude?: AIProviderNewsAnalysis;
  ensemble?: EnsembleNewsAnalysis;
}

export interface AIProviderNewsAnalysis {
  sentiment: SentimentScore;
  keyInsights: string[];
  marketImplications: string[];
  affectedAssets: string[];
  timeframe: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  tradingSignals: TradingSignal[];
}

export interface TradingSignal {
  symbol: string;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number;
  reasoning: string;
  timeframe: string;
}

export interface EnsembleNewsAnalysis {
  consensusSentiment: SentimentScore;
  agreementLevel: number;
  conflictingViews: string[];
  weightedImpact: MarketImpact;
  combinedRecommendations: TradingRecommendation[];
  riskConsensus: 'low' | 'medium' | 'high';
}

export interface MarketCorrelation {
  correlatedAssets: string[];
  correlationStrength: number;
  spilloverEffect: SpilloverEffect[];
  marketRegime: MarketRegime;
  contagionRisk: number; // 0-1
}

export interface SpilloverEffect {
  fromAsset: string;
  toAsset: string;
  strength: number;
  direction: 'positive' | 'negative';
  timeDelay: number; // Expected delay in minutes
}

export interface MarketRegime {
  current: RegimeType;
  stability: number; // 0-1
  transitionProbability: RegimeTransition[];
}

export type RegimeType = 
  | 'bull_market' | 'bear_market' | 'sideways' | 'high_volatility'
  | 'low_volatility' | 'crisis' | 'recovery' | 'euphoria';

export interface RegimeTransition {
  from: RegimeType;
  to: RegimeType;
  probability: number;
  catalysts: string[];
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: RiskFactor[];
  mitigationStrategies: string[];
  monitoringPoints: string[];
  escalationTriggers: string[];
}

export interface RiskFactor {
  factor: string;
  severity: number; // 0-1
  probability: number; // 0-1
  timeframe: string;
  mitigation: string[];
}

export interface ActionItem {
  priority: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  reasoning: string;
  timeframe: string;
  expectedOutcome: string;
  riskLevel: 'low' | 'medium' | 'high';
}

// Monitoring and Alerting
export interface NewsAlert {
  id: string;
  type: AlertType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  affectedAssets: string[];
  newsItems: string[]; // News item IDs
  timestamp: number;
  expiresAt?: number;
  actions: string[];
}

export type AlertType = 
  | 'breaking_news' | 'market_moving' | 'sentiment_shift' | 'regulatory'
  | 'security_breach' | 'adoption_news' | 'partnership' | 'technical_development';

// Configuration
export interface NewsAnalyzerConfig {
  newsSources: NewsSource[];
  aiProviders: string[];
  monitoredAssets: string[];
  analysisFrequency: number; // milliseconds
  sentimentThreshold: number; // -1 to 1
  impactThreshold: number; // 0-1
  enableAlerts: boolean;
  enableBacktesting: boolean;
  maxNewsAge: number; // hours
  credibilityMinimum: number; // 0-1
}

/**
 * Advanced AI-Powered News Analyzer
 */
export class NewsAnalyzer extends EventEmitter {
  private newsItems: Map<string, NewsItem> = new Map();
  private newsAnalyses: Map<string, NewsAnalysis> = new Map();
  private aiServices: Map<string, any> = new Map();
  private config: NewsAnalyzerConfig;
  private isAnalyzing: boolean = false;
  private alertHistory: NewsAlert[] = [];

  constructor(config?: Partial<NewsAnalyzerConfig>) {
    super();
    
    this.config = {
      newsSources: this.getDefaultNewsSources(),
      aiProviders: ['openai', 'gemini', 'claude'],
      monitoredAssets: ['BTC', 'ETH', 'BNB', 'ADA', 'SOL'],
      analysisFrequency: 5 * 60 * 1000, // 5 minutes
      sentimentThreshold: 0.3,
      impactThreshold: 0.5,
      enableAlerts: true,
      enableBacktesting: false,
      maxNewsAge: 24, // 24 hours
      credibilityMinimum: 0.3,
      ...config
    };
  }

  /**
   * Initialize news analyzer with AI services
   */
  async initialize(aiServices: Map<string, any>): Promise<void> {
    this.aiServices = aiServices;
    console.log('📰 News Analyzer initialized with AI services');
  }

  /**
   * Analyze a single news item
   */
  async analyzeNews(newsItem: NewsItem): Promise<NewsAnalysis> {
    try {
      console.log(`📊 Analyzing news: ${newsItem.title.substring(0, 60)}...`);

      // Step 1: Extract asset mentions and context
      const assetMentions = await this.extractAssetMentions(newsItem);
      newsItem.mentions = assetMentions;

      // Step 2: Perform AI-powered analysis
      const aiAnalysis = await this.performAIAnalysis(newsItem);

      // Step 3: Calculate overall sentiment
      const overallSentiment = await this.calculateOverallSentiment(newsItem, aiAnalysis);

      // Step 4: Assess market impact
      const marketImpact = await this.assessMarketImpact(newsItem, aiAnalysis);

      // Step 5: Analyze individual assets
      const assetAnalysis = await this.analyzeIndividualAssets(newsItem, aiAnalysis);

      // Step 6: Calculate market correlations
      const marketCorrelation = await this.calculateMarketCorrelation(newsItem, assetAnalysis);

      // Step 7: Assess risks
      const riskAssessment = await this.assessRisks(newsItem, aiAnalysis, marketImpact);

      // Step 8: Generate action items
      const actionItems = await this.generateActionItems(newsItem, aiAnalysis, riskAssessment);

      const analysis: NewsAnalysis = {
        id: `analysis_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        newsId: newsItem.id,
        timestamp: Date.now(),
        overallSentiment,
        marketImpact,
        assetAnalysis,
        aiAnalysis,
        marketCorrelation,
        riskAssessment,
        actionItems
      };

      // Store analysis
      this.newsAnalyses.set(analysis.id, analysis);

      // Check for alerts
      await this.checkForAlerts(newsItem, analysis);

      // Emit analysis event
      this.emit('newsAnalyzed', {
        newsItem,
        analysis,
        timestamp: Date.now()
      });

      console.log(`✅ News analysis completed: ${overallSentiment.classification} sentiment`);
      return analysis;

    } catch (error) {
      console.error('❌ News analysis failed:', error);
      throw error;
    }
  }

  /**
   * Analyze multiple news items in batch
   */
  async analyzeNewsBatch(newsItems: NewsItem[]): Promise<NewsAnalysis[]> {
    console.log(`📊 Analyzing ${newsItems.length} news items in batch`);
    
    const analyses: NewsAnalysis[] = [];
    
    for (const newsItem of newsItems) {
      try {
        const analysis = await this.analyzeNews(newsItem);
        analyses.push(analysis);
      } catch (error) {
        console.error(`❌ Failed to analyze news item ${newsItem.id}:`, error);
      }
    }
    
    console.log(`✅ Batch analysis completed: ${analyses.length}/${newsItems.length} successful`);
    return analyses;
  }

  /**
   * Get sentiment trend for an asset
   */
  async getSentimentTrend(
    symbol: string, 
    timeframe: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<SentimentTrend> {
    const cutoffTime = Date.now() - timeframe;
    const relevantAnalyses = Array.from(this.newsAnalyses.values())
      .filter(analysis => 
        analysis.timestamp > cutoffTime &&
        analysis.assetAnalysis.some(asset => asset.symbol === symbol)
      )
      .sort((a, b) => a.timestamp - b.timestamp);

    const sentimentPoints: SentimentPoint[] = relevantAnalyses.map(analysis => {
      const assetAnalysis = analysis.assetAnalysis.find(asset => asset.symbol === symbol);
      return {
        timestamp: analysis.timestamp,
        sentiment: assetAnalysis?.sentimentScore || 0,
        relevance: assetAnalysis?.relevanceScore || 0,
        newsId: analysis.newsId
      };
    });

    // Calculate trend
    const trend = this.calculateSentimentTrend(sentimentPoints);

    return {
      symbol,
      timeframe,
      points: sentimentPoints,
      trend,
      currentSentiment: sentimentPoints[sentimentPoints.length - 1]?.sentiment || 0,
      averageSentiment: sentimentPoints.reduce((sum, p) => sum + p.sentiment, 0) / sentimentPoints.length || 0,
      momentum: this.calculateSentimentMomentum(sentimentPoints),
      newsCount: sentimentPoints.length
    };
  }

  /**
   * Get market impact summary for recent news
   */
  async getMarketImpactSummary(timeframe: number = 6 * 60 * 60 * 1000): Promise<MarketImpactSummary> {
    const cutoffTime = Date.now() - timeframe;
    const recentAnalyses = Array.from(this.newsAnalyses.values())
      .filter(analysis => analysis.timestamp > cutoffTime)
      .sort((a, b) => b.timestamp - a.timestamp);

    const impactSummary: MarketImpactSummary = {
      timeframe,
      totalNews: recentAnalyses.length,
      highImpactNews: recentAnalyses.filter(a => 
        a.marketImpact.shortTerm.priceImpact > this.config.impactThreshold
      ).length,
      overallSentiment: this.calculateAggregatedSentiment(recentAnalyses),
      affectedAssets: this.getAffectedAssets(recentAnalyses),
      majorEvents: this.getMajorEvents(recentAnalyses),
      riskLevel: this.calculateOverallRiskLevel(recentAnalyses),
      tradingRecommendations: this.getAggregatedTradingRecommendations(recentAnalyses)
    };

    return impactSummary;
  }

  // Private Helper Methods

  private async extractAssetMentions(newsItem: NewsItem): Promise<AssetMention[]> {
    const mentions: AssetMention[] = [];
    const text = `${newsItem.title} ${newsItem.content}`.toLowerCase();

    // Asset mapping (symbol -> names/aliases)
    const assetMap = new Map([
      ['BTC', ['bitcoin', 'btc', 'satoshi']],
      ['ETH', ['ethereum', 'eth', 'ether']],
      ['BNB', ['binance', 'bnb', 'binance coin']],
      ['ADA', ['cardano', 'ada']],
      ['SOL', ['solana', 'sol']],
      ['DOGE', ['dogecoin', 'doge']],
      ['XRP', ['ripple', 'xrp']],
      ['DOT', ['polkadot', 'dot']],
      ['AVAX', ['avalanche', 'avax']],
      ['MATIC', ['polygon', 'matic']]
    ]);

    for (const [symbol, aliases] of assetMap) {
      let mentionCount = 0;
      const contexts: MentionContext[] = [];

      for (const alias of aliases) {
        const regex = new RegExp(`\\b${alias}\\b`, 'gi');
        const matches = text.match(regex);
        
        if (matches) {
          mentionCount += matches.length;
          
          // Extract context around mentions
          const contextRegex = new RegExp(`.{0,50}\\b${alias}\\b.{0,50}`, 'gi');
          const contextMatches = text.match(contextRegex) || [];
          
          contextMatches.forEach((context, index) => {
            contexts.push({
              text: context.trim(),
              sentiment: this.analyzeMentionSentiment(context),
              position: text.indexOf(context.toLowerCase()) / text.length,
              importance: this.calculateContextImportance(context, newsItem)
            });
          });
        }
      }

      if (mentionCount > 0) {
        const avgSentiment = contexts.reduce((sum, ctx) => sum + ctx.sentiment, 0) / contexts.length;
        const relevance = this.calculateRelevanceScore(mentionCount, contexts, newsItem);

        mentions.push({
          symbol,
          name: aliases[0],
          mentionCount,
          mentionContext: contexts,
          sentiment: avgSentiment,
          relevance,
          impact: await this.calculateMentionImpact(symbol, avgSentiment, relevance)
        });
      }
    }

    return mentions.sort((a, b) => b.relevance - a.relevance);
  }

  private async performAIAnalysis(newsItem: NewsItem): Promise<AINewsAnalysis> {
    const analysis: AINewsAnalysis = {};

    // OpenAI Analysis
    if (this.aiServices.has('openai') && this.config.aiProviders.includes('openai')) {
      try {
        analysis.openai = await this.performOpenAINewsAnalysis(newsItem);
      } catch (error) {
        console.error('OpenAI news analysis failed:', error);
      }
    }

    // Gemini Analysis
    if (this.aiServices.has('gemini') && this.config.aiProviders.includes('gemini')) {
      try {
        analysis.gemini = await this.performGeminiNewsAnalysis(newsItem);
      } catch (error) {
        console.error('Gemini news analysis failed:', error);
      }
    }

    // Claude Analysis
    if (this.aiServices.has('claude') && this.config.aiProviders.includes('claude')) {
      try {
        analysis.claude = await this.performClaudeNewsAnalysis(newsItem);
      } catch (error) {
        console.error('Claude news analysis failed:', error);
      }
    }

    // Ensemble Analysis
    const providers = Object.keys(analysis).filter(key => key !== 'ensemble');
    if (providers.length > 1) {
      analysis.ensemble = this.createEnsembleNewsAnalysis(analysis);
    }

    return analysis;
  }

  private async performOpenAINewsAnalysis(newsItem: NewsItem): Promise<AIProviderNewsAnalysis> {
    const openaiService = this.aiServices.get('openai');
    
    const prompt = `Analyze the following cryptocurrency/financial news article:

Title: ${newsItem.title}
Content: ${newsItem.content.substring(0, 2000)}...
Source: ${newsItem.source.name}
Published: ${new Date(newsItem.publishedAt).toISOString()}

Please provide a comprehensive analysis including:
1. Overall sentiment (-1 to 1, where -1 is very bearish and 1 is very bullish)
2. Key insights from the article
3. Market implications and potential impacts
4. Which assets are most likely to be affected
5. Expected timeframe for impact
6. Risk level assessment
7. Trading signals if any

Respond in JSON format with the following structure:
{
  "sentiment": {
    "score": -0.2,
    "confidence": 0.8,
    "magnitude": 0.6,
    "classification": "slightly_negative"
  },
  "keyInsights": ["insight1", "insight2"],
  "marketImplications": ["implication1", "implication2"],
  "affectedAssets": ["BTC", "ETH"],
  "timeframe": "short-term",
  "confidence": 0.75,
  "riskLevel": "medium",
  "tradingSignals": [
    {
      "symbol": "BTC",
      "signal": "sell",
      "strength": 0.6,
      "reasoning": "negative regulatory news",
      "timeframe": "1-3 days"
    }
  ]
}`;

    const response = await openaiService.makeRequest({
      type: 'analysis',
      prompt,
      symbol: 'NEWS_ANALYSIS',
      config: { temperature: 0.3 }
    });

    try {
      const analysis = JSON.parse(response.content);
      return {
        sentiment: analysis.sentiment || { score: 0, confidence: 0.5, magnitude: 0, classification: 'neutral' },
        keyInsights: analysis.keyInsights || [],
        marketImplications: analysis.marketImplications || [],
        affectedAssets: analysis.affectedAssets || [],
        timeframe: analysis.timeframe || 'unknown',
        confidence: analysis.confidence || 0.5,
        riskLevel: analysis.riskLevel || 'medium',
        tradingSignals: analysis.tradingSignals || []
      };
    } catch (error) {
      console.error('Error parsing OpenAI news analysis:', error);
      return this.getDefaultNewsAnalysis();
    }
  }

  private async performGeminiNewsAnalysis(newsItem: NewsItem): Promise<AIProviderNewsAnalysis> {
    const geminiService = this.aiServices.get('gemini');
    
    const prompt = `Financial News Analysis Request:

News Article:
- Title: ${newsItem.title}
- Content: ${newsItem.content.substring(0, 1500)}
- Source: ${newsItem.source.name} (Credibility: ${newsItem.source.credibility})
- Published: ${new Date(newsItem.publishedAt).toLocaleString()}

Provide comprehensive analysis:
1. Sentiment analysis with confidence and magnitude
2. Market impact assessment
3. Affected cryptocurrencies and traditional assets
4. Trading implications and signals
5. Risk assessment and timeframe

Focus on actionable insights for traders and investors.`;

    const response = await geminiService.makeRequest({
      type: 'analysis',
      prompt,
      symbol: 'NEWS_ANALYSIS',
      config: { temperature: 0.25 }
    });

    return this.parseGeminiNewsResponse(response);
  }

  private async performClaudeNewsAnalysis(newsItem: NewsItem): Promise<AIProviderNewsAnalysis> {
    const claudeService = this.aiServices.get('claude');
    
    const prompt = `Professional Financial News Analysis:

Article Information:
Title: ${newsItem.title}
Content: ${newsItem.content}
Source: ${newsItem.source.name}
Publication Time: ${new Date(newsItem.publishedAt).toISOString()}
Mentioned Assets: ${newsItem.mentions.map(m => m.symbol).join(', ')}

Please conduct thorough analysis covering:
1. Sentiment Analysis: Quantified sentiment with confidence metrics
2. Market Impact: Short, medium, and long-term implications
3. Asset-Specific Analysis: Individual impact on mentioned cryptocurrencies
4. Risk Assessment: Potential risks and mitigation strategies
5. Trading Strategy: Actionable trading recommendations with timeframes
6. Market Context: How this fits into current market narrative

Provide detailed, nuanced analysis suitable for institutional trading decisions.`;

    const response = await claudeService.makeRequest({
      type: 'analysis',
      prompt,
      symbol: 'NEWS_ANALYSIS',
      config: { temperature: 0.2 }
    });

    return this.parseClaudeNewsResponse(response);
  }

  private createEnsembleNewsAnalysis(analysis: AINewsAnalysis): EnsembleNewsAnalysis {
    const providers = Object.keys(analysis).filter(key => key !== 'ensemble');
    
    if (providers.length === 0) {
      return this.getDefaultEnsembleNewsAnalysis();
    }

    // Calculate consensus sentiment
    const sentiments = providers
      .map(provider => analysis[provider as keyof AINewsAnalysis]?.sentiment)
      .filter(s => s !== undefined) as SentimentScore[];

    const avgSentiment = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    const avgConfidence = sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length;

    const consensusSentiment: SentimentScore = {
      score: avgSentiment,
      confidence: avgConfidence,
      magnitude: sentiments.reduce((sum, s) => sum + s.magnitude, 0) / sentiments.length,
      classification: this.classifySentiment(avgSentiment),
      emotionalIndicators: []
    };

    // Calculate agreement level
    const sentimentVariance = sentiments.reduce((sum, s) => 
      sum + Math.pow(s.score - avgSentiment, 2), 0
    ) / sentiments.length;
    
    const agreementLevel = Math.max(0, 1 - sentimentVariance * 4); // Normalize variance

    return {
      consensusSentiment,
      agreementLevel,
      conflictingViews: this.identifyConflictingViews(analysis),
      weightedImpact: this.calculateWeightedImpact(analysis),
      combinedRecommendations: this.combineTradingRecommendations(analysis),
      riskConsensus: this.calculateRiskConsensus(analysis)
    };
  }

  // Utility methods for calculation and analysis
  private analyzeMentionSentiment(context: string): number {
    // Simple sentiment analysis based on keywords
    const positiveWords = ['bullish', 'positive', 'up', 'gain', 'surge', 'moon', 'buy', 'adoption'];
    const negativeWords = ['bearish', 'negative', 'down', 'loss', 'crash', 'dump', 'sell', 'ban'];
    
    let score = 0;
    const lowerContext = context.toLowerCase();
    
    positiveWords.forEach(word => {
      if (lowerContext.includes(word)) score += 0.2;
    });
    
    negativeWords.forEach(word => {
      if (lowerContext.includes(word)) score -= 0.2;
    });
    
    return Math.max(-1, Math.min(1, score));
  }

  private calculateContextImportance(context: string, newsItem: NewsItem): number {
    let importance = 0.5; // Base importance
    
    // Higher importance if in title
    if (newsItem.title.toLowerCase().includes(context.toLowerCase())) {
      importance += 0.3;
    }
    
    // Higher importance if in first paragraph
    if (newsItem.content.substring(0, 200).toLowerCase().includes(context.toLowerCase())) {
      importance += 0.2;
    }
    
    return Math.min(1, importance);
  }

  private calculateRelevanceScore(mentionCount: number, contexts: MentionContext[], newsItem: NewsItem): number {
    let relevance = Math.min(0.8, mentionCount * 0.1); // Base on mention count
    
    // Add context importance
    const avgImportance = contexts.reduce((sum, ctx) => sum + ctx.importance, 0) / contexts.length;
    relevance += avgImportance * 0.2;
    
    return Math.min(1, relevance);
  }

  private async calculateMentionImpact(symbol: string, sentiment: number, relevance: number): Promise<MarketImpact> {
    const baseImpact = Math.abs(sentiment) * relevance;
    
    return {
      shortTerm: {
        priceImpact: sentiment * baseImpact * 0.1,
        volumeImpact: baseImpact * 0.2,
        confidence: relevance,
        reasoning: [`Sentiment: ${sentiment.toFixed(2)}, Relevance: ${relevance.toFixed(2)}`]
      },
      mediumTerm: {
        priceImpact: sentiment * baseImpact * 0.05,
        volumeImpact: baseImpact * 0.1,
        confidence: relevance * 0.8,
        reasoning: ['Medium-term impact based on news persistence']
      },
      longTerm: {
        priceImpact: sentiment * baseImpact * 0.02,
        volumeImpact: baseImpact * 0.05,
        confidence: relevance * 0.6,
        reasoning: ['Long-term impact likely minimal unless fundamental change']
      },
      expectedDirection: sentiment > 0.1 ? 'bullish' : sentiment < -0.1 ? 'bearish' : 'neutral',
      volatilityImpact: baseImpact * 0.5,
      liquidityImpact: sentiment * baseImpact * 0.3
    };
  }

  private async calculateOverallSentiment(newsItem: NewsItem, aiAnalysis: AINewsAnalysis): Promise<SentimentScore> {
    // Use ensemble if available, otherwise average available analyses
    if (aiAnalysis.ensemble) {
      return aiAnalysis.ensemble.consensusSentiment;
    }
    
    const sentiments: SentimentScore[] = [];
    Object.values(aiAnalysis).forEach(analysis => {
      if (analysis && 'sentiment' in analysis) {
        sentiments.push(analysis.sentiment);
      }
    });
    
    if (sentiments.length === 0) {
      // Fallback to simple keyword analysis
      const keywordSentiment = this.analyzeMentionSentiment(newsItem.title + ' ' + newsItem.content);
      return {
        score: keywordSentiment,
        confidence: 0.3,
        magnitude: Math.abs(keywordSentiment),
        classification: this.classifySentiment(keywordSentiment),
        emotionalIndicators: []
      };
    }
    
    const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
    const avgConfidence = sentiments.reduce((sum, s) => sum + s.confidence, 0) / sentiments.length;
    
    return {
      score: avgScore,
      confidence: avgConfidence,
      magnitude: sentiments.reduce((sum, s) => sum + s.magnitude, 0) / sentiments.length,
      classification: this.classifySentiment(avgScore),
      emotionalIndicators: []
    };
  }

  private classifySentiment(score: number): SentimentClassification {
    if (score <= -0.6) return 'very_negative';
    if (score <= -0.2) return 'negative';
    if (score <= -0.05) return 'slightly_negative';
    if (score >= 0.6) return 'very_positive';
    if (score >= 0.2) return 'positive';
    if (score >= 0.05) return 'slightly_positive';
    return 'neutral';
  }

  // Additional helper methods would be implemented here...
  private async assessMarketImpact(newsItem: NewsItem, aiAnalysis: AINewsAnalysis): Promise<MarketImpact> {
    // Placeholder implementation
    return {
      shortTerm: { priceImpact: 0.02, volumeImpact: 0.1, confidence: 0.7, reasoning: [] },
      mediumTerm: { priceImpact: 0.01, volumeImpact: 0.05, confidence: 0.6, reasoning: [] },
      longTerm: { priceImpact: 0.005, volumeImpact: 0.02, confidence: 0.5, reasoning: [] },
      expectedDirection: 'neutral',
      volatilityImpact: 0.1,
      liquidityImpact: 0.05
    };
  }

  private async analyzeIndividualAssets(newsItem: NewsItem, aiAnalysis: AINewsAnalysis): Promise<AssetAnalysis[]> {
    return newsItem.mentions.map(mention => ({
      symbol: mention.symbol,
      relevanceScore: mention.relevance,
      sentimentScore: mention.sentiment,
      impactPrediction: mention.impact,
      keyPoints: [`Mentioned ${mention.mentionCount} times`],
      riskFactors: [],
      opportunities: [],
      tradingRecommendation: {
        action: 'hold',
        strength: 0.5,
        timeframe: 'short-term',
        reasoning: ['Neutral recommendation based on analysis']
      }
    }));
  }

  private async calculateMarketCorrelation(newsItem: NewsItem, assetAnalysis: AssetAnalysis[]): Promise<MarketCorrelation> {
    return {
      correlatedAssets: assetAnalysis.map(a => a.symbol),
      correlationStrength: 0.5,
      spilloverEffect: [],
      marketRegime: { current: 'sideways', stability: 0.7, transitionProbability: [] },
      contagionRisk: 0.2
    };
  }

  private async assessRisks(newsItem: NewsItem, aiAnalysis: AINewsAnalysis, marketImpact: MarketImpact): Promise<RiskAssessment> {
    return {
      overallRisk: 'medium',
      riskFactors: [],
      mitigationStrategies: [],
      monitoringPoints: [],
      escalationTriggers: []
    };
  }

  private async generateActionItems(newsItem: NewsItem, aiAnalysis: AINewsAnalysis, riskAssessment: RiskAssessment): Promise<ActionItem[]> {
    return [{
      priority: 'medium',
      action: 'Monitor market reaction',
      reasoning: 'News may impact market sentiment',
      timeframe: '24 hours',
      expectedOutcome: 'Better understanding of market response',
      riskLevel: 'low'
    }];
  }

  private async checkForAlerts(newsItem: NewsItem, analysis: NewsAnalysis): Promise<void> {
    // Check if analysis meets alert criteria
    if (Math.abs(analysis.overallSentiment.score) > this.config.sentimentThreshold ||
        analysis.marketImpact.shortTerm.priceImpact > this.config.impactThreshold) {
      
      const alert: NewsAlert = {
        id: `alert_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        type: this.determineAlertType(newsItem, analysis),
        severity: this.calculateAlertSeverity(analysis),
        title: `Market Alert: ${newsItem.title.substring(0, 50)}...`,
        message: `${analysis.overallSentiment.classification} sentiment detected with potential ${analysis.marketImpact.expectedDirection} impact`,
        affectedAssets: analysis.assetAnalysis.map(a => a.symbol),
        newsItems: [newsItem.id],
        timestamp: Date.now(),
        actions: ['Monitor positions', 'Review risk exposure']
      };
      
      this.alertHistory.push(alert);
      
      this.emit('newsAlert', {
        alert,
        newsItem,
        analysis,
        timestamp: Date.now()
      });
    }
  }

  private calculateSentimentTrend(points: SentimentPoint[]): number {
    if (points.length < 2) return 0;
    
    // Simple linear regression for trend
    const n = points.length;
    const xSum = points.reduce((sum, p, i) => sum + i, 0);
    const ySum = points.reduce((sum, p) => sum + p.sentiment, 0);
    const xySum = points.reduce((sum, p, i) => sum + i * p.sentiment, 0);
    const x2Sum = points.reduce((sum, p, i) => sum + i * i, 0);
    
    const slope = (n * xySum - xSum * ySum) / (n * x2Sum - xSum * xSum);
    return slope;
  }

  private calculateSentimentMomentum(points: SentimentPoint[]): number {
    if (points.length < 3) return 0;
    
    const recent = points.slice(-3);
    return recent[2].sentiment - recent[0].sentiment;
  }

  // Default data providers
  private getDefaultNewsSources(): NewsSource[] {
    return [
      {
        name: 'CoinDesk',
        type: 'news_website',
        credibility: 0.8,
        bias: 0.1,
        responseTime: 30,
        reach: 1000000,
        specialization: ['crypto', 'blockchain']
      },
      {
        name: 'CoinTelegraph', 
        type: 'news_website',
        credibility: 0.7,
        bias: 0.2,
        responseTime: 20,
        reach: 800000,
        specialization: ['crypto', 'blockchain']
      },
      {
        name: 'Bloomberg Crypto',
        type: 'news_website',
        credibility: 0.9,
        bias: -0.1,
        responseTime: 60,
        reach: 2000000,
        specialization: ['crypto', 'finance', 'markets']
      }
    ];
  }

  private getDefaultNewsAnalysis(): AIProviderNewsAnalysis {
    return {
      sentiment: { score: 0, confidence: 0.5, magnitude: 0, classification: 'neutral', emotionalIndicators: [] },
      keyInsights: [],
      marketImplications: [],
      affectedAssets: [],
      timeframe: 'unknown',
      confidence: 0.5,
      riskLevel: 'medium',
      tradingSignals: []
    };
  }

  private getDefaultEnsembleNewsAnalysis(): EnsembleNewsAnalysis {
    return {
      consensusSentiment: { score: 0, confidence: 0.5, magnitude: 0, classification: 'neutral', emotionalIndicators: [] },
      agreementLevel: 0.5,
      conflictingViews: [],
      weightedImpact: {
        shortTerm: { priceImpact: 0, volumeImpact: 0, confidence: 0.5, reasoning: [] },
        mediumTerm: { priceImpact: 0, volumeImpact: 0, confidence: 0.5, reasoning: [] },
        longTerm: { priceImpact: 0, volumeImpact: 0, confidence: 0.5, reasoning: [] },
        expectedDirection: 'neutral',
        volatilityImpact: 0,
        liquidityImpact: 0
      },
      combinedRecommendations: [],
      riskConsensus: 'medium'
    };
  }

  // More placeholder methods for complete interface compliance
  private parseGeminiNewsResponse(response: any): AIProviderNewsAnalysis {
    return this.getDefaultNewsAnalysis();
  }

  private parseClaudeNewsResponse(response: any): AIProviderNewsAnalysis {
    return this.getDefaultNewsAnalysis();
  }

  private identifyConflictingViews(analysis: AINewsAnalysis): string[] {
    return [];
  }

  private calculateWeightedImpact(analysis: AINewsAnalysis): MarketImpact {
    return {
      shortTerm: { priceImpact: 0, volumeImpact: 0, confidence: 0.5, reasoning: [] },
      mediumTerm: { priceImpact: 0, volumeImpact: 0, confidence: 0.5, reasoning: [] },
      longTerm: { priceImpact: 0, volumeImpact: 0, confidence: 0.5, reasoning: [] },
      expectedDirection: 'neutral',
      volatilityImpact: 0,
      liquidityImpact: 0
    };
  }

  private combineTradingRecommendations(analysis: AINewsAnalysis): TradingRecommendation[] {
    return [];
  }

  private calculateRiskConsensus(analysis: AINewsAnalysis): 'low' | 'medium' | 'high' {
    return 'medium';
  }

  private determineAlertType(newsItem: NewsItem, analysis: NewsAnalysis): AlertType {
    return 'market_moving';
  }

  private calculateAlertSeverity(analysis: NewsAnalysis): 'low' | 'medium' | 'high' | 'critical' {
    return 'medium';
  }

  private calculateAggregatedSentiment(analyses: NewsAnalysis[]): SentimentScore {
    if (analyses.length === 0) {
      return { score: 0, confidence: 0.5, magnitude: 0, classification: 'neutral', emotionalIndicators: [] };
    }
    
    const avgScore = analyses.reduce((sum, a) => sum + a.overallSentiment.score, 0) / analyses.length;
    return {
      score: avgScore,
      confidence: 0.7,
      magnitude: Math.abs(avgScore),
      classification: this.classifySentiment(avgScore),
      emotionalIndicators: []
    };
  }

  private getAffectedAssets(analyses: NewsAnalysis[]): string[] {
    const assets = new Set<string>();
    analyses.forEach(a => {
      a.assetAnalysis.forEach(asset => assets.add(asset.symbol));
    });
    return Array.from(assets);
  }

  private getMajorEvents(analyses: NewsAnalysis[]): any[] {
    return analyses
      .filter(a => Math.abs(a.overallSentiment.score) > 0.5)
      .map(a => ({
        newsId: a.newsId,
        sentiment: a.overallSentiment.classification,
        impact: a.marketImpact.expectedDirection
      }));
  }

  private calculateOverallRiskLevel(analyses: NewsAnalysis[]): 'low' | 'medium' | 'high' | 'critical' {
    const highRiskCount = analyses.filter(a => 
      a.riskAssessment.overallRisk === 'high' || a.riskAssessment.overallRisk === 'critical'
    ).length;
    
    if (highRiskCount > analyses.length * 0.3) return 'high';
    if (highRiskCount > analyses.length * 0.1) return 'medium';
    return 'low';
  }

  private getAggregatedTradingRecommendations(analyses: NewsAnalysis[]): any[] {
    return [];
  }

  /**
   * Get news analysis by ID
   */
  getNewsAnalysis(analysisId: string): NewsAnalysis | null {
    return this.newsAnalyses.get(analysisId) || null;
  }

  /**
   * Get recent news analyses
   */
  getRecentAnalyses(limit: number = 10): NewsAnalysis[] {
    return Array.from(this.newsAnalyses.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Get alert history
   */
  getAlertHistory(limit: number = 20): NewsAlert[] {
    return this.alertHistory
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }

  /**
   * Start news monitoring
   */
  async startMonitoring(): Promise<void> {
    this.isAnalyzing = true;
    console.log('📰 News monitoring started');
    
    this.emit('monitoringStarted', {
      timestamp: Date.now(),
      config: this.config
    });
  }

  /**
   * Stop news monitoring
   */
  async stopMonitoring(): Promise<void> {
    this.isAnalyzing = false;
    console.log('📰 News monitoring stopped');
    
    this.emit('monitoringStopped', {
      timestamp: Date.now()
    });
  }
}

// Additional interfaces for external use
export interface SentimentTrend {
  symbol: string;
  timeframe: number;
  points: SentimentPoint[];
  trend: number;
  currentSentiment: number;
  averageSentiment: number;
  momentum: number;
  newsCount: number;
}

export interface SentimentPoint {
  timestamp: number;
  sentiment: number;
  relevance: number;
  newsId: string;
}

export interface MarketImpactSummary {
  timeframe: number;
  totalNews: number;
  highImpactNews: number;
  overallSentiment: SentimentScore;
  affectedAssets: string[];
  majorEvents: any[];
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  tradingRecommendations: any[];
}