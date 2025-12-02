'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { scenarios } from '@/data/scenarios';
import RoleplayEngine from '@/components/RoleplayEngine';
import TopResponses from '@/components/TopResponses';
import TechnicalQuestions from '@/components/TechnicalQuestions';
import ErrorBoundary from '@/components/ErrorBoundary';
import ProtectedRoute from '@/components/ProtectedRoute';
import { notFound } from 'next/navigation';

export default function RoleplayPage() {
  const params = useParams();
  const scenarioId = Array.isArray(params?.scenarioId) 
    ? params.scenarioId[0] 
    : (params?.scenarioId as string);
  const [scenario, setScenario] = useState(
    scenarioId ? scenarios.find((s) => s.id === scenarioId) : undefined
  );

  useEffect(() => {
    if (scenarioId && !scenario) {
      const found = scenarios.find((s) => s.id === scenarioId);
      if (!found) {
        notFound();
      } else {
        setScenario(found);
      }
    }
  }, [scenarioId, scenario]);

  if (!scenario) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <ErrorBoundary>
          <div className="min-h-screen py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
              <div className="mb-8 text-center">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2">Sales Role-Play Training</h1>
                <p className="text-muted-foreground">Practice your sales skills with AI-powered scenarios</p>
              </div>
              <div className="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-3">
                <div className="lg:col-span-2 order-1 lg:order-1">
                  <ErrorBoundary>
                    <RoleplayEngine
                      scenario={scenario}
                      onComplete={(score) => {
                        console.log('Final score:', score);
                      }}
                    />
                  </ErrorBoundary>
                </div>
                <div className="space-y-6 order-2 lg:order-2">
                  <ErrorBoundary>
                    <TopResponses
                      scenarioId={scenario.id}
                      objectionCategory={scenario.objection_category}
                      limit={5}
                    />
                  </ErrorBoundary>
                  <ErrorBoundary>
                    <TechnicalQuestions
                      scenarioId={scenario.id}
                      category={scenario.objection_category}
                      limit={5}
                    />
                  </ErrorBoundary>
                </div>
              </div>
              {/* Note: GlobalVoiceAssistant is now available on all pages via layout */}
            </div>
          </div>
        </ErrorBoundary>
      </ProtectedRoute>
  );
}

