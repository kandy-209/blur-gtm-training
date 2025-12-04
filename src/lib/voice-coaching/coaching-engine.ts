/**
 * Coaching Engine
 * Analyzes voice metrics and generates coaching feedback
 */

import type { VoiceMetrics, CoachingRule, FeedbackMessage, CoachingSuggestion } from './types';
import { DEFAULT_TARGET_METRICS } from './types';

export class CoachingEngine {
  private rules: CoachingRule[];
  private activeFeedback: Map<string, FeedbackMessage> = new Map();
  private feedbackHistory: FeedbackMessage[] = [];
  
  constructor(customRules?: CoachingRule[]) {
    this.rules = customRules || this.getDefaultRules();
  }
  
  /**
   * Analyze metrics and generate feedback
   */
  analyzeMetrics(metrics: VoiceMetrics): FeedbackMessage[] {
    const feedback: FeedbackMessage[] = [];
    const now = Date.now();
    
    for (const rule of this.rules) {
      const metricValue = metrics[rule.metric];
      
      if (rule.condition(metricValue)) {
        const message: FeedbackMessage = {
          id: `${rule.metric}-${now}-${Math.random().toString(36).substr(2, 9)}`,
          type: rule.severity === 'critical' ? 'critical' : 
                rule.severity === 'warning' ? 'warning' : 'info',
          message: rule.message,
          metric: rule.metric,
          currentValue: metricValue,
          targetValue: rule.targetRange 
            ? (rule.targetRange.min + rule.targetRange.max) / 2 
            : undefined,
          priority: rule.priority,
          timestamp: now
        };
        
        // Only show if not already showing similar feedback
        const existingKey = `${rule.metric}-${rule.severity}`;
        const existingFeedback = this.activeFeedback.get(existingKey);
        
        if (!existingFeedback || 
            (now - existingFeedback.timestamp > 10000)) { // 10 second cooldown
          feedback.push(message);
          this.activeFeedback.set(existingKey, message);
          this.feedbackHistory.push(message);
        }
      }
    }
    
    // Clean up old active feedback
    this.cleanupOldFeedback(now);
    
    // Sort by priority
    return feedback.sort((a, b) => b.priority - a.priority);
  }
  
  /**
   * Generate coaching suggestions based on metrics
   */
  generateSuggestions(metrics: VoiceMetrics): CoachingSuggestion[] {
    const suggestions: CoachingSuggestion[] = [];
    const now = Date.now();
    
    // Pace suggestions
    if (metrics.pace < DEFAULT_TARGET_METRICS.pace.min) {
      suggestions.push({
        id: `suggestion-pace-slow-${now}`,
        title: 'Increase Your Speaking Pace',
        description: 'You\'re speaking slower than optimal. Try to maintain 140-180 words per minute for better engagement.',
        metric: 'pace',
        improvement: `Current: ${metrics.pace} WPM | Target: ${DEFAULT_TARGET_METRICS.pace.min}-${DEFAULT_TARGET_METRICS.pace.max} WPM`,
        priority: 2,
        timestamp: now
      });
    } else if (metrics.pace > DEFAULT_TARGET_METRICS.pace.max) {
      suggestions.push({
        id: `suggestion-pace-fast-${now}`,
        title: 'Slow Down Your Speaking Pace',
        description: 'You\'re speaking too fast. Slow down to help the prospect understand your message.',
        metric: 'pace',
        improvement: `Current: ${metrics.pace} WPM | Target: ${DEFAULT_TARGET_METRICS.pace.min}-${DEFAULT_TARGET_METRICS.pace.max} WPM`,
        priority: 1,
        timestamp: now
      });
    }
    
    // Volume suggestions
    if (metrics.volume < DEFAULT_TARGET_METRICS.volume.min) {
      suggestions.push({
        id: `suggestion-volume-low-${now}`,
        title: 'Speak Louder',
        description: 'Your voice is too quiet. Speak louder to ensure the prospect can hear you clearly.',
        metric: 'volume',
        improvement: `Current: ${metrics.volume}dB | Target: ${DEFAULT_TARGET_METRICS.volume.min}-${DEFAULT_TARGET_METRICS.volume.max}dB`,
        priority: 1,
        timestamp: now
      });
    }
    
    // Confidence suggestions
    if (metrics.confidence < DEFAULT_TARGET_METRICS.confidence.min) {
      suggestions.push({
        id: `suggestion-confidence-low-${now}`,
        title: 'Improve Voice Confidence',
        description: 'Your voice shows some uncertainty. Take a deep breath and speak with more conviction.',
        metric: 'confidence',
        improvement: `Current: ${metrics.confidence}/100 | Target: ${DEFAULT_TARGET_METRICS.confidence.min}+`,
        priority: 2,
        timestamp: now
      });
    }
    
    // Clarity suggestions
    if (metrics.clarity < DEFAULT_TARGET_METRICS.clarity.min) {
      suggestions.push({
        id: `suggestion-clarity-low-${now}`,
        title: 'Improve Speech Clarity',
        description: 'Focus on enunciating clearly. Pronounce each word distinctly.',
        metric: 'clarity',
        improvement: `Current: ${metrics.clarity}/100 | Target: ${DEFAULT_TARGET_METRICS.clarity.min}+`,
        priority: 2,
        timestamp: now
      });
    }
    
    // Positive feedback
    if (this.isMetricOptimal(metrics)) {
      suggestions.push({
        id: `suggestion-positive-${now}`,
        title: 'Great Voice Delivery!',
        description: 'Your voice metrics are in the optimal range. Keep up the excellent work!',
        metric: 'pace',
        improvement: 'All metrics within target range',
        priority: 0,
        timestamp: now
      });
    }
    
    return suggestions;
  }
  
