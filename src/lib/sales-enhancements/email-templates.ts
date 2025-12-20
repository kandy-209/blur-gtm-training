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
      // Gong-style: short, concrete, interest-based CTA
      subject = `${companyName || 'your team'} engineering`;
      body = `${greetings[tone]}

I work with engineering teams like ${companyName || 'yours'} to make shipping code and code reviews feel lighter without adding more process.

If it’s relevant, I can send a brief overview of how teams are using Browserbase to keep velocity high and reviews focused.

Would it be worth exploring?`;
      cta = 'Worth exploring?';
      break;

    case 'follow-up':
      subject = `${companyName || 'browserbase'} follow-up`;
      body = `${greetings[tone]}

Just checking whether our last note about Browserbase and your browser automation needs is still on your radar.

If it is, I can share a concise overview of how teams like ${companyName || 'yours'} scale web scraping and testing with Browserbase.

Still interested in exploring?`;
      cta = 'Still interested?';
      break;

    case 'demo-invite':
      subject = `${companyName || 'browserbase'} demo`;
      body = `${greetings[tone]}

I can walk you through a short Browserbase demo focused on how your team handles browser automation today and where infrastructure management slows things down.

If that would be helpful, I can send a couple of time options or a quick loom so you can see it in action first.

Would you like to see a quick demo?`;
      cta = 'Book a demo';
      break;

    case 'objection-response':
      subject = `about browserbase`;
      body = `${greetings[tone]}

You mentioned concerns about ${request.context || 'rolling out a new tool'}. That’s fair, so I wanted to acknowledge it directly and share how similar teams approached it in a lightweight way.

If it’s still on your mind, I’m happy to send a short summary of what worked for them and let you react.

How does that sound?`;
      cta = "Share your thoughts";
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

