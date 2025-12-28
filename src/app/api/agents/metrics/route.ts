import { NextRequest, NextResponse } from 'next/server';
import { agentMonitor } from '@/lib/agent-monitor';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agentName = searchParams.get('agent');
    const timeWindow = searchParams.get('timeWindow')
      ? parseInt(searchParams.get('timeWindow')!)
      : undefined;

    const metrics = agentName
      ? { [agentName]: agentMonitor.getAgentMetrics(agentName, timeWindow) }
      : agentMonitor.getAllMetrics();

    return NextResponse.json({
      metrics,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

