import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';
import { handleError } from '@/lib/error-handler';
import { log, generateRequestId } from '@/lib/logger';
import { z } from 'zod';
import { getCachedProspect, cacheProspect } from '@/lib/prospect-intelligence/cache';
import { checkProspectExists, saveProspectResearch } from '@/lib/prospect-intelligence/persistence';
import { getUserIdFromRequest } from '@/lib/prospect-intelligence/auth-helper';

// Dynamic import to avoid bundling server-only dependencies
async function getResearchService() {
  const { ResearchService } = await import('@/lib/prospect-intelligence/research-service');
  return ResearchService;
}

const requestSchema = z.object({
  websiteUrl: z.string().url('Invalid website URL'),
  companyName: z.string().optional(),
});

/**
 * POST /api/prospect-intelligence/research
 * Performs comprehensive sales intelligence research on a prospect company
 */
export async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  let researchService: any = null;

  try {
    // Validate content type
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validated = requestSchema.parse(body);
    
    const { websiteUrl, companyName } = validated;
    const sanitizedUrl = sanitizeInput(websiteUrl, 500);

    // Validate environment variables
    if (!process.env.BROWSERBASE_API_KEY) {
      return NextResponse.json(
        { 
          error: 'BROWSERBASE_API_KEY environment variable is not configured',
          message: 'Please add BROWSERBASE_API_KEY to your .env.local file. Get your key from https://www.browserbase.com/settings/api-keys'
        },
        { status: 500 }
      );
    }
    if (!process.env.BROWSERBASE_PROJECT_ID) {
      return NextResponse.json(
        { 
          error: 'BROWSERBASE_PROJECT_ID environment variable is not configured',
          message: 'Please add BROWSERBASE_PROJECT_ID to your .env.local file. Get your project ID from https://www.browserbase.com/settings/projects'
        },
        { status: 500 }
      );
    }
    // Check if at least one LLM API key is configured
    const hasClaude = !!process.env.ANTHROPIC_API_KEY;
    const hasGemini = !!process.env.GOOGLE_GEMINI_API_KEY;
    const hasOpenAI = !!process.env.OPENAI_API_KEY;
    
    if (!hasClaude && !hasGemini && !hasOpenAI) {
      return NextResponse.json(
        { 
          error: 'No LLM API key configured',
          message: 'Stagehand requires at least one LLM API key. Recommended: ANTHROPIC_API_KEY (free tier available). Alternatively: GOOGLE_GEMINI_API_KEY or OPENAI_API_KEY. OpenAI is optional and only used if explicitly requested.',
          helpUrl: 'https://docs.stagehand.dev/configuration/models',
          recommended: 'Get a free Anthropic API key at https://console.anthropic.com/settings/keys'
        },
        { status: 500 }
      );
    }

    log.info('Starting prospect intelligence research', {
      websiteUrl: sanitizedUrl,
      companyName,
      requestId,
    });

    // Step 1: Check cache first (fastest)
    const cachedResult = await getCachedProspect(sanitizedUrl);
    if (cachedResult) {
      log.info('Prospect intelligence retrieved from cache', {
        websiteUrl: sanitizedUrl,
        requestId,
      });
      return NextResponse.json({
        success: true,
        data: cachedResult,
        requestId,
        cached: true,
      }, {
        headers: {
          'X-Request-ID': requestId,
          'X-Cache': 'HIT',
        },
      });
    }

    // Step 2: Check database (if user is authenticated)
    const userId = await getUserIdFromRequest(request);

    if (userId) {
      const existingProspect = await checkProspectExists(userId, sanitizedUrl);
      if (existingProspect) {
        // Cache it for faster future access
        await cacheProspect(sanitizedUrl, existingProspect.data);
        
        log.info('Prospect intelligence retrieved from database', {
          websiteUrl: sanitizedUrl,
          requestId,
          prospectId: existingProspect.id,
        });
        
        return NextResponse.json({
          success: true,
          data: existingProspect.data,
          requestId,
          saved: true,
          prospectId: existingProspect.id,
        }, {
          headers: {
            'X-Request-ID': requestId,
            'X-Cache': 'DATABASE',
          },
        });
      }
    }

    // Step 3: Perform new research (cache miss, not in database)
    const ResearchService = await getResearchService();
    researchService = new ResearchService();
    
    // Perform research with timeout
    const researchPromise = researchService.researchProspect(
      sanitizedUrl,
      companyName
    );

    // Set overall timeout of 240 seconds (4 minutes) - research can take time
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Research timeout after 240 seconds')), 240000);
    });

    const result = await Promise.race([researchPromise, timeoutPromise]);

    // Step 4: Cache the result
    await cacheProspect(sanitizedUrl, result);

    // Step 5: Save to database (if user is authenticated)
    let savedProspectId: string | null = null;
    if (userId) {
      try {
        const saved = await saveProspectResearch(userId, result as any);
        savedProspectId = saved.id;
        log.info('Prospect intelligence saved to database', {
          websiteUrl: sanitizedUrl,
          requestId,
          prospectId: saved.id,
        });
      } catch (saveError) {
        // Don't fail the request if save fails - just log it
        log.warn('Failed to save prospect to database (non-fatal)', saveError instanceof Error ? saveError : new Error(String(saveError)), {
          websiteUrl: sanitizedUrl,
          requestId,
        });
      }
    }

    log.info('Prospect intelligence research completed', {
      websiteUrl: sanitizedUrl,
      requestId,
      duration: (result as any).extractionDurationMs,
      saved: !!savedProspectId,
    });

    return NextResponse.json({
      success: true,
      data: result,
      requestId,
      cached: false,
      saved: !!savedProspectId,
      prospectId: savedProspectId,
    }, {
      headers: {
        'X-Request-ID': requestId,
        'X-Cache': 'MISS',
      },
    });

  } catch (error: any) {
    
    const errorMsg = error?.message || String(error);
    const errorStr = String(error);
    const isBrowserbaseIssue = (error as any)?.isBrowserbaseCompatibilityIssue;
    // Debug logging disabled by default - enable with ENABLE_DEBUG_TELEMETRY=true
    
    log.error('Prospect intelligence research error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
    });
    
    // Provide helpful error message for Browserbase compatibility issues
    if (isBrowserbaseIssue) {
      const modelName = (error as any)?.modelName || 'unknown';
      return NextResponse.json(
        {
          error: 'Browserbase + Claude Integration Error',
          message: errorMsg,
          code: 'BROWSERBASE_CLAUDE_404',
          details: {
            modelName: modelName,
            issue: 'Browserbase cannot find Claude model when calling Anthropic API',
            browserbaseStatus: 'Automation executes successfully, but LLM calls fail with 404',
          },
          actionRequired: 'Contact Browserbase support immediately - this is a Browserbase integration issue, not a code issue',
          suggestions: [
            'Contact Browserbase support with error code BROWSERBASE_CLAUDE_404 and model name',
            'Provide them with: model name, API key format (starts with sk-ant-), and this error message',
            'Ask them to verify their integration with Anthropic API and model name forwarding',
            'Temporary workaround: If available, add OPENAI_API_KEY to use GPT-4o (works with Browserbase)'
          ],
          supportInfo: {
            browserbaseSupport: 'https://browserbase.com/support',
            anthropicDocs: 'https://docs.anthropic.com/en/docs/models-overview',
            errorCode: 'BROWSERBASE_CLAUDE_404'
          }
        },
        { status: 500 }
      );
    }

    // Handle validation errors
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

    // Handle network errors (HTTP/2 protocol errors, connection issues, etc.)
    if (error.message?.includes('ERR_HTTP2_PROTOCOL_ERROR') || 
        error.message?.includes('net::ERR_') ||
        error.message?.includes('page.goto')) {
      return NextResponse.json(
        {
          error: 'Network error',
          message: `Unable to access the website: ${error.message}. This may be due to bot protection, network issues, or the site blocking automated browsers.`,
          requestId,
          suggestions: [
            'The website may have bot protection that blocks automated browsers',
            'Try a different website or check if the site is accessible in a regular browser',
            'Some sites require JavaScript to load properly - this may cause navigation errors'
          ],
          errorType: 'NETWORK_ERROR',
        },
        { status: 502 }
      );
    }

    // Handle timeout errors
    if (error.message?.includes('timeout')) {
      return NextResponse.json(
        {
          error: 'Research timeout',
          message: 'The research took longer than 4 minutes to complete. This can happen with complex websites. Please try again with a simpler website or check if the website is accessible.',
          requestId,
          suggestion: 'Try researching a simpler website or check Browserbase session limits.',
        },
        { status: 504 }
      );
    }

    // Handle LLM quota/rate limit errors (works for OpenAI, Claude, Gemini)
    if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate limit')) {
      const isOpenAI = error.message?.includes('openai') || error.message?.toLowerCase().includes('platform.openai.com');
      const isClaude = error.message?.includes('anthropic') || error.message?.includes('claude');
      const isGemini = error.message?.includes('google') || error.message?.includes('gemini');
      
      let providerName = 'LLM';
      let helpUrl = 'https://docs.stagehand.dev/configuration/models';
      let message = 'You have exceeded your API quota. Please check your account billing and usage limits.';
      
      if (isOpenAI) {
        providerName = 'OpenAI';
        helpUrl = 'https://platform.openai.com/docs/guides/error-codes/api-errors';
        message = 'You have exceeded your OpenAI API quota. Check usage at https://platform.openai.com/usage, add billing credits, or wait for quota reset.';
      } else if (isClaude) {
        providerName = 'Anthropic Claude';
        helpUrl = 'https://docs.anthropic.com/claude/reference/rate-limits';
        message = 'You have exceeded your Anthropic API quota. Check usage at https://console.anthropic.com/, add billing credits, or wait for quota reset.';
      } else if (isGemini) {
        providerName = 'Google Gemini';
        helpUrl = 'https://ai.google.dev/pricing';
        message = 'You have exceeded your Google Gemini API quota. Check usage at https://console.cloud.google.com/, add billing credits, or wait for quota reset.';
      }
      
      return NextResponse.json(
        {
          error: `${providerName} API quota exceeded`,
          message: message,
          requestId,
          helpUrl: helpUrl,
          suggestion: 'You can configure a different LLM provider by setting STAGEHAND_LLM_PROVIDER=claude or STAGEHAND_LLM_PROVIDER=gemini in your .env.local file.',
        },
        { status: 429 }
      );
    }

    return handleError(error, requestId);
  } finally {
    // Cleanup browser session
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

