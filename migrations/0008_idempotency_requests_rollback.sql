-- Migration 0008 ROLLBACK: Idempotency Requests Table
-- Purpose: Remove idempotency_requests table and related objects
-- Author: TITAN Trading System
-- Date: 2025-10-27

-- =============================================================================
-- WARNING: This will permanently delete the idempotency_requests table
-- and all stored idempotency records. This action cannot be undone.
-- =============================================================================

-- Drop the cleanup function first
DROP FUNCTION IF EXISTS cleanup_expired_idempotency_requests() CASCADE;

-- Drop indexes (will be automatically dropped with table, but explicit for clarity)
DROP INDEX IF EXISTS idx_idempotency_key CASCADE;
DROP INDEX IF EXISTS idx_idempotency_user_id CASCADE;
DROP INDEX IF EXISTS idx_idempotency_expires_at CASCADE;
DROP INDEX IF EXISTS idx_idempotency_user_endpoint CASCADE;

-- Drop the main table
DROP TABLE IF EXISTS idempotency_requests CASCADE;

-- Verification query (should return no rows after rollback)
-- SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'idempotency_requests';
