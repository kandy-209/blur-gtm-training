/**
 * Integration Tests: Sales Call Flow
 * Tests the complete flow from call initiation to analysis
 */

import { POST, GET } from '@/app/api/vapi/sales-call/route';
import { NextRequest } from 'next/server';

// Mock fetch globally
global.fetch = jest.fn();

describe('Sales Call Integration Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.VAPI_API_KEY = 'test-vapi-key';
    process.env.MODAL_FUNCTION_URL = 'https://test-modal-url.modal.run';
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID = 'test-voice-id';
  });

  describe('Complete Flow', () => {
    it('should handle complete call flow', async () => {
      // Step 1: Initiate call
      const mockAssistant = { id: 'assistant_123' };
      const mockCall = { id: 'call_123', status: 'ringing' };

      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockAssistant,
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockCall,
        });

      const initiateRequest = new NextRequest('http://localhost:3000/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+15551234567',
          userId: 'user_123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      const initiateResponse = await POST(initiateRequest);
      const initiateData = await initiateResponse.json();

      expect(initiateData.success).toBe(true);
      expect(initiateData.callId).toBe('call_123');

      // Step 2: Get analysis (after call completes)
      const mockAnalysis = {
        call_id: 'call_123',
        scenario_id: 'SKEPTIC_VPE_001',
        metrics: {
          talk_time: 120,
          objections_raised: 3,
          meeting_booked: true,
        },
        analysis: {
          overall_score: 85,
          strengths: ['Good engagement'],
        },
        processed_at: new Date().toISOString(),
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockAnalysis,
      });

      const analysisRequest = new NextRequest(
        'http://localhost:3000/api/vapi/sales-call?callId=call_123&scenarioId=SKEPTIC_VPE_001'
      );

      const analysisResponse = await GET(analysisRequest);
      const analysisData = await analysisResponse.json();

      expect(analysisData.success).toBe(true);
      expect(analysisData.metrics).toBeDefined();
      expect(analysisData.analysis).toBeDefined();
    });

    it('should handle call initiation failure gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(
        new Error('Vapi API error')
      );

      const request = new NextRequest('http://localhost:3000/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+15551234567',
          userId: 'user_123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle analysis failure gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Modal function error' }),
      });

      const request = new NextRequest(
        'http://localhost:3000/api/vapi/sales-call?callId=call_123&scenarioId=SKEPTIC_VPE_001'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should validate phone number format', async () => {
      const request = new NextRequest('http://localhost:3000/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: 'invalid',
          userId: 'user_123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('phone number');
    });

    it('should require all fields for call initiation', async () => {
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
  });
});

