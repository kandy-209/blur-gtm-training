'use client';

import { IntelligentCache } from './cache-strategy';
import { IndexedDBCache } from './web-worker-manager';

export interface CacheTier {
  name: string;
  cache: IntelligentCache<unknown> | IndexedDBCache;
  priority: number;
  ttl: number;
}

export class MultiTierCache {
  private tiers: CacheTier[] = [];
  private hitStats: Map<string, number> = new Map();
  private missStats: Map<string, number> = new Map();

  addTier(tier: CacheTier): void {
    this.tiers.push(tier);
    this.tiers.sort((a, b) => a.priority - b.priority);
  }

  async get<T>(key: string): Promise<T | null> {
    // Try each tier in priority order
    for (const tier of this.tiers) {
      let value: T | null = null;

      if (tier.cache instanceof IntelligentCache) {
        value = tier.cache.get(key) as T | null;
      } else if (tier.cache instanceof IndexedDBCache) {
        value = await tier.cache.get<T>(key);
      }

      if (value !== null) {
        // Cache hit - promote to higher tiers
        this.recordHit(tier.name);
        await this.promoteToHigherTiers(key, value, tier.priority);
        return value;
      }
    }

    // Cache miss
    this.recordMiss();
    return null;
  }

  async set<T>(key: string, value: T, customTTL?: number): Promise<void> {
    // Set in all tiers
    for (const tier of this.tiers) {
      const ttl = customTTL || tier.ttl;

      if (tier.cache instanceof IntelligentCache) {
        tier.cache.set(key, value, ttl);
      } else if (tier.cache instanceof IndexedDBCache) {
        await tier.cache.set(key, value, ttl);
      }
    }
  }

  private async promoteToHigherTiers<T>(
    key: string,
    value: T,
    currentPriority: number
  ): Promise<void> {
    // Promote to higher priority tiers
    for (const tier of this.tiers) {
      if (tier.priority < currentPriority) {
        const ttl = tier.ttl;

        if (tier.cache instanceof IntelligentCache) {
          tier.cache.set(key, value, ttl);
        } else if (tier.cache instanceof IndexedDBCache) {
          await tier.cache.set(key, value, ttl);
        }
      }
    }
  }

  private recordHit(tierName: string): void {
    const current = this.hitStats.get(tierName) || 0;
    this.hitStats.set(tierName, current + 1);
  }

  private recordMiss(): void {
    const current = this.missStats.get('total') || 0;
    this.missStats.set('total', current + 1);
  }

  getStats(): {
    hits: Record<string, number>;
    misses: number;
    hitRate: number;
  } {
    const totalHits = Array.from(this.hitStats.values()).reduce((a, b) => a + b, 0);
    const totalMisses = this.missStats.get('total') || 0;
    const totalRequests = totalHits + totalMisses;
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;

    return {
      hits: Object.fromEntries(this.hitStats),
      misses: totalMisses,
      hitRate,
    };
  }

  async warmCache(keys: string[], fetcher: (key: string) => Promise<unknown>): Promise<void> {
    // Pre-fetch and cache data
    const promises = keys.map(async (key) => {
      try {
        const value = await fetcher(key);
        await this.set(key, value);
      } catch (error) {
        console.error(`Failed to warm cache for key ${key}:`, error);
      }
    });

    await Promise.all(promises);
  }

  async clear(): Promise<void> {
    for (const tier of this.tiers) {
      if (tier.cache instanceof IntelligentCache) {
        tier.cache.clear();
      } else if (tier.cache instanceof IndexedDBCache) {
        await tier.cache.clear();
      }
    }

    this.hitStats.clear();
    this.missStats.clear();
  }
}

// Create default multi-tier cache
export function createDefaultMultiTierCache(): MultiTierCache {
  const cache = new MultiTierCache();

  // Tier 1: Memory cache (fastest, smallest)
  cache.addTier({
    name: 'memory',
    cache: new IntelligentCache({ strategy: 'lru', maxSize: 50, ttl: 60000 }),
    priority: 1,
    ttl: 60000, // 1 minute
  });

  // Tier 2: IndexedDB cache (slower, larger)
  const indexedDBCache = new IndexedDBCache('multi-tier-cache');
  cache.addTier({
    name: 'indexeddb',
    cache: indexedDBCache,
    priority: 2,
    ttl: 3600000, // 1 hour
  });

  return cache;
}

export const multiTierCache = createDefaultMultiTierCache();

