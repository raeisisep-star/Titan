-- Migration 0009: Add external_order_id to orders table
-- Purpose: Store exchange-side order IDs for reconciliation
-- Author: TITAN Trading System
-- Date: 2025-10-28

-- =============================================================================
-- ALTER TABLE: orders
-- =============================================================================
-- Add external_order_id column to track exchange-side order IDs

ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS external_order_id VARCHAR(255);

-- Add index for efficient lookups by external_order_id
CREATE INDEX IF NOT EXISTS idx_orders_external_order_id 
ON orders(external_order_id);

-- Add column for exchange name (paper, mexc, etc.)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS exchange VARCHAR(50) DEFAULT 'paper';

-- Add index for filtering by exchange
CREATE INDEX IF NOT EXISTS idx_orders_exchange 
ON orders(exchange);

-- Add column for last sync timestamp (for reconciliation)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS last_synced_at TIMESTAMP WITH TIME ZONE;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON COLUMN orders.external_order_id IS 'Order ID from exchange side (for reconciliation)';
COMMENT ON COLUMN orders.exchange IS 'Exchange name where order was placed';
COMMENT ON COLUMN orders.last_synced_at IS 'Last time order status was synced with exchange';

-- =============================================================================
-- SAMPLE QUERIES
-- =============================================================================

-- Find orders that need reconciliation (not synced in last 5 minutes)
-- SELECT id, external_order_id, status, last_synced_at 
-- FROM orders 
-- WHERE external_order_id IS NOT NULL 
--   AND (last_synced_at IS NULL OR last_synced_at < NOW() - INTERVAL '5 minutes')
--   AND status NOT IN ('filled', 'cancelled', 'rejected');
