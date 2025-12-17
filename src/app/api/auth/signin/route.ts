import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';
import { getSupabaseClient } from '@/lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: emailOrUsername, password } = body;

    if (!emailOrUsername || !password) {
      return NextResponse.json(
        { error: 'Username/email and password are required' },
        { status: 400 }
      );
    }

    // Check if it's a username (no @) or email
    const isEmail = emailOrUsername.includes('@');
    let loginEmail = emailOrUsername;

    // If it's a username, look up the email from user_profiles
    if (!isEmail) {
      const supabase = getSupabaseClient();
      if (supabase) {
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('email')
          .eq('username', emailOrUsername)
          .single();

        if (profile?.email) {
          loginEmail = profile.email;
        } else {
          // If username not found, try as email anyway (might be generated email)
          loginEmail = `${emailOrUsername.toLowerCase().replace(/\s+/g, '')}@blur.local`;
        }
      }
    }

    const sanitizedData = {
      email: sanitizeInput(loginEmail.toLowerCase(), 255),
      password,
    };

    const authData = await signIn(sanitizedData);

    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
    });
  } catch (error: any) {
    console.error('Signin error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign in' },
      { status: 500 }
    );
  }
}

