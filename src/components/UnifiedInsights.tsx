'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { agentOrchestrator } from '@/lib/agent-orchestrator';

interface UnifiedInsightsProps {
  roleplayData?: any;
  analyticsData?: any;
  prospectData?: any;
}

/**
 * UnifiedInsights - Combines insights from all AI agents
 */
export default function UnifiedInsights({
  roleplayData,
  analyticsData,
  prospectData,
}: UnifiedInsightsProps) {
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!roleplayData && !analyticsData && !prospectData) return;

    const generateInsights = async () => {
      setLoading(true);
      try {
        const result = await agentOrchestrator.orchestrateAnalysis(
          {
            userId: 'current-user',
            sessionId: 'current-session',
            timestamp: new Date(),
          },
          {
            roleplayData,
            analyticsData,
            prospectData,
          }
        );
        setInsights(result);
      } catch (error) {
        console.error('Orchestration error:', error);
      } finally {
        setLoading(false);
      }
    };

    generateInsights();
  }, [roleplayData, analyticsData, prospectData]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generating Unified Insights...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Analyzing across all agents...</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights) return null;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          Unified AI Insights
          <Badge className={getPriorityColor(insights.priority)}>
            {insights.priority.toUpperCase()} PRIORITY
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.recommendations && insights.recommendations.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-3 w-3" />
              Cross-Agent Recommendations
            </h4>
            <ul className="space-y-1">
              {insights.recommendations.map((rec: string, index: number) => (
                <li key={index} className="text-xs flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {insights.coaching && (
          <div className="p-2 bg-blue-50 rounded border border-blue-200">
            <div className="text-xs font-semibold mb-1">Coaching Insights</div>
            <div className="text-xs text-muted-foreground">
              Score: {insights.coaching.overallScore || 'N/A'}/100
            </div>
          </div>
        )}

        {insights.analytics && (
          <div className="p-2 bg-purple-50 rounded border border-purple-200">
            <div className="text-xs font-semibold mb-1">Analytics Insights</div>
            <div className="text-xs text-muted-foreground">
              Success Probability: {((insights.analytics.predictions?.successProbability || 0) * 100).toFixed(0)}%
            </div>
          </div>
        )}

        {insights.prospect && (
          <div className="p-2 bg-green-50 rounded border border-green-200">
            <div className="text-xs font-semibold mb-1">Prospect Intelligence</div>
            <div className="text-xs text-muted-foreground">
              Priority: {insights.prospect.overallPriority || 'medium'}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

