'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { agentMonitor } from '@/lib/agent-monitor';

/**
 * AgentMonitorDashboard - Real-time monitoring for AI agents
 */
export default function AgentMonitorDashboard() {
  const [metrics, setMetrics] = useState<Record<string, any>>({});
  const [recentCalls, setRecentCalls] = useState<any[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      setMetrics(agentMonitor.getAllMetrics());
      setRecentCalls(agentMonitor.getRecentCalls(10));
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  if (Object.keys(metrics).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Agent Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No agent activity yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Agent Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(metrics).map(([agentName, agentMetrics]) => (
          <div key={agentName} className="p-3 bg-gray-50 rounded border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold">{agentName}</h4>
              <Badge variant={agentMetrics.failedCalls > 0 ? 'destructive' : 'default'}>
                {agentMetrics.successfulCalls}/{agentMetrics.totalCalls}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Avg Duration:</span>{' '}
                <span className="font-medium">{agentMetrics.averageDuration.toFixed(0)}ms</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cache Hit:</span>{' '}
                <span className="font-medium">{(agentMetrics.cacheHitRate * 100).toFixed(0)}%</span>
              </div>
              <div>
                <span className="text-muted-foreground">Success Rate:</span>{' '}
                <span className="font-medium">
                  {((agentMetrics.successfulCalls / agentMetrics.totalCalls) * 100).toFixed(0)}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Error Rate:</span>{' '}
                <span className="font-medium">
                  {((agentMetrics.failedCalls / agentMetrics.totalCalls) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}

        {recentCalls.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2">Recent Calls</h4>
            <div className="space-y-1">
              {recentCalls.slice(0, 5).map((call, index) => (
                <div key={index} className="flex items-center gap-2 text-xs">
                  {call.success ? (
                    <CheckCircle className="h-3 w-3 text-green-600" />
                  ) : (
                    <AlertCircle className="h-3 w-3 text-red-600" />
                  )}
                  <span className="flex-1">{call.agentName}</span>
                  <span className="text-muted-foreground">{call.duration.toFixed(0)}ms</span>
                  {call.cacheHit && (
                    <Badge variant="secondary" className="text-xs">Cached</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

