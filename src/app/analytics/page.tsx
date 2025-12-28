'use client';

import { Suspense } from 'react';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import CallTrainingAnalytics from '@/components/CallTrainingAnalytics';
import TopResponses from '@/components/TopResponses';
import TechnicalQuestions from '@/components/TechnicalQuestions';
import ConversionMetrics from '@/components/ConversionMetrics';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import { Skeleton, SkeletonStats } from '@/components/ui/skeleton';
import { ProgressiveSkeletonGroup } from '@/components/ui/progressive-skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function AnalyticsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonStats key={i} />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-96 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Training Analytics</h1>
          <p className="text-muted-foreground">Track your progress and performance metrics</p>
        </div>
        
        <Tabs defaultValue="roleplay" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="roleplay">Role-Play Training</TabsTrigger>
            <TabsTrigger value="calls">Phone Call Training</TabsTrigger>
          </TabsList>
          
          <TabsContent value="roleplay" className="space-y-8">
            <Suspense fallback={<AnalyticsSkeleton />}>
              <ErrorBoundaryWithContext component="AnalyticsDashboard" severity="high">
                <AnalyticsDashboard />
              </ErrorBoundaryWithContext>
            </Suspense>
            
            <ErrorBoundaryWithContext component="ConversionMetrics" severity="high">
              <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                <ConversionMetrics />
              </Suspense>
            </ErrorBoundaryWithContext>
            
            <div className="grid gap-6 md:grid-cols-2">
              <ErrorBoundaryWithContext component="TopResponses" severity="medium">
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                  <TopResponses limit={10} />
                </Suspense>
              </ErrorBoundaryWithContext>
              <ErrorBoundaryWithContext component="TechnicalQuestions" severity="medium">
                <Suspense fallback={<Skeleton className="h-96 w-full" />}>
                  <TechnicalQuestions limit={10} />
                </Suspense>
              </ErrorBoundaryWithContext>
            </div>
          </TabsContent>
          
          <TabsContent value="calls" className="space-y-8">
            <ErrorBoundaryWithContext component="CallTrainingAnalytics" severity="high">
              <CallTrainingAnalytics />
            </ErrorBoundaryWithContext>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  );
}

