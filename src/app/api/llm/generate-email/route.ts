import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, validateText, rateLimit } from '@/lib/security';
import { getAIProvider } from '@/lib/ai-providers';
import { log } from '@/lib/logger';

const VALID_EMAIL_TYPES = ['cold-outreach', 'follow-up', 'demo-invite', 'objection-response'] as const;
const VALID_TONES = ['professional', 'friendly', 'urgent', 'consultative'] as const;

/**
 * Build optimized email generation prompt
 * Avoids em dashes, overly professional tone, and long responses
 */
function buildEmailPrompt(request: {
  prospectName?: string;
  companyName: string;
  companyDomain?: string;
  role?: string;
  industry?: string;
  emailType: string;
  tone: string;
  context?: string;
}): string {
  const { prospectName, companyName, role, industry, emailType, tone, context } = request;
  
  const greeting = prospectName ? `Hi ${prospectName.split(' ')[0]}` : `Hi there`;
  
  let prompt = `You are a sales professional writing a ${tone} ${emailType} email to ${prospectName ? prospectName : 'a prospect'} at ${companyName}${role ? ` (${role})` : ''}${industry ? ` in the ${industry} industry` : ''}.

CRITICAL WRITING RULES:
1. NEVER use em dashes (—) or en dashes (–). Use regular hyphens (-) or commas instead.
2. Keep it SHORT: Maximum 4-5 sentences. Get to the point quickly.
3. Write like a real person, not a corporate robot. Use natural, conversational language.
4. Avoid corporate jargon, buzzwords, and overly formal phrases like "I hope this email finds you well" or "I wanted to reach out."
5. Be direct and specific. No fluff.
6. Use simple, clear sentences. Avoid complex sentence structures.
7. ${tone === 'professional' ? 'Professional but not stiff. Friendly but not casual.' : tone === 'friendly' ? 'Warm and approachable, but still professional.' : tone === 'urgent' ? 'Direct and action-oriented. Create urgency without being pushy.' : 'Consultative and helpful. Focus on understanding their needs.'}

Email Type: ${emailType}
${emailType === 'cold-outreach' ? `Goal: Introduce Cursor Enterprise and get a meeting. Focus on their specific pain points (engineering productivity, code quality, team collaboration).` : ''}
${emailType === 'follow-up' ? `Goal: Re-engage after previous contact. Reference previous conversation if applicable.` : ''}
${emailType === 'demo-invite' ? `Goal: Invite to a demo. Be specific about what they'll see and why it matters to them.` : ''}
${emailType === 'objection-response' ? `Goal: Address their concern: ${context || 'specific objection'}. Be empathetic and provide a clear solution.` : ''}

Generate ONLY the email body text (no subject line, no signature). Start directly with the greeting "${greeting}," and end with a clear call-to-action.

Example of GOOD writing:
"Hi Sarah,

I noticed ${companyName} has a large engineering team. We've helped similar companies reduce code review time by 40% with Cursor Enterprise.

Would you be open to a quick 15-minute call this week to see if this could help your team?

Thanks,
[Your name]"

Example of BAD writing (avoid this):
"Hi Sarah,

I hope this email finds you well—I wanted to reach out regarding ${companyName}'s engineering productivity initiatives. As you may be aware, many organizations are seeking innovative solutions to enhance their development workflows, and I believe Cursor Enterprise could potentially provide significant value to your team's operations.

I would be delighted to schedule a comprehensive demonstration at your earliest convenience to explore how our platform might align with your strategic objectives.

Best regards,
[Your name]"

Now write the email:`;

  return prompt;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, { maxRequests: 30, windowMs: 60000 });
    if (!rateLimitResult || !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult?.resetTime?.toString() || Date.now().toString(),
          }
        }
      );
    }

    // Validate content type
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();

    // Validate required fields
    if (!body.companyName) {
      return NextResponse.json(
        { error: 'Company name is required' },
        { status: 400 }
      );
    }

    // Sanitize and validate inputs
    const companyName = sanitizeInput(String(body.companyName), 200);
    const prospectName = body.prospectName ? sanitizeInput(String(body.prospectName), 100) : undefined;
    const companyDomain = body.companyDomain ? sanitizeInput(String(body.companyDomain), 253) : undefined;
    const role = body.role ? sanitizeInput(String(body.role), 200) : undefined;
    const industry = body.industry ? sanitizeInput(String(body.industry), 100) : undefined;
    const context = body.context ? sanitizeInput(String(body.context), 1000) : undefined;

    // Validate company name
    const nameValidation = validateText(companyName, {
      minLength: 1,
      maxLength: 200,
    });

    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid company name' },
        { status: 400 }
      );
    }

    // Validate email type
    const emailType = body.emailType || 'cold-outreach';
    if (!VALID_EMAIL_TYPES.includes(emailType as any)) {
      return NextResponse.json(
        { error: `Invalid email type. Must be one of: ${VALID_EMAIL_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate tone
    const tone = body.tone || 'professional';
    if (!VALID_TONES.includes(tone as any)) {
      return NextResponse.json(
        { error: `Invalid tone. Must be one of: ${VALID_TONES.join(', ')}` },
        { status: 400 }
      );
    }

    // Generate email using AI
    const aiProvider = getAIProvider();
    const prompt = buildEmailPrompt({
      prospectName,
      companyName,
      companyDomain,
      role,
      industry,
      emailType: emailType as any,
      tone: tone as any,
      context,
    });

    try {
      const aiResponse = await aiProvider.generateResponse(
        [{ role: 'user', content: prompt }],
        'You are a sales email writing expert. Write concise, natural, and effective sales emails. Keep emails short (4-5 sentences max). Never use em dashes. Write like a real person, not a corporate robot.'
      );

      // Clean up the response
      let emailBody = aiResponse.trim();
      
      // Remove any markdown formatting
      emailBody = emailBody.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
      
      // Remove em dashes and replace with hyphens or commas
      emailBody = emailBody.replace(/[—–]/g, '-');
      
      // Remove overly formal phrases
      emailBody = emailBody.replace(/I hope this email finds you well[,\.]?/gi, '');
      emailBody = emailBody.replace(/I wanted to reach out[,\.]?/gi, '');
      emailBody = emailBody.replace(/I hope you're doing well[,\.]?/gi, '');
      
      // Generate subject line
      const subjectPrompt = `Generate a short, compelling email subject line (max 60 characters) for a ${tone} ${emailType} email to ${prospectName ? prospectName : 'a prospect'} at ${companyName}${role ? ` (${role})` : ''} about Cursor Enterprise. Be direct and specific. No em dashes.`;
      
      const subjectResponse = await aiProvider.generateResponse(
        [{ role: 'user', content: subjectPrompt }],
        'You are a sales email subject line expert. Write short, compelling subject lines (max 60 characters). No em dashes.'
      );
      
      let subject = subjectResponse.trim().replace(/["']/g, '').replace(/[—–]/g, '-');
      if (subject.length > 60) {
        subject = subject.substring(0, 57) + '...';
      }

      // Generate CTA
      const ctaOptions = {
        'cold-outreach': 'Schedule a quick call',
        'follow-up': 'Reply to schedule',
        'demo-invite': 'Book a demo',
        'objection-response': "Let's discuss",
      };
      
      const cta = ctaOptions[emailType as keyof typeof ctaOptions] || 'Get in touch';

      return NextResponse.json({
        subject,
        body: emailBody,
        cta,
        personalization: {
          companyName,
          contactName: prospectName,
          valueProps: ['30% productivity increase', 'Enterprise security', 'Team collaboration'],
        },
      }, {
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': rateLimitResult!.remaining.toString(),
          'X-RateLimit-Reset': rateLimitResult!.resetTime.toString(),
        }
      });
    } catch (aiError: any) {
      log.error('AI email generation error', aiError);
      // Fallback to simple template
      const greeting = prospectName ? `Hi ${prospectName.split(' ')[0]},` : `Hi there,`;
      const subject = `Quick question about ${companyName}'s engineering productivity`;
      const body = `${greeting}

I noticed ${companyName}${industry ? ` is in ${industry}` : ''}. We've helped similar companies increase engineering productivity by 30%+ with Cursor Enterprise.

Would you be open to a quick 15-minute call this week?

Thanks`;
      
      return NextResponse.json({
        subject,
        body,
        cta: 'Schedule a call',
        personalization: {
          companyName,
          contactName: prospectName,
        },
      });
    }
  } catch (error: any) {
    log.error('Email template generation error', error);
    return NextResponse.json(
      { error: 'Failed to generate email template. Please try again.' },
      { status: 500 }
    );
  }
}
