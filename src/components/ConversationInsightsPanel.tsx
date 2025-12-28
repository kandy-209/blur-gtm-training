'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Target, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface ConversationInsights {
  strengths: string[];
  opportunities: string[];
  criticalActions: string[];
  nextSteps: string[];
}

interface ConversationInsightsPanelProps {
  insights: ConversationInsights;
  className?: string;
}

export default function ConversationInsightsPanel({ insights, className }: ConversationInsightsPanelProps) {
  const hasContent =
    insights.strengths.length > 0 ||
    insights.opportunities.length > 0 ||
    insights.criticalActions.length > 0 ||
    insights.nextSteps.length > 0;

  if (!hasContent) {
    return null;
  }

  return (
    <Card className={`border-l-4 border-teal-500 bg-teal-50 ${className || ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-teal-800">
          <Lightbulb className="h-4 w-4" />
          Conversation Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {insights.strengths.length > 0 && (
          <div className="p-2 bg-green-100 rounded border border-green-200">
            <div className="font-semibold text-green-800 mb-1 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Strengths:
            </div>
            <ul className="text-green-700 text-xs space-y-1">
              {insights.strengths.map((strength, idx) => (
                <li key={idx}>• {strength}</li>
              ))}
            </ul>
          </div>
        )}

        {insights.opportunities.length > 0 && (
          <div className="p-2 bg-blue-100 rounded border border-blue-200">
            <div className="font-semibold text-blue-800 mb-1 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Opportunities:
            </div>
            <ul className="text-blue-700 text-xs space-y-1">
              {insights.opportunities.map((opp, idx) => (
                <li key={idx}>• {opp}</li>
              ))}
            </ul>
          </div>
        )}

        {insights.criticalActions.length > 0 && (
          <div className="p-2 bg-red-100 rounded border border-red-200">
            <div className="font-semibold text-red-800 mb-1 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Critical Actions:
            </div>
            <ul className="text-red-700 text-xs space-y-1">
              {insights.criticalActions.map((action, idx) => (
                <li key={idx}>• {action}</li>
              ))}
            </ul>
          </div>
        )}

        {insights.nextSteps.length > 0 && (
          <div className="p-2 bg-purple-100 rounded border border-purple-200">
            <div className="font-semibold text-purple-800 mb-1 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Next Steps:
            </div>
            <ul className="text-purple-700 text-xs space-y-1">
              {insights.nextSteps.map((step, idx) => (
                <li key={idx}>• {step}</li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

