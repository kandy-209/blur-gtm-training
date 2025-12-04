-- ElevenLabs Conversations Table
-- Run this in Supabase SQL Editor to enable conversation persistence

CREATE TABLE IF NOT EXISTS elevenlabs_conversations (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  scenario_id TEXT,
  agent_id TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_ms INTEGER,
  message_count INTEGER DEFAULT 0,
  user_message_count INTEGER DEFAULT 0,
  assistant_message_count INTEGER DEFAULT 0,
  total_words INTEGER DEFAULT 0,
  average_words_per_message NUMERIC DEFAULT 0,
  conversation_data JSONB,
  messages JSONB DEFAULT '[]'::jsonb,
  metrics JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_elevenlabs_conversations_user_id ON elevenlabs_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_elevenlabs_conversations_scenario_id ON elevenlabs_conversations(scenario_id);
CREATE INDEX IF NOT EXISTS idx_elevenlabs_conversations_agent_id ON elevenlabs_conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_elevenlabs_conversations_start_time ON elevenlabs_conversations(start_time);
CREATE INDEX IF NOT EXISTS idx_elevenlabs_conversations_conversation_id ON elevenlabs_conversations(conversation_id);

-- Enable RLS
ALTER TABLE elevenlabs_conversations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own conversations
CREATE POLICY "Users can view own conversations" ON elevenlabs_conversations
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own conversations
CREATE POLICY "Users can insert own conversations" ON elevenlabs_conversations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own conversations
CREATE POLICY "Users can update own conversations" ON elevenlabs_conversations
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own conversations
CREATE POLICY "Users can delete own conversations" ON elevenlabs_conversations
  FOR DELETE USING (auth.uid() = user_id);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON elevenlabs_conversations TO authenticated;
GRANT SELECT ON elevenlabs_conversations TO anon;

