-- Supabase Database Setup for Cursor GTM Training Platform
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard → SQL Editor → New Query

-- ============================================
-- 1. USER PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT NOT NULL UNIQUE,
  full_name TEXT,
  role_at_cursor TEXT NOT NULL,
  job_title TEXT NOT NULL,
  department TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 2. USER RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  rater_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rated_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback TEXT,
  category TEXT NOT NULL CHECK (category IN ('communication', 'product_knowledge', 'objection_handling', 'closing', 'overall')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. LIVE SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS live_sessions (
  id TEXT PRIMARY KEY,
  scenario_id TEXT NOT NULL,
  rep_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  prospect_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('waiting', 'active', 'completed', 'cancelled')),
  rep_score INTEGER DEFAULT 0,
  prospect_score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 4. LIVE MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS live_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES live_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('rep', 'prospect')),
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('text', 'voice', 'system')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_ratings_rated_user_id ON user_ratings(rated_user_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_session_id ON user_ratings(session_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_category ON user_ratings(category);
CREATE INDEX IF NOT EXISTS idx_live_sessions_rep_user_id ON live_sessions(rep_user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_prospect_user_id ON live_sessions(prospect_user_id);
CREATE INDEX IF NOT EXISTS idx_live_sessions_status ON live_sessions(status);
CREATE INDEX IF NOT EXISTS idx_live_messages_session_id ON live_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_live_messages_user_id ON live_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);

-- ============================================
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE live_messages ENABLE ROW LEVEL SECURITY;

-- ============================================
-- 7. RLS POLICIES FOR USER_PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view all profiles" ON user_profiles;
CREATE POLICY "Users can view all profiles" ON user_profiles
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 8. RLS POLICIES FOR USER_RATINGS
-- ============================================
DROP POLICY IF EXISTS "Users can view all ratings" ON user_ratings;
CREATE POLICY "Users can view all ratings" ON user_ratings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create ratings" ON user_ratings;
CREATE POLICY "Users can create ratings" ON user_ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_user_id);

-- ============================================
-- 9. RLS POLICIES FOR LIVE_SESSIONS
-- ============================================
DROP POLICY IF EXISTS "Users can view own sessions" ON live_sessions;
CREATE POLICY "Users can view own sessions" ON live_sessions
  FOR SELECT USING (auth.uid() = rep_user_id OR auth.uid() = prospect_user_id);

DROP POLICY IF EXISTS "Users can create sessions" ON live_sessions;
CREATE POLICY "Users can create sessions" ON live_sessions
  FOR INSERT WITH CHECK (auth.uid() = rep_user_id OR auth.uid() = prospect_user_id);

DROP POLICY IF EXISTS "Users can update own sessions" ON live_sessions;
CREATE POLICY "Users can update own sessions" ON live_sessions
  FOR UPDATE USING (auth.uid() = rep_user_id OR auth.uid() = prospect_user_id);

-- ============================================
-- 10. RLS POLICIES FOR LIVE_MESSAGES
-- ============================================
DROP POLICY IF EXISTS "Users can view messages in own sessions" ON live_messages;
CREATE POLICY "Users can view messages in own sessions" ON live_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM live_sessions
      WHERE live_sessions.id = live_messages.session_id
      AND (live_sessions.rep_user_id = auth.uid() OR live_sessions.prospect_user_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "Users can create messages in own sessions" ON live_messages;
CREATE POLICY "Users can create messages in own sessions" ON live_messages
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM live_sessions
      WHERE live_sessions.id = live_messages.session_id
      AND (live_sessions.rep_user_id = auth.uid() OR live_sessions.prospect_user_id = auth.uid())
    )
  );

-- ============================================
-- 11. FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 12. TRIGGER TO AUTO-UPDATE UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ✅ SETUP COMPLETE!
-- ============================================
-- Next steps:
-- 1. Enable Email authentication in Supabase Dashboard
-- 2. Set environment variables in .env.local
-- 3. Restart your Next.js dev server
-- ============================================

