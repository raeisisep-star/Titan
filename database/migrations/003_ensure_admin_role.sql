-- =============================================================================
-- TITAN Trading System - Ensure Admin Role Migration
-- =============================================================================
-- Migration: 003_ensure_admin_role
-- Purpose: Ensure admin user has admin role (idempotent)
-- Date: 2025-10-20
-- Phase: 4 - SSL Full (strict)
-- =============================================================================

-- Description:
-- This migration ensures that the 'admin' user has the 'admin' role.
-- It's idempotent and safe to run multiple times without side effects.
-- Prevents role drift in production environments.

-- =============================================================================
-- Update admin user role
-- =============================================================================

UPDATE users 
SET role = 'admin'
WHERE username = 'admin' 
  AND role != 'admin';

-- Verification query (for manual check):
-- SELECT username, email, role, updated_at FROM users WHERE username = 'admin';

-- =============================================================================
-- Migration Notes
-- =============================================================================
-- This migration only updates if role is not already 'admin'
-- Safe to run multiple times (idempotent)
-- Prevents drift in production where admin might lose elevated privileges
-- =============================================================================
