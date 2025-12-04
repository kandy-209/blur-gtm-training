import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import {
  parseJsonBody,
  validateRequestBody,
  validateString,
  validateNumber,
  validateEmail,
  createErrorResponse,
  createSuccessResponse,
} from '@/lib/api-validation';

const FEEDBACK_TYPES = ['general', 'bug', 'feature', 'improvement', 'other'] as const;

export async function POST(request: NextRequest) {
  try {
    // Parse and validate JSON body
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.success) {
      return bodyResult.error;
    }

    const { type, subject, message, rating, userId, email } = bodyResult.data;

    // Validate required fields
    const validation = validateRequestBody(
      bodyResult.data,
      ['type', 'subject', 'message'],
      {
        type: (value) => FEEDBACK_TYPES.includes(value as any),
        subject: (value) => typeof value === 'string' && value.trim().length > 0,
        message: (value) => typeof value === 'string' && value.trim().length > 0,
      }
    );

    if (!validation.valid) {
      return createErrorResponse(
        'Validation failed',
        400,
        { errors: validation.errors }
      );
    }

    // Validate and sanitize individual fields
    const typeValidation = validateString(type, {
      maxLength: 50,
      required: true,
      pattern: new RegExp(`^(${FEEDBACK_TYPES.join('|')})$`),
    });
    if (!typeValidation.valid) {
      return createErrorResponse(typeValidation.error || 'Invalid feedback type', 400);
    }

    const subjectValidation = validateString(subject, {
      minLength: 3,
      maxLength: 200,
      required: true,
    });
    if (!subjectValidation.valid) {
      return createErrorResponse(subjectValidation.error || 'Invalid subject', 400);
    }

    const messageValidation = validateString(message, {
      minLength: 10,
      maxLength: 5000,
      required: true,
    });
    if (!messageValidation.valid) {
      return createErrorResponse(messageValidation.error || 'Invalid message', 400);
    }

    // Validate optional fields
    const ratingValidation = rating !== undefined
      ? validateNumber(rating, { min: 0, max: 5, integer: true })
      : { valid: true, sanitized: 0 };
    if (!ratingValidation.valid) {
      return createErrorResponse(ratingValidation.error || 'Invalid rating', 400);
    }

    const userIdValidation = userId
      ? validateString(userId, { maxLength: 100 })
      : { valid: true, sanitized: 'anonymous' };
    if (!userIdValidation.valid) {
      return createErrorResponse(userIdValidation.error || 'Invalid user ID', 400);
    }

    const emailValidation = email
      ? (validateEmail(email)
          ? validateString(email, { maxLength: 200 })
          : { valid: false, error: 'Invalid email format' })
      : { valid: true, sanitized: 'anonymous' };
    if (!emailValidation.valid) {
      return createErrorResponse(emailValidation.error || 'Invalid email', 400);
    }

    const sanitizedType = typeValidation.sanitized!;
    const sanitizedSubject = subjectValidation.sanitized!;
    const sanitizedMessage = messageValidation.sanitized!;
    const sanitizedRating = ratingValidation.sanitized || 0;
    const sanitizedUserId = userIdValidation.sanitized || 'anonymous';
    const sanitizedEmail = emailValidation.sanitized || 'anonymous';

    // Store feedback in database
    try {
      const savedFeedback = await db.saveFeedback({
        type: sanitizedType,
        subject: sanitizedSubject,
        message: sanitizedMessage,
        rating: sanitizedRating,
        userId: sanitizedUserId,
        email: sanitizedEmail,
      });

      return createSuccessResponse(
        { feedbackId: savedFeedback.id },
        'Feedback submitted successfully'
      );
    } catch (dbError) {
      // Log error but still return success to user (graceful degradation)
      console.error('Error saving feedback to database:', dbError);
      
      // Fallback: log feedback if database save fails
      console.log('Feedback received (fallback logging):', {
        type: sanitizedType,
        subject: sanitizedSubject,
        message: sanitizedMessage,
        rating: sanitizedRating,
        userId: sanitizedUserId,
        email: sanitizedEmail,
        timestamp: new Date().toISOString(),
      });
      
      // Return success even if DB save fails (feedback is logged)
      return createSuccessResponse(
        { logged: true },
        'Feedback received successfully (logged)'
      );
    }
  } catch (error) {
    // Outer catch handles errors from:
    // - parseJsonBody (if it throws instead of returning error response)
    // - Any other unexpected errors in validation or processing
    console.error('Feedback submission error:', error);
    
    // Provide more specific error message based on error type
    if (error instanceof SyntaxError) {
      return createErrorResponse(
        'Invalid request format. Please check your input.',
        400
      );
    }
    
    return createErrorResponse(
      'Failed to submit feedback. Please try again.',
      500
    );
  }
}
