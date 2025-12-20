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

