/**
 * Pace Tracker
 * Tracks speaking pace (words per minute) in real-time
 */

export class PaceTracker {
  private wordCount: number = 0;
  private startTime: number = 0;
  private wordTimestamps: number[] = [];
  private isActive: boolean = false;
  
  /**
   * Start tracking pace
   */
  start(): void {
    this.wordCount = 0;
    this.startTime = Date.now();
    this.wordTimestamps = [];
    this.isActive = true;
  }
  
  /**
   * Stop tracking pace
   */
  stop(): void {
    this.isActive = false;
  }
  
  /**
   * Record a word (called when word is detected via speech recognition)
   */
  recordWord(): void {
    if (!this.isActive) return;
    this.wordCount++;
    this.wordTimestamps.push(Date.now());
  }
  
  /**
   * Record multiple words at once
   */
  recordWords(count: number): void {
    if (!this.isActive) return;
    const now = Date.now();
    for (let i = 0; i < count; i++) {
      this.wordCount++;
      this.wordTimestamps.push(now);
    }
  }
  
  /**
   * Get current words per minute
   */
  getCurrentWPM(): number {
    if (!this.isActive || this.wordCount === 0) return 0;
    
    const durationMinutes = (Date.now() - this.startTime) / 60000;
    if (durationMinutes <= 0) return 0;
    
    return Math.round(this.wordCount / durationMinutes);
  }
  
  /**
   * Get average pace over a specific time window (default: last 30 seconds)
   */
  getAveragePace(windowSeconds: number = 30): number {
    if (!this.isActive || this.wordTimestamps.length === 0) return 0;
    
    const windowStart = Date.now() - (windowSeconds * 1000);
    const recentWords = this.wordTimestamps.filter(ts => ts >= windowStart);
    
    if (recentWords.length === 0) return 0;
    
    const durationMinutes = windowSeconds / 60;
    return Math.round(recentWords.length / durationMinutes);
  }
  
  /**
   * Get pace trend (increasing, decreasing, stable)
   */
  getPaceTrend(): 'increasing' | 'decreasing' | 'stable' {
    if (this.wordTimestamps.length < 10) return 'stable';
    
    const recent30s = this.getAveragePace(30);
    const recent10s = this.getAveragePace(10);
    
    const difference = recent10s - recent30s;
    const threshold = 10; // WPM difference threshold
    
    if (difference > threshold) return 'increasing';
    if (difference < -threshold) return 'decreasing';
    return 'stable';
  }
  
  /**
   * Reset tracker
   */
  reset(): void {
    this.wordCount = 0;
    this.startTime = Date.now();
    this.wordTimestamps = [];
  }
  
  /**
   * Get statistics
   */
  getStats(): {
    totalWords: number;
    currentWPM: number;
    averageWPM: number;
    trend: 'increasing' | 'decreasing' | 'stable';
    duration: number;
  } {
    return {
      totalWords: this.wordCount,
      currentWPM: this.getCurrentWPM(),
      averageWPM: this.getAveragePace(30),
      trend: this.getPaceTrend(),
      duration: this.isActive ? Date.now() - this.startTime : 0
    };
  }
}

