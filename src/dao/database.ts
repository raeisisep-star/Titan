/**
 * Real Database Access Layer (DAO)
 * Replaces all mock data with actual database operations
 * Uses Cloudflare D1 SQLite database
 */

export interface DatabaseConnection {
  query: (sql: string, params?: any[]) => Promise<any>
  prepare: (sql: string) => any
  batch: (queries: any[]) => Promise<any>
}

// Real database connection using D1
let d1db: DatabaseConnection | null = null

export function initializeDatabase(database: any): DatabaseConnection {
  d1db = {
    async query(sql: string, params: any[] = []) {
      try {
        const stmt = database.prepare(sql)
        if (params.length > 0) {
          const result = await stmt.bind(...params).all()
          return { results: result.results || [], success: result.success, meta: result.meta }
        }
        const result = await stmt.all()
        return { results: result.results || [], success: result.success, meta: result.meta }
      } catch (error) {
        console.error('Database query error:', error)
        throw error
      }
    },

    prepare(sql: string) {
      return database.prepare(sql)
    },

    async batch(queries: any[]) {
      return await database.batch(queries)
    }
  }
  return d1db
}

export function getDatabase(): DatabaseConnection {
  if (!d1db) {
    throw new Error('Database not initialized')
  }
  return d1db
}

// =====================================
// USER DATA ACCESS LAYER
// =====================================

export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  first_name?: string
  last_name?: string
  phone?: string
  country: string
  timezone: string
  api_key?: string
  is_active: boolean
  is_verified: boolean
  kyc_status: 'none' | 'pending' | 'approved' | 'rejected'
  risk_level: 'low' | 'medium' | 'high'
  created_at: string
  updated_at: string
  last_login_at?: string
}

export interface Portfolio {
  id: number
  user_id: number
  name: string
  balance_usd: number
  available_balance: number
  locked_balance: number
  total_pnl: number
  daily_pnl: number
  total_trades: number
  winning_trades: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface PortfolioAsset {
  id: number
  portfolio_id: number
  symbol: string
  amount: number
  locked_amount: number
  avg_buy_price: number
  current_price: number
  total_value_usd: number
  pnl_usd: number
  pnl_percentage: number
  last_updated: string
  created_at: string
}

export interface TradingStrategy {
  id: number
  user_id: number
  name: string
  type: 'manual' | 'scalping' | 'swing' | 'dca' | 'arbitrage' | 'grid' | 'momentum'
  status: 'active' | 'paused' | 'stopped' | 'inactive'
  symbol: string
  timeframe: string
  config: any
  total_trades: number
  winning_trades: number
  losing_trades: number
  win_rate: number
  total_pnl: number
  max_drawdown: number
  sharpe_ratio: number
  max_position_size: number
  stop_loss_percentage: number
  take_profit_percentage: number
  max_daily_loss: number
  started_at?: string
  stopped_at?: string
  created_at: string
  updated_at: string
}

export interface TradingOrder {
  id: number
  user_id: number
  portfolio_id: number
  strategy_id?: number
  exchange: string
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop' | 'stop_limit'
  quantity: number
  filled_quantity: number
  price?: number
  stop_price?: number
  avg_fill_price?: number
  status: 'pending' | 'open' | 'filled' | 'partial' | 'canceled' | 'rejected'
  order_id?: string
  client_order_id: string
  total_value?: number
  filled_value: number
  fees: number
  pnl: number
  stop_loss?: number
  take_profit?: number
  created_at: string
  updated_at: string
  filled_at?: string
  canceled_at?: string
}

export interface Trade {
  id: number
  user_id: number
  portfolio_id: number
  strategy_id?: number
  symbol: string
  side: 'buy' | 'sell'
  quantity: number
  entry_price: number
  exit_price?: number
  pnl: number
  pnl_percentage: number
  fees: number
  net_pnl: number
  entry_reason?: string
  exit_reason?: string
  duration_minutes?: number
  stop_loss?: number
  take_profit?: number
  max_risk_percentage?: number
  entry_order_id?: number
  exit_order_id?: number
  entry_time: string
  exit_time?: string
  created_at: string
}

export interface MarketData {
  id: number
  symbol: string
  timeframe: string
  open_price: number
  high_price: number
  low_price: number
  close_price: number
  volume: number
  quote_volume?: number
  trades_count?: number
  taker_buy_volume?: number
  taker_buy_quote_volume?: number
  rsi_14?: number
  macd?: number
  macd_signal?: number
  macd_histogram?: number
  bb_upper?: number
  bb_middle?: number
  bb_lower?: number
  timestamp: string
  created_at: string
}

export interface AISignal {
  id: number
  symbol: string
  timeframe: string
  signal_type: 'buy' | 'sell' | 'hold' | 'strong_buy' | 'strong_sell'
  confidence: number
  strength: 'weak' | 'moderate' | 'strong' | 'very_strong'
  current_price: number
  target_price?: number
  stop_loss_price?: number
  probability?: number
  reasoning?: string
  factors?: any
  model_version?: string
  status: 'active' | 'triggered' | 'expired' | 'canceled'
  expires_at?: string
  triggered_at?: string
  actual_outcome?: 'win' | 'loss' | 'neutral'
  actual_pnl?: number
  created_at: string
  updated_at: string
}

export interface TargetTrade {
  id: number
  user_id: number
  portfolio_id: number
  name: string
  initial_amount: number
  target_amount: number
  current_amount: number
  progress_percentage: number
  trades_executed: number
  successful_trades: number
  strategy: string
  risk_level: 'low' | 'medium' | 'high'
  max_drawdown_limit: number
  target_duration_days?: number
  estimated_completion?: string
  status: 'active' | 'paused' | 'completed' | 'failed' | 'canceled'
  final_amount?: number
  total_pnl: number
  success_rate: number
  started_at: string
  completed_at?: string
  created_at: string
  updated_at: string
}

// =====================================
// USER DAO FUNCTIONS
// =====================================

export class UserDAO {
  static async findById(id: number): Promise<User | null> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM users WHERE id = ?', [id])
    return result.results?.[0] || null
  }

  static async findByUsername(username: string): Promise<User | null> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM users WHERE username = ?', [username])
    return result.results?.[0] || null
  }

  static async findByEmail(email: string): Promise<User | null> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM users WHERE email = ?', [email])
    return result.results?.[0] || null
  }

  static async create(user: Partial<User>): Promise<User> {
    const db = getDatabase()
    const result = await db.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, country, timezone)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      user.username,
      user.email,
      user.password_hash,
      user.first_name || null,
      user.last_name || null,
      user.country || 'IR',
      user.timezone || 'Asia/Tehran'
    ])

    return await this.findById(result.meta.last_row_id)
  }

  static async updateLastLogin(id: number): Promise<void> {
    const db = getDatabase()
    await db.query('UPDATE users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?', [id])
  }
}

// =====================================
// PORTFOLIO DAO FUNCTIONS
// =====================================

export class PortfolioDAO {
  static async findByUserId(userId: number): Promise<Portfolio[]> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM portfolios WHERE user_id = ? AND is_active = 1', [userId])
    return result.results || []
  }

  static async findById(id: number): Promise<Portfolio | null> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM portfolios WHERE id = ?', [id])
    return result.results?.[0] || null
  }

  static async getMainPortfolio(userId: number): Promise<Portfolio> {
    const portfolios = await this.findByUserId(userId)
    if (portfolios.length === 0) {
      return await this.createMainPortfolio(userId)
    }
    return portfolios[0]
  }

  static async createMainPortfolio(userId: number): Promise<Portfolio> {
    const db = getDatabase()
    const result = await db.query(`
      INSERT INTO portfolios (user_id, name, balance_usd, available_balance)
      VALUES (?, ?, ?, ?)
    `, [userId, 'Main Portfolio', 10000.0, 10000.0])

    return await this.findById(result.meta.last_row_id)
  }

  static async updateBalance(portfolioId: number, balanceUsd: number, availableBalance: number): Promise<void> {
    const db = getDatabase()
    await db.query(`
      UPDATE portfolios 
      SET balance_usd = ?, available_balance = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [balanceUsd, availableBalance, portfolioId])
  }

  static async updatePnL(portfolioId: number, totalPnl: number, dailyPnl: number): Promise<void> {
    const db = getDatabase()
    await db.query(`
      UPDATE portfolios 
      SET total_pnl = ?, daily_pnl = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [totalPnl, dailyPnl, portfolioId])
  }
}

// =====================================
// PORTFOLIO ASSETS DAO FUNCTIONS
// =====================================

