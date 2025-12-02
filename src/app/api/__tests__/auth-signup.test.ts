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
  return {
    sanitizeInput: mockSanitizeInput,
    validateText: mockValidateText,
    __mockValidateText: mockValidateText,
    __mockSanitizeInput: mockSanitizeInput,
  };
});

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

  it('should sign up a user successfully', async () => {
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
  });

  it('should reject invalid email', async () => {
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

  it('should reject missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required fields');
  });
});
