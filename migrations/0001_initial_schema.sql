-- ============================================================================
-- 🏛️ TITAN Trading System - Initial Database Schema Migration
-- 
-- Comprehensive database schema for TITAN Trading System featuring:
-- - User Management & Authentication
-- - Trading Strategies & Backtests
-- - Market Data & Price History
-- - Portfolio & Risk Management
-- - Performance Analytics
-- - AI Models & Predictions
-- - Notifications & Alerts
-- - System Configuration
-- ============================================================================

-- Foreign keys are enabled by default in D1

-- ============================================================================
-- 👤 USER MANAGEMENT TABLES
-- ============================================================================

-- Users table for authentication and profile management
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    
    -- Profile information
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'USD',
    
    -- Account status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    
    -- Security and preferences
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    api_access_enabled BOOLEAN DEFAULT FALSE,
    risk_tolerance TEXT CHECK(risk_tolerance IN ('conservative', 'moderate', 'aggressive')) DEFAULT 'moderate',
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login_at DATETIME,
    email_verified_at DATETIME
);

-- User sessions for authentication
CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT UNIQUE NOT NULL,
    device_info TEXT,
    ip_address TEXT,
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- API keys for programmatic access
CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    key_name TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    permissions TEXT DEFAULT '["read"]', -- JSON array of permissions
    rate_limit INTEGER DEFAULT 1000, -- requests per hour
    is_active BOOLEAN DEFAULT TRUE,
    expires_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME
);

-- ============================================================================
-- 📈 TRADING STRATEGY TABLES
-- ============================================================================

-- Trading strategies definition
CREATE TABLE IF NOT EXISTS strategies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    strategy_type TEXT NOT NULL CHECK(strategy_type IN ('trend_following', 'mean_reversion', 'momentum', 'arbitrage', 'scalping', 'swing', 'custom')),
    
    -- Strategy configuration
    parameters TEXT, -- JSON object with strategy parameters
    timeframe TEXT NOT NULL CHECK(timeframe IN ('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w')),
    symbols TEXT NOT NULL, -- JSON array of trading symbols
    
    -- Risk management
    max_position_size DECIMAL(10,4) DEFAULT 0.1, -- Maximum position size as percentage
    stop_loss_pct DECIMAL(5,2) DEFAULT 2.0,
    take_profit_pct DECIMAL(5,2) DEFAULT 6.0,
    max_daily_trades INTEGER DEFAULT 10,
    
    -- Strategy status
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'active', 'paused', 'archived')),
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Performance tracking
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    total_pnl DECIMAL(15,8) DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    sharpe_ratio DECIMAL(8,4) DEFAULT 0,
    max_drawdown DECIMAL(5,2) DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_traded_at DATETIME
);

-- Strategy versions for change tracking
CREATE TABLE IF NOT EXISTS strategy_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_id INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    parameters TEXT NOT NULL, -- JSON snapshot of parameters
    change_description TEXT,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Backtesting results
CREATE TABLE IF NOT EXISTS backtests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_id INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    
    -- Backtest configuration
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    initial_capital DECIMAL(15,8) DEFAULT 10000,
    commission DECIMAL(8,6) DEFAULT 0.001,
    slippage DECIMAL(8,6) DEFAULT 0.0005,
    
    -- Performance metrics
    total_return DECIMAL(10,4) DEFAULT 0,
    annualized_return DECIMAL(10,4) DEFAULT 0,
    volatility DECIMAL(8,4) DEFAULT 0,
    sharpe_ratio DECIMAL(8,4) DEFAULT 0,
    sortino_ratio DECIMAL(8,4) DEFAULT 0,
    calmar_ratio DECIMAL(8,4) DEFAULT 0,
    max_drawdown DECIMAL(8,4) DEFAULT 0,
    var_95 DECIMAL(8,4) DEFAULT 0,
    cvar_95 DECIMAL(8,4) DEFAULT 0,
    
    -- Trade statistics
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    profit_factor DECIMAL(8,4) DEFAULT 0,
    avg_win DECIMAL(10,6) DEFAULT 0,
    avg_loss DECIMAL(10,6) DEFAULT 0,
    largest_win DECIMAL(10,6) DEFAULT 0,
    largest_loss DECIMAL(10,6) DEFAULT 0,
    
    -- Execution info
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    progress DECIMAL(5,2) DEFAULT 0,
    error_message TEXT,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME,
    completed_at DATETIME
);

