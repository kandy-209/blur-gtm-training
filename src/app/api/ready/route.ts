import { NextResponse } from 'next/server';

/**
 * Readiness Check Endpoint
 * Returns 200 when service is ready to accept traffic
 * Used by Kubernetes/Docker health checks
 */
export async function GET() {
  try {
    // Check if critical services are ready
    const ready = await checkReadiness();
    
    if (ready) {
      return NextResponse.json(
        {
          status: 'ready',
          timestamp: new Date().toISOString(),
        },
        {
          status: 200,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
          },
        }
      );
    }
    
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error.message,
      },
      { status: 503 }
    );
  }
}

async function checkReadiness(): Promise<boolean> {
  // Check if environment is properly configured
  const hasRequiredEnv = !!(
    process.env.OPENAI_API_KEY || 
    process.env.ANTHROPIC_API_KEY
  );
  
  // In production, require at least one LLM provider
  if (process.env.NODE_ENV === 'production' && !hasRequiredEnv) {
    return false;
  }
  
  // Service is ready if we can start
  return true;
}











