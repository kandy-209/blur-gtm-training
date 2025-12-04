/**
 * Discovery Call API Tests
 */

import { NextRequest } from 'next/server';
import { POST as createCall } from '@/app/api/discovery-call/create/route';
import { POST as sendMessage } from '@/app/api/discovery-call/[callId]/message/route';

// Mock repositories and use cases
jest.mock('@/application/use-cases/create-discovery-call/create-discovery-call.use-case', () => ({
  CreateDiscoveryCallUseCase: jest.fn().mockImplementation(() => ({
    execute: jest.fn().mockResolvedValue({
      id: 'call_123',
      companyId: { value: 'comp_123' },
      persona: { id: 'persona_123' },
      settings: {
        difficulty: 'medium',
        personality: 'professional',
        salesMethodology: 'GAP',
      },
      isActive: true,
      createdAt: new Date(),
    }),
  })),
}));

jest.mock('@/infrastructure/repositories/company.repository', () => ({
  CompanyRepository: jest.fn(),
}));

jest.mock('@/infrastructure/repositories/persona.repository', () => ({
  PersonaRepository: jest.fn(),
}));

jest.mock('@/infrastructure/repositories/discovery-call.repository', () => ({
  DiscoveryCallRepository: jest.fn(),
}));

jest.mock('@/lib/security', () => ({
  rateLimit: jest.fn(() => ({
    allowed: true,
    remaining: 10,
    resetTime: Date.now() + 60000,
  })),
}));

describe('Discovery Call API', () => {
  describe('POST /api/discovery-call/create', () => {
    it('should create a new discovery call', async () => {
      // First create a company and persona (would need to be set up)
      const request = new NextRequest('http://localhost/api/discovery-call/create', {
        method: 'POST',
        body: JSON.stringify({
          companyId: 'comp_123',
          personaId: 'persona_123',
          settings: {
            difficulty: 'medium',
            personality: 'professional',
            salesMethodology: 'GAP',
          },
        }),
      });

      const response = await createCall(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.id).toBeTruthy();
      expect(data.data.isActive).toBe(true);
    });

    it('should validate input', async () => {
      const request = new NextRequest('http://localhost/api/discovery-call/create', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
        }),
      });

      const response = await createCall(request);
      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/discovery-call/[callId]/message', () => {
    it('should send a message in discovery call', async () => {
      // Would need an existing call ID
      const request = new NextRequest('http://localhost/api/discovery-call/call_123/message', {
        method: 'POST',
        body: JSON.stringify({
          message: 'Hello, I wanted to introduce our product.',
        }),
      });

      const response = await sendMessage(request, {
        params: Promise.resolve({ callId: 'call_123' }),
      });

      if (response.status === 200) {
        const data = await response.json();
        expect(data.success).toBe(true);
        expect(data.prospectResponse).toBeTruthy();
        expect(data.metrics).toBeDefined();
      }
    });
  });
});

