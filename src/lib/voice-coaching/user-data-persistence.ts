/**
 * User Data Persistence
 * Saves and retrieves user voice coaching data across sessions
 */

import { createClient } from '@supabase/supabase-js';
import type { UserVoiceProfile, ImpactAnalysis } from './user-model';
import type { VoiceMetrics, FeedbackMessage, CoachingSuggestion } from './types';
import type { UserVoiceSession, UserVoiceProfile as DBUserVoiceProfile, UserImpactAnalysis } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

export interface UserSessionData {
  userId: string;
  conversationId: string;
  sessionDate: Date;
  metrics: VoiceMetrics;
  feedback: FeedbackMessage[];
  suggestions: CoachingSuggestion[];
  duration: number; // milliseconds
}

export class UserDataPersistence {
  /**
   * Save user session data
   */
  async saveSession(sessionData: UserSessionData): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured, session data not saved');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_voice_sessions')
        .insert({
          user_id: sessionData.userId,
          conversation_id: sessionData.conversationId,
          session_date: sessionData.sessionDate.toISOString(),
          metrics: sessionData.metrics,
          feedback: sessionData.feedback,
          suggestions: sessionData.suggestions,
          duration_ms: sessionData.duration,
        } as any);

      if (error) {
        console.error('Error saving session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save session:', error);
      throw error;
    }
  }

  /**
   * Get user's voice profile
   */
  async getUserProfile(userId: string): Promise<UserVoiceProfile | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('user_voice_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Profile doesn't exist yet
        }
        throw error;
      }

      return this.mapProfileFromDB(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Save or update user voice profile
   */
  async saveUserProfile(profile: UserVoiceProfile): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured, profile not saved');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_voice_profiles')
        .upsert({
          user_id: profile.userId,
          baseline_metrics: profile.baselineMetrics,
          current_metrics: profile.currentMetrics,
          improvement_trend: profile.improvementTrend,
          sessions_completed: profile.sessionsCompleted,
          total_practice_time_ms: profile.totalPracticeTime,
          last_session_date: profile.lastSessionDate.toISOString(),
          strengths: profile.strengths,
          areas_for_improvement: profile.areasForImprovement,
          impact_score: profile.impactScore,
          updated_at: new Date().toISOString(),
        } as any, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Error saving profile:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  }

  /**
   * Get user's session history
   */
  async getUserSessions(
    userId: string,
    limit: number = 50
  ): Promise<UserSessionData[]> {
    if (!supabase) return [];

    try {
      const { data, error } = await supabase
        .from('user_voice_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('session_date', { ascending: false })
        .limit(limit) as { data: UserVoiceSession[] | null; error: any };

      if (error) {
        console.error('Error fetching sessions:', error);
        return [];
      }

      return (data || []).map((session: UserVoiceSession) => ({
        userId: session.user_id,
        conversationId: session.conversation_id,
        sessionDate: new Date(session.session_date),
        metrics: session.metrics,
        feedback: session.feedback || [],
        suggestions: session.suggestions || [],
        duration: session.duration_ms || 0,
      }));
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
      return [];
    }
  }

  /**
   * Get user's impact analysis
   */
  async getUserImpactAnalysis(userId: string): Promise<ImpactAnalysis | null> {
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('user_impact_analyses')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null; // Analysis doesn't exist
        }
        throw error;
      }

      return (data as any)?.analysis_data as ImpactAnalysis;
    } catch (error) {
      console.error('Error fetching impact analysis:', error);
      return null;
    }
  }

  /**
   * Save impact analysis
   */
  async saveImpactAnalysis(
    userId: string,
    analysis: ImpactAnalysis
  ): Promise<void> {
    if (!supabase) {
      console.warn('Supabase not configured, impact analysis not saved');
      return;
    }

    try {
      const { error } = await supabase
        .from('user_impact_analyses')
        .insert({
          user_id: userId,
          analysis_data: analysis,
          created_at: new Date().toISOString(),
        } as any);

      if (error) {
        console.error('Error saving impact analysis:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to save impact analysis:', error);
      throw error;
    }
  }

  /**
   * Map database record to UserVoiceProfile
   */
  private mapProfileFromDB(data: any): UserVoiceProfile {
    return {
      userId: data.user_id,
      baselineMetrics: data.baseline_metrics,
      currentMetrics: data.current_metrics,
      improvementTrend: data.improvement_trend,
      sessionsCompleted: data.sessions_completed || 0,
      totalPracticeTime: data.total_practice_time_ms || 0,
      lastSessionDate: new Date(data.last_session_date),
      strengths: data.strengths || [],
      areasForImprovement: data.areas_for_improvement || [],
      impactScore: data.impact_score,
    };
  }
}

// Singleton instance
export const userDataPersistence = new UserDataPersistence();

