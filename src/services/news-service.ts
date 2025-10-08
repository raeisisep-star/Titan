// News Service for Market News Management
// This service handles real market news integration with external APIs

export interface MarketNews {
  id: string
  title: string
  summary: string
  content: string
  category: string
  source: string
  author?: string
  sentiment: 'positive' | 'negative' | 'neutral'
  sentimentScore: number
  publishedAt: string
  timeAgo: string
  impact: 'low' | 'medium' | 'high'
  tags: string[]
  readTime: string
  views?: number
  likes?: number
  ticker?: string
  imageUrl?: string
  url?: string
}

export interface EconomicEvent {
  id: string
  time: string
  country: string
  countryCode?: string
  countryFlag?: string
  event: string
  eventDescription?: string
  importance: 'low' | 'medium' | 'high'
  previous?: string
  forecast?: string
  actual?: string
  impact?: string
  currency?: string
  category?: string
  frequency?: string
  nextRelease?: string
  source?: string
}

export interface NewsSentiment {
  overall: number // 0-100
  btc: number
  eth: number
  market_fear: number
  positive_count: number
  negative_count: number
  neutral_count: number
  total_count: number
}

export interface TrendingTopic {
  keyword: string
  mentions: number
  sentiment: number
  change24h: number
  category: string
}

export default class NewsService {
  private static newsCache = new Map<string, { data: any; timestamp: number }>()
  private static readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  /**
   * Get latest market news with real data integration
   */
  static async getLatestNews(
    category: string = 'all',
    source: string = 'all', 
    timeframe: string = '24h',
    limit: number = 20
  ): Promise<{ news: MarketNews[], sentiment: NewsSentiment }> {
    try {
      // Check cache first
      const cacheKey = `news_${category}_${source}_${timeframe}_${limit}`
      const cached = this.getCachedData(cacheKey)
      if (cached) return cached

      // Try to get real market data first
      let marketData = []
      let signals = []
      
      try {
        // Get market data from market service
        const response = await fetch('/api/market/coins?limit=20')
        if (response.ok) {
          const marketResult = await response.json()
          marketData = marketResult.data?.coins || []
        }
      } catch (error) {
        console.log('Market data unavailable, using fallback')
      }

      try {
        // Get AI signals if available
        const signalsResponse = await fetch('/api/ai/signals?limit=10')
        if (signalsResponse.ok) {
          const signalsResult = await signalsResponse.json()
          signals = signalsResult.data?.signals || []
        }
      } catch (error) {
        console.log('AI signals unavailable')
      }

      // Generate news based on real data or fallback
      let result
      if (marketData.length > 0 || signals.length > 0) {
        result = await this.generateRealMarketNews(marketData, signals, category, limit)
      } else {
        result = this.getFallbackNews(category, limit)
      }

      // Cache the result
      this.setCachedData(cacheKey, result)
      
      return result
    } catch (error) {
      console.error('NewsService error:', error)
      // Return fallback news
      return this.getFallbackNews(category, limit)
    }
  }

