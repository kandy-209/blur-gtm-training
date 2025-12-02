'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { scenarios } from '@/data/scenarios';
import { Users, Search, X, CheckCircle } from 'lucide-react';
import { analytics } from '@/lib/analytics';

interface LobbyUser {
  userId: string;
  username: string;
  preferredRole: 'rep' | 'prospect' | 'any';
  scenarioId?: string;
  status: 'waiting' | 'matched' | 'in-session';
  joinedAt: Date;
}

interface LiveRoleplayLobbyProps {
  userId: string;
  username: string;
  onMatchFound?: (match: LobbyUser, sessionId: string) => void;
}

export default function LiveRoleplayLobby({ userId, username, onMatchFound }: LiveRoleplayLobbyProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [preferredRole, setPreferredRole] = useState<'rep' | 'prospect' | 'any'>('any');
  const [selectedScenario, setSelectedScenario] = useState<string>('any');
  const [lobbyUsers, setLobbyUsers] = useState<LobbyUser[]>([]);
  const [matchFound, setMatchFound] = useState<LobbyUser | null>(null);

  useEffect(() => {
    // Poll for lobby updates and check for matches
    const interval = setInterval(async () => {
      if (isSearching && !matchFound) {
        try {
          // Check for lobby users and active session
          const lobbyResponse = await fetch(`/api/live/lobby?userId=${userId}`);
          const lobbyData = await lobbyResponse.json();
          setLobbyUsers(lobbyData.users || []);
          
          // Check if we've been matched (have an active session)
          if (lobbyData.activeSessionId) {
            // We've been matched! Get the session details
            const sessionResponse = await fetch(`/api/live/sessions?sessionId=${lobbyData.activeSessionId}`);
            const sessionData = await sessionResponse.json();
            
            if (sessionData.session) {
              // Find the other user
              const otherUserId = sessionData.session.repUserId === userId 
                ? sessionData.session.prospectUserId 
                : sessionData.session.repUserId;
              
              // Find their username from lobby
              const otherUser = lobbyData.users.find((u: LobbyUser) => u.userId === otherUserId);
              
              if (otherUser) {
                setMatchFound(otherUser);
                
                analytics.track({
                  eventType: 'live_match_found',
                  scenarioId: sessionData.session.scenarioId,
                  metadata: {
                    matchUserId: otherUserId,
                    preferredRole,
                  },
                });

                onMatchFound?.(otherUser, lobbyData.activeSessionId);
                setIsSearching(false);
                return;
              }
            }
          }
          
          // Also try to find a match by re-joining lobby
          // This will trigger match detection
          const matchResponse = await fetch('/api/live/lobby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              username,
              preferredRole,
              scenarioId: selectedScenario && selectedScenario !== 'any' ? selectedScenario : undefined,
            }),
          });
          
          const matchData = await matchResponse.json();
          
          // If a match is found, create session
          if (matchData.match && !matchFound) {
            setMatchFound(matchData.match);
            
            // Create session
            const sessionResponse = await fetch('/api/live/sessions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                repUserId: preferredRole === 'rep' ? userId : matchData.match.userId,
                prospectUserId: preferredRole === 'prospect' ? userId : matchData.match.userId,
                scenarioId: selectedScenario && selectedScenario !== 'any' ? selectedScenario : scenarios[0].id,
              }),
            });

            const sessionData = await sessionResponse.json();
            
            analytics.track({
              eventType: 'live_match_found',
              scenarioId: selectedScenario && selectedScenario !== 'any' ? selectedScenario : scenarios[0].id,
              metadata: {
                matchUserId: matchData.match.userId,
                preferredRole,
              },
            });

            onMatchFound?.(matchData.match, sessionData.session.id);
            setIsSearching(false);
          }
        } catch (error) {
          console.error('Failed to fetch lobby users:', error);
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isSearching, userId, username, preferredRole, selectedScenario, matchFound, onMatchFound]);

  const startSearch = async () => {
    setIsSearching(true);
    setMatchFound(null);

    try {
      const response = await fetch('/api/live/lobby', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          username,
          preferredRole,
          scenarioId: selectedScenario && selectedScenario !== 'any' ? selectedScenario : undefined,
        }),
      });

      const data = await response.json();

      if (data.match) {
        // Found a match!
        setMatchFound(data.match);
        
        // Create session
        const sessionResponse = await fetch('/api/live/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            repUserId: preferredRole === 'rep' ? userId : data.match.userId,
            prospectUserId: preferredRole === 'prospect' ? userId : data.match.userId,
            scenarioId: selectedScenario && selectedScenario !== 'any' ? selectedScenario : scenarios[0].id,
          }),
        });

        const sessionData = await sessionResponse.json();
        
        analytics.track({
          eventType: 'live_match_found',
          scenarioId: selectedScenario && selectedScenario !== 'any' ? selectedScenario : scenarios[0].id,
          metadata: {
            matchUserId: data.match.userId,
            preferredRole,
          },
        });

        onMatchFound?.(data.match, sessionData.session.id);
      }
    } catch (error) {
      console.error('Failed to start search:', error);
      setIsSearching(false);
    }
  };

  const stopSearch = async () => {
    setIsSearching(false);
    setMatchFound(null);

    try {
      await fetch(`/api/live/lobby?userId=${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to stop search:', error);
    }
  };

  return (
    <Card className="border-gray-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Live Role-Play Lobby
        </CardTitle>
        <CardDescription>
          Find a partner to practice Enterprise sales role-play in real-time
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium mb-2 block">Preferred Role</label>
            <Select value={preferredRole} onValueChange={(value: any) => setPreferredRole(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any Role</SelectItem>
                <SelectItem value="rep">Sales Rep</SelectItem>
                <SelectItem value="prospect">Prospect</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Scenario (Optional)</label>
            <Select value={selectedScenario} onValueChange={setSelectedScenario}>
              <SelectTrigger>
                <SelectValue placeholder="Any scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any scenario</SelectItem>
                {scenarios.map((scenario) => (
                  <SelectItem key={scenario.id} value={scenario.id}>
                    {scenario.persona.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {matchFound ? (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-900">Match Found!</span>
            </div>
            <p className="text-sm text-green-700">
              Matched with: <strong>{matchFound.username}</strong>
            </p>
            <p className="text-xs text-green-600 mt-1">
              Starting session...
            </p>
          </div>
        ) : isSearching ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-muted-foreground">Searching for match...</span>
              </div>
              <Button variant="outline" size="sm" onClick={stopSearch}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>

            {lobbyUsers.length > 0 && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-2">
                  {lobbyUsers.length} user{lobbyUsers.length !== 1 ? 's' : ''} in lobby
                </p>
                <div className="flex flex-wrap gap-2">
                  {lobbyUsers.slice(0, 5).map((user) => (
                    <Badge key={user.userId} variant="secondary" className="text-xs">
                      {user.username}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Button
            onClick={startSearch}
            className="w-full bg-black hover:bg-gray-900 text-white"
            disabled={isSearching}
          >
            <Search className="h-4 w-4 mr-2" />
            Find a Partner
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

