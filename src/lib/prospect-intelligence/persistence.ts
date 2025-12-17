/**
 * Database Persistence for Prospect Intelligence
 * Stores research results in Supabase for later retrieval and analysis
 */

import { getSupabaseClient } from '@/lib/supabase-client';
import { log } from '@/lib/logger';
import type { ProspectIntelligence } from './types';

export interface SavedProspect {
  id: string;
  userId: string;
  websiteUrl: string;
  companyName: string;
  data: ProspectIntelligence;
  icpScore: number;
  priorityLevel: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

/**
 * Save prospect intelligence research to database
 */
export async function saveProspectResearch(
  userId: string,
  data: ProspectIntelligence
): Promise<SavedProspect> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    log.warn('Supabase not configured - prospect research not saved to database');
    throw new Error('Database not configured. Please configure Supabase to save prospect research.');
  }

  try {
    const { data: saved, error } = await supabase
      .from('prospect_intelligence')
      .insert({
        user_id: userId,
        website_url: data.companyWebsite,
        company_name: data.companyName,
        data: data as any, // Store full JSON data
        icp_score: data.icpScore.overallScore,
        priority_level: data.icpScore.priorityLevel,
        extracted_at: data.extractedAt,
        extraction_duration_ms: data.extractionDurationMs,
      })
      .select()
      .single();

    if (error) {
      log.error('Failed to save prospect research', error as any, {
        userId,
        websiteUrl: data.companyWebsite,
      });
      throw error;
    }

    log.info('Prospect research saved to database', {
      id: saved.id,
      userId,
      companyName: data.companyName,
    });

    return {
      id: saved.id,
      userId: saved.user_id,
      websiteUrl: saved.website_url,
      companyName: saved.company_name,
      data: saved.data as ProspectIntelligence,
      icpScore: saved.icp_score,
      priorityLevel: saved.priority_level,
      createdAt: saved.created_at,
      updatedAt: saved.updated_at,
    };
  } catch (error) {
    log.error('Error saving prospect research', error instanceof Error ? error : new Error(String(error)), {
      userId,
      websiteUrl: data.companyWebsite,
    });
    throw error;
  }
}

/**
 * Get saved prospect research by ID
 */
export async function getProspectResearch(id: string): Promise<SavedProspect | null> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('prospect_intelligence')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      websiteUrl: data.website_url,
      companyName: data.company_name,
      data: data.data as ProspectIntelligence,
      icpScore: data.icp_score,
      priorityLevel: data.priority_level,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    log.error('Error getting prospect research', error instanceof Error ? error : new Error(String(error)), {
      id,
    });
    return null;
  }
}

/**
 * Get all saved prospects for a user
 */
export async function getUserProspects(
  userId: string,
  options?: {
    limit?: number;
    offset?: number;
    priorityLevel?: 'high' | 'medium' | 'low';
    minIcpScore?: number;
    search?: string;
  }
): Promise<SavedProspect[]> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return [];
  }

  try {
    let query = supabase
      .from('prospect_intelligence')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (options?.priorityLevel) {
      query = query.eq('priority_level', options.priorityLevel);
    }

    if (options?.minIcpScore !== undefined) {
      query = query.gte('icp_score', options.minIcpScore);
    }

    if (options?.search) {
      query = query.or(`company_name.ilike.%${options.search}%,website_url.ilike.%${options.search}%`);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    if (options?.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      log.error('Error getting user prospects', error as any, { userId });
      return [];
    }

    return (data || []).map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      websiteUrl: item.website_url,
      companyName: item.company_name,
      data: item.data as ProspectIntelligence,
      icpScore: item.icp_score,
      priorityLevel: item.priority_level,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
    }));
  } catch (error) {
    log.error('Error getting user prospects', error instanceof Error ? error : new Error(String(error)), {
      userId,
    });
    return [];
  }
}

/**
 * Check if a prospect has already been researched (by website URL)
 */
export async function checkProspectExists(
  userId: string,
  websiteUrl: string
): Promise<SavedProspect | null> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('prospect_intelligence')
      .select('*')
      .eq('user_id', userId)
      .eq('website_url', websiteUrl)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      userId: data.user_id,
      websiteUrl: data.website_url,
      companyName: data.company_name,
      data: data.data as ProspectIntelligence,
      icpScore: data.icp_score,
      priorityLevel: data.priority_level,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  } catch (error) {
    return null;
  }
}

/**
 * Delete a saved prospect
 */
export async function deleteProspect(id: string, userId: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return false;
  }

  try {
    const { error } = await supabase
      .from('prospect_intelligence')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only delete their own

    if (error) {
      log.error('Error deleting prospect', error as any, { id, userId });
      return false;
    }

    return true;
  } catch (error) {
    log.error('Error deleting prospect', error instanceof Error ? error : new Error(String(error)), {
      id,
      userId,
    });
    return false;
  }
}

/**
 * Get prospect statistics for a user
 */
export async function getProspectStats(userId: string): Promise<{
  total: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  averageIcpScore: number;
  recentCount: number; // Last 30 days
}> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return {
      total: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
      averageIcpScore: 0,
      recentCount: 0,
    };
  }

  try {
    const { data, error } = await supabase
      .from('prospect_intelligence')
      .select('icp_score, priority_level, created_at')
      .eq('user_id', userId);

    if (error || !data) {
      return {
        total: 0,
        highPriority: 0,
        mediumPriority: 0,
        lowPriority: 0,
        averageIcpScore: 0,
        recentCount: 0,
      };
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recent = data.filter(
      (item: any) => new Date(item.created_at) >= thirtyDaysAgo
    );

    const scores = data.map((item: any) => item.icp_score).filter((s: number) => s > 0);
    const avgScore = scores.length > 0
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0;

    return {
      total: data.length,
      highPriority: data.filter((item: any) => item.priority_level === 'high').length,
      mediumPriority: data.filter((item: any) => item.priority_level === 'medium').length,
      lowPriority: data.filter((item: any) => item.priority_level === 'low').length,
      averageIcpScore: Math.round(avgScore * 10) / 10,
      recentCount: recent.length,
    };
  } catch (error) {
    log.error('Error getting prospect stats', error instanceof Error ? error : new Error(String(error)), {
      userId,
    });
    return {
      total: 0,
      highPriority: 0,
      mediumPriority: 0,
      lowPriority: 0,
      averageIcpScore: 0,
      recentCount: 0,
    };
  }
}
