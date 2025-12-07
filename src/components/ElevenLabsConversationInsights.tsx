/**
 * Conversation Insights Component
 * Shows analytics and insights after conversation completion
 */

'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, MessageSquare, Clock, Target, Award, BarChart3 } from 'lucide-react';
import type { ConversationMetrics } from '@/lib/elevenlabs-analytics';

interface ConversationInsightsProps {
  metrics: ConversationMetrics;
  onClose?: () => void;
}

export function ConversationInsights({ metrics, onClose }: ConversationInsightsProps) {
  const durationMinutes = metrics.duration ? Math.floor(metrics.duration / 60000) : 0;
  const durationSeconds = metrics.duration ? Math.floor((metrics.duration % 60000) / 1000) : 0;
  const avgWordsPerMessage = Math.round(metrics.averageWordsPerMessage);
  
  // Calculate engagement score (0-100)
  const engagementScore = Math.min(100, Math.round(
    (metrics.messageCount * 10) + 
    (metrics.totalWords / 10) + 
    (metrics.duration ? metrics.duration / 1000 : 0)
  ));

  // Sentiment distribution
  const sentiment = metrics.sentiment || { positive: 0, neutral: 0, negative: 0 };
  const totalSentiment = sentiment.positive + sentiment.neutral + sentiment.negative;
  const positivePercent = totalSentiment > 0 ? Math.round(sentiment.positive * 100) : 0;
  const neutralPercent = totalSentiment > 0 ? Math.round(sentiment.neutral * 100) : 0;
  const negativePercent = totalSentiment > 0 ? Math.round(sentiment.negative * 100) : 0;

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl border-2 border-purple-200">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              Conversation Insights
            </CardTitle>
            <CardDescription className="mt-1">
              Performance analysis and key takeaways
            </CardDescription>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close insights"
            >
              ×
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Engagement Score */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Engagement</span>
              <Award className="h-4 w-4 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-purple-700">{engagementScore}</div>
            <div className="text-xs text-gray-500 mt-1">out of 100</div>
          </div>

          {/* Duration */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Duration</span>
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-700">
              {durationMinutes}:{String(durationSeconds).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 mt-1">minutes</div>
          </div>

          {/* Messages */}
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Messages</span>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-700">{metrics.messageCount}</div>
            <div className="text-xs text-gray-500 mt-1">
              {metrics.userMessageCount} you, {metrics.assistantMessageCount} AI
            </div>
          </div>

          {/* Words */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Words</span>
              <Target className="h-4 w-4 text-orange-600" />
            </div>
            <div className="text-3xl font-bold text-orange-700">{metrics.totalWords}</div>
            <div className="text-xs text-gray-500 mt-1">avg {avgWordsPerMessage} per message</div>
          </div>
        </div>

        {/* Sentiment Analysis */}
        {totalSentiment > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              Sentiment Analysis
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-green-700">Positive</span>
                  <span className="text-sm text-gray-600">{positivePercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-green-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${positivePercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Neutral</span>
                  <span className="text-sm text-gray-600">{neutralPercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-gray-400 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${neutralPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-red-700">Negative</span>
                  <span className="text-sm text-gray-600">{negativePercent}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-red-500 h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${negativePercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Topics */}
        {metrics.topics && metrics.topics.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Key Topics Discussed</h3>
            <div className="flex flex-wrap gap-2">
              {metrics.topics.map((topic, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 transition-colors"
                >
                  {topic}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Key Phrases */}
        {metrics.keyPhrases && metrics.keyPhrases.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-3">Key Phrases</h3>
            <div className="flex flex-wrap gap-2">
              {metrics.keyPhrases.slice(0, 10).map((phrase, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {phrase}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}




