'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FeedbackAnalysis, ActionableFeedback } from '@/infrastructure/agents/feedback-agent';
import { CheckCircle2, AlertCircle, Lightbulb, TrendingUp, MessageSquare, Target } from 'lucide-react';

interface EnhancedFeedbackProps {
  feedback: FeedbackAnalysis;
  onClose?: () => void;
  showManagerView?: boolean;
}

export default function EnhancedFeedback({ feedback, onClose, showManagerView = false }: EnhancedFeedbackProps) {
  return (
    <Card className="border-2 border-gray-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            {showManagerView ? 'Manager Coaching Report' : 'Call Analysis'}
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              ×
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Score */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200">
          <div>
            <div className="text-sm text-gray-600 mb-1">Overall Score</div>
            <div className="text-3xl font-bold text-gray-900">{feedback.overallScore}/100</div>
          </div>
          <div className={`text-4xl ${feedback.overallScore >= 80 ? 'text-green-600' : feedback.overallScore >= 60 ? 'text-orange-600' : 'text-red-600'}`}>
            {feedback.overallScore >= 80 ? '✓' : feedback.overallScore >= 60 ? '⚠' : '✗'}
          </div>
        </div>

        {/* Talk-to-Listen Analysis */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Talk-to-Listen Ratio</span>
            </div>
            <Badge
              className={
                feedback.talkToListenAnalysis.status === 'balanced'
                  ? 'bg-green-100 text-green-800 border-green-300'
                  : 'bg-orange-100 text-orange-800 border-orange-300'
              }
            >
              {(feedback.talkToListenAnalysis.ratio * 100).toFixed(0)}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${
                feedback.talkToListenAnalysis.status === 'balanced' ? 'bg-green-500' : 'bg-orange-500'
              }`}
              style={{ width: `${feedback.talkToListenAnalysis.ratio * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600">{feedback.talkToListenAnalysis.recommendation}</p>
        </div>

        {/* Strengths */}
        {feedback.strengths.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-700">Strengths</span>
            </div>
            <ul className="space-y-1 ml-6">
              {feedback.strengths.map((strength, idx) => (
                <li key={idx} className="text-sm text-gray-700 list-disc">
                  {strength}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {feedback.weaknesses.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-700">Areas for Improvement</span>
            </div>
            <ul className="space-y-1 ml-6">
              {feedback.weaknesses.map((weakness, idx) => (
                <li key={idx} className="text-sm text-gray-700 list-disc">
                  {weakness}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Objection Handling */}
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Objection Handling</span>
            </div>
            <Badge
              className={
                feedback.objectionHandling.quality === 'excellent'
                  ? 'bg-green-600 text-white'
                  : feedback.objectionHandling.quality === 'good'
                  ? 'bg-blue-600 text-white'
                  : feedback.objectionHandling.quality === 'needs_improvement'
                  ? 'bg-orange-500 text-white'
                  : 'bg-red-600 text-white'
              }
            >
              {feedback.objectionHandling.quality.replace('_', ' ')}
            </Badge>
          </div>
          <div className="text-xs text-gray-600">
            Handled: {feedback.objectionHandling.handled} | Missed: {feedback.objectionHandling.missed}
          </div>
          {feedback.objectionHandling.examples.length > 0 && (
            <div className="mt-2 space-y-1">
              {feedback.objectionHandling.examples.slice(0, 2).map((example, idx) => (
                <div key={idx} className="text-xs text-gray-700 italic">
                  "{example}"
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Discovery Questions */}
        <div className="space-y-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Discovery Questions</span>
            </div>
            <Badge
              className={
                feedback.discoveryQuestions.quality === 'excellent'
                  ? 'bg-green-600 text-white'
                  : feedback.discoveryQuestions.quality === 'good'
                  ? 'bg-blue-600 text-white'
                  : 'bg-orange-500 text-white'
              }
            >
              {feedback.discoveryQuestions.asked} asked
            </Badge>
          </div>
          <div className="text-xs text-gray-600 mb-2">
            Quality: {feedback.discoveryQuestions.quality.replace('_', ' ')}
          </div>
          {feedback.discoveryQuestions.recommendations.length > 0 && (
            <ul className="space-y-1 ml-4">
              {feedback.discoveryQuestions.recommendations.map((rec, idx) => (
                <li key={idx} className="text-xs text-gray-700 list-disc">
                  {rec}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Actionable Feedback */}
        {feedback.actionableFeedback.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Actionable Moments</span>
            </div>
            <div className="space-y-2">
              {feedback.actionableFeedback.slice(0, 3).map((item, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border ${
                    item.type === 'strength'
                      ? 'bg-green-50 border-green-200'
                      : item.type === 'weakness'
                      ? 'bg-orange-50 border-orange-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <Badge
                      variant="outline"
                      className={
                        item.type === 'strength'
                          ? 'border-green-300 text-green-700'
                          : item.type === 'weakness'
                          ? 'border-orange-300 text-orange-700'
                          : 'border-blue-300 text-blue-700'
                      }
                    >
                      {item.type}
                    </Badge>
                    {item.impact && (
                      <Badge
                        variant="outline"
                        className={
                          item.impact === 'high'
                            ? 'border-red-300 text-red-700'
                            : item.impact === 'medium'
                            ? 'border-orange-300 text-orange-700'
                            : 'border-gray-300 text-gray-700'
                        }
                      >
                        {item.impact} impact
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs font-medium text-gray-900 mb-1">{item.message}</p>
                  {item.specificMoment && (
                    <p className="text-xs text-gray-600 italic mb-1">"{item.specificMoment}"</p>
                  )}
                  <p className="text-xs text-gray-700">{item.recommendation}</p>
                  {item.methodology && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs border-gray-300 text-gray-600">
                        {item.methodology}
                      </Badge>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Manager Coaching Points */}
        {showManagerView && feedback.managerCoachingPoints.length > 0 && (
          <div className="space-y-2 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-semibold text-purple-900">Manager Coaching Points</span>
            </div>
            <ul className="space-y-2">
              {feedback.managerCoachingPoints.map((point, idx) => (
                <li key={idx} className="text-sm text-purple-800 flex items-start gap-2">
                  <span className="text-purple-600 mt-0.5">•</span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}















