-- =============================================================================
-- TITAN Trading System - Complete Database Schema
-- =============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================================
-- 1. USERS & AUTHENTICATION
-- =============================================================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    country VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    
    -- Account status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verification_token VARCHAR(255),
    
    -- Security
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_login_ip INET,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Indexes
    CONSTRAINT users_username_length CHECK (length(username) >= 3),
    CONSTRAINT users_password_length CHECK (length(password_hash) >= 60)
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 2. TRADING ACCOUNTS & PROFILES
-- =============================================================================

CREATE TABLE trading_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_name VARCHAR(100) NOT NULL,
    account_type VARCHAR(50) NOT NULL, -- 'demo', 'live', 'paper'
    broker VARCHAR(100),
    api_key_encrypted TEXT,
    api_secret_encrypted TEXT,
    
    -- Account settings
    leverage INTEGER DEFAULT 1,
    max_daily_loss DECIMAL(15,2),
    max_position_size DECIMAL(15,2),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_connected BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 3. MARKETS & INSTRUMENTS
-- =============================================================================

CREATE TABLE markets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol VARCHAR(20) UNIQUE NOT NULL, -- 'BTCUSDT', 'EURUSD', etc.
    base_currency VARCHAR(10) NOT NULL,
    quote_currency VARCHAR(10) NOT NULL,
    market_type VARCHAR(20) NOT NULL, -- 'crypto', 'forex', 'stocks', 'commodities'
    exchange VARCHAR(50),
    
    -- Trading info
    min_quantity DECIMAL(20,8) DEFAULT 0.00000001,
    max_quantity DECIMAL(20,8),
    step_size DECIMAL(20,8) DEFAULT 0.00000001,
    tick_size DECIMAL(20,8) DEFAULT 0.00000001,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_trading_enabled BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 4. REAL-TIME MARKET DATA
-- =============================================================================

CREATE TABLE market_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    
    -- Price data
    price DECIMAL(20,8) NOT NULL,
    bid DECIMAL(20,8),
    ask DECIMAL(20,8),
    volume_24h DECIMAL(20,8),
    change_24h DECIMAL(10,4),
    change_percent_24h DECIMAL(8,4),
    
    -- Technical indicators
    rsi_14 DECIMAL(8,4),
    sma_20 DECIMAL(20,8),
    sma_50 DECIMAL(20,8),
    ema_12 DECIMAL(20,8),
    ema_26 DECIMAL(20,8),
    macd DECIMAL(20,8),
    
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Partitioning by date for performance
    CONSTRAINT market_data_timestamp_check CHECK (timestamp >= '2024-01-01'::timestamp)
);

-- Create partitions for market data (monthly partitions)
CREATE TABLE market_data_2024_09 PARTITION OF market_data
    FOR VALUES FROM ('2024-09-01') TO ('2024-10-01');

-- =============================================================================
-- 5. PORTFOLIOS & POSITIONS
-- =============================================================================

