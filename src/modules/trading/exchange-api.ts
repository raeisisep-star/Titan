// TITAN Exchange API Endpoints
import { Hono } from 'hono'
import { ExchangeService } from '../../services/exchange-service'
import type { Env } from '../../types/cloudflare'

const app = new Hono<{ Bindings: Env }>()

// Get list of supported exchanges
app.get('/exchanges', async (c) => {
  try {
    const exchangeService = new ExchangeService(c.env)
    const exchanges = exchangeService.getExchangeStatus()
    
    return c.json({
      success: true,
      data: exchanges,
      message: 'Exchange configurations retrieved'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to get exchange configurations'
    }, 500)
  }
})

// Test connection to specific exchange
app.post('/test-connection', async (c) => {
  try {
    const { exchange } = await c.req.json()
    
    if (!exchange) {
      return c.json({
        success: false,
        error: 'Exchange name required',
        message: 'Please specify an exchange to test'
      }, 400)
    }

    const exchangeService = new ExchangeService(c.env)
    const result = await exchangeService.testConnection(exchange)
    
    return c.json({
      success: result.success,
      data: result.data,
      message: result.message
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Connection test failed'
    }, 500)
  }
})

// Test all configured exchanges
app.post('/test-all', async (c) => {
  try {
    const exchangeService = new ExchangeService(c.env)
    const exchanges = ['binance', 'coinbase', 'kucoin', 'mock']
    const results: { [key: string]: any } = {}
    
    for (const exchange of exchanges) {
      try {
        results[exchange] = await exchangeService.testConnection(exchange)
      } catch (error) {
        results[exchange] = {
          success: false,
          message: `Test failed: ${error.message}`
        }
      }
    }
    
    const successCount = Object.values(results).filter((r: any) => r.success).length
    const totalCount = exchanges.length
    
    return c.json({
      success: true,
      data: {
        results,
        summary: {
          total: totalCount,
          successful: successCount,
          failed: totalCount - successCount,
          successRate: `${Math.round((successCount / totalCount) * 100)}%`
        }
      },
      message: `Tested ${totalCount} exchanges, ${successCount} successful`
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to test exchanges'
    }, 500)
  }
})

// Get market data from specific exchange
app.get('/market/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol')
    const exchange = c.req.query('exchange') || 'mock'
    
    const exchangeService = new ExchangeService(c.env)
    const marketData = await exchangeService.getMarketData(symbol, exchange)
    
    return c.json({
      success: true,
      data: marketData,
      message: `Market data retrieved for ${symbol} from ${exchange}`
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to get market data'
    }, 500)
  }
})

// Get order book from specific exchange
app.get('/orderbook/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol')
    const exchange = c.req.query('exchange') || 'mock'
    
    const exchangeService = new ExchangeService(c.env)
    const orderBook = await exchangeService.getOrderBook(symbol, exchange)
    
    return c.json({
      success: true,
      data: orderBook,
      message: `Order book retrieved for ${symbol} from ${exchange}`
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to get order book'
    }, 500)
  }
})

// Get account balances
app.get('/balances', async (c) => {
  try {
    const exchange = c.req.query('exchange') || 'mock'
    
    const exchangeService = new ExchangeService(c.env)
    const balances = await exchangeService.getBalances(exchange)
    
    return c.json({
      success: true,
      data: balances,
      message: `Balances retrieved from ${exchange}`
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to get balances'
    }, 500)
  }
})

// Place a test order (sandbox only)
app.post('/order', async (c) => {
  try {
    const orderData = await c.req.json()
    
    // Validate required fields
    const required = ['symbol', 'side', 'type', 'quantity', 'exchange']
    for (const field of required) {
      if (!orderData[field]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`,
          message: 'Please provide all required order fields'
        }, 400)
      }
    }
    
    const exchangeService = new ExchangeService(c.env)
    const orderResponse = await exchangeService.placeOrder(orderData)
    
    return c.json({
      success: true,
      data: orderResponse,
      message: `Order placed successfully on ${orderData.exchange}`
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to place order'
    }, 500)
  }
})

// Cancel an order
app.delete('/order/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId')
    const symbol = c.req.query('symbol')
    const exchange = c.req.query('exchange') || 'mock'
    
    if (!symbol) {
      return c.json({
        success: false,
        error: 'Symbol required',
        message: 'Please specify the symbol for order cancellation'
      }, 400)
    }
    
    const exchangeService = new ExchangeService(c.env)
    const result = await exchangeService.cancelOrder(orderId, symbol, exchange)
    
    return c.json({
      success: result,
      data: { orderId, symbol, exchange, cancelled: result },
      message: result ? 'Order cancelled successfully' : 'Failed to cancel order'
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to cancel order'
    }, 500)
  }
})

// Get order status
app.get('/order/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId')
    const symbol = c.req.query('symbol')
    const exchange = c.req.query('exchange') || 'mock'
    
    if (!symbol) {
      return c.json({
        success: false,
        error: 'Symbol required',
        message: 'Please specify the symbol for order status'
      }, 400)
    }
    
    const exchangeService = new ExchangeService(c.env)
    const orderStatus = await exchangeService.getOrderStatus(orderId, symbol, exchange)
    
    return c.json({
      success: true,
      data: orderStatus,
      message: `Order status retrieved for ${orderId}`
    })
  } catch (error) {
    return c.json({
      success: false,
      error: error.message,
      message: 'Failed to get order status'
    }, 500)
  }
})

export default app