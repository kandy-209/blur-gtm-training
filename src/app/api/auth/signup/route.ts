import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/auth';
import { sanitizeInput, validateText } from '@/lib/security';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, username, fullName, roleAtCursor, jobTitle, department } = body;

    // Validate required fields (email is optional, will be generated if not provided)
    if (!password || !username || !roleAtCursor || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: password, username, roleAtCursor, jobTitle' },
        { status: 400 }
      );
    }

    // Check if email is from @cursor.com domain (auto-admin) - check before generation
    const isCursorEmail = email?.trim() && email.toLowerCase().endsWith('@cursor.com');

    // Generate email from username if not provided
    const userEmail = email?.trim() || `${username.toLowerCase().replace(/\s+/g, '')}@cursor.local`;

    // Validate email format if provided
    if (email && email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }
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
    const sanitizedData = {
      email: sanitizeInput(userEmail.toLowerCase(), 255),
      password,
      username: sanitizeInput(username, 30),
      fullName: fullName ? sanitizeInput(fullName, 100) : undefined,
      roleAtCursor: isCursorEmail ? 'Admin' : sanitizeInput(roleAtCursor, 100),
      jobTitle: isCursorEmail ? 'Administrator' : sanitizeInput(jobTitle, 100),
      department: department ? sanitizeInput(department, 100) : undefined,
    };

    const authData = await signUp(sanitizedData);

    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sign up' },
      { status: 500 }
    );
  }
}

