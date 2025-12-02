import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
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

export async function POST(request: NextRequest) {
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
    const { count = 2, scenarioId, objectionCategory } = body;

    // Get top responses
    const topResponses = await db.getTopResponses({
      scenarioId: scenarioId || undefined,
      objectionCategory: objectionCategory || undefined,
      limit: Math.min(count, 10), // Max 10 at a time for safety
    });

    if (topResponses.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'No top responses found to delete',
      });
    }

    // Get all responses to find matching ones
    const allResponses = await db.getUserResponses({
      scenarioId: scenarioId || undefined,
      objectionCategory: objectionCategory || undefined,
      limit: 1000,
    });

    // Delete each top response
    let totalDeleted = 0;
    const deletedResponses: string[] = [];

    for (const topResp of topResponses.slice(0, count)) {
      const matchingResponses = allResponses.filter((r: { userMessage: string }) => 
        r.userMessage.toLowerCase().trim() === topResp.response.toLowerCase().trim()
      );

      for (const resp of matchingResponses) {
        try {
          await db.deleteUserResponse(resp.id);
          totalDeleted++;
        } catch (error) {
          console.error(`Failed to delete response ${resp.id}:`, error);
        }
      }

      deletedResponses.push(topResp.response.substring(0, 50) + (topResp.response.length > 50 ? '...' : ''));
    }

    return NextResponse.json({
      success: true,
      deletedCount: totalDeleted,
      deletedResponses,
      message: `Deleted ${totalDeleted} response(s) from top ${count} responses`,
    });
  } catch (error) {
    console.error('Delete top responses error:', error);
    return NextResponse.json(
      { error: 'Failed to delete top responses' },
      { status: 500 }
    );
  }
}

