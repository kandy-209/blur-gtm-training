'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bot, User, Loader2, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { hasPermission, canAccessChat, getUserRole, getPermissions, Permission } from '@/lib/permissions';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  requiresPermission?: Permission;
}

interface ChatConfig {
  chatType: 'general' | 'technical' | 'roi' | 'features';
  title: string;
  description: string;
  placeholder: string;
}

const chatConfigs: Record<string, ChatConfig> = {
  general: {
    chatType: 'general',
    title: 'General Chat',
    description: 'Ask general questions about Cursor',
    placeholder: 'Ask any question about Cursor...',
  },
  technical: {
    chatType: 'technical',
    title: 'Technical Chat',
    description: 'Ask technical questions (requires user account)',
    placeholder: 'Ask technical questions...',
  },
  roi: {
    chatType: 'roi',
    title: 'ROI & Business Chat',
    description: 'Ask about ROI and business impact (requires user account)',
    placeholder: 'Ask about ROI and business value...',
  },
  features: {
    chatType: 'features',
    title: 'Features Chat',
    description: 'Learn about Cursor features',
    placeholder: 'Ask about Cursor features...',
  },
};

export function PermissionAwareChat({ initialChatType = 'general' }: { initialChatType?: string }) {
  const { user, isGuest } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: `Hi! I'm here to help. You're currently using ${getUserRole(user)} access. Ask me questions based on your permissions.`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChatType, setSelectedChatType] = useState<string>(initialChatType);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentConfig = chatConfigs[selectedChatType] || chatConfigs.general;
  const hasAccess = canAccessChat(user, currentConfig.chatType as any);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    // Check permission before sending (OSO-style authorization)
    if (!hasAccess) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: `You don't have permission to use ${currentConfig.title}. ${isGuest ? 'Please sign in to access this feature.' : 'Contact your administrator for access.'}`,
        timestamp: new Date(),
      }]);
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setIsLoading(true);

    // Add user message
    setMessages(prev => [...prev, { 
      role: 'user', 
      content: userMessage,
      timestamp: new Date(),
    }]);

    try {
      // Route to appropriate API based on chat type
      let apiEndpoint = '/api/chat/general';
      
      if (selectedChatType === 'features') {
        apiEndpoint = '/api/features/chat';
      } else if (selectedChatType === 'roi') {
        apiEndpoint = '/api/chat/roi';
      } else if (selectedChatType === 'technical') {
        apiEndpoint = '/api/chat/technical';
      }

      // Build authorization context (OSO-style)
      const authzContext = {
        userId: user?.id || 'anonymous',
        role: isGuest ? 'guest' : getUserRole(user),
        isGuest,
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: userMessage,
          role: authzContext.role,
          chatType: selectedChatType,
          userId: authzContext.userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403) {
          // Permission denied - OSO-style authorization failure
          const errorMsg = data.error || 'You do not have permission to access this chat.';
          setMessages(prev => [...prev, {
            role: 'system',
            content: `🔒 ${errorMsg} ${isGuest ? 'Please sign in to access this feature.' : ''}`,
            timestamp: new Date(),
          }]);
          return;
        }
        throw new Error(data.error || 'Failed to get response');
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.answer || data.response || 'I apologize, but I cannot answer that question.',
        timestamp: new Date(),
      }]);
    } catch (error: any) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: `❌ Error: ${error.message}. Please try again or contact support if the issue persists.`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const availableChatTypes = Object.entries(chatConfigs).filter(([key, config]) => 
    canAccessChat(user, config.chatType as any)
  );

  return (
    <Card className="border-gray-200 h-[600px] flex flex-col">
      <CardHeader className="pb-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            {currentConfig.title}
          </CardTitle>
          {!hasAccess && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Restricted
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{currentConfig.description}</p>
        
        {/* Chat Type Selector */}
        {availableChatTypes.length > 1 && (
          <div className="mt-3">
            <Select value={selectedChatType} onValueChange={setSelectedChatType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableChatTypes.map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Permission Warning */}
        {!hasAccess && (
          <div className="bg-yellow-50 border-b border-yellow-200 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-900">Access Restricted</p>
                <p className="text-xs text-yellow-800 mt-1">
                  {isGuest 
                    ? 'Please sign in to access this chat. Some features require a user account.'
                    : 'You need additional permissions to access this chat. Contact your administrator.'}
                </p>
                {isGuest && (
                  <Button 
                    size="sm" 
                    className="mt-2 bg-black hover:bg-gray-900 text-white"
                    onClick={() => window.location.href = '/auth'}
                  >
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${
                message.role === 'user' 
                  ? 'justify-end' 
                  : message.role === 'system'
                  ? 'justify-center'
                  : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              {message.role === 'system' && (
                <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
              )}
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-black text-white'
                    : message.role === 'system'
                    ? 'bg-yellow-50 border border-yellow-200 text-yellow-900'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-100 rounded-lg p-3">
                <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={hasAccess ? currentConfig.placeholder : 'Access restricted...'}
              className="flex-1"
              disabled={isLoading || !hasAccess}
            />
            <Button
              onClick={handleSend}
              disabled={isLoading || !input.trim() || !hasAccess}
              className="bg-black hover:bg-gray-900 text-white"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          {hasAccess && (
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                Role: <span className="font-medium">{getUserRole(user)}</span> • Press Enter to send
              </p>
              <p className="text-xs text-muted-foreground">
                {getPermissions(user).filter(p => p.startsWith('chat:')).length} chat type{getPermissions(user).filter(p => p.startsWith('chat:')).length !== 1 ? 's' : ''} available
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

