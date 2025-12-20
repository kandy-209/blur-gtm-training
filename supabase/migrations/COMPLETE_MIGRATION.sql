-- ============================================================
-- COMPLETE MIGRATION - Run this ONE file only
-- This is fully idempotent and handles all edge cases
-- ============================================================

-- Step 1: Safely drop existing triggers (only if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prospect_intelligence') THEN
    DROP TRIGGER IF EXISTS update_prospect_intelligence_updated_at ON prospect_intelligence;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'account_signals') THEN
    DROP TRIGGER IF EXISTS update_account_signals_updated_at ON account_signals;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'accounts') THEN
    DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
  END IF;
END $$;

-- Step 2: Safely drop existing policies (only if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'prospect_intelligence') THEN
    DROP POLICY IF EXISTS "Users can view their own prospects" ON prospect_intelligence;
    DROP POLICY IF EXISTS "Users can insert their own prospects" ON prospect_intelligence;
    DROP POLICY IF EXISTS "Users can update their own prospects" ON prospect_intelligence;
    DROP POLICY IF EXISTS "Users can delete their own prospects" ON prospect_intelligence;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_interactions') THEN
    DROP POLICY IF EXISTS "Users can view their own interactions" ON user_interactions;
    DROP POLICY IF EXISTS "Users can insert their own interactions" ON user_interactions;
    DROP POLICY IF EXISTS "Users cannot update interactions" ON user_interactions;
    DROP POLICY IF EXISTS "Users cannot delete interactions" ON user_interactions;
  END IF;
END $$;

-- Step 3: Drop indexes
DROP INDEX IF EXISTS idx_prospect_intelligence_user_website;

-- ============================================================
-- Migration 1: prospect_intelligence table
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_user_id ON prospect_intelligence(user_id);
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_priority ON prospect_intelligence(priority_level);
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_icp_score ON prospect_intelligence(icp_score);
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_created_at ON prospect_intelligence(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospect_intelligence_website_url ON prospect_intelligence(website_url);

DROP INDEX IF EXISTS idx_prospect_intelligence_user_website;
CREATE UNIQUE INDEX idx_prospect_intelligence_user_website 
  ON prospect_intelligence(user_id, website_url);

-- Function for updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger
DROP TRIGGER IF EXISTS update_prospect_intelligence_updated_at ON prospect_intelligence;
CREATE TRIGGER update_prospect_intelligence_updated_at 
  BEFORE UPDATE ON prospect_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS
ALTER TABLE prospect_intelligence ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own prospects" ON prospect_intelligence;
DROP POLICY IF EXISTS "Users can insert their own prospects" ON prospect_intelligence;
DROP POLICY IF EXISTS "Users can update their own prospects" ON prospect_intelligence;
DROP POLICY IF EXISTS "Users can delete their own prospects" ON prospect_intelligence;

CREATE POLICY "Users can view their own prospects"
  ON prospect_intelligence FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own prospects"
  ON prospect_intelligence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own prospects"
  ON prospect_intelligence FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own prospects"
  ON prospect_intelligence FOR DELETE
  USING (auth.uid() = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON prospect_intelligence TO authenticated;

-- ============================================================
-- Migration 2: user_interactions table
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_user_interactions_user_id ON user_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interactions_domain ON user_interactions(account_domain);

ALTER TABLE user_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users can insert their own interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users cannot update interactions" ON user_interactions;
DROP POLICY IF EXISTS "Users cannot delete interactions" ON user_interactions;

CREATE POLICY "Users can view their own interactions"
  ON user_interactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions"
  ON user_interactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users cannot update interactions"
  ON user_interactions FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete interactions"
  ON user_interactions FOR DELETE
  USING (false);

GRANT SELECT, INSERT ON user_interactions TO authenticated;

-- ============================================================
-- Migration 3: account_signals table
-- ============================================================

CREATE TABLE IF NOT EXISTS account_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_domain TEXT NOT NULL UNIQUE,
  company_name TEXT NOT NULL,
  icp_score INTEGER,
  priority_level TEXT CHECK (priority_level IN ('high','medium','low')),
  has_open_engineering_roles BOOLEAN,
  engineering_role_count INTEGER,
  total_open_roles INTEGER,
  has_engineering_blog BOOLEAN,
  last_research_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_account_signals_domain ON account_signals(account_domain);
CREATE INDEX IF NOT EXISTS idx_account_signals_icp ON account_signals(icp_score DESC NULLS LAST);

DROP TRIGGER IF EXISTS update_account_signals_updated_at ON account_signals;
CREATE TRIGGER update_account_signals_updated_at
  BEFORE UPDATE ON account_signals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Migration 4: accounts table
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_accounts_domain ON accounts(account_domain);
CREATE INDEX IF NOT EXISTS idx_accounts_icp ON accounts(last_icp_score DESC NULLS LAST);

DROP TRIGGER IF EXISTS update_accounts_updated_at ON accounts;
CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- Migration 5: prospect_intelligence_runs table
-- ============================================================

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

CREATE INDEX IF NOT EXISTS idx_pi_runs_domain ON prospect_intelligence_runs(account_domain);
CREATE INDEX IF NOT EXISTS idx_pi_runs_user ON prospect_intelligence_runs(user_id);
CREATE INDEX IF NOT EXISTS idx_pi_runs_created_at ON prospect_intelligence_runs(created_at DESC);

-- ============================================================
-- Migration Complete!
-- ============================================================
