import { POST } from '@/app/api/chat/general/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((val: string) => val),
}));

jest.mock('@/lib/oso-auth', () => ({
  canAccessChatType: jest.fn(() => true),
  buildAuthzContext: jest.fn(() => ({
    userId: 'test_user',
    role: 'user',
    permissions: [],
    isGuest: false,
  })),
}));

describe('POST /api/chat/general', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should respond to general questions', async () => {
    const request = new NextRequest('http://localhost/api/chat/general', {
      method: 'POST',
      body: JSON.stringify({
        question: 'What is Cursor?',
        role: 'guest',
        chatType: 'general',
        userId: 'guest_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.answer).toBeDefined();
    expect(typeof data.answer).toBe('string');
  });

  it('should reject missing question', async () => {
    const request = new NextRequest('http://localhost/api/chat/general', {
      method: 'POST',
      body: JSON.stringify({
        role: 'guest',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should handle permission denied', async () => {
    const { canAccessChatType } = require('@/lib/oso-auth');
    canAccessChatType.mockReturnValueOnce(false);

    const request = new NextRequest('http://localhost/api/chat/general', {
      method: 'POST',
      body: JSON.stringify({
        question: 'Test question',
        role: 'guest',
        chatType: 'general',
        userId: 'guest_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('permission');
  });
});

