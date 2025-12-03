'use client';

import { useState, useCallback, useRef } from 'react';

export interface OptimisticUpdateOptions<T> {
  onUpdate: (data: T) => Promise<T>;
  onRollback?: (data: T) => void;
  onError?: (error: Error, data: T) => void;
  rollbackOnError?: boolean;
}

export function useOptimisticUpdate<T>(initialData: T, options: OptimisticUpdateOptions<T>) {
  const { onUpdate, onRollback, onError, rollbackOnError = true } = options;
  const [data, setData] = useState<T>(initialData);
  const [isUpdating, setIsUpdating] = useState(false);
  const previousDataRef = useRef<T>(initialData);

  const updateOptimistically = useCallback(async (optimisticData: T) => {
    // Store previous state for potential rollback
    previousDataRef.current = data;
    
    // Optimistically update UI
    setData(optimisticData);
    setIsUpdating(true);

    try {
      // Perform actual update
      const updatedData = await onUpdate(optimisticData);
      setData(updatedData);
      setIsUpdating(false);
      return updatedData;
    } catch (error) {
      setIsUpdating(false);
      
      // Rollback on error if enabled
      if (rollbackOnError) {
        setData(previousDataRef.current);
        if (onRollback) {
          onRollback(previousDataRef.current);
        }
      }

      if (onError) {
        onError(error as Error, optimisticData);
      }

      throw error;
    }
  }, [data, onUpdate, onRollback, onError, rollbackOnError]);

  const setDataDirectly = useCallback((newData: T) => {
    previousDataRef.current = data;
    setData(newData);
  }, [data]);

  return {
    data,
    isUpdating,
    updateOptimistically,
    setData: setDataDirectly,
  };
}

