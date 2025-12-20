-- ============================================================
-- Quick Fix: Drop all existing triggers and policies first
-- Run this BEFORE running ALL_MIGRATIONS_SAFE.sql
-- This version safely handles tables that might not exist
-- ============================================================

-- Drop triggers (only from tables that might exist)
DO $$
BEGIN
  -- prospect_intelligence triggers
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prospect_intelligence') THEN
    DROP TRIGGER IF EXISTS update_prospect_intelligence_updated_at ON prospect_intelligence;
  END IF;
  
  -- account_signals triggers (only if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account_signals') THEN
    DROP TRIGGER IF EXISTS update_account_signals_updated_at ON account_signals;
  END IF;
  
  -- accounts triggers (only if table exists)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') THEN
    DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
  END IF;
END $$;

-- Drop policies (only from tables that might exist)
DO $$
BEGIN
  -- prospect_intelligence policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prospect_intelligence') THEN
    DROP POLICY IF EXISTS "Users can view their own prospects" ON prospect_intelligence;
    DROP POLICY IF EXISTS "Users can insert their own prospects" ON prospect_intelligence;
    DROP POLICY IF EXISTS "Users can update their own prospects" ON prospect_intelligence;
    DROP POLICY IF EXISTS "Users can delete their own prospects" ON prospect_intelligence;
  END IF;
  
  -- user_interactions policies
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_interactions') THEN
    DROP POLICY IF EXISTS "Users can view their own interactions" ON user_interactions;
    DROP POLICY IF EXISTS "Users can insert their own interactions" ON user_interactions;
    DROP POLICY IF EXISTS "Users cannot update interactions" ON user_interactions;
    DROP POLICY IF EXISTS "Users cannot delete interactions" ON user_interactions;
  END IF;
END $$;

-- Drop indexes that might conflict
DROP INDEX IF EXISTS idx_prospect_intelligence_user_website;

-- Now you can safely run ALL_MIGRATIONS_SAFE.sql
