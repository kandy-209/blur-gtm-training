import { NextRequest, NextResponse } from 'next/server';
import { orchestrator } from '@/lib/agents/base/AgentOrchestrator';
import { sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workflow, agent, input, context } = body;
    
    if (workflow) {
      // Execute workflow
      const result = await orchestrator.orchestrateWorkflow(
        workflow,
        input,
        context
      );
      
      return NextResponse.json(result);
    } else if (agent) {
      // Execute single agent
      const result = await orchestrator.execute(agent, input, context);
      return NextResponse.json(result);
    } else {
      return NextResponse.json(
        { error: 'Either workflow or agent must be specified' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('Agent orchestration error:', error);
    return NextResponse.json(
      { error: error.message || 'Agent execution failed' },
      { status: 500 }
    );
  }
}