-- Individual backtest trades
CREATE TABLE IF NOT EXISTS backtest_trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    backtest_id INTEGER NOT NULL REFERENCES backtests(id) ON DELETE CASCADE,
    
    -- Trade details
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK(side IN ('buy', 'sell')),
    quantity DECIMAL(15,8) NOT NULL,
    entry_price DECIMAL(15,8) NOT NULL,
    exit_price DECIMAL(15,8),
    
    -- Timing
    entry_time DATETIME NOT NULL,
    exit_time DATETIME,
    duration_minutes INTEGER,
    
    -- P&L calculation
    gross_pnl DECIMAL(15,8) DEFAULT 0,
    commission_paid DECIMAL(15,8) DEFAULT 0,
    slippage_cost DECIMAL(15,8) DEFAULT 0,
    net_pnl DECIMAL(15,8) DEFAULT 0,
    pnl_percentage DECIMAL(8,4) DEFAULT 0,
    
    -- Trade metadata
    strategy_signal TEXT, -- Original strategy signal that triggered trade
    exit_reason TEXT CHECK(exit_reason IN ('take_profit', 'stop_loss', 'signal_exit', 'timeout', 'manual')),
    confidence DECIMAL(3,2) DEFAULT 0, -- Signal confidence 0-1
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 💹 MARKET DATA TABLES
-- ============================================================================

-- Supported trading symbols
CREATE TABLE IF NOT EXISTS symbols (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT UNIQUE NOT NULL,
    base_asset TEXT NOT NULL,
    quote_asset TEXT NOT NULL,
    exchange TEXT NOT NULL,
    
    -- Symbol properties
    symbol_type TEXT NOT NULL CHECK(symbol_type IN ('spot', 'futures', 'options', 'index')),
    is_active BOOLEAN DEFAULT TRUE,
    min_quantity DECIMAL(15,8) DEFAULT 0.00000001,
    max_quantity DECIMAL(15,8) DEFAULT 999999999,
    tick_size DECIMAL(15,8) DEFAULT 0.00000001,
    
    -- Market info
    market_cap DECIMAL(20,8),
    volume_24h DECIMAL(20,8),
    price_change_24h DECIMAL(10,6),
    
    -- Metadata
    description TEXT,
    website_url TEXT,
    logo_url TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- OHLCV price data
CREATE TABLE IF NOT EXISTS price_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    timeframe TEXT NOT NULL CHECK(timeframe IN ('1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M')),
    
    -- OHLCV data
    timestamp DATETIME NOT NULL,
    open_price DECIMAL(15,8) NOT NULL,
    high_price DECIMAL(15,8) NOT NULL,
    low_price DECIMAL(15,8) NOT NULL,
    close_price DECIMAL(15,8) NOT NULL,
    volume DECIMAL(20,8) NOT NULL DEFAULT 0,
    
    -- Additional metrics
    trades_count INTEGER DEFAULT 0,
    taker_buy_volume DECIMAL(20,8) DEFAULT 0,
    quote_volume DECIMAL(20,8) DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint to prevent duplicates
    UNIQUE(symbol, timeframe, timestamp)
);

-- Real-time market data
CREATE TABLE IF NOT EXISTS market_tickers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT UNIQUE NOT NULL,
    
    -- Current prices
    last_price DECIMAL(15,8) NOT NULL,
    bid_price DECIMAL(15,8),
    ask_price DECIMAL(15,8),
    
    -- 24h statistics
    high_24h DECIMAL(15,8),
    low_24h DECIMAL(15,8),
    volume_24h DECIMAL(20,8),
    change_24h DECIMAL(10,6),
    change_pct_24h DECIMAL(8,4),
    
    -- Order book depth
    bid_qty DECIMAL(20,8),
    ask_qty DECIMAL(20,8),
    
    -- Update tracking
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 💼 PORTFOLIO & POSITIONS TABLES
-- ============================================================================

