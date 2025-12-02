import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, validateJSONStructure } from '@/lib/security';

// TODO: Add database integration for feedback storage
// For now, we'll just validate and return success
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      messageId?: string;
      messageType?: string;
      originalMessage?: string;
      improvedMessage?: string;
      feedbackText?: string;
      improvementReason?: string;
      resourceLinks?: Array<{ id?: string; url?: string; title?: string; type?: string }>;
      originalRating?: number;
      improvedRating?: number;
      objectionCategory?: string;
      scenarioId?: string;
      useCase?: string;
      userId?: string;
    };
    
    // Validate input
    if (!body.messageId || !body.originalMessage || !body.feedbackText || !body.objectionCategory) {
      return NextResponse.json(
        { error: 'Missing required fields: messageId, originalMessage, feedbackText, objectionCategory' },
        { status: 400 }
      );
    }
    
    if (body.feedbackText.length < 10) {
      return NextResponse.json(
        { error: 'Feedback text must be at least 10 characters' },
        { status: 400 }
      );
    }
    
    // Sanitize inputs
    const feedback = {
      messageId: sanitizeInput(body.messageId, 200),
      messageType: body.messageType || 'response',
      originalMessage: sanitizeInput(body.originalMessage, 5000),
      improvedMessage: body.improvedMessage 
        ? sanitizeInput(body.improvedMessage, 5000)
        : undefined,
      feedbackText: sanitizeInput(body.feedbackText, 2000),
      improvementReason: body.improvementReason
        ? sanitizeInput(body.improvementReason, 1000)
        : undefined,
      resourceLinks: Array.isArray(body.resourceLinks) 
        ? body.resourceLinks.map((link) => ({
            id: link.id || `res_${Date.now()}`,
            url: sanitizeInput(link.url || '', 500),
            title: sanitizeInput(link.title || '', 200),
            type: link.type || 'blog_post',
          }))
        : [],
      originalRating: Math.max(1, Math.min(5, body.originalRating || 3)),
      improvedRating: body.improvedRating
        ? Math.max(1, Math.min(5, body.improvedRating))
        : undefined,
      objectionCategory: sanitizeInput(body.objectionCategory, 100),
      scenarioId: body.scenarioId ? sanitizeInput(body.scenarioId, 100) : undefined,
      useCase: sanitizeInput(body.useCase || 'general', 200),
      userId: body.userId || 'anonymous',
    };
    
    // TODO: Save to database
    // const savedFeedback = await db.saveMessageFeedback(feedback);
    
    // Trigger ML analysis (async, don't wait)
    fetch('/api/agents/orchestrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        workflow: 'analyze-feedback-complete',
        input: {
          feedback: {
            text: feedback.feedbackText,
            improvedMessage: feedback.improvedMessage,
            rating: feedback.originalRating,
          },
          originalMessage: feedback.originalMessage,
        },
        context: {
          objectionCategory: feedback.objectionCategory,
          scenarioId: feedback.scenarioId,
        },
      }),
    }).catch(console.error);
    
    return NextResponse.json({ 
      success: true, 
      feedback: {
        id: `feedback_${Date.now()}`,
        ...feedback,
      }
    });
  } catch (error) {
    console.error('Feedback submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}

