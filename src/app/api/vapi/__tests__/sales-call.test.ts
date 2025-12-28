/**
 * Comprehensive tests for Vapi Sales Call API
 */

// CRITICAL: Set environment variables BEFORE importing the route module
// The route module reads process.env.VAPI_API_KEY at module load time
process.env.VAPI_API_KEY = 'test-vapi-key-12345';
process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID = 'test-voice-id';
process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID = 'test-agent-id';

import { POST } from '../sales-call/route';
import { NextRequest } from 'next/server';

const originalEnv = { ...process.env };

// Mock fetch
global.fetch = jest.fn();

// Mock scenarios
jest.mock('@/data/scenarios', () => ({
  scenarios: [
    {
      id: 'SKEPTIC_VPE_001',
      persona: {
        name: 'Skeptical VP of Engineering at Acme Corp',
        currentSolution: 'GitHub Copilot Enterprise',
        primaryGoal: 'Evaluate solutions',
        skepticism: 'Moderate',
        tone: 'Professional',
      },
      objection_statement: 'I need to think about it',
      keyPoints: ['Point 1', 'Point 2'],
    },
    {
      id: 'SHORT_NAME',
      persona: {
        name: 'John Doe',
      },
      objection_statement: 'Hello',
      keyPoints: [],
    },
  ],
}));

describe('Vapi Sales Call API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure env vars are set before each test
    process.env.VAPI_API_KEY = 'test-vapi-key-12345';
    process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID = 'test-voice-id';
    process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID = 'test-agent-id';
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('Input Validation', () => {
    it('should reject request without phoneNumber', async () => {
      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          userId: 'user123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('phoneNumber');
    });

    it('should reject request without userId', async () => {
      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('userId');
    });

    it('should reject request without scenarioId', async () => {
      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          userId: 'user123',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('scenarioId');
    });

    it('should reject invalid phone number format', async () => {
      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: 'invalid',
          userId: 'user123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('phone number');
    });

    it('should reject non-existent scenario', async () => {
      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          userId: 'user123',
          scenarioId: 'NON_EXISTENT',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toContain('Scenario not found');
    });
  });

  describe('Assistant Name Generation', () => {
    it('should truncate long persona names to 40 characters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'assistant-123', name: 'Test' }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'call-123', status: 'ringing' }),
      });

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          userId: 'user123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      await POST(request);

      const assistantCall = (global.fetch as jest.Mock).mock.calls[0];
      const assistantBody = JSON.parse(assistantCall[1].body);

      expect(assistantBody.name.length).toBeLessThanOrEqual(40);
      expect(assistantBody.name).toContain('Sales -');
    });

    it('should handle short persona names correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'assistant-123', name: 'Test' }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'call-123', status: 'ringing' }),
      });

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          userId: 'user123',
          scenarioId: 'SHORT_NAME',
        }),
      });

      await POST(request);

      const assistantCall = (global.fetch as jest.Mock).mock.calls[0];
      const assistantBody = JSON.parse(assistantCall[1].body);

      expect(assistantBody.name.length).toBeLessThanOrEqual(40);
      expect(assistantBody.name).toBe('Sales - John Doe');
    });
  });

  describe('Vapi API Request Format', () => {
    it('should use correct voice provider (11labs)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'assistant-123', name: 'Test' }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'call-123', status: 'ringing' }),
      });

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          userId: 'user123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      await POST(request);

      const assistantCall = (global.fetch as jest.Mock).mock.calls[0];
      const assistantBody = JSON.parse(assistantCall[1].body);

      expect(assistantBody.voice.provider).toBe('11labs');
      expect(assistantBody.voice.provider).not.toBe('elevenlabs');
    });

    it('should not include transcriptionEnabled property', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'assistant-123', name: 'Test' }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'call-123', status: 'ringing' }),
      });

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          userId: 'user123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      await POST(request);

      const assistantCall = (global.fetch as jest.Mock).mock.calls[0];
      const assistantBody = JSON.parse(assistantCall[1].body);

      expect(assistantBody.transcriptionEnabled).toBeUndefined();
    });

    it('should include required fields in assistant request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'assistant-123', name: 'Test' }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'call-123', status: 'ringing' }),
      });

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          userId: 'user123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      await POST(request);

      const assistantCall = (global.fetch as jest.Mock).mock.calls[0];
      const assistantBody = JSON.parse(assistantCall[1].body);

      expect(assistantBody).toHaveProperty('name');
      expect(assistantBody).toHaveProperty('model');
      expect(assistantBody).toHaveProperty('voice');
      expect(assistantBody).toHaveProperty('firstMessage');
      expect(assistantBody).toHaveProperty('recordingEnabled');
      expect(assistantBody.model).toHaveProperty('provider');
      expect(assistantBody.model).toHaveProperty('model');
      expect(assistantBody.model).toHaveProperty('messages');
      expect(assistantBody.voice).toHaveProperty('provider');
      expect(assistantBody.voice).toHaveProperty('voiceId');
    });
  });

  describe('Error Handling', () => {
    it('should handle Vapi API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => JSON.stringify({ error: 'Invalid request' }),
      });

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          userId: 'user123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // API may return 400 for invalid requests or 500 for server errors
      expect([400, 500]).toContain(response.status);
      expect(data.error).toBeDefined();
    });

    it('should handle missing API key', async () => {
      const originalKey = process.env.VAPI_API_KEY;
      delete process.env.VAPI_API_KEY;

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+1234567890',
          userId: 'user123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toContain('API key');

      process.env.VAPI_API_KEY = originalKey;
    });
  });

  describe('Phone Number Formatting', () => {
    it('should format phone number correctly', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'assistant-123', name: 'Test' }),
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ id: 'call-123', status: 'ringing' }),
      });

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '1234567890',
          userId: 'user123',
          scenarioId: 'SKEPTIC_VPE_001',
        }),
      });

      await POST(request);

      const callCall = (global.fetch as jest.Mock).mock.calls[1];
      const callBody = JSON.parse(callCall[1].body);

      // phoneNumber should be in customer.number (Vapi API format)
      expect(callBody).toHaveProperty('customer');
      expect(callBody.customer).toHaveProperty('number');
      expect(callBody.customer.number).toMatch(/^\+/);
    });
  });
});

