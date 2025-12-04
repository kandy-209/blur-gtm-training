/**
 * User Model & Impact Tracking
 * Tracks user improvement over time and provides personalized feedback
 */

import type { VoiceMetrics, FeedbackMessage, CoachingSuggestion } from './types';

export interface UserVoiceProfile {
  userId: string;
  baselineMetrics: VoiceMetrics;
  currentMetrics: VoiceMetrics;
  improvementTrend: ImprovementTrend;
  sessionsCompleted: number;
  totalPracticeTime: number; // milliseconds
  lastSessionDate: Date;
  strengths: string[];
  areasForImprovement: string[];
  impactScore: ImpactScore;
}

export interface ImprovementTrend {
  pace: TrendData;
  pitch: TrendData;
  volume: TrendData;
  pauses: TrendData;
  clarity: TrendData;
  confidence: TrendData;
}

export interface TrendData {
  baseline: number;
  current: number;
  change: number; // percentage change
  trend: 'improving' | 'declining' | 'stable';
  sessions: Array<{ date: Date; value: number }>;
}

export interface ImpactScore {
  immediate: number; // 0-100
  midTerm: number; // 0-100
  longTerm: number; // 0-100
  overall: number; // 0-100
}

export interface ImpactAnalysis {
  immediateImpact: {
    score: number;
    description: string;
    improvements: string[];
  };
  midTermImpact: {
    score: number;
    description: string;
    projectedImprovements: string[];
    timeframe: string;
  };
  longTermImpact: {
    score: number;
    description: string;
    careerBenefits: string[];
    timeframe: string;
  };
  recommendations: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    expectedImpact: string;
    timeframe: string;
  }[];
}

export class UserVoiceModel {
  private userId: string;
  private sessions: Array<{
    date: Date;
    metrics: VoiceMetrics;
    feedback: FeedbackMessage[];
    suggestions: CoachingSuggestion[];
  }> = [];

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Add a session to the user model
   */
  addSession(
    metrics: VoiceMetrics,
    feedback: FeedbackMessage[],
    suggestions: CoachingSuggestion[]
  ): void {
    this.sessions.push({
      date: new Date(),
      metrics,
      feedback,
      suggestions,
    });
  }

  /**
   * Get user voice profile
   */
  getUserProfile(): UserVoiceProfile {
    if (this.sessions.length === 0) {
      throw new Error('No sessions available');
    }

    const baseline = this.sessions[0].metrics;
    const current = this.sessions[this.sessions.length - 1].metrics;
    const trend = this.calculateTrend();
    const impactScore = this.calculateImpactScore();

    return {
      userId: this.userId,
      baselineMetrics: baseline,
      currentMetrics: current,
      improvementTrend: trend,
      sessionsCompleted: this.sessions.length,
      totalPracticeTime: this.calculateTotalPracticeTime(),
      lastSessionDate: this.sessions[this.sessions.length - 1].date,
      strengths: this.identifyStrengths(current),
      areasForImprovement: this.identifyImprovementAreas(current, trend),
      impactScore,
    };
  }

  /**
   * Calculate improvement trend
   */
  private calculateTrend(): ImprovementTrend {
    const baseline = this.sessions[0].metrics;
    const recent = this.sessions.slice(-5); // Last 5 sessions

    const calculateTrend = (metric: keyof VoiceMetrics): TrendData => {
      const baselineValue = baseline[metric];
      const currentValue = recent[recent.length - 1]?.metrics[metric] || baselineValue;
      const change = ((currentValue - baselineValue) / baselineValue) * 100;

      const values = recent.map(s => ({
        date: s.date,
        value: s.metrics[metric],
      }));

      // Determine trend direction
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (recent.length >= 3) {
        const first = recent[0].metrics[metric];
        const last = recent[recent.length - 1].metrics[metric];
        const diff = last - first;
        const threshold = Math.abs(first * 0.05); // 5% threshold

        if (diff > threshold) trend = 'improving';
        else if (diff < -threshold) trend = 'declining';
      }

      return {
        baseline: baselineValue,
        current: currentValue,
        change,
        trend,
        sessions: values,
      };
    };

    return {
      pace: calculateTrend('pace'),
      pitch: calculateTrend('pitch'),
      volume: calculateTrend('volume'),
      pauses: calculateTrend('pauses'),
      clarity: calculateTrend('clarity'),
      confidence: calculateTrend('confidence'),
    };
  }

  /**
   * Calculate impact scores
   */
  private calculateImpactScore(): ImpactScore {
    const trend = this.calculateTrend();
    const sessions = this.sessions.length;

    // Immediate impact (based on current session improvements)
    const immediate = this.calculateImmediateImpact(trend);

    // Mid-term impact (based on recent trend over 5-10 sessions)
    const midTerm = this.calculateMidTermImpact(trend, sessions);

    // Long-term impact (based on overall improvement and consistency)
    const longTerm = this.calculateLongTermImpact(trend, sessions);

    // Overall score (weighted average)
    const overall = (immediate * 0.2 + midTerm * 0.3 + longTerm * 0.5);

    return {
      immediate: Math.round(immediate),
      midTerm: Math.round(midTerm),
      longTerm: Math.round(longTerm),
      overall: Math.round(overall),
    };
  }

