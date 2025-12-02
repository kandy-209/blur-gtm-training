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
    const { confirm } = body;

    if (confirm !== 'CLEAR_ALL_RESPONSES') {
      return NextResponse.json(
        { error: 'Confirmation required. Send { "confirm": "CLEAR_ALL_RESPONSES" }' },
        { status: 400 }
      );
    }

    // Get all responses
    const allResponses = await db.getUserResponses({
      limit: 10000, // Get all responses
    });

    // Delete all responses
    let deletedCount = 0;
    for (const resp of allResponses) {
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
      message: `Successfully cleared ${deletedCount} response(s)`,
    });
  } catch (error) {
    console.error('Clear responses error:', error);
    return NextResponse.json(
      { error: 'Failed to clear responses' },
      { status: 500 }
    );
  }
}

