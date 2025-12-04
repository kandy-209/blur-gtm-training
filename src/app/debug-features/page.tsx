'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function DebugFeaturesPage() {
  const [checks, setChecks] = useState<Record<string, { status: 'checking' | 'pass' | 'fail'; message: string }>>({});

  useEffect(() => {
    const runChecks = async () => {
      const results: Record<string, { status: 'checking' | 'pass' | 'fail'; message: string }> = {};

      // Check 1: ElevenLabs Widget Script
      const elevenLabsScript = document.querySelector('script[src*="elevenlabs"]');
      results.elevenlabsScript = {
        status: elevenLabsScript ? 'pass' : 'fail',
        message: elevenLabsScript 
          ? 'ElevenLabs widget script found' 
          : 'ElevenLabs widget script not loaded'
      };

      // Check 2: Custom Element
      const hasCustomElement = customElements.get('elevenlabs-convai');
      results.customElement = {
        status: hasCustomElement ? 'pass' : 'fail',
        message: hasCustomElement 
          ? 'elevenlabs-convai custom element registered' 
          : 'elevenlabs-convai custom element not registered'
      };

      // Check 3: Floating Button Visibility
      const floatingButton = document.querySelector('[aria-label="Open AI Training Assistant"]');
      results.floatingButton = {
        status: floatingButton ? 'pass' : 'fail',
        message: floatingButton 
          ? 'Floating button found in DOM' 
          : 'Floating button not found in DOM'
      };

      // Check 4: Environment Variables (client-side)
      const agentId = process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID;
      results.envAgentId = {
        status: agentId ? 'pass' : 'fail',
        message: agentId 
          ? `Agent ID set: ${agentId.substring(0, 20)}...` 
          : 'NEXT_PUBLIC_ELEVENLABS_AGENT_ID not set (using default)'
      };

      // Check 5: API Routes
      try {
        const ttsResponse = await fetch('/api/tts', { method: 'OPTIONS' });
        results.ttsApi = {
          status: ttsResponse.ok ? 'pass' : 'fail',
          message: ttsResponse.ok 
            ? 'TTS API route accessible' 
            : 'TTS API route not accessible'
        };
      } catch (error) {
        results.ttsApi = {
          status: 'fail',
          message: `TTS API error: ${error instanceof Error ? error.message : 'Unknown'}`
        };
      }

      // Check 6: VAPI API Route
      try {
        const vapiResponse = await fetch('/api/vapi/sales-call', { method: 'OPTIONS' });
        results.vapiApi = {
          status: vapiResponse.ok ? 'pass' : 'fail',
          message: vapiResponse.ok 
            ? 'VAPI API route accessible' 
            : 'VAPI API route not accessible'
        };
      } catch (error) {
        results.vapiApi = {
          status: 'fail',
          message: `VAPI API error: ${error instanceof Error ? error.message : 'Unknown'}`
        };
      }

      // Check 7: Console Errors
      const consoleErrors: string[] = [];
      const originalError = console.error;
      console.error = (...args) => {
        consoleErrors.push(args.join(' '));
        originalError.apply(console, args);
      };

      setTimeout(() => {
        results.consoleErrors = {
          status: consoleErrors.length === 0 ? 'pass' : 'fail',
          message: consoleErrors.length === 0 
            ? 'No console errors detected' 
            : `Found ${consoleErrors.length} console error(s)`
        };
        setChecks(results);
      }, 2000);
    };

    runChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'fail':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass':
        return <Badge className="bg-green-100 text-green-800">PASS</Badge>;
      case 'fail':
        return <Badge className="bg-red-100 text-red-800">FAIL</Badge>;
      default:
        return <Badge className="bg-yellow-100 text-yellow-800">CHECKING</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Feature Debug Diagnostics</CardTitle>
          <CardDescription>
            Check what's preventing VAPI/ElevenLabs features from showing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(checks).map(([key, check]) => (
            <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(check.status)}
                <div>
                  <div className="font-medium">{key}</div>
                  <div className="text-sm text-gray-600">{check.message}</div>
                </div>
              </div>
              {getStatusBadge(check.status)}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Quick Fixes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="p-3 bg-blue-50 rounded-lg">
            <strong>1. Check Browser Console:</strong> Press F12 → Console tab → Look for errors
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <strong>2. Check Floating Button:</strong> Look at bottom-right corner of any page
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <strong>3. Check VAPI:</strong> Go to <code>/sales-training</code> page
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <strong>4. Check Environment:</strong> Open browser console and run:<br />
            <code className="text-xs">console.log('Agent ID:', process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID)</code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