  /**
   * Check if metrics are in optimal range
   */
  private isMetricOptimal(metrics: VoiceMetrics): boolean {
    return (
      metrics.pace >= DEFAULT_TARGET_METRICS.pace.min &&
      metrics.pace <= DEFAULT_TARGET_METRICS.pace.max &&
      metrics.volume >= DEFAULT_TARGET_METRICS.volume.min &&
      metrics.volume <= DEFAULT_TARGET_METRICS.volume.max &&
      metrics.clarity >= DEFAULT_TARGET_METRICS.clarity.min &&
      metrics.confidence >= DEFAULT_TARGET_METRICS.confidence.min
    );
  }
  
  /**
   * Clean up old active feedback
   */
  private cleanupOldFeedback(now: number): void {
    const maxAge = 30000; // 30 seconds
    
    for (const [key, feedback] of this.activeFeedback.entries()) {
      if (now - feedback.timestamp > maxAge) {
        this.activeFeedback.delete(key);
      }
    }
  }
  
  /**
   * Get default coaching rules
   */
  private getDefaultRules(): CoachingRule[] {
    return [
      // Pace rules
      {
        metric: 'pace',
        condition: (wpm) => wpm > DEFAULT_TARGET_METRICS.pace.max,
        message: 'You\'re speaking too fast. Slow down to help the prospect understand.',
        severity: 'warning',
        priority: 1,
        targetRange: DEFAULT_TARGET_METRICS.pace
      },
      {
        metric: 'pace',
        condition: (wpm) => wpm < DEFAULT_TARGET_METRICS.pace.min,
        message: 'You\'re speaking slowly. Pick up the pace to maintain engagement.',
        severity: 'info',
        priority: 2,
        targetRange: DEFAULT_TARGET_METRICS.pace
      },
      
      // Volume rules
      {
        metric: 'volume',
        condition: (vol) => vol < DEFAULT_TARGET_METRICS.volume.min,
        message: 'Speak louder. Your voice is too quiet.',
        severity: 'warning',
        priority: 1,
        targetRange: DEFAULT_TARGET_METRICS.volume
      },
      {
        metric: 'volume',
        condition: (vol) => vol > DEFAULT_TARGET_METRICS.volume.max,
        message: 'Your voice is too loud. Lower your volume slightly.',
        severity: 'info',
        priority: 2,
        targetRange: DEFAULT_TARGET_METRICS.volume
      },
      
      // Confidence rules
      {
        metric: 'confidence',
        condition: (conf) => conf < DEFAULT_TARGET_METRICS.confidence.min,
        message: 'Add more confidence to your voice. Take a deep breath and speak with conviction.',
        severity: 'warning',
        priority: 2,
        targetRange: DEFAULT_TARGET_METRICS.confidence
      },
      
      // Clarity rules
      {
        metric: 'clarity',
        condition: (clar) => clar < DEFAULT_TARGET_METRICS.clarity.min,
        message: 'Focus on clear pronunciation. Enunciate each word distinctly.',
        severity: 'info',
        priority: 2,
        targetRange: DEFAULT_TARGET_METRICS.clarity
      },
      
      // Positive feedback
      {
        metric: 'pace',
        condition: (wpm) => wpm >= DEFAULT_TARGET_METRICS.pace.min && wpm <= DEFAULT_TARGET_METRICS.pace.max,
        message: 'Great pace! You\'re speaking at an optimal speed.',
        severity: 'info',
        priority: 0,
        targetRange: DEFAULT_TARGET_METRICS.pace
      }
    ];
  }
  
  /**
   * Get feedback history
   */
  getFeedbackHistory(): FeedbackMessage[] {
    return this.feedbackHistory;
  }
  
  /**
   * Clear feedback history
   */
  clearHistory(): void {
    this.feedbackHistory = [];
    this.activeFeedback.clear();
  }
  
  /**
   * Add custom rule
   */
  addRule(rule: CoachingRule): void {
    this.rules.push(rule);
  }
  
  /**
   * Remove rule by metric and condition
   */
  removeRule(metric: keyof VoiceMetrics, condition: (value: number) => boolean): void {
    this.rules = this.rules.filter(
      rule => !(rule.metric === metric && rule.condition.toString() === condition.toString())
    );
  }
}

