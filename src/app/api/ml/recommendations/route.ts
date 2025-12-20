import { NextRequest, NextResponse } from 'next/server';
import { getAccountRecommendations, getTopAccountsByIntent } from '@/lib/ml/recommendations';
import { getUserId } from '@/lib/auth';

/**
 * GET /api/ml/recommendations
 * Get personalized account recommendations
 * 
 * Query params:
 * - limit: number of recommendations (default 10)
 * - minICPScore: minimum ICP score (default 6)
 * - priorityLevel: high|medium|low|all (default all)
 * - includeEngaged: include accounts user already engaged with (default false)
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const minICPScore = parseInt(searchParams.get('minICPScore') || '6', 10);
    const priorityLevel = (searchParams.get('priorityLevel') as any) || 'all';
    const includeEngaged = searchParams.get('includeEngaged') === 'true';

    const recommendations = await getAccountRecommendations({
      userId,
      limit,
      minICPScore,
      priorityLevel,
      includeEngaged,
    });

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error: any) {
    console.error('Recommendations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ml/recommendations/top
 * Get top accounts by intent signals (no personalization)
 * Useful for new users or general recommendations
 */
export async function POST(request: NextRequest) {
  try {
    const userId = await getUserId();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 10;

    const recommendations = await getTopAccountsByIntent(limit);

    return NextResponse.json({
      success: true,
      recommendations,
      count: recommendations.length,
    });
  } catch (error: any) {
    console.error('Top recommendations error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get top recommendations' },
      { status: 500 }
    );
  }
}
