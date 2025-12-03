'use client';

import { errorAnalytics, ErrorReport } from './error-analytics';

export interface ErrorPattern {
  component: string;
  action: string;
  errorType: string;
  frequency: number;
  lastOccurred: number;
  prediction: 'likely' | 'possible' | 'unlikely';
}

export class ErrorPredictor {
  private patterns: Map<string, ErrorPattern> = new Map();
  private threshold: number = 3; // Minimum occurrences to predict

  analyzeErrors(): ErrorPattern[] {
    const errors = errorAnalytics.getErrors();
    const patternMap = new Map<string, ErrorPattern>();

    for (const error of errors) {
      const key = `${error.context.component}-${error.context.action}-${error.error.name}`;
      const existing = patternMap.get(key);

      if (existing) {
        existing.frequency++;
        existing.lastOccurred = Math.max(existing.lastOccurred, error.context.timestamp);
      } else {
        patternMap.set(key, {
          component: error.context.component || 'unknown',
          action: error.context.action || 'unknown',
          errorType: error.error.name,
          frequency: 1,
          lastOccurred: error.context.timestamp,
          prediction: 'unlikely',
        });
      }
    }

    // Calculate predictions
    for (const pattern of patternMap.values()) {
      if (pattern.frequency >= this.threshold) {
        const timeSinceLastError = Date.now() - pattern.lastOccurred;
        const errorRate = errorAnalytics.getErrorRate(60000); // errors per minute

        if (pattern.frequency >= 10 || errorRate > 0.1) {
          pattern.prediction = 'likely';
        } else if (pattern.frequency >= 5 || timeSinceLastError < 300000) {
          pattern.prediction = 'possible';
        }
      }
    }

    this.patterns = patternMap;
    return Array.from(patternMap.values());
  }

  predictError(component: string, action: string): ErrorPattern[] {
    const predictions: ErrorPattern[] = [];

    for (const pattern of this.patterns.values()) {
      if (pattern.component === component && pattern.action === action) {
        if (pattern.prediction !== 'unlikely') {
          predictions.push(pattern);
        }
      }
    }

    return predictions.sort((a, b) => {
      if (a.prediction === 'likely' && b.prediction !== 'likely') return -1;
      if (b.prediction === 'likely' && a.prediction !== 'likely') return 1;
      return b.frequency - a.frequency;
    });
  }

  getLikelyErrors(): ErrorPattern[] {
    return Array.from(this.patterns.values()).filter(
      (p) => p.prediction === 'likely'
    );
  }

  shouldPreventAction(component: string, action: string): boolean {
    const predictions = this.predictError(component, action);
    return predictions.some((p) => p.prediction === 'likely' && p.frequency >= 10);
  }
}

export const errorPredictor = new ErrorPredictor();

// Self-healing system
export class SelfHealingSystem {
  private healingStrategies: Map<string, () => Promise<boolean>> = new Map();

  registerStrategy(errorType: string, strategy: () => Promise<boolean>): void {
    this.healingStrategies.set(errorType, strategy);
  }

  async attemptHealing(error: Error, context: { component?: string; action?: string }): Promise<boolean> {
    const errorType = error.name || error.constructor.name;
    const strategy = this.healingStrategies.get(errorType);

    if (!strategy) {
      return false;
    }

    try {
      const healed = await strategy();
      if (healed) {
        console.log(`Successfully healed ${errorType} error in ${context.component}`);
      }
      return healed;
    } catch (healingError) {
      console.error('Healing attempt failed:', healingError);
      return false;
    }
  }

  // Register common healing strategies
  initializeCommonStrategies(): void {
    // Network error - retry with backoff
    this.registerStrategy('NetworkError', async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return navigator.onLine;
    });

    // Timeout error - increase timeout and retry
    this.registerStrategy('TimeoutError', async () => {
      // Could implement timeout increase logic
      return false;
    });

    // Storage error - clear and retry
    this.registerStrategy('QuotaExceededError', async () => {
      try {
        localStorage.clear();
        sessionStorage.clear();
        return true;
      } catch {
        return false;
      }
    });
  }
}

export const selfHealingSystem = new SelfHealingSystem();
selfHealingSystem.initializeCommonStrategies();

