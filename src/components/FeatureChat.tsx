'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Send, Bot, User, Loader2, BookOpen, TrendingUp, Users, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  type?: 'lesson' | 'question' | 'summary';
  options?: Array<{ text: string; action: string }>;
}

interface Lesson {
  id: string;
  title: string;
  content: string;
  keyPoints: string[];
  nextAction?: string;
}

const leadershipLessons: Lesson[] = [
  {
    id: 'intro',
    title: 'Welcome to Leadership ROI Crash Course',
    content: 'Learn how Browserbase features drive measurable business value for engineering leadership. We\'ll cover ROI, metrics, and business impact.',
    keyPoints: ['ROI measurement', 'Business metrics', 'Team productivity'],
    nextAction: 'start_lesson_1'
  },
  {
    id: 'lesson_1',
    title: 'Codebase Understanding - Leadership Value',
    content: 'Codebase-Wide Understanding reduces onboarding time by 30-50% and accelerates feature delivery by 2-3x. This translates to faster time-to-market and lower support costs.',
    keyPoints: [
      '30-50% reduction in onboarding time',
      '2-3x faster feature delivery',
      'Reduced code review cycles',
      'Lower bug rates'
    ],
    nextAction: 'start_lesson_2'
  },
  {
    id: 'lesson_2',
    title: 'Composer Mode - Development Velocity',
    content: 'Composer Mode enables 40-60% faster feature development cycles. Teams ship more features per quarter with higher code quality consistency.',
    keyPoints: [
      '40-60% faster development cycles',
      'More features shipped per quarter',
      'Reduced development costs',
      'Better adherence to team standards'
    ],
    nextAction: 'start_lesson_3'
  },
  {
    id: 'lesson_3',
    title: 'Enterprise Security & Compliance',
    content: 'SOC 2 Type II certification and GDPR compliance enable AI adoption in regulated industries. This unlocks productivity gains while meeting compliance requirements automatically.',
    keyPoints: [
      'SOC 2 Type II certified',
      'GDPR compliant',
      'Enables AI in regulated industries',
      'Faster procurement approval'
    ],
    nextAction: 'summary'
  }
];

const icLessons: Lesson[] = [
  {
    id: 'intro',
    title: 'Welcome to IC Impact Crash Course',
    content: 'Discover how Browserbase features help individual contributors work faster, smarter, and with more confidence. We\'ll cover productivity gains and daily impact.',
    keyPoints: ['Time savings', 'Daily productivity', 'Code quality'],
    nextAction: 'start_lesson_1'
  },
  {
    id: 'lesson_1',
    title: 'Codebase Understanding - IC Productivity',
    content: 'Spend less time reading code, more time writing. No more hunting through multiple files - get instant suggestions based on your codebase patterns. Save 2-3 hours per day on average.',
    keyPoints: [
      '2-3 hours saved per day',
      'No more file hunting',
      'Instant codebase-aware suggestions',
      'Confidence in unfamiliar code'
    ],
    nextAction: 'start_lesson_2'
  },
  {
    id: 'lesson_2',
    title: 'Composer Mode - Feature Development',
    content: 'Turn ideas into code faster than ever. Implement features that would take days in hours. Focus on problem-solving, not boilerplate. Save 4-6 hours per week on complex features.',
    keyPoints: [
      '4-6 hours saved per week',
      'Days of work in hours',
      'Focus on logic, not syntax',
      'Faster experimentation'
    ],
    nextAction: 'start_lesson_3'
  },
  {
    id: 'lesson_3',
    title: 'Chat with Codebase - Get Unstuck Instantly',
    content: 'Ask questions about your codebase in natural language. Find code examples in seconds, understand complex systems faster, and reduce time blocked on questions. Save 1-2 hours per day.',
    keyPoints: [
      '1-2 hours saved per day',
      'Instant answers to questions',
      'Faster debugging',
      'Learn codebase patterns naturally'
    ],
    nextAction: 'summary'
  }
];

