-- Alerts System Database Schema
-- Created: 2024-01-15

-- Main alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    alert_name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    alert_type TEXT NOT NULL CHECK (alert_type IN ('price_above', 'price_below', 'percentage_change_up', 'percentage_change_down', 'volume_surge', 'rsi_oversold', 'rsi_overbought')),
    target_price REAL,
    percentage_change REAL,
    time_period TEXT DEFAULT '24h',
    is_active BOOLEAN DEFAULT TRUE,
    is_recurring BOOLEAN DEFAULT FALSE,
    notification_methods TEXT DEFAULT 'push', -- JSON array: ["push", "email", "telegram"]
    description TEXT,
    triggered_count INTEGER DEFAULT 0,
    last_triggered DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Alert triggers history table
CREATE TABLE IF NOT EXISTS alert_triggers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_id INTEGER NOT NULL,
    trigger_price REAL,
    current_price REAL,
    percentage_change REAL,
    triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notification_sent BOOLEAN DEFAULT FALSE,
    notification_methods TEXT, -- Which methods were used
    market_data TEXT, -- JSON snapshot of market data when triggered
    
    FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
);

-- Alert templates table
CREATE TABLE IF NOT EXISTS alert_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    template_name TEXT NOT NULL,
    category TEXT DEFAULT 'custom',
    description TEXT,
    alert_type TEXT NOT NULL,
    default_params TEXT, -- JSON object with default parameters
    usage_count INTEGER DEFAULT 0,
    is_public BOOLEAN DEFAULT FALSE,
    created_by INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Alert settings table
CREATE TABLE IF NOT EXISTS alert_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL UNIQUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    email_notifications BOOLEAN DEFAULT FALSE,
    telegram_notifications BOOLEAN DEFAULT FALSE,
    telegram_chat_id TEXT,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    max_alerts_per_day INTEGER DEFAULT 20,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Market prices cache table (for alert checking)
CREATE TABLE IF NOT EXISTS market_prices_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    symbol TEXT NOT NULL UNIQUE,
    current_price REAL NOT NULL,
    price_change_24h REAL DEFAULT 0,
    volume_24h REAL DEFAULT 0,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON alerts(symbol);
CREATE INDEX IF NOT EXISTS idx_alerts_active ON alerts(is_active);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_alert_id ON alert_triggers(alert_id);
CREATE INDEX IF NOT EXISTS idx_alert_triggers_triggered_at ON alert_triggers(triggered_at);
CREATE INDEX IF NOT EXISTS idx_market_prices_symbol ON market_prices_cache(symbol);

-- Insert default alert templates
INSERT OR IGNORE INTO alert_templates (template_name, category, description, alert_type, default_params) VALUES
('افزایش قیمت Bitcoin', 'cryptocurrency', 'هشدار زمانی که قیمت Bitcoin بالای مقدار تعیین شده برود', 'price_above', '{"symbol": "BTC", "targetPrice": 50000}'),
('کاهش قیمت Ethereum', 'cryptocurrency', 'هشدار زمانی که قیمت Ethereum پایین مقدار تعیین شده برود', 'price_below', '{"symbol": "ETH", "targetPrice": 3000}'),
('افزایش ناگهانی قیمت', 'technical', 'هشدار برای افزایش بیش از 10% در 24 ساعت', 'percentage_change_up', '{"percentageChange": 10, "timePeriod": "24h"}'),
('کاهش شدید قیمت', 'technical', 'هشدار برای کاهش بیش از 15% در 24 ساعت', 'percentage_change_down', '{"percentageChange": 15, "timePeriod": "24h"}'),
('افزایش حجم معاملات', 'volume', 'هشدار برای افزایش ناگهانی حجم معاملات', 'volume_surge', '{"volumeMultiplier": 3}');

-- Insert sample market prices
INSERT OR IGNORE INTO market_prices_cache (symbol, current_price, price_change_24h, volume_24h) VALUES
('BTC', 43250.00, 2.35, 28500000000),
('ETH', 2580.00, -1.25, 12300000000),
('ADA', 0.48, 3.75, 450000000),
('SOL', 98.50, 5.20, 1200000000),
('DOT', 7.25, -0.85, 280000000);