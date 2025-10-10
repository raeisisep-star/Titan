-- Manual Trading System Database Schema
-- Version: 1.0.0
-- Created: 2024-10-10
-- Purpose: Complete manual trading system with positions, orders, and performance tracking

-- ==========================================
-- TRADING ORDERS TABLE
-- ==========================================
-- Stores all trading orders (both real and simulated)
CREATE TABLE IF NOT EXISTS trading_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,                    -- e.g., 'BTC/USDT'
    side TEXT NOT NULL CHECK (side IN ('buy', 'sell')),
    type TEXT NOT NULL CHECK (type IN ('market', 'limit', 'stop', 'stop_limit')),
    quantity REAL NOT NULL,                  -- Quantity of base asset
    quantity_usd REAL,                       -- USD value of the order
    price REAL,                              -- Limit price (for limit orders)
    stop_price REAL,                         -- Stop price (for stop orders)
    executed_price REAL,                     -- Actual execution price
    executed_quantity REAL,                  -- Actual executed quantity
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'partially_filled', 'cancelled', 'rejected')),
    exchange_order_id TEXT,                  -- Order ID from exchange
    is_real_order BOOLEAN DEFAULT 0,         -- 1 if executed on real exchange, 0 if simulated
    fees REAL DEFAULT 0,                     -- Trading fees paid
    commission REAL DEFAULT 0,               -- Commission paid
    error_message TEXT,                      -- Error message if order failed
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    executed_at DATETIME,
    cancelled_at DATETIME
);

-- ==========================================
-- TRADING POSITIONS TABLE
-- ==========================================
-- Stores active and closed trading positions
CREATE TABLE IF NOT EXISTS trading_positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,                    -- e.g., 'BTC/USDT'
    side TEXT NOT NULL CHECK (side IN ('long', 'short', 'buy', 'sell')),
    entry_price REAL NOT NULL,               -- Average entry price
    quantity REAL NOT NULL,                  -- Position size
    current_price REAL,                      -- Current market price
    unrealized_pnl REAL DEFAULT 0,          -- Unrealized P&L in USD
    realized_pnl REAL DEFAULT 0,             -- Realized P&L when closed
    stop_loss REAL,                          -- Stop loss price
    take_profit REAL,                        -- Take profit price
    margin_used REAL DEFAULT 0,              -- Margin used (for leveraged positions)
    leverage REAL DEFAULT 1,                 -- Position leverage
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'liquidated')),
    entry_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    exit_time DATETIME,
    exit_price REAL,                         -- Price at which position was closed
    
    -- Risk management fields
    max_drawdown REAL DEFAULT 0,             -- Maximum drawdown experienced
    max_profit REAL DEFAULT 0,               -- Maximum profit reached
    
    -- Metadata
    notes TEXT,                              -- User notes about the position
    strategy_id INTEGER                      -- Reference to trading strategy
);

-- ==========================================
-- MANUAL TRADING SESSIONS TABLE
-- ==========================================
-- Tracks manual trading sessions for analytics
CREATE TABLE IF NOT EXISTS manual_trading_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_name TEXT,                       -- User-defined session name
    start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_time DATETIME,
    total_trades INTEGER DEFAULT 0,          -- Number of trades in this session
    winning_trades INTEGER DEFAULT 0,        -- Number of profitable trades
    total_pnl REAL DEFAULT 0,               -- Total P&L for the session
    max_drawdown REAL DEFAULT 0,            -- Maximum drawdown in session
    starting_balance REAL,                   -- Balance at session start
    ending_balance REAL,                     -- Balance at session end
    notes TEXT,                              -- Session notes
    is_active BOOLEAN DEFAULT 1,            -- Whether session is currently active
    
    -- Performance metrics
    win_rate REAL DEFAULT 0,                -- Win rate percentage
    avg_win REAL DEFAULT 0,                 -- Average winning trade
    avg_loss REAL DEFAULT 0,                -- Average losing trade
    profit_factor REAL DEFAULT 0,           -- Gross profit / gross loss
    sharpe_ratio REAL DEFAULT 0             -- Risk-adjusted return
);

