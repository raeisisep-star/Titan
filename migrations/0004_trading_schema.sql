-- Trading System Database Schema
-- Migration: 0004_trading_schema.sql
-- Comprehensive tables for all three trading modules:
-- 1. Manual Trading (معاملات دستی)
-- 2. Autopilot System (اتوپایلوت حرفه‌ای)  
-- 3. Trading Strategies (استراتژی‌ها)

-- =============================================================================
-- CORE TRADING TABLES
-- =============================================================================

-- Trading orders (manual and autopilot)
CREATE TABLE IF NOT EXISTS trading_orders (
  id TEXT PRIMARY KEY DEFAULT ('ord' || substr(hex(randomblob(10)), 1, 20)),
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL, -- 'buy', 'sell'
  type TEXT NOT NULL, -- 'market', 'limit', 'stop', 'stop_limit'
  quantity REAL NOT NULL,
  price REAL, -- NULL for market orders
  stop_price REAL, -- For stop orders
  status TEXT DEFAULT 'pending', -- 'pending', 'filled', 'partially_filled', 'cancelled', 'failed'
  filled_quantity REAL DEFAULT 0,
  avg_fill_price REAL,
  fees REAL DEFAULT 0,
  source TEXT DEFAULT 'manual', -- 'manual', 'autopilot', 'strategy'
  strategy_id TEXT, -- Reference to strategy if order came from strategy
  autopilot_session_id TEXT, -- Reference to autopilot session
  notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  filled_at DATETIME,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (strategy_id) REFERENCES trading_strategies(id) ON DELETE SET NULL,
  FOREIGN KEY (autopilot_session_id) REFERENCES autopilot_sessions(id) ON DELETE SET NULL
);

-- Trading positions (active and closed)
CREATE TABLE IF NOT EXISTS trading_positions (
  id TEXT PRIMARY KEY DEFAULT ('pos' || substr(hex(randomblob(10)), 1, 20)),
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL, -- 'long', 'short'
  entry_price REAL NOT NULL,
  current_price REAL NOT NULL,
  quantity REAL NOT NULL,
  unrealized_pnl REAL DEFAULT 0,
  realized_pnl REAL DEFAULT 0,
  fees_paid REAL DEFAULT 0,
  status TEXT DEFAULT 'open', -- 'open', 'closed'
  source TEXT DEFAULT 'manual', -- 'manual', 'autopilot', 'strategy'
  strategy_id TEXT,
  autopilot_session_id TEXT,
  stop_loss REAL,
  take_profit REAL,
  opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (strategy_id) REFERENCES trading_strategies(id) ON DELETE SET NULL,
  FOREIGN KEY (autopilot_session_id) REFERENCES autopilot_sessions(id) ON DELETE SET NULL
);

-- Trading balance and portfolio management
CREATE TABLE IF NOT EXISTS trading_balances (
  id TEXT PRIMARY KEY DEFAULT ('bal' || substr(hex(randomblob(8)), 1, 16)),
  user_id TEXT NOT NULL,
  symbol TEXT NOT NULL, -- 'USDT', 'BTC', 'ETH', etc.
  available_balance REAL DEFAULT 0,
  locked_balance REAL DEFAULT 0, -- In pending orders
  total_balance REAL GENERATED ALWAYS AS (available_balance + locked_balance),
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Unique constraint
  UNIQUE(user_id, symbol)
);

-- =============================================================================
-- AUTOPILOT SYSTEM TABLES
-- =============================================================================

