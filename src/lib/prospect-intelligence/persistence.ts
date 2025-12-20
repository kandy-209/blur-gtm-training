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
 * Derive a simple account domain from a full website URL.
 * Falls back to the raw URL if parsing fails.
 */
function getDomainFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Best-effort upsert into accounts table using a saved prospect row.
 * Keeps a normalized account-level record for each domain.
 */
async function upsertAccountFromSaved(saved: any) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    log.warn('Supabase not configured - skipping accounts upsert');
    return;
  }

  try {
    const websiteUrl: string = saved.website_url;
    const accountDomain = getDomainFromUrl(websiteUrl);

    const payload: any = {
      account_domain: accountDomain,
      company_name: saved.company_name,
      website_url: saved.website_url,
      last_prospect_intelligence_id: saved.id,
      last_icp_score: saved.icp_score ?? null,
      last_priority_level: saved.priority_level ?? null,
      last_research_at:
        saved.extracted_at ??
        saved.extractedAt ??
        saved.created_at ??
        new Date().toISOString(),
    };

    const { error } = await supabase.from('accounts').upsert(payload, {
      onConflict: 'account_domain',
    });

    if (error) {
      log.warn('Failed to upsert accounts row', error as any, {
        accountDomain,
        companyName: saved.company_name,
      });
    } else {
      log.info('Account row upserted', {
        accountDomain,
        companyName: saved.company_name,
        icpScore: saved.icp_score,
        priorityLevel: saved.priority_level,
      });
    }
  } catch (err) {
    log.warn('Error while upserting accounts (non-fatal)', err as any, {
      prospectId: saved?.id,
    });
  }
}

/**
 * Best-effort log into prospect_intelligence_runs using a saved prospect row.
 * This is used for ML / analytics and should not break the main request.
 */
async function logProspectRunFromSaved(saved: any) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    log.warn('Supabase not configured - skipping prospect_intelligence_runs insert');
    return;
  }

  try {
    const websiteUrl: string = saved.website_url;
    const accountDomain = getDomainFromUrl(websiteUrl);

    const payload: any = {
      user_id: saved.user_id ?? null,
      account_domain: accountDomain,
      website_url: saved.website_url,
      company_name: saved.company_name,
      run_status: 'success',
      icp_score: saved.icp_score ?? null,
      priority_level: saved.priority_level ?? null,
      error_type: null,
      error_message: null,
    };

    const { error } = await supabase
      .from('prospect_intelligence_runs')
      .insert(payload);

    if (error) {
      log.warn('Failed to log prospect_intelligence_run', error as any, {
        accountDomain,
        companyName: saved.company_name,
      });
    } else {
      log.info('Prospect intelligence run logged', {
        accountDomain,
        companyName: saved.company_name,
        icpScore: saved.icp_score,
        priorityLevel: saved.priority_level,
      });
    }
  } catch (err) {
    log.warn(
      'Error while logging prospect_intelligence_run (non-fatal)',
      err as any,
      {
        prospectId: saved?.id,
      }
    );
  }
}

/**
 * Best-effort upsert into account_signals using a saved prospect row.
 * This is used for ML / analytics and should not break the main request.
 */
async function upsertAccountSignalsFromSaved(saved: any) {
  const supabase = getSupabaseClient();
  if (!supabase) {
    log.warn('Supabase not configured - skipping account_signals upsert');
    return;
  }

  try {
    const data = (saved.data || {}) as ProspectIntelligence;
    const websiteUrl: string = saved.website_url;
    const accountDomain = getDomainFromUrl(websiteUrl);

    const payload: any = {
      account_domain: accountDomain,
      company_name: saved.company_name,
      icp_score: saved.icp_score ?? null,
      priority_level: saved.priority_level ?? null,
      has_open_engineering_roles: data.hiring?.hasOpenEngineeringRoles ?? null,
      engineering_role_count: data.hiring?.engineeringRoleCount ?? null,
      total_open_roles: data.hiring?.totalOpenRoles ?? null,
      has_engineering_blog: data.engineeringCulture?.hasEngineeringBlog ?? null,
      last_research_at:
        saved.extracted_at ??
        saved.extractedAt ??
        saved.created_at ??
        new Date().toISOString(),
    };

    const { error } = await supabase.from('account_signals').upsert(payload, {
      onConflict: 'account_domain',
    });

    if (error) {
      log.warn('Failed to upsert account_signals', error as any, {
        accountDomain,
        companyName: saved.company_name,
      });
    } else {
      log.info('Account signals upserted', {
        accountDomain,
        companyName: saved.company_name,
        icpScore: saved.icp_score,
        priorityLevel: saved.priority_level,
      });
    }
  } catch (err) {
    log.warn('Error while upserting account_signals (non-fatal)', err as any, {
      prospectId: saved?.id,
    });
  }
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
    // Best-effort: also update ML/analytics tables (non-fatal)
    void upsertAccountFromSaved(saved).catch((err) => {
      log.warn('accounts upsert failed (non-fatal)', err as any, {
        prospectId: saved.id,
      });
    });
    void logProspectRunFromSaved(saved).catch((err) => {
      log.warn(
        'prospect_intelligence_runs insert failed (non-fatal)',
        err as any,
        {
          prospectId: saved.id,
        }
      );
    });
    void upsertAccountSignalsFromSaved(saved).catch((err) => {
      log.warn('account_signals upsert failed (non-fatal)', err as any, {
        prospectId: saved.id,
      });
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
