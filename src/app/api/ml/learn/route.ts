import { NextRequest, NextResponse } from 'next/server';
import { ContinuousLearningAgent } from '@/lib/ml/continuous-learning';
import { sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    const { objectionCategory } = body;

    if (!objectionCategory || typeof objectionCategory !== 'string') {
      return NextResponse.json(
        { error: 'objectionCategory is required' },
        { status: 400 }
      );
    }

    const sanitizedCategory = sanitizeInput(objectionCategory, 100);

    // Learn from data
    const insights = await ContinuousLearningAgent.learnFromData(sanitizedCategory);

    return NextResponse.json({
      success: true,
      insights,
      count: insights.length,
    });
  } catch (error: any) {
    console.error('ML learning error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to learn from data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const objectionCategory = searchParams.get('category');

    if (!objectionCategory) {
      return NextResponse.json(
        { error: 'category query parameter is required' },
        { status: 400 }
      );
    }

    const sanitizedCategory = sanitizeInput(objectionCategory, 100);

    // Get learning insights
    const insights = await ContinuousLearningAgent.learnFromData(sanitizedCategory);

    // Evaluate model improvement
    const improvement = await ContinuousLearningAgent.evaluateModelImprovement(sanitizedCategory);

    return NextResponse.json({
      success: true,
      insights,
      improvement,
    });
  } catch (error: any) {
    console.error('ML learning error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get learning insights' },
      { status: 500 }
    );
  }
}

