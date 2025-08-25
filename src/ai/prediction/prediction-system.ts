// TITAN Prediction and Learning System

export interface Prediction {
  id: string;
  asset: string;
  prediction_type: 'price' | 'trend' | 'volatility' | 'support_resistance';
  predicted_value: number;
  current_value: number;
  confidence: number;
  timeframe: string; // e.g., '1h', '4h', '24h', '7d'
  target_date: string;
  ai_agent_id: number;
  reasoning: string;
  created_at: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  actual_value?: number;
  accuracy?: number;
  verified_at?: string;
}

export interface LearningMetrics {
  total_predictions: number;
  confirmed_predictions: number;
  failed_predictions: number;
  overall_accuracy: number;
  accuracy_by_timeframe: { [key: string]: number };
  accuracy_by_agent: { [key: number]: number };
  improvement_trend: number; // positive = improving, negative = declining
  confidence_calibration: number; // how well confidence matches actual accuracy
}

export interface LearningInsight {
  id: string;
  insight_type: 'pattern_discovery' | 'accuracy_improvement' | 'model_optimization';
  description: string;
  confidence: number;
  impact_assessment: string;
  discovered_at: string;
  agent_id: number;
  applied: boolean;
}

export class PredictionSystem {
  private static instance: PredictionSystem;
  private predictions: Map<string, Prediction> = new Map();
  private learningMetrics: LearningMetrics;
  private insights: LearningInsight[] = [];

  private constructor() {
    this.learningMetrics = {
      total_predictions: 0,
      confirmed_predictions: 0,
      failed_predictions: 0,
      overall_accuracy: 0,
      accuracy_by_timeframe: {},
      accuracy_by_agent: {},
      improvement_trend: 0,
      confidence_calibration: 0
    };
    
    this.initializeWithMockData();
  }

  public static getInstance(): PredictionSystem {
    if (!PredictionSystem.instance) {
      PredictionSystem.instance = new PredictionSystem();
    }
    return PredictionSystem.instance;
  }

  private initializeWithMockData(): void {
    // Add some historical predictions for demonstration
    const mockPredictions: Prediction[] = [
      {
        id: this.generatePredictionId(),
        asset: 'BTC',
        prediction_type: 'price',
        predicted_value: 44500,
        current_value: 43200,
        confidence: 88,
        timeframe: '4h',
        target_date: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
        ai_agent_id: 2,
        reasoning: 'شکست مقاومت کلیدی با حجم بالا و الگوی صعودی',
        created_at: new Date().toISOString(),
        status: 'pending'
      },
      {
        id: this.generatePredictionId(),
        asset: 'ETH',
        prediction_type: 'trend',
        predicted_value: 1, // 1 = bullish, -1 = bearish, 0 = neutral
        current_value: 2820,
        confidence: 76,
        timeframe: '24h',
        target_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        ai_agent_id: 8,
        reasoning: 'مومنتوم مثبت و اخبار سازنده اکوسیستم',
        created_at: new Date().toISOString(),
        status: 'pending'
      },
      {
        id: this.generatePredictionId(),
        asset: 'SOL',
        prediction_type: 'price',
        predicted_value: 165,
        current_value: 156.43,
        confidence: 82,
        timeframe: '1h',
        target_date: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        ai_agent_id: 9,
        reasoning: 'اسکلپ فرصت کوتاه‌مدت با الگوی فلگ صعودی',
        created_at: new Date().toISOString(),
        status: 'pending'
      }
    ];

    mockPredictions.forEach(prediction => {
      this.predictions.set(prediction.id, prediction);
    });

    // Initialize learning metrics with some historical data
    this.learningMetrics = {
      total_predictions: 127,
      confirmed_predictions: 98,
      failed_predictions: 29,
      overall_accuracy: 77.2,
      accuracy_by_timeframe: {
        '1h': 85.3,
        '4h': 78.9,
        '24h': 74.2,
        '7d': 69.8
      },
      accuracy_by_agent: {
        1: 87.5, 2: 91.2, 3: 84.6, 4: 82.7, 5: 95.8,
        6: 94.3, 7: 79.4, 8: 88.1, 9: 85.7, 10: 90.3,
        11: 87.9, 12: 89.5, 13: 86.2, 14: 83.4, 15: 94.7
      },
      improvement_trend: 2.3, // 2.3% improvement over last month
      confidence_calibration: 0.89 // 89% calibration score
    };

    // Add some learning insights
    this.insights = [
      {
        id: this.generateInsightId(),
        insight_type: 'pattern_discovery',
        description: 'الگوهای کندل استیک در بازه زمانی 4 ساعته دقت بیشتری دارند',
        confidence: 94,
        impact_assessment: 'بهبود 3.2% در دقت پیش‌بینی',
        discovered_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        agent_id: 15,
        applied: true
      },
      {
        id: this.generateInsightId(),
        insight_type: 'accuracy_improvement',
        description: 'اخبار مربوط به ETF بیت کوین تأثیر 24 ساعته دارند',
        confidence: 88,
        impact_assessment: 'بهبود تشخیص 15% بهتر در تحلیل اخبار',
        discovered_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        agent_id: 4,
        applied: true
      },
      {
        id: this.generateInsightId(),
        insight_type: 'model_optimization',
        description: 'ترکیب سه مدل تحلیل تکنیکال دقت را بهبود می‌دهد',
        confidence: 91,
        impact_assessment: 'افزایش 2.7% دقت در پیش‌بینی‌های کوتاه‌مدت',
        discovered_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        agent_id: 15,
        applied: false
      }
    ];
  }

