// TITAN Trading System - Database Service Manager
// Centralized database operations and connection management

export interface DatabaseConfig {
  binding: D1Database;
  environment: 'development' | 'staging' | 'production';
  enableLogging: boolean;
  queryTimeout: number;
  maxRetries: number;
}

export interface QueryResult<T = any> {
  success: boolean;
  data?: T[];
  meta?: {
    duration?: number;
    changes?: number;
    lastRowId?: number;
    rowsRead?: number;
    rowsWritten?: number;
  };
  error?: string;
}

export interface TransactionResult {
  success: boolean;
  results?: any[];
  error?: string;
}

export class DatabaseService {
  private db: D1Database;
  private config: DatabaseConfig;
  private static instance: DatabaseService;

  constructor(config: DatabaseConfig) {
    this.db = config.binding;
    this.config = config;
  }

  public static getInstance(config?: DatabaseConfig): DatabaseService {
    if (!DatabaseService.instance) {
      if (!config) {
        throw new Error('Database configuration required for first initialization');
      }
      DatabaseService.instance = new DatabaseService(config);
    }
    return DatabaseService.instance;
  }

  // ===========================
  // Query Execution Methods
  // ===========================

  public async query<T = any>(
    sql: string, 
    params: any[] = [], 
    options: { timeout?: number; retries?: number } = {}
  ): Promise<QueryResult<T>> {
    const startTime = Date.now();
    const maxRetries = options.retries ?? this.config.maxRetries;
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (this.config.enableLogging) {
          console.log(`[DB Query] ${sql}`, params);
        }

        const statement = this.db.prepare(sql);
        const result = params.length > 0 
          ? await statement.bind(...params).all<T>()
          : await statement.all<T>();

        const duration = Date.now() - startTime;

        if (this.config.enableLogging) {
          console.log(`[DB Success] Query completed in ${duration}ms`);
        }

        return {
          success: true,
          data: result.results,
          meta: {
            duration,
            rowsRead: result.results.length,
            ...result.meta,
          },
        };

      } catch (error) {
        lastError = error as Error;
        
        if (this.config.enableLogging) {
          console.error(`[DB Error] Attempt ${attempt + 1}/${maxRetries + 1}:`, error);
        }

        if (attempt < maxRetries) {
          // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
          continue;
        }
      }
    }

    return {
      success: false,
      error: `Query failed after ${maxRetries + 1} attempts: ${lastError?.message}`,
    };
  }

  public async execute(
    sql: string, 
    params: any[] = []
  ): Promise<QueryResult> {
    const startTime = Date.now();

    try {
      if (this.config.enableLogging) {
        console.log(`[DB Execute] ${sql}`, params);
      }

      const statement = this.db.prepare(sql);
      const result = params.length > 0 
        ? await statement.bind(...params).run()
        : await statement.run();

      const duration = Date.now() - startTime;

      if (this.config.enableLogging) {
        console.log(`[DB Execute Success] Completed in ${duration}ms, changes: ${result.changes}`);
      }

      return {
        success: true,
        meta: {
          duration,
          changes: result.changes,
          lastRowId: result.meta.last_row_id,
          rowsWritten: result.changes,
        },
      };

    } catch (error) {
      if (this.config.enableLogging) {
        console.error('[DB Execute Error]:', error);
      }

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  public async transaction(queries: { sql: string; params?: any[] }[]): Promise<TransactionResult> {
    const startTime = Date.now();

    try {
      if (this.config.enableLogging) {
        console.log(`[DB Transaction] Starting transaction with ${queries.length} queries`);
      }

      // D1 doesn't support traditional transactions, so we simulate with batch
      const statements = queries.map(query => {
        const statement = this.db.prepare(query.sql);
        return query.params ? statement.bind(...query.params) : statement;
      });

      const results = await this.db.batch(statements);
      const duration = Date.now() - startTime;

      if (this.config.enableLogging) {
        console.log(`[DB Transaction Success] Completed in ${duration}ms`);
      }

      return {
        success: true,
        results: results.map(result => ({
          changes: result.changes,
          lastRowId: result.meta?.last_row_id,
          success: result.success,
          error: result.error,
        })),
      };

    } catch (error) {
      if (this.config.enableLogging) {
        console.error('[DB Transaction Error]:', error);
      }

      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }

  // ===========================
  // High-Level CRUD Operations
  // ===========================

  public async create<T = any>(
    table: string, 
    data: Record<string, any>
  ): Promise<QueryResult<T>> {
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
    
    return await this.execute(sql, values);
  }

  public async read<T = any>(
    table: string, 
    conditions: Record<string, any> = {}, 
    options: {
      columns?: string[];
      orderBy?: string;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<QueryResult<T>> {
    const columns = options.columns?.join(', ') || '*';
    let sql = `SELECT ${columns} FROM ${table}`;
    const params: any[] = [];

    // Add WHERE conditions
    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
      params.push(...Object.values(conditions));
    }

    // Add ORDER BY
    if (options.orderBy) {
      sql += ` ORDER BY ${options.orderBy}`;
    }

    // Add LIMIT and OFFSET
    if (options.limit) {
      sql += ` LIMIT ?`;
      params.push(options.limit);
      
      if (options.offset) {
        sql += ` OFFSET ?`;
        params.push(options.offset);
      }
    }

    return await this.query<T>(sql, params);
  }

  public async update<T = any>(
    table: string, 
    data: Record<string, any>, 
    conditions: Record<string, any>
  ): Promise<QueryResult<T>> {
    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    
    const whereClause = Object.keys(conditions)
      .map(key => `${key} = ?`)
      .join(' AND ');

    const sql = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const params = [...Object.values(data), ...Object.values(conditions)];

    return await this.execute(sql, params);
  }

  public async delete<T = any>(
    table: string, 
    conditions: Record<string, any>
  ): Promise<QueryResult<T>> {
    if (Object.keys(conditions).length === 0) {
      throw new Error('Delete conditions are required for safety');
    }

    const whereClause = Object.keys(conditions)
      .map(key => `${key} = ?`)
      .join(' AND ');

    const sql = `DELETE FROM ${table} WHERE ${whereClause}`;
    const params = Object.values(conditions);

    return await this.execute(sql, params);
  }

  // ===========================
  // Specialized Query Methods
  // ===========================

  public async findOne<T = any>(
    table: string, 
    conditions: Record<string, any>
  ): Promise<T | null> {
    const result = await this.read<T>(table, conditions, { limit: 1 });
    return result.success && result.data && result.data.length > 0 
      ? result.data[0] 
      : null;
  }

  public async exists(
    table: string, 
    conditions: Record<string, any>
  ): Promise<boolean> {
    const result = await this.query(
      `SELECT 1 FROM ${table} WHERE ${Object.keys(conditions).map(k => `${k} = ?`).join(' AND ')} LIMIT 1`,
      Object.values(conditions)
    );
    return result.success && result.data && result.data.length > 0;
  }

  public async count(
    table: string, 
    conditions: Record<string, any> = {}
  ): Promise<number> {
    let sql = `SELECT COUNT(*) as count FROM ${table}`;
    const params: any[] = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');
      sql += ` WHERE ${whereClause}`;
      params.push(...Object.values(conditions));
    }

    const result = await this.query<{ count: number }>(sql, params);
    return result.success && result.data && result.data.length > 0 
      ? result.data[0].count 
      : 0;
  }

  // ===========================
  // Migration & Schema Methods
  // ===========================

  public async runMigration(migrationSql: string): Promise<QueryResult> {
    if (this.config.enableLogging) {
      console.log('[DB Migration] Running database migration');
    }

    // Split the migration into individual statements
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    const results: QueryResult[] = [];

    for (const statement of statements) {
      if (statement.toLowerCase().startsWith('--')) {
        continue; // Skip comments
      }

      const result = await this.execute(statement);
      results.push(result);

      if (!result.success) {
        return {
          success: false,
          error: `Migration failed at statement: ${statement.substring(0, 100)}... Error: ${result.error}`,
        };
      }
    }

    if (this.config.enableLogging) {
      console.log(`[DB Migration] Successfully executed ${statements.length} statements`);
    }

    return {
      success: true,
      meta: {
        changes: results.reduce((total, result) => total + (result.meta?.changes || 0), 0),
      },
    };
  }

  public async getTableInfo(tableName: string): Promise<QueryResult> {
    return await this.query(`PRAGMA table_info(${tableName})`);
  }

  public async getTableList(): Promise<string[]> {
    const result = await this.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name"
    );
    
    return result.success && result.data 
      ? result.data.map(row => row.name)
      : [];
  }

  // ===========================
  // Health & Diagnostics
  // ===========================

  public async healthCheck(): Promise<{
    healthy: boolean;
    responseTime: number;
    tablesCount: number;
    error?: string;
  }> {
    const startTime = Date.now();

    try {
      // Simple query to test connectivity
      const result = await this.query("SELECT 1 as test");
      const tables = await this.getTableList();
      
      return {
        healthy: result.success,
        responseTime: Date.now() - startTime,
        tablesCount: tables.length,
      };
      
    } catch (error) {
      return {
        healthy: false,
        responseTime: Date.now() - startTime,
        tablesCount: 0,
        error: (error as Error).message,
      };
    }
  }

  public async getStats(): Promise<{
    tablesCount: number;
    tables: { name: string; rowCount: number }[];
  }> {
    const tables = await this.getTableList();
    const tableStats = await Promise.all(
      tables.map(async (tableName) => ({
        name: tableName,
        rowCount: await this.count(tableName),
      }))
    );

    return {
      tablesCount: tables.length,
      tables: tableStats,
    };
  }

  // ===========================
  // Configuration Methods
  // ===========================

  public updateConfig(newConfig: Partial<DatabaseConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): DatabaseConfig {
    return { ...this.config };
  }
}

// Export convenience functions
export const createDatabaseService = (config: DatabaseConfig): DatabaseService => {
  return new DatabaseService(config);
};

export const getDatabaseService = (config?: DatabaseConfig): DatabaseService => {
  return DatabaseService.getInstance(config);
};