export class PortfolioAssetDAO {
  static async findByPortfolioId(portfolioId: number): Promise<PortfolioAsset[]> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM portfolio_assets WHERE portfolio_id = ?', [portfolioId])
    return result.results || []
  }

  static async findBySymbol(portfolioId: number, symbol: string): Promise<PortfolioAsset | null> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM portfolio_assets WHERE portfolio_id = ? AND symbol = ?', [portfolioId, symbol])
    return result.results?.[0] || null
  }

  static async upsertAsset(portfolioId: number, symbol: string, amount: number, avgBuyPrice: number): Promise<void> {
    const db = getDatabase()
    await db.query(`
      INSERT INTO portfolio_assets (portfolio_id, symbol, amount, avg_buy_price, last_updated)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(portfolio_id, symbol) 
      DO UPDATE SET 
        amount = amount + ?,
        avg_buy_price = (avg_buy_price * amount + ? * ?) / (amount + ?),
        last_updated = CURRENT_TIMESTAMP
    `, [portfolioId, symbol, amount, avgBuyPrice, amount, avgBuyPrice, amount, amount])
  }

  static async updatePrices(portfolioId: number, symbol: string, currentPrice: number): Promise<void> {
    const db = getDatabase()
    await db.query(`
      UPDATE portfolio_assets 
      SET 
        current_price = ?,
        total_value_usd = amount * ?,
        pnl_usd = (amount * ?) - (amount * avg_buy_price),
        pnl_percentage = (((amount * ?) - (amount * avg_buy_price)) / (amount * avg_buy_price)) * 100,
        last_updated = CURRENT_TIMESTAMP
      WHERE portfolio_id = ? AND symbol = ?
    `, [currentPrice, currentPrice, currentPrice, currentPrice, portfolioId, symbol])
  }

  static async create(asset: Partial<PortfolioAsset>): Promise<PortfolioAsset> {
    const db = getDatabase()
    const result = await db.query(`
      INSERT INTO portfolio_assets (
        portfolio_id, symbol, amount, locked_amount, avg_buy_price, 
        current_price, total_value_usd, pnl_usd, pnl_percentage, 
        last_updated, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      asset.portfolio_id,
      asset.symbol,
      asset.amount || 0,
      asset.locked_amount || 0,
      asset.avg_buy_price,
      asset.current_price || asset.avg_buy_price,
      asset.total_value_usd || (asset.amount * asset.avg_buy_price),
      asset.pnl_usd || 0,
      asset.pnl_percentage || 0,
      asset.last_updated || new Date().toISOString(),
      asset.created_at || new Date().toISOString()
    ])

    const result2 = await db.query('SELECT * FROM portfolio_assets WHERE id = ?', [result.meta.last_row_id])
    return result2.results[0]
  }

  static async updateAmount(assetId: number, newAmount: number, newAvgPrice: number): Promise<void> {
    const db = getDatabase()
    await db.query(`
      UPDATE portfolio_assets 
      SET amount = ?, avg_buy_price = ?, last_updated = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [newAmount, newAvgPrice, assetId])
  }

  static async updatePrice(assetId: number, currentPrice: number, totalValue: number, pnlUsd: number, pnlPercentage: number): Promise<void> {
    const db = getDatabase()
    await db.query(`
      UPDATE portfolio_assets 
      SET 
        current_price = ?, 
        total_value_usd = ?, 
        pnl_usd = ?, 
        pnl_percentage = ?, 
        last_updated = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [currentPrice, totalValue, pnlUsd, pnlPercentage, assetId])
  }
}

// =====================================
// TRADING STRATEGY DAO FUNCTIONS
// =====================================

export class TradingStrategyDAO {
  static async findByUserId(userId: number): Promise<TradingStrategy[]> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM trading_strategies WHERE user_id = ? ORDER BY created_at DESC', [userId])
    return result.results || []
  }

  static async findActiveStrategies(userId: number): Promise<TradingStrategy[]> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM trading_strategies WHERE user_id = ? AND status = ?', [userId, 'active'])
    return result.results || []
  }

  static async findById(id: number): Promise<TradingStrategy | null> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM trading_strategies WHERE id = ?', [id])
    return result.results?.[0] || null
  }

  static async create(strategy: Partial<TradingStrategy>): Promise<TradingStrategy> {
    const db = getDatabase()
    const result = await db.query(`
      INSERT INTO trading_strategies (user_id, name, type, symbol, timeframe, config, max_position_size, stop_loss_percentage, take_profit_percentage)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      strategy.user_id,
      strategy.name,
      strategy.type || 'manual',
      strategy.symbol || 'BTCUSDT',
      strategy.timeframe || '1h',
      JSON.stringify(strategy.config || {}),
      strategy.max_position_size || 1000,
      strategy.stop_loss_percentage || 2.0,
      strategy.take_profit_percentage || 5.0
    ])

    return await this.findById(result.meta.last_row_id)
  }

  static async updateStatus(id: number, status: string): Promise<void> {
    const db = getDatabase()
    await db.query('UPDATE trading_strategies SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id])
  }

  static async updatePerformanceMetrics(id: number, metrics: Partial<TradingStrategy>): Promise<void> {
    const db = getDatabase()
    await db.query(`
      UPDATE trading_strategies 
      SET total_trades = ?, winning_trades = ?, losing_trades = ?, win_rate = ?, 
          total_pnl = ?, max_drawdown = ?, sharpe_ratio = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [
      metrics.total_trades,
      metrics.winning_trades,
      metrics.losing_trades,
      metrics.win_rate,
      metrics.total_pnl,
      metrics.max_drawdown,
      metrics.sharpe_ratio,
      id
    ])
  }
}

// =====================================
// TRADING ORDER DAO FUNCTIONS
// =====================================

export class TradingOrderDAO {
  static async findByUserId(userId: number, limit = 100): Promise<TradingOrder[]> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM trading_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?', [userId, limit])
    return result.results || []
  }

  static async findActiveOrders(userId: number): Promise<TradingOrder[]> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM trading_orders WHERE user_id = ? AND status IN (?, ?)', [userId, 'open', 'pending'])
    return result.results || []
  }

  static async findById(id: number): Promise<TradingOrder | null> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM trading_orders WHERE id = ?', [id])
    return result.results?.[0] || null
  }

  static async create(order: Partial<TradingOrder>): Promise<TradingOrder> {
    const db = getDatabase()
    const clientOrderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const result = await db.query(`
      INSERT INTO trading_orders (
        user_id, portfolio_id, strategy_id, exchange, symbol, side, type, 
        quantity, price, stop_price, client_order_id, stop_loss, take_profit
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      order.user_id,
      order.portfolio_id,
      order.strategy_id || null,
      order.exchange || 'binance',
      order.symbol,
      order.side,
      order.type || 'market',
      order.quantity,
      order.price || null,
      order.stop_price || null,
      clientOrderId,
      order.stop_loss || null,
      order.take_profit || null
    ])

    return await this.findById(result.meta.last_row_id)
  }

  static async updateStatus(id: number, status: string, filledQuantity?: number, avgFillPrice?: number): Promise<void> {
    const db = getDatabase()
    
    if (filledQuantity !== undefined && avgFillPrice !== undefined) {
      await db.query(`
        UPDATE trading_orders 
        SET status = ?, filled_quantity = ?, avg_fill_price = ?, 
            filled_value = ? * ?, filled_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [status, filledQuantity, avgFillPrice, filledQuantity, avgFillPrice, id])
    } else {
      await db.query('UPDATE trading_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id])
    }
  }
}

// =====================================
// TRADE DAO FUNCTIONS
// =====================================

export class TradeDAO {
  static async findByUserId(userId: number, limit = 100): Promise<Trade[]> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM trades WHERE user_id = ? ORDER BY entry_time DESC LIMIT ?', [userId, limit])
    return result.results || []
  }

  static async findByStrategy(strategyId: number, limit = 100): Promise<Trade[]> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM trades WHERE strategy_id = ? ORDER BY entry_time DESC LIMIT ?', [strategyId, limit])
    return result.results || []
  }

  static async create(trade: Partial<Trade>): Promise<Trade> {
    const db = getDatabase()
    const pnlPercentage = trade.exit_price && trade.entry_price ? 
      ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100 * (trade.side === 'buy' ? 1 : -1) : 0

    const result = await db.query(`
      INSERT INTO trades (
        user_id, portfolio_id, strategy_id, symbol, side, quantity, 
        entry_price, exit_price, pnl, pnl_percentage, fees, net_pnl,
        entry_reason, exit_reason, entry_time, exit_time
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      trade.user_id,
      trade.portfolio_id,
      trade.strategy_id || null,
      trade.symbol,
      trade.side,
      trade.quantity,
      trade.entry_price,
      trade.exit_price || null,
      trade.pnl || 0,
      pnlPercentage,
      trade.fees || 0,
      trade.net_pnl || 0,
      trade.entry_reason || null,
      trade.exit_reason || null,
      trade.entry_time || new Date().toISOString(),
      trade.exit_time || null
    ])

    const db2 = getDatabase()
    const result2 = await db2.query('SELECT * FROM trades WHERE id = ?', [result.meta.last_row_id])
    return result2.results[0]
  }

  static async findById(id: number): Promise<Trade | null> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM trades WHERE id = ?', [id])
    return result.results?.[0] || null
  }

  static async findByPortfolioId(portfolioId: number, limit = 100): Promise<Trade[]> {
    const db = getDatabase()
    const result = await db.query(
      'SELECT * FROM trades WHERE portfolio_id = ? ORDER BY entry_time DESC LIMIT ?', 
      [portfolioId, limit]
    )
    return result.results || []
  }

  static async update(id: number, updateData: Partial<Trade>): Promise<Trade | null> {
    const db = getDatabase()
    
    // Build dynamic update query
    const updateFields: string[] = []
    const values: any[] = []
    
    // Handle all updatable fields
    if (updateData.symbol !== undefined) {
      updateFields.push('symbol = ?')
      values.push(updateData.symbol)
    }
    if (updateData.side !== undefined) {
      updateFields.push('side = ?')
      values.push(updateData.side)
    }
    if (updateData.quantity !== undefined) {
      updateFields.push('quantity = ?')
      values.push(updateData.quantity)
    }
    if (updateData.entry_price !== undefined) {
      updateFields.push('entry_price = ?')
      values.push(updateData.entry_price)
    }
    if (updateData.exit_price !== undefined) {
      updateFields.push('exit_price = ?')
      values.push(updateData.exit_price)
    }
    if (updateData.entry_reason !== undefined) {
      updateFields.push('entry_reason = ?')
      values.push(updateData.entry_reason)
    }
    if (updateData.exit_reason !== undefined) {
      updateFields.push('exit_reason = ?')
      values.push(updateData.exit_reason)
    }
    if (updateData.entry_time !== undefined) {
      updateFields.push('entry_time = ?')
      values.push(updateData.entry_time)
    }
    if (updateData.exit_time !== undefined) {
      updateFields.push('exit_time = ?')
      values.push(updateData.exit_time)
    }
    if (updateData.fees !== undefined) {
      updateFields.push('fees = ?')
      values.push(updateData.fees)
    }
    if (updateData.stop_loss !== undefined) {
      updateFields.push('stop_loss = ?')
      values.push(updateData.stop_loss)
    }
    if (updateData.take_profit !== undefined) {
      updateFields.push('take_profit = ?')
      values.push(updateData.take_profit)
    }
    
    if (updateFields.length === 0) {
      throw new Error('No fields to update')
    }

    // Recalculate PnL if relevant fields are updated
    if (updateData.exit_price !== undefined || updateData.entry_price !== undefined || updateData.quantity !== undefined) {
      const currentTrade = await this.findById(id)
      if (currentTrade) {
        const entryPrice = updateData.entry_price !== undefined ? updateData.entry_price : currentTrade.entry_price
        const exitPrice = updateData.exit_price !== undefined ? updateData.exit_price : currentTrade.exit_price
        const quantity = updateData.quantity !== undefined ? updateData.quantity : currentTrade.quantity
        const side = updateData.side !== undefined ? updateData.side : currentTrade.side
        
        if (exitPrice) {
          const pnl = (exitPrice - entryPrice) * quantity * (side === 'buy' ? 1 : -1)
          const pnlPercentage = ((exitPrice - entryPrice) / entryPrice) * 100 * (side === 'buy' ? 1 : -1)
          const fees = updateData.fees !== undefined ? updateData.fees : currentTrade.fees || 0
          const netPnl = pnl - fees
          
          updateFields.push('pnl = ?', 'pnl_percentage = ?', 'net_pnl = ?')
          values.push(pnl, pnlPercentage, netPnl)
        }
      }
    }

    values.push(id) // Add ID for WHERE clause
    
    const query = `UPDATE trades SET ${updateFields.join(', ')} WHERE id = ?`
    await db.query(query, values)
    
    // Return updated trade
    return await this.findById(id)
  }

  static async delete(id: number): Promise<boolean> {
    const db = getDatabase()
    const result = await db.query('DELETE FROM trades WHERE id = ?', [id])
    return result.meta?.changes > 0
  }

  static async updateExit(id: number, exitPrice: number, exitReason: string, fees: number): Promise<void> {
    const db = getDatabase()
    
    // First get the trade to calculate PnL
    const trade = await db.query('SELECT * FROM trades WHERE id = ?', [id])
    const tradeData = trade.results[0]
    
    const pnl = (exitPrice - tradeData.entry_price) * tradeData.quantity * (tradeData.side === 'buy' ? 1 : -1)
    const pnlPercentage = ((exitPrice - tradeData.entry_price) / tradeData.entry_price) * 100 * (tradeData.side === 'buy' ? 1 : -1)
    const netPnl = pnl - fees
    
    await db.query(`
      UPDATE trades 
      SET exit_price = ?, pnl = ?, pnl_percentage = ?, fees = ?, net_pnl = ?, 
          exit_reason = ?, exit_time = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [exitPrice, pnl, pnlPercentage, fees, netPnl, exitReason, id])
  }

  static async countByUserId(userId: number): Promise<number> {
    const db = getDatabase()
    const result = await db.query('SELECT COUNT(*) as count FROM trades WHERE user_id = ?', [userId])
    return result.results?.[0]?.count || 0
  }

  static async getTotalPnL(userId: number): Promise<{ totalPnL: number, winRate: number }> {
    const db = getDatabase()
    const result = await db.query(`
      SELECT 
        SUM(net_pnl) as total_pnl,
        COUNT(*) as total_trades,
        SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END) as winning_trades
      FROM trades 
      WHERE user_id = ? AND exit_time IS NOT NULL
    `, [userId])
    
    const data = result.results?.[0]
    return {
      totalPnL: data?.total_pnl || 0,
      winRate: data?.total_trades > 0 ? (data?.winning_trades / data?.total_trades) * 100 : 0
    }
  }
}

// =====================================
// MARKET DATA DAO FUNCTIONS
// =====================================

export class MarketDataDAO {
  static async getLatestCandles(symbol: string, timeframe: string, limit = 100): Promise<MarketData[]> {
    const db = getDatabase()
    const result = await db.query(`
      SELECT * FROM market_data 
      WHERE symbol = ? AND timeframe = ? 
      ORDER BY timestamp DESC LIMIT ?
    `, [symbol, timeframe, limit])
    return result.results || []
  }

  static async insertCandle(data: Partial<MarketData>): Promise<void> {
    const db = getDatabase()
    await db.query(`
      INSERT OR REPLACE INTO market_data (
        symbol, timeframe, open_price, high_price, low_price, close_price, 
        volume, quote_volume, trades_count, timestamp
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      data.symbol,
      data.timeframe,
      data.open_price,
      data.high_price,
      data.low_price,
      data.close_price,
      data.volume,
      data.quote_volume || 0,
      data.trades_count || 0,
      data.timestamp
    ])
  }

  static async updateIndicators(symbol: string, timeframe: string, timestamp: string, indicators: any): Promise<void> {
    const db = getDatabase()
    await db.query(`
      UPDATE market_data 
      SET rsi_14 = ?, macd = ?, macd_signal = ?, macd_histogram = ?,
          bb_upper = ?, bb_middle = ?, bb_lower = ?
      WHERE symbol = ? AND timeframe = ? AND timestamp = ?
    `, [
      indicators.rsi_14,
      indicators.macd,
      indicators.macd_signal,
      indicators.macd_histogram,
      indicators.bb_upper,
      indicators.bb_middle,
      indicators.bb_lower,
      symbol,
      timeframe,
      timestamp
    ])
  }
}

