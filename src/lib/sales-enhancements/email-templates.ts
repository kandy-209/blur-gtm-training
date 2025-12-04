/**
 * AI-Powered Email Template Generation
 * Creates personalized email templates for sales outreach
 */

interface EmailTemplate {
  subject: string;
  body: string;
  cta: string;
  personalization: {
    companyName?: string;
    contactName?: string;
    painPoints?: string[];
    valueProps?: string[];
  };
  variants?: Array<{
    subject: string;
    body: string;
    cta: string;
  }>;
}

interface TemplateRequest {
  prospectName?: string;
  companyName: string;
  companyDomain?: string;
  role?: string;
  industry?: string;
  painPoints?: string[];
  emailType: 'cold-outreach' | 'follow-up' | 'demo-invite' | 'objection-response';
  tone?: 'professional' | 'friendly' | 'urgent' | 'consultative';
  context?: string;
}

/**
 * Generate email template using AI
 */
export async function generateEmailTemplate(
  request: TemplateRequest
): Promise<EmailTemplate> {
  // Use fallback for now - LLM generation will be handled by the API route directly
  return generateEmailTemplateFallback(request);
}

/**
 * Fallback template generation (rule-based)
 */
function generateEmailTemplateFallback(request: TemplateRequest): EmailTemplate {
  const { prospectName, companyName, emailType, tone = 'professional' } = request;

  const greetings: Record<string, string> = {
    professional: prospectName ? `Hi ${prospectName.split(' ')[0]},` : `Hello ${companyName} team,`,
    friendly: prospectName ? `Hey ${prospectName.split(' ')[0]}!` : `Hi there!`,
    urgent: `Hi ${prospectName?.split(' ')[0] || companyName},`,
    consultative: prospectName ? `Hi ${prospectName.split(' ')[0]},` : `Hello,`,
  };

  const closings: Record<string, string> = {
    professional: 'Best regards',
    friendly: 'Best',
    urgent: 'Looking forward to your response',
    consultative: 'Best regards',
  };

  let subject = '';
  let body = '';
  let cta = '';

  switch (emailType) {
    case 'cold-outreach':
      subject = `Quick question about ${companyName}'s engineering productivity`;
      body = `${greetings[tone]}

I noticed ${companyName} is in the ${request.industry || 'technology'} space. I wanted to reach out because we've helped similar companies increase their engineering team's productivity by 30%+ using AI-powered coding tools.

Would you be open to a brief 15-minute conversation to see if this could be valuable for your team?

${closings[tone]}`;
      cta = 'Schedule a quick call';
      break;

    case 'follow-up':
      subject = `Following up on ${companyName}`;
      body = `${greetings[tone]}

I wanted to follow up on my previous message about Cursor Enterprise. I understand you're likely busy, but I believe this could significantly impact ${companyName}'s engineering velocity.

Would you be available for a quick 10-minute call this week?

${closings[tone]}`;
      cta = 'Reply to schedule';
      break;

    case 'demo-invite':
      subject = `Demo: How ${companyName} can accelerate engineering productivity`;
      body = `${greetings[tone]}

I'd love to show you how Cursor Enterprise can help ${companyName}'s engineering team ship faster and reduce technical debt.

Are you available for a 30-minute demo this week? I can show you:
- Real-time codebase understanding
- Enterprise security and compliance
- Team collaboration features
- ROI calculator specific to your team size

${closings[tone]}`;
      cta = 'Book a demo';
      break;

    case 'objection-response':
      subject = `Addressing your concerns about Cursor Enterprise`;
      body = `${greetings[tone]}

I understand your concerns about ${request.context || 'implementation'}. Let me address those directly:

[Address specific objection here]

Would you be open to a quick call to discuss this further?

${closings[tone]}`;
      cta = "Let's discuss";
      break;
  }

  return {
    subject,
    body,
    cta,
    personalization: {
      companyName,
      contactName: prospectName,
      painPoints: request.painPoints,
      valueProps: ['30% productivity increase', 'Enterprise security', 'Team collaboration'],
    },
  };
}

/**
 * Generate multiple A/B test variants
 */
export async function generateEmailVariants(
  baseTemplate: EmailTemplate,
  count: number = 3
): Promise<EmailTemplate['variants']> {
  const variants: EmailTemplate['variants'] = [];

  // Generate variants with different subject lines and CTAs
  // Ensure we always create unique variants
  const subjectVariants: string[] = [];
  const baseSubject = baseTemplate.subject;
  
  // Create unique subject variants
  if (baseSubject.includes('Quick question')) {
    subjectVariants.push(
      baseSubject,
      baseSubject.replace('Quick question', 'Quick thought'),
      baseSubject.replace('Quick question', 'Idea for')
    );
  } else if (baseSubject.includes('Following up')) {
    subjectVariants.push(
      baseSubject,
      baseSubject.replace('Following up', 'Re:'),
      baseSubject.replace('Following up', 'Quick follow-up')
    );
  } else if (baseSubject.includes('Demo:')) {
    subjectVariants.push(
      baseSubject,
      baseSubject.replace('Demo:', 'See how'),
      baseSubject.replace('Demo:', 'Discover')
    );
  } else {
    // Generic variants for any subject
    subjectVariants.push(
      baseSubject,
      `${baseSubject} - Quick question`,
      `Re: ${baseSubject}`
    );
  }

  const ctaVariants = [
    baseTemplate.cta,
    'Learn more',
    'Get started',
    'Schedule a call',
    'Reply to learn more',
  ];

  // Limit variants to available subject/CTA combinations
  const maxVariants = Math.min(count, subjectVariants.length, ctaVariants.length);
  for (let i = 0; i < maxVariants; i++) {
    variants.push({
      subject: subjectVariants[i] || `${baseSubject} (Variant ${i + 1})`,
      body: baseTemplate.body,
      cta: ctaVariants[i] || baseTemplate.cta,
    });
  }

  return variants;
}

