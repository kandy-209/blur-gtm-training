'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { GranularFeedback } from '@/lib/feedback-enhancements';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  BarChart3,
  Award
} from 'lucide-react';

interface GranularFeedbackProps {
  feedback: GranularFeedback;
  onClose?: () => void;
}

export default function GranularFeedbackDisplay({ feedback, onClose }: GranularFeedbackProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getLevelBadge = (level: string) => {
    const colors: Record<string, string> = {
      expert: 'bg-purple-100 text-purple-800 border-purple-300',
      advanced: 'bg-blue-100 text-blue-800 border-blue-300',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      beginner: 'bg-gray-100 text-gray-800 border-gray-300',
    };
    return colors[level] || colors.beginner;
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card className="border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Overall Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Overall Score</div>
              <div className={`text-4xl font-bold ${getScoreColor(feedback.overallScore)}`}>
                {feedback.overallScore}/100
              </div>
            </div>
            {feedback.benchmarkComparison && (
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Percentile</div>
                <div className="text-2xl font-bold">
                  {feedback.benchmarkComparison.percentile}th
                </div>
                <Badge className={feedback.benchmarkComparison.vsAverage === 'above' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                  {feedback.benchmarkComparison.vsAverage === 'above' ? 'Above Average' : 'At Average'}
                </Badge>
              </div>
            )}
          </div>
          <Progress value={feedback.overallScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Skill Scores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Skill Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback.skillScores.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{skill.skill}</span>
                  <Badge className={getLevelBadge(skill.level)}>
                    {skill.level}
                  </Badge>
                </div>
                <span className={`font-bold ${getScoreColor(skill.score)}`}>
                  {skill.score}/100
                </span>
              </div>
              <Progress value={skill.score} className="h-2" />
              <p className="text-sm text-gray-600">{skill.feedback}</p>
              {skill.improvementTips.length > 0 && (
                <div className="ml-4 space-y-1">
                  {skill.improvementTips.slice(0, 2).map((tip, tipIndex) => (
                    <div key={tipIndex} className="text-xs text-gray-500 flex items-start gap-1">
                      <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                      {tip}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Conversation Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversation Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Talk-to-Listen Ratio</div>
              <div className="text-2xl font-bold">
                {feedback.conversationMetrics.talkToListenRatio.toFixed(2)}:1
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {feedback.conversationMetrics.talkToListenRatio > 1.5 
                  ? 'You\'re talking more - listen more'
                  : feedback.conversationMetrics.talkToListenRatio < 0.7
                  ? 'Good balance - keep it up'
                  : 'Balanced conversation'}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Value Prop Mention Rate</div>
              <div className="text-2xl font-bold">
                {feedback.conversationMetrics.valuePropMentionRate.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Key points covered
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Objection Handling</div>
              <div className="text-2xl font-bold">
                {feedback.conversationMetrics.objectionHandlingRate.toFixed(0)}%
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Objections addressed
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feedback.strengths.length > 0 && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800">
                <CheckCircle2 className="h-5 w-5" />
                Strengths
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                    {strength}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {feedback.weaknesses.length > 0 && (
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-800">
                <AlertCircle className="h-5 w-5" />
                Areas for Improvement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {feedback.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm">
                    <TrendingDown className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    {weakness}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Actionable Recommendations */}
      {feedback.actionableRecommendations.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Lightbulb className="h-5 w-5" />
              Actionable Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.actionableRecommendations
              .sort((a, b) => {
                const priorityOrder = { high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
              })
              .map((rec, index) => (
                <div key={index} className="p-3 bg-white rounded border border-blue-200">
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={
                      rec.priority === 'high' 
                        ? 'bg-red-100 text-red-800' 
                        : rec.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }>
                      {rec.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{rec.category}</Badge>
                  </div>
                  <p className="text-sm font-medium mb-1">{rec.recommendation}</p>
                  {rec.example && (
                    <p className="text-xs text-gray-600 italic">Example: {rec.example}</p>
                  )}
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Next Steps */}
      {feedback.nextSteps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Next Steps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {feedback.nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    {index + 1}
                  </div>
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

