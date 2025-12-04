/**
 * ElevenLabs Conversation Analytics
 * Tracks and analyzes conversation data with database integration
 */

import type { MessageEvent, ConversationEvent, AnalyticsEvent } from '@/types/elevenlabs';
import { conversationDB } from './elevenlabs-db';

export interface ConversationMetrics {
  conversationId: string;
  userId?: string;
  scenarioId?: string;
  agentId?: string;
  startTime: Date;
  endTime?: Date;
  duration?: number;
  messageCount: number;
  userMessageCount: number;
  assistantMessageCount: number;
  averageResponseTime?: number;
  totalWords: number;
  averageWordsPerMessage: number;
  sentiment?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topics?: string[];
  keyPhrases?: string[];
}

export interface ConversationAnalytics {
  metrics: ConversationMetrics;
  messages: MessageEvent[];
  events: AnalyticsEvent[];
}

export class ConversationAnalyticsTracker {
  private conversations: Map<string, ConversationAnalytics> = new Map();
  private enableDatabaseSync: boolean = true;

  constructor(enableDatabaseSync: boolean = true) {
    this.enableDatabaseSync = enableDatabaseSync;
  }

  /**
   * Start tracking a conversation
   */
  startConversation(
    conversationId: string,
    userId?: string,
    scenarioId?: string,
    agentId?: string
  ): void {
    const analytics: ConversationAnalytics = {
      metrics: {
        conversationId,
        userId,
        scenarioId,
        agentId,
        startTime: new Date(),
        messageCount: 0,
        userMessageCount: 0,
        assistantMessageCount: 0,
        totalWords: 0,
        averageWordsPerMessage: 0,
      },
      messages: [],
      events: [],
    };

    this.conversations.set(conversationId, analytics);
  }

  /**
   * Track a message
   */
  trackMessage(message: MessageEvent): void {
    const analytics = this.conversations.get(message.conversationId || '');
    if (!analytics) return;

    analytics.messages.push(message);
    analytics.metrics.messageCount++;
    
    if (message.role === 'user') {
      analytics.metrics.userMessageCount++;
    } else {
      analytics.metrics.assistantMessageCount++;
    }

    // Calculate word count
    const wordCount = message.message?.split(/\s+/).length || 0;
    analytics.metrics.totalWords += wordCount;
    analytics.metrics.averageWordsPerMessage = 
      analytics.metrics.totalWords / analytics.metrics.messageCount;

    // Calculate sentiment
    if (message.message) {
      const sentiment = this.calculateSentiment(message.message);
      if (!analytics.metrics.sentiment) {
        analytics.metrics.sentiment = { positive: 0, neutral: 0, negative: 0 };
      }
      analytics.metrics.sentiment[sentiment]++;
    }
  }

  /**
   * Track an event
   */
  trackEvent(event: AnalyticsEvent): void {
    // Extract conversationId from properties if not directly on event
    const conversationId = event.conversationId || event.properties?.conversationId || '';
    const analytics = this.conversations.get(conversationId);
    if (!analytics) return;

    // Ensure event has proper structure
    const normalizedEvent: AnalyticsEvent = {
      ...event,
      type: event.type || event.eventName || 'analytics',
      eventName: event.eventName || event.type,
      properties: event.properties || {},
      timestamp: event.timestamp || Date.now(),
      conversationId: conversationId || event.conversationId
    };

    analytics.events.push(normalizedEvent);
  }

  /**
   * End a conversation and save to database
   */
  async endConversation(conversationId: string): Promise<ConversationMetrics | null> {
    const analytics = this.conversations.get(conversationId);
    if (!analytics) return null;

    analytics.metrics.endTime = new Date();
    analytics.metrics.duration = 
      analytics.metrics.endTime.getTime() - analytics.metrics.startTime.getTime();

    // Calculate final sentiment distribution
    if (analytics.metrics.sentiment) {
      const total = analytics.metrics.sentiment.positive + 
                   analytics.metrics.sentiment.neutral + 
                   analytics.metrics.sentiment.negative;
      if (total > 0) {
        analytics.metrics.sentiment.positive = analytics.metrics.sentiment.positive / total;
        analytics.metrics.sentiment.neutral = analytics.metrics.sentiment.neutral / total;
        analytics.metrics.sentiment.negative = analytics.metrics.sentiment.negative / total;
      }
    }

    // Extract topics and key phrases
    const allText = analytics.messages
      .map(m => m.message)
      .filter(Boolean)
      .join(' ');
    
    if (allText) {
      analytics.metrics.topics = this.extractTopics(allText);
      analytics.metrics.keyPhrases = this.extractKeyPhrases(allText, 10);
    }

    const metrics = { ...analytics.metrics };

    // Save to database if enabled
    if (this.enableDatabaseSync && analytics.metrics.userId) {
      try {
        await conversationDB.saveConversation(
          conversationId,
          analytics.metrics.userId,
          analytics.metrics.scenarioId,
          analytics.metrics.agentId,
          metrics,
          analytics.messages
        );
      } catch (error) {
        console.error('Failed to save conversation to database:', error);
        // Continue even if database save fails
      }
    }

    this.conversations.delete(conversationId);

    return metrics;
  }

  /**
   * Get conversation analytics
   */
  getAnalytics(conversationId: string): ConversationAnalytics | null {
    return this.conversations.get(conversationId) || null;
  }

