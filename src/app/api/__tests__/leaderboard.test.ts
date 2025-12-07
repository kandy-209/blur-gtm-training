import { NextRequest } from 'next/server';

// Create mock instance factory - must be defined before jest.mock
function createMockSupabaseInstance() {
  // #region agent log
  try{const fs=require('fs');const logPath='/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';fs.appendFileSync(logPath,JSON.stringify({location:'leaderboard.test.ts:createMockSupabaseInstance',message:'Creating mock Supabase instance',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
  // #endregion
  return {
    from: jest.fn((table: string) => {
      // #region agent log
      try{const fs=require('fs');const logPath='/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';fs.appendFileSync(logPath,JSON.stringify({location:'leaderboard.test.ts:from',message:'Mock from called',data:{table},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
      // #endregion
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
}

jest.mock('@/lib/supabase-client', () => {
  // #region agent log
  try{const fs=require('fs');const logPath='/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';fs.appendFileSync(logPath,JSON.stringify({location:'leaderboard.test.ts:jest.mock',message:'jest.mock factory executing',data:{timestamp:Date.now()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
  // #endregion
  // Create instance inside factory to avoid hoisting issues - define inline
  const mockInstance = {
    from: jest.fn((table: string) => {
      // #region agent log
      try{const fs=require('fs');const logPath='/Users/lemonbear/Desktop/Blurred Lines/.cursor/debug.log';fs.appendFileSync(logPath,JSON.stringify({location:'leaderboard.test.ts:mockInstance.from',message:'Mock from called in factory',data:{table},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})+'\n');}catch(e){}
      // #endregion
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
    getSupabaseClient: jest.fn(() => mockInstance),
    __mockInstance: mockInstance,
  };
});

// Import route after mock is set up
import { GET } from '@/app/api/leaderboard/route';

describe('GET /api/leaderboard', () => {
  let mockSupabase: any;

  beforeAll(() => {
    const supabaseModule = require('@/lib/supabase-client');
    mockSupabase = (supabaseModule as any).__mockInstance || createMockSupabaseInstance();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the mock implementation for each test
    mockSupabase.from.mockImplementation((table: string) => {
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

    mockSupabase.from.mockImplementation((table: string) => {
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
    expect(data.leaderboard).toBeDefined();
    expect(Array.isArray(data.leaderboard)).toBe(true);
  });

  it('should handle empty leaderboard', async () => {
    mockSupabase.from.mockImplementation((table: string) => {
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
  });
});

