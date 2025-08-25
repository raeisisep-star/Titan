// TITAN News Analysis and Economic Calendar System

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  source: string;
  url: string;
  published_at: string;
  analyzed_at: string;
  relevance_score: number; // 0-100
  impact_score: number; // -100 to +100 (negative = bearish, positive = bullish)
  credibility_score: number; // 0-100
  market_impact: 'positive' | 'negative' | 'neutral';
  affected_assets: string[];
  categories: string[];
  verified: boolean;
  ai_analysis: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    confidence: number;
    key_points: string[];
    prediction: string;
    timeframe_impact: string;
  };
}

export interface EconomicEvent {
  id: string;
  name: string;
  description: string;
  country: string;
  importance: 'low' | 'medium' | 'high';
  scheduled_date: string;
  actual_value?: number;
  forecast_value?: number;
  previous_value?: number;
  unit: string;
  market_impact: 'positive' | 'negative' | 'neutral';
  affected_markets: string[];
  analysis: {
    expected_impact: string;
    trading_recommendations: string[];
    risk_assessment: string;
  };
}

export interface MarketSentiment {
  overall_sentiment: 'extreme_fear' | 'fear' | 'neutral' | 'greed' | 'extreme_greed';
  fear_greed_index: number; // 0-100
  sentiment_sources: {
    news: number;
    social_media: number;
    market_momentum: number;
    volatility: number;
    market_breadth: number;
  };
  updated_at: string;
}

export class NewsAnalysisSystem {
  private static instance: NewsAnalysisSystem;
  private newsItems: Map<string, NewsItem> = new Map();
  private economicEvents: Map<string, EconomicEvent> = new Map();
  private marketSentiment: MarketSentiment;

  private constructor() {
    this.marketSentiment = {
      overall_sentiment: 'greed',
      fear_greed_index: 72,
      sentiment_sources: {
        news: 68,
        social_media: 75,
        market_momentum: 80,
        volatility: 65,
        market_breadth: 72
      },
      updated_at: new Date().toISOString()
    };
    
    this.initializeWithMockData();
  }

  public static getInstance(): NewsAnalysisSystem {
    if (!NewsAnalysisSystem.instance) {
      NewsAnalysisSystem.instance = new NewsAnalysisSystem();
    }
    return NewsAnalysisSystem.instance;
  }

