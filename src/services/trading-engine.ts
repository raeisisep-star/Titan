/**
 * Real Trading Engine Service
 * Handles order placement, execution, and portfolio management
 */

import { 
  TradingOrderDAO, 
  TradeDAO, 
  PortfolioDAO, 
  PortfolioAssetDAO, 
  TradingStrategyDAO,
  SystemEventDAO 
} from '../dao/database'
import type { TradingOrder, Trade, TradingStrategy } from '../dao/database'

export interface OrderRequest {
  userId: number
  portfolioId: number
  strategyId?: number
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop' | 'stop_limit'
  quantity: number
  price?: number
  stopPrice?: number
  stopLoss?: number
  takeProfit?: number
}

export interface TradeResult {
  success: boolean
  orderId?: number
  tradeId?: number
  executedPrice?: number
  executedQuantity?: number
  fees?: number
  pnl?: number
  error?: string
}

export class TradingEngine {
  private static instance: TradingEngine
  private isProcessingOrders = false

  static getInstance(): TradingEngine {
    if (!TradingEngine.instance) {
      TradingEngine.instance = new TradingEngine()
    }
    return TradingEngine.instance
  }

  private constructor() {
    // Initialize trading engine
    console.log('🚀 Real Trading Engine initialized')
  }

  /**
   * Place a new trading order
   */
  async placeOrder(orderRequest: OrderRequest): Promise<TradeResult> {
    try {
      console.log(`📝 Placing ${orderRequest.side} order for ${orderRequest.quantity} ${orderRequest.symbol}`)

      // Validate order parameters
      const validation = await this.validateOrder(orderRequest)
      if (!validation.valid) {
        return { success: false, error: validation.error }
      }

      // Create order record
      const order = await TradingOrderDAO.create({
        user_id: orderRequest.userId,
        portfolio_id: orderRequest.portfolioId,
        strategy_id: orderRequest.strategyId,
        symbol: orderRequest.symbol,
        side: orderRequest.side,
        type: orderRequest.type,
        quantity: orderRequest.quantity,
        price: orderRequest.price,
        stop_price: orderRequest.stopPrice,
        stop_loss: orderRequest.stopLoss,
        take_profit: orderRequest.takeProfit
      })

      // Log system event
      await SystemEventDAO.log({
        event_type: 'order_created',
        severity: 'info',
        message: `${orderRequest.side.toUpperCase()} order created for ${orderRequest.quantity} ${orderRequest.symbol}`,
        user_id: orderRequest.userId,
        related_entity_type: 'order',
        related_entity_id: order.id,
        details: { orderRequest }
      })

      // Process order execution (simulated for demo)
      const executionResult = await this.executeOrder(order)

      return {
        success: true,
        orderId: order.id,
        tradeId: executionResult.tradeId,
        executedPrice: executionResult.executedPrice,
        executedQuantity: executionResult.executedQuantity,
        fees: executionResult.fees,
        pnl: executionResult.pnl
      }

    } catch (error) {
      console.error('❌ Order placement error:', error)
      return { success: false, error: 'Order placement failed: ' + error.message }
    }
  }