  /**
   * Calculate immediate impact score
   */
  private calculateImmediateImpact(trend: ImprovementTrend): number {
    // Based on how close metrics are to optimal ranges
    const optimalRanges = {
      pace: { min: 140, max: 180 },
      volume: { min: -18, max: -6 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
    };

    let score = 0;
    let count = 0;

    Object.entries(optimalRanges).forEach(([metric, range]) => {
      const value = trend[metric as keyof ImprovementTrend].current;
      if (value >= range.min && value <= range.max) {
        score += 100;
      } else {
        // Calculate distance from optimal range
        const distance = value < range.min 
          ? range.min - value 
          : value - range.max;
        const maxDistance = range.max - range.min;
        score += Math.max(0, 100 - (distance / maxDistance) * 100);
      }
      count++;
    });

    return count > 0 ? score / count : 0;
  }

  /**
   * Calculate mid-term impact score
   */
  private calculateMidTermImpact(trend: ImprovementTrend, sessions: number): number {
    if (sessions < 3) return 0;

    // Based on improvement trend over recent sessions
    let improvingCount = 0;
    let totalMetrics = 0;

    Object.values(trend).forEach(metricTrend => {
      if (metricTrend.trend === 'improving') improvingCount++;
      totalMetrics++;
    });

    const improvementRate = totalMetrics > 0 ? (improvingCount / totalMetrics) * 100 : 0;
    const consistencyBonus = sessions >= 5 ? 20 : sessions >= 3 ? 10 : 0;

    return Math.min(100, improvementRate + consistencyBonus);
  }

  /**
   * Calculate long-term impact score
   */
  private calculateLongTermImpact(trend: ImprovementTrend, sessions: number): number {
    if (sessions < 5) return 0;

    // Based on overall improvement and consistency
    let totalImprovement = 0;
    let improvingMetrics = 0;

    Object.values(trend).forEach(metricTrend => {
      if (metricTrend.change > 0) {
        totalImprovement += metricTrend.change;
        improvingMetrics++;
      }
    });

    const avgImprovement = improvingMetrics > 0 ? totalImprovement / improvingMetrics : 0;
    const consistencyScore = sessions >= 10 ? 30 : sessions >= 5 ? 15 : 0;
    const improvementScore = Math.min(70, avgImprovement * 2); // Scale improvement

    return Math.min(100, improvementScore + consistencyScore);
  }

  /**
   * Generate impact analysis
   */
  generateImpactAnalysis(): ImpactAnalysis {
    const profile = this.getUserProfile();
    const trend = profile.improvementTrend;

    return {
      immediateImpact: {
        score: profile.impactScore.immediate,
        description: this.getImmediateImpactDescription(profile),
        improvements: this.getImmediateImprovements(profile),
      },
      midTermImpact: {
        score: profile.impactScore.midTerm,
        description: this.getMidTermImpactDescription(profile, trend),
        projectedImprovements: this.getProjectedImprovements(trend),
        timeframe: '2-4 weeks',
      },
      longTermImpact: {
        score: profile.impactScore.longTerm,
        description: this.getLongTermImpactDescription(profile),
        careerBenefits: this.getCareerBenefits(profile),
        timeframe: '3-6 months',
      },
      recommendations: this.generateRecommendations(profile, trend),
    };
  }

  /**
   * Get personalized recommendations
   */
  private generateRecommendations(
    profile: UserVoiceProfile,
    trend: ImprovementTrend
  ): ImpactAnalysis['recommendations'] {
    const recommendations: ImpactAnalysis['recommendations'] = [];

    // High priority: Metrics declining or significantly below optimal
    Object.entries(trend).forEach(([metric, data]) => {
      if (data.trend === 'declining') {
        recommendations.push({
          priority: 'high',
          action: `Focus on improving ${metric}. Your ${metric} has been declining.`,
          expectedImpact: 'Prevent further decline and restore optimal performance',
          timeframe: '1-2 weeks',
        });
      } else if (this.isMetricBelowOptimal(metric, data.current)) {
        recommendations.push({
          priority: 'high',
          action: `Work on ${metric} improvement. Current value is below optimal range.`,
          expectedImpact: 'Immediate improvement in voice delivery quality',
          timeframe: '1-2 weeks',
        });
      }
    });

    // Medium priority: Stable but could improve
    Object.entries(trend).forEach(([metric, data]) => {
      if (data.trend === 'stable' && !this.isMetricOptimal(metric, data.current)) {
        recommendations.push({
          priority: 'medium',
          action: `Enhance ${metric} to reach optimal range`,
          expectedImpact: 'Gradual improvement in overall voice quality',
          timeframe: '2-4 weeks',
        });
      }
    });

    // Low priority: Already optimal, maintain
    profile.strengths.forEach(strength => {
      recommendations.push({
        priority: 'low',
        action: `Maintain excellent ${strength} performance`,
        expectedImpact: 'Sustain current high-quality delivery',
        timeframe: 'Ongoing',
      });
    });

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  private isMetricBelowOptimal(metric: string, value: number): boolean {
    const optimalRanges: Record<string, { min: number; max: number }> = {
      pace: { min: 140, max: 180 },
      volume: { min: -18, max: -6 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
    };

    const range = optimalRanges[metric];
    if (!range) return false;
    return value < range.min || value > range.max;
  }

  private isMetricOptimal(metric: string, value: number): boolean {
    const optimalRanges: Record<string, { min: number; max: number }> = {
      pace: { min: 140, max: 180 },
      volume: { min: -18, max: -6 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
    };

    const range = optimalRanges[metric];
    if (!range) return true;
    return value >= range.min && value <= range.max;
  }

  private identifyStrengths(metrics: VoiceMetrics): string[] {
    const strengths: string[] = [];
    const optimalRanges = {
      pace: { min: 140, max: 180 },
      volume: { min: -18, max: -6 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
    };

    Object.entries(optimalRanges).forEach(([metric, range]) => {
      const value = metrics[metric as keyof VoiceMetrics];
      if (value >= range.min && value <= range.max) {
        strengths.push(metric);
      }
    });

    return strengths;
  }

  private identifyImprovementAreas(
    metrics: VoiceMetrics,
    trend: ImprovementTrend
  ): string[] {
    const areas: string[] = [];

    Object.entries(trend).forEach(([metric, data]) => {
      if (data.trend === 'declining' || !this.isMetricOptimal(metric, data.current)) {
        areas.push(metric);
      }
    });

    return areas;
  }

  private calculateTotalPracticeTime(): number {
    if (this.sessions.length === 0) return 0;
    
    // Estimate 5 minutes per session (can be improved with actual duration tracking)
    return this.sessions.length * 5 * 60 * 1000;
  }

  private getImmediateImpactDescription(profile: UserVoiceProfile): string {
    const score = profile.impactScore.immediate;
    if (score >= 80) {
      return 'Excellent immediate performance! Your voice metrics are in the optimal range.';
    } else if (score >= 60) {
      return 'Good immediate performance with room for improvement in some areas.';
    } else {
      return 'Focus needed on immediate improvements to reach optimal voice delivery.';
    }
  }

  private getImmediateImprovements(profile: UserVoiceProfile): string[] {
    return profile.areasForImprovement.slice(0, 3).map(area => 
      `Improve ${area} to reach optimal range`
    );
  }

  private getMidTermImpactDescription(
    profile: UserVoiceProfile,
    trend: ImprovementTrend
  ): string {
    const improvingCount = Object.values(trend).filter(t => t.trend === 'improving').length;
    
    if (improvingCount >= 4) {
      return 'Strong improvement trajectory! Multiple metrics showing consistent improvement.';
    } else if (improvingCount >= 2) {
      return 'Moderate improvement in some areas. Continue practicing for better results.';
    } else {
      return 'Limited improvement detected. Consider focusing on specific areas.';
    }
  }

  private getProjectedImprovements(trend: ImprovementTrend): string[] {
    const improvements: string[] = [];
    
    Object.entries(trend).forEach(([metric, data]) => {
      if (data.trend === 'improving' && data.change > 5) {
        improvements.push(
          `${metric} improving by ${Math.round(data.change)}% - continue current practice`
        );
      }
    });

    return improvements.slice(0, 3);
  }

  private getLongTermImpactDescription(profile: UserVoiceProfile): string {
    const score = profile.impactScore.longTerm;
    
    if (score >= 80) {
      return 'Outstanding long-term trajectory! Consistent improvement indicates strong potential for career advancement.';
    } else if (score >= 60) {
      return 'Positive long-term trend. Continued practice will yield significant career benefits.';
    } else {
      return 'Long-term impact requires more consistent practice and focused improvement.';
    }
  }

  private getCareerBenefits(profile: UserVoiceProfile): string[] {
    const benefits: string[] = [];
    const score = profile.impactScore.longTerm;

    if (score >= 80) {
      benefits.push('Enhanced executive presence and leadership communication');
      benefits.push('Increased confidence in high-stakes presentations');
      benefits.push('Better client relationship building through improved voice delivery');
    } else if (score >= 60) {
      benefits.push('Improved sales call effectiveness');
      benefits.push('Better team communication and collaboration');
    } else {
      benefits.push('Foundation for voice communication improvement');
      benefits.push('Building blocks for professional development');
    }

    return benefits;
  }
}

