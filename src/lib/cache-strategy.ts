'use client';

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
  hits: number;
  lastAccessed: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  maxSize?: number; // Maximum number of entries
  strategy?: 'lru' | 'lfu' | 'fifo'; // Cache eviction strategy
}

export class IntelligentCache<T> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private options: Required<CacheOptions>;
  private accessOrder: string[] = [];
  private hitCounts: Map<string, number> = new Map();

  constructor(options: CacheOptions = {}) {
    this.options = {
      ttl: options.ttl ?? 3600000, // 1 hour default
      maxSize: options.maxSize ?? 100,
      strategy: options.strategy ?? 'lru',
    };
  }

  set(key: string, data: T, customTTL?: number): void {
    const ttl = customTTL ?? this.options.ttl;
    const now = Date.now();

    // Evict if needed
    if (this.cache.size >= this.options.maxSize && !this.cache.has(key)) {
      this.evict();
    }

    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttl,
      hits: this.hitCounts.get(key) ?? 0,
      lastAccessed: now,
    });

    this.updateAccessOrder(key);
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) {
      return null;
    }

    // Check expiration
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.hitCounts.delete(key);
      return null;
    }

    // Update access metadata
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.hitCounts.set(key, entry.hits);
    this.updateAccessOrder(key);

    return entry.data;
  }

  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.hitCounts.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): boolean {
    this.hitCounts.delete(key);
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
    this.accessOrder = [];
    this.hitCounts.clear();
  }

  private evict(): void {
    switch (this.options.strategy) {
      case 'lru':
        this.evictLRU();
        break;
      case 'lfu':
        this.evictLFU();
        break;
      case 'fifo':
        this.evictFIFO();
        break;
    }
  }

  private evictLRU(): void {
    // Remove least recently used
    if (this.accessOrder.length > 0) {
      const key = this.accessOrder[0];
      this.delete(key);
    }
  }

  private evictLFU(): void {
    // Remove least frequently used
    let minHits = Infinity;
    let keyToEvict = '';

    for (const [key, hits] of this.hitCounts.entries()) {
      if (hits < minHits) {
        minHits = hits;
        keyToEvict = key;
      }
    }

    if (keyToEvict) {
      this.delete(keyToEvict);
    }
  }

  private evictFIFO(): void {
    // Remove oldest entry
    if (this.accessOrder.length > 0) {
      const key = this.accessOrder[0];
      this.delete(key);
    }
  }

  private updateAccessOrder(key: string): void {
    const index = this.accessOrder.indexOf(key);
    if (index > -1) {
      this.accessOrder.splice(index, 1);
    }
    this.accessOrder.push(key);
  }

  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    strategy: string;
  } {
    const totalHits = Array.from(this.hitCounts.values()).reduce((a, b) => a + b, 0);
    const totalRequests = this.accessOrder.length;
    const hitRate = totalRequests > 0 ? totalHits / totalRequests : 0;

    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate,
      strategy: this.options.strategy,
    };
  }
}

// Request deduplication
export class RequestDeduplicator {
  private pendingRequests: Map<string, Promise<unknown>> = new Map();

  async deduplicate<T>(
    key: string,
    requestFn: () => Promise<T>,
    ttl: number = 5000
  ): Promise<T> {
    // Check if request is already pending
    const pending = this.pendingRequests.get(key);
    if (pending) {
      return pending as Promise<T>;
    }

    // Create new request
    const request = requestFn()
      .then((result) => {
        // Remove from pending after completion
        setTimeout(() => {
          this.pendingRequests.delete(key);
        }, ttl);
        return result;
      })
      .catch((error) => {
        this.pendingRequests.delete(key);
        throw error;
      });

    this.pendingRequests.set(key, request);
    return request;
  }

  clear(): void {
    this.pendingRequests.clear();
  }

  getPendingCount(): number {
    return this.pendingRequests.size;
  }
}

export const requestDeduplicator = new RequestDeduplicator();

// Predictive prefetching
export class PredictivePrefetcher {
  private prefetchQueue: Set<string> = new Set();
  private prefetchCache: Set<string> = new Set();
  private userPatterns: Map<string, number> = new Map();

  async prefetch(url: string, priority: 'high' | 'low' = 'low'): Promise<void> {
    if (this.prefetchCache.has(url)) {
      return; // Already prefetched
    }

    this.prefetchQueue.add(url);

    try {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'fetch';
      if (priority === 'high') {
        link.setAttribute('fetchpriority', 'high');
      }
      document.head.appendChild(link);

      this.prefetchCache.add(url);
      this.prefetchQueue.delete(url);
    } catch (error) {
      console.warn('Prefetch failed:', error);
      this.prefetchQueue.delete(url);
    }
  }

  recordNavigation(from: string, to: string): void {
    const pattern = `${from}->${to}`;
    const count = this.userPatterns.get(pattern) ?? 0;
    this.userPatterns.set(pattern, count + 1);
  }

  predictNextPages(currentPage: string, limit: number = 3): string[] {
    const predictions: Array<{ page: string; score: number }> = [];

    for (const [pattern, count] of this.userPatterns.entries()) {
      if (pattern.startsWith(`${currentPage}->`)) {
        const nextPage = pattern.split('->')[1];
        predictions.push({ page: nextPage, score: count });
      }
    }

    return predictions
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((p) => p.page);
  }

  async prefetchPredictedPages(currentPage: string): Promise<void> {
    const predictions = this.predictNextPages(currentPage);
    for (const page of predictions) {
      await this.prefetch(page, 'low');
    }
  }
}

export const predictivePrefetcher = new PredictivePrefetcher();