-- User portfolios
CREATE TABLE IF NOT EXISTS portfolios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    
    -- Portfolio configuration
    base_currency TEXT DEFAULT 'USD',
    initial_value DECIMAL(15,8) DEFAULT 0,
    current_value DECIMAL(15,8) DEFAULT 0,
    
    -- Performance tracking
    total_return DECIMAL(10,4) DEFAULT 0,
    daily_return DECIMAL(10,4) DEFAULT 0,
    unrealized_pnl DECIMAL(15,8) DEFAULT 0,
    realized_pnl DECIMAL(15,8) DEFAULT 0,
    
    -- Risk metrics
    portfolio_beta DECIMAL(8,4) DEFAULT 1.0,
    sharpe_ratio DECIMAL(8,4) DEFAULT 0,
    sortino_ratio DECIMAL(8,4) DEFAULT 0,
    max_drawdown DECIMAL(8,4) DEFAULT 0,
    var_95 DECIMAL(8,4) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_paper_trading BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Current positions
CREATE TABLE IF NOT EXISTS positions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    
    -- Position details
    side TEXT NOT NULL CHECK(side IN ('long', 'short')),
    quantity DECIMAL(15,8) NOT NULL,
    avg_entry_price DECIMAL(15,8) NOT NULL,
    current_price DECIMAL(15,8),
    
    -- P&L tracking
    unrealized_pnl DECIMAL(15,8) DEFAULT 0,
    unrealized_pnl_pct DECIMAL(8,4) DEFAULT 0,
    realized_pnl DECIMAL(15,8) DEFAULT 0,
    
    -- Risk management
    stop_loss_price DECIMAL(15,8),
    take_profit_price DECIMAL(15,8),
    
    -- Position metadata
    opened_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one position per symbol per portfolio
    UNIQUE(portfolio_id, symbol)
);

-- Trade execution history
CREATE TABLE IF NOT EXISTS trades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    portfolio_id INTEGER REFERENCES portfolios(id) ON DELETE SET NULL,
    strategy_id INTEGER REFERENCES strategies(id) ON DELETE SET NULL,
    
    -- Trade identification
    trade_id TEXT UNIQUE, -- Exchange trade ID
    order_id TEXT, -- Related order ID
    
    -- Trade details
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK(side IN ('buy', 'sell')),
    quantity DECIMAL(15,8) NOT NULL,
    price DECIMAL(15,8) NOT NULL,
    
    -- Costs and fees
    commission DECIMAL(15,8) DEFAULT 0,
    fee DECIMAL(15,8) DEFAULT 0,
    fee_asset TEXT DEFAULT 'USD',
    
    -- Trade metadata
    trade_type TEXT CHECK(trade_type IN ('market', 'limit', 'stop', 'stop_limit')) DEFAULT 'market',
    time_in_force TEXT CHECK(time_in_force IN ('GTC', 'IOC', 'FOK')) DEFAULT 'GTC',
    
    -- P&L (for closing trades)
    pnl DECIMAL(15,8) DEFAULT 0,
    pnl_pct DECIMAL(8,4) DEFAULT 0,
    
    -- Execution details
    executed_at DATETIME NOT NULL,
    is_maker BOOLEAN DEFAULT FALSE,
    
    -- Status tracking
    status TEXT DEFAULT 'filled' CHECK(status IN ('filled', 'partially_filled', 'cancelled', 'rejected')),
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 🧠 AI & ANALYTICS TABLES
-- ============================================================================

