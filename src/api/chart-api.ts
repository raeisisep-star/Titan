import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('*', cors())

// Define interfaces
interface OHLCData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

interface TechnicalIndicator {
  timestamp: number
  value: number
  signal?: 'buy' | 'sell' | 'hold'
}

interface ChartData {
  symbol: string
  timeframe: string
  ohlc: OHLCData[]
  volume: number[]
  indicators: {
    rsi?: TechnicalIndicator[]
    macd?: {
      macd: number
      signal: number
      histogram: number
      timestamp: number
    }[]
    sma20?: TechnicalIndicator[]
    sma50?: TechnicalIndicator[]
    bollinger?: {
      upper: number
      middle: number
      lower: number
      timestamp: number
    }[]
  }
}

// Get chart data for specific symbol and timeframe
app.get('/data/:symbol/:timeframe', async (c) => {
  try {
    const symbol = c.req.param('symbol').toLowerCase()
    const timeframe = c.req.param('timeframe') || '1h'
    
    // Map timeframe to CoinGecko API parameters
    const timeframeMap: Record<string, { days: string, interval?: string }> = {
      '1m': { days: '1', interval: 'minutely' },
      '5m': { days: '1', interval: 'minutely' },
      '15m': { days: '1', interval: 'minutely' },
      '1h': { days: '7', interval: 'hourly' },
      '4h': { days: '30', interval: 'hourly' },
      '1d': { days: '365', interval: 'daily' },
      '1w': { days: 'max' },
      '1M': { days: 'max' }
    }
    
    const params = timeframeMap[timeframe] || timeframeMap['1h']
    
    // Fetch OHLC data from CoinGecko
    const ohlcUrl = `https://api.coingecko.com/api/v3/coins/${symbol}/ohlc?vs_currency=usd&days=${params.days}`
    const ohlcResponse = await fetch(ohlcUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TITAN-Trading-System/1.0'
      }
    })
    
    if (!ohlcResponse.ok) {
      throw new Error(`OHLC API error: ${ohlcResponse.status}`)
    }
    
    const ohlcData = await ohlcResponse.json()
    
    // Transform OHLC data
    const transformedOHLC: OHLCData[] = ohlcData.map((item: number[]) => ({
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: 0 // CoinGecko OHLC doesn't include volume
    }))
    
    // Get volume data separately
    const volumeUrl = `https://api.coingecko.com/api/v3/coins/${symbol}/market_chart?vs_currency=usd&days=${params.days}&interval=${params.interval || 'daily'}`
    let volumeData: number[] = []
    
    try {
      const volumeResponse = await fetch(volumeUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'TITAN-Trading-System/1.0'
        }
      })
      
      if (volumeResponse.ok) {
        const marketData = await volumeResponse.json()
        volumeData = marketData.total_volumes?.map((item: number[]) => item[1]) || []
      }
    } catch (error) {
      console.error('Volume data fetch error:', error)
    }
    
    // Calculate technical indicators
    const indicators = calculateTechnicalIndicators(transformedOHLC)
    
    const chartData: ChartData = {
      symbol: symbol.toUpperCase(),
      timeframe,
      ohlc: transformedOHLC,
      volume: volumeData,
      indicators
    }
    
    return c.json({
      success: true,
      data: chartData,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Chart API error:', error)
    return c.json({
      success: false,
      error: 'Failed to fetch chart data',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Get available timeframes
app.get('/timeframes', (c) => {
  const timeframes = [
    { id: '1m', name: '1 دقیقه', group: 'minutes' },
    { id: '5m', name: '5 دقیقه', group: 'minutes' },
    { id: '15m', name: '15 دقیقه', group: 'minutes' },
    { id: '1h', name: '1 ساعت', group: 'hours' },
    { id: '4h', name: '4 ساعت', group: 'hours' },
    { id: '1d', name: '1 روز', group: 'days' },
    { id: '1w', name: '1 هفته', group: 'weeks' },
    { id: '1M', name: '1 ماه', group: 'months' }
  ]
  
  return c.json({
    success: true,
    data: timeframes
  })
})

// Get technical analysis summary
app.get('/analysis/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol').toLowerCase()
    
    // Get recent OHLC data for analysis
    const ohlcUrl = `https://api.coingecko.com/api/v3/coins/${symbol}/ohlc?vs_currency=usd&days=30`
    const response = await fetch(ohlcUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TITAN-Trading-System/1.0'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Analysis API error: ${response.status}`)
    }
    
    const ohlcData = await response.json()
    const transformedData: OHLCData[] = ohlcData.map((item: number[]) => ({
      timestamp: item[0],
      open: item[1],
      high: item[2],
      low: item[3],
      close: item[4],
      volume: 0
    }))
    
    // Calculate comprehensive technical analysis
    const analysis = performTechnicalAnalysis(transformedData)
    
    return c.json({
      success: true,
      data: analysis,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Technical analysis error:', error)
    return c.json({
      success: false,
      error: 'Failed to perform technical analysis',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500)
  }
})

// Helper functions for technical indicators
function calculateTechnicalIndicators(ohlc: OHLCData[]) {
  const closes = ohlc.map(d => d.close)
  const highs = ohlc.map(d => d.high)
  const lows = ohlc.map(d => d.low)
  
  return {
    rsi: calculateRSI(closes, 14),
    macd: calculateMACD(closes),
    sma20: calculateSMA(closes, 20),
    sma50: calculateSMA(closes, 50),
    bollinger: calculateBollingerBands(closes, 20, 2)
  }
}

function calculateRSI(prices: number[], period: number = 14): TechnicalIndicator[] {
  const rsi: TechnicalIndicator[] = []
  
  if (prices.length < period + 1) return rsi
  
  for (let i = period; i < prices.length; i++) {
    let gains = 0
    let losses = 0
    
    for (let j = i - period + 1; j <= i; j++) {
      const change = prices[j] - prices[j - 1]
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }
    
    const avgGain = gains / period
    const avgLoss = losses / period
    const rs = avgGain / avgLoss
    const rsiValue = 100 - (100 / (1 + rs))
    
    let signal: 'buy' | 'sell' | 'hold' = 'hold'
    if (rsiValue < 30) signal = 'buy'
    else if (rsiValue > 70) signal = 'sell'
    
    rsi.push({
      timestamp: Date.now() - (prices.length - i - 1) * 3600000, // Approximate timestamp
      value: rsiValue,
      signal
    })
  }
  
  return rsi
}

function calculateMACD(prices: number[]): any[] {
  const ema12 = calculateEMA(prices, 12)
  const ema26 = calculateEMA(prices, 26)
  const macdLine: number[] = []
  
  for (let i = 0; i < Math.min(ema12.length, ema26.length); i++) {
    macdLine.push(ema12[i] - ema26[i])
  }
  
  const signalLine = calculateEMA(macdLine, 9)
  const histogram: number[] = []
  
  for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
    histogram.push(macdLine[i] - signalLine[i])
  }
  
  return macdLine.map((macd, i) => ({
    macd,
    signal: signalLine[i] || 0,
    histogram: histogram[i] || 0,
    timestamp: Date.now() - (macdLine.length - i - 1) * 3600000
  }))
}

function calculateSMA(prices: number[], period: number): TechnicalIndicator[] {
  const sma: TechnicalIndicator[] = []
  
  for (let i = period - 1; i < prices.length; i++) {
    const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
    const average = sum / period
    
    sma.push({
      timestamp: Date.now() - (prices.length - i - 1) * 3600000,
      value: average
    })
  }
  
  return sma
}

function calculateEMA(prices: number[], period: number): number[] {
  const ema: number[] = []
  const multiplier = 2 / (period + 1)
  
  if (prices.length === 0) return ema
  
  ema[0] = prices[0]
  
  for (let i = 1; i < prices.length; i++) {
    ema[i] = (prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier))
  }
  
  return ema
}

function calculateBollingerBands(prices: number[], period: number, stdDev: number): any[] {
  const bands: any[] = []
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1)
    const sma = slice.reduce((a, b) => a + b, 0) / period
    
    const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)
    
    bands.push({
      upper: sma + (standardDeviation * stdDev),
      middle: sma,
      lower: sma - (standardDeviation * stdDev),
      timestamp: Date.now() - (prices.length - i - 1) * 3600000
    })
  }
  
  return bands
}

