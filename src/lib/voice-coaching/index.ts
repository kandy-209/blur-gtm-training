/**
 * Voice Coaching Module
 * Exports all voice coaching functionality
 */

export { AudioAnalyzer } from './audio-analyzer';
export { PaceTracker } from './pace-tracker';
export { PitchDetector } from './pitch-detector';
export { VolumeMeter } from './volume-meter';
export { PauseDetector } from './pause-detector';
export { CoachingEngine } from './coaching-engine';

export type {
  VoiceMetrics,
  VoiceMetricsSnapshot,
  CoachingRule,
  FeedbackMessage,
  CoachingSuggestion,
  VoiceBenchmark,
  VoiceCoachingConfig
} from './types';

export { DEFAULT_TARGET_METRICS } from './types';

