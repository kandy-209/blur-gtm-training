import { NextRequest, NextResponse } from 'next/server';
import { scoreAccountFromDB, scoreAccountsBatch } from '@/lib/ml/icp-scorer';
import { getUserIdFromRequest } from '@/lib/prospect-intelligence/auth-helper';

/**
 * GET /api/ml/icp-score?accountDomain=example.com
 * Score a single account's ICP fit
 */
export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const accountDomain = searchParams.get('accountDomain');
    const batch = searchParams.get('batch'); // Comma-separated domains

    if (batch) {
      // Batch scoring
      const domains = batch.split(',').map((d) => d.trim()).filter(Boolean);
      if (domains.length === 0) {
        return NextResponse.json({ error: 'No domains provided' }, { status: 400 });
      }

      const results = await scoreAccountsBatch(domains);
      const scores = Array.from(results.entries()).map(([domain, score]) => ({
        accountDomain: domain,
        ...score,
      }));

      return NextResponse.json({
        success: true,
        scores,
        count: scores.length,
      });
    }

    if (!accountDomain) {
      return NextResponse.json(
        { error: 'accountDomain parameter required' },
        { status: 400 }
      );
    }

    const score = await scoreAccountFromDB(accountDomain);

    if (!score) {
      return NextResponse.json(
        { error: 'Account not found or no signals available' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      accountDomain,
      ...score,
    });
  } catch (error: any) {
    console.error('ICP scoring error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to score account' },
      { status: 500 }
    );
  }
}
