import { POST } from '@/app/api/chat/technical/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((val: string) => val),
}));

jest.mock('@/lib/oso-auth', () => ({
  canAccessChatType: jest.fn(),
  isAllowed: jest.fn(),
}));

describe('POST /api/chat/technical', () => {
  let mockCanAccessChatType: jest.Mock;
  let mockIsAllowed: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const osoAuth = require('@/lib/oso-auth');
    mockCanAccessChatType = osoAuth.canAccessChatType;
    mockIsAllowed = osoAuth.isAllowed;
  });

  it('should allow authenticated users to access technical chat', async () => {
    mockCanAccessChatType.mockReturnValue(true);
    mockIsAllowed.mockReturnValue(true);

    const request = new NextRequest('http://localhost/api/chat/technical', {
      method: 'POST',
      body: JSON.stringify({
        question: 'How does Cursor integrate with VS Code?',
        role: 'user',
        chatType: 'technical',
        userId: 'user_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.answer).toBeDefined();
    expect(mockCanAccessChatType).toHaveBeenCalled();
    expect(mockIsAllowed).toHaveBeenCalled();
  });

  it('should deny guests access to technical chat', async () => {
    mockCanAccessChatType.mockReturnValue(false);

    const request = new NextRequest('http://localhost/api/chat/technical', {
      method: 'POST',
      body: JSON.stringify({
        question: 'Technical question',
        role: 'guest',
        chatType: 'technical',
        userId: 'guest_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('user account');
  });

  it('should reject missing question', async () => {
    mockCanAccessChatType.mockReturnValue(true);
    mockIsAllowed.mockReturnValue(true);

    const request = new NextRequest('http://localhost/api/chat/technical', {
      method: 'POST',
      body: JSON.stringify({
        role: 'user',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });
});