function performTechnicalAnalysis(ohlc: OHLCData[]) {
  const closes = ohlc.map(d => d.close)
  const currentPrice = closes[closes.length - 1]
  const previousPrice = closes[closes.length - 2]
  const change = currentPrice - previousPrice
  const changePercent = (change / previousPrice) * 100
  
  // Calculate indicators
  const rsi = calculateRSI(closes, 14)
  const macd = calculateMACD(closes)
  const sma20 = calculateSMA(closes, 20)
  const sma50 = calculateSMA(closes, 50)
  const bollinger = calculateBollingerBands(closes, 20, 2)
  
  // Get latest values
  const latestRSI = rsi[rsi.length - 1]?.value || 50
  const latestMACD = macd[macd.length - 1]
  const latestSMA20 = sma20[sma20.length - 1]?.value || currentPrice
  const latestSMA50 = sma50[sma50.length - 1]?.value || currentPrice
  const latestBollinger = bollinger[bollinger.length - 1]
  
  // Generate signals
  const signals: string[] = []
  let overallSignal: 'buy' | 'sell' | 'hold' = 'hold'
  let signalStrength = 0
  
  // RSI Analysis
  if (latestRSI < 30) {
    signals.push('RSI oversold - خرید محتمل')
    signalStrength += 1
  } else if (latestRSI > 70) {
    signals.push('RSI overbought - فروش محتمل')
    signalStrength -= 1
  }
  
  // MACD Analysis
  if (latestMACD && latestMACD.histogram > 0) {
    signals.push('MACD bullish - روند صعودی')
    signalStrength += 1
  } else if (latestMACD && latestMACD.histogram < 0) {
    signals.push('MACD bearish - روند نزولی')
    signalStrength -= 1
  }
  
  // Moving Average Analysis
  if (currentPrice > latestSMA20 && latestSMA20 > latestSMA50) {
    signals.push('Price above SMAs - روند صعودی')
    signalStrength += 1
  } else if (currentPrice < latestSMA20 && latestSMA20 < latestSMA50) {
    signals.push('Price below SMAs - روند نزولی')
    signalStrength -= 1
  }
  
  // Bollinger Bands Analysis
  if (latestBollinger) {
    if (currentPrice < latestBollinger.lower) {
      signals.push('Price below Bollinger lower - oversold محتمل')
      signalStrength += 1
    } else if (currentPrice > latestBollinger.upper) {
      signals.push('Price above Bollinger upper - overbought محتمل')
      signalStrength -= 1
    }
  }
  
  // Determine overall signal
  if (signalStrength >= 2) overallSignal = 'buy'
  else if (signalStrength <= -2) overallSignal = 'sell'
  
  return {
    symbol: ohlc.length > 0 ? 'CRYPTO' : 'UNKNOWN',
    currentPrice,
    change,
    changePercent,
    indicators: {
      rsi: latestRSI,
      macd: latestMACD,
      sma20: latestSMA20,
      sma50: latestSMA50,
      bollinger: latestBollinger
    },
    signals,
    overallSignal,
    signalStrength,
    recommendation: getRecommendation(overallSignal, signalStrength),
    confidence: Math.abs(signalStrength) * 25, // 0-100%
    timestamp: new Date().toISOString()
  }
}

function getRecommendation(signal: 'buy' | 'sell' | 'hold', strength: number): string {
  if (signal === 'buy') {
    if (strength >= 3) return 'خرید قوی - سیگنال‌های متعدد مثبت'
    return 'خرید ملایم - سیگنال‌های مثبت محدود'
  } else if (signal === 'sell') {
    if (strength <= -3) return 'فروش قوی - سیگنال‌های متعدد منفی'
    return 'فروش ملایم - سیگنال‌های منفی محدود'
  }
  return 'نگهداری - سیگنال‌های متضاد یا خنثی'
}

export default app