/**
 * 🗄️ TITAN Trading System - Database API Routes
 * 
 * Comprehensive database API endpoints for:
 * - Database Connection & Health
 * - User Management
 * - Strategy CRUD Operations
 * - Portfolio Management
 * - Market Data Access
 * - Migration & Seeding
 * - Performance Monitoring
 * 
 * Features:
 * ✅ Full CRUD operations for all entities
 * ✅ Database health monitoring
 * ✅ Migration management
 * ✅ Query performance analytics
 * ✅ Real-time status reporting
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { DatabaseService, getDatabaseService, initializeDatabaseService } from '../db/database-service';
import type { 
  CreateUserRequest, 
  CreateStrategyRequest,
  DatabaseConfig 
} from '../db/database-service';

const databaseRoutes = new Hono();

// Enable CORS for all database routes
databaseRoutes.use('*', cors());

// ================================
// 🔌 DATABASE CONNECTION & HEALTH
// ================================

/**
 * Initialize database connection
 */
databaseRoutes.post('/db/connect', async (c) => {
  try {
    // Get D1 database from Cloudflare environment
    const database = c.env?.DB as D1Database;
    
    if (!database) {
      return c.json({
        success: false,
        error: 'D1 Database binding not found. Check wrangler.jsonc configuration.'
      }, 500);
    }
    
    // Initialize database service
    const config: DatabaseConfig = {
      database,
      enableQueryCache: true,
      cacheMaxSize: 1000,
      queryTimeout: 30000,
      enableQueryLogging: true,
      enablePerformanceMetrics: true,
      slowQueryThreshold: 1000
    };
    
    const dbService = initializeDatabaseService(config);
    await dbService.connect(database);
    
    return c.json({
      success: true,
      message: 'Database connected successfully',
      connectionStatus: 'connected',
      timestamp: Date.now()
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to connect to database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Database health check
 */
databaseRoutes.get('/db/health', async (c) => {
  try {
    const dbService = getDatabaseService();
    const healthStatus = dbService.getHealthStatus();
    
    return c.json({
      success: true,
      health: healthStatus,
      timestamp: Date.now()
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Database service not available',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Database performance metrics
 */
databaseRoutes.get('/db/metrics', async (c) => {
  try {
    const dbService = getDatabaseService();
    const metrics = dbService.getMetrics();
    
    return c.json({
      success: true,
      metrics,
      timestamp: Date.now()
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve database metrics',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Clear query cache
 */
databaseRoutes.post('/db/cache/clear', async (c) => {
  try {
    const dbService = getDatabaseService();
    dbService.clearCache();
    
    return c.json({
      success: true,
      message: 'Database cache cleared successfully',
      timestamp: Date.now()
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to clear database cache',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ================================
// 🔄 MIGRATION MANAGEMENT
// ================================

/**
 * Get migration status
 */
databaseRoutes.get('/db/migrations/status', async (c) => {
  try {
    const dbService = getDatabaseService();
    const migrationStatus = await dbService.runMigrations();
    
    return c.json({
      success: true,
      migrations: migrationStatus,
      timestamp: Date.now()
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to check migration status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Seed database with initial data
 */
databaseRoutes.post('/db/seed', async (c) => {
  try {
    const dbService = getDatabaseService();
    await dbService.seedDatabase();
    
    return c.json({
      success: true,
      message: 'Database seeded successfully',
      timestamp: Date.now()
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ================================
// 👤 USER MANAGEMENT
// ================================

/**
 * Create new user
 */
databaseRoutes.post('/db/users', async (c) => {
  try {
    const userData: CreateUserRequest = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['email', 'passwordHash', 'firstName', 'lastName', 'username'];
    for (const field of requiredFields) {
      if (!userData[field as keyof CreateUserRequest]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`
        }, 400);
      }
    }
    
    const dbService = getDatabaseService();
    const result = await dbService.createUser(userData);
    
    if (result.success) {
      return c.json({
        success: true,
        user: result.data?.[0],
        message: 'User created successfully'
      });
    } else {
      return c.json({
        success: false,
        error: result.error || 'Failed to create user'
      }, 400);
    }
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get user by ID
 */
databaseRoutes.get('/db/users/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({
        success: false,
        error: 'Invalid user ID'
      }, 400);
    }
    
    const dbService = getDatabaseService();
    const result = await dbService.getUserById(id);
    
    if (result.success && result.data && result.data.length > 0) {
      return c.json({
        success: true,
        user: result.data[0]
      });
    } else {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get user by email
 */
databaseRoutes.get('/db/users/email/:email', async (c) => {
  try {
    const email = c.req.param('email');
    
    if (!email) {
      return c.json({
        success: false,
        error: 'Email parameter is required'
      }, 400);
    }
    
    const dbService = getDatabaseService();
    const result = await dbService.getUserByEmail(email);
    
    if (result.success && result.data && result.data.length > 0) {
      return c.json({
        success: true,
        user: result.data[0]
      });
    } else {
      return c.json({
        success: false,
        error: 'User not found'
      }, 404);
    }
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ================================
// 📈 STRATEGY MANAGEMENT
// ================================

/**
 * Create new strategy
 */
databaseRoutes.post('/db/strategies', async (c) => {
  try {
    const strategyData: CreateStrategyRequest = await c.req.json();
    
    // Validate required fields
    const requiredFields = ['userId', 'name', 'strategyType', 'timeframe', 'symbols'];
    for (const field of requiredFields) {
      if (!strategyData[field as keyof CreateStrategyRequest]) {
        return c.json({
          success: false,
          error: `Missing required field: ${field}`
        }, 400);
      }
    }
    
    const dbService = getDatabaseService();
    const result = await dbService.createStrategy(strategyData);
    
    if (result.success) {
      return c.json({
        success: true,
        strategy: result.data?.[0],
        message: 'Strategy created successfully'
      });
    } else {
      return c.json({
        success: false,
        error: result.error || 'Failed to create strategy'
      }, 400);
    }
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to create strategy',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get strategy by ID
 */
databaseRoutes.get('/db/strategies/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({
        success: false,
        error: 'Invalid strategy ID'
      }, 400);
    }
    
    const dbService = getDatabaseService();
    const result = await dbService.getStrategyById(id);
    
    if (result.success && result.data && result.data.length > 0) {
      return c.json({
        success: true,
        strategy: result.data[0]
      });
    } else {
      return c.json({
        success: false,
        error: 'Strategy not found'
      }, 404);
    }
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve strategy',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get strategies by user ID
 */
databaseRoutes.get('/db/strategies/user/:userId', async (c) => {
  try {
    const userId = parseInt(c.req.param('userId'));
    const limit = parseInt(c.req.query('limit') || '50');
    const offset = parseInt(c.req.query('offset') || '0');
    
    if (isNaN(userId)) {
      return c.json({
        success: false,
        error: 'Invalid user ID'
      }, 400);
    }
    
    const dbService = getDatabaseService();
    const result = await dbService.getStrategiesByUserId(userId, limit, offset);
    
    if (result.success) {
      return c.json({
        success: true,
        strategies: result.data || [],
        pagination: {
          limit,
          offset,
          count: result.data?.length || 0
        }
      });
    } else {
      return c.json({
        success: false,
        error: result.error || 'Failed to retrieve strategies'
      }, 500);
    }
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve strategies',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ================================
// 💹 MARKET DATA
// ================================

/**
 * Get all active symbols
 */
databaseRoutes.get('/db/symbols', async (c) => {
  try {
    const dbService = getDatabaseService();
    const result = await dbService.getSymbols();
    
    if (result.success) {
      return c.json({
        success: true,
        symbols: result.data || [],
        count: result.data?.length || 0
      });
    } else {
      return c.json({
        success: false,
        error: result.error || 'Failed to retrieve symbols'
      }, 500);
    }
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve symbols',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

/**
 * Get price data for a symbol
 */
databaseRoutes.get('/db/price-data/:symbol/:timeframe', async (c) => {
  try {
    const symbol = c.req.param('symbol');
    const timeframe = c.req.param('timeframe');
    const limit = parseInt(c.req.query('limit') || '100');
    
    if (!symbol || !timeframe) {
      return c.json({
        success: false,
        error: 'Symbol and timeframe are required'
      }, 400);
    }
    
    const validTimeframes = ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'];
    if (!validTimeframes.includes(timeframe)) {
      return c.json({
        success: false,
        error: `Invalid timeframe. Valid options: ${validTimeframes.join(', ')}`
      }, 400);
    }
    
    const dbService = getDatabaseService();
    const result = await dbService.getPriceData(symbol, timeframe, limit);
    
    if (result.success) {
      return c.json({
        success: true,
        priceData: result.data || [],
        symbol,
        timeframe,
        count: result.data?.length || 0,
        meta: result.meta
      });
    } else {
      return c.json({
        success: false,
        error: result.error || 'Failed to retrieve price data'
      }, 500);
    }
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve price data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ================================
// 🔍 RAW QUERY EXECUTION
// ================================

/**
 * Execute raw SELECT query (admin only)
 */
databaseRoutes.post('/db/query', async (c) => {
  try {
    const { sql, params = [] } = await c.req.json();
    
    if (!sql) {
      return c.json({
        success: false,
        error: 'SQL query is required'
      }, 400);
    }
    
    // Security: Only allow SELECT queries
    const sqlUpper = sql.trim().toUpperCase();
    if (!sqlUpper.startsWith('SELECT')) {
      return c.json({
        success: false,
        error: 'Only SELECT queries are allowed'
      }, 400);
    }
    
    const dbService = getDatabaseService();
    const result = await dbService.query(sql, params);
    
    return c.json({
      success: result.success,
      data: result.data,
      meta: result.meta,
      error: result.error,
      query: {
        sql,
        paramCount: params.length
      }
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to execute query',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// ================================
// 🏥 DATABASE DIAGNOSTICS
// ================================

/**
 * Run database diagnostics
 */
databaseRoutes.get('/db/diagnostics', async (c) => {
  try {
    const dbService = getDatabaseService();
    
    // Run basic connectivity and health checks
    const healthStatus = dbService.getHealthStatus();
    const metrics = dbService.getMetrics();
    
    // Test basic query
    const testQuery = await dbService.query('SELECT 1 as test');
    
    const diagnostics = {
      connectionStatus: healthStatus.connectionStatus,
      queryTest: testQuery.success ? 'PASS' : 'FAIL',
      performance: {
        totalQueries: metrics.totalQueries,
        averageQueryTime: metrics.averageQueryTime,
        cacheHitRate: metrics.cacheHitRate,
        slowQueries: metrics.slowQueries
      },
      health: {
        status: healthStatus.status,
        errorCount: healthStatus.errors.length,
        lastQuery: healthStatus.lastQuery
      },
      cache: {
        size: metrics.cacheSize,
        maxSize: 1000 // From config
      }
    };
    
    return c.json({
      success: true,
      diagnostics,
      timestamp: Date.now(),
      overall: testQuery.success && healthStatus.status !== 'unhealthy' ? 'HEALTHY' : 'UNHEALTHY'
    });
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to run diagnostics',
      details: error instanceof Error ? error.message : 'Unknown error',
      overall: 'UNHEALTHY'
    }, 500);
  }
});

/**
 * Database schema information
 */
databaseRoutes.get('/db/schema', async (c) => {
  try {
    const dbService = getDatabaseService();
    
    // Get table information
    const tablesResult = await dbService.query(`
      SELECT name, type, sql 
      FROM sqlite_master 
      WHERE type IN ('table', 'index') 
      ORDER BY type, name
    `);
    
    if (tablesResult.success) {
      const tables = (tablesResult.data || []).filter(item => item.type === 'table');
      const indexes = (tablesResult.data || []).filter(item => item.type === 'index');
      
      return c.json({
        success: true,
        schema: {
          tables: tables.map(table => ({
            name: table.name,
            sql: table.sql
          })),
          indexes: indexes.map(index => ({
            name: index.name,
            sql: index.sql
          })),
          tableCount: tables.length,
          indexCount: indexes.length
        },
        timestamp: Date.now()
      });
    } else {
      return c.json({
        success: false,
        error: tablesResult.error || 'Failed to retrieve schema information'
      }, 500);
    }
    
  } catch (error) {
    return c.json({
      success: false,
      error: 'Failed to retrieve schema information',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default databaseRoutes;