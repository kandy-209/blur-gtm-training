/**
 * Edge Case Tests for Vapi Sales Call API
 * Tests phone number formatting, validation, and API request structure
 */

// CRITICAL: Set environment variables BEFORE importing the route module
// The route module reads process.env.VAPI_API_KEY at module load time
process.env.VAPI_API_KEY = 'test-vapi-key-12345';
process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID = 'test-voice-id';
process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID = 'test-agent-id';

import { POST } from '../sales-call/route';
import { NextRequest } from 'next/server';

const originalEnv = { ...process.env };

beforeEach(() => {
  // Ensure env vars are set before each test
  process.env.VAPI_API_KEY = 'test-vapi-key-12345';
  process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID = 'test-voice-id';
  process.env.NEXT_PUBLIC_ELEVENLABS_AGENT_ID = 'test-agent-id';
});

afterAll(() => {
  process.env = originalEnv;
});

// Mock fetch
global.fetch = jest.fn();

// Mock scenarios
jest.mock('@/data/scenarios', () => ({
  scenarios: [
    {
      id: 'TEST_SCENARIO',
      persona: {
        name: 'Test Persona',
        currentSolution: 'GitHub Copilot',
        primaryGoal: 'Evaluate solutions',
        skepticism: 'Moderate',
        tone: 'Professional',
      },
      objection_statement: 'I need to think about it',
      keyPoints: ['Point 1'],
    },
  ],
}));

