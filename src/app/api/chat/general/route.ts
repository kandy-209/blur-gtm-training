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
      'hello': 'Hello! I\'m here to help you learn about Browserbase. You can ask me about features, ROI, technical questions, or how Browserbase helps engineering teams with browser automation and web scraping. What would you like to know?',
      'hi': 'Hi there! I can help you understand Browserbase features, their impact on teams, and ROI. What questions do you have?',
      'help': 'I can help you with:\n• Browserbase features and capabilities\n• ROI and business impact\n• Technical questions (requires sign-in)\n• How features help ICs and leadership\n\nWhat would you like to learn about?',
      'what is browserbase': 'Browserbase is a browser automation and web scraping platform that helps engineering teams scale their browser workflows without managing infrastructure. It provides headless browser infrastructure, testing capabilities, and web scraping tools for large engineering teams.',
      'features': 'Browserbase has many powerful features:\n• Browser automation at scale\n• Web scraping infrastructure\n• Headless browser management\n• Enterprise security & compliance\n• Team collaboration features\n• Scalable infrastructure\n\nCheck out the Features page for detailed information!',
      'roi': 'Browserbase provides significant ROI:\n• Reduced infrastructure management costs\n• Faster development cycles for browser-based testing\n• Improved reliability for web scraping\n• Reduced operational overhead\n\nSign in to access detailed ROI chat!',
      'enterprise': 'Browserbase Enterprise includes:\n• On-premise deployment options\n• SOC 2 Type II compliance\n• Enterprise SSO\n• Team collaboration features\n• Advanced security controls\n• Audit logs and compliance reporting\n\nPerfect for security-conscious organizations.',
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
        answer = `Thanks for your question! For information about "${sanitizedQuestion}", please:\n\n• Visit the Features page for detailed feature information\n• Try asking about specific Browserbase capabilities\n• Sign in to access advanced chat features\n\nHow can I help you further?`;
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

