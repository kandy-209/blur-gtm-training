'use client';

import { useState } from 'react';
import LiveRoleplayLobby from '@/components/LiveRoleplayLobby';
import LiveRoleplaySession from '@/components/LiveRoleplaySession';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function LiveRoleplayPage() {
  const [userId] = useState(() => {
    // Generate or get user ID from localStorage
    if (typeof window !== 'undefined') {
      let id = localStorage.getItem('liveRoleplayUserId');
      if (!id) {
        id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('liveRoleplayUserId', id);
      }
      return id;
    }
    return 'anonymous';
  });

  const [username, setUsername] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('liveRoleplayUsername') || '';
    }
    return '';
  });

  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [matchUser, setMatchUser] = useState<any>(null);

  const handleMatchFound = (match: any, sessionId: string) => {
    setMatchUser(match);
    setCurrentSessionId(sessionId);
  };

  const handleEndSession = () => {
    setCurrentSessionId(null);
    setMatchUser(null);
  };

  return (
    <ProtectedRoute>
      {!username ? (
        <div className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Enter Your Name</CardTitle>
              <CardDescription>
                Choose a display name for live role-play sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => {
                  const value = e.target.value;
                  setUsername(value);
                  if (typeof window !== 'undefined') {
                    localStorage.setItem('liveRoleplayUsername', value);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && username.trim()) {
                    // Auto-proceed
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                autoFocus
              />
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Live Role-Play</h1>
            <p className="text-muted-foreground">
              Practice Enterprise sales with real teammates in real-time
            </p>
          </div>

          {currentSessionId ? (
            <LiveRoleplaySession
              sessionId={currentSessionId}
              userId={userId}
              username={username}
              onEndSession={handleEndSession}
            />
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              <LiveRoleplayLobby
                userId={userId}
                username={username}
                onMatchFound={handleMatchFound}
              />

              <Card className="border-gray-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div>
                    <strong className="text-foreground">1. Find a Partner:</strong> Click "Find a Partner" to search for someone to role-play with
                  </div>
                  <div>
                    <strong className="text-foreground">2. Start Session:</strong> Once matched, you'll be paired in a live session
                  </div>
                  <div>
                    <strong className="text-foreground">3. Practice:</strong> Chat in real-time and optionally enable voice communication
                  </div>
                  <div>
                    <strong className="text-foreground">4. Learn:</strong> Practice Enterprise sales conversations until you book meetings or close deals
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}
