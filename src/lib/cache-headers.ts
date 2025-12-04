/**
 * HTTP Cache Headers Utility
 * Provides proper Cache-Control headers following RFC 7234
 * Optimized for CDN and browser caching
 */

export interface CacheHeaderOptions {
  maxAge?: number; // Max age in seconds
  staleWhileRevalidate?: number; // SWR period in seconds
  staleIfError?: number; // Serve stale on error period
  public?: boolean; // Whether response can be cached by CDN
  private?: boolean; // Whether response is user-specific
  immutable?: boolean; // Whether content never changes
  mustRevalidate?: boolean; // Whether must revalidate before serving stale
  proxyRevalidate?: boolean; // Whether proxies must revalidate
  noCache?: boolean; // Whether to disable caching
  noStore?: boolean; // Whether to prevent storage
  noTransform?: boolean; // Whether proxies can transform content
  sMaxAge?: number; // Shared max age for CDN
}

/**
 * Generate Cache-Control header value following RFC 7234
 */
export function generateCacheControl(options: CacheHeaderOptions = {}): string {
  const {
    maxAge = 300,
    staleWhileRevalidate,
    staleIfError,
    public: isPublic = true,
    private: isPrivate = false,
    immutable = false,
    mustRevalidate = false,
    proxyRevalidate = false,
    noCache = false,
    noStore = false,
    noTransform = false,
    sMaxAge,
  } = options;

  // No-store takes precedence
  if (noStore) {
    return 'no-store, no-cache, must-revalidate, proxy-revalidate';
  }

  // No-cache
  if (noCache) {
    const directives = ['no-cache'];
    if (mustRevalidate) directives.push('must-revalidate');
    if (proxyRevalidate) directives.push('proxy-revalidate');
    return directives.join(', ');
  }

  const directives: string[] = [];

  // Public/Private
  if (isPrivate) {
    directives.push('private');
  } else if (isPublic) {
    directives.push('public');
  }

  // Max age
  directives.push(`max-age=${maxAge}`);

  // Shared max age (for CDN)
  if (sMaxAge !== undefined) {
    directives.push(`s-maxage=${sMaxAge}`);
  }

  // Stale-while-revalidate (RFC 5861)
  if (staleWhileRevalidate) {
    directives.push(`stale-while-revalidate=${staleWhileRevalidate}`);
  }

  // Stale-if-error (RFC 5861)
  if (staleIfError) {
    directives.push(`stale-if-error=${staleIfError}`);
  }

  // Immutable
  if (immutable) {
    directives.push('immutable');
  }

  // Must revalidate
  if (mustRevalidate) {
    directives.push('must-revalidate');
  }

  // Proxy revalidate
  if (proxyRevalidate) {
    directives.push('proxy-revalidate');
  }

  // No transform
  if (noTransform) {
    directives.push('no-transform');
  }

  return directives.join(', ');
}

/**
 * Preset cache configurations for common use cases
 */
export const CachePresets = {
  // API responses that change frequently (e.g., stock quotes)
  apiDynamic: (maxAge: number = 60) => generateCacheControl({
    maxAge,
    staleWhileRevalidate: maxAge * 2,
    staleIfError: maxAge * 3,
    public: true,
    sMaxAge: maxAge,
  }),

  // API responses that are relatively stable (e.g., company search)
  apiStable: (maxAge: number = 300) => generateCacheControl({
    maxAge,
    staleWhileRevalidate: maxAge * 3,
    staleIfError: maxAge * 5,
    public: true,
    sMaxAge: maxAge * 2,
  }),

  // Stock quotes (change frequently but can be stale briefly)
  stockQuote: () => generateCacheControl({
    maxAge: 60, // 1 minute
    staleWhileRevalidate: 300, // 5 minutes SWR
    staleIfError: 600, // 10 minutes on error
    public: true,
    sMaxAge: 60,
  }),

  // Company analysis (changes infrequently)
  companyAnalysis: () => generateCacheControl({
    maxAge: 3600, // 1 hour
    staleWhileRevalidate: 7200, // 2 hours SWR
    staleIfError: 10800, // 3 hours on error
    public: true,
    sMaxAge: 1800, // 30 minutes for CDN
  }),

  // User-specific data (should not be cached publicly)
  userSpecific: (maxAge: number = 60) => generateCacheControl({
    maxAge,
    private: true,
    mustRevalidate: true,
  }),

  // Static assets (never change)
  static: () => generateCacheControl({
    maxAge: 31536000, // 1 year
    immutable: true,
    public: true,
    sMaxAge: 31536000,
  }),

  // No caching (sensitive data, real-time data)
  noCache: () => generateCacheControl({
    noCache: true,
    mustRevalidate: true,
    proxyRevalidate: true,
  }),

  // No storage (highly sensitive)
  noStore: () => generateCacheControl({
    noStore: true,
  }),
};

