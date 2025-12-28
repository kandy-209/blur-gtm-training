/**
 * Hook for real-time coaching updates
 * Provides coaching suggestions as user types
 */

import { useState, useEffect, useCallback } from 'react';
import { RoleplayState, Scenario } from '@/types/roleplay';
import { getRealTimeCoaching } from '@/lib/roleplay-integration-helper';

export interface CoachingState {
  suggestions: string[];
  warnings: string[];
  opportunities: string[];
  nextBestAction: string;
  isLoading: boolean;
}

export function useRealTimeCoaching(
  state: RoleplayState,
  scenario: Scenario,
  currentMessage: string,
  enabled: boolean = true
): CoachingState {
  const [coaching, setCoaching] = useState<CoachingState>({
    suggestions: [],
    warnings: [],
    opportunities: [],
    nextBestAction: '',
    isLoading: false,
  });

  const updateCoaching = useCallback(() => {
    if (!enabled || !currentMessage.trim() || currentMessage.length < 10) {
      setCoaching({
        suggestions: [],
        warnings: [],
        opportunities: [],
        nextBestAction: '',
        isLoading: false,
      });
      return;
    }

    setCoaching((prev) => ({ ...prev, isLoading: true }));

    // Debounce the coaching calculation with memoization key
    const cacheKey = `${scenario.id}-${state.turnNumber}-${currentMessage.substring(0, 100)}`;
    const cachedResult = sessionStorage.getItem(`coaching:${cacheKey}`);
    
    if (cachedResult) {
      try {
        const parsed = JSON.parse(cachedResult);
        // Use cached result if less than 5 seconds old
        if (Date.now() - parsed.timestamp < 5000) {
          setCoaching({
            ...parsed.data,
            isLoading: false,
          });
          return;
        }
      } catch {
        // Invalid cache, continue to compute
      }
    }

    const timeoutId = setTimeout(() => {
      try {
        const result = getRealTimeCoaching(state, scenario, currentMessage);
        
        // Cache the result
        try {
          sessionStorage.setItem(`coaching:${cacheKey}`, JSON.stringify({
            data: result,
            timestamp: Date.now(),
          }));
        } catch {
          // Cache storage failed, continue anyway
        }
        
        setCoaching({
          ...result,
          isLoading: false,
        });
      } catch (error) {
        console.warn('Failed to get real-time coaching:', error);
        setCoaching({
          suggestions: [],
          warnings: [],
          opportunities: [],
          nextBestAction: '',
          isLoading: false,
        });
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [state, scenario, currentMessage, enabled]);

  useEffect(() => {
    updateCoaching();
  }, [updateCoaching]);

  return coaching;
}