-- Autopilot sessions and configurations
CREATE TABLE IF NOT EXISTS autopilot_sessions (
  id TEXT PRIMARY KEY DEFAULT ('ap' || substr(hex(randomblob(10)), 1, 20)),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'paused', 'stopped'
  
  -- Configuration
  max_risk_per_trade REAL DEFAULT 2.0, -- Percentage
  max_daily_loss REAL DEFAULT 5.0, -- Percentage
  max_positions INTEGER DEFAULT 5,
  allowed_symbols TEXT, -- JSON array
  
  -- Target settings
  target_profit REAL, -- Target profit amount
  target_profit_percent REAL, -- Target profit percentage
  stop_loss_percent REAL DEFAULT 2.0,
  take_profit_percent REAL DEFAULT 5.0,
  
  -- AI settings
  ai_confidence_threshold REAL DEFAULT 0.7,
  use_technical_analysis BOOLEAN DEFAULT true,
  use_sentiment_analysis BOOLEAN DEFAULT true,
  
  -- Performance tracking
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  total_profit REAL DEFAULT 0,
  max_drawdown REAL DEFAULT 0,
  sharpe_ratio REAL DEFAULT 0,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  stopped_at DATETIME,
  last_trade_at DATETIME,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Autopilot decisions and signals
CREATE TABLE IF NOT EXISTS autopilot_signals (
  id TEXT PRIMARY KEY DEFAULT ('aps' || substr(hex(randomblob(8)), 1, 16)),
  autopilot_session_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL, -- 'buy', 'sell', 'hold', 'close'
  confidence REAL NOT NULL, -- 0.0 to 1.0
  price REAL NOT NULL,
  quantity REAL,
  
  -- Signal sources
  technical_score REAL,
  sentiment_score REAL,
  ai_recommendation TEXT,
  
  -- Execution
  executed BOOLEAN DEFAULT false,
  order_id TEXT, -- Reference to trading_orders if executed
  execution_price REAL,
  execution_time DATETIME,
  
  -- Metadata
  signal_data TEXT, -- JSON with detailed analysis
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (autopilot_session_id) REFERENCES autopilot_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES trading_orders(id) ON DELETE SET NULL
);

-- =============================================================================
-- TRADING STRATEGIES TABLES
-- =============================================================================

-- Strategy definitions
CREATE TABLE IF NOT EXISTS trading_strategies (
  id TEXT PRIMARY KEY DEFAULT ('str' || substr(hex(randomblob(10)), 1, 20)),
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'custom', -- 'ai', 'technical', 'sentiment', 'custom'
  status TEXT DEFAULT 'inactive', -- 'active', 'inactive', 'backtesting', 'optimizing'
  
  -- Strategy logic (stored as JSON)
  entry_conditions TEXT, -- JSON: conditions for entering trades
  exit_conditions TEXT, -- JSON: conditions for exiting trades
  risk_management TEXT, -- JSON: risk management rules
  
  -- Configuration
  max_positions INTEGER DEFAULT 3,
  position_size_percent REAL DEFAULT 5.0, -- Percentage of portfolio per trade
  stop_loss_percent REAL DEFAULT 2.0,
  take_profit_percent REAL DEFAULT 6.0,
  allowed_symbols TEXT, -- JSON array
  
  -- Performance metrics
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  total_return REAL DEFAULT 0,
  win_rate REAL DEFAULT 0,
  max_drawdown REAL DEFAULT 0,
  sharpe_ratio REAL DEFAULT 0,
  profit_factor REAL DEFAULT 0,
  
  -- Backtest results
  backtested BOOLEAN DEFAULT false,
  backtest_start_date DATE,
  backtest_end_date DATE,
  backtest_return REAL,
  backtest_max_drawdown REAL,
  
  -- AI-generated metadata
  ai_generated BOOLEAN DEFAULT false,
  ai_model TEXT, -- Model used for generation
  ai_parameters TEXT, -- JSON with AI parameters
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_executed_at DATETIME,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Strategy execution history
CREATE TABLE IF NOT EXISTS strategy_executions (
  id TEXT PRIMARY KEY DEFAULT ('sex' || substr(hex(randomblob(8)), 1, 16)),
  strategy_id TEXT NOT NULL,
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL, -- 'entry', 'exit', 'stop_loss', 'take_profit'
  entry_price REAL,
  exit_price REAL,
  quantity REAL NOT NULL,
  pnl REAL,
  fees REAL DEFAULT 0,
  
  -- Analysis data
  conditions_met TEXT, -- JSON: which conditions triggered the execution
  confidence_score REAL,
  market_conditions TEXT, -- JSON: market state at execution time
  
  -- References
  order_id TEXT, -- Reference to trading_orders
  position_id TEXT, -- Reference to trading_positions
  
  -- Timestamps
  executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (strategy_id) REFERENCES trading_strategies(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES trading_orders(id) ON DELETE SET NULL,
  FOREIGN KEY (position_id) REFERENCES trading_positions(id) ON DELETE SET NULL
);

-- Strategy performance tracking (daily snapshots)
CREATE TABLE IF NOT EXISTS strategy_performance (
  id TEXT PRIMARY KEY DEFAULT ('sp' || substr(hex(randomblob(8)), 1, 16)),
  strategy_id TEXT NOT NULL,
  date DATE NOT NULL,
  
  -- Daily metrics
  trades_count INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  daily_return REAL DEFAULT 0,
  daily_pnl REAL DEFAULT 0,
  cumulative_return REAL DEFAULT 0,
  
  -- Risk metrics
  volatility REAL,
  max_drawdown REAL,
  var_95 REAL, -- Value at Risk 95%
  
  -- Market conditions
  market_trend TEXT, -- 'bullish', 'bearish', 'sideways'
  volatility_regime TEXT, -- 'low', 'medium', 'high'
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign key constraints
  FOREIGN KEY (strategy_id) REFERENCES trading_strategies(id) ON DELETE CASCADE,
  
  -- Unique constraint
  UNIQUE(strategy_id, date)
);

-- =============================================================================
-- MANUAL TRADING TABLES
-- =============================================================================

-- Manual trading sessions (for tracking manual trading performance)
CREATE TABLE IF NOT EXISTS manual_trading_sessions (
  id TEXT PRIMARY KEY DEFAULT ('mts' || substr(hex(randomblob(8)), 1, 16)),
  user_id TEXT NOT NULL,
  session_name TEXT,
  start_balance REAL NOT NULL,
  current_balance REAL NOT NULL,
  
  -- Session statistics
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  session_pnl REAL DEFAULT 0,
  max_drawdown REAL DEFAULT 0,
  
  -- Session metadata
  notes TEXT,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Technical analysis cache (for performance)
CREATE TABLE IF NOT EXISTS technical_analysis_cache (
  id TEXT PRIMARY KEY DEFAULT ('ta' || substr(hex(randomblob(8)), 1, 16)),
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL, -- '1m', '5m', '15m', '1h', '4h', '1d'
  
  -- Technical indicators (JSON)
  rsi REAL,
  macd REAL,
  macd_signal REAL,
  macd_histogram REAL,
  bollinger_upper REAL,
  bollinger_middle REAL,
  bollinger_lower REAL,
  sma_20 REAL,
  sma_50 REAL,
  sma_200 REAL,
  ema_12 REAL,
  ema_26 REAL,
  
  -- Price data
  open_price REAL,
  high_price REAL,
  low_price REAL,
  close_price REAL,
  volume REAL,
  
  -- Signals
  overall_signal TEXT, -- 'strong_buy', 'buy', 'neutral', 'sell', 'strong_sell'
  signal_confidence REAL,
  
  -- Timestamps
  timestamp DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint
  UNIQUE(symbol, timeframe, timestamp)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Trading orders indexes
CREATE INDEX IF NOT EXISTS idx_trading_orders_user_id ON trading_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_orders_symbol ON trading_orders(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_orders_status ON trading_orders(status);
CREATE INDEX IF NOT EXISTS idx_trading_orders_source ON trading_orders(source);
CREATE INDEX IF NOT EXISTS idx_trading_orders_created_at ON trading_orders(created_at);

-- Trading positions indexes
CREATE INDEX IF NOT EXISTS idx_trading_positions_user_id ON trading_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_positions_symbol ON trading_positions(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_positions_status ON trading_positions(status);
CREATE INDEX IF NOT EXISTS idx_trading_positions_source ON trading_positions(source);

-- Autopilot indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_sessions_user_id ON autopilot_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_sessions_status ON autopilot_sessions(status);
CREATE INDEX IF NOT EXISTS idx_autopilot_signals_session_id ON autopilot_signals(autopilot_session_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_signals_symbol ON autopilot_signals(symbol);

-- Strategy indexes
CREATE INDEX IF NOT EXISTS idx_trading_strategies_user_id ON trading_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_status ON trading_strategies(status);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_category ON trading_strategies(category);
CREATE INDEX IF NOT EXISTS idx_strategy_executions_strategy_id ON strategy_executions(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_performance_strategy_id ON strategy_performance(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_performance_date ON strategy_performance(date);

-- Technical analysis indexes
CREATE INDEX IF NOT EXISTS idx_technical_analysis_symbol ON technical_analysis_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_technical_analysis_timeframe ON technical_analysis_cache(timeframe);
CREATE INDEX IF NOT EXISTS idx_technical_analysis_timestamp ON technical_analysis_cache(timestamp);

-- =============================================================================
-- SAMPLE DATA FOR DEMO USER
-- =============================================================================

-- Insert demo trading balances
INSERT OR IGNORE INTO trading_balances (user_id, symbol, available_balance, locked_balance) VALUES
  ('user-123', 'USDT', 10000.00, 1500.00),
  ('user-123', 'BTC', 0.25, 0.05),
  ('user-123', 'ETH', 5.5, 1.2),
  ('user-123', 'ADA', 1000, 200),
  ('user-123', 'SOL', 25, 5);

-- Insert demo trading strategies
INSERT OR IGNORE INTO trading_strategies (id, user_id, name, description, category, status, total_trades, winning_trades, total_return, win_rate) VALUES
  ('str1', 'user-123', 'AI Prediction Pro', 'استراتژی پیشرفته پیش‌بینی با هوش مصنوعی', 'ai', 'active', 156, 122, 34.7, 78.2),
  ('str2', 'user-123', 'RSI Swing Trading', 'استراتژی نوسانی بر اساس RSI', 'technical', 'active', 89, 71, 22.1, 79.8),
  ('str3', 'user-123', 'Sentiment Scalper', 'معاملات کوتاه‌مدت احساسات بازار', 'sentiment', 'inactive', 234, 167, 18.9, 71.4),
  ('str4', 'user-123', 'MACD Momentum', 'استراتژی مومنتوم MACD', 'technical', 'active', 67, 48, 15.3, 71.6),
  ('str5', 'user-123', 'Custom Grid Bot', 'ربات شبکه‌ای سفارشی', 'custom', 'backtesting', 0, 0, 0, 0);

-- Insert demo autopilot session
INSERT OR IGNORE INTO autopilot_sessions (id, user_id, name, status, total_trades, winning_trades, total_profit, max_drawdown) VALUES
  ('ap1', 'user-123', 'Conservative Growth', 'active', 156, 122, 2847.65, 5.2);

-- Insert demo trading orders (recent)
INSERT OR IGNORE INTO trading_orders (id, user_id, symbol, side, type, quantity, price, status, filled_quantity, source, created_at) VALUES
  ('ord1', 'user-123', 'BTCUSDT', 'buy', 'limit', 0.01, 45000, 'filled', 0.01, 'manual', datetime('now', '-2 hours')),
  ('ord2', 'user-123', 'ETHUSDT', 'sell', 'market', 0.5, NULL, 'filled', 0.5, 'autopilot', datetime('now', '-1 hour')),
  ('ord3', 'user-123', 'ADAUSDT', 'buy', 'limit', 100, 0.45, 'pending', 0, 'strategy', datetime('now', '-30 minutes')),
  ('ord4', 'user-123', 'SOLUSDT', 'buy', 'stop', 2, 95, 'pending', 0, 'manual', datetime('now', '-15 minutes'));

-- Insert demo trading positions
INSERT OR IGNORE INTO trading_positions (id, user_id, symbol, side, entry_price, current_price, quantity, unrealized_pnl, status, source) VALUES
  ('pos1', 'user-123', 'BTCUSDT', 'long', 44800, 45234, 0.15, 65.10, 'open', 'manual'),
  ('pos2', 'user-123', 'ETHUSDT', 'long', 2850, 2897, 2.0, 94.00, 'open', 'autopilot'),
  ('pos3', 'user-123', 'SOLUSDT', 'long', 92.5, 95.2, 5.0, 13.50, 'open', 'strategy');