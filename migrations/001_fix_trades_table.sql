-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 001: Fix trades table structure
-- Date: 2025-10-18
-- Purpose: Add missing columns to trades table
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Add user_id column
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Add other missing columns
ALTER TABLE trades
ADD COLUMN IF NOT EXISTS symbol VARCHAR(20),
ADD COLUMN IF NOT EXISTS type VARCHAR(10),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS strategy VARCHAR(50),
ADD COLUMN IF NOT EXISTS agent_id VARCHAR(50),
ADD COLUMN IF NOT EXISTS total_value NUMERIC(20,8),
ADD COLUMN IF NOT EXISTS fee_currency VARCHAR(10);

-- Update existing trades to link to first user (temporary fix)
UPDATE trades 
SET user_id = (SELECT id FROM users ORDER BY created_at LIMIT 1)
WHERE user_id IS NULL;

-- Now make user_id NOT NULL
ALTER TABLE trades 
ALTER COLUMN user_id SET NOT NULL;

-- Add foreign key constraint
ALTER TABLE trades
ADD CONSTRAINT trades_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES users(id) ON DELETE CASCADE;

-- Create indices for performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON trades(symbol);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_type ON trades(type);
CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON trades(executed_at DESC);

-- Add trigger for updated_at
CREATE OR REPLACE FUNCTION update_trades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.executed_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_trades_timestamp ON trades;
CREATE TRIGGER update_trades_timestamp
BEFORE UPDATE ON trades
FOR EACH ROW
EXECUTE FUNCTION update_trades_updated_at();

COMMIT;

-- Verify changes
\d trades
SELECT 'Migration 001 completed successfully!' as status;
