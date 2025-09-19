-- =============================================================================
-- Trading Mode System Migration
-- Date: 2024-09-14
-- Description: Creates tables for managing user trading modes (Demo/Live)
-- =============================================================================

-- User Trading Modes Table
-- Tracks current trading mode for each user
CREATE TABLE IF NOT EXISTS user_trading_modes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  trading_mode TEXT NOT NULL DEFAULT 'demo' CHECK (trading_mode IN ('demo', 'live')),
  demo_balance DECIMAL(15, 2) NOT NULL DEFAULT 10000.00,
  live_balance DECIMAL(15, 2) DEFAULT 0.00,
  risk_tolerance TEXT DEFAULT 'medium' CHECK (risk_tolerance IN ('low', 'medium', 'high')),
  max_daily_loss DECIMAL(10, 2) DEFAULT 1000.00,
  max_position_size DECIMAL(10, 2) DEFAULT 5000.00,
  auto_stop_loss BOOLEAN DEFAULT false,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trading Mode History Table
-- Records all trading mode changes for audit purposes
CREATE TABLE IF NOT EXISTS user_trading_mode_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  from_mode TEXT NOT NULL CHECK (from_mode IN ('demo', 'live')),
  to_mode TEXT NOT NULL CHECK (to_mode IN ('demo', 'live')),
  changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT,
  reason TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Demo Wallet History Table
-- Tracks all demo wallet balance changes
CREATE TABLE IF NOT EXISTS user_demo_wallet_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('reset', 'add', 'remove', 'trade_profit', 'trade_loss')),
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  balance_before DECIMAL(15, 2) NOT NULL,
  balance_after DECIMAL(15, 2) NOT NULL,
  description TEXT,
  trade_id INTEGER DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trading Preferences Table
-- Stores user-specific trading preferences for each mode
CREATE TABLE IF NOT EXISTS user_trading_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  trading_mode TEXT NOT NULL CHECK (trading_mode IN ('demo', 'live')),
  leverage_enabled BOOLEAN DEFAULT false,
  max_leverage DECIMAL(5, 2) DEFAULT 1.00,
  default_order_type TEXT DEFAULT 'market' CHECK (default_order_type IN ('market', 'limit', 'stop_limit')),
  default_position_size DECIMAL(10, 2) DEFAULT 100.00,
  auto_tp_percentage DECIMAL(5, 2) DEFAULT 10.00, -- Take Profit %
  auto_sl_percentage DECIMAL(5, 2) DEFAULT 5.00,  -- Stop Loss %
  notifications_enabled BOOLEAN DEFAULT true,
  risk_warnings_enabled BOOLEAN DEFAULT true,
  paper_trading_notifications BOOLEAN DEFAULT true,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, trading_mode)
);

