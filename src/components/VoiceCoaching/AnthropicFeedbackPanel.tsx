/**
 * Anthropic Feedback Panel
 * Displays AI-powered feedback and ratings from Claude
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, Star, TrendingUp, Target, Lightbulb, 
  CheckCircle2, AlertCircle, Loader2, RefreshCw
} from 'lucide-react';
import type { VoiceMetrics } from '@/lib/voice-coaching/types';
import type { AnthropicFeedback, AnthropicSessionFeedback } from '@/lib/anthropic/feedback-generator';

interface AnthropicFeedbackPanelProps {
  userId: string;
  currentMetrics?: VoiceMetrics | null;
  previousMetrics?: VoiceMetrics | null;
}

export function AnthropicFeedbackPanel({ 
  userId, 
  currentMetrics, 
  previousMetrics 
}: AnthropicFeedbackPanelProps) {
  const [comprehensiveFeedback, setComprehensiveFeedback] = useState<AnthropicFeedback | null>(null);
  const [sessionFeedback, setSessionFeedback] = useState<AnthropicSessionFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'comprehensive' | 'session'>('comprehensive');

  const loadComprehensiveFeedback = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/voice-coaching/anthropic-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'comprehensive',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load feedback');
      }

      const data = await response.json();
      setComprehensiveFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  const loadSessionFeedback = async () => {
    if (!currentMetrics) {
      setError('Current metrics required for session feedback');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/voice-coaching/anthropic-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          type: 'session',
          currentMetrics,
          previousMetrics,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to load session feedback');
      }

      const data = await response.json();
      setSessionFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load session feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (feedbackType === 'comprehensive' && !comprehensiveFeedback) {
      loadComprehensiveFeedback();
    } else if (feedbackType === 'session' && currentMetrics && !sessionFeedback) {
      loadSessionFeedback();
    }
  }, [feedbackType, currentMetrics]);

  const getRatingColor = (rating: number): string => {
    if (rating >= 80) return 'text-green-600';
    if (rating >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBadgeVariant = (rating: number): 'default' | 'secondary' | 'destructive' => {
    if (rating >= 80) return 'default';
    if (rating >= 60) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <CardTitle>AI-Powered Feedback</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={feedbackType === 'comprehensive' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFeedbackType('comprehensive');
                  if (!comprehensiveFeedback) loadComprehensiveFeedback();
                }}
              >
                Comprehensive
              </Button>
              <Button
                variant={feedbackType === 'session' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setFeedbackType('session');
                  if (currentMetrics && !sessionFeedback) loadSessionFeedback();
                }}
                disabled={!currentMetrics}
              >
                Session
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (feedbackType === 'comprehensive') {
                    loadComprehensiveFeedback();
                  } else {
                    loadSessionFeedback();
                  }
                }}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <CardDescription>
            Personalized feedback and ratings powered by Claude AI
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Generating AI feedback...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <AlertCircle className="h-5 w-5 mx-auto mb-2" />
              {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comprehensive Feedback */}
      {!loading && !error && feedbackType === 'comprehensive' && comprehensiveFeedback && (
        <>
          {/* Overall Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Overall Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={`text-4xl font-bold ${getRatingColor(comprehensiveFeedback.overallRating)}`}>
                    {comprehensiveFeedback.overallRating}
                  </div>
                  <div className="text-sm text-muted-foreground">Out of 100</div>
                </div>
                <Badge variant={getRatingBadgeVariant(comprehensiveFeedback.overallRating)}>
                  {comprehensiveFeedback.overallRating >= 80 ? 'Excellent' : 
                   comprehensiveFeedback.overallRating >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              <Progress value={comprehensiveFeedback.overallRating} className="h-3" />
            </CardContent>
          </Card>

          {/* Rating Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Rating Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(comprehensiveFeedback.ratingBreakdown).map(([metric, rating]) => (
                  <div key={metric} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{metric}</span>
                      <span className={`text-sm font-bold ${getRatingColor(rating)}`}>
                        {rating}
                      </span>
                    </div>
                    <Progress value={rating} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Personalized Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Personalized Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{comprehensiveFeedback.personalizedFeedback}</p>
            </CardContent>
          </Card>

          {/* Strengths */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                Your Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {comprehensiveFeedback.strengths.map((strength, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Areas for Improvement */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-600" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {comprehensiveFeedback.areasForImprovement.map((area, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5" />
                    <span className="text-sm">{area}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Specific Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {comprehensiveFeedback.specificRecommendations.map((rec, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="h-6 w-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm">{rec}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                Next Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {comprehensiveFeedback.nextSteps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm">{step}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Motivational Messages */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <CardHeader>
                <CardTitle className="text-sm">Motivational Message</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic">{comprehensiveFeedback.motivationalMessage}</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-yellow-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-sm">Encouragement</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm italic">{comprehensiveFeedback.encouragement}</p>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Session Feedback */}
      {!loading && !error && feedbackType === 'session' && sessionFeedback && (
        <>
          {/* Session Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-600" />
                Session Rating
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className={`text-4xl font-bold ${getRatingColor(sessionFeedback.sessionRating)}`}>
                    {sessionFeedback.sessionRating}
                  </div>
                  <div className="text-sm text-muted-foreground">Out of 100</div>
                </div>
                <Badge variant={getRatingBadgeVariant(sessionFeedback.sessionRating)}>
                  {sessionFeedback.sessionRating >= 80 ? 'Excellent' : 
                   sessionFeedback.sessionRating >= 60 ? 'Good' : 'Needs Improvement'}
                </Badge>
              </div>
              <Progress value={sessionFeedback.sessionRating} className="h-3" />
            </CardContent>
          </Card>

          {/* Session Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Session Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{sessionFeedback.feedback}</p>
              {sessionFeedback.comparisonToPrevious && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm font-medium mb-1">Comparison to Previous Session:</p>
                  <p className="text-sm">{sessionFeedback.comparisonToPrevious}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strengths & Improvements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sessionFeedback.strengths.map((strength, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-3 w-3 text-green-600 mt-1" />
                      {strength}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-orange-600" />
                  Areas to Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {sessionFeedback.improvements.map((improvement, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-3 w-3 text-orange-600 mt-1" />
                      {improvement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Specific Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Specific Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {sessionFeedback.specificTips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="h-6 w-6 rounded-full bg-yellow-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <span className="text-sm">{tip}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Encouragement */}
          <Card className="bg-gradient-to-br from-green-50 to-yellow-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-sm">Encouragement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm italic">{sessionFeedback.encouragement}</p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

