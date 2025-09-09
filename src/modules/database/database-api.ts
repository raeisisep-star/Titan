// TITAN Trading System - Database API
// API endpoints for database operations and management

import { Hono } from 'hono';
import { getDatabaseService, DatabaseService } from '../../services/database-service';
import { createUserModel } from '../../models/user-model';
import { createTradeModel } from '../../models/trade-model';

const app = new Hono();

// Initialize database service
const initializeDatabase = (env: any): DatabaseService => {
  if (!env.DB) {
    throw new Error('Database binding (DB) not found in environment');
  }

  return getDatabaseService({
    binding: env.DB,
    environment: env.NODE_ENV || 'development',
    enableLogging: env.DEBUG_MODE === 'true',
    queryTimeout: 30000,
    maxRetries: 2,
  });
};

// Database health check
app.get('/health', async (c) => {
  try {
    const db = initializeDatabase(c.env);
    const health = await db.healthCheck();
    
    return c.json({
      success: true,
      data: {
        ...health,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Database health check failed: ${error}`,
    }, 500);
  }
});

// Database statistics
app.get('/stats', async (c) => {
  try {
    const db = initializeDatabase(c.env);
    const stats = await db.getStats();
    
    return c.json({
      success: true,
      data: {
        ...stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get database stats: ${error}`,
    }, 500);
  }
});

// Run migrations
app.post('/migrate', async (c) => {
  try {
    const db = initializeDatabase(c.env);
    
    // This would typically read migration files
    // For now, we'll just verify tables exist
    const tables = await db.getTableList();
    
    // Check if core tables exist
    const requiredTables = [
      'users', 'trading_accounts', 'portfolios', 'trades', 
      'ai_analyses', 'notifications', 'market_data'
    ];
    
    const missingTables = requiredTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      return c.json({
        success: false,
        error: `Missing required tables: ${missingTables.join(', ')}`,
        data: {
          existingTables: tables,
          missingTables,
        },
      }, 400);
    }
    
    return c.json({
      success: true,
      message: 'All required tables exist',
      data: {
        tables,
        tablesCount: tables.length,
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Migration check failed: ${error}`,
    }, 500);
  }
});

// Test database operations
app.post('/test', async (c) => {
  try {
    const db = initializeDatabase(c.env);
    const testResults: any[] = [];

    // Test 1: Simple query
    try {
      const result = await db.query('SELECT 1 as test');
      testResults.push({
        test: 'simple_query',
        success: result.success,
        duration: result.meta?.duration,
      });
    } catch (error) {
      testResults.push({
        test: 'simple_query',
        success: false,
        error: String(error),
      });
    }

    // Test 2: Table existence check
    try {
      const tables = await db.getTableList();
      testResults.push({
        test: 'table_list',
        success: tables.length > 0,
        tablesFound: tables.length,
      });
    } catch (error) {
      testResults.push({
        test: 'table_list',
        success: false,
        error: String(error),
      });
    }

    // Test 3: User model operations (if users table exists)
    try {
      const userModel = createUserModel(db);
      const userCount = await userModel.count();
      testResults.push({
        test: 'user_model',
        success: true,
        userCount,
      });
    } catch (error) {
      testResults.push({
        test: 'user_model',
        success: false,
        error: String(error),
      });
    }

    // Test 4: Trade model operations (if trades table exists)
    try {
      const tradeModel = createTradeModel(db);
      const tradeCount = await tradeModel.count();
      testResults.push({
        test: 'trade_model',
        success: true,
        tradeCount,
      });
    } catch (error) {
      testResults.push({
        test: 'trade_model',
        success: false,
        error: String(error),
      });
    }

    const successCount = testResults.filter(t => t.success).length;
    const overallSuccess = successCount === testResults.length;

    return c.json({
      success: overallSuccess,
      data: {
        overallSuccess,
        testsRun: testResults.length,
        testsPassed: successCount,
        testsFailed: testResults.length - successCount,
        results: testResults,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Database test failed: ${error}`,
    }, 500);
  }
});

// Get table information
app.get('/tables', async (c) => {
  try {
    const db = initializeDatabase(c.env);
    const tables = await db.getTableList();
    
    // Get detailed information for each table
    const tableDetails = await Promise.all(
      tables.map(async (tableName) => {
        try {
          const info = await db.getTableInfo(tableName);
          const count = await db.count(tableName);
          
          return {
            name: tableName,
            columns: info.success ? info.data : [],
            rowCount: count,
          };
        } catch (error) {
          return {
            name: tableName,
            error: String(error),
          };
        }
      })
    );

    return c.json({
      success: true,
      data: {
        tables: tableDetails,
        totalTables: tables.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get table information: ${error}`,
    }, 500);
  }
});

// Execute raw SQL query (admin only - for debugging)
app.post('/query', async (c) => {
  try {
    const { sql, params } = await c.req.json();
    
    if (!sql) {
      return c.json({
        success: false,
        error: 'SQL query is required',
      }, 400);
    }

    // Basic safety check - only allow SELECT queries
    const cleanSql = sql.trim().toLowerCase();
    if (!cleanSql.startsWith('select')) {
      return c.json({
        success: false,
        error: 'Only SELECT queries are allowed for security',
      }, 400);
    }

    const db = initializeDatabase(c.env);
    const result = await db.query(sql, params || []);
    
    return c.json({
      success: result.success,
      data: result.success ? {
        rows: result.data,
        meta: result.meta,
      } : null,
      error: result.error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Query execution failed: ${error}`,
    }, 500);
  }
});

// User management endpoints
app.get('/users', async (c) => {
  try {
    const db = initializeDatabase(c.env);
    const userModel = createUserModel(db);
    
    const { limit = '10', page = '1', role } = c.req.query();
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    let conditions: any = {};
    if (role) {
      conditions.role = role;
    }
    
    const result = await userModel.paginate(conditions, pageNum, limitNum);
    const stats = await userModel.getUserStats();
    
    return c.json({
      success: true,
      data: {
        users: result.data,
        pagination: result.pagination,
        stats,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get users: ${error}`,
    }, 500);
  }
});

app.get('/users/:id', async (c) => {
  try {
    const userId = parseInt(c.req.param('id'));
    const db = initializeDatabase(c.env);
    const userModel = createUserModel(db);
    
    const user = await userModel.findById(userId);
    
    if (!user) {
      return c.json({
        success: false,
        error: 'User not found',
      }, 404);
    }
    
    return c.json({
      success: true,
      data: {
        user,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get user: ${error}`,
    }, 500);
  }
});

// Trade management endpoints
app.get('/trades', async (c) => {
  try {
    const db = initializeDatabase(c.env);
    const tradeModel = createTradeModel(db);
    
    const { limit = '20', userId, symbol, status } = c.req.query();
    
    let trades;
    const limitNum = parseInt(limit);
    
    if (userId) {
      trades = await tradeModel.getTradesByUser(parseInt(userId), limitNum);
    } else if (symbol) {
      trades = await tradeModel.getTradesBySymbol(symbol, limitNum);
    } else if (status) {
      trades = await tradeModel.getTradesByStatus(status as any, userId ? parseInt(userId) : undefined);
    } else {
      // Get recent trades
      trades = await tradeModel.findMany({}, { orderBy: 'created_at DESC', limit: limitNum });
    }
    
    const stats = await tradeModel.getTradeStats(userId ? parseInt(userId) : undefined);
    
    return c.json({
      success: true,
      data: {
        trades,
        stats,
        count: trades.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get trades: ${error}`,
    }, 500);
  }
});

app.get('/trades/:id', async (c) => {
  try {
    const tradeId = parseInt(c.req.param('id'));
    const db = initializeDatabase(c.env);
    const tradeModel = createTradeModel(db);
    
    const trade = await tradeModel.findById(tradeId);
    
    if (!trade) {
      return c.json({
        success: false,
        error: 'Trade not found',
      }, 404);
    }
    
    return c.json({
      success: true,
      data: {
        trade,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Failed to get trade: ${error}`,
    }, 500);
  }
});

// Database maintenance endpoints
app.post('/cleanup', async (c) => {
  try {
    const db = initializeDatabase(c.env);
    const userModel = createUserModel(db);
    
    // Clean expired sessions
    const expiredSessions = await userModel.cleanExpiredSessions();
    
    // Clean old trade signals (could add this if needed)
    const tradeModel = createTradeModel(db);
    const expiredSignals = await tradeModel.expireOldSignals();
    
    return c.json({
      success: true,
      data: {
        expiredSessionsRemoved: expiredSessions,
        expiredSignalsDeactivated: expiredSignals,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return c.json({
      success: false,
      error: `Database cleanup failed: ${error}`,
    }, 500);
  }
});

export default app;