'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, TrendingUp, TrendingDown, CheckCircle2, XCircle } from 'lucide-react';
import type { ICPScore } from '@/lib/prospect-intelligence/types';

interface ICPScoreCardProps {
  icpScore: ICPScore;
}

export function ICPScoreCard({ icpScore }: ICPScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          ICP Fit Score
        </CardTitle>
        <CardDescription>
          Ideal Customer Profile compatibility assessment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-4xl font-bold" style={{ color: getScoreColor(icpScore.overallScore) }}>
              {icpScore.overallScore}/10
            </div>
            <div className="text-sm text-gray-600 mt-1">Overall Fit</div>
          </div>
          <Badge className={getPriorityColor(icpScore.priorityLevel)}>
            {icpScore.priorityLevel.toUpperCase()} PRIORITY
          </Badge>
        </div>

        {icpScore.positiveSignals.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-sm">Positive Signals</span>
            </div>
            <ul className="space-y-1">
              {icpScore.positiveSignals.map((signal, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {icpScore.negativeSignals.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-red-600" />
              <span className="font-semibold text-sm">Concerns</span>
            </div>
            <ul className="space-y-1">
              {icpScore.negativeSignals.map((signal, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span>{signal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="pt-2 border-t">
          <div className="text-sm font-semibold mb-2">Recommended Timing</div>
          <div className="text-sm text-gray-600">{icpScore.outreachTiming}</div>
        </div>
      </CardContent>
    </Card>
  );
}








