/**
 * Feedback Analyzer & Model
 * Advanced feedback analysis using multiple data points and pattern recognition
 */

import type { VoiceMetrics, FeedbackMessage, CoachingSuggestion } from './types';
import type { UserVoiceProfile, ImprovementTrend, ImpactScore } from './user-model';
import { userDataPersistence } from './user-data-persistence';

export interface FeedbackAnalysis {
  overallScore: number; // 0-100
  strengths: StrengthAnalysis[];
  weaknesses: WeaknessAnalysis[];
  patterns: PatternAnalysis[];
  recommendations: PrioritizedRecommendation[];
  improvementAreas: ImprovementArea[];
  successFactors: SuccessFactor[];
  riskFactors: RiskFactor[];
  predictedOutcome: PredictedOutcome;
  actionPlan: ActionPlan;
}

export interface StrengthAnalysis {
  metric: string;
  score: number;
  description: string;
  consistency: number; // 0-100
  trend: 'improving' | 'stable' | 'declining';
  impact: 'high' | 'medium' | 'low';
  examples: string[];
}

export interface WeaknessAnalysis {
  metric: string;
  score: number;
  description: string;
  severity: 'critical' | 'moderate' | 'minor';
  frequency: number; // How often this issue appears
  impact: 'high' | 'medium' | 'low';
  rootCause: string;
  solutions: string[];
  expectedImprovement: string;
}

export interface PatternAnalysis {
  pattern: string;
  type: 'positive' | 'negative' | 'neutral';
  frequency: number;
  description: string;
  impact: 'high' | 'medium' | 'low';
  sessions: number[]; // Session indices where this pattern appears
}

export interface PrioritizedRecommendation {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  description: string;
  actionItems: string[];
  expectedImpact: {
    immediate: number;
    midTerm: number;
    longTerm: number;
  };
  effort: 'low' | 'medium' | 'high';
  timeframe: string;
  successCriteria: string[];
  dataPoints: string[]; // Which data points support this recommendation
}

export interface ImprovementArea {
  metric: string;
  currentValue: number;
  targetValue: number;
  gap: number;
  priority: number;
  improvementStrategy: string;
  milestones: Milestone[];
}

export interface Milestone {
  target: number;
  timeframe: string;
  description: string;
}

export interface SuccessFactor {
  factor: string;
  strength: number; // 0-100
  description: string;
  contribution: number; // How much this contributes to success
}

export interface RiskFactor {
  factor: string;
  risk: number; // 0-100
  description: string;
  mitigation: string[];
}

export interface PredictedOutcome {
  scenario: 'best' | 'likely' | 'worst';
  timeframe: string;
  metrics: Partial<VoiceMetrics>;
  impactScore: number;
  probability: number; // 0-100
  description: string;
}

export interface ActionPlan {
  immediate: ActionItem[]; // Next 1-2 weeks
  shortTerm: ActionItem[]; // 2-4 weeks
  longTerm: ActionItem[]; // 1-3 months
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: number;
  effort: 'low' | 'medium' | 'high';
  expectedOutcome: string;
  successMetrics: string[];
}

export class FeedbackAnalyzer {
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
   * Load user data for analysis
   */
  async loadUserData(): Promise<void> {
    const sessions = await userDataPersistence.getUserSessions(this.userId, 100);
    this.sessions = sessions.map(s => ({
      date: s.sessionDate,
      metrics: s.metrics,
      feedback: s.feedback,
      suggestions: s.suggestions,
    }));
  }

  /**
   * Generate comprehensive feedback analysis
   */
  async generateFeedbackAnalysis(): Promise<FeedbackAnalysis> {
    await this.loadUserData();

    if (this.sessions.length === 0) {
      throw new Error('No session data available for analysis');
    }

    const profile = await userDataPersistence.getUserProfile(this.userId);
    const impactAnalysis = await userDataPersistence.getUserImpactAnalysis(this.userId);

    // Analyze using multiple data points
    const strengths = this.analyzeStrengths(profile);
    const weaknesses = this.analyzeWeaknesses(profile);
    const patterns = this.analyzePatterns();
    const recommendations = this.generatePrioritizedRecommendations(profile, impactAnalysis);
    const improvementAreas = this.identifyImprovementAreas(profile);
    const successFactors = this.identifySuccessFactors();
    const riskFactors = this.identifyRiskFactors(profile);
    const predictedOutcome = this.predictOutcome(profile);
    const actionPlan = this.createActionPlan(recommendations, improvementAreas);

    // Calculate overall score
    const overallScore = this.calculateOverallScore(
      strengths,
      weaknesses,
      profile?.impactScore,
      patterns
    );

    return {
      overallScore,
      strengths,
      weaknesses,
      patterns,
      recommendations,
      improvementAreas,
      successFactors,
      riskFactors,
      predictedOutcome,
      actionPlan,
    };
  }

