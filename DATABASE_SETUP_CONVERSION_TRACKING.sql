-- Database Setup for Conversion Tracking
-- Run this in your Supabase SQL Editor
-- This adds conversion event tracking for sales enablement analytics

-- Conversion Events Table
CREATE TABLE IF NOT EXISTS conversion_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type VARCHAR(50) NOT NULL,
  scenario_id VARCHAR(100),
  user_id VARCHAR(100) NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_conversion_events_type ON conversion_events(event_type);
CREATE INDEX IF NOT EXISTS idx_conversion_events_scenario ON conversion_events(scenario_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_user ON conversion_events(user_id);
CREATE INDEX IF NOT EXISTS idx_conversion_events_created ON conversion_events(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE conversion_events ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (for API routes)
CREATE POLICY IF NOT EXISTS "Service role can insert conversion_events"
  ON conversion_events FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to view their own data
CREATE POLICY IF NOT EXISTS "Users can view their own conversion_events"
  ON conversion_events FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Grant permissions
GRANT INSERT, SELECT ON conversion_events TO service_role;

-- Comments for documentation
COMMENT ON TABLE conversion_events IS 'Tracks conversion events (scenario_complete, meeting_booked, demo_requested, etc.) for sales enablement analytics';

