'use client';

import { useState, ReactElement, memo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrainingEvent } from '@/lib/analytics';
import { BarChart3, Target, TrendingUp, Clock, MessageSquare, Eye, CheckCircle, Trash2, RefreshCw, Phone } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { safeDate, isValidDate } from '@/lib/date-utils';
import { Skeleton, SkeletonStats, SkeletonList } from '@/components/ui/skeleton';
import { ProgressiveSkeletonGroup } from '@/components/ui/progressive-skeleton';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { LiveRegion } from '@/components/ui/live-region';
import { analytics } from '@/lib/analytics';

function getEventTypeConfig(eventType: string) {
  const configs: Record<string, { label: string; icon: ReactElement; bgColor: string }> = {
    scenario_start: {
      label: 'Scenario Started',
      icon: <Target className="h-4 w-4 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    scenario_complete: {
      label: 'Scenario Completed',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      bgColor: 'bg-green-50',
    },
    turn_submit: {
      label: 'Turn Submitted',
      icon: <MessageSquare className="h-4 w-4 text-purple-600" />,
      bgColor: 'bg-purple-50',
    },
    feedback_view: {
      label: 'Feedback Viewed',
      icon: <Eye className="h-4 w-4 text-orange-600" />,
      bgColor: 'bg-orange-50',
    },
    module_complete: {
      label: 'Module Completed',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      bgColor: 'bg-green-50',
    },
    call_started: {
      label: 'Call Started',
      icon: <Phone className="h-4 w-4 text-blue-600" />,
      bgColor: 'bg-blue-50',
    },
    call_completed: {
      label: 'Call Completed',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      bgColor: 'bg-green-50',
    },
    call_analysis_ready: {
      label: 'Call Analysis Ready',
      icon: <BarChart3 className="h-4 w-4 text-purple-600" />,
      bgColor: 'bg-purple-50',
    },
  };
  
  return configs[eventType] || {
    label: eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: <BarChart3 className="h-4 w-4 text-gray-600" />,
    bgColor: 'bg-gray-50',
  };
}

