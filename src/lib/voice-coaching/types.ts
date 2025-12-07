/**
 * Voice Coaching Types
 * Type definitions for voice coaching and analysis
 */

export interface VoiceMetrics {
  pace: number; // Words per minute
  pitch: number; // Hertz
  volume: number; // Decibels (RMS)
  pauses: number; // Pause count
  clarity: number; // 0-100 score
  confidence: number; // 0-100 score (voice stability)
  timestamp: number;
}

export interface VoiceMetricsSnapshot extends VoiceMetrics {
  id?: string;
  conversationId: string;
  userId?: string;
  averagePace?: number;
  averagePitch?: number;
  averageVolume?: number;
}

export interface CoachingRule {
  metric: keyof VoiceMetrics;
  condition: (value: number) => boolean;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  priority: number;
  targetRange?: { min: number; max: number };
}

export interface FeedbackMessage {
  id: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  message: string;
  metric: keyof VoiceMetrics;
  currentValue: number;
  targetValue?: number;
  priority: number;
  timestamp: number;
  dismissed?: boolean;
}

export interface CoachingSuggestion {
  id: string;
  title: string;
  description: string;
  metric: keyof VoiceMetrics;
  improvement: string;
  priority: number;
  timestamp: number;
}

export interface VoiceBenchmark {
  metric: keyof VoiceMetrics;
  userAverage: number;
  topPerformerAverage: number;
  industryStandard: { min: number; max: number };
  userScore: number; // 0-100
}

export interface VoiceCoachingConfig {
  enabled: boolean;
  updateInterval: number; // milliseconds
  feedbackEnabled: boolean;
  benchmarkComparison: boolean;
  targetMetrics: Partial<Record<keyof VoiceMetrics, { min: number; max: number }>>;
}

export const DEFAULT_TARGET_METRICS: Record<keyof VoiceMetrics, { min: number; max: number }> = {
  pace: { min: 140, max: 180 },
  pitch: { min: 85, max: 255 },
  volume: { min: -18, max: -6 },
  pauses: { min: 3, max: 8 },
  clarity: { min: 70, max: 100 },
  confidence: { min: 70, max: 100 },
  timestamp: { min: 0, max: Infinity }
};

