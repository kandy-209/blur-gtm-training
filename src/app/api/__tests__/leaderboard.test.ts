import { GET } from '@/app/api/leaderboard/route';
import { NextRequest } from 'next/server';

jest.mock('@/lib/auth', () => {
  const mockSupabase = {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(),
      })),
    })),
  };
  return {
    supabase: mockSupabase,
    __mockSupabase: mockSupabase,
  };
});

describe('GET /api/leaderboard', () => {
  let mockSupabase: any;

  beforeAll(() => {
    const authModule = require('@/lib/auth');
    mockSupabase = (authModule as any).__mockSupabase;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return leaderboard data', async () => {
    const mockRatings = {
      data: [
        {
          rated_user_id: 'user_1',
          rating: 5,
          category: 'overall',
          user_profiles: {
            username: 'user1',
            role_at_cursor: 'Sales Rep',
          },
        },
      ],
      error: null,
    };

    const mockSessions = {
      data: [
        {
          rep_user_id: 'user_1',
          prospect_user_id: 'user_2',
          rep_score: 85,
          prospect_score: 75,
          status: 'completed',
        },
      ],
      error: null,
    };

    mockSupabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockRatings),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue(mockSessions),
      });

    const request = new NextRequest('http://localhost/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard).toBeDefined();
    expect(Array.isArray(data.leaderboard)).toBe(true);
  });

  it('should handle empty leaderboard', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      });

    const request = new NextRequest('http://localhost/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard).toBeDefined();
    expect(data.leaderboard.length).toBe(0);
  });
});

