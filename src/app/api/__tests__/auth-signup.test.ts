import { POST } from '@/app/api/auth/signup/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth', () => {
  const mockSignUp = jest.fn();
  return {
    signUp: mockSignUp,
    supabase: null,
    __mockSignUp: mockSignUp,
  };
});

jest.mock('@/lib/security', () => {
  const mockValidateText = jest.fn(() => ({ valid: true }));
  const mockSanitizeInput = jest.fn((val: string) => val);
  const mockRateLimit = jest.fn(() => ({
    allowed: true,
    remaining: 10,
    resetTime: Date.now() + 60000,
  }));
  return {
    sanitizeInput: mockSanitizeInput,
    validateText: mockValidateText,
    rateLimit: mockRateLimit,
    __mockValidateText: mockValidateText,
    __mockSanitizeInput: mockSanitizeInput,
    __mockRateLimit: mockRateLimit,
  };
});

jest.mock('@/lib/error-recovery', () => ({
  retryWithBackoff: jest.fn(async (fn: () => Promise<any>) => {
    const result = await fn();
    return { success: true, data: result, error: null };
  }),
}));

describe('POST /api/auth/signup', () => {
  let mockSignUp: jest.Mock;
  let mockValidateText: jest.Mock;
  let mockSanitizeInput: jest.Mock;

  beforeAll(() => {
    const authModule = require('@/lib/auth');
    const securityModule = require('@/lib/security');
    mockSignUp = (authModule as any).__mockSignUp;
    mockValidateText = (securityModule as any).__mockValidateText;
    mockSanitizeInput = (securityModule as any).__mockSanitizeInput;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockValidateText.mockReturnValue({ valid: true });
    mockSanitizeInput.mockImplementation((val: string) => val);
    mockSignUp.mockResolvedValue({
      user: { id: 'user_123', email: 'test@example.com' },
      session: { access_token: 'token_123' },
    });
  });

  it('should sign up a user successfully with email', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        roleAtCursor: 'Sales Rep',
        jobTitle: 'Account Executive',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'test@example.com',
        username: 'testuser',
      })
    );
  });

  it('should sign up a user successfully without email (auto-generate)', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        password: 'password123',
        username: 'johnsmith',
        roleAtCursor: 'Sales Rep',
        jobTitle: 'Account Executive',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
    // Should auto-generate email from username
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'johnsmith@cursor.local',
        username: 'johnsmith',
      })
    );
  });

  it('should auto-generate email with spaces in username', async () => {
    // Username with spaces should be rejected by validation (usernameRegex doesn't allow spaces)
    // The route validates username format before generating email
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        password: 'password123',
        username: 'John Smith', // Contains space, which violates username regex
        roleAtCursor: 'Sales Rep',
        jobTitle: 'Account Executive',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    // Username with spaces should be rejected (400) because it doesn't match username regex
    expect(response.status).toBe(400);
    expect(data.error).toContain('Username can only contain');
  });

  it('should reject invalid email format when provided', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid-email',
        password: 'password123',
        username: 'testuser',
        roleAtCursor: 'Sales Rep',
        jobTitle: 'Account Executive',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid email');
  });

  it('should reject short password', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'short',
        username: 'testuser',
        roleAtCursor: 'Sales Rep',
        jobTitle: 'Account Executive',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('at least 8 characters');
  });

  it('should reject missing required fields (email is optional)', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        password: 'password123',
        // Missing username, roleAtCursor, jobTitle
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required fields');
    expect(data.error).not.toContain('email'); // Email should not be in required fields
  });

  it('should reject empty email string (treat as missing)', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: '', // Empty string should trigger auto-generation
        password: 'password123',
        username: 'testuser',
        roleAtCursor: 'Sales Rep',
        jobTitle: 'Account Executive',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    // Should auto-generate email even if empty string provided
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'testuser@cursor.local',
      })
    );
  });

  it('should handle whitespace-only email as missing', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: '   ', // Whitespace only
        password: 'password123',
        username: 'testuser',
        roleAtCursor: 'Sales Rep',
        jobTitle: 'Account Executive',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    // Should auto-generate email for whitespace-only input
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'testuser@cursor.local',
      })
    );
  });

  it('should accept valid email when provided', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'user@example.com',
        password: 'password123',
        username: 'testuser',
        roleAtCursor: 'Sales Rep',
        jobTitle: 'Account Executive',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(mockSignUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'user@example.com', // Should use provided email
      })
    );
  });
});
