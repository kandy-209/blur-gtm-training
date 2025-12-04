'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export function VoiceCoachingDebug() {
  const [checks, setChecks] = useState<Record<string, { status: 'checking' | 'pass' | 'fail'; message?: string }>>({});

  useEffect(() => {
    const runChecks = async () => {
      const results: Record<string, { status: 'checking' | 'pass' | 'fail'; message?: string }> = {};

      // Check 1: Browser APIs
      results.browserAPIs = {
        status: (typeof window !== 'undefined' && 
                 typeof navigator !== 'undefined' && 
                 navigator.mediaDevices) ? 'pass' : 'fail',
        message: typeof window === 'undefined' 
          ? 'Not in browser environment' 
          : !navigator.mediaDevices 
            ? 'getUserMedia not available' 
            : 'Browser APIs available'
      };

      // Check 2: Web Audio API
      results.webAudio = {
        status: (typeof AudioContext !== 'undefined' || 
                 typeof (window as any).webkitAudioContext !== 'undefined') ? 'pass' : 'fail',
        message: 'Web Audio API ' + (typeof AudioContext !== 'undefined' ? 'available' : 'not available')
      };

      // Check 3: Module imports
      try {
        const module = await import('@/lib/voice-coaching');
        results.modules = {
          status: (module.AudioAnalyzer && module.CoachingEngine) ? 'pass' : 'fail',
          message: module.AudioAnalyzer && module.CoachingEngine 
            ? 'Voice coaching modules loaded' 
            : 'Missing required exports'
        };
      } catch (error: any) {
        results.modules = {
          status: 'fail',
          message: `Failed to load: ${error.message}`
        };
      }

      // Check 4: API endpoints
      try {
        const response = await fetch('/api/voice-coaching/metrics?conversationId=test');
        results.api = {
          status: response.ok ? 'pass' : 'fail',
          message: response.ok 
            ? 'API endpoint accessible' 
            : `API returned ${response.status}`
        };
      } catch (error: any) {
        results.api = {
          status: 'fail',
          message: `API error: ${error.message}`
        };
      }

      // Check 5: UI Components
      try {
        const { Alert: AlertComponent } = await import('@/components/ui/alert');
        results.uiComponents = {
          status: AlertComponent ? 'pass' : 'fail',
          message: 'UI components available'
        };
      } catch (error: any) {
        results.uiComponents = {
          status: 'fail',
          message: `UI components error: ${error.message}`
        };
      }

      setChecks(results);
    };

    runChecks();
  }, []);

  const allPassed = Object.values(checks).every(c => c.status === 'pass');
  const hasFailures = Object.values(checks).some(c => c.status === 'fail');

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>System Diagnostics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(checks).map(([key, check]) => (
            <div key={key} className="flex items-center gap-3">
              {check.status === 'checking' && (
                <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />
              )}
              {check.status === 'pass' && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {check.status === 'fail' && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <div className="flex-1">
                <div className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                {check.message && (
                  <div className="text-sm text-muted-foreground">{check.message}</div>
                )}
              </div>
            </div>
          ))}

          {hasFailures && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Some checks failed. See details above. Check browser console (F12) for more information.
              </AlertDescription>
            </Alert>
          )}

          {allPassed && Object.keys(checks).length > 0 && (
            <Alert className="mt-4 bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                All system checks passed! The page should work correctly.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

