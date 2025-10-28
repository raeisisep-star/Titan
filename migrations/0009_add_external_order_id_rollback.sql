-- Migration 0009 ROLLBACK: Remove external_order_id columns
-- Purpose: Rollback exchange integration changes
-- Author: TITAN Trading System
-- Date: 2025-10-28

-- =============================================================================
-- WARNING: This will remove exchange integration columns
-- =============================================================================

-- Drop indexes
DROP INDEX IF EXISTS idx_orders_external_order_id CASCADE;
DROP INDEX IF EXISTS idx_orders_exchange CASCADE;

-- Drop columns
ALTER TABLE orders DROP COLUMN IF EXISTS external_order_id CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS exchange CASCADE;
ALTER TABLE orders DROP COLUMN IF EXISTS last_synced_at CASCADE;