-- ==========================================
-- TRADING PERFORMANCE METRICS TABLE
-- ==========================================
-- Stores calculated performance metrics for quick access
CREATE TABLE IF NOT EXISTS trading_performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    metric_date DATE NOT NULL,               -- Date for the metrics
    symbol TEXT,                             -- Symbol (NULL for overall metrics)
    
    -- Daily metrics
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    daily_pnl REAL DEFAULT 0,
    daily_volume REAL DEFAULT 0,
    daily_fees REAL DEFAULT 0,
    
    -- Performance ratios
    win_rate REAL DEFAULT 0,
    profit_factor REAL DEFAULT 0,
    sharpe_ratio REAL DEFAULT 0,
    max_drawdown REAL DEFAULT 0,
    
    -- Risk metrics
    var_95 REAL DEFAULT 0,                   -- Value at Risk (95%)
    volatility REAL DEFAULT 0,              -- Volatility
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicate entries
    UNIQUE(user_id, metric_date, symbol)
);

-- ==========================================
-- MARKET DATA CACHE TABLE
-- ==========================================
-- Caches market data for performance
CREATE TABLE IF NOT EXISTS market_data_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL,                 -- e.g., '1m', '5m', '1h', '1d'
    open_price REAL NOT NULL,
    high_price REAL NOT NULL,
    low_price REAL NOT NULL,
    close_price REAL NOT NULL,
    volume REAL NOT NULL,
    timestamp DATETIME NOT NULL,             -- Candle timestamp
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint for each candle
    UNIQUE(symbol, timeframe, timestamp)
);

-- ==========================================
-- TRADING SIGNALS TABLE
-- ==========================================
-- Stores AI and technical analysis signals
CREATE TABLE IF NOT EXISTS trading_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell', 'hold')),
    source TEXT NOT NULL,                    -- 'ai', 'technical', 'manual', 'news'
    strength REAL NOT NULL,                  -- Signal strength (0-100)
    confidence REAL NOT NULL,                -- Confidence level (0-100)
    price_target REAL,                       -- Target price
    stop_loss REAL,                          -- Suggested stop loss
    take_profit REAL,                        -- Suggested take profit
    timeframe TEXT,                          -- Signal timeframe
    reasoning TEXT,                          -- Why this signal was generated
    indicators_used TEXT,                    -- JSON array of indicators used
    is_active BOOLEAN DEFAULT 1,            -- Whether signal is still active
    expires_at DATETIME,                     -- When signal expires
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- USER TRADING PREFERENCES TABLE
-- ==========================================
-- Stores user preferences for manual trading
CREATE TABLE IF NOT EXISTS user_trading_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL,
    
    -- Risk management preferences
    default_risk_percent REAL DEFAULT 2.0,  -- Default risk per trade (%)
    max_daily_loss_percent REAL DEFAULT 5.0, -- Max daily loss limit (%)
    default_stop_loss_percent REAL DEFAULT 2.5, -- Default stop loss (%)
    default_take_profit_percent REAL DEFAULT 5.0, -- Default take profit (%)
    
    -- Trading preferences
    preferred_timeframes TEXT DEFAULT '["1h","4h","1d"]', -- JSON array
    favorite_symbols TEXT DEFAULT '["BTC/USDT","ETH/USDT"]', -- JSON array
    trading_style TEXT DEFAULT 'conservative', -- 'conservative', 'moderate', 'aggressive'
    
    -- UI preferences
    chart_theme TEXT DEFAULT 'dark',
    default_chart_timeframe TEXT DEFAULT '1h',
    show_advanced_indicators BOOLEAN DEFAULT 1,
    enable_sound_alerts BOOLEAN DEFAULT 1,
    enable_push_notifications BOOLEAN DEFAULT 1,
    
    -- AI assistance preferences
    enable_ai_signals BOOLEAN DEFAULT 1,
    ai_signal_min_confidence REAL DEFAULT 70.0,
    auto_apply_ai_suggestions BOOLEAN DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- EXCHANGE CONNECTIONS TABLE
