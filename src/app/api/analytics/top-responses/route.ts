import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sanitizeInput } from '@/lib/security';
import { getUserRole } from '@/lib/permissions';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

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

    const topResponses = await db.getTopResponses({
      scenarioId: scenarioId || undefined,
      objectionCategory: objectionCategory || undefined,
      minScore,
      limit: Math.min(limit, 100),
    });

    return NextResponse.json({ topResponses });
  } catch (error) {
    console.error('Get top responses error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve top responses' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check if user is admin
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userRole = getUserRole(user);
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { response, scenarioId, objectionCategory } = body;

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

    // Delete all responses matching this text
    const responses = await db.getUserResponses({
      scenarioId: sanitizedScenarioId,
      objectionCategory: sanitizedObjectionCategory,
      limit: 1000, // Get all matching responses
    });

    // Filter by matching response text
    const matchingResponses = responses.filter((r: { userMessage: string }) => 
      r.userMessage.toLowerCase().trim() === sanitizedResponse.toLowerCase().trim()
    );

    // Delete all matching responses
    let deletedCount = 0;
    for (const resp of matchingResponses) {
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
