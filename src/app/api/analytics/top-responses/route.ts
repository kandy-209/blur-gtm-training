import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput } from '@/lib/security';
import { getUserRole } from '@/lib/permissions';
import { getSupabaseClient } from '@/lib/supabase-client';

const supabase = getSupabaseClient();

async function getCurrentUser(request: NextRequest) {
  if (!supabase) return null;
  
  try {
    // Try to get user from auth header (Bearer token)
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      if (token) {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          return user;
        }
      }
    }
  } catch (error) {
    console.error('Auth check error:', error);
  }
  
  return null;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId');
    const objectionCategory = searchParams.get('objectionCategory');
    const minScore = parseInt(searchParams.get('minScore') || '70');
    const limit = parseInt(searchParams.get('limit') || '20');
    const includeUserIds = searchParams.get('includeUserIds') === 'true';

    // Safely get top responses
    let topResponses: any[] = [];
    try {
      if (db && typeof db.getTopResponses === 'function') {
        topResponses = await db.getTopResponses({
          scenarioId: scenarioId || undefined,
          objectionCategory: objectionCategory || undefined,
          minScore,
          limit: Math.min(limit, 100),
        }) || [];
      }
    } catch (dbError) {
      console.warn('Database query failed, returning empty array:', dbError);
      topResponses = [];
    }

    // If no responses, return early
    if (topResponses.length === 0) {
      return NextResponse.json({ topResponses: [] });
    }

    // Try to get current user for ownership checking
    const user = await getCurrentUser(request);
    const userId = user?.id;

    // If includeUserIds is true, add user IDs to each response
    if (includeUserIds && userId && typeof db.getUserResponses === 'function') {
      try {
        const allResponses = await db.getUserResponses({
          scenarioId: scenarioId || undefined,
          objectionCategory: objectionCategory || undefined,
          limit: 1000,
        }) || [];

        // Enrich top responses with user ownership info
        const enrichedResponses = topResponses.map((topResp: { response: string; count: number; averageScore: number; successRate: number; scenarioId: string; objectionCategory: string }) => {
          const matchingResponses = allResponses.filter((r: { userMessage: string }) => 
            r.userMessage.toLowerCase().trim() === topResp.response.toLowerCase().trim()
          );
          const userOwnsResponse = matchingResponses.some((r: { userId: string }) => r.userId === userId);
          return {
            ...topResp,
            userOwnsResponse,
          };
        });

        return NextResponse.json({ topResponses: enrichedResponses });
      } catch (error) {
        console.warn('Failed to enrich responses with user IDs:', error);
        // Fall through to return without enrichment
      }
    }

    return NextResponse.json({ topResponses });
  } catch (error) {
    console.error('Get top responses error:', error);
    // Always return 200 with empty array to prevent UI crashes
    return NextResponse.json({ topResponses: [] });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is authenticated
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userRole = getUserRole(user);
    const userId = user.id;
    const isAdmin = userRole === 'admin';

    const body = await request.json();
    const { response, scenarioId, objectionCategory, deleteOwnOnly } = body;

    if (!response) {
      return NextResponse.json(
        { error: 'Response text is required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedResponse = sanitizeInput(response, 5000);
    const sanitizedScenarioId = scenarioId ? sanitizeInput(scenarioId, 100) : undefined;
    const sanitizedObjectionCategory = objectionCategory ? sanitizeInput(objectionCategory, 100) : undefined;

    // Get all responses matching this text
    const responses = await db.getUserResponses({
      scenarioId: sanitizedScenarioId,
      objectionCategory: sanitizedObjectionCategory,
      limit: 1000, // Get all matching responses
    });

    // Filter by matching response text
    let matchingResponses = responses.filter((r: { userMessage: string }) => 
      r.userMessage.toLowerCase().trim() === sanitizedResponse.toLowerCase().trim()
    );

    // If not admin and deleteOwnOnly is true (or not specified), only delete user's own responses
    if (!isAdmin && (deleteOwnOnly !== false)) {
      matchingResponses = matchingResponses.filter((r: { userId: string }) => r.userId === userId);
    }

    if (matchingResponses.length === 0) {
      return NextResponse.json(
        { error: isAdmin ? 'No matching responses found' : 'No matching responses found that belong to you' },
        { status: 404 }
      );
    }

    // Delete matching responses
    let deletedCount = 0;
    for (const resp of matchingResponses) {
      // Double-check: non-admins can only delete their own responses
      if (!isAdmin && resp.userId !== userId) {
        continue;
      }
      
      try {
        await db.deleteUserResponse(resp.id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete response ${resp.id}:`, error);
      }
    }

    return NextResponse.json({ 
      success: true, 
      deletedCount,
      message: `Deleted ${deletedCount} response(s)` 
    });
  } catch (error) {
    console.error('Delete top response error:', error);
    return NextResponse.json(
      { error: 'Failed to delete response' },
      { status: 500 }
    );
  }
}
