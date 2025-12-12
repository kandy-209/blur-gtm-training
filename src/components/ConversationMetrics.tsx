'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateConversationMetrics, ConversationMessage } from '@/lib/conversation-metrics';
import { TrendingUp, TrendingDown, Minus, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ConversationMetricsProps {
  conversationHistory: ConversationMessage[];
  className?: string;
}

export default function ConversationMetrics({ conversationHistory, className }: ConversationMetricsProps) {
  const [metrics, setMetrics] = useState(calculateConversationMetrics(conversationHistory));

  useEffect(() => {
    setMetrics(calculateConversationMetrics(conversationHistory));
  }, [conversationHistory]);

  const ratioPercent = (metrics.talkToListenRatio.ratio * 100).toFixed(0);
  const statusColor = 
    metrics.talkToListenRatio.status === 'balanced' ? 'bg-green-100 text-green-800 border-green-300' :
    metrics.talkToListenRatio.status === 'rep_dominating' ? 'bg-orange-100 text-orange-800 border-orange-300' :
    'bg-blue-100 text-blue-800 border-blue-300';

  return (
    <Card className={`border-gray-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Conversation Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Talk-to-Listen Ratio */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Talk-to-Listen Ratio</span>
            <Badge className={statusColor}>
              {ratioPercent}%
            </Badge>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                metrics.talkToListenRatio.status === 'balanced' ? 'bg-green-500' :
                metrics.talkToListenRatio.status === 'rep_dominating' ? 'bg-orange-500' :
                'bg-blue-500'
              }`}
              style={{ width: `${ratioPercent}%` }}
            />
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-600">
            {metrics.talkToListenRatio.status === 'balanced' ? (
              <>
                <CheckCircle2 className="h-3 w-3 text-green-600" />
                <span>Balanced conversation</span>
              </>
            ) : metrics.talkToListenRatio.status === 'rep_dominating' ? (
              <>
                <TrendingUp className="h-3 w-3 text-orange-600" />
                <span>You're talking too much - listen more</span>
              </>
            ) : (
              <>
                <TrendingDown className="h-3 w-3 text-blue-600" />
                <span>You could share more value</span>
              </>
            )}
          </div>
          <div className="text-xs text-gray-500 flex justify-between">
            <span>Rep: {metrics.talkToListenRatio.repWordCount} words</span>
            <span>Prospect: {metrics.talkToListenRatio.prospectWordCount} words</span>
          </div>
        </div>

        {/* Questions */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-200">
          <div>
            <div className="text-xs text-gray-600 mb-1">Discovery Questions</div>
            <div className="text-lg font-semibold text-gray-900">
              {metrics.questions.discoveryQuestions}
            </div>
            <div className="text-xs text-gray-500">
              {metrics.questions.discoveryQuestions >= 3 ? (
                <span className="text-green-600">✓ Good</span>
              ) : (
                <span className="text-orange-600">Need more</span>
              )}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Total Questions</div>
            <div className="text-lg font-semibold text-gray-900">
              {metrics.questions.repQuestions}
            </div>
            <div className="text-xs text-gray-500">
              Prospect: {metrics.questions.prospectQuestions}
            </div>
          </div>
        </div>

        {/* Objections */}
        {metrics.objections.detected > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">Objections</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900">
                  {metrics.objections.handled}/{metrics.objections.detected}
                </span>
                <Badge
                  variant={metrics.objections.handled >= metrics.objections.detected ? 'default' : 'secondary'}
                  className={
                    metrics.objections.handled >= metrics.objections.detected
                      ? 'bg-green-600 text-white'
                      : 'bg-orange-500 text-white'
                  }
                >
                  {metrics.objections.handled >= metrics.objections.detected ? 'Handled' : 'Pending'}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Conversation Flow */}
        <div className="pt-2 border-t border-gray-200">
          <div className="text-xs text-gray-600 mb-2">Conversation Flow</div>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500">Rep turns:</span>
              <span className="ml-1 font-semibold text-gray-900">{metrics.conversationFlow.repTurns}</span>
            </div>
            <div>
              <span className="text-gray-500">Prospect turns:</span>
              <span className="ml-1 font-semibold text-gray-900">{metrics.conversationFlow.prospectTurns}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}





