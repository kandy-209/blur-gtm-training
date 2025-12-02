'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Scenario, RoleplayState, AgentResponse } from '@/types/roleplay';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { analytics } from '@/lib/analytics';
import { trackRoleplayEvent } from '@/lib/vercel-analytics';
import VoiceControls from '@/components/VoiceControls';
import ResponseSuggestions from '@/components/ResponseSuggestions';
import { LoadingState } from '@/components/ui/loading-state';
import { ErrorState } from '@/components/ui/error-state';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { Volume2, VolumeX, Copy, RotateCcw } from 'lucide-react';

interface RoleplayEngineProps {
  scenario: Scenario;
  onComplete?: (finalScore: number) => void;
}

export default function RoleplayEngine({ scenario, onComplete }: RoleplayEngineProps) {
  const [state, setState] = useState<RoleplayState>({
    scenario,
    turnNumber: 1,
    conversationHistory: [],
    isComplete: false,
  });

  const [repMessage, setRepMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [voiceMode, setVoiceMode] = useState(false);
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Track scenario start
  useEffect(() => {
    analytics.track({
      eventType: 'scenario_start',
      scenarioId: scenario.id,
    });
  }, [scenario.id]);

  const handlePlayAudio = useCallback(async (text: string) => {
    if (!text || !text.trim()) return;
    
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.substring(0, 5000), // Limit text length
          voiceId: process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.warn('TTS API error:', errorData.error || 'Failed to generate audio');
        return; // Silently fail - audio is optional
      }

      const { audio } = await response.json();
      if (!audio) {
        console.warn('No audio data received');
        return;
      }

      const audioElement = new Audio(audio);
      audioElement.onerror = () => {
        console.warn('Audio playback failed');
      };
      await audioElement.play().catch((err) => {
        console.warn('Audio play error:', err);
      });
    } catch (error) {
      // Silently fail - audio is optional feature
      console.warn('Audio playback error:', error);
    }
  }, []);

  const sendMessage = useCallback(async () => {
    if (!repMessage.trim() || isLoading) return;

    const userMessage = repMessage.trim();
    setRepMessage('');
    setIsLoading(true);

    // Track turn submission
    analytics.track({
      eventType: 'turn_submit',
      scenarioId: scenario.id,
      turnNumber: state.turnNumber,
    });

    // Add rep message to history
    const updatedHistory = [
      ...state.conversationHistory,
      { role: 'rep' as const, message: userMessage, timestamp: new Date() },
    ];

    setState((prev) => ({
      ...prev,
      conversationHistory: updatedHistory,
    }));

    try {
      const response = await fetch('/api/roleplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioInput: {
            turn_number: state.turnNumber,
            scenario_id: scenario.id,
            objection_category: scenario.objection_category,
            objection_statement:
              state.turnNumber === 1
                ? scenario.objection_statement
                : state.conversationHistory[state.conversationHistory.length - 1]?.message || '',
          },
          persona: scenario.persona,
          conversationHistory: updatedHistory.map((h) => ({
            role: h.role,
            message: h.message,
          })),
        }),
      });

      if (!response.ok) {
        let errorText: string;
        try {
          const errorData = await response.json();
          errorText = errorData.error || JSON.stringify(errorData);
        } catch {
          errorText = await response.text();
        }
        console.error('API Error:', response.status, errorText);
        
        // Provide user-friendly error messages
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        } else if (response.status === 500) {
          throw new Error('Server error. Please try again or contact support.');
        } else if (response.status === 503) {
          throw new Error('Service temporarily unavailable. Please try again later.');
        }
        
        throw new Error(`Failed to get response: ${errorText}`);
      }

      const data = await response.json();
      if (!data.agentResponse) {
        throw new Error('Invalid response format from API');
      }
      const { agentResponse }: { agentResponse: AgentResponse } = data;

      // Add agent response to history
      const finalHistory = [
        ...updatedHistory,
        {
          role: 'agent' as const,
          message: agentResponse.agent_response_text,
          timestamp: new Date(),
        },
      ];

      // Auto-play audio if voice mode is enabled
      if (voiceMode && autoPlayAudio && agentResponse.agent_response_text) {
        handlePlayAudio(agentResponse.agent_response_text);
      }

      // Scenario completes when meeting is booked, Enterprise sale is closed, or explicitly ended
      const isComplete =
        agentResponse.next_step_action === 'MEETING_BOOKED' ||
        agentResponse.next_step_action === 'ENTERPRISE_SALE' ||
        agentResponse.next_step_action === 'END_SCENARIO';

      const newState: RoleplayState = {
        ...state,
        turnNumber: state.turnNumber + 1,
        conversationHistory: finalHistory,
        currentEvaluation: agentResponse,
        isComplete,
        finalScore: isComplete ? agentResponse.confidence_score : undefined,
      };

      setState(newState);
      setShowFeedback(true);

      // Track feedback view
      analytics.track({
        eventType: 'feedback_view',
        scenarioId: scenario.id,
        turnNumber: state.turnNumber,
        score: agentResponse.confidence_score,
        metadata: {
          evaluation: agentResponse.response_evaluation,
        },
      });

      // Save user response to database for ML learning
      if (userMessage) {
        fetch('/api/responses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: analytics.getUserId(),
            scenarioId: scenario.id,
            turnNumber: state.turnNumber,
            objectionCategory: scenario.objection_category,
            userMessage: userMessage,
            aiResponse: agentResponse.agent_response_text,
            evaluation: agentResponse.response_evaluation,
            confidenceScore: agentResponse.confidence_score,
            keyPointsMentioned: scenario.keyPoints.filter(kp => 
              userMessage.toLowerCase().includes(kp.toLowerCase())
            ),
          }),
        }).catch(err => console.error('Failed to save response:', err));

        // Trigger ML learning (async, don't wait)
        fetch('/api/ml/learn', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            objectionCategory: scenario.objection_category,
          }),
        }).catch(console.error);
      }

      if (isComplete) {
        // Track scenario completion
        analytics.track({
          eventType: 'scenario_complete',
          scenarioId: scenario.id,
          score: agentResponse.confidence_score,
        });

        if (onComplete) {
          setTimeout(() => onComplete(agentResponse.confidence_score), 2000);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to get response. Please try again.';
      
      // Show user-friendly error message
      let displayMessage = errorMessage;
      
      if (errorMessage.includes('API Error')) {
        const apiError = errorMessage.split(': ')[1] || '';
        if (apiError.includes('quota exceeded') || apiError.includes('429')) {
          displayMessage = 'OpenAI API quota exceeded. Please check your billing at https://platform.openai.com/account/billing';
        } else if (apiError.includes('401') || apiError.includes('invalid')) {
          displayMessage = 'OpenAI API key is invalid. Please contact support.';
        } else {
          displayMessage = `Server error: ${apiError}`;
        }
      } else if (errorMessage.includes('quota exceeded') || errorMessage.includes('429')) {
        displayMessage = 'OpenAI API quota exceeded. Please check your billing at https://platform.openai.com/account/billing';
      }
      
      alert(displayMessage);
    } finally {
      setIsLoading(false);
    }
  }, [repMessage, state, scenario, onComplete, voiceMode, autoPlayAudio, handlePlayAudio]);

  // Initialize with first objection on mount
  useEffect(() => {
    if (state.conversationHistory.length === 0) {
      const initialMessage = scenario.objection_statement;
      setState((prev) => ({
        ...prev,
        conversationHistory: [
          {
            role: 'agent',
            message: initialMessage,
            timestamp: new Date(),
          },
        ],
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: 'Enter',
      ctrlKey: true,
      handler: () => {
        if (!isLoading && repMessage.trim()) {
          sendMessage();
        }
      },
    },
    {
      key: 'Escape',
      handler: () => {
        setShowFeedback(false);
        setError(null);
      },
    },
  ], !state.isComplete);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleCopyConversation = useCallback(() => {
    const conversationText = state.conversationHistory
      .map(msg => `${msg.role === 'rep' ? 'You' : 'Prospect'}: ${msg.message}`)
      .join('\n\n');
    navigator.clipboard.writeText(conversationText);
  }, [state.conversationHistory]);

  const handleRestart = useCallback(() => {
    if (confirm('Are you sure you want to restart this scenario? Your progress will be lost.')) {
      window.location.reload();
    }
  }, []);

  const handleVoiceTranscript = useCallback((text: string) => {
    setRepMessage(text);
    // Auto-send after a short delay if voice mode is on
    if (voiceMode && text.trim()) {
      setTimeout(() => {
        // Trigger sendMessage
        const userMessage = text.trim();
        if (userMessage && !isLoading) {
          // Create a synthetic event to trigger sendMessage
          setRepMessage(userMessage);
          // Use a ref to call sendMessage directly
          setTimeout(() => {
            sendMessage();
          }, 100);
        }
      }, 500);
    }
  }, [voiceMode, isLoading, sendMessage]);

  // Auto-play initial objection if voice mode is enabled
  useEffect(() => {
    if (voiceMode && autoPlayAudio && state.conversationHistory.length === 1) {
      const initialMessage = state.conversationHistory[0]?.message;
      if (initialMessage) {
        handlePlayAudio(initialMessage);
      }
    }
  }, [voiceMode, autoPlayAudio, state.conversationHistory.length]);

  return (
    <div className="flex flex-col h-full max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 space-y-4 sm:space-y-6">
      {/* Persona Header */}
      <Card className="border-gray-200 bg-gradient-to-br from-gray-50 to-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0">
            <div className="flex-1 w-full sm:w-auto">
              <CardTitle className="text-lg font-semibold mb-2">Role-Playing as: {scenario.persona.name}</CardTitle>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Current Solution:</span> {scenario.persona.currentSolution}
                </p>
                <p>
                  <span className="font-medium text-foreground">Primary Goal:</span> {scenario.persona.primaryGoal}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:ml-4 flex-wrap">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyConversation}
                title="Copy conversation (Ctrl+C)"
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRestart}
                title="Restart scenario"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant={voiceMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setVoiceMode(!voiceMode)}
                className={voiceMode ? 'bg-black hover:bg-gray-900 text-white' : ''}
              >
                {voiceMode ? <Volume2 className="h-4 w-4 mr-1" /> : <VolumeX className="h-4 w-4 mr-1" />}
                {voiceMode ? 'Voice On' : 'Voice Off'}
              </Button>
              {voiceMode && (
                <Button
                  variant={autoPlayAudio ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setAutoPlayAudio(!autoPlayAudio)}
                  className={autoPlayAudio ? 'bg-black hover:bg-gray-900 text-white' : ''}
                >
                  Auto-Play
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conversation History */}
      <Card className="flex-1 border-gray-200 overflow-hidden">
        <div className="h-full overflow-y-auto p-3 sm:p-4 md:p-6 min-h-[300px] sm:min-h-[400px] max-h-[500px] sm:max-h-[600px]">
          <div className="space-y-4">
            {state.conversationHistory.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'rep' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[90%] sm:max-w-[80%] rounded-xl p-3 sm:p-4 transition-smooth ${
                    msg.role === 'rep'
                      ? 'bg-black text-white shadow-sm'
                      : 'bg-gray-100 text-gray-900 border border-gray-200'
                  }`}
                >
                  <div className="text-xs font-medium opacity-70 mb-2">
                    {msg.role === 'rep' ? 'You' : scenario.persona.name}
                  </div>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">{msg.message}</div>
                  {voiceMode && msg.role === 'agent' && (
                    <button
                      onClick={() => handlePlayAudio(msg.message)}
                      className="mt-3 text-xs opacity-70 hover:opacity-100 flex items-center gap-1.5 transition-opacity"
                    >
                      <Volume2 className="h-3.5 w-3.5" />
                      Play Audio
                    </button>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start animate-fade-in">
                <div className="bg-gray-100 border border-gray-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="h-2 w-2 bg-gray-400 rounded-full animate-pulse"></div>
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Feedback Panel */}
      {showFeedback && state.currentEvaluation && (
        <Card className={`border-2 transition-smooth ${
          state.currentEvaluation.response_evaluation === 'PASS'
            ? 'border-green-200 bg-green-50/50'
            : state.currentEvaluation.response_evaluation === 'FAIL'
            ? 'border-orange-200 bg-orange-50/50'
            : 'border-red-200 bg-red-50/50'
        }`}>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">Evaluation Feedback</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeedback(false)}
                className="h-8 w-8 p-0"
              >
                ×
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium text-muted-foreground">Status:</span>
              <Badge
                variant={
                  state.currentEvaluation.response_evaluation === 'PASS' ? 'default' :
                  state.currentEvaluation.response_evaluation === 'FAIL' ? 'secondary' : 'destructive'
                }
                className={
                  state.currentEvaluation.response_evaluation === 'PASS'
                    ? 'bg-green-600 text-white'
                    : state.currentEvaluation.response_evaluation === 'FAIL'
                    ? 'bg-orange-500 text-white'
                    : 'bg-red-600 text-white'
                }
              >
                {state.currentEvaluation.response_evaluation}
              </Badge>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Confidence Score:</span>{' '}
              <span className="font-semibold">{state.currentEvaluation.confidence_score}/100</span>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Feedback:</span>{' '}
              <span className="text-foreground">{state.currentEvaluation.scoring_feedback}</span>
            </div>
            {state.currentEvaluation.next_step_action === 'END_SCENARIO' && (
              <div className="mt-4 p-4 bg-green-100 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎉</span>
                  <div>
                    <div className="font-semibold text-green-900">Scenario Complete!</div>
                    <div className="text-sm text-green-700">Final Score: {state.finalScore}/100</div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Input Area */}
      {!state.isComplete && (
        <div className="space-y-4">
          {voiceMode ? (
            <VoiceControls
              onTranscript={handleVoiceTranscript}
              onPlayAudio={handlePlayAudio}
              disabled={isLoading}
              voiceId={process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID}
            />
          ) : null}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <Textarea
                ref={textareaRef}
                id="roleplay-message-input"
                name="roleplay-message"
                value={repMessage}
                onChange={(e) => {
                  setRepMessage(e.target.value);
                  setError(null);
                }}
                onKeyDown={handleKeyPress}
                placeholder={
                  voiceMode
                    ? 'Or type your response here... (Voice recording will auto-submit)'
                    : 'Type your response... (Ctrl+Enter to send)'
                }
                className="min-h-[120px] mb-4 border-gray-300 focus:border-black focus:ring-black resize-none text-sm"
                disabled={isLoading}
                autoComplete="off"
                autoFocus
              />
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Turn {state.turnNumber}</span>
                  <span className="mx-2">•</span>
                  <span>Key points: {scenario.keyPoints.slice(0, 2).join(', ')}</span>
                </div>
                <Button 
                  onClick={sendMessage} 
                  disabled={isLoading || !repMessage.trim()}
                  className="bg-black hover:bg-gray-900 text-white w-full sm:w-auto"
                >
                  {isLoading ? 'Sending...' : 'Send Response'}
                </Button>
              </div>
            </CardContent>
          </Card>
          {repMessage.trim().length > 10 && !isLoading && (
            <ResponseSuggestions
              currentMessage={repMessage}
              objectionCategory={scenario.objection_category}
              conversationHistory={state.conversationHistory.map(h => ({
                role: h.role,
                message: h.message,
              }))}
              persona={scenario.persona}
              onSelectSuggestion={(suggestion) => {
                setRepMessage(suggestion);
              }}
            />
          )}
        </div>
      )}

      {state.isComplete && (
        <Card className="p-8 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 text-center animate-fade-in">
          {state.currentEvaluation?.next_step_action === 'MEETING_BOOKED' ? (
            <>
              <div className="mb-6">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-2 text-green-900">Meeting Booked!</h3>
                <p className="text-lg text-green-700 mb-1">You successfully booked a meeting with the prospect!</p>
                <div className="text-4xl font-bold text-green-900 mb-6">Final Score: {state.finalScore}/100</div>
              </div>
              <div className="bg-white rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <p className="text-sm font-semibold mb-2 text-gray-900">Next Steps:</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Send calendar invite confirmation</li>
                  <li>Prepare Enterprise demo materials</li>
                  <li>Review prospect's specific Enterprise needs</li>
                  <li>Prepare ROI calculations and Enterprise pricing</li>
                </ul>
              </div>
            </>
          ) : state.currentEvaluation?.next_step_action === 'ENTERPRISE_SALE' ? (
            <>
              <div className="mb-6">
                <div className="text-5xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold mb-2 text-green-900">Enterprise Sale Closed!</h3>
                <p className="text-lg text-green-700 mb-1">Congratulations! You successfully closed the Cursor Enterprise sale!</p>
                <div className="text-4xl font-bold text-green-900 mb-6">Final Score: {state.finalScore}/100</div>
              </div>
              <div className="bg-white rounded-lg p-4 mb-6 text-left max-w-md mx-auto">
                <p className="text-sm font-semibold mb-2 text-gray-900">Next Steps:</p>
                <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                  <li>Send Enterprise contract and pricing details</li>
                  <li>Schedule Enterprise onboarding kickoff</li>
                  <li>Coordinate with Enterprise implementation team</li>
                  <li>Set up Enterprise account and SSO</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-2 text-green-900">Scenario Complete!</h3>
                <p className="text-lg text-green-700 mb-1">Final Score</p>
                <div className="text-4xl font-bold text-green-900 mb-6">{state.finalScore}/100</div>
              </div>
            </>
          )}
          <div className="flex gap-3 justify-center">
            <Button 
              onClick={() => window.location.reload()}
              className="bg-black hover:bg-gray-900 text-white"
            >
              Try Another Scenario
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/scenarios'}
              className="border-gray-300"
            >
              View All Scenarios
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

