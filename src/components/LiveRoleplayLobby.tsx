'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { scenarios } from '@/data/scenarios';
import { Users, Search, X, CheckCircle, User, Clock, PlayCircle, Loader2 } from 'lucide-react';
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
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null);

  // Auto-start search when preferences change
  useEffect(() => {
    if (isSearching) {
      // Re-join lobby with updated preferences
      const joinLobby = async () => {
        try {
          await fetch('/api/live/lobby', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId,
              username,
              preferredRole,
              scenarioId: selectedScenario && selectedScenario !== 'any' ? selectedScenario : undefined,
            }),
          });
        } catch (error) {
          console.error('Failed to update lobby preferences:', error);
        }
      };
      joinLobby();
    }
  }, [preferredRole, selectedScenario, userId, username, isSearching]);

  useEffect(() => {
    // Poll for lobby updates and check for matches
    const interval = setInterval(async () => {
      if (isSearching && !matchFound) {
        try {
          // Check for lobby users and active session
          const lobbyResponse = await fetch(`/api/live/lobby?userId=${userId}`);
          const lobbyData = await lobbyResponse.json();
          
          // Filter out current user and show waiting users
          const otherUsers = (lobbyData.users || []).filter((u: LobbyUser) => 
            u.userId !== userId && u.status === 'waiting'
          );
          setLobbyUsers(otherUsers);
          
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
      } else if (!isSearching) {
        // Still fetch lobby users even when not searching to show who's available
        try {
          const lobbyResponse = await fetch(`/api/live/lobby?userId=${userId}`);
          const lobbyData = await lobbyResponse.json();
          const otherUsers = (lobbyData.users || []).filter((u: LobbyUser) => 
            u.userId !== userId && u.status === 'waiting'
          );
          setLobbyUsers(otherUsers);
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
    setSearchStartTime(Date.now());

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
        setIsSearching(false);
      }
    } catch (error) {
      console.error('Failed to start search:', error);
      setIsSearching(false);
    }
  };

  const stopSearch = async () => {
    setIsSearching(false);
    setMatchFound(null);
    setSearchStartTime(null);

    try {
      await fetch(`/api/live/lobby?userId=${userId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Failed to stop search:', error);
    }
  };

  const getSearchDuration = () => {
    if (!searchStartTime) return 0;
    return Math.floor((Date.now() - searchStartTime) / 1000);
  };

  return (
    <div className="space-y-6">
      {/* Main Lobby Card */}
      <Card className="border-2 border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-6 w-6 text-blue-600" />
                Live Role-Play Lobby
              </CardTitle>
              <CardDescription className="mt-1">
                Find a partner and start practicing Enterprise sales in real-time
              </CardDescription>
            </div>
            {lobbyUsers.length > 0 && (
              <Badge variant="default" className="bg-blue-600 text-white">
                {lobbyUsers.length} {lobbyUsers.length === 1 ? 'person' : 'people'} waiting
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          {/* Preferences */}
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-semibold mb-2 block">I want to be:</label>
              <Select value={preferredRole} onValueChange={(value: any) => setPreferredRole(value)}>
                <SelectTrigger className="h-11">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Role (Flexible)</SelectItem>
                  <SelectItem value="rep">Sales Rep</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Scenario (Optional):</label>
              <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Any scenario" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any Scenario</SelectItem>
                  {scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.persona.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Match Found */}
          {matchFound ? (
            <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CheckCircle className="h-6 w-6 text-green-600" />
                <span className="font-bold text-green-900 text-lg">Match Found!</span>
              </div>
              <div className="space-y-2">
                <p className="text-green-800 font-semibold">
                  Matched with: <span className="text-green-900">{matchFound.username}</span>
                </p>
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Starting session...</span>
                </div>
              </div>
            </div>
          ) : isSearching ? (
            <div className="space-y-4">
              {/* Search Status */}
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="font-semibold text-blue-900">Searching for match...</span>
                  </div>
                  <div className="text-sm text-blue-700">
                    {getSearchDuration()}s
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={stopSearch}
                  className="w-full sm:w-auto"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel Search
                </Button>
              </div>

              {/* Available Users */}
              {lobbyUsers.length > 0 ? (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {lobbyUsers.length} {lobbyUsers.length === 1 ? 'person' : 'people'} waiting in lobby
                    </span>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {lobbyUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 truncate">
                            {user.username}
                          </div>
                          <div className="text-xs text-gray-500">
                            {user.preferredRole === 'any' ? 'Any role' : user.preferredRole === 'rep' ? 'Rep' : 'Prospect'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg text-center">
                  <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Waiting for others to join...
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Share this page with teammates to practice together!
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Start Search Button */}
              <Button
                onClick={startSearch}
                className="w-full h-12 text-base bg-black hover:bg-gray-900 text-white font-semibold"
                disabled={isSearching}
              >
                <Search className="h-5 w-5 mr-2" />
                Start Searching for Partner
              </Button>

              {/* Available Users Preview */}
              {lobbyUsers.length > 0 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <Users className="h-4 w-4 text-gray-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {lobbyUsers.length} {lobbyUsers.length === 1 ? 'person' : 'people'} waiting
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">
                    Click "Start Searching" to match with them!
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {lobbyUsers.slice(0, 6).map((user) => (
                      <Badge key={user.userId} variant="secondary" className="text-xs">
                        {user.username}
                      </Badge>
                    ))}
                    {lobbyUsers.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{lobbyUsers.length - 6} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <PlayCircle className="h-5 w-5" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-start gap-2">
            <span className="font-semibold text-foreground">1.</span>
            <span>Select your preferred role (or choose "Any Role" for faster matching)</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-foreground">2.</span>
            <span>Click "Start Searching" to join the lobby and find a partner</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-foreground">3.</span>
            <span>Once matched, you'll automatically join a live session together</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold text-foreground">4.</span>
            <span>Practice Enterprise sales conversations in real-time!</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
