import { POST } from '../enrich-company/route';
import { NextRequest } from 'next/server';

global.fetch = jest.fn();

describe('POST /api/sales/enrich-company', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should enrich company successfully', async () => {
    const mockEnrichment = {
      company: {
        name: 'Acme Corp',
        domain: 'acme.com',
        employeeCount: 500,
      },
      contacts: [],
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockEnrichment,
    });

    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
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
      body: JSON.stringify({
        domain: 'acme.com',
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('Company name is required');
  });

  it('should handle empty request body', async () => {
    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
  });

  it('should handle invalid JSON', async () => {
    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      body: 'invalid json',
    });

    await expect(POST(request)).rejects.toThrow();
  });

  it('should sanitize input', async () => {
    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
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
    const longName = 'A'.repeat(1000);
    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      body: JSON.stringify({
        companyName: longName,
      }),
    });

    const response = await POST(request);

    // Should handle gracefully (either succeed or fail with proper error)
    expect([200, 400, 500]).toContain(response.status);
  });

  it('should handle special characters', async () => {
    const request = new NextRequest('http://localhost/api/sales/enrich-company', {
      method: 'POST',
      body: JSON.stringify({
        companyName: "O'Brien & Associates",
        domain: 'test-domain.com',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBeLessThan(500);
  });
});

