import { NextRequest, NextResponse } from 'next/server';
import { deleteProspect, getProspectResearch } from '@/lib/prospect-intelligence/persistence';
import { log, generateRequestId } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';
import { requireAuth } from '@/lib/prospect-intelligence/auth-helper';

/**
 * GET /api/prospect-intelligence/saved/[id]
 * Get a specific saved prospect
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();

  try {
    const prospect = await getProspectResearch(params.id);

    if (!prospect) {
      return NextResponse.json(
        { error: 'Prospect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: prospect,
      requestId,
    }, {
      headers: {
        'X-Request-ID': requestId,
      },
    });
  } catch (error) {
    return handleError(error, requestId);
  }
}

/**
 * DELETE /api/prospect-intelligence/saved/[id]
 * Delete a saved prospect
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId();

  try {
    // Require authentication
    const userId = await requireAuth(request);

    const success = await deleteProspect(params.id, userId);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete prospect or prospect not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Prospect deleted successfully',
      requestId,
    }, {
      headers: {
        'X-Request-ID': requestId,
      },
    });
  } catch (error) {
    return handleError(error, requestId);
  }
}
