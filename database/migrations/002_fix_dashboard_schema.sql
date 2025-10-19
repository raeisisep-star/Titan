-- Migration: Fix Dashboard Schema
-- Date: 2025-10-19
-- Purpose: Add missing columns and optimize for dashboard queries

-- Fix portfolios table - add missing total_pnl_percentage column
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS total_pnl_percentage NUMERIC(8,4) DEFAULT 0;

-- Update existing portfolios to calculate percentage
UPDATE portfolios 
SET total_pnl_percentage = CASE 
    WHEN total_balance > 0 THEN (total_pnl / total_balance) * 100 
    ELSE 0 
END;

-- Add indexes for better dashboard query performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_active ON portfolios(user_id) WHERE total_balance > 0;
CREATE INDEX IF NOT EXISTS idx_trades_user_time ON trades(user_id, entry_time DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- Create view for dashboard portfolio summary
CREATE OR REPLACE VIEW v_dashboard_portfolio AS
SELECT 
    user_id,
    SUM(total_balance) as total_balance,
    SUM(available_balance) as available_balance,
    SUM(locked_balance) as locked_balance,
    SUM(total_pnl) as total_pnl,
    AVG(total_pnl_percentage) as avg_pnl_percentage,
    SUM(daily_pnl) as daily_pnl,
    COUNT(*) as portfolio_count,
    MAX(updated_at) as last_updated
FROM portfolios
GROUP BY user_id;

-- Create view for dashboard trading summary
CREATE OR REPLACE VIEW v_dashboard_trading AS
SELECT 
    user_id,
    COUNT(*) FILTER (WHERE exit_time IS NULL) as active_trades,
    COUNT(*) FILTER (WHERE entry_time::date = CURRENT_DATE) as today_trades,
    COUNT(*) FILTER (WHERE status = 'completed' AND pnl > 0) as profitable_trades,
    COUNT(*) FILTER (WHERE status = 'completed' AND pnl <= 0) as losing_trades,
    COUNT(*) FILTER (WHERE status = 'completed') as total_completed,
    SUM(pnl) FILTER (WHERE entry_time::date = CURRENT_DATE) as today_pnl,
    SUM(ABS(entry_price * quantity)) FILTER (WHERE entry_time >= NOW() - INTERVAL '24 hours') as volume_24h
FROM trades
GROUP BY user_id;

-- Create view for AI agents summary (from trading_strategies)
CREATE OR REPLACE VIEW v_dashboard_ai_agents AS
SELECT 
    id,
    user_id,
    name,
    description,
    is_active,
    risk_level,
    target_profit,
    max_loss,
    timeframe,
    created_at,
    updated_at,
    CASE 
        WHEN is_active THEN 'active'
        ELSE 'paused'
    END as status,
    -- Placeholder performance metrics (to be calculated from actual trades)
    0.0 as performance,
    0 as trades_count,
    95.0 as uptime
FROM trading_strategies;

COMMENT ON VIEW v_dashboard_portfolio IS 'Aggregated portfolio data for dashboard display';
COMMENT ON VIEW v_dashboard_trading IS 'Trading activity summary for dashboard';
COMMENT ON VIEW v_dashboard_ai_agents IS 'AI trading agents status and performance';
