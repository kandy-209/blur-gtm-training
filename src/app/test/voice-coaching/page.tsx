/**
 * Voice Coaching Test Page
 * Test page for voice coaching functionality
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VoiceCoachingErrorBoundary } from './error-boundary';
import { VoiceCoachingDebug } from './debug';
import { UserImpactDashboard } from '@/components/VoiceCoaching/UserImpactDashboard';
import { MetricsComparisonChart } from '@/components/VoiceCoaching/MetricsComparisonChart';
import { ImprovementTimeline } from '@/components/VoiceCoaching/ImprovementTimeline';
import { FeedbackAnalysisDashboard } from '@/components/VoiceCoaching/FeedbackAnalysisDashboard';
import { PracticeCoachPanel } from '@/components/VoiceCoaching/PracticeCoachPanel';
import { DataExportButton } from '@/components/VoiceCoaching/DataExportButton';
import { AnthropicFeedbackPanel } from '@/components/VoiceCoaching/AnthropicFeedbackPanel';
import { Mic, MicOff, Loader2, CheckCircle2, AlertCircle, Info, BarChart3, Brain, BookOpen, Sparkles } from 'lucide-react';
import { UserVoiceModel } from '@/lib/voice-coaching/user-model';
import { userDataPersistence } from '@/lib/voice-coaching/user-data-persistence';

// Import voice coaching modules with error handling
import { 
  AudioAnalyzer, 
  CoachingEngine, 
  type VoiceMetrics, 
  type FeedbackMessage 
} from '@/lib/voice-coaching';

function VoiceCoachingTestPageContent() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [metrics, setMetrics] = useState<VoiceMetrics | null>(null);
  const [feedback, setFeedback] = useState<FeedbackMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<VoiceMetrics[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showFeedbackAnalysis, setShowFeedbackAnalysis] = useState(false);
  const [showPracticeCoach, setShowPracticeCoach] = useState(false);
  const [showAnthropicFeedback, setShowAnthropicFeedback] = useState(false);
  const [previousMetrics, setPreviousMetrics] = useState<VoiceMetrics | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [impactAnalysis, setImpactAnalysis] = useState<any>(null);
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  
  const analyzerRef = useRef<AudioAnalyzer | null>(null);
  const coachingEngineRef = useRef<CoachingEngine>(new CoachingEngine());
  const conversationIdRef = useRef<string | null>(null);
  const userIdRef = useRef<string>('test_user'); // In production, get from auth
  
  // Initialize conversation ID only on client to avoid hydration mismatch
  useEffect(() => {
    if (!conversationIdRef.current) {
      conversationIdRef.current = `test_conv_${Date.now()}`;
    }
  }, []);

  // Initialize analyzer
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (analyzerRef.current) {
        analyzerRef.current.stopAnalysis();
      }
    };
  }, []);

  const handleStartAnalysis = async () => {
    try {
      setError(null);
      
      // Check if browser supports required APIs
      if (typeof window === 'undefined') {
        setError('This feature requires a browser environment.');
        return;
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError('Microphone access is not supported in this browser. Please use Chrome, Firefox, or Edge.');
        return;
      }

      // Ensure conversation ID is set
      if (!conversationIdRef.current) {
        conversationIdRef.current = `test_conv_${Date.now()}`;
      }
      
      // Create analyzer
      const analyzer = new AudioAnalyzer(
        conversationIdRef.current,
        undefined, // userId
        {
          enabled: true,
          updateInterval: 200,
          feedbackEnabled: true
        },
        (newMetrics) => {
          // Update metrics
          setMetrics(newMetrics);
          setMetricsHistory(prev => [...prev.slice(-50), newMetrics]); // Keep last 50
          
          // Generate feedback
          const newFeedback = coachingEngineRef.current.analyzeMetrics(newMetrics);
          if (newFeedback.length > 0) {
            setFeedback(prev => [...prev.slice(-10), ...newFeedback]); // Keep last 10
          }
        }
      );
      
      analyzerRef.current = analyzer;
      await analyzer.startAnalysis();
      setIsAnalyzing(true);
      setSessionStartTime(Date.now());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start analysis';
      setError(errorMessage);
      console.error('Error starting analysis:', err);
      
      // Provide helpful guidance based on error type
      if (errorMessage.includes('permission') || errorMessage.includes('denied')) {
        setTimeout(() => {
          setError(errorMessage + ' Click the lock icon in your browser address bar to allow microphone access.');
        }, 100);
      }
    }
  };

  const handleStopAnalysis = async () => {
    if (analyzerRef.current) {
      analyzerRef.current.stopAnalysis();
      analyzerRef.current = null;
    }
    
    // Save session data
    if (metrics && conversationIdRef.current && sessionStartTime) {
      const duration = Date.now() - sessionStartTime;
      try {
        await fetch('/api/voice-coaching/user-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userIdRef.current,
            conversationId: conversationIdRef.current,
            metrics,
            feedback,
            suggestions: coachingEngineRef.current.generateSuggestions(metrics),
            duration,
          }),
        });

        // Refresh profile
        const profileResponse = await fetch(
          `/api/voice-coaching/user-profile?userId=${userIdRef.current}`
        );
        const profileData = await profileResponse.json();
        if (profileData.profile) {
          setUserProfile(profileData.profile);
          setImpactAnalysis(profileData.impactAnalysis);
        }

        // Store previous metrics for comparison
        setPreviousMetrics(metrics);
      } catch (err) {
        console.error('Error saving session:', err);
      }
    }
    
    setIsAnalyzing(false);
    setMetrics(null);
    setSessionStartTime(null);
  };

  const handleSaveMetrics = async () => {
    if (!metrics) return;
    
    // Ensure conversation ID is set
    if (!conversationIdRef.current) {
      conversationIdRef.current = `test_conv_${Date.now()}`;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/voice-coaching/metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: conversationIdRef.current,
          userId: undefined,
          metrics: {
            pace: metrics.pace,
            pitch: metrics.pitch,
            volume: metrics.volume,
            pauses: metrics.pauses,
            clarity: metrics.clarity,
            confidence: metrics.confidence
          },
          timestamp: metrics.timestamp
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save metrics');
      }

      const data = await response.json();
      console.log('Metrics saved:', data);
      alert('Metrics saved successfully!');
    } catch (err) {
      console.error('Error saving metrics:', err);
      alert('Failed to save metrics');
    } finally {
      setIsSaving(false);
    }
  };

  const handleGetFeedback = async () => {
    // Ensure conversation ID is set
    if (!conversationIdRef.current) {
      conversationIdRef.current = `test_conv_${Date.now()}`;
    }
    
    try {
      const response = await fetch(
        `/api/voice-coaching/feedback?conversationId=${conversationIdRef.current}`
      );

      if (!response.ok) {
        throw new Error('Failed to get feedback');
      }

      const data = await response.json();
      console.log('Feedback:', data);
      alert(`Found ${data.feedback.length} feedback messages and ${data.suggestions.length} suggestions`);
    } catch (err) {
      console.error('Error getting feedback:', err);
      alert('Failed to get feedback');
    }
  };

  const getMetricColor = (metric: keyof VoiceMetrics, value: number): string => {
    const targets = {
      pace: { min: 140, max: 180 },
      pitch: { min: 85, max: 255 },
      volume: { min: -18, max: -6 },
      pauses: { min: 3, max: 8 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 }
    };

    const target = targets[metric];
    if (!target) return 'bg-gray-500';

    if (value >= target.min && value <= target.max) return 'bg-green-500';
    if (value < target.min * 0.8 || value > target.max * 1.2) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const formatMetricValue = (metric: keyof VoiceMetrics, value: number): string => {
    switch (metric) {
      case 'pace':
        return `${value} WPM`;
      case 'pitch':
        return `${value} Hz`;
      case 'volume':
        return `${value} dB`;
      case 'pauses':
        return `${value}/min`;
      case 'clarity':
      case 'confidence':
        return `${value}/100`;
      default:
        return String(value);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <VoiceCoachingDebug />
      
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Voice Coaching Test</CardTitle>
              <CardDescription>
                Test real-time voice analysis and coaching feedback
              </CardDescription>
            </div>
            <DataExportButton userId={userIdRef.current} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            {!isAnalyzing ? (
              <Button onClick={handleStartAnalysis} size="lg">
                <Mic className="h-5 w-5 mr-2" />
                Start Analysis
              </Button>
            ) : (
              <Button onClick={handleStopAnalysis} variant="destructive" size="lg">
                <MicOff className="h-5 w-5 mr-2" />
                Stop Analysis
              </Button>
            )}
            
            {metrics && (
              <>
                <Button 
                  onClick={handleSaveMetrics} 
                  variant="outline"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                  )}
                  Save Metrics
                </Button>
                
                <Button onClick={handleGetFeedback} variant="outline">
                  Get Feedback
                </Button>

                <Button 
                  onClick={() => setShowDashboard(!showDashboard)} 
                  variant="outline"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  {showDashboard ? 'Hide' : 'Show'} Dashboard
                </Button>

                <Button 
                  onClick={() => setShowFeedbackAnalysis(!showFeedbackAnalysis)} 
                  variant="outline"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  {showFeedbackAnalysis ? 'Hide' : 'Show'} AI Analysis
                </Button>

                <Button 
                  onClick={() => setShowPracticeCoach(!showPracticeCoach)} 
                  variant="outline"
                >
                  <BookOpen className="h-4 w-4 mr-2" />
                  {showPracticeCoach ? 'Hide' : 'Show'} Practice Coach
                </Button>

                <Button 
                  onClick={() => setShowAnthropicFeedback(!showAnthropicFeedback)} 
                  variant="outline"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  {showAnthropicFeedback ? 'Hide' : 'Show'} AI Feedback
                </Button>
              </>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-2">{error}</div>
                {(error.includes('permission') || error.includes('denied')) && (
                  <div className="text-sm mt-2 space-y-1">
                    <p><strong>To fix this:</strong></p>
                    <ol className="list-decimal list-inside space-y-1 ml-2">
                      <li>Click the lock icon (🔒) or camera icon in your browser address bar</li>
                      <li>Find "Microphone" in the permissions list</li>
                      <li>Change it to "Allow"</li>
                      <li>Refresh the page and try again</li>
                    </ol>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Or go to: Browser Settings → Privacy → Site Settings → Microphone
                    </p>
                  </div>
                )}
                {error.includes('not supported') && (
                  <div className="text-sm mt-2">
                    <p>Please use a modern browser like:</p>
                    <ul className="list-disc list-inside ml-2 mt-1">
                      <li>Google Chrome</li>
                      <li>Microsoft Edge</li>
                      <li>Mozilla Firefox</li>
                      <li>Safari (macOS/iOS)</li>
                    </ul>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}

          {isAnalyzing && (
            <Alert className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Analysis is running. Speak into your microphone to see real-time metrics.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Real-Time Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {(Object.keys(metrics) as Array<keyof VoiceMetrics>).map((metric) => {
            if (metric === 'timestamp') return null;
            const value = metrics[metric];
            const color = getMetricColor(metric, value);
            
            return (
              <Card key={metric}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium capitalize">
                    {metric}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold">
                      {formatMetricValue(metric, value)}
                    </span>
                    <div className={`h-3 w-3 rounded-full ${color}`} />
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{
                        width: `${Math.min(100, Math.max(0, (value / 200) * 100))}%`
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Coaching Feedback */}
      {feedback.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Coaching Feedback</CardTitle>
            <CardDescription>
              Real-time suggestions based on your voice metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {feedback.slice(-5).reverse().map((fb) => (
                <Alert
                  key={fb.id}
                  variant={
                    fb.type === 'critical' ? 'destructive' :
                    fb.type === 'warning' ? 'default' : 'default'
                  }
                  className={
                    fb.type === 'info' ? 'bg-blue-50 border-blue-200' :
                    fb.type === 'success' ? 'bg-green-50 border-green-200' : ''
                  }
                >
                  <div className="flex items-start gap-2">
                    {fb.type === 'critical' && <AlertCircle className="h-4 w-4 text-red-600" />}
                    {fb.type === 'warning' && <AlertCircle className="h-4 w-4 text-yellow-600" />}
                    {fb.type === 'info' && <Info className="h-4 w-4 text-blue-600" />}
                    {fb.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                    <div className="flex-1">
                      <AlertDescription className="font-medium">
                        {fb.message}
                      </AlertDescription>
                      <div className="text-xs text-gray-500 mt-1">
                        {fb.metric}: {formatMetricValue(fb.metric, fb.currentValue)}
                        {fb.targetValue && ` → Target: ${formatMetricValue(fb.metric, fb.targetValue)}`}
                      </div>
                    </div>
                  </div>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics History Chart */}
      {metricsHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Metrics History</CardTitle>
            <CardDescription>
              Last {metricsHistory.length} measurements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Pace (WPM)</h4>
                <div className="h-20 bg-gray-100 rounded p-2 flex items-end gap-1">
                  {metricsHistory.slice(-20).map((m, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-blue-500 rounded-t"
                      style={{
                        height: `${(m.pace / 250) * 100}%`,
                        minHeight: '2px'
                      }}
                      title={`${m.pace} WPM`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Volume (dB)</h4>
                <div className="h-20 bg-gray-100 rounded p-2 flex items-end gap-1">
                  {metricsHistory.slice(-20).map((m, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-green-500 rounded-t"
                      style={{
                        height: `${((m.volume + 60) / 60) * 100}%`,
                        minHeight: '2px'
                      }}
                      title={`${m.volume} dB`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium mb-2">Confidence</h4>
                <div className="h-20 bg-gray-100 rounded p-2 flex items-end gap-1">
                  {metricsHistory.slice(-20).map((m, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-purple-500 rounded-t"
                      style={{
                        height: `${m.confidence}%`,
                        minHeight: '2px'
                      }}
                      title={`${m.confidence}/100`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Anthropic AI Feedback */}
      {showAnthropicFeedback && (
        <div className="mb-6">
          <AnthropicFeedbackPanel
            userId={userIdRef.current}
            currentMetrics={metrics}
            previousMetrics={previousMetrics}
          />
        </div>
      )}

      {/* Practice Coach Panel */}
      {showPracticeCoach && (
        <div className="mb-6">
          <PracticeCoachPanel
            userId={userIdRef.current}
            currentMetrics={metrics}
            userProfile={userProfile}
          />
        </div>
      )}

      {/* AI Feedback Analysis */}
      {showFeedbackAnalysis && (
        <div className="mb-6">
          <FeedbackAnalysisDashboard userId={userIdRef.current} />
        </div>
      )}

      {/* User Impact Dashboard */}
      {showDashboard && userProfile && impactAnalysis && (
        <div className="mb-6">
          <UserImpactDashboard
            userId={userIdRef.current}
            profile={userProfile}
            impactAnalysis={impactAnalysis}
          />
        </div>
      )}

      {/* Metrics Comparison */}
      {metrics && (
        <div className="mb-6">
          <MetricsComparisonChart userMetrics={metrics} />
        </div>
      )}

      {/* Improvement Timeline */}
      {userProfile && (
        <div className="mb-6">
          <ImprovementTimeline trends={userProfile.improvementTrend} />
        </div>
      )}

      {/* Instructions */}
      {!isAnalyzing && !metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Mic className="h-4 w-4" />
                  Microphone Setup
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
                  <li>Click "Start Analysis" button above</li>
                  <li>Browser will prompt for microphone permission</li>
                  <li><strong>Click "Allow"</strong> when prompted</li>
                  <li>If you don't see a prompt, check browser address bar for microphone icon</li>
                </ol>
              </div>

              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>Having trouble?</strong> If permission was denied:
                  <ol className="list-decimal list-inside mt-2 space-y-1 text-sm">
                    <li>Click the lock icon (🔒) in your browser address bar</li>
                    <li>Find "Microphone" and set it to "Allow"</li>
                    <li>Refresh the page and try again</li>
                  </ol>
                </AlertDescription>
              </Alert>

              <div>
                <h4 className="font-medium mb-2">Testing Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm ml-2">
                  <li>After granting permission, speak into your microphone</li>
                  <li>Watch real-time metrics update as you speak</li>
                  <li>See coaching feedback appear automatically</li>
                  <li>Click "Save Metrics" to test API endpoint</li>
                  <li>Click "Get Feedback" to retrieve saved feedback</li>
                </ol>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Target Metrics:</h4>
                <ul className="text-sm space-y-1">
                  <li><strong>Pace:</strong> 140-180 WPM (words per minute)</li>
                  <li><strong>Pitch:</strong> 85-255 Hz (voice frequency)</li>
                  <li><strong>Volume:</strong> -18 to -6 dB (speaking volume)</li>
                  <li><strong>Pauses:</strong> 3-8 per minute</li>
                  <li><strong>Clarity:</strong> 70-100 (speech clarity)</li>
                  <li><strong>Confidence:</strong> 70-100 (voice stability)</li>
                </ul>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <h4 className="font-medium mb-2 text-yellow-800">Browser Compatibility:</h4>
                <p className="text-sm text-yellow-700">
                  Best experience on Chrome, Edge, or Firefox. Safari requires user interaction first.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function VoiceCoachingTestPage() {
  return (
    <VoiceCoachingErrorBoundary>
      <VoiceCoachingTestPageContent />
    </VoiceCoachingErrorBoundary>
  );
}

