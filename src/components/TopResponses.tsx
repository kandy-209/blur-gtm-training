'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MessageSquare, Award } from 'lucide-react';
import MessageFeedbackWidget from '@/components/MessageFeedbackWidget';

interface ResponseAnalytics {
  response: string;
  count: number;
  averageScore: number;
  successRate: number;
  scenarioId: string;
  objectionCategory: string;
}

interface TopResponsesProps {
  scenarioId?: string;
  objectionCategory?: string;
  limit?: number;
}

export default function TopResponses({ scenarioId, objectionCategory, limit = 10 }: TopResponsesProps) {
  const [topResponses, setTopResponses] = useState<ResponseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopResponses = async () => {
      try {
        const params = new URLSearchParams();
        if (scenarioId) params.append('scenarioId', scenarioId);
        if (objectionCategory) params.append('objectionCategory', objectionCategory);
        params.append('limit', String(limit));

        const response = await fetch(`/api/analytics/top-responses?${params}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTopResponses(data.topResponses || []);
      } catch (error) {
        console.error('Failed to fetch top responses:', error);
        // Don't crash - just show empty state
        setTopResponses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopResponses();
  }, [scenarioId, objectionCategory, limit]);

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <Award className="h-5 w-5 text-yellow-500" />
            Top Responses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-5 animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="flex gap-4 pt-2 border-t border-gray-100">
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                  <div className="h-3 bg-gray-200 rounded w-20"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (topResponses.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No responses yet. Be the first to practice!
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Award className="h-5 w-5 text-yellow-500" />
          Top Responses
        </CardTitle>
        <CardDescription className="text-sm">
          Most successful responses from other users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topResponses.map((item, idx) => (
            <div key={idx} className="border border-gray-200 rounded-xl p-5 space-y-3 hover:border-gray-300 transition-smooth hover-lift">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm flex-1 leading-relaxed text-foreground">{item.response}</p>
                <Badge variant="outline" className="ml-2 shrink-0 border-gray-300">
                  #{idx + 1}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1.5">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span className="font-medium">{item.count}</span> uses
                </div>
                <div className="flex items-center gap-1.5">
                  <TrendingUp className="h-3.5 w-3.5" />
                  <span className="font-medium">{item.successRate}%</span> success
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5" />
                  <span className="font-medium">{item.averageScore}/100</span> avg
                </div>
              </div>
              <MessageFeedbackWidget
                messageId={`response_${idx}_${item.scenarioId}`}
                originalMessage={item.response}
                objectionCategory={item.objectionCategory}
                scenarioId={item.scenarioId}
                onFeedbackSubmitted={() => {
                  // Optionally refresh top responses
                }}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