-- ==========================================
-- Stores user's exchange API connections
CREATE TABLE IF NOT EXISTS exchange_connections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exchange_name TEXT NOT NULL,             -- 'mexc', 'binance', 'okx', etc.
    api_key TEXT,                           -- Encrypted API key
    api_secret TEXT,                        -- Encrypted API secret
    passphrase TEXT,                        -- For exchanges that require it
    is_active BOOLEAN DEFAULT 1,
    is_testnet BOOLEAN DEFAULT 0,           -- Whether it's testnet/sandbox
    permissions TEXT,                       -- JSON array of permissions
    last_connected DATETIME,
    connection_status TEXT DEFAULT 'disconnected', -- 'connected', 'disconnected', 'error'
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- TRADE EXECUTION LOG TABLE
-- ==========================================
-- Detailed log of all trade executions for audit trail
CREATE TABLE IF NOT EXISTS trade_execution_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_id INTEGER,                        -- Reference to trading_orders
    position_id INTEGER,                     -- Reference to trading_positions
    execution_type TEXT NOT NULL,           -- 'order_placed', 'order_filled', 'order_cancelled', 'position_opened', 'position_closed'
    symbol TEXT NOT NULL,
    details TEXT,                           -- JSON details of the execution
    exchange_response TEXT,                 -- Raw exchange response
    execution_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- CREATE INDEXES FOR PERFORMANCE
-- ==========================================

