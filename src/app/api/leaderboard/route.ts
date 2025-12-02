import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    if (!supabase) {
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

    // Calculate leaderboard entries
    const leaderboard = Array.from(userStats.values())
      .map((stats) => {
        const averageRating = stats.ratings.length > 0
          ? stats.ratings.reduce((sum, r) => sum + r, 0) / stats.ratings.length
          : 0;
        const winRate = stats.totalSessions > 0
          ? (stats.wins / stats.totalSessions) * 100
          : 0;
        const totalScore = averageRating * 100 + winRate; // Combined score

        return {
          userId: stats.userId,
          username: stats.username,
          roleAtCursor: stats.roleAtCursor,
          totalSessions: stats.totalSessions,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings: stats.ratings.length,
          winRate: Math.round(winRate * 10) / 10,
          totalScore: Math.round(totalScore * 10) / 10,
          rank: 0, // Will be set after sorting
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, limit)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));

    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error('Leaderboard error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}

