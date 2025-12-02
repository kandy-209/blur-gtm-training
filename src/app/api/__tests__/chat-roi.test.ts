import { POST } from '@/app/api/chat/roi/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((val: string) => val),
}));

jest.mock('@/lib/oso-auth', () => ({
  canAccessChatType: jest.fn(),
  isAllowed: jest.fn(),
  filterAuthorized: jest.fn((user, resources) => resources),
}));

jest.mock('@/data/cursor-features', () => ({
  cursorFeatures: [
    {
      id: 'test-feature',
      name: 'Test Feature',
      description: 'Test description',
      impactOnTeams: {
        leadership: {
          roi: '50% improvement',
          metrics: ['metric1', 'metric2'],
          businessValue: ['value1'],
        },
        ic: {
          productivity: 'Increased productivity',
          dailyImpact: ['impact1'],
          timeSaved: '2 hours per day',
        },
      },
    },
  ],
}));

describe('POST /api/chat/roi', () => {
  let mockCanAccessChatType: jest.Mock;
  let mockIsAllowed: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    const osoAuth = require('@/lib/oso-auth');
    mockCanAccessChatType = osoAuth.canAccessChatType;
    mockIsAllowed = osoAuth.isAllowed;
  });

  it('should allow authenticated users to access ROI chat', async () => {
    mockCanAccessChatType.mockReturnValue(true);
    mockIsAllowed.mockReturnValue(true);

    const request = new NextRequest('http://localhost/api/chat/roi', {
      method: 'POST',
      body: JSON.stringify({
        question: 'What is the ROI of codebase understanding?',
        role: 'user',
        chatType: 'roi',
        userId: 'user_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.answer).toBeDefined();
    expect(data.role).toBe('user');
  });

  it('should deny guests access to ROI chat', async () => {
    mockCanAccessChatType.mockReturnValue(false);

    const request = new NextRequest('http://localhost/api/chat/roi', {
      method: 'POST',
      body: JSON.stringify({
        question: 'ROI question',
        role: 'guest',
        chatType: 'roi',
        userId: 'guest_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('user account');
  });

  it('should filter features based on permissions', async () => {
    mockCanAccessChatType.mockReturnValue(true);
    mockIsAllowed.mockReturnValue(true);

    const { filterAuthorized } = require('@/lib/oso-auth');
    filterAuthorized.mockImplementation((user, resources) => resources);

    const request = new NextRequest('http://localhost/api/chat/roi', {
      method: 'POST',
      body: JSON.stringify({
        question: 'What is the ROI?',
        role: 'user',
        chatType: 'roi',
        userId: 'user_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(filterAuthorized).toHaveBeenCalled();
  });
});

