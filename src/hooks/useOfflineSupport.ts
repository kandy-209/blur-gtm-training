'use client';

import { useEffect, useState, useCallback } from 'react';
import { backgroundSyncManager } from '@/lib/service-worker';

export interface OfflineState {
  isOnline: boolean;
  isOffline: boolean;
  wasOffline: boolean;
  syncQueueLength: number;
}

export function useOfflineSupport() {
  const [state, setState] = useState<OfflineState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isOffline: typeof navigator !== 'undefined' ? !navigator.onLine : false,
    wasOffline: false,
    syncQueueLength: 0,
  });

  const checkOnlineStatus = useCallback(() => {
    const isOnline = navigator.onLine;
    setState((prev) => ({
      isOnline,
      isOffline: !isOnline,
      wasOffline: prev.isOffline && isOnline, // Just came back online
      syncQueueLength: backgroundSyncManager.getQueueLength(),
    }));

    // Process sync queue when coming back online
    if (isOnline && state.wasOffline) {
      backgroundSyncManager.processQueue().catch(console.error);
    }
  }, [state.wasOffline]);

  useEffect(() => {
    window.addEventListener('online', checkOnlineStatus);
    window.addEventListener('offline', checkOnlineStatus);

    // Check sync queue periodically
    const interval = setInterval(() => {
      setState((prev) => ({
        ...prev,
        syncQueueLength: backgroundSyncManager.getQueueLength(),
      }));
    }, 5000);

    return () => {
      window.removeEventListener('online', checkOnlineStatus);
      window.removeEventListener('offline', checkOnlineStatus);
      clearInterval(interval);
    };
  }, [checkOnlineStatus]);

  const queueSync = useCallback(async (action: string, data: unknown) => {
    await backgroundSyncManager.sync(action, data);
    setState((prev) => ({
      ...prev,
      syncQueueLength: backgroundSyncManager.getQueueLength(),
    }));
  }, []);

  return {
    ...state,
    queueSync,
  };
}

