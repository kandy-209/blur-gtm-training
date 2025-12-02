-- Database Migration Script for Production
-- Run this script in your Supabase SQL editor or PostgreSQL database

-- Create user_responses table
CREATE TABLE IF NOT EXISTS user_responses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  turn_number INTEGER NOT NULL,
  objection_category TEXT NOT NULL,
  user_message TEXT NOT NULL,
  ai_response TEXT NOT NULL,
  evaluation TEXT NOT NULL CHECK (evaluation IN ('PASS', 'FAIL', 'REJECT')),
  confidence_score INTEGER NOT NULL CHECK (confidence_score >= 50 AND confidence_score <= 100),
  key_points_mentioned TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create technical_questions table
CREATE TABLE IF NOT EXISTS technical_questions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  scenario_id TEXT NOT NULL,
  question TEXT NOT NULL,
  category TEXT NOT NULL,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_responses_user_id ON user_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_scenario_id ON user_responses(scenario_id);
CREATE INDEX IF NOT EXISTS idx_user_responses_objection_category ON user_responses(objection_category);
CREATE INDEX IF NOT EXISTS idx_user_responses_created_at ON user_responses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_responses_evaluation ON user_responses(evaluation);
CREATE INDEX IF NOT EXISTS idx_user_responses_confidence_score ON user_responses(confidence_score DESC);

CREATE INDEX IF NOT EXISTS idx_technical_questions_scenario_id ON technical_questions(scenario_id);
CREATE INDEX IF NOT EXISTS idx_technical_questions_category ON technical_questions(category);
CREATE INDEX IF NOT EXISTS idx_technical_questions_upvotes ON technical_questions(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_technical_questions_created_at ON technical_questions(created_at DESC);

-- Enable Row Level Security (optional but recommended for multi-tenant)
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE technical_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write (adjust based on your security needs)
-- For public access (training platform):
CREATE POLICY "Allow public read access" ON user_responses 
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON user_responses 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access" ON technical_questions 
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert" ON technical_questions 
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update" ON technical_questions 
  FOR UPDATE USING (true);

-- For authenticated-only access (uncomment if needed):
-- CREATE POLICY "Allow authenticated read" ON user_responses 
--   FOR SELECT USING (auth.role() = 'authenticated');
-- 
-- CREATE POLICY "Allow authenticated insert" ON user_responses 
--   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create function to get top responses (for better performance)
CREATE OR REPLACE FUNCTION get_top_responses(
  p_scenario_id TEXT DEFAULT NULL,
  p_objection_category TEXT DEFAULT NULL,
  p_min_score INTEGER DEFAULT 70,
  p_limit INTEGER DEFAULT 20
)
RETURNS TABLE (
  response TEXT,
  count BIGINT,
  average_score NUMERIC,
  success_rate NUMERIC,
  scenario_id TEXT,
  objection_category TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.user_message AS response,
    COUNT(*)::BIGINT AS count,
    AVG(ur.confidence_score)::NUMERIC(5,2) AS average_score,
    (COUNT(*) FILTER (WHERE ur.evaluation = 'PASS')::NUMERIC / COUNT(*)::NUMERIC * 100)::NUMERIC(5,2) AS success_rate,
    ur.scenario_id,
    ur.objection_category
  FROM user_responses ur
  WHERE 
    (p_scenario_id IS NULL OR ur.scenario_id = p_scenario_id)
    AND (p_objection_category IS NULL OR ur.objection_category = p_objection_category)
    AND ur.confidence_score >= p_min_score
  GROUP BY ur.user_message, ur.scenario_id, ur.objection_category
  ORDER BY count DESC, success_rate DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions (adjust based on your setup)
-- GRANT SELECT, INSERT ON user_responses TO authenticated;
-- GRANT SELECT, INSERT, UPDATE ON technical_questions TO authenticated;

