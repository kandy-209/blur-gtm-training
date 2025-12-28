/**
 * Advanced Analytics Enhancements
 * Performance tracking, benchmarking, and predictive insights
 */

export interface PerformanceBenchmark {
  metric: string;
  userValue: number;
  averageValue: number;
  percentile: number;
  trend: 'improving' | 'stable' | 'declining';
  comparison: 'above' | 'at' | 'below';
}

export interface PredictiveInsight {
  type: 'success' | 'warning' | 'opportunity';
  title: string;
  description: string;
  confidence: number;
  recommendation: string;
  timeframe: 'short' | 'medium' | 'long';
}

export interface SkillProgression {
  skill: string;
  currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  progression: Array<{
    date: Date;
    score: number;
  }>;
  trend: 'improving' | 'stable' | 'declining';
  nextMilestone: {
    level: string;
    targetScore: number;
    estimatedTime: string;
  };
}

/**
 * Calculate performance benchmarks
 */
export function calculateBenchmarks(
  userMetrics: Record<string, number>,
  averageMetrics: Record<string, number>
): PerformanceBenchmark[] {
  const benchmarks: PerformanceBenchmark[] = [];

  Object.keys(userMetrics).forEach((metric) => {
    const userValue = userMetrics[metric];
    const averageValue = averageMetrics[metric] || 0;
    
    // Calculate percentile (simplified - would use actual distribution in production)
    const difference = userValue - averageValue;
    const percentile = difference > 0 
      ? Math.min(100, 50 + (difference / averageValue) * 50)
      : Math.max(0, 50 + (difference / averageValue) * 50);

    benchmarks.push({
      metric,
      userValue,
      averageValue,
      percentile: Math.round(percentile),
      trend: 'stable', // Would calculate from historical data
      comparison: userValue > averageValue ? 'above' : userValue < averageValue ? 'below' : 'at',
    });
  });

  return benchmarks;
}

/**
 * Generate predictive insights
 */
export function generatePredictiveInsights(
  recentScores: number[],
  skillProgressions: SkillProgression[],
  scenarioCompletionRate: number
): PredictiveInsight[] {
  const insights: PredictiveInsight[] = [];

  // Analyze score trends
  if (recentScores.length >= 3) {
    const trend = recentScores[0] - recentScores[recentScores.length - 1];
    const avgScore = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;

    if (trend > 10 && avgScore >= 75) {
      insights.push({
        type: 'success',
        title: 'Strong Improvement Trend',
        description: `Your scores have improved by ${trend.toFixed(0)} points recently. You're on track for advanced performance.`,
        confidence: 85,
        recommendation: 'Continue practicing advanced scenarios to maintain momentum.',
        timeframe: 'short',
      });
    } else if (trend < -10) {
      insights.push({
        type: 'warning',
        title: 'Performance Decline Detected',
        description: `Your scores have declined by ${Math.abs(trend).toFixed(0)} points. Review fundamentals.`,
        confidence: 75,
        recommendation: 'Focus on core skills and review feedback from previous sessions.',
        timeframe: 'short',
      });
    }
  }

  // Analyze skill progressions
  skillProgressions.forEach((progression) => {
    if (progression.trend === 'improving' && progression.currentLevel !== 'expert') {
      insights.push({
        type: 'opportunity',
        title: `${progression.skill} Skill Advancement`,
        description: `You're improving in ${progression.skill}. You could reach ${progression.nextMilestone.level} soon.`,
        confidence: 70,
        recommendation: `Focus on ${progression.skill} to reach the next level.`,
        timeframe: 'medium',
      });
    }
  });

  // Analyze completion rate
  if (scenarioCompletionRate < 0.5) {
    insights.push({
      type: 'warning',
      title: 'Low Completion Rate',
      description: `You're completing ${(scenarioCompletionRate * 100).toFixed(0)}% of scenarios. Focus on finishing sessions.`,
      confidence: 80,
      recommendation: 'Set aside dedicated time to complete full scenarios for better learning.',
      timeframe: 'medium',
    });
  } else if (scenarioCompletionRate >= 0.8) {
    insights.push({
      type: 'success',
      title: 'High Completion Rate',
      description: `You're completing ${(scenarioCompletionRate * 100).toFixed(0)}% of scenarios. Excellent commitment!`,
      confidence: 90,
      recommendation: 'Try more challenging scenarios to continue growing.',
      timeframe: 'short',
    });
  }

  return insights;
}

/**
 * Calculate skill progression
 */
export function calculateSkillProgression(
  skillName: string,
  historicalScores: Array<{ date: Date; score: number }>
): SkillProgression {
  if (historicalScores.length === 0) {
    return {
      skill: skillName,
      currentLevel: 'beginner',
      progression: [],
      trend: 'stable',
      nextMilestone: {
        level: 'intermediate',
        targetScore: 60,
        estimatedTime: '2-3 weeks',
      },
    };
  }

  const sortedScores = [...historicalScores].sort((a, b) => 
    a.date.getTime() - b.date.getTime()
  );
  const recentScores = sortedScores.slice(-5);
  const avgRecent = recentScores.reduce((a, b) => a + b.score, 0) / recentScores.length;
  
  // Determine trend
  let trend: 'improving' | 'stable' | 'declining' = 'stable';
  if (recentScores.length >= 2) {
    const first = recentScores[0].score;
    const last = recentScores[recentScores.length - 1].score;
    if (last > first + 5) trend = 'improving';
    else if (last < first - 5) trend = 'declining';
  }

  // Determine current level
  let currentLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner';
  if (avgRecent >= 90) currentLevel = 'expert';
  else if (avgRecent >= 75) currentLevel = 'advanced';
  else if (avgRecent >= 60) currentLevel = 'intermediate';

  // Calculate next milestone
  let nextMilestone = {
    level: 'intermediate',
    targetScore: 60,
    estimatedTime: '2-3 weeks',
  };

  if (currentLevel === 'beginner') {
    nextMilestone = { level: 'intermediate', targetScore: 60, estimatedTime: '2-3 weeks' };
  } else if (currentLevel === 'intermediate') {
    nextMilestone = { level: 'advanced', targetScore: 75, estimatedTime: '3-4 weeks' };
  } else if (currentLevel === 'advanced') {
    nextMilestone = { level: 'expert', targetScore: 90, estimatedTime: '4-6 weeks' };
  }

  return {
    skill: skillName,
    currentLevel,
    progression: sortedScores,
    trend,
    nextMilestone,
  };
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(
  userId: string,
  metrics: Record<string, number>,
  benchmarks: PerformanceBenchmark[],
  insights: PredictiveInsight[],
  skillProgressions: SkillProgression[]
): {
  overallScore: number;
  benchmarks: PerformanceBenchmark[];
  insights: PredictiveInsight[];
  skillProgressions: SkillProgression[];
  recommendations: string[];
  nextSteps: string[];
} {
  const overallScore = metrics.overallScore || 0;
  
  const recommendations: string[] = [];
  const nextSteps: string[] = [];

  // Generate recommendations from insights
  insights.forEach((insight) => {
    if (insight.type === 'warning' || insight.type === 'opportunity') {
      recommendations.push(insight.recommendation);
    }
  });

  // Generate next steps from skill progressions
  skillProgressions
    .filter((sp) => sp.trend === 'improving' || sp.currentLevel !== 'expert')
    .forEach((sp) => {
      nextSteps.push(`Focus on ${sp.skill} to reach ${sp.nextMilestone.level} level`);
    });

  return {
    overallScore,
    benchmarks,
    insights,
    skillProgressions,
    recommendations,
    nextSteps,
  };
}

