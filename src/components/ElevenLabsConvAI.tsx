'use client';

import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Volume2, X, Minimize2, Maximize2, Download, RotateCcw, Loader2, 
  History, Settings, Play, Pause, SkipForward, SkipBack, 
  Mic, MicOff, VolumeX, Volume1, Sparkles, TrendingUp, Clock,
  MessageSquare, User, Bot, FileText, Share2, Copy, CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LiquidProgress } from '@/components/ui/liquid-progress';
import { Toast } from '@/components/ErrorToast';
import { cn } from '@/lib/utils';
import type { Scenario } from '@/types/roleplay';
import type { ConversationEvent, MessageEvent, ErrorEvent, VoiceEvent, AnalyticsEvent } from '@/types/elevenlabs';
import { conversationAnalytics } from '@/lib/elevenlabs-analytics';
import { formatDistanceToNow } from 'date-fns';

interface ElevenLabsConvAIProps {
  agentId: string;
  scenario?: Scenario;
  userId?: string;
  onConversationComplete?: (conversationId: string, messages: MessageEvent[]) => void;
  onError?: (error: ErrorEvent) => void;
  className?: string;
  compact?: boolean;
  showTips?: boolean;
  enableRecording?: boolean;
}

interface ConversationState {
  isActive: boolean;
  isPaused: boolean;
  isRecording: boolean;
  messageCount: number;
  startTime?: Date;
  endTime?: Date;
  messages: MessageEvent[];
  currentTranscription?: string;
  isSpeaking?: boolean;
}

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function ElevenLabsConvAI({ 
  agentId, 
  scenario, 
  userId,
  onConversationComplete,
  onError,
  className = '',
  compact = false,
  showTips = true,
  enableRecording = true
}: ElevenLabsConvAIProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [conversationState, setConversationState] = useState<ConversationState>({
    isActive: false,
    isPaused: false,
    isRecording: false,
    messageCount: 0,
    messages: []
  });
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversationHistory, setConversationHistory] = useState<MessageEvent[]>([]);
  const [audioLevel, setAudioLevel] = useState(0);
  const [currentTip, setCurrentTip] = useState<string | null>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const widgetElementRef = useRef<HTMLElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  // Generate conversation ID
  useEffect(() => {
    if (isOpen && !conversationId) {
      setConversationId(`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, [isOpen, conversationId]);

  // Tips rotation
  useEffect(() => {
    if (!showTips || !scenario) return;

    const tips = [
      `Remember to address: ${scenario.keyPoints?.[0] || 'the main concern'}`,
      'Listen carefully to the prospect\'s concerns',
      'Ask clarifying questions to understand their needs',
      'Provide specific examples and use cases',
      'Address objections directly and confidently'
    ];

    const interval = setInterval(() => {
      const randomTip = tips[Math.floor(Math.random() * tips.length)];
      setCurrentTip(randomTip);
      setTimeout(() => setCurrentTip(null), 8000);
    }, 15000);

    return () => clearInterval(interval);
  }, [showTips, scenario]);

  // Build system prompt from scenario
  const buildSystemPrompt = useCallback(() => {
    if (!scenario) return undefined;
    
    const { persona, objection_statement, keyPoints } = scenario;
    
    return `You are role-playing as ${persona.name}, a ${persona.currentSolution ? `prospect who currently uses ${persona.currentSolution}` : 'prospect'}.

Your primary goal: ${persona.primaryGoal}

Your skepticism: ${persona.skepticism}

Your communication style: ${persona.tone}

The objection you're raising: ${objection_statement}

${keyPoints && keyPoints.length > 0 ? `Key points the sales rep should address: ${keyPoints.join(', ')}` : ''}

Stay in character throughout the conversation. Be realistic and challenging but fair. Respond naturally to the sales rep's approach.`;
  }, [scenario]);

  // Build first message from scenario
  const buildFirstMessage = useCallback(() => {
    if (!scenario) return undefined;
    return scenario.objection_statement;
  }, [scenario]);

  // Load ElevenLabs widget script
  useEffect(() => {
    const existingScript = document.querySelector('script[src="https://unpkg.com/@elevenlabs/convai-widget-embed"]');
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    if (customElements.get('elevenlabs-convai')) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
    script.async = true;
    script.type = 'text/javascript';
    
    script.onload = () => {
      setIsLoaded(true);
      setIsLoading(false);
      showToast('Voice assistant ready!', 'success');
    };

    script.onerror = () => {
      const errorMsg = 'Failed to load voice assistant. Please check your internet connection.';
      setError(errorMsg);
      setIsLoading(false);
      showToast(errorMsg, 'error');
      if (onError) {
        onError({
          type: 'error',
          error: new Error(errorMsg),
          code: 'SCRIPT_LOAD_FAILED',
          message: errorMsg,
          timestamp: Date.now()
        });
      }
    };

    document.body.appendChild(script);
  }, [onError, showToast]);

  // Initialize widget and attach event listeners
  useEffect(() => {
    if (!isLoaded || !isOpen || !widgetRef.current) return;

    const widgetElement = widgetRef.current.querySelector('elevenlabs-convai') as HTMLElement;
    if (!widgetElement) return;

    widgetElementRef.current = widgetElement;

    if (conversationId) {
      conversationAnalytics.startConversation(conversationId, userId, scenario?.id, agentId);
    }

    const handleConversationStart = (event: CustomEvent) => {
      setConversationState(prev => ({
        ...prev,
        isActive: true,
        isRecording: true,
        startTime: new Date()
      }));
      
      showToast('Conversation started', 'success');
      
      if (conversationId) {
        conversationAnalytics.trackEvent({
          type: 'conversation-start',
          eventName: 'conversation-start',
          properties: {
            conversationId,
            userId,
            timestamp: Date.now()
          }
        });
      }
    };

    const handleConversationEnd = async (event: CustomEvent) => {
      setConversationState(prev => ({
        ...prev,
        isActive: false,
        isRecording: false,
        endTime: new Date()
      }));
      
      showToast('Conversation saved', 'success');
      
      if (conversationId) {
        conversationAnalytics.trackEvent({
          type: 'conversation-end',
          eventName: 'conversation-end',
          properties: {
            conversationId,
            userId,
            timestamp: Date.now()
          }
        });
        
        const metrics = await conversationAnalytics.endConversation(conversationId);
        if (metrics && onConversationComplete) {
          onConversationComplete(conversationId, conversationState.messages);
        }
      }
    };

    const handleMessageSent = (event: CustomEvent) => {
      const message: MessageEvent = {
        type: 'message',
        role: 'user',
        message: event.detail?.message || '',
        timestamp: Date.now(),
        conversationId,
        userId
      };
      
      setConversationState(prev => ({
        ...prev,
        messageCount: prev.messageCount + 1,
        messages: [...prev.messages, message]
      }));
      
      setConversationHistory(prev => [...prev, message]);
      
      if (conversationId) {
        conversationAnalytics.trackMessage(message);
      }
    };

    const handleMessageReceived = (event: CustomEvent) => {
      const message: MessageEvent = {
        type: 'message',
        role: 'assistant',
        message: event.detail?.message || '',
        timestamp: Date.now(),
        conversationId,
        userId
      };
      
      setConversationState(prev => ({
        ...prev,
        messageCount: prev.messageCount + 1,
        messages: [...prev.messages, message]
      }));
      
      setConversationHistory(prev => [...prev, message]);
      
      if (conversationId) {
        conversationAnalytics.trackMessage(message);
      }
    };

    const handleError = (event: CustomEvent) => {
      const errorEvent: ErrorEvent = {
        type: 'error',
        error: event.detail?.error || 'Unknown error',
        code: event.detail?.code || 'UNKNOWN',
        message: event.detail?.message || 'An error occurred',
        timestamp: Date.now()
      };
      
      setError(errorEvent.message);
      showToast(errorEvent.message, 'error');
      if (onError) {
        onError(errorEvent);
      }
    };

    const handleVoiceStart = (event: CustomEvent) => {
      setConversationState(prev => ({ ...prev, isSpeaking: true }));
    };

    const handleVoiceEnd = (event: CustomEvent) => {
      setConversationState(prev => ({ ...prev, isSpeaking: false }));
    };

    const handleTranscriptionStart = (event: CustomEvent) => {
      setConversationState(prev => ({ ...prev, isRecording: true }));
    };

    const handleTranscriptionEnd = (event: CustomEvent) => {
      setConversationState(prev => ({ ...prev, isRecording: false }));
    };

    widgetElement.addEventListener('conversation-start', handleConversationStart as EventListener);
    widgetElement.addEventListener('conversation-end', handleConversationEnd as EventListener);
    widgetElement.addEventListener('message-sent', handleMessageSent as EventListener);
    widgetElement.addEventListener('message-received', handleMessageReceived as EventListener);
    widgetElement.addEventListener('error', handleError as EventListener);
    widgetElement.addEventListener('voice-start', handleVoiceStart as EventListener);
    widgetElement.addEventListener('voice-end', handleVoiceEnd as EventListener);
    widgetElement.addEventListener('transcription-start', handleTranscriptionStart as EventListener);
    widgetElement.addEventListener('transcription-end', handleTranscriptionEnd as EventListener);

    return () => {
      widgetElement.removeEventListener('conversation-start', handleConversationStart as EventListener);
      widgetElement.removeEventListener('conversation-end', handleConversationEnd as EventListener);
      widgetElement.removeEventListener('message-sent', handleMessageSent as EventListener);
      widgetElement.removeEventListener('message-received', handleMessageReceived as EventListener);
      widgetElement.removeEventListener('error', handleError as EventListener);
      widgetElement.removeEventListener('voice-start', handleVoiceStart as EventListener);
      widgetElement.removeEventListener('voice-end', handleVoiceEnd as EventListener);
      widgetElement.removeEventListener('transcription-start', handleTranscriptionStart as EventListener);
      widgetElement.removeEventListener('transcription-end', handleTranscriptionEnd as EventListener);
    };
  }, [isLoaded, isOpen, conversationId, userId, agentId, scenario?.id, onConversationComplete, onError, conversationState.messages, showToast]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'k':
            e.preventDefault();
            setIsOpen(false);
            break;
          case 'h':
            e.preventDefault();
            setShowHistory(!showHistory);
            break;
          case 'r':
            e.preventDefault();
            handleReset();
            break;
        }
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isOpen, showHistory]);

  // Reset conversation
  const handleReset = useCallback(() => {
    setConversationState({
      isActive: false,
      isPaused: false,
      isRecording: false,
      messageCount: 0,
      messages: []
    });
    setConversationHistory([]);
    setConversationId(null);
    setError(null);
    showToast('Conversation reset', 'info');
    
    if (widgetElementRef.current) {
      const newId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setConversationId(newId);
      widgetElementRef.current.setAttribute('conversation-id', newId);
    }
  }, [showToast]);

  // Export conversation
  const handleExport = useCallback(() => {
    if (conversationState.messages.length === 0) {
      showToast('No conversation to export', 'error');
      return;
    }
    
    const exportData = {
      conversationId,
      scenarioId: scenario?.id,
      userId,
      startTime: conversationState.startTime?.toISOString(),
      endTime: conversationState.endTime?.toISOString(),
      messageCount: conversationState.messageCount,
      messages: conversationState.messages,
      scenario: scenario ? {
        persona: scenario.persona.name,
        objection: scenario.objection_statement
      } : undefined
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation_${conversationId || 'export'}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Conversation exported', 'success');
  }, [conversationState, conversationId, scenario, userId, showToast]);

  // Copy conversation
  const handleCopy = useCallback(() => {
    const text = conversationHistory.map(msg => 
      `${msg.role === 'user' ? 'You' : 'AI'}: ${msg.message}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(text).then(() => {
      showToast('Conversation copied to clipboard', 'success');
    }).catch(() => {
      showToast('Failed to copy', 'error');
    });
  }, [conversationHistory, showToast]);

  // Calculate duration
  const duration = useMemo(() => {
    if (!conversationState.startTime) return null;
    const end = conversationState.endTime || new Date();
    return Math.floor((end.getTime() - conversationState.startTime.getTime()) / 1000);
  }, [conversationState.startTime, conversationState.endTime]);

  const systemPrompt = buildSystemPrompt();
  const firstMessage = buildFirstMessage();

  return (
    <>
      {/* Toast Notifications */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
        />
      ))}

      {/* Floating Button to Open Widget */}
      {!isOpen && (
        <div className={cn("fixed bottom-6 right-6 z-50", className)}>
          <div className="relative">
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="rounded-full shadow-2xl h-16 w-16 bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 hover:from-purple-700 hover:via-blue-700 hover:to-purple-800 text-white border-0 transition-all duration-300 hover:scale-110 active:scale-95 hover:shadow-purple-500/50 group"
              aria-label="Open Voice Role-Play"
            >
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Volume2 className="h-6 w-6 group-hover:scale-110 transition-transform" />
              )}
            </Button>
            {scenario && (
              <Badge 
                variant="secondary" 
                className="absolute -top-2 -right-2 bg-purple-600 text-white animate-pulse"
              >
                {scenario.persona.name.split(' ')[0]}
              </Badge>
            )}
            {conversationState.isActive && (
              <div className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-ping" />
            )}
          </div>
        </div>
      )}

      {/* Widget Container */}
      {isOpen && (
        <div className={cn("fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in", className)}>
          <Card className={cn(
            "w-full flex flex-col shadow-2xl transition-all duration-300 border-2",
            isMinimized ? 'max-w-md h-auto' : 'max-w-6xl h-[90vh]',
            "bg-white/95 backdrop-blur-xl"
          )}>
            {/* Header */}
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b bg-gradient-to-r from-purple-50 to-blue-50 flex-shrink-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Voice Role-Play
                  </CardTitle>
                  {conversationState.isActive && (
                    <Badge variant="default" className="bg-green-500 animate-pulse">
                      <div className="h-2 w-2 bg-white rounded-full mr-1.5 animate-pulse" />
                      Active
                    </Badge>
                  )}
                  {conversationState.isSpeaking && (
                    <Badge variant="outline" className="border-blue-500 text-blue-600">
                      <Volume1 className="h-3 w-3 mr-1 animate-pulse" />
                      Speaking
                    </Badge>
                  )}
                </div>
                {scenario && (
                  <CardDescription className="text-sm font-medium text-gray-700 truncate">
                    Practicing with: <span className="text-purple-600">{scenario.persona.name}</span>
                  </CardDescription>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                  {conversationState.messageCount > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {conversationState.messageCount} messages
                    </div>
                  )}
                  {conversationState.startTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {duration !== null && `${Math.floor(duration / 60)}:${String(duration % 60).padStart(2, '0')}`}
                    </div>
                  )}
                  {conversationState.isRecording && (
                    <div className="flex items-center gap-1 text-red-600">
                      <Mic className="h-3 w-3 animate-pulse" />
                      Recording
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!isMinimized && conversationState.messages.length > 0 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowHistory(!showHistory)}
                      className="h-9 w-9 hover:bg-purple-100"
                      title="View History (Ctrl+H)"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleCopy}
                      className="h-9 w-9 hover:bg-purple-100"
                      title="Copy Conversation"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleReset}
                      className="h-9 w-9 hover:bg-purple-100"
                      title="Reset (Ctrl+R)"
                    >
                      <RotateCcw className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleExport}
                      className="h-9 w-9 hover:bg-purple-100"
                      title="Export Conversation"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(!showSettings)}
                  className="h-9 w-9 hover:bg-purple-100"
                  title="Settings"
                >
                  <Settings className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="h-9 w-9 hover:bg-purple-100"
                  title={isMinimized ? "Expand" : "Minimize"}
                >
                  {isMinimized ? (
                    <Maximize2 className="h-4 w-4" />
                  ) : (
                    <Minimize2 className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsOpen(false);
                    setIsMinimized(false);
                    setShowHistory(false);
                  }}
                  className="h-9 w-9 hover:bg-red-100 hover:text-red-600"
                  title="Close (Ctrl+K)"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>

            {/* Tips Banner */}
            {currentTip && showTips && !isMinimized && (
              <div className="px-6 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-blue-100 animate-slide-down">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Sparkles className="h-4 w-4 text-purple-600" />
                  <span className="font-medium">Tip:</span>
                  <span>{currentTip}</span>
                </div>
              </div>
            )}
            
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="m-4 animate-slide-down">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Main Content */}
            {!isMinimized && (
              <div className="flex-1 overflow-hidden flex">
                {/* History Sidebar */}
                {showHistory && conversationHistory.length > 0 && (
                  <div className="w-80 border-r bg-gray-50 overflow-y-auto animate-slide-right">
                    <div className="p-4 sticky top-0 bg-white border-b z-10">
                      <h3 className="font-semibold text-sm flex items-center gap-2">
                        <History className="h-4 w-4" />
                        Conversation History
                      </h3>
                    </div>
                    <div className="p-4 space-y-3">
                      {conversationHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={cn(
                            "p-3 rounded-lg text-sm animate-fade-in",
                            msg.role === 'user' 
                              ? "bg-blue-50 border border-blue-100 ml-4" 
                              : "bg-purple-50 border border-purple-100 mr-4"
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {msg.role === 'user' ? (
                              <User className="h-3 w-3 text-blue-600" />
                            ) : (
                              <Bot className="h-3 w-3 text-purple-600" />
                            )}
                            <span className="font-medium text-xs text-gray-600">
                              {msg.role === 'user' ? 'You' : 'AI'}
                            </span>
                            <span className="text-xs text-gray-400 ml-auto">
                              {formatDistanceToNow(new Date(msg.timestamp || Date.now()), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-gray-800">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Widget Content */}
                <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
                  {isLoading && (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-blue-50">
                      <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                        <p className="text-gray-600 font-medium">Loading voice assistant...</p>
                        <LiquidProgress value={75} variant="purple" className="mt-4 w-64 mx-auto" />
                      </div>
                    </div>
                  )}
                  {!isLoaded && !isLoading && (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-purple-50 to-blue-50">
                      <div className="text-center">
                        <Volume2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">Voice assistant not ready</p>
                      </div>
                    </div>
                  )}
                  {isLoaded && (
                    <div
                      ref={widgetRef}
                      className="w-full h-full relative"
                      style={{ minHeight: '500px' }}
                    >
                      {/* Audio Level Indicator */}
                      {conversationState.isRecording && (
                        <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg border border-red-200 animate-pulse">
                          <Mic className="h-4 w-4 text-red-600" />
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                              <div
                                key={i}
                                className={cn(
                                  "w-1 h-4 rounded-full transition-all",
                                  audioLevel > i * 20 ? "bg-red-500" : "bg-gray-300"
                                )}
                                style={{
                                  height: audioLevel > i * 20 ? `${8 + (audioLevel - i * 20) / 5}px` : '8px'
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* @ts-ignore - Custom web component */}
                      <elevenlabs-convai
                        agent-id={agentId}
                        conversation-id={conversationId || undefined}
                        first-message={firstMessage}
                        system-prompt={systemPrompt}
                        enable-conversation-history="true"
                        enable-transcription="true"
                        enable-context-awareness="true"
                        enable-multi-turn-conversation="true"
                        enable-session-management="true"
                        enable-analytics-tracking="true"
                        enable-error-handling="true"
                        enable-loading-states="true"
                        enable-accessibility="true"
                        enable-keyboard-shortcuts="true"
                        enable-voice-commands="true"
                        enable-screen-reader-support="true"
                        enable-responsive-design="true"
                        enable-recording={enableRecording ? "true" : "false"}
                        enable-playback-controls="true"
                        enable-download="true"
                        enable-export="true"
                        theme="light"
                        aria-label="Voice Role-Play Assistant"
                        aria-describedby="voice-roleplay-description"
                      />
                      <div id="voice-roleplay-description" className="sr-only">
                        Voice role-play assistant for practicing sales conversations with AI-powered prospects
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
