-- Alert System Schema
-- Complete database schema for market alerts and notifications

-- Market Alerts Table
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    alert_type TEXT NOT NULL, -- 'price_alert', 'volume_alert', 'percentage_alert', 'technical_alert'
    condition_type TEXT NOT NULL, -- 'price_above', 'price_below', 'volume_surge', 'percentage_change_up', etc.
    threshold_value REAL NOT NULL,
    percentage_change REAL,
    current_price REAL,
    is_active BOOLEAN DEFAULT 1,
    is_recurring BOOLEAN DEFAULT 0,
    triggers_count INTEGER DEFAULT 0,
    max_triggers INTEGER DEFAULT 1,
    notification_channels TEXT DEFAULT '["web"]', -- JSON array: ["web", "email", "telegram", "sms"]
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high'
    time_period TEXT DEFAULT '24h', -- '1h', '4h', '24h', '7d'
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_triggered_at DATETIME,
    expires_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Alert Templates Table
CREATE TABLE IF NOT EXISTS alert_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL, -- 'price', 'technical', 'volume', 'trend', 'news'
    alert_type TEXT NOT NULL,
    condition_type TEXT NOT NULL,
    default_config TEXT, -- JSON configuration
    variables TEXT, -- JSON array of variable names
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Alert Triggers History
CREATE TABLE IF NOT EXISTS alert_triggers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    trigger_price REAL NOT NULL,
    condition_met TEXT NOT NULL, -- Description of what condition was met
    market_data TEXT, -- JSON market data at trigger time
    notifications_sent TEXT, -- JSON array of sent notifications
    processed BOOLEAN DEFAULT 0,
    FOREIGN KEY (alert_id) REFERENCES alerts(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Notification Settings Table  
CREATE TABLE IF NOT EXISTS notification_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    email_notifications BOOLEAN DEFAULT 1,
    email_address TEXT,
    push_notifications BOOLEAN DEFAULT 1,
    sms_notifications BOOLEAN DEFAULT 0,
    phone_number TEXT,
    telegram_notifications BOOLEAN DEFAULT 0,
    telegram_chat_id TEXT,
    discord_notifications BOOLEAN DEFAULT 0,
    discord_webhook TEXT,
    quiet_hours_start TEXT, -- Format: "22:00"
    quiet_hours_end TEXT, -- Format: "08:00"
    timezone TEXT DEFAULT 'Asia/Tehran',
    max_alerts_per_day INTEGER DEFAULT 50,
    max_alerts_per_hour INTEGER DEFAULT 10,
    sound_enabled BOOLEAN DEFAULT 1,
    vibration_enabled BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Alert Statistics View (for performance)
CREATE TABLE IF NOT EXISTS alert_statistics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    stat_date DATE NOT NULL,
    total_alerts INTEGER DEFAULT 0,
    active_alerts INTEGER DEFAULT 0,
    triggered_alerts INTEGER DEFAULT 0,
    notifications_sent INTEGER DEFAULT 0,
    accuracy_rate REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_user_symbol ON alerts(user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alerts_type ON alerts(alert_type);
CREATE INDEX IF NOT EXISTS idx_alerts_expires ON alerts(expires_at);

CREATE INDEX IF NOT EXISTS idx_alert_triggers_alert_id ON alert_triggers(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_user_id ON alert_triggers(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_triggered_at ON alert_triggers(triggered_at);

CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_alert_templates_category ON alert_templates(category);
CREATE INDEX IF NOT EXISTS idx_alert_templates_active ON alert_templates(is_active);

CREATE INDEX IF NOT EXISTS idx_alert_statistics_user_date ON alert_statistics(user_id, stat_date);

-- Insert Default Alert Templates
INSERT OR IGNORE INTO alert_templates (id, template_name, description, category, alert_type, condition_type, default_config, variables) VALUES
(1, 'قیمت بالاتر از حد', 'هشدار وقتی قیمت بالاتر از مقدار مشخصی برود', 'price', 'price_alert', 'price_above', '{"threshold_value": 50000, "notification_channels": ["web"]}', '["symbol", "threshold_value"]'),
(2, 'قیمت پایین‌تر از حد', 'هشدار وقتی قیمت پایین‌تر از مقدار مشخصی برود', 'price', 'price_alert', 'price_below', '{"threshold_value": 40000, "notification_channels": ["web"]}', '["symbol", "threshold_value"]'),
(3, 'رشد درصدی مثبت', 'هشدار برای رشد درصدی مثبت در بازه زمانی', 'trend', 'percentage_alert', 'percentage_change_up', '{"percentage_change": 5, "time_period": "24h", "notification_channels": ["web"]}', '["symbol", "percentage_change", "time_period"]'),
(4, 'کاهش درصدی منفی', 'هشدار برای کاهش درصدی منفی در بازه زمانی', 'trend', 'percentage_alert', 'percentage_change_down', '{"percentage_change": -5, "time_period": "24h", "notification_channels": ["web"]}', '["symbol", "percentage_change", "time_period"]'),
(5, 'افزایش ناگهانی حجم', 'هشدار برای افزایش غیرعادی حجم معاملات', 'volume', 'volume_alert', 'volume_surge', '{"volume_threshold": 1000000, "notification_channels": ["web"]}', '["symbol", "volume_threshold"]'),
(6, 'RSI فروش بیش از حد', 'هشدار وقتی RSI زیر 30 برسد (فروش بیش از حد)', 'technical', 'technical_alert', 'rsi_oversold', '{"threshold_value": 30, "notification_channels": ["web"]}', '["symbol", "threshold_value"]'),
(7, 'RSI خرید بیش از حد', 'هشدار وقتی RSI بالای 70 برود (خرید بیش از حد)', 'technical', 'technical_alert', 'rsi_overbought', '{"threshold_value": 70, "notification_channels": ["web"]}', '["symbol", "threshold_value"]'),
(8, 'شکست سطح حمایت', 'هشدار برای شکست سطح حمایت کلیدی', 'technical', 'technical_alert', 'support_break', '{"threshold_value": 45000, "notification_channels": ["web", "email"]}', '["symbol", "threshold_value"]'),
(9, 'شکست سطح مقاومت', 'هشدار برای شکست سطح مقاومت کلیدی', 'technical', 'technical_alert', 'resistance_break', '{"threshold_value": 50000, "notification_channels": ["web", "email"]}', '["symbol", "threshold_value"]'),
(10, 'هشدار اخبار مهم', 'هشدار برای اخبار مهم مربوط به دارایی', 'news', 'news_alert', 'news_impact', '{"impact_level": "high", "notification_channels": ["web", "telegram"]}', '["symbol", "impact_level"]');

-- Insert Default Notification Settings for Demo User
INSERT OR IGNORE INTO notification_settings (user_id, email_notifications, push_notifications, telegram_notifications, timezone) 
VALUES (1, 1, 1, 0, 'Asia/Tehran');

-- Insert Sample Alerts for Demo User
INSERT OR IGNORE INTO alerts (id, user_id, name, symbol, alert_type, condition_type, threshold_value, current_price, is_active, notification_channels, description) VALUES
(1, 1, 'BTC بالای 50K', 'BTCUSDT', 'price_alert', 'price_above', 50000, 45230, 1, '["web", "email"]', 'هشدار وقتی قیمت بیت‌کوین بالاتر از 50,000 دلار برود'),
(2, 1, 'ETH زیر 3K', 'ETHUSDT', 'price_alert', 'price_below', 3000, 3150, 1, '["web"]', 'هشدار وقتی قیمت اتریوم پایین‌تر از 3,000 دلار برود'),
(3, 1, 'ADA رشد 10%', 'ADAUSDT', 'percentage_alert', 'percentage_change_up', 10, 0.45, 1, '["web", "telegram"]', 'هشدار برای 10% رشد کاردانو در 24 ساعت'),
(4, 1, 'SOL حجم بالا', 'SOLUSDT', 'volume_alert', 'volume_surge', 5000000, 125.5, 0, '["web"]', 'هشدار برای افزایش ناگهانی حجم معاملات سولانا'),
(5, 1, 'DOGE RSI پایین', 'DOGEUSDT', 'technical_alert', 'rsi_oversold', 30, 0.075, 1, '["web"]', 'هشدار وقتی RSI دوج‌کوین زیر 30 برسد');