  /**
   * Execute an order (simulate exchange execution)
   */
  private async executeOrder(order: TradingOrder): Promise<TradeResult> {
    try {
      // Get current market price (simulated)
      const marketPrice = await this.getMarketPrice(order.symbol)
      
      // Calculate execution price based on order type
      let executionPrice = marketPrice
      if (order.type === 'limit' && order.price) {
        executionPrice = order.price
      }

      // Calculate fees (0.1% trading fee)
      const fees = (order.quantity * executionPrice) * 0.001
      
      // Update order status to filled
      await TradingOrderDAO.updateStatus(order.id, 'filled', order.quantity, executionPrice)

      // Create trade record
      const trade = await TradeDAO.create({
        user_id: order.user_id,
        portfolio_id: order.portfolio_id,
        strategy_id: order.strategy_id,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        entry_price: executionPrice,
        fees: fees,
        entry_reason: 'Manual order execution'
      })

      // Update portfolio balance and assets
      await this.updatePortfolioAfterTrade(order, executionPrice, fees)

      // Log execution event
      await SystemEventDAO.log({
        event_type: 'order_filled',
        severity: 'info',
        message: `Order filled: ${order.side.toUpperCase()} ${order.quantity} ${order.symbol} at ${executionPrice}`,
        user_id: order.user_id,
        related_entity_type: 'trade',
        related_entity_id: trade.id,
        details: { orderId: order.id, executionPrice, fees }
      })

      console.log(`✅ Order executed: ${order.side} ${order.quantity} ${order.symbol} at ${executionPrice}`)

      return {
        success: true,
        tradeId: trade.id,
        executedPrice: executionPrice,
        executedQuantity: order.quantity,
        fees: fees,
        pnl: 0 // Will be calculated when position is closed
      }

    } catch (error) {
      console.error('❌ Order execution error:', error)
      
      // Update order status to failed
      await TradingOrderDAO.updateStatus(order.id, 'rejected')
      
      throw error
    }
  }

  /**
   * Validate order before placement
   */
  private async validateOrder(orderRequest: OrderRequest): Promise<{ valid: boolean, error?: string }> {
    // Check if symbol is valid
    if (!orderRequest.symbol || orderRequest.symbol.length < 3) {
      return { valid: false, error: 'Invalid trading symbol' }
    }

    // Check quantity
    if (!orderRequest.quantity || orderRequest.quantity <= 0) {
      return { valid: false, error: 'Invalid quantity' }
    }

    // Check portfolio balance
    const portfolio = await PortfolioDAO.findById(orderRequest.portfolioId)
    if (!portfolio) {
      return { valid: false, error: 'Portfolio not found' }
    }

    // For buy orders, check if sufficient balance
    if (orderRequest.side === 'buy') {
      const estimatedCost = orderRequest.quantity * (orderRequest.price || await this.getMarketPrice(orderRequest.symbol))
      if (portfolio.available_balance < estimatedCost) {
        return { valid: false, error: 'Insufficient balance' }
      }
    }

    // For sell orders, check if sufficient assets
    if (orderRequest.side === 'sell') {
      const asset = await PortfolioAssetDAO.findBySymbol(orderRequest.portfolioId, orderRequest.symbol.replace('USDT', ''))
      if (!asset || asset.amount < orderRequest.quantity) {
        return { valid: false, error: 'Insufficient assets' }
      }
    }

    return { valid: true }
  }

  /**
   * Get current market price for a symbol (simulated)
   */
  private async getMarketPrice(symbol: string): Promise<number> {
    // In production, this would call real exchange APIs
    const mockPrices: Record<string, number> = {
      'BTCUSDT': 45000 + (Math.random() - 0.5) * 2000,
      'ETHUSDT': 2900 + (Math.random() - 0.5) * 200,
      'SOLUSDT': 98 + (Math.random() - 0.5) * 10,
      'ADAUSDT': 0.48 + (Math.random() - 0.5) * 0.05,
      'DOTUSDT': 7.8 + (Math.random() - 0.5) * 0.8
    }

    return mockPrices[symbol] || 1.0 + Math.random() * 100
  }

