-- Migration 0007: AI Intent Logs
-- Task-9: Chatbot MVP Intents (Artemis)
-- Date: 2025-10-25

-- ============================================================================
-- 1. AI Intent Logs Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS ai_intent_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  
  -- Input
  text TEXT NOT NULL,
  language VARCHAR(10) DEFAULT 'en',
  
  -- Classification
  intent VARCHAR(100),
  confidence DECIMAL(5,4) CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Actions & Response
  actions JSONB DEFAULT '[]',
  response TEXT,
  
  -- Outcome
  outcome VARCHAR(50) DEFAULT 'pending', -- pending, success, failed, requires_confirmation
  error_message TEXT,
  
  -- Metadata
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_intent_logs_user_id ON ai_intent_logs(user_id);
CREATE INDEX idx_ai_intent_logs_session_id ON ai_intent_logs(session_id);
CREATE INDEX idx_ai_intent_logs_intent ON ai_intent_logs(intent);
CREATE INDEX idx_ai_intent_logs_created_at ON ai_intent_logs(created_at DESC);
CREATE INDEX idx_ai_intent_logs_outcome ON ai_intent_logs(outcome);

-- ============================================================================
-- 2. Intent Confirmation Tokens Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS intent_confirmation_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  intent_log_id INTEGER REFERENCES ai_intent_logs(id) ON DELETE CASCADE,
  token VARCHAR(64) UNIQUE NOT NULL,
  intent VARCHAR(100) NOT NULL,
  parameters JSONB,
  expires_at TIMESTAMP NOT NULL,
  confirmed BOOLEAN DEFAULT false,
  confirmed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_intent_tokens_user_id ON intent_confirmation_tokens(user_id);
CREATE INDEX idx_intent_tokens_token ON intent_confirmation_tokens(token);
CREATE INDEX idx_intent_tokens_expires_at ON intent_confirmation_tokens(expires_at);

-- ============================================================================
-- 3. Helper Functions
-- ============================================================================

-- Clean up expired confirmation tokens
CREATE OR REPLACE FUNCTION cleanup_expired_intent_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM intent_confirmation_tokens
  WHERE expires_at < CURRENT_TIMESTAMP
    AND confirmed = false;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Get user's recent intents
CREATE OR REPLACE FUNCTION get_user_recent_intents(p_user_id INTEGER, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  id INTEGER,
  text TEXT,
  intent VARCHAR(100),
  confidence DECIMAL(5,4),
  outcome VARCHAR(50),
  created_at TIMESTAMP
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ail.id,
    ail.text,
    ail.intent,
    ail.confidence,
    ail.outcome,
    ail.created_at
  FROM ai_intent_logs ail
  WHERE ail.user_id = p_user_id
  ORDER BY ail.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql STABLE;

-- Get intent statistics
CREATE OR REPLACE FUNCTION get_intent_statistics(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  intent VARCHAR(100),
  total_count BIGINT,
  success_count BIGINT,
  avg_confidence DECIMAL(5,4)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ail.intent,
    COUNT(*) as total_count,
    COUNT(*) FILTER (WHERE ail.outcome = 'success') as success_count,
    ROUND(AVG(ail.confidence)::numeric, 4) as avg_confidence
  FROM ai_intent_logs ail
  WHERE ail.created_at >= CURRENT_TIMESTAMP - (p_days || ' days')::INTERVAL
    AND ail.intent IS NOT NULL
  GROUP BY ail.intent
  ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Comments
-- ============================================================================
COMMENT ON TABLE ai_intent_logs IS 'Logs all chatbot intent classifications and responses';
COMMENT ON TABLE intent_confirmation_tokens IS 'Temporary tokens for confirming sensitive actions (emergency_stop, link_wallet, etc.)';
COMMENT ON FUNCTION cleanup_expired_intent_tokens IS 'Remove expired confirmation tokens (run periodically)';
COMMENT ON FUNCTION get_user_recent_intents IS 'Retrieve recent intents for a user (conversation history)';
COMMENT ON FUNCTION get_intent_statistics IS 'Get aggregated statistics for intent classification (monitoring)';
