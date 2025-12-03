'use client';

import { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, MessageSquare, Award, Trash2 } from 'lucide-react';
import MessageFeedbackWidget from '@/components/MessageFeedbackWidget';
import { useAuth } from '@/hooks/useAuth';
import { getUserRole } from '@/lib/permissions';
import { Skeleton, SkeletonList } from '@/components/ui/skeleton';

interface ResponseAnalytics {
  response: string;
  count: number;
  averageScore: number;
  successRate: number;
  scenarioId: string;
  objectionCategory: string;
  userOwnsResponse?: boolean; // Whether the current user owns this response
}

interface TopResponsesProps {
  scenarioId?: string;
  objectionCategory?: string;
  limit?: number;
}

function TopResponses({ scenarioId, objectionCategory, limit = 10 }: TopResponsesProps) {
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
        
        // Include user ownership info if user is logged in
        if (user) {
          params.append('includeUserIds', 'true');
        }

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
  }, [scenarioId, objectionCategory, limit, user]);

  const handleDeleteResponse = async (response: ResponseAnalytics, index: number) => {
    if (!user) {
      alert('You must be logged in to delete responses');
      return;
    }

    // Only admins can delete top responses (public-friendly design)
    if (!isAdmin) {
      alert('Only administrators can delete top responses. Please provide feedback instead.');
      return;
    }

    const deleteMessage = isAdmin 
      ? `Are you sure you want to delete this top response? This will delete ALL instances of this response.\n\n"${response.response.substring(0, 100)}${response.response.length > 100 ? '...' : ''}"`
      : `Are you sure you want to delete your response?\n\n"${response.response.substring(0, 100)}${response.response.length > 100 ? '...' : ''}"`;

    if (!confirm(deleteMessage)) {
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
          deleteOwnOnly: !isAdmin, // Non-admins can only delete their own
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
      if (user) {
        params.append('includeUserIds', 'true');
      }

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
        <CardContent role="status" aria-live="polite" aria-label="Loading top responses">
          <SkeletonList items={limit || 5} />
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Award className="h-5 w-5 text-yellow-500" />
              Top Responses
            </CardTitle>
            <CardDescription className="text-sm">
              Most successful responses from other users
            </CardDescription>
          </div>
          {isAdmin && topResponses.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!confirm('Are you sure you want to delete the top 2 responses? This will delete ALL instances of these responses.')) {
                    return;
                  }

                  try {
                    const sessionStr = localStorage.getItem('supabase_session');
                    const session = sessionStr ? JSON.parse(sessionStr) : null;
                    const token = session?.access_token || '';

                    const response = await fetch('/api/analytics/top-responses/delete-top', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                      },
                      body: JSON.stringify({
                        count: 2,
                        scenarioId,
                        objectionCategory,
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to delete top responses');
                    }

                    const data = await response.json();
                    alert(`Successfully deleted ${data.deletedCount} response(s)`);

                    // Refresh top responses
                    const params = new URLSearchParams();
                    if (scenarioId) params.append('scenarioId', scenarioId);
                    if (objectionCategory) params.append('objectionCategory', objectionCategory);
                    params.append('limit', String(limit));
                    if (user) {
                      params.append('includeUserIds', 'true');
                    }

                    const refreshResponse = await fetch(`/api/analytics/top-responses?${params}`);
                    if (refreshResponse.ok) {
                      const refreshData = await refreshResponse.json();
                      setTopResponses(refreshData.topResponses || []);
                    }
                  } catch (error: any) {
                    console.error('Failed to delete top responses:', error);
                    alert(error.message || 'Failed to delete top responses. Please try again.');
                  }
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Top 2
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  if (!confirm('⚠️ WARNING: This will delete ALL responses in the system. This action cannot be undone. Are you absolutely sure?')) {
                    return;
                  }
                  
                  if (!confirm('This is your last chance. This will permanently delete ALL responses. Continue?')) {
                    return;
                  }

                  try {
                    const sessionStr = localStorage.getItem('supabase_session');
                    const session = sessionStr ? JSON.parse(sessionStr) : null;
                    const token = session?.access_token || '';

                    const response = await fetch('/api/admin/clear-responses', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                        ...(token && { 'Authorization': `Bearer ${token}` }),
                      },
                      body: JSON.stringify({
                        confirm: 'CLEAR_ALL_RESPONSES',
                      }),
                    });

                    if (!response.ok) {
                      const errorData = await response.json();
                      throw new Error(errorData.error || 'Failed to clear responses');
                    }

                    const data = await response.json();
                    alert(`Successfully cleared ${data.deletedCount} response(s)`);

                    // Refresh top responses
                    const params = new URLSearchParams();
                    if (scenarioId) params.append('scenarioId', scenarioId);
                    if (objectionCategory) params.append('objectionCategory', objectionCategory);
                    params.append('limit', String(limit));
                    if (user) {
                      params.append('includeUserIds', 'true');
                    }

                    const refreshResponse = await fetch(`/api/analytics/top-responses?${params}`);
                    if (refreshResponse.ok) {
                      const refreshData = await refreshResponse.json();
                      setTopResponses(refreshData.topResponses || []);
                    }
                  } catch (error: any) {
                    console.error('Failed to clear responses:', error);
                    alert(error.message || 'Failed to clear responses. Please try again.');
                  }
                }}
                className="text-red-700 hover:text-red-800 hover:bg-red-100 border-red-300 font-semibold"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          )}
        </div>
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
                  {/* Only admins can delete top responses (public-friendly) */}
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

export default memo(TopResponses);

