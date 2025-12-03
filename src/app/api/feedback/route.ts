import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, subject, message, rating, userId, email } = body;

    // Validate required fields
    if (!type || !subject || !message) {
      return NextResponse.json(
        { error: 'Type, subject, and message are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedType = sanitizeInput(type, 50);
    const sanitizedSubject = sanitizeInput(subject, 200);
    const sanitizedMessage = sanitizeInput(message, 5000);
    const sanitizedUserId = userId ? sanitizeInput(userId, 100) : 'anonymous';
    const sanitizedEmail = email ? sanitizeInput(email, 200) : 'anonymous';

    // Store feedback in database
    // Note: This assumes you have a feedback table in your database
    // For now, we'll just log it and return success
    console.log('Feedback received:', {
      type: sanitizedType,
      subject: sanitizedSubject,
      message: sanitizedMessage,
      rating: rating || 0,
      userId: sanitizedUserId,
      email: sanitizedEmail,
      timestamp: new Date().toISOString(),
    });

    // TODO: Store in database when feedback table is created
    // await db.saveFeedback({
    //   type: sanitizedType,
    //   subject: sanitizedSubject,
    //   message: sanitizedMessage,
    //   rating: rating || 0,
    //   userId: sanitizedUserId,
    //   email: sanitizedEmail,
    // });

    return NextResponse.json({ 
      success: true,
      message: 'Feedback submitted successfully' 
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}



