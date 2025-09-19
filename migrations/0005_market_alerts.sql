-- =============================================================================
-- MARKET ALERTS SYSTEM - Database Schema (D1 Compatible)
-- Migration: 0005_market_alerts.sql
-- =============================================================================

-- Market Alerts table - Store user-defined price and market alerts
CREATE TABLE IF NOT EXISTS market_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    alert_name TEXT NOT NULL,
    symbol TEXT NOT NULL, -- BTC, ETH, etc.
    alert_type TEXT NOT NULL, -- 'price_above', 'price_below', 'volume_surge', 'percentage_change'
    
    -- Alert Conditions
    target_price REAL, -- For price alerts
    percentage_change REAL, -- For percentage change alerts (e.g., +5%, -10%)
    time_period TEXT, -- '1h', '4h', '24h', '7d' for percentage change alerts
    volume_threshold REAL, -- For volume surge alerts
    
    -- Alert Settings
    is_enabled BOOLEAN DEFAULT 1,
    is_recurring BOOLEAN DEFAULT 0, -- Whether alert repeats after triggering
    max_triggers INTEGER DEFAULT 1, -- Maximum number of times this alert can trigger
    current_triggers INTEGER DEFAULT 0, -- Current trigger count
    
    -- Notification Settings
    notification_methods TEXT DEFAULT 'push', -- JSON array: ['push', 'email', 'sms']
    custom_message TEXT, -- Custom alert message
    
    -- Status & Tracking
    status TEXT DEFAULT 'active', -- 'active', 'triggered', 'paused', 'expired'
    last_checked_at DATETIME,
    last_triggered_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alert Triggers - Log of when alerts were triggered
CREATE TABLE IF NOT EXISTS alert_triggers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id INTEGER REFERENCES market_alerts(id) ON DELETE CASCADE,
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    trigger_price REAL, -- Price at which alert was triggered
    market_conditions TEXT, -- JSON of market conditions at trigger time
    notification_sent BOOLEAN DEFAULT 0,
    notification_methods_used TEXT -- Which methods were actually used
);

-- Alert Templates - Pre-defined alert templates
CREATE TABLE IF NOT EXISTS alert_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    alert_type TEXT NOT NULL,
    
    -- Template Configuration
    default_settings TEXT, -- JSON of default alert settings
    parameter_hints TEXT, -- JSON of parameter descriptions for UI
    
    -- Usage & Management
    usage_count INTEGER DEFAULT 0,
    is_system_template BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- User Notification Settings - Per-user notification preferences  
CREATE TABLE IF NOT EXISTS user_notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    -- Global Notification Settings
    push_notifications BOOLEAN DEFAULT 1,
    email_notifications BOOLEAN DEFAULT 1,
    sms_notifications BOOLEAN DEFAULT 0,
    
    -- Notification Timing
    quiet_hours_enabled BOOLEAN DEFAULT 0,
    quiet_start_time TIME DEFAULT '22:00:00',
    quiet_end_time TIME DEFAULT '08:00:00',
    timezone TEXT DEFAULT 'UTC',
    
    -- Limits & Controls
    max_daily_alerts INTEGER DEFAULT 50,
    alert_frequency_limit INTEGER DEFAULT 5, -- Max alerts per hour
    
    -- Contact Information
    email_address TEXT,
    phone_number TEXT,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alert Statistics - Track alert performance and user engagement
CREATE TABLE IF NOT EXISTS alert_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_recorded DATE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    
    -- Daily Stats
    alerts_created INTEGER DEFAULT 0,
    alerts_triggered INTEGER DEFAULT 0,
    alerts_dismissed INTEGER DEFAULT 0,
    total_active_alerts INTEGER DEFAULT 0,
    
    -- Notification Stats
    push_notifications_sent INTEGER DEFAULT 0,
    email_notifications_sent INTEGER DEFAULT 0,
    sms_notifications_sent INTEGER DEFAULT 0,
    
    -- Performance Metrics
    avg_trigger_accuracy REAL DEFAULT 0.00, -- Percentage of alerts that were useful
    false_positive_rate REAL DEFAULT 0.00,
    
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(date_recorded, user_id)
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