-- AI model definitions
CREATE TABLE IF NOT EXISTS ai_models (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    model_type TEXT NOT NULL CHECK(model_type IN ('strategy_validation', 'market_prediction', 'risk_assessment', 'sentiment_analysis')),
    version TEXT NOT NULL,
    
    -- Model configuration
    parameters TEXT, -- JSON configuration
    input_features TEXT, -- JSON array of features
    output_format TEXT, -- JSON schema of outputs
    
    -- Performance metrics
    accuracy DECIMAL(5,4) DEFAULT 0,
    precision DECIMAL(5,4) DEFAULT 0,
    recall DECIMAL(5,4) DEFAULT 0,
    f1_score DECIMAL(5,4) DEFAULT 0,
    
    -- Training info
    training_data_size INTEGER DEFAULT 0,
    training_start_date DATE,
    training_end_date DATE,
    last_trained_at DATETIME,
    
    -- Status
    status TEXT DEFAULT 'training' CHECK(status IN ('training', 'active', 'deprecated', 'failed')),
    is_production BOOLEAN DEFAULT FALSE,
    
    -- Metadata
    description TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI predictions and analysis results
CREATE TABLE IF NOT EXISTS ai_predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    model_id INTEGER NOT NULL REFERENCES ai_models(id) ON DELETE CASCADE,
    
    -- Prediction target
    symbol TEXT,
    timeframe TEXT,
    prediction_type TEXT NOT NULL CHECK(prediction_type IN ('price', 'direction', 'volatility', 'signal', 'risk')),
    
    -- Prediction data
    input_data TEXT NOT NULL, -- JSON input features
    prediction_value DECIMAL(15,8),
    confidence DECIMAL(5,4) DEFAULT 0,
    probability_distribution TEXT, -- JSON for multi-class predictions
    
    -- Timing
    prediction_for_timestamp DATETIME NOT NULL,
    valid_until DATETIME,
    
    -- Validation (if actual outcome known)
    actual_value DECIMAL(15,8),
    prediction_error DECIMAL(10,6),
    is_correct BOOLEAN,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance analytics snapshots
CREATE TABLE IF NOT EXISTS performance_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Snapshot metadata
    snapshot_type TEXT NOT NULL CHECK(snapshot_type IN ('daily', 'weekly', 'monthly', 'custom')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Performance metrics
    start_value DECIMAL(15,8) NOT NULL,
    end_value DECIMAL(15,8) NOT NULL,
    total_return DECIMAL(10,4) NOT NULL,
    benchmark_return DECIMAL(10,4) DEFAULT 0,
    alpha DECIMAL(8,4) DEFAULT 0,
    beta DECIMAL(8,4) DEFAULT 1.0,
    
    -- Risk metrics
    volatility DECIMAL(8,4) DEFAULT 0,
    sharpe_ratio DECIMAL(8,4) DEFAULT 0,
    sortino_ratio DECIMAL(8,4) DEFAULT 0,
    max_drawdown DECIMAL(8,4) DEFAULT 0,
    var_95 DECIMAL(8,4) DEFAULT 0,
    cvar_95 DECIMAL(8,4) DEFAULT 0,
    
    -- Trading metrics
    trades_count INTEGER DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    profit_factor DECIMAL(8,4) DEFAULT 0,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 🔔 NOTIFICATIONS & ALERTS TABLES
-- ============================================================================

-- Alert definitions
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    
    -- Alert configuration
    alert_type TEXT NOT NULL CHECK(alert_type IN ('price', 'indicator', 'strategy_signal', 'pnl', 'risk', 'news')),
    symbol TEXT,
    condition_type TEXT NOT NULL CHECK(condition_type IN ('above', 'below', 'crosses_above', 'crosses_below', 'equals', 'change_pct')),
    threshold_value DECIMAL(15,8) NOT NULL,
    
    -- Notification settings
    notification_channels TEXT DEFAULT '["web"]', -- JSON array: web, email, sms, webhook
    webhook_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Trigger limits
    max_triggers INTEGER DEFAULT 0, -- 0 = unlimited
    triggers_count INTEGER DEFAULT 0,
    cooldown_minutes INTEGER DEFAULT 0,
    last_triggered_at DATETIME,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alert notifications log
CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    alert_id INTEGER REFERENCES alerts(id) ON DELETE SET NULL,
    
    -- Notification details
    type TEXT NOT NULL CHECK(type IN ('alert', 'system', 'trade', 'update')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Delivery
    channel TEXT NOT NULL CHECK(channel IN ('web', 'email', 'sms', 'push', 'webhook')),
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'sent', 'delivered', 'failed')),
    
    -- Metadata
    metadata TEXT, -- JSON with additional data
    priority TEXT DEFAULT 'normal' CHECK(priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Read status
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    
    -- Delivery tracking
    sent_at DATETIME,
    delivered_at DATETIME,
    failed_reason TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- ⚙️ SYSTEM CONFIGURATION TABLES
-- ============================================================================

-- System settings and configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    data_type TEXT CHECK(data_type IN ('string', 'integer', 'float', 'boolean', 'json')) DEFAULT 'string',
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    updated_by INTEGER REFERENCES users(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Application audit log
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action details
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    
    -- Change tracking
    old_values TEXT, -- JSON
    new_values TEXT, -- JSON
    
    -- Request context
    ip_address TEXT,
    user_agent TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Data synchronization status
CREATE TABLE IF NOT EXISTS sync_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    data_source TEXT NOT NULL,
    last_sync_at DATETIME,
    status TEXT CHECK(status IN ('success', 'error', 'in_progress')) DEFAULT 'success',
    error_message TEXT,
    records_processed INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 🏪 EXCHANGE INTEGRATION TABLES
-- ============================================================================

-- Exchange configurations for each user
CREATE TABLE IF NOT EXISTS exchange_configurations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exchange_name TEXT NOT NULL CHECK(exchange_name IN ('binance', 'coinbase', 'kraken')),
    is_enabled BOOLEAN DEFAULT FALSE,
    priority INTEGER DEFAULT 1,
    configuration TEXT NOT NULL, -- JSON string containing credentials and settings
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, exchange_name)
);

-- Trade history from exchanges
CREATE TABLE IF NOT EXISTS trade_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exchange_name TEXT NOT NULL,
    trade_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    side TEXT NOT NULL CHECK(side IN ('buy', 'sell')),
    amount REAL NOT NULL,
    price REAL NOT NULL,
    total_value REAL NOT NULL,
    fee REAL DEFAULT 0,
    fee_currency TEXT DEFAULT 'USDT',
    status TEXT DEFAULT 'completed' CHECK(status IN ('pending', 'completed', 'failed', 'cancelled')),
    executed_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(trade_id, exchange_name)
);