-- Demo Trades Table
-- Records all demo trades for practice and learning
CREATE TABLE IF NOT EXISTS demo_trades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  symbol TEXT NOT NULL,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
  quantity DECIMAL(20, 8) NOT NULL,
  price DECIMAL(15, 8) NOT NULL,
  order_type TEXT NOT NULL CHECK (order_type IN ('market', 'limit', 'stop_limit')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled')),
  entry_price DECIMAL(15, 8) NOT NULL,
  exit_price DECIMAL(15, 8) DEFAULT NULL,
  take_profit DECIMAL(15, 8) DEFAULT NULL,
  stop_loss DECIMAL(15, 8) DEFAULT NULL,
  pnl DECIMAL(15, 8) DEFAULT 0.00,
  pnl_percentage DECIMAL(8, 4) DEFAULT 0.00,
  commission DECIMAL(10, 8) DEFAULT 0.00,
  notes TEXT,
  opened_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  closed_at DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trading Mode Statistics Table
-- Tracks performance statistics for each mode
CREATE TABLE IF NOT EXISTS user_trading_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  trading_mode TEXT NOT NULL CHECK (trading_mode IN ('demo', 'live')),
  total_trades INTEGER DEFAULT 0,
  winning_trades INTEGER DEFAULT 0,
  losing_trades INTEGER DEFAULT 0,
  total_pnl DECIMAL(15, 8) DEFAULT 0.00,
  best_trade DECIMAL(15, 8) DEFAULT 0.00,
  worst_trade DECIMAL(15, 8) DEFAULT 0.00,
  avg_win DECIMAL(15, 8) DEFAULT 0.00,
  avg_loss DECIMAL(15, 8) DEFAULT 0.00,
  win_rate DECIMAL(5, 2) DEFAULT 0.00,
  profit_factor DECIMAL(8, 4) DEFAULT 0.00,
  max_drawdown DECIMAL(15, 8) DEFAULT 0.00,
  sharpe_ratio DECIMAL(8, 4) DEFAULT 0.00,
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (user_id, trading_mode)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Primary lookup indexes
CREATE INDEX IF NOT EXISTS idx_user_trading_modes_user_id ON user_trading_modes(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_mode_history_user_id ON user_trading_mode_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_mode_history_changed_at ON user_trading_mode_history(changed_at);
CREATE INDEX IF NOT EXISTS idx_demo_wallet_history_user_id ON user_demo_wallet_history(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_wallet_history_created_at ON user_demo_wallet_history(created_at);
CREATE INDEX IF NOT EXISTS idx_trading_preferences_user_mode ON user_trading_preferences(user_id, trading_mode);
CREATE INDEX IF NOT EXISTS idx_demo_trades_user_id ON demo_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_demo_trades_status ON demo_trades(status);
CREATE INDEX IF NOT EXISTS idx_demo_trades_symbol ON demo_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_demo_trades_opened_at ON demo_trades(opened_at);
CREATE INDEX IF NOT EXISTS idx_trading_stats_user_mode ON user_trading_stats(user_id, trading_mode);

-- =============================================================================
-- DEFAULT DATA INSERTION
-- =============================================================================

-- Insert default trading modes for existing users
INSERT OR IGNORE INTO user_trading_modes (user_id, trading_mode, demo_balance)
SELECT id, 'demo', 10000.00 FROM users;

-- Insert default trading preferences for existing users
INSERT OR IGNORE INTO user_trading_preferences (
  user_id, trading_mode, leverage_enabled, max_leverage, 
  default_order_type, default_position_size, auto_tp_percentage, 
  auto_sl_percentage, notifications_enabled, risk_warnings_enabled
)
SELECT 
  id, 'demo', false, 1.00, 
  'market', 100.00, 10.00, 
  5.00, true, true 
FROM users;

INSERT OR IGNORE INTO user_trading_preferences (
  user_id, trading_mode, leverage_enabled, max_leverage, 
  default_order_type, default_position_size, auto_tp_percentage, 
  auto_sl_percentage, notifications_enabled, risk_warnings_enabled
)
SELECT 
  id, 'live', false, 1.00, 
  'limit', 50.00, 8.00, 
  3.00, true, true 
FROM users;

-- Initialize trading stats for existing users
INSERT OR IGNORE INTO user_trading_stats (user_id, trading_mode)
SELECT id, 'demo' FROM users;

INSERT OR IGNORE INTO user_trading_stats (user_id, trading_mode)
SELECT id, 'live' FROM users;

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- Trigger to update trading mode timestamp
CREATE TRIGGER IF NOT EXISTS update_trading_mode_timestamp
AFTER UPDATE ON user_trading_modes
FOR EACH ROW
BEGIN
  UPDATE user_trading_modes 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- Trigger to update trading preferences timestamp
CREATE TRIGGER IF NOT EXISTS update_trading_preferences_timestamp
AFTER UPDATE ON user_trading_preferences
FOR EACH ROW
BEGIN
  UPDATE user_trading_preferences 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- Trigger to update demo trades timestamp
CREATE TRIGGER IF NOT EXISTS update_demo_trades_timestamp
AFTER UPDATE ON demo_trades
FOR EACH ROW
BEGIN
  UPDATE demo_trades 
  SET updated_at = CURRENT_TIMESTAMP 
  WHERE id = NEW.id;
END;

-- Trigger to automatically update trading stats when demo trade is closed
CREATE TRIGGER IF NOT EXISTS update_stats_on_demo_trade_close
AFTER UPDATE OF status ON demo_trades
FOR EACH ROW
WHEN NEW.status = 'closed' AND OLD.status != 'closed'
BEGIN
  -- Update trading statistics
  INSERT OR REPLACE INTO user_trading_stats (
    user_id, trading_mode, total_trades, winning_trades, losing_trades,
    total_pnl, best_trade, worst_trade, last_updated
  )
  SELECT 
    NEW.user_id, 
    'demo',
    COUNT(*),
    SUM(CASE WHEN pnl > 0 THEN 1 ELSE 0 END),
    SUM(CASE WHEN pnl < 0 THEN 1 ELSE 0 END),
    SUM(pnl),
    MAX(pnl),
    MIN(pnl),
    CURRENT_TIMESTAMP
  FROM demo_trades 
  WHERE user_id = NEW.user_id AND status = 'closed';
END;