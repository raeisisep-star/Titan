-- Autopilot Trading System Database Schema (Simplified Version)
-- Migration: 0004_autopilot_system_schema_simple.sql
-- Version: 1.0.0
-- Created: 2024-10-10

-- ==================================================
-- AUTOPILOT CONFIGURATION TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS autopilot_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    enabled BOOLEAN DEFAULT 0,
    mode TEXT DEFAULT 'moderate',
    budget DECIMAL(15,2) DEFAULT 50000.00,
    target_amount DECIMAL(15,2) DEFAULT 250000.00,
    max_concurrent_trades INTEGER DEFAULT 8,
    risk_level INTEGER DEFAULT 5,
    stop_loss BOOLEAN DEFAULT 1,
    take_profit BOOLEAN DEFAULT 1,
    emergency_stop BOOLEAN DEFAULT 0,
    ai_providers TEXT DEFAULT '["chatgpt", "gemini", "claude"]',
    artemis_integration BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================================================
-- AUTOPILOT STRATEGIES TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS autopilot_strategies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    enabled BOOLEAN DEFAULT 1,
    confidence DECIMAL(5,2) DEFAULT 75.00,
    profit_potential DECIMAL(5,2) DEFAULT 50.00,
    risk_score DECIMAL(3,1) DEFAULT 5.0,
    ai_agent INTEGER DEFAULT 1,
    strategy_type TEXT DEFAULT 'trend',
    parameters TEXT,
    performance_roi DECIMAL(8,2) DEFAULT 0.00,
    win_rate DECIMAL(5,2) DEFAULT 70.00,
    total_trades INTEGER DEFAULT 0,
    sharpe_ratio DECIMAL(5,2) DEFAULT 1.00,
    max_drawdown DECIMAL(5,2) DEFAULT -5.00,
    total_volume DECIMAL(15,2) DEFAULT 0.00,
    avg_hold_time TEXT DEFAULT '24h 0m',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- USER AUTOPILOT STRATEGY ASSIGNMENTS
-- ==================================================
CREATE TABLE IF NOT EXISTS user_autopilot_strategies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    strategy_id TEXT NOT NULL,
    enabled BOOLEAN DEFAULT 1,
    custom_parameters TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (strategy_id) REFERENCES autopilot_strategies(id) ON DELETE CASCADE,
    UNIQUE(user_id, strategy_id)
);

-- ==================================================
-- TARGET-BASED TRADES TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS autopilot_target_trades (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL,
    initial_amount DECIMAL(15,2) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL,
    current_amount DECIMAL(15,2) NOT NULL,
    progress DECIMAL(5,2) DEFAULT 0.00,
    estimated_time_to_target TEXT DEFAULT 'نامحدود',
    strategy TEXT DEFAULT 'Multi-Strategy AI',
    status TEXT DEFAULT 'active',
    roi DECIMAL(8,2) DEFAULT 0.00,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    completion_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================================================
-- AI DECISIONS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS autopilot_ai_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_trade_id TEXT,
    user_id INTEGER NOT NULL,
    provider TEXT NOT NULL,
    action TEXT NOT NULL,
    confidence DECIMAL(5,2) NOT NULL,
    reasoning TEXT NOT NULL,
    pair TEXT NOT NULL,
    amount DECIMAL(15,2) DEFAULT 0.00,
    expected_profit DECIMAL(8,2) DEFAULT 0.00,
    executed BOOLEAN DEFAULT 0,
    execution_result TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_trade_id) REFERENCES autopilot_target_trades(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================================================
-- AUTOPILOT SIGNALS TABLE (Real-time signals)
-- ==================================================
CREATE TABLE IF NOT EXISTS autopilot_signals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    pair TEXT NOT NULL,
    action TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    ai_provider TEXT NOT NULL,
    strategy TEXT NOT NULL,
    expected_profit DECIMAL(5,2) DEFAULT 0.00,
    reasoning TEXT NOT NULL,
    signal_strength TEXT DEFAULT 'medium',
    market_conditions TEXT,
    expiry_time DATETIME,
    processed BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==================================================
-- AUTOPILOT PERFORMANCE HISTORY
-- ==================================================
CREATE TABLE IF NOT EXISTS autopilot_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    config_id INTEGER NOT NULL,
    target_trade_id TEXT,
    date DATE NOT NULL,
    total_trades INTEGER DEFAULT 0,
    successful_trades INTEGER DEFAULT 0,
    failed_trades INTEGER DEFAULT 0,
    total_profit DECIMAL(15,2) DEFAULT 0.00,
    total_loss DECIMAL(15,2) DEFAULT 0.00,
    net_profit DECIMAL(15,2) DEFAULT 0.00,
    roi_daily DECIMAL(8,2) DEFAULT 0.00,
    win_rate DECIMAL(5,2) DEFAULT 0.00,
    avg_trade_duration TEXT DEFAULT '0h 0m',
    max_drawdown DECIMAL(5,2) DEFAULT 0.00,
    sharpe_ratio DECIMAL(5,2) DEFAULT 0.00,
    active_strategies_count INTEGER DEFAULT 0,
    ai_decisions_count INTEGER DEFAULT 0,
    market_conditions TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (config_id) REFERENCES autopilot_configs(id) ON DELETE CASCADE,
    FOREIGN KEY (target_trade_id) REFERENCES autopilot_target_trades(id) ON DELETE SET NULL,
    UNIQUE(user_id, config_id, date)
);

