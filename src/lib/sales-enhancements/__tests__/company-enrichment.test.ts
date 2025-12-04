// Mock fetch first
const mockFetchFn = jest.fn();
global.fetch = mockFetchFn;

// Mock api-timeout to delegate to global.fetch
jest.mock('@/lib/api-timeout', () => ({
  fetchWithTimeout: jest.fn(async (url: string, options?: any) => {
    // Delegate to the mocked global.fetch
    return mockFetchFn(url, options);
  }),
  withTimeout: jest.fn((promise: Promise<any>) => promise),
}));

import { enrichCompanyClearbit, findContactsClearbit, enrichCompanyMultiSource } from '../company-enrichment';

describe('Company Enrichment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.CLEARBIT_API_KEY = 'test-key';
    // Ensure window is undefined for server-side tests
    (global as any).window = undefined;
    // Reset fetch mock
    mockFetchFn.mockClear();
    // Reset fetchWithTimeout mock
    const apiTimeout = require('@/lib/api-timeout');
    (apiTimeout.fetchWithTimeout as jest.Mock).mockClear();
  });

  afterEach(() => {
    delete process.env.CLEARBIT_API_KEY;
  });

  describe('enrichCompanyClearbit', () => {
    it('should successfully enrich company data', async () => {
      const mockData = {
        name: 'Acme Corp',
        domain: 'acme.com',
        description: 'Test company',
        category: { industry: 'Technology', sector: 'Software' },
        metrics: { employees: 500, annualRevenue: 50000000 },
        geo: { city: 'San Francisco', state: 'CA', country: 'US' },
        foundedYear: 2010,
        tags: ['saas', 'b2b'],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await enrichCompanyClearbit('acme.com');

      expect(result.company).toBeDefined();
      expect(result.company?.name).toBe('Acme Corp');
      expect(result.company?.employeeCount).toBe(500);
      expect(result.company?.revenue).toBe(50000000);
      expect(result.error).toBeUndefined();
    });

    it('should handle missing API key', async () => {
      delete process.env.CLEARBIT_API_KEY;

      const result = await enrichCompanyClearbit('acme.com');

      expect(result.error).toBe('Clearbit API key not configured');
      expect(result.company).toBeUndefined();
    });

    it('should handle 404 not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await enrichCompanyClearbit('nonexistent.com');

      expect(result.error).toBe('Company not found');
      expect(result.company).toBeUndefined();
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await enrichCompanyClearbit('acme.com');

      expect(result.error).toContain('Clearbit API error');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await enrichCompanyClearbit('acme.com');

      expect(result.error).toBe('Network error');
    });

    it('should handle empty domain', async () => {
      const result = await enrichCompanyClearbit('');

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should handle special characters in domain', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ name: 'Test' }),
      });

      await enrichCompanyClearbit('test-domain.com');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('test-domain.com'),
        expect.any(Object)
      );
    });

    it('should handle missing optional fields', async () => {
      const mockData = {
        name: 'Acme Corp',
        domain: 'acme.com',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await enrichCompanyClearbit('acme.com');

      expect(result.company).toBeDefined();
      expect(result.company?.name).toBe('Acme Corp');
      expect(result.company?.employeeCount).toBeUndefined();
      expect(result.company?.revenue).toBeUndefined();
    });
  });

  describe('findContactsClearbit', () => {
    it('should successfully find contacts', async () => {
      const mockData = {
        people: [
          {
            name: { givenName: 'John', familyName: 'Doe' },
            email: 'john@acme.com',
            title: 'VP Engineering',
            seniority: 'senior',
            department: 'Engineering',
            emailProvider: 'corporate',
          },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await findContactsClearbit('acme.com');

      expect(result.contacts).toBeDefined();
      expect(result.contacts?.length).toBe(1);
      expect(result.contacts?.[0].email).toBe('john@acme.com');
      expect(result.contacts?.[0].verified).toBe(true);
    });

    it('should handle no contacts found (404)', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      });

      const result = await findContactsClearbit('acme.com');

      expect(result.contacts).toEqual([]);
      expect(result.error).toBeUndefined();
    });

    it('should handle empty people array', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ people: [] }),
      });

      const result = await findContactsClearbit('acme.com');

      expect(result.contacts).toEqual([]);
    });

    it('should handle missing API key', async () => {
      delete process.env.CLEARBIT_API_KEY;

      const result = await findContactsClearbit('acme.com');

      expect(result.error).toBe('Clearbit API key not configured');
    });
  });

  describe('enrichCompanyMultiSource', () => {
    it('should use Clearbit when domain is provided', async () => {
      const mockData = {
        name: 'Acme Corp',
        domain: 'acme.com',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await enrichCompanyMultiSource('Acme Corp', 'acme.com');

      expect(result.company).toBeDefined();
      expect(result.company?.name).toBe('Acme Corp');
    });

    it('should fallback to Alpha Vantage when Clearbit fails', async () => {
      // Set NEXT_PUBLIC_APP_URL for Alpha Vantage fallback
      process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
      
      // Ensure window is undefined for server-side context
      const originalWindow = (global as any).window;
      delete (global as any).window;

      // Get the mocked fetchWithTimeout
      const apiTimeout = require('@/lib/api-timeout');
      const fetchWithTimeoutMock = apiTimeout.fetchWithTimeout as jest.Mock;

      // Clear previous mocks and set up implementation
      fetchWithTimeoutMock.mockClear();
      mockFetchFn.mockClear();
      
      // Set up mock to handle both calls - override the delegation
      let callCount = 0;
      fetchWithTimeoutMock.mockImplementation(async (url: string) => {
        callCount++;
        // First call: Alpha Vantage search
        if (callCount === 1 && url.includes('/api/alphavantage/search')) {
          return {
            ok: true,
            json: async () => ({
              results: [{ symbol: 'ACME', name: 'Acme Corp' }],
            }),
          };
        }
        // Second call: Alpha Vantage overview
        if (callCount === 2 && url.includes('/api/alphavantage/overview')) {
          return {
            ok: true,
            json: async () => ({
              overview: {
                name: 'Acme Corp',
                description: 'Test company',
                industry: 'Technology',
                sector: 'Software',
                revenue: '50000000',
              },
            }),
          };
        }
        // Default fallback
        return {
          ok: false,
          status: 404,
          json: async () => ({}),
        };
      });

      const result = await enrichCompanyMultiSource('Acme Corp');

      // The function should return company data from Alpha Vantage fallback
      expect(result.company).toBeDefined();
      expect(result.company?.name).toBe('Acme Corp');
      
      // Restore window
      if (originalWindow !== undefined) {
        (global as any).window = originalWindow;
      }
      delete process.env.NEXT_PUBLIC_APP_URL;
    });

    it('should handle all sources failing', async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
      });

      const result = await enrichCompanyMultiSource('Nonexistent Corp');

      expect(result.error).toBeDefined();
      expect(result.company).toBeUndefined();
    });

    it('should handle empty company name', async () => {
      const result = await enrichCompanyMultiSource('');

      expect(result.error).toBeDefined();
    });
  });
});


