'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, Activity, Database, Server, Zap, Loader2 } from 'lucide-react';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import { Skeleton } from '@/components/ui/skeleton';

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  checks: {
    database: string;
    redis: string;
    external_apis: string;
  };
  version: string;
  environment: string;
}

interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  total: number;
}

export default function BackendStatusPage() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [ready, setReady] = useState<boolean>(false);
  const [metrics, setMetrics] = useState<string>('');
  const [queueStats, setQueueStats] = useState<Record<string, QueueStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchStatus = async () => {
    setError(null);
    try {
      // Fetch health with timeout
      const healthPromise = fetch('/api/health').then(res => res.json());
      const healthTimeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      );
      const healthData = await Promise.race([healthPromise, healthTimeout]) as HealthStatus;
      setHealth(healthData);

      // Fetch ready with timeout
      try {
        const readyRes = await fetch('/api/ready');
        const readyData = await readyRes.json();
        setReady(readyData.status === 'ready');
      } catch (err) {
        // Ready endpoint might not exist, that's ok
        setReady(false);
      }

      // Fetch metrics (just a sample) with timeout
      try {
        const metricsRes = await fetch('/api/metrics');
        const metricsText = await metricsRes.text();
        setMetrics(metricsText.substring(0, 500)); // First 500 chars
      } catch (err) {
        // Metrics endpoint might not exist, that's ok
        setMetrics('Metrics endpoint not available');
      }

      // Fetch queue stats for each job type
      const jobTypes = ['analyze_company', 'generate_feedback', 'process_analytics', 'send_email', 'generate_persona'];
      const stats: Record<string, QueueStats> = {};
      
      for (const jobType of jobTypes) {
        try {
          const statsRes = await fetch(`/api/jobs/stats/${jobType}`);
          if (statsRes.ok) {
            stats[jobType] = await statsRes.json();
          }
        } catch (error) {
          // Queue might not be initialized, that's ok
        }
      }
      setQueueStats(stats);
    } catch (error) {
      console.error('Failed to fetch status:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch backend status');
    } finally {
      setLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const getStatusBadge = (status: string) => {
    if (status === 'healthy' || status === 'ok') {
      return <Badge className="bg-green-500 text-white"><CheckCircle2 className="h-3 w-3 mr-1" />Healthy</Badge>;
    }
    if (status === 'unavailable') {
      return <Badge variant="secondary"><AlertCircle className="h-3 w-3 mr-1" />Unavailable</Badge>;
    }
    return <Badge className="bg-red-500 text-white"><XCircle className="h-3 w-3 mr-1" />Unhealthy</Badge>;
  };

  if (loading) {
    return (
      <ErrorBoundaryWithContext component="BackendStatusPageLoading">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </ErrorBoundaryWithContext>
    );
  }

  return (
    <ErrorBoundaryWithContext component="BackendStatusPage">
      <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Backend Infrastructure Status</h1>
          <p className="text-muted-foreground mt-2">Real-time monitoring of your world-class backend</p>
        </div>
        <Button onClick={fetchStatus} variant="outline" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            <>
              <Activity className="h-4 w-4 mr-2" />
              Refresh
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-900">Error</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Health Status */}
      {health && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              System Health
            </CardTitle>
            <CardDescription>Overall system status and uptime</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-medium">Status:</span>
              {getStatusBadge(health.status)}
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Uptime:</span>
              <span className="text-muted-foreground">{formatUptime(health.uptime)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Version:</span>
              <Badge variant="outline">{health.version}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-medium">Environment:</span>
              <Badge variant="outline">{health.environment}</Badge>
            </div>
            <div className="pt-4 border-t">
              <h3 className="font-semibold mb-3">Service Checks</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Database
                  </span>
                  {getStatusBadge(health.checks.database)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Redis
                  </span>
                  {getStatusBadge(health.checks.redis)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    External APIs
                  </span>
                  {getStatusBadge(health.checks.external_apis)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Readiness */}
      <Card>
        <CardHeader>
          <CardTitle>Readiness Status</CardTitle>
          <CardDescription>Kubernetes/Docker readiness probe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="font-medium">Status:</span>
            {ready ? (
              <Badge className="bg-green-500 text-white">
                <CheckCircle2 className="h-3 w-3 mr-1" />Ready
              </Badge>
            ) : (
              <Badge className="bg-red-500 text-white">
                <XCircle className="h-3 w-3 mr-1" />Not Ready
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Queue Statistics */}
      {Object.keys(queueStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Job Queue Statistics</CardTitle>
            <CardDescription>Background job processing status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(queueStats).map(([jobType, stats]) => (
                <div key={jobType} className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2 capitalize">{jobType.replace(/_/g, ' ')}</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Waiting:</span>
                      <span className="ml-2 font-medium">{stats.waiting}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Active:</span>
                      <span className="ml-2 font-medium">{stats.active}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Completed:</span>
                      <span className="ml-2 font-medium text-green-600">{stats.completed}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Failed:</span>
                      <span className="ml-2 font-medium text-red-600">{stats.failed}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Delayed:</span>
                      <span className="ml-2 font-medium">{stats.delayed}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <span className="ml-2 font-medium">{stats.total}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Metrics Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Prometheus Metrics</CardTitle>
          <CardDescription>Sample of metrics being exposed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>{metrics || 'Loading metrics...'}</pre>
          </div>
          <div className="mt-4">
            <a
              href="/api/metrics"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View full metrics endpoint →
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
          <CardDescription>Access backend endpoints directly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <a href="/api/health" target="_blank" className="text-blue-600 hover:underline">
              /api/health
            </a>
            <a href="/api/ready" target="_blank" className="text-blue-600 hover:underline">
              /api/ready
            </a>
            <a href="/api/metrics" target="_blank" className="text-blue-600 hover:underline">
              /api/metrics
            </a>
            <a href="/api/v1/health" target="_blank" className="text-blue-600 hover:underline">
              /api/v1/health
            </a>
          </div>
        </CardContent>
      </Card>
      </div>
    </ErrorBoundaryWithContext>
  );
}

