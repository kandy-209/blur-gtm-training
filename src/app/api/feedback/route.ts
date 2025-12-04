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
    try {
      const savedFeedback = await db.saveFeedback({
        type: sanitizedType,
        subject: sanitizedSubject,
        message: sanitizedMessage,
        rating: typeof rating === 'number' ? Math.max(0, Math.min(5, rating)) : 0,
        userId: sanitizedUserId,
        email: sanitizedEmail,
      });

      return NextResponse.json({ 
        success: true,
        message: 'Feedback submitted successfully',
        feedbackId: savedFeedback.id
      });
    } catch (dbError) {
      // Log error but still return success to user
      console.error('Error saving feedback to database:', dbError);
      // Fallback: log feedback if database save fails
      console.log('Feedback received (fallback logging):', {
        type: sanitizedType,
        subject: sanitizedSubject,
        message: sanitizedMessage,
        rating: rating || 0,
        userId: sanitizedUserId,
        email: sanitizedEmail,
        timestamp: new Date().toISOString(),
      });
      
      return NextResponse.json({ 
        success: true,
        message: 'Feedback submitted successfully (logged)'
      });
    }
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}



