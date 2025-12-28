/**
 * Agent Cache Manager
 * Intelligent caching with invalidation strategies for AI agents
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  tags: string[];
  accessCount: number;
  lastAccessed: number;
}

export class AgentCacheManager {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private maxSize = 1000;
  private defaultTTL = 60000; // 1 minute

  /**
   * Generate cache key from context
   */
  generateKey(agentName: string, context: any): string {
    const contextHash = this.hashContext(context);
    return `${agentName}:${contextHash}`;
  }

  /**
   * Hash context for cache key
   */
  private hashContext(context: any): string {
    // Simple hash function for context
    const str = JSON.stringify(context);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Get cached result
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Update access stats
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, options?: { ttl?: number; tags?: string[] }): void {
    // Evict if at max size
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: options?.ttl || this.defaultTTL,
      tags: options?.tags || [],
      accessCount: 0,
      lastAccessed: Date.now(),
    });
  }

  /**
   * Invalidate by tag
   */
  invalidateByTag(tag: string): void {
    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.includes(tag)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate by pattern
   */
  invalidateByPattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
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
  getStats(): {
    size: number;
    hitRate: number;
    totalAccesses: number;
    averageAge: number;
  } {
    let totalAccesses = 0;
    let totalAge = 0;
    const now = Date.now();

    for (const entry of this.cache.values()) {
      totalAccesses += entry.accessCount;
      totalAge += now - entry.timestamp;
    }

    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track hits/misses separately
      totalAccesses,
      averageAge: this.cache.size > 0 ? totalAge / this.cache.size : 0,
    };
  }

  /**
   * Clean expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const agentCacheManager = new AgentCacheManager();

// Cleanup expired entries every minute
if (typeof window !== 'undefined') {
  setInterval(() => {
    agentCacheManager.cleanup();
  }, 60000);
}

