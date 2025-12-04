/**
 * Audio Analyzer
 * Main class for real-time voice analysis using Web Audio API
 */

import { PaceTracker } from './pace-tracker';
import { PitchDetector } from './pitch-detector';
import { VolumeMeter } from './volume-meter';
import { PauseDetector } from './pause-detector';
import type { VoiceMetrics, VoiceCoachingConfig } from './types';

export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;
  private animationFrameId: number | null = null;
  
  // Trackers
  private paceTracker: PaceTracker;
  private pitchDetector: PitchDetector | null = null;
  private volumeMeter: VolumeMeter | null = null;
  private pauseDetector: PauseDetector | null = null;
  
  // Configuration
  private config: VoiceCoachingConfig;
  private onMetricsUpdate?: (metrics: VoiceMetrics) => void;
  private conversationId: string;
  private userId?: string;
  
  constructor(
    conversationId: string,
    userId?: string,
    config?: Partial<VoiceCoachingConfig>,
    onMetricsUpdate?: (metrics: VoiceMetrics) => void
  ) {
    this.conversationId = conversationId;
    this.userId = userId;
    this.config = {
      enabled: true,
      updateInterval: 200, // Update every 200ms
      feedbackEnabled: true,
      benchmarkComparison: false,
      targetMetrics: {},
      ...config
    };
    this.onMetricsUpdate = onMetricsUpdate;
    this.paceTracker = new PaceTracker();
  }
  
  /**
   * Start audio analysis
   */
  async startAnalysis(): Promise<void> {
    try {
      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser. Please use Chrome, Firefox, or Edge.');
      }

      // Check if AudioContext is available
      if (typeof AudioContext === 'undefined' && typeof (window as any).webkitAudioContext === 'undefined') {
        throw new Error('Web Audio API is not supported in this browser.');
      }

      // Get user media stream with better error handling
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            sampleRate: 44100
          }
        });
      } catch (mediaError: any) {
        // Provide specific error messages based on error type
        if (mediaError.name === 'NotAllowedError' || mediaError.name === 'PermissionDeniedError') {
          throw new Error('Microphone permission denied. Please allow microphone access in your browser settings and try again.');
        } else if (mediaError.name === 'NotFoundError' || mediaError.name === 'DevicesNotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else if (mediaError.name === 'NotReadableError' || mediaError.name === 'TrackStartError') {
          throw new Error('Microphone is already in use by another application. Please close other apps using the microphone.');
        } else if (mediaError.name === 'OverconstrainedError') {
          throw new Error('Microphone does not support the required settings. Please try a different microphone.');
        } else {
          throw new Error(`Microphone access failed: ${mediaError.message || mediaError.name}. Please check your browser settings.`);
        }
      }
      
      // Create audio context with fallback for Safari
      try {
        const AudioContextClass = AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass({
          sampleRate: 44100,
          latencyHint: 'interactive'
        });
      } catch (contextError: any) {
        throw new Error(`Failed to create audio context: ${contextError.message}. Please try refreshing the page.`);
      }
      
      // Resume audio context if suspended (required for some browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
      
      // Create analyser node
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Connect microphone to analyser
      this.microphone = this.audioContext.createMediaStreamSource(this.stream);
      this.microphone.connect(this.analyser);
      
      // Initialize trackers
      this.pitchDetector = new PitchDetector(this.analyser, this.audioContext);
      this.volumeMeter = new VolumeMeter(this.analyser);
      this.pauseDetector = new PauseDetector(this.analyser);
      
      // Start pace tracking
      this.paceTracker.start();
      
      // Start analysis loop
      this.analyze();
      
      console.log('Audio analysis started successfully');
    } catch (error) {
      console.error('Failed to start audio analysis:', error);
      // Re-throw with the specific error message
      throw error instanceof Error ? error : new Error('Failed to access microphone. Please check permissions.');
    }
  }
  
  /**
   * Main analysis loop
   */
  private analyze(): void {
    if (!this.analyser || !this.config.enabled) return;
    
    try {
      // Detect pause
      if (this.pauseDetector) {
        this.pauseDetector.detectPause();
      }
      
      // Calculate metrics
      const metrics: VoiceMetrics = {
        pace: this.paceTracker.getCurrentWPM(),
        pitch: this.pitchDetector?.getPitch() || 0,
        volume: this.volumeMeter?.getRMS() || -60,
        pauses: this.pauseDetector?.getPausesPerMinute() || 0,
        clarity: this.calculateClarity(),
        confidence: this.calculateConfidence(),
        timestamp: Date.now()
      };
      
      // Emit metrics update
      if (this.onMetricsUpdate) {
        this.onMetricsUpdate(metrics);
      }
      
      // Schedule next analysis
      this.animationFrameId = requestAnimationFrame(() => this.analyze());
    } catch (error) {
      console.error('Error in analysis loop:', error);
      // Continue analysis even if one iteration fails
      this.animationFrameId = requestAnimationFrame(() => this.analyze());
    }
  }
  
  /**
   * Calculate clarity score (0-100)
   * Based on formant analysis and spectral clarity
   */
  private calculateClarity(): number {
    if (!this.analyser) return 0;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Calculate spectral centroid (brightness)
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < bufferLength; i++) {
      const magnitude = dataArray[i];
      weightedSum += i * magnitude;
      magnitudeSum += magnitude;
    }
    
    const centroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
    
    // Normalize to 0-100 (higher centroid = clearer speech)
    const clarity = Math.min(100, Math.max(0, (centroid / bufferLength) * 200));
    
    return Math.round(clarity);
  }
  
  /**
   * Calculate confidence score (0-100)
   * Based on pitch stability and volume consistency
   */
  private calculateConfidence(): number {
    if (!this.pitchDetector || !this.volumeMeter) return 0;
    
    const pitchStability = this.pitchDetector.getPitchStability();
    const volumeStability = this.volumeMeter.getVolumeStability();
    
    // Average of pitch and volume stability
    const confidence = (pitchStability + volumeStability) / 2;
    
    return Math.round(confidence);
  }
  
  /**
   * Record words for pace tracking
   * Call this when words are detected (e.g., from speech recognition)
   */
  recordWords(count: number): void {
    this.paceTracker.recordWords(count);
  }
  
  /**
   * Stop audio analysis
   */
  stopAnalysis(): void {
    // Cancel animation frame
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    // Stop trackers
    this.paceTracker.stop();
    
    // Stop microphone stream
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    // Disconnect audio nodes
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    
    // Close audio context
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.pitchDetector = null;
    this.volumeMeter = null;
    this.pauseDetector = null;
    
    console.log('Audio analysis stopped');
  }
  
  /**
   * Get current metrics snapshot
   */
  getCurrentMetrics(): VoiceMetrics | null {
    if (!this.analyser) return null;
    
    return {
      pace: this.paceTracker.getCurrentWPM(),
      pitch: this.pitchDetector?.getPitch() || 0,
      volume: this.volumeMeter?.getRMS() || -60,
      pauses: this.pauseDetector?.getPausesPerMinute() || 0,
      clarity: this.calculateClarity(),
      confidence: this.calculateConfidence(),
      timestamp: Date.now()
    };
  }
  
  /**
   * Update configuration
   */
  updateConfig(config: Partial<VoiceCoachingConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Check if analysis is active
   */
  isActive(): boolean {
    return this.analyser !== null && this.config.enabled;
  }
}

