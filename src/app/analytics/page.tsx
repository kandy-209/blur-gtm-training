'use client';

import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import TopResponses from '@/components/TopResponses';
import TechnicalQuestions from '@/components/TechnicalQuestions';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Training Analytics</h1>
          <p className="text-muted-foreground">Track your progress and performance metrics</p>
        </div>
        <div className="space-y-8">
          <ErrorBoundaryWithContext component="AnalyticsDashboard" severity="high">
            <AnalyticsDashboard />
          </ErrorBoundaryWithContext>
          
          <div className="grid gap-6 md:grid-cols-2">
            <ErrorBoundaryWithContext component="TopResponses" severity="medium">
              <TopResponses limit={10} />
            </ErrorBoundaryWithContext>
            <ErrorBoundaryWithContext component="TechnicalQuestions" severity="medium">
              <TechnicalQuestions limit={10} />
            </ErrorBoundaryWithContext>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

