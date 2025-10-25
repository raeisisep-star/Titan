-- Migration 0006: Feature Flags System
-- Task-7: Global and per-user feature flags with audit trail
-- Date: 2025-10-25

-- ============================================================================
-- 1. Global Feature Flags Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS feature_flags (
  id SERIAL PRIMARY KEY,
  flag_key VARCHAR(100) UNIQUE NOT NULL,
  flag_value BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_feature_flags_key ON feature_flags(flag_key);

-- Insert default global flags
INSERT INTO feature_flags (flag_key, flag_value, description) VALUES
  ('DEMO_MODE', false, 'Global demo mode - all trades redirected to demo'),
  ('MEXC_ONLY', true, 'Only MEXC exchange allowed (other exchanges disabled)')
ON CONFLICT (flag_key) DO NOTHING;

-- ============================================================================
-- 2. User Preferences Table (Per-User Settings)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_prefs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  trading_mode VARCHAR(10) NOT NULL DEFAULT 'demo' CHECK (trading_mode IN ('demo', 'real')),
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE INDEX idx_user_prefs_user_id ON user_prefs(user_id);
CREATE INDEX idx_user_prefs_trading_mode ON user_prefs(trading_mode);

-- ============================================================================
-- 3. Settings Audit Trail
-- ============================================================================
CREATE TABLE IF NOT EXISTS settings_audit (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  setting_type VARCHAR(50) NOT NULL, -- 'feature_flag', 'user_pref', etc.
  setting_key VARCHAR(100) NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT
);

CREATE INDEX idx_settings_audit_user_id ON settings_audit(user_id);
CREATE INDEX idx_settings_audit_changed_at ON settings_audit(changed_at DESC);
CREATE INDEX idx_settings_audit_setting_key ON settings_audit(setting_key);

-- ============================================================================
-- 4. Trigger: Auto-update updated_at timestamp
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_flags_updated_at
  BEFORE UPDATE ON feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_prefs_updated_at
  BEFORE UPDATE ON user_prefs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 5. Helper Functions
-- ============================================================================

-- Get feature flag value (with caching support)
CREATE OR REPLACE FUNCTION get_feature_flag(flag_name VARCHAR)
RETURNS BOOLEAN AS $$
DECLARE
  flag_val BOOLEAN;
BEGIN
  SELECT flag_value INTO flag_val
  FROM feature_flags
  WHERE flag_key = flag_name;
  
  RETURN COALESCE(flag_val, false);
END;
$$ LANGUAGE plpgsql STABLE;

-- Get user trading mode (with default fallback)
CREATE OR REPLACE FUNCTION get_user_trading_mode(p_user_id INTEGER)
RETURNS VARCHAR AS $$
DECLARE
  mode VARCHAR(10);
BEGIN
  SELECT trading_mode INTO mode
  FROM user_prefs
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(mode, 'demo');
END;
$$ LANGUAGE plpgsql STABLE;

-- Check if user should trade in demo mode (considers both global and user flags)
CREATE OR REPLACE FUNCTION should_use_demo_mode(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
DECLARE
  global_demo BOOLEAN;
  user_mode VARCHAR(10);
BEGIN
  -- Check global DEMO_MODE flag
  global_demo := get_feature_flag('DEMO_MODE');
  
  IF global_demo THEN
    RETURN true;
  END IF;
  
  -- Check user preference
  user_mode := get_user_trading_mode(p_user_id);
  
  RETURN (user_mode = 'demo');
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE feature_flags IS 'Global feature flags for system-wide behavior control';
COMMENT ON TABLE user_prefs IS 'Per-user preferences including trading mode (demo/real)';
COMMENT ON TABLE settings_audit IS 'Audit trail for all settings changes (who, when, what)';
COMMENT ON FUNCTION get_feature_flag IS 'Retrieve feature flag value by key';
COMMENT ON FUNCTION get_user_trading_mode IS 'Get user trading mode (demo or real)';
COMMENT ON FUNCTION should_use_demo_mode IS 'Determine if user should trade in demo mode (considers global + user flags)';
