'use client';

import { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, ThumbsUp, ExternalLink } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { Skeleton, SkeletonList } from '@/components/ui/skeleton';

interface TechnicalQuestion {
  id: string;
  userId: string;
  scenarioId: string;
  question: string;
  category: string;
  timestamp: Date;
  upvotes: number;
  blogPostUrl?: string;
  blogPostTitle?: string;
}

interface TechnicalQuestionsProps {
  scenarioId?: string;
  category?: string;
  limit?: number;
}

function TechnicalQuestions({ scenarioId, category, limit = 10 }: TechnicalQuestionsProps) {
  const [questions, setQuestions] = useState<TechnicalQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [upvotedIds, setUpvotedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const params = new URLSearchParams();
        if (scenarioId) params.append('scenarioId', scenarioId);
        if (category) params.append('category', category);
        params.append('limit', String(limit));

        const response = await fetch(`/api/questions?${params}`);
        if (!response.ok) {
          // Silently handle errors - API will return empty array
          const data = await response.json().catch(() => ({ questions: [] }));
          setQuestions(data.questions || []);
          return;
        }
        const data = await response.json();
        setQuestions(data.questions || []);
      } catch (error) {
        console.error('Failed to fetch questions:', error);
        // Don't crash - just show empty state
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [scenarioId, category, limit]);

  const handleUpvote = async (questionId: string) => {
    if (upvotedIds.has(questionId)) return;

    try {
      const response = await fetch('/api/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId }),
      });

      if (response.ok) {
        const newUpvotedIds = new Set(Array.from(upvotedIds));
        newUpvotedIds.add(questionId);
        setUpvotedIds(newUpvotedIds);
        setQuestions(questions.map(q => 
          q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q
        ));
      }
    } catch (error) {
      console.error('Failed to upvote:', error);
    }
  };

  if (loading) {
    return (
      <Card className="border-gray-200">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-xl">
            <HelpCircle className="h-5 w-5 text-blue-500" />
            Technical Questions
          </CardTitle>
        </CardHeader>
        <CardContent role="status" aria-live="polite" aria-label="Loading technical questions">
          <SkeletonList items={limit || 5} />
        </CardContent>
      </Card>
    );
  }

  if (questions.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          No technical questions yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          <HelpCircle className="h-5 w-5 text-blue-500" />
          Technical Questions
        </CardTitle>
        <CardDescription className="text-sm">
          Common questions asked by developers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {questions.map((question) => (
            <div key={question.id} className="border border-gray-200 rounded-xl p-5 space-y-3 hover:border-gray-300 transition-smooth hover-lift">
              <p className="text-sm leading-relaxed text-foreground">{question.question}</p>
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                  {question.category}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleUpvote(question.id)}
                  disabled={upvotedIds.has(question.id)}
                  className="flex items-center gap-1.5 h-8"
                >
                  <ThumbsUp className={`h-4 w-4 ${upvotedIds.has(question.id) ? 'fill-current text-blue-600' : ''}`} />
                  <span className="text-xs font-medium">{question.upvotes}</span>
                </Button>
              </div>
              {question.blogPostUrl && (
                <div className="pt-2">
                  <a
                    href={question.blogPostUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 font-medium transition-colors"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    {question.blogPostTitle || 'Read more'}
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default memo(TechnicalQuestions);
