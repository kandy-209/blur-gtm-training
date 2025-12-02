import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId');
    const objectionCategory = searchParams.get('objectionCategory');
    const minScore = parseInt(searchParams.get('minScore') || '70');
    const limit = parseInt(searchParams.get('limit') || '20');

    const topResponses = await db.getTopResponses({
      scenarioId: scenarioId || undefined,
      objectionCategory: objectionCategory || undefined,
      minScore,
      limit: Math.min(limit, 100),
    });

    return NextResponse.json({ topResponses });
  } catch (error) {
    console.error('Get top responses error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve top responses' },
      { status: 500 }
    );
  }
}

