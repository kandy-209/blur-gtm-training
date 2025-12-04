/**
 * Test Response and Request mock implementations
 * Verifies proper bodyUsed handling and error propagation
 */

describe('Response and Request mock bodyUsed handling', () => {
  describe('Response mock - Bug 1: bodyUsed not set for empty body', () => {
    it('should set bodyUsed=true when json() is called with empty body', async () => {
      const response = new Response(null);
      
      expect(response.bodyUsed).toBe(false);
      await response.json();
      expect(response.bodyUsed).toBe(true);
    });

    it('should set bodyUsed=true when text() is called with empty body', async () => {
      const response = new Response(null);
      
      expect(response.bodyUsed).toBe(false);
      await response.text();
      expect(response.bodyUsed).toBe(true);
    });

    it('should throw error on second json() call with empty body', async () => {
      const response = new Response(null);
      
      await response.json();
      await expect(response.json()).rejects.toThrow('Body already consumed');
    });

    it('should throw error on second text() call with empty body', async () => {
      const response = new Response(null);
      
      await response.text();
      await expect(response.text()).rejects.toThrow('Body already consumed');
    });
  });

  describe('Request mock - Bug 2: JSON parse errors should propagate', () => {
    it('should throw JSON parse error instead of returning empty object', async () => {
      const request = new Request('http://example.com', {
        method: 'POST',
        body: 'invalid json {',
      });
      
      await expect(request.json()).rejects.toThrow();
    });

    it('should set bodyUsed=true even when JSON parse fails', async () => {
      const request = new Request('http://example.com', {
        method: 'POST',
        body: 'invalid json {',
      });
      
      expect(request.bodyUsed).toBe(false);
      try {
        await request.json();
      } catch (e) {
        // Expected to throw
      }
      expect(request.bodyUsed).toBe(true);
    });

    it('should throw "Body already consumed" on second call after parse error', async () => {
      const request = new Request('http://example.com', {
        method: 'POST',
        body: 'invalid json {',
      });
      
      try {
        await request.json();
      } catch (e) {
        // First call throws parse error
      }
      
      // Second call should throw "Body already consumed", not parse error
      await expect(request.json()).rejects.toThrow('Body already consumed');
    });

    it('should successfully parse valid JSON', async () => {
      const request = new Request('http://example.com', {
        method: 'POST',
        body: '{"valid": "json"}',
      });
      
      const result = await request.json();
      expect(result).toEqual({ valid: 'json' });
      expect(request.bodyUsed).toBe(true);
    });
  });
});

