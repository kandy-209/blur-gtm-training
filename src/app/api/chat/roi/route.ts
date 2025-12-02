import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';
import { cursorFeatures } from '@/data/cursor-features';
import { canAccessChatType, isAllowed, filterAuthorized } from '@/lib/oso-auth';

export async function POST(request: NextRequest) {
  try {
    const { question, role, chatType, userId } = await request.json();

    // OSO-style authorization check
    const userContext = userId 
      ? { id: userId, role, isGuest: role === 'guest' }
      : { id: 'anonymous', role: 'guest', isGuest: true };
    
    if (!canAccessChatType(userContext, 'roi')) {
      return NextResponse.json(
        { error: 'ROI chat requires a user account. Please sign in.' },
        { status: 403 }
      );
    }

    // Additional permission check
    if (!isAllowed(userContext, 'chat:roi')) {
      return NextResponse.json(
        { error: 'You do not have permission to access ROI chat' },
        { status: 403 }
      );
    }

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const sanitizedQuestion = sanitizeInput(question, 500).toLowerCase();

    // Find relevant features for ROI questions
    const allMatchingFeatures = cursorFeatures.filter(feature => {
      const searchText = `${feature.name} ${feature.description} roi`.toLowerCase();
      return sanitizedQuestion.split(' ').some(word => searchText.includes(word));
    });

    // Filter features based on user permissions (OSO-style)
    const authorizedFeatures = filterAuthorized(
      userContext,
      allMatchingFeatures.map(f => ({
        id: f.id,
        type: 'feature',
        permissions: ['features:read', 'chat:roi'] as any[],
        metadata: {
          requiresAuth: true,
          roleRequired: ['user', 'manager', 'admin'],
        },
      })),
      'chat:roi'
    ).map(auth => allMatchingFeatures.find(f => f.id === auth.id)).filter(Boolean) as typeof cursorFeatures;

    const matchingFeatures = authorizedFeatures;

    if (matchingFeatures.length === 0) {
      return NextResponse.json({
        answer: `As a ${role}, you have access to ROI information. For "${sanitizedQuestion}", I recommend checking the Features page for detailed ROI metrics. Generally, Cursor provides 30-50% productivity improvements and 2-3x faster development cycles.`,
        role,
        chatType,
      });
    }

    const topFeature = matchingFeatures[0];
    let answer = '';

    if (role === 'manager' || role === 'admin') {
      answer = `${topFeature.name} - Leadership ROI: ${topFeature.impactOnTeams.leadership.roi}. `;
      answer += `Key metrics: ${topFeature.impactOnTeams.leadership.metrics.slice(0, 3).join(', ')}. `;
      answer += `Business value: ${topFeature.impactOnTeams.leadership.businessValue.slice(0, 2).join(' and ')}.`;
    } else {
      answer = `${topFeature.name} provides significant ROI. `;
      answer += `For leadership: ${topFeature.impactOnTeams.leadership.roi}. `;
      answer += `For ICs: ${topFeature.impactOnTeams.ic.timeSaved}. `;
      answer += `Check the Features page for detailed metrics.`;
    }

    return NextResponse.json({
      answer,
      role,
      chatType,
      features: matchingFeatures.map(f => ({
        id: f.id,
        name: f.name,
      })),
    });
  } catch (error: any) {
    console.error('ROI chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process question' },
      { status: 500 }
    );
  }
}

