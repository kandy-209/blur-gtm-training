/**
 * Comprehensive Data Collector
 * Collects ALL possible data points for users
 */

import { userDataPersistence } from './user-data-persistence';
import type { VoiceMetrics, FeedbackMessage, CoachingSuggestion } from './types';
import type { UserVoiceProfile, ImpactAnalysis } from './user-model';
import { FeedbackAnalyzer } from './feedback-analyzer';

export interface CompleteUserData {
  // Basic Info
  userId: string;
  exportDate: string;
  exportVersion: string;
  
  // Session Data
  sessions: CompleteSessionData[];
  totalSessions: number;
  totalPracticeTime: number; // milliseconds
  firstSessionDate: string | null;
  lastSessionDate: string | null;
  averageSessionDuration: number;
  
  // Voice Metrics - All Time
  allTimeMetrics: {
    pace: MetricStatistics;
    pitch: MetricStatistics;
    volume: MetricStatistics;
    pauses: MetricStatistics;
    clarity: MetricStatistics;
    confidence: MetricStatistics;
  };
  
  // Current State
  currentProfile: UserVoiceProfile | null;
  currentImpactAnalysis: ImpactAnalysis | null;
  currentFeedbackAnalysis: any | null;
  
  // Trends & Patterns
  improvementTrends: {
    pace: TrendData;
    pitch: TrendData;
    volume: TrendData;
    pauses: TrendData;
    clarity: TrendData;
    confidence: TrendData;
  };
  
  // Performance Patterns
  patterns: {
    consistentImprovement: string[];
    decliningMetrics: string[];
    volatileMetrics: string[];
    plateauMetrics: string[];
    rapidImprovement: string[];
  };
  
  // Frequency Analysis
  frequencyAnalysis: {
    optimalRangeFrequency: Record<string, number>; // % of time in optimal range
    issueFrequency: Record<string, number>; // % of time with issues
    improvementFrequency: Record<string, number>; // % of sessions showing improvement
  };
  
  // Consistency Metrics
  consistencyMetrics: {
    overallConsistency: number;
    metricConsistency: Record<string, number>;
    sessionToSessionVariance: number[];
  };
  
  // Practice Habits
  practiceHabits: {
    sessionsPerWeek: number;
    averageDaysBetweenSessions: number;
    longestStreak: number; // consecutive days
    currentStreak: number;
    preferredDaysOfWeek: number[]; // 0-6, Sunday-Saturday
    preferredTimeOfDay: string; // morning/afternoon/evening
    sessionFrequencyTrend: 'increasing' | 'decreasing' | 'stable';
  };
  
  // Improvement Velocity
  improvementVelocity: {
    pace: number; // WPM per week
    pitch: number; // Hz per week
    volume: number; // dB per week
    pauses: number; // pauses per week change
    clarity: number; // points per week
    confidence: number; // points per week
  };
  
  // Best & Worst Sessions
  bestSessions: SessionSummary[];
  worstSessions: SessionSummary[];
  
  // Milestones & Achievements
  milestones: Milestone[];
  achievements: Achievement[];
  
  // Feedback History
  feedbackHistory: {
    totalFeedbackMessages: number;
    feedbackByMetric: Record<string, number>;
    mostCommonFeedback: string[];
    feedbackTrends: FeedbackTrend[];
  };
  
  // Recommendations History
  recommendationsHistory: {
    totalRecommendations: number;
    recommendationsByPriority: Record<string, number>;
    implementedRecommendations: number;
    recommendationEffectiveness: Record<string, number>;
  };
  
  // Comparison Data
  comparisons: {
    vsBaseline: ComparisonData;
    vsLastWeek: ComparisonData;
    vsLastMonth: ComparisonData;
    vsPeakPerformance: ComparisonData;
  };
  
  // Predictive Analytics
  predictions: {
    nextWeekProjection: ProjectedMetrics;
    nextMonthProjection: ProjectedMetrics;
    nextQuarterProjection: ProjectedMetrics;
    goalAchievementProbability: Record<string, number>;
  };
  
  // Raw Data
  rawMetrics: RawMetricDataPoint[];
  rawFeedback: RawFeedbackDataPoint[];
  rawSuggestions: RawSuggestionDataPoint[];
  
  // Metadata
  metadata: {
    dataCollectionStartDate: string;
    dataCollectionEndDate: string;
    totalDataPoints: number;
    dataQuality: 'high' | 'medium' | 'low';
    completeness: number; // 0-100
  };
}

export interface CompleteSessionData {
  sessionId: string;
  conversationId: string;
  date: string;
  timestamp: number;
  duration: number; // milliseconds
  
  // Metrics
  metrics: VoiceMetrics;
  averageMetrics: VoiceMetrics;
  peakMetrics: VoiceMetrics;
  lowMetrics: VoiceMetrics;
  
  // Feedback
  feedback: FeedbackMessage[];
  suggestions: CoachingSuggestion[];
  
  // Context
  deviceInfo?: {
    browser?: string;
    os?: string;
    microphone?: string;
  };
  environment?: {
    timeOfDay?: string;
    dayOfWeek?: number;
  };
  
  // Analysis
  sessionScore: number; // 0-100
  improvementFromPrevious: number | null;
  issuesIdentified: string[];
  strengthsIdentified: string[];
}

