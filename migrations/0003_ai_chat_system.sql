-- =============================================================================
-- AI CHAT SYSTEM - Database Schema (D1 Compatible)
-- Migration: 0003_ai_chat_system.sql
-- =============================================================================

-- Conversations table - Store chat conversations
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title TEXT DEFAULT 'گفتگوی جدید',
    provider TEXT DEFAULT 'openai', -- 'openai' or 'anthropic'
    model TEXT,
    status TEXT DEFAULT 'active', -- 'active', 'archived', 'deleted'
    metadata TEXT DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    total_messages INTEGER DEFAULT 0,
    last_message_at DATETIME
);

-- Chat messages table - Store individual messages in conversations
CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id TEXT REFERENCES conversations(conversation_id) ON DELETE CASCADE,
    message_id TEXT UNIQUE, -- Unique identifier for the message
    role TEXT NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    content_type TEXT DEFAULT 'text', -- 'text', 'code', 'json', 'markdown'
    token_count INTEGER,
    processing_time_ms INTEGER,
    provider TEXT, -- Which AI provider was used for this message
    model TEXT, -- Which model was used
    metadata TEXT DEFAULT '{}', -- Store additional data like function calls, attachments, etc.
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- AI usage statistics table
CREATE TABLE IF NOT EXISTS ai_usage_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date_used DATE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    total_requests INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    avg_response_time_ms REAL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Chat templates table - Pre-defined prompts and templates
CREATE TABLE IF NOT EXISTS chat_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT DEFAULT 'general', -- 'trading', 'analysis', 'general', 'learning'
    prompt_template TEXT NOT NULL,
    variables TEXT DEFAULT '[]', -- JSON array of variable names that can be replaced in template
    is_system_template BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================================
-- INDEXES FOR PERFORMANCE
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_conversation_id ON conversations(conversation_id);

CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_role ON chat_messages(role);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_message_id ON chat_messages(message_id);

CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_date_used ON ai_usage_stats(date_used);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_user_id ON ai_usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_stats_provider ON ai_usage_stats(provider);

CREATE INDEX IF NOT EXISTS idx_chat_templates_category ON chat_templates(category);
CREATE INDEX IF NOT EXISTS idx_chat_templates_is_active ON chat_templates(is_active);

-- =============================================================================
-- INSERT SYSTEM CHAT TEMPLATES
-- =============================================================================

INSERT INTO chat_templates (name, description, category, prompt_template, variables, is_system_template, is_active) VALUES
('تحلیل قیمت', 'تحلیل قیمت و روند بازار برای یک ارز دیجیتال', 'trading', 
 'لطفاً قیمت فعلی و روند بازار {{symbol}} را تحلیل کن. اطلاعات فنی مهم و سطوح حمایت و مقاومت را بررسی کن.', 
 '["symbol"]', 1, 1),

('استراتژی معاملاتی', 'ایجاد استراتژی معاملاتی برای شرایط بازار', 'trading',
 'برای شرایط فعلی بازار {{market_condition}} و با در نظر گیری سطح ریسک {{risk_level}} یک استراتژی معاملاتی مناسب پیشنهاد بده.', 
 '["market_condition", "risk_level"]', 1, 1),

('مدیریت ریسک', 'راهنمایی در مورد مدیریت ریسک در معاملات', 'trading',
 'با توجه به سرمایه {{capital}} و ریسک تحمل‌پذیر {{risk_tolerance}}، راهکارهای مدیریت ریسک مناسب را توضیح بده.', 
 '["capital", "risk_tolerance"]', 1, 1),

('آموزش مفاهیم', 'توضیح مفاهیم پایه‌ای تریدینگ', 'learning',
 'مفهوم {{concept}} را در تریدینگ به زبان ساده توضیح بده و مثال‌های عملی ارائه کن.', 
 '["concept"]', 1, 1),

('تحلیل تکنیکال', 'تحلیل نمودار و اندیکاتورها', 'analysis',
 'نمودار {{symbol}} در تایم فریم {{timeframe}} را با استفاده از اندیکاتورهای {{indicators}} تحلیل کن.', 
 '["symbol", "timeframe", "indicators"]', 1, 1),

('خبرهای بازار', 'تحلیل تأثیر اخبار بر بازار', 'analysis',
 'تأثیر {{news_event}} بر بازار ارزهای دیجیتال و به خصوص {{affected_coins}} را تحلیل کن.', 
 '["news_event", "affected_coins"]', 1, 1),

('بررسی پرتفولیو', 'بررسی و بهینه‌سازی پرتفولیو', 'analysis',
 'پرتفولیوی شامل {{portfolio_assets}} را از نظر تنوع، ریسک و پتانسیل رشد بررسی کن.', 
 '["portfolio_assets"]', 1, 1),

('مشاوره کلی', 'مشاوره کلی در زمینه سرمایه‌گذاری', 'general',
 'سؤال: {{question}}. لطفاً پاسخ جامع و کاربردی ارائه بده.', 
 '["question"]', 1, 1);