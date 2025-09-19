/**
 * TITAN Trading System - Database Connection
 * Real PostgreSQL + Redis Integration
 */

import { Pool, PoolClient } from 'pg';
import { createClient } from 'redis';

// =============================================================================
// DATABASE CONFIGURATION
// =============================================================================

const DATABASE_CONFIG = {
  user: 'titan_user',
  password: 'titan_secure_2024',
  host: 'localhost',
  database: 'titan_trading',
  port: 5432,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

const REDIS_CONFIG = {
  url: 'redis://localhost:6379',
  socket: {
    connectTimeout: 2000,
    lazyConnect: true
  }
};

// =============================================================================
// CONNECTION INSTANCES
// =============================================================================

export class DatabaseManager {
  private static instance: DatabaseManager;
  private pgPool: Pool;
  private redisClient: any;
  private isConnected = false;

  private constructor() {
    // PostgreSQL connection pool
    this.pgPool = new Pool(DATABASE_CONFIG);
    
    // Redis client
    this.redisClient = createClient(REDIS_CONFIG);
    
    // Setup error handlers
    this.setupErrorHandlers();
  }

  public static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  private setupErrorHandlers(): void {
    this.pgPool.on('error', (err) => {
      console.error('PostgreSQL pool error:', err);
    });

    this.redisClient.on('error', (err: any) => {
      console.error('Redis client error:', err);
    });
  }

  // =============================================================================
  // CONNECTION MANAGEMENT
  // =============================================================================

  public async connect(): Promise<void> {
    try {
      // Test PostgreSQL connection
      const client = await this.pgPool.connect();
      const result = await client.query('SELECT NOW()');
      client.release();
      
      // Connect Redis
      if (!this.redisClient.isOpen) {
        await this.redisClient.connect();
      }

      this.isConnected = true;
      console.log('✅ Database connections established');
      console.log('📅 PostgreSQL time:', result.rows[0].now);
      console.log('⚡ Redis status:', this.redisClient.isOpen ? 'Connected' : 'Disconnected');
      
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      throw error;
    }
  }

  public async disconnect(): Promise<void> {
    try {
      await this.pgPool.end();
      if (this.redisClient.isOpen) {
        await this.redisClient.disconnect();
      }
      this.isConnected = false;
      console.log('🔌 Database connections closed');
    } catch (error) {
      console.error('Error disconnecting:', error);
    }
  }

  // =============================================================================
  // POSTGRESQL OPERATIONS
  // =============================================================================

  /**
   * Execute a query with optional parameters
   */
  public async query(text: string, params?: any[]): Promise<any> {
    if (!this.isConnected) {
      await this.connect();
    }

    const client = await this.pgPool.connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  }

  /**
   * Execute multiple queries in a transaction
   */
  public async transaction(queries: Array<{ text: string; params?: any[] }>): Promise<any[]> {
    if (!this.isConnected) {
      await this.connect();
    }

    const client = await this.pgPool.connect();
    try {
      await client.query('BEGIN');
      const results = [];
      
      for (const query of queries) {
        const result = await client.query(query.text, query.params);
        results.push(result);
      }
      
      await client.query('COMMIT');
      return results;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  // =============================================================================
  // REDIS OPERATIONS
  // =============================================================================

  /**
   * Set a key-value pair with optional expiration
   */
  public async setCache(key: string, value: any, expirySeconds?: number): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    const serializedValue = JSON.stringify(value);
    if (expirySeconds) {
      await this.redisClient.setEx(key, expirySeconds, serializedValue);
    } else {
      await this.redisClient.set(key, serializedValue);
    }
  }

  /**
   * Get a value from cache
   */
  public async getCache(key: string): Promise<any> {
    if (!this.isConnected) {
      await this.connect();
    }

    const value = await this.redisClient.get(key);
    return value ? JSON.parse(value) : null;
  }

  /**
   * Delete a key from cache
   */
  public async deleteCache(key: string): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    await this.redisClient.del(key);
  }

  /**
   * Set multiple key-value pairs
   */
  public async setCacheMultiple(items: Record<string, any>): Promise<void> {
    if (!this.isConnected) {
      await this.connect();
    }

    const pipeline = this.redisClient.multi();
    for (const [key, value] of Object.entries(items)) {
      pipeline.set(key, JSON.stringify(value));
    }
    await pipeline.exec();
  }

  // =============================================================================
  // HEALTH CHECK
  // =============================================================================

  public async healthCheck(): Promise<{ postgres: boolean; redis: boolean; timestamp: string }> {
    try {
      // Check PostgreSQL
      const pgResult = await this.query('SELECT 1');
      const postgresOk = pgResult.rows.length > 0;

      // Check Redis
      const redisResult = await this.redisClient.ping();
      const redisOk = redisResult === 'PONG';

      return {
        postgres: postgresOk,
        redis: redisOk,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        postgres: false,
        redis: false,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Build WHERE clause from filters
 */
export function buildWhereClause(filters: Record<string, any>): { clause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null) {
      if (Array.isArray(value)) {
        const placeholders = value.map(() => `$${paramIndex++}`).join(',');
        conditions.push(`${key} IN (${placeholders})`);
        params.push(...value);
      } else {
        conditions.push(`${key} = $${paramIndex++}`);
        params.push(value);
      }
    }
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params
  };
}

/**
 * Build pagination clause
 */
export function buildPaginationClause(page: number = 1, limit: number = 50): { clause: string; offset: number } {
  const offset = (page - 1) * limit;
  return {
    clause: `LIMIT ${limit} OFFSET ${offset}`,
    offset
  };
}

// =============================================================================
// EXPORT SINGLETON INSTANCE
// =============================================================================

export const db = DatabaseManager.getInstance();