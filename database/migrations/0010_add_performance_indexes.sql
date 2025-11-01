-- =============================================================================
-- Migration: 0010_add_performance_indexes.sql
-- Description: Add missing performance indexes based on database maintenance audit
-- Date: 2024-11-01
-- Phase: 4 - Database Finalization
-- =============================================================================

-- Purpose: These indexes improve query performance for frequently accessed queries
-- Based on: docs/DATABASE_MAINTENANCE_PLAN.md recommendations

BEGIN;

-- =============================================================================
-- HIGH PRIORITY INDEXES
-- =============================================================================

-- 1. Orders by creation date (DESC for recent orders)
-- Used by: Dashboard recent orders, order history pagination
CREATE INDEX IF NOT EXISTS idx_orders_created_at 
ON orders(created_at DESC);

-- 2. Trades by execution date (DESC for recent trades)
-- Used by: Trade history, performance analytics, dashboard
-- Note: Using executed_at as trades table uses this instead of created_at
CREATE INDEX IF NOT EXISTS idx_trades_executed_at 
ON trades(executed_at DESC);

-- 3. Price alerts by user_id
-- Used by: Fetching all alerts for a user, alert management
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id 
ON price_alerts(user_id);

-- 4. Unread notifications composite index
-- Used by: Fetching unread notifications (very frequent query)
-- Partial index (WHERE clause) reduces index size
CREATE INDEX IF NOT EXISTS idx_notifications_unread 
ON notifications(user_id, is_read) 
WHERE is_read = false;

-- 5. Positions by portfolio and status
-- Used by: Portfolio management, open positions display
CREATE INDEX IF NOT EXISTS idx_positions_portfolio_status 
ON positions(portfolio_id, status);

-- =============================================================================
-- MEDIUM PRIORITY INDEXES
-- =============================================================================

-- 6. Audit logs by user and timestamp
-- Used by: User activity tracking, security audits
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp 
ON audit_logs(user_id, created_at DESC);

-- 7. System logs by level and timestamp
-- Used by: Error monitoring, log analysis
-- Note: Using 'level' column (not 'log_level')
CREATE INDEX IF NOT EXISTS idx_system_logs_level_timestamp 
ON system_logs(level, created_at DESC);

-- 8. User sessions by user and expiry
-- Used by: Session validation, cleanup jobs
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_expires 
ON user_sessions(user_id, expires_at) 
WHERE is_active = true;

-- 9. Orders by market_id (for market-specific queries)
-- Used by: Market-specific order history
-- Note: Orders table uses market_id foreign key reference
CREATE INDEX IF NOT EXISTS idx_orders_market_id 
ON orders(market_id);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check that all indexes were created successfully
DO $$
DECLARE
    idx_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO idx_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND indexname LIKE 'idx_%'
    AND indexname IN (
        'idx_orders_created_at',
        'idx_trades_executed_at',
        'idx_price_alerts_user_id',
        'idx_notifications_unread',
        'idx_positions_portfolio_status',
        'idx_audit_logs_user_timestamp',
        'idx_system_logs_level_timestamp',
        'idx_user_sessions_user_expires',
        'idx_orders_market_id'
    );
    
    IF idx_count < 9 THEN
        RAISE EXCEPTION 'Migration 0010 failed: Expected 9 indexes, found %', idx_count;
    END IF;
    
    RAISE NOTICE 'Migration 0010 completed successfully: % indexes created', idx_count;
END $$;

COMMIT;

-- =============================================================================
-- ROLLBACK INSTRUCTIONS
-- =============================================================================
-- To rollback this migration, run:
-- DROP INDEX IF EXISTS idx_orders_created_at;
-- DROP INDEX IF EXISTS idx_trades_executed_at;
-- DROP INDEX IF EXISTS idx_price_alerts_user_id;
-- DROP INDEX IF EXISTS idx_notifications_unread;
-- DROP INDEX IF EXISTS idx_positions_portfolio_status;
-- DROP INDEX IF EXISTS idx_audit_logs_user_timestamp;
-- DROP INDEX IF EXISTS idx_system_logs_level_timestamp;
-- DROP INDEX IF EXISTS idx_user_sessions_user_expires;
-- DROP INDEX IF EXISTS idx_orders_market_id;
-- =============================================================================

-- EXPECTED IMPACT:
-- - Orders queries: 30-50% faster
-- - Trades queries: 30-50% faster
-- - Notifications queries: 50-70% faster (unread only)
-- - Alert queries: 40-60% faster
-- - Position queries: 20-30% faster
-- - Disk space: ~10-20 MB (varies with data size)
-- =============================================================================
