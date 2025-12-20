'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import { ProspectIntelligenceForm } from '@/components/ProspectIntelligence/ProspectIntelligenceForm';
import { ProspectIntelligenceResults } from '@/components/ProspectIntelligence/ProspectIntelligenceResults';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, XCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import type { ProspectIntelligence } from '@/lib/prospect-intelligence/types';

export default function ProspectIntelligencePage() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ProspectIntelligence | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{
    stage: string;
    message: string;
    percentage: number;
  } | null>(null);
  const [cached, setCached] = useState(false);

  // Best-effort interaction logging for RL/analytics
  const logInteraction = async (websiteUrl: string) => {
    try {
      let accountDomain = websiteUrl;
      try {
        const url = new URL(websiteUrl);
        accountDomain = url.hostname.toLowerCase();
      } catch {
        // Fallback: keep raw string if URL parsing fails
      }

      await fetch('/api/prospect-intelligence/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accountDomain,
          interactionType: 'opened_research',
          metadata: {
            source: 'prospect-intelligence-page',
          },
        }),
      }).catch(() => {
        // Swallow errors - logging is best-effort only
      });
    } catch {
      // Completely ignore interaction logging failures on the client
    }
  };

  const handleResearch = async (websiteUrl: string, companyName?: string) => {
    setLoading(true);
    setError(null);
    setData(null);
    setCached(false);
    setProgress({ stage: 'initializing', message: 'Starting research...', percentage: 0 });

    try {
      // Simulate progress updates (in a real implementation, you'd use Server-Sent Events or WebSockets)
      const progressStages = [
        { stage: 'navigating', message: 'Navigating to website...', percentage: 20 },
        { stage: 'extracting', message: 'Extracting company information...', percentage: 40 },
        { stage: 'analyzing', message: 'Analyzing tech stack...', percentage: 60 },
        { stage: 'checking', message: 'Checking hiring activity...', percentage: 80 },
        { stage: 'scoring', message: 'Calculating ICP score...', percentage: 90 },
      ];

      let progressIndex = 0;
      const progressInterval = setInterval(() => {
        if (progressIndex < progressStages.length) {
          setProgress(progressStages[progressIndex]);
          progressIndex++;
        }
      }, 10000); // Update every 10 seconds

      const response = await fetch('/api/prospect-intelligence/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteUrl,
          companyName,
        }),
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setData(result.data);
        setCached(result.cached || false);
        // Log that the user opened research for this account (best-effort)
        void logInteraction(result.data.companyWebsite || websiteUrl);
        setProgress({ stage: 'complete', message: 'Research complete!', percentage: 100 });
        
        // Clear progress after 2 seconds
        setTimeout(() => setProgress(null), 2000);
      } else {
        throw new Error(result.error || 'Failed to research prospect');
      }
    } catch (err: any) {
      setProgress(null);
      console.error('Research error:', err);
      let errorMessage = err.message || 'Failed to research prospect. Please try again.';
      
      // Provide more helpful error messages
      if (errorMessage.includes('429') || errorMessage.includes('quota')) {
        if (errorMessage.includes('OpenAI') || errorMessage.includes('openai.com')) {
          errorMessage = 'OpenAI API quota exceeded. Check usage at https://platform.openai.com/usage or configure Claude/Gemini instead.';
        } else if (errorMessage.includes('Anthropic') || errorMessage.includes('Claude')) {
          errorMessage = 'Anthropic Claude API quota exceeded. Check usage at https://console.anthropic.com/ or configure Gemini/OpenAI instead.';
        } else if (errorMessage.includes('Google') || errorMessage.includes('Gemini')) {
          errorMessage = 'Google Gemini API quota exceeded. Check usage at https://console.cloud.google.com/ or configure Claude/OpenAI instead.';
        } else {
          errorMessage = 'LLM API quota exceeded. You can configure a different provider (Claude, Gemini, or OpenAI) by setting STAGEHAND_LLM_PROVIDER in .env.local.';
        }
      } else if (errorMessage.includes('timeout')) {
        errorMessage = 'Research timed out. The website may be slow or blocking automated access. Please try again.';
      } else if (errorMessage.includes('BROWSERBASE')) {
        errorMessage = 'Browserbase configuration error. Please check your BROWSERBASE_API_KEY and BROWSERBASE_PROJECT_ID.';
      } else if (errorMessage.includes('No LLM API key') || errorMessage.includes('ANTHROPIC_API_KEY') || errorMessage.includes('GOOGLE_GEMINI_API_KEY') || errorMessage.includes('OPENAI_API_KEY')) {
        errorMessage = 'No LLM API key configured. Please add ANTHROPIC_API_KEY, GOOGLE_GEMINI_API_KEY, or OPENAI_API_KEY to your .env.local file.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <ErrorBoundaryWithContext component="ProspectIntelligencePage">
        <div className="min-h-screen py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Prospect Intelligence
                  </h1>
                  <p className="text-gray-600">
                    Automatically research prospect companies to understand their tech stack, hiring activity, and engineering culture
                  </p>
                </div>
                <Link href="/prospect-intelligence/saved">
                  <Button variant="outline">
                    View Saved Prospects
                  </Button>
                </Link>
              </div>
            </div>

            <div className="space-y-6">
              <ProspectIntelligenceForm onSubmit={handleResearch} loading={loading} />

              {loading && (
                <Card>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                        <div className="flex-1">
                          <div className="font-semibold">
                            {progress?.message || 'Researching prospect...'}
                          </div>
                          <div className="text-sm text-gray-600">
                            {progress?.stage === 'initializing' 
                              ? 'This may take 30-120 seconds while we analyze the website'
                              : progress?.stage === 'complete'
                              ? 'Finalizing results...'
                              : 'Please wait, this may take a few minutes'}
                          </div>
                        </div>
                      </div>
                      {progress && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">{progress.stage}</span>
                            <span className="font-semibold">{progress.percentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-black h-2 rounded-full transition-all duration-500"
                              style={{ width: `${progress.percentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {error && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="font-semibold text-red-900 mb-1">Research Failed</div>
                        <div className="text-sm text-red-700">{error}</div>
                        <div className="mt-3 text-xs text-red-600">
                          <strong>Common issues:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-1">
                            {error.includes('quota') || error.includes('429') ? (
                              <>
                                <li>LLM API quota exceeded - check your provider's usage dashboard</li>
                                <li>Add billing credits to your API provider account</li>
                                <li>Wait for your quota to reset (usually monthly)</li>
                                <li><strong>Try a different LLM:</strong> Set <code className="bg-red-100 px-1 rounded">STAGEHAND_LLM_PROVIDER=claude</code> or <code className="bg-red-100 px-1 rounded">STAGEHAND_LLM_PROVIDER=gemini</code> in .env.local</li>
                              </>
                            ) : (
                              <>
                                <li>Website may be blocking automated access</li>
                                <li>Website may be slow or unresponsive</li>
                                <li>Invalid URL format</li>
                                <li>Browserbase or LLM API credentials may be missing or invalid</li>
                                <li>Ensure at least one LLM API key is configured (Claude, Gemini, or OpenAI)</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {data && !loading && (
                <>
                  {cached && (
                    <Card className="mb-4 border-blue-200 bg-blue-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm text-blue-700">
                          <AlertCircle className="h-4 w-4" />
                          <span>This research was retrieved from cache for faster results.</span>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  <ProspectIntelligenceResults data={data} />
                </>
              )}

              {!loading && !error && !data && (
                <Card>
                  <CardContent className="p-6 text-center text-gray-500">
                    <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p>Enter a website URL above to start researching a prospect company</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </ErrorBoundaryWithContext>
    </ProtectedRoute>
  );
}