-- Order history from exchanges
CREATE TABLE IF NOT EXISTS order_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exchange_name TEXT NOT NULL,
    order_id TEXT NOT NULL,
    symbol TEXT NOT NULL,
    type TEXT NOT NULL,
    side TEXT NOT NULL CHECK(side IN ('buy', 'sell')),
    amount REAL NOT NULL,
    price REAL NOT NULL,
    filled_amount REAL DEFAULT 0,
    remaining_amount REAL DEFAULT 0,
    status TEXT NOT NULL,
    time_in_force TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    executed_at DATETIME,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(order_id, exchange_name)
);

-- Balance history snapshots
CREATE TABLE IF NOT EXISTS balance_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exchange_name TEXT NOT NULL,
    asset TEXT NOT NULL,
    free_balance REAL NOT NULL,
    locked_balance REAL NOT NULL,
    total_balance REAL NOT NULL,
    usd_value REAL,
    snapshot_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Portfolio value snapshots
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    total_value_usd REAL NOT NULL,
    total_btc_value REAL,
    exchange_distribution TEXT NOT NULL, -- JSON string
    asset_distribution TEXT NOT NULL,    -- JSON string
    snapshot_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Exchange connection status and health monitoring
CREATE TABLE IF NOT EXISTS exchange_status (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    exchange_name TEXT NOT NULL,
    is_connected BOOLEAN DEFAULT FALSE,
    last_ping_at DATETIME,
    last_error TEXT,
    error_count INTEGER DEFAULT 0,
    api_calls_made INTEGER DEFAULT 0,
    api_calls_remaining INTEGER,
    reset_time DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, exchange_name)
);