  private initializeWithMockData(): void {
    // Mock news items
    const mockNews: NewsItem[] = [
      {
        id: this.generateNewsId(),
        title: 'بیت کوین مقاومت کلیدی 44000 دلار را شکست',
        summary: 'قیمت بیت کوین پس از شکست مقاومت قوی 44000 دلار، به سمت اهداف بالاتر حرکت کرده است',
        content: 'تحلیل تکنیکال نشان می‌دهد که شکست این سطح مقاومت می‌تواند راه را برای صعود به 46000 دلار هموار کند...',
        source: 'CoinDesk',
        url: 'https://coindesk.com/bitcoin-breaks-44k',
        published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        analyzed_at: new Date().toISOString(),
        relevance_score: 95,
        impact_score: 78,
        credibility_score: 92,
        market_impact: 'positive',
        affected_assets: ['BTC', 'ETH', 'CRYPTO_MARKET'],
        categories: ['تحلیل تکنیکال', 'بیت کوین', 'رمزارز'],
        verified: true,
        ai_analysis: {
          sentiment: 'bullish',
          confidence: 88,
          key_points: [
            'شکست مقاومت کلیدی 44000 دلار',
            'حجم معاملات بالا',
            'روند صعودی تأیید شده'
          ],
          prediction: 'احتمال صعود به 46000 دلار در 48 ساعت آینده',
          timeframe_impact: 'کوتاه تا متوسط مدت'
        }
      },
      {
        id: this.generateNewsId(),
        title: 'تصمیم فدرال رزرو تأثیر مثبت بر بازار کریپتو گذاشت',
        summary: 'نرخ بهره ثابت و بیانیه مثبت فدرال رزرو منجر به جریان سرمایه به دارایی‌های ریسکی شد',
        content: 'فدرال رزرو آمریکا نرخ بهره را در محدوده 5.25-5.50 درصد ثابت نگه داشت و اشاره کرد که...',
        source: 'Reuters',
        url: 'https://reuters.com/fed-decision-crypto',
        published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        analyzed_at: new Date().toISOString(),
        relevance_score: 87,
        impact_score: 65,
        credibility_score: 95,
        market_impact: 'positive',
        affected_assets: ['BTC', 'ETH', 'STOCK_MARKET', 'CRYPTO_MARKET'],
        categories: ['اقتصاد کلان', 'فدرال رزرو', 'سیاست پولی'],
        verified: true,
        ai_analysis: {
          sentiment: 'bullish',
          confidence: 82,
          key_points: [
            'نرخ بهره ثابت ماند',
            'بیانیه مثبت درباره اقتصاد',
            'جریان سرمایه به دارایی‌های ریسکی'
          ],
          prediction: 'تأثیر مثبت بر کل بازار کریپتو تا چند روز آینده',
          timeframe_impact: 'متوسط مدت'
        }
      },
      {
        id: this.generateNewsId(),
        title: 'اتریوم آپگرید جدید را با موفقیت اجرا کرد',
        summary: 'به‌روزرسانی شبکه اتریوم کارایی تراکنش‌ها را بهبود داده و کاهش کارمزد را به همراه داشته',
        content: 'آپگرید جدید اتریوم که تحت عنوان Dencun شناخته می‌شود...',
        source: 'Ethereum Foundation',
        url: 'https://ethereum.org/upgrade',
        published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        analyzed_at: new Date().toISOString(),
        relevance_score: 91,
        impact_score: 73,
        credibility_score: 98,
        market_impact: 'positive',
        affected_assets: ['ETH', 'DeFi_TOKENS'],
        categories: ['اتریوم', 'آپگرید شبکه', 'فناوری بلاک‌چین'],
        verified: true,
        ai_analysis: {
          sentiment: 'bullish',
          confidence: 89,
          key_points: [
            'بهبود کارایی شبکه',
            'کاهش کارمزد تراکنش',
            'تقویت اکوسیستم DeFi'
          ],
          prediction: 'تأثیر مثبت بر قیمت ETH و توکن‌های DeFi',
          timeframe_impact: 'متوسط تا بلندمدت'
        }
      }
    ];

    mockNews.forEach(news => {
      this.newsItems.set(news.id, news);
    });

    // Mock economic events
    const mockEvents: EconomicEvent[] = [
      {
        id: this.generateEventId(),
        name: 'نرخ تورم آمریکا (CPI)',
        description: 'اعلام شاخص قیمت مصرف‌کننده ماهانه آمریکا',
        country: 'USA',
        importance: 'high',
        scheduled_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        forecast_value: 3.2,
        previous_value: 3.4,
        unit: 'درصد',
        market_impact: 'neutral',
        affected_markets: ['CRYPTO', 'STOCKS', 'FOREX', 'COMMODITIES'],
        analysis: {
          expected_impact: 'اگر تورم کمتر از انتظار باشد، تأثیر مثبت بر بازارهای ریسکی',
          trading_recommendations: [
            'آماده‌باش برای نوسانات بالا در ساعت اعلام',
            'در صورت کاهش تورم، خرید دارایی‌های ریسکی',
            'مدیریت ریسک با stop loss مناسب'
          ],
          risk_assessment: 'ریسک بالا - احتمال نوسانات شدید'
        }
      },
      {
        id: this.generateEventId(),
        name: 'تصمیم نرخ بهره بانک مرکزی اروپا',
        description: 'اعلام تصمیم نرخ بهره و سیاست پولی ECB',
        country: 'EU',
        importance: 'high',
        scheduled_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        forecast_value: 4.0,
        previous_value: 4.0,
        unit: 'درصد',
        market_impact: 'neutral',
        affected_markets: ['FOREX', 'STOCKS', 'CRYPTO'],
        analysis: {
          expected_impact: 'حفظ نرخ بهره احتمالاً تأثیر خنثی خواهد داشت',
          trading_recommendations: [
            'توجه به بیانیه رئیس ECB',
            'معاملات محتاطانه در جفت ارزهای EUR',
            'نظارت بر واکنش بازار کریپتو'
          ],
          risk_assessment: 'ریسک متوسط'
        }
      }
    ];

    mockEvents.forEach(event => {
      this.economicEvents.set(event.id, event);
    });
  }

  public analyzeNews(title: string, content: string, source: string): NewsItem {
    const newsItem: NewsItem = {
      id: this.generateNewsId(),
      title,
      summary: this.generateSummary(content),
      content,
      source,
      url: '',
      published_at: new Date().toISOString(),
      analyzed_at: new Date().toISOString(),
      relevance_score: this.calculateRelevanceScore(title, content),
      impact_score: this.calculateImpactScore(content),
      credibility_score: this.calculateCredibilityScore(source),
      market_impact: this.determineMarketImpact(content),
      affected_assets: this.identifyAffectedAssets(content),
      categories: this.categorizeNews(title, content),
      verified: this.verifyNews(source),
      ai_analysis: this.performAIAnalysis(content)
    };

    this.newsItems.set(newsItem.id, newsItem);
    this.updateMarketSentiment();
    
    return newsItem;
  }

