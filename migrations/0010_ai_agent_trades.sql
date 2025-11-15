-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 0010: AI Agent Trades and Performance History
-- Date: 2025-11-15
-- Purpose: Create tables for tracking individual AI agent trades and performance
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- AI Agent Trades Table
-- Tracks individual trades executed by AI agents
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_agent_trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(agent_id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Trade Details
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    quantity NUMERIC(20,8) NOT NULL,
    entry_price NUMERIC(20,8) NOT NULL,
    exit_price NUMERIC(20,8),
    
    -- Status
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'cancelled', 'failed')),
    
    -- Financial Metrics
    entry_value NUMERIC(20,2) NOT NULL,
    exit_value NUMERIC(20,2),
    profit_loss NUMERIC(20,2),
    profit_loss_percent NUMERIC(10,4),
    fees NUMERIC(20,2) DEFAULT 0,
    
    -- AI Decision Context
    decision_id UUID REFERENCES ai_decisions(id),
    confidence FLOAT,
    reasoning TEXT,
    strategy VARCHAR(100),
    
    -- Execution Details
    exchange VARCHAR(50),
    order_id VARCHAR(100),
    execution_time_ms INTEGER,
    
    -- Timestamps
    opened_at TIMESTAMPTZ DEFAULT NOW(),
    closed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_trades_agent_id ON ai_agent_trades(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_trades_user_id ON ai_agent_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_trades_symbol ON ai_agent_trades(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_agent_trades_status ON ai_agent_trades(status);
CREATE INDEX IF NOT EXISTS idx_ai_agent_trades_opened_at ON ai_agent_trades(opened_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agent_trades_decision_id ON ai_agent_trades(decision_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- AI Agent Performance History Table
-- Stores time-series performance metrics for agents
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_agent_performance_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL REFERENCES ai_agents(agent_id) ON DELETE CASCADE,
    
    -- Time Period
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    period_type VARCHAR(20) DEFAULT 'hourly' CHECK (period_type IN ('hourly', 'daily', 'weekly', 'monthly')),
    
    -- Performance Metrics
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate NUMERIC(10,4) DEFAULT 0,
    
    -- Financial Metrics
    total_profit_loss NUMERIC(20,2) DEFAULT 0,
    avg_profit_per_trade NUMERIC(20,2) DEFAULT 0,
    max_profit NUMERIC(20,2) DEFAULT 0,
    max_loss NUMERIC(20,2) DEFAULT 0,
    
    -- Risk Metrics
    sharpe_ratio NUMERIC(10,4),
    max_drawdown NUMERIC(10,4),
    volatility NUMERIC(10,4),
    
    -- Accuracy Metrics
    accuracy NUMERIC(10,4) DEFAULT 0,
    avg_confidence NUMERIC(10,4),
    
    -- Volume
    total_volume NUMERIC(20,2) DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Metadata
    metadata JSONB DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS idx_ai_agent_perf_agent_id ON ai_agent_performance_history(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agent_perf_period_start ON ai_agent_performance_history(period_start DESC);
CREATE INDEX IF NOT EXISTS idx_ai_agent_perf_period_type ON ai_agent_performance_history(period_type);
CREATE UNIQUE INDEX IF NOT EXISTS idx_ai_agent_perf_unique ON ai_agent_performance_history(agent_id, period_start, period_type);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- Seed Sample Data for Testing
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Insert sample trades for agent_01 (Technical Analysis Expert)
INSERT INTO ai_agent_trades (
    agent_id, symbol, side, quantity, entry_price, exit_price, 
    status, entry_value, exit_value, profit_loss, profit_loss_percent,
    confidence, reasoning, strategy, opened_at, closed_at
) VALUES
-- Successful trades
('agent_01', 'BTC/USDT', 'buy', 0.5, 45000, 47000, 'closed', 22500, 23500, 1000, 4.44, 0.85, 'RSI oversold, MACD bullish crossover', 'Technical Breakout', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
('agent_01', 'ETH/USDT', 'buy', 10, 2800, 2950, 'closed', 28000, 29500, 1500, 5.36, 0.92, 'Strong support level, volume increasing', 'Support Bounce', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),
('agent_01', 'BNB/USDT', 'buy', 50, 320, 340, 'closed', 16000, 17000, 1000, 6.25, 0.88, 'Ascending triangle pattern', 'Pattern Trading', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),

-- Failed trade
('agent_01', 'SOL/USDT', 'buy', 100, 95, 92, 'closed', 9500, 9200, -300, -3.16, 0.75, 'False breakout signal', 'Breakout Failed', NOW() - INTERVAL '1 day', NOW() - INTERVAL '12 hours'),

-- Open trade
('agent_01', 'ADA/USDT', 'buy', 5000, 0.45, NULL, 'open', 2250, NULL, NULL, NULL, 0.82, 'Bullish divergence on 4H chart', 'Divergence Play', NOW() - INTERVAL '6 hours', NULL)

ON CONFLICT DO NOTHING;

-- Insert sample trades for agent_02 (Risk Management Specialist)
INSERT INTO ai_agent_trades (
    agent_id, symbol, side, quantity, entry_price, exit_price,
    status, entry_value, exit_value, profit_loss, profit_loss_percent,
    confidence, reasoning, strategy, opened_at, closed_at
) VALUES
('agent_02', 'BTC/USDT', 'buy', 0.3, 46000, 46500, 'closed', 13800, 13950, 150, 1.09, 0.95, 'Low risk entry, tight stop loss', 'Conservative Entry', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days'),
('agent_02', 'ETH/USDT', 'buy', 5, 2900, 2950, 'closed', 14500, 14750, 250, 1.72, 0.90, 'Risk-reward ratio 1:3', 'Risk Management', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day')

ON CONFLICT DO NOTHING;

-- Insert sample trades for agent_03 (Sentiment Analysis Agent)
INSERT INTO ai_agent_trades (
    agent_id, symbol, side, quantity, entry_price, exit_price,
    status, entry_value, exit_value, profit_loss, profit_loss_percent,
    confidence, reasoning, strategy, opened_at, closed_at
) VALUES
('agent_03', 'BTC/USDT', 'buy', 0.4, 45500, 48000, 'closed', 18200, 19200, 1000, 5.49, 0.88, 'Positive social media sentiment surge', 'Sentiment Trading', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days'),
('agent_03', 'DOGE/USDT', 'buy', 10000, 0.08, 0.082, 'closed', 800, 820, 20, 2.50, 0.78, 'Twitter trending, positive news', 'Social Trend', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days')

ON CONFLICT DO NOTHING;

-- Insert performance history for agent_01 (last 7 days)
INSERT INTO ai_agent_performance_history (
    agent_id, period_start, period_end, period_type,
    total_trades, winning_trades, losing_trades, win_rate,
    total_profit_loss, avg_profit_per_trade, max_profit, max_loss,
    accuracy, avg_confidence
) VALUES
('agent_01', NOW() - INTERVAL '7 days', NOW() - INTERVAL '6 days', 'daily', 3, 2, 1, 66.67, 800, 266.67, 1200, -400, 75.5, 0.85),
('agent_01', NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days', 'daily', 5, 4, 1, 80.00, 2500, 500, 1500, -300, 82.3, 0.88),
('agent_01', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 'daily', 4, 3, 1, 75.00, 1800, 450, 1000, -200, 78.9, 0.86),
('agent_01', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', 'daily', 2, 2, 0, 100.00, 1200, 600, 800, 0, 92.1, 0.91),
('agent_01', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days', 'daily', 6, 4, 2, 66.67, 1500, 250, 1500, -500, 74.2, 0.83),
('agent_01', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 'daily', 4, 3, 1, 75.00, 2000, 500, 1000, -300, 81.5, 0.87),
('agent_01', NOW() - INTERVAL '1 day', NOW(), 'daily', 3, 2, 1, 66.67, 700, 233.33, 1000, -300, 73.8, 0.82)

ON CONFLICT (agent_id, period_start, period_type) DO NOTHING;

COMMIT;

SELECT 'Migration 0010 completed successfully!' as status;
SELECT 'AI Agent Trades: ' || COUNT(*) FROM ai_agent_trades;
SELECT 'Performance History Records: ' || COUNT(*) FROM ai_agent_performance_history;
