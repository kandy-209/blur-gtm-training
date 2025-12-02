import { NextRequest, NextResponse } from 'next/server';
import { signIn } from '@/lib/auth';
import { sanitizeInput } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const sanitizedData = {
      email: sanitizeInput(email.toLowerCase(), 255),
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

