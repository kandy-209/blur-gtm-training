'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, Trophy, Star } from 'lucide-react';
import { LiveSession, LiveMessage } from '@/types/live-roleplay';
import { scenarios } from '@/data/scenarios';
import RatingModal from './RatingModal';

interface CompetitiveRoleplaySessionProps {
  sessionId: string;
  userId: string;
  username: string;
  onEndSession?: () => void;
  onSwapRoles?: () => void;
}

export default function CompetitiveRoleplaySession({
  sessionId,
  userId,
  username,
  onEndSession,
  onSwapRoles,
}: CompetitiveRoleplaySessionProps) {
  const [session, setSession] = useState<LiveSession | null>(null);
  const [messages, setMessages] = useState<LiveMessage[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [partnerUserId, setPartnerUserId] = useState<string | null>(null);
  const [partnerUsername, setPartnerUsername] = useState<string>('');
  const [userRole, setUserRole] = useState<'rep' | 'prospect'>('rep');
  const [repScore, setRepScore] = useState(0);
  const [prospectScore, setProspectScore] = useState(0);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSession();
    startPolling();
    return () => stopPolling();
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
      
      // Determine user role
      const isRep = data.session.repUserId === userId;
      setUserRole(isRep ? 'rep' : 'prospect');
      setPartnerUserId(isRep ? data.session.prospectUserId : data.session.repUserId);
      
      // TODO: Fetch partner username from user profile
      setPartnerUsername(isRep ? 'Prospect' : 'Sales Rep');
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
    }, 1000);

    (window as any).__competitiveRoleplayPollInterval = interval;
  };

  const stopPolling = () => {
    if ((window as any).__competitiveRoleplayPollInterval) {
      clearInterval((window as any).__competitiveRoleplayPollInterval);
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
      const response = await fetch('/api/live/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          userId,
          role: userRole,
          message: text,
          type: 'text',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages((prev) => [...prev, data.message]);
        
        // TODO: Evaluate message and update scores
        // This would call AI evaluation API
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwapRoles = async () => {
    if (onSwapRoles) {
      onSwapRoles();
    } else {
      // Toggle role locally
      setUserRole(userRole === 'rep' ? 'prospect' : 'rep');
    }
  };

  const handleEndSession = () => {
    setShowRatingModal(true);
  };

  const handleRatingComplete = () => {
    setShowRatingModal(false);
    onEndSession?.();
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
  const partnerRole = userRole === 'rep' ? 'prospect' : 'rep';

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-4">
      {/* Session Header with Scores */}
      <Card className="border-gray-200">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Competitive Role-Play</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {scenario?.persona.name || 'Enterprise Scenario'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{repScore}</div>
                <div className="text-xs text-muted-foreground">Rep Score</div>
              </div>
              <div className="text-2xl font-bold">vs</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{prospectScore}</div>
                <div className="text-xs text-muted-foreground">Prospect Score</div>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Role Badge and Swap Button */}
      <div className="flex items-center justify-between">
        <Badge variant={userRole === 'rep' ? 'default' : 'secondary'} className="text-sm">
          You: {userRole === 'rep' ? 'Sales Rep' : 'Prospect'}
        </Badge>
        <Button variant="outline" size="sm" onClick={handleSwapRoles}>
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Swap Roles
        </Button>
      </div>

      {/* Messages */}
      <Card className="flex-1 border-gray-200">
        <CardContent className="p-6">
          <div className="space-y-4 h-[400px] overflow-y-auto">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>Start the conversation! Practice until you book a meeting or close the sale.</p>
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
                        {isOwnMessage ? username : partnerUsername}
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
              placeholder={`Type your response as ${userRole === 'rep' ? 'Sales Rep' : 'Prospect'}... (Cmd/Ctrl + Enter to send)`}
              className="flex-1 min-h-[80px]"
              disabled={isLoading}
            />
            <Button
              onClick={sendMessage}
              disabled={!messageText.trim() || isLoading}
              className="bg-black hover:bg-gray-900 text-white"
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* End Session Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={handleEndSession}>
          End Session & Rate Partner
        </Button>
      </div>

      {/* Rating Modal */}
      {showRatingModal && partnerUserId && (
        <RatingModal
          sessionId={sessionId}
          ratedUserId={partnerUserId}
          ratedUsername={partnerUsername}
          onClose={() => setShowRatingModal(false)}
          onRated={handleRatingComplete}
        />
      )}
    </div>
  );
}