  private generateSummary(content: string): string {
    // Simplified summary generation - in production use NLP
    const sentences = content.split('.').slice(0, 2);
    return sentences.join('.') + '.';
  }

  private calculateRelevanceScore(title: string, content: string): number {
    const keywords = ['bitcoin', 'ethereum', 'crypto', 'fed', 'inflation', 'btc', 'eth'];
    const text = (title + ' ' + content).toLowerCase();
    
    let score = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) score += 10;
    });
    
    return Math.min(100, score + Math.random() * 20 + 60);
  }

  private calculateImpactScore(content: string): number {
    const positiveWords = ['bull', 'rise', 'increase', 'positive', 'growth', 'adoption'];
    const negativeWords = ['bear', 'fall', 'decrease', 'negative', 'crash', 'ban'];
    
    const text = content.toLowerCase();
    let score = 0;
    
    positiveWords.forEach(word => {
      if (text.includes(word)) score += 15;
    });
    
    negativeWords.forEach(word => {
      if (text.includes(word)) score -= 15;
    });
    
    return Math.max(-100, Math.min(100, score + (Math.random() - 0.5) * 40));
  }

  private calculateCredibilityScore(source: string): number {
    const trustedSources = ['reuters', 'coindesk', 'cointelegraph', 'bloomberg', 'yahoo'];
    const lowerSource = source.toLowerCase();
    
    if (trustedSources.some(trusted => lowerSource.includes(trusted))) {
      return 90 + Math.random() * 10;
    }
    
    return 60 + Math.random() * 30;
  }

  private determineMarketImpact(content: string): 'positive' | 'negative' | 'neutral' {
    const impactScore = this.calculateImpactScore(content);
    
    if (impactScore > 20) return 'positive';
    if (impactScore < -20) return 'negative';
    return 'neutral';
  }

  private identifyAffectedAssets(content: string): string[] {
    const assets = [];
    const text = content.toLowerCase();
    
    if (text.includes('bitcoin') || text.includes('btc')) assets.push('BTC');
    if (text.includes('ethereum') || text.includes('eth')) assets.push('ETH');
    if (text.includes('crypto') || text.includes('cryptocurrency')) assets.push('CRYPTO_MARKET');
    if (text.includes('stock') || text.includes('equity')) assets.push('STOCK_MARKET');
    
    return assets.length > 0 ? assets : ['CRYPTO_MARKET'];
  }

  private categorizeNews(title: string, content: string): string[] {
    const categories = [];
    const text = (title + ' ' + content).toLowerCase();
    
    if (text.includes('technical') || text.includes('resistance') || text.includes('support')) {
      categories.push('تحلیل تکنیکال');
    }
    if (text.includes('fed') || text.includes('inflation') || text.includes('interest')) {
      categories.push('اقتصاد کلان');
    }
    if (text.includes('bitcoin') || text.includes('btc')) {
      categories.push('بیت کوین');
    }
    if (text.includes('ethereum') || text.includes('eth')) {
      categories.push('اتریوم');
    }
    
    return categories.length > 0 ? categories : ['عمومی'];
  }

  private verifyNews(source: string): boolean {
    const trustedSources = ['reuters', 'coindesk', 'bloomberg', 'yahoo', 'ethereum foundation'];
    return trustedSources.some(trusted => source.toLowerCase().includes(trusted));
  }

  private performAIAnalysis(content: string): NewsItem['ai_analysis'] {
    const impactScore = this.calculateImpactScore(content);
    
    return {
      sentiment: impactScore > 10 ? 'bullish' : impactScore < -10 ? 'bearish' : 'neutral',
      confidence: 70 + Math.random() * 25,
      key_points: this.extractKeyPoints(content),
      prediction: this.generatePrediction(content, impactScore),
      timeframe_impact: this.determineTimeframeImpact(content)
    };
  }

  private extractKeyPoints(content: string): string[] {
    // Simplified key point extraction
    const sentences = content.split('.').filter(s => s.length > 20);
    return sentences.slice(0, 3);
  }

  private generatePrediction(content: string, impactScore: number): string {
    if (impactScore > 20) {
      return 'تأثیر مثبت بر قیمت‌ها انتظار می‌رود';
    } else if (impactScore < -20) {
      return 'احتمال کاهش قیمت‌ها وجود دارد';
    }
    return 'تأثیر خنثی بر بازار';
  }

  private determineTimeframeImpact(content: string): string {
    if (content.toLowerCase().includes('immediate') || content.toLowerCase().includes('now')) {
      return 'فوری';
    } else if (content.toLowerCase().includes('week') || content.toLowerCase().includes('days')) {
      return 'کوتاه مدت';
    } else if (content.toLowerCase().includes('month')) {
      return 'متوسط مدت';
    }
    return 'کوتاه تا متوسط مدت';
  }

  private updateMarketSentiment(): void {
    // Update market sentiment based on recent news
    const recentNews = this.getRecentNews(24); // Last 24 hours
    const avgImpact = recentNews.reduce((sum, news) => sum + news.impact_score, 0) / recentNews.length;
    
    // Update fear/greed index
    const newIndex = Math.max(0, Math.min(100, 50 + avgImpact * 0.5));
    this.marketSentiment.fear_greed_index = Math.round(newIndex);
    
    // Determine overall sentiment
    if (newIndex >= 80) this.marketSentiment.overall_sentiment = 'extreme_greed';
    else if (newIndex >= 60) this.marketSentiment.overall_sentiment = 'greed';
    else if (newIndex >= 40) this.marketSentiment.overall_sentiment = 'neutral';
    else if (newIndex >= 20) this.marketSentiment.overall_sentiment = 'fear';
    else this.marketSentiment.overall_sentiment = 'extreme_fear';
    
    this.marketSentiment.updated_at = new Date().toISOString();
  }

  private generateNewsId(): string {
    return `NEWS_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  private generateEventId(): string {
    return `EVENT_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  }

  // Public API methods
  public getAllNews(): NewsItem[] {
    return Array.from(this.newsItems.values()).sort((a, b) => 
      new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
    );
  }

  public getRecentNews(hours: number = 24): NewsItem[] {
    const cutoff = Date.now() - hours * 60 * 60 * 1000;
    return this.getAllNews().filter(news => 
      new Date(news.published_at).getTime() > cutoff
    );
  }

  public getHighImpactNews(): NewsItem[] {
    return this.getAllNews().filter(news => 
      Math.abs(news.impact_score) > 50 && news.relevance_score > 80
    );
  }

  public getUpcomingEvents(): EconomicEvent[] {
    const now = Date.now();
    return Array.from(this.economicEvents.values())
      .filter(event => new Date(event.scheduled_date).getTime() > now)
      .sort((a, b) => 
        new Date(a.scheduled_date).getTime() - new Date(b.scheduled_date).getTime()
      );
  }

  public getMarketSentiment(): MarketSentiment {
    return { ...this.marketSentiment };
  }

  public getNewsByCategory(category: string): NewsItem[] {
    return this.getAllNews().filter(news => 
      news.categories.includes(category)
    );
  }

  public getNewsImpactAnalysis() {
    const news = this.getAllNews();
    const positiveNews = news.filter(n => n.market_impact === 'positive').length;
    const negativeNews = news.filter(n => n.market_impact === 'negative').length;
    const neutralNews = news.filter(n => n.market_impact === 'neutral').length;
    
    return {
      total_news: news.length,
      positive_news: positiveNews,
      negative_news: negativeNews,
      neutral_news: neutralNews,
      sentiment_ratio: positiveNews / Math.max(1, negativeNews),
      average_impact: news.reduce((sum, n) => sum + n.impact_score, 0) / news.length,
      average_relevance: news.reduce((sum, n) => sum + n.relevance_score, 0) / news.length
    };
  }

  public addNews(newsData: {
    title: string;
    content: string;
    source: string;
    category?: string;
    url?: string;
  }): NewsItem {
    const newsItem: NewsItem = {
      id: this.generateNewsId(),
      title: newsData.title,
      summary: newsData.content.length > 200 ? newsData.content.substring(0, 200) + '...' : newsData.content,
      content: newsData.content,
      source: newsData.source,
      url: newsData.url || '',
      published_at: new Date().toISOString(),
      analyzed_at: new Date().toISOString(),
      relevance_score: Math.floor(Math.random() * 30) + 70, // 70-100
      impact_score: Math.floor(Math.random() * 60) - 30, // -30 to +30
      credibility_score: Math.floor(Math.random() * 20) + 80, // 80-100
      market_impact: Math.random() > 0.5 ? 'positive' : Math.random() > 0.5 ? 'negative' : 'neutral',
      affected_assets: ['BTC', 'ETH'],
      categories: [newsData.category || 'general', 'market'],
      verified: true,
      ai_analysis: {
        sentiment: Math.random() > 0.5 ? 'bullish' : Math.random() > 0.5 ? 'bearish' : 'neutral',
        confidence: Math.floor(Math.random() * 30) + 70,
        key_points: ['تحلیل خودکار', 'بررسی بازار'],
        prediction: 'تأثیر کوتاه‌مدت بر بازار',
        timeframe_impact: '24 ساعت'
      }
    };

    this.newsItems.set(newsItem.id, newsItem);
    this.updateMarketSentiment();
    
    return newsItem;
  }
}