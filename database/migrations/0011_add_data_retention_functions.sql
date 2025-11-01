-- =============================================================================
-- Migration: 0011_add_data_retention_functions.sql
-- Description: Add data retention and cleanup functions
-- Date: 2024-11-01
-- Phase: 4 - Database Finalization
-- =============================================================================

-- Purpose: Automate data cleanup based on retention policies
-- Retention Policies:
--   - audit_logs: 90 days
--   - system_logs: 30 days (INFO/DEBUG), 180 days (WARN/ERROR)
--   - notifications: 60 days (read only), keep unread
--   - user_sessions: cleanup expired sessions
--
-- Based on: docs/DATABASE_MAINTENANCE_PLAN.md

BEGIN;

-- =============================================================================
-- 1. AUDIT LOGS CLEANUP (90 days retention)
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_audit_logs()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
    retention_days INTEGER := 90;
    rows_deleted BIGINT;
BEGIN
    DELETE FROM audit_logs
    WHERE created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % audit log records older than % days', rows_deleted, retention_days;
    
    RETURN QUERY SELECT rows_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_audit_logs() IS 
'Deletes audit logs older than 90 days. Should be run daily via cron job.';

-- =============================================================================
-- 2. SYSTEM LOGS CLEANUP (Tiered retention)
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_system_logs()
RETURNS TABLE(
    info_deleted BIGINT,
    warn_deleted BIGINT,
    total_deleted BIGINT
) AS $$
DECLARE
    info_retention_days INTEGER := 30;   -- INFO and DEBUG
    warn_retention_days INTEGER := 180;  -- WARN, ERROR, FATAL
    info_rows BIGINT;
    warn_rows BIGINT;
    total_rows BIGINT;
BEGIN
    -- Delete INFO and DEBUG logs older than 30 days
    DELETE FROM system_logs
    WHERE created_at < NOW() - INTERVAL '1 day' * info_retention_days
    AND level IN ('INFO', 'DEBUG');
    
    GET DIAGNOSTICS info_rows = ROW_COUNT;
    
    -- Delete WARN and ERROR logs older than 180 days
    DELETE FROM system_logs
    WHERE created_at < NOW() - INTERVAL '1 day' * warn_retention_days
    AND level IN ('WARN', 'ERROR', 'FATAL');
    
    GET DIAGNOSTICS warn_rows = ROW_COUNT;
    
    total_rows := info_rows + warn_rows;
    
    RAISE NOTICE 'Deleted % INFO/DEBUG logs (>% days), % WARN/ERROR logs (>% days)', 
        info_rows, info_retention_days, warn_rows, warn_retention_days;
    
    RETURN QUERY SELECT info_rows, warn_rows, total_rows;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_system_logs() IS 
'Deletes system logs with tiered retention: INFO/DEBUG (30 days), WARN/ERROR (180 days).';

-- =============================================================================
-- 3. NOTIFICATIONS CLEANUP (60 days for read, keep unread)
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_notifications()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
    retention_days INTEGER := 60;
    rows_deleted BIGINT;
BEGIN
    -- Only delete READ notifications older than 60 days
    -- Keep all unread notifications indefinitely
    DELETE FROM notifications
    WHERE is_read = true
    AND created_at < NOW() - INTERVAL '1 day' * retention_days;
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % read notifications older than % days', rows_deleted, retention_days;
    
    RETURN QUERY SELECT rows_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_notifications() IS 
'Deletes read notifications older than 60 days. Unread notifications are kept indefinitely.';

-- =============================================================================
-- 4. USER SESSIONS CLEANUP (Expired sessions)
-- =============================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
    rows_deleted BIGINT;
BEGIN
    -- Delete expired sessions
    DELETE FROM user_sessions
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;
    
    -- Also mark inactive sessions as inactive (for audit trail)
    UPDATE user_sessions
    SET is_active = false
    WHERE expires_at < NOW() 
    AND is_active = true;
    
    RAISE NOTICE 'Deleted % expired sessions', rows_deleted;
    
    RETURN QUERY SELECT rows_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION cleanup_expired_sessions() IS 
'Deletes expired user sessions immediately. Should be run daily.';

-- =============================================================================
-- 5. COMPREHENSIVE CLEANUP FUNCTION (Run all cleanups)
-- =============================================================================

CREATE OR REPLACE FUNCTION run_all_cleanups()
RETURNS TABLE(
    cleanup_type VARCHAR(50),
    records_deleted BIGINT,
    execution_time INTERVAL
) AS $$
DECLARE
    start_time TIMESTAMP;
    end_time TIMESTAMP;
    audit_deleted BIGINT;
    info_deleted BIGINT;
    warn_deleted BIGINT;
    logs_deleted BIGINT;
    notif_deleted BIGINT;
    session_deleted BIGINT;
