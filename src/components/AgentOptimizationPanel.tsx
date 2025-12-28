'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Sparkles, TrendingUp, Zap, AlertCircle } from 'lucide-react';
import { agentOptimizer } from '@/lib/agent-optimizer';
import { advancedAgentAnalytics } from '@/lib/agent-analytics-advanced';
import { agentMonitor } from '@/lib/agent-monitor';

/**
 * AgentOptimizationPanel - Shows optimization recommendations
 */
export default function AgentOptimizationPanel() {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const generateRecommendations = () => {
      setLoading(true);
      
      // Get metrics for all agents
      const allMetrics = agentMonitor.getAllMetrics();
      const allRecommendations: any[] = [];

      Object.keys(allMetrics).forEach(agentName => {
        const metrics = allMetrics[agentName];
        const analytics = advancedAgentAnalytics.calculateAnalytics(agentName);
        const recs = agentOptimizer.generateRecommendations({
          agentName,
          ...metrics,
          ...analytics,
        });
        allRecommendations.push(...recs);
      });

      setRecommendations(allRecommendations);
      setLoading(false);
    };

    generateRecommendations();
    const interval = setInterval(generateRecommendations, 30000); // Update every 30s

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Optimization Analysis...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Optimization Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No optimization recommendations at this time. All agents are performing optimally.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cache':
        return <Zap className="h-3 w-3" />;
      case 'rate-limit':
        return <AlertCircle className="h-3 w-3" />;
      default:
        return <TrendingUp className="h-3 w-3" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Optimization Recommendations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recommendations.map((rec, index) => (
          <div
            key={index}
            className={`p-3 rounded border ${getPriorityColor(rec.priority)}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                {getTypeIcon(rec.type)}
                <span className="text-xs font-semibold">{rec.agent}</span>
                <Badge variant="secondary" className="text-xs">
                  {rec.type}
                </Badge>
              </div>
              <Badge className={getPriorityColor(rec.priority)}>
                {rec.priority.toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs mb-1">{rec.recommendation}</p>
            <p className="text-xs text-muted-foreground mb-2">
              Expected: {rec.expectedImpact}
            </p>
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-6"
              onClick={() => {
                // Apply optimization
                console.log('Applying:', rec.action);
              }}
            >
              Apply
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

