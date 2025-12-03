/**
 * Generate Persona API
 * POST /api/persona/generate
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { GeneratePersonaUseCase } from '@/application/use-cases/generate-persona/generate-persona.use-case';
import { CompanyRepository } from '@/infrastructure/repositories/company.repository';
import { PersonaRepository } from '@/infrastructure/repositories/persona.repository';
import { PersonaGenerationAgent } from '@/infrastructure/agents/persona-generation-agent';
import { rateLimit } from '@/lib/security';

const GeneratePersonaSchema = z.object({
  companyId: z.string().min(1),
  settings: z.object({
    difficulty: z.enum(['easy', 'medium', 'hard', 'expert']),
    personality: z.enum(['friendly', 'professional', 'skeptical', 'abrasive', 'hostile']),
    role: z.enum(['CTO', 'VP Engineering', 'Staff Engineer', 'Engineering Manager']).optional(),
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
    const validated = GeneratePersonaSchema.parse(body);

    // Initialize dependencies
    const companyRepository = new CompanyRepository();
    const personaRepository = new PersonaRepository();
    const personaAgent = new PersonaGenerationAgent();
    const useCase = new GeneratePersonaUseCase(
      companyRepository,
      personaAgent
    );

    // Execute use case
    const persona = await useCase.execute({
      companyId: validated.companyId,
      settings: validated.settings,
    });

    // Save persona
    await personaRepository.save(persona);

    // Return response
    return NextResponse.json({
      success: true,
      data: {
        id: persona.id,
        name: persona.name,
        title: persona.data.title,
        company: persona.data.company,
        role: persona.data.role,
        communicationStyle: persona.data.communicationStyle,
        concerns: persona.data.concerns,
        painPoints: persona.data.painPoints,
        metadata: persona.data.metadata,
      },
    });
  } catch (error) {
    console.error('Generate persona error:', error);

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

