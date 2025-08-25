-- TITAN Trading System - Initial Database Schema
-- Created: 2025-08-22

-- ===========================
-- Users and Authentication  
-- ===========================

CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'user' CHECK(role IN ('admin', 'user', 'trader', 'analyst')),
  avatar_url TEXT,
  settings JSON DEFAULT '{}',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  email_verified BOOLEAN DEFAULT FALSE,
  two_factor_enabled BOOLEAN DEFAULT FALSE
);

-- ===========================
-- Trading Accounts & Exchanges
-- ===========================

CREATE TABLE IF NOT EXISTS trading_accounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  exchange TEXT NOT NULL CHECK(exchange IN ('binance', 'coinbase', 'kucoin', 'demo')),
  account_name TEXT NOT NULL,
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,  
  passphrase_encrypted TEXT,
  is_testnet BOOLEAN DEFAULT TRUE,
  is_active BOOLEAN DEFAULT TRUE,
  balance_usd DECIMAL(15,2) DEFAULT 0.0,
  last_sync DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ===========================
-- Portfolio & Holdings
-- ===========================

CREATE TABLE IF NOT EXISTS portfolios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL DEFAULT 'Default Portfolio',
  total_value_usd DECIMAL(15,2) DEFAULT 0.0,
  total_pnl_usd DECIMAL(15,2) DEFAULT 0.0,
  total_pnl_percentage DECIMAL(8,4) DEFAULT 0.0,
  risk_level TEXT DEFAULT 'medium' CHECK(risk_level IN ('low', 'medium', 'high', 'aggressive')),
  rebalance_frequency TEXT DEFAULT 'weekly' CHECK(rebalance_frequency IN ('daily', 'weekly', 'monthly', 'manual')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS holdings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  portfolio_id INTEGER NOT NULL,
  trading_account_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  quantity DECIMAL(18,8) NOT NULL,
  average_cost DECIMAL(12,4) NOT NULL,
  current_price DECIMAL(12,4) DEFAULT 0.0,
  market_value_usd DECIMAL(15,2) DEFAULT 0.0,
  pnl_usd DECIMAL(15,2) DEFAULT 0.0,
  pnl_percentage DECIMAL(8,4) DEFAULT 0.0,
  allocation_percentage DECIMAL(5,2) DEFAULT 0.0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios (id) ON DELETE CASCADE,
  FOREIGN KEY (trading_account_id) REFERENCES trading_accounts (id) ON DELETE CASCADE
);

-- ===========================
-- Trading & Orders
-- ===========================

CREATE TABLE IF NOT EXISTS trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  trading_account_id INTEGER NOT NULL,
  portfolio_id INTEGER,
  exchange_order_id TEXT,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK(side IN ('buy', 'sell')),
  type TEXT NOT NULL CHECK(type IN ('market', 'limit', 'stop_loss', 'take_profit', 'trailing_stop')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'filled', 'partially_filled', 'cancelled', 'failed')),
  quantity DECIMAL(18,8) NOT NULL,
  price DECIMAL(12,4),
  filled_quantity DECIMAL(18,8) DEFAULT 0.0,
  average_fill_price DECIMAL(12,4) DEFAULT 0.0,
  fees DECIMAL(12,4) DEFAULT 0.0,
  total_value DECIMAL(15,2),
  stop_price DECIMAL(12,4),
  take_profit_price DECIMAL(12,4),
  strategy TEXT,
  ai_agent TEXT,
  ai_confidence DECIMAL(5,2),
  execution_time DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  FOREIGN KEY (trading_account_id) REFERENCES trading_accounts (id) ON DELETE CASCADE,
  FOREIGN KEY (portfolio_id) REFERENCES portfolios (id) ON DELETE SET NULL
);

-- ===========================
-- AI Analysis & Predictions
-- ===========================

CREATE TABLE IF NOT EXISTS ai_analyses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  symbol TEXT NOT NULL,
  analysis_type TEXT NOT NULL CHECK(analysis_type IN ('market_analysis', 'price_prediction', 'trade_signal', 'portfolio_optimization', 'risk_assessment')),
  ai_provider TEXT NOT NULL CHECK(ai_provider IN ('openai', 'anthropic')),
  model_used TEXT NOT NULL,
  input_data JSON,
  analysis_result JSON NOT NULL,
  confidence_score DECIMAL(5,2),
  risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high', 'critical')),
  signals JSON, -- {buy: 0-100, sell: 0-100, hold: 0-100}
  price_targets JSON, -- {short_term, medium_term, long_term}
  recommendations JSON,
  processing_time_ms INTEGER,
  tokens_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  expires_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- ===========================
-- Market Data & Prices
-- ===========================

