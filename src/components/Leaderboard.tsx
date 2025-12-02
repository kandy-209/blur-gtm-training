'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
// Simple loading skeleton
const LoadingSkeleton = ({ count }: { count: number }) => (
  <div className="space-y-2">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
    ))}
  </div>
);

interface LeaderboardEntry {
  userId: string;
  username: string;
  roleAtCursor: string;
  totalSessions: number;
  averageRating: number;
  totalRatings: number;
  winRate: number;
  totalScore: number;
  rank: number;
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('overall');

  useEffect(() => {
    fetchLeaderboard();
  }, [category]);

  const fetchLeaderboard = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/leaderboard?category=${category}&limit=100`);
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-orange-500" />;
    return <span className="text-sm font-semibold text-muted-foreground">#{rank}</span>;
  };

  if (isLoading) {
    return <LoadingSkeleton count={10} />;
  }

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Leaderboard
        </CardTitle>
        <CardDescription>
          Top performers in Enterprise sales role-play
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          >
            <option value="overall">Overall</option>
            <option value="communication">Communication</option>
            <option value="product_knowledge">Product Knowledge</option>
            <option value="objection_handling">Objection Handling</option>
            <option value="closing">Closing</option>
          </select>
        </div>

        <div className="space-y-2">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No leaderboard data yet. Be the first to practice!
            </p>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  entry.rank <= 3
                    ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex items-center justify-center w-10">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{entry.username}</span>
                      <Badge variant="secondary" className="text-xs">
                        {entry.roleAtCursor}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{entry.totalSessions} sessions</span>
                      <span>⭐ {entry.averageRating.toFixed(1)}</span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {entry.winRate.toFixed(1)}% win rate
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900">
                    {entry.totalScore.toFixed(1)}
                  </div>
                  <div className="text-xs text-muted-foreground">Score</div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

