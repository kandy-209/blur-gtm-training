import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sanitizeInput, validateText } from '@/lib/security';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Admin code - in production, store this in environment variable or database
const ADMIN_CODE = process.env.ADMIN_SIGNUP_CODE || 'CURSOR_ADMIN_2024';

// Create Supabase client
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function POST(request: NextRequest) {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email, password, username, fullName, adminCode } = body;

    // Check if email is from @cursor.com domain
    const isCursorEmail = email && email.toLowerCase().endsWith('@cursor.com');

    // Validate admin code only if not a @cursor.com email
    if (!isCursorEmail && (!adminCode || adminCode !== ADMIN_CODE)) {
      return NextResponse.json(
        { error: 'Invalid admin code. Contact your system administrator.' },
        { status: 403 }
      );
    }

    // Validate required fields
    if (!email || !password || !username) {
      return NextResponse.json(
        { error: 'Missing required fields: email, password, username' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Validate username
    const usernameValidation = validateText(username, { minLength: 3, maxLength: 30 });
    if (!usernameValidation.valid) {
      return NextResponse.json(
        { error: usernameValidation.error || 'Invalid username' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedEmail = sanitizeInput(email.toLowerCase(), 255);
    const sanitizedUsername = sanitizeInput(username, 30);
    const sanitizedFullName = fullName ? sanitizeInput(fullName, 100) : undefined;

    // Create user with admin role in metadata
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: sanitizedEmail,
      password,
      options: {
        data: {
          username: sanitizedUsername,
          full_name: sanitizedFullName,
          role: 'admin', // Set admin role
        },
      },
    });

    if (authError) {
      console.error('Admin signup auth error:', authError);
      return NextResponse.json(
        { error: authError.message || 'Failed to create admin account' },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Create user profile with admin role
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: authData.user.id,
        email: sanitizedEmail,
        username: sanitizedUsername,
        full_name: sanitizedFullName,
        role_at_cursor: 'Admin',
        job_title: 'Administrator',
        department: 'IT/Admin',
      });

    if (profileError) {
      console.error('Admin profile creation error:', profileError);
      // Don't fail if profile creation fails - user is still created
    }

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        role: 'admin',
      },
      session: authData.session,
      message: 'Admin account created successfully',
    });
  } catch (error: any) {
    console.error('Admin signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create admin account' },
      { status: 500 }
    );
  }
}

