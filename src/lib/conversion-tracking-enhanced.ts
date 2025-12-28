/**
 * Enhanced Conversion Tracking System
 * Advanced analytics with performance monitoring and error recovery
 */

import { ConversionEvent, ConversionTracker } from './conversion-tracking';

export interface EnhancedConversionMetrics {
  scenarioId: string;
  userId: string;
  conversionRate: number;
  averageTimeToConvert: number;
  dropOffPoints: string[];
  engagementScore: number;
  improvementAreas: string[];
}

export class EnhancedConversionTracker {
  /**
   * Track conversion with performance metrics
   */
  static async trackConversionWithMetrics(
    event: ConversionEvent,
    performanceMetrics?: {
      loadTime?: number;
      renderTime?: number;
      apiLatency?: number;
    }
  ): Promise<void> {
    // Track standard conversion
    ConversionTracker.trackConversion(event);

    // Add performance metrics if available
    if (performanceMetrics) {
      try {
        await fetch('/api/analytics/conversion', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...event,
            metadata: {
              ...event.metadata,
              performance: performanceMetrics,
            },
          }),
        }).catch((error) => {
          console.warn('Failed to track conversion metrics:', error);
        });
      } catch (error) {
        // Non-blocking
        console.warn('Error tracking conversion metrics:', error);
      }
    }
  }

  /**
   * Get conversion analytics for a user
   */
  static async getConversionAnalytics(
    userId: string,
    scenarioId?: string
  ): Promise<EnhancedConversionMetrics | null> {
    try {
      const response = await fetch(
        `/api/analytics/conversions?userId=${userId}${scenarioId ? `&scenarioId=${scenarioId}` : ''}`
      );
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to get conversion analytics:', error);
    }
    return null;
  }
}
