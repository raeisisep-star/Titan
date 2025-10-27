-- Migration 0007: Alter orders table for manual trading compatibility
-- Created: 2025-10-27
-- Purpose: Add user_id and symbol columns to existing orders table for Sprint 3

-- Add user_id column (nullable first, will be updated later)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add symbol column (nullable first)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS symbol VARCHAR(20);

-- Add foreign key constraint for user_id
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'orders_user_id_fkey'
    ) THEN
        ALTER TABLE orders 
        ADD CONSTRAINT orders_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- Update existing orders to derive user_id from portfolio_id (if possible)
UPDATE orders o
SET user_id = p.user_id
FROM portfolios p
WHERE o.portfolio_id = p.id 
  AND o.user_id IS NULL;

-- Update existing orders to derive symbol from market_id (if possible)
UPDATE orders o
SET symbol = m.symbol
FROM markets m
WHERE o.market_id = m.id 
  AND o.symbol IS NULL;

-- Add metadata column if not exists
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add error_message column if not exists
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS error_message TEXT;

-- Add cancelled_at column if not exists  
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP WITH TIME ZONE;

-- Rename columns to match Sprint 3 naming convention
DO $$
BEGIN
    -- Rename quantity to qty if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE orders RENAME COLUMN quantity TO qty;
    END IF;
    
    -- Rename filled_quantity to filled_qty if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'filled_quantity'
    ) THEN
        ALTER TABLE orders RENAME COLUMN filled_quantity TO filled_qty;
    END IF;
    
    -- Rename average_price to avg_price if exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'orders' AND column_name = 'average_price'
    ) THEN
        ALTER TABLE orders RENAME COLUMN average_price TO avg_price;
    END IF;
END $$;

-- Update helper function to work with new structure
CREATE OR REPLACE FUNCTION get_user_open_orders(p_user_id UUID)
RETURNS TABLE (
    id UUID,
    symbol VARCHAR,
    side VARCHAR,
    qty NUMERIC,
    price NUMERIC,
    order_type VARCHAR,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT o.id, o.symbol, o.side, o.qty, o.price, o.order_type, o.status, o.created_at
    FROM orders o
    WHERE o.user_id = p_user_id 
      AND o.status IN ('pending', 'partial')
    ORDER BY o.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON COLUMN orders.user_id IS 'User who placed the order (added for manual trading in Sprint 3)';
COMMENT ON COLUMN orders.symbol IS 'Trading symbol (e.g., BTCUSDT) - added for Sprint 3 manual trading';
