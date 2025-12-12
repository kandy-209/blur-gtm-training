import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';
import { sanitizeInput } from '@/lib/security';
import { retryWithBackoff } from '@/lib/error-recovery';
import { log } from '@/lib/logger';
import { successResponse, errorResponse } from '@/lib/api-response';

const supabase = getSupabaseClient();

export async function GET(request: NextRequest) {
  let sanitizedUserId: string | undefined;
  
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

    sanitizedUserId = sanitizeInput(userId, 100);

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

        return data || null;
      },
      {
        maxRetries: 2,
        retryDelay: 500,
      }
    );

    const defaultStats = {
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

    let stats: any = (statsResult.success && statsResult.data) ? statsResult.data : defaultStats;

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
        log.error('Error fetching analytics data', error instanceof Error ? error : new Error(String(error)), {
          userId: sanitizedUserId,
        });
      }
    }

    // Ensure stats has all required fields
    const statsWithDefaults: any = {
      total_sessions: stats?.total_sessions ?? 0,
      total_scenarios_completed: stats?.total_scenarios_completed ?? 0,
      total_turns: stats?.total_turns ?? 0,
      total_time_spent_minutes: stats?.total_time_spent_minutes ?? 0,
      average_score: stats?.average_score ?? 0,
      highest_score: stats?.highest_score ?? 0,
      win_rate: stats?.win_rate ?? 0,
      total_wins: stats?.total_wins ?? 0,
      total_losses: stats?.total_losses ?? 0,
      streak_current: stats?.streak_current ?? 0,
      streak_longest: stats?.streak_longest ?? 0,
      achievements_unlocked: stats?.achievements_unlocked ?? 0,
      ...stats,
      ...(analyticsData || {}),
    };

    return successResponse(
      {
        stats: statsWithDefaults,
        lastUpdated: stats?.last_updated_at || new Date().toISOString(),
      },
      {
        message: 'Stats retrieved successfully',
      }
    );
  } catch (error: any) {
    log.error('Get stats error', error instanceof Error ? error : new Error(String(error)), {
      userId: sanitizedUserId,
    });
    return errorResponse(error, {
      status: 500,
      message: 'Failed to fetch user statistics',
    });
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
        return data!; // Return data directly, not wrapped in object
      },
      {
        maxRetries: 2,
        retryDelay: 500,
      }
    );

    if (!result.success || result.error || !result.data) {
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

