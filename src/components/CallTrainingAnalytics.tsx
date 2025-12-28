'use client';

import { useState, useEffect, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Phone, Clock, Target, TrendingUp, Award, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { Skeleton, SkeletonStats } from '@/components/ui/skeleton';

interface CallTrainingMetrics {
  callId: string;
  scenarioId: string;
  duration: number;
  talkTime: number;
  listenTime: number;
  interruptions: number;
  objectionsRaised: number;
  objectionsResolved: number;
  meetingBooked: boolean;
  saleClosed: boolean;
  energyLevel: number;
  confidenceScore: number;
  overallScore: number;
  timestamp: string;
}

interface CallTrainingStats {
  totalCalls: number;
  averageScore: number;
  averageDuration: number;
  meetingBookingRate: number;
  saleClosingRate: number;
  averageObjectionsResolved: number;
  recentCalls: CallTrainingMetrics[];
}

function CallTrainingAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CallTrainingStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCallAnalytics = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/analytics/calls?userId=${user.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch call analytics');
        }
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load call analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCallAnalytics();
    // Refresh every 60 seconds (less aggressive to avoid rate limits)
    const interval = setInterval(fetchCallAnalytics, 60000);
    return () => clearInterval(interval);
  }, [user?.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonStats key={i} />
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalCalls === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Phone className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">No call training data yet</p>
            <p className="text-xs text-muted-foreground mt-1">Complete a phone call training session to see analytics</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-gray-200 hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Calls</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Phone className="h-5 w-5 text-blue-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats.totalCalls}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {stats.averageScore}<span className="text-xl text-muted-foreground">/100</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Duration</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {Math.floor(stats.averageDuration / 60)}m {Math.floor(stats.averageDuration % 60)}s
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Meeting Rate</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-orange-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">
              {Math.round(stats.meetingBookingRate)}<span className="text-xl text-muted-foreground">%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Calls */}
      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl">Recent Call Training Sessions</CardTitle>
          <CardDescription>Your latest phone call training performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.recentCalls.map((call) => (
              <div
                key={call.callId}
                className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50/50 transition-all"
              >
                <div className="p-2.5 rounded-lg bg-blue-50 shrink-0">
                  <Phone className="h-5 w-5 text-blue-700" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="font-semibold text-sm">Call Training</span>
                    {call.scenarioId && (
                      <Badge variant="outline" className="text-xs">
                        {call.scenarioId}
                      </Badge>
                    )}
                    <Badge variant={call.saleClosed ? 'default' : call.meetingBooked ? 'secondary' : 'outline'} className="text-xs">
                      {call.saleClosed ? 'Sale Closed' : call.meetingBooked ? 'Meeting Booked' : 'Completed'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Score</div>
                      <div className="text-lg font-bold">{call.overallScore}/100</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Duration</div>
                      <div className="text-lg font-bold">
                        {Math.floor(call.duration / 60)}m {Math.floor(call.duration % 60)}s
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Objections</div>
                      <div className="text-lg font-bold">
                        {call.objectionsResolved}/{call.objectionsRaised}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Energy</div>
                      <div className="text-lg font-bold">{call.energyLevel}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {formatDistanceToNow(new Date(call.timestamp), { addSuffix: true })}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {Math.floor(call.talkTime / 60)}m talk time
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default memo(CallTrainingAnalytics);




