import { Hono } from 'hono'

const app = new Hono()

// Get advanced trading data and analytics
app.get('/advanced', async (c) => {
  try {
    // Generate advanced trading data
    const symbols = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT', 'DOT/USDT', 'LINK/USDT'];
    const basePrices = {
      'BTC/USDT': 45000,
      'ETH/USDT': 3200, 
      'ADA/USDT': 0.48,
      'DOT/USDT': 12.5,
      'LINK/USDT': 18.5
    };
    
    const selectedSymbol = c.req.query('symbol') || 'BTC/USDT';
    const basePrice = basePrices[selectedSymbol] || 45000;
    
    const tradingData = {
      symbol: selectedSymbol,
      currentPrice: basePrice * (1 + (Math.random() - 0.5) * 0.02),
      priceChange24h: (Math.random() - 0.5) * 8,
      priceChangePercent24h: (Math.random() - 0.5) * 8,
      volume24h: Math.random() * 1000000000,
      high24h: basePrice * (1 + Math.random() * 0.05),
      low24h: basePrice * (1 - Math.random() * 0.05),
      activeTradesCount: Math.floor(Math.random() * 15) + 5,
      dailyProfit: (Math.random() - 0.3) * 2000,
      weeklyProfit: (Math.random() - 0.2) * 8000,
      monthlyProfit: (Math.random() - 0.1) * 25000,
      winRate: Math.random() * 30 + 60,
      totalTrades: Math.floor(Math.random() * 500) + 1000,
      winningTrades: 0,
      losingTrades: 0,
      lastSignal: ['خرید قوی', 'فروش قوی', 'نگهداری', 'خرید ضعیف', 'فروش ضعیف'][Math.floor(Math.random() * 5)],
      balance: {
        USDT: 15000 + Math.random() * 10000,
        BTC: Math.random() * 3,
        ETH: Math.random() * 15,
        ADA: Math.random() * 10000,
        DOT: Math.random() * 800,
        LINK: Math.random() * 1000
      },
      technicalIndicators: {
        rsi: Math.random() * 100,
        rsi_signal: getRSISignal(Math.random() * 100),
        macd: (Math.random() - 0.5) * 200,
        macd_signal: getMACDSignal(Math.random() - 0.5),
        bb_upper: basePrice * (1 + Math.random() * 0.03),
        bb_lower: basePrice * (1 - Math.random() * 0.03),
        sma_20: basePrice * (1 + (Math.random() - 0.5) * 0.02),
        sma_50: basePrice * (1 + (Math.random() - 0.5) * 0.04),
        ema_20: basePrice * (1 + (Math.random() - 0.5) * 0.015),
        ema_50: basePrice * (1 + (Math.random() - 0.5) * 0.035),
        volume_sma: Math.random() * 500000000
      }
    };

    // Calculate win/loss trades
    tradingData.winningTrades = Math.floor(tradingData.totalTrades * (tradingData.winRate / 100));
    tradingData.losingTrades = tradingData.totalTrades - tradingData.winningTrades;

    return c.json({
      success: true,
      data: tradingData,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Advanced trading data error:', error);
    return c.json({
      success: false,
      error: 'Failed to load advanced trading data'
    }, 500);
  }
});

// Get order book data
app.get('/orderbook/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol') || 'BTC/USDT';
    const basePrice = getBasePrice(symbol);
    
    // Generate mock order book
    const buyOrders = [];
    const sellOrders = [];
    
    // Generate buy orders (bids)
    for (let i = 0; i < 15; i++) {
      const price = basePrice * (1 - (i + 1) * 0.001);
      const amount = Math.random() * 2 + 0.1;
      buyOrders.push({
        price: price,
        amount: amount,
        total: price * amount
      });
    }
    
    // Generate sell orders (asks)
    for (let i = 0; i < 15; i++) {
      const price = basePrice * (1 + (i + 1) * 0.001);
      const amount = Math.random() * 2 + 0.1;
      sellOrders.push({
        price: price,
        amount: amount,
        total: price * amount
      });
    }

    return c.json({
      success: true,
      data: {
        symbol: symbol,
        bids: buyOrders,
        asks: sellOrders,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Order book error:', error);
    return c.json({
      success: false,
      error: 'Failed to load order book data'
    }, 500);
  }
});

// Get recent trades
app.get('/trades/:symbol', async (c) => {
  try {
    const symbol = c.req.param('symbol') || 'BTC/USDT';
    const limit = parseInt(c.req.query('limit') || '50');
    const basePrice = getBasePrice(symbol);
    
    const recentTrades = [];
    
    for (let i = 0; i < limit; i++) {
      const time = new Date(Date.now() - i * 60000); // 1 minute intervals
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.002);
      const amount = Math.random() * 5 + 0.01;
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      
      recentTrades.push({
        id: Date.now() + i,
        time: time.toISOString(),
        timeDisplay: time.toLocaleTimeString('fa-IR'),
        price: price,
        amount: amount,
        side: side,
        total: price * amount
      });
    }

    return c.json({
      success: true,
      data: {
        symbol: symbol,
        trades: recentTrades,
        timestamp: Date.now()
      }
    });
  } catch (error) {
    console.error('Recent trades error:', error);
    return c.json({
      success: false,
      error: 'Failed to load recent trades'
    }, 500);
  }
});

// Get active orders
app.get('/orders/active', async (c) => {
  try {
    // Generate mock active orders
    const activeOrders = [
      {
        id: 'ORD001',
        symbol: 'BTC/USDT',
        side: 'buy',
        type: 'limit',
        amount: 0.5,
        price: 44500,
        filled: 0,
        remaining: 0.5,
        status: 'open',
        createdAt: new Date(Date.now() - 3600000).toISOString()
      },
      {
        id: 'ORD002', 
        symbol: 'ETH/USDT',
        side: 'sell',
        type: 'limit',
        amount: 2.0,
        price: 3250,
        filled: 0.5,
        remaining: 1.5,
        status: 'partially_filled',
        createdAt: new Date(Date.now() - 1800000).toISOString()
      }
    ];

    return c.json({
      success: true,
      data: activeOrders,
      count: activeOrders.length
    });
  } catch (error) {
    console.error('Active orders error:', error);
    return c.json({
      success: false,
      error: 'Failed to load active orders'
    }, 500);
  }
});

// Get open positions
app.get('/positions', async (c) => {
  try {
    // Generate mock positions
    const positions = [
      {
        id: 'POS001',
        symbol: 'BTC/USDT',
        side: 'long',
        size: 1.2,
        entryPrice: 44200,
        currentPrice: 45000,
        pnl: 960,
        pnlPercent: 1.81,
        margin: 4420,
        createdAt: new Date(Date.now() - 7200000).toISOString()
      },
      {
        id: 'POS002',
        symbol: 'ETH/USDT', 
        side: 'short',
        size: 5.0,
        entryPrice: 3180,
        currentPrice: 3200,
        pnl: -100,
        pnlPercent: -0.63,
        margin: 1590,
        createdAt: new Date(Date.now() - 3600000).toISOString()
      }
    ];

    return c.json({
      success: true,
      data: positions,
      count: positions.length
    });
  } catch (error) {
    console.error('Positions error:', error);
    return c.json({
      success: false,
      error: 'Failed to load positions'
    }, 500);
  }
});

// Submit new order
app.post('/order', async (c) => {
  try {
    const orderData = await c.req.json();
    
    // Validate order data
    if (!orderData.symbol || !orderData.side || !orderData.amount) {
      return c.json({
        success: false,
        error: 'Missing required fields: symbol, side, amount'
      }, 400);
    }
    
    // Generate mock order response
    const newOrder = {
      id: 'ORD' + Date.now(),
      symbol: orderData.symbol,
      side: orderData.side,
      type: orderData.type || 'market',
      amount: parseFloat(orderData.amount),
      price: orderData.price ? parseFloat(orderData.price) : null,
      status: orderData.type === 'market' ? 'filled' : 'open',
      createdAt: new Date().toISOString(),
      fills: orderData.type === 'market' ? [{
        price: getBasePrice(orderData.symbol),
        amount: parseFloat(orderData.amount),
        timestamp: Date.now()
      }] : []
    };

    return c.json({
      success: true,
      data: newOrder,
      message: 'Order submitted successfully'
    });
  } catch (error) {
    console.error('Submit order error:', error);
    return c.json({
      success: false,
      error: 'Failed to submit order'
    }, 500);
  }
});

// Cancel order
app.delete('/order/:orderId', async (c) => {
  try {
    const orderId = c.req.param('orderId');
    
    return c.json({
      success: true,
      message: `Order ${orderId} cancelled successfully`
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    return c.json({
      success: false,
      error: 'Failed to cancel order'
    }, 500);
  }
});

// Trading history
app.get('/history', async (c) => {
  try {
    const limit = parseInt(c.req.query('limit') || '50');
    const filter = c.req.query('filter') || 'all';
    
    const history = [];
    
    for (let i = 0; i < limit; i++) {
      const time = new Date(Date.now() - i * 3600000); // 1 hour intervals
      const symbols = ['BTC/USDT', 'ETH/USDT', 'ADA/USDT'];
      const symbol = symbols[i % symbols.length];
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const price = getBasePrice(symbol) * (1 + (Math.random() - 0.5) * 0.05);
      const amount = Math.random() * 2 + 0.1;
      const fee = price * amount * 0.001; // 0.1% fee
      const pnl = side === 'buy' ? 
        (Math.random() - 0.3) * price * amount * 0.1 : 
        (Math.random() - 0.3) * price * amount * 0.1;
      
      history.push({
        id: 'TXN' + (Date.now() + i),
        timestamp: time.toISOString(),
        timeDisplay: time.toLocaleString('fa-IR'),
        symbol: symbol,
        side: side,
        price: price,
        amount: amount,
        total: price * amount,
        fee: fee,
        pnl: pnl,
        status: 'completed'
      });
    }

    return c.json({
      success: true,
      data: history,
      count: history.length
    });
  } catch (error) {
    console.error('Trading history error:', error);
    return c.json({
      success: false,
      error: 'Failed to load trading history'
    }, 500);
  }
});

// Helper functions
function getRSISignal(rsi: number): string {
  if (rsi > 70) return 'اشباع خرید';
  if (rsi < 30) return 'اشباع فروش';
  return 'خنثی';
}

function getMACDSignal(macd: number): string {
  if (macd > 0) return 'صعودی';
  if (macd < 0) return 'نزولی';
  return 'خنثی';
}

function getBasePrice(symbol: string): number {
  const basePrices: { [key: string]: number } = {
    'BTC/USDT': 45000,
    'ETH/USDT': 3200,
    'ADA/USDT': 0.48,
    'DOT/USDT': 12.5,
    'LINK/USDT': 18.5,
    'UNI/USDT': 8.2,
    'AAVE/USDT': 95.0,
    'MATIC/USDT': 0.85
  };
  
  return basePrices[symbol] || 1.0;
}

export default app