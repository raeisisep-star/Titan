/**
 * Real Technical Indicators Calculations
 * Implements RSI, MACD, Bollinger Bands, and other indicators
 */

export interface CandleData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface RSIResult {
  value: number
  signal: 'oversold' | 'overbought' | 'neutral'
  timestamp: number
}

export interface MACDResult {
  macd: number
  signal: number
  histogram: number
  trend: 'bullish' | 'bearish' | 'neutral'
  timestamp: number
}

export interface BollingerBandsResult {
  upper: number
  middle: number
  lower: number
  bandwidth: number
  position: 'above' | 'below' | 'within'
  timestamp: number
}

export interface IndicatorSignal {
  indicator: string
  signal: 'buy' | 'sell' | 'hold'
  strength: 'weak' | 'moderate' | 'strong'
  confidence: number
  reason: string
}

export class TechnicalIndicators {
  /**
   * Calculate RSI (Relative Strength Index)
   */
  static calculateRSI(prices: number[], period = 14): RSIResult[] {
    if (prices.length < period + 1) {
      return []
    }

    const results: RSIResult[] = []
    const gains: number[] = []
    const losses: number[] = []

    // Calculate price changes
    for (let i = 1; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    // Calculate initial average gain and loss
    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period

    // Calculate RSI for each subsequent period
    for (let i = period; i < gains.length; i++) {
      // Smoothed averages (Wilder's smoothing)
      avgGain = ((avgGain * (period - 1)) + gains[i]) / period
      avgLoss = ((avgLoss * (period - 1)) + losses[i]) / period

      const rs = avgLoss === 0 ? 100 : avgGain / avgLoss
      const rsi = 100 - (100 / (1 + rs))

      let signal: 'oversold' | 'overbought' | 'neutral' = 'neutral'
      if (rsi <= 30) signal = 'oversold'
      else if (rsi >= 70) signal = 'overbought'

      results.push({
        value: Math.round(rsi * 100) / 100,
        signal,
        timestamp: Date.now() - ((gains.length - 1 - i) * 60 * 60 * 1000) // Simulate hourly timestamps
      })
    }

    return results
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   */
  static calculateMACD(prices: number[], fastPeriod = 12, slowPeriod = 26, signalPeriod = 9): MACDResult[] {
    if (prices.length < slowPeriod + signalPeriod) {
      return []
    }

    const fastEMA = this.calculateEMA(prices, fastPeriod)
    const slowEMA = this.calculateEMA(prices, slowPeriod)

    // Calculate MACD line
    const macdLine: number[] = []
    const startIndex = slowPeriod - 1

    for (let i = startIndex; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macdLine.push(fastEMA[i] - slowEMA[i])
    }

    // Calculate Signal line (EMA of MACD)
    const signalLine = this.calculateEMA(macdLine, signalPeriod)

    // Calculate results
    const results: MACDResult[] = []
    const signalStartIndex = signalPeriod - 1

    for (let i = signalStartIndex; i < signalLine.length; i++) {
      const macd = macdLine[i]
      const signal = signalLine[i]
      const histogram = macd - signal

      let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral'
      if (macd > signal && histogram > 0) trend = 'bullish'
      else if (macd < signal && histogram < 0) trend = 'bearish'

      results.push({
        macd: Math.round(macd * 10000) / 10000,
        signal: Math.round(signal * 10000) / 10000,
        histogram: Math.round(histogram * 10000) / 10000,
        trend,
        timestamp: Date.now() - ((signalLine.length - 1 - i) * 60 * 60 * 1000)
      })
    }

    return results
  }

  /**
   * Calculate Bollinger Bands
   */
  static calculateBollingerBands(prices: number[], period = 20, stdDev = 2): BollingerBandsResult[] {
    if (prices.length < period) {
      return []
    }

    const results: BollingerBandsResult[] = []

    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1)
      
      // Calculate Simple Moving Average (middle band)
      const sma = slice.reduce((sum, price) => sum + price, 0) / period
      
      // Calculate Standard Deviation
      const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
      const standardDeviation = Math.sqrt(variance)
      
      // Calculate bands
      const upper = sma + (stdDev * standardDeviation)
      const lower = sma - (stdDev * standardDeviation)
      const currentPrice = prices[i]
      
      // Determine position
      let position: 'above' | 'below' | 'within' = 'within'
      if (currentPrice > upper) position = 'above'
      else if (currentPrice < lower) position = 'below'
      
      // Calculate bandwidth (volatility measure)
      const bandwidth = ((upper - lower) / sma) * 100

      results.push({
        upper: Math.round(upper * 100) / 100,
        middle: Math.round(sma * 100) / 100,
        lower: Math.round(lower * 100) / 100,
        bandwidth: Math.round(bandwidth * 100) / 100,
        position,
        timestamp: Date.now() - ((prices.length - 1 - i) * 60 * 60 * 1000)
      })
    }

    return results
  }

