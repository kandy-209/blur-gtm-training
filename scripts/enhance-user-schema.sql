-- Enhanced User Schema for Cursor GTM Training Platform
-- Run this in Supabase SQL Editor to enhance user data capabilities

-- ============================================
-- 1. ENHANCE USER_PROFILES TABLE
-- ============================================
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS 
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_data JSONB DEFAULT '{}',
  last_active_at TIMESTAMP WITH TIME ZONE,
  total_sessions INTEGER DEFAULT 0,
  total_scenarios_completed INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced', 'expert')) DEFAULT 'beginner',
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en-US',
  metadata JSONB DEFAULT '{}';

-- ============================================
-- 2. CREATE USER_PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  notifications JSONB DEFAULT '{
    "email": true,
    "push": false,
    "session_reminders": true,
    "achievements": true,
    "leaderboard_updates": true
  }',
  display_preferences JSONB DEFAULT '{
    "theme": "light",
    "font_size": "medium",
    "high_contrast": false,
    "reduced_motion": false
  }',
  training_preferences JSONB DEFAULT '{
    "difficulty": "adaptive",
    "scenario_types": [],
    "voice_enabled": false,
    "auto_feedback": true
  }',
  privacy_settings JSONB DEFAULT '{
    "profile_visible": true,
    "show_stats": true,
    "allow_ratings": true
  }',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 3. CREATE USER_ACTIVITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN (
    'signup', 'login', 'logout', 'scenario_start', 'scenario_complete',
    'session_start', 'session_complete', 'profile_update', 'preference_update',
    'rating_given', 'rating_received', 'achievement_unlocked'
  )),
  activity_data JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 4. CREATE USER_STATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS user_stats (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  total_sessions INTEGER DEFAULT 0,
  total_scenarios_completed INTEGER DEFAULT 0,
  total_turns INTEGER DEFAULT 0,
  total_time_spent_minutes INTEGER DEFAULT 0,
  average_score NUMERIC(5,2) DEFAULT 0,
  highest_score INTEGER DEFAULT 0,
  win_rate NUMERIC(5,2) DEFAULT 0,
  total_wins INTEGER DEFAULT 0,
  total_losses INTEGER DEFAULT 0,
  streak_current INTEGER DEFAULT 0,
  streak_longest INTEGER DEFAULT 0,
  achievements_unlocked INTEGER DEFAULT 0,
  last_session_at TIMESTAMP WITH TIME ZONE,
  last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. CREATE INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_last_active ON user_profiles(last_active_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_profiles_skill_level ON user_profiles(skill_level);
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_user_id ON user_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_type ON user_activity(activity_type);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON user_activity(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_stats_last_session ON user_stats(last_session_at DESC);

-- ============================================
-- 6. CREATE TRIGGER FOR AUTO-PROFILE CREATION
-- ============================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    email,
    username,
    full_name,
    role_at_cursor,
    job_title,
    department,
    onboarding_completed,
    last_active_at,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'role_at_cursor', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'job_title', 'Unknown'),
    NEW.raw_user_meta_data->>'department',
    FALSE,
    NOW(),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;

  -- Create default preferences
  INSERT INTO public.user_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Create default stats
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Log signup activity
  INSERT INTO public.user_activity (user_id, activity_type, activity_data)
  VALUES (
    NEW.id,
    'signup',
    jsonb_build_object(
      'email', NEW.email,
      'provider', NEW.app_metadata->>'provider',
      'created_at', NEW.created_at
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================
-- 7. CREATE FUNCTION TO UPDATE LAST_ACTIVE_AT
-- ============================================
CREATE OR REPLACE FUNCTION update_user_last_active()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE user_profiles
  SET last_active_at = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_last_active_on_activity ON user_activity;
CREATE TRIGGER update_last_active_on_activity
  AFTER INSERT ON user_activity
  FOR EACH ROW
  EXECUTE FUNCTION update_user_last_active();

-- ============================================
-- 8. CREATE FUNCTION TO UPDATE USER_STATS
-- ============================================
CREATE OR REPLACE FUNCTION update_user_stats_on_session_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Update rep stats
    UPDATE user_stats
    SET 
      total_sessions = total_sessions + 1,
      last_session_at = NOW(),
      last_updated_at = NOW()
    WHERE user_id = NEW.rep_user_id;

    -- Update prospect stats
    UPDATE user_stats
    SET 
      total_sessions = total_sessions + 1,
      last_session_at = NOW(),
      last_updated_at = NOW()
    WHERE user_id = NEW.prospect_user_id;

    -- Update wins/losses
    IF NEW.rep_score > NEW.prospect_score THEN
      UPDATE user_stats
      SET total_wins = total_wins + 1
      WHERE user_id = NEW.rep_user_id;

      UPDATE user_stats
      SET total_losses = total_losses + 1
      WHERE user_id = NEW.prospect_user_id;
    ELSIF NEW.prospect_score > NEW.rep_score THEN
      UPDATE user_stats
      SET total_wins = total_wins + 1
      WHERE user_id = NEW.prospect_user_id;

      UPDATE user_stats
      SET total_losses = total_losses + 1
      WHERE user_id = NEW.rep_user_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_stats_on_session_complete ON live_sessions;
CREATE TRIGGER update_stats_on_session_complete
  AFTER UPDATE ON live_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_session_complete();

-- ============================================
-- 9. RLS POLICIES FOR NEW TABLES
-- ============================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;

-- User Preferences Policies
DROP POLICY IF EXISTS "Users can view own preferences" ON user_preferences;
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own preferences" ON user_preferences;
CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own preferences" ON user_preferences;
CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Activity Policies
DROP POLICY IF EXISTS "Users can view own activity" ON user_activity;
CREATE POLICY "Users can view own activity" ON user_activity
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert activity" ON user_activity;
CREATE POLICY "Service role can insert activity" ON user_activity
  FOR INSERT WITH CHECK (true); -- Service role bypasses RLS

-- User Stats Policies
DROP POLICY IF EXISTS "Users can view own stats" ON user_stats;
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view all stats for leaderboard" ON user_stats;
CREATE POLICY "Users can view all stats for leaderboard" ON user_stats
  FOR SELECT USING (true); -- Public stats for leaderboard

-- ============================================
-- 10. TRIGGER TO UPDATE UPDATED_AT
-- ============================================
DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ✅ ENHANCED USER SCHEMA COMPLETE!
-- ============================================
-- Features added:
-- 1. Enhanced user_profiles with onboarding, activity tracking, and stats
-- 2. User preferences table for notifications, display, training, privacy
-- 3. User activity table for audit logging
-- 4. User stats table for performance metrics
-- 5. Automatic profile creation trigger
-- 6. Automatic stats updates
-- 7. RLS policies for security
-- ============================================

