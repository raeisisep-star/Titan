-- Migration 0008: Idempotency Requests Table
-- Purpose: Store idempotency keys for API requests to prevent duplicate processing
-- Author: TITAN Trading System
-- Date: 2025-10-27

-- =============================================================================
-- CREATE TABLE: idempotency_requests
-- =============================================================================
-- This table stores idempotency keys and their corresponding responses
-- to ensure that duplicate requests return the same result without re-processing

CREATE TABLE IF NOT EXISTS idempotency_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Idempotency Key (unique identifier from client)
    idempotency_key VARCHAR(255) NOT NULL UNIQUE,
    
    -- Request metadata
    user_id UUID NOT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL CHECK (method IN ('GET', 'POST', 'PUT', 'DELETE', 'PATCH')),
    
    -- Request body hash (for validation)
    request_hash VARCHAR(64) NOT NULL,
    
    -- Response data (stored as JSONB for flexibility)
    response_status INTEGER NOT NULL,
    response_body JSONB NOT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '24 hours',
    
    -- Indexing
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================================================
-- INDEXES
-- =============================================================================

-- Primary lookup index (most common query)
CREATE INDEX idx_idempotency_key ON idempotency_requests(idempotency_key);

-- User-based lookup
CREATE INDEX idx_idempotency_user_id ON idempotency_requests(user_id);

-- Expiration cleanup index
CREATE INDEX idx_idempotency_expires_at ON idempotency_requests(expires_at);

-- Composite index for efficient lookups
CREATE INDEX idx_idempotency_user_endpoint ON idempotency_requests(user_id, endpoint, created_at DESC);

-- =============================================================================
-- CLEANUP FUNCTION
-- =============================================================================
-- Automatically delete expired idempotency records

CREATE OR REPLACE FUNCTION cleanup_expired_idempotency_requests()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM idempotency_requests
    WHERE expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON TABLE idempotency_requests IS 'Stores idempotency keys to prevent duplicate request processing';
COMMENT ON COLUMN idempotency_requests.idempotency_key IS 'Unique key provided by client (usually UUID or hash)';
COMMENT ON COLUMN idempotency_requests.request_hash IS 'SHA-256 hash of request body for validation';
COMMENT ON COLUMN idempotency_requests.response_body IS 'Cached response to return for duplicate requests';
COMMENT ON COLUMN idempotency_requests.expires_at IS 'TTL for idempotency record (default 24 hours)';

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant necessary permissions (adjust user as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON idempotency_requests TO titan_app_user;

-- =============================================================================
-- SAMPLE QUERIES (for testing)
-- =============================================================================

-- Check table structure
-- SELECT column_name, data_type, character_maximum_length, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'idempotency_requests'
-- ORDER BY ordinal_position;

-- Check indexes
-- SELECT indexname, indexdef
-- FROM pg_indexes
-- WHERE tablename = 'idempotency_requests';

-- Test cleanup function
-- SELECT cleanup_expired_idempotency_requests();
