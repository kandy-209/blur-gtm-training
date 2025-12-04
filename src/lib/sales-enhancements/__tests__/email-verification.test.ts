import { verifyEmailHunter, findEmailHunter, searchEmailsByDomain } from '../email-verification';

global.fetch = jest.fn();

describe('Email Verification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.HUNTER_API_KEY = 'test-key';
  });

  afterEach(() => {
    delete process.env.HUNTER_API_KEY;
  });

  describe('verifyEmailHunter', () => {
    it('should successfully verify valid email', async () => {
      const mockData = {
        data: {
          email: 'john@acme.com',
          result: 'deliverable',
          score: 95,
          sources: [{ domain: 'acme.com' }],
          first_name: 'John',
          last_name: 'Doe',
          position: 'VP Engineering',
          company: 'Acme Corp',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await verifyEmailHunter('john@acme.com');

      expect(result.valid).toBe(true);
      expect(result.email).toBe('john@acme.com');
      expect(result.score).toBe(95);
      expect(result.error).toBeUndefined();
    });

    it('should handle invalid email', async () => {
      const mockData = {
        data: {
          email: 'invalid@acme.com',
          result: 'undeliverable',
          score: 10,
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await verifyEmailHunter('invalid@acme.com');

      expect(result.valid).toBe(false);
      expect(result.score).toBe(10);
    });

    it('should handle missing API key', async () => {
      delete process.env.HUNTER_API_KEY;

      const result = await verifyEmailHunter('john@acme.com');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Hunter.io API key not configured');
    });

    it('should handle API errors', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await verifyEmailHunter('john@acme.com');

      expect(result.valid).toBe(false);
      expect(result.error).toContain('Hunter.io API error');
    });

    it('should handle network errors', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const result = await verifyEmailHunter('john@acme.com');

      expect(result.valid).toBe(false);
      expect(result.error).toBe('Network error');
    });

    it('should handle empty email', async () => {
      const result = await verifyEmailHunter('');

      expect(result.email).toBe('');
      expect(result.valid).toBe(false);
    });

    it('should handle invalid email format', async () => {
      const mockData = {
        data: {
          email: 'invalid-email',
          result: 'undeliverable',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await verifyEmailHunter('invalid-email');

      expect(result.valid).toBe(false);
    });

    it('should handle special characters in email', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: {
            email: 'test+tag@acme.com',
            result: 'deliverable',
            score: 80,
          },
        }),
      });

      const result = await verifyEmailHunter('test+tag@acme.com');

      expect(result.valid).toBe(true);
      // URL already contains encoded version - fetch is called with URL string as first arg
      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toContain('test%2Btag%40acme.com');
    });
  });

  describe('findEmailHunter', () => {
    it('should successfully find email', async () => {
      const mockData = {
        data: {
          email: 'john.doe@acme.com',
          score: 90,
          sources: [{ domain: 'acme.com' }],
          first_name: 'John',
          last_name: 'Doe',
          position: 'VP Engineering',
          company: 'Acme Corp',
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const result = await findEmailHunter('John', 'Doe', 'acme.com');

      expect(result.email).toBe('john.doe@acme.com');
      expect(result.score).toBe(90);
      expect(result.error).toBeUndefined();
    });

    it('should handle email not found', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: null }),
      });

      const result = await findEmailHunter('John', 'Doe', 'acme.com');

      expect(result.error).toBe('Email not found');
      expect(result.email).toBeUndefined();
    });

    it('should handle missing parameters', async () => {
      const result = await findEmailHunter('', '', '');

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle special characters in names', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          data: { email: 'test@acme.com', score: 80 },
        }),
      });

      await findEmailHunter("O'Brien", "O'Connell", 'acme.com');

      // URL already contains encoded version via URLSearchParams - fetch is called with URL string as first arg
      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toContain('O%27Brien');
    });
  });

  describe('searchEmailsByDomain', () => {
    it('should successfully search emails', async () => {
      const mockData = {
        data: {
          emails: [
            {
              value: 'john@acme.com',
              score: 90,
              sources: [{ domain: 'acme.com' }],
              first_name: 'John',
              last_name: 'Doe',
              position: 'VP Engineering',
            },
          ],
        },
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      const results = await searchEmailsByDomain('acme.com');

      expect(results.length).toBe(1);
      expect(results[0].email).toBe('john@acme.com');
      expect(results[0].error).toBeUndefined();
    });

    it('should handle empty results', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { emails: [] } }),
      });

      const results = await searchEmailsByDomain('acme.com');

      expect(results).toEqual([]);
    });

    it('should handle filters', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: { emails: [] } }),
      });

      await searchEmailsByDomain('acme.com', 'senior', 'engineering');

      const callUrl = (global.fetch as jest.Mock).mock.calls[0][0];
      expect(callUrl).toContain('seniority=senior');
      expect(callUrl).toContain('department=engineering');
    });

    it('should handle missing API key', async () => {
      delete process.env.HUNTER_API_KEY;

      const results = await searchEmailsByDomain('acme.com');

      expect(results.length).toBe(1);
      expect(results[0].error).toBe('Hunter.io API key not configured');
    });

    it('should handle invalid domain', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
      });

      const results = await searchEmailsByDomain('invalid-domain');

      expect(results.length).toBe(1);
      expect(results[0].error).toBeDefined();
    });
  });
});