  /**
   * Update portfolio after successful trade
   */
  private async updatePortfolioAfterTrade(order: TradingOrder, executionPrice: number, fees: number): Promise<void> {
    try {
      const totalValue = order.quantity * executionPrice
      const baseSymbol = order.symbol.replace('USDT', '')

      if (order.side === 'buy') {
        // Deduct USDT balance
        const portfolio = await PortfolioDAO.findById(order.portfolio_id)
        const newBalance = portfolio.available_balance - totalValue - fees
        await PortfolioDAO.updateBalance(order.portfolio_id, portfolio.balance_usd - totalValue - fees, newBalance)

        // Add asset to portfolio
        await PortfolioAssetDAO.upsertAsset(order.portfolio_id, baseSymbol, order.quantity, executionPrice)

      } else if (order.side === 'sell') {
        // Add USDT balance
        const portfolio = await PortfolioDAO.findById(order.portfolio_id)
        const newBalance = portfolio.available_balance + totalValue - fees
        await PortfolioDAO.updateBalance(order.portfolio_id, portfolio.balance_usd + totalValue - fees, newBalance)

        // Reduce asset amount
        const asset = await PortfolioAssetDAO.findBySymbol(order.portfolio_id, baseSymbol)
        if (asset) {
          const newAmount = asset.amount - order.quantity
          if (newAmount <= 0) {
            // Asset completely sold - could delete record or set to 0
            await PortfolioAssetDAO.upsertAsset(order.portfolio_id, baseSymbol, 0, asset.avg_buy_price)
          } else {
            await PortfolioAssetDAO.upsertAsset(order.portfolio_id, baseSymbol, newAmount, asset.avg_buy_price)
          }
        }
      }

      console.log(`💰 Portfolio updated after ${order.side} ${order.quantity} ${order.symbol}`)

    } catch (error) {
      console.error('❌ Portfolio update error:', error)
      throw error
    }
  }

  /**
   * Cancel an open order
   */
  async cancelOrder(userId: number, orderId: number): Promise<TradeResult> {
    try {
      const order = await TradingOrderDAO.findById(orderId)
      
      if (!order) {
        return { success: false, error: 'Order not found' }
      }

      if (order.user_id !== userId) {
        return { success: false, error: 'Unauthorized' }
      }

      if (order.status !== 'open' && order.status !== 'pending') {
        return { success: false, error: 'Order cannot be cancelled' }
      }

      // Update order status
      await TradingOrderDAO.updateStatus(orderId, 'canceled')

      // Log cancellation
      await SystemEventDAO.log({
        event_type: 'order_cancelled',
        severity: 'info',
        message: `Order cancelled: ${order.side.toUpperCase()} ${order.quantity} ${order.symbol}`,
        user_id: userId,
        related_entity_type: 'order',
        related_entity_id: orderId
      })

      return { success: true }

    } catch (error) {
      console.error('❌ Order cancellation error:', error)
      return { success: false, error: 'Order cancellation failed' }
    }
  }

  /**
   * Get user's open orders
   */
  async getOpenOrders(userId: number): Promise<TradingOrder[]> {
    try {
      const allOrders = await TradingOrderDAO.findByUserId(userId)
      return allOrders.filter(order => order.status === 'open' || order.status === 'pending')
    } catch (error) {
      console.error('❌ Get open orders error:', error)
      return []
    }
  }

  /**
   * Get trading statistics for a user
   */
  async getTradingStats(userId: number): Promise<any> {
    try {
      const trades = await TradeDAO.findByUserId(userId)
      const orders = await TradingOrderDAO.findByUserId(userId)

      const completedTrades = trades.filter(t => t.exit_price !== null)
      const winningTrades = completedTrades.filter(t => t.net_pnl > 0)
      
      return {
        totalTrades: trades.length,
        completedTrades: completedTrades.length,
        openTrades: trades.length - completedTrades.length,
        winningTrades: winningTrades.length,
        losingTrades: completedTrades.length - winningTrades.length,
        winRate: completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0,
        totalPnL: trades.reduce((sum, t) => sum + (t.net_pnl || 0), 0),
        totalFees: trades.reduce((sum, t) => sum + (t.fees || 0), 0),
        totalOrders: orders.length,
        filledOrders: orders.filter(o => o.status === 'filled').length,
        cancelledOrders: orders.filter(o => o.status === 'canceled').length
      }
    } catch (error) {
      console.error('❌ Trading stats error:', error)
      return {
        totalTrades: 0,
        completedTrades: 0,
        openTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        totalFees: 0,
        totalOrders: 0,
        filledOrders: 0,
        cancelledOrders: 0
      }
    }
  }