  /**
   * Calculate Exponential Moving Average (EMA)
   */
  static calculateEMA(prices: number[], period: number): number[] {
    if (prices.length < period) {
      return []
    }

    const ema: number[] = []
    const multiplier = 2 / (period + 1)

    // First EMA value is SMA
    const firstSMA = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period
    ema.push(firstSMA)

    // Calculate subsequent EMA values
    for (let i = period; i < prices.length; i++) {
      const currentEMA = (prices[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier))
      ema.push(currentEMA)
    }

    return ema
  }

  /**
   * Calculate Simple Moving Average (SMA)
   */
  static calculateSMA(prices: number[], period: number): number[] {
    if (prices.length < period) {
      return []
    }

    const sma: number[] = []
    
    for (let i = period - 1; i < prices.length; i++) {
      const slice = prices.slice(i - period + 1, i + 1)
      const average = slice.reduce((sum, price) => sum + price, 0) / period
      sma.push(average)
    }

    return sma
  }

  /**
   * Calculate Stochastic Oscillator
   */
  static calculateStochastic(highs: number[], lows: number[], closes: number[], kPeriod = 14, dPeriod = 3): any[] {
    if (closes.length < kPeriod) {
      return []
    }

    const results: any[] = []

    for (let i = kPeriod - 1; i < closes.length; i++) {
      const highestHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1))
      const lowestLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1))
      
      const k = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100
      results.push(k)
    }

    // Calculate %D (SMA of %K)
    const dValues = this.calculateSMA(results, dPeriod)

    return results.map((k, index) => ({
      k: Math.round(k * 100) / 100,
      d: dValues[index] ? Math.round(dValues[index] * 100) / 100 : null,
      timestamp: Date.now() - ((results.length - 1 - index) * 60 * 60 * 1000)
    }))
  }

  /**
   * Generate comprehensive trading signals based on multiple indicators
   */
  static generateTradingSignals(candles: CandleData[]): IndicatorSignal[] {
    const signals: IndicatorSignal[] = []
    
    if (candles.length < 50) {
      return signals // Need sufficient data
    }

    const closes = candles.map(c => c.close)
    const highs = candles.map(c => c.high)
    const lows = candles.map(c => c.low)

    // RSI Signals
    const rsiResults = this.calculateRSI(closes)
    const latestRSI = rsiResults[rsiResults.length - 1]
    
    if (latestRSI) {
      if (latestRSI.signal === 'oversold') {
        signals.push({
          indicator: 'RSI',
          signal: 'buy',
          strength: latestRSI.value < 20 ? 'strong' : 'moderate',
          confidence: Math.min(95, 100 - latestRSI.value * 1.5),
          reason: `RSI در ناحیه فروش بیش از حد (${latestRSI.value})`
        })
      } else if (latestRSI.signal === 'overbought') {
        signals.push({
          indicator: 'RSI',
          signal: 'sell',
          strength: latestRSI.value > 80 ? 'strong' : 'moderate',
          confidence: Math.min(95, (latestRSI.value - 50) * 1.5),
          reason: `RSI در ناحیه خرید بیش از حد (${latestRSI.value})`
        })
      }
    }

    // MACD Signals
    const macdResults = this.calculateMACD(closes)
    const latestMACD = macdResults[macdResults.length - 1]
    const prevMACD = macdResults[macdResults.length - 2]
    
    if (latestMACD && prevMACD) {
      // MACD Crossover
      if (prevMACD.macd <= prevMACD.signal && latestMACD.macd > latestMACD.signal) {
        signals.push({
          indicator: 'MACD',
          signal: 'buy',
          strength: Math.abs(latestMACD.histogram) > 0.01 ? 'strong' : 'moderate',
          confidence: 75 + Math.min(20, Math.abs(latestMACD.histogram) * 100),
          reason: 'MACD خط سیگنال را از پایین قطع کرد (صعودی)'
        })
      } else if (prevMACD.macd >= prevMACD.signal && latestMACD.macd < latestMACD.signal) {
        signals.push({
          indicator: 'MACD',
          signal: 'sell',
          strength: Math.abs(latestMACD.histogram) > 0.01 ? 'strong' : 'moderate',
          confidence: 75 + Math.min(20, Math.abs(latestMACD.histogram) * 100),
          reason: 'MACD خط سیگنال را از بالا قطع کرد (نزولی)'
        })
      }
    }

    // Bollinger Bands Signals
    const bbResults = this.calculateBollingerBands(closes)
    const latestBB = bbResults[bbResults.length - 1]
    
    if (latestBB) {
      const currentPrice = closes[closes.length - 1]
      
      if (latestBB.position === 'below') {
        signals.push({
          indicator: 'Bollinger Bands',
          signal: 'buy',
          strength: currentPrice < latestBB.lower * 0.98 ? 'strong' : 'moderate',
          confidence: 70 + Math.min(25, ((latestBB.lower - currentPrice) / latestBB.lower) * 100),
          reason: 'قیمت زیر نوار پایینی بولینگر (بازگشت احتمالی)'
        })
      } else if (latestBB.position === 'above') {
        signals.push({
          indicator: 'Bollinger Bands',
          signal: 'sell',
          strength: currentPrice > latestBB.upper * 1.02 ? 'strong' : 'moderate',
          confidence: 70 + Math.min(25, ((currentPrice - latestBB.upper) / latestBB.upper) * 100),
          reason: 'قیمت بالای نوار بالایی بولینگر (تصحیح احتمالی)'
        })
      }
    }

    // Moving Average Signals
    const sma20 = this.calculateSMA(closes, 20)
    const sma50 = this.calculateSMA(closes, 50)
    
    if (sma20.length >= 2 && sma50.length >= 2) {
      const currentPrice = closes[closes.length - 1]
      const latestSMA20 = sma20[sma20.length - 1]
      const latestSMA50 = sma50[sma50.length - 1]
      const prevSMA20 = sma20[sma20.length - 2]
      const prevSMA50 = sma50[sma50.length - 2]
      
      // Golden Cross
      if (prevSMA20 <= prevSMA50 && latestSMA20 > latestSMA50) {
        signals.push({
          indicator: 'Moving Average',
          signal: 'buy',
          strength: 'strong',
          confidence: 85,
          reason: 'گلدن کراس: SMA20 از SMA50 عبور کرد (صعودی قوی)'
        })
      }
      // Death Cross
      else if (prevSMA20 >= prevSMA50 && latestSMA20 < latestSMA50) {
        signals.push({
          indicator: 'Moving Average',
          signal: 'sell',
          strength: 'strong',
          confidence: 85,
          reason: 'دث کراس: SMA20 زیر SMA50 رفت (نزولی قوی)'
        })
      }
      // Price above/below MA
      else if (currentPrice > latestSMA20 && latestSMA20 > latestSMA50) {
        signals.push({
          indicator: 'Moving Average',
          signal: 'buy',
          strength: 'moderate',
          confidence: 65,
          reason: 'قیمت بالای میانگین‌ها و روند صعودی'
        })
      } else if (currentPrice < latestSMA20 && latestSMA20 < latestSMA50) {
        signals.push({
          indicator: 'Moving Average',
          signal: 'sell',
          strength: 'moderate',
          confidence: 65,
          reason: 'قیمت زیر میانگین‌ها و روند نزولی'
        })
      }
    }

    return signals
  }

  /**
   * Get overall market sentiment based on all signals
   */
  static getOverallSentiment(signals: IndicatorSignal[]): {
    sentiment: 'bullish' | 'bearish' | 'neutral'
    confidence: number
    strongSignals: number
    recommendation: string
  } {
    const buySignals = signals.filter(s => s.signal === 'buy')
    const sellSignals = signals.filter(s => s.signal === 'sell')
    const holdSignals = signals.filter(s => s.signal === 'hold')
    
    const strongBuySignals = buySignals.filter(s => s.strength === 'strong')
    const strongSellSignals = sellSignals.filter(s => s.strength === 'strong')
    
    const buyScore = buySignals.reduce((sum, s) => {
      return sum + (s.strength === 'strong' ? 3 : s.strength === 'moderate' ? 2 : 1) * (s.confidence / 100)
    }, 0)
    
    const sellScore = sellSignals.reduce((sum, s) => {
      return sum + (s.strength === 'strong' ? 3 : s.strength === 'moderate' ? 2 : 1) * (s.confidence / 100)
    }, 0)
    
    let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    let confidence = 0
    let recommendation = ''
    
    if (buyScore > sellScore * 1.5) {
      sentiment = 'bullish'
      confidence = Math.min(95, (buyScore / (buyScore + sellScore)) * 100)
      recommendation = strongBuySignals.length > 1 ? 'خرید قوی توصیه می‌شود' : 'خرید محتاطانه'
    } else if (sellScore > buyScore * 1.5) {
      sentiment = 'bearish'
      confidence = Math.min(95, (sellScore / (buyScore + sellScore)) * 100)
      recommendation = strongSellSignals.length > 1 ? 'فروش قوی توصیه می‌شود' : 'فروش محتاطانه'
    } else {
      sentiment = 'neutral'
      confidence = 50
      recommendation = 'نگهداری و انتظار برای سیگنال واضح‌تر'
    }
    
    return {
      sentiment,
      confidence: Math.round(confidence),
      strongSignals: strongBuySignals.length + strongSellSignals.length,
      recommendation
    }
  }
}

export const technicalIndicators = TechnicalIndicators