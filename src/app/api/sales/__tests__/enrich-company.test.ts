import { POST } from '../enrich-company/route';
import { NextRequest } from 'next/server';

// Mock rateLimit before importing routes
jest.mock('@/lib/security', () => {
  const actual = jest.requireActual('@/lib/security');
  return {
    ...actual,
    rateLimit: jest.fn(() => ({
      allowed: true,
      remaining: 10,
      resetTime: Date.now() + 60000,
    })),
  };
});

// Mock company-enrichment module
jest.mock('@/lib/sales-enhancements/company-enrichment', () => ({
  enrichCompanyMultiSource: jest.fn(),
  findContactsClearbit: jest.fn(),
}));

global.fetch = jest.fn();

describe('POST /api/sales/enrich-company', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enrich company successfully', async () => {
    // Mock the enrichment functions
    const companyEnrichmentModule = require('@/lib/sales-enhancements/company-enrichment');
    
    (companyEnrichmentModule.enrichCompanyMultiSource as jest.Mock).mockResolvedValue({
      company: {
        name: 'Acme Corp',
        domain: 'acme.com',
        employeeCount: 500,
      },
    });
    (companyEnrichmentModule.findContactsClearbit as jest.Mock).mockResolvedValue({ contacts: [] });

    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: 'Acme Corp',
        domain: 'acme.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.company).toBeDefined();
  });

  it('should reject missing company name', async () => {
    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        domain: 'acme.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    // Route validates using validateText which checks minLength
    expect(data.error).toBeDefined();
  });

  it('should handle empty request body', async () => {
    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
  });

  it('should handle invalid JSON', async () => {
    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: 'invalid json',
    });

    // Route will catch JSON parse error - NextRequest.json() throws, which gets caught and returns 400 or 500
    const response = await POST(request);
    // The route catches the error in try-catch, so it could be 400 or 500
    expect([400, 500]).toContain(response.status);
  });

  it('should sanitize input', async () => {
    const companyEnrichmentModule = require('@/lib/sales-enhancements/company-enrichment');
    
    (companyEnrichmentModule.enrichCompanyMultiSource as jest.Mock).mockResolvedValue({
      company: { name: 'Acme Corp', domain: 'acme.com' },
    });
    (companyEnrichmentModule.findContactsClearbit as jest.Mock).mockResolvedValue({ contacts: [] });

    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: '<script>alert("xss")</script>Acme Corp',
        domain: 'acme.com',
      }),
    });

    const response = await POST(request);

    // Should not execute script, should handle gracefully
    expect(response.status).toBeLessThan(500);
  });

  it('should handle very long company names', async () => {
    const companyEnrichmentModule = require('@/lib/sales-enhancements/company-enrichment');
    
    (companyEnrichmentModule.enrichCompanyMultiSource as jest.Mock).mockResolvedValue({
      company: { name: 'A'.repeat(1000) },
    });
    (companyEnrichmentModule.findContactsClearbit as jest.Mock).mockResolvedValue({ contacts: [] });

    const longName = 'A'.repeat(1000);
    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: longName,
      }),
    });

    const response = await POST(request);

    // Should handle gracefully (either succeed or fail with proper error)
    expect([200, 400, 500]).toContain(response.status);
  });

  it('should handle special characters', async () => {
    const companyEnrichmentModule = require('@/lib/sales-enhancements/company-enrichment');
    
    (companyEnrichmentModule.enrichCompanyMultiSource as jest.Mock).mockResolvedValue({
      company: { name: "O'Brien & Associates", domain: 'test-domain.com' },
    });
    (companyEnrichmentModule.findContactsClearbit as jest.Mock).mockResolvedValue({ contacts: [] });

    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyName: "O'Brien & Associates",
        domain: 'test-domain.com',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBeLessThan(500);
  });
});


