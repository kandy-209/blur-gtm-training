'use client';

/**
 * Code-Aware Discovery Call Component
 * Main UI for discovery call practice
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Mic, MicOff, Send, BarChart3 } from 'lucide-react';
import { FeedbackDisplay } from './FeedbackDisplay';

interface ConversationMessage {
  role: 'rep' | 'prospect';
  message: string;
  timestamp: Date;
}

interface DiscoveryCallProps {
  callId: string;
  companyId: string;
  personaId: string;
}

export function DiscoveryCall({ callId, companyId, personaId }: DiscoveryCallProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [metrics, setMetrics] = useState({
    talkToListenRatio: {
      repSpeakingTime: 0,
      prospectSpeakingTime: 0,
      ratio: 0,
      status: 'balanced' as 'balanced' | 'rep_dominating' | 'rep_too_quiet',
    },
  });

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const repMessage: ConversationMessage = {
      role: 'rep',
      message: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, repMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Send message to API
      const response = await fetch(`/api/discovery-call/${callId}/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      const prospectMessage: ConversationMessage = {
        role: 'prospect',
        message: data.prospectResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, prospectMessage]);
      
      if (data.metrics) {
        setMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording
  };

  return (
    <div className="flex flex-col lg:grid lg:grid-cols-12 gap-4 sm:gap-6 min-h-screen p-3 sm:p-4 md:p-6">
      {/* Main conversation */}
      <div className="lg:col-span-8 flex flex-col w-full">
        {/* Metrics display */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Talk-to-Listen Ratio</div>
              <div className="text-2xl font-bold">
                {(metrics.talkToListenRatio.ratio * 100).toFixed(0)}%
              </div>
            </div>
            <div className={`px-3 py-1 rounded ${
              metrics.talkToListenRatio.status === 'balanced' ? 'bg-green-100 text-green-800' :
              metrics.talkToListenRatio.status === 'rep_dominating' ? 'bg-yellow-100 text-yellow-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {metrics.talkToListenRatio.status === 'balanced' ? '✓ Balanced' :
               metrics.talkToListenRatio.status === 'rep_dominating' ? '⚠ Too much talking' :
               '⚠ Too quiet'}
            </div>
          </div>
        </Card>

        {/* Conversation */}
        <Card className="flex-1 flex flex-col p-6 mb-4">
          <div className="flex-1 overflow-y-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                Start the conversation by introducing yourself
              </div>
            ) : (
              messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'rep' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] lg:max-w-[70%] rounded-lg p-3 sm:p-4 ${
                      msg.role === 'rep'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <div className="text-sm font-semibold mb-1">
                      {msg.role === 'rep' ? 'You' : 'Prospect'}
                    </div>
                    <div>{msg.message}</div>
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-200 rounded-lg p-3">
                  <div className="animate-pulse">Prospect is typing...</div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Input */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 min-w-0"
          />
          <div className="flex gap-2">
            <Button
              onClick={toggleRecording}
              variant={isRecording ? 'destructive' : 'outline'}
              size="icon"
              className="flex-shrink-0"
            >
              {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="flex-shrink-0"
            >
              <Send className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Send</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="col-span-4">
        <Tabs defaultValue="context" className="h-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="context">Context</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
          </TabsList>
          <TabsContent value="context" className="mt-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-2">Company Context</h3>
              <p className="text-sm text-gray-600">
                Company ID: {companyId}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Persona ID: {personaId}
              </p>
            </Card>
          </TabsContent>
          <TabsContent value="metrics" className="mt-4">
            <Card className="p-4">
              <h3 className="font-semibold mb-4">Conversation Metrics</h3>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-600">Your Speaking Time</div>
                  <div className="text-lg font-semibold">
                    {metrics.talkToListenRatio.repSpeakingTime.toFixed(1)}s
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Prospect Speaking Time</div>
                  <div className="text-lg font-semibold">
                    {metrics.talkToListenRatio.prospectSpeakingTime.toFixed(1)}s
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Total Messages</div>
                  <div className="text-lg font-semibold">{messages.length}</div>
                </div>
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="feedback" className="mt-4">
            <FeedbackDisplay callId={callId} />
          </TabsContent>
        </Tabs>
      </aside>
    </div>
  );
}

