/**
 * Volume Meter
 * Measures voice volume using RMS (Root Mean Square) amplitude
 */

export class VolumeMeter {
  private analyser: AnalyserNode;
  private volumeHistory: number[] = [];
  private readonly smoothingWindow: number = 10; // Number of samples to average
  
  constructor(analyser: AnalyserNode) {
    this.analyser = analyser;
  }
  
  /**
   * Get current RMS volume in decibels
   */
  getRMS(): number {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const normalized = (dataArray[i] / 255);
      sum += normalized * normalized;
    }
    
    const rms = Math.sqrt(sum / bufferLength);
    
    // Convert to decibels
    // RMS of 1.0 = 0dB, RMS of 0.0 = -Infinity dB
    const db = rms > 0 ? 20 * Math.log10(rms) : -Infinity;
    
    // Clamp to reasonable range (-60dB to 0dB)
    const clampedDb = Math.max(-60, Math.min(0, db));
    
    this.volumeHistory.push(clampedDb);
    if (this.volumeHistory.length > this.smoothingWindow) {
      this.volumeHistory.shift();
    }
    
    return Math.round(clampedDb * 10) / 10; // Round to 1 decimal
  }
  
  /**
   * Get average volume over recent history
   */
  getAverageVolume(): number {
    if (this.volumeHistory.length === 0) return -60;
    
    const sum = this.volumeHistory.reduce((a, b) => a + b, 0);
    return Math.round((sum / this.volumeHistory.length) * 10) / 10;
  }
  
  /**
   * Get volume level category
   */
  getVolumeLevel(): 'too-quiet' | 'quiet' | 'normal' | 'loud' | 'too-loud' {
    const volume = this.getAverageVolume();
    
    if (volume < -24) return 'too-quiet';
    if (volume < -18) return 'quiet';
    if (volume < -6) return 'normal';
    if (volume < -3) return 'loud';
    return 'too-loud';
  }
  
  /**
   * Get volume stability (0-100)
   */
  getVolumeStability(): number {
    if (this.volumeHistory.length < 5) return 0;
    
    const mean = this.getAverageVolume();
    const variance = this.volumeHistory.reduce((sum, vol) => {
      return sum + Math.pow(vol - mean, 2);
    }, 0) / this.volumeHistory.length;
    
    // Lower variance = higher stability
    const stability = Math.max(0, 100 - (variance * 10));
    return Math.round(stability);
  }
  
  /**
   * Reset volume history
   */
  reset(): void {
    this.volumeHistory = [];
  }
}

