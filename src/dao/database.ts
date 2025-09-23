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
          return await stmt.bind(...params).all()
        }
        return await stmt.all()
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
  static async getActiveSignals(symbol?: string, limit = 50): Promise<AISignal[]> {
    const db = getDatabase()
    
    if (symbol) {
      const result = await db.query(`
        SELECT * FROM ai_signals 
        WHERE symbol = ? AND status = 'active' 
        ORDER BY created_at DESC LIMIT ?
      `, [symbol, limit])
      return result.results || []
    }
    
    const result = await db.query(`
      SELECT * FROM ai_signals 
      WHERE status = 'active' 
      ORDER BY created_at DESC LIMIT ?
    `, [limit])
    return result.results || []
  }

  static async createSignal(signal: Partial<AISignal>): Promise<AISignal> {
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
}