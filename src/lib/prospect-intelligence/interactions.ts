import { getSupabaseClient } from '@/lib/supabase-client';
import { log } from '@/lib/logger';

export type InteractionType =
  | 'viewed'
  | 'opened_research'
  | 'contacted'
  | 'meeting_booked'
  | 'deal_won'
  | 'deal_lost';

export interface InteractionPayload {
  userId: string | null;
  accountDomain: string;
  interactionType: InteractionType;
  metadata?: Record<string, unknown>;
}

/**
 * Log a user interaction with a prospect account for analytics / RL.
 * This is best-effort: failures are logged but do not throw by default.
 */
export async function logUserInteraction({
  userId,
  accountDomain,
  interactionType,
  metadata = {},
}: InteractionPayload): Promise<void> {
  const supabase = getSupabaseClient();

  if (!supabase) {
    log.warn('Supabase client not configured; skipping user_interactions insert', {
      accountDomain,
      interactionType,
    });
    return;
  }

  if (!userId) {
    // For anonymous/guest sessions we currently skip logging to respect RLS
    log.debug?.('No userId provided; skipping user_interactions insert', {
      accountDomain,
      interactionType,
    });
    return;
  }

  try {
    const { error } = await supabase.from('user_interactions').insert({
      user_id: userId,
      account_domain: accountDomain,
      interaction_type: interactionType,
      interaction_metadata: metadata,
    });

    if (error) {
      log.warn('Failed to log user interaction', error as any, {
        userId,
        accountDomain,
        interactionType,
      });
    }
  } catch (err) {
    log.warn('Error logging user interaction', err as any, {
      userId,
      accountDomain,
      interactionType,
    });
  }
}

