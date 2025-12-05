import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase-client';

// Use service_role key for server-side operations (bypasses RLS)
const supabase = getSupabaseClient();

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
      console.error('Supabase not configured. Missing NEXT_PUBLIC_SUPABASE_URL or API key.');
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const category = searchParams.get('category') || 'overall';

    // Get all user ratings with user profiles
    const { data: ratings, error: ratingsError } = await supabase
      .from('user_ratings')
      .select('*, user_profiles!user_ratings_rated_user_id_fkey(*)')
      .eq('category', category);

    if (ratingsError) {
      console.error('Leaderboard ratings error:', ratingsError);
      
      // Check if it's an API key error
      if (ratingsError.message?.includes('Invalid API key') || ratingsError.message?.includes('JWT')) {
        console.error('⚠️ Invalid Supabase API key. Please check:');
        console.error('   - NEXT_PUBLIC_SUPABASE_URL is set correctly');
        console.error('   - SUPABASE_SERVICE_ROLE_KEY is set (preferred) or NEXT_PUBLIC_SUPABASE_ANON_KEY');
        console.error('   - API key matches your Supabase project');
      }
      
      // Return empty leaderboard instead of throwing error
      return NextResponse.json({ leaderboard: [] });
    }

    // Calculate leaderboard stats
    const userStats = new Map<string, {
      userId: string;
      username: string;
      roleAtCursor: string;
      ratings: number[];
      totalSessions: number;
      wins: number;
    }>();

    // Process ratings
    ratings?.forEach((rating: any) => {
      const userId = rating.rated_user_id;
      if (!userStats.has(userId)) {
        userStats.set(userId, {
          userId,
          username: rating.user_profiles?.username || 'Unknown',
          roleAtCursor: rating.user_profiles?.role_at_cursor || 'Unknown',
          ratings: [],
          totalSessions: 0,
          wins: 0,
        });
      }
      const stats = userStats.get(userId)!;
      stats.ratings.push(rating.rating);
    });

    // Get session data for win rate calculation
    const { data: sessions, error: sessionsError } = await supabase
      .from('live_sessions')
      .select('rep_user_id, prospect_user_id, rep_score, prospect_score, status');

    if (sessionsError) {
      console.error('Leaderboard sessions error:', sessionsError);
      // Continue without session data
    }

    if (sessions) {
      sessions.forEach((session: any) => {
        if (session.status === 'completed') {
          const repId = session.rep_user_id;
          const prospectId = session.prospect_user_id;

          // Update total sessions
          if (userStats.has(repId)) {
            userStats.get(repId)!.totalSessions++;
          }
          if (userStats.has(prospectId)) {
            userStats.get(prospectId)!.totalSessions++;
          }

          // Determine winner based on scores
          if (session.rep_score && session.prospect_score) {
            if (session.rep_score > session.prospect_score) {
              if (userStats.has(repId)) {
                userStats.get(repId)!.wins++;
              }
            } else if (session.prospect_score > session.rep_score) {
              if (userStats.has(prospectId)) {
                userStats.get(prospectId)!.wins++;
              }
            }
          }
        }
      });
    }

    // Get additional metrics from analytics events if available
    let analyticsData: any[] = [];
    if (supabase) {
      try {
        const { data: analyticsEvents } = await supabase
          .from('analytics_events')
          .select('user_id, event_type, score, scenario_id, timestamp')
          .in('user_id', Array.from(userStats.keys()));

        if (analyticsEvents) {
          analyticsData = analyticsEvents;
        }
      } catch (error) {
        console.error('Error fetching analytics for leaderboard:', error);
        // Continue without analytics data
      }
    }

    // Calculate comprehensive leaderboard entries with more data points
    const leaderboard = Array.from(userStats.values())
      .map((stats) => {
        const averageRating = stats.ratings.length > 0
          ? stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length
          : 0;
        const winRate = stats.totalSessions > 0
          ? (stats.wins / stats.totalSessions) * 100
          : 0;

        // Get analytics metrics for this user
        const userAnalytics = analyticsData.filter(a => a.user_id === stats.userId);
        const completedScenarios = userAnalytics.filter(a => a.event_type === 'scenario_complete').length;
        const startedScenarios = userAnalytics.filter(a => a.event_type === 'scenario_start').length;
        const totalTurns = userAnalytics.filter(a => a.event_type === 'turn_submit').length;
        const scores = userAnalytics.filter(a => a.score !== undefined).map(a => a.score);
        const averageScore = scores.length > 0
          ? scores.reduce((sum, s) => sum + s, 0) / scores.length
          : 0;
        const completionRate = startedScenarios > 0
          ? (completedScenarios / startedScenarios) * 100
          : 0;

        // Category breakdown from ratings
        const categoryRatings = new Map<string, number[]>();
        ratings?.forEach((rating: any) => {
          if (rating.rated_user_id === stats.userId) {
            if (!categoryRatings.has(rating.category)) {
              categoryRatings.set(rating.category, []);
            }
            categoryRatings.get(rating.category)!.push(rating.rating);
          }
        });

        const categoryAverages: Record<string, number> = {};
        categoryRatings.forEach((ratings, category) => {
          categoryAverages[category] = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
        });

        // Calculate total score with more factors
        const totalScore = (
          averageRating * 40 +           // 40% weight on ratings
          winRate * 0.3 +                // 30% weight on win rate
          averageScore * 0.2 +           // 20% weight on scenario scores
          completionRate * 0.1           // 10% weight on completion rate
        );

        return {
          userId: stats.userId,
          username: stats.username,
          roleAtCursor: stats.roleAtCursor,
          totalSessions: stats.totalSessions,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: stats.ratings.length,
          winRate: Math.round(winRate * 10) / 10,
          totalScore: Math.round(totalScore * 10) / 10,
          // Additional metrics
          completedScenarios,
          startedScenarios,
          totalTurns,
          averageScore: Math.round(averageScore * 10) / 10,
          completionRate: Math.round(completionRate * 10) / 10,
          categoryAverages: Object.fromEntries(
            Object.entries(categoryAverages).map(([k, v]) => [k, Math.round(v * 10) / 10])
          ),
          rank: 0, // Will be set after sorting
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    // Calculate aggregate statistics
    const aggregateStats = {
      totalUsers: leaderboard.length,
      averageRating: leaderboard.length > 0
        ? leaderboard.reduce((sum, e) => sum + e.averageRating, 0) / leaderboard.length
        : 0,
      averageWinRate: leaderboard.length > 0
        ? leaderboard.reduce((sum, e) => sum + e.winRate, 0) / leaderboard.length
        : 0,
      totalSessions: leaderboard.reduce((sum, e) => sum + e.totalSessions, 0),
      totalCompletedScenarios: leaderboard.reduce((sum, e) => sum + e.completedScenarios, 0),
    };

    return NextResponse.json({ 
      leaderboard,
      stats: aggregateStats,
      generatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    
    // Handle rate limiting from Supabase
    if (error.message?.includes('rate limit') || error.message?.includes('Too Many Requests')) {
      return NextResponse.json(
        { error: 'Too Many Requests', leaderboard: [] },
        { status: 429 }
      );
    }
    
    // Return empty leaderboard instead of error to prevent UI crashes
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard', leaderboard: [] },
      { status: 500 }
    );
  }
}

