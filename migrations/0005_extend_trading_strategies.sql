-- Extend Trading Strategies System Database Schema
-- Migration: 0005_extend_trading_strategies.sql
-- Created: 2024-10-10
-- Description: Extend existing trading_strategies table and add new related tables for comprehensive strategy management

-- Add new columns to existing trading_strategies table
ALTER TABLE trading_strategies ADD COLUMN strategy_id TEXT;
ALTER TABLE trading_strategies ADD COLUMN description TEXT;
ALTER TABLE trading_strategies ADD COLUMN category TEXT DEFAULT 'custom';
ALTER TABLE trading_strategies ADD COLUMN ai_generated INTEGER DEFAULT 0;
ALTER TABLE trading_strategies ADD COLUMN ai_model TEXT;
ALTER TABLE trading_strategies ADD COLUMN confidence_score REAL;
ALTER TABLE trading_strategies ADD COLUMN risk_level TEXT DEFAULT 'medium';
ALTER TABLE trading_strategies ADD COLUMN last_executed_at DATETIME;

-- Update category values to match the existing type column
UPDATE trading_strategies SET category = type WHERE category IS NULL;

-- Create unique strategy_id for existing records
UPDATE trading_strategies SET strategy_id = 'existing_' || id WHERE strategy_id IS NULL;

-- Strategy Configuration Table
CREATE TABLE IF NOT EXISTS strategy_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_id TEXT NOT NULL,
  max_positions INTEGER DEFAULT 3,
  position_size_percent REAL DEFAULT 5.0,
  stop_loss_percent REAL DEFAULT 2.0,
  take_profit_percent REAL DEFAULT 6.0,
  max_investment_percent REAL DEFAULT 15.0,
  risk_score INTEGER DEFAULT 5, -- 1-10 scale
  allowed_symbols TEXT, -- JSON array of symbols
  timeframe TEXT DEFAULT '1h', -- Trading timeframe
  indicators_config TEXT, -- JSON configuration for technical indicators
  ai_agent_id INTEGER, -- Reference to AI agent if applicable
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Strategy Performance Metrics Table
CREATE TABLE IF NOT EXISTS strategy_performance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_id TEXT NOT NULL,
  total_return REAL DEFAULT 0.0, -- Total ROI percentage
  win_rate REAL DEFAULT 0.0, -- Win rate percentage (0-100)
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  max_drawdown REAL DEFAULT 0.0, -- Maximum drawdown percentage
  sharpe_ratio REAL DEFAULT 0.0,
  profit_factor REAL DEFAULT 0.0,
  total_volume REAL DEFAULT 0.0, -- Total trading volume
  avg_hold_time TEXT, -- Average holding time (e.g., '2h 15m')
  best_trade_return REAL DEFAULT 0.0,
  worst_trade_return REAL DEFAULT 0.0,
  consecutive_wins INTEGER DEFAULT 0,
  consecutive_losses INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Historical Performance Data Table (for charts)
