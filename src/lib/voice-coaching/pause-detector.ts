/**
 * Pause Detector
 * Detects pauses and silence gaps in speech
 */

export class PauseDetector {
  private analyser: AnalyserNode;
  private pauseThreshold: number = 0.01; // RMS threshold for silence
  private minPauseDuration: number = 300; // Minimum pause duration in ms (300ms = 0.3s)
  private pauseHistory: Array<{ start: number; end: number; duration: number }> = [];
  private isInPause: boolean = false;
  private pauseStartTime: number = 0;
  private lastSpeechTime: number = 0;
  
  constructor(analyser: AnalyserNode) {
    this.analyser = analyser;
  }
  
  /**
   * Detect if currently in a pause
   */
  detectPause(): boolean {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = dataArray[i] / 255;
      sum += normalized * normalized;
    }
    
    const rms = Math.sqrt(sum / bufferLength);
    const isSilent = rms < this.pauseThreshold;
    const now = Date.now();
    
    if (isSilent && !this.isInPause) {
      // Start of pause
      this.isInPause = true;
      this.pauseStartTime = now;
    } else if (!isSilent && this.isInPause) {
      // End of pause
      const pauseDuration = now - this.pauseStartTime;
      
      if (pauseDuration >= this.minPauseDuration) {
        this.pauseHistory.push({
          start: this.pauseStartTime,
          end: now,
          duration: pauseDuration
        });
      }
      
      this.isInPause = false;
      this.lastSpeechTime = now;
    } else if (!isSilent) {
      this.lastSpeechTime = now;
    }
    
    return this.isInPause;
  }
  
  /**
   * Get pause count in a time window (default: last minute)
   */
  getPauseCount(windowSeconds: number = 60): number {
    const windowStart = Date.now() - (windowSeconds * 1000);
    return this.pauseHistory.filter(pause => pause.start >= windowStart).length;
  }
  
  /**
   * Get average pause duration
   */
  getAveragePauseDuration(windowSeconds: number = 60): number {
    const windowStart = Date.now() - (windowSeconds * 1000);
    const recentPauses = this.pauseHistory.filter(pause => pause.start >= windowStart);
    
    if (recentPauses.length === 0) return 0;
    
    const totalDuration = recentPauses.reduce((sum, pause) => sum + pause.duration, 0);
    return Math.round(totalDuration / recentPauses.length);
  }
  
  /**
   * Get pauses per minute
   */
  getPausesPerMinute(): number {
    return this.getPauseCount(60);
  }
  
  /**
   * Get current pause duration (if in pause)
   */
  getCurrentPauseDuration(): number {
    if (!this.isInPause) return 0;
    return Date.now() - this.pauseStartTime;
  }
  
  /**
   * Check if current pause is too long (e.g., > 3 seconds)
   */
  isPauseTooLong(maxDuration: number = 3000): boolean {
    if (!this.isInPause) return false;
    return this.getCurrentPauseDuration() > maxDuration;
  }
  
  /**
   * Reset pause detection
   */
  reset(): void {
    this.pauseHistory = [];
    this.isInPause = false;
    this.pauseStartTime = 0;
    this.lastSpeechTime = Date.now();
  }
  
  /**
   * Get pause statistics
   */
  getStats(): {
    totalPauses: number;
    pausesPerMinute: number;
    averageDuration: number;
    currentPauseDuration: number;
    isInPause: boolean;
  } {
    return {
      totalPauses: this.pauseHistory.length,
      pausesPerMinute: this.getPausesPerMinute(),
      averageDuration: this.getAveragePauseDuration(60),
      currentPauseDuration: this.getCurrentPauseDuration(),
      isInPause: this.isInPause
    };
  }
}

