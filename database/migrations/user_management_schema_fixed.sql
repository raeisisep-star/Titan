-- ===============================================
-- TITAN User Management System - Fixed Schema for UUID
-- ===============================================

-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Activity Logs: لاگ فعالیت‌های کاربران (using UUID)
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    session_id INTEGER,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    is_suspicious BOOLEAN DEFAULT false,
    risk_score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Suspicious Activities: فعالیت‌های مشکوک (using UUID)
CREATE TABLE IF NOT EXISTS suspicious_activities (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT,
    severity VARCHAR(20) DEFAULT 'medium',
    details JSONB,
    ip_address INET,
    is_resolved BOOLEAN DEFAULT false,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolved_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Sessions Table with UUID (recreate)
DROP TABLE IF EXISTS user_sessions CASCADE;
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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

-- Foreign key for activity logs
ALTER TABLE user_activity_logs 
DROP CONSTRAINT IF EXISTS user_activity_logs_session_id_fkey;

ALTER TABLE user_activity_logs 
ADD CONSTRAINT user_activity_logs_session_id_fkey 
FOREIGN KEY (session_id) REFERENCES user_sessions(id) ON DELETE SET NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_suspicious ON user_activity_logs(is_suspicious);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_user_id ON suspicious_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_suspicious_activities_resolved ON suspicious_activities(is_resolved);

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

COMMENT ON TABLE user_sessions IS 'جلسات فعال کاربران';
COMMENT ON TABLE user_activity_logs IS 'لاگ تمام فعالیت‌های کاربران';
COMMENT ON TABLE suspicious_activities IS 'فعالیت‌های مشکوک و غیرعادی';

-- Insert some test data for demo
DO $$
DECLARE
    demo_user_id UUID;
    admin_user_id UUID;
BEGIN
    -- Get demo user ID
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@titan.dev' LIMIT 1;
    SELECT id INTO admin_user_id FROM users WHERE email = 'admin@titan.com' LIMIT 1;
    
    IF demo_user_id IS NOT NULL THEN
        -- Insert sample activity logs
        INSERT INTO user_activity_logs (user_id, action, resource, details, ip_address, user_agent)
        VALUES 
            (demo_user_id, 'login', 'authentication', '{"method": "password"}'::jsonb, '192.168.1.100', 'Mozilla/5.0'),
            (demo_user_id, 'view', 'dashboard', '{}'::jsonb, '192.168.1.100', 'Mozilla/5.0'),
            (demo_user_id, 'trade', 'manual_trading', '{"pair": "BTC/USDT", "type": "buy"}'::jsonb, '192.168.1.100', 'Mozilla/5.0');
        
        -- Insert sample session
        INSERT INTO user_sessions (user_id, session_token, ip_address, browser, os, device_type, expires_at)
        VALUES 
            (demo_user_id, 'demo_token_' || gen_random_uuid(), '192.168.1.100', 'Chrome 120.0', 'Windows 11', 'desktop', 
             CURRENT_TIMESTAMP + INTERVAL '24 hours');
    END IF;
END $$;