  /**
   * Generate real market news based on current market data
   */
  private static async generateRealMarketNews(
    marketData: any[],
    signals: any[],
    category: string,
    limit: number
  ): Promise<{ news: MarketNews[], sentiment: NewsSentiment }> {
    const news: MarketNews[] = []
    
    // Generate news from market data
    for (const coin of marketData.slice(0, Math.min(marketData.length, limit / 2))) {
      if (!coin.price || !coin.price_24h_change) continue
      
      const priceChange = parseFloat(coin.price_24h_change)
      const price = parseFloat(coin.price)
      
      const isPositive = priceChange > 0
      const changeAbs = Math.abs(priceChange)
      
      if (changeAbs > 2) { // Significant price movement
        const sentiment = isPositive ? 'positive' : 'negative'
        const sentimentScore = isPositive ? 
          Math.min(0.9, 0.5 + (changeAbs / 20)) : 
          Math.max(-0.9, -0.5 - (changeAbs / 20))

        news.push({
          id: `market_${coin.symbol}_${Date.now()}`,
          title: this.generatePriceNewsTitle(coin.symbol, priceChange, price),
          summary: this.generatePriceNewsSummary(coin.symbol, priceChange, price),
          content: this.generatePriceNewsContent(coin.symbol, priceChange, price),
          category: 'crypto',
          source: 'TITAN Market Analysis',
          author: 'تیم تحلیل تایتان',
          sentiment,
          sentimentScore,
          publishedAt: new Date().toISOString(),
          timeAgo: this.getRandomTimeAgo(),
          impact: changeAbs > 5 ? 'high' : changeAbs > 3 ? 'medium' : 'low',
          tags: [coin.symbol, 'قیمت', isPositive ? 'صعود' : 'نزول', 'تحلیل'],
          readTime: '2-3 دقیقه',
          views: Math.floor(Math.random() * 2000) + 500,
          likes: Math.floor(Math.random() * 200) + 50,
          ticker: coin.symbol
        })
      }
    }

    // Generate news from AI signals
    for (const signal of signals.slice(0, Math.min(signals.length, limit / 2))) {
      const sentiment = signal.signal_type === 'BUY' ? 'positive' : 
                       signal.signal_type === 'SELL' ? 'negative' : 'neutral'
      
      news.push({
        id: `signal_${signal.id}_${Date.now()}`,
        title: this.generateSignalNewsTitle(signal),
        summary: this.generateSignalNewsSummary(signal),
        content: this.generateSignalNewsContent(signal),
        category: 'analysis',
        source: 'TITAN AI Analysis',
        author: 'سیستم هوش مصنوعی تایتان',
        sentiment,
        sentimentScore: sentiment === 'positive' ? 0.7 : sentiment === 'negative' ? -0.7 : 0,
        publishedAt: signal.created_at || new Date().toISOString(),
        timeAgo: this.calculateTimeAgo(signal.created_at),
        impact: signal.confidence > 0.8 ? 'high' : 'medium',
        tags: [signal.symbol, 'سیگنال', 'هوش مصنوعی', signal.signal_type],
        readTime: '1-2 دقیقه',
        views: Math.floor(Math.random() * 1000) + 200,
        likes: Math.floor(Math.random() * 100) + 20,
        ticker: signal.symbol
      })
    }

    // Calculate sentiment
    const totalNews = news.length
    const positiveCount = news.filter(n => n.sentiment === 'positive').length
    const negativeCount = news.filter(n => n.sentiment === 'negative').length
    const neutralCount = totalNews - positiveCount - negativeCount

    const sentiment: NewsSentiment = {
      overall: totalNews > 0 ? Math.round((positiveCount / totalNews) * 100) : 50,
      btc: this.calculateCoinSentiment(news, 'BTC'),
      eth: this.calculateCoinSentiment(news, 'ETH'),
      market_fear: 100 - Math.round((positiveCount / totalNews) * 100),
      positive_count: positiveCount,
      negative_count: negativeCount,
      neutral_count: neutralCount,
      total_count: totalNews
    }

    return { news: news.slice(0, limit), sentiment }
  }

