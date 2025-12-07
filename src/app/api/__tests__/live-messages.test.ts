import { POST, GET } from '@/app/api/live/messages/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/live-session-manager', () => {
  const mockAddMessage = jest.fn();
  const mockGetSession = jest.fn();
  return {
    sessionManager: {
      addMessage: mockAddMessage,
      getSession: mockGetSession,
    },
    __mockAddMessage: mockAddMessage,
    __mockGetSession: mockGetSession,
  };
});

jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((val: string) => val),
}));

describe('POST /api/live/messages', () => {
  let mockAddMessage: jest.Mock;
  let mockGetSession: jest.Mock;

  beforeAll(() => {
    const sessionManagerModule = require('@/lib/live-session-manager');
    mockAddMessage = (sessionManagerModule as any).__mockAddMessage;
    mockGetSession = (sessionManagerModule as any).__mockGetSession;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockAddMessage.mockReturnValue({
      id: 'msg_123',
      sessionId: 'session_123',
      userId: 'user_1',
      role: 'rep',
      message: 'Hello!',
      type: 'text',
      timestamp: new Date(),
    });
    
    // Mock session for validation
    mockGetSession.mockReturnValue({
      id: 'session_123',
      repUserId: 'user_1',
      prospectUserId: 'user_2',
      conversationHistory: [],
    });
  });

  it('should add a message successfully', async () => {
    const request = new NextRequest('http://localhost/api/live/messages', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session_123',
        userId: 'user_1',
        role: 'rep',
        message: 'Hello!',
        type: 'text',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.message).toBeDefined();
    expect(data.message.id).toBe('msg_123');
  });

  it('should reject missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/live/messages', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session_123',
        message: 'Hello!',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should handle session not found', async () => {
    mockGetSession.mockReturnValue(undefined); // Session doesn't exist

    const request = new NextRequest('http://localhost/api/live/messages', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'nonexistent',
        userId: 'user_1',
        role: 'rep',
        message: 'Hello!',
        type: 'text',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    
    expect(response.status).toBe(404);
  });
});

describe('GET /api/live/messages', () => {
  let mockGetSession: jest.Mock;

  beforeAll(() => {
    const sessionManagerModule = require('@/lib/live-session-manager');
    mockGetSession = (sessionManagerModule as any).__mockGetSession;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get messages for a session', async () => {
    mockGetSession.mockReturnValue({
      id: 'session_123',
      conversationHistory: [
        {
          id: 'msg_1',
          sessionId: 'session_123',
          userId: 'user_1',
          role: 'rep',
          message: 'Hello!',
          timestamp: new Date(),
        },
      ],
    });

    const request = new NextRequest('http://localhost/api/live/messages?sessionId=session_123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.messages).toBeDefined();
    expect(Array.isArray(data.messages)).toBe(true);
  });

  it('should reject missing sessionId', async () => {
    const request = new NextRequest('http://localhost/api/live/messages');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should handle session not found', async () => {
    mockGetSession.mockReturnValue(undefined);

    const request = new NextRequest('http://localhost/api/live/messages?sessionId=nonexistent');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });
});
