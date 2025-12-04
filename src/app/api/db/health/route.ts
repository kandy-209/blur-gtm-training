import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient, verifyConnection, isDatabaseConfigured } from '@/lib/supabase-client';

/**
 * Database health check endpoint
 * GET /api/db/health
 * 
 * Returns connection status and configuration details
 */
export async function GET(request: NextRequest) {
  try {
    const isConfigured = isDatabaseConfigured();
    const supabase = getSupabaseClient();
    
    const health = {
      timestamp: new Date().toISOString(),
      configured: isConfigured,
      connected: false,
      error: null as string | null,
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set',
      },
    };

    if (!isConfigured) {
      return NextResponse.json({
        ...health,
        message: 'Database not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY',
      }, { status: 503 });
    }

    if (!supabase) {
      return NextResponse.json({
        ...health,
        error: 'Failed to initialize Supabase client',
      }, { status: 503 });
    }

    // Verify connection
    const connectionCheck = await verifyConnection();
    
    health.connected = connectionCheck.connected;
    health.error = connectionCheck.error || null;

    if (!connectionCheck.connected) {
      return NextResponse.json({
        ...health,
        message: 'Database connection failed',
      }, { status: 503 });
    }

    return NextResponse.json({
      ...health,
      message: 'Database connection healthy',
      tables: connectionCheck.tables,
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      configured: isDatabaseConfigured(),
      connected: false,
      error: error.message || 'Unknown error',
      message: 'Health check failed',
    }, { status: 500 });
  }
}