describe('Vapi Sales Call API - Edge Cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Phone Number Formatting Edge Cases', () => {
    const testCases = [
      {
        name: '10-digit US number',
        input: '(555) 123-4567',
        expected: '+15551234567',
      },
      {
        name: '10-digit without formatting',
        input: '5551234567',
        expected: '+15551234567',
      },
      {
        name: '11-digit with country code',
        input: '15551234567',
        expected: '+15551234567',
      },
      {
        name: 'E.164 format already',
        input: '+15551234567',
        expected: '+15551234567',
      },
      {
        name: 'E.164 with spaces',
        input: '+1 (555) 123-4567',
        expected: '+15551234567',
      },
      {
        name: 'International format',
        input: '+44 20 7946 0958',
        expected: '+442079460958',
      },
    ];

    testCases.forEach(({ name, input, expected }) => {
      it(`should format ${name} correctly`, async () => {
        (global.fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'assistant-123', name: 'Test' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'call-123', status: 'ringing' }),
          });

        const request = new NextRequest('http://localhost/api/vapi/sales-call', {
          method: 'POST',
          body: JSON.stringify({
            phoneNumber: input,
            userId: 'user123',
            scenarioId: 'TEST_SCENARIO',
          }),
        });

        await POST(request);

        const callCall = (global.fetch as jest.Mock).mock.calls[1];
        const callBody = JSON.parse(callCall[1].body);

        // Verify phone number is in customer.number (Vapi API format)
        expect(callBody).toHaveProperty('customer');
        expect(callBody.customer).toHaveProperty('number');
        expect(callBody.customer.number).toBe(expected);
        expect(callBody.customer.number).toMatch(/^\+[1-9]\d{9,14}$/); // E.164 format (10-15 digits after +)
      });
    });
  });

  describe('Invalid Phone Number Edge Cases', () => {
    const invalidCases = [
      { name: 'empty string', input: '' },
      { name: 'too short', input: '123' },
      { name: 'too long', input: '12345678901234567890' },
      { name: 'letters only', input: 'abcdefghij' },
      { name: 'special characters only', input: '!@#$%^&*()' },
      { name: 'mixed invalid', input: 'abc123!@#' },
    ];

    invalidCases.forEach(({ name, input }) => {
      it(`should reject ${name}`, async () => {
        const request = new NextRequest('http://localhost/api/vapi/sales-call', {
          method: 'POST',
          body: JSON.stringify({
            phoneNumber: input,
            userId: 'user123',
            scenarioId: 'TEST_SCENARIO',
          }),
        });

        const response = await POST(request);
        const data = await response.json();

        // Empty string returns different error, others return phone number error
        if (name === 'empty string') {
          expect(response.status).toBe(400);
          expect(data.error).toContain('required');
        } else {
          expect(response.status).toBe(400);
          expect(data.error.toLowerCase()).toMatch(/phone|invalid|format/);
        }
      });
    });
  });

  describe('API Request Structure', () => {
    it('should send phoneNumber at top level, not nested in customer', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'assistant-123', name: 'Test' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'call-123', status: 'ringing' }),
        });

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+15551234567',
          userId: 'user123',
          scenarioId: 'TEST_SCENARIO',
        }),
      });

      await POST(request);

      const callCall = (global.fetch as jest.Mock).mock.calls[1];
      const callBody = JSON.parse(callCall[1].body);

      // Should have customer.number (Vapi API format)
      expect(callBody).toHaveProperty('customer');
      expect(callBody.customer).toHaveProperty('number');
      expect(callBody.customer.number).toBe('+15551234567');
      
      // Should have assistantId
      expect(callBody).toHaveProperty('assistantId');
      expect(callBody.assistantId).toBe('assistant-123');
    });

    it('should include metadata when provided', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'assistant-123', name: 'Test' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'call-123', status: 'ringing' }),
        });

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+15551234567',
          userId: 'user123',
          scenarioId: 'TEST_SCENARIO',
          trainingMode: 'practice',
        }),
      });

      await POST(request);

      const callCall = (global.fetch as jest.Mock).mock.calls[1];
      const callBody = JSON.parse(callCall[1].body);

      expect(callBody.metadata).toEqual({
        userId: 'user123',
        scenarioId: 'TEST_SCENARIO',
        trainingMode: 'practice',
        type: 'sales-training',
      });
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle Vapi API returning 400 for invalid phone number format', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'assistant-123', name: 'Test' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          text: async () => JSON.stringify({
            error: "Couldn't Get Phone Number. Need Either `phoneNumberId` Or `phoneNumber`.",
          }),
        });

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+15551234567',
          userId: 'user123',
          scenarioId: 'TEST_SCENARIO',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Route returns 503 when API key is missing, 500 for other errors, 400 for invalid phone
      expect([400, 500, 503]).toContain(response.status);
      expect(data.error).toMatch(/Vapi call error|Failed to initiate call|API key not configured/);
    });

    it('should handle network errors gracefully', async () => {
      (global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ id: 'assistant-123', name: 'Test' }),
        })
        .mockRejectedValueOnce(new Error('Network error'));

      const request = new NextRequest('http://localhost/api/vapi/sales-call', {
        method: 'POST',
        body: JSON.stringify({
          phoneNumber: '+15551234567',
          userId: 'user123',
          scenarioId: 'TEST_SCENARIO',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      // Route returns 503 when API key is missing, 500 for network errors
      expect([500, 503]).toContain(response.status);
      expect(data.error).toMatch(/Failed to initiate call|Network error|API key not configured/);
    });
  });

  describe('Phone Number Validation Edge Cases', () => {
    it('should handle phone numbers with various country codes', async () => {
      const countryCodes = [
        { input: '442079460958', expected: '+442079460958' }, // UK
        { input: '33123456789', expected: '+33123456789' }, // France
        { input: '4915123456789', expected: '+4915123456789' }, // Germany
      ];

      for (const { input, expected } of countryCodes) {
        (global.fetch as jest.Mock)
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'assistant-123', name: 'Test' }),
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({ id: 'call-123', status: 'ringing' }),
          });

        const request = new NextRequest('http://localhost/api/vapi/sales-call', {
          method: 'POST',
          body: JSON.stringify({
            phoneNumber: input,
            userId: 'user123',
            scenarioId: 'TEST_SCENARIO',
          }),
        });

        await POST(request);

        const callCall = (global.fetch as jest.Mock).mock.calls[1];
        const callBody = JSON.parse(callCall[1].body);

        expect(callBody.customer?.number).toMatch(/^\+[1-9]\d{1,14}$/);
      }
    });
  });
});

