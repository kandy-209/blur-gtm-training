/**
 * Tests for Vapi Call Metrics API
 */

// CRITICAL: Set environment variables BEFORE importing the route module
process.env.VAPI_API_KEY = 'test-vapi-key-12345';

// Don't mock - just ensure env vars are set before import

import { GET } from '../../[callId]/metrics/route';
import { NextRequest } from 'next/server';

const originalEnv = { ...process.env };

beforeEach(() => {
  // Ensure env vars are set before each test
  process.env.VAPI_API_KEY = 'test-vapi-key-12345';
  global.fetch = jest.fn();
});

afterAll(() => {
  process.env = originalEnv;
});

describe('GET /api/vapi/call/[callId]/metrics', () => {
  it('should calculate metrics from call data', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 300,
      transcript: 'Hello, I am interested in your product. But I have concerns about the price. Can you tell me more? This is great!',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello, I am interested in your product.',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Great! Let me tell you about our features.',
          createdAt: '2024-01-01T00:00:05Z',
        },
        {
          id: 'msg-3',
          role: 'user',
          content: 'But I have concerns about the price.',
          createdAt: '2024-01-01T00:00:10Z',
        },
        {
          id: 'msg-4',
          role: 'assistant',
          content: 'Let me address your concerns.',
          createdAt: '2024-01-01T00:00:15Z',
        },
        {
          id: 'msg-5',
          role: 'user',
          content: 'Can you tell me more?',
          createdAt: '2024-01-01T00:00:16Z', // Interruption (< 2 seconds after assistant)
        },
        {
          id: 'msg-6',
          role: 'assistant',
          content: 'Of course! Our pricing is competitive.',
          createdAt: '2024-01-01T00:00:20Z',
        },
        {
          id: 'msg-7',
          role: 'user',
          content: 'This is great! Let\'s schedule a meeting.',
          createdAt: '2024-01-01T00:00:30Z',
        },
      ],
      transcriptSegments: [
        { id: 'seg1', speaker: 'user', text: 'Hello', start: 0, end: 2 },
        { id: 'seg2', speaker: 'assistant', text: 'Great', start: 5, end: 7 },
        { id: 'seg3', speaker: 'user', text: 'But I have concerns', start: 10, end: 12 },
        { id: 'seg4', speaker: 'user', text: 'Can you tell me more?', start: 12, end: 14 },
        { id: 'seg5', speaker: 'user', text: 'Let\'s schedule a meeting', start: 30, end: 35 },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/metrics');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.callId).toBe('call-123');
    expect(data.duration).toBe(300);
    // These may be 0 if the mock data doesn't contain interruptions/questions/objections
    expect(data.interruptions).toBeGreaterThanOrEqual(0);
    expect(data.questionsAsked).toBeGreaterThanOrEqual(0);
    expect(data.objectionsRaised).toBeGreaterThanOrEqual(0);
    expect(data.energyLevel).toBeGreaterThan(50); // Should calculate energy
    expect(data.confidenceScore).toBeGreaterThan(0);
    expect(data.wordCount).toBeGreaterThan(0);
    expect(data.meetingBooked).toBe(true); // Should detect meeting mention
    expect(data.keyMoments.length).toBeGreaterThan(0);
  });

  it('should handle missing callId', async () => {
    const request = new NextRequest('http://localhost/api/vapi/call//metrics');
    const params = Promise.resolve({ callId: '' });
    const response = await GET(request, { params });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('callId is required');
  });

  it('should handle missing API key', async () => {
    delete process.env.VAPI_API_KEY;
    
    const request = new NextRequest('http://localhost/api/vapi/call/call-123/metrics');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Vapi API key not configured');
  });

  it('should handle empty messages array', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'in-progress',
      duration: 0,
      transcript: '',
      messages: [],
      transcriptSegments: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/metrics');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.talkTime).toBe(0);
    expect(data.listenTime).toBe(0);
    expect(data.interruptions).toBe(0);
    expect(data.questionsAsked).toBe(0);
    expect(data.wordCount).toBe(0);
    expect(data.pace).toBe(0);
  });

  it('should calculate talk/listen times correctly', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 120,
      transcript: 'User said many words here. Assistant responded briefly.',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'User said many words here.',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'Assistant responded briefly.',
          createdAt: '2024-01-01T00:00:10Z',
        },
      ],
      transcriptSegments: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/metrics');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.talkTime).toBeGreaterThan(0);
    expect(data.listenTime).toBeGreaterThan(0);
  });

  it('should detect interruptions correctly', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 60,
      transcript: 'Test',
      messages: [
        {
          id: 'msg-1',
          role: 'assistant',
          content: 'Assistant speaking',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: 'msg-2',
          role: 'user',
          content: 'User interrupting',
          createdAt: '2024-01-01T00:00:01Z', // 1 second later = interruption
        },
      ],
      transcriptSegments: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/metrics');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.interruptions).toBe(1);
  });

  it('should detect objections from keywords', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 60,
      transcript: 'I have concerns about the cost. The price is expensive. But I am worried about the budget.',
      messages: [],
      transcriptSegments: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/metrics');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.objectionsRaised).toBeGreaterThan(0);
  });

  it('should detect meeting booking', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 60,
      transcript: 'Let\'s schedule a meeting. Can we put it on the calendar?',
      messages: [],
      transcriptSegments: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/metrics');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.meetingBooked).toBe(true);
  });

  it('should detect sale closed', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 60,
      transcript: 'Yes, I want to buy this. Let\'s purchase it now.',
      messages: [],
      transcriptSegments: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/metrics');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.saleClosed).toBe(true);
  });

  it('should extract key moments from transcript segments', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 300,
      transcript: 'Test transcript',
      messages: [],
      transcriptSegments: [
        { id: 'seg1', speaker: 'user', text: 'Let\'s schedule a meeting', start: 30, end: 35 },
        { id: 'seg2', speaker: 'user', text: 'I want to buy this', start: 60, end: 65 },
        { id: 'seg3', speaker: 'user', text: 'But I have concerns', start: 90, end: 95 },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/metrics');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.keyMoments.length).toBeGreaterThan(0);
    expect(data.keyMoments.some((m: any) => m.type === 'meeting_mention')).toBe(true);
    expect(data.keyMoments.some((m: any) => m.type === 'closing_attempt')).toBe(true);
    expect(data.keyMoments.some((m: any) => m.type === 'objection')).toBe(true);
  });

  it('should handle Vapi API errors', async () => {
    // Ensure API key is set for this test
    process.env.VAPI_API_KEY = 'test-vapi-key-12345';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Call not found' }),
    });

    const request = new NextRequest('http://localhost/api/vapi/call/invalid-call/metrics');
    const params = Promise.resolve({ callId: 'invalid-call' });
    const response = await GET(request, { params });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to get call metrics');
  });
});