CREATE TABLE IF NOT EXISTS strategy_performance_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_id TEXT NOT NULL,
  date DATE NOT NULL,
  daily_return REAL DEFAULT 0.0, -- Daily return percentage
  cumulative_return REAL DEFAULT 0.0, -- Cumulative return up to this date
  trades_count INTEGER DEFAULT 0, -- Number of trades on this day
  volume REAL DEFAULT 0.0, -- Trading volume for the day
  drawdown REAL DEFAULT 0.0, -- Drawdown on this day
  win_rate_daily REAL DEFAULT 0.0, -- Win rate for the day
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Individual Trade Records Table
CREATE TABLE IF NOT EXISTS strategy_trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_id TEXT NOT NULL,
  trade_id TEXT UNIQUE NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL, -- 'buy' or 'sell'
  entry_price REAL NOT NULL,
  exit_price REAL,
  quantity REAL NOT NULL,
  entry_time DATETIME NOT NULL,
  exit_time DATETIME,
  profit_loss REAL DEFAULT 0.0, -- P&L in base currency
  profit_loss_percent REAL DEFAULT 0.0, -- P&L as percentage
  status TEXT DEFAULT 'open', -- 'open', 'closed', 'cancelled'
  stop_loss_price REAL,
  take_profit_price REAL,
  commission REAL DEFAULT 0.0,
  notes TEXT, -- Additional trade notes
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Strategy Backtests Table
CREATE TABLE IF NOT EXISTS strategy_backtests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_id TEXT NOT NULL,
  backtest_id TEXT UNIQUE NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  initial_balance REAL NOT NULL,
  final_balance REAL NOT NULL,
  total_return REAL NOT NULL,
  max_drawdown REAL NOT NULL,
  sharpe_ratio REAL,
  win_rate REAL,
  total_trades INTEGER,
  status TEXT DEFAULT 'running', -- 'running', 'completed', 'failed'
  results_data TEXT, -- JSON with detailed backtest results
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Strategy Alerts and Notifications Table
CREATE TABLE IF NOT EXISTS strategy_alerts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  strategy_id TEXT NOT NULL,
  alert_type TEXT NOT NULL, -- 'performance', 'error', 'milestone', 'risk'
  message TEXT NOT NULL,
  severity TEXT DEFAULT 'info', -- 'info', 'warning', 'error', 'success'
  is_read INTEGER DEFAULT 0,
  metadata TEXT, -- JSON with additional alert data
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_trading_strategies_user_id ON trading_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_status ON trading_strategies(status);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_category ON trading_strategies(category);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_created_at ON trading_strategies(created_at);
CREATE INDEX IF NOT EXISTS idx_trading_strategies_strategy_id ON trading_strategies(strategy_id);

CREATE INDEX IF NOT EXISTS idx_strategy_configurations_strategy_id ON strategy_configurations(strategy_id);

CREATE INDEX IF NOT EXISTS idx_strategy_performance_strategy_id ON strategy_performance(strategy_id);

