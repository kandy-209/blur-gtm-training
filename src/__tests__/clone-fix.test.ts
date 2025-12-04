/**
 * Test to verify Response.clone() and Request.clone() work correctly
 * Ensures clones are independent instances that can be consumed separately
 */

describe('Response and Request clone() methods', () => {
  describe('Response.clone()', () => {
    it('should create a new independent instance', () => {
      const original = new Response('{"test": "data"}', {
        status: 200,
        statusText: 'OK',
        headers: { 'Content-Type': 'application/json' },
      });

      const cloned = original.clone();

      // Verify clone is not the same instance
      expect(cloned).not.toBe(original);
      expect(cloned).toBeInstanceOf(Response);

      // Verify properties are copied
      expect(cloned.status).toBe(original.status);
      expect(cloned.statusText).toBe(original.statusText);
      expect(cloned.ok).toBe(original.ok);
    });

    it('should allow both original and clone to be consumed independently', async () => {
      const original = new Response('{"test": "data"}');
      const cloned = original.clone();

      // Consume original
      const originalData = await original.json();
      expect(originalData).toEqual({ test: 'data' });

      // Clone should still be consumable
      const clonedData = await cloned.json();
      expect(clonedData).toEqual({ test: 'data' });

      // Verify bodyUsed flags are independent
      expect(original.bodyUsed).toBe(true);
      expect(cloned.bodyUsed).toBe(true);
    });

    it('should create independent bodyUsed flags', async () => {
      const original = new Response('test data');
      const cloned = original.clone();

      // Original should not be consumed yet
      expect(original.bodyUsed).toBe(false);
      expect(cloned.bodyUsed).toBe(false);

      // Consume clone
      await cloned.text();
      expect(cloned.bodyUsed).toBe(true);

      // Original should still be consumable
      expect(original.bodyUsed).toBe(false);
      const originalText = await original.text();
      expect(originalText).toBe('test data');
      expect(original.bodyUsed).toBe(true);
    });
  });

  describe('Request.clone()', () => {
    it('should create a new independent instance', () => {
      const original = new Request('https://example.com/api', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: 'data' }),
      });

      const cloned = original.clone();

      // Verify clone is not the same instance
      expect(cloned).not.toBe(original);
      expect(cloned).toBeInstanceOf(Request);

      // Verify properties are copied
      expect(cloned.url).toBe(original.url);
      expect(cloned.method).toBe(original.method);
    });

    it('should allow both original and clone to be consumed independently', async () => {
      const original = new Request('https://example.com/api', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      });
      const cloned = original.clone();

      // Consume original
      const originalData = await original.json();
      expect(originalData).toEqual({ test: 'data' });

      // Clone should still be consumable
      const clonedData = await cloned.json();
      expect(clonedData).toEqual({ test: 'data' });

      // Verify bodyUsed flags are independent
      expect(original.bodyUsed).toBe(true);
      expect(cloned.bodyUsed).toBe(true);
    });

    it('should create independent bodyUsed flags', async () => {
      const original = new Request('https://example.com/api', {
        method: 'POST',
        body: 'test data',
      });
      const cloned = original.clone();

      // Original should not be consumed yet
      expect(original.bodyUsed).toBe(false);
      expect(cloned.bodyUsed).toBe(false);

      // Consume clone
      await cloned.text();
      expect(cloned.bodyUsed).toBe(true);

      // Original should still be consumable
      expect(original.bodyUsed).toBe(false);
      const originalText = await original.text();
      expect(originalText).toBe('test data');
      expect(original.bodyUsed).toBe(true);
    });

    it('should throw error when trying to consume already consumed body', async () => {
      const request = new Request('https://example.com/api', {
        method: 'POST',
        body: 'test data',
      });

      await request.text();
      expect(request.bodyUsed).toBe(true);

      // Trying to consume again should throw
      await expect(request.text()).rejects.toThrow('Body already consumed');
    });
  });

  describe('NextRequest.clone()', () => {
    it('should work with NextRequest instances', async () => {
      const { NextRequest } = require('@/__mocks__/next/server');
      const original = new NextRequest('https://example.com/api', {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
      });

      const cloned = original.clone();

      // Verify clone is not the same instance
      expect(cloned).not.toBe(original);

      // Both should be consumable independently
      const originalData = await original.json();
      const clonedData = await cloned.json();

      expect(originalData).toEqual({ test: 'data' });
      expect(clonedData).toEqual({ test: 'data' });
    });
  });
});