-- ==================================================
-- AI PROVIDER STATUS TABLE
-- ==================================================
CREATE TABLE IF NOT EXISTS autopilot_ai_providers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    provider_name TEXT NOT NULL,
    enabled BOOLEAN DEFAULT 1,
    connected BOOLEAN DEFAULT 0,
    api_key_set BOOLEAN DEFAULT 0,
    last_connection_test DATETIME,
    connection_status TEXT DEFAULT 'disconnected',
    latency_ms INTEGER DEFAULT 0,
    requests_today INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2) DEFAULT 0.00,
    error_count INTEGER DEFAULT 0,
    last_error TEXT,
    settings TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, provider_name)
);

-- ==================================================
-- AUTOPILOT SYSTEM LOGS
-- ==================================================
CREATE TABLE IF NOT EXISTS autopilot_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    log_level TEXT DEFAULT 'info',
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    context TEXT,
    error_details TEXT,
    target_trade_id TEXT,
    strategy_id TEXT,
    ai_decision_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (target_trade_id) REFERENCES autopilot_target_trades(id) ON DELETE SET NULL,
    FOREIGN KEY (strategy_id) REFERENCES autopilot_strategies(id) ON DELETE SET NULL,
    FOREIGN KEY (ai_decision_id) REFERENCES autopilot_ai_decisions(id) ON DELETE SET NULL
);

-- ==================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ==================================================