  /**
   * Process strategy-based trading
   */
  async executeStrategy(strategyId: number): Promise<TradeResult[]> {
    try {
      const strategy = await TradingStrategyDAO.findById(strategyId)
      
      if (!strategy || strategy.status !== 'active') {
        return [{ success: false, error: 'Strategy not found or inactive' }]
      }

      console.log(`🎯 Executing strategy: ${strategy.name}`)

      // Process strategy logic based on type
      const results: TradeResult[] = []
      
      switch (strategy.type) {
        case 'dca':
          results.push(...await this.executeDCAStrategy(strategy))
          break
        case 'grid':
          results.push(...await this.executeGridStrategy(strategy))
          break
        case 'scalping':
          results.push(...await this.executeScalpingStrategy(strategy))
          break
        default:
          results.push({ success: false, error: 'Unknown strategy type' })
      }

      return results

    } catch (error) {
      console.error('❌ Strategy execution error:', error)
      return [{ success: false, error: 'Strategy execution failed' }]
    }
  }

  /**
   * Execute DCA (Dollar Cost Averaging) strategy
   */
  private async executeDCAStrategy(strategy: TradingStrategy): Promise<TradeResult[]> {
    const config = typeof strategy.config === 'string' ? JSON.parse(strategy.config) : strategy.config
    const { buyAmount, intervalHours, targetSymbol } = config
    
    // Simple DCA logic: buy fixed amount at regular intervals
    const orderRequest: OrderRequest = {
      userId: strategy.user_id,
      portfolioId: 1, // Assume main portfolio
      strategyId: strategy.id,
      symbol: targetSymbol || strategy.symbol,
      side: 'buy',
      type: 'market',
      quantity: buyAmount || 100 // Default $100
    }

    const result = await this.placeOrder(orderRequest)
    return [result]
  }

  /**
   * Execute Grid trading strategy
   */
  private async executeGridStrategy(strategy: TradingStrategy): Promise<TradeResult[]> {
    const config = typeof strategy.config === 'string' ? JSON.parse(strategy.config) : strategy.config
    const { gridLevels, gridSpacing, baseAmount } = config
    
    // Simplified grid logic
    const results: TradeResult[] = []
    const currentPrice = await this.getMarketPrice(strategy.symbol)
    
    // Place buy orders below current price
    for (let i = 1; i <= Math.floor(gridLevels / 2); i++) {
      const buyPrice = currentPrice * (1 - (gridSpacing * i) / 100)
      const orderRequest: OrderRequest = {
        userId: strategy.user_id,
        portfolioId: 1,
        strategyId: strategy.id,
        symbol: strategy.symbol,
        side: 'buy',
        type: 'limit',
        quantity: baseAmount,
        price: buyPrice
      }
      
      results.push(await this.placeOrder(orderRequest))
    }

    return results
  }

  /**
   * Execute Scalping strategy
   */
  private async executeScalpingStrategy(strategy: TradingStrategy): Promise<TradeResult[]> {
    const config = typeof strategy.config === 'string' ? JSON.parse(strategy.config) : strategy.config
    const { quickProfitTarget, stopLossPercent, tradeAmount } = config
    
    // Simple scalping logic: quick in and out
    const orderRequest: OrderRequest = {
      userId: strategy.user_id,
      portfolioId: 1,
      strategyId: strategy.id,
      symbol: strategy.symbol,
      side: 'buy',
      type: 'market',
      quantity: tradeAmount || 50,
      takeProfit: await this.getMarketPrice(strategy.symbol) * (1 + (quickProfitTarget || 0.5) / 100),
      stopLoss: await this.getMarketPrice(strategy.symbol) * (1 - (stopLossPercent || 1) / 100)
    }

    const result = await this.placeOrder(orderRequest)
    return [result]
  }
}

// Export singleton instance
export const tradingEngine = TradingEngine.getInstance()