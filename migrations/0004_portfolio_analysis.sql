-- =============================================================================
-- 📊 PORTFOLIO ANALYSIS SYSTEM - Database Schema (D1 Compatible)
-- Migration: 0004_portfolio_analysis.sql
-- Uses existing portfolios table and adds analysis-specific tables
-- =============================================================================

-- Portfolio Holdings - Current positions in each portfolio  
CREATE TABLE IF NOT EXISTS portfolio_holdings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0.00,
    average_buy_price REAL NOT NULL DEFAULT 0.00,
    total_invested REAL NOT NULL DEFAULT 0.00,
    current_price REAL DEFAULT 0.00,
    market_value REAL DEFAULT 0.00,
    unrealized_pnl REAL DEFAULT 0.00,
    first_purchase_date DATETIME,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint per portfolio and symbol
    UNIQUE(portfolio_id, symbol)
);

-- Portfolio Snapshots - Historical portfolio value over time
CREATE TABLE IF NOT EXISTS portfolio_snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL,
    snapshot_date DATE NOT NULL,
    total_value_usd REAL NOT NULL,
    total_invested REAL NOT NULL,
    unrealized_pnl REAL NOT NULL,
    realized_pnl REAL NOT NULL,
    cash_balance REAL DEFAULT 0.00,
    asset_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint per portfolio per day
    UNIQUE(portfolio_id, snapshot_date)
);

-- Portfolio Transactions - All buy/sell transactions
CREATE TABLE IF NOT EXISTS portfolio_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL,
    symbol TEXT NOT NULL,
    transaction_type TEXT NOT NULL, -- 'buy', 'sell'
    quantity REAL NOT NULL,
    price_per_unit REAL NOT NULL,
    total_amount REAL NOT NULL,
    fee_amount REAL DEFAULT 0.00,
    executed_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio Analytics - Advanced analytics and metrics
CREATE TABLE IF NOT EXISTS portfolio_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    portfolio_id INTEGER NOT NULL,
    analysis_date DATE NOT NULL,
    
    -- Performance Metrics
    daily_return REAL DEFAULT 0.00,
    weekly_return REAL DEFAULT 0.00,
    monthly_return REAL DEFAULT 0.00,
    yearly_return REAL DEFAULT 0.00,
    total_return REAL DEFAULT 0.00,
    
    -- Risk Metrics
    volatility REAL DEFAULT 0.00,
    max_drawdown REAL DEFAULT 0.00,
    sharpe_ratio REAL DEFAULT 0.00,
    
    -- Diversification Metrics
    asset_concentration REAL DEFAULT 0.00, -- Percentage of top asset
    portfolio_balance_score REAL DEFAULT 0.00, -- 0-10 balance score
    
    -- Performance vs Market
    btc_correlation REAL DEFAULT 0.00,
    market_beta REAL DEFAULT 0.00,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint per portfolio per day
    UNIQUE(portfolio_id, analysis_date)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Portfolio holdings indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_id ON portfolio_holdings(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_symbol ON portfolio_holdings(symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_holdings_portfolio_symbol ON portfolio_holdings(portfolio_id, symbol);

-- Portfolio snapshots indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_portfolio_id ON portfolio_snapshots(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_date ON portfolio_snapshots(snapshot_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_snapshots_portfolio_date ON portfolio_snapshots(portfolio_id, snapshot_date DESC);

-- Portfolio transactions indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_portfolio_id ON portfolio_transactions(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_symbol ON portfolio_transactions(symbol);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_type ON portfolio_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_executed_at ON portfolio_transactions(executed_at DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_transactions_portfolio_symbol ON portfolio_transactions(portfolio_id, symbol);

-- Portfolio analytics indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_id ON portfolio_analytics(portfolio_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_date ON portfolio_analytics(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_portfolio_date ON portfolio_analytics(portfolio_id, analysis_date DESC);

-- =============================================================================
-- SAMPLE DATA FOR DEVELOPMENT (uses existing portfolios table)
-- =============================================================================

-- Insert sample holdings for existing portfolios
INSERT INTO portfolio_holdings (portfolio_id, symbol, quantity, average_buy_price, total_invested, current_price, market_value, first_purchase_date)
SELECT p.id, 'BTC', 0.25, 40000.00, 10000.00, 50000.00, 12500.00, datetime('now', '-30 days')
FROM portfolios p 
WHERE p.user_id = 1 
AND NOT EXISTS (SELECT 1 FROM portfolio_holdings h WHERE h.portfolio_id = p.id AND h.symbol = 'BTC')
LIMIT 1;

INSERT INTO portfolio_holdings (portfolio_id, symbol, quantity, average_buy_price, total_invested, current_price, market_value, first_purchase_date)
SELECT p.id, 'ETH', 2.0, 2500.00, 5000.00, 3000.00, 6000.00, datetime('now', '-25 days')
FROM portfolios p 
WHERE p.user_id = 1 
AND NOT EXISTS (SELECT 1 FROM portfolio_holdings h WHERE h.portfolio_id = p.id AND h.symbol = 'ETH')
LIMIT 1;

INSERT INTO portfolio_holdings (portfolio_id, symbol, quantity, average_buy_price, total_invested, current_price, market_value, first_purchase_date)
SELECT p.id, 'ADA', 1000.0, 0.50, 500.00, 0.60, 600.00, datetime('now', '-20 days')
FROM portfolios p 
WHERE p.user_id = 1 
AND NOT EXISTS (SELECT 1 FROM portfolio_holdings h WHERE h.portfolio_id = p.id AND h.symbol = 'ADA')
LIMIT 1;

-- Insert sample transactions
INSERT INTO portfolio_transactions (portfolio_id, symbol, transaction_type, quantity, price_per_unit, total_amount, executed_at)
SELECT p.id, 'BTC', 'buy', 0.25, 40000.00, 10000.00, datetime('now', '-30 days')
FROM portfolios p WHERE p.user_id = 1 LIMIT 1;

INSERT INTO portfolio_transactions (portfolio_id, symbol, transaction_type, quantity, price_per_unit, total_amount, executed_at)
SELECT p.id, 'ETH', 'buy', 2.0, 2500.00, 5000.00, datetime('now', '-25 days')
FROM portfolios p WHERE p.user_id = 1 LIMIT 1;

INSERT INTO portfolio_transactions (portfolio_id, symbol, transaction_type, quantity, price_per_unit, total_amount, executed_at)
SELECT p.id, 'ADA', 'buy', 1000.0, 0.50, 500.00, datetime('now', '-20 days')
FROM portfolios p WHERE p.user_id = 1 LIMIT 1;