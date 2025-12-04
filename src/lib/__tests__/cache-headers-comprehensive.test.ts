/**
 * Comprehensive tests for Cache Headers
 */

import { generateCacheControl, CachePresets } from '../cache-headers';

describe('cache-headers comprehensive', () => {
  describe('generateCacheControl', () => {
    it('should handle all options correctly', () => {
      const header = generateCacheControl({
        maxAge: 300,
        staleWhileRevalidate: 600,
        staleIfError: 900,
        public: true,
        immutable: true,
        mustRevalidate: true,
        proxyRevalidate: true,
        sMaxAge: 1800,
      });

      expect(header).toContain('max-age=300');
      expect(header).toContain('stale-while-revalidate=600');
      expect(header).toContain('stale-if-error=900');
      expect(header).toContain('public');
      expect(header).toContain('immutable');
      expect(header).toContain('must-revalidate');
      expect(header).toContain('proxy-revalidate');
      expect(header).toContain('s-maxage=1800');
    });

    it('should prioritize noStore over other options', () => {
      const header = generateCacheControl({
        maxAge: 300,
        noStore: true,
        public: true,
      });

      expect(header).toContain('no-store');
      expect(header).not.toContain('max-age');
    });

    it('should handle noCache correctly', () => {
      const header = generateCacheControl({
        noCache: true,
        mustRevalidate: true,
      });

      expect(header).toContain('no-cache');
      expect(header).toContain('must-revalidate');
    });
  });

  describe('CachePresets', () => {
    it('should have correct stock quote settings', () => {
      const header = CachePresets.stockQuote();
      expect(header).toContain('max-age=60');
      expect(header).toContain('stale-while-revalidate=300');
      expect(header).toContain('public');
    });

    it('should have correct company analysis settings', () => {
      const header = CachePresets.companyAnalysis();
      expect(header).toContain('max-age=3600');
      expect(header).toContain('stale-while-revalidate=7200');
    });

    it('should have correct static asset settings', () => {
      const header = CachePresets.static();
      expect(header).toContain('max-age=31536000');
      expect(header).toContain('immutable');
    });

    it('should have correct user-specific settings', () => {
      const header = CachePresets.userSpecific(60);
      expect(header).toContain('private');
      expect(header).toContain('must-revalidate');
    });

    it('should have correct no-cache settings', () => {
      const header = CachePresets.noCache();
      expect(header).toContain('no-cache');
      expect(header).toContain('must-revalidate');
    });
  });

  describe('Edge cases', () => {
    it('should handle zero maxAge', () => {
      const header = generateCacheControl({ maxAge: 0 });
      expect(header).toContain('max-age=0');
    });

    it('should handle very large maxAge', () => {
      const header = generateCacheControl({ maxAge: 31536000 });
      expect(header).toContain('max-age=31536000');
    });

    it('should handle empty options', () => {
      const header = generateCacheControl({});
      expect(header).toContain('max-age=300'); // Default
      expect(header).toContain('public'); // Default
    });
  });
});

