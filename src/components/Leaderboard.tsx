'use client';

import { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { Skeleton, SkeletonList } from '@/components/ui/skeleton';

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

function Leaderboard() {
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
      
      // Handle rate limiting gracefully
      if (response.status === 429) {
        console.warn('Leaderboard rate limited, returning empty array');
        setLeaderboard([]);
        setIsLoading(false);
        return;
      }
      
      if (!response.ok) {
        // Don't throw for non-critical errors, just log and return empty
        const errorText = await response.text();
        console.warn('Failed to fetch leaderboard:', response.status, errorText);
        setLeaderboard([]);
        setIsLoading(false);
        return;
      }
      
      const data = await response.json();
      setLeaderboard(data.leaderboard || []);
    } catch (error) {
      // Silently handle errors - don't spam console
      if (error instanceof Error && !error.message.includes('Too Many Requests')) {
        console.warn('Failed to fetch leaderboard:', error.message);
      }
      setLeaderboard([]);
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
    return (
      <Card className="border-gray-200" role="status" aria-live="polite" aria-label="Loading leaderboard">
        <CardHeader>
          <Skeleton variant="rounded" height={28} width="40%" />
          <Skeleton variant="text" height={16} width="60%" className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Skeleton variant="rounded" height={40} width="200px" />
          </div>
          <SkeletonList items={10} />
        </CardContent>
      </Card>
    );
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
          <label htmlFor="leaderboard-category" className="sr-only">
            Filter leaderboard by category
          </label>
          <Select value={category} onValueChange={(value) => setCategory(value)}>
            <SelectTrigger 
              id="leaderboard-category"
              className="w-full sm:w-[200px] border-gray-200 bg-white"
              aria-label="Select leaderboard category"
            >
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="overall">Overall</SelectItem>
              <SelectItem value="communication">Communication</SelectItem>
              <SelectItem value="product_knowledge">Product Knowledge</SelectItem>
              <SelectItem value="objection_handling">Objection Handling</SelectItem>
              <SelectItem value="closing">Closing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2" role="list" aria-label="Leaderboard entries">
          {leaderboard.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8" role="status">
              No leaderboard data yet. Be the first to practice!
            </p>
          ) : (
            leaderboard.map((entry) => (
              <div
                key={entry.userId}
                role="listitem"
                aria-label={`Rank ${entry.rank}: ${entry.username} with score ${entry.totalScore.toFixed(1)}`}
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

export default memo(Leaderboard);

