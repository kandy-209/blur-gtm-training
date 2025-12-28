/**
 * Account Recommendation System
 * 
 * Phase 2: Contextual bandit for personalized account recommendations
 * 
 * Uses user interaction history and account signals to recommend
 * top-tier accounts based on intent signals.
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface AccountRecommendation {
  accountDomain: string;
  companyName: string;
  icpScore: number;
  priorityLevel: 'high' | 'medium' | 'low';
  intentSignals: {
    hasOpenEngineeringRoles: boolean;
    engineeringRoleCount: number;
    recentResearch: boolean;
    userEngagement: number; // 0-1 score
  };
  reasoning: string[];
  lastResearchAt?: string;
}

export interface RecommendationOptions {
  userId: string;
  limit?: number; // Default 10
  minICPScore?: number; // Default 6
  priorityLevel?: 'high' | 'medium' | 'low' | 'all';
  includeEngaged?: boolean; // Include accounts user already engaged with
}

/**
 * Get personalized account recommendations for a user
 * 
 * Algorithm:
 * 1. Fetch user's interaction history
 * 2. Get all accounts with high intent signals
 * 3. Score each account based on:
 *    - ICP score
 *    - Intent signals (engineering roles, recent research)
 *    - User engagement patterns
 * 4. Rank and return top accounts
 */
export async function getAccountRecommendations(
  options: RecommendationOptions
): Promise<AccountRecommendation[]> {
  const supabase = createClient(supabaseUrl, supabaseKey);
  const limit = options.limit || 10;
  const minScore = options.minICPScore || 6;

  // Fetch user's interaction history
  const { data: interactions } = await supabase
    .from('user_interactions')
    .select('account_domain, interaction_type, created_at')
    .eq('user_id', options.userId)
    .order('created_at', { ascending: false });

  const userEngagedDomains = new Set(
    interactions?.map((i) => i.account_domain) || []
  );

  // Build query for accounts
  let query = supabase
    .from('account_signals')
    .select(`
      account_domain,
      company_name,
      icp_score,
      priority_level,
      has_open_engineering_roles,
      engineering_role_count,
      last_research_at,
      accounts!inner(last_research_at)
    `)
    .gte('icp_score', minScore)
    .order('icp_score', { ascending: false })
    .limit(limit * 3); // Get more than needed for filtering

  // Filter by priority if specified
  if (options.priorityLevel && options.priorityLevel !== 'all') {
    query = query.eq('priority_level', options.priorityLevel);
  }

  const { data: signals, error } = await query;

  if (error || !signals) {
    return [];
  }

  // Score and rank accounts
  const recommendations: AccountRecommendation[] = signals
    .map((signal) => {
      // Skip if user already engaged (unless includeEngaged is true)
      if (
        !options.includeEngaged &&
        userEngagedDomains.has(signal.account_domain)
      ) {
        return null;
      }

      // Calculate user engagement score
      const userInteractions = interactions?.filter(
        (i) => i.account_domain === signal.account_domain
      ) || [];
      const engagementScore = calculateEngagementScore(userInteractions);

      // Calculate recency score
      const lastResearch = signal.last_research_at || signal.accounts?.last_research_at;
      const recentResearch = lastResearch
        ? new Date(lastResearch).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000 // 30 days
        : false;

      // Build reasoning
      const reasoning: string[] = [];
      if (signal.icp_score >= 8) {
        reasoning.push('High ICP score');
      }
      if (signal.has_open_engineering_roles) {
        reasoning.push('Active engineering hiring');
      }
      if (recentResearch) {
        reasoning.push('Recently researched');
      }
      if (engagementScore > 0.5) {
        reasoning.push('High user engagement');
      }

      return {
        accountDomain: signal.account_domain,
        companyName: signal.company_name,
        icpScore: signal.icp_score || 0,
        priorityLevel: (signal.priority_level as 'high' | 'medium' | 'low') || 'medium',
        intentSignals: {
          hasOpenEngineeringRoles: signal.has_open_engineering_roles || false,
          engineeringRoleCount: signal.engineering_role_count || 0,
          recentResearch,
          userEngagement: engagementScore,
        },
        reasoning,
        lastResearchAt: lastResearch,
      };
    })
    .filter((r): r is AccountRecommendation => r !== null)
    .sort((a, b) => {
      // Sort by: ICP score (desc), then engagement (desc), then recency
      if (b.icpScore !== a.icpScore) {
        return b.icpScore - a.icpScore;
      }
      if (b.intentSignals.userEngagement !== a.intentSignals.userEngagement) {
        return b.intentSignals.userEngagement - a.intentSignals.userEngagement;
      }
      return (b.lastResearchAt || '').localeCompare(a.lastResearchAt || '');
    })
    .slice(0, limit);

  return recommendations;
}

/**
 * Calculate user engagement score based on interaction history
 */
function calculateEngagementScore(interactions: any[]): number {
  if (interactions.length === 0) return 0;

  // Weight different interaction types
  const weights: Record<string, number> = {
    viewed: 0.1,
    opened_research: 0.3,
    contacted: 0.7,
    meeting_booked: 0.9,
    deal_won: 1.0,
    deal_lost: 0.2,
  };

  const totalScore = interactions.reduce((sum, interaction) => {
    return sum + (weights[interaction.interaction_type] || 0);
  }, 0);

  // Normalize to 0-1
  return Math.min(1, totalScore / interactions.length);
}

/**
 * Get top accounts by intent signals (no personalization)
 * Useful for new users or general recommendations
 */
export async function getTopAccountsByIntent(
  limit: number = 10
): Promise<AccountRecommendation[]> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: signals } = await supabase
    .from('account_signals')
    .select('account_domain, company_name, icp_score, priority_level, has_open_engineering_roles, engineering_role_count, last_research_at')
    .eq('has_open_engineering_roles', true)
    .gte('icp_score', 7)
    .order('icp_score', { ascending: false })
    .order('engineering_role_count', { ascending: false })
    .limit(limit);

  if (!signals) return [];

  return signals.map((signal) => ({
    accountDomain: signal.account_domain,
    companyName: signal.company_name,
    icpScore: signal.icp_score || 0,
    priorityLevel: (signal.priority_level as 'high' | 'medium' | 'low') || 'medium',
    intentSignals: {
      hasOpenEngineeringRoles: signal.has_open_engineering_roles || false,
      engineeringRoleCount: signal.engineering_role_count || 0,
      recentResearch: signal.last_research_at
        ? new Date(signal.last_research_at).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
        : false,
      userEngagement: 0,
    },
    reasoning: [
      'High ICP score',
      'Active engineering hiring',
      signal.last_research_at ? 'Recently researched' : '',
    ].filter(Boolean),
    lastResearchAt: signal.last_research_at,
  }));
}
