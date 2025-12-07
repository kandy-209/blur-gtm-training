/**
 * Live Cold Call Dashboard
 * Real-time dashboard for active phone call training sessions
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, PhoneOff, Activity, Target, TrendingUp, Clock, 
  MessageSquare, Zap, Users, Mic, Volume2, BarChart3,
  AlertCircle, CheckCircle2, Radio, Signal, Brain, Heart,
  Star, Award, ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AudioAnalyzer } from '@/lib/voice-coaching/audio-analyzer';
import type { VoiceMetrics } from '@/lib/voice-coaching/types';

interface LiveCallMetrics {
  callId: string;
  duration: number;
  talkTime: number;
  listenTime: number;
  interruptions: number;
  objectionsRaised: number;
  objectionsResolved: number;
  energyLevel: number;
  confidenceScore: number;
  wordCount?: number;
  pace?: number;
  questionsAsked?: number;
  keyPointsMentioned?: number;
  pitch?: number;
  volume?: number;
  clarity?: number;
  confidence?: number;
}

export default function LiveCallDashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeCall, setActiveCall] = useState<LiveCallMetrics | null>(null);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'in-progress' | 'completed'>('idle');
  const [callId, setCallId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveVoiceMetrics, setLiveVoiceMetrics] = useState<VoiceMetrics | null>(null);
  const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check for active calls on mount
  useEffect(() => {
    checkActiveCall();
    const interval = setInterval(checkActiveCall, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, []);

  // Initialize audio analyzer when call is active
  useEffect(() => {
    if (callStatus === 'in-progress' && callId && !audioAnalyzerRef.current) {
      const analyzer = new AudioAnalyzer(
        callId,
        user?.id,
        {
          enabled: true,
          updateInterval: 200,
          feedbackEnabled: true,
        },
        (metrics) => {
          setLiveVoiceMetrics(metrics);
        }
      );
      analyzer.startAnalysis().then(() => {
        audioAnalyzerRef.current = analyzer;
      }).catch((err) => {
        console.error('Failed to start audio analyzer:', err);
      });
    } else if (callStatus !== 'in-progress' && audioAnalyzerRef.current) {
      audioAnalyzerRef.current.stopAnalysis();
      audioAnalyzerRef.current = null;
      setLiveVoiceMetrics(null);
    }

    return () => {
      if (audioAnalyzerRef.current) {
        audioAnalyzerRef.current.stopAnalysis();
        audioAnalyzerRef.current = null;
      }
    };
  }, [callStatus, callId, user?.id]);

  // Poll for call updates when call is active
  useEffect(() => {
    if (callId && callStatus === 'in-progress') {
      pollingIntervalRef.current = setInterval(() => {
        fetchCallStatus();
      }, 2000); // Poll every 2 seconds for live updates
    } else {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    }

    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [callId, callStatus]);

  const checkActiveCall = async () => {
    try {
      // Check if there's an active call in localStorage or from API
      const storedCallId = localStorage.getItem('activeCallId');
      if (storedCallId) {
        setCallId(storedCallId);
        // Pass storedCallId directly to avoid race condition with state update
        await fetchCallStatus(storedCallId);
      }
    } catch (err) {
      console.error('Error checking active call:', err);
    }
  };

  const fetchCallStatus = async (idOverride?: string) => {
    const targetCallId = idOverride || callId;
    if (!targetCallId) return;

    try {
      const response = await fetch(`/api/vapi/call/${targetCallId}/status`);
      if (!response.ok) {
        throw new Error('Failed to fetch call status');
      }

      const data = await response.json();
      
      if (data.status === 'ringing' || data.status === 'in-progress') {
        setCallStatus('in-progress');
        // Fetch detailed metrics - pass targetCallId to avoid race condition
        await fetchCallMetrics(targetCallId);
      } else if (data.status === 'ended' || data.status === 'completed') {
        setCallStatus('completed');
        localStorage.removeItem('activeCallId');
      }
    } catch (err: any) {
      console.error('Error fetching call status:', err);
      setError(err.message);
    }
  };

  const fetchCallMetrics = async (idOverride?: string) => {
    const targetCallId = idOverride || callId;
    if (!targetCallId) return;

    try {
      // Fetch enhanced metrics from new dedicated endpoint
      const metricsResponse = await fetch(`/api/vapi/call/${targetCallId}/metrics`);
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        if (metricsData.success) {
          setActiveCall({
            ...metricsData,
            callId: metricsData.callId,
            // Merge live voice metrics if available
            pitch: liveVoiceMetrics?.pitch,
            volume: liveVoiceMetrics?.volume,
            clarity: liveVoiceMetrics?.clarity,
            confidence: liveVoiceMetrics?.confidence || metricsData.confidenceScore,
            pace: liveVoiceMetrics?.pace || metricsData.pace,
          });
          return;
        }
      }
      
      // Fallback to analysis endpoint
      const response = await fetch(`/api/vapi/sales-call?callId=${targetCallId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.metrics) {
          setActiveCall({
            ...data.metrics,
            // Merge live voice metrics if available
            pitch: liveVoiceMetrics?.pitch,
            volume: liveVoiceMetrics?.volume,
            clarity: liveVoiceMetrics?.clarity,
            confidence: liveVoiceMetrics?.confidence,
            pace: liveVoiceMetrics?.pace,
          });
        }
      }
    } catch (err) {
      console.error('Error fetching call metrics:', err);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (callStatus === 'idle') {
    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-6xl">
        <div className="mb-6">
          <Link href="/sales-training" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
            <ArrowLeft className="h-4 w-4" />
            Back to Phone Training
          </Link>
          <h1 className="text-3xl font-bold tracking-tight mb-2">Live Call Dashboard</h1>
          <p className="text-muted-foreground">Real-time metrics for active phone call training sessions</p>
        </div>

        <Card className="border-gray-200">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-100 mb-4">
                <Phone className="h-10 w-10 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No Active Call</h2>
              <p className="text-muted-foreground mb-6">
                Start a phone call training session to see live metrics here
              </p>
              <Link href="/sales-training">
                <Button size="lg" className="gap-2">
                  <Phone className="h-5 w-5" />
                  Start Training Call
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/sales-training" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-4 w-4" />
          Back to Phone Training
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-3">
              <div className="relative">
                <Radio className="h-8 w-8 text-green-600 animate-pulse" />
                <div className="absolute inset-0 bg-green-600 rounded-full animate-ping opacity-75" />
              </div>
              Live Call Dashboard
            </h1>
            <p className="text-muted-foreground">Real-time metrics updating as you speak</p>
          </div>
          <Badge variant="outline" className="text-lg px-4 py-2 border-green-500 text-green-700 bg-green-50">
            <Signal className="h-4 w-4 mr-2 animate-pulse" />
            Call Active
          </Badge>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Metrics Grid */}
      <div className="grid gap-6 mb-6">
        {/* Confidence Score - Hero Metric */}
        <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="h-6 w-6 text-blue-600" />
              Overall Confidence Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-4">
              <div className="text-5xl font-bold text-gray-900">
                {activeCall?.confidenceScore || liveVoiceMetrics?.confidence || 0}
                <span className="text-2xl text-muted-foreground ml-2">/100</span>
              </div>
              <Badge 
                className={`text-xl px-4 py-2 ${
                  (activeCall?.confidenceScore || liveVoiceMetrics?.confidence || 0) >= 80 ? 'bg-green-600' :
                  (activeCall?.confidenceScore || liveVoiceMetrics?.confidence || 0) >= 60 ? 'bg-yellow-600' :
                  'bg-red-600'
                }`}
              >
                {(activeCall?.confidenceScore || liveVoiceMetrics?.confidence || 0) >= 80 ? 'Excellent' :
                 (activeCall?.confidenceScore || liveVoiceMetrics?.confidence || 0) >= 60 ? 'Good' :
                 'Needs Work'}
              </Badge>
            </div>
            <Progress 
              value={activeCall?.confidenceScore || liveVoiceMetrics?.confidence || 0} 
              className="h-4"
            />
          </CardContent>
        </Card>

        {/* Core Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-gray-200 hover:border-blue-300 hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-600" />
                Call Duration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {formatTime(activeCall?.duration || 0)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Talk: {formatTime(activeCall?.talkTime || 0)} | Listen: {formatTime(activeCall?.listenTime || 0)}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:border-orange-300 hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Target className="h-4 w-4 text-orange-600" />
                Objections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {activeCall?.objectionsResolved || 0}/{activeCall?.objectionsRaised || 0}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {activeCall?.objectionsRaised ? 
                  `${Math.round(((activeCall.objectionsResolved || 0) / activeCall.objectionsRaised) * 100)}% handled` :
                  'No objections yet'}
              </div>
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:border-yellow-300 hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                Energy Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeCall?.energyLevel || 0}%</div>
              <Progress value={activeCall?.energyLevel || 0} className="h-2 mt-2" />
            </CardContent>
          </Card>

          <Card className="border-gray-200 hover:border-purple-300 hover:shadow-md transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                Interruptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{activeCall?.interruptions || 0}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {activeCall?.interruptions === 0 ? 'Great flow!' : 'Try to listen more'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voice Analysis Metrics */}
        {liveVoiceMetrics && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-purple-600" />
                Live Voice Analysis
              </CardTitle>
              <CardDescription>Real-time voice metrics from your microphone</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {liveVoiceMetrics.pitch !== undefined && (
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <div className="text-xs text-muted-foreground">Pitch (Hz)</div>
                    </div>
                    <div className="text-2xl font-bold text-blue-900">
                      {Math.round(liveVoiceMetrics.pitch)}
                    </div>
                  </div>
                )}
                {liveVoiceMetrics.volume !== undefined && (
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Volume2 className="h-4 w-4 text-green-600" />
                      <div className="text-xs text-muted-foreground">Volume (dB)</div>
                    </div>
                    <div className="text-2xl font-bold text-green-900">
                      {Math.round(liveVoiceMetrics.volume)}
                    </div>
                  </div>
                )}
                {liveVoiceMetrics.confidence !== undefined && (
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="h-4 w-4 text-purple-600" />
                      <div className="text-xs text-muted-foreground">Confidence (%)</div>
                    </div>
                    <div className="text-2xl font-bold text-purple-900">
                      {Math.round(liveVoiceMetrics.confidence)}%
                    </div>
                  </div>
                )}
                {liveVoiceMetrics.clarity !== undefined && (
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="h-4 w-4 text-orange-600" />
                      <div className="text-xs text-muted-foreground">Clarity (%)</div>
                    </div>
                    <div className="text-2xl font-bold text-orange-900">
                      {Math.round(liveVoiceMetrics.clarity)}%
                    </div>
                  </div>
                )}
                {liveVoiceMetrics.pace !== undefined && (
                  <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-4 w-4 text-indigo-600" />
                      <div className="text-xs text-muted-foreground">Pace (WPM)</div>
                    </div>
                    <div className="text-2xl font-bold text-indigo-900">
                      {Math.round(liveVoiceMetrics.pace)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {liveVoiceMetrics.pace < 120 ? 'Slow' : liveVoiceMetrics.pace > 180 ? 'Fast' : 'Optimal'}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Additional Metrics */}
        {activeCall && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {activeCall.wordCount !== undefined && (
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-600" />
                    Words Spoken
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeCall.wordCount}</div>
                </CardContent>
              </Card>
            )}
            {activeCall.questionsAsked !== undefined && (
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    Questions Asked
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeCall.questionsAsked}</div>
                </CardContent>
              </Card>
            )}
            {activeCall.keyPointsMentioned !== undefined && (
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Star className="h-4 w-4 text-orange-600" />
                    Key Points
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeCall.keyPointsMentioned}</div>
                </CardContent>
              </Card>
            )}
            {activeCall.pace !== undefined && (
              <Card className="border-gray-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4 text-green-600" />
                    Speaking Pace
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeCall.pace} WPM</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {activeCall.pace < 120 ? 'Slow' : activeCall.pace > 180 ? 'Fast' : 'Optimal'}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Talk-to-Listen Ratio */}
        {activeCall && activeCall.talkTime > 0 && activeCall.listenTime > 0 && (
          <Card className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">Talk-to-Listen Ratio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Balance</span>
                <Badge variant="outline">
                  {Math.round((activeCall.talkTime / (activeCall.talkTime + activeCall.listenTime)) * 100)}% talk
                </Badge>
              </div>
              <div className="flex gap-2">
                <div 
                  className="h-4 bg-blue-500 rounded"
                  style={{ width: `${(activeCall.talkTime / (activeCall.talkTime + activeCall.listenTime)) * 100}%` }}
                />
                <div 
                  className="h-4 bg-green-500 rounded"
                  style={{ width: `${(activeCall.listenTime / (activeCall.talkTime + activeCall.listenTime)) * 100}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span>Talk: {formatTime(activeCall.talkTime)}</span>
                <span>Listen: {formatTime(activeCall.listenTime)}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

