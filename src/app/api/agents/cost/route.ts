import { NextRequest, NextResponse } from 'next/server';
import { agentCostTracker } from '@/lib/agent-cost-tracker';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeWindow = searchParams.get('timeWindow')
      ? parseInt(searchParams.get('timeWindow')!)
      : undefined;

    const costs = agentCostTracker.getTotalCosts(timeWindow);

    return NextResponse.json({
      costs,
      averageCost: agentCostTracker.getAverageCost(),
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

