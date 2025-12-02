import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';
import { canAccessChatType, isAllowed } from '@/lib/oso-auth';

export async function POST(request: NextRequest) {
  try {
    const { question, role, chatType, userId } = await request.json();

    // OSO-style authorization check
    const userContext = userId 
      ? { id: userId, role, isGuest: role === 'guest' }
      : { id: 'anonymous', role: 'guest', isGuest: true };
    
    if (!canAccessChatType(userContext, 'technical')) {
      return NextResponse.json(
        { error: 'Technical chat requires a user account. Please sign in.' },
        { status: 403 }
      );
    }

    // Additional permission check
    if (!isAllowed(userContext, 'chat:technical')) {
      return NextResponse.json(
        { error: 'You do not have permission to access technical chat' },
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

    // Technical chat responses - enhanced for authenticated users
    const technicalResponses: Record<string, string> = {
      'api': 'Cursor provides APIs for integration. Check the documentation for API endpoints and authentication.',
      'integration': 'Cursor integrates with VS Code, GitHub, GitLab, and many other tools. See the integration docs for setup instructions.',
      'deployment': 'Cursor Enterprise supports on-premise deployment for security-sensitive environments. Contact sales for deployment options.',
      'security': 'Cursor Enterprise includes SOC 2 Type II compliance, data encryption, and enterprise SSO. All data can stay on-premise.',
      'performance': 'Cursor is optimized for large codebases. It uses efficient indexing and caching to maintain fast performance.',
    };

    const lowerQuestion = sanitizedQuestion.toLowerCase();
    let answer = '';

    for (const [key, response] of Object.entries(technicalResponses)) {
      if (lowerQuestion.includes(key)) {
        answer = response;
        break;
      }
    }

    if (!answer) {
      answer = `As a ${role}, you have access to technical information. For "${sanitizedQuestion}", I recommend checking the technical documentation or contacting support for detailed technical assistance.`;
    }

    return NextResponse.json({
      answer,
      role,
      chatType,
    });
  } catch (error: any) {
    console.error('Technical chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process question' },
      { status: 500 }
    );
  }
}

