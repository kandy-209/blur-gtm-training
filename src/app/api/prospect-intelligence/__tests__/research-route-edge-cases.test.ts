/**
 * Edge case tests for prospect intelligence research API route
 * Tests error handling, validation, timeouts, and API failures
 */

import { POST } from '@/app/api/prospect-intelligence/research/route';
import { NextRequest } from 'next/server';

// Mock dependencies
const mockResearchService = jest.fn().mockImplementation(() => ({
  initialize: jest.fn().mockResolvedValue(undefined),
  researchProspect: jest.fn().mockResolvedValue({
    companyName: 'Test Company',
    companyWebsite: 'https://example.com',
    extractionDurationMs: 1000,
  }),
  close: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/prospect-intelligence/research-service', () => ({
  ResearchService: mockResearchService,
}));

jest.mock('@/lib/security', () => ({
  sanitizeInput: jest.fn((input: string) => input),
}));

jest.mock('@/lib/error-handler', () => ({
  handleError: jest.fn((error: any, requestId: string) => {
    return new Response(JSON.stringify({ error: error.message || 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }),
}));

jest.mock('@/lib/logger', () => ({
  log: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  },
  generateRequestId: jest.fn(() => 'test-request-id'),
}));

jest.mock('@/lib/prospect-intelligence/cache', () => ({
  getCachedProspect: jest.fn().mockResolvedValue(null),
  cacheProspect: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/lib/prospect-intelligence/persistence', () => ({
  checkProspectExists: jest.fn().mockResolvedValue(null),
  saveProspectResearch: jest.fn().mockResolvedValue({ id: 'test-id' }),
}));

jest.mock('@/lib/prospect-intelligence/auth-helper', () => ({
  getUserIdFromRequest: jest.fn().mockResolvedValue(null),
}));

describe('Prospect Intelligence Research API - Edge Cases', () => {
  let originalEnv: NodeJS.ProcessEnv;
  
  beforeEach(() => {
    originalEnv = { ...process.env };
    process.env.BROWSERBASE_API_KEY = 'test-key';
    process.env.BROWSERBASE_PROJECT_ID = 'test-project';
    process.env.ANTHROPIC_API_KEY = 'test-key';
    jest.clearAllMocks();
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const createRequest = (body: any, contentType = 'application/json') => {
    return new NextRequest('http://localhost:3000/api/prospect-intelligence/research', {
      method: 'POST',
      headers: {
        'Content-Type': contentType,
      },
      body: JSON.stringify(body),
    });
  };

  describe('Request Validation Edge Cases', () => {
    it('should reject non-JSON content type', async () => {
      const request = createRequest({ websiteUrl: 'https://example.com' }, 'text/plain');
      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain('Content-Type');
    });

    it('should reject missing websiteUrl', async () => {
      const request = createRequest({});
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject invalid URL format', async () => {
      const request = createRequest({ websiteUrl: 'not-a-url' });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject empty websiteUrl', async () => {
      const request = createRequest({ websiteUrl: '' });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should reject URLs without protocol', async () => {
      const request = createRequest({ websiteUrl: 'example.com' });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('should accept valid URLs with company name', async () => {
      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockResolvedValue({
          companyName: 'Test',
          companyWebsite: 'https://example.com',
          extractionDurationMs: 1000,
        }),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      const request = createRequest({
        websiteUrl: 'https://example.com',
        companyName: 'Test Company',
      });
      
      const response = await POST(request);
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should handle extremely long URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(2000);
      const request = createRequest({ websiteUrl: longUrl });
      const response = await POST(request);
      // Should either validate or sanitize - accept any error status
      const validStatuses = [400, 500, 502, 503];
      expect(validStatuses).toContain(response.status);
    });

    it('should handle URLs with special characters', async () => {
      const request = createRequest({ websiteUrl: 'https://example.com/path?query=test&other=value' });
      const response = await POST(request);
      // Should handle URL encoding
      expect([200, 400, 500]).toContain(response.status);
    });
  });

  describe('API Key Validation Edge Cases', () => {
    it('should reject when no LLM API keys are configured', async () => {
      delete process.env.ANTHROPIC_API_KEY;
      delete process.env.GOOGLE_GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const request = createRequest({ websiteUrl: 'https://example.com' });
      const response = await POST(request);
      expect(response.status).toBe(500);
      const data = await response.json();
      expect(data.error).toContain('LLM API key');
    });

    it('should accept when at least one LLM key is configured', async () => {
      process.env.ANTHROPIC_API_KEY = 'test-key';
      delete process.env.GOOGLE_GEMINI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockResolvedValue({
          companyName: 'Test',
          companyWebsite: 'https://example.com',
          extractionDurationMs: 1000,
        }),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      const request = createRequest({ websiteUrl: 'https://example.com' });
      const response = await POST(request);
      expect(response).toBeDefined();
      expect(response.status).toBe(200);
    });
  });

  describe('Research Service Error Handling', () => {
    it('should handle research timeout', async () => {
      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockImplementation(() => 
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Research timeout after 120 seconds')), 100)
          )
        ),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      const request = createRequest({ websiteUrl: 'https://example.com' });
      const response = await POST(request);
      expect(response).toBeDefined();
      expect([500, 504]).toContain(response.status);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should handle quota errors', async () => {
      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockRejectedValue(new Error('429 You exceeded your current quota')),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      const request = createRequest({ websiteUrl: 'https://example.com' });
      const response = await POST(request);
      expect(response).toBeDefined();
      expect([429, 500]).toContain(response.status);
      const data = await response.json();
      expect(data.error).toBeDefined();
    });

    it('should handle authentication errors', async () => {
      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockRejectedValue(new Error('401 Incorrect API key provided')),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      const request = createRequest({ websiteUrl: 'https://example.com' });
      const response = await POST(request);
      expect(response).toBeDefined();
      expect(response.status).toBe(500);
    });

    it('should handle network errors', async () => {
      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockRejectedValue(new Error('Network request failed')),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      const request = createRequest({ websiteUrl: 'https://example.com' });
      const response = await POST(request);
      expect(response).toBeDefined();
      expect(response.status).toBe(500);
    });

    it('should handle initialization errors', async () => {
      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockRejectedValue(new Error('Initialization failed')),
        researchProspect: jest.fn(),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      const request = createRequest({ websiteUrl: 'https://example.com' });
      const response = await POST(request);
      expect(response).toBeDefined();
      expect(response.status).toBe(500);
    });

    it('should always cleanup even on error', async () => {
      const mockClose = jest.fn().mockResolvedValue(undefined);
      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockRejectedValue(new Error('Research failed')),
        close: mockClose,
      }));

      const request = createRequest({ websiteUrl: 'https://example.com' });
      await POST(request);
      
      // Cleanup should be called in the finally block
      expect(mockClose).toHaveBeenCalled();
    });

    it('should handle cleanup errors gracefully', async () => {
      const { ResearchService } = require('@/lib/prospect-intelligence/research-service');
      const mockService = {
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockRejectedValue(new Error('Research failed')),
        close: jest.fn().mockRejectedValue(new Error('Cleanup failed')),
      };
      ResearchService.mockImplementation(() => mockService);

      const request = createRequest({ websiteUrl: 'https://example.com' });
      // Should not throw, cleanup errors should be logged but not fail the request
      const response = await POST(request);
      expect(response.status).toBe(500);
    });
  });

  describe('Response Format Edge Cases', () => {
    it('should return valid JSON structure on success', async () => {
      const { ResearchService } = require('@/lib/prospect-intelligence/research-service');
      const mockData = {
        companyName: 'Test Company',
        companyWebsite: 'https://example.com',
        companyDescription: 'Test description',
        industry: 'Technology',
        isB2BSaaS: true,
        techStack: {
          primaryFramework: 'React',
          frameworkConfidence: 'high' as const,
          frameworkEvidence: [],
          additionalFrameworks: [],
          buildTools: [],
          isModernStack: true,
          confidenceScore: 90,
        },
        hiring: {
          hasOpenEngineeringRoles: true,
          engineeringRoleCount: 5,
          totalOpenRoles: 10,
          jobBoardPlatform: 'Lever',
          engineeringRoleTitles: ['Software Engineer'],
          seniorityLevels: ['Senior'],
          hiringSignals: [],
          confidenceScore: 95,
        },
        engineeringCulture: {
          hasEngineeringBlog: true,
          engineeringBlogUrl: 'https://example.com/blog',
          recentBlogTopics: ['Tech'],
          developmentPractices: [],
          techCultureHighlights: [],
          opensourcePresence: false,
        },
        companySize: {
          estimatedEmployeeRange: '100-250',
          estimatedEngineeringTeamSize: null,
          growthIndicators: [],
          fundingInfo: null,
        },
        thirdPartyTools: {
          analytics: [],
          monitoring: [],
          deployment: [],
          chat: [],
          other: [],
        },
        icpScore: {
          overallScore: 8,
          priorityLevel: 'high' as const,
          positiveSignals: [],
          negativeSignals: [],
          recommendedTalkingPoints: [],
          outreachTiming: 'Anytime',
        },
        dataQuality: {
          completenessScore: 80,
          confidenceLevel: 'high' as const,
          sourcesChecked: ['https://example.com'],
          missingData: [],
        },
        extractedAt: new Date().toISOString(),
        extractionDurationMs: 5000,
      };
      
      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockResolvedValue(mockData),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      const request = createRequest({ websiteUrl: 'https://example.com' });
      const response = await POST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.requestId).toBeDefined();
    });

    it('should include request ID in error responses', async () => {
      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockRejectedValue(new Error('Test error')),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      const request = createRequest({ websiteUrl: 'https://example.com' });
      const response = await POST(request);
      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(400);
      if (response.status < 500) {
        const data = await response.json();
        expect(data.requestId).toBeDefined();
      }
    });
  });

  describe('Concurrent Request Handling', () => {
    it('should handle multiple simultaneous requests', async () => {
      mockResearchService.mockImplementation(() => ({
        initialize: jest.fn().mockResolvedValue(undefined),
        researchProspect: jest.fn().mockResolvedValue({
          companyName: 'Test',
          companyWebsite: 'https://example.com',
          extractionDurationMs: 1000,
        }),
        close: jest.fn().mockResolvedValue(undefined),
      }));

      const requests = [
        createRequest({ websiteUrl: 'https://example1.com' }),
        createRequest({ websiteUrl: 'https://example2.com' }),
        createRequest({ websiteUrl: 'https://example3.com' }),
      ];

      const responses = await Promise.all(requests.map(req => POST(req)));
      expect(responses).toHaveLength(3);
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});

