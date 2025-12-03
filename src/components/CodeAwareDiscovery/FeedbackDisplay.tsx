'use client';

/**
 * Feedback Display Component
 * Shows actionable feedback from discovery call analysis
 */

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, XCircle, AlertCircle, TrendingUp, MessageSquare } from 'lucide-react';

interface FeedbackAnalysis {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  actionableFeedback: Array<{
    timestamp: string;
    type: 'strength' | 'weakness' | 'opportunity';
    message: string;
    specificMoment: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
    methodology?: string;
  }>;
  talkToListenAnalysis: {
    ratio: number;
    status: 'balanced' | 'rep_dominating' | 'rep_too_quiet';
    recommendation: string;
  };
  objectionHandling: {
    handled: number;
    missed: number;
    quality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    examples: string[];
  };
  discoveryQuestions: {
    asked: number;
    quality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    examples: string[];
    recommendations: string[];
  };
  closingAttempts: {
    attempted: boolean;
    quality: 'excellent' | 'good' | 'needs_improvement' | 'poor';
    recommendation: string;
  };
  managerCoachingPoints: string[];
}

interface FeedbackDisplayProps {
  callId: string;
}

export function FeedbackDisplay({ callId }: FeedbackDisplayProps) {
  const [feedback, setFeedback] = useState<FeedbackAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFeedback();
  }, [callId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/discovery-call/${callId}/feedback`);
      
      if (!response.ok) {
        throw new Error('Failed to load feedback');
      }

      const data = await response.json();
      setFeedback(data.feedback);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="text-center text-gray-500">Loading feedback...</div>
      </Card>
    );
  }

  if (error || !feedback) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-500">{error || 'No feedback available'}</div>
      </Card>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityColor = (quality: string) => {
    if (quality === 'excellent') return 'text-green-600';
    if (quality === 'good') return 'text-blue-600';
    if (quality === 'needs_improvement') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Feedback Analysis</h2>
          <div className={`text-4xl font-bold ${getScoreColor(feedback.overallScore)}`}>
            {feedback.overallScore}/100
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full ${
              feedback.overallScore >= 80 ? 'bg-green-500' :
              feedback.overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${feedback.overallScore}%` }}
          />
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="feedback">Actionable Feedback</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="coaching">Coaching</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          {/* Strengths */}
          {feedback.strengths.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Strengths
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {feedback.strengths.map((strength, idx) => (
                  <li key={idx}>{strength}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Weaknesses */}
          {feedback.weaknesses.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-red-500" />
                Areas for Improvement
              </h3>
              <ul className="list-disc list-inside space-y-1">
                {feedback.weaknesses.map((weakness, idx) => (
                  <li key={idx}>{weakness}</li>
                ))}
              </ul>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="feedback" className="mt-4 space-y-4">
          {feedback.actionableFeedback.map((item, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex items-start gap-3">
                {item.type === 'strength' ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                ) : item.type === 'weakness' ? (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <div className="font-semibold mb-1">{item.message}</div>
                  <div className="text-sm text-gray-600 mb-2">
                    "{item.specificMoment}"
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Recommendation: </span>
                    {item.recommendation}
                  </div>
                  {item.methodology && (
                    <div className="text-xs text-gray-500 mt-1">
                      Methodology: {item.methodology}
                    </div>
                  )}
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  item.impact === 'high' ? 'bg-red-100 text-red-800' :
                  item.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {item.impact} impact
                </span>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="metrics" className="mt-4 space-y-4">
          {/* Talk-to-Listen */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Talk-to-Listen Ratio</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Your speaking time</span>
                <span className="font-semibold">
                  {(feedback.talkToListenAnalysis.ratio * 100).toFixed(0)}%
                </span>
              </div>
              <div className={`text-sm ${
                feedback.talkToListenAnalysis.status === 'balanced' ? 'text-green-600' :
                feedback.talkToListenAnalysis.status === 'rep_dominating' ? 'text-yellow-600' :
                'text-blue-600'
              }`}>
                {feedback.talkToListenAnalysis.recommendation}
              </div>
            </div>
          </Card>

          {/* Objection Handling */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Objection Handling</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Handled</span>
                <span className="font-semibold">{feedback.objectionHandling.handled}</span>
              </div>
              <div className="flex justify-between">
                <span>Missed</span>
                <span className="font-semibold text-red-600">{feedback.objectionHandling.missed}</span>
              </div>
              <div className={`text-sm ${getQualityColor(feedback.objectionHandling.quality)}`}>
                Quality: {feedback.objectionHandling.quality}
              </div>
            </div>
          </Card>

          {/* Discovery Questions */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Discovery Questions
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Questions asked</span>
                <span className="font-semibold">{feedback.discoveryQuestions.asked}</span>
              </div>
              <div className={`text-sm ${getQualityColor(feedback.discoveryQuestions.quality)}`}>
                Quality: {feedback.discoveryQuestions.quality}
              </div>
              {feedback.discoveryQuestions.recommendations.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm font-medium mb-1">Recommendations:</div>
                  <ul className="list-disc list-inside text-sm space-y-1">
                    {feedback.discoveryQuestions.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="coaching" className="mt-4">
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Manager Coaching Points
            </h3>
            <ul className="space-y-2">
              {feedback.managerCoachingPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