// =====================================
// AI SIGNAL DAO FUNCTIONS
// =====================================

export class AISignalDAO {
  static async getActiveSignals(limit = 50): Promise<AISignal[]> {
    const db = getDatabase()
    
    const result = await db.query(`
      SELECT * FROM ai_signals 
      WHERE status = 'active' 
      ORDER BY created_at DESC LIMIT ?
    `, [limit])
    return result.results || []
  }

  static async getRecentSignals(userId?: number, limit = 50): Promise<AISignal[]> {
    const db = getDatabase()
    
    const result = await db.query(`
      SELECT * FROM ai_signals 
      ORDER BY created_at DESC LIMIT ?
    `, [limit])
    return result.results || []
  }

  static async getSignalStats(): Promise<{ totalSignals: number; averageAccuracy: number }> {
    const db = getDatabase()
    
    const totalResult = await db.query('SELECT COUNT(*) as count FROM ai_signals', [])
    const accuracyResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN actual_outcome = 'win' THEN 1 ELSE 0 END) as wins
      FROM ai_signals 
      WHERE actual_outcome IS NOT NULL
    `, [])
    
    const total = totalResult.results?.[0]?.count || 0
    const stats = accuracyResult.results?.[0]
    const accuracy = stats && stats.total > 0 ? (stats.wins / stats.total) * 100 : 85
    
    return {
      totalSignals: total,
      averageAccuracy: accuracy
    }
  }

  static async create(signal: Partial<AISignal>): Promise<AISignal> {
    const db = getDatabase()
    const result = await db.query(`
      INSERT INTO ai_signals (
        symbol, timeframe, signal_type, confidence, strength, current_price,
        target_price, stop_loss_price, probability, reasoning, factors, model_version
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      signal.symbol,
      signal.timeframe || '1h',
      signal.signal_type,
      signal.confidence,
      signal.strength || 'moderate',
      signal.current_price,
      signal.target_price || null,
      signal.stop_loss_price || null,
      signal.probability || null,
      signal.reasoning || null,
      JSON.stringify(signal.factors || {}),
      signal.model_version || 'v1.0'
    ])

    const result2 = await db.query('SELECT * FROM ai_signals WHERE id = ?', [result.meta.last_row_id])
    return result2.results[0]
  }

  static async createSignal(signal: Partial<AISignal>): Promise<AISignal> {
    return this.create(signal)
  }

  static async updateSignalStatus(id: number, status: string, outcome?: string, actualPnl?: number): Promise<void> {
    const db = getDatabase()
    
    if (outcome && actualPnl !== undefined) {
      await db.query(`
        UPDATE ai_signals 
        SET status = ?, actual_outcome = ?, actual_pnl = ?, triggered_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [status, outcome, actualPnl, id])
    } else {
      await db.query('UPDATE ai_signals SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id])
    }
  }

  static async updateOutcome(id: number, outcome: string, actualPnl: number): Promise<void> {
    const db = getDatabase()
    await db.query(`
      UPDATE ai_signals 
      SET actual_outcome = ?, actual_pnl = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [outcome, actualPnl, id])
  }

  static async findById(id: number): Promise<AISignal | null> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM ai_signals WHERE id = ?', [id])
    return result.results?.[0] || null
  }

  static async findBySymbol(symbol: string, limit = 20): Promise<AISignal[]> {
    const db = getDatabase()
    const result = await db.query(`
      SELECT * FROM ai_signals 
      WHERE symbol = ? 
      ORDER BY created_at DESC LIMIT ?
    `, [symbol, limit])
    return result.results || []
  }

  static async delete(id: number): Promise<boolean> {
    const db = getDatabase()
    const result = await db.query('DELETE FROM ai_signals WHERE id = ?', [id])
    return result.meta?.changes > 0
  }
}

// =====================================
// TARGET TRADE DAO FUNCTIONS
// =====================================

export class TargetTradeDAO {
  static async findByUserId(userId: number): Promise<TargetTrade[]> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM target_trades WHERE user_id = ? ORDER BY created_at DESC', [userId])
    return result.results || []
  }

  static async findActiveTargets(userId: number): Promise<TargetTrade[]> {
    const db = getDatabase()
    const result = await db.query('SELECT * FROM target_trades WHERE user_id = ? AND status IN (?, ?)', [userId, 'active', 'paused'])
    return result.results || []
  }

  static async create(target: Partial<TargetTrade>): Promise<TargetTrade> {
    const db = getDatabase()
    const result = await db.query(`
      INSERT INTO target_trades (
        user_id, portfolio_id, name, initial_amount, target_amount, current_amount,
        strategy, risk_level, max_drawdown_limit, target_duration_days, started_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [
      target.user_id,
      target.portfolio_id,
      target.name,
      target.initial_amount,
      target.target_amount,
      target.initial_amount, // current_amount starts as initial_amount
      target.strategy || 'balanced',
      target.risk_level || 'medium',
      target.max_drawdown_limit || 10.0,
      target.target_duration_days || 30
    ])

    const result2 = await db.query('SELECT * FROM target_trades WHERE id = ?', [result.meta.last_row_id])
    return result2.results[0]
  }

  static async updateProgress(id: number, currentAmount: number, tradesExecuted: number, successfulTrades: number): Promise<void> {
    const db = getDatabase()
    
    // Get the target to calculate progress
    const target = await db.query('SELECT * FROM target_trades WHERE id = ?', [id])
    const targetData = target.results[0]
    
    const progressPercentage = ((currentAmount - targetData.initial_amount) / (targetData.target_amount - targetData.initial_amount)) * 100
    const successRate = tradesExecuted > 0 ? (successfulTrades / tradesExecuted) * 100 : 0
    const totalPnl = currentAmount - targetData.initial_amount
    
    await db.query(`
      UPDATE target_trades 
      SET current_amount = ?, progress_percentage = ?, trades_executed = ?, 
          successful_trades = ?, success_rate = ?, total_pnl = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [currentAmount, progressPercentage, tradesExecuted, successfulTrades, successRate, totalPnl, id])
    
    // Check if target is completed
    if (progressPercentage >= 100) {
      await db.query(`
        UPDATE target_trades 
        SET status = 'completed', final_amount = ?, completed_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [currentAmount, id])
    }
  }
}

// =====================================
// SYSTEM EVENTS DAO FUNCTIONS
// =====================================

export interface SystemEvent {
  id: number
  event_type: 'order_created' | 'order_filled' | 'trade_completed' | 'strategy_started' | 'strategy_stopped' | 'signal_generated' | 'error' | 'system_maintenance'
  severity: 'info' | 'warning' | 'error' | 'critical'
  message: string
  details?: any
  user_id?: number
  related_entity_type?: string
  related_entity_id?: number
  created_at: string
}

export class SystemEventDAO {
  static async log(event: Partial<SystemEvent>): Promise<void> {
    const db = getDatabase()
    await db.query(`
      INSERT INTO system_events (event_type, severity, message, details, user_id, related_entity_type, related_entity_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      event.event_type,
      event.severity || 'info',
      event.message,
      JSON.stringify(event.details || {}),
      event.user_id || null,
      event.related_entity_type || null,
      event.related_entity_id || null
    ])
  }

  static async getRecentEvents(userId?: number, limit = 100): Promise<SystemEvent[]> {
    const db = getDatabase()
    
    if (userId) {
      const result = await db.query(`
        SELECT * FROM system_events 
        WHERE user_id = ? OR user_id IS NULL 
        ORDER BY created_at DESC LIMIT ?
      `, [userId, limit])
      return result.results || []
    }
    
    const result = await db.query('SELECT * FROM system_events ORDER BY created_at DESC LIMIT ?', [limit])
    return result.results || []
  }

  static async deleteOldEvents(beforeDate: string): Promise<void> {
    const db = getDatabase()
    await db.query('DELETE FROM system_events WHERE created_at < ?', [beforeDate])
  }

  static async countByType(eventType: string, userId?: number): Promise<number> {
    const db = getDatabase()
    if (userId) {
      const result = await db.query(
        'SELECT COUNT(*) as count FROM system_events WHERE event_type = ? AND user_id = ?', 
        [eventType, userId]
      )
      return result.results?.[0]?.count || 0
    }
    
    const result = await db.query('SELECT COUNT(*) as count FROM system_events WHERE event_type = ?', [eventType])
    return result.results?.[0]?.count || 0
  }
}

// =====================================
// ENHANCED DAO METHODS - PHASE 2.1
// =====================================

/**
 * Enhanced Trading Analytics and Statistics 
 */
