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

