// Production database implementation using Supabase
// This file will be used when SUPABASE environment variables are set

import { createClient } from '@supabase/supabase-js';
import type { UserResponse, TechnicalQuestion, ResponseAnalytics, Feedback } from './db';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
// Support both SUPABASE_KEY and SUPABASE_SERVICE_ROLE_KEY for flexibility
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY;

// Initialize Supabase client only if credentials are available
// This prevents errors during build/SSR if env vars are missing
let supabase: ReturnType<typeof createClient> | null = null;

if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (error) {
    console.error('Failed to initialize Supabase client:', error);
    supabase = null;
  }
}

export class ProductionDatabase {
  private ensureSupabase() {
    if (!supabase) {
      throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    }
    return supabase;
  }

  // User Responses
  async saveUserResponse(response: Omit<UserResponse, 'id' | 'timestamp'>): Promise<UserResponse> {
    const client = this.ensureSupabase();
    const id = `resp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullResponse: UserResponse = {
      ...response,
      id,
      timestamp: new Date(),
    };

    const { error } = await client
      .from('user_responses')
      .insert({
        id: fullResponse.id,
        user_id: fullResponse.userId,
        scenario_id: fullResponse.scenarioId,
        turn_number: fullResponse.turnNumber,
        objection_category: fullResponse.objectionCategory,
        user_message: fullResponse.userMessage,
        ai_response: fullResponse.aiResponse,
        evaluation: fullResponse.evaluation,
        confidence_score: fullResponse.confidenceScore,
        key_points_mentioned: fullResponse.keyPointsMentioned,
        created_at: fullResponse.timestamp.toISOString(),
      } as any);

    if (error) {
      console.error('Error saving user response:', error);
      throw error;
    }

    return fullResponse;
  }

  async getUserResponses(filters?: {
    userId?: string;
    scenarioId?: string;
    objectionCategory?: string;
    limit?: number;
  }): Promise<UserResponse[]> {
    const client = this.ensureSupabase();
    let query = client
      .from('user_responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.userId) {
      query = query.eq('user_id', filters.userId);
    }
    if (filters?.scenarioId) {
      query = query.eq('scenario_id', filters.scenarioId);
    }
    if (filters?.objectionCategory) {
      query = query.eq('objection_category', filters.objectionCategory);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching user responses:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      scenarioId: row.scenario_id,
      turnNumber: row.turn_number,
      objectionCategory: row.objection_category,
      userMessage: row.user_message,
      aiResponse: row.ai_response,
      evaluation: row.evaluation,
      confidenceScore: row.confidence_score,
      timestamp: new Date(row.created_at),
      keyPointsMentioned: row.key_points_mentioned || [],
    }));
  }

  async getTopResponses(options: {
    scenarioId?: string;
    objectionCategory?: string;
    minScore?: number;
    limit?: number;
  }): Promise<ResponseAnalytics[]> {
    // Fetch responses and aggregate in memory
    // For better performance with large datasets, use the SQL function from migrate-database.sql
    const responses = await this.getUserResponses({
      scenarioId: options.scenarioId,
      objectionCategory: options.objectionCategory,
      limit: 1000,
    });

    let filtered = options.minScore !== undefined
      ? responses.filter(r => r.confidenceScore >= options.minScore!)
      : responses;

    const responseGroups = new Map<string, UserResponse[]>();
    filtered.forEach(response => {
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

  // Technical Questions
  async saveTechnicalQuestion(question: Omit<TechnicalQuestion, 'id' | 'timestamp' | 'upvotes'>): Promise<TechnicalQuestion> {
    const client = this.ensureSupabase();
    const id = `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullQuestion: TechnicalQuestion = {
      ...question,
      id,
      timestamp: new Date(),
      upvotes: 0,
    };

    const { error } = await client
      .from('technical_questions')
      .insert({
        id: fullQuestion.id,
        user_id: fullQuestion.userId,
        scenario_id: fullQuestion.scenarioId,
        question: fullQuestion.question,
        category: fullQuestion.category,
        upvotes: fullQuestion.upvotes,
        created_at: fullQuestion.timestamp.toISOString(),
      } as any);

    if (error) {
      console.error('Error saving technical question:', error);
      throw error;
    }

    return fullQuestion;
  }

