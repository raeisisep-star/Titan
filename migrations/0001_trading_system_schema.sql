-- Real Trading System Database Schema
-- Complete schema for TITAN Trading Platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  country TEXT DEFAULT 'IR',
  timezone TEXT DEFAULT 'Asia/Tehran',
  api_key TEXT,
  is_active BOOLEAN DEFAULT true,
  is_verified BOOLEAN DEFAULT false,
  kyc_status TEXT DEFAULT 'none' CHECK (kyc_status IN ('none', 'pending', 'approved', 'rejected')),
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

-- Portfolios table
CREATE TABLE IF NOT EXISTS portfolios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL DEFAULT 'Main Portfolio',
  balance_usd REAL DEFAULT 10000.0,
  available_balance REAL DEFAULT 10000.0,
  locked_balance REAL DEFAULT 0.0,
  total_pnl REAL DEFAULT 0.0,
  daily_pnl REAL DEFAULT 0.0,
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Portfolio assets table
CREATE TABLE IF NOT EXISTS portfolio_assets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  amount REAL NOT NULL DEFAULT 0,
  locked_amount REAL DEFAULT 0,
  avg_buy_price REAL NOT NULL,
  current_price REAL DEFAULT 0,
  total_value_usd REAL DEFAULT 0,
  pnl_usd REAL DEFAULT 0,
  pnl_percentage REAL DEFAULT 0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
  UNIQUE (portfolio_id, symbol)
);

-- Trading strategies table
CREATE TABLE IF NOT EXISTS trading_strategies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('manual', 'scalping', 'swing', 'dca', 'arbitrage', 'grid', 'momentum')),
  status TEXT DEFAULT 'inactive' CHECK (status IN ('active', 'paused', 'stopped', 'inactive')),
  symbol TEXT NOT NULL,
  timeframe TEXT DEFAULT '1h',
  config TEXT DEFAULT '{}',
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  win_rate REAL DEFAULT 0,
  total_pnl REAL DEFAULT 0,
  max_drawdown REAL DEFAULT 0,
  sharpe_ratio REAL DEFAULT 0,
  max_position_size REAL DEFAULT 1000,
  stop_loss_percentage REAL DEFAULT 2.0,
  take_profit_percentage REAL DEFAULT 5.0,
  max_daily_loss REAL DEFAULT 500,
  started_at DATETIME,
  stopped_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Trading orders table
CREATE TABLE IF NOT EXISTS trading_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  portfolio_id INTEGER NOT NULL,
  strategy_id INTEGER,
  exchange TEXT DEFAULT 'binance',
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  type TEXT NOT NULL CHECK (type IN ('market', 'limit', 'stop', 'stop_limit')),
  quantity REAL NOT NULL,
  filled_quantity REAL DEFAULT 0,
  price REAL,
  stop_price REAL,
  avg_fill_price REAL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'open', 'filled', 'partial', 'canceled', 'rejected')),
  order_id TEXT,
  client_order_id TEXT NOT NULL,
  total_value REAL,
  filled_value REAL DEFAULT 0,
  fees REAL DEFAULT 0,
  pnl REAL DEFAULT 0,
  stop_loss REAL,
  take_profit REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  filled_at DATETIME,
  canceled_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
  FOREIGN KEY (strategy_id) REFERENCES trading_strategies(id)
);

-- Trades table
CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  portfolio_id INTEGER NOT NULL,
  strategy_id INTEGER,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity REAL NOT NULL,
  entry_price REAL NOT NULL,
  exit_price REAL,
  pnl REAL DEFAULT 0,
  pnl_percentage REAL DEFAULT 0,
  fees REAL DEFAULT 0,
  net_pnl REAL DEFAULT 0,
  entry_reason TEXT,
  exit_reason TEXT,
  duration_minutes INTEGER,
  stop_loss REAL,
  take_profit REAL,
  max_risk_percentage REAL,
  entry_order_id INTEGER,
  exit_order_id INTEGER,
  entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  exit_time DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id),
  FOREIGN KEY (strategy_id) REFERENCES trading_strategies(id),
  FOREIGN KEY (entry_order_id) REFERENCES trading_orders(id),
  FOREIGN KEY (exit_order_id) REFERENCES trading_orders(id)
);

-- Market data table
CREATE TABLE IF NOT EXISTS market_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL,
  open_price REAL NOT NULL,
  high_price REAL NOT NULL,
  low_price REAL NOT NULL,
  close_price REAL NOT NULL,
  volume REAL NOT NULL,
  quote_volume REAL,
  trades_count INTEGER,
  taker_buy_volume REAL,
  taker_buy_quote_volume REAL,
  rsi_14 REAL,
  macd REAL,
  macd_signal REAL,
  macd_histogram REAL,
  bb_upper REAL,
  bb_middle REAL,
  bb_lower REAL,
  timestamp DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (symbol, timeframe, timestamp)
);

-- AI signals table
CREATE TABLE IF NOT EXISTS ai_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  timeframe TEXT DEFAULT '1h',
  signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold', 'strong_buy', 'strong_sell')),
  confidence REAL NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
  strength TEXT DEFAULT 'moderate' CHECK (strength IN ('weak', 'moderate', 'strong', 'very_strong')),
  current_price REAL NOT NULL,
  target_price REAL,
  stop_loss_price REAL,
  probability REAL,
  reasoning TEXT,
  factors TEXT,
  model_version TEXT DEFAULT 'v1.0',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'triggered', 'expired', 'canceled')),
  expires_at DATETIME,
  triggered_at DATETIME,
  actual_outcome TEXT CHECK (actual_outcome IN ('win', 'loss', 'neutral')),
  actual_pnl REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Target trades table
