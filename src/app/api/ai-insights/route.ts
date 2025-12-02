import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId');
    const objectionCategory = searchParams.get('objectionCategory');

    if (!scenarioId || !objectionCategory) {
      return NextResponse.json(
        { error: 'scenarioId and objectionCategory are required' },
        { status: 400 }
      );
    }

    const insights = await db.getAIInsights(scenarioId, objectionCategory);

    return NextResponse.json({ insights });
  } catch (error) {
    console.error('Get AI insights error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve insights' },
      { status: 500 }
    );
  }
}

