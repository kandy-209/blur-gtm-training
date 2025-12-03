// Database schema and utilities
// Uses production database if Supabase is configured, otherwise falls back to in-memory storage

export interface UserResponse {
  id: string;
  userId: string;
  scenarioId: string;
  turnNumber: number;
  objectionCategory: string;
  userMessage: string;
  aiResponse: string;
  evaluation: 'PASS' | 'FAIL' | 'REJECT';
  confidenceScore: number;
  timestamp: Date;
  keyPointsMentioned: string[];
}

export interface TechnicalQuestion {
  id: string;
  userId: string;
  scenarioId: string;
  question: string;
  category: string;
  timestamp: Date;
  upvotes: number;
}

export interface ResponseAnalytics {
  response: string;
  count: number;
  averageScore: number;
  successRate: number;
  scenarioId: string;
  objectionCategory: string;
}

export interface Feedback {
  id: string;
  type: string;
  subject: string;
  message: string;
  rating: number;
  userId: string;
  email: string;
  timestamp: Date;
}

// Lazy database initialization to prevent SSR timeouts
let dbInstance: any = null;
let dbInitialized = false;

function getDatabase() {
  if (dbInstance) {
    return dbInstance;
  }

  // Check if Supabase is configured
  const hasProductionDBConfig = typeof process !== 'undefined' && 
    process.env.NEXT_PUBLIC_SUPABASE_URL && 
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY);

  if (hasProductionDBConfig) {
    // Try to use production database, fall back to in-memory on error
    try {
      const { db: productionDb } = require('./db-production');
      dbInstance = productionDb;
      if (typeof console !== 'undefined') {
        console.log('✅ Using production database (Supabase)');
      }
      dbInitialized = true;
      return dbInstance;
    } catch (error) {
      console.error('⚠️  Failed to load production database, falling back to in-memory:', error);
      // Fall through to in-memory database
    }
  }

  // Use in-memory database for development
  if (!dbInstance) {
    if (typeof console !== 'undefined' && !dbInitialized) {
      console.warn('⚠️  Using in-memory database. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for production.');
    }

  // In-memory database implementation
  class Database {
    private userResponses: Map<string, UserResponse> = new Map();
    private technicalQuestions: Map<string, TechnicalQuestion> = new Map();
    private responseIndex: Map<string, Set<string>> = new Map();
    private feedback: Map<string, Feedback> = new Map();

    async saveUserResponse(response: Omit<UserResponse, 'id' | 'timestamp'>): Promise<UserResponse> {
      const id = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullResponse: UserResponse = {
        ...response,
        id,
        timestamp: new Date(),
      };

      this.userResponses.set(id, fullResponse);

      const normalizedText = response.userMessage.toLowerCase().trim();
      if (!this.responseIndex.has(normalizedText)) {
        this.responseIndex.set(normalizedText, new Set());
      }
      this.responseIndex.get(normalizedText)!.add(id);

      return fullResponse;
    }

    async getUserResponses(filters?: {
      userId?: string;
      scenarioId?: string;
      objectionCategory?: string;
      limit?: number;
    }): Promise<UserResponse[]> {
      let responses = Array.from(this.userResponses.values());

      if (filters?.userId) {
        responses = responses.filter(r => r.userId === filters.userId);
      }
      if (filters?.scenarioId) {
        responses = responses.filter(r => r.scenarioId === filters.scenarioId);
      }
      if (filters?.objectionCategory) {
        responses = responses.filter(r => r.objectionCategory === filters.objectionCategory);
      }

      responses.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      if (filters?.limit) {
        responses = responses.slice(0, filters.limit);
      }

      return responses;
    }

    async deleteUserResponse(responseId: string): Promise<boolean> {
      const response = this.userResponses.get(responseId);
      if (!response) return false;

      // Remove from responses map
      this.userResponses.delete(responseId);

      // Remove from index
      const normalizedText = response.userMessage.toLowerCase().trim();
      const indexSet = this.responseIndex.get(normalizedText);
      if (indexSet) {
        indexSet.delete(responseId);
        if (indexSet.size === 0) {
          this.responseIndex.delete(normalizedText);
        }
      }

      return true;
    }

    async getTopResponses(options: {
      scenarioId?: string;
      objectionCategory?: string;
      minScore?: number;
      limit?: number;
    }): Promise<ResponseAnalytics[]> {
      let responses = Array.from(this.userResponses.values());

      if (options.scenarioId) {
        responses = responses.filter(r => r.scenarioId === options.scenarioId);
      }
      if (options.objectionCategory) {
        responses = responses.filter(r => r.objectionCategory === options.objectionCategory);
      }
      if (options.minScore !== undefined) {
        responses = responses.filter(r => r.confidenceScore >= options.minScore!);
      }

      const responseGroups = new Map<string, UserResponse[]>();
      responses.forEach(response => {
        const normalized = response.userMessage.toLowerCase().trim();
        if (!responseGroups.has(normalized)) {
          responseGroups.set(normalized, []);
        }
        responseGroups.get(normalized)!.push(response);
      });

      const analytics: ResponseAnalytics[] = Array.from(responseGroups.entries()).map(([text, group]) => {
        const totalCount = group.length;
        const successfulCount = group.filter(r => r.evaluation === 'PASS').length;
        const averageScore = group.reduce((sum, r) => sum + r.confidenceScore, 0) / totalCount;
        const successRate = (successfulCount / totalCount) * 100;

        const canonicalResponse = group.sort((a, b) => 
          b.timestamp.getTime() - a.timestamp.getTime()
        )[0];

        return {
          response: canonicalResponse.userMessage,
          count: totalCount,
          averageScore: Math.round(averageScore),
          successRate: Math.round(successRate * 10) / 10,
          scenarioId: canonicalResponse.scenarioId,
          objectionCategory: canonicalResponse.objectionCategory,
        };
      });

      analytics.sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return b.successRate - a.successRate;
      });

      return options.limit ? analytics.slice(0, options.limit) : analytics;
    }

    async saveTechnicalQuestion(question: Omit<TechnicalQuestion, 'id' | 'timestamp' | 'upvotes'>): Promise<TechnicalQuestion> {
      const id = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullQuestion: TechnicalQuestion = {
        ...question,
        id,
        timestamp: new Date(),
        upvotes: 0,
      };

      this.technicalQuestions.set(id, fullQuestion);
      return fullQuestion;
    }

    async getTechnicalQuestions(filters?: {
      scenarioId?: string;
      category?: string;
      limit?: number;
    }): Promise<TechnicalQuestion[]> {
      let questions = Array.from(this.technicalQuestions.values());

      if (filters?.scenarioId) {
        questions = questions.filter(q => q.scenarioId === filters.scenarioId);
      }
      if (filters?.category) {
        questions = questions.filter(q => q.category === filters.category);
      }

      questions.sort((a, b) => {
        if (b.upvotes !== a.upvotes) return b.upvotes - a.upvotes;
        return b.timestamp.getTime() - a.timestamp.getTime();
      });

      if (filters?.limit) {
        questions = questions.slice(0, filters.limit);
      }

      return questions;
    }

    async upvoteQuestion(questionId: string): Promise<TechnicalQuestion | null> {
      const question = this.technicalQuestions.get(questionId);
      if (!question) return null;

      question.upvotes++;
      this.technicalQuestions.set(questionId, question);
      return question;
    }

    async extractTechnicalQuestions(responseId: string): Promise<void> {
      const response = this.userResponses.get(responseId);
      if (!response) return;

      const questionPattern = /[^.!?]*\?/g;
      const matches = response.userMessage.match(questionPattern);
      
      if (matches && matches.length > 0) {
        for (const match of matches) {
          const trimmed = match.trim();
          if (trimmed.length > 10 && trimmed.length < 500) {
            const technicalKeywords = ['how', 'what', 'why', 'when', 'where', 'does', 'can', 'will', 'api', 'integration', 'security', 'performance', 'scalability', 'deployment', 'configuration'];
            const isTechnical = technicalKeywords.some(keyword => 
              trimmed.toLowerCase().includes(keyword)
            );

            if (isTechnical) {
              await this.saveTechnicalQuestion({
                userId: response.userId,
                scenarioId: response.scenarioId,
                question: trimmed,
                category: response.objectionCategory,
              });
            }
          }
        }
      }
    }

    async getAIInsights(scenarioId: string, objectionCategory: string): Promise<{
      topResponses: ResponseAnalytics[];
      commonQuestions: TechnicalQuestion[];
      averageScore: number;
      successRate: number;
    }> {
      const responses = await this.getUserResponses({ scenarioId, objectionCategory });
      const topResponses = await this.getTopResponses({ 
        scenarioId, 
        objectionCategory,
        minScore: 80,
        limit: 10 
      });
      const commonQuestions = await this.getTechnicalQuestions({ 
        scenarioId,
        category: objectionCategory,
        limit: 10 
      });

      const averageScore = responses.length > 0
        ? responses.reduce((sum, r) => sum + r.confidenceScore, 0) / responses.length
        : 0;

      const successRate = responses.length > 0
        ? (responses.filter(r => r.evaluation === 'PASS').length / responses.length) * 100
        : 0;

      return {
        topResponses,
        commonQuestions,
        averageScore: Math.round(averageScore),
        successRate: Math.round(successRate * 10) / 10,
      };
    }

    async getResourcesByCategory(category: string): Promise<Array<{
      id: string;
      url: string;
      title: string;
      type: string;
      description?: string;
      category: string;
    }>> {
      // In-memory fallback - return empty array for now
      // In production, this would query the resource_links table
      return [];
    }

    async getResponsePerformance(responseId: string): Promise<{
      averageScore: number;
      usageCount: number;
    } | null> {
      const response = this.userResponses.get(responseId);
      if (!response) return null;

      // Find similar responses
      const similarResponses = Array.from(this.userResponses.values()).filter(r =>
        r.userMessage.toLowerCase().trim() === response.userMessage.toLowerCase().trim()
      );

      const averageScore = similarResponses.reduce((sum, r) => sum + r.confidenceScore, 0) / similarResponses.length;
      const usageCount = similarResponses.length;

      return {
        averageScore: Math.round(averageScore),
        usageCount,
      };
    }

    async saveFeedback(feedback: Omit<Feedback, 'id' | 'timestamp'>): Promise<Feedback> {
      const id = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const fullFeedback: Feedback = {
        ...feedback,
        id,
        timestamp: new Date(),
      };
      this.feedback.set(id, fullFeedback);
      return fullFeedback;
    }

    async getFeedback(filters?: {
      userId?: string;
      type?: string;
      limit?: number;
    }): Promise<Feedback[]> {
      let feedbacks = Array.from(this.feedback.values());

      if (filters?.userId) {
        feedbacks = feedbacks.filter(f => f.userId === filters.userId);
      }
      if (filters?.type) {
        feedbacks = feedbacks.filter(f => f.type === filters.type);
      }

      feedbacks.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      if (filters?.limit) {
        feedbacks = feedbacks.slice(0, filters.limit);
      }

      return feedbacks;
    }
  }

    dbInstance = new Database();
  }

  dbInitialized = true;
  return dbInstance;
}

// Export a getter function that lazily initializes the database
export const db = new Proxy({} as any, {
  get(_target, prop) {
    const db = getDatabase();
    const value = db[prop];
    if (typeof value === 'function') {
      return value.bind(db);
    }
    return value;
  }
});
