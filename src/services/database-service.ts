// TITAN Database Service - Cloudflare D1 Integration
import type { Env } from '../types/cloudflare'

export interface User {
  id: number
  username: string
  email: string
  password_hash: string
  full_name?: string
  role: 'admin' | 'user' | 'trader' | 'analyst'
  avatar_url?: string
  settings: any
  created_at: string
  updated_at: string
  last_login?: string
  is_active: boolean
  email_verified: boolean
  two_factor_enabled: boolean
}

export interface TradingAccount {
  id: number
  user_id: number
  exchange: string
  account_name: string
  api_key_encrypted?: string
  api_secret_encrypted?: string
  passphrase_encrypted?: string
  is_testnet: boolean
  is_active: boolean
  balance_usd: number
  last_sync?: string
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: number
  user_id: number
  name: string
  total_value_usd: number
  total_pnl_usd: number
  total_pnl_percentage: number
  risk_level: 'low' | 'medium' | 'high' | 'aggressive'
  rebalance_frequency: 'daily' | 'weekly' | 'monthly' | 'manual'
  created_at: string
  updated_at: string
}

export interface Trade {
  id: number
  user_id: number
  trading_account_id: number
  portfolio_id?: number
  exchange_order_id?: string
  symbol: string
  side: 'buy' | 'sell'
  type: 'market' | 'limit' | 'stop_loss' | 'take_profit' | 'trailing_stop'
  status: 'pending' | 'filled' | 'partially_filled' | 'cancelled' | 'failed'
  quantity: number
  price?: number
  filled_quantity: number
  average_fill_price: number
  fees: number
  total_value?: number
  stop_price?: number
  take_profit_price?: number
  strategy?: string
  ai_agent?: string
  ai_confidence?: number
  execution_time?: string
  created_at: string
  updated_at: string
}

export interface AIAnalysis {
  id: number
  user_id?: number
  symbol: string
  analysis_type: 'market_analysis' | 'price_prediction' | 'trade_signal' | 'portfolio_optimization' | 'risk_assessment'
  ai_provider: 'openai' | 'anthropic'
  model_used: string
  input_data?: any
  analysis_result: any
  confidence_score?: number
  risk_level?: 'low' | 'medium' | 'high' | 'critical'
  signals?: any
  price_targets?: any
  recommendations?: any
  processing_time_ms?: number
  tokens_used?: number
  created_at: string
  expires_at?: string
}

export class DatabaseService {
  private db: D1Database

  constructor(env: Env) {
    if (!env.DB) {
      console.warn('D1 Database not configured - using fallback mode')
    }
    this.db = env.DB
  }

  // ===========================
  // User Management
  // ===========================

