-- ═══════════════════════════════════════════════════════════════════════════
-- Migration 002: Create AI-related tables
-- Date: 2025-10-18
-- Purpose: Create tables for AI agents, conversations, and decisions
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- ═══════════════════════════════════════════════════════════════════════════
-- AI Agents Table (15 sub-AIs)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'maintenance')),
    capabilities JSONB DEFAULT '{}',
    performance_metrics JSONB DEFAULT '{}',
    config JSONB DEFAULT '{}',
    model_provider VARCHAR(50), -- openai, anthropic, google
    model_name VARCHAR(50),
    last_active_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_agents_agent_id ON ai_agents(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_agents_status ON ai_agents(status);
CREATE INDEX IF NOT EXISTS idx_ai_agents_type ON ai_agents(type);

-- ═══════════════════════════════════════════════════════════════════════════
-- AI Conversations Table (Chatbot history)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id VARCHAR(100),
    message TEXT NOT NULL,
    response TEXT,
    provider VARCHAR(50), -- openai, anthropic, google, mock
    model VARCHAR(50),
    tokens_used INTEGER,
    processing_time INTEGER, -- milliseconds
    confidence FLOAT,
    sentiment VARCHAR(20),
    intent VARCHAR(50),
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON ai_conversations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_provider ON ai_conversations(provider);

-- ═══════════════════════════════════════════════════════════════════════════
-- AI Decisions Table
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    decision_type VARCHAR(50), -- buy, sell, hold, alert
    symbol VARCHAR(20),
    action VARCHAR(20),
    confidence FLOAT,
    reasoning TEXT,
    data JSONB DEFAULT '{}',
    executed BOOLEAN DEFAULT FALSE,
    execution_time TIMESTAMPTZ,
    outcome JSONB,
    profit_loss NUMERIC(20,8),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_decisions_agent_id ON ai_decisions(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_user_id ON ai_decisions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_symbol ON ai_decisions(symbol);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_executed ON ai_decisions(executed);
CREATE INDEX IF NOT EXISTS idx_ai_decisions_created_at ON ai_decisions(created_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- AI Training Sessions Table
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS ai_training_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    agent_id VARCHAR(50) NOT NULL,
    session_type VARCHAR(50), -- supervised, reinforcement, transfer
    status VARCHAR(20) DEFAULT 'pending',
    dataset_size INTEGER,
    epochs INTEGER,
    accuracy FLOAT,
    loss FLOAT,
    metrics JSONB DEFAULT '{}',
    config JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_training_agent_id ON ai_training_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_ai_training_status ON ai_training_sessions(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- Autopilot Sessions Table
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS autopilot_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'stopped' CHECK (status IN ('running', 'paused', 'stopped', 'completed')),
    mode VARCHAR(20) DEFAULT 'demo' CHECK (mode IN ('demo', 'real')),
    initial_balance NUMERIC(20,2),
    target_amount NUMERIC(20,2),
    current_amount NUMERIC(20,2),
    profit_loss NUMERIC(20,2) DEFAULT 0,
    profit_loss_percent NUMERIC(10,4) DEFAULT 0,
    trades_count INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    win_rate NUMERIC(10,4) DEFAULT 0,
    config JSONB DEFAULT '{}',
    strategies JSONB DEFAULT '[]',
    risk_settings JSONB DEFAULT '{}',
    started_at TIMESTAMPTZ,
    stopped_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_autopilot_user_id ON autopilot_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_autopilot_status ON autopilot_sessions(status);
CREATE INDEX IF NOT EXISTS idx_autopilot_mode ON autopilot_sessions(mode);

-- ═══════════════════════════════════════════════════════════════════════════
-- Watchlist Table
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS watchlist (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    alert_price NUMERIC(20,8),
    alert_condition VARCHAR(20), -- above, below
    notes TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_symbol ON watchlist(symbol);
CREATE INDEX IF NOT EXISTS idx_watchlist_is_active ON watchlist(is_active);

-- ═══════════════════════════════════════════════════════════════════════════
-- News Feed Table
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS news_feed (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    content TEXT,
    summary TEXT,
    source VARCHAR(100),
    author VARCHAR(100),
    url TEXT,
    image_url TEXT,
    sentiment VARCHAR(20), -- positive, negative, neutral
    impact_score FLOAT,
    related_symbols TEXT[],
    category VARCHAR(50),
    tags TEXT[],
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_news_feed_published_at ON news_feed(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_news_feed_sentiment ON news_feed(sentiment);
CREATE INDEX IF NOT EXISTS idx_news_feed_category ON news_feed(category);
CREATE INDEX IF NOT EXISTS idx_news_feed_symbols ON news_feed USING GIN(related_symbols);

-- ═══════════════════════════════════════════════════════════════════════════
-- System Metrics Table
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS system_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_type VARCHAR(50) NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    value NUMERIC(20,4),
    unit VARCHAR(20),
    metadata JSONB DEFAULT '{}',
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_system_metrics_type ON system_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_system_metrics_name ON system_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_system_metrics_recorded_at ON system_metrics(recorded_at DESC);

-- ═══════════════════════════════════════════════════════════════════════════
-- Alert Rules Table (extended)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS alert_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL, -- price, indicator, volume, sentiment
    symbol VARCHAR(20),
    condition VARCHAR(100) NOT NULL,
    target_value NUMERIC(20,8),
    is_active BOOLEAN DEFAULT TRUE,
    is_triggered BOOLEAN DEFAULT FALSE,
    trigger_count INTEGER DEFAULT 0,
    last_triggered_at TIMESTAMPTZ,
    notification_channels JSONB DEFAULT '["inapp"]',
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_alert_rules_user_id ON alert_rules(user_id);
CREATE INDEX IF NOT EXISTS idx_alert_rules_symbol ON alert_rules(symbol);
CREATE INDEX IF NOT EXISTS idx_alert_rules_is_active ON alert_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_alert_rules_type ON alert_rules(type);

COMMIT;

-- ═══════════════════════════════════════════════════════════════════════════
-- Seed Initial Data
-- ═══════════════════════════════════════════════════════════════════════════

BEGIN;

-- Insert 15 AI Agents (Artemis sub-AIs)
INSERT INTO ai_agents (agent_id, name, type, description, status, model_provider, model_name) VALUES
('agent_01', 'Technical Analysis Expert', 'analysis', 'تحلیل تکنیکال پیشرفته با استفاده از اندیکاتورهای متعدد', 'active', 'openai', 'gpt-4'),
('agent_02', 'Risk Management Specialist', 'risk', 'مدیریت ریسک و سرمایه با الگوریتم‌های پیشرفته', 'active', 'anthropic', 'claude-3-opus'),
('agent_03', 'Sentiment Analysis Agent', 'sentiment', 'تحلیل احساسات بازار از اخبار و شبکه‌های اجتماعی', 'active', 'google', 'gemini-pro'),
('agent_04', 'Portfolio Optimization', 'portfolio', 'بهینه‌سازی پرتفولیو با تئوری مارکویتز', 'active', 'openai', 'gpt-4'),
('agent_05', 'Market Making Agent', 'trading', 'بازارساز خودکار با الگوریتم‌های HFT', 'active', 'anthropic', 'claude-3-sonnet'),
('agent_06', 'Algorithmic Trading', 'trading', 'معاملات الگوریتمی با استراتژی‌های متنوع', 'active', 'openai', 'gpt-4-turbo'),
('agent_07', 'News Analysis Agent', 'analysis', 'تحلیل اخبار و تاثیر آن بر بازار', 'active', 'google', 'gemini-ultra'),
('agent_08', 'HFT Engine', 'trading', 'معاملات فرکانس بالا با تاخیر کمتر از 1ms', 'inactive', 'openai', 'gpt-4'),
('agent_09', 'Quantitative Analysis', 'analysis', 'تحلیل کمی با مدل‌های ریاضی', 'active', 'anthropic', 'claude-3-opus'),
('agent_10', 'Macro Economic Analyst', 'analysis', 'تحلیل کلان اقتصادی و تاثیر آن', 'active', 'google', 'gemini-pro'),
('agent_11', 'Pattern Recognition', 'analysis', 'شناسایی الگوهای قیمتی با ML', 'active', 'openai', 'gpt-4'),
('agent_12', 'Order Book Analyzer', 'analysis', 'تحلیل عمق بازار و دفتر سفارشات', 'active', 'anthropic', 'claude-3-sonnet'),
('agent_13', 'Arbitrage Detector', 'trading', 'شناسایی فرصت‌های آربیتراژ', 'active', 'openai', 'gpt-4-turbo'),
('agent_14', 'Liquidity Analyzer', 'analysis', 'تحلیل نقدینگی و حجم معاملات', 'active', 'google', 'gemini-pro'),
('agent_15', 'Volatility Forecaster', 'analysis', 'پیش‌بینی نوسانات بازار', 'active', 'anthropic', 'claude-3-opus')
ON CONFLICT (agent_id) DO NOTHING;

-- Insert sample news
INSERT INTO news_feed (title, content, source, sentiment, impact_score, related_symbols, published_at) VALUES
('بیت کوین به 50,000 دلار رسید', 'قیمت بیت کوین امروز به 50 هزار دلار رسید و رکورد جدیدی ثبت کرد...', 'CoinDesk', 'positive', 0.85, ARRAY['BTC', 'ETH'], NOW() - INTERVAL '2 hours'),
('فدرال رزرو نرخ بهره را افزایش داد', 'فدرال رزرو آمریکا نرخ بهره را 0.25 درصد افزایش داد...', 'Bloomberg', 'negative', 0.75, ARRAY['BTC', 'ETH', 'USDT'], NOW() - INTERVAL '5 hours'),
('اتریوم آپگرید جدید را اعلام کرد', 'شبکه اتریوم آپگرید بزرگ بعدی خود را اعلام کرد...', 'CoinTelegraph', 'positive', 0.70, ARRAY['ETH'], NOW() - INTERVAL '1 day')
ON CONFLICT DO NOTHING;

COMMIT;

SELECT 'Migration 002 completed successfully!' as status;
SELECT 'Total AI Agents: ' || COUNT(*) FROM ai_agents;
