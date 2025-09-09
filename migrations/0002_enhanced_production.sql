-- TITAN Trading System - Enhanced Production Schema
-- Migration 0002: Production enhancements and new tables
-- Created: 2025-09-09

-- ===========================
-- Session Management
-- ===========================

CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY, -- UUID
  user_id INTEGER NOT NULL,
  device_info JSON, -- Browser, OS, etc.
  ip_address TEXT,
  location TEXT,
  expires_at DATETIME NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  last_activity DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ===========================
-- Enhanced AI Management
-- ===========================

CREATE TABLE IF NOT EXISTS ai_providers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL, -- openai, anthropic, google
  display_name TEXT NOT NULL,
  api_endpoint TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  rate_limit_per_minute INTEGER DEFAULT 60,
  cost_per_token DECIMAL(10,8) DEFAULT 0.0,
  max_tokens INTEGER DEFAULT 4000,
  supported_features JSON, -- ['chat', 'completion', 'analysis']
  configuration JSON, -- Provider-specific settings
  last_health_check DATETIME,
  health_status TEXT DEFAULT 'unknown' CHECK(health_status IN ('healthy', 'degraded', 'down', 'unknown')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ai_conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  session_id TEXT,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  conversation_title TEXT,
  context JSON, -- Conversation context and memory
  total_tokens_used INTEGER DEFAULT 0,
  total_cost DECIMAL(10,6) DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  conversation_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER DEFAULT 0,
  processing_time_ms INTEGER,
  confidence_score DECIMAL(5,2),
  metadata JSON, -- Additional message metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES ai_conversations (id) ON DELETE CASCADE
);

-- ===========================
-- Enhanced Market Data & News
-- ===========================

CREATE TABLE IF NOT EXISTS news_articles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  summary TEXT,
  url TEXT UNIQUE,
  source TEXT NOT NULL,
  author TEXT,
  published_at DATETIME NOT NULL,
  symbols JSON, -- Related cryptocurrency symbols
  sentiment_score DECIMAL(5,2), -- -1 to 1 (negative to positive)
  sentiment_label TEXT CHECK(sentiment_label IN ('very_negative', 'negative', 'neutral', 'positive', 'very_positive')),
  impact_score DECIMAL(5,2), -- 0 to 1 (low to high market impact)
  categories JSON, -- ['defi', 'regulation', 'technology', 'market']
  language TEXT DEFAULT 'en',
  is_analyzed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS market_indicators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  symbol TEXT NOT NULL,
  indicator_type TEXT NOT NULL CHECK(indicator_type IN ('rsi', 'macd', 'sma', 'ema', 'bollinger_bands', 'stochastic')),
  timeframe TEXT NOT NULL CHECK(timeframe IN ('1m', '5m', '15m', '1h', '4h', '1d', '1w')),
  value DECIMAL(12,6) NOT NULL,
  signal TEXT CHECK(signal IN ('buy', 'sell', 'neutral')),
  strength DECIMAL(5,2), -- 0 to 100
  parameters JSON, -- Indicator-specific parameters
  timestamp DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===========================
-- Enhanced Exchange Integration
-- ===========================

CREATE TABLE IF NOT EXISTS exchange_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exchange TEXT UNIQUE NOT NULL,
  is_operational BOOLEAN DEFAULT TRUE,
  api_status TEXT DEFAULT 'online' CHECK(api_status IN ('online', 'degraded', 'offline', 'maintenance')),
  last_ping_ms INTEGER,
  rate_limit_remaining INTEGER,
  rate_limit_reset DATETIME,
  maintenance_start DATETIME,
  maintenance_end DATETIME,
  status_message TEXT,
  last_check DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS wallet_balances (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trading_account_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  available DECIMAL(18,8) DEFAULT 0.0,
  locked DECIMAL(18,8) DEFAULT 0.0,
  total DECIMAL(18,8) DEFAULT 0.0,
  usd_value DECIMAL(15,2) DEFAULT 0.0,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trading_account_id) REFERENCES trading_accounts (id) ON DELETE CASCADE,
  UNIQUE(trading_account_id, symbol)
);

-- ===========================
-- Advanced Trading Features
-- ===========================

