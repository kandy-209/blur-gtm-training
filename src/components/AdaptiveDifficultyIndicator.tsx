'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Brain, Zap } from 'lucide-react';
import { AdaptiveBehavior } from '@/lib/roleplay-enhancements-advanced';

interface AdaptiveDifficultyIndicatorProps {
  behavior: AdaptiveBehavior;
  className?: string;
}

export default function AdaptiveDifficultyIndicator({ behavior, className }: AdaptiveDifficultyIndicatorProps) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'expert':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'advanced':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-green-100 text-green-800 border-green-300';
    }
  };

  const getEngagementColor = (engagement: string) => {
    switch (engagement) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-red-100 text-red-800';
    }
  };

  const getAdjustmentIcon = (type: string) => {
    switch (type) {
      case 'harder':
        return <TrendingUp className="h-3 w-3" />;
      case 'easier':
        return <TrendingDown className="h-3 w-3" />;
      default:
        return <Minus className="h-3 w-3" />;
    }
  };

  return (
    <Card className={`border-l-4 border-indigo-500 bg-indigo-50 ${className || ''}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-600" />
            <span className="text-sm font-semibold text-indigo-800">Adaptive System</span>
          </div>
          <Badge className={getDifficultyColor(behavior.difficulty)}>
            {behavior.difficulty.toUpperCase()}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="flex items-center justify-between p-2 bg-white rounded">
            <span className="text-gray-600">Responsiveness</span>
            <Badge variant="outline" className="text-xs">
              {behavior.responsiveness}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded">
            <span className="text-gray-600">Skepticism</span>
            <Badge variant="outline" className="text-xs">
              {behavior.skepticism}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded">
            <span className="text-gray-600">Engagement</span>
            <Badge className={getEngagementColor(behavior.engagement)}>
              {behavior.engagement}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-2 bg-white rounded">
            <span className="text-gray-600 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Next Adjustment
            </span>
            <Badge variant="outline" className="text-xs flex items-center gap-1">
              {getAdjustmentIcon(behavior.nextAdjustment.type)}
              {behavior.nextAdjustment.type}
            </Badge>
          </div>
        </div>

        {behavior.nextAdjustment.reason && (
          <div className="p-2 bg-indigo-100 rounded text-xs text-indigo-700">
            <strong>Reason:</strong> {behavior.nextAdjustment.reason}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

