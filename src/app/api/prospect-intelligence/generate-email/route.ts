import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/error-handler';
import { log, generateRequestId } from '@/lib/logger';
import { z } from 'zod';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import type { ProspectIntelligence } from '@/lib/prospect-intelligence/types';

const requestSchema = z.object({
  prospectData: z.any(), // ProspectIntelligence schema
  tone: z.enum(['professional', 'friendly', 'direct', 'consultative']),
  recipientName: z.string().optional(),
  recipientTitle: z.string().optional(),
  llmProvider: z.enum(['claude', 'gemini']).optional(),
});

/**
 * POST /api/prospect-intelligence/generate-email
 * Generates personalized outreach email based on prospect intelligence
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validated = requestSchema.parse(body);
    const { prospectData, tone, recipientName, recipientTitle, llmProvider = 'claude' } = validated;

    const prompt = `Generate a personalized sales outreach email for Browserbase based on the following prospect intelligence:

Company: ${prospectData.companyName}
Industry: ${prospectData.industry}
Tech Stack: ${prospectData.techStack.primaryFramework || 'Unknown'}
B2B SaaS: ${prospectData.isB2BSaaS ? 'Yes' : 'No'}
Hiring Engineers: ${prospectData.hiring.hasOpenEngineeringRoles ? `Yes (${prospectData.hiring.engineeringRoleCount || 'multiple'} roles)` : 'No'}
Engineering Blog: ${prospectData.engineeringCulture.hasEngineeringBlog ? 'Yes' : 'No'}
ICP Score: ${prospectData.icpScore.overallScore}/10
Talking Points: ${prospectData.icpScore.recommendedTalkingPoints.join(', ')}

Recipient: ${recipientName || 'Engineering Leader'}
Title: ${recipientTitle || 'Engineering Leader'}

Tone: ${tone}

Generate a professional, personalized email that:
1. Opens with a relevant hook based on their tech stack or hiring activity
2. Introduces Browserbase and its value proposition
3. References specific talking points from the prospect intelligence
4. Includes a clear call-to-action for a demo or call
5. Is concise (under 150 words)
6. Uses the specified tone

Return ONLY a valid JSON object with "subject" and "body" fields. Do not include any markdown formatting or code blocks. Example format:
{"subject": "Email subject here", "body": "Email body here"}`;

    // Try Gemini first if specified, otherwise try Claude, then fallback
    if (llmProvider === 'gemini' && process.env.GOOGLE_GEMINI_API_KEY) {
      try {
        const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        // Try to parse JSON from response
        try {
          const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json({
              success: true,
              subject: parsed.subject || `Quick question about ${prospectData.companyName}'s ${prospectData.techStack.primaryFramework || 'tech'} stack`,
              body: parsed.body || generateFallbackEmail(prospectData, tone, recipientName, recipientTitle).body,
              requestId,
              provider: 'gemini',
            });
          }
        } catch (parseError) {
          log.warn('Failed to parse Gemini response as JSON', { error: parseError, responseText, requestId });
        }
      } catch (aiError) {
        log.warn('Gemini email generation failed, trying fallback', { error: aiError, requestId });
      }
    }

    // Use Claude (Anthropic) to generate personalized email if available
    if ((llmProvider === 'claude' || !llmProvider) && process.env.ANTHROPIC_API_KEY) {
      try {
        const anthropic = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });

        const message = await anthropic.messages.create({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 1000,
          temperature: 0.7,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        });

        const responseText = message.content[0]?.type === 'text' ? message.content[0].text : '';
        
        // Try to parse JSON from response
        try {
          // Remove any markdown code blocks if present
          const cleanedText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return NextResponse.json({
              success: true,
              subject: parsed.subject || `Quick question about ${prospectData.companyName}'s ${prospectData.techStack.primaryFramework || 'tech'} stack`,
              body: parsed.body || generateFallbackEmail(prospectData, tone, recipientName, recipientTitle).body,
              requestId,
              provider: 'claude',
            });
          }
        } catch (parseError) {
          log.warn('Failed to parse Claude response as JSON', { error: parseError, responseText, requestId });
        }
      } catch (aiError) {
        log.warn('Claude email generation failed, using template', { error: aiError, requestId });
      }
    }

    // Fallback to template-based generation
    const email = generateFallbackEmail(prospectData, tone, recipientName, recipientTitle);

    return NextResponse.json({
      success: true,
      subject: email.subject,
      body: email.body,
      requestId,
      note: process.env.ANTHROPIC_API_KEY ? 'Generated using template fallback' : 'ANTHROPIC_API_KEY not configured, using template',
    });

  } catch (error: any) {
    log.error('Email generation error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
    });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation error',
          details: error.errors,
          requestId,
        },
        { status: 400 }
      );
    }

    return handleError(error, requestId);
  }
}

function generateFallbackEmail(
  prospectData: ProspectIntelligence,
  tone: string,
  recipientName?: string,
  recipientTitle?: string
): { subject: string; body: string } {
  const companyName = prospectData.companyName;
  const framework = prospectData.techStack.primaryFramework || 'modern JavaScript';
  const hiringSignal = prospectData.hiring.hasOpenEngineeringRoles
    ? `I noticed you're actively hiring ${prospectData.hiring.engineeringRoleCount || 'multiple'} engineering roles`
    : '';
  const blogSignal = prospectData.engineeringCulture.hasEngineeringBlog
    ? `I've been following your engineering blog and love your approach to ${prospectData.engineeringCulture.recentBlogTopics[0] || 'engineering culture'}`
    : '';

  const toneMap: Record<string, { greeting: string; opening: string; closing: string }> = {
    professional: {
      greeting: recipientName ? `Hi ${recipientName},` : `Hi there,`,
      opening: `I came across ${companyName} and was impressed by your work.`,
      closing: `Best regards,`,
    },
    friendly: {
      greeting: recipientName ? `Hey ${recipientName},` : `Hey,`,
      opening: `I've been checking out ${companyName} - really cool stuff you're building!`,
      closing: `Cheers,`,
    },
    direct: {
      greeting: recipientName ? `Hi ${recipientName},` : `Hi,`,
      opening: `${companyName} caught my attention.`,
      closing: `Best,`,
    },
    consultative: {
      greeting: recipientName ? `Hi ${recipientName},` : `Hello,`,
      opening: `I've been researching companies in your space and ${companyName} stands out.`,
      closing: `Looking forward to connecting,`,
    },
  };

  const selectedTone = toneMap[tone] || toneMap.professional;

  const subject = `Quick question about ${companyName}'s ${framework} stack`;
  
  const body = `${selectedTone.greeting}

${selectedTone.opening} ${hiringSignal || blogSignal || `I noticed you're using ${framework} for your frontend.`}

I'm reaching out because I think Browserbase could be a game-changer for your engineering team. Here's why:

${prospectData.icpScore.recommendedTalkingPoints.slice(0, 3).map((point, idx) => `${idx + 1}. ${point}`).join('\n')}

Browserbase provides cloud-based browser automation that integrates seamlessly with ${framework} applications, helping engineering teams:
• Automate testing and QA workflows
• Run browser-based integrations without infrastructure overhead
• Scale browser automation without managing servers

${prospectData.hiring.hasOpenEngineeringRoles ? `Given that you're actively hiring engineers, I thought this might be particularly relevant as you scale your team.` : ''}

Would you be open to a quick 15-minute call to discuss how Browserbase could help ${companyName}? I'm happy to show you a quick demo tailored to your stack.

${selectedTone.closing}
[Your Name]
Browserbase`;

  return { subject, body };
}

