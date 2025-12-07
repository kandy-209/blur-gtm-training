-- ElevenLabs Advanced Features Database Schema
-- Run this script in Supabase SQL Editor

-- ============================================
-- 1. VOICE COACHING METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS voice_coaching_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES elevenlabs_conversations(conversation_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Real-time metrics
  pace_wpm NUMERIC,
  pitch_hz NUMERIC,
  volume_db NUMERIC,
  pause_count INTEGER DEFAULT 0,
  clarity_score NUMERIC CHECK (clarity_score >= 0 AND clarity_score <= 100),
  confidence_score NUMERIC CHECK (confidence_score >= 0 AND confidence_score <= 100),
  
  -- Aggregated metrics (for periodic updates)
  average_pace NUMERIC,
  average_pitch NUMERIC,
  average_volume NUMERIC,
  
  -- Feedback and coaching
  feedback_messages JSONB DEFAULT '[]'::jsonb,
  coaching_suggestions JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_voice_coaching_conversation_id ON voice_coaching_metrics(conversation_id);
CREATE INDEX IF NOT EXISTS idx_voice_coaching_user_id ON voice_coaching_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_coaching_timestamp ON voice_coaching_metrics(timestamp);

-- ============================================
-- 2. EMOTION DETECTION DATA TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS emotion_detection_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES elevenlabs_conversations(conversation_id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Emotion classification
  emotion TEXT NOT NULL,
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Audio features (for analysis and model improvement)
  audio_features JSONB,
  
  -- Context
  message_id TEXT,
  conversation_turn INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_emotion_conversation_id ON emotion_detection_data(conversation_id);
CREATE INDEX IF NOT EXISTS idx_emotion_user_id ON emotion_detection_data(user_id);
CREATE INDEX IF NOT EXISTS idx_emotion_timestamp ON emotion_detection_data(timestamp);
CREATE INDEX IF NOT EXISTS idx_emotion_role ON emotion_detection_data(role);
CREATE INDEX IF NOT EXISTS idx_emotion_emotion ON emotion_detection_data(emotion);

-- ============================================
-- 3. CONVERSATION AUDIO CHAPTERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversation_audio_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES elevenlabs_conversations(conversation_id) ON DELETE CASCADE,
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_time_seconds NUMERIC NOT NULL,
  end_time_seconds NUMERIC,
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(conversation_id, chapter_number)
);

CREATE INDEX IF NOT EXISTS idx_audio_chapters_conversation_id ON conversation_audio_chapters(conversation_id);
CREATE INDEX IF NOT EXISTS idx_audio_chapters_start_time ON conversation_audio_chapters(conversation_id, start_time_seconds);

-- ============================================
-- 4. UPDATE ELEVENLABS_CONVERSATIONS TABLE
-- ============================================
ALTER TABLE elevenlabs_conversations
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS audio_file_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS audio_format TEXT DEFAULT 'mp3',
ADD COLUMN IF NOT EXISTS chapter_markers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS highlight_moments JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS voice_coaching_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS emotion_detection_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS audio_recording_enabled BOOLEAN DEFAULT false;

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE voice_coaching_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_detection_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_audio_chapters ENABLE ROW LEVEL SECURITY;

-- Voice Coaching Metrics Policies
DROP POLICY IF EXISTS "Users can view own voice metrics" ON voice_coaching_metrics;
CREATE POLICY "Users can view own voice metrics" ON voice_coaching_metrics
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own voice metrics" ON voice_coaching_metrics;
CREATE POLICY "Users can insert own voice metrics" ON voice_coaching_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own voice metrics" ON voice_coaching_metrics;
CREATE POLICY "Users can update own voice metrics" ON voice_coaching_metrics
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own voice metrics" ON voice_coaching_metrics;
CREATE POLICY "Users can delete own voice metrics" ON voice_coaching_metrics
  FOR DELETE USING (auth.uid() = user_id);

-- Emotion Detection Data Policies
DROP POLICY IF EXISTS "Users can view own emotion data" ON emotion_detection_data;
CREATE POLICY "Users can view own emotion data" ON emotion_detection_data
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own emotion data" ON emotion_detection_data;
CREATE POLICY "Users can insert own emotion data" ON emotion_detection_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own emotion data" ON emotion_detection_data;
CREATE POLICY "Users can update own emotion data" ON emotion_detection_data
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own emotion data" ON emotion_detection_data;
CREATE POLICY "Users can delete own emotion data" ON emotion_detection_data
  FOR DELETE USING (auth.uid() = user_id);

-- Audio Chapters Policies
DROP POLICY IF EXISTS "Users can view own audio chapters" ON conversation_audio_chapters;
CREATE POLICY "Users can view own audio chapters" ON conversation_audio_chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM elevenlabs_conversations
      WHERE conversation_id = conversation_audio_chapters.conversation_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert own audio chapters" ON conversation_audio_chapters;
CREATE POLICY "Users can insert own audio chapters" ON conversation_audio_chapters
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM elevenlabs_conversations
      WHERE conversation_id = conversation_audio_chapters.conversation_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update own audio chapters" ON conversation_audio_chapters;
CREATE POLICY "Users can update own audio chapters" ON conversation_audio_chapters
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM elevenlabs_conversations
      WHERE conversation_id = conversation_audio_chapters.conversation_id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete own audio chapters" ON conversation_audio_chapters;
CREATE POLICY "Users can delete own audio chapters" ON conversation_audio_chapters
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM elevenlabs_conversations
      WHERE conversation_id = conversation_audio_chapters.conversation_id
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- 6. HELPER FUNCTIONS
-- ============================================

-- Function to get average voice metrics for a conversation
CREATE OR REPLACE FUNCTION get_conversation_voice_metrics(p_conversation_id TEXT)
RETURNS TABLE (
  avg_pace NUMERIC,
  avg_pitch NUMERIC,
  avg_volume NUMERIC,
  avg_clarity NUMERIC,
  avg_confidence NUMERIC,
  total_samples INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    AVG(pace_wpm)::NUMERIC as avg_pace,
    AVG(pitch_hz)::NUMERIC as avg_pitch,
    AVG(volume_db)::NUMERIC as avg_volume,
    AVG(clarity_score)::NUMERIC as avg_clarity,
    AVG(confidence_score)::NUMERIC as avg_confidence,
    COUNT(*)::INTEGER as total_samples
  FROM voice_coaching_metrics
  WHERE conversation_id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get dominant emotion for a conversation
CREATE OR REPLACE FUNCTION get_conversation_dominant_emotion(
  p_conversation_id TEXT,
  p_role TEXT DEFAULT NULL
)
RETURNS TABLE (
  emotion TEXT,
  count BIGINT,
  avg_confidence NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.emotion,
    COUNT(*)::BIGINT as count,
    AVG(e.confidence)::NUMERIC as avg_confidence
  FROM emotion_detection_data e
  WHERE e.conversation_id = p_conversation_id
    AND (p_role IS NULL OR e.role = p_role)
  GROUP BY e.emotion
  ORDER BY count DESC, avg_confidence DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. USER VOICE SESSIONS TABLE (for user modeling)
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
-- 8. USER VOICE PROFILES TABLE
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
-- 9. USER IMPACT ANALYSES TABLE
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
-- 10. RLS FOR USER TABLES
-- ============================================
ALTER TABLE user_voice_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_voice_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_impact_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own sessions" ON user_voice_sessions;
CREATE POLICY "Users can view own sessions" ON user_voice_sessions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own sessions" ON user_voice_sessions;
CREATE POLICY "Users can insert own sessions" ON user_voice_sessions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own profile" ON user_voice_profiles;
CREATE POLICY "Users can view own profile" ON user_voice_profiles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON user_voice_profiles;
CREATE POLICY "Users can update own profile" ON user_voice_profiles
  FOR ALL USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view own analyses" ON user_impact_analyses;
CREATE POLICY "Users can view own analyses" ON user_impact_analyses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own analyses" ON user_impact_analyses;
CREATE POLICY "Users can insert own analyses" ON user_impact_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 11. COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE voice_coaching_metrics IS 'Stores real-time voice metrics during ElevenLabs conversations for coaching feedback';
COMMENT ON TABLE emotion_detection_data IS 'Stores emotion detection results for both user and assistant during conversations';
COMMENT ON TABLE conversation_audio_chapters IS 'Stores chapter markers for conversation audio replay navigation';

COMMENT ON COLUMN voice_coaching_metrics.pace_wpm IS 'Words per minute speaking pace';
COMMENT ON COLUMN voice_coaching_metrics.pitch_hz IS 'Voice pitch in Hertz';
COMMENT ON COLUMN voice_coaching_metrics.volume_db IS 'Voice volume in decibels';
COMMENT ON COLUMN voice_coaching_metrics.clarity_score IS 'Speech clarity score 0-100';
COMMENT ON COLUMN voice_coaching_metrics.confidence_score IS 'Voice confidence/stability score 0-100';

COMMENT ON COLUMN emotion_detection_data.emotion IS 'Detected emotion label (e.g., happy, sad, excited, skeptical)';
COMMENT ON COLUMN emotion_detection_data.confidence IS 'Confidence score 0-1 for emotion classification';
COMMENT ON COLUMN emotion_detection_data.audio_features IS 'Raw audio features used for emotion classification';