CREATE TABLE IF NOT EXISTS trade_signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  symbol TEXT NOT NULL,
  signal_type TEXT NOT NULL CHECK(signal_type IN ('buy', 'sell', 'hold', 'strong_buy', 'strong_sell')),
  source TEXT NOT NULL CHECK(source IN ('ai_analysis', 'technical_indicator', 'news_sentiment', 'user_manual')),
  confidence DECIMAL(5,2) NOT NULL, -- 0 to 100
  strength TEXT NOT NULL CHECK(strength IN ('weak', 'moderate', 'strong', 'very_strong')),
  entry_price DECIMAL(12,4),
  target_prices JSON, -- Array of target prices
  stop_loss DECIMAL(12,4),
  risk_reward_ratio DECIMAL(5,2),
  timeframe TEXT CHECK(timeframe IN ('scalp', 'intraday', 'swing', 'position')),
  analysis_data JSON, -- Supporting analysis data
  expires_at DATETIME,
  is_active BOOLEAN DEFAULT TRUE,
  executed BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS backtest_results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  initial_capital DECIMAL(15,2) NOT NULL,
  final_capital DECIMAL(15,2) NOT NULL,
  total_return DECIMAL(15,2) NOT NULL,
  total_return_percentage DECIMAL(8,4) NOT NULL,
  max_drawdown DECIMAL(8,4),
  sharpe_ratio DECIMAL(6,4),
  win_rate DECIMAL(5,2),
  total_trades INTEGER NOT NULL,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  avg_win DECIMAL(12,4),
  avg_loss DECIMAL(12,4),
  profit_factor DECIMAL(6,4), -- Gross profit / Gross loss
  parameters JSON, -- Strategy parameters used
  detailed_results JSON, -- Trade-by-trade results
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (strategy_id) REFERENCES trading_strategies (id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ===========================
-- Risk Management
-- ===========================

CREATE TABLE IF NOT EXISTS risk_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  risk_tolerance TEXT DEFAULT 'moderate' CHECK(risk_tolerance IN ('conservative', 'moderate', 'aggressive', 'very_aggressive')),
  max_position_size_percent DECIMAL(5,2) DEFAULT 10.0, -- Max % of portfolio per position
  max_daily_loss_percent DECIMAL(5,2) DEFAULT 5.0, -- Max daily loss %
  max_drawdown_percent DECIMAL(5,2) DEFAULT 20.0, -- Max drawdown %
  position_sizing_method TEXT DEFAULT 'fixed_percent' CHECK(position_sizing_method IN ('fixed_amount', 'fixed_percent', 'kelly_criterion', 'volatility_based')),
  correlation_limit DECIMAL(5,2) DEFAULT 70.0, -- Max correlation between positions
  leverage_multiplier DECIMAL(4,2) DEFAULT 1.0,
  emergency_stop_enabled BOOLEAN DEFAULT TRUE,
  emergency_stop_percent DECIMAL(5,2) DEFAULT 15.0,
  risk_budget_daily DECIMAL(15,2) DEFAULT 1000.0,
  risk_budget_monthly DECIMAL(15,2) DEFAULT 20000.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS risk_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  event_type TEXT NOT NULL CHECK(event_type IN ('max_loss_reached', 'drawdown_exceeded', 'correlation_breach', 'emergency_stop', 'margin_call')),
  severity TEXT NOT NULL CHECK(severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT NOT NULL,
  current_value DECIMAL(15,4),
  threshold_value DECIMAL(15,4),
  action_taken TEXT,
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_at DATETIME,
  metadata JSON,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- ===========================
-- System Configuration
-- ===========================

CREATE TABLE IF NOT EXISTS system_config (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value TEXT NOT NULL,
  data_type TEXT DEFAULT 'string' CHECK(data_type IN ('string', 'number', 'boolean', 'json')),
  description TEXT,
  is_sensitive BOOLEAN DEFAULT FALSE,
  is_user_configurable BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(category, key)
);

-- ===========================
-- Audit Trail
-- ===========================

CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL, -- 'user', 'trade', 'portfolio', etc.
  resource_id TEXT,
  old_values JSON,
  new_values JSON,
  ip_address TEXT,
  user_agent TEXT,
  session_id TEXT,
  risk_score INTEGER DEFAULT 0, -- 0-100 risk assessment
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
);

-- ===========================
-- Performance Indexes
-- ===========================

-- Session management indexes
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_ip ON user_sessions(ip_address);

-- AI management indexes
CREATE INDEX IF NOT EXISTS idx_ai_providers_active ON ai_providers(is_active);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation_id ON ai_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_ai_messages_created_at ON ai_messages(created_at);

-- News and market indexes
CREATE INDEX IF NOT EXISTS idx_news_articles_published_at ON news_articles(published_at);
CREATE INDEX IF NOT EXISTS idx_news_articles_symbols ON news_articles(symbols);
CREATE INDEX IF NOT EXISTS idx_news_articles_sentiment ON news_articles(sentiment_score);
CREATE INDEX IF NOT EXISTS idx_market_indicators_symbol_type ON market_indicators(symbol, indicator_type);
CREATE INDEX IF NOT EXISTS idx_market_indicators_timestamp ON market_indicators(timestamp);

-- Exchange and trading indexes
CREATE INDEX IF NOT EXISTS idx_exchange_status_exchange ON exchange_status(exchange);
CREATE INDEX IF NOT EXISTS idx_wallet_balances_account_symbol ON wallet_balances(trading_account_id, symbol);
CREATE INDEX IF NOT EXISTS idx_trade_signals_symbol ON trade_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trade_signals_user_id ON trade_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_signals_active ON trade_signals(is_active);

-- Risk management indexes
CREATE INDEX IF NOT EXISTS idx_risk_events_user_id ON risk_events(user_id);
CREATE INDEX IF NOT EXISTS idx_risk_events_severity ON risk_events(severity);
CREATE INDEX IF NOT EXISTS idx_risk_events_resolved ON risk_events(is_resolved);

-- System and audit indexes
CREATE INDEX IF NOT EXISTS idx_system_config_category ON system_config(category);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- ===========================
-- Initial System Configuration
-- ===========================

-- AI Providers Configuration
INSERT OR IGNORE INTO ai_providers (name, display_name, api_endpoint, is_active, rate_limit_per_minute, supported_features) VALUES
('openai', 'OpenAI GPT', 'https://api.openai.com/v1', TRUE, 60, '["chat", "completion", "analysis"]'),
('anthropic', 'Anthropic Claude', 'https://api.anthropic.com/v1', TRUE, 50, '["chat", "completion", "analysis"]'),
('google', 'Google Gemini', 'https://generativelanguage.googleapis.com/v1beta', TRUE, 40, '["chat", "completion", "analysis"]');

-- Default System Configuration
INSERT OR IGNORE INTO system_config (category, key, value, data_type, description, is_user_configurable) VALUES
-- Trading Configuration
('trading', 'default_stop_loss_percent', '5.0', 'number', 'Default stop loss percentage', TRUE),
('trading', 'default_take_profit_percent', '10.0', 'number', 'Default take profit percentage', TRUE),
('trading', 'max_concurrent_trades', '50', 'number', 'Maximum concurrent trades', FALSE),
('trading', 'default_trade_size_percent', '2.0', 'number', 'Default trade size as % of portfolio', TRUE),

-- AI Configuration  
('ai', 'default_confidence_threshold', '0.75', 'number', 'Minimum confidence for AI signals', TRUE),
('ai', 'max_tokens_per_request', '2000', 'number', 'Maximum tokens per AI request', FALSE),
('ai', 'enable_sentiment_analysis', 'true', 'boolean', 'Enable news sentiment analysis', TRUE),
('ai', 'prediction_expiry_hours', '24', 'number', 'Hours until AI predictions expire', FALSE),

-- Risk Management
('risk', 'global_emergency_stop_enabled', 'true', 'boolean', 'Global emergency stop system', FALSE),
('risk', 'default_max_drawdown', '20.0', 'number', 'Default maximum drawdown %', TRUE),
('risk', 'correlation_check_enabled', 'true', 'boolean', 'Enable correlation checking', TRUE),

-- System Settings
('system', 'maintenance_mode', 'false', 'boolean', 'System maintenance mode', FALSE),
('system', 'api_rate_limit_enabled', 'true', 'boolean', 'Enable API rate limiting', FALSE),
('system', 'audit_logging_enabled', 'true', 'boolean', 'Enable audit logging', FALSE),
('system', 'health_check_interval_seconds', '30', 'number', 'Health check interval', FALSE),

-- Notification Settings
('notifications', 'default_channels', '["email", "inapp"]', 'json', 'Default notification channels', TRUE),
('notifications', 'critical_alert_channels', '["email", "telegram", "sms"]', 'json', 'Channels for critical alerts', TRUE),
('notifications', 'email_rate_limit_per_hour', '10', 'number', 'Email rate limit per hour per user', FALSE),

-- Market Data
('market', 'price_update_interval_seconds', '60', 'number', 'Price update interval', FALSE),
('market', 'news_fetch_interval_minutes', '15', 'number', 'News fetching interval', FALSE),
('market', 'indicator_calculation_enabled', 'true', 'boolean', 'Enable technical indicator calculations', TRUE);