-- Migration 0006: Orders and Activities Tables for Sprint 3
-- Created: 2025-10-27
-- Purpose: Add tables for real order management and activity tracking

-- ============================================================================
-- Table: orders
-- Purpose: Store all trading orders with full lifecycle tracking
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Order details
    symbol VARCHAR(20) NOT NULL,
    side VARCHAR(10) NOT NULL CHECK (side IN ('buy', 'sell')),
    qty NUMERIC(20, 8) NOT NULL CHECK (qty > 0),
    price NUMERIC(20, 8) CHECK (price IS NULL OR price > 0),
    order_type VARCHAR(10) NOT NULL CHECK (order_type IN ('market', 'limit')),
    
    -- Order status and tracking
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'filled', 'cancelled', 'rejected', 'partial')),
    filled_qty NUMERIC(20, 8) DEFAULT 0 CHECK (filled_qty >= 0),
    avg_price NUMERIC(20, 8),
    
    -- External references (if integrated with exchange)
    exchange_order_id VARCHAR(100),
    exchange VARCHAR(20),
    
    -- Metadata
    error_message TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    filled_at TIMESTAMP WITH TIME ZONE,
    cancelled_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_symbol ON orders(symbol);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_status ON orders(user_id, status);

-- ============================================================================
-- Table: activities
-- Purpose: Log all user actions and system events for audit trail
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Activity classification
    action VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL DEFAULT 'trading' CHECK (category IN ('trading', 'account', 'system', 'autopilot', 'settings')),
    
    -- Activity details
    description TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Related entities
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    related_id UUID,
    
    -- Status and result
    status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending', 'warning')),
    error_message TEXT,
    
    -- Client information
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_activities_user_id ON activities(user_id);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_action ON activities(action);
CREATE INDEX IF NOT EXISTS idx_activities_category ON activities(category);
CREATE INDEX IF NOT EXISTS idx_activities_user_created ON activities(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_order_id ON activities(order_id);

-- ============================================================================
-- Trigger: Update orders.updated_at automatically
-- ============================================================================

CREATE OR REPLACE FUNCTION update_orders_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_orders_updated_at();

-- ============================================================================
-- Helper Functions
-- ============================================================================

-- Function to get user's open orders
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

-- Function to get user's recent activities
CREATE OR REPLACE FUNCTION get_user_activities(p_user_id UUID, p_limit INT DEFAULT 50)
RETURNS TABLE (
    id UUID,
    action VARCHAR,
    category VARCHAR,
    description TEXT,
    details JSONB,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT a.id, a.action, a.category, a.description, a.details, a.status, a.created_at
    FROM activities a
    WHERE a.user_id = p_user_id
    ORDER BY a.created_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE orders IS 'Stores all trading orders with complete lifecycle tracking';
COMMENT ON TABLE activities IS 'Audit trail of all user actions and system events';
COMMENT ON COLUMN orders.status IS 'Order lifecycle: pending → filled/cancelled/rejected';
COMMENT ON COLUMN activities.action IS 'Type of action: place_order, cancel_order, update_settings, etc.';
COMMENT ON COLUMN activities.details IS 'JSONB field for flexible activity-specific data';