  async getUserByUsername(username: string): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE username = ? AND is_active = TRUE')
    const result = await stmt.bind(username).first()
    return result as User | null
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ? AND is_active = TRUE')
    const result = await stmt.bind(email).first()
    return result as User | null
  }

  async getUserById(userId: number): Promise<User | null> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ? AND is_active = TRUE')
    const result = await stmt.bind(userId).first()
    return result as User | null
  }

  async createUser(userData: Partial<User>): Promise<User> {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, role, settings)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `)
    
    const result = await stmt.bind(
      userData.username,
      userData.email,
      userData.password_hash,
      userData.full_name || null,
      userData.role || 'user',
      JSON.stringify(userData.settings || {})
    ).first()
    
    return result as User
  }

  async updateUserLastLogin(userId: number): Promise<void> {
    const stmt = this.db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?')
    await stmt.bind(userId).run()
  }

  // ===========================
  // Trading Accounts
  // ===========================

  async getTradingAccountsByUserId(userId: number): Promise<TradingAccount[]> {
    const stmt = this.db.prepare('SELECT * FROM trading_accounts WHERE user_id = ? AND is_active = TRUE ORDER BY created_at DESC')
    const result = await stmt.bind(userId).all()
    return result.results as TradingAccount[]
  }

  async getTradingAccountById(accountId: number, userId?: number): Promise<TradingAccount | null> {
    let query = 'SELECT * FROM trading_accounts WHERE id = ?'
    const params = [accountId]
    
    if (userId) {
      query += ' AND user_id = ?'
      params.push(userId)
    }
    
    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).first()
    return result as TradingAccount | null
  }

  async createTradingAccount(accountData: Partial<TradingAccount>): Promise<TradingAccount> {
    const stmt = this.db.prepare(`
      INSERT INTO trading_accounts (user_id, exchange, account_name, is_testnet, balance_usd)
      VALUES (?, ?, ?, ?, ?)
      RETURNING *
    `)
    
    const result = await stmt.bind(
      accountData.user_id,
      accountData.exchange,
      accountData.account_name,
      accountData.is_testnet || true,
      accountData.balance_usd || 0
    ).first()
    
    return result as TradingAccount
  }

  // ===========================
  // Portfolios
  // ===========================

  async getPortfoliosByUserId(userId: number): Promise<Portfolio[]> {
    const stmt = this.db.prepare('SELECT * FROM portfolios WHERE user_id = ? ORDER BY created_at DESC')
    const result = await stmt.bind(userId).all()
    return result.results as Portfolio[]
  }

  async getPortfolioById(portfolioId: number, userId?: number): Promise<Portfolio | null> {
    let query = 'SELECT * FROM portfolios WHERE id = ?'
    const params = [portfolioId]
    
    if (userId) {
      query += ' AND user_id = ?'
      params.push(userId)
    }
    
    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).first()
    return result as Portfolio | null
  }

  // ===========================
  // Trades
  // ===========================

  async getTradesByUserId(userId: number, limit: number = 50): Promise<Trade[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM trades 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `)
    const result = await stmt.bind(userId, limit).all()
    return result.results as Trade[]
  }

  async getTradesBySymbol(symbol: string, userId?: number, limit: number = 20): Promise<Trade[]> {
    let query = 'SELECT * FROM trades WHERE symbol = ?'
    const params = [symbol]
    
    if (userId) {
      query += ' AND user_id = ?'
      params.push(userId)
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit)
    
    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).all()
    return result.results as Trade[]
  }

  async createTrade(tradeData: Partial<Trade>): Promise<Trade> {
    const stmt = this.db.prepare(`
      INSERT INTO trades (
        user_id, trading_account_id, portfolio_id, symbol, side, type, 
        status, quantity, price, strategy, ai_agent, ai_confidence
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `)
    
    const result = await stmt.bind(
      tradeData.user_id,
      tradeData.trading_account_id,
      tradeData.portfolio_id || null,
      tradeData.symbol,
      tradeData.side,
      tradeData.type,
      tradeData.status || 'pending',
      tradeData.quantity,
      tradeData.price || null,
      tradeData.strategy || null,
      tradeData.ai_agent || null,
      tradeData.ai_confidence || null
    ).first()
    
    return result as Trade
  }

  async updateTradeStatus(tradeId: number, status: string, updateData?: Partial<Trade>): Promise<void> {
    let query = 'UPDATE trades SET status = ?, updated_at = CURRENT_TIMESTAMP'
    const params = [status]
    
    if (updateData) {
      if (updateData.filled_quantity !== undefined) {
        query += ', filled_quantity = ?'
        params.push(updateData.filled_quantity)
      }
      if (updateData.average_fill_price !== undefined) {
        query += ', average_fill_price = ?'
        params.push(updateData.average_fill_price)
      }
      if (updateData.fees !== undefined) {
        query += ', fees = ?'
        params.push(updateData.fees)
      }
      if (updateData.execution_time !== undefined) {
        query += ', execution_time = ?'
        params.push(updateData.execution_time)
      }
    }
    
    query += ' WHERE id = ?'
    params.push(tradeId)
    
    const stmt = this.db.prepare(query)
    await stmt.bind(...params).run()
  }

  // ===========================
  // AI Analysis Storage
  // ===========================

  async storeAIAnalysis(analysisData: Partial<AIAnalysis>): Promise<AIAnalysis> {
    const stmt = this.db.prepare(`
      INSERT INTO ai_analyses (
        user_id, symbol, analysis_type, ai_provider, model_used,
        input_data, analysis_result, confidence_score, risk_level,
        signals, price_targets, recommendations, processing_time_ms,
        tokens_used, expires_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING *
    `)
    
    // Set expiration (24 hours from now)
    const expiresAt = new Date()
    expiresAt.setHours(expiresAt.getHours() + 24)
    
    const result = await stmt.bind(
      analysisData.user_id || null,
      analysisData.symbol,
      analysisData.analysis_type,
      analysisData.ai_provider,
      analysisData.model_used,
      JSON.stringify(analysisData.input_data || {}),
      JSON.stringify(analysisData.analysis_result),
      analysisData.confidence_score || null,
      analysisData.risk_level || null,
      JSON.stringify(analysisData.signals || {}),
      JSON.stringify(analysisData.price_targets || {}),
      JSON.stringify(analysisData.recommendations || []),
      analysisData.processing_time_ms || null,
      analysisData.tokens_used || null,
      expiresAt.toISOString()
    ).first()
    
    return result as AIAnalysis
  }

  async getRecentAIAnalyses(symbol?: string, analysisType?: string, limit: number = 10): Promise<AIAnalysis[]> {
    let query = `
      SELECT * FROM ai_analyses 
      WHERE expires_at > CURRENT_TIMESTAMP
    `
    const params = []
    
    if (symbol) {
      query += ' AND symbol = ?'
      params.push(symbol)
    }
    
    if (analysisType) {
      query += ' AND analysis_type = ?'
      params.push(analysisType)
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?'
    params.push(limit)
    
    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).all()
    return result.results as AIAnalysis[]
  }

  async getAIAnalysisById(analysisId: number): Promise<AIAnalysis | null> {
    const stmt = this.db.prepare('SELECT * FROM ai_analyses WHERE id = ?')
    const result = await stmt.bind(analysisId).first()
    return result as AIAnalysis | null
  }

  // ===========================
  // Market Data
  // ===========================

  async getLatestMarketData(symbol?: string): Promise<any[]> {
    let query = `
      SELECT * FROM market_data 
      WHERE timestamp > datetime('now', '-1 hour')
    `
    const params = []
    
    if (symbol) {
      query += ' AND symbol = ?'
      params.push(symbol)
    }
    
    query += ' ORDER BY timestamp DESC'
    
    const stmt = this.db.prepare(query)
    const result = await stmt.bind(...params).all()
    return result.results || []
  }

  async updateMarketData(marketData: any): Promise<void> {
    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO market_data (
        symbol, exchange, price, volume_24h, market_cap,
        change_1h, change_24h, change_7d, high_24h, low_24h,
        data_source, timestamp
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `)
    
    await stmt.bind(
      marketData.symbol,
      marketData.exchange || 'coingecko',
      marketData.price,
      marketData.volume_24h || 0,
      marketData.market_cap || 0,
      marketData.change_1h || 0,
      marketData.change_24h || 0,
      marketData.change_7d || 0,
      marketData.high_24h || marketData.price,
      marketData.low_24h || marketData.price,
      marketData.data_source || 'coingecko'
    ).run()
  }

  // ===========================
  // Notifications
  // ===========================

  async storeNotification(notificationData: any): Promise<number> {
    const stmt = this.db.prepare(`
      INSERT INTO notifications (
        user_id, type, title, message, priority, channels, status, data
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      RETURNING id
    `)
    
    const result = await stmt.bind(
      notificationData.user_id || null,
      notificationData.type,
      notificationData.title,
      notificationData.message,
      notificationData.priority || 'medium',
      JSON.stringify(notificationData.channels || []),
      notificationData.status || 'pending',
      JSON.stringify(notificationData.data || {})
    ).first()
    
    return (result as any).id
  }

  async getNotificationsByUserId(userId: number, limit: number = 50): Promise<any[]> {
    const stmt = this.db.prepare(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC 
      LIMIT ?
    `)
    const result = await stmt.bind(userId, limit).all()
    return result.results || []
  }

  // ===========================
  // System Statistics
  // ===========================

  async getDashboardStats(userId?: number): Promise<any> {
    // Total users
    const totalUsers = await this.db.prepare('SELECT COUNT(*) as count FROM users WHERE is_active = TRUE').first()
    
    // Total trades
    let tradesQuery = 'SELECT COUNT(*) as count FROM trades'
    const tradesParams = []
    if (userId) {
      tradesQuery += ' WHERE user_id = ?'
      tradesParams.push(userId)
    }
    const totalTrades = await this.db.prepare(tradesQuery).bind(...tradesParams).first()
    
    // Recent analyses
    let analysesQuery = 'SELECT COUNT(*) as count FROM ai_analyses WHERE created_at > datetime("now", "-24 hours")'
    const analysesParams = []
    if (userId) {
      analysesQuery += ' AND user_id = ?'
      analysesParams.push(userId)
    }
    const recentAnalyses = await this.db.prepare(analysesQuery).bind(...analysesParams).first()
    
    // Active portfolios
    let portfoliosQuery = 'SELECT COUNT(*) as count FROM portfolios'
    const portfoliosParams = []
    if (userId) {
      portfoliosQuery += ' WHERE user_id = ?'
      portfoliosParams.push(userId)
    }
    const activePortfolios = await this.db.prepare(portfoliosQuery).bind(...portfoliosParams).first()

    return {
      total_users: (totalUsers as any)?.count || 0,
      total_trades: (totalTrades as any)?.count || 0,
      recent_analyses: (recentAnalyses as any)?.count || 0,
      active_portfolios: (activePortfolios as any)?.count || 0,
      timestamp: new Date().toISOString()
    }
  }

  // ===========================
  // Database Utilities
  // ===========================

  async healthCheck(): Promise<{ status: string; timestamp: string; tables: number }> {
    try {
      // Test basic connectivity
      const testQuery = await this.db.prepare("SELECT 1 as test").first()
      
      // Count tables
      const tablesResult = await this.db.prepare(`
        SELECT COUNT(*) as count 
        FROM sqlite_master 
        WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
      `).first()
      
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        tables: (tablesResult as any)?.count || 0
      }
    } catch (error) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        tables: 0
      }
    }
  }

  async cleanupExpiredData(): Promise<void> {
    // Clean up expired AI analyses
    await this.db.prepare(`
      DELETE FROM ai_analyses 
      WHERE expires_at < CURRENT_TIMESTAMP
    `).run()
    
    // Clean up old market data (keep only last 30 days)
    await this.db.prepare(`
      DELETE FROM market_data 
      WHERE timestamp < datetime('now', '-30 days')
    `).run()
    
    // Clean up old system logs (keep only last 7 days)
    await this.db.prepare(`
      DELETE FROM system_logs 
      WHERE created_at < datetime('now', '-7 days')
    `).run()
  }
}