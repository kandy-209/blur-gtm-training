'use client';

import Leaderboard from '@/components/Leaderboard';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LeaderboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">
          Top performers in Enterprise sales role-play training
        </p>
      </div>
      <div className="max-w-4xl mx-auto">
        <Leaderboard />
      </div>
    </div>
    </ProtectedRoute>
  );
}

