// TITAN Market Data API - Advanced Market Information
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import type { Env } from '../types/cloudflare'

interface MarketOverview {
  total_market_cap: number
  total_volume_24h: number
  market_cap_change_24h: number
  btc_dominance: number
  eth_dominance: number
  active_cryptocurrencies: number
  markets: number
}

interface TopMover {
  id: string
  symbol: string
  name: string
  image: string
  current_price: number
  price_change_percentage_24h: number
  market_cap: number
  market_cap_rank: number
  volume_24h: number
}

interface FearGreedData {
  value: number
  classification: string
  timestamp: string
  previous_value?: number
}

export const marketApi = new Hono<{ Bindings: Env }>()

marketApi.use('/*', cors())

// Get market overview
marketApi.get('/overview', async (c) => {
  try {
    // Fetch global market data from CoinGecko
    const globalResponse = await fetch('https://api.coingecko.com/api/v3/global')
    const globalData = await globalResponse.json()
    
    if (!globalResponse.ok) {
      throw new Error('Failed to fetch global market data')
    }

    const overview: MarketOverview = {
      total_market_cap: globalData.data.total_market_cap.usd,
      total_volume_24h: globalData.data.total_volume.usd,
      market_cap_change_24h: globalData.data.market_cap_change_percentage_24h_usd,
      btc_dominance: globalData.data.market_cap_percentage.btc,
      eth_dominance: globalData.data.market_cap_percentage.eth,
      active_cryptocurrencies: globalData.data.active_cryptocurrencies,
      markets: globalData.data.markets
    }

    return c.json({
      success: true,
      data: overview,
      message: 'Market overview retrieved',
      last_updated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Market overview error:', error)
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch market overview'
    }, 500)
  }
})

// Get top gainers and losers
marketApi.get('/movers', async (c) => {
  try {
    const type = c.req.query('type') || 'gainers' // gainers, losers, volume
    const limit = parseInt(c.req.query('limit') || '10')
    
    let url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=`
    
    switch (type) {
      case 'gainers':
        url += 'price_change_percentage_24h_desc'
        break
      case 'losers':
        url += 'price_change_percentage_24h_asc'
        break
      case 'volume':
        url += 'volume_desc'
        break
      default:
        url += 'market_cap_desc'
    }
    
    url += `&per_page=${limit}&page=1&sparkline=false`

    const response = await fetch(url)
    const data = await response.json()

    if (!response.ok) {
      throw new Error('Failed to fetch market movers')
    }

    const movers: TopMover[] = data.map((coin: any) => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      image: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: coin.price_change_percentage_24h,
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      volume_24h: coin.total_volume
    }))

    return c.json({
      success: true,
      data: movers,
      type: type,
      count: movers.length,
      message: `Top ${type} retrieved`,
      last_updated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Market movers error:', error)
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch market movers'
    }, 500)
  }
})

// Get Fear & Greed Index
marketApi.get('/fear-greed', async (c) => {
  try {
    // Alternative Fear & Greed Index API
    const response = await fetch('https://api.alternative.me/fng/')
    const data = await response.json()

    if (!response.ok || !data.data || !data.data[0]) {
      // Fallback: Generate based on market sentiment
      const btcResponse = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true')
      const btcData = await btcResponse.json()
      
      const btcChange = btcData.bitcoin?.usd_24h_change || 0
      let fearGreedValue = 50 // Neutral
      
      if (btcChange > 5) fearGreedValue = 75 // Greed
      else if (btcChange > 2) fearGreedValue = 65 // Slight Greed
      else if (btcChange < -5) fearGreedValue = 25 // Fear
      else if (btcChange < -2) fearGreedValue = 35 // Slight Fear
      
      const fearGreedData: FearGreedData = {
        value: fearGreedValue,
        classification: getFearGreedClassification(fearGreedValue),
        timestamp: new Date().toISOString()
      }

      return c.json({
        success: true,
        data: fearGreedData,
        source: 'calculated',
        message: 'Fear & Greed Index (calculated)'
      })
    }

    const fearGreedData: FearGreedData = {
      value: parseInt(data.data[0].value),
      classification: data.data[0].value_classification,
      timestamp: new Date(parseInt(data.data[0].timestamp) * 1000).toISOString(),
      previous_value: data.data[1] ? parseInt(data.data[1].value) : undefined
    }

    return c.json({
      success: true,
      data: fearGreedData,
      source: 'alternative.me',
      message: 'Fear & Greed Index retrieved'
    })

  } catch (error) {
    console.error('Fear & Greed error:', error)
    
    // Fallback data
    const fallbackData: FearGreedData = {
      value: 50,
      classification: 'Neutral',
      timestamp: new Date().toISOString()
    }

    return c.json({
      success: true,
      data: fallbackData,
      source: 'fallback',
      message: 'Fear & Greed Index (fallback)'
    })
  }
})

// Get OHLC candlestick data
marketApi.get('/ohlc/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol')
    const days = c.req.query('days') || '7'
    
    // Map symbol to CoinGecko ID
    const symbolMap: { [key: string]: string } = {
      'BTCUSDT': 'bitcoin',
      'ETHUSDT': 'ethereum',
      'SOLUSDT': 'solana',
      'ADAUSDT': 'cardano',
      'DOTUSDT': 'polkadot',
      'BNBUSDT': 'binancecoin',
      'XRPUSDT': 'ripple',
      'DOGEUSDT': 'dogecoin'
    }
    
    const coinId = symbolMap[symbol.toUpperCase()] || 'bitcoin'
    
    // Get OHLC data from CoinGecko
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`
    )
    
    const ohlcData = await response.json()

    if (!response.ok) {
      throw new Error('Failed to fetch OHLC data')
    }

    // Transform data for TradingView format
    const candlestickData = ohlcData.map((candle: number[]) => ({
      timestamp: candle[0],
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      date: new Date(candle[0]).toISOString()
    }))

    return c.json({
      success: true,
      data: candlestickData,
      symbol: symbol.toUpperCase(),
      timeframe: `${days}d`,
      count: candlestickData.length,
      message: 'OHLC data retrieved'
    })

  } catch (error) {
    console.error('OHLC data error:', error)
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch OHLC data'
    }, 500)
  }
})

// Get trending coins
marketApi.get('/trending', async (c) => {
  try {
    const response = await fetch('https://api.coingecko.com/api/v3/search/trending')
    const data = await response.json()

    if (!response.ok) {
      throw new Error('Failed to fetch trending coins')
    }

    const trending = data.coins.map((coin: any) => ({
      id: coin.item.id,
      symbol: coin.item.symbol,
      name: coin.item.name,
      image: coin.item.thumb,
      market_cap_rank: coin.item.market_cap_rank,
      price_btc: coin.item.price_btc
    }))

    return c.json({
      success: true,
      data: trending,
      count: trending.length,
      message: 'Trending coins retrieved'
    })

  } catch (error) {
    console.error('Trending coins error:', error)
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to fetch trending coins'
    }, 500)
  }
})

function getFearGreedClassification(value: number): string {
  if (value >= 75) return 'Extreme Greed'
  if (value >= 55) return 'Greed'
  if (value >= 45) return 'Neutral'
  if (value >= 25) return 'Fear'
  return 'Extreme Fear'
}

export default marketApi