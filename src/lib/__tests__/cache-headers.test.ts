/**
 * Tests for Cache Headers Utility
 */

import { generateCacheControl, CachePresets } from '../cache-headers';

describe('cache-headers', () => {
  describe('generateCacheControl', () => {
    it('should generate basic cache control', () => {
      const header = generateCacheControl({ maxAge: 300 });
      expect(header).toContain('max-age=300');
      expect(header).toContain('public');
    });

    it('should handle no-store directive', () => {
      const header = generateCacheControl({ noStore: true });
      expect(header).toContain('no-store');
      expect(header).toContain('no-cache');
    });

    it('should handle private cache', () => {
      const header = generateCacheControl({ private: true });
      expect(header).toContain('private');
      expect(header).not.toContain('public');
    });

    it('should include stale-while-revalidate', () => {
      const header = generateCacheControl({
        maxAge: 300,
        staleWhileRevalidate: 600,
      });
      expect(header).toContain('stale-while-revalidate=600');
    });

    it('should include stale-if-error', () => {
      const header = generateCacheControl({
        maxAge: 300,
        staleIfError: 900,
      });
      expect(header).toContain('stale-if-error=900');
    });

    it('should handle immutable', () => {
      const header = generateCacheControl({ immutable: true });
      expect(header).toContain('immutable');
    });
  });

  describe('CachePresets', () => {
    it('should generate stock quote preset', () => {
      const header = CachePresets.stockQuote();
      expect(header).toContain('max-age=60');
      expect(header).toContain('stale-while-revalidate=300');
    });

    it('should generate company analysis preset', () => {
      const header = CachePresets.companyAnalysis();
      expect(header).toContain('max-age=3600');
      expect(header).toContain('stale-while-revalidate=7200');
    });

    it('should generate api stable preset', () => {
      const header = CachePresets.apiStable(300);
      expect(header).toContain('max-age=300');
    });

    it('should generate no cache preset', () => {
      const header = CachePresets.noCache();
      expect(header).toContain('no-cache');
      expect(header).toContain('must-revalidate');
    });

    it('should generate static preset', () => {
      const header = CachePresets.static();
      expect(header).toContain('max-age=31536000');
      expect(header).toContain('immutable');
    });
  });
});