CREATE INDEX IF NOT EXISTS idx_strategy_performance_history_strategy_id ON strategy_performance_history(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_performance_history_date ON strategy_performance_history(date);
CREATE INDEX IF NOT EXISTS idx_strategy_performance_history_strategy_date ON strategy_performance_history(strategy_id, date);

CREATE INDEX IF NOT EXISTS idx_strategy_trades_strategy_id ON strategy_trades(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_trades_status ON strategy_trades(status);
CREATE INDEX IF NOT EXISTS idx_strategy_trades_entry_time ON strategy_trades(entry_time);
CREATE INDEX IF NOT EXISTS idx_strategy_trades_symbol ON strategy_trades(symbol);

CREATE INDEX IF NOT EXISTS idx_strategy_backtests_strategy_id ON strategy_backtests(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_backtests_status ON strategy_backtests(status);

CREATE INDEX IF NOT EXISTS idx_strategy_alerts_strategy_id ON strategy_alerts(strategy_id);
CREATE INDEX IF NOT EXISTS idx_strategy_alerts_is_read ON strategy_alerts(is_read);
CREATE INDEX IF NOT EXISTS idx_strategy_alerts_created_at ON strategy_alerts(created_at);

-- Insert sample data for testing (using existing user ID 1)
INSERT OR IGNORE INTO trading_strategies (
  user_id, strategy_id, name, description, category, status, ai_generated, ai_model, confidence_score, risk_level, last_executed_at, type, symbol
) VALUES 
  (1, 'ai_prediction_pro', 'AI Prediction Pro', 'استراتژی پیشرفته تحلیل با هوش مصنوعی برای پیش‌بینی قیمت', 'ai', 'active', 1, 'GPT-4-Trading', 0.89, 'medium', datetime('now', '-45 minutes'), 'momentum', 'BTCUSDT'),
  (1, 'btc_scalping_master', 'BTC Scalping Master', 'استراتژی اسکلپینگ تخصصی برای BTC با معاملات پرسرعت', 'scalping', 'active', 0, NULL, NULL, 'high', datetime('now', '-20 minutes'), 'scalping', 'BTCUSDT'),
  (1, 'trend_following_eth', 'Trend Following ETH', 'پیروی از روند قیمتی اتریوم با تحلیل تکنیکال پیشرفته', 'trend', 'active', 0, NULL, NULL, 'medium', datetime('now', '-10 minutes'), 'momentum', 'ETHUSDT'),
  (1, 'swing_trading_altcoins', 'Swing Trading Altcoins', 'معاملات سوئینگ روی آلت‌کوین‌های برتر با تحلیل بنیادی', 'swing', 'active', 0, NULL, NULL, 'medium', datetime('now', '-2 hours'), 'swing', 'ADAUSDT'),
  (1, 'arbitrage_multi_exchange', 'Arbitrage Multi-Exchange', 'آربیتراژ بین صرافی‌های مختلف برای کسب سود از اختلاف قیمت', 'arbitrage', 'active', 1, 'LSTM-Deep', 0.92, 'low', datetime('now', '-5 minutes'), 'arbitrage', 'BTCUSDT'),
  (1, 'dca_bitcoin_strategy', 'DCA Bitcoin Strategy', 'استراتژی سرمایه‌گذاری تدریجی در بیت‌کوین با بازه‌های زمانی ثابت', 'trend', 'inactive', 0, NULL, NULL, 'low', datetime('now', '-4 hours'), 'dca', 'BTCUSDT'),
  (1, 'news_sentiment_trading', 'News Sentiment Trading', 'معاملات بر اساس تحلیل احساسات اخبار و رسانه‌های اجتماعی', 'ai', 'inactive', 1, 'Transformer-Hybrid', 0.85, 'medium', datetime('now', '-6 hours'), 'momentum', 'BTCUSDT'),
  (1, 'mean_reversion_pairs', 'Mean Reversion Pairs', 'استراتژی بازگشت به میانگین با معاملات جفتی روی کریپتوها', 'arbitrage', 'inactive', 0, NULL, NULL, 'medium', datetime('now', '-1 day'), 'grid', 'ETHUSDT');

-- Insert strategy configurations
INSERT OR IGNORE INTO strategy_configurations (
  strategy_id, max_positions, position_size_percent, stop_loss_percent, take_profit_percent, max_investment_percent, risk_score, allowed_symbols, timeframe, ai_agent_id
) VALUES 
  ('ai_prediction_pro', 3, 5.0, 1.8, 3.5, 15.0, 6, '["BTCUSDT", "ETHUSDT", "ADAUSDT"]', '1h', 3),
  ('btc_scalping_master', 5, 2.0, 0.8, 1.2, 8.0, 8, '["BTCUSDT"]', '1m', 1),
  ('trend_following_eth', 2, 6.0, 2.5, 4.2, 12.0, 5, '["ETHUSDT", "ETHBTC"]', '4h', 2),
  ('swing_trading_altcoins', 4, 3.0, 4.0, 6.5, 20.0, 7, '["ADAUSDT", "SOLUSDT", "DOTUSDT", "LINKUSDT"]', '1d', 4),
  ('arbitrage_multi_exchange', 10, 1.0, 0.3, 0.8, 25.0, 3, '["BTCUSDT", "ETHUSDT", "BNBUSDT"]', '1m', 5),
  ('dca_bitcoin_strategy', 1, 10.0, 10.0, 15.0, 30.0, 4, '["BTCUSDT"]', '1w', 2),
  ('news_sentiment_trading', 3, 4.0, 3.2, 5.5, 18.0, 6, '["BTCUSDT", "ETHUSDT", "SOLUSDT"]', '1h', 3),
  ('mean_reversion_pairs', 6, 2.5, 3.5, 4.8, 22.0, 5, '["BTCUSDT", "ETHUSDT", "ADAUSDT", "DOTUSDT"]', '2h', NULL);

-- Insert performance data
INSERT OR IGNORE INTO strategy_performance (
  strategy_id, total_return, win_rate, total_trades, winning_trades, losing_trades, max_drawdown, sharpe_ratio, profit_factor, total_volume, avg_hold_time
) VALUES 
  ('ai_prediction_pro', 45.2, 89.3, 234, 209, 25, -3.2, 3.47, 2.85, 847200, '2h 15m'),
  ('btc_scalping_master', 38.7, 82.1, 567, 465, 102, -4.7, 2.89, 2.34, 1245800, '8m 32s'),
  ('trend_following_eth', 31.4, 75.6, 189, 143, 46, -6.1, 2.34, 2.12, 654300, '4h 45m'),
  ('swing_trading_altcoins', 28.9, 71.2, 145, 103, 42, -8.3, 2.12, 1.95, 432100, '2d 8h'),
  ('arbitrage_multi_exchange', 22.1, 94.7, 891, 844, 47, -1.8, 1.87, 3.12, 2134500, '3m 22s'),
  ('dca_bitcoin_strategy', 18.5, 68.3, 78, 53, 25, -12.4, 1.65, 1.78, 234500, '1w 3d'),
  ('news_sentiment_trading', 15.7, 64.2, 123, 79, 44, -9.6, 1.43, 1.65, 345600, '6h 12m'),
  ('mean_reversion_pairs', 12.3, 69.8, 156, 109, 47, -7.8, 1.23, 1.52, 287400, '4h 18m');

-- Insert sample performance history for charts (last 30 days)
INSERT OR IGNORE INTO strategy_performance_history (
  strategy_id, date, daily_return, cumulative_return, trades_count, volume, win_rate_daily
) VALUES 
  -- AI Prediction Pro - trending upward with some volatility
  ('ai_prediction_pro', date('now', '-29 days'), 1.8, 1.8, 8, 28500, 87.5),
  ('ai_prediction_pro', date('now', '-28 days'), 2.1, 3.9, 9, 31200, 88.9),
  ('ai_prediction_pro', date('now', '-27 days'), -0.5, 3.4, 7, 25800, 71.4),
  ('ai_prediction_pro', date('now', '-26 days'), 1.9, 5.3, 8, 29600, 87.5),
  ('ai_prediction_pro', date('now', '-25 days'), 2.3, 7.6, 10, 34700, 90.0),
  ('ai_prediction_pro', date('now', '-24 days'), 1.2, 8.8, 6, 22100, 83.3),
  ('ai_prediction_pro', date('now', '-23 days'), -0.8, 8.0, 9, 32400, 66.7),
  ('ai_prediction_pro', date('now', '-22 days'), 2.7, 10.7, 11, 38900, 90.9),
  ('ai_prediction_pro', date('now', '-21 days'), 1.5, 12.2, 7, 26300, 85.7),
  ('ai_prediction_pro', date('now', '-20 days'), 3.1, 15.3, 12, 41500, 91.7),
  
  -- BTC Scalping Master - more volatile, frequent trading
  ('btc_scalping_master', date('now', '-29 days'), 0.8, 0.8, 24, 52300, 79.2),
  ('btc_scalping_master', date('now', '-28 days'), 1.2, 2.0, 28, 58900, 82.1),
  ('btc_scalping_master', date('now', '-27 days'), -0.3, 1.7, 22, 47600, 72.7),
  ('btc_scalping_master', date('now', '-26 days'), 1.6, 3.3, 26, 55200, 84.6),
  ('btc_scalping_master', date('now', '-25 days'), 2.1, 5.4, 31, 63800, 87.1),
  ('btc_scalping_master', date('now', '-24 days'), 0.9, 6.3, 19, 42100, 78.9),
  ('btc_scalping_master', date('now', '-23 days'), -0.6, 5.7, 25, 54700, 76.0),
  ('btc_scalping_master', date('now', '-22 days'), 1.8, 7.5, 29, 61200, 86.2),
  ('btc_scalping_master', date('now', '-21 days'), 1.3, 8.8, 23, 48900, 82.6),
  ('btc_scalping_master', date('now', '-20 days'), 2.4, 11.2, 33, 67400, 87.9),
  
  -- Trend Following ETH - smoother trend
  ('trend_following_eth', date('now', '-29 days'), 1.1, 1.1, 4, 18200, 75.0),
  ('trend_following_eth', date('now', '-28 days'), 1.7, 2.8, 5, 21800, 80.0),
  ('trend_following_eth', date('now', '-27 days'), -0.2, 2.6, 3, 13500, 66.7),
  ('trend_following_eth', date('now', '-26 days'), 2.2, 4.8, 6, 24600, 83.3),
  ('trend_following_eth', date('now', '-25 days'), 1.8, 6.6, 4, 17900, 75.0),
  ('trend_following_eth', date('now', '-24 days'), 0.9, 7.5, 3, 12800, 66.7),
  ('trend_following_eth', date('now', '-23 days'), 1.5, 9.0, 5, 20300, 80.0),
  ('trend_following_eth', date('now', '-22 days'), 2.1, 11.1, 7, 26700, 85.7),
  ('trend_following_eth', date('now', '-21 days'), 1.3, 12.4, 4, 16200, 75.0),
  ('trend_following_eth', date('now', '-20 days'), 1.9, 14.3, 6, 23400, 83.3);