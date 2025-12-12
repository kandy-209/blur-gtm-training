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
  Award, BarChart3, Lightbulb, Info, Zap, Users, 
  Mic, Volume2, Activity, Brain, Heart, Star
} from 'lucide-react';
import { scenarios } from '@/data/scenarios';
import type { Scenario } from '@/types/roleplay';
import { analytics } from '@/lib/analytics';
import { AudioAnalyzer } from '@/lib/voice-coaching/audio-analyzer';
import type { VoiceMetrics } from '@/lib/voice-coaching/types';

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
  pitch?: number;
  volume?: number;
  clarity?: number;
  confidence?: number;
  // Enhanced metrics
  averageResponseTime?: number;
  questionsAsked?: number;
  keyPointsMentioned?: number;
  empathyScore?: number;
  professionalismScore?: number;
  engagementLevel?: number;
  pace?: number; // words per minute
  pauseCount?: number;
  fillerWords?: number;
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
  const [trainingMode, setTrainingMode] = useState<'practice' | 'evaluation' | 'chat-practice'>('practice');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Voice coaching metrics
  const [voiceMetrics, setVoiceMetrics] = useState<VoiceMetrics | null>(null);
  const [audioAnalyzer, setAudioAnalyzer] = useState<AudioAnalyzer | null>(null);
  const [isVoiceAnalysisActive, setIsVoiceAnalysisActive] = useState(false);
  
  // Chat practice mode
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [showChatPractice, setShowChatPractice] = useState(false);

  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');
    
    // Handle different lengths
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return `(${cleaned}`;
    if (cleaned.length <= 6) return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    if (cleaned.length <= 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    // International format (11+ digits)
    if (cleaned.length === 11 && cleaned[0] === '1') {
      // US number with country code
      return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
    // Other international formats
    return `+${cleaned.slice(0, cleaned.length - 10)} (${cleaned.slice(cleaned.length - 10, cleaned.length - 7)}) ${cleaned.slice(cleaned.length - 7, cleaned.length - 4)}-${cleaned.slice(cleaned.length - 4)}`;
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

      // Clean phone number: remove all non-digits
      const cleanedPhone = phoneNumber.replace(/\D/g, '');
      
      // Validate phone number before sending
      if (!cleanedPhone || cleanedPhone.length < 10) {
        setError('Please enter a valid phone number with at least 10 digits');
        setIsCalling(false);
        setCallStatus('failed');
        return;
      }
      
      if (cleanedPhone.length > 15) {
        setError('Phone number is too long (maximum 15 digits)');
        setIsCalling(false);
        setCallStatus('failed');
        return;
      }

      const response = await fetch('/api/vapi/sales-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phoneNumber: cleanedPhone, // Send cleaned digits only
          userId,
          scenarioId: selectedScenario.id,
          trainingMode,
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to initiate call';
        let hint = '';
        
        try {
          const data = await response.json();
          errorMessage = data.error || data.message || errorMessage;
          hint = data.hint || '';
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        
        // Show helpful message with hints
        if (errorMessage.includes('API key') || response.status === 503) {
          setError('Vapi API key not configured. Please add VAPI_API_KEY to your .env.local file. Get your key at: https://vapi.ai/dashboard');
        } else if (hint) {
          setError(`${errorMessage}\n\n💡 ${hint}`);
        } else {
          setError(errorMessage);
        }
        setIsCalling(false);
        setCallStatus('failed');
        return;
      }

      const data = await response.json();
      setCallId(data.callId);
      setCallStatus('in-progress');
      
      // Store call ID in localStorage for live dashboard access
      localStorage.setItem('activeCallId', data.callId);
      
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
              
              // Remove call ID from localStorage when call ends
              localStorage.removeItem('activeCallId');

              // Get analysis from Modal
              await fetchAnalysis(data.callId, selectedScenario.id);
            } else if (status === 'in-progress') {
              setCallDuration(statusData.duration || 0);
            }
          }

          // Try to get live metrics if call is in progress (poll more frequently for live updates)
          if (status === 'in-progress' || callStatus === 'in-progress') {
            // Fetch enhanced metrics from new endpoint
            try {
              const metricsResponse = await fetch(`/api/vapi/call/${data.callId}/metrics`);
              if (metricsResponse.ok) {
                const metricsData = await metricsResponse.json();
                if (metricsData.success && metricsData.callId) {
                  // Update call metrics with enhanced data
                  setCallMetrics(prev => ({
                    ...prev,
                    ...metricsData,
                    callId: metricsData.callId,
                  }));
                }
              }
            } catch (err) {
              console.error('Error fetching enhanced metrics:', err);
            }
            
            // Also fetch analysis
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
      
      // Remove call ID from localStorage when call ends
      localStorage.removeItem('activeCallId');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to end call');
    }
  };

  const handleChatSend = async () => {
    if (!chatInput.trim() || !selectedScenario || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsChatLoading(true);

    // Add user message
    const newUserMessage = {
      role: 'user' as const,
      content: userMessage,
      timestamp: new Date(),
    };
    setChatMessages(prev => [...prev, newUserMessage]);

    try {
      // Initialize conversation if first message
      if (chatMessages.length === 0) {
        const initialMessage = {
          role: 'assistant' as const,
          content: selectedScenario.objection_statement,
          timestamp: new Date(),
        };
        setChatMessages([initialMessage, newUserMessage]);
      }

      // Call roleplay API for AI response
      const response = await fetch('/api/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioInput: {
            scenarioId: selectedScenario.id,
            objectionCategory: selectedScenario.objection_category,
          },
          persona: selectedScenario.persona,
          conversationHistory: [
            ...chatMessages.map(m => ({
              role: m.role === 'user' ? 'rep' : 'prospect',
              message: m.content,
            })),
            {
              role: 'rep',
              message: userMessage,
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const aiMessage = {
          role: 'assistant' as const,
          content: data.prospectResponse || data.response || 'I understand. Can you tell me more?',
          timestamp: new Date(),
        };
        setChatMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error('Failed to get AI response');
      }
    } catch (err) {
      console.error('Chat error:', err);
      const errorMessage = {
        role: 'assistant' as const,
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Initialize voice analysis when call starts
  useEffect(() => {
    if (callStatus === 'in-progress' && callId && !audioAnalyzer) {
      const analyzer = new AudioAnalyzer(
        callId,
        userId,
        {
          enabled: true,
          updateInterval: 200,
          feedbackEnabled: true,
        },
        (metrics) => {
          setVoiceMetrics(metrics);
        }
      );

      analyzer.startAnalysis()
        .then(() => {
          setAudioAnalyzer(analyzer);
          setIsVoiceAnalysisActive(true);
          console.log('Voice analysis started');
        })
        .catch((err) => {
          console.error('Failed to start voice analysis:', err);
          setError(`Microphone error: ${err.message}`);
        });
    } else if (callStatus !== 'in-progress' && audioAnalyzer) {
      // Stop analysis when call ends
      audioAnalyzer.stopAnalysis();
      setAudioAnalyzer(null);
      setIsVoiceAnalysisActive(false);
      setVoiceMetrics(null);
    }

    return () => {
      if (audioAnalyzer) {
        audioAnalyzer.stopAnalysis();
        setAudioAnalyzer(null);
      }
    };
  }, [callStatus, callId, userId, audioAnalyzer]);

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

          <div className="flex items-center gap-4 flex-wrap">
            <label className="text-sm font-medium">Training Mode:</label>
            <Select
              value={trainingMode}
              onValueChange={(value: 'practice' | 'evaluation' | 'chat-practice') => {
                setTrainingMode(value);
                setShowChatPractice(value === 'chat-practice');
                if (value !== 'chat-practice') {
                  setChatMessages([]);
                }
              }}
              disabled={isCalling}
            >
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="practice">Phone Call Practice</SelectItem>
                <SelectItem value="chat-practice">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Chat Practice (New)
                  </div>
                </SelectItem>
                <SelectItem value="evaluation">Evaluation Mode</SelectItem>
              </SelectContent>
            </Select>
            {trainingMode === 'chat-practice' && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                <MessageSquare className="h-3 w-3 mr-1" />
                Practice with AI before calling
              </Badge>
            )}
          </div>
          
          {/* Chat Practice Mode */}
          {showChatPractice && selectedScenario && (
            <div className="mt-4 p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border-2 border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold text-purple-900">Chat Practice Mode</h3>
                </div>
                <Badge className="bg-purple-600">Practice Before Call</Badge>
              </div>
              <p className="text-sm text-purple-800 mb-4">
                Practice your responses with AI before making the actual phone call. This helps you prepare better!
              </p>
              
              {/* Chat Messages */}
              <div className="bg-white rounded-lg border border-purple-200 p-4 mb-3 max-h-64 overflow-y-auto">
                {chatMessages.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Start the conversation by responding to the objection:</p>
                    <p className="text-xs mt-2 italic">"{selectedScenario.objection_statement}"</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                    {isChatLoading && (
                      <div className="flex gap-3 justify-start">
                        <div className="bg-gray-100 rounded-lg p-3">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Chat Input */}
              <div className="flex gap-2">
                <Input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isChatLoading && chatInput.trim()) {
                      handleChatSend();
                    }
                  }}
                  placeholder="Type your response to the objection..."
                  disabled={isChatLoading}
                  className="flex-1"
                />
                <Button
                  onClick={handleChatSend}
                  disabled={isChatLoading || !chatInput.trim()}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {isChatLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageSquare className="h-4 w-4" />
                  )}
                </Button>
              </div>
              
              {/* Transition to Phone Call */}
              {chatMessages.length > 2 && (
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <p className="text-xs text-purple-700 mb-2">Ready for the real call?</p>
                  <Button
                    onClick={() => {
                      setShowChatPractice(false);
                      setTrainingMode('practice');
                    }}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    size="sm"
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Switch to Phone Call Practice
                  </Button>
                </div>
              )}
            </div>
          )}
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
            placeholder="(555) 123-4567 or +1 (555) 123-4567"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            disabled={isCalling}
            className="text-lg"
            maxLength={20}
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
      {callStatus === 'in-progress' && (
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Live Call Analysis
            </CardTitle>
            <CardDescription>
              Real-time metrics updating as you speak
            </CardDescription>
          </CardHeader>
          <CardContent>
            {callMetrics ? (
              <div className="space-y-6">
                {/* Confidence Score - Prominent Display */}
                <div className="p-6 bg-white rounded-lg border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-600" />
                      <span className="text-lg font-semibold">Confidence Score</span>
                    </div>
                    <Badge 
                      className={`text-lg px-3 py-1 ${
                        callMetrics.confidenceScore >= 80 ? 'bg-green-600' :
                        callMetrics.confidenceScore >= 60 ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`}
                    >
                      {callMetrics.confidenceScore}/100
                    </Badge>
                  </div>
                  <Progress 
                    value={callMetrics.confidenceScore} 
                    className="h-4 mt-3"
                  />
                  <div className="mt-2 text-sm text-muted-foreground">
                    {callMetrics.confidenceScore >= 80 ? 'Excellent performance!' :
                     callMetrics.confidenceScore >= 60 ? 'Good job, keep it up!' :
                     'Focus on clarity and confidence'}
                  </div>
                </div>

                {/* Enhanced Live Metrics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-4 w-4 text-blue-600" />
                      <div className="text-xs text-muted-foreground">Talk Time</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {Math.floor(callMetrics.talkTime / 60)}m {Math.floor(callMetrics.talkTime % 60)}s
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Listen: {Math.floor(callMetrics.listenTime / 60)}m {Math.floor(callMetrics.listenTime % 60)}s
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="h-4 w-4 text-orange-600" />
                      <div className="text-xs text-muted-foreground">Objections</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {callMetrics.objectionsResolved}/{callMetrics.objectionsRaised}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {callMetrics.objectionsRaised > 0 
                        ? `${Math.round((callMetrics.objectionsResolved / callMetrics.objectionsRaised) * 100)}% handled`
                        : 'No objections yet'}
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <div className="text-xs text-muted-foreground">Energy Level</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{callMetrics.energyLevel}%</div>
                    <Progress value={callMetrics.energyLevel} className="h-2 mt-2" />
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="h-4 w-4 text-purple-600" />
                      <div className="text-xs text-muted-foreground">Interruptions</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{callMetrics.interruptions}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {callMetrics.interruptions === 0 ? 'Great flow!' : 'Try to listen more'}
                    </div>
                  </div>
                </div>
                
                {/* Additional Enhanced Metrics */}
                {(callMetrics.wordCount || callMetrics.pace || callMetrics.questionsAsked || callMetrics.keyPointsMentioned) && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    {callMetrics.wordCount && (
                      <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-blue-600" />
                          <div className="text-xs text-muted-foreground">Words Spoken</div>
                        </div>
                        <div className="text-2xl font-bold text-blue-900">{callMetrics.wordCount}</div>
                      </div>
                    )}
                    {callMetrics.pace && (
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="h-4 w-4 text-green-600" />
                          <div className="text-xs text-muted-foreground">Pace (WPM)</div>
                        </div>
                        <div className="text-2xl font-bold text-green-900">{callMetrics.pace}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {callMetrics.pace < 120 ? 'Slow' : callMetrics.pace > 180 ? 'Fast' : 'Optimal'}
                        </div>
                      </div>
                    )}
                    {callMetrics.questionsAsked !== undefined && (
                      <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
                        <div className="flex items-center gap-2 mb-1">
                          <MessageSquare className="h-4 w-4 text-purple-600" />
                          <div className="text-xs text-muted-foreground">Questions Asked</div>
                        </div>
                        <div className="text-2xl font-bold text-purple-900">{callMetrics.questionsAsked}</div>
                      </div>
                    )}
                    {callMetrics.keyPointsMentioned !== undefined && (
                      <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                        <div className="flex items-center gap-2 mb-1">
                          <Star className="h-4 w-4 text-orange-600" />
                          <div className="text-xs text-muted-foreground">Key Points</div>
                        </div>
                        <div className="text-2xl font-bold text-orange-900">
                          {callMetrics.keyPointsMentioned}/{selectedScenario?.keyPoints.length || 0}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Talk/Listen Ratio */}
                {callMetrics.talkTime > 0 && callMetrics.listenTime > 0 && (
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Talk-to-Listen Ratio</span>
                      <Badge variant="outline">
                        {Math.round((callMetrics.talkTime / (callMetrics.talkTime + callMetrics.listenTime)) * 100)}% talk
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <div 
                        className="h-3 bg-blue-500 rounded"
                        style={{ width: `${(callMetrics.talkTime / (callMetrics.talkTime + callMetrics.listenTime)) * 100}%` }}
                      />
                      <div 
                        className="h-3 bg-green-500 rounded"
                        style={{ width: `${(callMetrics.listenTime / (callMetrics.talkTime + callMetrics.listenTime)) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-sm text-muted-foreground">Waiting for call metrics...</p>
              </div>
            )}
            
            {/* Voice Analysis - Real-time Pitch & Volume */}
            {isVoiceAnalysisActive && voiceMetrics && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Voice Analysis</h3>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                    Live
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="text-xs text-muted-foreground mb-1">Pitch (Hz)</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {voiceMetrics.pitch}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {voiceMetrics.pitch < 85 ? 'Low' : voiceMetrics.pitch > 255 ? 'High' : 'Optimal'}
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="text-xs text-muted-foreground mb-1">Volume (dB)</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {voiceMetrics.volume.toFixed(1)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {voiceMetrics.volume < -18 ? 'Quiet' : voiceMetrics.volume > -6 ? 'Loud' : 'Good'}
                    </div>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {voiceMetrics.confidence}%
                    </div>
                    <Progress value={voiceMetrics.confidence} className="h-2 mt-2" />
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-purple-200">
                    <div className="text-xs text-muted-foreground mb-1">Clarity</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {voiceMetrics.clarity}%
                    </div>
                    <Progress value={voiceMetrics.clarity} className="h-2 mt-2" />
                  </div>
                </div>
                <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="text-xs font-medium text-purple-900 mb-1">Voice Feedback</div>
                  <div className="text-sm text-purple-700">
                    {voiceMetrics.confidence < 70 ? '💡 Try to speak more steadily for better confidence' :
                     voiceMetrics.pitch < 85 ? '💡 Your voice is low - try raising your pitch slightly' :
                     voiceMetrics.pitch > 255 ? '💡 Your voice is high - try lowering your pitch slightly' :
                     voiceMetrics.volume < -18 ? '💡 Speak louder for better clarity' :
                     voiceMetrics.volume > -6 ? '💡 You\'re speaking loudly - try softening slightly' :
                     '✅ Great voice metrics!'}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Post-Call Analysis - Enhanced */}
      {callStatus === 'completed' && callAnalysis && callMetrics && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Award className="h-6 w-6 text-green-600" />
                    Call Complete!
                  </CardTitle>
                  <CardDescription className="mt-2">
                    Review your performance and get actionable feedback
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                  <div className={`text-4xl font-bold ${getRatingColor(callAnalysis.overall_score)}`}>
                    {callAnalysis.overall_score}
                  </div>
                  <div className="text-xs text-muted-foreground">out of 100</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-xs text-muted-foreground">Duration</div>
                  <div className="text-xl font-bold">{formatDuration(callMetrics.duration)}</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-xs text-muted-foreground">Meeting Booked</div>
                  <div className={`text-xl font-bold ${callMetrics.meetingBooked ? 'text-green-600' : 'text-gray-400'}`}>
                    {callMetrics.meetingBooked ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-xs text-muted-foreground">Sale Closed</div>
                  <div className={`text-xl font-bold ${callMetrics.saleClosed ? 'text-green-600' : 'text-gray-400'}`}>
                    {callMetrics.saleClosed ? 'Yes' : 'No'}
                  </div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-green-200">
                  <div className="text-xs text-muted-foreground">Confidence</div>
                  <div className="text-xl font-bold">{callMetrics.confidenceScore}/100</div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="objections">Objections</TabsTrigger>
              <TabsTrigger value="meeting">Meeting</TabsTrigger>
              <TabsTrigger value="closing">Closing</TabsTrigger>
            </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Detailed Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Score Display */}
                <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Overall Performance</div>
                      <div className={`text-4xl font-bold ${getRatingColor(callAnalysis.overall_score)}`}>
                        {callAnalysis.overall_score}/100
                      </div>
                    </div>
                    <div className="text-right">
                      {callAnalysis.overall_score >= 80 && (
                        <Badge className="bg-green-600 text-lg px-4 py-2">
                          <Award className="h-4 w-4 mr-1" />
                          Excellent!
                        </Badge>
                      )}
                      {callAnalysis.overall_score >= 60 && callAnalysis.overall_score < 80 && (
                        <Badge className="bg-yellow-600 text-lg px-4 py-2">
                          <TrendingUp className="h-4 w-4 mr-1" />
                          Good Job!
                        </Badge>
                      )}
                      {callAnalysis.overall_score < 60 && (
                        <Badge className="bg-orange-600 text-lg px-4 py-2">
                          <Target className="h-4 w-4 mr-1" />
                          Keep Practicing
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Progress value={callAnalysis.overall_score} className="h-4" />
                </div>

                {/* Enhanced Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div className="text-sm font-medium">Meeting Booked</div>
                    </div>
                    <div className={`text-3xl font-bold ${callMetrics.meetingBooked ? 'text-green-700' : 'text-gray-400'}`}>
                      {callMetrics.meetingBooked ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-5 w-5 text-blue-600" />
                      <div className="text-sm font-medium">Sale Closed</div>
                    </div>
                    <div className={`text-3xl font-bold ${callMetrics.saleClosed ? 'text-blue-700' : 'text-gray-400'}`}>
                      {callMetrics.saleClosed ? 'Yes' : 'No'}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="h-5 w-5 text-purple-600" />
                      <div className="text-sm font-medium">Objections</div>
                    </div>
                    <div className="text-3xl font-bold text-purple-700">
                      {callMetrics.objectionsResolved}/{callMetrics.objectionsRaised}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {callMetrics.objectionsRaised > 0 
                        ? `${Math.round((callMetrics.objectionsResolved / callMetrics.objectionsRaised) * 100)}% resolved`
                        : 'None raised'}
                    </div>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-5 w-5 text-orange-600" />
                      <div className="text-sm font-medium">Call Duration</div>
                    </div>
                    <div className="text-3xl font-bold text-orange-700">
                      {formatDuration(callMetrics.duration)}
                    </div>
                  </div>
                </div>

                {/* Enhanced Strengths */}
                {callAnalysis.strengths.length > 0 && (
                  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-green-900">
                      <Award className="h-5 w-5 text-green-600" />
                      What You Did Well
                    </h4>
                    <ul className="space-y-2">
                      {callAnalysis.strengths.map((strength, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 bg-white p-2 rounded border border-green-200">
                          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-900">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Enhanced Areas for Improvement */}
                {callAnalysis.areas_for_improvement.length > 0 && (
                  <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-orange-900">
                      <Target className="h-5 w-5 text-orange-600" />
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {callAnalysis.areas_for_improvement.map((area, i) => (
                        <li key={i} className="text-sm flex items-start gap-2 bg-white p-2 rounded border border-orange-200">
                          <Lightbulb className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-900">{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Key Moments Timeline */}
                {callAnalysis.key_moments && callAnalysis.key_moments.length > 0 && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="font-semibold mb-3 flex items-center gap-2 text-blue-900">
                      <Clock className="h-5 w-5 text-blue-600" />
                      Key Moments
                    </h4>
                    <div className="space-y-2">
                      {callAnalysis.key_moments.slice(0, 5).map((moment, i) => (
                        <div key={i} className="bg-white p-3 rounded border border-blue-200">
                          <div className="flex items-center justify-between mb-1">
                            <Badge variant="outline" className="text-xs">
                              {moment.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {formatDuration(moment.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-900">{moment.description}</p>
                        </div>
                      ))}
                    </div>
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
        </div>
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

