import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';
import { canAccessChatType, buildAuthzContext } from '@/lib/oso-auth';

export async function POST(request: NextRequest) {
  try {
    const { question, role = 'guest', chatType, userId } = await request.json();

    // Build authorization context (OSO-style)
    const userContext = {
      id: userId || 'anonymous',
      role,
      isGuest: role === 'guest',
    };

    // Check permission to access this chat type
    if (!canAccessChatType(userContext, chatType)) {
      return NextResponse.json(
        { error: 'You do not have permission to access this chat type' },
        { status: 403 }
      );
    }

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const sanitizedQuestion = sanitizeInput(question, 500);

    // General chat - available to all users
    // Enhanced responses with better context
    const responses: Record<string, string> = {
      'hello': 'Hello! I\'m here to help you learn about Cursor Enterprise. You can ask me about features, ROI, technical questions, or how Cursor helps engineering teams. What would you like to know?',
      'hi': 'Hi there! I can help you understand Cursor features, their impact on teams, and ROI. What questions do you have?',
      'help': 'I can help you with:\n• Cursor features and capabilities\n• ROI and business impact\n• Technical questions (requires sign-in)\n• How features help ICs and leadership\n\nWhat would you like to learn about?',
      'what is cursor': 'Cursor is an AI-powered code editor that helps developers write code faster and more efficiently. It understands your entire codebase and provides intelligent assistance. Cursor Enterprise adds team collaboration, security, and advanced features for large engineering teams.',
      'features': 'Cursor has many powerful features:\n• Codebase-wide understanding\n• Composer mode for multi-file editing\n• Chat with codebase\n• Enterprise security & compliance\n• Team collaboration features\n• Self-healing code\n\nCheck out the Features page for detailed information!',
      'roi': 'Cursor provides significant ROI:\n• 30-50% reduction in onboarding time\n• 2-3x faster development cycles\n• 40-60% faster feature development\n• Reduced bug rates\n\nSign in to access detailed ROI chat!',
      'enterprise': 'Cursor Enterprise includes:\n• On-premise deployment options\n• SOC 2 Type II compliance\n• Enterprise SSO\n• Team collaboration features\n• Advanced security controls\n• Audit logs and compliance reporting\n\nPerfect for security-conscious organizations.',
    };

    const lowerQuestion = sanitizedQuestion.toLowerCase();
    let answer = '';

    // Enhanced keyword matching with partial matches
    for (const [key, response] of Object.entries(responses)) {
      if (lowerQuestion.includes(key)) {
        answer = response;
        break;
      }
    }

    // Check for common question patterns
    if (!answer) {
      if (lowerQuestion.includes('how') || lowerQuestion.includes('what') || lowerQuestion.includes('why')) {
        answer = `Great question! For detailed information about "${sanitizedQuestion}", I recommend:\n\n1. Check the Features page for comprehensive feature details\n2. Try the Features chat for feature-specific questions\n3. Sign in to access Technical and ROI chat for deeper insights\n\nWhat specific aspect would you like to learn more about?`;
      } else {
        answer = `Thanks for your question! For information about "${sanitizedQuestion}", please:\n\n• Visit the Features page for detailed feature information\n• Try asking about specific Cursor capabilities\n• Sign in to access advanced chat features\n\nHow can I help you further?`;
      }
    }

    return NextResponse.json({
      answer,
      role,
      chatType,
    });
  } catch (error: any) {
    console.error('General chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process question' },
      { status: 500 }
    );
  }
}