-- Trading orders indexes
CREATE INDEX IF NOT EXISTS idx_trading_orders_user_id ON trading_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_orders_symbol ON trading_orders(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_orders_status ON trading_orders(status);
CREATE INDEX IF NOT EXISTS idx_trading_orders_created_at ON trading_orders(created_at);

-- Trading positions indexes
CREATE INDEX IF NOT EXISTS idx_trading_positions_user_id ON trading_positions(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_positions_symbol ON trading_positions(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_positions_status ON trading_positions(status);
CREATE INDEX IF NOT EXISTS idx_trading_positions_entry_time ON trading_positions(entry_time);

-- Manual trading sessions indexes
CREATE INDEX IF NOT EXISTS idx_manual_trading_sessions_user_id ON manual_trading_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_manual_trading_sessions_start_time ON manual_trading_sessions(start_time);

-- Trading performance metrics indexes
CREATE INDEX IF NOT EXISTS idx_trading_performance_user_id ON trading_performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_performance_date ON trading_performance_metrics(metric_date);
CREATE INDEX IF NOT EXISTS idx_trading_performance_symbol ON trading_performance_metrics(symbol);

-- Market data cache indexes
CREATE INDEX IF NOT EXISTS idx_market_data_symbol ON market_data_cache(symbol);
CREATE INDEX IF NOT EXISTS idx_market_data_timeframe ON market_data_cache(timeframe);
CREATE INDEX IF NOT EXISTS idx_market_data_timestamp ON market_data_cache(timestamp);

-- Trading signals indexes
CREATE INDEX IF NOT EXISTS idx_trading_signals_user_id ON trading_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_signals_symbol ON trading_signals(symbol);
CREATE INDEX IF NOT EXISTS idx_trading_signals_type ON trading_signals(signal_type);
CREATE INDEX IF NOT EXISTS idx_trading_signals_active ON trading_signals(is_active);
CREATE INDEX IF NOT EXISTS idx_trading_signals_created_at ON trading_signals(created_at);

-- Exchange connections indexes
CREATE INDEX IF NOT EXISTS idx_exchange_connections_user_id ON exchange_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_connections_exchange ON exchange_connections(exchange_name);

-- Trade execution log indexes
CREATE INDEX IF NOT EXISTS idx_trade_execution_log_user_id ON trade_execution_log(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_execution_log_order_id ON trade_execution_log(order_id);
CREATE INDEX IF NOT EXISTS idx_trade_execution_log_position_id ON trade_execution_log(position_id);
CREATE INDEX IF NOT EXISTS idx_trade_execution_log_time ON trade_execution_log(execution_time);

-- ==========================================
-- INITIAL DATA INSERTS
-- ==========================================

-- Insert default trading preferences for existing users
INSERT OR IGNORE INTO user_trading_preferences (user_id) 
SELECT id FROM users WHERE id NOT IN (SELECT user_id FROM user_trading_preferences);

-- ==========================================
-- VIEWS FOR EASY ACCESS
-- ==========================================

-- View for active positions with current P&L
CREATE VIEW IF NOT EXISTS active_positions_view AS
SELECT 
    p.*,
    (p.current_price - p.entry_price) * p.quantity AS calculated_pnl,
    ((p.current_price - p.entry_price) / p.entry_price * 100) AS pnl_percent,
    julianday('now') - julianday(p.entry_time) AS days_held
FROM trading_positions p
WHERE p.status = 'open';

-- View for daily trading summary
CREATE VIEW IF NOT EXISTS daily_trading_summary AS
SELECT 
    user_id,
    DATE(created_at) as trade_date,
    COUNT(*) as total_trades,
    SUM(CASE WHEN executed_price > 0 THEN executed_quantity * executed_price ELSE 0 END) as total_volume,
    SUM(fees) as total_fees,
    COUNT(CASE WHEN side = 'buy' THEN 1 END) as buy_orders,
    COUNT(CASE WHEN side = 'sell' THEN 1 END) as sell_orders
FROM trading_orders 
WHERE status = 'filled'
GROUP BY user_id, DATE(created_at);

-- View for user performance metrics
CREATE VIEW IF NOT EXISTS user_performance_view AS
SELECT 
    p.user_id,
    COUNT(*) as total_positions,
    COUNT(CASE WHEN p.status = 'closed' AND p.realized_pnl > 0 THEN 1 END) as winning_positions,
    COUNT(CASE WHEN p.status = 'closed' AND p.realized_pnl <= 0 THEN 1 END) as losing_positions,
    ROUND(
        COUNT(CASE WHEN p.status = 'closed' AND p.realized_pnl > 0 THEN 1 END) * 100.0 / 
        NULLIF(COUNT(CASE WHEN p.status = 'closed' THEN 1 END), 0), 2
    ) as win_rate,
    SUM(p.realized_pnl) as total_realized_pnl,
    SUM(CASE WHEN p.status = 'open' THEN p.unrealized_pnl ELSE 0 END) as total_unrealized_pnl,
    AVG(CASE WHEN p.status = 'closed' AND p.realized_pnl > 0 THEN p.realized_pnl END) as avg_win,
    AVG(CASE WHEN p.status = 'closed' AND p.realized_pnl <= 0 THEN p.realized_pnl END) as avg_loss
FROM trading_positions p
GROUP BY p.user_id;

-- ==========================================
-- TRIGGERS FOR AUTOMATED CALCULATIONS
-- ==========================================

-- Trigger to update position unrealized P&L when current_price changes
CREATE TRIGGER IF NOT EXISTS update_position_pnl
AFTER UPDATE OF current_price ON trading_positions
FOR EACH ROW
BEGIN
    UPDATE trading_positions 
    SET unrealized_pnl = (NEW.current_price - NEW.entry_price) * NEW.quantity
    WHERE id = NEW.id AND status = 'open';
END;

-- Trigger to update performance metrics when positions are closed
CREATE TRIGGER IF NOT EXISTS update_performance_on_position_close
AFTER UPDATE OF status ON trading_positions
FOR EACH ROW WHEN NEW.status = 'closed' AND OLD.status = 'open'
BEGIN
    INSERT OR REPLACE INTO trading_performance_metrics (
        user_id, metric_date, symbol, 
        total_trades, winning_trades, losing_trades, daily_pnl
    )
    SELECT 
        NEW.user_id,
        DATE('now'),
        NEW.symbol,
        COALESCE(old_metrics.total_trades, 0) + 1,
        COALESCE(old_metrics.winning_trades, 0) + CASE WHEN NEW.realized_pnl > 0 THEN 1 ELSE 0 END,
        COALESCE(old_metrics.losing_trades, 0) + CASE WHEN NEW.realized_pnl <= 0 THEN 1 ELSE 0 END,
        COALESCE(old_metrics.daily_pnl, 0) + NEW.realized_pnl
    FROM (
        SELECT * FROM trading_performance_metrics 
        WHERE user_id = NEW.user_id 
        AND metric_date = DATE('now') 
        AND symbol = NEW.symbol
    ) AS old_metrics;
END;