import { NextRequest } from 'next/server';

jest.mock('@/lib/supabase-client', () => {
  const mockSupabaseInstance = {
    from: jest.fn((table: string) => {
      if (table === 'user_ratings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn(),
          }),
        };
      } else if (table === 'live_sessions') {
        return {
          select: jest.fn(),
        };
      } else if (table === 'analytics_events') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn(),
          }),
        };
      }
      return {
        select: jest.fn(),
      };
    }),
  };
  
  return {
    getSupabaseClient: jest.fn(() => mockSupabaseInstance),
    __mockSupabaseInstance: mockSupabaseInstance,
  };
});

// Import route after mock is set up
import { GET } from '@/app/api/leaderboard/route';

describe('GET /api/leaderboard - Enhanced', () => {
  let mockSupabaseInstance: any;
  let getSupabaseClient: jest.Mock;

  beforeAll(() => {
    const supabaseClientModule = require('@/lib/supabase-client');
    getSupabaseClient = supabaseClientModule.getSupabaseClient as jest.Mock;
    mockSupabaseInstance = (supabaseClientModule as any).__mockSupabaseInstance;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset mock implementation
    mockSupabaseInstance.from.mockImplementation((table: string) => {
      if (table === 'user_ratings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn(),
          }),
        };
      } else if (table === 'live_sessions') {
        return {
          select: jest.fn(),
        };
      } else if (table === 'analytics_events') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn(),
          }),
        };
      }
      return {
        select: jest.fn(),
      };
    });
    
    getSupabaseClient.mockReturnValue(mockSupabaseInstance);
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

    mockSupabaseInstance.from.mockImplementation((table: string) => {
      if (table === 'user_ratings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockRatings),
          }),
        };
      } else if (table === 'live_sessions') {
        return {
          select: jest.fn().mockResolvedValue(mockSessions),
        };
      } else if (table === 'analytics_events') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue(mockAnalytics),
          }),
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const request = new NextRequest('http://localhost/api/leaderboard');
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

    mockSupabaseInstance.from.mockImplementation((table: string) => {
      if (table === 'user_ratings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockRatings),
          }),
        };
      } else if (table === 'live_sessions') {
        return {
          select: jest.fn().mockResolvedValue(mockSessions),
        };
      } else if (table === 'analytics_events') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const request = new NextRequest('http://localhost/api/leaderboard');
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
    mockSupabaseInstance.from.mockImplementation((table: string) => {
      if (table === 'user_ratings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      } else if (table === 'live_sessions') {
        return {
          select: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      } else if (table === 'analytics_events') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const request = new NextRequest('http://localhost/api/leaderboard');
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

    mockSupabaseInstance.from.mockImplementation((table: string) => {
      if (table === 'user_ratings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockRatings),
          }),
        };
      } else if (table === 'live_sessions') {
        return {
          select: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      } else if (table === 'analytics_events') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const request = new NextRequest('http://localhost/api/leaderboard?limit=10');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.leaderboard.length).toBeLessThanOrEqual(10);
  });

  it('should handle Supabase errors gracefully', async () => {
    mockSupabaseInstance.from.mockImplementation((table: string) => {
      if (table === 'user_ratings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Invalid API key' },
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const request = new NextRequest('http://localhost/api/leaderboard');
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

    mockSupabaseInstance.from.mockImplementation((table: string) => {
      if (table === 'user_ratings') {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockResolvedValue(mockRatings),
          }),
        };
      } else if (table === 'live_sessions') {
        return {
          select: jest.fn().mockResolvedValue({ data: [], error: null }),
        };
      } else if (table === 'analytics_events') {
        return {
          select: jest.fn().mockReturnValue({
            in: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
    });

    const request = new NextRequest('http://localhost/api/leaderboard');
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

