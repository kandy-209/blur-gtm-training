import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeInput } from '@/lib/security';
import { retryWithBackoff } from '@/lib/error-recovery';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeLeaderboard = searchParams.get('includeLeaderboard') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'userId parameter is required' },
        { status: 400 }
      );
    }

    const sanitizedUserId = sanitizeInput(userId, 100);

    // Get user stats
    const statsResult = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', sanitizedUserId)
          .single();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        return { data, error };
      },
      {
        maxRetries: 2,
        retryDelay: 500,
      }
    );

    let stats = statsResult.data || {
      total_sessions: 0,
      total_scenarios_completed: 0,
      total_turns: 0,
      total_time_spent_minutes: 0,
      average_score: 0,
      highest_score: 0,
      win_rate: 0,
      total_wins: 0,
      total_losses: 0,
      streak_current: 0,
      streak_longest: 0,
      achievements_unlocked: 0,
    };

    // Get additional data from analytics if available
    let analyticsData: any = null;
    if (includeLeaderboard) {
      try {
        const { data: analyticsEvents } = await supabase
          .from('analytics_events')
          .select('event_type, score, scenario_id, timestamp')
          .eq('user_id', sanitizedUserId);

        if (analyticsEvents) {
          const completedScenarios = analyticsEvents.filter(e => e.event_type === 'scenario_complete').length;
          const scores = analyticsEvents.filter(e => e.score !== undefined).map(e => e.score);
          const averageScore = scores.length > 0
            ? scores.reduce((sum, s) => sum + s, 0) / scores.length
            : 0;
          const highestScore = scores.length > 0 ? Math.max(...scores) : 0;

          analyticsData = {
            completedScenarios,
            averageScore: Math.round(averageScore * 10) / 10,
            highestScore,
            totalEvents: analyticsEvents.length,
          };
        }
      } catch (error) {
        console.error('Error fetching analytics data:', error);
      }
    }

    return NextResponse.json({
      stats: {
        ...stats,
        ...(analyticsData || {}),
      },
      lastUpdated: stats.last_updated_at || new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const sanitizedUserId = sanitizeInput(userId, 100);

    const result = await retryWithBackoff(
      async () => {
        const { data, error } = await supabase
          .from('user_stats')
          .upsert({
            user_id: sanitizedUserId,
            ...updates,
            last_updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id',
          })
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      },
      {
        maxRetries: 2,
        retryDelay: 500,
      }
    );

    if (!result.success || result.error) {
      throw result.error || new Error('Failed to update stats');
    }

    return NextResponse.json({
      success: true,
      stats: result.data,
    });
  } catch (error: any) {
    console.error('Update stats error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update stats' },
      { status: 500 }
    );
  }
}

