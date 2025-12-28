/**
 * Custom hook for analytics data with intelligent caching
 * Uses stale-while-revalidate pattern for optimal UX
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { TrainingEvent } from '@/lib/analytics';
import { 
  getCachedAnalytics, 
  setCachedAnalytics, 
  isCacheStale,
  shouldRefreshCache,
  invalidateCache,
  AnalyticsCache 
} from '@/lib/analytics-cache';
import { retryWithBackoff } from '@/lib/error-recovery';
import { requestDeduplicator } from '@/lib/cache-strategy';
import { safeDate } from '@/lib/date-utils';

interface AnalyticsStats {
  totalScenarios: number;
  averageScore: number;
  totalTurns: number;
  totalCalls?: number;
  averageCallScore?: number;
  totalCallDuration?: number;
}

interface UseAnalyticsOptions {
  userId?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
  enableCache?: boolean;
}

interface UseAnalyticsReturn {
  stats: AnalyticsStats;
  events: TrainingEvent[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  invalidate: () => void;
  cacheAge: number;
  isStale: boolean;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    userId,
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableCache = true,
  } = options;

  const [stats, setStats] = useState<AnalyticsStats>({
    totalScenarios: 0,
    averageScore: 0,
    totalTurns: 0,
    totalCalls: 0,
    averageCallScore: 0,
    totalCallDuration: 0,
  });
  const [events, setEvents] = useState<TrainingEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cacheAge, setCacheAge] = useState(0);
  const [isStale, setIsStale] = useState(false);

  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load from cache immediately
  useEffect(() => {
    if (!enableCache) return;

    const cached = getCachedAnalytics(userId);
    if (cached) {
      setStats(cached.stats);
      setEvents(cached.events);
      setCacheAge(Date.now() - cached.timestamp);
      setIsStale(isCacheStale(cached));
      setIsLoading(false);
    }
  }, [userId, enableCache]);

  // Fetch fresh data
  const fetchAnalytics = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setIsRefreshing(true);
    }

    // Cancel previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Use request deduplication to prevent multiple simultaneous requests
      const cacheKey = `analytics_${userId || 'default'}`;
      const result = await requestDeduplicator.deduplicate(
        cacheKey,
        async () => {
          const retryResult = await retryWithBackoff(
            async () => {
              const response = await fetch(
                `/api/analytics?userId=${userId || ''}&includeStats=true&limit=50`,
                {
                  signal: abortControllerRef.current?.signal,
                  headers: {
                    'Cache-Control': 'no-cache',
                  },
                }
              );

              if (!response.ok) {
                throw new Error(`Failed to fetch analytics: ${response.statusText}`);
              }

              return response.json();
            },
            {
              maxRetries: 2,
              retryDelay: 500,
            }
          );
          
          // Unwrap retryWithBackoff result - if successful, return data, otherwise throw error
          if (retryResult.success && retryResult.data) {
            return retryResult.data;
          }
          throw retryResult.error || new Error('Failed to fetch analytics after retries');
        },
        2000 // 2 second deduplication window
      );

      if (result.success && result.data) {
        // result.data is the JSON response from the API
        const data = result.data;
        const newStats: AnalyticsStats = {
          totalScenarios: data.stats?.totalScenarios || 0,
          averageScore: Math.round(data.stats?.averageScore || 0),
          totalTurns: data.stats?.totalTurns || 0,
          totalCalls: data.stats?.totalCalls || 0,
          averageCallScore: data.stats?.averageCallScore ? Math.round(data.stats.averageCallScore) : 0,
          totalCallDuration: data.stats?.totalCallDuration || 0,
        };

        const newEvents: TrainingEvent[] = (data.events || []).map((e: any) => ({
          ...e,
          timestamp: safeDate(e.timestamp),
        }));

        setStats(newStats);
        setEvents(newEvents);
        setError(null);
        setCacheAge(0);
        setIsStale(false);

        // Update cache
        if (enableCache) {
          setCachedAnalytics(newStats, newEvents, userId);
        }
      } else {
        throw result.error || new Error('Failed to fetch analytics');
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        // Request was cancelled, ignore
        return;
      }

      console.error('Error fetching analytics:', error);
      setError(error);

      // If we have cached data, keep showing it
      if (enableCache) {
        const cached = getCachedAnalytics(userId);
        if (cached) {
          // Don't overwrite with error if we have cache
          return;
        }
      }

      // Only set error if we don't have cache
      if (!enableCache || !getCachedAnalytics(userId)) {
        setError(error);
      }
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [userId, enableCache]);

  // Initial load with stale-while-revalidate
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!enableCache) {
        // No cache, just fetch
        await fetchAnalytics(true);
        return;
      }

      const cached = getCachedAnalytics(userId);
      
      if (cached) {
        // Show cached data immediately
        setStats(cached.stats);
        setEvents(cached.events);
        setCacheAge(Date.now() - cached.timestamp);
        setIsStale(isCacheStale(cached));
        setIsLoading(false);

        // If cache is stale, refresh in background
        if (shouldRefreshCache(cached)) {
          fetchAnalytics(false); // Don't show loading for background refresh
        }
      } else {
        // No cache, fetch fresh data
        await fetchAnalytics(true);
      }
    };

    if (mounted) {
      loadData();
    }

    return () => {
      mounted = false;
    };
  }, [userId, enableCache]); // Only run on mount or userId change

  // Auto-refresh interval
  useEffect(() => {
    if (!autoRefresh) return;

    const scheduleRefresh = () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }

      refreshTimeoutRef.current = setTimeout(() => {
        const cached = getCachedAnalytics(userId);
        if (shouldRefreshCache(cached)) {
          fetchAnalytics(false); // Background refresh
        }
        scheduleRefresh(); // Schedule next refresh
      }, refreshInterval);
    };

    scheduleRefresh();

    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [autoRefresh, refreshInterval, userId, fetchAnalytics]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    invalidateCache(userId);
    await fetchAnalytics(true);
  }, [userId, fetchAnalytics]);

  // Invalidate cache
  const invalidate = useCallback(() => {
    invalidateCache(userId);
  }, [userId]);

  // Update cache age periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const cached = getCachedAnalytics(userId);
      if (cached) {
        setCacheAge(Date.now() - cached.timestamp);
        setIsStale(isCacheStale(cached));
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    stats,
    events,
    isLoading,
    isRefreshing,
    error,
    refresh,
    invalidate,
    cacheAge,
    isStale,
  };
}

