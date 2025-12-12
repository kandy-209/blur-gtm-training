import { NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

/**
 * Health Check Endpoint
 * Returns 200 if service is healthy, 503 if unhealthy
 */
export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check database connectivity (if configured)
    const dbHealthy = await checkDatabase();
    
    // Check Redis connectivity (if configured)
    const redisHealthy = await checkRedis();
    
    // Check external API dependencies
    const apisHealthy = await checkExternalAPIs();
    
    const isHealthy = dbHealthy && redisHealthy && apisHealthy;
    const duration = Date.now() - startTime;
    
    const health = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      duration,
      checks: {
        database: dbHealthy ? 'ok' : 'unavailable',
        redis: redisHealthy ? 'ok' : 'unavailable',
        external_apis: apisHealthy ? 'ok' : 'degraded',
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };
    
    return NextResponse.json(health, {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}

async function checkDatabase(): Promise<boolean> {
  // Check if Supabase is configured
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    // Database not configured, but that's ok for development
    return process.env.NODE_ENV !== 'production';
  }
  
  try {
    // Try to ping Supabase (simple check)
    const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || '',
      },
      signal: AbortSignal.timeout(2000), // 2 second timeout
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function checkRedis(): Promise<boolean> {
  // Check if Redis is configured
  if (!process.env.REDIS_URL && !process.env.REDIS_HOST) {
    // Redis not configured, but that's ok (will use in-memory fallback)
    return true;
  }
  
  try {
    // Redis check would go here
    // For now, assume it's healthy if env vars are set
    return true;
  } catch {
    return false;
  }
}

async function checkExternalAPIs(): Promise<boolean> {
  // Check critical external API dependencies
  const checks = [
    // OpenAI/Anthropic (at least one should be configured)
    !!(process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY),
  ];
  
  // If none are configured, that's ok for development
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  
  return checks.some(check => check);
}