export function FeatureChat({ initialRole = 'overview' }: { initialRole?: 'overview' | 'leadership' | 'ic' }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentPath, setCurrentPath] = useState<'leadership' | 'ic' | null>(null);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const startPath = useCallback((path: 'leadership' | 'ic') => {
    setCurrentPath(path);
    setCurrentLessonIndex(0);
    const lessons = path === 'leadership' ? leadershipLessons : icLessons;
    const intro = lessons[0];
    
    if (intro) {
      const initialMessage: Message = {
        role: 'assistant',
        type: 'lesson',
        content: intro.content,
        options: intro.nextAction ? [{ text: 'Start Learning', action: intro.nextAction }] : []
      };
      setMessages([initialMessage]);
    }
  }, []);

  useEffect(() => {
    // Only scroll if there are messages and we're not in the middle of an action
    if (messages.length > 0 && !isLoading) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  }, [messages, isLoading]);

  useEffect(() => {
    // Auto-start based on initialRole - only run once on mount
    if (!hasInitialized) {
      if (initialRole === 'leadership') {
        startPath('leadership');
        setHasInitialized(true);
      } else if (initialRole === 'ic') {
        startPath('ic');
        setHasInitialized(true);
      }
    }
  }, [initialRole, hasInitialized, startPath]);

  const handleAction = async (action: string) => {
    if (!currentPath) return;

    setIsLoading(true);
    const lessons = currentPath === 'leadership' ? leadershipLessons : icLessons;

    if (action === 'summary') {
      // Show summary
      const summaryMessage: Message = {
        role: 'assistant',
        type: 'summary',
        content: `🎉 Congratulations! You've completed the ${currentPath === 'leadership' ? 'Leadership ROI' : 'IC Impact'} crash course.\n\nKey takeaways:\n${lessons.slice(1).map((l, i) => `${i + 1}. ${l.title}`).join('\n')}\n\nYou now understand how Browserbase features create value. Ready to explore specific features?`,
        options: [
          { text: 'Start Over', action: 'restart' },
          { text: 'Explore Features', action: 'explore' }
        ]
      };
      setMessages(prev => [...prev, summaryMessage]);
      setIsLoading(false);
      return;
    }

    if (action === 'restart') {
      const pathToRestart = currentPath;
      setCurrentPath(null);
      setMessages([]);
      setCurrentLessonIndex(0);
      setTimeout(() => {
        if (pathToRestart) {
          startPath(pathToRestart);
        }
      }, 0);
      setIsLoading(false);
      return;
    }

    if (action === 'explore') {
      const exploreMessage: Message = {
        role: 'assistant',
        type: 'question',
        content: 'Great! You can now explore specific features below. Click on any feature card to learn more about its detailed impact and use cases.',
        options: []
      };
      setMessages(prev => [...prev, exploreMessage]);
      setIsLoading(false);
      return;
    }

    // Handle lesson progression
    if (action.startsWith('start_lesson_')) {
      const lessonNum = parseInt(action.replace('start_lesson_', ''));
      const lesson = lessons[lessonNum];
      
      if (lesson) {
        const lessonMessage: Message = {
          role: 'assistant',
          type: 'lesson',
          content: `## ${lesson.title}\n\n${lesson.content}\n\n### Key Points:\n${lesson.keyPoints.map(p => `• ${p}`).join('\n')}`,
          options: lesson.nextAction ? [{ text: 'Continue →', action: lesson.nextAction }] : [{ text: 'Finish', action: 'summary' }]
        };
        setMessages(prev => [...prev, lessonMessage]);
        setCurrentLessonIndex(lessonNum);
      }
    } else if (action === 'next') {
      const nextIndex = currentLessonIndex + 1;
      if (nextIndex < lessons.length) {
        const lesson = lessons[nextIndex];
        const lessonMessage: Message = {
          role: 'assistant',
          type: 'lesson',
          content: `## ${lesson.title}\n\n${lesson.content}\n\n### Key Points:\n${lesson.keyPoints.map(p => `• ${p}`).join('\n')}`,
          options: lesson.nextAction ? [{ text: 'Continue →', action: lesson.nextAction }] : [{ text: 'Finish', action: 'summary' }]
        };
        setMessages(prev => [...prev, lessonMessage]);
        setCurrentLessonIndex(nextIndex);
      }
    }

    setIsLoading(false);
  };

  if (!currentPath) {
    return (
      <Card className="border border-gray-200">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-gray-900" />
            <CardTitle className="text-lg font-semibold">Feature Learning Assistant</CardTitle>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Choose a learning path to get started
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startPath('leadership');
            }}
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                <TrendingUp className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">Leadership ROI Crash Course</h3>
                <p className="text-sm text-gray-600">
                  Learn how Browserbase features drive business value, ROI, and team productivity metrics
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              startPath('ic');
            }}
            className="w-full text-left p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                <Users className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">IC Impact Crash Course</h3>
                <p className="text-sm text-gray-600">
                  Discover how Browserbase features help individual contributors work faster and smarter
                </p>
              </div>
              <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-900 transition-colors" />
            </div>
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-200 flex flex-col" style={{ maxHeight: '600px' }}>
      <CardHeader className="pb-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-gray-900" />
            <CardTitle className="text-lg font-semibold">
              {currentPath === 'leadership' ? 'Leadership ROI' : 'IC Impact'} Crash Course
            </CardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            Lesson {currentLessonIndex + 1} of {currentPath === 'leadership' ? leadershipLessons.length : icLessons.length}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        {/* Messages */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0"
          style={{ maxHeight: '400px' }}
        >
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role === 'assistant' && (
                <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : ''}`}>
                <div
                  className={`rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-gray-900 text-white'
                      : message.type === 'summary'
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 border border-gray-200'
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content.split('\n').map((line, i) => {
                      if (line.startsWith('## ')) {
                        return <h3 key={i} className="font-semibold text-gray-900 mb-2 mt-3 first:mt-0">{line.replace('## ', '')}</h3>;
                      }
                      if (line.startsWith('### ')) {
                        return <h4 key={i} className="font-medium text-gray-800 mb-1 mt-2">{line.replace('### ', '')}</h4>;
                      }
                      if (line.startsWith('• ')) {
                        return <div key={i} className="flex items-start gap-2 mt-1">
                          <CheckCircle2 className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                          <span>{line.replace('• ', '')}</span>
                        </div>;
                      }
                      return <p key={i} className={line.trim() ? 'mb-2' : ''}>{line || '\u00A0'}</p>;
                    })}
                  </div>
                  
                  {message.options && message.options.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-300 space-y-2">
                      {message.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAction(option.action);
                          }}
                          disabled={isLoading}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {option.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {message.role === 'user' && (
                <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0 order-1">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="h-8 w-8 rounded-full bg-gray-900 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <Loader2 className="h-4 w-4 animate-spin text-gray-600" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Progress indicator */}
        {currentPath && (
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-600">
              <span>
                {currentPath === 'leadership' ? 'Leadership ROI' : 'IC Impact'} Path
              </span>
              <button
                onClick={() => {
                  setCurrentPath(null);
                  setMessages([]);
                  setCurrentLessonIndex(0);
                }}
                className="text-gray-600 hover:text-gray-900 underline"
              >
                Change Path
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
