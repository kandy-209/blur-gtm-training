/**
 * Improvement Timeline
 * Visual timeline showing improvement over time
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { TrendData } from '@/lib/voice-coaching/user-model';

interface ImprovementTimelineProps {
  trends: Record<string, TrendData>;
}

export function ImprovementTimeline({ trends }: ImprovementTimelineProps) {
  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Improvement Timeline</CardTitle>
        <CardDescription>
          Track your progress across all sessions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(trends).map(([metric, trend]) => (
            <div key={metric} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{metric}</span>
                  {getTrendIcon(trend.trend)}
                  <Badge variant={trend.trend === 'improving' ? 'default' : 'secondary'}>
                    {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {trend.baseline.toFixed(1)} → {trend.current.toFixed(1)}
                </div>
              </div>

              {/* Timeline Chart */}
              <div className="relative h-24 bg-gray-50 rounded p-2">
                <div className="flex items-end gap-1 h-full">
                  {trend.sessions.map((session, i) => {
                    const maxValue = Math.max(...trend.sessions.map(s => s.value));
                    const minValue = Math.min(...trend.sessions.map(s => s.value));
                    const range = maxValue - minValue || 1;
                    const height = ((session.value - minValue) / range) * 100;

                    return (
                      <div
                        key={i}
                        className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                        style={{
                          height: `${height}%`,
                          minHeight: '4px',
                        }}
                        title={`${session.value.toFixed(1)} - ${new Date(session.date).toLocaleDateString()}`}
                      />
                    );
                  })}
                </div>

                {/* Baseline Line */}
                {(() => {
                  const minValue = Math.min(...trend.sessions.map(s => s.value));
                  const maxValue = Math.max(...trend.sessions.map(s => s.value));
                  const range = maxValue - minValue || 1;
                  const baselinePosition = ((trend.baseline - minValue) / range) * 100;
                  return (
                    <div
                      className="absolute left-0 right-0 border-t-2 border-dashed border-gray-400"
                      style={{
                        bottom: `${baselinePosition}%`,
                      }}
                    />
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

