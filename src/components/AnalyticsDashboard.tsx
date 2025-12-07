'use client';

import { useState, ReactElement, memo, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrainingEvent } from '@/lib/analytics';
import { BarChart3, Target, TrendingUp, Clock, MessageSquare, Eye, CheckCircle, Trash2, RefreshCw, Phone, TrendingDown, Award, Zap, Activity, Calendar, Download, Sparkles, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { format, formatDistanceToNow, subDays, startOfDay, endOfDay } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';
import { safeDate, isValidDate } from '@/lib/date-utils';
import { Skeleton, SkeletonStats, SkeletonList } from '@/components/ui/skeleton';
import { ProgressiveSkeletonGroup } from '@/components/ui/progressive-skeleton';
import { useAnalytics } from '@/hooks/useAnalytics';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';
import { LiveRegion } from '@/components/ui/live-region';
import { analytics } from '@/lib/analytics';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function getEventTypeConfig(eventType: string) {
  const configs: Record<string, { label: string; icon: ReactElement; bgColor: string; gradient: string }> = {
    scenario_start: {
      label: 'Scenario Started',
      icon: <Target className="h-4 w-4 text-blue-600" />,
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
    },
    scenario_complete: {
      label: 'Scenario Completed',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
    },
    turn_submit: {
      label: 'Turn Submitted',
      icon: <MessageSquare className="h-4 w-4 text-purple-600" />,
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600',
    },
    feedback_view: {
      label: 'Feedback Viewed',
      icon: <Eye className="h-4 w-4 text-orange-600" />,
      bgColor: 'bg-orange-50',
      gradient: 'from-orange-500 to-orange-600',
    },
    module_complete: {
      label: 'Module Completed',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
    },
    call_started: {
      label: 'Call Started',
      icon: <Phone className="h-4 w-4 text-blue-600" />,
      bgColor: 'bg-blue-50',
      gradient: 'from-blue-500 to-blue-600',
    },
    call_completed: {
      label: 'Call Completed',
      icon: <CheckCircle className="h-4 w-4 text-green-600" />,
      bgColor: 'bg-green-50',
      gradient: 'from-green-500 to-green-600',
    },
    call_analysis_ready: {
      label: 'Call Analysis Ready',
      icon: <BarChart3 className="h-4 w-4 text-purple-600" />,
      bgColor: 'bg-purple-50',
      gradient: 'from-purple-500 to-purple-600',
    },
  };
  
  return configs[eventType] || {
    label: eventType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    icon: <BarChart3 className="h-4 w-4 text-gray-600" />,
    bgColor: 'bg-gray-50',
    gradient: 'from-gray-500 to-gray-600',
  };
}

type TimeRange = '7d' | '30d' | '90d' | 'all';

function AnalyticsDashboard() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  
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

  // Filter events by time range
  const filteredEvents = useMemo(() => {
    if (!recentEvents.length) return [];
    
    const now = new Date();
    let cutoffDate: Date;
    
    switch (timeRange) {
      case '7d':
        cutoffDate = subDays(now, 7);
        break;
      case '30d':
        cutoffDate = subDays(now, 30);
        break;
      case '90d':
        cutoffDate = subDays(now, 90);
        break;
      default:
        return recentEvents;
    }
    
    return recentEvents.filter(event => {
      const eventDate = safeDate(event.timestamp);
      return eventDate >= cutoffDate;
    });
  }, [recentEvents, timeRange]);

  // Calculate trends (mock data for now - would come from API)
  const trends = useMemo(() => {
    // For 'all' time range, we can't meaningfully calculate trends vs previous period
    // so we skip the previous period filtering
    const previousPeriodEvents = timeRange === 'all' ? [] : recentEvents.filter(event => {
      const eventDate = safeDate(event.timestamp);
      const now = new Date();
      let cutoff: Date;
      let periodEnd: Date;
      
      switch (timeRange) {
        case '7d':
          cutoff = subDays(now, 14);
          periodEnd = subDays(now, 7);
          break;
        case '30d':
          cutoff = subDays(now, 60);
          periodEnd = subDays(now, 30);
          break;
        case '90d':
          cutoff = subDays(now, 180);
          periodEnd = subDays(now, 90);
          break;
        default:
          return false;
      }
      return eventDate >= cutoff && eventDate < periodEnd;
    });

    const currentScenarios = filteredEvents.filter(e => e.eventType === 'scenario_complete').length;
    const previousScenarios = previousPeriodEvents.filter(e => e.eventType === 'scenario_complete').length;
    const scenarioChange = previousScenarios > 0 
      ? ((currentScenarios - previousScenarios) / previousScenarios) * 100 
      : currentScenarios > 0 ? 100 : 0;

    const currentScores = filteredEvents.filter(e => e.score !== undefined).map(e => e.score!);
    const previousScores = previousPeriodEvents.filter(e => e.score !== undefined).map(e => e.score!);
    const avgCurrent = currentScores.length > 0 ? currentScores.reduce((a, b) => a + b, 0) / currentScores.length : 0;
    const avgPrevious = previousScores.length > 0 ? previousScores.reduce((a, b) => a + b, 0) / previousScores.length : 0;
    const scoreChange = avgPrevious > 0 ? ((avgCurrent - avgPrevious) / avgPrevious) * 100 : avgCurrent > 0 ? 100 : 0;

    return {
      scenarios: { value: scenarioChange, isPositive: scenarioChange >= 0 },
      score: { value: scoreChange, isPositive: scoreChange >= 0 },
      turns: { value: 15, isPositive: true }, // Mock
    };
  }, [filteredEvents, recentEvents, timeRange]);

  // Prepare chart data
  const activityChartData = useMemo(() => {
    // For 'all' time, calculate days from earliest event or default to 365
    let days: number;
    if (timeRange === 'all') {
      if (filteredEvents.length > 0) {
        const dates = filteredEvents.map(e => safeDate(e.timestamp).getTime());
        const oldestDate = new Date(Math.min(...dates));
        const daysSinceOldest = Math.ceil((Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24));
        days = Math.max(daysSinceOldest, 30); // At least 30 days for readability
        days = Math.min(days, 365); // Cap at 365 days for performance
      } else {
        days = 30; // Default for empty data
      }
    } else {
      days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    }
    const data: Array<{ date: string; scenarios: number; turns: number; calls: number }> = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, 'MMM d');
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayEvents = filteredEvents.filter(event => {
        const eventDate = safeDate(event.timestamp);
        return eventDate >= dayStart && eventDate <= dayEnd;
      });
      
      data.push({
        date: dateStr,
        scenarios: dayEvents.filter(e => e.eventType === 'scenario_complete').length,
        turns: dayEvents.filter(e => e.eventType === 'turn_submit').length,
        calls: dayEvents.filter(e => e.eventType === 'call_completed').length,
      });
    }
    
    return data;
  }, [filteredEvents, timeRange]);

  // Score distribution data
  const scoreDistribution = useMemo(() => {
    const scores = filteredEvents.filter(e => e.score !== undefined).map(e => e.score!);
    const ranges = [
      { name: '90-100', min: 90, max: 100, color: '#10b981' },
      { name: '80-89', min: 80, max: 89, color: '#3b82f6' },
      { name: '70-79', min: 70, max: 79, color: '#f59e0b' },
      { name: '60-69', min: 60, max: 69, color: '#ef4444' },
      { name: '0-59', min: 0, max: 59, color: '#6b7280' },
    ];
    
    return ranges.map(range => ({
      name: range.name,
      value: scores.filter(s => s >= range.min && s <= range.max).length,
      color: range.color,
    }));
  }, [filteredEvents]);

  // Performance insights
  const insights = useMemo(() => {
    const insightsList: Array<{ type: 'success' | 'warning' | 'info'; message: string; icon: ReactElement }> = [];
    
    if (stats.averageScore >= 85) {
      insightsList.push({
        type: 'success',
        message: 'Excellent! Your average score is above 85. Keep up the great work!',
        icon: <Award className="h-4 w-4" />,
      });
    } else if (stats.averageScore >= 70) {
      insightsList.push({
        type: 'info',
        message: 'Good progress! Try focusing on objection handling to push your score above 85.',
        icon: <Target className="h-4 w-4" />,
      });
    } else {
      insightsList.push({
        type: 'warning',
        message: 'Practice more scenarios to improve your average score. Focus on key objection handling techniques.',
        icon: <Zap className="h-4 w-4" />,
      });
    }
    
    if (stats.totalScenarios >= 10) {
      insightsList.push({
        type: 'success',
        message: `You've completed ${stats.totalScenarios} scenarios! You're building strong skills.`,
        icon: <Sparkles className="h-4 w-4" />,
      });
    }
    
    const recentActivity = filteredEvents.filter(e => {
      const eventDate = safeDate(e.timestamp);
      return eventDate >= subDays(new Date(), 7);
    }).length;
    
    if (recentActivity === 0) {
      insightsList.push({
        type: 'warning',
        message: 'No activity in the last 7 days. Start a new scenario to keep improving!',
        icon: <Activity className="h-4 w-4" />,
      });
    }
    
    return insightsList;
  }, [stats, filteredEvents]);

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
      const events = analytics.getEvents();
      const eventToDelete = events[events.length - 1 - eventIndex];
      if (eventToDelete) {
        const index = events.indexOf(eventToDelete);
        if (index > -1) {
          events.splice(index, 1);
        }
      }

      await fetch('/api/analytics', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventIndex,
          userId: user.id,
          timestamp: event.timestamp,
        }),
      });

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

  const handleExport = () => {
    const dataStr = JSON.stringify({ stats, events: filteredEvents }, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const TrendIndicator = ({ value, isPositive }: { value: number; isPositive: boolean }) => {
    const Icon = isPositive ? ArrowUpRight : ArrowDownRight;
    const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
    return (
      <div className={`flex items-center gap-1 text-xs font-medium ${colorClass}`}>
        <Icon className="h-3 w-3" />
        <span>{Math.abs(value).toFixed(1)}%</span>
      </div>
    );
  };

  return (
    <>
      <LiveRegion id="analytics-live-region" level="polite" />
      {isLoading ? (
        <div className="space-y-8" role="status" aria-live="polite" aria-label="Loading analytics dashboard">
          <ProgressiveSkeletonGroup
            count={4}
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
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Header with Time Range Filter */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Performance Overview</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Track your training progress and insights
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                  <SelectItem value="all">All time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={handleExport} className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => refresh()}
                disabled={isRefreshing}
                className="h-9"
                title="Refresh analytics"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>

          {/* Stats Cards with Trends */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50/50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Scenarios Completed</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm" aria-hidden="true">
                  <Target className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight" aria-label={`${stats.totalScenarios} scenarios completed`}>
                  {stats.totalScenarios}
                </div>
                <div className="mt-2">
                  <TrendIndicator value={trends.scenarios.value} isPositive={trends.scenarios.isPositive} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-green-300 hover:shadow-lg transition-all bg-gradient-to-br from-green-50/50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-sm" aria-hidden="true">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight" aria-label={`Average score: ${stats.averageScore} out of 100`}>
                  {stats.averageScore}<span className="text-xl text-muted-foreground">/100</span>
                </div>
                <div className="mt-2">
                  <TrendIndicator value={trends.score.value} isPositive={trends.score.isPositive} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all bg-gradient-to-br from-purple-50/50 to-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total Turns</CardTitle>
                <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-sm" aria-hidden="true">
                  <BarChart3 className="h-5 w-5 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight" aria-label={`${stats.totalTurns} total turns`}>
                  {stats.totalTurns}
                </div>
                <div className="mt-2">
                  <TrendIndicator value={trends.turns.value} isPositive={trends.turns.isPositive} />
                </div>
              </CardContent>
            </Card>

            {(stats.totalCalls ?? 0) > 0 && (
              <Card className="border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all bg-gradient-to-br from-blue-50/50 to-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Phone Calls</CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm" aria-hidden="true">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold tracking-tight" aria-label={`${(stats.totalCalls ?? 0)} phone calls completed`}>
                    {(stats.totalCalls ?? 0)}
                  </div>
                  {((stats.averageCallScore ?? 0) > 0) && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Avg: {stats.averageCallScore ?? 0}/100
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Performance Insights */}
          {insights.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {insights.map((insight, idx) => (
                <Card 
                  key={idx} 
                  className={`border-l-4 ${
                    insight.type === 'success' ? 'border-l-green-500 bg-green-50/50' :
                    insight.type === 'warning' ? 'border-l-orange-500 bg-orange-50/50' :
                    'border-l-blue-500 bg-blue-50/50'
                  }`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${
                        insight.type === 'success' ? 'bg-green-100' :
                        insight.type === 'warning' ? 'bg-orange-100' :
                        'bg-blue-100'
                      }`}>
                        {insight.icon}
                      </div>
                      <p className="text-sm font-medium text-foreground flex-1">{insight.message}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Charts Row */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Activity Over Time */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Activity Over Time</CardTitle>
                <CardDescription>Training activity breakdown by day</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={activityChartData}>
                    <defs>
                      <linearGradient id="colorScenarios" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorTurns" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="scenarios" stroke="#3b82f6" fillOpacity={1} fill="url(#colorScenarios)" name="Scenarios" />
                    <Area type="monotone" dataKey="turns" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorTurns)" name="Turns" />
                    {(stats.totalCalls ?? 0) > 0 && (
                      <Area type="monotone" dataKey="calls" stroke="#10b981" fillOpacity={1} fill="url(#colorCalls)" name="Calls" />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score Distribution */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle className="text-lg">Score Distribution</CardTitle>
                <CardDescription>Performance score breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {scoreDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
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
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-muted-foreground">No events in this time range</p>
                    <p className="text-xs text-muted-foreground mt-1">Start a scenario to see your activity here</p>
                  </div>
                ) : (
                  filteredEvents.map((event, idx) => {
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
