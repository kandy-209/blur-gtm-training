/**
 * Pitch Detector
 * Detects fundamental frequency (pitch) of voice using autocorrelation
 */

export class PitchDetector {
  private analyser: AnalyserNode;
  private audioContext: AudioContext;
  private pitchHistory: number[] = [];
  private readonly sampleRate: number;
  private readonly minPitch: number = 50; // Hz
  private readonly maxPitch: number = 500; // Hz
  
  constructor(analyser: AnalyserNode, audioContext: AudioContext) {
    this.analyser = analyser;
    this.audioContext = audioContext;
    this.sampleRate = audioContext.sampleRate;
  }
  
  /**
   * Get current pitch using autocorrelation method
   */
  getPitch(): number {
    const bufferLength = this.analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(dataArray);
    
    // Use autocorrelation to find pitch
    const pitch = this.autocorrelationPitch(dataArray);
    
    // Validate pitch range
    if (pitch && pitch >= this.minPitch && pitch <= this.maxPitch) {
      this.pitchHistory.push(pitch);
      // Keep only last 100 samples
      if (this.pitchHistory.length > 100) {
        this.pitchHistory.shift();
      }
      return Math.round(pitch);
    }
    
    // Return average if current detection is invalid
    return this.getAveragePitch();
  }
  
  /**
   * Autocorrelation-based pitch detection
   */
  private autocorrelationPitch(buffer: Float32Array): number {
    const minPeriod = Math.floor(this.sampleRate / this.maxPitch);
    const maxPeriod = Math.floor(this.sampleRate / this.minPitch);
    
    let maxCorrelation = 0;
    let bestPeriod = 0;
    
    // Calculate autocorrelation for different periods
    for (let period = minPeriod; period < maxPeriod && period < buffer.length / 2; period++) {
      let correlation = 0;
      
      for (let i = 0; i < buffer.length - period; i++) {
        correlation += buffer[i] * buffer[i + period];
      }
      
      // Normalize by period length
      correlation = correlation / (buffer.length - period);
      
      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }
    
    if (bestPeriod === 0) return 0;
    
    // Convert period to frequency
    const pitch = this.sampleRate / bestPeriod;
    return pitch;
  }
  
  /**
   * Get average pitch over recent history
   */
  getAveragePitch(): number {
    if (this.pitchHistory.length === 0) return 0;
    
    const sum = this.pitchHistory.reduce((a, b) => a + b, 0);
    return Math.round(sum / this.pitchHistory.length);
  }
  
  /**
   * Get pitch stability score (0-100)
   * Lower variance = higher stability = higher score
   */
  getPitchStability(): number {
    if (this.pitchHistory.length < 10) return 0;
    
    const mean = this.getAveragePitch();
    const variance = this.pitchHistory.reduce((sum, pitch) => {
      return sum + Math.pow(pitch - mean, 2);
    }, 0) / this.pitchHistory.length;
    
    // Convert variance to stability score (0-100)
    // Lower variance = higher stability
    const stability = Math.max(0, 100 - (variance / 10));
    return Math.round(stability);
  }
  
  /**
   * Get pitch range (min, max, average)
   */
  getPitchRange(): { min: number; max: number; average: number } {
    if (this.pitchHistory.length === 0) {
      return { min: 0, max: 0, average: 0 };
    }
    
    const min = Math.min(...this.pitchHistory);
    const max = Math.max(...this.pitchHistory);
    const average = this.getAveragePitch();
    
    return { min, max, average };
  }
  
  /**
   * Reset pitch history
   */
  reset(): void {
    this.pitchHistory = [];
  }
}

