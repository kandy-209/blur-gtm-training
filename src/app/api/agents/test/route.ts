import { NextRequest, NextResponse } from 'next/server';
import { agentTesting } from '@/lib/agent-testing';

export async function GET(request: NextRequest) {
  try {
    const results = await agentTesting.runAllTests();
    const summary = agentTesting.getTestSummary(results);

    return NextResponse.json({
      summary,
      results,
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