function AnalyticsDashboard() {
  const { user } = useAuth();
  
  // Performance monitoring
  usePerformanceMonitor({
    componentName: 'AnalyticsDashboard',
    threshold: 100,
  });

  // Use optimized analytics hook with caching
  const {
    stats,
    events: recentEvents,
    isLoading,
    isRefreshing,
    error,
    refresh,
    cacheAge,
    isStale,
  } = useAnalytics({
    userId: user?.id,
    autoRefresh: true,
    refreshInterval: 30000, // 30 seconds
    enableCache: true,
  });

  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const handleDeleteEvent = async (eventIndex: number, event: TrainingEvent) => {
    if (!user) {
      alert('You must be logged in to delete events');
      return;
    }

    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    setDeletingIds(prev => new Set(prev).add(eventIndex));

    try {
      // Delete from analytics instance
      const events = analytics.getEvents();
      const eventToDelete = events[events.length - 1 - eventIndex]; // Reverse index
      if (eventToDelete) {
        const index = events.indexOf(eventToDelete);
        if (index > -1) {
          events.splice(index, 1);
        }
      }

      // Delete from API
      await fetch('/api/analytics', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventIndex,
          userId: user.id,
          timestamp: event.timestamp,
        }),
      });

      // Refresh analytics to get updated data
      await refresh();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Failed to delete event. Please try again.');
    } finally {
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(eventIndex);
        return next;
      });
    }
  };

  return (
    <>
      <LiveRegion id="analytics-live-region" level="polite" />
      {isLoading ? (
        <div className="space-y-8" role="status" aria-live="polite" aria-label="Loading analytics dashboard">
          <ProgressiveSkeletonGroup
            count={3}
            delay={0}
            stagger={100}
            renderItem={(index) => (
              <Card className="border-gray-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <Skeleton variant="rounded" height={16} width="60%" />
                  <Skeleton variant="circular" width={40} height={40} />
                </CardHeader>
                <CardContent>
                  <Skeleton variant="rounded" height={32} width="40%" />
                </CardContent>
              </Card>
            )}
          />
          <Card className="border-gray-200">
            <CardHeader className="pb-4">
              <Skeleton variant="rounded" height={24} width="40%" />
              <Skeleton variant="text" height={16} width="60%" className="mt-2" />
            </CardHeader>
            <CardContent>
              <ProgressiveSkeletonGroup
                count={5}
                delay={300}
                stagger={50}
                renderItem={() => (
                  <div className="border border-gray-200 rounded-xl p-4 space-y-3 mb-3">
                    <Skeleton variant="rounded" height={16} width="80%" />
                    <Skeleton variant="text" height={12} width="60%" />
                  </div>
                )}
              />
            </CardContent>
          </Card>
          {isRefreshing && (
            <div className="text-center text-sm text-muted-foreground flex items-center justify-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Refreshing...
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="border-gray-200 hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scenarios Completed</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center" aria-hidden="true">
              <Target className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight" aria-label={`${stats.totalScenarios} scenarios completed`}>
              {stats.totalScenarios}
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center" aria-hidden="true">
              <TrendingUp className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight" aria-label={`Average score: ${stats.averageScore} out of 100`}>
              {stats.averageScore}<span className="text-xl text-muted-foreground">/100</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Turns</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center" aria-hidden="true">
              <BarChart3 className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight" aria-label={`${stats.totalTurns} total turns`}>
              {stats.totalTurns}
            </div>
          </CardContent>
        </Card>

        {stats.totalCalls > 0 && (
          <Card className="border-gray-200 hover-lift transition-smooth">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Phone Calls</CardTitle>
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center" aria-hidden="true">
                <Phone className="h-5 w-5 text-blue-700" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold tracking-tight" aria-label={`${stats.totalCalls} phone calls completed`}>
                {stats.totalCalls}
              </div>
              {stats.averageCallScore > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Avg: {stats.averageCallScore}/100
                </p>
              )}
            </CardContent>
          </Card>
        )}
          </div>

          <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Recent Activity</CardTitle>
              <CardDescription className="text-sm">
                Your latest training events
                {isStale && cacheAge > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    (Updated {Math.floor(cacheAge / 1000)}s ago)
                  </span>
                )}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refresh()}
              disabled={isRefreshing}
              className="h-8"
              title="Refresh analytics"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-sm text-muted-foreground">No events yet</p>
                <p className="text-xs text-muted-foreground mt-1">Start a scenario to see your activity here</p>
              </div>
            ) : (
              recentEvents.map((event, idx) => {
                // Safely get date and validate
                const eventDate = safeDate(event.timestamp);
                const dateIsValid = isValidDate(event.timestamp);
                
                const eventTypeConfig = getEventTypeConfig(event.eventType);
                const isDeleting = deletingIds.has(idx);
                
                return (
                  <div 
                    key={idx} 
                    className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50/50 transition-all animate-fade-in"
                  >
                    <div className={`p-2.5 rounded-lg shrink-0 ${eventTypeConfig.bgColor}`}>
                      {eventTypeConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="font-semibold text-sm text-foreground">{eventTypeConfig.label}</span>
                        {event.scenarioId && (
                          <Badge variant="outline" className="text-xs border-gray-300">
                            {event.scenarioId}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {dateIsValid ? (
                            formatDistanceToNow(eventDate, { addSuffix: true })
                          ) : (
                            <span>Just now</span>
                          )}
                        </div>
                        {event.score !== undefined && (
                          <div className="flex items-center gap-1.5">
                            <CheckCircle className="h-3.5 w-3.5" />
                            <span className="font-semibold text-foreground">{event.score}/100</span>
                          </div>
                        )}
                        {event.turnNumber && (
                          <div className="flex items-center gap-1.5">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Turn {event.turnNumber}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="text-xs text-muted-foreground">
                        {format(eventDate, 'h:mm a')}
                      </div>
                      {user && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteEvent(idx, event)}
                          disabled={isDeleting}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete event"
                          aria-label={`Delete ${eventTypeConfig.label} event`}
                          aria-busy={isDeleting}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          </CardContent>
        </Card>
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 flex items-center justify-between" role="alert">
          <span>{error.message || 'Failed to load analytics'}</span>
          <Button variant="ghost" size="sm" onClick={() => refresh()} className="h-6 text-red-700 hover:text-red-800">
            Retry
          </Button>
        </div>
      )}
    </>
  );
}

export default memo(AnalyticsDashboard);

