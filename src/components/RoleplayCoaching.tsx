'use client';

import { useState, useEffect, useMemo } from 'react';
import { Lightbulb, X, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { coachingAgent } from '@/infrastructure/agents/coaching-agent';
import { advancedPerformanceOptimizer } from '@/lib/performance-optimizer-advanced';

interface CoachingTip {
  type: 'hint' | 'warning' | 'success' | 'info';
  message: string;
  keyword?: string;
  suggestion?: string;
}

interface RoleplayCoachingProps {
  userMessage: string;
  scenario: {
    id: string;
    keyPoints: string[];
    objection_category: string;
  };
  conversationHistory: Array<{ role: string; message: string }>;
}

/**
 * RoleplayCoaching - Provides real-time coaching during role-play
 */
export default function RoleplayCoaching({
  userMessage,
  scenario,
  conversationHistory,
}: RoleplayCoachingProps) {
  const [tips, setTips] = useState<CoachingTip[]>([]);
  const [showTips, setShowTips] = useState(true);

  // Browserbase value proposition keywords
  const browserbaseKeywords = [
    'browserbase',
    'cloud browser',
    'headless browser',
    'browser automation',
    'web scraping',
    'managed browsers',
    'zero infrastructure',
    'patchright',
    'anti-detection',
    'stagehand',
    'agentic workflows',
    'proxy management',
    'enterprise',
    'scalability',
    'roi',
    'cost savings',
    'vm isolation',
    'zero-trust',
  ];

  // Analyze user message for coaching opportunities with AI agent
  useEffect(() => {
    if (!userMessage.trim()) {
      setTips([]);
      return;
    }

    // Use AI coaching agent for intelligent analysis with caching
    const analyzeWithAgent = async () => {
      try {
        // Check cache first
        const cacheKey = `coaching:${scenario.id}:${userMessage.substring(0, 50)}`;
        const cached = advancedPerformanceOptimizer.getCachedResult(cacheKey);
        if (cached) {
          const newTips: CoachingTip[] = cached.suggestions.map((s: any) => ({
            type: s.type,
            message: s.message,
            suggestion: s.suggestion,
            keyword: s.keywords?.[0],
          }));
          setTips(newTips);
          return;
        }

        const startTime = performance.now();
        const analysis = await coachingAgent.analyzeAndCoach({
          userMessage,
          conversationHistory: conversationHistory.map(h => ({
            role: h.role as 'rep' | 'agent',
            message: h.message,
          })),
          scenario: {
            id: scenario.id,
            keyPoints: scenario.keyPoints,
            objection_category: scenario.objection_category,
            persona: {
              name: 'Prospect',
              currentSolution: '',
              primaryGoal: '',
            },
          },
          turnNumber: conversationHistory.length,
        });

        // Convert agent suggestions to tips
        const newTips: CoachingTip[] = analysis.suggestions.map((s) => ({
          type: s.type,
          message: s.message,
          suggestion: s.suggestion,
          keyword: s.keywords?.[0],
        }));

        // Cache result
        advancedPerformanceOptimizer.cacheAgentResult(cacheKey, analysis, 30000); // 30s cache
        
        // Track performance
        const endTime = performance.now();
        advancedPerformanceOptimizer.trackMetrics('coaching', {
          agentCallTime: endTime - startTime,
          componentRenderTime: 0,
          dataProcessingTime: 0,
          totalTime: endTime - startTime,
        });

        setTips(newTips);
      } catch (error) {
        console.error('Coaching agent error:', error);
        // Fallback to rule-based coaching
        fallbackCoaching();
      }
    };

    // Fallback rule-based coaching
    const fallbackCoaching = () => {
      const newTips: CoachingTip[] = [];
      const messageLower = userMessage.toLowerCase();

    // Check for Browserbase keywords
    const foundKeywords = browserbaseKeywords.filter((keyword) =>
      messageLower.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length === 0 && userMessage.length > 20) {
      newTips.push({
        type: 'hint',
        message: "Consider mentioning Browserbase's key value propositions",
        suggestion: 'Try mentioning: cloud browser infrastructure, zero infrastructure overhead, or enterprise scalability',
      });
    }

    // Check for scenario-specific key points
    const missingKeyPoints = scenario.keyPoints.filter((point) => {
      const pointKeywords = point.toLowerCase().split(' ');
      return !pointKeywords.some((keyword) => messageLower.includes(keyword));
    });

    if (missingKeyPoints.length > 0 && conversationHistory.length > 2) {
      newTips.push({
        type: 'info',
        message: `You haven't addressed: ${missingKeyPoints[0]}`,
        suggestion: `Consider discussing: ${missingKeyPoints[0]}`,
      });
    }

    // Check message quality
    if (userMessage.length < 20) {
      newTips.push({
        type: 'warning',
        message: 'Your response is quite short. Consider providing more detail.',
      });
    }

    // Check for competitive positioning
    if (messageLower.includes('puppeteer') || messageLower.includes('playwright')) {
      if (!messageLower.includes('browserbase') && !messageLower.includes('managed')) {
        newTips.push({
          type: 'hint',
          message: 'You mentioned competitors. Highlight Browserbase advantages over self-hosted solutions.',
          suggestion: 'Mention: zero infrastructure overhead, enterprise collaboration, built-in proxy management',
        });
      }
    }

    // Success indicators
    if (foundKeywords.length >= 3) {
      newTips.push({
        type: 'success',
        message: 'Great! You\'re covering multiple Browserbase value propositions.',
      });
    }

      setTips(newTips);
    };

    // Use AI agent for analysis (with debounce)
    const timeoutId = setTimeout(() => {
      analyzeWithAgent();
    }, 500); // Debounce for 500ms

    return () => clearTimeout(timeoutId);
  }, [userMessage, scenario, conversationHistory]);

  if (!showTips || tips.length === 0) {
    return null;
  }

  const getTipIcon = (type: CoachingTip['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'hint':
        return <Lightbulb className="h-4 w-4 text-blue-600" />;
      default:
        return <Lightbulb className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTipColor = (type: CoachingTip['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      case 'hint':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Real-Time Coaching
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowTips(false)}
            className="h-6 w-6 p-0"
            aria-label="Hide coaching tips"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {tips.map((tip, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg border ${getTipColor(tip.type)}`}
          >
            <div className="flex items-start gap-2">
              {getTipIcon(tip.type)}
              <div className="flex-1">
                <p className="text-sm font-medium">{tip.message}</p>
                {tip.suggestion && (
                  <p className="text-xs text-muted-foreground mt-1">{tip.suggestion}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