CREATE TABLE IF NOT EXISTS market_data (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  exchange TEXT NOT NULL,
  price DECIMAL(12,4) NOT NULL,
  volume_24h DECIMAL(20,2),
  market_cap DECIMAL(20,2),
  change_1h DECIMAL(8,4),
  change_24h DECIMAL(8,4),
  change_7d DECIMAL(8,4),
  high_24h DECIMAL(12,4),
  low_24h DECIMAL(12,4),
  circulating_supply DECIMAL(20,2),
  total_supply DECIMAL(20,2),
  data_source TEXT DEFAULT 'coingecko',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  timeframe TEXT NOT NULL CHECK(timeframe IN ('1m', '5m', '15m', '1h', '4h', '1d', '1w')),
  open_price DECIMAL(12,4) NOT NULL,
  high_price DECIMAL(12,4) NOT NULL,
  low_price DECIMAL(12,4) NOT NULL,
  close_price DECIMAL(12,4) NOT NULL,
  volume DECIMAL(20,2) NOT NULL,
  timestamp DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- Notifications & Alerts
-- ===========================

CREATE TABLE IF NOT EXISTS notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  type TEXT NOT NULL CHECK(type IN ('trade_alert', 'price_alert', 'system_alert', 'ai_insight', 'portfolio_update')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'critical')),
  channels TEXT NOT NULL, -- JSON array: ['email', 'telegram', 'sms', 'inapp']
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'failed', 'retry')),
  data JSON, -- Additional notification data
  sent_at DATETIME,
  retry_count INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS price_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  condition_type TEXT NOT NULL CHECK(condition_type IN ('above', 'below', 'percent_change')),
  target_price DECIMAL(12,4),
  percent_change DECIMAL(8,4),
  is_active BOOLEAN DEFAULT TRUE,
  triggered_at DATETIME,
  notification_sent BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ===========================
-- Trading Strategies & Automation
-- ===========================

CREATE TABLE IF NOT EXISTS trading_strategies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  strategy_type TEXT NOT NULL CHECK(strategy_type IN ('dca', 'grid', 'momentum', 'mean_reversion', 'ai_powered')),
  symbols JSON NOT NULL, -- Array of symbols to trade
  parameters JSON NOT NULL, -- Strategy-specific parameters
  risk_management JSON, -- Stop loss, take profit, position sizing
  is_active BOOLEAN DEFAULT FALSE,
  is_paper_trading BOOLEAN DEFAULT TRUE,
  total_pnl DECIMAL(15,2) DEFAULT 0.0,
  win_rate DECIMAL(5,2) DEFAULT 0.0,
  total_trades INTEGER DEFAULT 0,
  last_execution DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ===========================
-- System Logs & Performance
-- ===========================

CREATE TABLE IF NOT EXISTS system_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  level TEXT NOT NULL CHECK(level IN ('debug', 'info', 'warn', 'error', 'critical')),
  category TEXT NOT NULL CHECK(category IN ('auth', 'trading', 'ai', 'notifications', 'system')),
  message TEXT NOT NULL,
  data JSON,
  ip_address TEXT,
  user_agent TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS performance_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  metric_type TEXT NOT NULL CHECK(metric_type IN ('portfolio_value', 'total_pnl', 'win_rate', 'sharpe_ratio', 'max_drawdown')),
  value DECIMAL(15,4) NOT NULL,
  timeframe TEXT NOT NULL CHECK(timeframe IN ('daily', 'weekly', 'monthly', 'yearly')),
  date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ===========================
-- Indexes for Performance
-- ===========================

-- User indexes
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Trading accounts indexes  
CREATE INDEX IF NOT EXISTS idx_trading_accounts_user_id ON trading_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_accounts_exchange ON trading_accounts(exchange);

-- Portfolio indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_holdings_portfolio_id ON holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_holdings_symbol ON holdings(symbol);

-- Trading indexes
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at);

-- AI analysis indexes
CREATE INDEX IF NOT EXISTS idx_ai_analyses_symbol ON ai_analyses(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_type ON ai_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_ai_analyses_created_at ON ai_analyses(created_at);

-- Market data indexes
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_price_history_symbol_timeframe ON price_history(symbol, timeframe);
CREATE INDEX IF NOT EXISTS idx_price_history_timestamp ON price_history(timestamp);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_symbol ON price_alerts(symbol);

-- System logs indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_level ON system_logs(level);
CREATE INDEX IF NOT EXISTS idx_system_logs_category ON system_logs(category);
CREATE INDEX IF NOT EXISTS idx_system_logs_created_at ON system_logs(created_at);

-- Performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_performance_metrics_user_id ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_date ON performance_metrics(metric_type, date);