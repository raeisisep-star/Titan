/**
 * TITAN Trading System - Database Adapter for Cloudflare Workers
 * Simple HTTP-based database adapter
 */

interface QueryResult {
  rows: any[];
  rowCount: number;
}

export class DatabaseAdapter {
  private static instance: DatabaseAdapter;
  private isConnected = false;

  private constructor() {}

  public static getInstance(): DatabaseAdapter {
    if (!DatabaseAdapter.instance) {
      DatabaseAdapter.instance = new DatabaseAdapter();
    }
    return DatabaseAdapter.instance;
  }

  // =============================================================================
  // CONNECTION MANAGEMENT
  // =============================================================================

  public async connect(): Promise<void> {
    try {
      console.log('✅ Database adapter initialized (Mock mode for Cloudflare Workers)')
      this.isConnected = true
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    this.isConnected = false
    console.log('🔌 Database adapter disconnected')
  }

  // =============================================================================
  // QUERY METHODS
  // =============================================================================

  public async query(text: string, params?: any[]): Promise<QueryResult> {
    console.log('📊 Database Query:', text, params)
    
    // Mock responses for different query types
    if (text.includes('SELECT NOW()')) {
      return {
        rows: [{ now: new Date().toISOString() }],
        rowCount: 1
      }
    }

    if (text.includes('FROM markets')) {
      return {
        rows: [
          { symbol: 'BTCUSDT', base_currency: 'BTC', quote_currency: 'USDT', market_type: 'crypto', exchange: 'binance', is_active: true },
          { symbol: 'ETHUSDT', base_currency: 'ETH', quote_currency: 'USDT', market_type: 'crypto', exchange: 'binance', is_active: true },
          { symbol: 'ADAUSDT', base_currency: 'ADA', quote_currency: 'USDT', market_type: 'crypto', exchange: 'binance', is_active: true },
        ],
        rowCount: 3
      }
    }

    if (text.includes('FROM portfolios')) {
      return {
        rows: [
          { 
            id: 'portfolio-1', 
            name: 'Main Portfolio', 
            total_balance: '10000.00', 
            available_balance: '9500.00',
            total_pnl: '500.00',
            daily_pnl: '50.00',
            created_at: new Date().toISOString(),
            account_name: 'Demo Account',
            account_type: 'demo'
          }
        ],
        rowCount: 1
      }
    }

    if (text.includes('INSERT INTO users')) {
      return {
        rows: [{
          id: 'user-' + Date.now(),
          username: params?.[1] || 'testuser',
          email: params?.[2] || 'test@example.com',
          first_name: params?.[4] || 'Test',
          is_active: true,
          is_verified: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }],
        rowCount: 1
      }
    }

    if (text.includes('FROM users') && text.includes('WHERE')) {
      // Mock user for login
      return {
        rows: [{
          id: 'user-123',
          username: 'testuser',
          email: 'test@example.com',
          password_hash: '$2a$12$mockhashedpassword',
          first_name: 'Test',
          last_name: 'User',
          is_active: true,
          is_verified: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }],
        rowCount: 1
      }
    }

    // Default empty response
    return { rows: [], rowCount: 0 }
  }

  public async transaction(queries: Array<{ text: string; params?: any[] }>): Promise<QueryResult[]> {
    const results = []
    for (const query of queries) {
      results.push(await this.query(query.text, query.params))
    }
    return results
  }

  // =============================================================================
  // CACHE METHODS (Mock Redis)
  // =============================================================================

  private cache = new Map<string, { value: any; expires: number }>()

  public async setCache(key: string, value: any, expirySeconds?: number): Promise<void> {
    const expires = expirySeconds ? Date.now() + (expirySeconds * 1000) : 0
    this.cache.set(key, { value, expires })
    console.log('📦 Cache SET:', key)
  }

  public async getCache(key: string): Promise<any> {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (cached.expires && Date.now() > cached.expires) {
      this.cache.delete(key)
      return null
    }
    
    console.log('📦 Cache GET:', key)
    return cached.value
  }

  public async deleteCache(key: string): Promise<void> {
    this.cache.delete(key)
    console.log('📦 Cache DELETE:', key)
  }

  public async setCacheMultiple(items: Record<string, any>): Promise<void> {
    for (const [key, value] of Object.entries(items)) {
      await this.setCache(key, value)
    }
  }

  // =============================================================================
  // HEALTH CHECK
  // =============================================================================

  public async healthCheck(): Promise<{ postgres: boolean; redis: boolean; timestamp: string }> {
    return {
      postgres: this.isConnected,
      redis: this.isConnected,
      timestamp: new Date().toISOString()
    }
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export function buildWhereClause(filters: Record<string, any>): { clause: string; params: any[] } {
  const conditions: string[] = []
  const params: any[] = []
  let paramIndex = 1

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        const placeholders = value.map(() => `$${paramIndex++}`).join(',')
        conditions.push(`${key} IN (${placeholders})`)
        params.push(...value)
      } else {
        conditions.push(`${key} = $${paramIndex++}`)
        params.push(value)
      }
    }
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  }
}

export function buildPaginationClause(page: number = 1, limit: number = 50): { clause: string; offset: number } {
  const offset = (page - 1) * limit
  return {
    clause: `LIMIT ${limit} OFFSET ${offset}`,
    offset
  }
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const db = DatabaseAdapter.getInstance()