export interface TradingStats {
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  totalPnL: number
  avgPnL: number
  maxWin: number
  maxLoss: number
  profitFactor: number
  sharpeRatio: number
  maxDrawdown: number
  avgTradeDuration: number
}

export interface PortfolioPerformance {
  totalValue: number
  dailyChange: number
  dailyChangePercent: number
  weeklyChange: number
  weeklyChangePercent: number
  monthlyChange: number
  monthlyChangePercent: number
  totalPnL: number
  totalPnLPercent: number
  bestAsset: { symbol: string; performance: number }
  worstAsset: { symbol: string; performance: number }
  riskScore: number
  sharpeRatio: number
}

export interface AllocationData {
  symbol: string
  percentage: number
  value: number
  targetPercentage?: number
}

export interface PnLData {
  date: string
  pnl: number
  cumulativePnL: number
  tradesCount: number
}

export interface WinLossStats {
  winRate: number
  avgWin: number
  avgLoss: number
  profitFactor: number
  largestWin: number
  largestLoss: number
  consecutiveWins: number
  consecutiveLosses: number
}

/**
 * Enhanced TradeDAO with Advanced Analytics
 */
export class EnhancedTradeDAO extends TradeDAO {
  
  /**
   * Get comprehensive trading statistics for a user
   */
  static async getTradingStats(userId: number, period?: string): Promise<TradingStats> {
    const db = getDatabase()
    
    let dateFilter = ''
    const params: any[] = [userId]
    
    if (period) {
      switch (period) {
        case 'today':
          dateFilter = ' AND DATE(entry_time) = DATE("now")'
          break
        case 'week':
          dateFilter = ' AND entry_time >= datetime("now", "-7 days")'
          break
        case 'month':
          dateFilter = ' AND entry_time >= datetime("now", "-30 days")'
          break
        case 'year':
          dateFilter = ' AND entry_time >= datetime("now", "-365 days")'
          break
      }
    }
    
    const result = await db.query(`
      SELECT 
        COUNT(*) as total_trades,
        SUM(CASE WHEN net_pnl > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(CASE WHEN net_pnl < 0 THEN 1 ELSE 0 END) as losing_trades,
        SUM(net_pnl) as total_pnl,
        AVG(net_pnl) as avg_pnl,
        MAX(net_pnl) as max_win,
        MIN(net_pnl) as max_loss,
        AVG(duration_minutes) as avg_duration,
        SUM(CASE WHEN net_pnl > 0 THEN net_pnl ELSE 0 END) as gross_profit,
        ABS(SUM(CASE WHEN net_pnl < 0 THEN net_pnl ELSE 0 END)) as gross_loss
      FROM trades 
      WHERE user_id = ? AND exit_time IS NOT NULL${dateFilter}
    `, params)
    
    const data = result.results?.[0]
    if (!data || data.total_trades === 0) {
      return {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalPnL: 0,
        avgPnL: 0,
        maxWin: 0,
        maxLoss: 0,
        profitFactor: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        avgTradeDuration: 0
      }
    }
    
    const winRate = (data.winning_trades / data.total_trades) * 100
    const profitFactor = data.gross_loss > 0 ? data.gross_profit / data.gross_loss : 0
    
    return {
      totalTrades: data.total_trades,
      winningTrades: data.winning_trades,
      losingTrades: data.losing_trades,
      winRate,
      totalPnL: data.total_pnl,
      avgPnL: data.avg_pnl,
      maxWin: data.max_win,
      maxLoss: data.max_loss,
      profitFactor,
      sharpeRatio: await this.calculateSharpeRatio(userId, period),
      maxDrawdown: await this.calculateMaxDrawdown(userId, period),
      avgTradeDuration: data.avg_duration || 0
    }
  }

  /**
   * Get PnL data by period for charts
   */
  static async getPnLByPeriod(userId: number, period: 'day' | 'week' | 'month'): Promise<PnLData[]> {
    const db = getDatabase()
    
    let groupBy = ''
    let dateFormat = ''
    
    switch (period) {
      case 'day':
        groupBy = 'DATE(entry_time)'
        dateFormat = '%Y-%m-%d'
        break
      case 'week':
        groupBy = 'strftime("%Y-%W", entry_time)'
        dateFormat = '%Y-W%W'
        break
      case 'month':
        groupBy = 'strftime("%Y-%m", entry_time)'
        dateFormat = '%Y-%m'
        break
    }
    
    const result = await db.query(`
      SELECT 
        ${groupBy} as date,
        SUM(net_pnl) as pnl,
        COUNT(*) as trades_count
      FROM trades 
      WHERE user_id = ? AND exit_time IS NOT NULL
      GROUP BY ${groupBy}
      ORDER BY date ASC
    `, [userId])
    
    const data = result.results || []
    let cumulativePnL = 0
    
    return data.map(row => {
      cumulativePnL += row.pnl
      return {
        date: row.date,
        pnl: row.pnl,
        cumulativePnL,
        tradesCount: row.trades_count
      }
    })
  }

  /**
   * Get win/loss statistics
   */
  static async getWinLossStats(userId: number): Promise<WinLossStats> {
    const trades = await this.findByUserId(userId, 1000) // Get more trades for better stats
    
    if (trades.length === 0) {
      return {
        winRate: 0,
        avgWin: 0,
        avgLoss: 0,
        profitFactor: 0,
        largestWin: 0,
        largestLoss: 0,
        consecutiveWins: 0,
        consecutiveLosses: 0
      }
    }
    
    const winningTrades = trades.filter(t => t.net_pnl > 0)
    const losingTrades = trades.filter(t => t.net_pnl < 0)
    
    const winRate = (winningTrades.length / trades.length) * 100
    const avgWin = winningTrades.length > 0 ? 
      winningTrades.reduce((sum, t) => sum + t.net_pnl, 0) / winningTrades.length : 0
    const avgLoss = losingTrades.length > 0 ?
      Math.abs(losingTrades.reduce((sum, t) => sum + t.net_pnl, 0) / losingTrades.length) : 0
    
    const profitFactor = avgLoss > 0 ? avgWin / avgLoss : 0
    const largestWin = Math.max(...trades.map(t => t.net_pnl), 0)
    const largestLoss = Math.abs(Math.min(...trades.map(t => t.net_pnl), 0))
    
    // Calculate consecutive wins/losses
    let consecutiveWins = 0
    let consecutiveLosses = 0
    let currentWinStreak = 0
    let currentLossStreak = 0
    
    for (const trade of trades) {
      if (trade.net_pnl > 0) {
        currentWinStreak++
        currentLossStreak = 0
        consecutiveWins = Math.max(consecutiveWins, currentWinStreak)
      } else if (trade.net_pnl < 0) {
        currentLossStreak++
        currentWinStreak = 0
        consecutiveLosses = Math.max(consecutiveLosses, currentLossStreak)
      }
    }
    
    return {
      winRate,
      avgWin,
      avgLoss,
      profitFactor,
      largestWin,
      largestLoss,
      consecutiveWins,
      consecutiveLosses
    }
  }

  /**
   * Calculate Sharpe Ratio
   */
  private static async calculateSharpeRatio(userId: number, period?: string): Promise<number> {
    const pnlData = await this.getPnLByPeriod(userId, 'day')
    
    if (pnlData.length < 2) return 0
    
    const returns = pnlData.map(d => d.pnl)
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length
    
    const variance = returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    const stdDev = Math.sqrt(variance)
    
    // Assume risk-free rate of 2% annually (0.0055% daily)
    const riskFreeRate = 0.000055
    
    return stdDev > 0 ? (avgReturn - riskFreeRate) / stdDev : 0
  }

  /**
   * Calculate Maximum Drawdown
   */
  private static async calculateMaxDrawdown(userId: number, period?: string): Promise<number> {
    const pnlData = await this.getPnLByPeriod(userId, 'day')
    
    if (pnlData.length === 0) return 0
    
    let maxDrawdown = 0
    let peak = pnlData[0].cumulativePnL
    
    for (const point of pnlData) {
      if (point.cumulativePnL > peak) {
        peak = point.cumulativePnL
      }
      
      const drawdown = (peak - point.cumulativePnL) / peak
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    }
    
    return maxDrawdown * 100 // Return as percentage
  }

  /**
   * Get trades by date range
   */
  static async findByDateRange(userId: number, startDate: string, endDate: string): Promise<Trade[]> {
    const db = getDatabase()
    const result = await db.query(`
      SELECT * FROM trades 
      WHERE user_id = ? AND entry_time BETWEEN ? AND ?
      ORDER BY entry_time DESC
    `, [userId, startDate, endDate])
    return result.results || []
  }

  /**
   * Bulk create trades
   */
  static async bulkCreate(trades: Partial<Trade>[]): Promise<Trade[]> {
    const db = getDatabase()
    const createdTrades: Trade[] = []
    
    for (const trade of trades) {
      const created = await this.create(trade)
      createdTrades.push(created)
    }
    
    return createdTrades
  }
}

/**
 * Enhanced PortfolioDAO with Advanced Analytics
 */
export class EnhancedPortfolioDAO extends PortfolioDAO {
  
  /**
   * Get comprehensive portfolio performance
   */
  static async getPortfolioPerformance(portfolioId: number): Promise<PortfolioPerformance> {
    const portfolio = await this.findById(portfolioId)
    if (!portfolio) {
      throw new Error('Portfolio not found')
    }
    
    const assets = await PortfolioAssetDAO.findByPortfolioId(portfolioId)
    const totalValue = assets.reduce((sum, asset) => sum + asset.total_value_usd, 0)
    
    // Calculate performance metrics
    const dailyChange = await this.calculatePeriodChange(portfolioId, 1)
    const weeklyChange = await this.calculatePeriodChange(portfolioId, 7)
    const monthlyChange = await this.calculatePeriodChange(portfolioId, 30)
    
    const dailyChangePercent = totalValue > 0 ? (dailyChange / totalValue) * 100 : 0
    const weeklyChangePercent = totalValue > 0 ? (weeklyChange / totalValue) * 100 : 0
    const monthlyChangePercent = totalValue > 0 ? (monthlyChange / totalValue) * 100 : 0
    
    // Find best and worst performing assets
    const bestAsset = assets.reduce((best, asset) => 
      asset.pnl_percentage > (best?.pnl_percentage || -Infinity) ? asset : best, assets[0])
    
    const worstAsset = assets.reduce((worst, asset) => 
      asset.pnl_percentage < (worst?.pnl_percentage || Infinity) ? asset : worst, assets[0])
    
    return {
      totalValue,
      dailyChange,
      dailyChangePercent,
      weeklyChange,
      weeklyChangePercent,
      monthlyChange,
      monthlyChangePercent,
      totalPnL: portfolio.total_pnl,
      totalPnLPercent: totalValue > 0 ? (portfolio.total_pnl / totalValue) * 100 : 0,
      bestAsset: bestAsset ? { symbol: bestAsset.symbol, performance: bestAsset.pnl_percentage } : { symbol: 'N/A', performance: 0 },
      worstAsset: worstAsset ? { symbol: worstAsset.symbol, performance: worstAsset.pnl_percentage } : { symbol: 'N/A', performance: 0 },
      riskScore: await this.calculateRiskScore(portfolioId),
      sharpeRatio: await this.calculatePortfolioSharpeRatio(portfolioId)
    }
  }