export interface MetricStatistics {
  min: number;
  max: number;
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  range: number;
  q1: number; // First quartile
  q3: number; // Third quartile
  iqr: number; // Interquartile range
  percentile25: number;
  percentile50: number;
  percentile75: number;
  percentile90: number;
  percentile95: number;
  percentile99: number;
  optimalRangeFrequency: number; // % of time in optimal range
  aboveOptimalFrequency: number;
  belowOptimalFrequency: number;
}

export interface TrendData {
  baseline: number;
  current: number;
  change: number; // percentage
  changeAbsolute: number;
  trend: 'improving' | 'declining' | 'stable';
  trendStrength: 'strong' | 'moderate' | 'weak';
  sessions: Array<{
    date: string;
    value: number;
    sessionId: string;
  }>;
  regression: {
    slope: number;
    intercept: number;
    rSquared: number;
  };
}

export interface SessionSummary {
  sessionId: string;
  date: string;
  overallScore: number;
  metrics: VoiceMetrics;
  highlights: string[];
}

export interface Milestone {
  id: string;
  type: 'metric' | 'consistency' | 'practice' | 'improvement';
  metric?: string;
  description: string;
  achievedDate: string;
  value: number;
  target: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlockedDate: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  icon?: string;
}

export interface FeedbackTrend {
  metric: string;
  feedbackType: string;
  frequency: number;
  trend: 'increasing' | 'decreasing' | 'stable';
}

export interface ComparisonData {
  pace: { current: number; compared: number; difference: number; percentageChange: number };
  pitch: { current: number; compared: number; difference: number; percentageChange: number };
  volume: { current: number; compared: number; difference: number; percentageChange: number };
  pauses: { current: number; compared: number; difference: number; percentageChange: number };
  clarity: { current: number; compared: number; difference: number; percentageChange: number };
  confidence: { current: number; compared: number; difference: number; percentageChange: number };
  overallScore: { current: number; compared: number; difference: number; percentageChange: number };
}

export interface ProjectedMetrics {
  pace: number;
  pitch: number;
  volume: number;
  pauses: number;
  clarity: number;
  confidence: number;
  confidenceLevel: number; // 0-100
  basedOnTrend: boolean;
}

export interface RawMetricDataPoint {
  timestamp: number;
  sessionId: string;
  pace: number;
  pitch: number;
  volume: number;
  pauses: number;
  clarity: number;
  confidence: number;
}

export interface RawFeedbackDataPoint {
  timestamp: number;
  sessionId: string;
  metric: string;
  message: string;
  severity: string;
  type: string;
}

export interface RawSuggestionDataPoint {
  timestamp: number;
  sessionId: string;
  metric: string;
  suggestion: string;
  priority: string;
  category: string;
}

export class ComprehensiveDataCollector {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Collect ALL data points for a user
   */
  async collectAllData(): Promise<CompleteUserData> {
    // Load all sessions
    const sessions = await userDataPersistence.getUserSessions(this.userId, 1000);
    const profile = await userDataPersistence.getUserProfile(this.userId);
    const impactAnalysis = await userDataPersistence.getUserImpactAnalysis(this.userId);

    // Generate feedback analysis
    let feedbackAnalysis = null;
    try {
      const analyzer = new FeedbackAnalyzer(this.userId);
      feedbackAnalysis = await analyzer.generateFeedbackAnalysis();
    } catch (error) {
      console.warn('Could not generate feedback analysis:', error);
    }

    // Process all data
    const completeSessions = this.processSessions(sessions);
    const allTimeMetrics = this.calculateAllTimeMetrics(completeSessions);
    const improvementTrends = this.calculateImprovementTrends(completeSessions, profile);
    const patterns = this.identifyPatterns(completeSessions);
    const frequencyAnalysis = this.calculateFrequencyAnalysis(completeSessions);
    const consistencyMetrics = this.calculateConsistencyMetrics(completeSessions);
    const practiceHabits = this.analyzePracticeHabits(completeSessions);
    const improvementVelocity = this.calculateImprovementVelocity(completeSessions);
    const bestWorstSessions = this.identifyBestWorstSessions(completeSessions);
    const milestones = this.identifyMilestones(completeSessions, profile);
    const achievements = this.identifyAchievements(completeSessions, profile);
    const feedbackHistory = this.analyzeFeedbackHistory(completeSessions);
    const recommendationsHistory = this.analyzeRecommendationsHistory(completeSessions);
    const comparisons = this.generateComparisons(completeSessions, profile);
    const predictions = this.generatePredictions(improvementTrends, profile);
    const rawData = this.extractRawData(completeSessions);

    return {
      userId: this.userId,
      exportDate: new Date().toISOString(),
      exportVersion: '1.0.0',
      
      sessions: completeSessions,
      totalSessions: completeSessions.length,
      totalPracticeTime: completeSessions.reduce((sum, s) => sum + s.duration, 0),
      firstSessionDate: completeSessions.length > 0 ? completeSessions[0].date : null,
      lastSessionDate: completeSessions.length > 0 ? completeSessions[completeSessions.length - 1].date : null,
      averageSessionDuration: completeSessions.length > 0
        ? completeSessions.reduce((sum, s) => sum + s.duration, 0) / completeSessions.length
        : 0,
      
      allTimeMetrics,
      currentProfile: profile,
      currentImpactAnalysis: impactAnalysis,
      currentFeedbackAnalysis: feedbackAnalysis,
      
      improvementTrends,
      patterns,
      frequencyAnalysis,
      consistencyMetrics,
      practiceHabits,
      improvementVelocity,
      bestSessions: bestWorstSessions.best,
      worstSessions: bestWorstSessions.worst,
      milestones,
      achievements,
      feedbackHistory,
      recommendationsHistory,
      comparisons,
      predictions,
      
      rawMetrics: rawData.metrics,
      rawFeedback: rawData.feedback,
      rawSuggestions: rawData.suggestions,
      
      metadata: {
        dataCollectionStartDate: completeSessions.length > 0 ? completeSessions[0].date : new Date().toISOString(),
        dataCollectionEndDate: new Date().toISOString(),
        totalDataPoints: rawData.metrics.length + rawData.feedback.length + rawData.suggestions.length,
        dataQuality: this.assessDataQuality(completeSessions),
        completeness: this.calculateCompleteness(completeSessions),
      },
    };
  }

