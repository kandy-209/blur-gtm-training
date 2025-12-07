import { NextRequest } from 'next/server';

// Mock must be defined inline to avoid hoisting issues
jest.mock('@/lib/supabase-client', () => {
  const mockFrom = jest.fn((table: string) => {
    if (table === 'analytics_events') {
      return {
        insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      };
    }
    return {
      select: jest.fn().mockResolvedValue({ data: [], error: null }),
    };
  });
  
  const mockInstance = {
    from: mockFrom,
  };
  
  return {
    getSupabaseClient: jest.fn(() => mockInstance),
  };
});

// Import route after mock is set up
import { POST, GET } from '@/app/api/analytics/route';

describe('/api/analytics - Enhanced', () => {
  let getSupabaseClient: jest.Mock;
  let mockSupabaseInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Get the mock instance from the module
    const supabaseClientModule = require('@/lib/supabase-client');
    getSupabaseClient = supabaseClientModule.getSupabaseClient as jest.Mock;
    mockSupabaseInstance = getSupabaseClient();
    // Reset mock implementation - add null check
    if (mockSupabaseInstance && mockSupabaseInstance.from) {
      mockSupabaseInstance.from.mockImplementation((table: string) => {
      if (table === 'analytics_events') {
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
            order: jest.fn().mockReturnValue({
              limit: jest.fn().mockResolvedValue({ data: [], error: null }),
            }),
          }),
        };
      }
      return {
        select: jest.fn().mockResolvedValue({ data: [], error: null }),
      };
      });
    }
    
    // Set environment variables
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  });

  afterEach(() => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });

  describe('POST - Supabase Integration', () => {
    it('should save event to Supabase when available', async () => {
      const event = {
        eventType: 'scenario_start' as const,
        scenarioId: 'test-scenario',
        userId: 'user-123',
        timestamp: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: { 'Content-Type': 'application/json' },
      }) as any;

      mockSupabaseInstance.from.mockImplementation((table: string) => {
        if (table === 'analytics_events') {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should fallback to in-memory when Supabase fails', async () => {
      const event = {
        eventType: 'scenario_complete' as const,
        scenarioId: 'test-scenario',
        userId: 'user-123',
        score: 85,
        timestamp: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: { 'Content-Type': 'application/json' },
      });

      // Mock Supabase error
      mockSupabaseInstance.from.mockImplementation((table: string) => {
        if (table === 'analytics_events') {
          return {
            insert: jest.fn().mockResolvedValue({ error: new Error('Database error') }),
          };
        }
        return {};
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });

  describe('GET - Comprehensive Stats', () => {
    it('should return comprehensive stats when includeStats=true', async () => {
      // Mock Supabase data
      const mockEvents = [
        {
          event_type: 'scenario_start',
          user_id: 'user-123',
          scenario_id: 'scenario-1',
          score: null,
          turn_number: null,
          timestamp: new Date().toISOString(),
          metadata: {},
        },
        {
          event_type: 'scenario_complete',
          user_id: 'user-123',
          scenario_id: 'scenario-1',
          score: 85,
          turn_number: null,
          timestamp: new Date().toISOString(),
          metadata: {},
        },
        {
          event_type: 'turn_submit',
          user_id: 'user-123',
          scenario_id: 'scenario-1',
          score: null,
          turn_number: 1,
          timestamp: new Date().toISOString(),
          metadata: {},
        },
      ];

      // Mock events query
      mockSupabaseInstance.from.mockImplementation((table: string) => {
        if (table === 'analytics_events') {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                order: jest.fn().mockReturnValue({
                  limit: jest.fn().mockResolvedValue({ data: mockEvents, error: null }),
                }),
              }),
            }),
          };
        }
        return {};
      });

      const request = new NextRequest('http://localhost/api/analytics?includeStats=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('stats');
      expect(data.stats).toHaveProperty('totalScenarios');
      expect(data.stats).toHaveProperty('totalStarts');
      expect(data.stats).toHaveProperty('totalTurns');
      expect(data.stats).toHaveProperty('averageScore');
      expect(data.stats).toHaveProperty('completionRate');
      expect(data.stats).toHaveProperty('scenarioBreakdown');
      expect(data.stats).toHaveProperty('eventTypeBreakdown');
    });

    it('should return source information', async () => {
      mockSupabaseInstance.from.mockImplementation((table: string) => {
        if (table === 'analytics_events') {
          return {
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ data: [], error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const request = new NextRequest('http://localhost/api/analytics');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('source');
      expect(['supabase', 'memory']).toContain(data.source);
    });

    it('should respect limit parameter', async () => {
      const mockEvents = Array.from({ length: 200 }, (_, i) => ({
        event_type: 'scenario_start',
        user_id: 'user-123',
        scenario_id: 'scenario-1',
        score: null,
        turn_number: null,
        timestamp: new Date().toISOString(),
        metadata: {},
      }));

      mockSupabaseInstance.from.mockImplementation((table: string) => {
        if (table === 'analytics_events') {
          return {
            select: jest.fn().mockReturnValue({
              order: jest.fn().mockReturnValue({
                limit: jest.fn().mockResolvedValue({ data: mockEvents.slice(0, 50), error: null }),
              }),
            }),
          };
        }
        return {};
      });

      const request = new NextRequest('http://localhost/api/analytics?limit=50');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.returned).toBeLessThanOrEqual(50);
    });

    it('should filter by userId when provided', async () => {
      const mockEvents = [
        {
          event_type: 'scenario_start',
          user_id: 'user-123',
          scenario_id: 'scenario-1',
          timestamp: new Date().toISOString(),
        },
      ];

      // #region agent log
      try { if (typeof fetch !== 'undefined') fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'analytics-enhanced.test.ts:275',message:'Test: Setting up mock chain',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{}); } catch(e) {}
      // #endregion
      
      // Create eqMock first - this will be called after limit()
      const eqMock = jest.fn().mockResolvedValue({
        data: mockEvents,
        error: null,
      });
      
      // limit() returns an object that has eq() method (for chaining)
      const limitMock = jest.fn(() => ({
        eq: eqMock,
      }));
      
      // order() returns an object with limit() method
      const orderMock = jest.fn(() => ({
        limit: limitMock,
      }));

      // select() returns an object with both eq() and order() methods
      const selectMock = jest.fn(() => ({
        eq: eqMock,
        order: orderMock,
      }));

      // Ensure getSupabaseClient returns the mocked instance
      getSupabaseClient.mockReturnValue(mockSupabaseInstance);
      
      mockSupabaseInstance.from.mockImplementation((table: string) => {
        if (table === 'analytics_events') {
          return {
            select: selectMock,
          };
        }
        return {};
      });

      const request = new NextRequest('http://localhost/api/analytics?userId=user-123');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(selectMock).toHaveBeenCalled();
      expect(eqMock).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase connection errors gracefully', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      getSupabaseClient.mockReturnValue(null);

      const event = {
        eventType: 'scenario_start' as const,
        scenarioId: 'test-scenario',
        timestamp: new Date().toISOString(),
      };

      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: { 'Content-Type': 'application/json' },
      }) as any;

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle invalid JSON gracefully', async () => {
      // Ensure mockSupabaseInstance is available even for error cases
      if (!mockSupabaseInstance) {
        const supabaseClientModule = require('@/lib/supabase-client');
        const getSupabaseClientFn = supabaseClientModule.getSupabaseClient as jest.Mock;
        mockSupabaseInstance = getSupabaseClientFn();
      }

      const request = new NextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      }) as any;

      // Override json method to throw error
      request.json = jest.fn().mockRejectedValue(new Error('Invalid JSON'));

      const response = await POST(request);
      // Invalid JSON should return 400, not 500
      expect(response.status).toBe(400);
    });
  });
});




