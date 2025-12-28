import { NextRequest, NextResponse } from 'next/server';
import { signUp } from '@/lib/auth';
import { sanitizeInput, validateText, rateLimit } from '@/lib/security';
import { retryWithBackoff } from '@/lib/error-recovery';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = rateLimit(request, { maxRequests: 5, windowMs: 60000 }); // 5 signups per minute
    if (!rateLimitResult?.allowed && rateLimitResult) {
      const retryAfter = Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000);
      return NextResponse.json(
        { 
          error: 'Too many signup attempts. Please try again later.',
          retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          }
        }
      );
    }

    const body = await request.json();
    const { email, emailForAnalytics, password, username, fullName, roleAtBrowserbase, roleAtBlur, roleAtCursor, jobTitle, department } = body;

    // Validate required fields (email is optional, will be generated if not provided)
    // Support all variants for backward compatibility
    const roleAtCompany = roleAtBrowserbase || roleAtBlur || roleAtCursor;
    if (!password || !username || !roleAtCompany || !jobTitle) {
      return NextResponse.json(
        { error: 'Missing required fields: password, username, roleAtBrowserbase (or roleAtBlur/roleAtCursor), jobTitle' },
        { status: 400 }
      );
    }

    // Check if email is from @browserbase.com domain (auto-admin) - check before generation
    const isBrowserbaseEmail = email?.trim() && email.toLowerCase().endsWith('@browserbase.com');

    // Generate email from username if not provided
    const userEmail = email?.trim() || `${username.toLowerCase().replace(/\s+/g, '')}@browserbase.local`;

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

    // Enhanced password validation
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const strengthScore = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
    if (strengthScore < 2) {
      return NextResponse.json(
        { error: 'Password must contain at least 2 of: uppercase, lowercase, numbers, special characters' },
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

    // Check username format (alphanumeric, underscore, hyphen)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      return NextResponse.json(
        { error: 'Username can only contain letters, numbers, underscores, and hyphens' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedData = {
      email: sanitizeInput(userEmail.toLowerCase(), 255),
      password,
      username: sanitizeInput(username, 30),
      fullName: fullName ? sanitizeInput(fullName, 100) : undefined,
      roleAtBrowserbase: isBrowserbaseEmail ? 'Admin' : sanitizeInput(roleAtCompany, 100),
      roleAtBlur: isBrowserbaseEmail ? 'Admin' : sanitizeInput(roleAtCompany, 100), // Backward compatibility
      jobTitle: isBrowserbaseEmail ? 'Administrator' : sanitizeInput(jobTitle, 100),
      department: department ? sanitizeInput(department, 100) : undefined,
      analyticsEmail: emailForAnalytics && emailForAnalytics.trim() 
        ? sanitizeInput(emailForAnalytics.toLowerCase().trim(), 255) 
        : null,
    };

    // Retry signup with backoff for robustness
    const signupResult = await retryWithBackoff(
      () => signUp(sanitizedData),
      {
        maxRetries: 2,
        retryDelay: 1000,
        shouldRetry: (error) => {
          // Retry on network errors or temporary failures
          return error.message?.includes('network') ||
                 error.message?.includes('timeout') ||
                 error.message?.includes('503') ||
                 error.message?.includes('502');
        }
      }
    );

    if (!signupResult.success || !signupResult.data) {
      throw signupResult.error || new Error('Failed to sign up');
    }

    const authData = signupResult.data;

    return NextResponse.json({
      success: true,
      user: authData.user,
      session: authData.session,
      message: emailForAnalytics && emailForAnalytics.trim()
        ? 'Account created successfully! You can sign in with your username or email.'
        : 'Account created successfully! You can sign in with your username and password.',
    }, {
      headers: {
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': rateLimitResult ? (rateLimitResult.remaining - 1).toString() : '4',
        'X-RateLimit-Reset': rateLimitResult ? rateLimitResult.resetTime.toString() : Date.now().toString(),
      }
    });
  } catch (error: any) {
    console.error('Signup error:', error);
    
    // Provide more specific error messages
    let errorMessage = error.message || 'Failed to sign up';
    let statusCode = 500;

    if (errorMessage.includes('already registered') || errorMessage.includes('already exists')) {
      errorMessage = 'An account with this email already exists. Please sign in instead.';
      statusCode = 409;
    } else if (errorMessage.includes('invalid') || errorMessage.includes('validation')) {
      statusCode = 400;
    } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
      errorMessage = 'Network error. Please check your connection and try again.';
      statusCode = 503;
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

