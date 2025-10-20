-- ===============================================
-- TITAN User Management System - Complete Schema
-- ===============================================

-- Roles Table: نقش‌های کاربری
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Permissions Table: دسترسی‌های سیستم
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions Table: جلسات فعال کاربران
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address INET,
    user_agent TEXT,
    browser VARCHAR(100),
    os VARCHAR(100),
    device_type VARCHAR(50),
    location JSONB,
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Activity Logs: لاگ فعالیت‌های کاربران
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    session_id INTEGER REFERENCES user_sessions(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    is_suspicious BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suspicious Activities: فعالیت‌های مشکوک
CREATE TABLE IF NOT EXISTS suspicious_activities (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    details JSONB,
    ip_address INET,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add role_id to users table if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='role_id') THEN
        ALTER TABLE users ADD COLUMN role_id INTEGER REFERENCES roles(id) ON DELETE SET NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='last_login_at') THEN
        ALTER TABLE users ADD COLUMN last_login_at TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='last_login_ip') THEN
        ALTER TABLE users ADD COLUMN last_login_ip INET;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='failed_login_attempts') THEN
        ALTER TABLE users ADD COLUMN failed_login_attempts INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='account_locked_until') THEN
        ALTER TABLE users ADD COLUMN account_locked_until TIMESTAMP;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='is_suspended') THEN
        ALTER TABLE users ADD COLUMN is_suspended BOOLEAN DEFAULT false;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='suspended_reason') THEN
        ALTER TABLE users ADD COLUMN suspended_reason TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='suspended_until') THEN
        ALTER TABLE users ADD COLUMN suspended_until TIMESTAMP;
    END IF;
END $$;

-- Insert default roles
INSERT INTO roles (name, display_name, description, permissions, is_system) VALUES
    ('admin', 'Administrator', 'مدیر کل سیستم - دسترسی کامل', 
     '["user_management", "system_settings", "trading", "analytics", "monitoring"]'::jsonb, true),
    ('trader', 'Trader', 'معامله‌گر - دسترسی به معاملات و تحلیل', 
     '["trading", "analytics", "portfolio"]'::jsonb, true),
    ('analyst', 'Analyst', 'تحلیلگر - دسترسی به تحلیل و گزارشات', 
     '["analytics", "monitoring", "reports"]'::jsonb, true),
    ('viewer', 'Viewer', 'مشاهده‌گر - فقط مشاهده', 
     '["view_dashboard"]'::jsonb, true)
ON CONFLICT (name) DO NOTHING;

-- Insert default permissions
INSERT INTO permissions (name, display_name, category, description) VALUES
    ('user_management', 'مدیریت کاربران', 'system', 'ساخت، ویرایش و حذف کاربران'),
    ('role_management', 'مدیریت نقش‌ها', 'system', 'مدیریت نقش‌ها و دسترسی‌ها'),
    ('system_settings', 'تنظیمات سیستم', 'system', 'تغییر تنظیمات سیستم'),
    ('trading', 'معاملات', 'trading', 'انجام معاملات خرید و فروش'),
    ('manual_trading', 'معاملات دستی', 'trading', 'معاملات دستی'),
    ('auto_trading', 'معاملات خودکار', 'trading', 'فعال‌سازی معاملات خودکار'),
    ('analytics', 'تحلیل و گزارش', 'analytics', 'مشاهده تحلیل‌ها و گزارشات'),
    ('portfolio', 'مدیریت پورتفولیو', 'portfolio', 'مشاهده و مدیریت پورتفولیو'),
    ('monitoring', 'پایش سیستم', 'monitoring', 'پایش عملکرد سیستم'),
    ('view_dashboard', 'مشاهده داشبورد', 'general', 'مشاهده داشبورد اصلی'),
    ('export_data', 'خروجی داده', 'data', 'دریافت خروجی از داده‌ها'),
    ('api_access', 'دسترسی API', 'api', 'استفاده از API')
ON CONFLICT (name) DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_suspicious ON user_activity_logs(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_user_id ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_resolved ON suspicious_activities(is_resolved);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for roles table
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
    BEFORE UPDATE ON roles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to clean expired sessions
CREATE OR REPLACE FUNCTION clean_expired_sessions()
RETURNS void AS $$
BEGIN
    UPDATE user_sessions 
    SET is_active = false 
    WHERE expires_at < CURRENT_TIMESTAMP AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to detect suspicious activity
CREATE OR REPLACE FUNCTION detect_suspicious_activity()
RETURNS TRIGGER AS $$
DECLARE
    recent_failed_logins INTEGER;
    recent_location_changes INTEGER;
BEGIN
    -- Check for multiple failed login attempts
    IF NEW.action = 'login_failed' THEN
        SELECT COUNT(*) INTO recent_failed_logins
        FROM user_activity_logs
        WHERE user_id = NEW.user_id 
        AND action = 'login_failed'
        AND created_at > CURRENT_TIMESTAMP - INTERVAL '1 hour';
        
        IF recent_failed_logins >= 5 THEN
            NEW.is_suspicious = true;
            NEW.risk_score = 80;
            
            INSERT INTO suspicious_activities (user_id, activity_type, description, severity, details)
            VALUES (NEW.user_id, 'multiple_failed_logins', 
                    'تلاش‌های متعدد ورود ناموفق', 'high',
                    jsonb_build_object('count', recent_failed_logins, 'ip', NEW.ip_address));
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for suspicious activity detection
DROP TRIGGER IF EXISTS trigger_detect_suspicious ON user_activity_logs;
CREATE TRIGGER trigger_detect_suspicious
    BEFORE INSERT ON user_activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION detect_suspicious_activity();

-- View for active user sessions with details
CREATE OR REPLACE VIEW v_active_sessions AS
SELECT 
    us.id,
    us.user_id,
    u.username,
    u.email,
    us.ip_address,
    us.browser,
    us.os,
    us.device_type,
    us.location,
    us.last_activity,
    us.expires_at,
    us.created_at,
    EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - us.last_activity)) / 60 AS idle_minutes
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.is_active = true AND us.expires_at > CURRENT_TIMESTAMP;

-- View for user statistics
CREATE OR REPLACE VIEW v_user_statistics AS
SELECT 
    COUNT(*) AS total_users,
    COUNT(*) FILTER (WHERE is_active = true) AS active_users,
    COUNT(*) FILTER (WHERE is_active = false) AS inactive_users,
    COUNT(*) FILTER (WHERE is_suspended = true) AS suspended_users,
    COUNT(*) FILTER (WHERE created_at > CURRENT_DATE - INTERVAL '30 days') AS new_this_month,
    COUNT(*) FILTER (WHERE last_login_at > CURRENT_TIMESTAMP - INTERVAL '1 hour') AS online_now
FROM users;

COMMENT ON TABLE roles IS 'نقش‌های کاربری و دسترسی‌ها';
COMMENT ON TABLE permissions IS 'لیست دسترسی‌های سیستم';
COMMENT ON TABLE user_sessions IS 'جلسات فعال کاربران';
COMMENT ON TABLE user_activity_logs IS 'لاگ تمام فعالیت‌های کاربران';
COMMENT ON TABLE suspicious_activities IS 'فعالیت‌های مشکوک و غیرعادی';
