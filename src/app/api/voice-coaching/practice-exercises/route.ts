/**
 * Practice Exercises API
 * Get practice exercises and drills for users
 */

import { NextRequest, NextResponse } from 'next/server';
import { PracticeCoach } from '@/lib/voice-coaching/practice-coach';

/**
 * GET /api/voice-coaching/practice-exercises
 * Get practice exercises for a specific metric
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    const currentValue = parseFloat(searchParams.get('currentValue') || '0');

    if (!metric) {
      return NextResponse.json(
        { error: 'metric is required' },
        { status: 400 }
      );
    }

    const coach = new PracticeCoach();
    const exercises = coach.generatePracticeExercises(metric, currentValue);

    return NextResponse.json({
      success: true,
      exercises,
    });
  } catch (error: any) {
    console.error('Error generating practice exercises:', error);
    return NextResponse.json(
      { error: 'Failed to generate practice exercises', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/voice-coaching/practice-exercises
 * Generate practice drill for multiple metrics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { metrics } = body;

    if (!metrics || !Array.isArray(metrics)) {
      return NextResponse.json(
        { error: 'metrics array is required' },
        { status: 400 }
      );
    }

    const coach = new PracticeCoach();
    const drill = coach.generatePracticeDrill(metrics);

    return NextResponse.json({
      success: true,
      drill,
    });
  } catch (error: any) {
    console.error('Error generating practice drill:', error);
    return NextResponse.json(
      { error: 'Failed to generate practice drill', message: error.message },
      { status: 500 }
    );
  }
}