  /**
   * Process sessions into complete session data
   */
  private processSessions(sessions: any[]): CompleteSessionData[] {
    return sessions.map((session, index) => {
      const metrics = session.metrics;
      const feedback = session.feedback || [];
      const suggestions = session.suggestions || [];
      
      // Calculate session score
      const sessionScore = this.calculateSessionScore(metrics);
      
      // Calculate improvement from previous
      const improvementFromPrevious = index > 0
        ? this.calculateImprovement(session.metrics, sessions[index - 1].metrics)
        : null;
      
      // Identify issues and strengths
      const issuesIdentified = this.identifyIssues(metrics);
      const strengthsIdentified = this.identifyStrengths(metrics);
      
      return {
        sessionId: session.id || `session_${index}`,
        conversationId: session.conversation_id,
        date: new Date(session.session_date).toISOString(),
        timestamp: new Date(session.session_date).getTime(),
        duration: session.duration_ms || 0,
        
        metrics,
        averageMetrics: metrics, // Same for now, could calculate from real-time data
        peakMetrics: metrics,
        lowMetrics: metrics,
        
        feedback,
        suggestions,
        
        sessionScore,
        improvementFromPrevious,
        issuesIdentified,
        strengthsIdentified,
      };
    });
  }

  /**
   * Calculate comprehensive statistics for all metrics
   */
  private calculateAllTimeMetrics(sessions: CompleteSessionData[]): CompleteUserData['allTimeMetrics'] {
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;
    const result: any = {};

    metrics.forEach(metric => {
      const values = sessions.map(s => s.metrics[metric]).filter(v => v != null);
      if (values.length === 0) {
        result[metric] = this.getEmptyStatistics();
        return;
      }

      const sorted = [...values].sort((a, b) => a - b);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      
      result[metric] = {
        min: sorted[0],
        max: sorted[sorted.length - 1],
        mean,
        median: this.getMedian(sorted),
        mode: this.getMode(values),
        standardDeviation: stdDev,
        variance,
        range: sorted[sorted.length - 1] - sorted[0],
        q1: this.getPercentile(sorted, 25),
        q3: this.getPercentile(sorted, 75),
        iqr: this.getPercentile(sorted, 75) - this.getPercentile(sorted, 25),
        percentile25: this.getPercentile(sorted, 25),
        percentile50: this.getPercentile(sorted, 50),
        percentile75: this.getPercentile(sorted, 75),
        percentile90: this.getPercentile(sorted, 90),
        percentile95: this.getPercentile(sorted, 95),
        percentile99: this.getPercentile(sorted, 99),
        optimalRangeFrequency: this.calculateOptimalRangeFrequency(values, metric),
        aboveOptimalFrequency: this.calculateAboveOptimalFrequency(values, metric),
        belowOptimalFrequency: this.calculateBelowOptimalFrequency(values, metric),
      };
    });

    return result as CompleteUserData['allTimeMetrics'];
  }

  /**
   * Calculate improvement trends
   */
  private calculateImprovementTrends(
    sessions: CompleteSessionData[],
    profile: UserVoiceProfile | null
  ): CompleteUserData['improvementTrends'] {
    if (!profile) {
      return this.getEmptyTrends();
    }

    const trends: any = {};
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;

    metrics.forEach(metric => {
      const profileTrend = profile.improvementTrend[metric];
      const sessionValues = sessions.map(s => ({
        date: s.date,
        value: s.metrics[metric],
        sessionId: s.sessionId,
      }));

      // Calculate regression
      const regression = this.calculateLinearRegression(sessionValues.map((s, i) => ({
        x: i,
        y: s.value,
      })));

      trends[metric] = {
        baseline: profileTrend.baseline,
        current: profileTrend.current,
        change: profileTrend.change,
        changeAbsolute: profileTrend.current - profileTrend.baseline,
        trend: profileTrend.trend,
        trendStrength: this.determineTrendStrength(regression.rSquared, profileTrend.change),
        sessions: sessionValues,
        regression,
      };
    });

    return trends as CompleteUserData['improvementTrends'];
  }

