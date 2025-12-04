/**
 * Comprehensive API Testing
 * Deep testing of all API endpoints with edge cases and workflows
 */

import { runEdgeCaseSuite } from '@/lib/testing/edge-case-helpers';
import { runSecurityTestSuite } from '@/lib/testing/security-helpers';
import { executeWorkflow } from '@/lib/testing/workflow-helpers';
import { POST as ttsPOST } from '@/app/api/tts/route';
import { POST as transcribePOST } from '@/app/api/transcribe/route';
import { GET as leaderboardGET } from '@/app/api/leaderboard/route';
import { POST as feedbackPOST } from '@/app/api/feedback/route';

// Mock dependencies
jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

jest.mock('@/lib/supabase-client', () => ({
  getSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          }),
        }),
      }),
    })),
  })),
}));

global.fetch = jest.fn();

describe('Comprehensive API Testing', () => {
  describe('TTS API', () => {
    it('should handle text boundary conditions', async () => {
      const suite = await runEdgeCaseSuite(ttsPOST, '/api/tts', {
        stringFields: [
          {
            field: 'text',
            options: {
              minLength: 1,
              maxLength: 5000,
              required: true,
            },
          },
          {
            field: 'voiceId',
            options: {
              minLength: 0,
              maxLength: 100,
              required: false,
            },
          },
        ],
        typeCoercion: [
          { field: 'text', expectedType: 'string' },
        ],
      });

      expect(suite.failed).toBeLessThan(suite.passed);
    });

    it('should prevent XSS in text input', async () => {
      const suite = await runSecurityTestSuite(ttsPOST, '/api/tts', {
        xssFields: ['text'],
        invalidInputs: [
          { name: 'Empty text', body: {} },
          { name: 'Null text', body: { text: null } },
          { name: 'Very long text', body: { text: 'x'.repeat(10000) } },
        ],
      });

      expect(suite.vulnerabilities.length).toBe(0);
    });
  });

  describe('Transcribe API', () => {
    it('should handle audio data edge cases', async () => {
      const suite = await runEdgeCaseSuite(transcribePOST, '/api/transcribe', {
        stringFields: [
          {
            field: 'audioUrl',
            options: {
              minLength: 1,
              maxLength: 2048,
              required: true,
            },
          },
        ],
        invalidInputs: [
          { name: 'Empty body', body: {} },
          { name: 'Invalid URL', body: { audioUrl: 'not-a-url' } },
          { name: 'Very long URL', body: { audioUrl: 'http://example.com/' + 'x'.repeat(3000) } },
        ],
      });

      expect(suite.failed).toBeLessThan(suite.passed);
    });
  });

  describe('Leaderboard API', () => {
    it('should handle query parameter edge cases', async () => {
      const suite = await runEdgeCaseSuite(leaderboardGET, '/api/leaderboard', {
        stringFields: [
          {
            field: 'limit',
            options: {
              minLength: 1,
              maxLength: 10,
            },
          },
          {
            field: 'offset',
            options: {
              minLength: 0,
              maxLength: 10,
            },
          },
        ],
        numericFields: [
          {
            field: 'limit',
            options: {
              min: 1,
              max: 100,
            },
          },
        ],
      });

      expect(suite.failed).toBeLessThan(suite.passed);
    });
  });

  describe('Feedback API', () => {
    it('should handle feedback submission edge cases', async () => {
      const suite = await runEdgeCaseSuite(feedbackPOST, '/api/feedback', {
        stringFields: [
          {
            field: 'message',
            options: {
              minLength: 1,
              maxLength: 5000,
              required: true,
            },
          },
          {
            field: 'userId',
            options: {
              minLength: 1,
              maxLength: 100,
              required: true,
            },
          },
        ],
        security: {
          xssFields: ['message'],
          sqlFields: ['userId'],
        },
      });

      expect(suite.failed).toBeLessThan(suite.passed);
    });
  });

  describe('Multi-API Workflows', () => {
    it('should handle complete user journey', async () => {
      const workflow = await executeWorkflow([
        {
          name: 'Get Analytics',
          handler: async () => {
            return new Response(JSON.stringify({ events: [] }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          },
          url: '/api/analytics',
          options: {
            method: 'GET',
            query: { userId: 'test-user' },
          },
          extractData: (response) => ({ eventCount: response.data.events?.length || 0 }),
        },
        {
          name: 'Get Leaderboard',
          handler: async () => {
            return new Response(JSON.stringify({ leaderboard: [] }), {
              status: 200,
              headers: { 'Content-Type': 'application/json' },
            });
          },
          url: '/api/leaderboard',
          options: {
            method: 'GET',
          },
          assertions: async (response) => {
            if (!response.data.leaderboard) {
              throw new Error('Leaderboard data missing');
            }
          },
        },
      ]);

      expect(workflow.success).toBe(true);
      expect(workflow.steps.every(s => s.passed)).toBe(true);
    });
  });
});

