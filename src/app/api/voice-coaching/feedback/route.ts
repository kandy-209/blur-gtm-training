/**
 * Voice Coaching Feedback API
 * Generates and retrieves coaching feedback for conversations
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CoachingEngine } from '@/lib/voice-coaching/coaching-engine';
import type { VoiceMetrics } from '@/lib/voice-coaching/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * GET /api/voice-coaching/feedback/:conversationId
 * Get coaching feedback for a conversation
 */
export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    // Get all metrics for the conversation
    const { data: metricsData, error: metricsError } = await supabase
      .from('voice_coaching_metrics')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (metricsError) {
      console.error('Error fetching metrics:', metricsError);
      return NextResponse.json(
        { error: 'Failed to fetch metrics', details: metricsError.message },
        { status: 500 }
      );
    }

    if (!metricsData || metricsData.length === 0) {
      return NextResponse.json({
        success: true,
        feedback: [],
        suggestions: [],
        message: 'No metrics found for this conversation'
      });
    }

    // Process metrics through coaching engine
    const coachingEngine = new CoachingEngine();
    const allFeedback: any[] = [];
    const allSuggestions: any[] = [];

    // Analyze each metric snapshot
    for (const metricRecord of metricsData) {
      const metrics: VoiceMetrics = {
        pace: metricRecord.pace_wpm || 0,
        pitch: metricRecord.pitch_hz || 0,
        volume: metricRecord.volume_db || -60,
        pauses: metricRecord.pause_count || 0,
        clarity: metricRecord.clarity_score || 0,
        confidence: metricRecord.confidence_score || 0,
        timestamp: new Date(metricRecord.timestamp).getTime()
      };

      const feedback = coachingEngine.analyzeMetrics(metrics);
      const suggestions = coachingEngine.generateSuggestions(metrics);

      allFeedback.push(...feedback);
      allSuggestions.push(...suggestions);
    }

    // Get unique suggestions (by title)
    const uniqueSuggestions = Array.from(
      new Map(allSuggestions.map(s => [s.title, s])).values()
    );

    // Aggregate feedback by type
    const feedbackByType = {
      critical: allFeedback.filter(f => f.type === 'critical'),
      warning: allFeedback.filter(f => f.type === 'warning'),
      info: allFeedback.filter(f => f.type === 'info'),
      success: allFeedback.filter(f => f.type === 'success')
    };

    return NextResponse.json({
      success: true,
      feedback: allFeedback.slice(-20), // Last 20 feedback messages
      feedbackByType,
      suggestions: uniqueSuggestions.slice(0, 10), // Top 10 suggestions
      totalFeedback: allFeedback.length,
      totalSuggestions: uniqueSuggestions.length
    });
  } catch (error) {
    console.error('Voice coaching feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/voice-coaching/feedback
 * Generate feedback for specific metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics } = body;

    if (!metrics) {
      return NextResponse.json(
        { error: 'metrics are required' },
        { status: 400 }
      );
    }

    const coachingEngine = new CoachingEngine();
    const feedback = coachingEngine.analyzeMetrics(metrics);
    const suggestions = coachingEngine.generateSuggestions(metrics);

    return NextResponse.json({
      success: true,
      feedback,
      suggestions
    });
  } catch (error) {
    console.error('Voice coaching feedback API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

