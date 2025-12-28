/**
 * Agent Alerts
 * Real-time alerting for agent issues
 */

interface Alert {
  id: string;
  agent: string;
  type: 'error' | 'performance' | 'cost' | 'health';
  severity: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export class AgentAlerts {
  private alerts: Alert[] = [];
  private maxAlerts = 100;
  private thresholds = {
    errorRate: 0.1, // 10%
    latency: 10000, // 10 seconds
    costPerHour: 10, // $10/hour
  };

  /**
   * Check for alerts based on metrics
   */
  checkAlerts(agentName: string, metrics: any): Alert[] {
    const newAlerts: Alert[] = [];

    // Check error rate
    if (metrics.errorRate > this.thresholds.errorRate) {
      newAlerts.push({
        id: `${agentName}-error-${Date.now()}`,
        agent: agentName,
        type: 'error',
        severity: metrics.errorRate > 0.2 ? 'critical' : 'warning',
        message: `High error rate: ${(metrics.errorRate * 100).toFixed(1)}%`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // Check latency
    if (metrics.averageLatency > this.thresholds.latency) {
      newAlerts.push({
        id: `${agentName}-latency-${Date.now()}`,
        agent: agentName,
        type: 'performance',
        severity: metrics.averageLatency > 20000 ? 'critical' : 'warning',
        message: `High latency: ${metrics.averageLatency.toFixed(0)}ms`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // Check cost
    if (metrics.costPerHour && metrics.costPerHour > this.thresholds.costPerHour) {
      newAlerts.push({
        id: `${agentName}-cost-${Date.now()}`,
        agent: agentName,
        type: 'cost',
        severity: metrics.costPerHour > 50 ? 'critical' : 'warning',
        message: `High cost: $${metrics.costPerHour.toFixed(2)}/hour`,
        timestamp: new Date(),
        resolved: false,
      });
    }

    // Add new alerts
    newAlerts.forEach(alert => this.addAlert(alert));

    return newAlerts;
  }

  /**
   * Add alert
   */
  private addAlert(alert: Alert): void {
    // Check if similar alert already exists
    const existing = this.alerts.find(
      a => a.agent === alert.agent && 
           a.type === alert.type && 
           !a.resolved
    );

    if (!existing) {
      this.alerts.push(alert);
      
      // Keep only recent alerts
      if (this.alerts.length > this.maxAlerts) {
        this.alerts.shift();
      }
    }
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(): Alert[] {
    return this.alerts.filter(a => !a.resolved);
  }

  /**
   * Get alerts by agent
   */
  getAlertsByAgent(agentName: string): Alert[] {
    return this.alerts.filter(a => a.agent === agentName);
  }

  /**
   * Resolve alert
   */
  resolveAlert(alertId: string): void {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolved = true;
    }
  }

  /**
   * Clear all alerts
   */
  clearAll(): void {
    this.alerts = [];
  }
}

export const agentAlerts = new AgentAlerts();

