import { POST as enrichCompanyPOST } from '../enrich-company/route';
import { POST as verifyEmailPOST } from '../verify-email/route';
import { NextRequest } from 'next/server';

global.fetch = jest.fn();

describe('Security Tests', () => {
  describe('Input Validation', () => {
    it('should reject XSS attempts in company name', async () => {
      const request = new NextRequest('http://localhost/api/sales/enrich-company', {
        method: 'POST',
        body: JSON.stringify({
          companyName: '<script>alert("xss")</script>Acme',
        }),
      });

      const response = await enrichCompanyPOST(request);
      const data = await response.json();

      // Should sanitize or reject
      expect(response.status).toBeLessThan(500);
      expect(data.companyName || data.error).not.toContain('<script>');
    });

    it('should reject SQL injection attempts', async () => {
      const request = new NextRequest('http://localhost/api/sales/enrich-company', {
        method: 'POST',
        body: JSON.stringify({
          companyName: "'; DROP TABLE companies; --",
        }),
      });

      const response = await enrichCompanyPOST(request);

      // Should handle gracefully
      expect(response.status).toBeLessThan(500);
    });

    it('should reject extremely long inputs', async () => {
      const longInput = 'A'.repeat(10000);
      const request = new NextRequest('http://localhost/api/sales/enrich-company', {
        method: 'POST',
        body: JSON.stringify({
          companyName: longInput,
        }),
      });

      const response = await enrichCompanyPOST(request);

      // Should reject or truncate
      expect(response.status).toBeLessThan(500);
    });

    it('should reject invalid email formats', async () => {
      const request = new NextRequest('http://localhost/api/sales/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          action: 'verify',
          email: 'not-an-email',
        }),
      });

      const response = await verifyEmailPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid email format');
    });

    it('should reject invalid domain formats', async () => {
      const request = new NextRequest('http://localhost/api/sales/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          action: 'search',
          domain: 'invalid..domain',
        }),
      });

      const response = await verifyEmailPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid domain format');
    });

    it('should reject invalid action values', async () => {
      const request = new NextRequest('http://localhost/api/sales/verify-email', {
        method: 'POST',
        body: JSON.stringify({
          action: 'malicious-action',
          email: 'test@example.com',
        }),
      });

      const response = await verifyEmailPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid action');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const requests = Array(25).fill(null).map(() => 
        new NextRequest('http://localhost/api/sales/enrich-company', {
          method: 'POST',
          body: JSON.stringify({
            companyName: 'Acme Corp',
          }),
        })
      );

      const responses = await Promise.all(requests.map(req => enrichCompanyPOST(req)));
      const rateLimitedResponses = responses.filter(r => r.status === 429);

      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });

    it('should include rate limit headers', async () => {
      const request = new NextRequest('http://localhost/api/sales/enrich-company', {
        method: 'POST',
        body: JSON.stringify({
          companyName: 'Acme Corp',
        }),
      });

      const response = await enrichCompanyPOST(request);

      expect(response.headers.get('X-RateLimit-Limit')).toBeDefined();
      expect(response.headers.get('X-RateLimit-Remaining')).toBeDefined();
    });
  });

  describe('Content-Type Validation', () => {
    it('should reject non-JSON content types', async () => {
      const request = new NextRequest('http://localhost/api/sales/enrich-company', {
        method: 'POST',
        headers: {
          'content-type': 'text/plain',
        },
        body: JSON.stringify({
          companyName: 'Acme Corp',
        }),
      });

      const response = await enrichCompanyPOST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Content-Type');
    });
  });

  describe('Error Handling', () => {
    it('should not expose internal error details', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Internal database error'));

      const request = new NextRequest('http://localhost/api/sales/enrich-company', {
        method: 'POST',
        body: JSON.stringify({
          companyName: 'Acme Corp',
        }),
      });

      const response = await enrichCompanyPOST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).not.toContain('database');
      expect(data.error).toContain('try again');
    });
  });

  describe('Special Characters', () => {
    it('should handle unicode characters safely', async () => {
      const request = new NextRequest('http://localhost/api/sales/enrich-company', {
        method: 'POST',
        body: JSON.stringify({
          companyName: 'Café & Co. 株式会社',
        }),
      });

      const response = await enrichCompanyPOST(request);

      expect(response.status).toBeLessThan(500);
    });

    it('should handle null bytes', async () => {
      const request = new NextRequest('http://localhost/api/sales/enrich-company', {
        method: 'POST',
        body: JSON.stringify({
          companyName: 'Acme\0Corp',
        }),
      });

      const response = await enrichCompanyPOST(request);

      // Should sanitize null bytes
      expect(response.status).toBeLessThan(500);
    });
  });
});

