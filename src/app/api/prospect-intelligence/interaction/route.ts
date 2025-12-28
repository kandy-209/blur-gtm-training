import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { log, generateRequestId } from '@/lib/logger';
import { getUserIdFromRequest } from '@/lib/prospect-intelligence/auth-helper';
import { logUserInteraction, type InteractionType } from '@/lib/prospect-intelligence/interactions';

const schema = z.object({
  accountDomain: z.string().min(1, 'accountDomain is required'),
  interactionType: z.enum([
    'viewed',
    'opened_research',
    'contacted',
    'meeting_booked',
    'deal_won',
    'deal_lost',
  ]),
  metadata: z.record(z.any()).optional(),
});

export async function POST(request: NextRequest) {
  const requestId = generateRequestId();

  try {
    const contentType = request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json', requestId },
        { status: 400 },
      );
    }

    const body = await request.json();
    const parsed = schema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validation error', details: parsed.error.flatten(), requestId },
        { status: 400 },
      );
    }

    const userId = await getUserIdFromRequest(request);
    const { accountDomain, interactionType, metadata } = parsed.data;

    await logUserInteraction({
      userId,
      accountDomain,
      interactionType: interactionType as InteractionType,
      metadata,
    });

    return NextResponse.json(
      { success: true, requestId },
      { status: 200 },
    );
  } catch (error) {
    log.error('Interaction logging error', error as any, { requestId });
    return NextResponse.json(
      { error: 'Internal Server Error', requestId },
      { status: 500 },
    );
  }
}

