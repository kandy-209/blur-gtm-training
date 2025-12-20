import { NextRequest, NextResponse } from 'next/server';
import { enterpriseFeatures } from '@/data/enterprise-features';

export async function POST(request: NextRequest) {
  try {
    const { question, view = 'overview' } = await request.json();

    if (!question || typeof question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      );
    }

    // Simple keyword matching to find relevant features
    const questionLower = question.toLowerCase();
    const matchingFeatures = enterpriseFeatures.filter(feature => {
      const searchText = `${feature.name} ${feature.description} ${feature.keyBenefits.join(' ')}`.toLowerCase();
      return searchText.includes(questionLower) || 
             feature.keyBenefits.some(b => b.toLowerCase().includes(questionLower)) ||
             feature.useCases.some(u => u.toLowerCase().includes(questionLower));
    });

    let answer = '';
    const mentionedFeatures: Array<{ id: string; name: string; category: string }> = [];

    if (matchingFeatures.length > 0) {
      const topFeature = matchingFeatures[0];
      mentionedFeatures.push({
        id: topFeature.id,
        name: topFeature.name,
        category: topFeature.category
      });

      if (view === 'leadership') {
        answer = `${topFeature.name}: ${topFeature.salesTalkingPoints.leadership.value}. `;
        answer += `Key metrics: ${topFeature.salesTalkingPoints.leadership.metrics.slice(0, 3).join(', ')}. `;
        answer += `Business value includes: ${topFeature.salesTalkingPoints.leadership.businessValue.slice(0, 2).join(' and ')}.`;
      } else if (view === 'technical') {
        answer = `${topFeature.name}: ${topFeature.description}. `;
        answer += `Capabilities: ${topFeature.salesTalkingPoints.technical.capabilities.slice(0, 3).join(', ')}. `;
        answer += `Implementation: ${topFeature.salesTalkingPoints.technical.implementation.slice(0, 2).join(' and ')}.`;
      } else {
        answer = `${topFeature.name}: ${topFeature.description}. `;
        answer += `Key benefits: ${topFeature.keyBenefits.slice(0, 3).join(', ')}. `;
        answer += `Use cases: ${topFeature.useCases.slice(0, 2).join(' and ')}.`;
      }

      // Add documentation link if available
      if (topFeature.documentation.resources.docsUrl) {
        answer += ` For more details, see: ${topFeature.documentation.resources.docsUrl}`;
      }
    } else {
      // General enterprise information
      if (view === 'leadership') {
        answer = 'Browserbase provides comprehensive security, compliance, and administrative controls for organizations deploying browser automation at scale. ';
        answer += 'Key value propositions include SOC 2 Type II certification, GDPR compliance, SSO/SCIM integration, and advanced analytics. ';
        answer += 'These features enable browser automation adoption in regulated industries while reducing IT overhead and improving security posture.';
      } else if (view === 'technical') {
        answer = 'Browserbase includes features like managed infrastructure, automatic scaling, proxy management, and comprehensive Identity & Access Management. Technical capabilities include browser session management, ';
        answer += 'data encryption, secure API access, and advanced network configuration options for enterprise deployments.';
      } else {
        answer = 'Browserbase offers enterprise-grade security, compliance, and administrative controls. ';
        answer += 'Key features include Security & Compliance (SOC 2 Type II), Identity & Access Management (SSO, SCIM), ';
        answer += 'Privacy & Data Governance, Hooks for agent control, Team Rules, Analytics, Audit Logs, and Sandbox Mode. ';
        answer += 'These features enable organizations to deploy AI-assisted development at scale with confidence.';
      }
    }

    return NextResponse.json({
      answer,
      features: mentionedFeatures
    });
  } catch (error: any) {
    console.error('Error in enterprise chat:', error);
    return NextResponse.json(
      { error: 'Failed to process question', details: error.message },
      { status: 500 }
    );
  }
}

