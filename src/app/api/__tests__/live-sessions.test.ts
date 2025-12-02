import { POST, GET } from '@/app/api/live/sessions/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/live-session-manager', () => {
  const mockCreateSession = jest.fn();
  const mockGetSession = jest.fn();
  const mockGetSessionByUserId = jest.fn();
  return {
    sessionManager: {
      createSession: mockCreateSession,
      getSession: mockGetSession,
      getSessionByUserId: mockGetSessionByUserId,
    },
    __mockCreateSession: mockCreateSession,
    __mockGetSession: mockGetSession,
    __mockGetSessionByUserId: mockGetSessionByUserId,
  };
});

jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((val: string) => val),
}));

describe('POST /api/live/sessions', () => {
  let mockCreateSession: jest.Mock;

  beforeAll(() => {
    const sessionManagerModule = require('@/lib/live-session-manager');
    mockCreateSession = (sessionManagerModule as any).__mockCreateSession;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateSession.mockReturnValue({
      id: 'session_123',
      scenarioId: 'scenario_1',
      repUserId: 'user_1',
      prospectUserId: 'user_2',
      status: 'active',
      createdAt: new Date(),
      conversationHistory: [],
    });
  });

  it('should create a session successfully', async () => {
    const request = new NextRequest('http://localhost/api/live/sessions', {
      method: 'POST',
      body: JSON.stringify({
        repUserId: 'user_1',
        prospectUserId: 'user_2',
        scenarioId: 'scenario_1',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.session).toBeDefined();
    expect(data.session.id).toBe('session_123');
  });

  it('should reject missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/live/sessions', {
      method: 'POST',
      body: JSON.stringify({
        repUserId: 'user_1',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });
});

describe('GET /api/live/sessions', () => {
  let mockGetSession: jest.Mock;
  let mockGetSessionByUserId: jest.Mock;

  beforeAll(() => {
    const sessionManagerModule = require('@/lib/live-session-manager');
    mockGetSession = (sessionManagerModule as any).__mockGetSession;
    mockGetSessionByUserId = (sessionManagerModule as any).__mockGetSessionByUserId;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get session by sessionId', async () => {
    mockGetSession.mockReturnValue({
      id: 'session_123',
      scenarioId: 'scenario_1',
      repUserId: 'user_1',
      prospectUserId: 'user_2',
      status: 'active',
    });

    const request = new NextRequest('http://localhost/api/live/sessions?sessionId=session_123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.session).toBeDefined();
    expect(data.session.id).toBe('session_123');
  });

  it('should get session by userId', async () => {
    mockGetSessionByUserId.mockReturnValue({
      id: 'session_123',
      scenarioId: 'scenario_1',
      repUserId: 'user_1',
      prospectUserId: 'user_2',
      status: 'active',
    });

    const request = new NextRequest('http://localhost/api/live/sessions?userId=user_1');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.session).toBeDefined();
  });

  it('should return 404 for non-existent session', async () => {
    mockGetSession.mockReturnValue(undefined);

    const request = new NextRequest('http://localhost/api/live/sessions?sessionId=nonexistent');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });

  it('should reject missing sessionId or userId', async () => {
    const request = new NextRequest('http://localhost/api/live/sessions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });
});
