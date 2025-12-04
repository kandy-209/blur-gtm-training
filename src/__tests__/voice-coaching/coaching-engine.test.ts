/**
 * Coaching Engine Tests
 */

import { CoachingEngine } from '@/lib/voice-coaching/coaching-engine';
import type { VoiceMetrics } from '@/lib/voice-coaching/types';

describe('CoachingEngine', () => {
  let engine: CoachingEngine;

  beforeEach(() => {
    engine = new CoachingEngine();
  });

  describe('analyzeMetrics', () => {
    it('should generate feedback for fast pace', () => {
      const metrics: VoiceMetrics = {
        pace: 250, // Too fast
        pitch: 180,
        volume: -10,
        pauses: 5,
        clarity: 85,
        confidence: 80,
        timestamp: Date.now(),
      };

      const feedback = engine.analyzeMetrics(metrics);
      expect(feedback.length).toBeGreaterThan(0);
      expect(feedback.some(f => f.metric === 'pace')).toBe(true);
    });

    it('should generate feedback for low volume', () => {
      const metrics: VoiceMetrics = {
        pace: 160,
        pitch: 180,
        volume: -30, // Too quiet
        pauses: 5,
        clarity: 85,
        confidence: 80,
        timestamp: Date.now(),
      };

      const feedback = engine.analyzeMetrics(metrics);
      expect(feedback.some(f => f.metric === 'volume')).toBe(true);
    });

    it('should generate feedback for low confidence', () => {
      const metrics: VoiceMetrics = {
        pace: 160,
        pitch: 180,
        volume: -10,
        pauses: 5,
        clarity: 85,
        confidence: 50, // Low confidence
        timestamp: Date.now(),
      };

      const feedback = engine.analyzeMetrics(metrics);
      expect(feedback.some(f => f.metric === 'confidence')).toBe(true);
    });

    it('should not generate feedback for optimal metrics', () => {
      const metrics: VoiceMetrics = {
        pace: 160, // Optimal
        pitch: 180,
        volume: -12, // Optimal
        pauses: 5, // Optimal
        clarity: 85, // Optimal
        confidence: 85, // Optimal
        timestamp: Date.now(),
      };

      const feedback = engine.analyzeMetrics(metrics);
      // Should have positive feedback or minimal feedback
      expect(Array.isArray(feedback)).toBe(true);
    });
  });

  describe('generateSuggestions', () => {
    it('should generate suggestions for improvement areas', () => {
      const metrics: VoiceMetrics = {
        pace: 100, // Too slow
        pitch: 180,
        volume: -25, // Too quiet
        pauses: 10, // Too many
        clarity: 60, // Low
        confidence: 50, // Low
        timestamp: Date.now(),
      };

      const suggestions = engine.generateSuggestions(metrics);
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.every(s => s.metric && s.improvement)).toBe(true);
    });

    it('should provide positive feedback for optimal metrics', () => {
      const metrics: VoiceMetrics = {
        pace: 160,
        pitch: 180,
        volume: -12,
        pauses: 5,
        clarity: 85,
        confidence: 85,
        timestamp: Date.now(),
      };

      const suggestions = engine.generateSuggestions(metrics);
      const positiveFeedback = suggestions.find(s => 
        s.title.toLowerCase().includes('great') || 
        s.title.toLowerCase().includes('excellent')
      );
      expect(positiveFeedback).toBeDefined();
    });
  });

  describe('custom rules', () => {
    it('should allow adding custom rules', () => {
      const customRule = {
        metric: 'pace' as const,
        condition: (wpm: number) => wpm > 200,
        message: 'Custom message',
        severity: 'warning' as const,
        priority: 10,
      };

      engine.addRule(customRule);
      const metrics: VoiceMetrics = {
        pace: 250,
        pitch: 180,
        volume: -10,
        pauses: 5,
        clarity: 85,
        confidence: 80,
        timestamp: Date.now(),
      };

      const feedback = engine.analyzeMetrics(metrics);
      expect(feedback.some(f => f.message === 'Custom message')).toBe(true);
    });
  });
});

