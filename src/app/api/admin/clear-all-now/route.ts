import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Emergency clear code - use this to bypass auth for immediate clearing
const EMERGENCY_CLEAR_CODE = process.env.EMERGENCY_CLEAR_CODE || 'EMERGENCY_CLEAR_2024';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { emergencyCode } = body;

    // Check emergency code
    if (!emergencyCode || emergencyCode !== EMERGENCY_CLEAR_CODE) {
      return NextResponse.json(
        { error: 'Invalid emergency code' },
        { status: 403 }
      );
    }

    console.log('🚨 EMERGENCY CLEAR: Clearing all responses...');

    // Clear in-memory database
    const allResponses = await db.getUserResponses({
      limit: 10000, // Get all responses
    });

    let deletedCount = 0;
    for (const resp of allResponses) {
      try {
        await db.deleteUserResponse(resp.id);
        deletedCount++;
      } catch (error) {
        console.error(`Failed to delete response ${resp.id}:`, error);
      }
    }

    // Also clear from Supabase if available
    let supabaseDeleted = 0;
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('user_responses')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all
        
        if (!error && data) {
          // Supabase delete returns the deleted rows
          supabaseDeleted = Array.isArray(data) ? data.length : 0;
        }
      } catch (error) {
        console.log('Supabase clear error (table may not exist):', error);
      }
    }

    console.log(`✅ EMERGENCY CLEAR COMPLETE: Deleted ${deletedCount} responses from memory, ${supabaseDeleted} from Supabase`);

    return NextResponse.json({
      success: true,
      deletedCount,
      supabaseDeleted,
      message: `Successfully cleared ${deletedCount} response(s) from memory and ${supabaseDeleted} from database`,
    });
  } catch (error) {
    console.error('Emergency clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear responses' },
      { status: 500 }
    );
  }
}

