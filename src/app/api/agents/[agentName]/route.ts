import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/lib/agents/base/AgentOrchestrator';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ agentName: string }> }
) {
  try {
    const params = await context.params;
    const body = await request.json();
    const { input, context: agentContext } = body;
    
    const result = await orchestrator.execute(params.agentName, input, agentContext);
    
    return NextResponse.json(result);
  } catch (error: any) {
    const params = await context.params;
    console.error(`Agent ${params.agentName} error:`, error);
    return NextResponse.json(
      { error: error.message || 'Agent execution failed' },
      { status: 500 }
    );
  }
}