  async getTechnicalQuestions(filters?: {
    scenarioId?: string;
    category?: string;
    limit?: number;
  }): Promise<TechnicalQuestion[]> {
    const client = this.ensureSupabase();
    let query = client
      .from('technical_questions')
      .select('*')
      .order('upvotes', { ascending: false })
      .order('created_at', { ascending: false });

    if (filters?.scenarioId) {
      query = query.eq('scenario_id', filters.scenarioId);
    }
    if (filters?.category) {
      query = query.eq('category', filters.category);
    }
    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching technical questions:', error);
      throw error;
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      scenarioId: row.scenario_id,
      question: row.question,
      category: row.category,
      timestamp: new Date(row.created_at),
      upvotes: row.upvotes,
    }));
  }

  async upvoteQuestion(questionId: string): Promise<TechnicalQuestion | null> {
    const client = this.ensureSupabase();
    const { data: question, error: fetchError } = await (client
      .from('technical_questions')
      .select('*')
      .eq('id', questionId)
      .single() as any);

    if (fetchError || !question) {
      return null;
    }

    const { error } = await ((client as any)
      .from('technical_questions')
      .update({ upvotes: question.upvotes + 1 })
      .eq('id', questionId));

    if (error) {
      console.error('Error upvoting question:', error);
      throw error;
    }

    return {
      id: (question as any).id,
      userId: (question as any).user_id,
      scenarioId: (question as any).scenario_id,
      question: (question as any).question,
      category: (question as any).category,
      timestamp: new Date((question as any).created_at),
      upvotes: (question as any).upvotes + 1,
    };
  }

  async extractTechnicalQuestions(responseId: string): Promise<void> {
    const responses = await this.getUserResponses({ limit: 1000 });
    const found = responses.find(r => r.id === responseId);
    if (!found) return;

    const questionPattern = /[^.!?]*\?/g;
    const matches = found.userMessage.match(questionPattern);
    
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
              userId: found.userId,
              scenarioId: found.scenarioId,
              question: trimmed,
              category: found.objectionCategory,
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
    const client = this.ensureSupabase();
    
    // Try to query resource_links table if it exists
    try {
      const { data, error } = await client
        .from('resource_links')
        .select('*')
        .eq('category', category)
        .limit(20);

      if (error) {
        // Table might not exist yet, return empty array
        console.warn('Resource links table not found or error:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        url: row.url,
        title: row.title,
        type: row.type || 'blog_post',
        description: row.description,
        category: row.category || category,
      }));
    } catch (error) {
      // Table doesn't exist yet, return empty array
      return [];
    }
  }

  async getResponsePerformance(responseId: string): Promise<{
    averageScore: number;
    usageCount: number;
  } | null> {
    const client = this.ensureSupabase();
    
    // Get the specific response
    const { data: responseData, error: responseError } = await (client
      .from('user_responses')
      .select('user_message')
      .eq('id', responseId)
      .single() as any);

    if (responseError || !responseData || !responseData.user_message) {
      return null;
    }

    // Find similar responses (same message text)
    const { data: similarResponses, error: similarError } = await (client
      .from('user_responses')
      .select('confidence_score')
      .eq('user_message', responseData.user_message) as any);

    if (similarError || !similarResponses || similarResponses.length === 0) {
      return null;
    }

    const averageScore = similarResponses.reduce(
      (sum: number, r: any) => sum + (r.confidence_score || 0),
      0
    ) / similarResponses.length;

    return {
      averageScore: Math.round(averageScore),
      usageCount: similarResponses.length,
    };
  }

  async saveFeedback(feedback: Omit<Feedback, 'id' | 'timestamp'>): Promise<Feedback> {
    const client = this.ensureSupabase();
    const id = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullFeedback: Feedback = {
      ...feedback,
      id,
      timestamp: new Date(),
    };

    // Try to save to feedback table if it exists
    try {
      const { error } = await client
        .from('feedback')
        .insert({
          id: fullFeedback.id,
          type: fullFeedback.type,
          subject: fullFeedback.subject,
          message: fullFeedback.message,
          rating: fullFeedback.rating,
          user_id: fullFeedback.userId,
          email: fullFeedback.email,
          created_at: fullFeedback.timestamp.toISOString(),
        } as any);

      if (error) {
        // Table might not exist yet, log and continue
        console.warn('Feedback table not found or error:', error.message);
        console.log('Feedback logged (table may need to be created):', fullFeedback);
      }
    } catch (error) {
      // Table doesn't exist yet, log feedback
      console.warn('Feedback table does not exist. Please create it in Supabase.');
      console.log('Feedback logged:', fullFeedback);
    }

    return fullFeedback;
  }

  async getFeedback(filters?: {
    userId?: string;
    type?: string;
    limit?: number;
  }): Promise<Feedback[]> {
    const client = this.ensureSupabase();
    
    try {
      let query = client
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      if (filters?.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Error fetching feedback:', error.message);
        return [];
      }

      return (data || []).map((row: any) => ({
        id: row.id,
        type: row.type,
        subject: row.subject,
        message: row.message,
        rating: row.rating || 0,
        userId: row.user_id,
        email: row.email,
        timestamp: new Date(row.created_at),
      }));
    } catch (error) {
      // Table doesn't exist yet
      console.warn('Feedback table does not exist.');
      return [];
    }
  }
}

// Export class, not instance - will be instantiated lazily
export class ProductionDatabaseInstance extends ProductionDatabase {}
export const db = new ProductionDatabaseInstance();

