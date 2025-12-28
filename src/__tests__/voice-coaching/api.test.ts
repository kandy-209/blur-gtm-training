/**
 * Voice Coaching API Tests
 */

import { NextRequest } from 'next/server';
import { POST as saveMetrics, GET as getMetrics } from '@/app/api/voice-coaching/metrics/route';
import { GET as getFeedback } from '@/app/api/voice-coaching/feedback/route';

// Set environment variables BEFORE any imports
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-key';

// Mock Supabase client
const mockSupabaseClient = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => ({
        single: jest.fn().mockResolvedValue({
          data: { id: 'test-id', conversation_id: 'test_conv' },
          error: null,
        }),
      })),
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        order: jest.fn(() => ({
          ascending: jest.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        })),
      })),
    })),
  })),
};

// Mock Supabase before route imports it
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('Voice Coaching API', () => {
  describe('POST /api/voice-coaching/metrics', () => {
    it('should save metrics successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/voice-coaching/metrics', {
        method: 'POST',
        body: JSON.stringify({
          conversationId: 'test_conv_123',
          userId: 'user_123',
          metrics: {
            pace: 165,
            pitch: 180,
            volume: -10,
            pauses: 5,
            clarity: 85,
            confidence: 78,
          },
          timestamp: Date.now(),
        }),
      });

      const response = await saveMetrics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should return error for missing conversationId', async () => {
      const request = new NextRequest('http://localhost:3000/api/voice-coaching/metrics', {
        method: 'POST',
        body: JSON.stringify({
          metrics: {
            pace: 165,
          },
        }),
      });

      const response = await saveMetrics(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('conversationId');
    });
  });

  describe('GET /api/voice-coaching/metrics', () => {
    it('should retrieve metrics for conversation', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/voice-coaching/metrics?conversationId=test_conv_123'
      );

      const response = await getMetrics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.metrics)).toBe(true);
    });

    it('should return error for missing conversationId', async () => {
      const request = new NextRequest('http://localhost:3000/api/voice-coaching/metrics');

      const response = await getMetrics(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('conversationId');
    });
  });

  describe('GET /api/voice-coaching/feedback', () => {
    it('should retrieve feedback for conversation', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/voice-coaching/feedback?conversationId=test_conv_123'
      );

      const response = await getFeedback(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(Array.isArray(data.feedback)).toBe(true);
      expect(Array.isArray(data.suggestions)).toBe(true);
    });
  });
});

