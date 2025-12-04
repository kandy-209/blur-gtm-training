/**
 * Metrics Comparison Chart
 * Visual comparison of user metrics vs benchmarks
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { VoiceMetrics } from '@/lib/voice-coaching/types';

interface MetricsComparisonChartProps {
  userMetrics: VoiceMetrics;
  benchmarkMetrics?: Partial<VoiceMetrics>;
  topPerformerMetrics?: Partial<VoiceMetrics>;
}

export function MetricsComparisonChart({
  userMetrics,
  benchmarkMetrics,
  topPerformerMetrics,
}: MetricsComparisonChartProps) {
  const metrics = ['pace', 'volume', 'clarity', 'confidence'] as const;
  
  const getOptimalRange = (metric: string): { min: number; max: number } => {
    const ranges: Record<string, { min: number; max: number }> = {
      pace: { min: 140, max: 180 },
      volume: { min: -18, max: -6 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
    };
    return ranges[metric] || { min: 0, max: 100 };
  };

  const formatValue = (metric: string, value: number): string => {
    switch (metric) {
      case 'pace':
        return `${value} WPM`;
      case 'volume':
        return `${value} dB`;
      case 'clarity':
      case 'confidence':
        return `${value}/100`;
      default:
        return String(value);
    }
  };

  const getScore = (metric: string, value: number): number => {
    const range = getOptimalRange(metric);
    if (value >= range.min && value <= range.max) return 100;
    
    const distance = value < range.min 
      ? range.min - value 
      : value - range.max;
    const maxDistance = range.max - range.min;
    return Math.max(0, 100 - (distance / maxDistance) * 100);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Metrics Comparison</CardTitle>
        <CardDescription>
          Compare your performance against benchmarks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {metrics.map((metric) => {
            const userValue = userMetrics[metric];
            const benchmarkValue = benchmarkMetrics?.[metric];
            const topValue = topPerformerMetrics?.[metric];
            const range = getOptimalRange(metric);
            const userScore = getScore(metric, userValue);

            return (
              <div key={metric} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">{metric}</span>
                  <Badge variant={userScore >= 80 ? 'default' : userScore >= 60 ? 'secondary' : 'destructive'}>
                    {userScore.toFixed(0)}%
                  </Badge>
                </div>

                {/* Visual Comparison */}
                <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
                  {/* Optimal Range */}
                  <div
                    className="absolute h-full bg-green-200 opacity-30"
                    style={{
                      left: `${((range.min / 200) * 100)}%`,
                      width: `${((range.max - range.min) / 200) * 100}%`,
                    }}
                  />

                  {/* User Value */}
                  <div
                    className="absolute h-full bg-blue-600 rounded"
                    style={{
                      left: `${((userValue / 200) * 100)}%`,
                      width: '4px',
                      transform: 'translateX(-50%)',
                    }}
                    title={`You: ${formatValue(metric, userValue)}`}
                  />

                  {/* Benchmark */}
                  {benchmarkValue && (
                    <div
                      className="absolute h-full bg-yellow-500 rounded"
                      style={{
                        left: `${((benchmarkValue / 200) * 100)}%`,
                        width: '4px',
                        transform: 'translateX(-50%)',
                        top: '50%',
                        height: '50%',
                      }}
                      title={`Benchmark: ${formatValue(metric, benchmarkValue)}`}
                    />
                  )}

                  {/* Top Performer */}
                  {topValue && (
                    <div
                      className="absolute h-full bg-purple-500 rounded"
                      style={{
                        left: `${((topValue / 200) * 100)}%`,
                        width: '4px',
                        transform: 'translateX(-50%)',
                        top: '0%',
                        height: '50%',
                      }}
                      title={`Top Performer: ${formatValue(metric, topValue)}`}
                    />
                  )}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>You: {formatValue(metric, userValue)}</span>
                  <div className="flex gap-4">
                    {benchmarkValue && (
                      <span>Benchmark: {formatValue(metric, benchmarkValue)}</span>
                    )}
                    {topValue && (
                      <span>Top: {formatValue(metric, topValue)}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-200 rounded" />
            <span>Optimal Range</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-600 rounded" />
            <span>Your Performance</span>
          </div>
          {benchmarkMetrics && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded" />
              <span>Benchmark</span>
            </div>
          )}
          {topPerformerMetrics && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span>Top Performer</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

