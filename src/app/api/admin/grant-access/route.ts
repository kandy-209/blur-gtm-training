import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeInput } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

// Master admin grant code - use this to grant admin access
const ADMIN_GRANT_CODE = process.env.ADMIN_GRANT_CODE || 'GRANT_ADMIN_ACCESS_2024';

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, grantCode } = body;

    // Verify grant code
    if (!grantCode || grantCode !== ADMIN_GRANT_CODE) {
      return NextResponse.json(
        { error: 'Invalid grant code' },
        { status: 403 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const sanitizedEmail = sanitizeInput(email.toLowerCase(), 255);

    // Find user by email
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('Error listing users:', listError);
      return NextResponse.json(
        { error: 'Failed to find user' },
        { status: 500 }
      );
    }

    const user = users.find(u => u.email?.toLowerCase() === sanitizedEmail);
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please sign up first.' },
        { status: 404 }
      );
    }

    // Update user metadata to grant admin role
    const { data: updatedUser, error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        user_metadata: {
          ...user.user_metadata,
          role: 'admin',
        },
      }
    );

    if (updateError) {
      console.error('Error updating user:', updateError);
      return NextResponse.json(
        { error: 'Failed to grant admin access' },
        { status: 500 }
      );
    }

    // Also update user profile if it exists
    try {
      await supabase
        .from('user_profiles')
        .update({
          role_at_cursor: 'Admin',
          job_title: 'Administrator',
        })
        .eq('id', user.id);
    } catch (error) {
      // Profile update is optional, don't fail if it doesn't exist
      console.log('Profile update skipped:', error);
    }

    return NextResponse.json({
      success: true,
      message: 'Admin access granted successfully',
      user: {
        id: updatedUser.user.id,
        email: updatedUser.user.email,
        role: 'admin',
      },
    });
  } catch (error: any) {
    console.error('Grant admin access error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to grant admin access' },
      { status: 500 }
    );
  }
}