-- Arbitrage opportunities tracking
CREATE TABLE IF NOT EXISTS arbitrage_opportunities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL,
    buy_exchange TEXT NOT NULL,
    sell_exchange TEXT NOT NULL,
    buy_price REAL NOT NULL,
    sell_price REAL NOT NULL,
    spread REAL NOT NULL,
    spread_percentage REAL NOT NULL,
    max_volume REAL NOT NULL,
    estimated_profit REAL NOT NULL,
    detected_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 📊 INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- User and authentication indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Strategy and backtest indexes
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_strategies_status ON strategies(status);
CREATE INDEX IF NOT EXISTS idx_strategies_type ON strategies(strategy_type);
CREATE INDEX IF NOT EXISTS idx_backtests_strategy_id ON backtests(strategy_id);
CREATE INDEX IF NOT EXISTS idx_backtests_status ON backtests(status);
CREATE INDEX IF NOT EXISTS idx_backtest_trades_backtest_id ON backtest_trades(backtest_id);
CREATE INDEX IF NOT EXISTS idx_backtest_trades_symbol ON backtest_trades(symbol);

-- Market data indexes
CREATE INDEX IF NOT EXISTS idx_symbols_symbol ON symbols(symbol);
CREATE INDEX IF NOT EXISTS idx_symbols_exchange ON symbols(exchange);
CREATE INDEX IF NOT EXISTS idx_price_data_symbol_timeframe ON price_data(symbol, timeframe);
CREATE INDEX IF NOT EXISTS idx_price_data_timestamp ON price_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_market_tickers_symbol ON market_tickers(symbol);

-- Portfolio and trading indexes
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_positions_portfolio_id ON positions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_positions_symbol ON positions(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_portfolio_id ON trades(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON trades(executed_at);

-- AI and analytics indexes
CREATE INDEX IF NOT EXISTS idx_ai_models_type ON ai_models(model_type);
CREATE INDEX IF NOT EXISTS idx_ai_models_status ON ai_models(status);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_model_id ON ai_predictions(model_id);
CREATE INDEX IF NOT EXISTS idx_ai_predictions_symbol ON ai_predictions(symbol);
CREATE INDEX IF NOT EXISTS idx_performance_snapshots_portfolio_id ON performance_snapshots(portfolio_id);

-- Notification indexes
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_status ON notifications(status);

-- System indexes
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);

-- Exchange integration indexes
CREATE INDEX IF NOT EXISTS idx_exchange_configurations_user_id ON exchange_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_configurations_exchange ON exchange_configurations(exchange_name);
CREATE INDEX IF NOT EXISTS idx_trade_history_user_id ON trade_history(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_history_exchange ON trade_history(exchange_name);
CREATE INDEX IF NOT EXISTS idx_trade_history_symbol ON trade_history(symbol);
CREATE INDEX IF NOT EXISTS idx_trade_history_executed_at ON trade_history(executed_at);
CREATE INDEX IF NOT EXISTS idx_order_history_user_id ON order_history(user_id);
CREATE INDEX IF NOT EXISTS idx_order_history_exchange ON order_history(exchange_name);
CREATE INDEX IF NOT EXISTS idx_order_history_symbol ON order_history(symbol);
CREATE INDEX IF NOT EXISTS idx_order_history_status ON order_history(status);
CREATE INDEX IF NOT EXISTS idx_balance_history_user_id ON balance_history(user_id);
CREATE INDEX IF NOT EXISTS idx_balance_history_exchange ON balance_history(exchange_name);
CREATE INDEX IF NOT EXISTS idx_balance_history_asset ON balance_history(asset);
CREATE INDEX IF NOT EXISTS idx_balance_history_snapshot_at ON balance_history(snapshot_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_user_id ON portfolio_snapshots(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_snapshot_at ON portfolio_snapshots(snapshot_at);
CREATE INDEX IF NOT EXISTS idx_exchange_status_user_id ON exchange_status(user_id);
CREATE INDEX IF NOT EXISTS idx_exchange_status_exchange ON exchange_status(exchange_name);
CREATE INDEX IF NOT EXISTS idx_arbitrage_symbol ON arbitrage_opportunities(symbol);
CREATE INDEX IF NOT EXISTS idx_arbitrage_detected_at ON arbitrage_opportunities(detected_at);