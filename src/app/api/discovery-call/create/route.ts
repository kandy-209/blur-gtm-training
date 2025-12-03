/**
 * Create Discovery Call API
 * POST /api/discovery-call/create
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { CreateDiscoveryCallUseCase } from '@/application/use-cases/create-discovery-call/create-discovery-call.use-case';
import { CompanyRepository } from '@/infrastructure/repositories/company.repository';
import { PersonaRepository } from '@/infrastructure/repositories/persona.repository';
import { DiscoveryCallRepository } from '@/infrastructure/repositories/discovery-call.repository';
import { rateLimit } from '@/lib/security';

const CreateDiscoveryCallSchema = z.object({
  companyId: z.string().min(1),
  personaId: z.string().min(1),
  settings: z.object({
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
    personality: z.enum(['friendly', 'professional', 'skeptical', 'abrasive', 'hostile']),
    salesMethodology: z.enum(['GAP', 'SPIN', 'MEDDIC', 'BANT']).optional().nullable(),
  }),
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
    const validated = CreateDiscoveryCallSchema.parse(body);

    // Initialize dependencies
    const companyRepository = new CompanyRepository();
    const personaRepository = new PersonaRepository();
    const discoveryCallRepository = new DiscoveryCallRepository();
    const useCase = new CreateDiscoveryCallUseCase(
      companyRepository,
      personaRepository,
      discoveryCallRepository
    );

    // Execute use case
    const discoveryCall = await useCase.execute({
      companyId: validated.companyId,
      personaId: validated.personaId,
      settings: validated.settings,
    });

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        id: discoveryCall.id,
        companyId: discoveryCall.companyId.value,
        personaId: discoveryCall.persona.id,
        settings: discoveryCall.settings,
        isActive: discoveryCall.isActive,
        startedAt: discoveryCall.createdAt,
      },
    });
  } catch (error) {
    console.error('Create discovery call error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.issues },
        { status: 400 }
      );
    }

    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

