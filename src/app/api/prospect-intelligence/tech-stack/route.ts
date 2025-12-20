import { NextRequest, NextResponse } from 'next/server';
import { ResearchService } from '@/lib/prospect-intelligence/research-service';
import { sanitizeInput } from '@/lib/security';
import { handleError } from '@/lib/error-handler';
import { log, generateRequestId } from '@/lib/logger';
import { z } from 'zod';

const requestSchema = z.object({
  websiteUrl: z.string().url('Invalid website URL'),
});

/**
 * POST /api/prospect-intelligence/tech-stack
 * Quick tech stack check without full research
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  let researchService: ResearchService | null = null;

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
    const { websiteUrl } = validated;
    const sanitizedUrl = sanitizeInput(websiteUrl, 500);

    // Validate environment variables
    if (!process.env.BROWSERBASE_API_KEY || !process.env.BROWSERBASE_PROJECT_ID || !process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'Required environment variables not configured' },
        { status: 500 }
      );
    }

    log.info('Starting tech stack check', {
      websiteUrl: sanitizedUrl,
      requestId,
    });

    researchService = new ResearchService();
    const techDetection = await researchService.checkTechStack(sanitizedUrl);

    const primaryFramework = techDetection.detectedFromSource[0]?.technology || 'Unknown';
    const isModernStack = ['React', 'Next.js', 'Vue.js', 'Angular', 'Svelte'].some(
      (fw) => techDetection.detectedFromSource.some((d) => d.technology === fw)
    );

    return NextResponse.json({
      success: true,
      data: {
        websiteUrl: sanitizedUrl,
        primaryFramework,
        confidence: techDetection.detectedFromSource[0]?.confidence || 'low',
        allDetectedTech: techDetection.detectedFromSource.map((d) => d.technology),
        thirdPartyTools: techDetection.detectedFromScripts,
        isModernJSStack: isModernStack,
        recommendation: isModernStack
          ? 'Good fit - uses modern JavaScript framework'
          : 'May not use modern JS framework - verify before prioritizing',
      },
      requestId,
    });

  } catch (error: any) {
    log.error('Tech stack check error', error instanceof Error ? error : new Error(String(error)), {
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
  } finally {
    if (researchService) {
      try {
        await researchService.close();
      } catch (cleanupError) {
        log.error('Error closing research service', cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError)), {
          requestId,
        });
      }
    }
  }
}







