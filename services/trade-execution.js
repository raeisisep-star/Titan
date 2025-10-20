/**
 * ═══════════════════════════════════════════════════════════════════════════
 * 💹 TRADE EXECUTION SERVICE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * سرویس اجرای معاملات واقعی که:
 * - با صرافی‌ها ارتباط برقرار می‌کنه (Binance, MEXC)
 * - Order placement می‌کنه
 * - Portfolio رو update می‌کنه
 * - Trade history رو log می‌کنه
 */

const axios = require('axios');
const crypto = require('crypto');

class TradeExecutionService {
  constructor(pool, riskManagement) {
    this.pool = pool;
    this.riskManagement = riskManagement;
    
    // Exchange configurations
    this.exchanges = {
      binance: {
        apiUrl: 'https://api.binance.com',
        apiKey: process.env.BINANCE_API_KEY,
        secretKey: process.env.BINANCE_SECRET_KEY,
        enabled: false
      },
      mexc: {
        apiUrl: 'https://api.mexc.com',
        apiKey: process.env.MEXC_API_KEY,
        secretKey: process.env.MEXC_SECRET_KEY,
        enabled: false
      }
    };

    // Check which exchanges are configured
    this.exchanges.binance.enabled = !!(this.exchanges.binance.apiKey && 
                                       this.exchanges.binance.apiKey !== 'YOUR_BINANCE_API_KEY');
    this.exchanges.mexc.enabled = !!(this.exchanges.mexc.apiKey && 
                                    this.exchanges.mexc.apiKey !== 'YOUR_MEXC_API_KEY');

    console.log('💹 Trade Execution Service initialized');
    console.log('   Binance:', this.exchanges.binance.enabled ? '✅' : '❌');
    console.log('   MEXC:', this.exchanges.mexc.enabled ? '✅' : '❌');
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * EXECUTE TRADE - Main entry point
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async executeTrade(userId, tradeData) {
    try {
      const {
        symbol,
        side,          // 'buy' or 'sell'
        type = 'market', // 'market', 'limit', 'stop_loss', 'take_profit'
        quantity,
        price,         // For limit orders
        stopLoss,
        takeProfit,
        autopilotSessionId,
        strategy,
        agentId
      } = tradeData;

      console.log(`💹 Executing trade for user ${userId}:`, {
        symbol,
        side,
        type,
        quantity
      });

      // 1. Validate trade with risk management
      const validation = await this.riskManagement.validateTrade(userId, {
        symbol,
        quantity,
        price: price || await this.getCurrentPrice(symbol),
        entryPrice: price,
        stopLoss,
        takeProfit
      });

      if (!validation.passed) {
        throw new Error(`Trade validation failed: ${validation.message}`);
      }

      // 2. Execute order on exchange (or mock)
      const order = await this.placeOrder(userId, {
        symbol,
        side,
        type,
        quantity,
        price
      });

      // 3. Update portfolio
      await this.updatePortfolio(userId, {
        symbol,
        side,
        quantity: order.executedQuantity,
        price: order.executedPrice
      });

      // 4. Log trade in database
      const trade = await this.logTrade(userId, {
        symbol,
        side,
        type,
        quantity: order.executedQuantity,
        price: order.executedPrice,
        status: order.status,
        orderId: order.orderId,
        autopilotSessionId,
        strategy,
        agentId,
        stopLoss,
        takeProfit
      });

      // 5. Set stop-loss and take-profit orders if specified
      if (stopLoss) {
        await this.setStopLoss(userId, trade.id, symbol, quantity, stopLoss);
      }

      if (takeProfit) {
        await this.setTakeProfit(userId, trade.id, symbol, quantity, takeProfit);
      }

      return {
        success: true,
        trade,
        order,
        validation
      };

    } catch (error) {
      console.error('❌ Error executing trade:', error);
      
      // Log failed trade attempt
      await this.logFailedTrade(userId, tradeData, error.message);
      
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PLACE ORDER - Execute on exchange
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async placeOrder(userId, orderData) {
    const { symbol, side, type, quantity, price } = orderData;

    // Check if real exchange is available
    if (this.exchanges.binance.enabled) {
      return await this.placeBinanceOrder(orderData);
    } else if (this.exchanges.mexc.enabled) {
      return await this.placeMEXCOrder(orderData);
    } else {
      // Mock order execution
      return await this.placeMockOrder(orderData);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PLACE BINANCE ORDER
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async placeBinanceOrder(orderData) {
    try {
      const { symbol, side, type, quantity, price } = orderData;
      
      const timestamp = Date.now();
      const params = {
        symbol: symbol.replace('/', ''),
        side: side.toUpperCase(),
        type: type.toUpperCase(),
        quantity,
        timestamp
      };

      if (type === 'limit') {
        params.price = price;
        params.timeInForce = 'GTC'; // Good Till Cancel
      }

      // Create signature
      const queryString = Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&');
      
      const signature = crypto
        .createHmac('sha256', this.exchanges.binance.secretKey)
        .update(queryString)
        .digest('hex');

      // Make API call
      const response = await axios.post(
        `${this.exchanges.binance.apiUrl}/api/v3/order`,
        null,
        {
          params: {
            ...params,
            signature
          },
          headers: {
            'X-MBX-APIKEY': this.exchanges.binance.apiKey
          }
        }
      );

      return {
        orderId: response.data.orderId.toString(),
        status: response.data.status.toLowerCase(),
        executedQuantity: parseFloat(response.data.executedQty),
        executedPrice: parseFloat(response.data.price || response.data.fills[0]?.price || 0),
        exchange: 'binance',
        timestamp: new Date(response.data.transactTime)
      };

    } catch (error) {
      console.error('❌ Binance order failed:', error.response?.data || error.message);
      throw new Error(`Binance order failed: ${error.response?.data?.msg || error.message}`);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PLACE MEXC ORDER
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async placeMEXCOrder(orderData) {
    try {
      const { symbol, side, type, quantity, price } = orderData;
      
      // MEXC implementation (similar to Binance but with different API structure)
      // Placeholder for now
      
      return await this.placeMockOrder(orderData);

    } catch (error) {
      console.error('❌ MEXC order failed:', error);
      throw new Error(`MEXC order failed: ${error.message}`);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * PLACE MOCK ORDER (For testing)
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async placeMockOrder(orderData) {
    const { symbol, side, type, quantity, price } = orderData;
    
    // Simulate order execution
    const currentPrice = price || await this.getCurrentPrice(symbol);
    const slippage = type === 'market' ? currentPrice * 0.001 : 0; // 0.1% slippage for market orders
    
    const executedPrice = side === 'buy' 
      ? currentPrice + slippage
      : currentPrice - slippage;

    // Simulate execution delay
    await new Promise(resolve => setTimeout(resolve, 100));

    return {
      orderId: `MOCK_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'filled',
      executedQuantity: quantity,
      executedPrice,
      exchange: 'mock',
      timestamp: new Date()
    };
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * GET CURRENT PRICE
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async getCurrentPrice(symbol) {
    try {
      // Try to get real price from Binance
      if (this.exchanges.binance.enabled || true) { // Always try public endpoint
        const response = await axios.get(
          `${this.exchanges.binance.apiUrl}/api/v3/ticker/price`,
          {
            params: { symbol: symbol.replace('/', '') }
          }
        );
        
        return parseFloat(response.data.price);
      }
    } catch (error) {
      console.log('⚠️  Using mock price for', symbol);
    }

    // Mock prices
    const mockPrices = {
      'BTCUSDT': 45000 + (Math.random() - 0.5) * 1000,
      'BTC/USDT': 45000 + (Math.random() - 0.5) * 1000,
      'ETHUSDT': 3000 + (Math.random() - 0.5) * 100,
      'ETH/USDT': 3000 + (Math.random() - 0.5) * 100,
      'SOLUSDT': 100 + (Math.random() - 0.5) * 5,
      'SOL/USDT': 100 + (Math.random() - 0.5) * 5,
      'BNBUSDT': 300 + (Math.random() - 0.5) * 10,
      'BNB/USDT': 300 + (Math.random() - 0.5) * 10,
      'ADAUSDT': 0.5 + (Math.random() - 0.5) * 0.05,
      'ADA/USDT': 0.5 + (Math.random() - 0.5) * 0.05
    };

    return mockPrices[symbol] || 1;
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * UPDATE PORTFOLIO
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async updatePortfolio(userId, tradeData) {
    const { symbol, side, quantity, price } = tradeData;

    try {
      // Check if position exists
      const existing = await this.pool.query(`
        SELECT * FROM portfolio
        WHERE user_id = $1 AND symbol = $2
      `, [userId, symbol]);

      if (side === 'buy') {
        if (existing.rows.length > 0) {
          // Update existing position
          const current = existing.rows[0];
          const newQuantity = parseFloat(current.quantity) + quantity;
          const newAverageCost = (
            (parseFloat(current.average_price) * parseFloat(current.quantity)) + 
            (price * quantity)
          ) / newQuantity;

          await this.pool.query(`
            UPDATE portfolio
            SET 
              quantity = $1,
              average_price = $2,
              current_price = $3,
              total_value = $1 * $3,
              profit_loss = ($3 - $2) * $1,
              profit_loss_percentage = (($3 - $2) / $2) * 100,
              last_updated = NOW()
            WHERE user_id = $4 AND symbol = $5
          `, [newQuantity, newAverageCost, price, userId, symbol]);
        } else {
          // Create new position
          await this.pool.query(`
            INSERT INTO portfolio (
              user_id,
              symbol,
              quantity,
              average_price,
              current_price,
              total_value,
              profit_loss,
              profit_loss_percentage
            ) VALUES ($1, $2, $3, $4, $4, $3 * $4, 0, 0)
          `, [userId, symbol, quantity, price]);
        }
      } else if (side === 'sell') {
        if (existing.rows.length > 0) {
          const current = existing.rows[0];
          const newQuantity = parseFloat(current.quantity) - quantity;

          if (newQuantity <= 0) {
            // Close position
            await this.pool.query(`
              DELETE FROM portfolio
              WHERE user_id = $1 AND symbol = $2
            `, [userId, symbol]);
          } else {
            // Reduce position
            await this.pool.query(`
              UPDATE portfolio
              SET 
                quantity = $1,
                current_price = $2,
                total_value = $1 * $2,
                profit_loss = ($2 - average_price) * $1,
                profit_loss_percentage = (($2 - average_price) / average_price) * 100,
                last_updated = NOW()
              WHERE user_id = $3 AND symbol = $4
            `, [newQuantity, price, userId, symbol]);
          }
        }
      }

      console.log(`✅ Portfolio updated for ${symbol}: ${side} ${quantity} @ ${price}`);

    } catch (error) {
      console.error('❌ Error updating portfolio:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * LOG TRADE
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async logTrade(userId, tradeData) {
    try {
      const result = await this.pool.query(`
        INSERT INTO trades (
          user_id,
          symbol,
          type,
          side,
          quantity,
          price,
          total_value,
          fee,
          fee_currency,
          status,
          order_id,
          autopilot_session_id,
          strategy,
          agent_id,
          stop_loss,
          take_profit
        ) VALUES ($1, $2, $3, $4, $5, $6, $5 * $6, 0, 'USDT', $7, $8, $9, $10, $11, $12, $13)
        RETURNING *
      `, [
        userId,
        tradeData.symbol,
        tradeData.type,
        tradeData.side,
        tradeData.quantity,
        tradeData.price,
        tradeData.status,
        tradeData.orderId,
        tradeData.autopilotSessionId || null,
        tradeData.strategy || null,
        tradeData.agentId || null,
        tradeData.stopLoss || null,
        tradeData.takeProfit || null
      ]);

      return result.rows[0];

    } catch (error) {
      console.error('❌ Error logging trade:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * LOG FAILED TRADE
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async logFailedTrade(userId, tradeData, errorMessage) {
    try {
      await this.pool.query(`
        INSERT INTO trades (
          user_id,
          symbol,
          type,
          side,
          quantity,
          price,
          status,
          error_message
        ) VALUES ($1, $2, $3, $4, $5, $6, 'failed', $7)
      `, [
        userId,
        tradeData.symbol,
        tradeData.type || 'market',
        tradeData.side,
        tradeData.quantity || 0,
        tradeData.price || 0,
        errorMessage
      ]);
    } catch (error) {
      console.error('❌ Error logging failed trade:', error);
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * SET STOP-LOSS ORDER
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async setStopLoss(userId, tradeId, symbol, quantity, stopLossPrice) {
    try {
      console.log(`🛑 Setting stop-loss for ${symbol} at ${stopLossPrice}`);

      // Store stop-loss in database for monitoring
      await this.pool.query(`
        UPDATE trades
        SET stop_loss = $1
        WHERE id = $2
      `, [stopLossPrice, tradeId]);

      // In real implementation, this would place a stop-loss order on the exchange
      // For now, we'll monitor it in the autopilot engine

      return {
        success: true,
        stopLossPrice
      };

    } catch (error) {
      console.error('❌ Error setting stop-loss:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * SET TAKE-PROFIT ORDER
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async setTakeProfit(userId, tradeId, symbol, quantity, takeProfitPrice) {
    try {
      console.log(`🎯 Setting take-profit for ${symbol} at ${takeProfitPrice}`);

      // Store take-profit in database for monitoring
      await this.pool.query(`
        UPDATE trades
        SET take_profit = $1
        WHERE id = $2
      `, [takeProfitPrice, tradeId]);

      // In real implementation, this would place a take-profit order on the exchange
      // For now, we'll monitor it in the autopilot engine

      return {
        success: true,
        takeProfitPrice
      };

    } catch (error) {
      console.error('❌ Error setting take-profit:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * GET EXCHANGE BALANCE
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async getExchangeBalance(exchange = 'binance') {
    try {
      if (!this.exchanges[exchange].enabled) {
        throw new Error(`${exchange} not configured`);
      }

      if (exchange === 'binance') {
        return await this.getBinanceBalance();
      } else if (exchange === 'mexc') {
        return await this.getMEXCBalance();
      }

    } catch (error) {
      console.error(`❌ Error getting ${exchange} balance:`, error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * GET BINANCE BALANCE
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async getBinanceBalance() {
    try {
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      
      const signature = crypto
        .createHmac('sha256', this.exchanges.binance.secretKey)
        .update(queryString)
        .digest('hex');

      const response = await axios.get(
        `${this.exchanges.binance.apiUrl}/api/v3/account`,
        {
          params: {
            timestamp,
            signature
          },
          headers: {
            'X-MBX-APIKEY': this.exchanges.binance.apiKey
          }
        }
      );

      return response.data.balances
        .filter(b => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
        .map(b => ({
          asset: b.asset,
          free: parseFloat(b.free),
          locked: parseFloat(b.locked),
          total: parseFloat(b.free) + parseFloat(b.locked)
        }));

    } catch (error) {
      console.error('❌ Error getting Binance balance:', error);
      throw error;
    }
  }

  /**
   * ═══════════════════════════════════════════════════════════════════════════
   * CANCEL ORDER
   * ═══════════════════════════════════════════════════════════════════════════
   */
  async cancelOrder(orderId, exchange = 'binance') {
    try {
      console.log(`❌ Cancelling order ${orderId} on ${exchange}`);

      // Implementation for canceling orders on exchange
      // For now, just mark as cancelled in database

      await this.pool.query(`
        UPDATE trades
        SET status = 'cancelled'
        WHERE order_id = $1
      `, [orderId]);

      return { success: true };

    } catch (error) {
      console.error('❌ Error cancelling order:', error);
      throw error;
    }
  }
}

// Singleton instance
let tradeExecutionServiceInstance = null;

function getTradeExecutionService(pool, riskManagement) {
  if (!tradeExecutionServiceInstance) {
    tradeExecutionServiceInstance = new TradeExecutionService(pool, riskManagement);
  }
  return tradeExecutionServiceInstance;
}

module.exports = {
  TradeExecutionService,
  getTradeExecutionService
};
