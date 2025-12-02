'use client';

// Debug version to test if page renders
import { scenarios } from '@/data/scenarios';
import { useParams } from 'next/navigation';
import { useEffect } from 'react';

export default function DebugRoleplayPage() {
  const params = useParams();
  const scenarioId = params?.scenarioId as string;

  useEffect(() => {
    console.log('Debug: Page loaded');
    console.log('Debug: scenarioId', scenarioId);
    console.log('Debug: Available scenarios', scenarios.map(s => s.id));
  }, [scenarioId]);

  const scenario = scenarios.find((s) => s.id === scenarioId);

  if (!scenario) {
    return (
      <div className="container mx-auto p-6">
        <h1>Scenario Not Found</h1>
        <p>Scenario ID: {scenarioId}</p>
        <p>Available scenarios: {scenarios.map(s => s.id).join(', ')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Sales Role-Play Training (Debug)</h1>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Scenario Found!</h2>
          <p><strong>ID:</strong> {scenario.id}</p>
          <p><strong>Persona:</strong> {scenario.persona.name}</p>
          <p><strong>Objection:</strong> {scenario.objection_statement}</p>
          <p className="mt-4 text-green-600">✅ Page is rendering correctly!</p>
          <p className="text-sm text-gray-600 mt-2">
            If you see this, the page works. The issue might be with RoleplayEngine component.
          </p>
        </div>
      </div>
    </div>
  );
}

