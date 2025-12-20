import { NextRequest } from 'next/server';
import { POST } from '@/app/api/prospect-intelligence/interaction/route';

// Mock logger to avoid winston / setImmediate issues in Jest
jest.mock('@/lib/logger', () => ({
  log: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
  generateRequestId: () => 'test-request-id',
}));

// Mock helpers
jest.mock('@/lib/prospect-intelligence/auth-helper', () => ({
  getUserIdFromRequest: jest.fn().mockResolvedValue('test-user'),
}));

jest.mock('@/lib/prospect-intelligence/interactions', () => ({
  logUserInteraction: jest.fn().mockResolvedValue(undefined),
}));

import { logUserInteraction } from '@/lib/prospect-intelligence/interactions';

const createRequest = (body: any, contentType = 'application/json') => {
  return new NextRequest('http://localhost:3000/api/prospect-intelligence/interaction', {
    method: 'POST',
    headers: { 'Content-Type': contentType },
    body: JSON.stringify(body),
  });
};

describe('POST /api/prospect-intelligence/interaction', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects non-JSON content types', async () => {
    const req = createRequest({ accountDomain: 'example.com', interactionType: 'viewed' }, 'text/plain');
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('validates payload and logs interaction', async () => {
    const req = createRequest({
      accountDomain: 'example.com',
      interactionType: 'viewed',
      metadata: { source: 'test' },
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    expect(logUserInteraction).toHaveBeenCalledWith({
      userId: 'test-user',
      accountDomain: 'example.com',
      interactionType: 'viewed',
      metadata: { source: 'test' },
    });
  });

  it('returns 400 on validation error', async () => {
    const req = createRequest({ interactionType: 'viewed' }); // missing domain
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('handles internal errors gracefully', async () => {
    (logUserInteraction as jest.Mock).mockRejectedValueOnce(new Error('boom'));

    const req = createRequest({ accountDomain: 'example.com', interactionType: 'viewed' });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });
});

