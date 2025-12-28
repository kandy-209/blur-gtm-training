/**
 * Advanced Cache Strategy
 * Implements sophisticated caching for better performance
 */

export interface CacheConfig {
  key: string;
  ttl: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Stale while revalidate in seconds
  tags?: string[]; // Cache tags for invalidation
}

class CacheManager {
  private cache: Map<string, { data: any; expires: number; tags: string[] }> = new Map();
  
  /**
   * Set cache with TTL and tags
   */
  set(key: string, data: any, config: CacheConfig): void {
    const expires = Date.now() + (config.ttl * 1000);
    this.cache.set(key, {
      data,
      expires,
      tags: config.tags || [],
    });
  }
  
  /**
   * Get cache entry
   */
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  /**
   * Invalidate cache by tag
   */
  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }
  
  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
  
  /**
   * Get cache stats
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const cacheManager = new CacheManager();

/**
 * Request Deduplicator
 * Prevents multiple simultaneous requests with the same key
 */
class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<{ success: boolean; data?: any; error?: Error }>> = new Map();
  
  /**
   * Deduplicate requests - if a request with the same key is already in progress,
   * return the existing promise instead of making a new request
   */
  async deduplicate<T>(
    key: string,
    fn: () => Promise<T>,
    windowMs: number = 2000
  ): Promise<{ success: boolean; data?: T; error?: Error }> {
    // Check if there's already a pending request
    const existing = this.pendingRequests.get(key);
    if (existing) {
      return existing;
    }
    
    // Create new request promise
    const requestPromise = (async () => {
      try {
        const data = await fn();
        return { success: true, data };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
        };
      } finally {
        // Remove from pending after a delay to allow deduplication window
        setTimeout(() => {
          this.pendingRequests.delete(key);
        }, windowMs);
      }
    })();
    
    // Store the promise
    this.pendingRequests.set(key, requestPromise);
    
    return requestPromise;
  }
  
  /**
   * Clear all pending requests
   */
  clear(): void {
    this.pendingRequests.clear();
  }
  
  /**
   * Get number of pending requests
   */
  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

/**
 * Cache decorator for functions
 */
export function cached(config: CacheConfig) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const cacheKey = `${config.key}:${JSON.stringify(args)}`;
      const cached = cacheManager.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      const result = await method.apply(this, args);
      cacheManager.set(cacheKey, result, config);
      
      return result;
    };
  };
}
