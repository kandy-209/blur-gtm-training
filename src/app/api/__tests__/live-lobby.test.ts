import { POST, GET, DELETE } from '@/app/api/live/lobby/route';
import { NextRequest } from 'next/server';

const mockJoinLobby = jest.fn();
const mockLeaveLobby = jest.fn();
const mockGetLobbyUsers = jest.fn();
const mockFindMatch = jest.fn();
const mockSanitizeInput = jest.fn((val: string) => val);

jest.mock('@/lib/live-session-manager', () => {
  const mockJoinLobby = jest.fn();
  const mockLeaveLobby = jest.fn();
  const mockGetLobbyUsers = jest.fn();
  const mockFindMatch = jest.fn();
  return {
    sessionManager: {
      joinLobby: mockJoinLobby,
      leaveLobby: mockLeaveLobby,
      getLobbyUsers: mockGetLobbyUsers,
      findMatch: mockFindMatch,
    },
    __mockJoinLobby: mockJoinLobby,
    __mockLeaveLobby: mockLeaveLobby,
    __mockGetLobbyUsers: mockGetLobbyUsers,
    __mockFindMatch: mockFindMatch,
  };
});

jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((val: string) => val),
}));

describe('POST /api/live/lobby', () => {
  let mockJoinLobby: jest.Mock;
  let mockFindMatch: jest.Mock;

  beforeAll(() => {
    const sessionManagerModule = require('@/lib/live-session-manager');
    mockJoinLobby = (sessionManagerModule as any).__mockJoinLobby;
    mockFindMatch = (sessionManagerModule as any).__mockFindMatch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should join lobby successfully', async () => {
    const mockUser = {
      userId: 'user_123',
      username: 'testuser',
      preferredRole: 'rep',
      status: 'waiting',
      joinedAt: new Date(),
    };

    mockJoinLobby.mockReturnValue(mockUser);
    mockFindMatch.mockReturnValue(null);

    const request = new NextRequest('http://localhost/api/live/lobby', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user_123',
        username: 'testuser',
        preferredRole: 'rep',
        scenarioId: 'scenario_1',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.user).toBeDefined();
    expect(data.match).toBeNull();
  });

  it('should find a match when available', async () => {
    const mockUser = {
      userId: 'user_123',
      username: 'testuser',
      preferredRole: 'rep',
      status: 'waiting',
      joinedAt: new Date(),
    };

    const mockMatch = {
      userId: 'user_456',
      username: 'partner',
      preferredRole: 'prospect',
      status: 'waiting',
    };

    mockJoinLobby.mockReturnValue(mockUser);
    mockFindMatch.mockReturnValue(mockMatch);

    const request = new NextRequest('http://localhost/api/live/lobby', {
      method: 'POST',
      body: JSON.stringify({
        userId: 'user_123',
        username: 'testuser',
        preferredRole: 'rep',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.match).toBeDefined();
    expect(data.match.userId).toBe('user_456');
  });

  it('should reject missing userId', async () => {
    const request = new NextRequest('http://localhost/api/live/lobby', {
      method: 'POST',
      body: JSON.stringify({
        username: 'testuser',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });
});

describe('DELETE /api/live/lobby', () => {
  let mockLeaveLobby: jest.Mock;

  beforeAll(() => {
    const sessionManagerModule = require('@/lib/live-session-manager');
    mockLeaveLobby = (sessionManagerModule as any).__mockLeaveLobby;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should leave lobby successfully', async () => {
    mockLeaveLobby.mockImplementation(() => {});

    const request = new NextRequest('http://localhost/api/live/lobby?userId=user_123');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });

  it('should reject missing userId', async () => {
    const request = new NextRequest('http://localhost/api/live/lobby');
    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });
});

describe('GET /api/live/lobby', () => {
  let mockGetLobbyUsers: jest.Mock;

  beforeAll(() => {
    const sessionManagerModule = require('@/lib/live-session-manager');
    mockGetLobbyUsers = (sessionManagerModule as any).__mockGetLobbyUsers;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return lobby users', async () => {
    const mockUsers = [
      {
        userId: 'user_1',
        username: 'user1',
        preferredRole: 'rep',
        status: 'waiting',
      },
      {
        userId: 'user_2',
        username: 'user2',
        preferredRole: 'prospect',
        status: 'waiting',
      },
    ];

    mockGetLobbyUsers.mockReturnValue(mockUsers);

    const request = new NextRequest('http://localhost/api/live/lobby');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.users).toBeDefined();
    expect(data.users.length).toBe(2);
  });
});
