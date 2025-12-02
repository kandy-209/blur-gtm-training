import { POST } from '@/app/api/auth/signin/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth', () => {
  const mockSignIn = jest.fn();
  return {
    signIn: mockSignIn,
    supabase: null,
    __mockSignIn: mockSignIn,
  };
});

jest.mock('@/lib/security', () => {
  const mockSanitizeInput = jest.fn((val: string) => val);
  return {
    sanitizeInput: mockSanitizeInput,
    __mockSanitizeInput: mockSanitizeInput,
  };
});

describe('POST /api/auth/signin', () => {
  let mockSignIn: jest.Mock;
  let mockSanitizeInput: jest.Mock;

  beforeAll(() => {
    const authModule = require('@/lib/auth');
    const securityModule = require('@/lib/security');
    mockSignIn = (authModule as any).__mockSignIn;
    mockSanitizeInput = (securityModule as any).__mockSanitizeInput;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockSanitizeInput.mockImplementation((val: string) => val);
    mockSignIn.mockResolvedValue({
      user: { id: 'user_123', email: 'test@example.com' },
      session: { access_token: 'token_123' },
    });
  });

  it('should sign in a user successfully', async () => {
    const request = new NextRequest('http://localhost/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.user).toBeDefined();
  });

  it('should reject missing credentials', async () => {
    const request = new NextRequest('http://localhost/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should handle sign in errors', async () => {
    mockSignIn.mockRejectedValue(new Error('Invalid credentials'));

    const request = new NextRequest('http://localhost/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'wrongpassword',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Invalid credentials');
  });
});
