/**
 * Sales Call API Tests
 */

import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/vapi/sales-call/route';

// Mock dependencies
jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((input: string) => input),
}));

jest.mock('@/data/scenarios', () => ({
  scenarios: [
    {
      id: 'TEST_SCENARIO',
      persona: {
        name: 'Test Persona',
        currentSolution: 'Test Solution',
        primaryGoal: 'Test Goal',
        skepticism: 'Test Skepticism',
        tone: 'Professional',
      },
      objection_category: 'Test Category',
      objection_statement: 'Test objection',
      keyPoints: ['Point 1', 'Point 2'],
    },
  ],
}));

// Mock fetch
global.fetch = jest.fn();

describe('Sales Call API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VAPI_API_KEY = 'test-vapi-key';
    process.env.MODAL_FUNCTION_URL = 'https://test-modal-url.modal.run';
  });

  describe('POST /api/vapi/sales-call', () => {
    it('should initiate call successfully', async () => {
      const mockAssistantResponse = {
        id: 'assistant_123',
        name: 'Test Assistant',
      };

      const mockCallResponse = {
        id: 'call_123',
        status: 'ringing',
      };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAssistantResponse,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCallResponse,
        });

      const request = new NextRequest('http://localhost:3000/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+15551234567',
          userId: 'user_123',
          scenarioId: 'TEST_SCENARIO',
          trainingMode: 'practice',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.callId).toBe('call_123');
      expect(data.status).toBe('ringing');
    });

    it('should return error for missing required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+15551234567',
          // Missing userId and scenarioId
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('required');
    });

    it('should return error for invalid phone number', async () => {
      const request = new NextRequest('http://localhost:3000/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: 'invalid',
          userId: 'user_123',
          scenarioId: 'TEST_SCENARIO',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('phone number');
    });

    it('should return error for invalid scenario', async () => {
      const request = new NextRequest('http://localhost:3000/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+15551234567',
          userId: 'user_123',
          scenarioId: 'INVALID_SCENARIO',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Scenario not found');
    });

    it('should return error if Vapi API key not configured', async () => {
      delete process.env.VAPI_API_KEY;

      const request = new NextRequest('http://localhost:3000/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+15551234567',
          userId: 'user_123',
          scenarioId: 'TEST_SCENARIO',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Vapi API key');
    });
  });

  describe('GET /api/vapi/sales-call', () => {
    it('should get call analysis successfully', async () => {
      const mockAnalysis = {
        call_id: 'call_123',
        scenario_id: 'TEST_SCENARIO',
        metrics: {
          talk_time: 120,
          listen_time: 180,
          interruptions: 2,
          objections_raised: 3,
          objections_resolved: 2,
          meeting_booked: true,
          sale_closed: false,
          energy_level: 75,
          confidence_score: 80,
        },
        analysis: {
          overall_score: 80,
          strengths: ['Good engagement'],
          areas_for_improvement: ['More meeting attempts'],
        },
        processed_at: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis,
      });

      const request = new NextRequest(
        'http://localhost:3000/api/vapi/sales-call?callId=call_123&scenarioId=TEST_SCENARIO'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.metrics).toBeDefined();
      expect(data.analysis).toBeDefined();
    });

    it('should return error for missing callId', async () => {
      const request = new NextRequest(
        'http://localhost:3000/api/vapi/sales-call?scenarioId=TEST_SCENARIO'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('callId');
    });

    it('should return error if Modal URL not configured', async () => {
      delete process.env.MODAL_FUNCTION_URL;

      const request = new NextRequest(
        'http://localhost:3000/api/vapi/sales-call?callId=call_123&scenarioId=TEST_SCENARIO'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain('Modal function URL');
    });
  });
});

