'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, MessageSquare, Award, Trash2 } from 'lucide-react';
import MessageFeedbackWidget from '@/components/MessageFeedbackWidget';
import { useAuth } from '@/hooks/useAuth';
import { getUserRole } from '@/lib/permissions';

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
  const { user } = useAuth();
  const [topResponses, setTopResponses] = useState<ResponseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  
  const isAdmin = user ? getUserRole(user) === 'admin' : false;

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

  const handleDeleteResponse = async (response: ResponseAnalytics, index: number) => {
    if (!isAdmin) {
      alert('Only admins can delete top responses');
      return;
    }

    if (!confirm(`Are you sure you want to delete this top response?\n\n"${response.response.substring(0, 100)}${response.response.length > 100 ? '...' : ''}"`)) {
      return;
    }

    setDeletingIndex(index);

    try {
      // Get session token for auth
      const sessionStr = localStorage.getItem('supabase_session');
      const session = sessionStr ? JSON.parse(sessionStr) : null;
      const token = session?.access_token || '';

      const deleteResponse = await fetch('/api/analytics/top-responses', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({
          response: response.response,
          scenarioId: response.scenarioId,
          objectionCategory: response.objectionCategory,
        }),
      });

      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json();
        throw new Error(errorData.error || 'Failed to delete response');
      }

      // Refresh top responses
      const params = new URLSearchParams();
      if (scenarioId) params.append('scenarioId', scenarioId);
      if (objectionCategory) params.append('objectionCategory', objectionCategory);
      params.append('limit', String(limit));

      const refreshResponse = await fetch(`/api/analytics/top-responses?${params}`);
      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        setTopResponses(data.topResponses || []);
      }
    } catch (error: any) {
      console.error('Failed to delete response:', error);
      alert(error.message || 'Failed to delete response. Please try again.');
    } finally {
      setDeletingIndex(null);
    }
  };

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
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="border-gray-300">
                    #{idx + 1}
                  </Badge>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteResponse(item, idx)}
                      disabled={deletingIndex === idx}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Delete this top response (Admin only)"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
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

