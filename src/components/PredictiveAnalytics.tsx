'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { analyticsAgent } from '@/infrastructure/agents/analytics-agent';

interface PredictiveInsight {
  type: 'success' | 'warning' | 'info';
  title: string;
  description: string;
  confidence: number;
  recommendation?: string;
}

/**
 * PredictiveAnalytics - Provides predictive insights based on training data
 */
export default function PredictiveAnalytics() {
  const { stats, events } = useAnalytics();
  const [insights, setInsights] = useState<PredictiveInsight[]>([]);

  useEffect(() => {
    if (!stats || !events) return;

    // Use AI analytics agent for intelligent insights
    const generateInsights = async () => {
      try {
        const analysis = await analyticsAgent.generateInsights({
          scenariosStarted: stats.scenariosStarted,
          scenariosCompleted: stats.scenariosCompleted,
          averageScore: stats.averageScore || 0,
          totalTurns: stats.totalTurns || 0,
          events: events.map((e) => ({
            eventType: e.eventType || 'unknown',
            score: e.score,
            scenarioId: e.scenarioId,
            timestamp: e.timestamp || new Date(),
            metadata: e.metadata,
          })),
        });

        // Convert agent insights to component format
        const newInsights: PredictiveInsight[] = analysis.insights.map((i) => ({
          type: i.type,
          title: i.title,
          description: i.description,
          confidence: i.confidence * 100,
          recommendation: i.recommendation,
        }));

        setInsights(newInsights);
      } catch (error) {
        console.error('Analytics agent error:', error);
        // Fallback to rule-based insights
        fallbackInsights();
      }
    };

    // Fallback rule-based insights
    const fallbackInsights = () => {
      const newInsights: PredictiveInsight[] = [];

      // Calculate completion rate
      const completionRate = stats.scenariosCompleted / Math.max(stats.scenariosStarted, 1);
    
    // Success prediction based on completion rate
    if (completionRate >= 0.8) {
      newInsights.push({
        type: 'success',
        title: 'High Success Probability',
        description: `Based on your ${(completionRate * 100).toFixed(0)}% completion rate, you have a strong likelihood of success in real sales scenarios.`,
        confidence: 85,
        recommendation: 'Continue practicing advanced scenarios to maintain your edge.',
      });
    } else if (completionRate < 0.5) {
      newInsights.push({
        type: 'warning',
        title: 'Improvement Needed',
        description: `Your ${(completionRate * 100).toFixed(0)}% completion rate suggests you may need more practice.`,
        confidence: 75,
        recommendation: 'Focus on completing more scenarios and reviewing feedback carefully.',
      });
    }

    // Average score analysis
    const avgScore = stats.averageScore || 0;
    if (avgScore >= 80) {
      newInsights.push({
        type: 'success',
        title: 'Excellent Performance',
        description: `Your average score of ${avgScore.toFixed(0)} indicates strong sales skills.`,
        confidence: 90,
        recommendation: 'Consider mentoring others or tackling more challenging scenarios.',
      });
    } else if (avgScore < 60) {
      newInsights.push({
        type: 'warning',
        title: 'Skill Development Opportunity',
        description: `Your average score of ${avgScore.toFixed(0)} suggests areas for improvement.`,
        confidence: 80,
        recommendation: 'Review feedback from completed scenarios and focus on objection handling.',
      });
    }

    // Trend analysis
    const recentEvents = events.slice(0, 10);
    const recentScores = recentEvents
      .filter((e) => e.score !== undefined)
      .map((e) => e.score!);
    
    if (recentScores.length >= 3) {
      const trend = recentScores[0] - recentScores[recentScores.length - 1];
      if (trend > 10) {
        newInsights.push({
          type: 'success',
          title: 'Improving Trend',
          description: 'Your recent scores show a positive upward trend. Keep it up!',
          confidence: 85,
        });
      } else if (trend < -10) {
        newInsights.push({
          type: 'warning',
          title: 'Declining Performance',
          description: 'Your recent scores show a downward trend. Consider reviewing fundamentals.',
          confidence: 75,
          recommendation: 'Take a break and review your best-performing scenarios.',
        });
      }
    }

    // Skill gap analysis
    const objectionCategories = new Set(
      events
        .filter((e) => e.scenarioId)
        .map((e) => e.metadata?.objection_category)
        .filter(Boolean)
    );

    if (objectionCategories.size < 3 && events.length > 5) {
      newInsights.push({
        type: 'info',
        title: 'Diversify Your Practice',
        description: 'You\'ve focused on limited objection types. Try different scenarios.',
        confidence: 70,
        recommendation: 'Explore scenarios in different objection categories to build comprehensive skills.',
      });
    }

      setInsights(newInsights);
    };

    generateInsights();
  }, [stats, events]);

  if (insights.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4" />
            Predictive Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Complete more scenarios to get predictive insights about your performance.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getIcon = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Target className="h-4 w-4 text-blue-600" />;
    }
  };

  const getColor = (type: PredictiveInsight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Predictive Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getColor(insight.type)}`}
          >
            <div className="flex items-start gap-2 mb-2">
              {getIcon(insight.type)}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium">{insight.title}</h4>
                  <Badge variant="secondary" className="text-xs">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{insight.description}</p>
                {insight.recommendation && (
                  <p className="text-xs font-medium text-foreground">
                    💡 {insight.recommendation}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

