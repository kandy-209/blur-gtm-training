/**
 * Tests for Vapi Call Transcript API
 */

// CRITICAL: Set environment variables BEFORE importing the route module
process.env.VAPI_API_KEY = 'test-vapi-key-12345';

// Don't mock - just ensure env vars are set before import

import { GET } from '../../[callId]/transcript/route';
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

describe('GET /api/vapi/call/[callId]/transcript', () => {
  it('should return structured transcript data', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 300,
      transcript: 'Full conversation transcript here',
      messages: [
        {
          id: 'msg-1',
          role: 'user',
          content: 'Hello, how are you?',
          createdAt: '2024-01-01T00:00:00Z',
          duration: 5,
          confidence: 0.95,
        },
        {
          id: 'msg-2',
          role: 'assistant',
          content: 'I am doing well, thank you!',
          createdAt: '2024-01-01T00:00:05Z',
          duration: 4,
          confidence: 0.98,
        },
      ],
      transcriptSegments: [
        {
          id: 'seg-1',
          speaker: 'user',
          text: 'Hello, how are you?',
          start: 0,
          end: 5,
          confidence: 0.95,
        },
        {
          id: 'seg-2',
          speaker: 'assistant',
          text: 'I am doing well, thank you!',
          start: 5,
          end: 9,
          confidence: 0.98,
        },
      ],
      startedAt: '2024-01-01T00:00:00Z',
      endedAt: '2024-01-01T00:05:00Z',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/transcript');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.callId).toBe('call-123');
    expect(data.transcript).toBe('Full conversation transcript here');
    expect(data.messages).toHaveLength(2);
    expect(data.messages[0].role).toBe('rep');
    expect(data.messages[1].role).toBe('prospect');
    expect(data.messages[0].content).toBe('Hello, how are you?');
    expect(data.segments).toHaveLength(2);
    expect(data.statistics.repMessages).toBe(1);
    expect(data.statistics.prospectMessages).toBe(1);
    expect(data.statistics.repWordCount).toBeGreaterThan(0);
    expect(data.statistics.prospectWordCount).toBeGreaterThan(0);
  });

  it('should handle missing callId', async () => {
    const request = new NextRequest('http://localhost/api/vapi/call//transcript');
    const params = Promise.resolve({ callId: '' });
    const response = await GET(request, { params });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe('callId is required');
  });

  it('should handle missing API key', async () => {
    delete process.env.VAPI_API_KEY;
    
    const request = new NextRequest('http://localhost/api/vapi/call/call-123/transcript');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Vapi API key not configured');
  });

  it('should handle empty transcript', async () => {
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

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/transcript');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.transcript).toBe('');
    expect(data.messages).toHaveLength(0);
    expect(data.segments).toHaveLength(0);
    expect(data.statistics.repMessages).toBe(0);
    expect(data.statistics.prospectMessages).toBe(0);
    expect(data.statistics.totalWordCount).toBe(0);
  });

  it('should calculate conversation statistics correctly', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 300,
      transcript: 'Rep: Hello? How are you? Prospect: Good! What about you?',
      messages: [
        { id: 'msg-1', role: 'user', content: 'Hello? How are you?', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'msg-2', role: 'assistant', content: 'Good! What about you?', createdAt: '2024-01-01T00:00:05Z' },
      ],
      transcriptSegments: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/transcript');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.statistics.repMessages).toBe(1);
    expect(data.statistics.prospectMessages).toBe(1);
    expect(data.statistics.repQuestions).toBe(1);
    expect(data.statistics.prospectQuestions).toBe(1);
    expect(data.statistics.totalQuestions).toBe(2);
    expect(data.statistics.talkToListenRatio).toBeGreaterThan(0);
    expect(data.statistics.talkToListenRatio).toBeLessThanOrEqual(1);
  });

  it('should map role names correctly', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 60,
      transcript: 'Test',
      messages: [
        { id: 'msg-1', role: 'user', content: 'User message', createdAt: '2024-01-01T00:00:00Z' },
        { id: 'msg-2', role: 'assistant', content: 'Assistant message', createdAt: '2024-01-01T00:00:05Z' },
        { id: 'msg-3', role: 'system', content: 'System message', createdAt: '2024-01-01T00:00:10Z' },
      ],
      transcriptSegments: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/transcript');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.messages[0].role).toBe('rep');
    expect(data.messages[1].role).toBe('prospect');
    expect(data.messages[2].role).toBe('system');
  });

  it('should handle transcript segments with various formats', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 120,
      transcript: 'Test',
      messages: [],
      transcriptSegments: [
        { id: 'seg-1', speaker: 'user', text: 'Hello', start: 0, end: 2 },
        { id: 'seg-2', role: 'assistant', content: 'Hi', startTime: 2, endTime: 4 },
        { id: 'seg-3', speaker: 'user', text: 'How are you?', start: 4, end: 7, confidence: 0.9 },
      ],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/transcript');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.segments).toHaveLength(3);
    expect(data.segments[0].speaker).toBe('user');
    expect(data.segments[1].speaker).toBe('assistant');
    expect(data.segments[0].text).toBe('Hello');
    expect(data.segments[1].text).toBe('Hi');
  });

  it('should handle Vapi API errors', async () => {
    // Ensure API key is set for this test
    process.env.VAPI_API_KEY = 'test-vapi-key-12345';
    
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: async () => ({ message: 'Call not found' }),
    });

    const request = new NextRequest('http://localhost/api/vapi/call/invalid-call/transcript');
    const params = Promise.resolve({ callId: 'invalid-call' });
    const response = await GET(request, { params });

    expect(response.status).toBe(500);
    const data = await response.json();
    expect(data.error).toBe('Failed to get call transcript');
  });

  it('should handle missing optional fields in messages', async () => {
    const mockCallData = {
      id: 'call-123',
      status: 'completed',
      duration: 60,
      transcript: 'Test',
      messages: [
        { id: 'msg-1', role: 'user', content: 'Hello' },
        { id: 'msg-2', role: 'assistant' },
      ],
      transcriptSegments: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockCallData,
    });

    const request = new NextRequest('http://localhost/api/vapi/call/call-123/transcript');
    const params = Promise.resolve({ callId: 'call-123' });
    const response = await GET(request, { params });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.messages[0].timestamp).toBeNull();
    expect(data.messages[0].duration).toBeNull();
    expect(data.messages[1].content).toBe('');
  });
});