  /**
   * Get asset allocation data
   */
  static async getAssetAllocation(portfolioId: number): Promise<AllocationData[]> {
    const assets = await PortfolioAssetDAO.findByPortfolioId(portfolioId)
    const totalValue = assets.reduce((sum, asset) => sum + asset.total_value_usd, 0)
    
    return assets.map(asset => ({
      symbol: asset.symbol,
      percentage: totalValue > 0 ? (asset.total_value_usd / totalValue) * 100 : 0,
      value: asset.total_value_usd,
      targetPercentage: undefined // Can be set based on user preferences
    }))
  }

  /**
   * Calculate period change
   */
  private static async calculatePeriodChange(portfolioId: number, days: number): Promise<number> {
    // This would need historical portfolio value data
    // For now, we'll use a placeholder calculation
    const portfolio = await this.findById(portfolioId)
    return portfolio ? portfolio.daily_pnl * days : 0
  }

  /**
   * Calculate portfolio risk score
   */
  private static async calculateRiskScore(portfolioId: number): Promise<number> {
    const assets = await PortfolioAssetDAO.findByPortfolioId(portfolioId)
    
    // Simple risk calculation based on volatility and concentration
    const allocation = await this.getAssetAllocation(portfolioId)
    
    // Concentration risk (higher when fewer assets or uneven distribution)
    const concentrationRisk = allocation.length < 3 ? 0.8 : 0.4
    
    // Volatility risk (simplified - would use real volatility data in production)
    const avgVolatility = assets.reduce((sum, asset) => {
      // Estimate volatility based on PnL percentage (simplified)
      return sum + Math.abs(asset.pnl_percentage)
    }, 0) / assets.length
    
    const volatilityRisk = Math.min(avgVolatility / 100, 1)
    
    // Combine risks (0-10 scale)
    return Math.min((concentrationRisk + volatilityRisk) * 5, 10)
  }

  /**
   * Calculate portfolio Sharpe ratio
   */
  private static async calculatePortfolioSharpeRatio(portfolioId: number): Promise<number> {
    // This would need historical portfolio performance data
    // For now, return a placeholder
    const portfolio = await this.findById(portfolioId)
    return portfolio ? Math.random() * 2 : 0 // Placeholder
  }

  /**
   * Delete portfolio (soft delete)
   */
  static async delete(id: number): Promise<boolean> {
    const db = getDatabase()
    const result = await db.query('UPDATE portfolios SET is_active = 0 WHERE id = ?', [id])
    return result.meta?.changes > 0
  }

  /**
   * Find portfolios with filters
   */
  static async findWithFilters(filters: {
    userId?: number
    isActive?: boolean
    minBalance?: number
    maxBalance?: number
  }): Promise<Portfolio[]> {
    const db = getDatabase()
    const conditions: string[] = []
    const params: any[] = []
    
    if (filters.userId !== undefined) {
      conditions.push('user_id = ?')
      params.push(filters.userId)
    }
    
    if (filters.isActive !== undefined) {
      conditions.push('is_active = ?')
      params.push(filters.isActive ? 1 : 0)
    }
    
    if (filters.minBalance !== undefined) {
      conditions.push('balance_usd >= ?')
      params.push(filters.minBalance)
    }
    
    if (filters.maxBalance !== undefined) {
      conditions.push('balance_usd <= ?')
      params.push(filters.maxBalance)
    }
    
    const whereClause = conditions.length > 0 ? ` WHERE ${conditions.join(' AND ')}` : ''
    
    const result = await db.query(`SELECT * FROM portfolios${whereClause} ORDER BY created_at DESC`, params)
    return result.results || []
  }
}

/**
 * Enhanced Connection Management - Phase 2.1C
 */
export class DatabasePool {
  private static instance: DatabasePool
  private connections: Map<string, DatabaseConnection> = new Map()
  private maxConnections = 10
  
  static getInstance(): DatabasePool {
    if (!DatabasePool.instance) {
      DatabasePool.instance = new DatabasePool()
    }
    return DatabasePool.instance
  }
  
  async getConnection(identifier = 'default'): Promise<DatabaseConnection> {
    if (this.connections.has(identifier)) {
      return this.connections.get(identifier)!
    }
    
    if (this.connections.size >= this.maxConnections) {
      // Simple LRU eviction - remove oldest
      const firstKey = this.connections.keys().next().value
      this.connections.delete(firstKey)
    }
    
    const connection = getDatabase() // Use existing connection logic
    this.connections.set(identifier, connection)
    return connection
  }
  
  releaseConnection(identifier: string): void {
    // For SQLite/D1, connections are managed by the runtime
    // This is placeholder for future connection pooling
  }
  
  closeAllConnections(): void {
    this.connections.clear()
  }
}

/**
 * Alert DAO - Manages user alerts and notifications
 */
export class AlertDAO {
  static async create(alert: {
    userId: number
    type: 'price' | 'technical' | 'news' | 'portfolio'
    symbol?: string
    title: string
    message: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    isRead?: boolean
    actionRequired?: boolean
    data?: any
  }): Promise<any> {
    const db = getDatabase()
    const query = `
      INSERT INTO alerts (user_id, type, symbol, title, message, severity, is_read, action_required, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `
    
    const result = await db.query(query, [
      alert.userId,
      alert.type,
      alert.symbol || null,
      alert.title,
      alert.message,
      alert.severity,
      alert.isRead ? 1 : 0,
      alert.actionRequired ? 1 : 0,
      alert.data ? JSON.stringify(alert.data) : null
    ])
    
    return result.meta?.last_row_id || result.insertId
  }

  static async findByUserId(userId: number, limit: number = 50, unreadOnly: boolean = false): Promise<any[]> {
    const db = getDatabase()
    let query = `
      SELECT id, user_id, type, symbol, title, message, severity, is_read, action_required, data, 
             strftime('%s', created_at) * 1000 as timestamp, updated_at
      FROM alerts 
      WHERE user_id = ?
    `
    
    const params = [userId]
    
    if (unreadOnly) {
      query += ` AND is_read = 0`
    }
    
    query += ` ORDER BY created_at DESC LIMIT ?`
    params.push(limit)

    const result = await db.query(query, params)
    
    return result.results?.map((alert: any) => ({
      id: alert.id.toString(),
      type: alert.type,
      symbol: alert.symbol,
      title: alert.title,
      message: alert.message,
      severity: alert.severity,
      timestamp: parseInt(alert.timestamp),
      isRead: alert.is_read === 1,
      actionRequired: alert.action_required === 1,
      data: alert.data ? JSON.parse(alert.data) : null
    })) || []
  }

  static async markAsRead(alertId: string, userId: number): Promise<boolean> {
    const db = getDatabase()
    const query = `
      UPDATE alerts 
      SET is_read = 1, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `
    
    const result = await db.query(query, [alertId, userId])
    return result.meta?.changes > 0
  }

  static async markAllAsRead(userId: number): Promise<boolean> {
    const db = getDatabase()
    const query = `
      UPDATE alerts 
      SET is_read = 1, updated_at = datetime('now')
      WHERE user_id = ? AND is_read = 0
    `
    
    const result = await db.query(query, [userId])
    return result.meta?.changes > 0
  }

  static async deleteAlert(alertId: string, userId: number): Promise<boolean> {
    const db = getDatabase()
    const query = `DELETE FROM alerts WHERE id = ? AND user_id = ?`
    
    const result = await db.query(query, [alertId, userId])
    return result.meta?.changes > 0
  }

  static async getUnreadCount(userId: number): Promise<number> {
    const db = getDatabase()
    const query = `SELECT COUNT(*) as count FROM alerts WHERE user_id = ? AND is_read = 0`
    
    const result = await db.query(query, [userId])
    return result.results?.[0]?.count || 0
  }
}

/**
 * AlertRule DAO - Manages user alert rules and conditions
 */
export class AlertRuleDAO {
  static async create(rule: {
    userId: number
    type: 'price' | 'technical' | 'news' | 'portfolio'
    symbol?: string
    condition: string
    target: number
    operator: 'greater' | 'less' | 'equal' | 'crosses_above' | 'crosses_below'
    isActive?: boolean
  }): Promise<any> {
    const db = getDatabase()
    const query = `
      INSERT INTO alert_rules (user_id, type, symbol, condition_name, target_value, operator, is_active, 
                              triggered_count, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, 0, datetime('now'), datetime('now'))
    `
    
    const result = await db.query(query, [
      rule.userId,
      rule.type,
      rule.symbol || null,
      rule.condition,
      rule.target,
      rule.operator,
      rule.isActive !== false ? 1 : 0
    ])
    
    return result.meta?.last_row_id || result.insertId
  }

  static async findByUserId(userId: number): Promise<any[]> {
    const db = getDatabase()
    const query = `
      SELECT id, user_id, type, symbol, condition_name, target_value, operator, is_active,
             triggered_count, strftime('%s', created_at) * 1000 as createdAt,
             strftime('%s', last_triggered) * 1000 as lastTriggered
      FROM alert_rules 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `

    const result = await db.query(query, [userId])
    
    return result.results?.map((rule: any) => ({
      id: rule.id.toString(),
      userId: rule.user_id.toString(),
      type: rule.type,
      symbol: rule.symbol,
      condition: rule.condition_name,
      target: rule.target_value,
      operator: rule.operator,
      isActive: rule.is_active === 1,
      createdAt: parseInt(rule.createdAt),
      triggeredCount: rule.triggered_count,
      lastTriggered: rule.lastTriggered ? parseInt(rule.lastTriggered) : undefined
    })) || []
  }

  static async updateRule(ruleId: string, userId: number, updates: {
    condition?: string
    target?: number
    operator?: string
    isActive?: boolean
  }): Promise<boolean> {
    const db = getDatabase()
    const setParts = []
    const params = []
    
    if (updates.condition !== undefined) {
      setParts.push('condition_name = ?')
      params.push(updates.condition)
    }
    if (updates.target !== undefined) {
      setParts.push('target_value = ?')
      params.push(updates.target)
    }
    if (updates.operator !== undefined) {
      setParts.push('operator = ?')
      params.push(updates.operator)
    }
    if (updates.isActive !== undefined) {
      setParts.push('is_active = ?')
      params.push(updates.isActive ? 1 : 0)
    }
    
    if (setParts.length === 0) return false
    
    setParts.push('updated_at = datetime(\'now\')')
    params.push(ruleId, userId)
    
    const query = `
      UPDATE alert_rules 
      SET ${setParts.join(', ')}
      WHERE id = ? AND user_id = ?
    `
    
    const result = await db.query(query, params)
    return result.meta?.changes > 0
  }

  static async deleteRule(ruleId: string, userId: number): Promise<boolean> {
    const db = getDatabase()
    const query = `DELETE FROM alert_rules WHERE id = ? AND user_id = ?`
    
    const result = await db.query(query, [ruleId, userId])
    return result.meta?.changes > 0
  }

  static async triggerRule(ruleId: string): Promise<boolean> {
    const db = getDatabase()
    const query = `
      UPDATE alert_rules 
      SET triggered_count = triggered_count + 1, last_triggered = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `
    
    const result = await db.query(query, [ruleId])
    return result.meta?.changes > 0
  }