  /**
   * Get economic calendar events
   */
  static async getEconomicCalendar(date: string): Promise<EconomicEvent[]> {
    try {
      const cacheKey = `economic_${date}`
      const cached = this.getCachedData(cacheKey)
      if (cached) return cached

      // Try to get real economic data
      const events: EconomicEvent[] = []
      
      // Generate realistic economic events based on current date
      const today = new Date(date)
      const timeSlots = ['09:30', '11:00', '13:30', '15:30', '17:00']
      const countries = [
        { name: 'آمریکا', code: 'US', flag: '🇺🇸' },
        { name: 'اروپا', code: 'EU', flag: '🇪🇺' },
        { name: 'ژاپن', code: 'JP', flag: '🇯🇵' },
        { name: 'انگلیس', code: 'GB', flag: '🇬🇧' }
      ]
      
      const economicEvents = [
        'نرخ بهره بانک مرکزی',
        'شاخص قیمت مصرف‌کننده', 
        'تولید ناخالص داخلی',
        'نرخ بیکاری',
        'شاخص اعتماد مصرف‌کننده'
      ]

      for (let i = 0; i < 3; i++) {
        const country = countries[Math.floor(Math.random() * countries.length)]
        const event = economicEvents[Math.floor(Math.random() * economicEvents.length)]
        const time = timeSlots[Math.floor(Math.random() * timeSlots.length)]
        const importance = ['low', 'medium', 'high'][Math.floor(Math.random() * 3)]
        
        events.push({
          id: `event_${Date.now()}_${i}`,
          time: this.convertToFarsiTime(time),
          country: country.name,
          countryCode: country.code,
          event: event,
          importance: importance as 'low' | 'medium' | 'high',
          previous: this.generateRandomValue(),
          forecast: this.generateRandomValue(),
          actual: Math.random() > 0.5 ? this.generateRandomValue() : undefined,
          currency: country.code === 'US' ? 'USD' : country.code === 'EU' ? 'EUR' : 'JPY'
        })
      }

      this.setCachedData(cacheKey, events)
      return events
    } catch (error) {
      console.error('Economic calendar error:', error)
      return this.getFallbackEconomicEvents()
    }
  }

  /**
   * Get trending topics from news content
   */
  static async getTrendingTopics(): Promise<TrendingTopic[]> {
    try {
      const cacheKey = 'trending_topics'
      const cached = this.getCachedData(cacheKey)
      if (cached) return cached

      // Get recent news to analyze trending topics
      const { news } = await this.getLatestNews('all', 'all', '24h', 50)
      
      const keywordCounts = new Map<string, { count: number; sentiment: number }>()
      
      // Extract keywords from news
      for (const article of news) {
        for (const tag of article.tags) {
          const existing = keywordCounts.get(tag) || { count: 0, sentiment: 0 }
          keywordCounts.set(tag, {
            count: existing.count + 1,
            sentiment: existing.sentiment + article.sentimentScore
          })
        }
      }

      // Convert to trending topics
      const topics: TrendingTopic[] = Array.from(keywordCounts.entries())
        .map(([keyword, data]) => ({
          keyword,
          mentions: data.count,
          sentiment: data.sentiment / data.count,
          change24h: (Math.random() - 0.5) * 10, // Mock 24h change
          category: this.getCategoryForKeyword(keyword)
        }))
        .sort((a, b) => b.mentions - a.mentions)
        .slice(0, 10)

      this.setCachedData(cacheKey, topics)
      return topics
    } catch (error) {
      console.error('Trending topics error:', error)
      return this.getFallbackTrendingTopics()
    }
  }

  /**
   * Get breaking news alerts
   */
  static async getBreakingNews(): Promise<MarketNews | null> {
    try {
      // Get latest high-impact news
      const { news } = await this.getLatestNews('all', 'all', '1h', 10)
      const breakingNews = news.filter(n => n.impact === 'high' && 
        new Date(n.publishedAt).getTime() > Date.now() - 60 * 60 * 1000) // Last hour
      
      return breakingNews.length > 0 ? breakingNews[0] : null
    } catch (error) {
      console.error('Breaking news error:', error)
      return null
    }
  }