CREATE TABLE IF NOT EXISTS target_trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  portfolio_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  initial_amount REAL NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL NOT NULL,
  progress_percentage REAL DEFAULT 0,
  trades_executed INTEGER DEFAULT 0,
  successful_trades INTEGER DEFAULT 0,
  strategy TEXT DEFAULT 'balanced',
  risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
  max_drawdown_limit REAL DEFAULT 10.0,
  target_duration_days INTEGER,
  estimated_completion DATETIME,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'failed', 'canceled')),
  final_amount REAL,
  total_pnl REAL DEFAULT 0,
  success_rate REAL DEFAULT 0,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (portfolio_id) REFERENCES portfolios(id)
);

-- System events table
CREATE TABLE IF NOT EXISTS system_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_type TEXT NOT NULL CHECK (event_type IN ('order_created', 'order_filled', 'trade_completed', 'strategy_started', 'strategy_stopped', 'signal_generated', 'error', 'system_maintenance')),
  severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  message TEXT NOT NULL,
  details TEXT,
  user_id INTEGER,
  related_entity_type TEXT,
  related_entity_id INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_active ON portfolios(is_active);

CREATE INDEX IF NOT EXISTS idx_portfolio_assets_portfolio_id ON portfolio_assets(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_symbol ON portfolio_assets(symbol);

CREATE INDEX IF NOT EXISTS idx_trading_strategies_user_id ON trading_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_status ON trading_strategies(status);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_type ON trading_strategies(type);

CREATE INDEX IF NOT EXISTS idx_trading_orders_user_id ON trading_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_orders_portfolio_id ON trading_orders(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_trading_orders_strategy_id ON trading_orders(strategy_id);
CREATE INDEX IF NOT EXISTS idx_trading_orders_status ON trading_orders(status);
CREATE INDEX IF NOT EXISTS idx_trading_orders_symbol ON trading_orders(symbol);

CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_portfolio_id ON trades(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_trades_strategy_id ON trades(strategy_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_entry_time ON trades(entry_time);

CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_timeframe ON market_data(timeframe);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_market_data_symbol_timeframe ON market_data(symbol, timeframe);

CREATE INDEX IF NOT EXISTS idx_ai_signals_symbol ON ai_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_signals_status ON ai_signals(status);
CREATE INDEX IF NOT EXISTS idx_ai_signals_signal_type ON ai_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_ai_signals_created_at ON ai_signals(created_at);

CREATE INDEX IF NOT EXISTS idx_target_trades_user_id ON target_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_target_trades_portfolio_id ON target_trades(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_target_trades_status ON target_trades(status);

CREATE INDEX IF NOT EXISTS idx_system_events_user_id ON system_events(user_id);
CREATE INDEX IF NOT EXISTS idx_system_events_event_type ON system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_severity ON system_events(severity);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
AFTER UPDATE ON users 
FOR EACH ROW 
BEGIN
  UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_portfolios_timestamp 
AFTER UPDATE ON portfolios 
FOR EACH ROW 
BEGIN
  UPDATE portfolios SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_trading_strategies_timestamp 
AFTER UPDATE ON trading_strategies 
FOR EACH ROW 
BEGIN
  UPDATE trading_strategies SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_trading_orders_timestamp 
AFTER UPDATE ON trading_orders 
FOR EACH ROW 
BEGIN
  UPDATE trading_orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_ai_signals_timestamp 
AFTER UPDATE ON ai_signals 
FOR EACH ROW 
BEGIN
  UPDATE ai_signals SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_target_trades_timestamp 
AFTER UPDATE ON target_trades 
FOR EACH ROW 
BEGIN
  UPDATE target_trades SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Insert initial demo data
INSERT OR IGNORE INTO users (id, username, email, password_hash, first_name, last_name) 
VALUES (1, 'demo_user', 'demo@titan.dev', 'hashed_password', 'Demo', 'User');

INSERT OR IGNORE INTO portfolios (id, user_id, name, balance_usd, available_balance) 
VALUES (1, 1, 'Main Portfolio', 10000.0, 8500.0);

INSERT OR IGNORE INTO portfolio_assets (portfolio_id, symbol, amount, avg_buy_price, current_price, total_value_usd) 
VALUES 
  (1, 'BTC', 0.15, 42000.0, 45000.0, 6750.0),
  (1, 'ETH', 2.5, 2800.0, 2900.0, 7250.0),
  (1, 'SOL', 50, 85.0, 98.0, 4900.0);

INSERT OR IGNORE INTO trading_strategies (id, user_id, name, type, symbol, status, config) 
VALUES 
  (1, 1, 'BTC DCA Strategy', 'dca', 'BTCUSDT', 'active', '{"buyAmount": 100, "intervalHours": 24}'),
  (2, 1, 'ETH Grid Trading', 'grid', 'ETHUSDT', 'paused', '{"gridLevels": 10, "gridSpacing": 2, "baseAmount": 50}');

INSERT OR IGNORE INTO ai_signals (symbol, signal_type, confidence, current_price, reasoning) 
VALUES 
  ('BTCUSDT', 'buy', 75, 45000.0, 'RSI oversold + MACD bullish crossover'),
  ('ETHUSDT', 'hold', 60, 2900.0, 'Consolidation phase near resistance'),
  ('SOLUSDT', 'strong_buy', 85, 98.0, 'Breakout above key resistance with high volume');

INSERT OR IGNORE INTO target_trades (user_id, portfolio_id, name, initial_amount, target_amount, current_amount) 
VALUES 
  (1, 1, 'Grow to $15K', 10000.0, 15000.0, 11250.0),
  (1, 1, 'Monthly Goal', 11250.0, 12500.0, 11250.0);