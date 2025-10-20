-- =============================================================================
-- TITAN Trading System - Test Users Seed Data for RBAC Testing
-- =============================================================================
-- Purpose: Add test users with different roles for RBAC validation
-- Database: PostgreSQL
-- Phase: 4 - RBAC Implementation
-- =============================================================================

-- Admin user (already exists, but included for completeness)
-- Username: admin
-- Password: admin123
-- Role: admin
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, is_verified)
VALUES (
    'admin',
    'admin@titan-trading.com',
    -- bcrypt hash for 'admin123' with salt rounds 12
    '$2b$12$LQv3c1yqBwEHxPuNYjNOuuz3P3DZzN9E2.XZG8ZNsY8P5.4RkVIti',
    'Admin',
    'User',
    'admin',
    true,
    true
)
ON CONFLICT (username) DO NOTHING;

-- Regular user for 403 Forbidden testing
-- Username: user
-- Password: user123
-- Role: user
INSERT INTO users (username, email, password_hash, first_name, last_name, role, is_active, is_verified)
VALUES (
    'user',
    'user@titan-trading.com',
    -- bcrypt hash for 'user123' with salt rounds 12
    '$2b$12$M2/q2ezmUdkV4yoPgueWp.X6zYAcDPVFeBi2wz8f0vJQmw3ZLZGES',
    'Regular',
    'User',
    'user',
    true,
    true
)
ON CONFLICT (username) DO NOTHING;

-- =============================================================================
-- Verification Query
-- =============================================================================
-- Run this to verify users were created:
-- SELECT username, email, role, is_active, created_at FROM users WHERE username IN ('admin', 'user');

-- =============================================================================
-- Testing Credentials
-- =============================================================================
-- Admin User:
--   Username: admin
--   Password: admin123
--   Expected: Access to /api/admin/* endpoints (200 OK)
--
-- Regular User:
--   Username: user
--   Password: user123
--   Expected: Access to /api/user/* endpoints (200 OK)
--            Blocked from /api/admin/* endpoints (403 Forbidden)
-- =============================================================================
