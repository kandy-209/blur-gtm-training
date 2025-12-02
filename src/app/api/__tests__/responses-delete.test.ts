import { DELETE } from '@/app/api/responses/route';
import { db } from '@/lib/db';
import { NextRequest } from 'next/server';

jest.mock('@/lib/db', () => ({
  db: {
    getUserResponses: jest.fn(),
    deleteUserResponse: jest.fn(),
  },
}));

jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((val) => val),
}));

// Mock NextRequest
class MockNextRequest {
  public headers: Headers;
  constructor(public url: string, public init?: RequestInit) {
    this.headers = new Headers(init?.headers);
  }
  async json() {
    return JSON.parse((this.init?.body as string) || '{}');
  }
  get(url: string) {
    return this.headers.get(url);
  }
}

describe('DELETE /api/responses', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a response when user owns it', async () => {
    const mockResponse = {
      id: 'resp_123',
      userId: 'user_123',
      scenarioId: 'scenario_1',
      userMessage: 'Test message',
    };

    (db.getUserResponses as jest.Mock).mockResolvedValue([mockResponse]);
    (db.deleteUserResponse as jest.Mock).mockResolvedValue(true);

    const request = new MockNextRequest('http://localhost/api/responses', {
      method: 'DELETE',
      body: JSON.stringify({
        responseId: 'resp_123',
        userId: 'user_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as any;

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(db.deleteUserResponse).toHaveBeenCalledWith('resp_123');
  });

  it('should reject deletion when userId is missing', async () => {
    const request = new MockNextRequest('http://localhost/api/responses', {
      method: 'DELETE',
      body: JSON.stringify({
        responseId: 'resp_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as any;

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should reject deletion when responseId is missing', async () => {
    const request = new MockNextRequest('http://localhost/api/responses', {
      method: 'DELETE',
      body: JSON.stringify({
        userId: 'user_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as any;

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required');
  });

  it('should reject deletion when user does not own the response', async () => {
    const mockResponse = {
      id: 'resp_123',
      userId: 'user_456', // Different user
      scenarioId: 'scenario_1',
      userMessage: 'Test message',
    };

    (db.getUserResponses as jest.Mock).mockResolvedValue([mockResponse]);

    const request = new MockNextRequest('http://localhost/api/responses', {
      method: 'DELETE',
      body: JSON.stringify({
        responseId: 'resp_123',
        userId: 'user_123', // Trying to delete as different user
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as any;

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data.error).toContain('Access denied');
    expect(db.deleteUserResponse).not.toHaveBeenCalled();
  });

  it('should return 404 when response not found', async () => {
    (db.getUserResponses as jest.Mock).mockResolvedValue([]);

    const request = new MockNextRequest('http://localhost/api/responses', {
      method: 'DELETE',
      body: JSON.stringify({
        responseId: 'resp_nonexistent',
        userId: 'user_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as any;

    const response = await DELETE(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.error).toContain('not found');
  });

  it('should handle errors gracefully', async () => {
    (db.getUserResponses as jest.Mock).mockRejectedValue(new Error('Database error'));

    const request = new MockNextRequest('http://localhost/api/responses', {
      method: 'DELETE',
      body: JSON.stringify({
        responseId: 'resp_123',
        userId: 'user_123',
      }),
      headers: { 'Content-Type': 'application/json' },
    }) as any;

    const response = await DELETE(request);
    expect(response.status).toBe(500);
  });
});

