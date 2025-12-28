'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, Clock, Users } from 'lucide-react';

interface ConversionMetricsData {
  totalConversions: number;
  conversionRate: number;
  averageTimeToConversion: number;
  topScenarios: Array<{
    scenarioId: string;
    scenarioName: string;
    conversions: number;
    conversionRate: number;
  }>;
  funnelData: {
    started: number;
    completed: number;
    converted: number;
  };
}

export default function ConversionMetrics() {
  const [data, setData] = useState<ConversionMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConversionMetrics() {
      try {
        const response = await fetch('/api/analytics/conversion/metrics');
        if (response.ok) {
          const metrics = await response.json();
          setData(metrics);
        }
      } catch (error) {
        console.error('Failed to fetch conversion metrics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchConversionMetrics();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Conversion Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No conversion data available yet.</p>
        </CardContent>
      </Card>
    );
  }

  const funnelDropoff = data.funnelData.started > 0
    ? ((data.funnelData.started - data.funnelData.completed) / data.funnelData.started) * 100
    : 0;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversion Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Total Conversions</div>
              <div className="text-3xl font-bold">{data.totalConversions}</div>
              <div className="text-xs text-muted-foreground mt-1">
                Meetings booked & demos requested
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Conversion Rate</div>
              <div className="text-3xl font-bold">{data.conversionRate.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                Scenarios → Conversions
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Avg. Time to Convert</div>
              <div className="text-3xl font-bold">
                {Math.floor(data.averageTimeToConversion / 60)}m
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {Math.floor(data.averageTimeToConversion % 60)}s average
              </div>
            </div>
            <div className="p-4 border rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Funnel Drop-off</div>
              <div className="text-3xl font-bold">{funnelDropoff.toFixed(1)}%</div>
              <div className="text-xs text-muted-foreground mt-1">
                Started → Completed
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Top Performing Scenarios
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.topScenarios.length > 0 ? (
            <div className="space-y-3">
              {data.topScenarios.map((scenario, index) => (
                <div
                  key={scenario.scenarioId}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{scenario.scenarioName}</div>
                      <div className="text-sm text-muted-foreground">
                        {scenario.conversions} conversions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {scenario.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-xs text-muted-foreground">conversion rate</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No scenario data available yet.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Funnel Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Scenarios Started</span>
              <span className="font-semibold">{data.funnelData.started}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: '100%' }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Scenarios Completed</span>
              <span className="font-semibold">{data.funnelData.completed}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full transition-all"
                style={{
                  width: data.funnelData.started > 0
                    ? `${(data.funnelData.completed / data.funnelData.started) * 100}%`
                    : '0%',
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Conversions</span>
              <span className="font-semibold text-green-600">{data.funnelData.converted}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-700 h-2 rounded-full transition-all"
                style={{
                  width: data.funnelData.started > 0
                    ? `${(data.funnelData.converted / data.funnelData.started) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

