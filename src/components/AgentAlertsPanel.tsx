'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, X, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { agentAlerts } from '@/lib/agent-alerts';
import { agentMonitor } from '@/lib/agent-monitor';

/**
 * AgentAlertsPanel - Real-time alerts for agent issues
 */
export default function AgentAlertsPanel() {
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    const checkAlerts = () => {
      // Get metrics and check for alerts
      const allMetrics = agentMonitor.getAllMetrics();
      const newAlerts: any[] = [];

      Object.entries(allMetrics).forEach(([agentName, metrics]) => {
        const agentAlertsList = agentAlerts.checkAlerts(agentName, {
          errorRate: metrics.failedCalls / metrics.totalCalls,
          averageLatency: metrics.averageDuration,
        });
        newAlerts.push(...agentAlertsList);
      });

      setAlerts(agentAlerts.getActiveAlerts());
    };

    checkAlerts();
    const interval = setInterval(checkAlerts, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Agent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No active alerts</p>
        </CardContent>
      </Card>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Agent Alerts
          <Badge variant="destructive">{alerts.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`p-3 rounded border ${getSeverityColor(alert.severity)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2 flex-1">
                {getSeverityIcon(alert.severity)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold">{alert.agent}</span>
                    <Badge variant="secondary" className="text-xs">
                      {alert.type}
                    </Badge>
                  </div>
                  <p className="text-xs">{alert.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => agentAlerts.resolveAlert(alert.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

