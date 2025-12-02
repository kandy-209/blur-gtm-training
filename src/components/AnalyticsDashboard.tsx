'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { analytics, TrainingEvent } from '@/lib/analytics';
import { BarChart3, Target, TrendingUp, Clock, MessageSquare, Eye, CheckCircle, Trash2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

function getEventTypeConfig(eventType: string) {
  const configs: Record<string, { label: string; icon: JSX.Element; bgColor: string }> = {
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
  };
  
  return configs[eventType] || {
    label: eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: <BarChart3 className="h-4 w-4 text-gray-600" />,
    bgColor: 'bg-gray-50',
  };
}

export default function AnalyticsDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(analytics.getStats());
  const [recentEvents, setRecentEvents] = useState<TrainingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const updateStats = () => {
      try {
        setStats(analytics.getStats());
        setRecentEvents(analytics.getEvents().slice(-10).reverse());
        setIsLoading(false);
      } catch (error) {
        console.error('Error updating stats:', error);
        setIsLoading(false);
      }
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, []);

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

      // Update local state
      setRecentEvents(prev => prev.filter((_, idx) => idx !== eventIndex));
      setStats(analytics.getStats());
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
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-gray-200 hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Scenarios Completed</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Target className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats.totalScenarios}</div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats.averageScore}<span className="text-xl text-muted-foreground">/100</span></div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 hover-lift transition-smooth">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Turns</CardTitle>
            <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-gray-700" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight">{stats.totalTurns}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl">Recent Activity</CardTitle>
          <CardDescription className="text-sm">Your latest training events</CardDescription>
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
                const eventDate = new Date(event.timestamp);
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
                          {formatDistanceToNow(eventDate, { addSuffix: true })}
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
                        >
                          <Trash2 className="h-4 w-4" />
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
  );
}

