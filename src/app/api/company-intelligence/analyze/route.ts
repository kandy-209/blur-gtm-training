/**
 * Company Intelligence Analysis API
 * POST /api/company-intelligence/analyze
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AnalyzeCompanyUseCase } from '@/application/use-cases/analyze-company/analyze-company.use-case';
import { CompanyRepository } from '@/infrastructure/repositories/company.repository';
import { CompanyIntelligenceAgent } from '@/infrastructure/agents/company-intelligence-agent';
import { rateLimit } from '@/lib/security';

const AnalyzeCompanySchema = z.object({
  input: z.union([
    z.string().min(1),
    z.object({
      domain: z.string().optional(),
      companyName: z.string().optional(),
      githubRepo: z.string().url().optional(),
    }),
  ]),
  forceRefresh: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request);
    if (!rateLimitResult || !rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Validate input
    const body = await request.json();
    const validated = AnalyzeCompanySchema.parse(body);

    // Initialize dependencies
    const companyRepository = new CompanyRepository();
    const intelligenceAgent = new CompanyIntelligenceAgent();
    const useCase = new AnalyzeCompanyUseCase(companyRepository, intelligenceAgent);

    // Execute use case
    const result = await useCase.execute({
      input: validated.input,
      forceRefresh: validated.forceRefresh,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        company: result.company,
        financial: result.financial,
        codebase: result.codebase,
        contacts: result.contacts,
        insights: result.insights,
        sources: result.sources,
        analyzedAt: result.analyzedAt,
      },
    });
  } catch (error) {
    console.error('Analyze company error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

