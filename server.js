/**
 * TITAN Trading System - Backend Server
 * استفاده از PostgreSQL + Redis روی سرور شخصی
 */

require('dotenv').config();
const { Hono } = require('hono');
const { serve } = require('@hono/node-server');
const { cors } = require('hono/cors');
const { Pool } = require('pg');
const { createClient } = require('redis');

// Initialize Hono App
const app = new Hono();

// Database Connection Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Redis Client
let redisClient;
(async () => {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis Client Error', err));
  await redisClient.connect();
  console.log('✅ Redis connected');
})();

// CORS Configuration
app.use('/*', cors({
  origin: process.env.CORS_ORIGIN || '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Health Check
app.get('/health', async (c) => {
  try {
    const result = await pool.query('SELECT NOW()');
    return c.json({
      status: 'healthy',
      database: 'connected',
      redis: redisClient.isOpen ? 'connected' : 'disconnected',
      timestamp: result.rows[0].now,
      version: '1.0.0'
    });
  } catch (error) {
    return c.json({
      status: 'unhealthy',
      error: error.message
    }, 500);
  }
});

// =============================================================================
// AUTHENTICATION APIs
// =============================================================================

// Login
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Query user
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );
    
    if (result.rows.length === 0) {
      return c.json({ success: false, error: 'Invalid credentials' }, 401);
    }
    
    const user = result.rows[0];
    
    // TODO: Verify password with bcrypt
    // For now, simple demo
    
    // Generate token (simplified)
    const token = `demo_token_${user.id}_${Date.now()}`;
    
    return c.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Register
app.post('/api/auth/register', async (c) => {
  try {
    const { username, email, password, firstName, lastName } = await c.req.json();
    
    // TODO: Hash password with bcrypt
    
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, first_name, last_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, email, first_name, last_name`,
      [username, email, password, firstName, lastName]
    );
    
    return c.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Register error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Verify Token (for auto-login)
app.post('/api/auth/verify', async (c) => {
  try {
    const { token } = await c.req.json();
    
    // Simple demo token verification
    if (token && token.startsWith('demo_token_')) {
      return c.json({
        success: true,
        data: {
          user: {
            id: '1',
            username: 'demo_user',
            email: 'demo@titan.com',
            firstName: 'Demo',
            lastName: 'User'
          }
        }
      });
    }
    
    return c.json({ success: false, error: 'Invalid token' }, 401);
  } catch (error) {
    console.error('Verify error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Logout
app.post('/api/auth/logout', async (c) => {
  return c.json({ success: true, message: 'Logged out successfully' });
});

// =============================================================================
// PORTFOLIO APIs
// =============================================================================

app.get('/api/portfolio', async (c) => {
  try {
    // Get user from auth (simplified)
    const userId = '1'; // TODO: Extract from JWT
    
    const result = await pool.query(
      `SELECT * FROM portfolios WHERE user_id = $1`,
      [userId]
    );
    
    return c.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Portfolio error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =============================================================================
// TRADING APIs  
// =============================================================================

app.get('/api/trades', async (c) => {
  try {
    const userId = '1'; // TODO: Extract from JWT
    
    const result = await pool.query(
      `SELECT t.*, m.symbol, m.base_currency, m.quote_currency
       FROM trades t
       JOIN markets m ON t.market_id = m.id
       WHERE t.user_id = $1
       ORDER BY t.created_at DESC
       LIMIT 100`,
      [userId]
    );
    
    return c.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Trades error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =============================================================================
// DASHBOARD APIs
// =============================================================================

app.get('/api/dashboard/stats', async (c) => {
  try {
    const userId = '1'; // TODO: Extract from JWT
    
    // Get portfolio stats
    const portfolioResult = await pool.query(
      `SELECT 
        SUM(total_balance) as total_balance,
        SUM(available_balance) as available_balance,
        AVG(total_pnl_percentage) as avg_pnl
       FROM portfolios
       WHERE user_id = $1`,
      [userId]
    );
    
    // Get trades count
    const tradesResult = await pool.query(
      `SELECT 
        COUNT(*) as total_trades,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_trades
       FROM trades
       WHERE user_id = $1`,
      [userId]
    );
    
    return c.json({
      success: true,
      data: {
        portfolio: portfolioResult.rows[0],
        trades: tradesResult.rows[0]
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =============================================================================
// TRADING EXCHANGE APIs (Mock)
// =============================================================================

app.get('/api/trading/exchange/exchanges', async (c) => {
  return c.json({
    success: true,
    data: [
      { id: 'binance', name: 'Binance', status: 'inactive' },
      { id: 'mexc', name: 'MEXC', status: 'inactive' }
    ]
  });
});

app.post('/api/trading/exchange/test-connection', async (c) => {
  return c.json({ success: true, message: 'Connection test successful' });
});

app.get('/api/trading/exchange/balances', async (c) => {
  return c.json({
    success: true,
    data: { total: 0, available: 0, assets: [] }
  });
});

// =============================================================================
// NOTIFICATIONS APIs (Mock)
// =============================================================================

app.post('/api/notifications/test', async (c) => {
  return c.json({ success: true, message: 'Test notification sent' });
});

app.get('/api/notifications/inapp', async (c) => {
  return c.json({ success: true, data: [] });
});

// =============================================================================
// AI APIs (Mock)
// =============================================================================

app.get('/api/ai/test', async (c) => {
  return c.json({ success: true, message: 'AI service is running' });
});

app.get('/api/ai/analysis/:symbol', async (c) => {
  const symbol = c.req.param('symbol');
  return c.json({
    success: true,
    data: {
      symbol,
      analysis: 'Mock analysis data',
      timestamp: new Date().toISOString()
    }
  });
});

app.post('/api/ai/chat', async (c) => {
  const { message } = await c.req.json();
  return c.json({
    success: true,
    data: {
      reply: `You said: ${message}. This is a mock response.`
    }
  });
});

// =============================================================================
// DATABASE APIs (Mock)
// =============================================================================

app.get('/api/database/ai-analyses', async (c) => {
  return c.json({ success: true, data: [] });
});

app.post('/api/database/ai-analyses', async (c) => {
  const data = await c.req.json();
  return c.json({ success: true, data: { id: Date.now(), ...data } });
});

// =============================================================================
// SYSTEM APIs (Mock)
// =============================================================================

app.get('/api/system/env-vars', async (c) => {
  return c.json({
    success: true,
    data: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL?.split('@')[1] || 'hidden',
      REDIS_URL: process.env.REDIS_URL?.split('@')[1] || 'hidden'
    }
  });
});

app.post('/api/system/env-vars', async (c) => {
  return c.json({ success: true, message: 'Environment variables cannot be modified at runtime' });
});

app.post('/api/system/restart-services', async (c) => {
  return c.json({ success: true, message: 'Service restart not available in production' });
});

// =============================================================================
// WATCHLIST APIs (Mock)
// =============================================================================

app.get('/api/watchlist/list/:userId', async (c) => {
  return c.json({ success: true, data: [] });
});

app.get('/api/watchlist/prices/:userId', async (c) => {
  return c.json({ success: true, data: {} });
});

app.post('/api/watchlist/add', async (c) => {
  const { symbol } = await c.req.json();
  return c.json({ success: true, data: { symbol, added: true } });
});

app.delete('/api/watchlist/remove/:symbol', async (c) => {
  const symbol = c.req.param('symbol');
  return c.json({ success: true, message: `${symbol} removed from watchlist` });
});

// =============================================================================
// USER MANAGEMENT APIs
// =============================================================================

// Get user stats (must come before /api/users/:id routes)
app.get('/api/users/stats', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM v_user_statistics');
    return c.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get active sessions
app.get('/api/users/sessions/active', async (c) => {
  try {
    const result = await pool.query('SELECT * FROM v_active_sessions ORDER BY last_activity DESC');
    return c.json({ success: true, data: result.rows });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Terminate session
app.delete('/api/users/sessions/:id', async (c) => {
  try {
    const id = c.req.param('id');
    await pool.query('UPDATE user_sessions SET is_active = false WHERE id = $1', [id]);
    return c.json({ success: true, message: 'جلسه با موفقیت بسته شد' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get suspicious activities
app.get('/api/users/activities/suspicious', async (c) => {
  try {
    const result = await pool.query(`
      SELECT sa.*, u.username, u.email
      FROM suspicious_activities sa
      LEFT JOIN users u ON sa.user_id = u.id
      WHERE sa.is_resolved = false
      ORDER BY sa.created_at DESC
      LIMIT 50
    `);
    return c.json({ success: true, data: result.rows });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get single user
app.get('/api/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await pool.query(`
      SELECT id, username, email, first_name, last_name, role, is_active, is_verified, 
             is_suspended, last_login_at, created_at
      FROM users WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return c.json({ success: false, error: 'کاربر یافت نشد' }, 404);
    }
    
    return c.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Suspend user
app.post('/api/users/:id/suspend', async (c) => {
  try {
    const id = c.req.param('id');
    const { reason, duration_hours = 24 } = await c.req.json();
    const suspended_until = new Date(Date.now() + duration_hours * 60 * 60 * 1000);
    
    const result = await pool.query(`
      UPDATE users SET is_suspended = true, suspended_reason = $1, suspended_until = $2
      WHERE id = $3 RETURNING id, username, is_suspended
    `, [reason, suspended_until, id]);
    
    if (result.rows.length === 0) {
      return c.json({ success: false, error: 'کاربر یافت نشد' }, 404);
    }
    
    return c.json({ success: true, data: result.rows[0], message: 'کاربر تعلیق شد' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Unsuspend user
app.post('/api/users/:id/unsuspend', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await pool.query(`
      UPDATE users SET is_suspended = false, suspended_reason = NULL, suspended_until = NULL
      WHERE id = $1 RETURNING id, username, is_suspended
    `, [id]);
    
    if (result.rows.length === 0) {
      return c.json({ success: false, error: 'کاربر یافت نشد' }, 404);
    }
    
    return c.json({ success: true, data: result.rows[0], message: 'تعلیق برداشته شد' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Create new user
app.post('/api/users', async (c) => {
  try {
    const { username, email, password, first_name, last_name, role = 'viewer' } = await c.req.json();
    
    if (!username || !email || !password) {
      return c.json({ success: false, error: 'نام کاربری، ایمیل و رمز عبور الزامی است' }, 400);
    }
    
    // Hash password (in production, use bcrypt)
    const password_hash = password; // TODO: Add proper hashing
    
    const result = await pool.query(`
      INSERT INTO users (username, email, password_hash, first_name, last_name, role)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, username, email, first_name, last_name, role, created_at
    `, [username, email, password_hash, first_name, last_name, role]);
    
    return c.json({ success: true, data: result.rows[0], message: 'کاربر جدید ایجاد شد' }, 201);
  } catch (error) {
    if (error.code === '23505') {
      return c.json({ success: false, error: 'نام کاربری یا ایمیل تکراری است' }, 409);
    }
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Update user
app.put('/api/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const { username, email, first_name, last_name, role } = await c.req.json();
    
    const result = await pool.query(`
      UPDATE users 
      SET username = COALESCE($1, username),
          email = COALESCE($2, email),
          first_name = COALESCE($3, first_name),
          last_name = COALESCE($4, last_name),
          role = COALESCE($5, role),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING id, username, email, first_name, last_name, role, updated_at
    `, [username, email, first_name, last_name, role, id]);
    
    if (result.rows.length === 0) {
      return c.json({ success: false, error: 'کاربر یافت نشد' }, 404);
    }
    
    return c.json({ success: true, data: result.rows[0], message: 'کاربر بروزرسانی شد' });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Delete user
app.delete('/api/users/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id, username', [id]);
    
    if (result.rows.length === 0) {
      return c.json({ success: false, error: 'کاربر یافت نشد' }, 404);
    }
    
    return c.json({ success: true, message: `کاربر ${result.rows[0].username} حذف شد` });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// Get all users with filters (must come LAST to avoid conflicts)
app.get('/api/users', async (c) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', role = '' } = c.req.query();
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramIndex = 1;

    if (search) {
      whereClause += ` AND (username ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (status === 'active') whereClause += ` AND is_active = true AND is_suspended = false`;
    if (status === 'suspended') whereClause += ` AND is_suspended = true`;
    if (role) {
      whereClause += ` AND role = $${paramIndex}`;
      params.push(role);
      paramIndex++;
    }

    const countResult = await pool.query(`SELECT COUNT(*) FROM users ${whereClause}`, params);
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(`
      SELECT id, username, email, first_name, last_name, role, is_active, is_verified, 
             is_suspended, last_login_at, created_at
      FROM users ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `, params);

    return c.json({
      success: true,
      data: {
        users: result.rows,
        pagination: { page: parseInt(page), limit: parseInt(limit), total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error) {
    return c.json({ success: false, error: error.message }, 500);
  }
});

// =============================================================================
// 404 Handler
// =============================================================================

app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Route not found',
    path: c.req.path
  }, 404);
});

// =============================================================================
// Start Server
// =============================================================================

const port = parseInt(process.env.PORT || '4000', 10);
const host = process.env.HOST || '0.0.0.0';

console.log('\n🚀 Starting TITAN Trading Backend Server...');
console.log(`📍 Environment: ${process.env.NODE_ENV}`);
console.log(`🗄️  Database: PostgreSQL (${process.env.DATABASE_URL?.split('@')[1]?.split('/')[0]})`);
console.log(`💾 Redis: ${process.env.REDIS_URL}`);
console.log(`🌐 Server: http://${host}:${port}`);
console.log(`🔐 CORS: ${process.env.CORS_ORIGIN}`);

serve({
  fetch: app.fetch,
  port,
  hostname: host,
}, (info) => {
  console.log(`\n✅ Server is running on http://${info.address}:${info.port}`);
  console.log(`📊 Health check: http://${info.address}:${info.port}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing connections...');
  await pool.end();
  await redisClient.quit();
  process.exit(0);
});

