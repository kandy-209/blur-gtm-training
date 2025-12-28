'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { scenarios } from '@/data/scenarios';
import RoleplayEngine from '@/components/RoleplayEngine';
import TopResponses from '@/components/TopResponses';
import TechnicalQuestions from '@/components/TechnicalQuestions';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, PlayCircle } from 'lucide-react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import SocialShare from '@/components/SocialShare';
import BreadcrumbNav from '@/components/BreadcrumbNav';

function RoleplayLoadingSkeleton() {
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-8 text-center">
          <Skeleton className="h-10 w-64 mx-auto mb-2" />
          <Skeleton className="h-6 w-96 mx-auto" />
        </div>
        <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <Skeleton className="h-32 w-full mb-4" />
                <Skeleton className="h-24 w-full mb-4" />
                <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RoleplayPage() {
  const params = useParams();
  const scenarioId = Array.isArray(params?.scenarioId) 
    ? params.scenarioId[0] 
    : (params?.scenarioId as string);
  const [scenario, setScenario] = useState(
    scenarioId ? scenarios.find((s) => s.id === scenarioId) : undefined
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (scenarioId) {
      // Simulate loading for better UX
      const timer = setTimeout(() => {
        const found = scenarios.find((s) => s.id === scenarioId);
        if (!found) {
          setIsLoading(false);
          notFound();
        } else {
          setScenario(found);
          setIsLoading(false);
        }
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [scenarioId]);

  if (isLoading) {
    return (
      <ProtectedRoute>
        <RoleplayLoadingSkeleton />
      </ProtectedRoute>
    );
  }

  if (!scenario) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h1 className="text-2xl font-bold mb-4">Scenario Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The scenario you're looking for doesn't exist or has been removed.
            </p>
            <Link href="/scenarios">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors">
                <PlayCircle className="h-4 w-4" />
                Browse Scenarios
              </button>
            </Link>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <ErrorBoundaryWithContext component="RoleplayPage" severity="critical">
        <div className="min-h-screen py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-4">
              <BreadcrumbNav
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Scenarios', href: '/scenarios' },
                  { label: scenario.persona.name, href: `/roleplay/${scenario.id}` },
                ]}
              />
            </div>
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Sales Role-Play Training</h1>
                <SocialShare
                  title={`${scenario.persona.name} - Browserbase Sales Training`}
                  description={scenario.objection_statement.substring(0, 150)}
                  scenarioId={scenario.id}
                  scenarioName={scenario.persona.name}
                />
              </div>
              <p className="text-muted-foreground">Practice your sales skills with AI-powered scenarios</p>
              <div className="mt-4">
                <Badge variant="secondary" className="text-sm">
                  {scenario.persona.name}
                </Badge>
              </div>
            </div>
            <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-3">
              <div className="lg:col-span-2 order-1 lg:order-1">
                <ErrorBoundaryWithContext component="RoleplayEngine" severity="critical">
                  <Suspense fallback={
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  }>
                    <RoleplayEngine
                      scenario={scenario}
                      onComplete={(score) => {
                        console.log('Final score:', score);
                      }}
                    />
                  </Suspense>
                </ErrorBoundaryWithContext>
              </div>
              <div className="space-y-6 order-2 lg:order-2">
                <ErrorBoundaryWithContext component="TopResponses" severity="low">
                  <Suspense fallback={<SkeletonCard />}>
                    <TopResponses
                      scenarioId={scenario.id}
                      objectionCategory={scenario.objection_category}
                      limit={5}
                    />
                  </Suspense>
                </ErrorBoundaryWithContext>
                <ErrorBoundaryWithContext component="TechnicalQuestions" severity="low">
                  <Suspense fallback={<SkeletonCard />}>
                    <TechnicalQuestions
                      scenarioId={scenario.id}
                      category={scenario.objection_category}
                      limit={5}
                    />
                  </Suspense>
                </ErrorBoundaryWithContext>
              </div>
            </div>
            {/* Note: GlobalVoiceAssistant is now available on all pages via layout */}
          </div>
        </div>
      </ErrorBoundaryWithContext>
    </ProtectedRoute>
  );
}