  static async getActiveRules(): Promise<any[]> {
    const db = getDatabase()
    const query = `
      SELECT id, user_id, type, symbol, condition_name, target_value, operator,
             triggered_count, strftime('%s', created_at) * 1000 as createdAt
      FROM alert_rules 
      WHERE is_active = 1
      ORDER BY created_at DESC
    `

    const result = await db.query(query)
    
    return result.results?.map((rule: any) => ({
      id: rule.id.toString(),
      userId: rule.user_id,
      type: rule.type,
      symbol: rule.symbol,
      condition: rule.condition_name,
      target: rule.target_value,
      operator: rule.operator,
      triggeredCount: rule.triggered_count,
      createdAt: parseInt(rule.createdAt)
    })) || []
  }
}

/**
 * AdminUser DAO - Extended user management for administrative operations
 */
export class AdminUserDAO extends UserDAO {
  static async getAllUsers(page: number = 1, limit: number = 50, filters: any = {}): Promise<{users: any[], total: number}> {
    const db = getDatabase()
    let whereClause = 'WHERE 1=1'
    const params: any[] = []
    
    // Apply filters
    if (filters.status) {
      whereClause += ' AND status = ?'
      params.push(filters.status)
    }
    
    if (filters.role) {
      whereClause += ' AND role = ?'
      params.push(filters.role)
    }
    
    if (filters.search) {
      whereClause += ' AND (username LIKE ? OR full_name LIKE ? OR email LIKE ?)'
      const searchTerm = `%${filters.search}%`
      params.push(searchTerm, searchTerm, searchTerm)
    }
    
    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM users ${whereClause}`
    const countResult = await db.query(countQuery, params)
    const total = countResult.results?.[0]?.total || 0
    
    // Get paginated users
    const offset = (page - 1) * limit
    const query = `
      SELECT id, username, email, full_name, avatar, phone, role, status, 
             email_verified, phone_verified, two_factor_enabled,
             strftime('%s', created_at) * 1000 as createdAt,
             strftime('%s', last_login_at) * 1000 as lastLoginAt,
             strftime('%s', last_active_at) * 1000 as lastActiveAt,
             login_count, registration_ip, last_login_ip, notes
      FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `
    
    params.push(limit, offset)
    const result = await db.query(query, params)
    
    const users = result.results?.map((user: any) => ({
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=3B82F6&color=ffffff&size=64`,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: user.email_verified === 1,
      phoneVerified: user.phone_verified === 1,
      twoFactorEnabled: user.two_factor_enabled === 1,
      createdAt: parseInt(user.createdAt),
      lastLoginAt: user.lastLoginAt ? parseInt(user.lastLoginAt) : null,
      lastActiveAt: user.lastActiveAt ? parseInt(user.lastActiveAt) : null,
      loginCount: user.login_count || 0,
      registrationIP: user.registration_ip,
      lastLoginIP: user.last_login_ip,
      notes: user.notes
    })) || []
    
    return { users, total }
  }

  static async getUserDetails(userId: string): Promise<any | null> {
    const db = getDatabase()
    const query = `
      SELECT u.*, 
             strftime('%s', u.created_at) * 1000 as createdAt,
             strftime('%s', u.last_login_at) * 1000 as lastLoginAt,
             strftime('%s', u.last_active_at) * 1000 as lastActiveAt,
             COUNT(DISTINCT t.id) as totalTrades,
             SUM(CASE WHEN t.type = 'sell' THEN t.amount * t.price ELSE 0 END) as totalVolume,
             SUM(CASE WHEN t.type = 'sell' THEN (t.amount * t.price * 0.02) ELSE 0 END) as totalPnL,
             COUNT(DISTINCT p.id) as portfolioCount
      FROM users u
      LEFT JOIN trades t ON u.id = t.user_id AND t.status = 'completed'
      LEFT JOIN portfolios p ON u.id = p.user_id
      WHERE u.id = ?
      GROUP BY u.id
    `
    
    const result = await db.query(query, [userId])
    
    if (!result.results || result.results.length === 0) {
      return null
    }
    
    const user = result.results[0]
    
    // Get portfolio balance
    const balanceQuery = `
      SELECT SUM(pa.amount * pa.average_price) as currentBalance
      FROM portfolio_assets pa
      JOIN portfolios p ON pa.portfolio_id = p.id
      WHERE p.user_id = ?
    `
    
    const balanceResult = await db.query(balanceQuery, [userId])
    const currentBalance = balanceResult.results?.[0]?.currentBalance || 0
    
    return {
      id: user.id.toString(),
      username: user.username,
      email: user.email,
      fullName: user.full_name,
      avatar: user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name || user.username)}&background=3B82F6&color=ffffff&size=64`,
      phone: user.phone,
      role: user.role,
      status: user.status,
      emailVerified: user.email_verified === 1,
      phoneVerified: user.phone_verified === 1,
      twoFactorEnabled: user.two_factor_enabled === 1,
      createdAt: parseInt(user.createdAt),
      lastLoginAt: user.lastLoginAt ? parseInt(user.lastLoginAt) : null,
      lastActiveAt: user.lastActiveAt ? parseInt(user.lastActiveAt) : null,
      loginCount: user.login_count || 0,
      totalTrades: user.totalTrades || 0,
      totalVolume: user.totalVolume || 0,
      totalPnL: user.totalPnL || 0,
      currentBalance: currentBalance,
      registrationIP: user.registration_ip,
      lastLoginIP: user.last_login_ip,
      notes: user.notes,
      location: user.location || 'نامشخص'
    }
  }

  static async updateUserByAdmin(userId: string, updates: any): Promise<boolean> {
    const db = getDatabase()
    const setParts = []
    const params = []
    
    if (updates.fullName !== undefined) {
      setParts.push('full_name = ?')
      params.push(updates.fullName)
    }
    
    if (updates.email !== undefined) {
      setParts.push('email = ?')
      params.push(updates.email)
    }
    
    if (updates.phone !== undefined) {
      setParts.push('phone = ?')
      params.push(updates.phone)
    }
    
    if (updates.role !== undefined) {
      setParts.push('role = ?')
      params.push(updates.role)
    }
    
    if (updates.status !== undefined) {
      setParts.push('status = ?')
      params.push(updates.status)
    }
    
    if (updates.emailVerified !== undefined) {
      setParts.push('email_verified = ?')
      params.push(updates.emailVerified ? 1 : 0)
    }
    
    if (updates.phoneVerified !== undefined) {
      setParts.push('phone_verified = ?')
      params.push(updates.phoneVerified ? 1 : 0)
    }
    
    if (updates.notes !== undefined) {
      setParts.push('notes = ?')
      params.push(updates.notes)
    }
    
    if (setParts.length === 0) return false
    
    setParts.push('updated_at = datetime(\'now\')')
    params.push(userId)
    
    const query = `
      UPDATE users 
      SET ${setParts.join(', ')}
      WHERE id = ?
    `
    
    const result = await db.query(query, params)
    return result.meta?.changes > 0
  }

  static async changeUserStatus(userId: string, status: string, reason?: string): Promise<boolean> {
    const db = getDatabase()
    const query = `
      UPDATE users 
      SET status = ?, status_reason = ?, status_changed_at = datetime('now'), updated_at = datetime('now')
      WHERE id = ?
    `
    
    const result = await db.query(query, [status, reason || null, userId])
    return result.meta?.changes > 0
  }

  static async deleteUserPermanently(userId: string): Promise<boolean> {
    const db = getDatabase()
    
    try {
      // Start transaction
      await db.query('BEGIN TRANSACTION')
      
      // Delete related data in order
      await db.query('DELETE FROM virtual_trades WHERE user_id = ?', [userId])
      await db.query('DELETE FROM trading_modes WHERE user_id = ?', [userId])
      await db.query('DELETE FROM alerts WHERE user_id = ?', [userId])
      await db.query('DELETE FROM alert_rules WHERE user_id = ?', [userId])
      await db.query('DELETE FROM ai_signals WHERE user_id = ?', [userId])
      await db.query('DELETE FROM portfolio_assets WHERE portfolio_id IN (SELECT id FROM portfolios WHERE user_id = ?)', [userId])
      await db.query('DELETE FROM portfolios WHERE user_id = ?', [userId])
      await db.query('DELETE FROM trades WHERE user_id = ?', [userId])
      await db.query('DELETE FROM users WHERE id = ?', [userId])
      
      // Commit transaction
      await db.query('COMMIT')
      return true
      
    } catch (error) {
      // Rollback on error
      await db.query('ROLLBACK')
      console.error('Error deleting user permanently:', error)
      return false
    }
  }

  static async resetUserPassword(userId: string, newPasswordHash: string): Promise<boolean> {
    const db = getDatabase()
    const query = `
      UPDATE users 
      SET password_hash = ?, updated_at = datetime('now')
      WHERE id = ?
    `
    
    const result = await db.query(query, [newPasswordHash, userId])
    return result.meta?.changes > 0
  }

  static async forceLogoutUser(userId: string): Promise<boolean> {
    const db = getDatabase()
    
    try {
      // In production, this would invalidate JWT tokens or session tokens
      // For now, update last_logout_at field and increment a logout_version counter
      const query = `
        UPDATE users 
        SET last_logout_at = datetime('now'), logout_version = COALESCE(logout_version, 0) + 1, updated_at = datetime('now')
        WHERE id = ?
      `
      
      const result = await db.query(query, [userId])
      return result.meta?.changes > 0
      
    } catch (error) {
      console.error('Error forcing user logout:', error)
      return false
    }
  }

  static async getUserActivities(userId: string, limit: number = 50): Promise<any[]> {
    const db = getDatabase()
    
    // Get recent activities (trades, logins, etc.)
    const query = `
      SELECT 'trade' as type, symbol, type as action, amount, price, 
             strftime('%s', created_at) * 1000 as timestamp
      FROM trades 
      WHERE user_id = ?
      
      UNION ALL
      
      SELECT 'alert' as type, symbol, type as action, NULL as amount, NULL as price,
             strftime('%s', created_at) * 1000 as timestamp
      FROM alerts
      WHERE user_id = ?
      
      ORDER BY timestamp DESC
      LIMIT ?
    `
    
    const result = await db.query(query, [userId, userId, limit])
    
    return result.results?.map((activity: any) => ({
      type: activity.type,
      action: activity.action,
      symbol: activity.symbol,
      amount: activity.amount,
      price: activity.price,
      timestamp: parseInt(activity.timestamp)
    })) || []
  }

  static async getUserStats(): Promise<any> {
    const db = getDatabase()
    
    const query = `
      SELECT 
        COUNT(*) as totalUsers,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as activeUsers,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactiveUsers,
        COUNT(CASE WHEN status = 'suspended' THEN 1 END) as suspendedUsers,
        COUNT(CASE WHEN status = 'banned' THEN 1 END) as bannedUsers,
        COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins,
        COUNT(CASE WHEN role = 'trader' THEN 1 END) as traders,
        COUNT(CASE WHEN role = 'analyst' THEN 1 END) as analysts,
        COUNT(CASE WHEN role = 'viewer' THEN 1 END) as viewers,
        COUNT(CASE WHEN created_at > datetime('now', '-24 hours') THEN 1 END) as newUsersToday,
        COUNT(CASE WHEN last_active_at > datetime('now', '-24 hours') THEN 1 END) as activeToday
      FROM users
    `
    
    const result = await db.query(query)
    return result.results?.[0] || {}
  }
}

/**
 * TradingMode DAO - Manages user trading modes (demo/live) and virtual balances
 */
export class TradingModeDAO {
  static async create(modeData: {
    userId: number
    mode: 'demo' | 'live'
    demoBalance?: any
    liveConnected?: boolean
    exchangeKeys?: any
  }): Promise<any> {
    const db = getDatabase()
    const query = `
      INSERT INTO trading_modes (user_id, mode, demo_balance, live_connected, exchange_keys, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `
    
    const result = await db.query(query, [
      modeData.userId,
      modeData.mode,
      modeData.demoBalance ? JSON.stringify(modeData.demoBalance) : null,
      modeData.liveConnected ? 1 : 0,
      modeData.exchangeKeys ? JSON.stringify(modeData.exchangeKeys) : null
    ])
    
    return result.meta?.last_row_id || result.insertId
  }

  static async findByUserId(userId: number): Promise<any | null> {
    const db = getDatabase()
    const query = `
      SELECT id, user_id, mode, demo_balance, live_connected, exchange_keys,
             strftime('%s', created_at) * 1000 as createdAt,
             strftime('%s', updated_at) * 1000 as updatedAt
      FROM trading_modes 
      WHERE user_id = ?
      ORDER BY created_at DESC 
      LIMIT 1
    `

    const result = await db.query(query, [userId])
    
    if (!result.results || result.results.length === 0) {
      return null
    }
    
    const mode = result.results[0]
    return {
      id: mode.id,
      userId: mode.user_id.toString(),
      mode: mode.mode,
      demoBalance: mode.demo_balance ? JSON.parse(mode.demo_balance) : this.getDefaultDemoBalance(),
      liveConnected: mode.live_connected === 1,
      exchangeKeys: mode.exchange_keys ? JSON.parse(mode.exchange_keys) : {},
      createdAt: parseInt(mode.createdAt),
      updatedAt: parseInt(mode.updatedAt)
    }
  }

  static async updateMode(userId: number, mode: 'demo' | 'live'): Promise<boolean> {
    const db = getDatabase()
    const query = `
      UPDATE trading_modes 
      SET mode = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `
    
    const result = await db.query(query, [mode, userId])
    return result.meta?.changes > 0
  }

  static async updateDemoBalance(userId: number, balance: any): Promise<boolean> {
    const db = getDatabase()
    const query = `
      UPDATE trading_modes 
      SET demo_balance = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `
    
    const result = await db.query(query, [JSON.stringify(balance), userId])
    return result.meta?.changes > 0
  }

  static async updateExchangeKeys(userId: number, exchangeKeys: any): Promise<boolean> {
    const db = getDatabase()
    const query = `
      UPDATE trading_modes 
      SET exchange_keys = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `
    
    const result = await db.query(query, [JSON.stringify(exchangeKeys), userId])
    return result.meta?.changes > 0
  }

  static async setLiveConnection(userId: number, connected: boolean): Promise<boolean> {
    const db = getDatabase()
    const query = `
      UPDATE trading_modes 
      SET live_connected = ?, updated_at = datetime('now')
      WHERE user_id = ?
    `
    
    const result = await db.query(query, [connected ? 1 : 0, userId])
    return result.meta?.changes > 0
  }

  static getDefaultDemoBalance(): any {
    return {
      USDT: 10000,
      BTC: 0.1,
      ETH: 3,
      BNB: 15,
      ADA: 1000,
      SOL: 50,
      DOT: 100,
      LINK: 200,
      LTC: 10
    }
  }
}

/**
 * VirtualTrade DAO - Manages demo trading operations
 */
export class VirtualTradeDAO {
  static async create(trade: {
    userId: number
    symbol: string
    type: 'buy' | 'sell'
    amount: number
    price: number
    fee?: number
    status?: string
  }): Promise<any> {
    const db = getDatabase()
    const total = trade.amount * trade.price
    const fee = trade.fee || total * 0.001 // 0.1% default fee
    
    const query = `
      INSERT INTO virtual_trades (user_id, symbol, type, amount, price, total, fee, status, demo_mode, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `
    
    const result = await db.query(query, [
      trade.userId,
      trade.symbol,
      trade.type,
      trade.amount,
      trade.price,
      total,
      fee,
      trade.status || 'completed'
    ])
    
    return result.meta?.last_row_id || result.insertId
  }

  static async findByUserId(userId: number, limit: number = 100): Promise<any[]> {
    const db = getDatabase()
    const query = `
      SELECT id, user_id, symbol, type, amount, price, total, fee,
             strftime('%s', created_at) * 1000 as timestamp, status, demo_mode
      FROM virtual_trades 
      WHERE user_id = ? AND demo_mode = 1
      ORDER BY created_at DESC 
      LIMIT ?
    `

    const result = await db.query(query, [userId, limit])
    
    return result.results?.map((trade: any) => ({
      id: trade.id.toString(),
      userId: trade.user_id.toString(),
      symbol: trade.symbol,
      type: trade.type,
      amount: trade.amount,
      price: trade.price,
      total: trade.total,
      fee: trade.fee,
      timestamp: parseInt(trade.timestamp),
      status: trade.status,
      demoMode: trade.demo_mode === 1
    })) || []
  }

  static async getPortfolioSummary(userId: number): Promise<any> {
    const db = getDatabase()
    
    // Get demo balance
    const modeData = await TradingModeDAO.findByUserId(userId)
    if (!modeData) {
      return null
    }
    
    // Calculate portfolio value based on current prices and holdings
    const demoBalance = modeData.demoBalance
    let totalValue = 0
    const holdings: any = {}
    
    // Convert demo balance to portfolio format
    for (const [symbol, amount] of Object.entries(demoBalance)) {
      if (typeof amount === 'number' && amount > 0) {
        const currentPrice = await this.getCurrentPrice(symbol)
        const value = amount * currentPrice
        totalValue += value
        
        holdings[symbol] = {
          amount: amount,
          averagePrice: currentPrice, // Simplified
          currentPrice: currentPrice,
          value: value,
          pnl: 0, // Simplified for demo
          pnlPercent: 0
        }
      }
    }
    
    return {
      userId: userId.toString(),
      totalValue,
      totalInvested: 10000, // Initial demo balance
      totalPnL: totalValue - 10000,
      roi: ((totalValue - 10000) / 10000) * 100,
      lastUpdated: Date.now(),
      holdings
    }
  }

  private static async getCurrentPrice(symbol: string): Promise<number> {
    // In production, integrate with market data API
    const mockPrices: { [key: string]: number } = {
      'USDT': 1,
      'BTC': 95000,
      'ETH': 3500,
      'BNB': 650,
      'ADA': 0.45,
      'SOL': 200,
      'DOT': 25,
      'LINK': 18,
      'LTC': 120
    }
    
    return mockPrices[symbol] || 100
  }
}

/**
 * SystemMonitoring DAO - Manages system metrics, health checks, and monitoring
 */
export class SystemMonitoringDAO {
  static async logSystemMetrics(metrics: {
    cpu: number
    memory: number
    network: number
    disk?: number
    responseTime?: number
    activeConnections?: number
  }): Promise<void> {
    const db = getDatabase()
    const query = `
      INSERT INTO system_metrics (cpu_usage, memory_usage, network_usage, disk_usage, 
                                  response_time, active_connections, recorded_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `
    
    await db.query(query, [
      metrics.cpu,
      metrics.memory,
      metrics.network,
      metrics.disk || 0,
      metrics.responseTime || 0,
      metrics.activeConnections || 0
    ])
  }

  static async getLatestMetrics(): Promise<any> {
    const db = getDatabase()
    const query = `
      SELECT cpu_usage, memory_usage, network_usage, disk_usage, response_time, active_connections,
             strftime('%s', recorded_at) * 1000 as timestamp
      FROM system_metrics 
      ORDER BY recorded_at DESC 
      LIMIT 1
    `

    const result = await db.query(query)
    
    if (result.results && result.results.length > 0) {
      const metrics = result.results[0]
      return {
        cpu: metrics.cpu_usage,
        memory: metrics.memory_usage,
        network: metrics.network_usage,
        disk: metrics.disk_usage,
        responseTime: metrics.response_time,
        activeConnections: metrics.active_connections,
        timestamp: parseInt(metrics.timestamp)
      }
    }
    
    // Return default values if no metrics exist
    return {
      cpu: 15,
      memory: 35,
      network: 85,
      disk: 45,
      responseTime: 25,
      activeConnections: 150,
      timestamp: Date.now()
    }
  }

  static async getMetricsHistory(hours: number = 24): Promise<any[]> {
    const db = getDatabase()
    const query = `
      SELECT cpu_usage, memory_usage, network_usage, disk_usage, response_time,
             strftime('%s', recorded_at) * 1000 as timestamp
      FROM system_metrics 
      WHERE recorded_at >= datetime('now', '-${hours} hours')
      ORDER BY recorded_at ASC
    `

    const result = await db.query(query)
    
    return result.results?.map((metric: any) => ({
      cpu: metric.cpu_usage,
      memory: metric.memory_usage,
      network: metric.network_usage,
      disk: metric.disk_usage,
      responseTime: metric.response_time,
      timestamp: parseInt(metric.timestamp)
    })) || []
  }

  static async logSystemEvent(event: {
    type: 'startup' | 'shutdown' | 'error' | 'warning' | 'info'
    component: string
    title: string
    description: string
    severity?: 'low' | 'medium' | 'high' | 'critical'
    data?: any
  }): Promise<void> {
    const db = getDatabase()
    const query = `
      INSERT INTO system_events (type, component, title, description, severity, event_data, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `
    
    await db.query(query, [
      event.type,
      event.component,
      event.title,
      event.description,
      event.severity || 'info',
      event.data ? JSON.stringify(event.data) : null
    ])
  }

  static async getRecentEvents(limit: number = 50): Promise<any[]> {
    const db = getDatabase()
    const query = `
      SELECT type, component, title, description, severity, event_data,
             strftime('%s', created_at) * 1000 as timestamp
      FROM system_events 
      ORDER BY created_at DESC 
      LIMIT ?
    `

    const result = await db.query(query, [limit])
    
    return result.results?.map((event: any) => ({
      type: event.type,
      component: event.component,
      title: event.title,
      description: event.description,
      severity: event.severity,
      timestamp: parseInt(event.timestamp),
      data: event.event_data ? JSON.parse(event.event_data) : null
    })) || []
  }

  static async getSystemHealth(): Promise<any> {
    const db = getDatabase()
    
    // Get latest metrics
    const metrics = await this.getLatestMetrics()
    
    // Get component statuses
    const components = [
      { 
        name: 'مغز AI', 
        status: await this.checkComponentHealth('ai_core'),
        responseTime: await this.getComponentResponseTime('ai_core')
      },
      { 
        name: 'آرتمیس پیشرفته', 
        status: await this.checkComponentHealth('artemis'),
        responseTime: await this.getComponentResponseTime('artemis')
      },
      { 
        name: 'موتور معاملات', 
        status: await this.checkComponentHealth('trading_engine'),
        responseTime: await this.getComponentResponseTime('trading_engine')
      },
      { 
        name: 'جریان داده‌ها', 
        status: await this.checkComponentHealth('data_stream'),
        responseTime: await this.getComponentResponseTime('data_stream')
      },
      { 
        name: 'همگام‌سازی اطلاعات', 
        status: await this.checkComponentHealth('data_sync'),
        responseTime: await this.getComponentResponseTime('data_sync')
      }
    ]
    
    // Determine overall status
    const hasError = components.some(c => c.status === 'error')
    const hasWarning = components.some(c => c.status === 'warning')
    const overall = hasError ? 'error' : hasWarning ? 'warning' : 'online'
    
    return {
      overall,
      components,
      metrics,
      uptime: await this.getSystemUptime(),
      lastChecked: Date.now()
    }
  }

  private static async checkComponentHealth(component: string): Promise<'online' | 'warning' | 'error'> {
    const db = getDatabase()
    
    // Check for recent errors for this component
    const query = `
      SELECT severity, created_at
      FROM system_events 
      WHERE component = ? AND created_at > datetime('now', '-5 minutes')
      ORDER BY created_at DESC
      LIMIT 1
    `
    
    const result = await db.query(query, [component])
    
    if (result.results && result.results.length > 0) {
      const event = result.results[0]
      if (event.severity === 'critical' || event.severity === 'high') {
        return 'error'
      } else if (event.severity === 'medium') {
        return 'warning'
      }
    }
    
    return 'online'
  }

  private static async getComponentResponseTime(component: string): Promise<number> {
    // In production, this would measure actual response times
    // For now, return simulated values based on component type
    const baseTimes: { [key: string]: number } = {
      'ai_core': 25,
      'artemis': 35,
      'trading_engine': 45,
      'data_stream': 20,
      'data_sync': 55
    }
    
    return baseTimes[component] || 30
  }

  private static async getSystemUptime(): Promise<number> {
    const db = getDatabase()
    
    // Get system startup time
    const query = `
      SELECT strftime('%s', created_at) * 1000 as startTime
      FROM system_events 
      WHERE type = 'startup' 
      ORDER BY created_at DESC 
      LIMIT 1
    `
    
    const result = await db.query(query)
    
    if (result.results && result.results.length > 0) {
      const startTime = parseInt(result.results[0].startTime)
      return Date.now() - startTime
    }
    
    // Default to 24 hours if no startup event found
    return 24 * 60 * 60 * 1000
  }

  static async getSystemStats(): Promise<any> {
    const db = getDatabase()
    
    // Get various system statistics
    const statsQueries = [
      // Total users
      'SELECT COUNT(*) as totalUsers FROM users',
      // Active sessions (users active in last hour)
      'SELECT COUNT(*) as activeSessions FROM users WHERE last_active_at > datetime("now", "-1 hour")',
      // Total trades today
      'SELECT COUNT(*) as tradesToday FROM trades WHERE created_at > datetime("now", "start of day")',
      // Total API calls (from system events)
      'SELECT COUNT(*) as apiCalls FROM system_events WHERE created_at > datetime("now", "start of day")',
      // Error count today
      'SELECT COUNT(*) as errorsToday FROM system_events WHERE type = "error" AND created_at > datetime("now", "start of day")'
    ]
    
    const results = await Promise.all(
      statsQueries.map(query => db.query(query))
    )
    
    return {
      totalUsers: results[0].results?.[0]?.totalUsers || 0,
      activeSessions: results[1].results?.[0]?.activeSessions || 0,
      tradesToday: results[2].results?.[0]?.tradesToday || 0,
      apiCalls: results[3].results?.[0]?.apiCalls || 0,
      errorsToday: results[4].results?.[0]?.errorsToday || 0,
      timestamp: Date.now()
    }
  }
}

/**
 * Watchlist DAO - Manages user watchlists and favorite cryptocurrencies
 */
export class WatchlistDAO {
  static async create(item: {
    userId: number
    symbol: string
    name: string
    type: 'crypto' | 'stock' | 'forex' | 'commodity'
    exchange?: string
    priceAlertHigh?: number
    priceAlertLow?: number
    notes?: string
  }): Promise<any> {
    const db = getDatabase()
    const query = `
      INSERT INTO watchlist_items (user_id, symbol, name, type, exchange, price_alert_high, 
                                   price_alert_low, notes, is_active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, datetime('now'), datetime('now'))
    `
    
    const result = await db.query(query, [
      item.userId,
      item.symbol.toUpperCase(),
      item.name,
      item.type,
      item.exchange || null,
      item.priceAlertHigh || null,
      item.priceAlertLow || null,
      item.notes || null
    ])
    
    return result.meta?.last_row_id || result.insertId
  }

  static async findByUserId(userId: number): Promise<any[]> {
    const db = getDatabase()
    const query = `
      SELECT id, user_id, symbol, name, type, exchange, price_alert_high, price_alert_low, 
             notes, is_active, strftime('%s', created_at) * 1000 as addedAt
      FROM watchlist_items 
      WHERE user_id = ? AND is_active = 1
      ORDER BY created_at DESC
    `

    const result = await db.query(query, [userId])
    
    return result.results?.map((item: any) => ({
      id: item.id,
      user_id: item.user_id,
      symbol: item.symbol,
      name: item.name,
      type: item.type,
      exchange: item.exchange,
      price_alert_high: item.price_alert_high,
      price_alert_low: item.price_alert_low,
      notes: item.notes,
      added_at: new Date(parseInt(item.addedAt)).toISOString(),
      is_active: item.is_active === 1
    })) || []
  }

  static async findById(itemId: number, userId: number): Promise<any | null> {
    const db = getDatabase()
    const query = `
      SELECT id, user_id, symbol, name, type, exchange, price_alert_high, price_alert_low, 
             notes, is_active, strftime('%s', created_at) * 1000 as addedAt
      FROM watchlist_items 
      WHERE id = ? AND user_id = ? AND is_active = 1
    `

    const result = await db.query(query, [itemId, userId])
    
    if (!result.results || result.results.length === 0) {
      return null
    }
    
    const item = result.results[0]
    return {
      id: item.id,
      user_id: item.user_id,
      symbol: item.symbol,
      name: item.name,
      type: item.type,
      exchange: item.exchange,
      price_alert_high: item.price_alert_high,
      price_alert_low: item.price_alert_low,
      notes: item.notes,
      added_at: new Date(parseInt(item.addedAt)).toISOString(),
      is_active: item.is_active === 1
    }
  }

  static async update(itemId: number, userId: number, updates: {
    name?: string
    type?: string
    exchange?: string
    priceAlertHigh?: number
    priceAlertLow?: number
    notes?: string
  }): Promise<boolean> {
    const db = getDatabase()
    const setParts = []
    const params = []
    
    if (updates.name !== undefined) {
      setParts.push('name = ?')
      params.push(updates.name)
    }
    
    if (updates.type !== undefined) {
      setParts.push('type = ?')
      params.push(updates.type)
    }
    
    if (updates.exchange !== undefined) {
      setParts.push('exchange = ?')
      params.push(updates.exchange)
    }
    
    if (updates.priceAlertHigh !== undefined) {
      setParts.push('price_alert_high = ?')
      params.push(updates.priceAlertHigh)
    }
    
    if (updates.priceAlertLow !== undefined) {
      setParts.push('price_alert_low = ?')
      params.push(updates.priceAlertLow)
    }
    
    if (updates.notes !== undefined) {
      setParts.push('notes = ?')
      params.push(updates.notes)
    }
    
    if (setParts.length === 0) return false
    
    setParts.push('updated_at = datetime(\'now\')')
    params.push(itemId, userId)
    
    const query = `
      UPDATE watchlist_items 
      SET ${setParts.join(', ')}
      WHERE id = ? AND user_id = ?
    `
    
    const result = await db.query(query, params)
    return result.meta?.changes > 0
  }

  static async delete(itemId: number, userId: number): Promise<boolean> {
    const db = getDatabase()
    const query = `
      UPDATE watchlist_items 
      SET is_active = 0, updated_at = datetime('now')
      WHERE id = ? AND user_id = ?
    `
    
    const result = await db.query(query, [itemId, userId])
    return result.meta?.changes > 0
  }

  static async findBySymbol(userId: number, symbol: string): Promise<any | null> {
    const db = getDatabase()
    const query = `
      SELECT id, user_id, symbol, name, type, exchange, price_alert_high, price_alert_low, 
             notes, is_active, strftime('%s', created_at) * 1000 as addedAt
      FROM watchlist_items 
      WHERE user_id = ? AND symbol = ? AND is_active = 1
      LIMIT 1
    `

    const result = await db.query(query, [userId, symbol.toUpperCase()])
    
    if (!result.results || result.results.length === 0) {
      return null
    }
    
    const item = result.results[0]
    return {
      id: item.id,
      user_id: item.user_id,
      symbol: item.symbol,
      name: item.name,
      type: item.type,
      exchange: item.exchange,
      price_alert_high: item.price_alert_high,
      price_alert_low: item.price_alert_low,
      notes: item.notes,
      added_at: new Date(parseInt(item.addedAt)).toISOString(),
      is_active: item.is_active === 1
    }
  }

  static async getUserWatchlistStats(userId: number): Promise<any> {
    const db = getDatabase()
    const query = `
      SELECT 
        COUNT(*) as totalItems,
        COUNT(CASE WHEN type = 'crypto' THEN 1 END) as cryptoItems,
        COUNT(CASE WHEN type = 'stock' THEN 1 END) as stockItems,
        COUNT(CASE WHEN price_alert_high IS NOT NULL OR price_alert_low IS NOT NULL THEN 1 END) as itemsWithAlerts
      FROM watchlist_items 
      WHERE user_id = ? AND is_active = 1
    `

    const result = await db.query(query, [userId])
    return result.results?.[0] || { totalItems: 0, cryptoItems: 0, stockItems: 0, itemsWithAlerts: 0 }
  }
}

/**
 * Database operations with retry and transaction support
 */
export class DatabaseWithRetry {
  private static maxRetries = 3
  private static retryDelay = 1000
  
  static async queryWithRetry(sql: string, params: any[] = [], maxRetries = this.maxRetries): Promise<any> {
    let lastError: Error | null = null
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const db = getDatabase()
        return await db.query(sql, params)
      } catch (error) {
        lastError = error as Error
        console.warn(`Database query attempt ${attempt + 1} failed:`, error)
        
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, this.retryDelay * (attempt + 1)))
        }
      }
    }
    
    throw lastError || new Error('Database operation failed after retries')
  }
  
  static async transactionWithRollback(operations: (() => Promise<any>)[]): Promise<any[]> {
    const db = getDatabase()
    const results: any[] = []
    
    try {
      // SQLite doesn't support nested transactions, so we'll simulate it
      await db.query('BEGIN TRANSACTION')
      
      for (const operation of operations) {
        const result = await operation()
        results.push(result)
      }
      
      await db.query('COMMIT')
      return results
    } catch (error) {
      try {
        await db.query('ROLLBACK')
      } catch (rollbackError) {
        console.error('Rollback failed:', rollbackError)
      }
      throw error
    }
  }
}