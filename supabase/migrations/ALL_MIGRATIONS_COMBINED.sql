-- Combined Supabase Migrations
-- Run this entire file in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql/new
-- Generated: 2025-12-19T22:57:50.818Z


-- ============================================================
-- Migration 1/5: create_prospect_intelligence_table.sql
-- ============================================================

-- Create prospect_intelligence table for storing prospect research results
-- Run this migration in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS prospect_intelligence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  website_url TEXT NOT NULL,
  company_name TEXT NOT NULL,
  data JSONB NOT NULL,
  icp_score INTEGER NOT NULL CHECK (icp_score >= 1 AND icp_score <= 10),
  priority_level TEXT NOT NULL CHECK (priority_level IN ('high', 'medium', 'low')),
  extracted_at TIMESTAMPTZ NOT NULL,
  extraction_duration_ms INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_user_id ON prospect_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_priority ON prospect_intelligence(priority_level);
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_icp_score ON prospect_intelligence(icp_score);
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_created_at ON prospect_intelligence(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_website_url ON prospect_intelligence(website_url);

-- Create unique constraint to prevent duplicate research for same user + website
CREATE UNIQUE INDEX IF NOT EXISTS idx_prospect_intelligence_user_website 
  ON prospect_intelligence(user_id, website_url);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_prospect_intelligence_updated_at ON prospect_intelligence;
CREATE TRIGGER update_prospect_intelligence_updated_at 
  BEFORE UPDATE ON prospect_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE prospect_intelligence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view their own prospects" ON prospect_intelligence;
DROP POLICY IF EXISTS "Users can insert their own prospects" ON prospect_intelligence;
DROP POLICY IF EXISTS "Users can update their own prospects" ON prospect_intelligence;
DROP POLICY IF EXISTS "Users can delete their own prospects" ON prospect_intelligence;

-- Users can only see their own prospects
CREATE POLICY "Users can view their own prospects"
  ON prospect_intelligence
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own prospects
CREATE POLICY "Users can insert their own prospects"
  ON prospect_intelligence
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own prospects
CREATE POLICY "Users can update their own prospects"
  ON prospect_intelligence
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own prospects
CREATE POLICY "Users can delete their own prospects"
  ON prospect_intelligence
  FOR DELETE
  USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON prospect_intelligence TO authenticated;



-- ============================================================
-- Migration 2/5: add_user_interactions_table.sql
-- ============================================================

-- Add user_interactions table for tracking prospect engagement and rewards
-- Run this in Supabase SQL editor or via Supabase CLI migrations

CREATE TABLE IF NOT EXISTS user_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_domain TEXT NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN (
    'viewed',
    'opened_research',
    'contacted',
    'meeting_booked',
    'deal_won',
    'deal_lost'
  )),
  interaction_metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id
  ON user_interactions(user_id);

CREATE INDEX IF NOT EXISTS idx_user_interactions_domain
  ON user_interactions(account_domain);

-- Enable Row Level Security
ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Users can view their own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users can insert their own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users cannot update interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users cannot delete interactions" ON user_interactions;

-- Users can see only their own interactions
CREATE POLICY "Users can view their own interactions"
  ON user_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own interactions
CREATE POLICY "Users can insert their own interactions"
  ON user_interactions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users cannot update/delete interactions for now (append-only event log)
CREATE POLICY "Users cannot update interactions"
  ON user_interactions
  FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete interactions"
  ON user_interactions
  FOR DELETE
  USING (false);

GRANT SELECT, INSERT ON user_interactions TO authenticated;




-- ============================================================
-- Migration 3/5: add_account_signals_table.sql
-- ============================================================

-- Add account_signals table for flattened, ML-friendly prospect features
-- Run this in Supabase SQL editor or via Supabase CLI migrations

CREATE TABLE IF NOT EXISTS account_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_domain TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,

  -- Aggregate ICP metrics
  icp_score INTEGER,
  priority_level TEXT CHECK (priority_level IN ('high','medium','low')),

  -- Hiring / org structure signals (can be null if unknown)
  has_open_engineering_roles BOOLEAN,
  engineering_role_count INTEGER,
  total_open_roles INTEGER,
  has_engineering_blog BOOLEAN,

  -- Last time we refreshed these signals from a research run
  last_research_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_signals_domain
  ON account_signals(account_domain);

CREATE INDEX IF NOT EXISTS idx_account_signals_icp
  ON account_signals(icp_score DESC NULLS LAST);

-- Function already created in create_prospect_intelligence_table.sql
-- Just create the trigger (function will be reused)

DROP TRIGGER IF EXISTS update_account_signals_updated_at ON account_signals;
CREATE TRIGGER update_account_signals_updated_at
  BEFORE UPDATE ON account_signals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- No RLS for account_signals yet; it's an internal analytics table




-- ============================================================
-- Migration 4/5: add_accounts_table.sql
-- ============================================================

-- Accounts table - normalized account-level view for ML/analytics
-- Run this in Supabase SQL editor or via Supabase CLI migrations

CREATE TABLE IF NOT EXISTS accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_domain TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  website_url TEXT,
  last_prospect_intelligence_id UUID REFERENCES prospect_intelligence(id) ON DELETE SET NULL,
  last_icp_score INTEGER,
  last_priority_level TEXT CHECK (last_priority_level IN ('high','medium','low')),
  last_research_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_accounts_domain
  ON accounts(account_domain);

CREATE INDEX IF NOT EXISTS idx_accounts_icp
  ON accounts(last_icp_score DESC NULLS LAST);

-- Function already created in create_prospect_intelligence_table.sql
-- Just create the trigger (function will be reused)

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Internal analytics table; typically queried with service role key
-- No RLS policies yet (not exposed directly to untrusted clients)




-- ============================================================
-- Migration 5/5: add_prospect_intelligence_runs_table.sql
-- ============================================================

-- Prospect intelligence runs table - per-run log for analysis
-- Run this in Supabase SQL editor or via Supabase CLI migrations

CREATE TABLE IF NOT EXISTS prospect_intelligence_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  account_domain TEXT NOT NULL,
  website_url TEXT NOT NULL,
  company_name TEXT,
  run_status TEXT NOT NULL CHECK (run_status IN (
    'success',
    'error',
    'timeout',
    'quota',
    'network_error'
  )),
  icp_score INTEGER,
  priority_level TEXT CHECK (priority_level IN ('high','medium','low')),
  error_type TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pi_runs_domain
  ON prospect_intelligence_runs(account_domain);

CREATE INDEX IF NOT EXISTS idx_pi_runs_user
  ON prospect_intelligence_runs(user_id);

CREATE INDEX IF NOT EXISTS idx_pi_runs_created_at
  ON prospect_intelligence_runs(created_at DESC);

-- No RLS yet; intended for internal analytics via service role



