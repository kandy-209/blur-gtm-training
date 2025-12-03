'use client';

import { useState } from 'react';
import ConversationMetrics from '@/components/ConversationMetrics';
import EnhancedFeedback from '@/components/EnhancedFeedback';
import { FeedbackAnalysis } from '@/infrastructure/agents/feedback-agent';

export default function TestFeedbackPage() {
  const [showMetrics, setShowMetrics] = useState(true);
  const [showFeedback, setShowFeedback] = useState(false);

  const testConversation = [
    { role: 'rep' as const, message: 'Hello, how are you?', timestamp: new Date() },
    { role: 'agent' as const, message: 'I am doing well, thank you.', timestamp: new Date() },
    { role: 'rep' as const, message: 'What challenges are you facing?', timestamp: new Date() },
    { role: 'agent' as const, message: 'We have concerns about pricing.', timestamp: new Date() },
    { role: 'rep' as const, message: 'I understand. Let me explain our value proposition.', timestamp: new Date() },
  ];

  const testFeedback: FeedbackAnalysis = {
    overallScore: 85,
    strengths: ['Good talk-to-listen ratio', 'Asked discovery questions'],
    weaknesses: ['Could improve objection handling'],
    actionableFeedback: [
      {
        timestamp: new Date().toISOString(),
        type: 'strength',
        message: 'Good discovery question',
        specificMoment: 'What challenges are you facing?',
        impact: 'high',
        recommendation: 'Continue asking open-ended questions',
      },
    ],
    talkToListenAnalysis: {
      ratio: 0.55,
      status: 'balanced',
      recommendation: 'Great balance! Continue listening actively.',
    },
    objectionHandling: {
      handled: 1,
      missed: 0,
      quality: 'good',
      examples: ['Addressed pricing concern'],
    },
    discoveryQuestions: {
      asked: 2,
      quality: 'good',
      examples: ['What challenges are you facing?'],
      recommendations: ['Ask more about impact'],
    },
    closingAttempts: {
      attempted: false,
      quality: 'needs_improvement',
      recommendation: 'Try asking for next steps',
    },
    managerCoachingPoints: [
      'Continue asking discovery questions',
      'Work on objection handling techniques',
    ],
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Feedback System Test Page</h1>
      
      <div className="space-y-6">
        <div className="flex gap-4">
          <button
            onClick={() => setShowMetrics(!showMetrics)}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            {showMetrics ? 'Hide' : 'Show'} Conversation Metrics
          </button>
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            {showFeedback ? 'Hide' : 'Show'} Enhanced Feedback
          </button>
        </div>

        {showMetrics && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Conversation Metrics</h2>
            <ConversationMetrics conversationHistory={testConversation} />
          </div>
        )}

        {showFeedback && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Enhanced Feedback</h2>
            <EnhancedFeedback
              feedback={testFeedback}
              onClose={() => setShowFeedback(false)}
              showManagerView={true}
            />
          </div>
        )}
      </div>
    </div>
  );
}

