import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput } from '@/lib/security';
import { parseJsonBody, validateRequestBody, createErrorResponse, createSuccessResponse, validateString, validateNumber } from '@/lib/api-validation';
import { parseJsonBody, validateRequestBody, createErrorResponse, createSuccessResponse, validateString, validateNumber } from '@/lib/api-validation';
import { sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    // Parse and validate JSON body
    const bodyResult = await parseJsonBody(request);
    if (!bodyResult.success) {
      return bodyResult.error;
    }

    const body = bodyResult.data;
    const {
      userId,
      scenarioId,
      turnNumber,
      objectionCategory,
      userMessage,
      aiResponse,
      evaluation,
      confidenceScore,
      keyPointsMentioned,
    } = body;

    // Validate required fields
    const validation = validateRequestBody(
      body,
      ['userId', 'scenarioId', 'userMessage', 'evaluation'],
      {
        userId: (v) => validateString(v, { minLength: 1, maxLength: 100, required: true }).valid,
        scenarioId: (v) => validateString(v, { minLength: 1, maxLength: 100, required: true }).valid,
        userMessage: (v) => validateString(v, { minLength: 1, maxLength: 5000, required: true }).valid,
        evaluation: (v) => ['PASS', 'FAIL', 'REJECT'].includes(v),
      }
    );

    if (!validation.valid) {
      return createErrorResponse(
        'Validation failed',
        400,
        { errors: validation.errors }
      );
    }

    // Validate optional fields
    const turnNumberResult = validateNumber(turnNumber, { min: 1, max: 1000, integer: true });
    const confidenceScoreResult = validateNumber(confidenceScore, { min: 0, max: 100 });

    // Validate keyPointsMentioned array
    let sanitizedKeyPoints: string[] = [];
    if (keyPointsMentioned) {
      if (!Array.isArray(keyPointsMentioned)) {
        return createErrorResponse('keyPointsMentioned must be an array', 400);
      }
      sanitizedKeyPoints = keyPointsMentioned
        .filter((kp): kp is string => typeof kp === 'string')
        .map((kp) => sanitizeInput(kp, 200))
        .filter((kp) => kp.length > 0);
    }

    // Sanitize inputs
    const response = await db.saveUserResponse({
      userId: sanitizeInput(userId, 100),
      scenarioId: sanitizeInput(scenarioId, 100),
      turnNumber: turnNumberResult.sanitized || 1,
      objectionCategory: objectionCategory ? sanitizeInput(objectionCategory, 100) : '',
      userMessage: sanitizeInput(userMessage, 5000),
      aiResponse: aiResponse ? sanitizeInput(aiResponse, 10000) : '',
      evaluation: evaluation as 'PASS' | 'FAIL' | 'REJECT',
      confidenceScore: confidenceScoreResult.sanitized || 50,
      keyPointsMentioned: sanitizedKeyPoints,
    });

    // Extract technical questions asynchronously
    db.extractTechnicalQuestions(response.id).catch(console.error);

    return createSuccessResponse(response, 'Response saved successfully');
  } catch (error: any) {
    console.error('Save response error:', error);
    
    // Provide more specific error messages
    if (error?.message?.includes('validation') || error?.message?.includes('invalid')) {
      return createErrorResponse(
        'Invalid input data. Please check your request and try again.',
        400
      );
    }
    
    return createErrorResponse(
      'Failed to save response. Please try again later.',
      500
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const scenarioId = searchParams.get('scenarioId');
    const objectionCategory = searchParams.get('objectionCategory');
    const limit = parseInt(searchParams.get('limit') || '50');

    const responses = await db.getUserResponses({
      userId: userId || undefined,
      scenarioId: scenarioId || undefined,
      objectionCategory: objectionCategory || undefined,
      limit: Math.min(limit, 100), // Max 100
    });

    return NextResponse.json({ responses });
  } catch (error: any) {
    console.error('Get responses error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve responses. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { responseId, userId } = body;

    if (!responseId || !userId) {
      return NextResponse.json(
        { error: 'responseId and userId are required' },
        { status: 400 }
      );
    }

    // Verify user owns the response
    const sanitizedUserId = sanitizeInput(userId, 100);
    const sanitizedResponseId = sanitizeInput(responseId, 100);

    // Get the response to verify ownership
    const responses = await db.getUserResponses({ userId: sanitizedUserId });
    const response = responses.find((r: { id: string }) => r.id === sanitizedResponseId);

    if (!response) {
      return NextResponse.json(
        { error: 'Response not found or access denied' },
        { status: 404 }
      );
    }

    if (response.userId !== sanitizedUserId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete the response
    await db.deleteUserResponse(sanitizedResponseId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete response error:', error);
    return NextResponse.json(
      { error: 'Failed to delete response. Please try again later.' },
      { status: 500 }
    );
  }
}

