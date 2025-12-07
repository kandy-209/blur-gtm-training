import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId');
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Safely check if database method exists
    let questions: any[] = [];
    try {
      if (db && typeof db.getTechnicalQuestions === 'function') {
        questions = await db.getTechnicalQuestions({
          scenarioId: scenarioId || undefined,
          category: category || undefined,
          limit: Math.min(limit, 100),
        }) || [];
      }
    } catch (dbError) {
      console.warn('Database query failed, returning empty array:', dbError);
      questions = [];
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Get questions error:', error);
    // Always return 200 with empty array to prevent UI crashes
    return NextResponse.json({ questions: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { userId, scenarioId, question, category } = body;

    if (!userId || !question || !scenarioId) {
      return NextResponse.json(
        { error: 'Missing required fields: userId, scenarioId, question' },
        { status: 400 }
      );
    }

    const savedQuestion = await db.saveTechnicalQuestion({
      userId: sanitizeInput(userId, 100),
      scenarioId: sanitizeInput(scenarioId, 100),
      question: sanitizeInput(question, 1000),
      category: sanitizeInput(category || '', 100),
    });

    return NextResponse.json({ success: true, question: savedQuestion });
  } catch (error) {
    console.error('Save question error:', error);
    return NextResponse.json(
      { error: 'Failed to save question' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { questionId } = body;

    if (!questionId) {
      return NextResponse.json(
        { error: 'Missing questionId' },
        { status: 400 }
      );
    }

    const updatedQuestion = await db.upvoteQuestion(questionId);
    if (!updatedQuestion) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, question: updatedQuestion });
  } catch (error) {
    console.error('Upvote question error:', error);
    return NextResponse.json(
      { error: 'Failed to upvote question' },
      { status: 500 }
    );
  }
}