  /**
   * Get all active conversations
   */
  getActiveConversations(): string[] {
    return Array.from(this.conversations.keys());
  }

  /**
   * Calculate sentiment (enhanced implementation)
   */
  calculateSentiment(text: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'love', 'like', 
      'yes', 'perfect', 'fantastic', 'awesome', 'brilliant', 'outstanding',
      'impressive', 'satisfied', 'pleased', 'happy', 'excited', 'thrilled'
    ];
    const negativeWords = [
      'bad', 'terrible', 'awful', 'hate', 'dislike', 'no', 'worst', 'horrible',
      'disappointed', 'frustrated', 'angry', 'upset', 'concerned', 'worried',
      'problem', 'issue', 'difficult', 'challenging', 'unhappy'
    ];

    const lowerText = text.toLowerCase();
    let positiveCount = 0;
    let negativeCount = 0;

    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) positiveCount += matches.length;
    });

    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) negativeCount += matches.length;
    });

    if (positiveCount > negativeCount * 1.2) return 'positive';
    if (negativeCount > positiveCount * 1.2) return 'negative';
    return 'neutral';
  }

  /**
   * Extract topics from text
   */
  extractTopics(text: string): string[] {
    // Common sales/training topics
    const topicKeywords: Record<string, string[]> = {
      'pricing': ['price', 'cost', 'pricing', 'budget', 'affordable', 'expensive'],
      'features': ['feature', 'functionality', 'capability', 'ability', 'can do'],
      'integration': ['integrate', 'integration', 'connect', 'api', 'webhook'],
      'security': ['security', 'secure', 'privacy', 'data', 'encryption'],
      'support': ['support', 'help', 'assistance', 'service', 'maintenance'],
      'scalability': ['scale', 'scalable', 'growth', 'enterprise', 'large'],
      'performance': ['performance', 'speed', 'fast', 'slow', 'efficient'],
    };

    const lowerText = text.toLowerCase();
    const foundTopics: string[] = [];

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      const found = keywords.some(keyword => lowerText.includes(keyword));
      if (found) {
        foundTopics.push(topic);
      }
    });

    return foundTopics;
  }

  /**
   * Extract key phrases (enhanced implementation)
   */
  extractKeyPhrases(text: string, count: number = 5): string[] {
    // Remove common stop words
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
      'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that',
      'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'what',
      'which', 'who', 'when', 'where', 'why', 'how', 'all', 'each', 'every',
      'some', 'any', 'no', 'not', 'only', 'just', 'more', 'most', 'very',
      'too', 'so', 'than', 'then', 'now', 'here', 'there', 'up', 'down',
      'out', 'off', 'over', 'under', 'again', 'further', 'once', 'about',
      'into', 'through', 'during', 'before', 'after', 'above', 'below'
    ]);

    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));

    // Count word frequencies
    const wordFreq: Record<string, number> = {};
    words.forEach(word => {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    });

    // Extract phrases (2-3 word combinations)
    const phrases: Record<string, number> = {};
    for (let i = 0; i < words.length - 1; i++) {
      const phrase2 = `${words[i]} ${words[i + 1]}`;
      phrases[phrase2] = (phrases[phrase2] || 0) + 1;
      
      if (i < words.length - 2) {
        const phrase3 = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
        phrases[phrase3] = (phrases[phrase3] || 0) + 1;
      }
    }

    // Combine single words and phrases, sort by frequency
    const allTerms = [
      ...Object.entries(wordFreq).map(([word, freq]) => ({ term: word, freq })),
      ...Object.entries(phrases).map(([phrase, freq]) => ({ term: phrase, freq }))
    ];

    return allTerms
      .sort((a, b) => b.freq - a.freq)
      .slice(0, count)
      .map(item => item.term);
  }

  /**
   * Generate conversation summary
   */
  generateSummary(conversationId: string): string | null {
    const analytics = this.conversations.get(conversationId);
    if (!analytics || analytics.messages.length === 0) return null;

    const duration = analytics.metrics.duration 
      ? Math.round(analytics.metrics.duration / 1000) 
      : 0;

    const topics = analytics.metrics.topics?.join(', ') || 'general discussion';
    const keyPhrases = analytics.metrics.keyPhrases?.slice(0, 5).join(', ') || 'none identified';

    return `Conversation Summary:
- Duration: ${duration} seconds
- Messages: ${analytics.metrics.messageCount} (${analytics.metrics.userMessageCount} user, ${analytics.metrics.assistantMessageCount} assistant)
- Average words per message: ${Math.round(analytics.metrics.averageWordsPerMessage)}
- Topics discussed: ${topics}
- Key phrases: ${keyPhrases}`;
  }

  /**
   * Export analytics data
   */
  exportAnalytics(conversationId: string): ConversationAnalytics | null {
    return this.getAnalytics(conversationId);
  }

  /**
   * Get user statistics from database
   */
  async getUserStats(userId: string): Promise<any> {
    if (!this.enableDatabaseSync) {
      return null;
    }

    try {
      return await conversationDB.getUserStats(userId);
    } catch (error) {
      console.error('Failed to get user stats from database:', error);
      return null;
    }
  }
}

// Singleton instance
export const conversationAnalytics = new ConversationAnalyticsTracker();
