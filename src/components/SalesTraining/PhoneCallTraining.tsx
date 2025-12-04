/**
 * Phone Call Sales Training Component
 * Complete phone call training interface for sales reps
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Phone, PhoneOff, PhoneCall, Loader2, CheckCircle2, 
  AlertCircle, Clock, Target, TrendingUp, MessageSquare,
  Award, BarChart3, Lightbulb, Info
} from 'lucide-react';
import { scenarios } from '@/data/scenarios';
import type { Scenario } from '@/types/roleplay';
import { analytics } from '@/lib/analytics';

interface PhoneCallTrainingProps {
  userId: string;
}

interface SalesCallMetrics {
  callId: string;
  duration: number;
  talkTime: number;
  listenTime: number;
  interruptions: number;
  objectionsRaised: number;
  objectionsResolved: number;
  meetingBooked: boolean;
  saleClosed: boolean;
  energyLevel: number;
  confidenceScore: number;
  wordCount?: number;
  meetingAttempts?: number;
  closingAttempts?: number;
}

interface SalesCallAnalysis {
  overall_score: number;
  strengths: string[];
  areas_for_improvement: string[];
  objection_handling: {
    score: number;
    objections_handled: number;
    objections_missed: number;
    recommendations: string[];
  };
  meeting_booking: {
    attempted: boolean;
    successful: boolean;
    attempts: number;
    recommendations: string[];
  };
  closing: {
    attempted: boolean;
    successful: boolean;
    attempts: number;
    recommendations: string[];
  };
  communication: {
    talk_to_listen_ratio: number;
    energy_level: number;
    clarity_score: number;
    recommendations: string[];
  };
  key_moments: Array<{
    timestamp: number;
    type: string;
    description: string;
  }>;
}

export function PhoneCallTraining({ userId }: PhoneCallTrainingProps) {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isCalling, setIsCalling] = useState(false);
  const [callStatus, setCallStatus] = useState<'idle' | 'ringing' | 'in-progress' | 'completed' | 'failed'>('idle');
  const [callId, setCallId] = useState<string | null>(null);
  const [callMetrics, setCallMetrics] = useState<SalesCallMetrics | null>(null);
  const [callAnalysis, setCallAnalysis] = useState<SalesCallAnalysis | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [trainingMode, setTrainingMode] = useState<'practice' | 'evaluation'>('practice');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  const formatPhoneNumber = (value: string): string => {
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    }
    return cleaned.replace(/(\d{1})(\d{3})(\d{3})(\d{4})/, '+$1 ($2) $3-$4');
  };

  const initiateCall = async () => {
    if (!selectedScenario || !phoneNumber) {
      setError('Please select a scenario and enter your phone number');
      return;
    }

    try {
      setIsCalling(true);
      setError(null);
      setCallStatus('ringing');
      setCallMetrics(null);
      setCallAnalysis(null);

      const response = await fetch('/api/vapi/sales-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          userId,
          scenarioId: selectedScenario.id,
          trainingMode,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to initiate call');
      }

      const data = await response.json();
      setCallId(data.callId);
      setCallStatus('in-progress');
      
      // Track call started event
      analytics.track({
        eventType: 'call_started',
        scenarioId: selectedScenario.id,
        metadata: {
          callId: data.callId,
          trainingMode,
        },
      });

      // Start polling for call status and analysis
      const interval = setInterval(async () => {
        try {
          // Get call status via our API route (server-side handles Vapi auth)
          const statusResponse = await fetch(
            `/api/vapi/call/${data.callId}/status`
          );

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            const status = statusData.status;

            if (status === 'ended' || status === 'completed') {
              clearInterval(interval);
              setCallStatus('completed');
              setIsCalling(false);

              // Get analysis from Modal
              await fetchAnalysis(data.callId, selectedScenario.id);
            } else if (status === 'in-progress') {
              setCallDuration(statusData.duration || 0);
            }
          }

          // Try to get analysis if call is in progress
          if (callStatus === 'in-progress') {
            await fetchAnalysis(data.callId, selectedScenario.id);
          }
        } catch (err) {
          console.error('Error polling call status:', err);
        }
      }, 3000);

      setPollingInterval(interval);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initiate call');
      setIsCalling(false);
      setCallStatus('failed');
    }
  };

  const fetchAnalysis = async (callId: string, scenarioId: string) => {
    try {
      const response = await fetch(
        `/api/vapi/sales-call?callId=${callId}&scenarioId=${scenarioId}`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.metrics) {
          setCallMetrics(data.metrics);
        }
        if (data.analysis) {
          setCallAnalysis(data.analysis);
          
          // Track call completed and analysis ready
          analytics.track({
            eventType: 'call_completed',
            scenarioId: scenarioId,
            score: data.analysis.overall_score,
            metadata: {
              callId: callId,
              duration: data.metrics?.duration || 0,
              overallScore: data.analysis.overall_score,
              meetingBooked: data.metrics?.meetingBooked || false,
              saleClosed: data.metrics?.saleClosed || false,
            },
          });
          
          // Store call analytics
          if (data.metrics && data.analysis) {
            fetch('/api/analytics/calls', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId,
                callId,
                scenarioId,
                duration: data.metrics.duration || 0,
                metrics: data.metrics,
                analysis: data.analysis,
              }),
            }).catch(err => console.error('Failed to store call analytics:', err));
          }
        }
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
    }
  };

  const endCall = async () => {
    if (!callId) return;

    try {
      await fetch(`/api/vapi/call/${callId}/end`, {
        method: 'POST',
      });

      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }

      // Get final analysis
      if (selectedScenario) {
        await fetchAnalysis(callId, selectedScenario.id);
      }

      setCallStatus('completed');
      setIsCalling(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end call');
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRatingColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Scenario Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Select Training Scenario
          </CardTitle>
          <CardDescription>
            Choose a scenario to practice on a real phone call
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select
            value={selectedScenario?.id || ''}
            onValueChange={(value) => {
              const scenario = scenarios.find(s => s.id === value);
              setSelectedScenario(scenario || null);
            }}
            disabled={isCalling}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a scenario" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario) => (
                <SelectItem key={scenario.id} value={scenario.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{scenario.persona.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {scenario.objection_category}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedScenario && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium mb-2">Scenario Details:</h4>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Persona:</strong> {selectedScenario.persona.name}
              </p>
              <p className="text-sm text-muted-foreground mb-2">
                <strong>Objection:</strong> {selectedScenario.objection_category}
              </p>
              <p className="text-sm text-muted-foreground mb-3">
                <strong>Goal:</strong> {selectedScenario.persona.primaryGoal}
              </p>
              <div>
                <p className="text-xs font-medium mb-1">Key Points to Cover:</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                  {selectedScenario.keyPoints.slice(0, 3).map((point, i) => (
                    <li key={i}>{point}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <label className="text-sm font-medium">Training Mode:</label>
            <Select
              value={trainingMode}
              onValueChange={(value: 'practice' | 'evaluation') => setTrainingMode(value)}
              disabled={isCalling}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="practice">Practice</SelectItem>
                <SelectItem value="evaluation">Evaluation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Phone Number Input */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Phone Number
          </CardTitle>
          <CardDescription>
            Enter your phone number to receive the training call
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="tel"
            placeholder="+1 (555) 123-4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            disabled={isCalling}
            className="text-lg"
          />

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Call Controls */}
          <div className="flex gap-2">
            {callStatus === 'idle' && (
              <Button
                onClick={initiateCall}
                disabled={!selectedScenario || !phoneNumber || isCalling}
                className="flex-1"
                size="lg"
              >
                {isCalling ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <PhoneCall className="h-5 w-5 mr-2" />
                    Start Training Call
                  </>
                )}
              </Button>
            )}

            {(callStatus === 'ringing' || callStatus === 'in-progress') && (
              <>
                <Button
                  onClick={endCall}
                  variant="destructive"
                  className="flex-1"
                  size="lg"
                >
                  <PhoneOff className="h-5 w-5 mr-2" />
                  End Call
                </Button>
                {callDuration > 0 && (
                  <div className="flex items-center gap-2 px-4">
                    <Clock className="h-4 w-4" />
                    <span className="font-mono">
                      {formatDuration(callDuration)}
                    </span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Call Status */}
          {callStatus !== 'idle' && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {callStatus === 'ringing' && <Loader2 className="h-4 w-4 animate-spin" />}
                  {callStatus === 'in-progress' && <Phone className="h-4 w-4" />}
                  {callStatus === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  <span className="font-medium capitalize">
                    {callStatus.replace('-', ' ')}
                  </span>
                </div>
                {callMetrics && (
                  <Badge variant="outline">
                    Score: {callMetrics.confidenceScore}/100
                  </Badge>
                )}
              </div>
              {selectedScenario && (
                <p className="text-sm text-muted-foreground">
                  Practicing with: <strong>{selectedScenario.persona.name}</strong>
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Real-Time Metrics (During Call) */}
      {callStatus === 'in-progress' && callMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Live Call Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Talk Time</div>
                <div className="text-2xl font-bold">
                  {Math.floor(callMetrics.talkTime / 60)}m {Math.floor(callMetrics.talkTime % 60)}s
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Objections</div>
                <div className="text-2xl font-bold">
                  {callMetrics.objectionsResolved}/{callMetrics.objectionsRaised}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Energy</div>
                <div className="text-2xl font-bold">{callMetrics.energyLevel}%</div>
                <Progress value={callMetrics.energyLevel} className="h-2 mt-1" />
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Interruptions</div>
                <div className="text-2xl font-bold">{callMetrics.interruptions}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Post-Call Analysis */}
      {callStatus === 'completed' && callAnalysis && callMetrics && (
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="objections">Objections</TabsTrigger>
            <TabsTrigger value="meeting">Meeting Booking</TabsTrigger>
            <TabsTrigger value="closing">Closing</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Call Analysis</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Overall Score */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Score</span>
                    <span className={`text-3xl font-bold ${getRatingColor(callAnalysis.overall_score)}`}>
                      {callAnalysis.overall_score}/100
                    </span>
                  </div>
                  <Progress value={callAnalysis.overall_score} className="h-3" />
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Meeting Booked</div>
                    <div className="text-2xl font-bold">
                      {callMetrics.meetingBooked ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-sm text-muted-foreground">Sale Closed</div>
                    <div className="text-2xl font-bold">
                      {callMetrics.saleClosed ? 'Yes' : 'No'}
                    </div>
                  </div>
                </div>

                {/* Strengths */}
                {callAnalysis.strengths.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Award className="h-4 w-4 text-green-600" />
                      Strengths
                    </h4>
                    <ul className="space-y-1">
                      {callAnalysis.strengths.map((strength, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3 text-green-600" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Areas for Improvement */}
                {callAnalysis.areas_for_improvement.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4 text-orange-600" />
                      Areas for Improvement
                    </h4>
                    <ul className="space-y-1">
                      {callAnalysis.areas_for_improvement.map((area, i) => (
                        <li key={i} className="text-sm flex items-center gap-2">
                          <AlertCircle className="h-3 w-3 text-orange-600" />
                          {area}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="objections">
            <Card>
              <CardHeader>
                <CardTitle>Objection Handling</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Objection Handling Score</span>
                      <span className={`text-2xl font-bold ${getRatingColor(callAnalysis.objection_handling.score)}`}>
                        {callAnalysis.objection_handling.score}/100
                      </span>
                    </div>
                    <Progress value={callAnalysis.objection_handling.score} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-muted-foreground">Objections Handled</div>
                      <div className="text-xl font-bold">
                        {callAnalysis.objection_handling.objections_handled}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground">Objections Missed</div>
                      <div className="text-xl font-bold text-red-600">
                        {callAnalysis.objection_handling.objections_missed}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {callAnalysis.objection_handling.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <Lightbulb className="h-3 w-3 text-yellow-600 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meeting">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Booking Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Attempted</div>
                      <div className="text-2xl font-bold">
                        {callAnalysis.meeting_booking.attempted ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Successful</div>
                      <div className="text-2xl font-bold">
                        {callAnalysis.meeting_booking.successful ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Attempts</div>
                    <div className="text-xl font-bold">
                      {callAnalysis.meeting_booking.attempts}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {callAnalysis.meeting_booking.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <Lightbulb className="h-3 w-3 text-yellow-600 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="closing">
            <Card>
              <CardHeader>
                <CardTitle>Closing Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Attempted</div>
                      <div className="text-2xl font-bold">
                        {callAnalysis.closing.attempted ? 'Yes' : 'No'}
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Successful</div>
                      <div className="text-2xl font-bold">
                        {callAnalysis.closing.successful ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Attempts</div>
                    <div className="text-xl font-bold">
                      {callAnalysis.closing.attempts}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Recommendations</h4>
                    <ul className="space-y-1">
                      {callAnalysis.closing.recommendations.map((rec, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <Lightbulb className="h-3 w-3 text-yellow-600 mt-0.5" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <p className="text-sm">
            <strong>How it works:</strong>
          </p>
          <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
            <li>Select a scenario and enter your phone number</li>
            <li>Click "Start Training Call" to receive a call</li>
            <li>Practice your sales skills during the call</li>
            <li>Get instant AI-powered analysis after the call</li>
            <li>Review detailed metrics and recommendations</li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}

