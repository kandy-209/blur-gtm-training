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