BEGIN
    RAISE NOTICE 'Starting comprehensive data cleanup...';
    
    -- Audit Logs
    start_time := clock_timestamp();
    SELECT deleted_count INTO audit_deleted FROM cleanup_audit_logs();
    end_time := clock_timestamp();
    RETURN QUERY SELECT 'audit_logs'::VARCHAR(50), audit_deleted, end_time - start_time;
    
    -- System Logs
    start_time := clock_timestamp();
    SELECT total_deleted INTO logs_deleted FROM cleanup_system_logs();
    end_time := clock_timestamp();
    RETURN QUERY SELECT 'system_logs'::VARCHAR(50), logs_deleted, end_time - start_time;
    
    -- Notifications
    start_time := clock_timestamp();
    SELECT deleted_count INTO notif_deleted FROM cleanup_notifications();
    end_time := clock_timestamp();
    RETURN QUERY SELECT 'notifications'::VARCHAR(50), notif_deleted, end_time - start_time;
    
    -- User Sessions
    start_time := clock_timestamp();
    SELECT deleted_count INTO session_deleted FROM cleanup_expired_sessions();
    end_time := clock_timestamp();
    RETURN QUERY SELECT 'user_sessions'::VARCHAR(50), session_deleted, end_time - start_time;
    
    RAISE NOTICE 'Cleanup completed: Audit=%, Logs=%, Notifications=%, Sessions=%', 
        audit_deleted, logs_deleted, notif_deleted, session_deleted;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION run_all_cleanups() IS 
'Runs all cleanup functions and returns summary. Recommended for daily cron job.';

-- =============================================================================
-- 6. CLEANUP STATISTICS VIEW
-- =============================================================================

CREATE OR REPLACE VIEW cleanup_statistics AS
SELECT 
    'audit_logs' AS table_name,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '90 days') AS records_to_cleanup,
    pg_size_pretty(pg_total_relation_size('audit_logs')) AS table_size
FROM audit_logs
UNION ALL
SELECT 
    'system_logs' AS table_name,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (
        WHERE (created_at < NOW() - INTERVAL '30 days' AND level IN ('INFO', 'DEBUG'))
           OR (created_at < NOW() - INTERVAL '180 days' AND level IN ('WARN', 'ERROR', 'FATAL'))
    ) AS records_to_cleanup,
    pg_size_pretty(pg_total_relation_size('system_logs')) AS table_size
FROM system_logs
UNION ALL
SELECT 
    'notifications' AS table_name,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE is_read = true AND created_at < NOW() - INTERVAL '60 days') AS records_to_cleanup,
    pg_size_pretty(pg_total_relation_size('notifications')) AS table_size
FROM notifications
UNION ALL
SELECT 
    'user_sessions' AS table_name,
    COUNT(*) AS total_records,
    COUNT(*) FILTER (WHERE expires_at < NOW()) AS records_to_cleanup,
    pg_size_pretty(pg_total_relation_size('user_sessions')) AS table_size
FROM user_sessions;

COMMENT ON VIEW cleanup_statistics IS 
'Shows current cleanup statistics for all tables with retention policies.';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

DO $$
DECLARE
    func_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO func_count
    FROM pg_proc
    WHERE proname IN (
        'cleanup_audit_logs',
        'cleanup_system_logs',
        'cleanup_notifications',
        'cleanup_expired_sessions',
        'run_all_cleanups'
    );
    
    IF func_count < 5 THEN
        RAISE EXCEPTION 'Migration 0011 failed: Expected 5 functions, found %', func_count;
    END IF;
    
    RAISE NOTICE 'Migration 0011 completed successfully: % cleanup functions created', func_count;
    RAISE NOTICE 'View cleanup_statistics created successfully';
END $$;

COMMIT;

-- =============================================================================
-- USAGE EXAMPLES
-- =============================================================================

-- Run individual cleanup:
-- SELECT * FROM cleanup_audit_logs();
-- SELECT * FROM cleanup_system_logs();
-- SELECT * FROM cleanup_notifications();
-- SELECT * FROM cleanup_expired_sessions();

-- Run all cleanups at once:
-- SELECT * FROM run_all_cleanups();

-- Check cleanup statistics before running:
-- SELECT * FROM cleanup_statistics;

-- =============================================================================
-- CRON JOB SETUP (Add to crontab)
-- =============================================================================

-- Daily cleanup at 2:00 AM:
-- 0 2 * * * psql $DATABASE_URL -c "SELECT run_all_cleanups();" >> /home/ubuntu/logs/db-cleanup.log 2>&1

-- Weekly statistics report (Sunday 8:00 AM):
-- 0 8 * * 0 psql $DATABASE_URL -c "SELECT * FROM cleanup_statistics;" >> /home/ubuntu/logs/db-stats.log 2>&1

-- =============================================================================
-- ROLLBACK INSTRUCTIONS
-- =============================================================================
-- DROP FUNCTION IF EXISTS cleanup_audit_logs();
-- DROP FUNCTION IF EXISTS cleanup_system_logs();
-- DROP FUNCTION IF EXISTS cleanup_notifications();
-- DROP FUNCTION IF EXISTS cleanup_expired_sessions();
-- DROP FUNCTION IF EXISTS run_all_cleanups();
-- DROP VIEW IF EXISTS cleanup_statistics;
-- =============================================================================
