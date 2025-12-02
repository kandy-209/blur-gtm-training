'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Phone, PhoneOff, MessageSquare, Send } from 'lucide-react';
import { LiveSession, LiveMessage } from '@/types/live-roleplay';
import { scenarios } from '@/data/scenarios';
import { analytics } from '@/lib/analytics';

interface LiveRoleplaySessionProps {
  sessionId: string;
  userId: string;
  username: string;
  onEndSession?: () => void;
}

export default function LiveRoleplaySession({
  sessionId,
  userId,
  username,
  onEndSession,
}: LiveRoleplaySessionProps) {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isVoiceConnected, setIsVoiceConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const peerRef = useRef<any>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    loadSession();
    startPolling();
    return () => {
      stopPolling();
      cleanupVoice();
    };
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSession = async () => {
    try {
      const response = await fetch(`/api/live/sessions?sessionId=${sessionId}`);
      const data = await response.json();
      setSession(data.session);
      setMessages(data.session.conversationHistory || []);
    } catch (error) {
      console.error('Failed to load session:', error);
    }
  };

  const startPolling = () => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/live/messages?sessionId=${sessionId}`);
        const data = await response.json();
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Failed to poll messages:', error);
      }
    }, 1000); // Poll every second

    (window as any).__liveRoleplayPollInterval = interval;
  };

  const stopPolling = () => {
    if ((window as any).__liveRoleplayPollInterval) {
      clearInterval((window as any).__liveRoleplayPollInterval);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async () => {
    if (!messageText.trim() || isLoading) return;

    const text = messageText.trim();
    setMessageText('');
    setIsLoading(true);

    try {
      const role = session?.repUserId === userId ? 'rep' : 'prospect';
      
      const response = await fetch('/api/live/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          role,
          message: text,
          type: 'text',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        
        analytics.track({
          eventType: 'live_message_sent',
          scenarioId: session?.scenarioId,
          metadata: { role },
        });
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      localStreamRef.current = stream;
      setIsVoiceEnabled(true);
      
      // TODO: Implement WebRTC peer connection
      // For now, just enable voice UI
      setIsVoiceConnected(true);
      
      analytics.track({
        eventType: 'live_voice_enabled',
        scenarioId: session?.scenarioId,
      });
    } catch (error) {
      console.error('Failed to initialize voice:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  };

  const cleanupVoice = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    setIsVoiceEnabled(false);
    setIsVoiceConnected(false);
  };

  const toggleVoice = async () => {
    if (isVoiceEnabled) {
      cleanupVoice();
    } else {
      await initializeVoice();
    }
  };

  const endSession = async () => {
    if (confirm('Are you sure you want to end this session?')) {
      cleanupVoice();
      stopPolling();
      onEndSession?.();
      
      analytics.track({
        eventType: 'live_session_ended',
        scenarioId: session?.scenarioId,
      });
    }
  };

  if (!session) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Loading session...</p>
        </CardContent>
      </Card>
    );
  }

  const scenario = scenarios.find((s) => s.id === session.scenarioId);
  const userRole = session.repUserId === userId ? 'rep' : 'prospect';
  const partnerRole = userRole === 'rep' ? 'prospect' : 'rep';

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-4">
      {/* Session Header */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Live Role-Play Session</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {scenario?.persona.name || 'Enterprise Scenario'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={userRole === 'rep' ? 'default' : 'secondary'}>
                You: {userRole === 'rep' ? 'Sales Rep' : 'Prospect'}
              </Badge>
              <Button variant="outline" size="sm" onClick={endSession}>
                End Session
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages */}
      <Card className="flex-1 border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-4 h-[400px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((msg) => {
                const isOwnMessage = msg.userId === userId;
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        isOwnMessage
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">
                        {isOwnMessage ? username : partnerRole === 'rep' ? 'Sales Rep' : 'Prospect'}
                      </div>
                      <div className="text-sm">{msg.message}</div>
                      <div className="text-xs opacity-60 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Type your message... (Cmd/Ctrl + Enter to send)"
              className="flex-1 min-h-[80px]"
              disabled={isLoading}
            />
            <div className="flex flex-col gap-2">
              <Button
                variant={isVoiceEnabled ? 'default' : 'outline'}
                size="icon"
                onClick={toggleVoice}
                className={isVoiceEnabled ? 'bg-green-600 hover:bg-green-700' : ''}
              >
                {isVoiceEnabled ? (
                  <Mic className="h-4 w-4" />
                ) : (
                  <MicOff className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={sendMessage}
                disabled={!messageText.trim() || isLoading}
                className="bg-black hover:bg-gray-900 text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {isVoiceConnected && (
            <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
              <Phone className="h-3 w-3" />
              Voice connected
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