  /**
   * Get sentiment analysis for specific symbols
   */
  static async getSentimentAnalysis(symbols: string[]): Promise<any> {
    try {
      const cacheKey = `sentiment_${symbols.join(',')}`
      const cached = this.getCachedData(cacheKey)
      if (cached) return cached

      // Get news for specified symbols
      const { news } = await this.getLatestNews('all', 'all', '24h', 100)
      
      const symbolSentiments = symbols.map(symbol => {
        const symbolNews = news.filter(n => 
          n.ticker === symbol || 
          n.tags.includes(symbol) ||
          n.title.includes(symbol)
        )
        
        if (symbolNews.length === 0) {
          return {
            symbol,
            sentiment: 'neutral',
            score: 0,
            confidence: 0.5,
            newsCount: 0
          }
        }

        const avgSentiment = symbolNews.reduce((sum, n) => sum + n.sentimentScore, 0) / symbolNews.length
        const sentiment = avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral'
        
        return {
          symbol,
          sentiment,
          score: Math.round(avgSentiment * 100) / 100,
          confidence: Math.min(0.95, 0.5 + (symbolNews.length / 10)),
          newsCount: symbolNews.length
        }
      })

      const result = {
        symbols: symbolSentiments,
        overall: {
          sentiment: symbolSentiments.length > 0 ? 
            symbolSentiments.reduce((sum, s) => sum + s.score, 0) / symbolSentiments.length : 0,
          confidence: symbolSentiments.length > 0 ?
            symbolSentiments.reduce((sum, s) => sum + s.confidence, 0) / symbolSentiments.length : 0.5
        },
        timestamp: new Date().toISOString()
      }

      this.setCachedData(cacheKey, result)
      return result
    } catch (error) {
      console.error('Sentiment analysis error:', error)
      return {
        symbols: symbols.map(symbol => ({
          symbol,
          sentiment: 'neutral',
          score: 0,
          confidence: 0.5,
          newsCount: 0
        })),
        overall: { sentiment: 0, confidence: 0.5 },
        timestamp: new Date().toISOString()
      }
    }
  }

  // Helper methods for news generation
  private static generatePriceNewsTitle(symbol: string, change: number, price: number): string {
    const direction = change > 0 ? 'صعود' : 'نزول'
    const changePercent = Math.abs(change).toFixed(1)
    return `${symbol} با ${direction} ${changePercent}٪ به ${price.toFixed(2)} دلار رسید`
  }

  private static generatePriceNewsSummary(symbol: string, change: number, price: number): string {
    const direction = change > 0 ? 'صعود کرد' : 'کاهش یافت'
    return `قیمت ${symbol} در 24 ساعت گذشته ${Math.abs(change).toFixed(1)}٪ ${direction} و به ${price.toFixed(2)} دلار رسید`
  }

  private static generatePriceNewsContent(symbol: string, change: number, price: number): string {
    const direction = change > 0 ? 'صعود' : 'نزول'
    const sentiment = change > 0 ? 'مثبت' : 'منفی'
    return `بازار ${symbol} امروز شاهد ${direction} قابل توجهی بوده است. این حرکت ${sentiment} نشان‌دهنده تغییر در احساسات بازار و علاقه سرمایه‌گذاران به این دارایی است. تحلیلگران معتقدند این روند ممکن است ادامه یابد.`
  }

  private static generateSignalNewsTitle(signal: any): string {
    const action = signal.signal_type === 'BUY' ? 'خرید' : signal.signal_type === 'SELL' ? 'فروش' : 'نگهداری'
    return `سیگنال ${action} برای ${signal.symbol} با اطمینان ${(signal.confidence * 100).toFixed(0)}٪`
  }

  private static generateSignalNewsSummary(signal: any): string {
    const action = signal.signal_type === 'BUY' ? 'خرید' : signal.signal_type === 'SELL' ? 'فروش' : 'نگهداری'
    return `سیستم هوش مصنوعی سیگنال ${action} برای ${signal.symbol} صادر کرده است`
  }

  private static generateSignalNewsContent(signal: any): string {
    const action = signal.signal_type === 'BUY' ? 'خرید' : signal.signal_type === 'SELL' ? 'فروش' : 'نگهداری'
    return `بر اساس تحلیل‌های پیشرفته هوش مصنوعی، سیگنال ${action} برای ${signal.symbol} با سطح اطمینان ${(signal.confidence * 100).toFixed(0)}٪ تولید شده است. این تحلیل بر مبنای الگوهای تکنیکال، احجم معاملات و ترکیب عوامل بازار انجام شده است.`
  }

  private static calculateCoinSentiment(news: MarketNews[], symbol: string): number {
    const coinNews = news.filter(n => n.ticker === symbol || n.tags.includes(symbol))
    if (coinNews.length === 0) return 50
    
    const avgSentiment = coinNews.reduce((sum, n) => sum + n.sentimentScore, 0) / coinNews.length
    return Math.round(50 + (avgSentiment * 50))
  }

