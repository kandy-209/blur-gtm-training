/**
 * ElevenLabs Conversation Database Integration
 * Persists conversations to Supabase database
 */

import { createClient } from '@supabase/supabase-js';
import type { MessageEvent } from '@/types/elevenlabs';
import type { ConversationAnalytics, ConversationMetrics } from './elevenlabs-analytics';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Failed to initialize Supabase client for ElevenLabs:', error);
  }
}

export interface ConversationRecord {
  id: string;
  conversation_id: string;
  user_id?: string;
  scenario_id?: string;
  agent_id?: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  message_count: number;
  user_message_count: number;
  assistant_message_count: number;
  total_words: number;
  average_words_per_message: number;
  conversation_data: any; // JSONB
  messages: any[]; // JSONB array
  metrics: any; // JSONB
  created_at?: string;
  updated_at?: string;
}

export class ElevenLabsConversationDB {
  private ensureSupabase() {
    if (!supabase) {
      throw new Error('Supabase client not initialized. Please check your environment variables.');
    }
    return supabase;
  }

  /**
   * Save conversation to database
   */
  async saveConversation(
    conversationId: string,
    userId: string | undefined,
    scenarioId: string | undefined,
    agentId: string | undefined,
    metrics: ConversationMetrics,
    messages: MessageEvent[]
  ): Promise<void> {
    const db = this.ensureSupabase();

    const record: Partial<ConversationRecord> = {
      conversation_id: conversationId,
      user_id: userId,
      scenario_id: scenarioId,
      agent_id: agentId,
      start_time: metrics.startTime.toISOString(),
      end_time: metrics.endTime?.toISOString(),
      duration_ms: metrics.duration,
      message_count: metrics.messageCount,
      user_message_count: metrics.userMessageCount,
      assistant_message_count: metrics.assistantMessageCount,
      total_words: metrics.totalWords,
      average_words_per_message: metrics.averageWordsPerMessage,
      conversation_data: {
        scenarioId,
        agentId,
        startTime: metrics.startTime.toISOString(),
        endTime: metrics.endTime?.toISOString(),
      },
      messages: messages.map(msg => ({
        type: msg.type,
        role: msg.role,
        message: msg.message,
        timestamp: msg.timestamp,
      })),
      metrics: {
        sentiment: metrics.sentiment,
        topics: metrics.topics,
        keyPhrases: metrics.keyPhrases,
      },
    };

    const { error } = await (db
      .from('elevenlabs_conversations') as any)
      .upsert({
        id: conversationId,
        ...record,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'id'
      });

    if (error) {
      console.error('Error saving conversation to database:', error);
      throw new Error(`Failed to save conversation: ${error.message}`);
    }
  }

  /**
   * Get conversation by ID
   */
  async getConversation(conversationId: string): Promise<ConversationRecord | null> {
    const db = this.ensureSupabase();

    const { data, error } = await db
      .from('elevenlabs_conversations')
      .select('*')
      .eq('conversation_id', conversationId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Error fetching conversation:', error);
      throw new Error(`Failed to fetch conversation: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ConversationRecord[]> {
    const db = this.ensureSupabase();

    const { data, error } = await db
      .from('elevenlabs_conversations')
      .select('*')
      .eq('user_id', userId)
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user conversations:', error);
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get scenario conversations
   */
  async getScenarioConversations(
    scenarioId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<ConversationRecord[]> {
    const db = this.ensureSupabase();

    const { data, error } = await db
      .from('elevenlabs_conversations')
      .select('*')
      .eq('scenario_id', scenarioId)
      .order('start_time', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching scenario conversations:', error);
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Delete conversation
   */
  async deleteConversation(conversationId: string): Promise<void> {
    const db = this.ensureSupabase();

    const { error } = await db
      .from('elevenlabs_conversations')
      .delete()
      .eq('conversation_id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  /**
   * Get conversation statistics for a user
   */
  async getUserStats(userId: string): Promise<{
    totalConversations: number;
    totalMessages: number;
    totalDuration: number;
    averageMessagesPerConversation: number;
    averageDuration: number;
  }> {
    const db = this.ensureSupabase();

    const { data, error } = await db
      .from('elevenlabs_conversations')
      .select('message_count, duration_ms')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching user stats:', error);
      throw new Error(`Failed to fetch stats: ${error.message}`);
    }

    const conversations = (data || []) as any[];
    const totalConversations = conversations.length;
    const totalMessages = conversations.reduce((sum, c: any) => sum + (c.message_count || 0), 0);
    const totalDuration = conversations.reduce((sum, c: any) => sum + (c.duration_ms || 0), 0);

    return {
      totalConversations,
      totalMessages,
      totalDuration,
      averageMessagesPerConversation: totalConversations > 0 ? totalMessages / totalConversations : 0,
      averageDuration: totalConversations > 0 ? totalDuration / totalConversations : 0,
    };
  }
}

// Singleton instance
export const conversationDB = new ElevenLabsConversationDB();

/**
 * SQL Migration for ElevenLabs conversations table
 * Run this in Supabase SQL Editor:
 * 
 * CREATE TABLE IF NOT EXISTS elevenlabs_conversations (
 *   id TEXT PRIMARY KEY,
 *   conversation_id TEXT NOT NULL UNIQUE,
 *   user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
 *   scenario_id TEXT,
 *   agent_id TEXT,
 *   start_time TIMESTAMP WITH TIME ZONE NOT NULL,
 *   end_time TIMESTAMP WITH TIME ZONE,
 *   duration_ms INTEGER,
 *   message_count INTEGER DEFAULT 0,
 *   user_message_count INTEGER DEFAULT 0,
 *   assistant_message_count INTEGER DEFAULT 0,
 *   total_words INTEGER DEFAULT 0,
 *   average_words_per_message NUMERIC DEFAULT 0,
 *   conversation_data JSONB,
 *   messages JSONB DEFAULT '[]'::jsonb,
 *   metrics JSONB,
 *   created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
 *   updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
 * );
 * 
 * CREATE INDEX IF NOT EXISTS idx_elevenlabs_conversations_user_id ON elevenlabs_conversations(user_id);
 * CREATE INDEX IF NOT EXISTS idx_elevenlabs_conversations_scenario_id ON elevenlabs_conversations(scenario_id);
 * CREATE INDEX IF NOT EXISTS idx_elevenlabs_conversations_start_time ON elevenlabs_conversations(start_time);
 * 
 * -- Enable RLS
 * ALTER TABLE elevenlabs_conversations ENABLE ROW LEVEL SECURITY;
 * 
 * -- Policy: Users can view their own conversations
 * CREATE POLICY "Users can view own conversations" ON elevenlabs_conversations
 *   FOR SELECT USING (auth.uid() = user_id);
 * 
 * -- Policy: Users can insert their own conversations
 * CREATE POLICY "Users can insert own conversations" ON elevenlabs_conversations
 *   FOR INSERT WITH CHECK (auth.uid() = user_id);
 * 
 * -- Policy: Users can update their own conversations
 * CREATE POLICY "Users can update own conversations" ON elevenlabs_conversations
 *   FOR UPDATE USING (auth.uid() = user_id);
 * 
 * -- Policy: Users can delete their own conversations
 * CREATE POLICY "Users can delete own conversations" ON elevenlabs_conversations
 *   FOR DELETE USING (auth.uid() = user_id);
 */

