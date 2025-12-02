import { NextRequest, NextResponse } from 'next/server';
import { cursorFeatures } from '@/data/cursor-features';
import { sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const { question, role = 'overview', chatType } = await request.json();

    // Features chat is available to all users (guests included)

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    const sanitizedQuestion = sanitizeInput(question, 500).toLowerCase();

    // Simple keyword matching for now - can be enhanced with AI later
    const matchingFeatures = cursorFeatures.filter(feature => {
      const searchText = `${feature.name} ${feature.description} ${feature.keyBenefits.join(' ')}`.toLowerCase();
      return sanitizedQuestion.split(' ').some(word => searchText.includes(word));
    });

    if (matchingFeatures.length === 0) {
      return NextResponse.json({
        answer: "I couldn't find specific information about that. Try asking about Cursor features like 'codebase understanding', 'composer mode', 'enterprise security', or 'team collaboration'.",
        features: [],
      });
    }

    // Build answer based on role
    let answer = '';
    const topFeature = matchingFeatures[0];

    if (role === 'leadership') {
      answer = `${topFeature.name}: ${topFeature.impactOnTeams.leadership.roi}. `;
      answer += `Key metrics: ${topFeature.impactOnTeams.leadership.metrics.slice(0, 3).join(', ')}. `;
      answer += `Business value includes: ${topFeature.impactOnTeams.leadership.businessValue.slice(0, 2).join(' and ')}.`;
    } else if (role === 'ic') {
      answer = `${topFeature.name}: ${topFeature.impactOnTeams.ic.productivity}. `;
      answer += `Daily impact: ${topFeature.impactOnTeams.ic.dailyImpact.slice(0, 2).join(', ')}. `;
      answer += `Time saved: ${topFeature.impactOnTeams.ic.timeSaved}.`;
    } else {
      answer = `${topFeature.name}: ${topFeature.description} `;
      answer += `Key benefits: ${topFeature.keyBenefits.slice(0, 3).join(', ')}.`;
    }

    return NextResponse.json({
      answer,
      features: matchingFeatures.map(f => ({
        id: f.id,
        name: f.name,
        category: f.category,
      })),
    });
  } catch (error: any) {
    console.error('Features chat error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process question' },
      { status: 500 }
    );
  }
}

