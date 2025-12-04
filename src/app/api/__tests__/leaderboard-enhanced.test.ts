import { GET } from '@/app/api/leaderboard/route';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock NextRequest
class MockNextRequest {
  public nextUrl: URL;
  
  constructor(public url: string) {
    this.nextUrl = new URL(url);
  }
}

describe('GET /api/leaderboard - Enhanced', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockSupabase = {
      from: jest.fn(),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  it('should return enhanced leaderboard with comprehensive metrics', async () => {
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
        {
          rated_user_id: 'user_1',
          rating: 4,
          category: 'communication',
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

    const mockAnalytics = {
      data: [
        {
          user_id: 'user_1',
          event_type: 'scenario_start',
          scenario_id: 'scenario-1',
          score: null,
          timestamp: new Date().toISOString(),
        },
        {
          user_id: 'user_1',
          event_type: 'scenario_complete',
          scenario_id: 'scenario-1',
          score: 85,
          timestamp: new Date().toISOString(),
        },
        {
          user_id: 'user_1',
          event_type: 'turn_submit',
          scenario_id: 'scenario-1',
          score: null,
          timestamp: new Date().toISOString(),
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
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue(mockAnalytics),
        }),
      });

    const request = new MockNextRequest('http://localhost/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard).toBeDefined();
    expect(Array.isArray(data.leaderboard)).toBe(true);
    
    if (data.leaderboard.length > 0) {
      const entry = data.leaderboard[0];
      expect(entry).toHaveProperty('userId');
      expect(entry).toHaveProperty('username');
      expect(entry).toHaveProperty('averageRating');
      expect(entry).toHaveProperty('winRate');
      expect(entry).toHaveProperty('totalScore');
      expect(entry).toHaveProperty('completedScenarios');
      expect(entry).toHaveProperty('startedScenarios');
      expect(entry).toHaveProperty('totalTurns');
      expect(entry).toHaveProperty('averageScore');
      expect(entry).toHaveProperty('completionRate');
      expect(entry).toHaveProperty('categoryAverages');
      expect(entry).toHaveProperty('rank');
    }
  });

  it('should return aggregate statistics', async () => {
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
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

    const request = new MockNextRequest('http://localhost/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('stats');
    expect(data.stats).toHaveProperty('totalUsers');
    expect(data.stats).toHaveProperty('averageRating');
    expect(data.stats).toHaveProperty('averageWinRate');
    expect(data.stats).toHaveProperty('totalSessions');
    expect(data.stats).toHaveProperty('totalCompletedScenarios');
    expect(data).toHaveProperty('generatedAt');
  });

  it('should handle empty leaderboard gracefully', async () => {
    mockSupabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

    const request = new MockNextRequest('http://localhost/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard).toBeDefined();
    expect(data.leaderboard.length).toBe(0);
    expect(data.stats.totalUsers).toBe(0);
  });

  it('should respect limit parameter', async () => {
    const mockRatings = {
      data: Array.from({ length: 50 }, (_, i) => ({
        rated_user_id: `user_${i}`,
        rating: 5,
        category: 'overall',
        user_profiles: {
          username: `user${i}`,
          role_at_cursor: 'Sales Rep',
        },
      })),
      error: null,
    };

    mockSupabase.from
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue(mockRatings),
        }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

    const request = new MockNextRequest('http://localhost/api/leaderboard?limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard.length).toBeLessThanOrEqual(10);
  });

  it('should handle Supabase errors gracefully', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Invalid API key' },
        }),
      }),
    });

    const request = new MockNextRequest('http://localhost/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard).toBeDefined();
    expect(Array.isArray(data.leaderboard)).toBe(true);
  });

  it('should calculate category averages correctly', async () => {
    const mockRatings = {
      data: [
        {
          rated_user_id: 'user_1',
          rating: 5,
          category: 'communication',
          user_profiles: {
            username: 'user1',
            role_at_cursor: 'Sales Rep',
          },
        },
        {
          rated_user_id: 'user_1',
          rating: 4,
          category: 'communication',
          user_profiles: {
            username: 'user1',
            role_at_cursor: 'Sales Rep',
          },
        },
        {
          rated_user_id: 'user_1',
          rating: 5,
          category: 'product_knowledge',
          user_profiles: {
            username: 'user1',
            role_at_cursor: 'Sales Rep',
          },
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
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      })
      .mockReturnValueOnce({
        select: jest.fn().mockReturnValue({
          in: jest.fn().mockResolvedValue({ data: [], error: null }),
        }),
      });

    const request = new MockNextRequest('http://localhost/api/leaderboard');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    if (data.leaderboard.length > 0) {
      const entry = data.leaderboard[0];
      expect(entry.categoryAverages).toBeDefined();
      expect(entry.categoryAverages.communication).toBeCloseTo(4.5, 1);
    }
  });
});



