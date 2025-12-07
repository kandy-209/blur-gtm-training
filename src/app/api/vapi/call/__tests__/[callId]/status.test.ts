/**
 * Tests for Vapi Call Status API
 */

// CRITICAL: Set environment variables BEFORE importing the route module
process.env.VAPI_API_KEY = 'test-vapi-key-12345';

// Don't mock - just ensure env vars are set before import

import { GET } from '../../[callId]/status/route';
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

describe('GET /api/vapi/call/[callId]/status', () => {
  it('should return call status successfully', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'in-progress',
      duration: 120,
      transcript: 'Test transcript',
      recordingUrl: 'https://example.com/recording.mp3',
      messages: [
        { role: 'user', content: 'Hello', createdAt: '2024-01-01T00:00:00Z' },
        { role: 'assistant', content: 'Hi there', createdAt: '2024-01-01T00:00:05Z' },
      ],
      startedAt: '2024-01-01T00:00:00Z',
      endedAt: null,
      cost: 0.05,
      metadata: { scenarioId: 'test-scenario' },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/status');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.callId).toBe('call-123');
    expect(data.status).toBe('in-progress');
    expect(data.duration).toBe(120);
    expect(data.transcript).toBe('Test transcript');
    expect(data.recordingUrl).toBe('https://example.com/recording.mp3');
    expect(data.messages).toHaveLength(2);
    expect(data.startedAt).toBe('2024-01-01T00:00:00Z');
    expect(data.cost).toBe(0.05);
    expect(data.metadata).toEqual({ scenarioId: 'test-scenario' });
  });

  it('should handle missing callId', async () => {
    const request = new NextRequest('http://localhost/api/vapi/call//status');
    const params = Promise.resolve({ callId: '' });
    const response = await GET(request, { params });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('callId is required');
  });

  it('should handle missing API key', async () => {
    delete process.env.VAPI_API_KEY;
    
    const request = new NextRequest('http://localhost/api/vapi/call/call-123/status');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Vapi API key not configured');
  });

  it('should handle Vapi API errors', async () => {
    // Ensure API key is set for this test
    process.env.VAPI_API_KEY = 'test-vapi-key-12345';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Call not found' }),
    });

    const request = new NextRequest('http://localhost/api/vapi/call/invalid-call/status');
    const params = Promise.resolve({ callId: 'invalid-call' });
    const response = await GET(request, { params });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to get call status');
  });

  it('should return enhanced data fields', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 300,
      transcript: 'Full conversation transcript',
      recordingUrl: 'https://example.com/recording.mp3',
      messages: [],
      startedAt: '2024-01-01T00:00:00Z',
      endedAt: '2024-01-01T00:05:00Z',
      cost: 0.15,
      costBreakdown: { transcription: 0.05, voice: 0.10 },
      metadata: { scenarioId: 'test', userId: 'user-123' },
      assistantId: 'assistant-123',
      customer: { number: '+1234567890' },
      phoneNumberId: 'phone-123',
      summary: 'Call summary',
      topics: ['topic1', 'topic2'],
      sentiment: 'positive',
      silenceDuration: 10,
      interruptions: 2,
      talkTime: 150,
      listenTime: 150,
      voiceMetrics: { pitch: 150, volume: 60 },
      transcriptSegments: [
        { id: 'seg1', speaker: 'user', text: 'Hello', start: 0, end: 2 },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/status');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.summary).toBe('Call summary');
    expect(data.topics).toEqual(['topic1', 'topic2']);
    expect(data.sentiment).toBe('positive');
    expect(data.silenceDuration).toBe(10);
    expect(data.interruptions).toBe(2);
    expect(data.talkTime).toBe(150);
    expect(data.listenTime).toBe(150);
    expect(data.voiceMetrics).toEqual({ pitch: 150, volume: 60 });
    expect(data.transcriptSegments).toHaveLength(1);
  });

  it('should handle null/undefined fields gracefully', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'in-progress',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/status');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.duration).toBe(0);
    expect(data.transcript).toBe('');
    expect(data.recordingUrl).toBeNull();
    expect(data.messages).toEqual([]);
    expect(data.startedAt).toBeNull();
    expect(data.cost).toBeNull();
    expect(data.metadata).toEqual({});
    expect(data.topics).toEqual([]);
    expect(data.transcriptSegments).toEqual([]);
  });
});