  public makePrediction(
    asset: string,
    predictionType: Prediction['prediction_type'],
    predictedValue: number,
    confidence: number,
    timeframe: string,
    agentId: number,
    reasoning: string
  ): string {
    const prediction: Prediction = {
      id: this.generatePredictionId(),
      asset,
      prediction_type: predictionType,
      predicted_value: predictedValue,
      current_value: this.getCurrentPrice(asset),
      confidence,
      timeframe,
      target_date: this.calculateTargetDate(timeframe),
      ai_agent_id: agentId,
      reasoning,
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    this.predictions.set(prediction.id, prediction);
    this.learningMetrics.total_predictions++;
    
    return prediction.id;
  }

  public verifyPrediction(predictionId: string, actualValue: number): boolean {
    const prediction = this.predictions.get(predictionId);
    if (!prediction || prediction.status !== 'pending') {
      return false;
    }

    prediction.actual_value = actualValue;
    prediction.verified_at = new Date().toISOString();
    
    // Calculate accuracy based on prediction type
    const accuracy = this.calculateAccuracy(prediction, actualValue);
    prediction.accuracy = accuracy;

    // Determine if prediction was successful
    const isSuccessful = accuracy >= 70; // 70% threshold for success
    prediction.status = isSuccessful ? 'confirmed' : 'failed';

    // Update learning metrics
    if (isSuccessful) {
      this.learningMetrics.confirmed_predictions++;
    } else {
      this.learningMetrics.failed_predictions++;
    }

    this.updateLearningMetrics();
    this.analyzeForInsights(prediction);

    return isSuccessful;
  }

  private calculateAccuracy(prediction: Prediction, actualValue: number): number {
    switch (prediction.prediction_type) {
      case 'price':
        const priceDiff = Math.abs(prediction.predicted_value - actualValue);
        const priceAccuracy = Math.max(0, 100 - (priceDiff / actualValue) * 100);
        return Math.round(priceAccuracy * 100) / 100;
      
      case 'trend':
        // For trend predictions: 1 = bullish, -1 = bearish, 0 = neutral
        const actualTrend = actualValue > prediction.current_value ? 1 : 
                           actualValue < prediction.current_value ? -1 : 0;
        return prediction.predicted_value === actualTrend ? 100 : 0;
      
      default:
        return 50; // Default for unknown types
    }
  }

  private updateLearningMetrics(): void {
    const total = this.learningMetrics.total_predictions;
    const confirmed = this.learningMetrics.confirmed_predictions;
    
    this.learningMetrics.overall_accuracy = total > 0 ? (confirmed / total) * 100 : 0;
    
    // Update accuracy by timeframe and agent
    this.updateAccuracyBreakdowns();
  }

  private updateAccuracyBreakdowns(): void {
    const timeframeStats: { [key: string]: { total: number, confirmed: number } } = {};
    const agentStats: { [key: number]: { total: number, confirmed: number } } = {};

    this.predictions.forEach(prediction => {
      if (prediction.status === 'confirmed' || prediction.status === 'failed') {
        // Timeframe stats
        if (!timeframeStats[prediction.timeframe]) {
          timeframeStats[prediction.timeframe] = { total: 0, confirmed: 0 };
        }
        timeframeStats[prediction.timeframe].total++;
        if (prediction.status === 'confirmed') {
          timeframeStats[prediction.timeframe].confirmed++;
        }

        // Agent stats
        if (!agentStats[prediction.ai_agent_id]) {
          agentStats[prediction.ai_agent_id] = { total: 0, confirmed: 0 };
        }
        agentStats[prediction.ai_agent_id].total++;
        if (prediction.status === 'confirmed') {
          agentStats[prediction.ai_agent_id].confirmed++;
        }
      }
    });

    // Calculate accuracy percentages
    Object.keys(timeframeStats).forEach(timeframe => {
      const stats = timeframeStats[timeframe];
      this.learningMetrics.accuracy_by_timeframe[timeframe] = 
        stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0;
    });

    Object.keys(agentStats).forEach(agentIdStr => {
      const agentId = parseInt(agentIdStr);
      const stats = agentStats[agentId];
      this.learningMetrics.accuracy_by_agent[agentId] = 
        stats.total > 0 ? (stats.confirmed / stats.total) * 100 : 0;
    });
  }

  private analyzeForInsights(prediction: Prediction): void {
    // Analyze completed prediction for learning insights
    // This is a simplified version - in production, this would use ML algorithms
    
    if (prediction.accuracy && prediction.accuracy > 90) {
      // High accuracy prediction - analyze what made it successful
      const insight: LearningInsight = {
        id: this.generateInsightId(),
        insight_type: 'accuracy_improvement',
        description: `الگوی موفق در ${prediction.asset} با دقت ${prediction.accuracy}%`,
        confidence: prediction.accuracy,
        impact_assessment: 'الگوی قابل تکرار برای بهبود دقت',
        discovered_at: new Date().toISOString(),
        agent_id: prediction.ai_agent_id,
        applied: false
      };
      
      this.insights.push(insight);
    }
  }

  private calculateTargetDate(timeframe: string): string {
    const now = Date.now();
    const timeframeMs = this.timeframeToMs(timeframe);
    return new Date(now + timeframeMs).toISOString();
  }

  private timeframeToMs(timeframe: string): number {
    const unit = timeframe.slice(-1);
    const value = parseInt(timeframe.slice(0, -1));
    
    switch (unit) {
      case 'h': return value * 60 * 60 * 1000;
      case 'd': return value * 24 * 60 * 60 * 1000;
      case 'w': return value * 7 * 24 * 60 * 60 * 1000;
      default: return 60 * 60 * 1000; // Default to 1 hour
    }
  }

  private getCurrentPrice(asset: string): number {
    const mockPrices: { [key: string]: number } = {
      'BTC': 43200,
      'ETH': 2820,
      'SOL': 156.43,
      'ADA': 0.45,
      'BNB': 600,
      'DOT': 8.45
    };
    return mockPrices[asset] || 100;
  }

  private generatePredictionId(): string {
    return `PRED_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateInsightId(): string {
    return `INSIGHT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  // Public methods for API
  public getAllPredictions(): Prediction[] {
    return Array.from(this.predictions.values()).sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  public getPendingPredictions(): Prediction[] {
    return this.getAllPredictions().filter(p => p.status === 'pending');
  }

  public getRecentPredictions(limit: number = 10): Prediction[] {
    return this.getAllPredictions().slice(0, limit);
  }

  public getLearningMetrics(): LearningMetrics {
    return { ...this.learningMetrics };
  }

  public getInsights(): LearningInsight[] {
    return [...this.insights].sort((a, b) => 
      new Date(b.discovered_at).getTime() - new Date(a.discovered_at).getTime()
    );
  }

  public applyInsight(insightId: string): boolean {
    const insight = this.insights.find(i => i.id === insightId);
    if (insight && !insight.applied) {
      insight.applied = true;
      return true;
    }
    return false;
  }

  public addPrediction(predictionData: Partial<Prediction>): string {
    const prediction: Prediction = {
      id: this.generatePredictionId(),
      asset: predictionData.asset || 'BTC',
      prediction_type: predictionData.prediction_type || 'price',
      predicted_value: predictionData.predicted_value || 0,
      current_value: predictionData.current_value || this.getCurrentPrice(predictionData.asset || 'BTC'),
      confidence: predictionData.confidence || 50,
      timeframe: predictionData.timeframe || '1h',
      target_date: this.calculateTargetDate(predictionData.timeframe || '1h'),
      ai_agent_id: predictionData.ai_agent_id || 1,
      reasoning: predictionData.reasoning || 'پیش‌بینی خودکار',
      created_at: new Date().toISOString(),
      status: 'pending'
    };

    this.predictions.set(prediction.id, prediction);
    this.learningMetrics.total_predictions++;
    
    return prediction.id;
  }
}