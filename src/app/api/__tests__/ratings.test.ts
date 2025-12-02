import { POST, GET } from '@/app/api/ratings/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth', () => {
  const mockSupabase = {
    from: jest.fn(() => ({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: jest.fn(),
        })),
        order: jest.fn(),
      })),
    })),
  };
  return {
    supabase: mockSupabase,
    __mockSupabase: mockSupabase,
  };
});

jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((val: string) => val),
}));

describe('POST /api/ratings', () => {
  let mockSupabase: any;

  beforeAll(() => {
    const authModule = require('@/lib/auth');
    mockSupabase = (authModule as any).__mockSupabase;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a rating successfully', async () => {
    const mockSingle = jest.fn().mockResolvedValue({
      data: {
        id: 'rating_123',
        session_id: 'session_123',
        rater_user_id: 'user_1',
        rated_user_id: 'user_2',
        rating: 5,
        category: 'overall',
      },
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: mockSingle,
        })),
      })),
    });

    const request = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session_123',
        raterUserId: 'user_1',
        ratedUserId: 'user_2',
        rating: 5,
        category: 'overall',
        feedback: 'Great job!',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.rating).toBeDefined();
  });

  it('should reject invalid rating value', async () => {
    const request = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session_123',
        raterUserId: 'user_1',
        ratedUserId: 'user_2',
        rating: 10,
        category: 'overall',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('between 1 and 5');
  });

  it('should reject invalid category', async () => {
    const request = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session_123',
        raterUserId: 'user_1',
        ratedUserId: 'user_2',
        rating: 5,
        category: 'invalid_category',
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Invalid category');
  });

  it('should reject missing required fields', async () => {
    const request = new NextRequest('http://localhost/api/ratings', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: 'session_123',
        rating: 5,
      }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('required fields');
  });
});

describe('GET /api/ratings', () => {
  let mockSupabase: any;

  beforeAll(() => {
    const authModule = require('@/lib/auth');
    mockSupabase = (authModule as any).__mockSupabase;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch ratings by userId', async () => {
    const mockOrder = jest.fn().mockResolvedValue({
      data: [
        {
          id: 'rating_1',
          rated_user_id: 'user_123',
          rating: 5,
          category: 'overall',
        },
      ],
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: mockOrder,
        })),
      })),
    });

    const request = new NextRequest('http://localhost/api/ratings?userId=user_123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ratings).toBeDefined();
    expect(Array.isArray(data.ratings)).toBe(true);
  });

  it('should fetch ratings by sessionId', async () => {
    const mockOrder = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          order: mockOrder,
        })),
      })),
    });

    const request = new NextRequest('http://localhost/api/ratings?sessionId=session_123');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.ratings).toBeDefined();
  });
});
