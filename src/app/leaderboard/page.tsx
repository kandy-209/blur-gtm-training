'use client';

import { Suspense } from 'react';
import Leaderboard from '@/components/Leaderboard';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import { Skeleton } from '@/components/ui/skeleton';

function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

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
          <ErrorBoundaryWithContext component="Leaderboard" severity="high">
            <Suspense fallback={<LeaderboardSkeleton />}>
              <Leaderboard />
            </Suspense>
          </ErrorBoundaryWithContext>
        </div>
      </div>
    </ProtectedRoute>
  );
}