  /**
   * Identify patterns across sessions
   */
  private identifyPatterns(sessions: CompleteSessionData[]): CompleteUserData['patterns'] {
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;
    
    const consistentImprovement: string[] = [];
    const decliningMetrics: string[] = [];
    const volatileMetrics: string[] = [];
    const plateauMetrics: string[] = [];
    const rapidImprovement: string[] = [];

    metrics.forEach(metric => {
      if (sessions.length < 3) return;

      const values = sessions.map(s => s.metrics[metric]);
      
      // Check for consistent improvement
      let improvingCount = 0;
      for (let i = 1; i < values.length; i++) {
        if (values[i] > values[i - 1]) improvingCount++;
      }
      if (improvingCount / (values.length - 1) >= 0.6) {
        consistentImprovement.push(metric);
      }

      // Check for decline
      let decliningCount = 0;
      for (let i = 1; i < values.length; i++) {
        if (values[i] < values[i - 1]) decliningCount++;
      }
      if (decliningCount / (values.length - 1) >= 0.5) {
        decliningMetrics.push(metric);
      }

      // Check volatility
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / mean;
      if (coefficientOfVariation > 0.3) {
        volatileMetrics.push(metric);
      }

      // Check plateau (low variance in recent sessions)
      if (sessions.length >= 5) {
        const recent = values.slice(-5);
        const recentMean = recent.reduce((a, b) => a + b, 0) / recent.length;
        const recentVariance = recent.reduce((sum, val) => sum + Math.pow(val - recentMean, 2), 0) / recent.length;
        const recentStdDev = Math.sqrt(recentVariance);
        if (recentStdDev < recentMean * 0.05) {
          plateauMetrics.push(metric);
        }
      }

      // Check rapid improvement
      if (values.length >= 3) {
        const first = values[0];
        const last = values[values.length - 1];
        const improvement = ((last - first) / first) * 100;
        if (improvement > 20) {
          rapidImprovement.push(metric);
        }
      }
    });

    return {
      consistentImprovement,
      decliningMetrics,
      volatileMetrics,
      plateauMetrics,
      rapidImprovement,
    };
  }

  /**
   * Calculate frequency analysis
   */
  private calculateFrequencyAnalysis(sessions: CompleteSessionData[]): CompleteUserData['frequencyAnalysis'] {
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;
    const optimalRangeFrequency: Record<string, number> = {};
    const issueFrequency: Record<string, number> = {};
    const improvementFrequency: Record<string, number> = {};

    metrics.forEach(metric => {
      const values = sessions.map(s => s.metrics[metric]);
      optimalRangeFrequency[metric] = this.calculateOptimalRangeFrequency(values, metric);
      
      // Issue frequency (not in optimal range)
      const issues = values.filter(v => !this.isInOptimalRange(metric, v)).length;
      issueFrequency[metric] = (issues / values.length) * 100;

      // Improvement frequency
      if (sessions.length >= 2) {
        let improvements = 0;
        for (let i = 1; i < sessions.length; i++) {
          if (sessions[i].metrics[metric] > sessions[i - 1].metrics[metric]) {
            improvements++;
          }
        }
        improvementFrequency[metric] = (improvements / (sessions.length - 1)) * 100;
      } else {
        improvementFrequency[metric] = 0;
      }
    });

    return {
      optimalRangeFrequency,
      issueFrequency,
      improvementFrequency,
    };
  }

  /**
   * Calculate consistency metrics
   */
  private calculateConsistencyMetrics(sessions: CompleteSessionData[]): CompleteUserData['consistencyMetrics'] {
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;
    const metricConsistency: Record<string, number> = {};

    let totalConsistency = 0;
    metrics.forEach(metric => {
      const values = sessions.map(s => s.metrics[metric]);
      const consistency = this.calculateConsistency(values);
      metricConsistency[metric] = consistency;
      totalConsistency += consistency;
    });

    const overallConsistency = totalConsistency / metrics.length;

    // Session-to-session variance
    const sessionToSessionVariance = [];
    for (let i = 1; i < sessions.length; i++) {
      const variance = this.calculateSessionVariance(sessions[i - 1], sessions[i]);
      sessionToSessionVariance.push(variance);
    }

    return {
      overallConsistency: Math.round(overallConsistency),
      metricConsistency,
      sessionToSessionVariance,
    };
  }

  /**
   * Analyze practice habits
   */
  private analyzePracticeHabits(sessions: CompleteSessionData[]): CompleteUserData['practiceHabits'] {
    if (sessions.length < 2) {
      return {
        sessionsPerWeek: 0,
        averageDaysBetweenSessions: 0,
        longestStreak: 0,
        currentStreak: 0,
        preferredDaysOfWeek: [],
        preferredTimeOfDay: 'unknown',
        sessionFrequencyTrend: 'stable',
      };
    }

    // Calculate sessions per week
    const firstDate = new Date(sessions[0].date);
    const lastDate = new Date(sessions[sessions.length - 1].date);
    const daysDiff = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24);
    const weeks = daysDiff / 7 || 1;
    const sessionsPerWeek = sessions.length / weeks;

    // Average days between sessions
    const daysBetween: number[] = [];
    for (let i = 1; i < sessions.length; i++) {
      const prevDate = new Date(sessions[i - 1].date);
      const currDate = new Date(sessions[i].date);
      const days = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      daysBetween.push(days);
    }
    const averageDaysBetweenSessions = daysBetween.reduce((a, b) => a + b, 0) / daysBetween.length;

    // Calculate streaks
    const longestStreak = this.calculateLongestStreak(sessions);
    const currentStreak = this.calculateCurrentStreak(sessions);