CREATE TABLE portfolios (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    account_id UUID REFERENCES trading_accounts(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    
    -- Portfolio metrics
    total_balance DECIMAL(20,8) DEFAULT 0,
    available_balance DECIMAL(20,8) DEFAULT 0,
    locked_balance DECIMAL(20,8) DEFAULT 0,
    total_pnl DECIMAL(20,8) DEFAULT 0,
    daily_pnl DECIMAL(20,8) DEFAULT 0,
    
    -- Risk management
    max_drawdown_percent DECIMAL(8,4) DEFAULT 10.0,
    risk_per_trade_percent DECIMAL(8,4) DEFAULT 1.0,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    
    -- Position details
    side VARCHAR(10) NOT NULL, -- 'long', 'short'
    quantity DECIMAL(20,8) NOT NULL,
    entry_price DECIMAL(20,8) NOT NULL,
    current_price DECIMAL(20,8),
    
    -- P&L
    unrealized_pnl DECIMAL(20,8) DEFAULT 0,
    realized_pnl DECIMAL(20,8) DEFAULT 0,
    
    -- Risk management
    stop_loss DECIMAL(20,8),
    take_profit DECIMAL(20,8),
    
    -- Status
    status VARCHAR(20) DEFAULT 'open', -- 'open', 'closed', 'pending'
    
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 6. ORDERS & TRADES
-- =============================================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    
    -- Order details
    order_type VARCHAR(20) NOT NULL, -- 'market', 'limit', 'stop', 'stop_limit'
    side VARCHAR(10) NOT NULL, -- 'buy', 'sell'
    quantity DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8),
    stop_price DECIMAL(20,8),
    
    -- Execution
    filled_quantity DECIMAL(20,8) DEFAULT 0,
    average_price DECIMAL(20,8),
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'filled', 'cancelled', 'rejected'
    
    -- External references
    exchange_order_id VARCHAR(100),
    client_order_id VARCHAR(100),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    filled_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    
    -- Trade details
    side VARCHAR(10) NOT NULL, -- 'buy', 'sell'
    quantity DECIMAL(20,8) NOT NULL,
    price DECIMAL(20,8) NOT NULL,
    commission DECIMAL(20,8) DEFAULT 0,
    commission_currency VARCHAR(10),
    
    -- External references
    exchange_trade_id VARCHAR(100),
    
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 7. TRADING STRATEGIES & BOTS
-- =============================================================================

CREATE TABLE strategies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    
    -- Strategy configuration
    strategy_type VARCHAR(50) NOT NULL, -- 'grid', 'dca', 'arbitrage', 'custom'
    config JSONB NOT NULL, -- Strategy-specific parameters
    
    -- Performance
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    total_pnl DECIMAL(20,8) DEFAULT 0,
    max_drawdown DECIMAL(20,8) DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT false,
    is_backtested BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE strategy_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    strategy_id UUID REFERENCES strategies(id) ON DELETE CASCADE,
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Execution details
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'paused', 'stopped', 'error'
    error_message TEXT,
    
    -- Performance tracking
    trades_count INTEGER DEFAULT 0,
    current_pnl DECIMAL(20,8) DEFAULT 0,
    
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    stopped_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 8. NOTIFICATIONS & ALERTS
-- =============================================================================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification details
    type VARCHAR(50) NOT NULL, -- 'trade', 'price_alert', 'system', 'security'
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    -- Metadata
    data JSONB,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    market_id UUID REFERENCES markets(id) ON DELETE CASCADE,
    
    -- Alert conditions
    condition_type VARCHAR(20) NOT NULL, -- 'above', 'below', 'change_percent'
    target_price DECIMAL(20,8),
    change_percent DECIMAL(8,4),
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    is_triggered BOOLEAN DEFAULT false,
    triggered_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 9. SYSTEM LOGS & AUDIT
-- =============================================================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Action details
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    
    -- Request details
    ip_address INET,
    user_agent TEXT,
    
    -- Data
    old_data JSONB,
    new_data JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Log details
    level VARCHAR(20) NOT NULL, -- 'debug', 'info', 'warn', 'error', 'fatal'
    service VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    
    -- Metadata
    data JSONB,
    stack_trace TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- 10. PERFORMANCE & ANALYTICS
-- =============================================================================

CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    portfolio_id UUID REFERENCES portfolios(id) ON DELETE CASCADE,
    
    -- Snapshot data
    total_balance DECIMAL(20,8),
    total_pnl DECIMAL(20,8),
    daily_pnl DECIMAL(20,8),
    positions_count INTEGER,
    
    -- Performance metrics
    sharpe_ratio DECIMAL(8,4),
    max_drawdown DECIMAL(8,4),
    win_rate DECIMAL(8,4),
    
    snapshot_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Users & Authentication
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);

-- Markets & Data
CREATE INDEX idx_markets_symbol ON markets(symbol);
CREATE INDEX idx_market_data_market_timestamp ON market_data(market_id, timestamp DESC);
CREATE INDEX idx_market_data_timestamp ON market_data(timestamp DESC);

-- Trading
CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_positions_portfolio_id ON positions(portfolio_id);
CREATE INDEX idx_positions_status ON positions(status);
CREATE INDEX idx_orders_portfolio_id ON orders(portfolio_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_trades_order_id ON trades(order_id);

-- Notifications
CREATE INDEX idx_notifications_user_id_created ON notifications(user_id, created_at DESC);
CREATE INDEX idx_price_alerts_market_active ON price_alerts(market_id, is_active);

-- Logs
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_system_logs_level_created ON system_logs(level, created_at DESC);

-- =============================================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================================

-- Update timestamp function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trading_accounts_updated_at BEFORE UPDATE ON trading_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_markets_updated_at BEFORE UPDATE ON markets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_positions_updated_at BEFORE UPDATE ON positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON strategies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategy_executions_updated_at BEFORE UPDATE ON strategy_executions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- INITIAL DATA
-- =============================================================================

-- Insert popular markets
INSERT INTO markets (symbol, base_currency, quote_currency, market_type, exchange) VALUES
    ('BTCUSDT', 'BTC', 'USDT', 'crypto', 'binance'),
    ('ETHUSDT', 'ETH', 'USDT', 'crypto', 'binance'),
    ('ADAUSDT', 'ADA', 'USDT', 'crypto', 'binance'),
    ('DOTUSDT', 'DOT', 'USDT', 'crypto', 'binance'),
    ('LINKUSDT', 'LINK', 'USDT', 'crypto', 'binance'),
    ('EURUSD', 'EUR', 'USD', 'forex', 'forex'),
    ('GBPUSD', 'GBP', 'USD', 'forex', 'forex'),
    ('USDJPY', 'USD', 'JPY', 'forex', 'forex'),
    ('XAUUSD', 'XAU', 'USD', 'commodities', 'forex'),
    ('AAPL', 'AAPL', 'USD', 'stocks', 'nasdaq');

-- Insert system notification types
INSERT INTO notifications (user_id, type, title, message, priority) VALUES
    (NULL, 'system', 'Welcome to TITAN Trading', 'Your trading system is now ready!', 'normal');