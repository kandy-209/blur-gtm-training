/**
 * Redis Client for Distributed Caching and Rate Limiting
 * Falls back to in-memory store if Redis is not configured
 */

import Redis from 'ioredis';
import { log } from './logger';

let redisClient: Redis | null = null;
let isRedisAvailable = false;

// Initialize Redis client
export function getRedisClient(): Redis | null {
  if (redisClient) {
    return redisClient;
  }

  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
  const redisPassword = process.env.REDIS_PASSWORD;

  if (redisUrl) {
    try {
      redisClient = new Redis(redisUrl, {
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        enableReadyCheck: true,
        lazyConnect: true,
      });
      
      redisClient.on('error', (error) => {
        log.error('Redis connection error', error);
        isRedisAvailable = false;
      });
      
      redisClient.on('connect', () => {
        log.info('Redis connected');
        isRedisAvailable = true;
      });
      
      redisClient.on('ready', () => {
        log.info('Redis ready');
        isRedisAvailable = true;
      });
      
      // Try to connect
      redisClient.connect().catch((error) => {
        log.warn('Redis connection failed, using in-memory fallback', { error: error.message });
        isRedisAvailable = false;
      });
      
      return redisClient;
    } catch (error) {
      log.warn('Failed to initialize Redis, using in-memory fallback', { error: error instanceof Error ? error.message : String(error) });
      return null;
    }
  } else if (redisHost) {
    try {
      redisClient = new Redis({
        host: redisHost,
        port: redisPort,
        password: redisPassword,
        maxRetriesPerRequest: 3,
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        enableReadyCheck: true,
        lazyConnect: true,
      });
      
      redisClient.on('error', (error) => {
        log.error('Redis connection error', error);
        isRedisAvailable = false;
      });
      
      redisClient.on('connect', () => {
        log.info('Redis connected');
        isRedisAvailable = true;
      });
      
      redisClient.on('ready', () => {
        log.info('Redis ready');
        isRedisAvailable = true;
      });
      
      redisClient.connect().catch((error) => {
        log.warn('Redis connection failed, using in-memory fallback', { error: error.message });
        isRedisAvailable = false;
      });
      
      return redisClient;
    } catch (error) {
      console.warn('Failed to initialize Redis, using in-memory fallback:', error);
      return null;
    }
  }

  return null;
}

// In-memory fallback store
const memoryStore = new Map<string, { value: any; expiresAt: number }>();

// Cache interface
export interface CacheOptions {
  ttl?: number; // Time to live in seconds
}

/**
 * Get value from cache (Redis or memory)
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  const client = getRedisClient();
  
  if (client && isRedisAvailable) {
    try {
      const value = await client.get(key);
      if (value) {
        return JSON.parse(value) as T;
      }
      return null;
    } catch (error) {
      log.warn('Redis get error, falling back to memory', { error: error instanceof Error ? error.message : String(error) });
      // Fall through to memory store
    }
  }
  
  // Memory fallback
  const cached = memoryStore.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.value as T;
  }
  
  if (cached) {
    memoryStore.delete(key);
  }
  
  return null;
}

/**
 * Set value in cache (Redis or memory)
 */
export async function cacheSet<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
  const client = getRedisClient();
  const ttl = options?.ttl || 3600; // Default 1 hour
  
  if (client && isRedisAvailable) {
    try {
      await client.setex(key, ttl, JSON.stringify(value));
      return;
    } catch (error) {
      log.warn('Redis set error, falling back to memory', { error: error instanceof Error ? error.message : String(error) });
      // Fall through to memory store
    }
  }
  
  // Memory fallback
  memoryStore.set(key, {
    value,
    expiresAt: Date.now() + ttl * 1000,
  });
  
  // Clean up expired entries periodically
  if (memoryStore.size > 1000) {
    const now = Date.now();
    for (const [k, v] of memoryStore.entries()) {
      if (v.expiresAt <= now) {
        memoryStore.delete(k);
      }
    }
  }
}

/**
 * Delete value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  const client = getRedisClient();
  
  if (client && isRedisAvailable) {
    try {
      await client.del(key);
      return;
    } catch (error) {
      log.warn('Redis delete error, falling back to memory', { error: error instanceof Error ? error.message : String(error) });
    }
  }
  
  memoryStore.delete(key);
}

/**
 * Check if Redis is available
 */
export function isRedisConnected(): boolean {
  return isRedisAvailable && !!getRedisClient();
}

/**
 * Distributed rate limiting using Redis
 */
export async function distributedRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
  const client = getRedisClient();
  const key = `rate_limit:${identifier}`;
  const now = Date.now();
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const resetTime = windowStart + windowMs;
  
  if (client && isRedisAvailable) {
    try {
      const multi = client.multi();
      multi.incr(key);
      multi.expire(key, Math.ceil(windowMs / 1000));
      const results = await multi.exec();
      
      if (results && results[0] && results[0][1]) {
        const count = results[0][1] as number;
        const allowed = count <= maxRequests;
        const remaining = Math.max(0, maxRequests - count);
        
        return { allowed, remaining, resetTime };
      }
    } catch (error) {
      log.warn('Redis rate limit error, falling back to memory', { error: error instanceof Error ? error.message : String(error) });
      // Fall through to memory fallback
    }
  }
  
  // Memory fallback (simple implementation)
  const memoryKey = `${key}:${windowStart}`;
  const cached = memoryStore.get(memoryKey);
  const count = cached ? (cached.value as number) + 1 : 1;
  
  memoryStore.set(memoryKey, {
    value: count,
    expiresAt: resetTime,
  });
  
  const allowed = count <= maxRequests;
  const remaining = Math.max(0, maxRequests - count);
  
  return { allowed, remaining, resetTime };
}

