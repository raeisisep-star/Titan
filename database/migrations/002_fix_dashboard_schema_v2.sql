-- Migration: Fix Dashboard Schema v2
-- Date: 2025-10-19
-- Purpose: Add missing columns and optimize for dashboard queries (corrected)

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
CREATE INDEX IF NOT EXISTS idx_trades_user_executed ON trades(user_id, executed_at DESC);
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

-- Create view for dashboard trading summary (using actual column names)
CREATE OR REPLACE VIEW v_dashboard_trading AS
SELECT 
    user_id,
    COUNT(*) FILTER (WHERE status IN ('pending', 'open')) as active_trades,
    COUNT(*) FILTER (WHERE executed_at::date = CURRENT_DATE) as today_trades,
    COUNT(*) FILTER (WHERE status = 'completed') as total_completed,
    SUM(total_value) FILTER (WHERE executed_at::date = CURRENT_DATE) as today_value,
    SUM(total_value) FILTER (WHERE executed_at >= NOW() - INTERVAL '24 hours') as volume_24h
FROM trades
GROUP BY user_id;

-- Create view for AI agents summary (using actual columns from trading_strategies)
CREATE OR REPLACE VIEW v_dashboard_ai_agents AS
SELECT 
    id,
    user_id,
    name,
    description,
    strategy_type,
    is_active,
    parameters,
    created_at,
    updated_at,
    CASE 
        WHEN is_active THEN 'active'
        ELSE 'paused'
    END as status
FROM trading_strategies;

-- Create view for recent activities
CREATE OR REPLACE VIEW v_dashboard_recent_activities AS
SELECT 
    t.id,
    t.user_id,
    'trade' as activity_type,
    t.symbol as description,
    t.side,
    t.quantity,
    t.price,
    t.total_value as amount,
    t.executed_at as timestamp,
    t.strategy as agent
FROM trades t
WHERE t.executed_at >= NOW() - INTERVAL '7 days'
ORDER BY t.executed_at DESC
LIMIT 20;

COMMENT ON VIEW v_dashboard_portfolio IS 'Aggregated portfolio data for dashboard display';
COMMENT ON VIEW v_dashboard_trading IS 'Trading activity summary for dashboard';
COMMENT ON VIEW v_dashboard_ai_agents IS 'AI trading agents status from strategies';
COMMENT ON VIEW v_dashboard_recent_activities IS 'Recent trading activities for activity feed';
