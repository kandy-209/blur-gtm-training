'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, AlertTriangle, Zap, Target, Loader2 } from 'lucide-react';
import { CoachingState } from '@/hooks/useRealTimeCoaching';

interface RealTimeCoachingPanelProps {
  coaching: CoachingState;
  className?: string;
}

export default function RealTimeCoachingPanel({ coaching, className }: RealTimeCoachingPanelProps) {
  if (coaching.isLoading) {
    return (
      <Card className={`border-l-4 border-blue-500 bg-blue-50 shadow-sm ${className || ''}`}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Analyzing...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  const hasContent =
    coaching.opportunities.length > 0 ||
    coaching.suggestions.length > 0 ||
    coaching.warnings.length > 0 ||
    coaching.nextBestAction;

  if (!hasContent) {
    return null;
  }

  return (
    <Card className={`border-l-4 border-blue-500 bg-blue-50 shadow-sm animate-fade-in ${className || ''}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-blue-700">
          <Lightbulb className="h-4 w-4" />
          Real-Time Coaching
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {coaching.opportunities.length > 0 && (
          <div className="p-2 bg-green-100 rounded border border-green-200">
            <div className="font-semibold text-green-800 mb-1 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Opportunities:
            </div>
            {coaching.opportunities.map((opp, idx) => (
              <div key={idx} className="text-green-700 text-xs">• {opp}</div>
            ))}
          </div>
        )}
        
        {coaching.suggestions.length > 0 && (
          <div className="p-2 bg-blue-100 rounded border border-blue-200">
            <div className="font-semibold text-blue-800 mb-1 flex items-center gap-1">
              <Lightbulb className="h-3 w-3" />
              Suggestions:
            </div>
            {coaching.suggestions.map((sug, idx) => (
              <div key={idx} className="text-blue-700 text-xs">• {sug}</div>
            ))}
          </div>
        )}
        
        {coaching.warnings.length > 0 && (
          <div className="p-2 bg-orange-100 rounded border border-orange-200">
            <div className="font-semibold text-orange-800 mb-1 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              Warnings:
            </div>
            {coaching.warnings.map((warn, idx) => (
              <div key={idx} className="text-orange-700 text-xs">• {warn}</div>
            ))}
          </div>
        )}
        
        {coaching.nextBestAction && (
          <div className="p-2 bg-purple-100 rounded border border-purple-200">
            <div className="font-semibold text-purple-800 mb-1 flex items-center gap-1">
              <Target className="h-3 w-3" />
              Next Best Action:
            </div>
            <div className="text-purple-700 text-xs font-medium">{coaching.nextBestAction}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

