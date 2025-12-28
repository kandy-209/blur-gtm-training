/**
 * ICP Scoring Model
 * 
 * Phase 2: ML-based ICP scoring using account signals
 * 
 * This module provides:
 * - Rule-based baseline scoring (immediate)
 * - ML model integration (when trained)
 * - Feature extraction from account signals
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

export interface ICPScoreInput {
  accountDomain: string;
  engineeringRoleCount?: number;
  hasOpenEngineeringRoles?: boolean;
  totalOpenRoles?: number;
  hasEngineeringBlog?: boolean;
  companySize?: number;
  recentFunding?: boolean;
  techStackAlignment?: number; // 0-1 score
}

export interface ICPScoreResult {
  score: number; // 1-10
  priorityLevel: 'high' | 'medium' | 'low';
  confidence: number; // 0-1
  reasoning: string[];
  features: Record<string, any>;
}

/**
 * Rule-based ICP scoring (baseline until ML model is trained)
 * 
 * This provides immediate value while we collect training data.
 * Can be replaced with ML model later.
 */
export async function scoreAccountICP(
  input: ICPScoreInput
): Promise<ICPScoreResult> {
  const features = {
    engineeringRoleCount: input.engineeringRoleCount || 0,
    hasOpenEngineeringRoles: input.hasOpenEngineeringRoles || false,
    totalOpenRoles: input.totalOpenRoles || 0,
    hasEngineeringBlog: input.hasEngineeringBlog || false,
    companySize: input.companySize || 0,
    recentFunding: input.recentFunding || false,
    techStackAlignment: input.techStackAlignment || 0,
  };

  const reasoning: string[] = [];
  let score = 5; // Start at neutral

  // Engineering hiring signals (strong intent)
  if (features.hasOpenEngineeringRoles) {
    score += 2;
    reasoning.push('Has open engineering roles (strong hiring intent)');
  }
  if (features.engineeringRoleCount > 5) {
    score += 1;
    reasoning.push(`High engineering hiring volume (${features.engineeringRoleCount} roles)`);
  }

  // Company size (larger = better fit for enterprise)
  if (features.companySize > 200) {
    score += 1;
    reasoning.push(`Large company size (${features.companySize}+ employees)`);
  } else if (features.companySize < 50) {
    score -= 1;
    reasoning.push(`Small company size (${features.companySize} employees)`);
  }

  // Recent funding (growth signal)
  if (features.recentFunding) {
    score += 1.5;
    reasoning.push('Recent funding indicates growth and budget');
  }

  // Engineering blog (technical culture)
  if (features.hasEngineeringBlog) {
    score += 0.5;
    reasoning.push('Has engineering blog (technical culture indicator)');
  }

  // Tech stack alignment
  if (features.techStackAlignment > 0.7) {
    score += 1;
    reasoning.push(`High tech stack alignment (${Math.round(features.techStackAlignment * 100)}%)`);
  }

  // Clamp score to 1-10
  score = Math.max(1, Math.min(10, Math.round(score)));

  // Determine priority level
  let priorityLevel: 'high' | 'medium' | 'low';
  if (score >= 8) {
    priorityLevel = 'high';
  } else if (score >= 5) {
    priorityLevel = 'medium';
  } else {
    priorityLevel = 'low';
  }

  // Confidence based on data completeness
  const dataPoints = [
    features.engineeringRoleCount > 0,
    features.totalOpenRoles > 0,
    features.companySize > 0,
    features.techStackAlignment > 0,
  ].filter(Boolean).length;
  const confidence = dataPoints / 4;

  return {
    score,
    priorityLevel,
    confidence,
    reasoning: reasoning.length > 0 ? reasoning : ['Limited data available'],
    features,
  };
}

/**
 * Score account from database
 * Fetches account signals and scores them
 */
export async function scoreAccountFromDB(
  accountDomain: string
): Promise<ICPScoreResult | null> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch account signals
  const { data: signals, error } = await supabase
    .from('account_signals')
    .select('*')
    .eq('account_domain', accountDomain.toLowerCase())
    .single();

  if (error || !signals) {
    return null;
  }

  // Fetch latest research for additional context
  const { data: account } = await supabase
    .from('accounts')
    .select('*, prospect_intelligence:last_prospect_intelligence_id(*)')
    .eq('account_domain', accountDomain.toLowerCase())
    .single();

  // Extract features
  const input: ICPScoreInput = {
    accountDomain: signals.account_domain,
    engineeringRoleCount: signals.engineering_role_count || 0,
    hasOpenEngineeringRoles: signals.has_open_engineering_roles || false,
    totalOpenRoles: signals.total_open_roles || 0,
    hasEngineeringBlog: signals.has_engineering_blog || false,
    // Additional features from research data if available
    companySize: account?.prospect_intelligence?.data?.companySize || 0,
    recentFunding: account?.prospect_intelligence?.data?.recentFunding || false,
    techStackAlignment: calculateTechStackAlignment(account?.prospect_intelligence?.data),
  };

  return scoreAccountICP(input);
}

/**
 * Calculate tech stack alignment score
 * Placeholder - can be enhanced with actual tech stack matching
 */
function calculateTechStackAlignment(researchData: any): number {
  if (!researchData?.techStack) return 0;
  
  // Simple heuristic: more technologies = higher alignment potential
  const techCount = Array.isArray(researchData.techStack)
    ? researchData.techStack.length
    : 0;
  
  return Math.min(1, techCount / 10); // Normalize to 0-1
}

/**
 * Batch score multiple accounts
 */
export async function scoreAccountsBatch(
  accountDomains: string[]
): Promise<Map<string, ICPScoreResult>> {
  const results = new Map<string, ICPScoreResult>();

  await Promise.all(
    accountDomains.map(async (domain) => {
      const score = await scoreAccountFromDB(domain);
      if (score) {
        results.set(domain, score);
      }
    })
  );

  return results;
}
