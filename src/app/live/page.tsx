'use client';

import { useState } from 'react';
import LiveRoleplayLobby from '@/components/LiveRoleplayLobby';
import LiveRoleplaySession from '@/components/LiveRoleplaySession';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h1 className="text-3xl font-bold mb-2">Live Role-Play</h1>
              <p className="text-muted-foreground">
                Practice with teammates in real-time
              </p>
            </div>
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle>Quick Start</CardTitle>
                <CardDescription>
                  Enter your name to join the lobby
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-base"
                    autoFocus
                  />
                  <Button
                    onClick={() => {
                      if (username.trim() && typeof window !== 'undefined') {
                        localStorage.setItem('liveRoleplayUsername', username.trim());
                        setUsername(username.trim());
                      }
                    }}
                    className="w-full bg-black hover:bg-gray-900 text-white h-11"
                    disabled={!username.trim()}
                  >
                    Join Lobby →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
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
            <div className="max-w-4xl mx-auto">
              <LiveRoleplayLobby
                userId={userId}
                username={username}
                onMatchFound={handleMatchFound}
              />
            </div>
          )}
        </div>
      )}
    </ProtectedRoute>
  );
}
