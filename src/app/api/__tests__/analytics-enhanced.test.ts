import { POST, GET } from '@/app/api/analytics/route';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(),
}));

// Mock NextRequest
class MockNextRequest {
  public headers: Headers;
  public nextUrl: URL;
  
  constructor(public url: string, public init?: RequestInit) {
    this.headers = new Headers(init?.headers);
    this.nextUrl = new URL(url);
  }
  
  async json() {
    return JSON.parse(this.init?.body as string || '{}');
  }
  
  async text() {
    return this.init?.body as string || '';
  }
  
  get ip() {
    return '127.0.0.1';
  }
}

describe('/api/analytics - Enhanced', () => {
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock Supabase client
    mockSupabase = {
      from: jest.fn(() => ({
        insert: jest.fn(() => ({
          error: null,
        })),
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                data: [],
                error: null,
              })),
            })),
          })),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      })),
    };

    (createClient as jest.Mock).mockReturnValue(mockSupabase);
    
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

      const request = new MockNextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: { 'Content-Type': 'application/json' },
      }) as any;

      const insertMock = jest.fn().mockResolvedValue({ error: null });
      mockSupabase.from.mockReturnValue({
        insert: insertMock,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(insertMock).toHaveBeenCalled();
    });

    it('should fallback to in-memory when Supabase fails', async () => {
      const event = {
        eventType: 'scenario_complete' as const,
        scenarioId: 'test-scenario',
        userId: 'user-123',
        score: 85,
        timestamp: new Date().toISOString(),
      };

      const request = new MockNextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: { 'Content-Type': 'application/json' },
      }) as any;

      // Mock Supabase error
      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: new Error('Database error') }),
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

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: jest.fn(() => ({
            order: jest.fn(() => ({
              limit: jest.fn(() => ({
                data: mockEvents,
                error: null,
              })),
            })),
          })),
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: mockEvents,
              error: null,
            })),
          })),
        })),
      });

      // Mock count query
      mockSupabase.from.mockReturnValueOnce({
        select: jest.fn(() => ({
          data: mockEvents,
          error: null,
        })),
      }).mockReturnValueOnce({
        select: jest.fn(() => ({
          count: 3,
          error: null,
        })),
      });

      const request = new MockNextRequest('http://localhost/api/analytics?includeStats=true') as any;
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
      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: [],
              error: null,
            })),
          })),
        })),
      });

      const request = new MockNextRequest('http://localhost/api/analytics') as any;
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

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          order: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: mockEvents.slice(0, 50),
              error: null,
            })),
          })),
        })),
      });

      const request = new MockNextRequest('http://localhost/api/analytics?limit=50') as any;
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

      const eqMock = jest.fn(() => ({
        order: jest.fn(() => ({
          limit: jest.fn(() => ({
            data: mockEvents,
            error: null,
          })),
        })),
      }));

      mockSupabase.from.mockReturnValue({
        select: jest.fn(() => ({
          eq: eqMock,
        })),
      });

      const request = new MockNextRequest('http://localhost/api/analytics?userId=user-123') as any;
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(eqMock).toHaveBeenCalledWith('user_id', 'user-123');
    });
  });

  describe('Error Handling', () => {
    it('should handle Supabase connection errors gracefully', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;
      (createClient as jest.Mock).mockReturnValue(null);

      const event = {
        eventType: 'scenario_start' as const,
        scenarioId: 'test-scenario',
        timestamp: new Date().toISOString(),
      };

      const request = new MockNextRequest('http://localhost/api/analytics', {
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
      const request = new MockNextRequest('http://localhost/api/analytics', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' },
      }) as any;

      request.json = jest.fn().mockRejectedValue(new Error('Invalid JSON'));

      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });
});




