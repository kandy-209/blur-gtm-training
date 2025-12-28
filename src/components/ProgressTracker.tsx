'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Scenario } from '@/types/roleplay';
import { ConversationContext } from '@/lib/roleplay-enhancements';

interface ProgressTrackerProps {
  context: ConversationContext;
  scenario: Scenario;
  className?: string;
}

export default function ProgressTracker({ context, scenario, className }: ProgressTrackerProps) {
  const keyPointsCovered = context.keyPointsMentioned.length;
  const totalKeyPoints = scenario.keyPoints.length;
  const coveragePercentage = totalKeyPoints > 0 ? (keyPointsCovered / totalKeyPoints) * 100 : 0;

  return (
    <Card className={`border-l-4 border-emerald-500 bg-emerald-50 ${className || ''}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-emerald-600" />
            <span className="text-sm font-semibold text-emerald-800">Progress Tracker</span>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
            Turn {context.turnNumber}
          </Badge>
        </div>

        <div className="space-y-2">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Key Points Coverage</span>
              <span className="text-xs font-semibold text-emerald-700">
                {keyPointsCovered}/{totalKeyPoints} ({coveragePercentage.toFixed(0)}%)
              </span>
            </div>
            <Progress value={coveragePercentage} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Progress to Close</span>
              <span className="text-xs font-semibold text-emerald-700">
                {context.progressToClose.toFixed(0)}%
              </span>
            </div>
            <Progress value={context.progressToClose} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">Engagement Level</span>
              <span className="text-xs font-semibold text-emerald-700">
                {context.engagementLevel.toFixed(0)}%
              </span>
            </div>
            <Progress value={context.engagementLevel} className="h-2" />
          </div>
        </div>

        <div className="pt-2 border-t border-emerald-200">
          <div className="text-xs font-semibold text-emerald-800 mb-2">Key Points Status:</div>
          <div className="space-y-1">
            {scenario.keyPoints.slice(0, 3).map((kp, idx) => {
              const isMentioned = context.keyPointsMentioned.includes(kp);
              return (
                <div key={idx} className="flex items-center gap-2 text-xs">
                  {isMentioned ? (
                    <CheckCircle2 className="h-3 w-3 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-3 w-3 text-gray-400 flex-shrink-0" />
                  )}
                  <span className={isMentioned ? 'text-green-700 line-through' : 'text-gray-600'}>
                    {kp.length > 40 ? `${kp.substring(0, 40)}...` : kp}
                  </span>
                </div>
              );
            })}
            {scenario.keyPoints.length > 3 && (
              <div className="text-xs text-gray-500 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                +{scenario.keyPoints.length - 3} more
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

