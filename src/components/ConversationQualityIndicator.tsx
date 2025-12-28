'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Zap, Target, MessageSquare } from 'lucide-react';
import { AdvancedConversationMetrics } from '@/lib/roleplay-enhancements-advanced';

interface ConversationQualityIndicatorProps {
  metrics: AdvancedConversationMetrics;
  className?: string;
}

export default function ConversationQualityIndicator({ metrics, className }: ConversationQualityIndicatorProps) {
  const getQualityColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getQualityBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const getTrendIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="h-3 w-3" />;
    if (score < 50) return <TrendingDown className="h-3 w-3" />;
    return <Minus className="h-3 w-3" />;
  };

  const overallQuality = (
    metrics.coherence +
    metrics.relevance +
    metrics.naturalness +
    metrics.valueDelivery +
    metrics.objectionResolution +
    metrics.closingReadiness
  ) / 6;

  return (
    <Card className={`border-l-4 border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 ${className || ''}`}>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-800">Conversation Quality</span>
          </div>
          <Badge className={getQualityBadge(overallQuality)}>
            {overallQuality.toFixed(0)}/100
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Coherence</span>
              <span className={`font-semibold ${getQualityColor(metrics.coherence)}`}>
                {metrics.coherence.toFixed(0)}
              </span>
            </div>
            <Progress value={metrics.coherence} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Relevance</span>
              <span className={`font-semibold ${getQualityColor(metrics.relevance)}`}>
                {metrics.relevance.toFixed(0)}
              </span>
            </div>
            <Progress value={metrics.relevance} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Naturalness</span>
              <span className={`font-semibold ${getQualityColor(metrics.naturalness)}`}>
                {metrics.naturalness.toFixed(0)}
              </span>
            </div>
            <Progress value={metrics.naturalness} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Value Delivery</span>
              <span className={`font-semibold ${getQualityColor(metrics.valueDelivery)}`}>
                {metrics.valueDelivery.toFixed(0)}
              </span>
            </div>
            <Progress value={metrics.valueDelivery} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Objection Resolution</span>
              <span className={`font-semibold ${getQualityColor(metrics.objectionResolution)}`}>
                {metrics.objectionResolution.toFixed(0)}
              </span>
            </div>
            <Progress value={metrics.objectionResolution} className="h-1.5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Target className="h-3 w-3" />
                Closing Readiness
              </span>
              <span className={`font-semibold ${getQualityColor(metrics.closingReadiness)} flex items-center gap-1`}>
                {getTrendIcon(metrics.closingReadiness)}
                {metrics.closingReadiness.toFixed(0)}
              </span>
            </div>
            <Progress value={metrics.closingReadiness} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