-- Autopilot Config Indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_configs_user_id ON autopilot_configs(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_configs_enabled ON autopilot_configs(enabled);

-- Strategy Indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_strategies_enabled ON autopilot_strategies(enabled);
CREATE INDEX IF NOT EXISTS idx_autopilot_strategies_type ON autopilot_strategies(strategy_type);
CREATE INDEX IF NOT EXISTS idx_user_autopilot_strategies_user_id ON user_autopilot_strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_user_autopilot_strategies_enabled ON user_autopilot_strategies(enabled);

-- Target Trade Indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_target_trades_user_id ON autopilot_target_trades(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_target_trades_status ON autopilot_target_trades(status);
CREATE INDEX IF NOT EXISTS idx_autopilot_target_trades_progress ON autopilot_target_trades(progress);

-- AI Decision Indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_ai_decisions_user_id ON autopilot_ai_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_ai_decisions_target_trade_id ON autopilot_ai_decisions(target_trade_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_ai_decisions_provider ON autopilot_ai_decisions(provider);
CREATE INDEX IF NOT EXISTS idx_autopilot_ai_decisions_created_at ON autopilot_ai_decisions(created_at);

-- Signal Indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_signals_user_id ON autopilot_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_signals_pair ON autopilot_signals(pair);
CREATE INDEX IF NOT EXISTS idx_autopilot_signals_processed ON autopilot_signals(processed);
CREATE INDEX IF NOT EXISTS idx_autopilot_signals_created_at ON autopilot_signals(created_at);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_performance_user_id ON autopilot_performance(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_performance_date ON autopilot_performance(date);
CREATE INDEX IF NOT EXISTS idx_autopilot_performance_target_trade_id ON autopilot_performance(target_trade_id);

-- AI Provider Indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_ai_providers_user_id ON autopilot_ai_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_ai_providers_enabled ON autopilot_ai_providers(enabled);
CREATE INDEX IF NOT EXISTS idx_autopilot_ai_providers_connected ON autopilot_ai_providers(connected);

-- Log Indexes
CREATE INDEX IF NOT EXISTS idx_autopilot_logs_user_id ON autopilot_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_logs_level ON autopilot_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_autopilot_logs_category ON autopilot_logs(category);
CREATE INDEX IF NOT EXISTS idx_autopilot_logs_created_at ON autopilot_logs(created_at);

-- ==================================================
-- DEFAULT AUTOPILOT STRATEGIES DATA
-- ==================================================
INSERT OR IGNORE INTO autopilot_strategies (id, name, description, confidence, profit_potential, risk_score, ai_agent, strategy_type, performance_roi, win_rate, total_trades, sharpe_ratio, max_drawdown, total_volume, avg_hold_time) VALUES 
('momentum', 'معاملات Momentum', 'خرید در روند صعودی قوی با استفاده از شاخص‌های مومنتوم', 82.3, 85.7, 4.2, 8, 'trend', 27.4, 78.2, 156, 2.1, -3.8, 450000.00, '18h 45m'),
('breakout', 'شکست مقاومت', 'استراتژی breakout برای شکست سطوح مقاومت و حمایت', 87.8, 62.1, 3.1, 2, 'swing', 31.2, 82.5, 134, 2.8, -2.9, 380000.00, '24h 12m'),
('arbitrage', 'آربیتراژ', 'سود از اختلاف قیمت بین صرافی‌های مختلف', 95.2, 45.8, 1.8, 6, 'arbitrage', 18.7, 94.1, 289, 3.2, -1.2, 720000.00, '2h 35m'),
('scalping', 'اسکلپینگ', 'معاملات کوتاه‌مدت با سود کم اما پیوسته', 78.9, 34.2, 2.7, 11, 'scalping', 12.8, 68.9, 467, 1.9, -4.2, 290000.00, '15m 22s'),
('ai_prediction', 'پیش‌بینی هوشمند', 'استراتژی بر اساس پیش‌بینی هوش مصنوعی پیشرفته', 91.4, 127.3, 6.8, 1, 'ai', 45.9, 85.7, 98, 2.9, -6.1, 580000.00, '36h 18m'),
('news_sentiment', 'تحلیل احساسات', 'خرید و فروش بر اساس تحلیل احساسات اخبار', 76.8, 89.1, 5.4, 12, 'ai', 23.6, 73.4, 187, 2.2, -5.8, 340000.00, '12h 47m'),
('technical_analysis', 'تحلیل تکنیکال', 'استراتژی بر اساس شاخص‌های فنی و الگوهای قیمت', 83.7, 71.5, 4.1, 3, 'trend', 29.3, 79.8, 203, 2.5, -4.5, 410000.00, '28h 33m'),
('swing_trading', 'سوئینگ تریدینگ', 'معاملات میان‌مدت با نگهداری چند روزه', 69.2, 108.4, 7.3, 9, 'swing', 38.1, 71.2, 76, 2.0, -7.9, 520000.00, '72h 15m');