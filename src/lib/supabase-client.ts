/**
 * Centralized Supabase client for database connections
 * Ensures consistent connection handling across all API routes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

/**
 * Get or create Supabase client instance
 * Returns null if not configured (for graceful fallback)
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    if (process.env.NODE_ENV !== 'test') {
      console.warn('⚠️  Supabase not configured. Database features will be limited.');
      console.warn('   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to enable.');
    }
    return null;
  }

  try {
    supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
    
    if (process.env.NODE_ENV !== 'test') {
      console.log('✅ Supabase client initialized');
    }
    
    return supabaseClient;
  } catch (error) {
    console.error('❌ Failed to initialize Supabase client:', error);
    return null;
  }
}

/**
 * Verify database connection
 */
export async function verifyConnection(): Promise<{
  connected: boolean;
  error?: string;
  tables?: string[];
}> {
  const supabase = getSupabaseClient();
  
  if (!supabase) {
    return {
      connected: false,
      error: 'Supabase not configured',
    };
  }

  try {
    // Test connection by querying a common table
    const { error } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    if (error) {
      // Try another table
      const { error: error2 } = await supabase
        .from('user_activity')
        .select('id')
        .limit(1);

      if (error2) {
        return {
          connected: false,
          error: error2.message || 'Connection test failed',
        };
      }
    }

    return {
      connected: true,
      tables: ['user_profiles', 'user_activity'],
    };
  } catch (error: any) {
    return {
      connected: false,
      error: error.message || 'Connection verification failed',
    };
  }
}

/**
 * Check if database is configured
 */
export function isDatabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}