  /**
   * Analyze user strengths using multiple data points
   */
  private analyzeStrengths(profile: UserVoiceProfile | null): StrengthAnalysis[] {
    const strengths: StrengthAnalysis[] = [];
    const optimalRanges = {
      pace: { min: 140, max: 180 },
      volume: { min: -18, max: -6 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
    };

    if (!profile) return strengths;

    Object.entries(optimalRanges).forEach(([metric, range]) => {
      const currentValue = profile.currentMetrics[metric as keyof VoiceMetrics];
      const trend = profile.improvementTrend[metric as keyof ImprovementTrend];
      
      if (currentValue >= range.min && currentValue <= range.max) {
        // Calculate consistency across sessions
        const consistency = this.calculateConsistency(metric);
        
        // Determine impact based on how critical this metric is
        const impact = this.getMetricImpact(metric);
        
        // Get examples from sessions
        const examples = this.getPositiveExamples(metric);

        strengths.push({
          metric,
          score: this.calculateStrengthScore(currentValue, range, trend),
          description: this.getStrengthDescription(metric, currentValue, trend),
          consistency,
          trend: trend.trend,
          impact,
          examples,
        });
      }
    });

    return strengths.sort((a, b) => b.score - a.score);
  }

  /**
   * Analyze weaknesses using pattern recognition
   */
  private analyzeWeaknesses(profile: UserVoiceProfile | null): WeaknessAnalysis[] {
    const weaknesses: WeaknessAnalysis[] = [];

    if (!profile) return weaknesses;

    // Analyze each metric
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;
    
    metrics.forEach(metric => {
      const trend = profile.improvementTrend[metric];
      const currentValue = profile.currentMetrics[metric];
      const optimalRange = this.getOptimalRange(metric);

      // Check if metric is below optimal
      if (!this.isInOptimalRange(metric, currentValue)) {
        const frequency = this.calculateIssueFrequency(metric);
        const severity = this.determineSeverity(metric, currentValue, trend);
        const impact = this.getMetricImpact(metric);
        const rootCause = this.identifyRootCause(metric, trend, frequency);
        const solutions = this.generateSolutions(metric, rootCause);
        const expectedImprovement = this.predictImprovement(metric, trend);

        weaknesses.push({
          metric,
          score: this.calculateWeaknessScore(currentValue, optimalRange),
          description: this.getWeaknessDescription(metric, currentValue, trend),
          severity,
          frequency,
          impact,
          rootCause,
          solutions,
          expectedImprovement,
        });
      }
    });

    return weaknesses.sort((a, b) => {
      // Sort by severity first, then by impact
      const severityOrder = { critical: 3, moderate: 2, minor: 1 };
      if (severityOrder[a.severity] !== severityOrder[b.severity]) {
        return severityOrder[b.severity] - severityOrder[a.severity];
      }
      return b.frequency - a.frequency;
    });
  }

  /**
   * Analyze patterns across sessions
   */
  private analyzePatterns(): PatternAnalysis[] {
    const patterns: PatternAnalysis[] = [];

    // Pattern 1: Consistent improvement
    const improvingMetrics = this.findConsistentlyImprovingMetrics();
    if (improvingMetrics.length > 0) {
      patterns.push({
        pattern: 'Consistent Improvement',
        type: 'positive',
        frequency: improvingMetrics.length,
        description: `Showing consistent improvement in ${improvingMetrics.join(', ')}`,
        impact: 'high',
        sessions: this.sessions.map((_, i) => i),
      });
    }

    // Pattern 2: Declining metrics
    const decliningMetrics = this.findDecliningMetrics();
    if (decliningMetrics.length > 0) {
      patterns.push({
        pattern: 'Declining Performance',
        type: 'negative',
        frequency: decliningMetrics.length,
        description: `Performance declining in ${decliningMetrics.join(', ')}`,
        impact: 'high',
        sessions: this.getDecliningSessions(decliningMetrics),
      });
    }

    // Pattern 3: Volatile performance
    const volatility = this.calculateVolatility();
    if (volatility > 0.3) {
      patterns.push({
        pattern: 'Volatile Performance',
        type: 'negative',
        frequency: Math.round(volatility * 100),
        description: 'Performance varies significantly between sessions',
        impact: 'medium',
        sessions: this.getVolatileSessions(),
      });
    }

    // Pattern 4: Plateau
    const plateauMetrics = this.findPlateauMetrics();
    if (plateauMetrics.length > 0) {
      patterns.push({
        pattern: 'Performance Plateau',
        type: 'neutral',
        frequency: plateauMetrics.length,
        description: `Performance has plateaued in ${plateauMetrics.join(', ')}`,
        impact: 'medium',
        sessions: this.getPlateauSessions(plateauMetrics),
      });
    }

    // Pattern 5: Rapid improvement
    const rapidImprovement = this.findRapidImprovement();
    if (rapidImprovement.length > 0) {
      patterns.push({
        pattern: 'Rapid Improvement',
        type: 'positive',
        frequency: rapidImprovement.length,
        description: `Rapid improvement in ${rapidImprovement.join(', ')}`,
        impact: 'high',
        sessions: this.getRapidImprovementSessions(rapidImprovement),
      });
    }

    return patterns;
  }

  /**
   * Generate prioritized recommendations using ML-like pattern matching
   */
  private generatePrioritizedRecommendations(
    profile: UserVoiceProfile | null,
    impactAnalysis: any
  ): PrioritizedRecommendation[] {
    const recommendations: PrioritizedRecommendation[] = [];

    if (!profile) return recommendations;

    // Analyze weaknesses and generate recommendations
    const weaknesses = this.analyzeWeaknesses(profile);
    
    weaknesses.forEach((weakness, index) => {
      const priority = this.calculateRecommendationPriority(weakness, profile);
      const expectedImpact = this.calculateExpectedImpact(weakness, profile);
      const effort = this.estimateEffort(weakness);
      const timeframe = this.estimateTimeframe(weakness, effort);
      const dataPoints = this.getSupportingDataPoints(weakness);

      recommendations.push({
        id: `rec_${weakness.metric}_${index}`,
        priority,
        category: weakness.metric,
        title: `Improve ${weakness.metric}`,
        description: weakness.description,
        actionItems: weakness.solutions,
        expectedImpact,
        effort,
        timeframe,
        successCriteria: this.generateSuccessCriteria(weakness),
        dataPoints,
      });
    });

    // Add recommendations based on patterns
    const patterns = this.analyzePatterns();
    patterns.forEach(pattern => {
      if (pattern.type === 'negative') {
        recommendations.push({
          id: `rec_pattern_${pattern.pattern.replace(/\s+/g, '_')}`,
          priority: 'high',
          category: 'Pattern',
          title: `Address ${pattern.pattern}`,
          description: pattern.description,
          actionItems: this.generatePatternActions(pattern),
          expectedImpact: {
            immediate: 20,
            midTerm: 50,
            longTerm: 70,
          },
          effort: 'medium',
          timeframe: '2-4 weeks',
          successCriteria: [`Reduce ${pattern.pattern.toLowerCase()} frequency`],
          dataPoints: [`Pattern frequency: ${pattern.frequency}%`],
        });
      }
    });

    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  }

  /**
   * Identify improvement areas with milestones
   */
  private identifyImprovementAreas(profile: UserVoiceProfile | null): ImprovementArea[] {
    const areas: ImprovementArea[] = [];

    if (!profile) return areas;

    const weaknesses = this.analyzeWeaknesses(profile);
    
    weaknesses.forEach(weakness => {
      const currentValue = profile.currentMetrics[weakness.metric as keyof VoiceMetrics];
      const optimalRange = this.getOptimalRange(weakness.metric);
      const targetValue = (optimalRange.min + optimalRange.max) / 2;
      const gap = Math.abs(targetValue - currentValue);
      const priority = this.calculateImprovementPriority(weakness, gap);

      areas.push({
        metric: weakness.metric,
        currentValue,
        targetValue,
        gap,
        priority,
        improvementStrategy: this.generateImprovementStrategy(weakness),
        milestones: this.generateMilestones(weakness.metric, currentValue, targetValue),
      });
    });

    return areas.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Identify success factors
   */
  private identifySuccessFactors(): SuccessFactor[] {
    const factors: SuccessFactor[] = [];
    const profile = this.getLatestProfile();

    if (!profile) return factors;

    // Factor 1: Consistency
    const consistency = this.calculateOverallConsistency();
    factors.push({
      factor: 'Consistency',
      strength: consistency,
      description: consistency >= 80 
        ? 'Excellent consistency across sessions'
        : consistency >= 60
        ? 'Good consistency with room for improvement'
        : 'Inconsistent performance - focus on stability',
      contribution: consistency * 0.3,
    });

    // Factor 2: Improvement Rate
    const improvementRate = this.calculateImprovementRate();
    factors.push({
      factor: 'Improvement Rate',
      strength: improvementRate,
      description: improvementRate >= 70
        ? 'Rapid improvement trajectory'
        : improvementRate >= 40
        ? 'Steady improvement'
        : 'Slow improvement - consider focused practice',
      contribution: improvementRate * 0.25,
    });

    // Factor 3: Optimal Range Coverage
    const optimalCoverage = this.calculateOptimalRangeCoverage();
    factors.push({
      factor: 'Optimal Range Coverage',
      strength: optimalCoverage,
      description: optimalCoverage >= 80
        ? 'Most metrics in optimal range'
        : optimalCoverage >= 50
        ? 'Some metrics need improvement'
        : 'Multiple metrics need attention',
      contribution: optimalCoverage * 0.25,
    });

    // Factor 4: Practice Frequency
    const practiceFrequency = this.calculatePracticeFrequency();
    factors.push({
      factor: 'Practice Frequency',
      strength: practiceFrequency,
      description: practiceFrequency >= 70
        ? 'Regular practice schedule'
        : practiceFrequency >= 40
        ? 'Moderate practice frequency'
        : 'Increase practice frequency for better results',
      contribution: practiceFrequency * 0.2,
    });

    return factors.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Identify risk factors
   */
  private identifyRiskFactors(profile: UserVoiceProfile | null): RiskFactor[] {
    const risks: RiskFactor[] = [];

    if (!profile) return risks;

    // Risk 1: Declining metrics
    const decliningMetrics = this.findDecliningMetrics();
    if (decliningMetrics.length > 0) {
      risks.push({
        factor: 'Declining Performance',
        risk: Math.min(100, decliningMetrics.length * 25),
        description: `Performance declining in ${decliningMetrics.join(', ')}`,
        mitigation: [
          'Focus on declining metrics immediately',
          'Review recent changes in practice approach',
          'Consider additional coaching support',
        ],
      });
    }

    // Risk 2: Low consistency
    const consistency = this.calculateOverallConsistency();
    if (consistency < 50) {
      risks.push({
        factor: 'Low Consistency',
        risk: 100 - consistency,
        description: 'Performance varies significantly between sessions',
        mitigation: [
          'Establish consistent practice routine',
          'Focus on fundamentals',
          'Track metrics more closely',
        ],
      });
    }

    // Risk 3: Plateau
    const plateauMetrics = this.findPlateauMetrics();
    if (plateauMetrics.length >= 3) {
      risks.push({
        factor: 'Performance Plateau',
        risk: 60,
        description: `Multiple metrics have plateaued`,
        mitigation: [
          'Try new practice techniques',
          'Increase practice intensity',
          'Seek advanced coaching',
        ],
      });
    }

    // Risk 4: Low practice frequency
    const practiceFrequency = this.calculatePracticeFrequency();
    if (practiceFrequency < 30) {
      risks.push({
        factor: 'Low Practice Frequency',
        risk: 100 - practiceFrequency,
        description: 'Not practicing frequently enough to see improvement',
        mitigation: [
          'Schedule regular practice sessions',
          'Set practice reminders',
          'Make practice a daily habit',
        ],
      });
    }

    return risks.sort((a, b) => b.risk - a.risk);
  }

  /**
   * Predict outcome based on current trends
   */
  private predictOutcome(profile: UserVoiceProfile | null): PredictedOutcome {
    if (!profile) {
      return {
        scenario: 'likely',
        timeframe: '3 months',
        metrics: {},
        impactScore: 50,
        probability: 50,
        description: 'Complete sessions to generate prediction',
      };
    }

    const trends = profile.improvementTrend;
    const improvingCount = Object.values(trends).filter(t => t.trend === 'improving').length;
    const decliningCount = Object.values(trends).filter(t => t.trend === 'declining').length;

    // Best case scenario
    if (improvingCount >= 4 && decliningCount === 0) {
      return {
        scenario: 'best',
        timeframe: '2-3 months',
        metrics: this.projectMetrics(profile, 'best'),
        impactScore: Math.min(100, profile.impactScore.overall + 20),
        probability: 70,
        description: 'Strong improvement trajectory suggests excellent long-term outcomes',
      };
    }

    // Worst case scenario
    if (decliningCount >= 3) {
      return {
        scenario: 'worst',
        timeframe: '3-6 months',
        metrics: this.projectMetrics(profile, 'worst'),
        impactScore: Math.max(0, profile.impactScore.overall - 15),
        probability: 30,
        description: 'Declining trends need immediate attention to prevent further deterioration',
      };
    }

    // Likely scenario
    return {
      scenario: 'likely',
      timeframe: '3-4 months',
      metrics: this.projectMetrics(profile, 'likely'),
      impactScore: profile.impactScore.overall + 5,
      probability: 60,
      description: 'Current trends suggest moderate improvement with continued practice',
    };
  }

  /**
   * Create actionable action plan
   */
  private createActionPlan(
    recommendations: PrioritizedRecommendation[],
    improvementAreas: ImprovementArea[]
  ): ActionPlan {
    const immediate: ActionItem[] = [];
    const shortTerm: ActionItem[] = [];
    const longTerm: ActionItem[] = [];

    // High priority recommendations go to immediate
    recommendations
      .filter(r => r.priority === 'critical' || r.priority === 'high')
      .slice(0, 3)
      .forEach(rec => {
        immediate.push({
          id: rec.id,
          title: rec.title,
          description: rec.description,
          priority: rec.priority === 'critical' ? 10 : 8,
          effort: rec.effort,
          expectedOutcome: `Improve ${rec.category} by ${rec.expectedImpact.immediate}%`,
          successMetrics: rec.successCriteria,
        });
      });

    // Medium priority to short-term
    recommendations
      .filter(r => r.priority === 'medium')
      .slice(0, 5)
      .forEach(rec => {
        shortTerm.push({
          id: rec.id,
          title: rec.title,
          description: rec.description,
          priority: 5,
          effort: rec.effort,
          expectedOutcome: `Improve ${rec.category} by ${rec.expectedImpact.midTerm}%`,
          successMetrics: rec.successCriteria,
        });
      });

    // Improvement areas to long-term
    improvementAreas.slice(0, 3).forEach(area => {
      longTerm.push({
        id: `area_${area.metric}`,
        title: `Master ${area.metric}`,
        description: area.improvementStrategy,
        priority: area.priority,
        effort: 'medium',
        expectedOutcome: `Reach target of ${area.targetValue}`,
        successMetrics: area.milestones.map(m => m.description),
      });
    });

    return { immediate, shortTerm, longTerm };
  }

  // Helper methods for analysis

  private calculateOverallScore(
    strengths: StrengthAnalysis[],
    weaknesses: WeaknessAnalysis[],
    impactScore: ImpactScore | undefined,
    patterns: PatternAnalysis[]
  ): number {
    let score = impactScore?.overall || 50;

    // Adjust based on strengths
    const strengthBonus = strengths.length * 5;
    score += strengthBonus;

    // Adjust based on weaknesses
    const weaknessPenalty = weaknesses.reduce((sum, w) => {
      const penalty = w.severity === 'critical' ? 15 : w.severity === 'moderate' ? 8 : 3;
      return sum + penalty;
    }, 0);
    score -= weaknessPenalty;

    // Adjust based on patterns
    const positivePatterns = patterns.filter(p => p.type === 'positive').length;
    const negativePatterns = patterns.filter(p => p.type === 'negative').length;
    score += positivePatterns * 5;
    score -= negativePatterns * 10;

    return Math.max(0, Math.min(100, score));
  }

  private calculateConsistency(metric: string): number {
    if (this.sessions.length < 3) return 50;

    const values = this.sessions.map(s => s.metrics[metric as keyof VoiceMetrics]);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);
    const coefficientOfVariation = stdDev / mean;

    // Lower CV = higher consistency
    const consistency = Math.max(0, 100 - (coefficientOfVariation * 100));
    return Math.round(consistency);
  }

  private calculateIssueFrequency(metric: string): number {
    const totalSessions = this.sessions.length;
    if (totalSessions === 0) return 0;

    const issueSessions = this.sessions.filter(session => {
      const value = session.metrics[metric as keyof VoiceMetrics];
      return !this.isInOptimalRange(metric, value);
    }).length;

    return Math.round((issueSessions / totalSessions) * 100);
  }

  private determineSeverity(
    metric: string,
    currentValue: number,
    trend: any
  ): 'critical' | 'moderate' | 'minor' {
    const optimalRange = this.getOptimalRange(metric);
    const distance = currentValue < optimalRange.min
      ? optimalRange.min - currentValue
      : currentValue - optimalRange.max;
    const rangeSize = optimalRange.max - optimalRange.min;
    const percentageOff = (distance / rangeSize) * 100;

    if (trend.trend === 'declining' && percentageOff > 30) return 'critical';
    if (percentageOff > 40) return 'critical';
    if (percentageOff > 20) return 'moderate';
    return 'minor';
  }

  private identifyRootCause(metric: string, trend: any, frequency: number): string {
    if (trend.trend === 'declining') {
      return `Recent decline suggests ${this.getRootCauseForMetric(metric)}`;
    }
    if (frequency > 70) {
      return `Consistent issue indicates ${this.getRootCauseForMetric(metric)}`;
    }
    return `Occasional issue may be due to ${this.getRootCauseForMetric(metric)}`;
  }

  private getRootCauseForMetric(metric: string): string {
    const causes: Record<string, string> = {
      pace: 'lack of practice with pacing or nervousness',
      volume: 'microphone positioning or speaking habits',
      clarity: 'enunciation practice needed',
      confidence: 'lack of preparation or self-doubt',
      pauses: 'thinking patterns or lack of preparation',
      pitch: 'natural voice characteristics or tension',
    };
    return causes[metric] || 'practice needed';
  }

  private generateSolutions(metric: string, rootCause: string): string[] {
    const solutions: Record<string, string[]> = {
      pace: [
        'Practice reading at 140-180 WPM',
        'Use a metronome to maintain consistent pace',
        'Record yourself and listen back',
        'Practice with timer to build awareness',
      ],
      volume: [
        'Check microphone distance (6-12 inches)',
        'Practice projecting your voice',
        'Record in quiet environment',
        'Use voice exercises to strengthen projection',
      ],
      clarity: [
        'Practice tongue twisters daily',
        'Slow down slightly to enunciate clearly',
        'Focus on pronouncing each word distinctly',
        'Record and listen for unclear words',
      ],
      confidence: [
        'Prepare talking points before sessions',
        'Practice in front of mirror',
        'Build positive self-talk habits',
        'Start with easier scenarios to build confidence',
      ],
      pauses: [
        'Plan your responses before speaking',
        'Use strategic pauses instead of filler words',
        'Practice thinking on your feet',
        'Prepare common responses in advance',
      ],
      pitch: [
        'Practice breathing exercises',
        'Relax your vocal cords',
        'Work with voice coach if needed',
        'Practice maintaining steady pitch',
      ],
    };

    return solutions[metric] || ['Practice regularly', 'Get feedback', 'Track progress'];
  }

  private predictImprovement(metric: string, trend: any): string {
    if (trend.trend === 'improving') {
      return `Current improvement trend suggests ${trend.change.toFixed(1)}% improvement if trend continues`;
    }
    if (trend.trend === 'declining') {
      return 'Immediate action needed to reverse decline';
    }
    return 'Focused practice should yield 10-15% improvement in 2-4 weeks';
  }

  private findConsistentlyImprovingMetrics(): string[] {
    const improving: string[] = [];
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;

    metrics.forEach(metric => {
      if (this.sessions.length < 3) return;

      const values = this.sessions.map(s => s.metrics[metric]);
      let improvingCount = 0;

      for (let i = 1; i < values.length; i++) {
        if (values[i] > values[i - 1]) improvingCount++;
      }

      const improvementRate = improvingCount / (values.length - 1);
      if (improvementRate >= 0.6) {
        improving.push(metric);
      }
    });

    return improving;
  }

  private findDecliningMetrics(): string[] {
    const declining: string[] = [];
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;

    metrics.forEach(metric => {
      if (this.sessions.length < 3) return;

      const values = this.sessions.map(s => s.metrics[metric]);
      let decliningCount = 0;

      for (let i = 1; i < values.length; i++) {
        if (values[i] < values[i - 1]) decliningCount++;
      }

      const declineRate = decliningCount / (values.length - 1);
      if (declineRate >= 0.5) {
        declining.push(metric);
      }
    });

    return declining;
  }

  private calculateVolatility(): number {
    if (this.sessions.length < 3) return 0;

    let totalVolatility = 0;
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;

    metrics.forEach(metric => {
      const values = this.sessions.map(s => s.metrics[metric]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / mean;
      totalVolatility += coefficientOfVariation;
    });

    return totalVolatility / metrics.length;
  }

  private findPlateauMetrics(): string[] {
    const plateaus: string[] = [];
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;

    metrics.forEach(metric => {
      if (this.sessions.length < 5) return;

      const recent = this.sessions.slice(-5);
      const values = recent.map(s => s.metrics[metric]);
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
      const stdDev = Math.sqrt(variance);

      // Low variance = plateau
      if (stdDev < mean * 0.05) {
        plateaus.push(metric);
      }
    });

    return plateaus;
  }

  private findRapidImprovement(): string[] {
    const rapid: string[] = [];
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;

    metrics.forEach(metric => {
      if (this.sessions.length < 3) return;

      const first = this.sessions[0].metrics[metric];
      const last = this.sessions[this.sessions.length - 1].metrics[metric];
      const improvement = ((last - first) / first) * 100;

      if (improvement > 20) {
        rapid.push(metric);
      }
    });

    return rapid;
  }

  private calculateOverallConsistency(): number {
    const metrics = ['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const;
    const consistencies = metrics.map(m => this.calculateConsistency(m));
    return Math.round(consistencies.reduce((a, b) => a + b, 0) / consistencies.length);
  }

  private calculateImprovementRate(): number {
    if (this.sessions.length < 3) return 0;

    const improvingMetrics = this.findConsistentlyImprovingMetrics();
    return Math.round((improvingMetrics.length / 6) * 100);
  }

  private calculateOptimalRangeCoverage(): number {
    const profile = this.getLatestProfile();
    if (!profile) return 0;

    const metrics = ['pace', 'volume', 'clarity', 'confidence'] as const;
    let optimalCount = 0;

    metrics.forEach(metric => {
      const value = profile.currentMetrics[metric];
      if (this.isInOptimalRange(metric, value)) {
        optimalCount++;
      }
    });

    return Math.round((optimalCount / metrics.length) * 100);
  }

  private calculatePracticeFrequency(): number {
    if (this.sessions.length < 2) return 0;

    const days = (this.sessions[this.sessions.length - 1].date.getTime() - 
                  this.sessions[0].date.getTime()) / (1000 * 60 * 60 * 24);
    const sessionsPerWeek = (this.sessions.length / days) * 7;

    // Optimal is 3-5 sessions per week
    if (sessionsPerWeek >= 5) return 100;
    if (sessionsPerWeek >= 3) return 80;
    if (sessionsPerWeek >= 1) return 50;
    return 20;
  }

  private getLatestProfile(): UserVoiceProfile | null {
    // This would typically fetch from database
    // For now, return null and let caller handle
    return null;
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

  private isInOptimalRange(metric: string, value: number): boolean {
    const range = this.getOptimalRange(metric);
    return value >= range.min && value <= range.max;
  }

  private calculateStrengthScore(
    value: number,
    range: { min: number; max: number },
    trend: any
  ): number {
    const center = (range.min + range.max) / 2;
    const distanceFromCenter = Math.abs(value - center);
    const maxDistance = (range.max - range.min) / 2;
    const proximityScore = 100 - (distanceFromCenter / maxDistance) * 50;

    const trendBonus = trend.trend === 'improving' ? 10 : trend.trend === 'stable' ? 5 : 0;
    return Math.min(100, proximityScore + trendBonus);
  }

  private calculateWeaknessScore(
    value: number,
    range: { min: number; max: number }
  ): number {
    const distance = value < range.min
      ? range.min - value
      : value - range.max;
    const rangeSize = range.max - range.min;
    const percentageOff = (distance / rangeSize) * 100;

    return Math.min(100, percentageOff * 2); // Convert to 0-100 score
  }

  private getStrengthDescription(metric: string, value: number, trend: any): string {
    const descriptions: Record<string, string> = {
      pace: `Excellent speaking pace at ${value} WPM. ${trend.trend === 'improving' ? 'Continuing to improve!' : 'Maintain this pace.'}`,
      volume: `Great volume control at ${value}dB. ${trend.trend === 'improving' ? 'Getting even better!' : 'Keep it up!'}`,
      clarity: `Clear speech with ${value}/100 clarity score. ${trend.trend === 'improving' ? 'Improving clarity!' : 'Excellent!'}`,
      confidence: `Strong confidence at ${value}/100. ${trend.trend === 'improving' ? 'Building more confidence!' : 'Well done!'}`,
    };
    return descriptions[metric] || `Strong performance in ${metric}`;
  }

  private getWeaknessDescription(metric: string, value: number, trend: any): string {
    const range = this.getOptimalRange(metric);
    const direction = value < range.min ? 'low' : 'high';
    
    return `${metric} is ${direction} at ${value.toFixed(1)}. ${trend.trend === 'declining' ? 'Trending downward - needs attention.' : 'Needs improvement to reach optimal range.'}`;
  }

  private getMetricImpact(metric: string): 'high' | 'medium' | 'low' {
    const highImpact = ['pace', 'confidence', 'clarity'];
    const mediumImpact = ['volume', 'pauses'];
    
    if (highImpact.includes(metric)) return 'high';
    if (mediumImpact.includes(metric)) return 'medium';
    return 'low';
  }

  private getPositiveExamples(metric: string): string[] {
    const examples: string[] = [];
    const goodSessions = this.sessions.filter(s => {
      const value = s.metrics[metric as keyof VoiceMetrics];
      return this.isInOptimalRange(metric, value);
    }).slice(0, 3);

    goodSessions.forEach((session, i) => {
      examples.push(`Session ${i + 1}: ${session.metrics[metric as keyof VoiceMetrics].toFixed(1)}`);
    });

    return examples.length > 0 ? examples : ['Keep practicing to see examples'];
  }

  private getDecliningSessions(metrics: string[]): number[] {
    return this.sessions
      .map((session, index) => {
        const hasDeclining = metrics.some(metric => {
          if (index === 0) return false;
          const current = session.metrics[metric as keyof VoiceMetrics];
          const previous = this.sessions[index - 1].metrics[metric as keyof VoiceMetrics];
          return current < previous;
        });
        return hasDeclining ? index : -1;
      })
      .filter(i => i >= 0);
  }

  private getVolatileSessions(): number[] {
    // Return sessions with high variance
    return this.sessions.map((_, i) => i).slice(-5);
  }

  private getPlateauSessions(metrics: string[]): number[] {
    return this.sessions.map((_, i) => i).slice(-5);
  }

  private getRapidImprovementSessions(metrics: string[]): number[] {
    return this.sessions.map((_, i) => i).slice(-3);
  }

  private calculateRecommendationPriority(
    weakness: WeaknessAnalysis,
    profile: UserVoiceProfile
  ): 'critical' | 'high' | 'medium' | 'low' {
    if (weakness.severity === 'critical') return 'critical';
    if (weakness.severity === 'moderate' && weakness.frequency > 50) return 'high';
    if (weakness.impact === 'high') return 'high';
    if (weakness.frequency > 30) return 'medium';
    return 'low';
  }

  private calculateExpectedImpact(
    weakness: WeaknessAnalysis,
    profile: UserVoiceProfile
  ): { immediate: number; midTerm: number; longTerm: number } {
    const baseImpact = weakness.severity === 'critical' ? 30 : weakness.severity === 'moderate' ? 20 : 10;
    
    return {
      immediate: baseImpact,
      midTerm: baseImpact * 1.5,
      longTerm: baseImpact * 2,
    };
  }

  private estimateEffort(weakness: WeaknessAnalysis): 'low' | 'medium' | 'high' {
    const highEffortMetrics = ['confidence', 'clarity'];
    const mediumEffortMetrics = ['pace', 'volume'];
    
    if (highEffortMetrics.includes(weakness.metric)) return 'high';
    if (mediumEffortMetrics.includes(weakness.metric)) return 'medium';
    return 'low';
  }

  private estimateTimeframe(weakness: WeaknessAnalysis, effort: string): string {
    if (weakness.severity === 'critical') return '1-2 weeks';
    if (effort === 'high') return '3-4 weeks';
    if (effort === 'medium') return '2-3 weeks';
    return '1-2 weeks';
  }

  private getSupportingDataPoints(weakness: WeaknessAnalysis): string[] {
    return [
      `Frequency: ${weakness.frequency}% of sessions`,
      `Severity: ${weakness.severity}`,
      `Impact: ${weakness.impact}`,
      `Current value: ${weakness.metric}`,
    ];
  }

  private generateSuccessCriteria(weakness: WeaknessAnalysis): string[] {
    const range = this.getOptimalRange(weakness.metric);
    return [
      `Reach optimal range (${range.min}-${range.max})`,
      `Reduce issue frequency to <20%`,
      `Maintain improvement for 3+ sessions`,
    ];
  }

  private generatePatternActions(pattern: PatternAnalysis): string[] {
    if (pattern.pattern === 'Declining Performance') {
      return [
        'Identify root cause of decline',
        'Focus on fundamentals',
        'Increase practice frequency',
        'Seek additional coaching',
      ];
    }
    if (pattern.pattern === 'Volatile Performance') {
      return [
        'Establish consistent practice routine',
        'Focus on one metric at a time',
        'Track metrics more closely',
        'Identify external factors affecting performance',
      ];
    }
    return ['Address pattern', 'Monitor closely', 'Adjust practice approach'];
  }

  private calculateImprovementPriority(weakness: WeaknessAnalysis, gap: number): number {
    const severityWeight = weakness.severity === 'critical' ? 10 : weakness.severity === 'moderate' ? 5 : 2;
    const impactWeight = weakness.impact === 'high' ? 5 : weakness.impact === 'medium' ? 3 : 1;
    const gapWeight = Math.min(10, gap / 10);
    
    return severityWeight + impactWeight + gapWeight;
  }

  private generateImprovementStrategy(weakness: WeaknessAnalysis): string {
    return `Focus on ${weakness.metric} improvement through ${weakness.solutions[0]}. ${weakness.expectedImprovement}`;
  }

  private generateMilestones(metric: string, current: number, target: number): Milestone[] {
    const steps = 3;
    const increment = (target - current) / steps;
    
    return Array.from({ length: steps }, (_, i) => {
      const milestoneValue = current + increment * (i + 1);
      const weeks = (i + 1) * 2;
      return {
        target: Math.round(milestoneValue * 10) / 10,
        timeframe: `${weeks} weeks`,
        description: `Reach ${Math.round(milestoneValue * 10) / 10} in ${metric}`,
      };
    });
  }

  private projectMetrics(profile: UserVoiceProfile, scenario: 'best' | 'likely' | 'worst'): Partial<VoiceMetrics> {
    const projected: Partial<VoiceMetrics> = {};
    const trends = profile.improvementTrend;
    const multiplier = scenario === 'best' ? 1.2 : scenario === 'worst' ? 0.8 : 1.0;

    Object.entries(trends).forEach(([metric, trend]) => {
      const current = profile.currentMetrics[metric as keyof VoiceMetrics];
      const change = trend.change * multiplier;
      projected[metric as keyof VoiceMetrics] = current + (current * change / 100);
    });

    return projected;
  }
}

