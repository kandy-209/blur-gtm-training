import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const results = {
    timestamp: new Date().toISOString(),
    checks: {
      url: false,
      anonKey: false,
      serviceRoleKey: false,
      connection: false,
      tables: false,
    },
    details: {
      url: '',
      hasAnonKey: false,
      hasServiceRoleKey: false,
      connectionError: null as string | null,
      tablesFound: [] as string[],
    },
    status: 'unknown' as 'success' | 'partial' | 'failed',
  };

  try {
    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check URL
    if (supabaseUrl && supabaseUrl.includes('supabase.co')) {
      results.checks.url = true;
      results.details.url = supabaseUrl;
    }

    // Check Anon Key
    if (anonKey && anonKey.startsWith('eyJ')) {
      results.checks.anonKey = true;
      results.details.hasAnonKey = true;
    }

    // Check Service Role Key
    if (serviceRoleKey && serviceRoleKey.startsWith('eyJ')) {
      results.checks.serviceRoleKey = true;
      results.details.hasServiceRoleKey = true;
    }

    // Try to connect with service role key (preferred) or anon key
    const supabaseKey = serviceRoleKey || anonKey;
    
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        
        // Test connection by querying a simple table
        // Try to get from user_ratings (common table)
        const { data, error } = await supabase
          .from('user_ratings')
          .select('id')
          .limit(1);

        if (!error) {
          results.checks.connection = true;
        } else {
          // If user_ratings doesn't exist, try user_profiles
          const { error: error2 } = await supabase
            .from('user_profiles')
            .select('id')
            .limit(1);

          if (!error2) {
            results.checks.connection = true;
          } else {
            // Connection works but tables might not exist
            if (error.message.includes('relation') || error.message.includes('does not exist')) {
              results.checks.connection = true; // Connection works, just tables missing
              results.details.connectionError = 'Tables not found - migration may be needed';
            } else if (error.message.includes('Invalid API key') || error.message.includes('JWT')) {
              results.details.connectionError = 'Invalid API key - check your keys';
            } else {
              results.details.connectionError = error.message;
            }
          }
        }

        // Try to list tables (if we have service role key)
        if (serviceRoleKey && results.checks.connection) {
          try {
            // Query information_schema to get table names
            const { data: tables, error: tablesError } = await supabase
              .from('user_profiles')
              .select('*')
              .limit(0);

            if (!tablesError) {
              results.checks.tables = true;
              results.details.tablesFound.push('user_profiles');
            }
          } catch (e) {
            // Ignore table listing errors
          }
        }
      } catch (connError: any) {
        results.details.connectionError = connError.message || 'Connection failed';
      }
    }

    // Determine overall status
    if (results.checks.url && results.checks.anonKey && results.checks.serviceRoleKey && results.checks.connection) {
      results.status = 'success';
    } else if (results.checks.url && (results.checks.anonKey || results.checks.serviceRoleKey)) {
      results.status = 'partial';
    } else {
      results.status = 'failed';
    }

    return NextResponse.json(results, {
      status: results.status === 'success' ? 200 : results.status === 'partial' ? 200 : 500,
    });
  } catch (error: any) {
    results.details.connectionError = error.message || 'Unknown error';
    return NextResponse.json(results, { status: 500 });
  }
}




