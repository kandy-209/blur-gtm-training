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

CREATE TRIGGER update_prospect_intelligence_updated_at 
  BEFORE UPDATE ON prospect_intelligence
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE prospect_intelligence ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
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
