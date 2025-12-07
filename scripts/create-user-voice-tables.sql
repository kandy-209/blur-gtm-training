-- User Voice Coaching Tables
-- Additional tables for user modeling and impact tracking

-- ============================================
-- 1. USER VOICE SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_voice_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id TEXT NOT NULL,
  session_date TIMESTAMP WITH TIME ZONE NOT NULL,
  metrics JSONB NOT NULL,
  feedback JSONB DEFAULT '[]'::jsonb,
  suggestions JSONB DEFAULT '[]'::jsonb,
  duration_ms INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_voice_sessions_user_id ON user_voice_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_voice_sessions_session_date ON user_voice_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_user_voice_sessions_conversation_id ON user_voice_sessions(conversation_id);

-- ============================================
-- 2. USER VOICE PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_voice_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  baseline_metrics JSONB NOT NULL,
  current_metrics JSONB NOT NULL,
  improvement_trend JSONB NOT NULL,
  sessions_completed INTEGER DEFAULT 0,
  total_practice_time_ms BIGINT DEFAULT 0,
  last_session_date TIMESTAMP WITH TIME ZONE,
  strengths TEXT[] DEFAULT '{}',
  areas_for_improvement TEXT[] DEFAULT '{}',
  impact_score JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_voice_profiles_updated_at ON user_voice_profiles(updated_at DESC);

-- ============================================
-- 3. USER IMPACT ANALYSES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_impact_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_impact_analyses_user_id ON user_impact_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_impact_analyses_created_at ON user_impact_analyses(created_at DESC);

-- ============================================
-- 4. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_impact_analyses ENABLE ROW LEVEL SECURITY;

-- User Voice Sessions Policies
DROP POLICY IF EXISTS "Users can view own sessions" ON user_voice_sessions;
CREATE POLICY "Users can view own sessions" ON user_voice_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON user_voice_sessions;
CREATE POLICY "Users can insert own sessions" ON user_voice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Voice Profiles Policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_voice_profiles;
CREATE POLICY "Users can view own profile" ON user_voice_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_voice_profiles;
CREATE POLICY "Users can update own profile" ON user_voice_profiles
  FOR ALL USING (auth.uid() = user_id);

-- User Impact Analyses Policies
DROP POLICY IF EXISTS "Users can view own analyses" ON user_impact_analyses;
CREATE POLICY "Users can view own analyses" ON user_impact_analyses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analyses" ON user_impact_analyses;
CREATE POLICY "Users can insert own analyses" ON user_impact_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

