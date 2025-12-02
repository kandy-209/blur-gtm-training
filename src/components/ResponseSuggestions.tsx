'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Sparkles, Copy, Check } from 'lucide-react';

interface ResponseSuggestion {
  text: string;
  rank: number;
  score: number;
  factors: {
    quality: number;
    relevance: number;
    historicalPerformance?: number;
    personalization: number;
  };
}

interface ResponseSuggestionsProps {
  currentMessage: string;
  objectionCategory: string;
  conversationHistory: Array<{ role: string; message: string }>;
  persona?: {
    name: string;
    currentSolution: string;
    primaryGoal: string;
    skepticism: string;
    tone: string;
  };
  onSelectSuggestion: (suggestion: string) => void;
}

export default function ResponseSuggestions({
  currentMessage,
  objectionCategory,
  conversationHistory,
  persona,
  onSelectSuggestion,
}: ResponseSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<ResponseSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (currentMessage.trim().length > 10) {
      // Debounce to avoid too many API calls
      const timer = setTimeout(() => {
        generateSuggestions();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setSuggestions([]);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMessage]);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/agents/orchestrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflow: 'generate-and-rank',
          input: {
            objection: currentMessage,
            conversationHistory,
            persona: persona || {
              name: 'Generic Prospect',
              currentSolution: 'Current solution',
              primaryGoal: 'Improve productivity',
              skepticism: 'Moderate',
              tone: 'Professional',
            },
            turnNumber: conversationHistory.length + 1,
          },
          context: {
            objectionCategory,
            persona,
          },
        }),
      });

      const data = await response.json();
      if (data.success && data.data?.ranked) {
        setSuggestions(data.data.ranked.slice(0, 3)); // Top 3 suggestions
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  if (loading) {
    return (
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 animate-pulse" />
            Generating suggestions...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <Card className="mt-4 border-gray-200 animate-fade-in">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="h-8 w-8 rounded-lg bg-yellow-100 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-yellow-600" />
          </div>
          AI Response Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {suggestions.map((suggestion, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-xl p-4 space-y-3 hover:border-gray-300 hover:bg-gray-50/50 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm mb-3 leading-relaxed text-foreground">{suggestion.text}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className="text-xs border-gray-300">
                    Score: {Math.round(suggestion.score)}/100
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                    Quality: {Math.round(suggestion.factors.quality)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                    Relevance: {Math.round(suggestion.factors.relevance)}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2 pt-2 border-t border-gray-100">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onSelectSuggestion(suggestion.text)}
                className="flex-1 border-gray-300 hover:bg-gray-50"
              >
                Use this
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleCopy(suggestion.text, idx)}
                className="h-9 w-9 p-0"
              >
                {copiedIndex === idx ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