-- Market alerts indexes
CREATE INDEX IF NOT EXISTS idx_market_alerts_user_id ON market_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_market_alerts_symbol ON market_alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_market_alerts_status ON market_alerts(status);
CREATE INDEX IF NOT EXISTS idx_market_alerts_is_enabled ON market_alerts(is_enabled);
CREATE INDEX IF NOT EXISTS idx_market_alerts_alert_type ON market_alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_market_alerts_user_symbol ON market_alerts(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_market_alerts_symbol_enabled ON market_alerts(symbol, is_enabled);

-- Alert triggers indexes
CREATE INDEX IF NOT EXISTS idx_alert_triggers_alert_id ON alert_triggers(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_triggered_at ON alert_triggers(triggered_at DESC);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_alert_triggered ON alert_triggers(alert_id, triggered_at DESC);

-- Alert templates indexes
CREATE INDEX IF NOT EXISTS idx_alert_templates_alert_type ON alert_templates(alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_templates_is_active ON alert_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_alert_templates_is_system ON alert_templates(is_system_template);

-- User notification settings indexes
CREATE INDEX IF NOT EXISTS idx_user_notification_settings_user_id ON user_notification_settings(user_id);

-- Alert statistics indexes
CREATE INDEX IF NOT EXISTS idx_alert_statistics_date_user ON alert_statistics(date_recorded, user_id);
CREATE INDEX IF NOT EXISTS idx_alert_statistics_user_id ON alert_statistics(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_statistics_date ON alert_statistics(date_recorded DESC);

-- =============================================================================
-- INSERT ALERT TEMPLATES
-- =============================================================================

INSERT INTO alert_templates (name, description, alert_type, default_settings, parameter_hints, is_system_template, is_active) VALUES
('قیمت بالاتر از حد', 'هشدار زمانی که قیمت بالاتر از مقدار مشخص شده برسد', 'price_above', 
 '{"notification_methods": ["push"], "is_recurring": false}', 
 '{"target_price": "قیمت هدف را وارد کنید"}', 1, 1),

('قیمت پایین‌تر از حد', 'هشدار زمانی که قیمت پایین‌تر از مقدار مشخص شده برسد', 'price_below', 
 '{"notification_methods": ["push"], "is_recurring": false}', 
 '{"target_price": "قیمت هدف را وارد کنید"}', 1, 1),

('افزایش حجم معاملات', 'هشدار زمانی که حجم معاملات بیش از حد معمول افزایش یابد', 'volume_surge', 
 '{"notification_methods": ["push"], "is_recurring": true}', 
 '{"volume_threshold": "حد آستانه حجم را وارد کنید"}', 1, 1),

('تغییر درصدی قیمت', 'هشدار برای تغییرات درصدی قیمت در بازه زمانی مشخص', 'percentage_change', 
 '{"notification_methods": ["push"], "time_period": "24h"}', 
 '{"percentage_change": "درصد تغییر (مثبت یا منفی)", "time_period": "بازه زمانی (1h, 4h, 24h, 7d)"}', 1, 1),

('شکست سطح مقاومت', 'هشدار زمانی که قیمت از سطح مقاومت عبور کند', 'price_above', 
 '{"notification_methods": ["push", "email"], "is_recurring": false}', 
 '{"target_price": "سطح مقاومت را وارد کنید"}', 1, 1),

('شکست سطح حمایت', 'هشدار زمانی که قیمت از سطح حمایت پایین‌تر برود', 'price_below', 
 '{"notification_methods": ["push", "email"], "is_recurring": false}', 
 '{"target_price": "سطح حمایت را وارد کنید"}', 1, 1),

('رسیدن به هدف سود', 'هشدار برای رسیدن به قیمت هدف سود', 'price_above', 
 '{"notification_methods": ["push", "email"], "custom_message": "🎯 به هدف سود رسیدید!"}', 
 '{"target_price": "قیمت هدف سود"}', 1, 1),

('رسیدن به حد ضرر', 'هشدار برای رسیدن به حد ضرر', 'price_below', 
 '{"notification_methods": ["push", "email"], "custom_message": "⚠️ به حد ضرر رسیدید!"}', 
 '{"target_price": "حد ضرر"}', 1, 1),

('تحرک غیرعادی بازار', 'هشدار برای تحرکات غیرعادی و سریع بازار', 'percentage_change', 
 '{"notification_methods": ["push"], "time_period": "1h", "percentage_change": 10}', 
 '{"percentage_change": "حداقل درصد تغییر برای هشدار"}', 1, 1);