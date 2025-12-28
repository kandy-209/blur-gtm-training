-- Database Setup for Enhanced Analytics
-- Run this in your Supabase SQL Editor

-- Page Views Table
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path VARCHAR(500) NOT NULL,
  title VARCHAR(500),
  referrer VARCHAR(1000),
  session_id VARCHAR(100),
  user_id VARCHAR(100),
  viewport VARCHAR(50),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Engagement Events Table
CREATE TABLE IF NOT EXISTS engagement_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  engagement_type VARCHAR(50) NOT NULL,
  element TEXT,
  value NUMERIC,
  path VARCHAR(500) NOT NULL,
  session_id VARCHAR(100),
  user_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Metrics Table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  metric VARCHAR(10) NOT NULL CHECK (metric IN ('LCP', 'FID', 'CLS', 'TTFB', 'FCP')),
  value NUMERIC NOT NULL,
  path VARCHAR(500) NOT NULL,
  session_id VARCHAR(100),
  user_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path);
CREATE INDEX IF NOT EXISTS idx_page_views_user ON page_views(user_id);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);

CREATE INDEX IF NOT EXISTS idx_engagement_type ON engagement_events(engagement_type);
CREATE INDEX IF NOT EXISTS idx_engagement_path ON engagement_events(path);
CREATE INDEX IF NOT EXISTS idx_engagement_user ON engagement_events(user_id);
CREATE INDEX IF NOT EXISTS idx_engagement_session ON engagement_events(session_id);
CREATE INDEX IF NOT EXISTS idx_engagement_created ON engagement_events(created_at);

CREATE INDEX IF NOT EXISTS idx_performance_metric ON performance_metrics(metric);
CREATE INDEX IF NOT EXISTS idx_performance_path ON performance_metrics(path);
CREATE INDEX IF NOT EXISTS idx_performance_user ON performance_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_performance_session ON performance_metrics(session_id);
CREATE INDEX IF NOT EXISTS idx_performance_created ON performance_metrics(created_at);

-- Row Level Security (RLS) Policies
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE engagement_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Allow service role to insert (for API routes)
CREATE POLICY IF NOT EXISTS "Service role can insert page_views"
  ON page_views FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role can insert engagement_events"
  ON engagement_events FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Service role can insert performance_metrics"
  ON performance_metrics FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow authenticated users to view their own data
CREATE POLICY IF NOT EXISTS "Users can view their own page_views"
  ON page_views FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "Users can view their own engagement_events"
  ON engagement_events FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY IF NOT EXISTS "Users can view their own performance_metrics"
  ON performance_metrics FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Grant permissions
GRANT INSERT, SELECT ON page_views TO service_role;
GRANT INSERT, SELECT ON engagement_events TO service_role;
GRANT INSERT, SELECT ON performance_metrics TO service_role;

-- Comments for documentation
COMMENT ON TABLE page_views IS 'Tracks page views with metadata for analytics';
COMMENT ON TABLE engagement_events IS 'Tracks user engagement events (scroll, clicks, etc.)';
COMMENT ON TABLE performance_metrics IS 'Tracks Core Web Vitals and performance metrics';