    // Preferred days of week
    const dayCounts = new Array(7).fill(0);
    sessions.forEach(session => {
      const date = new Date(session.date);
      dayCounts[date.getDay()]++;
    });
    const preferredDaysOfWeek = dayCounts
      .map((count, day) => ({ day, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(item => item.day);

    // Preferred time of day
    const timeOfDayCounts = { morning: 0, afternoon: 0, evening: 0 };
    sessions.forEach(session => {
      const date = new Date(session.date);
      const hour = date.getHours();
      if (hour >= 5 && hour < 12) timeOfDayCounts.morning++;
      else if (hour >= 12 && hour < 17) timeOfDayCounts.afternoon++;
      else timeOfDayCounts.evening++;
    });
    const preferredTimeOfDay = Object.entries(timeOfDayCounts)
      .sort((a, b) => b[1] - a[1])[0][0];

    // Session frequency trend
    const recentWeeks = Math.min(4, Math.floor(weeks));
    const recentSessions = sessions.slice(-recentWeeks * 7);
    const recentSessionsPerWeek = recentSessions.length / recentWeeks;
    const sessionFrequencyTrend = recentSessionsPerWeek > sessionsPerWeek * 1.1
      ? 'increasing'
      : recentSessionsPerWeek < sessionsPerWeek * 0.9
      ? 'decreasing'
      : 'stable';

    return {
      sessionsPerWeek: Math.round(sessionsPerWeek * 10) / 10,
      averageDaysBetweenSessions: Math.round(averageDaysBetweenSessions * 10) / 10,
      longestStreak,
      currentStreak,
      preferredDaysOfWeek,
      preferredTimeOfDay,
      sessionFrequencyTrend,
    };
  }

  /**
   * Calculate improvement velocity (rate of change per week)
   */
  private calculateImprovementVelocity(sessions: CompleteSessionData[]): CompleteUserData['improvementVelocity'] {
    if (sessions.length < 2) {
      return {
        pace: 0,
        pitch: 0,
        volume: 0,
        pauses: 0,
        clarity: 0,
        confidence: 0,
      };
    }

    const firstDate = new Date(sessions[0].date);
    const lastDate = new Date(sessions[sessions.length - 1].date);
    const weeks = (lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24 * 7) || 1;

    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;
    const velocity: any = {};

    metrics.forEach(metric => {
      const firstValue = sessions[0].metrics[metric];
      const lastValue = sessions[sessions.length - 1].metrics[metric];
      const change = lastValue - firstValue;
      velocity[metric] = change / weeks;
    });

    return velocity as CompleteUserData['improvementVelocity'];
  }

  /**
   * Identify best and worst sessions
   */
  private identifyBestWorstSessions(sessions: CompleteSessionData[]): {
    best: SessionSummary[];
    worst: SessionSummary[];
  } {
    if (sessions.length === 0) {
      return { best: [], worst: [] };
    }

    const sorted = [...sessions].sort((a, b) => b.sessionScore - a.sessionScore);
    const best = sorted.slice(0, 5).map(s => ({
      sessionId: s.sessionId,
      date: s.date,
      overallScore: s.sessionScore,
      metrics: s.metrics,
      highlights: s.strengthsIdentified,
    }));

    const worst = sorted.slice(-5).reverse().map(s => ({
      sessionId: s.sessionId,
      date: s.date,
      overallScore: s.sessionScore,
      metrics: s.metrics,
      highlights: s.issuesIdentified,
    }));

    return { best, worst };
  }

  /**
   * Identify milestones
   */
  private identifyMilestones(
    sessions: CompleteSessionData[],
    profile: UserVoiceProfile | null
  ): Milestone[] {
    const milestones: Milestone[] = [];

    if (sessions.length >= 1) {
      milestones.push({
        id: 'first_session',
        type: 'practice',
        description: 'Completed first session',
        achievedDate: sessions[0].date,
        value: 1,
        target: 1,
      });
    }

    if (sessions.length >= 10) {
      milestones.push({
        id: 'ten_sessions',
        type: 'practice',
        description: 'Completed 10 sessions',
        achievedDate: sessions[9].date,
        value: 10,
        target: 10,
      });
    }

    if (sessions.length >= 50) {
      milestones.push({
        id: 'fifty_sessions',
        type: 'practice',
        description: 'Completed 50 sessions',
        achievedDate: sessions[49].date,
        value: 50,
        target: 50,
      });
    }

    // Metric-specific milestones
    if (profile) {
      Object.entries(profile.improvementTrend).forEach(([metric, trend]) => {
        if (trend.change > 10) {
          milestones.push({
            id: `improvement_${metric}`,
            type: 'improvement',
            metric,
            description: `Improved ${metric} by ${trend.change.toFixed(1)}%`,
            achievedDate: profile.lastSessionDate.toISOString(),
            value: trend.current,
            target: trend.baseline + (trend.baseline * 0.1),
          });
        }
      });
    }

    return milestones;
  }

  /**
   * Identify achievements
   */
  private identifyAchievements(
    sessions: CompleteSessionData[],
    profile: UserVoiceProfile | null
  ): Achievement[] {
    const achievements: Achievement[] = [];

    if (sessions.length >= 1) {
      achievements.push({
        id: 'first_steps',
        name: 'First Steps',
        description: 'Completed your first voice coaching session',
        unlockedDate: sessions[0].date,
        rarity: 'common',
      });
    }

    if (sessions.length >= 10) {
      achievements.push({
        id: 'dedicated_practitioner',
        name: 'Dedicated Practitioner',
        description: 'Completed 10 practice sessions',
        unlockedDate: sessions[9].date,
        rarity: 'rare',
      });
    }

    const consistency = this.calculateConsistencyMetrics(sessions);
    if (consistency.overallConsistency >= 80) {
      achievements.push({
        id: 'consistent_performer',
        name: 'Consistent Performer',
        description: 'Maintained 80%+ consistency across sessions',
        unlockedDate: sessions[sessions.length - 1].date,
        rarity: 'epic',
      });
    }

    if (profile && profile.impactScore.overall >= 80) {
      achievements.push({
        id: 'excellent_performer',
        name: 'Excellent Performer',
        description: 'Achieved 80+ overall impact score',
        unlockedDate: profile.lastSessionDate.toISOString(),
        rarity: 'legendary',
      });
    }

    return achievements;
  }

  /**
   * Analyze feedback history
   */
  private analyzeFeedbackHistory(sessions: CompleteSessionData[]): CompleteUserData['feedbackHistory'] {
    const allFeedback: FeedbackMessage[] = [];
    sessions.forEach(session => {
      allFeedback.push(...session.feedback);
    });

    const feedbackByMetric: Record<string, number> = {};
    allFeedback.forEach(fb => {
      feedbackByMetric[fb.metric] = (feedbackByMetric[fb.metric] || 0) + 1;
    });

    // Most common feedback
    const feedbackMessages = allFeedback.map(fb => fb.message);
    const messageCounts: Record<string, number> = {};
    feedbackMessages.forEach(msg => {
      messageCounts[msg] = (messageCounts[msg] || 0) + 1;
    });
    const mostCommonFeedback = Object.entries(messageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([msg]) => msg);

    // Feedback trends
    const feedbackTrends: FeedbackTrend[] = [];
    Object.entries(feedbackByMetric).forEach(([metric, count]) => {
      feedbackTrends.push({
        metric,
        feedbackType: 'general',
        frequency: count,
        trend: 'stable', // Could calculate actual trend
      });
    });

    return {
      totalFeedbackMessages: allFeedback.length,
      feedbackByMetric,
      mostCommonFeedback,
      feedbackTrends,
    };
  }

  /**
   * Analyze recommendations history
   */
  private analyzeRecommendationsHistory(sessions: CompleteSessionData[]): CompleteUserData['recommendationsHistory'] {
    const allSuggestions: CoachingSuggestion[] = [];
    sessions.forEach(session => {
      allSuggestions.push(...session.suggestions);
    });

    const recommendationsByPriority: Record<string, number> = {};
    allSuggestions.forEach(s => {
      const priority = s.priority || 'medium';
      recommendationsByPriority[priority] = (recommendationsByPriority[priority] || 0) + 1;
    });

    return {
      totalRecommendations: allSuggestions.length,
      recommendationsByPriority,
      implementedRecommendations: 0, // Would need tracking
      recommendationEffectiveness: {}, // Would need tracking
    };
  }

  /**
   * Generate comparisons
   */
  private generateComparisons(
    sessions: CompleteSessionData[],
    profile: UserVoiceProfile | null
  ): CompleteUserData['comparisons'] {
    if (!profile || sessions.length === 0) {
      return this.getEmptyComparisons();
    }

    const current = profile.currentMetrics;
    const baseline = profile.baselineMetrics;

    // Get last week's data
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const lastWeekSession = sessions.find(s => new Date(s.date) >= oneWeekAgo);
    const lastWeekMetrics = lastWeekSession?.metrics || current;

    // Get last month's data
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const lastMonthSession = sessions.find(s => new Date(s.date) >= oneMonthAgo);
    const lastMonthMetrics = lastMonthSession?.metrics || current;

    // Get peak performance
    const bestSession = sessions.reduce((best, curr) => 
      curr.sessionScore > best.sessionScore ? curr : best
    );
    const peakMetrics = bestSession.metrics;

    const compare = (current: VoiceMetrics, compared: VoiceMetrics) => {
      const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;
      const result: any = {};
      
      metrics.forEach(metric => {
        const curr = current[metric];
        const comp = compared[metric];
        const diff = curr - comp;
        const pctChange = comp !== 0 ? (diff / comp) * 100 : 0;
        
        result[metric] = {
          current: curr,
          compared: comp,
          difference: Math.round(diff * 100) / 100,
          percentageChange: Math.round(pctChange * 100) / 100,
        };
      });

      const currScore = this.calculateSessionScore(current);
      const compScore = this.calculateSessionScore(compared);
      result.overallScore = {
        current: currScore,
        compared: compScore,
        difference: currScore - compScore,
        percentageChange: compScore !== 0 ? ((currScore - compScore) / compScore) * 100 : 0,
      };

      return result;
    };

    return {
      vsBaseline: compare(current, baseline),
      vsLastWeek: compare(current, lastWeekMetrics),
      vsLastMonth: compare(current, lastMonthMetrics),
      vsPeakPerformance: compare(current, peakMetrics),
    };
  }

  /**
   * Generate predictions
   */
  private generatePredictions(
    trends: CompleteUserData['improvementTrends'],
    profile: UserVoiceProfile | null
  ): CompleteUserData['predictions'] {
    if (!profile) {
      return this.getEmptyPredictions();
    }

    const project = (weeks: number) => {
      const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;
      const projected: any = {};
      
      metrics.forEach(metric => {
        const trend = trends[metric];
        const current = trend.current;
        const slope = trend.regression.slope;
        const projectedValue = current + (slope * weeks);
        projected[metric] = Math.round(projectedValue * 10) / 10;
      });

      return {
        ...projected,
        confidenceLevel: Math.min(100, Math.max(0, trend.regression.rSquared * 100)),
        basedOnTrend: true,
      } as ProjectedMetrics;
    };

    return {
      nextWeekProjection: project(1),
      nextMonthProjection: project(4),
      nextQuarterProjection: project(12),
      goalAchievementProbability: {}, // Would need goal tracking
    };
  }

  /**
   * Extract raw data
   */
  private extractRawData(sessions: CompleteSessionData[]): {
    metrics: RawMetricDataPoint[];
    feedback: RawFeedbackDataPoint[];
    suggestions: RawSuggestionDataPoint[];
  } {
    const metrics: RawMetricDataPoint[] = sessions.map(s => ({
      timestamp: s.timestamp,
      sessionId: s.sessionId,
      pace: s.metrics.pace,
      pitch: s.metrics.pitch,
      volume: s.metrics.volume,
      pauses: s.metrics.pauses,
      clarity: s.metrics.clarity,
      confidence: s.metrics.confidence,
    }));

    const feedback: RawFeedbackDataPoint[] = [];
    sessions.forEach(s => {
      s.feedback.forEach(fb => {
        feedback.push({
          timestamp: s.timestamp,
          sessionId: s.sessionId,
          metric: fb.metric,
          message: fb.message,
          severity: fb.severity || 'medium',
          type: fb.type || 'feedback',
        });
      });
    });

    const suggestions: RawSuggestionDataPoint[] = [];
    sessions.forEach(s => {
      s.suggestions.forEach(sug => {
        suggestions.push({
          timestamp: s.timestamp,
          sessionId: s.sessionId,
          metric: sug.metric || 'general',
          suggestion: sug.improvement || '',
          priority: sug.priority || 'medium',
          category: sug.category || 'general',
        });
      });
    });

    return { metrics, feedback, suggestions };
  }

  // Helper methods
  private calculateSessionScore(metrics: VoiceMetrics): number {
    const optimalRanges = {
      pace: { min: 140, max: 180 },
      volume: { min: -18, max: -6 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
    };

    let score = 0;
    let count = 0;

    Object.entries(optimalRanges).forEach(([metric, range]) => {
      const value = metrics[metric as keyof VoiceMetrics];
      if (value >= range.min && value <= range.max) {
        score += 100;
      } else {
        const distance = value < range.min ? range.min - value : value - range.max;
        const maxDistance = range.max - range.min;
        score += Math.max(0, 100 - (distance / maxDistance) * 100);
      }
      count++;
    });

    return count > 0 ? Math.round(score / count) : 0;
  }

  private calculateImprovement(current: VoiceMetrics, previous: VoiceMetrics): number {
    const currentScore = this.calculateSessionScore(current);
    const previousScore = this.calculateSessionScore(previous);
    return currentScore - previousScore;
  }

  private identifyIssues(metrics: VoiceMetrics): string[] {
    const issues: string[] = [];
    const optimalRanges = {
      pace: { min: 140, max: 180 },
      volume: { min: -18, max: -6 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
    };

    Object.entries(optimalRanges).forEach(([metric, range]) => {
      const value = metrics[metric as keyof VoiceMetrics];
      if (value < range.min || value > range.max) {
        issues.push(`${metric} out of optimal range`);
      }
    });

    return issues;
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
        strengths.push(`${metric} in optimal range`);
      }
    });

    return strengths;
  }

  private getMedian(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private getMode(values: number[]): number {
    const counts: Record<number, number> = {};
    values.forEach(v => {
      counts[v] = (counts[v] || 0) + 1;
    });
    return parseInt(Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || '0');
  }

  private getPercentile(sorted: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(index, sorted.length - 1))];
  }

