import { NextRequest, NextResponse } from 'next/server';
import { agentHealthCheck } from '@/lib/agent-health-check';

export async function GET(request: NextRequest) {
  try {
    const results = await agentHealthCheck.checkAllAgents();
    
    const overallStatus = results.every(r => r.status === 'healthy')
      ? 'healthy'
      : results.some(r => r.status === 'healthy')
      ? 'degraded'
      : 'unhealthy';

    return NextResponse.json({
      status: overallStatus,
      agents: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