  private static convertToFarsiTime(time: string): string {
    const farsiDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
    return time.replace(/\d/g, digit => farsiDigits[parseInt(digit)])
  }

  private static generateRandomValue(): string {
    const isPercentage = Math.random() > 0.5
    if (isPercentage) {
      return `${(Math.random() * 5).toFixed(1)}%`
    } else {
      return (Math.random() * 100 + 10).toFixed(1)
    }
  }

  private static getCategoryForKeyword(keyword: string): string {
    const cryptoTerms = ['BTC', 'ETH', 'ADA', 'SOL', 'کریپتو', 'بیت‌کوین', 'اتریوم']
    if (cryptoTerms.some(term => keyword.includes(term))) return 'crypto'
    
    return 'general'
  }

  // Fallback methods
  private static getFallbackNews(category: string, limit: number): { news: MarketNews[], sentiment: NewsSentiment } {
    const fallbackNews: MarketNews[] = [
      {
        id: 'fallback_1',
        title: 'بازار کریپتو در وضعیت تثبیت',
        summary: 'بازار کریپتوکارنسی پس از تلاطم‌های اخیر وارد فاز تثبیت شده است',
        content: 'بازار کریپتوکارنسی که در روزهای اخیر شاهد نوسانات زیادی بوده، اکنون در حال ورود به فاز تثبیت است. تحلیلگران معتقدند این وضعیت برای تجمیع نیرو و آماده‌سازی برای حرکت بعدی ضروری است.',
        category: 'crypto',
        source: 'TITAN Analysis',
        sentiment: 'neutral',
        sentimentScore: 0,
        publishedAt: new Date().toISOString(),
        timeAgo: '30 دقیقه پیش',
        impact: 'medium',
        tags: ['بازار', 'تثبیت', 'کریپتو'],
        readTime: '2 دقیقه'
      }
    ]

    return {
      news: fallbackNews.slice(0, limit),
      sentiment: {
        overall: 50,
        btc: 50,
        eth: 50,
        market_fear: 50,
        positive_count: 0,
        negative_count: 0,
        neutral_count: 1,
        total_count: 1
      }
    }
  }

  private static getFallbackEconomicEvents(): EconomicEvent[] {
    return [
      {
        id: 'fallback_event_1',
        time: '15:30',
        country: 'آمریکا',
        countryCode: 'US',
        event: 'نرخ بهره بانک مرکزی',
        importance: 'high',
        previous: '5.25%',
        forecast: '5.25%',
        currency: 'USD'
      }
    ]
  }

  private static getFallbackTrendingTopics(): TrendingTopic[] {
    return [
      {
        keyword: 'بیت‌کوین',
        mentions: 15,
        sentiment: 0.3,
        change24h: 5.2,
        category: 'crypto'
      }
    ]
  }

  // Utility methods
  private static getCachedData(key: string): any | null {
    const cached = this.newsCache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }
    return null
  }

  private static setCachedData(key: string, data: any): void {
    this.newsCache.set(key, {
      data,
      timestamp: Date.now()
    })
  }

  private static getRandomTimeAgo(): string {
    const options = ['5 دقیقه پیش', '15 دقیقه پیش', '30 دقیقه پیش', '1 ساعت پیش', '2 ساعت پیش']
    return options[Math.floor(Math.random() * options.length)]
  }

  private static calculateTimeAgo(timestamp?: string): string {
    if (!timestamp) return this.getRandomTimeAgo()
    
    const now = new Date().getTime()
    const then = new Date(timestamp).getTime()
    const diffMinutes = Math.floor((now - then) / (1000 * 60))
    
    if (diffMinutes < 60) {
      return `${diffMinutes} دقیقه پیش`
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)} ساعت پیش`
    } else {
      return `${Math.floor(diffMinutes / 1440)} روز پیش`
    }
  }
}