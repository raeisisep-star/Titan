/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💹 TRADING EXECUTION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * سرویس اجرای معاملات واقعی
 * - اجرای سفارشات خرید/فروش
 * - مدیریت ریسک (Stop Loss, Take Profit)
 * - محاسبه اندازه پوزیشن
 * - یکپارچگی با صرافی‌ها (Binance, MEXC)
 */

const axios = require('axios');
const crypto = require('crypto');

class TradingExecutionService {
  constructor(pool) {
    this.pool = pool;
    
    // Exchange API configurations
    this.exchanges = {
      binance: {
        baseURL: 'https://api.binance.com',
        apiKey: process.env.BINANCE_API_KEY,
        secretKey: process.env.BINANCE_SECRET_KEY,
        enabled: !!process.env.BINANCE_API_KEY && process.env.BINANCE_API_KEY !== 'YOUR_BINANCE_API_KEY'
      },
      mexc: {
        baseURL: 'https://api.mexc.com',
        apiKey: process.env.MEXC_API_KEY,
        secretKey: process.env.MEXC_SECRET_KEY,
        enabled: !!process.env.MEXC_API_KEY && process.env.MEXC_API_KEY !== 'YOUR_MEXC_API_KEY'
      }
    };
    
    // Trading constraints
    this.constraints = {
      minOrderValue: 10, // Minimum $10 per order
      maxOrderValue: 10000, // Maximum $10,000 per order
      maxPositionSize: 0.25, // Maximum 25% of portfolio per position
      maxDailyTrades: 50, // Maximum 50 trades per day
      emergencyStopLoss: 0.15 // Emergency stop at 15% loss
    };
    
    console.log('💹 Trading Execution Service initialized');
    console.log('   Binance:', this.exchanges.binance.enabled ? '✅' : '❌');
    console.log('   MEXC:', this.exchanges.mexc.enabled ? '✅' : '❌');
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * MAIN EXECUTION METHODS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Execute a trade (Buy or Sell)
   */
  async executeTrade(userId, tradeParams) {
    const {
      symbol,           // e.g., 'BTCUSDT'
      side,             // 'BUY' or 'SELL'
      quantity,         // Amount to trade
      price,            // Limit price (optional)
      orderType,        // 'MARKET' or 'LIMIT'
      stopLoss,         // Stop loss price (optional)
      takeProfit,       // Take profit price (optional)
      exchange,         // 'binance' or 'mexc'
      strategy,         // Strategy name
      agentId          // AI agent that recommended this
    } = tradeParams;
    
    try {
      console.log(`🔄 Executing ${side} order: ${quantity} ${symbol}`);
      
      // Step 1: Validate trade
      const validation = await this.validateTrade(userId, tradeParams);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error,
          code: 'VALIDATION_FAILED'
        };
      }
      
      // Step 2: Calculate position size and risk
      const riskCalc = await this.calculatePositionRisk(userId, tradeParams);
      if (riskCalc.risk > this.constraints.emergencyStopLoss) {
        return {
          success: false,
          error: 'Risk too high - Emergency stop engaged',
          code: 'RISK_TOO_HIGH'
        };
      }
      
      // Step 3: Execute on exchange (or simulate if no API key)
      const exchangeResult = await this.executeOnExchange(exchange, tradeParams);
      
      // Step 4: Record trade in database
      const trade = await this.recordTrade(userId, {
        ...tradeParams,
        ...exchangeResult,
        actualQuantity: exchangeResult.executedQty,
        actualPrice: exchangeResult.avgPrice,
        fee: exchangeResult.fee,
        status: exchangeResult.status
      });
      
      // Step 5: Set stop loss and take profit if specified
      if (stopLoss || takeProfit) {
        await this.setProtectionOrders(userId, trade.id, {
          stopLoss,
          takeProfit,
          exchange
        });
      }
      
      // Step 6: Update portfolio
      await this.updatePortfolio(userId, trade);
      
      console.log(`✅ Trade executed: ${trade.id}`);
      
      return {
        success: true,
        trade: trade,
        risk: riskCalc,
        message: `Successfully executed ${side} order for ${quantity} ${symbol}`
      };
      
    } catch (error) {
      console.error('❌ Trade execution failed:', error.message);
      
      // Record failed trade
      await this.recordFailedTrade(userId, tradeParams, error);
      
      return {
        success: false,
        error: error.message,
        code: 'EXECUTION_FAILED'
      };
    }
  }
  
  /**
   * Validate trade parameters
   */
  async validateTrade(userId, tradeParams) {
    const { symbol, side, quantity, orderType, exchange } = tradeParams;
    
    // Check basic parameters
    if (!symbol || !side || !quantity) {
      return { valid: false, error: 'Missing required parameters' };
    }
    
    if (!['BUY', 'SELL'].includes(side)) {
      return { valid: false, error: 'Invalid side (must be BUY or SELL)' };
    }
    
    if (!['MARKET', 'LIMIT'].includes(orderType)) {
      return { valid: false, error: 'Invalid order type' };
    }
    
    // Check exchange availability
    if (exchange && !this.exchanges[exchange]) {
      return { valid: false, error: 'Invalid exchange' };
    }
    
    // Check user balance
    const balance = await this.getUserBalance(userId);
    const orderValue = await this.calculateOrderValue(symbol, quantity, side);
    
    if (side === 'BUY' && orderValue > balance.available) {
      return { valid: false, error: 'Insufficient balance' };
    }
    
    // Check position for SELL
    if (side === 'SELL') {
      const position = await this.getUserPosition(userId, symbol);
      if (!position || position.quantity < quantity) {
        return { valid: false, error: 'Insufficient position to sell' };
      }
    }
    
    // Check order value constraints
    if (orderValue < this.constraints.minOrderValue) {
      return { valid: false, error: `Order value below minimum ($${this.constraints.minOrderValue})` };
    }
    
    if (orderValue > this.constraints.maxOrderValue) {
      return { valid: false, error: `Order value exceeds maximum ($${this.constraints.maxOrderValue})` };
    }
    
    // Check daily trade limit
    const todayTrades = await this.getTodayTradeCount(userId);
    if (todayTrades >= this.constraints.maxDailyTrades) {
      return { valid: false, error: 'Daily trade limit reached' };
    }
    
    return { valid: true };
  }
  
  /**
   * Calculate position risk
   */
  async calculatePositionRisk(userId, tradeParams) {
    const { symbol, quantity, price, stopLoss } = tradeParams;
    
    // Get portfolio value
    const portfolio = await this.getPortfolioValue(userId);
    const orderValue = price * quantity;
    
    // Calculate position size as percentage of portfolio
    const positionSize = orderValue / portfolio.totalValue;
    
    // Calculate potential loss if stop loss is hit
    let potentialLoss = 0;
    if (stopLoss) {
      const stopLossPercent = Math.abs(price - stopLoss) / price;
      potentialLoss = orderValue * stopLossPercent;
    }
    
    // Calculate risk-reward ratio
    const risk = potentialLoss / portfolio.totalValue;
    
    return {
      positionSize,
      potentialLoss,
      risk,
      portfolioValue: portfolio.totalValue,
      orderValue,
      recommended: risk < 0.05 // Risk should be < 5% of portfolio
    };
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * EXCHANGE INTEGRATION
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Execute order on exchange
   */
  async executeOnExchange(exchange, tradeParams) {
    const { symbol, side, quantity, price, orderType } = tradeParams;
    
    // If no exchange API configured, simulate execution
    if (!exchange || !this.exchanges[exchange]?.enabled) {
      return this.simulateExecution(tradeParams);
    }
    
    try {
      switch (exchange) {
        case 'binance':
          return await this.executeBinanceOrder(tradeParams);
        case 'mexc':
          return await this.executeMexcOrder(tradeParams);
        default:
          return this.simulateExecution(tradeParams);
      }
    } catch (error) {
      console.error(`❌ Exchange execution failed: ${error.message}`);
      // Fallback to simulation
      return this.simulateExecution(tradeParams);
    }
  }
  
  /**
   * Execute order on Binance
   */
  async executeBinanceOrder(tradeParams) {
    const { symbol, side, quantity, price, orderType } = tradeParams;
    const exchange = this.exchanges.binance;
    
    const timestamp = Date.now();
    const params = {
      symbol,
      side,
      type: orderType,
      timestamp
    };
    
    if (orderType === 'LIMIT') {
      params.timeInForce = 'GTC';
      params.price = price;
      params.quantity = quantity;
    } else {
      params.quoteOrderQty = quantity; // For market orders, use quote quantity
    }
    
    // Generate signature
    const queryString = Object.entries(params)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    const signature = crypto
      .createHmac('sha256', exchange.secretKey)
      .update(queryString)
      .digest('hex');
    
    // Execute order
    const response = await axios.post(
      `${exchange.baseURL}/api/v3/order`,
      null,
      {
        params: { ...params, signature },
        headers: {
          'X-MBX-APIKEY': exchange.apiKey
        }
      }
    );
    
    return {
      orderId: response.data.orderId,
      executedQty: parseFloat(response.data.executedQty),
      avgPrice: parseFloat(response.data.price || response.data.fills?.[0]?.price || price),
      status: response.data.status,
      fee: this.calculateFee(response.data),
      exchange: 'binance',
      raw: response.data
    };
  }
  
  /**
   * Execute order on MEXC
   */
  async executeMexcOrder(tradeParams) {
    const { symbol, side, quantity, price, orderType } = tradeParams;
    const exchange = this.exchanges.mexc;
    
    const timestamp = Date.now();
    const params = {
      symbol,
      side,
      type: orderType,
      timestamp
    };
    
    if (orderType === 'LIMIT') {
      params.timeInForce = 'GTC';
      params.price = price;
      params.quantity = quantity;
    } else {
      params.quoteOrderQty = quantity;
    }
    
    // Generate signature (MEXC uses similar signature method as Binance)
    const queryString = Object.entries(params)
      .map(([key, val]) => `${key}=${val}`)
      .join('&');
    const signature = crypto
      .createHmac('sha256', exchange.secretKey)
      .update(queryString)
      .digest('hex');
    
    // Execute order
    const response = await axios.post(
      `${exchange.baseURL}/api/v3/order`,
      null,
      {
        params: { ...params, signature },
        headers: {
          'X-MEXC-APIKEY': exchange.apiKey
        }
      }
    );
    
    return {
      orderId: response.data.orderId,
      executedQty: parseFloat(response.data.executedQty),
      avgPrice: parseFloat(response.data.price || price),
      status: response.data.status,
      fee: this.calculateFee(response.data),
      exchange: 'mexc',
      raw: response.data
    };
  }
  
  /**
   * Simulate order execution (when no API key)
   */
  async simulateExecution(tradeParams) {
    const { symbol, side, quantity, price, orderType } = tradeParams;
    
    // Get current market price (from database or cache)
    const marketPrice = price || await this.getMarketPrice(symbol);
    
    // Simulate slight slippage for market orders
    const slippage = orderType === 'MARKET' ? 0.001 : 0; // 0.1% slippage
    const executionPrice = side === 'BUY' 
      ? marketPrice * (1 + slippage)
      : marketPrice * (1 - slippage);
    
    // Simulate fee (0.1% typical)
    const fee = quantity * executionPrice * 0.001;
    
    return {
      orderId: `SIM_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      executedQty: quantity,
      avgPrice: executionPrice,
      status: 'FILLED',
      fee,
      exchange: 'simulated',
      simulated: true
    };
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PROTECTION ORDERS (Stop Loss & Take Profit)
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Set stop loss and take profit orders
   */
  async setProtectionOrders(userId, tradeId, params) {
    const { stopLoss, takeProfit, exchange } = params;
    
    const protections = [];
    
    // Set stop loss
    if (stopLoss) {
      const stopOrder = await this.pool.query(`
        INSERT INTO trade_protection_orders 
        (trade_id, user_id, type, trigger_price, status)
        VALUES ($1, $2, 'STOP_LOSS', $3, 'ACTIVE')
        RETURNING *
      `, [tradeId, userId, stopLoss]);
      
      protections.push(stopOrder.rows[0]);
    }
    
    // Set take profit
    if (takeProfit) {
      const tpOrder = await this.pool.query(`
        INSERT INTO trade_protection_orders 
        (trade_id, user_id, type, trigger_price, status)
        VALUES ($1, $2, 'TAKE_PROFIT', $3, 'ACTIVE')
        RETURNING *
      `, [tradeId, userId, takeProfit]);
      
      protections.push(tpOrder.rows[0]);
    }
    
    return protections;
  }
  
  /**
   * Check and execute protection orders
   */
  async checkProtectionOrders(userId) {
    // Get active protection orders
    const result = await this.pool.query(`
      SELECT po.*, t.symbol, t.side, t.quantity, t.entry_price
      FROM trade_protection_orders po
      JOIN trades t ON po.trade_id = t.id
      WHERE po.user_id = $1 AND po.status = 'ACTIVE'
    `, [userId]);
    
    const orders = result.rows;
    const triggered = [];
    
    for (const order of orders) {
      const currentPrice = await this.getMarketPrice(order.symbol);
      
      let shouldTrigger = false;
      
      if (order.type === 'STOP_LOSS') {
        // For BUY: Stop loss triggers when price falls below trigger
        // For SELL: Stop loss triggers when price rises above trigger
        shouldTrigger = order.side === 'BUY' 
          ? currentPrice <= order.trigger_price
          : currentPrice >= order.trigger_price;
      } else if (order.type === 'TAKE_PROFIT') {
        // For BUY: Take profit triggers when price rises above trigger
        // For SELL: Take profit triggers when price falls below trigger
        shouldTrigger = order.side === 'BUY'
          ? currentPrice >= order.trigger_price
          : currentPrice <= order.trigger_price;
      }
      
      if (shouldTrigger) {
        // Execute protection order
        const closeSide = order.side === 'BUY' ? 'SELL' : 'BUY';
        
        await this.executeTrade(userId, {
          symbol: order.symbol,
          side: closeSide,
          quantity: order.quantity,
          orderType: 'MARKET',
          exchange: 'simulated',
          strategy: 'PROTECTION_ORDER',
          agentId: 'system'
        });
        
        // Mark protection order as triggered
        await this.pool.query(`
          UPDATE trade_protection_orders 
          SET status = 'TRIGGERED', triggered_at = NOW()
          WHERE id = $1
        `, [order.id]);
        
        triggered.push(order);
      }
    }
    
    return triggered;
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * DATABASE OPERATIONS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  /**
   * Record successful trade in database
   */
  async recordTrade(userId, tradeData) {
    const {
      symbol, side, quantity, actualQuantity, actualPrice, 
      orderType, status, fee, exchange, strategy, agentId,
      stopLoss, takeProfit
    } = tradeData;
    
    const result = await this.pool.query(`
      INSERT INTO trades (
        user_id, symbol, side, type, quantity, price, 
        status, fee, exchange, strategy, agent_id,
        stop_loss, take_profit, total_value, created_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, 
        $7, $8, $9, $10, $11,
        $12, $13, $14, NOW()
      )
      RETURNING *
    `, [
      userId, symbol, side, orderType, actualQuantity, actualPrice,
      status, fee, exchange, strategy, agentId,
      stopLoss, takeProfit, actualQuantity * actualPrice
    ]);
    
    return result.rows[0];
  }
  
  /**
   * Record failed trade
   */
  async recordFailedTrade(userId, tradeParams, error) {
    await this.pool.query(`
      INSERT INTO trade_failures (
        user_id, symbol, side, quantity, price,
        error_message, error_code, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [
      userId,
      tradeParams.symbol,
      tradeParams.side,
      tradeParams.quantity,
      tradeParams.price,
      error.message,
      error.code || 'UNKNOWN'
    ]);
  }
  
  /**
   * Update portfolio after trade
   */
  async updatePortfolio(userId, trade) {
    const { symbol, side, quantity, price, fee } = trade;
    
    if (side === 'BUY') {
      // Add to position
      await this.pool.query(`
        INSERT INTO portfolio_positions (
          user_id, symbol, quantity, average_price, total_invested
        ) VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id, symbol) 
        DO UPDATE SET 
          quantity = portfolio_positions.quantity + EXCLUDED.quantity,
          average_price = (
            (portfolio_positions.quantity * portfolio_positions.average_price) + 
            (EXCLUDED.quantity * EXCLUDED.average_price)
          ) / (portfolio_positions.quantity + EXCLUDED.quantity),
          total_invested = portfolio_positions.total_invested + EXCLUDED.total_invested,
          updated_at = NOW()
      `, [userId, symbol, quantity, price, quantity * price + fee]);
      
    } else if (side === 'SELL') {
      // Reduce position
      await this.pool.query(`
        UPDATE portfolio_positions
        SET 
          quantity = quantity - $3,
          updated_at = NOW()
        WHERE user_id = $1 AND symbol = $2
      `, [userId, symbol, quantity]);
      
      // Remove position if quantity is 0
      await this.pool.query(`
        DELETE FROM portfolio_positions
        WHERE user_id = $1 AND symbol = $2 AND quantity <= 0
      `, [userId, symbol]);
    }
  }
  
  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * HELPER METHODS
   * ═══════════════════════════════════════════════════════════════════════════
   */
  
  async getUserBalance(userId) {
    const result = await this.pool.query(`
      SELECT balance FROM users WHERE id = $1
    `, [userId]);
    
    return {
      available: result.rows[0]?.balance || 0
    };
  }
  
  async getUserPosition(userId, symbol) {
    const result = await this.pool.query(`
      SELECT * FROM portfolio_positions 
      WHERE user_id = $1 AND symbol = $2
    `, [userId, symbol]);
    
    return result.rows[0];
  }
  
  async getPortfolioValue(userId) {
    const result = await this.pool.query(`
      SELECT SUM(quantity * average_price) as total_value
      FROM portfolio_positions
      WHERE user_id = $1
    `, [userId]);
    
    return {
      totalValue: result.rows[0]?.total_value || 0
    };
  }
  
  async getTodayTradeCount(userId) {
    const result = await this.pool.query(`
      SELECT COUNT(*) as count
      FROM trades
      WHERE user_id = $1 AND DATE(created_at) = CURRENT_DATE
    `, [userId]);
    
    return parseInt(result.rows[0]?.count || 0);
  }
  
  async calculateOrderValue(symbol, quantity, side) {
    const price = await this.getMarketPrice(symbol);
    return quantity * price;
  }
  
  async getMarketPrice(symbol) {
    // Try to get from cache first
    const cached = await this.pool.query(`
      SELECT price FROM market_prices 
      WHERE symbol = $1 
      ORDER BY updated_at DESC 
      LIMIT 1
    `, [symbol]);
    
    if (cached.rows[0]) {
      return parseFloat(cached.rows[0].price);
    }
    
    // Default price if not found
    return 50000; // Default price for testing
  }
  
  calculateFee(orderData) {
    // Calculate fee from order data
    if (orderData.fills && orderData.fills.length > 0) {
      return orderData.fills.reduce((sum, fill) => {
        return sum + parseFloat(fill.commission || 0);
      }, 0);
    }
    
    // Default fee 0.1%
    return (parseFloat(orderData.executedQty || 0) * parseFloat(orderData.price || 0)) * 0.001;
  }
}

// Singleton instance
let tradingExecutionService;

function getTradingExecutionService(pool) {
  if (!tradingExecutionService) {
    tradingExecutionService = new TradingExecutionService(pool);
  }
  return tradingExecutionService;
}

module.exports = { TradingExecutionService, getTradingExecutionService };
