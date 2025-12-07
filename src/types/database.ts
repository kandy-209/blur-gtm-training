/**
 * Supabase Database Types
 * Type definitions for Supabase tables
 */

export interface VoiceCoachingMetrics {
  id: string;
  conversation_id: string;
  user_id?: string | null;
  timestamp: string;
  pace_wpm?: number | null;
  pitch_hz?: number | null;
  volume_db?: number | null;
  pause_count: number;
  clarity_score?: number | null;
  confidence_score?: number | null;
  average_pace?: number | null;
  average_pitch?: number | null;
  average_volume?: number | null;
  feedback_messages?: any[];
  coaching_suggestions?: any[];
  created_at?: string;
}

export interface UserVoiceSession {
  id: string;
  user_id: string;
  conversation_id: string;
  session_date: string;
  metrics: any; // VoiceMetrics JSON
  feedback: any[]; // FeedbackMessage[] JSON
  suggestions: any[]; // CoachingSuggestion[] JSON
  duration_ms: number;
  created_at?: string;
  updated_at?: string;
}

export interface UserVoiceProfile {
  id: string;
  user_id: string;
  baseline_metrics: any; // VoiceMetrics JSON
  current_metrics: any; // VoiceMetrics JSON
  improvement_trend: any; // ImprovementTrend JSON
  sessions_completed: number;
  last_session_date?: string;
  created_at: string;
  updated_at: string;
}

export interface UserImpactAnalysis {
  id: string;
  user_id: string;
  analysis_data: any; // ImpactAnalysis JSON
  created_at: string;
}

export interface ConversationRecord {
  id: string;
  conversation_id: string;
  user_id?: string | null;
  scenario_id?: string | null;
  agent_id?: string | null;
  start_time: string;
  end_time?: string | null;
  duration_ms?: number | null;
  message_count: number;
  user_message_count: number;
  assistant_message_count: number;
  average_response_time?: number | null;
  total_words: number;
  average_words_per_message: number;
  sentiment?: {
    positive: number;
    neutral: number;
    negative: number;
  } | null;
  topics?: string[] | null;
  key_phrases?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

