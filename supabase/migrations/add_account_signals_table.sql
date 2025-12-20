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

