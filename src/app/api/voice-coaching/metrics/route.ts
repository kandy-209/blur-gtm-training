/**
 * Voice Coaching Metrics API
 * Handles saving and retrieving voice coaching metrics
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { VoiceMetricsSnapshot } from '@/lib/voice-coaching/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

/**
 * POST /api/voice-coaching/metrics
 * Save voice metrics
 */
export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      conversationId,
      userId,
      metrics,
      timestamp,
      feedbackMessages,
      coachingSuggestions
    } = body;

    if (!conversationId || !metrics) {
      return NextResponse.json(
        { error: 'conversationId and metrics are required' },
        { status: 400 }
      );
    }

    const record = {
      conversation_id: conversationId,
      user_id: userId || null,
      timestamp: timestamp ? new Date(timestamp).toISOString() : new Date().toISOString(),
      pace_wpm: metrics.pace || null,
      pitch_hz: metrics.pitch || null,
      volume_db: metrics.volume || null,
      pause_count: metrics.pauses || 0,
      clarity_score: metrics.clarity || null,
      confidence_score: metrics.confidence || null,
      average_pace: metrics.averagePace || null,
      average_pitch: metrics.averagePitch || null,
      average_volume: metrics.averageVolume || null,
      feedback_messages: feedbackMessages || [],
      coaching_suggestions: coachingSuggestions || []
    };

    const { data, error } = await supabase
      .from('voice_coaching_metrics')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.error('Error saving voice metrics:', error);
      return NextResponse.json(
        { error: 'Failed to save metrics', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      metrics: data
    });
  } catch (error) {
    console.error('Voice coaching metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/voice-coaching/metrics/:conversationId
 * Get all metrics for a conversation
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

    const { data, error } = await supabase
      .from('voice_coaching_metrics')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('timestamp', { ascending: true });

    if (error) {
      console.error('Error fetching voice metrics:', error);
      return NextResponse.json(
        { error: 'Failed to fetch metrics', details: error.message },
        { status: 500 }
      );
    }

    // Calculate averages
    const metrics = data || [];
    const averages = {
      pace: metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.pace_wpm || 0), 0) / metrics.length
        : 0,
      pitch: metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.pitch_hz || 0), 0) / metrics.length
        : 0,
      volume: metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.volume_db || 0), 0) / metrics.length
        : 0,
      clarity: metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.clarity_score || 0), 0) / metrics.length
        : 0,
      confidence: metrics.length > 0
        ? metrics.reduce((sum, m) => sum + (m.confidence_score || 0), 0) / metrics.length
        : 0
    };

    return NextResponse.json({
      success: true,
      metrics: metrics.map(m => ({
        id: m.id,
        timestamp: m.timestamp,
        pace: m.pace_wpm,
        pitch: m.pitch_hz,
        volume: m.volume_db,
        pauses: m.pause_count,
        clarity: m.clarity_score,
        confidence: m.confidence_score,
        feedbackMessages: m.feedback_messages,
        coachingSuggestions: m.coaching_suggestions
      })),
      averages: {
        pace: Math.round(averages.pace),
        pitch: Math.round(averages.pitch),
        volume: Math.round(averages.volume * 10) / 10,
        clarity: Math.round(averages.clarity),
        confidence: Math.round(averages.confidence)
      },
      count: metrics.length
    });
  } catch (error) {
    console.error('Voice coaching metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

