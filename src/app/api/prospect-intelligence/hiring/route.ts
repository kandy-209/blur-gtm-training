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
 * POST /api/prospect-intelligence/hiring
 * Quick hiring activity check
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

    log.info('Starting hiring check', {
      websiteUrl: sanitizedUrl,
      requestId,
    });

    researchService = new ResearchService();
    const careersData = await researchService.checkHiring(sanitizedUrl);

    if (!careersData) {
      return NextResponse.json({
        success: true,
        data: {
          websiteUrl: sanitizedUrl,
          careersPageFound: false,
          message: 'Could not find careers page',
        },
        requestId,
      });
    }

    const summary = {
      websiteUrl: sanitizedUrl,
      careersPageUrl: careersData.careersPageUrl,
      totalOpenRoles: careersData.totalJobCount,
      engineeringRoles: careersData.engineeringJobCount,
      engineeringTitles: careersData.jobListings
        .filter((j) => j.isEngineering)
        .map((j) => j.title),
      jobBoardPlatform: careersData.jobBoardPlatform,
      hiringSignals: careersData.hiringUrgencySignals,
      isActivelyHiringEngineers: careersData.engineeringJobCount > 0,
      recommendation:
        careersData.engineeringJobCount >= 3
          ? 'Hot prospect - significant engineering hiring'
          : careersData.engineeringJobCount > 0
          ? 'Good signal - has open engineering roles'
          : 'Neutral - no visible engineering hiring',
    };

    return NextResponse.json({
      success: true,
      data: summary,
      requestId,
    });

  } catch (error: any) {
    log.error('Hiring check error', error instanceof Error ? error : new Error(String(error)), {
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








