/**
 * TITAN Trading System - Exchange API Routes
 * Real exchange integration endpoints for testing and management
 */

import { Hono } from 'hono'
import type { Env } from '../types/cloudflare'
import ExchangeService from '../services/exchange-service'

type Variables = {
  exchangeService: ExchangeService
}

const exchangeApi = new Hono<{ Bindings: Env; Variables: Variables }>()

// Middleware to initialize exchange service
exchangeApi.use('*', async (c, next) => {
  const exchangeService = new ExchangeService(c.env)
  c.set('exchangeService', exchangeService)
  await next()
})

/**
 * GET /api/exchange/status
 * Get status of all exchanges (both real and mock)
 */
exchangeApi.get('/status', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    
    const status = {
      useRealExchanges: exchangeService.isUsingRealExchanges(),
      info: exchangeService.getExchangeInfo(),
      availableExchanges: exchangeService.getAvailableExchanges(),
      timestamp: new Date().toISOString()
    }
    
    return c.json({
      success: true,
      data: status
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * POST /api/exchange/test-connections
 * Test connections to all exchanges
 */
exchangeApi.post('/test-connections', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    
    const results = await exchangeService.testAllConnections()
    
    return c.json({
      success: true,
      data: {
        useRealExchanges: exchangeService.isUsingRealExchanges(),
        results,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * POST /api/exchange/test-auth
 * Test authentication for real exchanges only
 */
exchangeApi.post('/test-auth', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const factory = exchangeService.getExchangeFactory()
    
    if (!factory) {
      return c.json({
        success: false,
        error: 'Real exchanges not enabled. Set USE_REAL_EXCHANGES=true'
      }, 400)
    }
    
    const results = await factory.testAllAuthentication()
    
    return c.json({
      success: true,
      data: {
        results,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * GET /api/exchange/market-data/:symbol
 * Get market data for a symbol from specified exchange or default
 */
exchangeApi.get('/market-data/:symbol', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const symbol = c.req.param('symbol')
    const exchange = c.req.query('exchange') || 'binance'
    
    const marketData = await exchangeService.getMarketData(symbol, exchange)
    
    return c.json({
      success: true,
      data: {
        symbol,
        exchange,
        marketData,
        useRealExchanges: exchangeService.isUsingRealExchanges(),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * GET /api/exchange/aggregated-market-data/:symbol
 * Get aggregated market data from multiple exchanges (real API only)
 */
exchangeApi.get('/aggregated-market-data/:symbol', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const symbol = c.req.param('symbol')
    const exchangesParam = c.req.query('exchanges')
    const exchanges = exchangesParam ? exchangesParam.split(',') : undefined
    
    const aggregatedData = await exchangeService.getAggregatedMarketData(symbol, exchanges)
    
    return c.json({
      success: true,
      data: {
        symbol,
        exchanges,
        aggregatedData,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * GET /api/exchange/order-book/:symbol
 * Get order book for a symbol from specified exchange
 */
exchangeApi.get('/order-book/:symbol', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const symbol = c.req.param('symbol')
    const exchange = c.req.query('exchange') || 'binance'
    
    const orderBook = await exchangeService.getOrderBook(symbol, exchange)
    
    return c.json({
      success: true,
      data: {
        symbol,
        exchange,
        orderBook,
        useRealExchanges: exchangeService.isUsingRealExchanges(),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * GET /api/exchange/balances
 * Get balances from specified exchange or all exchanges
 */
exchangeApi.get('/balances', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const exchange = c.req.query('exchange')
    
    if (exchange) {
      // Get balances from specific exchange
      const balances = await exchangeService.getBalances(exchange)
      
      return c.json({
        success: true,
        data: {
          exchange,
          balances,
          useRealExchanges: exchangeService.isUsingRealExchanges(),
          timestamp: new Date().toISOString()
        }
      })
    } else {
      // Get balances from all exchanges (real API only)
      const factory = exchangeService.getExchangeFactory()
      if (!factory) {
        return c.json({
          success: false,
          error: 'All-exchange balances require real exchanges. Set USE_REAL_EXCHANGES=true'
        }, 400)
      }
      
      const allBalances = await factory.getBalances()
      
      return c.json({
        success: true,
        data: {
          allBalances,
          timestamp: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * GET /api/exchange/portfolio-value
 * Calculate total portfolio value across exchanges
 */
exchangeApi.get('/portfolio-value', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const exchange = c.req.query('exchange')
    
    if (exchange) {
      // Get value from specific exchange
      const value = await exchangeService.calculatePortfolioValue(exchange)
      
      return c.json({
        success: true,
        data: {
          exchange,
          totalValue: value,
          currency: 'USD',
          useRealExchanges: exchangeService.isUsingRealExchanges(),
          timestamp: new Date().toISOString()
        }
      })
    } else {
      // Get total value across all exchanges (real API only)
      const factory = exchangeService.getExchangeFactory()
      if (!factory) {
        return c.json({
          success: false,
          error: 'Total portfolio value requires real exchanges. Set USE_REAL_EXCHANGES=true'
        }, 400)
      }
      
      const portfolioData = await factory.getTotalPortfolioValue()
      
      return c.json({
        success: true,
        data: {
          totalPortfolio: portfolioData,
          currency: 'USD',
          timestamp: new Date().toISOString()
        }
      })
    }
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * POST /api/exchange/find-best-price
 * Find best price across exchanges for trading (real API only)
 */
exchangeApi.post('/find-best-price', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const { symbol, side } = await c.req.json()
    
    if (!symbol || !side) {
      return c.json({
        success: false,
        error: 'Symbol and side (buy/sell) are required'
      }, 400)
    }
    
    const bestPrice = await exchangeService.findBestPrice(symbol, side)
    
    return c.json({
      success: true,
      data: {
        symbol,
        side,
        bestPrice,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * POST /api/exchange/smart-routing
 * Get smart order routing recommendation (real API only)
 */
exchangeApi.post('/smart-routing', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const orderData = await c.req.json()
    
    const requiredFields = ['symbol', 'side', 'type', 'quantity']
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return c.json({
          success: false,
          error: `${field} is required`
        }, 400)
      }
    }
    
    // Add exchange field for routing
    orderData.exchange = 'binance' // Default, will be overridden by routing
    
    const routing = await exchangeService.getSmartOrderRouting(orderData)
    
    return c.json({
      success: true,
      data: {
        order: orderData,
        routing,
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * POST /api/exchange/place-order
 * Place an order on specified exchange
 */
exchangeApi.post('/place-order', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const orderData = await c.req.json()
    
    const requiredFields = ['symbol', 'side', 'type', 'quantity', 'exchange']
    for (const field of requiredFields) {
      if (!orderData[field]) {
        return c.json({
          success: false,
          error: `${field} is required`
        }, 400)
      }
    }
    
    const orderResponse = await exchangeService.placeOrder(orderData)
    
    return c.json({
      success: true,
      data: {
        order: orderData,
        response: orderResponse,
        useRealExchanges: exchangeService.isUsingRealExchanges(),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * POST /api/exchange/cancel-order
 * Cancel an order on specified exchange
 */
exchangeApi.post('/cancel-order', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const { orderId, symbol, exchange } = await c.req.json()
    
    if (!orderId || !symbol || !exchange) {
      return c.json({
        success: false,
        error: 'orderId, symbol, and exchange are required'
      }, 400)
    }
    
    const success = await exchangeService.cancelOrder(orderId, symbol, exchange)
    
    return c.json({
      success: true,
      data: {
        orderId,
        symbol,
        exchange,
        cancelled: success,
        useRealExchanges: exchangeService.isUsingRealExchanges(),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

/**
 * GET /api/exchange/order-status/:orderId
 * Get order status from specified exchange
 */
exchangeApi.get('/order-status/:orderId', async (c) => {
  try {
    const exchangeService = c.get('exchangeService')
    const orderId = c.req.param('orderId')
    const symbol = c.req.query('symbol')
    const exchange = c.req.query('exchange')
    
    if (!symbol || !exchange) {
      return c.json({
        success: false,
        error: 'symbol and exchange query parameters are required'
      }, 400)
    }
    
    const orderStatus = await exchangeService.getOrderStatus(orderId, symbol, exchange)
    
    return c.json({
      success: true,
      data: {
        orderId,
        symbol,
        exchange,
        orderStatus,
        useRealExchanges: exchangeService.isUsingRealExchanges(),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message
    }, 500)
  }
})

export default exchangeApi