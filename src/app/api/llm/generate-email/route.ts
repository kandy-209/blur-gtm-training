import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput, validateText, rateLimit } from '@/lib/security';
import { getAIProvider } from '@/lib/ai-providers';
import { log } from '@/lib/logger';
import { STYLE_CONFIG } from '@/lib/email-style/bbqConfig';
import { cleanText } from '@/lib/email-style/bbqCleaner';
import type { EmailStyle } from '@/lib/email-style/types';

const VALID_EMAIL_TYPES = ['cold-outreach', 'follow-up', 'demo-invite', 'objection-response'] as const;
const VALID_TONES = ['professional', 'friendly', 'urgent', 'consultative'] as const;

/**
 * Build optimized email generation prompt
 * Avoids em dashes, fluff, and long, rambling responses.
 * Inspired by Gong-style best practices and BBQ-it styles.
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
  style: EmailStyle;
}): string {
  const { prospectName, companyName, role, industry, emailType, tone, context, style } = request;
  const { minWords, maxWords } = STYLE_CONFIG[style];
  const wordRangeText = `${minWords}–${maxWords} words`;
  const styleNote =
    style === 'exec_concise'
      ? 'Write for a busy VP: open with the concrete situation in the first sentence and keep every line tight.'
      : 'Sound like two people talking at a BBQ: relaxed but clear and direct.';
  
  const greeting = prospectName ? `Hi ${prospectName.split(' ')[0]}` : `Hi there`;
  
  let prompt = `You are a sales professional writing a ${tone} ${emailType} email to ${prospectName ? prospectName : 'a prospect'} at ${companyName}${role ? ` (${role})` : ''}${industry ? ` in the ${industry} industry` : ''}.

CRITICAL WRITING RULES (Gong-style, BBQ-it):
1. NEVER use em dashes (—) or en dashes (–). Use regular hyphens (-) or commas instead.
2. Hard cap: keep the email between ${wordRangeText}. Fewer words are better if the message is still clear.
3. No fluff or filler. Do NOT use phrases like "I hope this email finds you well", "I wanted to reach out", "just checking in", "circling back", or "touching base".
4. Focus on ONE main idea and ONE clear call-to-action.
5. For cold-outreach and follow-up, the CTA should ask for their INTEREST (for example: "Would it be worth exploring?") rather than asking for a specific time.
6. Write like a real person, not a corporate robot. Use natural, conversational language that feels like an internal email.
7. Avoid ROI/percentage-heavy language in the first email (no "increase revenue by 30%" style claims). Focus on concrete pains and outcomes instead.
8. Use simple, clear sentences. Avoid complex sentence structures and buzzwords.
9. ${tone === 'professional' ? 'Professional but not stiff. Friendly but not casual.' : tone === 'friendly' ? 'Warm and approachable, but still professional.' : tone === 'urgent' ? 'Direct and action-oriented without sounding pushy.' : 'Consultative and helpful. Focus on understanding their needs.'}
10. ${styleNote}

Email Type: ${emailType}
${emailType === 'cold-outreach' ? `Goal: Spark interest in Browserbase and start a conversation about their specific pains (browser automation, testing, web scraping, headless browser infrastructure) without hard-selling or overloading details.` : ''}
${emailType === 'follow-up' ? `Goal: Re-engage after previous contact, remind them of the value in one sentence, and confirm if they're still interested.` : ''}
${emailType === 'demo-invite' ? `Goal: Invite them to a focused demo that clearly ties Browserbase to their world. Be explicit about what they'll see and why it matters to them.` : ''}
${emailType === 'objection-response' ? `Goal: Address their concern: ${context || 'specific objection'}. Be empathetic, acknowledge the concern directly, and propose a simple next step if they're still interested.` : ''}

Generate ONLY the email body text (no subject line, no signature). Start directly with the greeting "${greeting}," and end with a single, clear call-to-action that asks for their interest (for example: "Would it be worth exploring?") rather than asking for a specific time.

Example of GOOD writing (structure and tone only, not exact wording):
"Hi Sarah,

I noticed ${companyName} has a large engineering team. Teams like yours use Browserbase to automate browser workflows and scale web scraping without managing infrastructure.

Would it be worth a quick look to see if this approach could help your team?

Thanks,
[Your name]"

Example of BAD writing (avoid this):
"Hi Sarah,

I hope this email finds you well—I wanted to reach out regarding ${companyName}'s browser automation initiatives. As you may be aware, many organizations are seeking innovative solutions to enhance their development workflows, and I believe Browserbase could potentially provide significant value to your team's operations.

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

    // Validate style (optional, defaults to bbq_plain)
    const style: EmailStyle =
      body.style === 'exec_concise' ? 'exec_concise' : 'bbq_plain';

    // Generate email using AI
    const prompt = buildEmailPrompt({
      prospectName,
      companyName,
      companyDomain,
      role,
      industry,
      emailType: emailType as any,
      tone: tone as any,
      context,
      style,
    });

    try {
      const aiProvider = getAIProvider();

      const aiResponse = await aiProvider.generateResponse(
        [{ role: 'user', content: prompt }],
        'You are a sales email writing expert. Write concise, natural, and effective sales emails. Keep emails short (4-5 sentences max). Never use em dashes. Write like a real person, not a corporate robot.'
      );
      
      // Extract plain text email body from provider response (which may be JSON)
      let rawEmailBody = aiResponse;
      try {
        const parsed = JSON.parse(aiResponse);
        if (parsed && typeof parsed === 'object') {
          const candidate =
            (parsed as any).agent_response_text ||
            (parsed as any).body ||
            (parsed as any).text ||
            (parsed as any).email ||
            (parsed as any).emailBody;
          if (typeof candidate === 'string' && candidate.trim()) {
            rawEmailBody = candidate;
          }
        }
      } catch {
        // Not JSON - treat as plain text
      }

      // Clean up the response
      let emailBody = rawEmailBody.trim();
      
      // Remove any markdown formatting
      emailBody = emailBody.replace(/```[\w]*\n?/g, '').replace(/```/g, '');
      
      // Remove em dashes and replace with hyphens or commas
      emailBody = emailBody.replace(/[—–]/g, '-');

      // Apply BBQ-it cleaner (buzzwords, filler, light normalization)
      const cleaned = cleanText(emailBody, style);
      emailBody = cleaned.revised;
      
      // Generate subject line (Gong-style: ultra-short, internal-feeling)
      const subjectPrompt = `Generate a short, compelling email subject line (max 40 characters, max 4 words) for a ${tone} ${emailType} email to ${prospectName ? prospectName : 'a prospect'} at ${companyName}${role ? ` (${role})` : ''} about Browserbase.

CRITICAL SUBJECT LINE RULES:
1. Use at most 4 words.
2. Avoid full sentences. Use short, specific phrases that feel like internal emails (for example: "code review slowdowns", "${companyName} engineering", "shipping velocity").
3. Use lowercase except for proper nouns.
4. No emojis, no exclamation marks, no hype.
5. No em dashes.`;
      
      const subjectResponse = await aiProvider.generateResponse(
        [{ role: 'user', content: subjectPrompt }],
        'You are a sales email subject line expert following Gong-style best practices. Write ultra-short, specific subject lines (max 4 words, max 40 characters) that feel like internal emails. No fluff, no exclamation marks, no emojis, no em dashes.'
      );

      // Extract subject text from provider response (which may be JSON)
      let rawSubject = subjectResponse;
      try {
        const parsed = JSON.parse(subjectResponse);
        if (parsed && typeof parsed === 'object') {
          const candidate =
            (parsed as any).agent_response_text ||
            (parsed as any).subject ||
            (parsed as any).text;
          if (typeof candidate === 'string' && candidate.trim()) {
            rawSubject = candidate;
          }
        }
      } catch {
        // Not JSON - treat as plain text
      }

      let subject = rawSubject.trim().replace(/["']/g, '').replace(/[—–]/g, '-');
      if (subject.length > 40) {
        subject = subject.substring(0, 37) + '...';
      }

      // Generate CTA (interest-based where appropriate, per Gong)
      const ctaOptions = {
        'cold-outreach': 'Worth exploring?',
        'follow-up': 'Still interested?',
        'demo-invite': 'Book a demo',
        'objection-response': "Share your thoughts",
      };
      
      const cta = ctaOptions[emailType as keyof typeof ctaOptions] || 'Get in touch';

      return NextResponse.json({
        subject,
        body: emailBody,
        cta,
        bbqScore: cleaned.bbqScore,
        issues: cleaned.lintAfter.issues,
        style,
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
      // Fallback to simple, Gong-style template (short, no fluff)
      const greeting = prospectName ? `Hi ${prospectName.split(' ')[0]},` : `Hi there,`;
      const subject = `${companyName} browser automation`;
      const body = `${greeting}

I work with teams like ${companyName} to scale browser automation and web scraping without managing infrastructure.

If you’re open to it, I can send a brief overview of how teams are using Browserbase to move faster without adding process.

Would it be worth exploring?`;

      const cleaned = cleanText(body, style);
      
      return NextResponse.json({
        subject,
        body: cleaned.revised,
        cta: 'Worth exploring?',
        bbqScore: cleaned.bbqScore,
        issues: cleaned.lintAfter.issues,
        style,
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
