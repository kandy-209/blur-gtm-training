'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, BarChart3 } from 'lucide-react';
import { agentCostTracker } from '@/lib/agent-cost-tracker';

/**
 * AgentCostDashboard - Display cost tracking for AI agents
 */
export default function AgentCostDashboard() {
  const [costs, setCosts] = useState<any>(null);

  useEffect(() => {
    const updateCosts = () => {
      const totalCosts = agentCostTracker.getTotalCosts();
      setCosts(totalCosts);
    };

    updateCosts();
    const interval = setInterval(updateCosts, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  if (!costs) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Cost Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No cost data yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          Cost Tracking
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 bg-blue-50 rounded border border-blue-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold">Total Estimated Cost</span>
            <Badge variant="default" className="bg-blue-600">
              ${costs.total.toFixed(4)}
            </Badge>
          </div>
          <div className="text-xs text-muted-foreground">
            {costs.count} API calls tracked
          </div>
        </div>

        {Object.keys(costs.byProvider).length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2">Costs by Provider</h4>
            <div className="space-y-2">
              {Object.entries(costs.byProvider).map(([provider, cost]: [string, any]) => (
                <div key={provider} className="flex items-center justify-between text-xs">
                  <span className="capitalize">{provider}</span>
                  <span className="font-medium">${cost.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="p-2 bg-gray-50 rounded text-xs">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-3 w-3" />
            <span className="font-semibold">Average per Call</span>
          </div>
          <div className="text-muted-foreground">
            ${agentCostTracker.getAverageCost().toFixed(4)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