  private calculateOptimalRangeFrequency(values: number[], metric: string): number {
    const optimal = values.filter(v => this.isInOptimalRange(metric, v)).length;
    return values.length > 0 ? (optimal / values.length) * 100 : 0;
  }

  private calculateAboveOptimalFrequency(values: number[], metric: string): number {
    const range = this.getOptimalRange(metric);
    const above = values.filter(v => v > range.max).length;
    return values.length > 0 ? (above / values.length) * 100 : 0;
  }

  private calculateBelowOptimalFrequency(values: number[], metric: string): number {
    const range = this.getOptimalRange(metric);
    const below = values.filter(v => v < range.min).length;
    return values.length > 0 ? (below / values.length) * 100 : 0;
  }

  private isInOptimalRange(metric: string, value: number): boolean {
    const range = this.getOptimalRange(metric);
    return value >= range.min && value <= range.max;
  }

  private getOptimalRange(metric: string): { min: number; max: number } {
    const ranges: Record<string, { min: number; max: number }> = {
      pace: { min: 140, max: 180 },
      pitch: { min: 85, max: 255 },
      volume: { min: -18, max: -6 },
      pauses: { min: 3, max: 8 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
    };
    return ranges[metric] || { min: 0, max: 100 };
  }

  private calculateConsistency(values: number[]): number {
    if (values.length < 2) return 100;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;
    return Math.max(0, 100 - (coefficientOfVariation * 100));
  }

  private calculateSessionVariance(session1: CompleteSessionData, session2: CompleteSessionData): number {
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;
    let totalVariance = 0;
    
    metrics.forEach(metric => {
      const diff = Math.abs(session1.metrics[metric] - session2.metrics[metric]);
      totalVariance += diff;
    });

    return totalVariance / metrics.length;
  }

  private calculateLongestStreak(sessions: CompleteSessionData[]): number {
    if (sessions.length < 2) return sessions.length;

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sessions.length; i++) {
      const prevDate = new Date(sessions[i - 1].date);
      const currDate = new Date(sessions[i].date);
      const daysDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff <= 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  private calculateCurrentStreak(sessions: CompleteSessionData[]): number {
    if (sessions.length < 2) return sessions.length;

    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = sessions.length - 1; i > 0; i--) {
      const sessionDate = new Date(sessions[i].date);
      sessionDate.setHours(0, 0, 0, 0);
      const prevDate = new Date(sessions[i - 1].date);
      prevDate.setHours(0, 0, 0, 0);
      
      const daysDiff = (sessionDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff <= 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateLinearRegression(points: Array<{ x: number; y: number }>): {
    slope: number;
    intercept: number;
    rSquared: number;
  } {
    const n = points.length;
    if (n < 2) {
      return { slope: 0, intercept: 0, rSquared: 0 };
    }

    const sumX = points.reduce((sum, p) => sum + p.x, 0);
    const sumY = points.reduce((sum, p) => sum + p.y, 0);
    const sumXY = points.reduce((sum, p) => sum + p.x * p.y, 0);
    const sumXX = points.reduce((sum, p) => sum + p.x * p.x, 0);
    const sumYY = points.reduce((sum, p) => sum + p.y * p.y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const meanY = sumY / n;
    const ssRes = points.reduce((sum, p) => {
      const predicted = slope * p.x + intercept;
      return sum + Math.pow(p.y - predicted, 2);
    }, 0);
    const ssTot = points.reduce((sum, p) => sum + Math.pow(p.y - meanY, 2), 0);
    const rSquared = ssTot > 0 ? 1 - (ssRes / ssTot) : 0;

    return { slope, intercept, rSquared: Math.max(0, Math.min(1, rSquared)) };
  }

  private determineTrendStrength(rSquared: number, change: number): 'strong' | 'moderate' | 'weak' {
    if (rSquared > 0.7 && Math.abs(change) > 10) return 'strong';
    if (rSquared > 0.4 && Math.abs(change) > 5) return 'moderate';
    return 'weak';
  }

  private assessDataQuality(sessions: CompleteSessionData[]): 'high' | 'medium' | 'low' {
    if (sessions.length < 5) return 'low';
    if (sessions.length < 20) return 'medium';
    return 'high';
  }

  private calculateCompleteness(sessions: CompleteSessionData[]): number {
    if (sessions.length === 0) return 0;
    
    let completeCount = 0;
    sessions.forEach(session => {
      const hasMetrics = Object.values(session.metrics).every(v => v != null);
      const hasDuration = session.duration > 0;
      if (hasMetrics && hasDuration) completeCount++;
    });

    return Math.round((completeCount / sessions.length) * 100);
  }

  private getEmptyStatistics(): MetricStatistics {
    return {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      mode: 0,
      standardDeviation: 0,
      variance: 0,
      range: 0,
      q1: 0,
      q3: 0,
      iqr: 0,
      percentile25: 0,
      percentile50: 0,
      percentile75: 0,
      percentile90: 0,
      percentile95: 0,
      percentile99: 0,
      optimalRangeFrequency: 0,
      aboveOptimalFrequency: 0,
      belowOptimalFrequency: 0,
    };
  }

  private getEmptyTrends(): CompleteUserData['improvementTrends'] {
    const emptyTrend = {
      baseline: 0,
      current: 0,
      change: 0,
      changeAbsolute: 0,
      trend: 'stable' as const,
      trendStrength: 'weak' as const,
      sessions: [],
      regression: { slope: 0, intercept: 0, rSquared: 0 },
    };

    return {
      pace: emptyTrend,
      pitch: emptyTrend,
      volume: emptyTrend,
      pauses: emptyTrend,
      clarity: emptyTrend,
      confidence: emptyTrend,
    };
  }

  private getEmptyComparisons(): CompleteUserData['comparisons'] {
    const emptyComparison = {
      pace: { current: 0, compared: 0, difference: 0, percentageChange: 0 },
      pitch: { current: 0, compared: 0, difference: 0, percentageChange: 0 },
      volume: { current: 0, compared: 0, difference: 0, percentageChange: 0 },
      pauses: { current: 0, compared: 0, difference: 0, percentageChange: 0 },
      clarity: { current: 0, compared: 0, difference: 0, percentageChange: 0 },
      confidence: { current: 0, compared: 0, difference: 0, percentageChange: 0 },
      overallScore: { current: 0, compared: 0, difference: 0, percentageChange: 0 },
    };

    return {
      vsBaseline: emptyComparison,
      vsLastWeek: emptyComparison,
      vsLastMonth: emptyComparison,
      vsPeakPerformance: emptyComparison,
    };
  }

  private getEmptyPredictions(): CompleteUserData['predictions'] {
    const emptyProjection = {
      pace: 0,
      pitch: 0,
      volume: 0,
      pauses: 0,
      clarity: 0,
      confidence: 0,
      confidenceLevel: 0,
      basedOnTrend: false,
    };

    return {
      nextWeekProjection: emptyProjection,
      nextMonthProjection: emptyProjection,
      nextQuarterProjection: emptyProjection,
      goalAchievementProbability: {},
    };
  }
}

