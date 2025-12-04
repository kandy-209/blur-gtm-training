/**
 * Practice Coach
 * Provides actionable exercises, drills, and coaching to help users improve
 */

import type { VoiceMetrics, FeedbackMessage } from './types';
import type { UserVoiceProfile } from './user-model';

export interface PracticeExercise {
  id: string;
  name: string;
  description: string;
  targetMetric: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // minutes
  instructions: string[];
  tips: string[];
  expectedImprovement: string;
  videoUrl?: string;
  audioExample?: string;
}

export interface PracticeDrill {
  id: string;
  name: string;
  description: string;
  targetMetrics: string[];
  duration: number; // minutes
  steps: DrillStep[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  frequency: 'daily' | 'weekly' | 'as-needed';
}

export interface DrillStep {
  step: number;
  instruction: string;
  duration: number; // seconds
  targetValue?: number;
  tips?: string[];
}

export interface DailyChallenge {
  id: string;
  date: string;
  name: string;
  description: string;
  targetMetric: string;
  goal: number;
  currentProgress: number;
  reward: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ImprovementGoal {
  id: string;
  metric: string;
  currentValue: number;
  targetValue: number;
  deadline: Date;
  progress: number; // 0-100
  milestones: GoalMilestone[];
  practicePlan: PracticeExercise[];
}

export interface GoalMilestone {
  value: number;
  date: Date;
  achieved: boolean;
  reward?: string;
}

export interface RealTimeCoachingTip {
  metric: string;
  currentValue: number;
  targetValue: number;
  tip: string;
  urgency: 'low' | 'medium' | 'high';
  actionable: boolean;
  example?: string;
}

export class PracticeCoach {
  /**
   * Generate practice exercises for a specific metric
   */
  generatePracticeExercises(metric: string, currentValue: number): PracticeExercise[] {
    const exercises: PracticeExercise[] = [];

    switch (metric) {
      case 'pace':
        exercises.push(...this.getPaceExercises(currentValue));
        break;
      case 'volume':
        exercises.push(...this.getVolumeExercises(currentValue));
        break;
      case 'clarity':
        exercises.push(...this.getClarityExercises(currentValue));
        break;
      case 'confidence':
        exercises.push(...this.getConfidenceExercises(currentValue));
        break;
      case 'pauses':
        exercises.push(...this.getPauseExercises(currentValue));
        break;
      case 'pitch':
        exercises.push(...this.getPitchExercises(currentValue));
        break;
    }

    return exercises;
  }

  /**
   * Generate real-time coaching tips based on current metrics
   */
  generateRealTimeTips(metrics: VoiceMetrics): RealTimeCoachingTip[] {
    const tips: RealTimeCoachingTip[] = [];
    const optimalRanges = {
      pace: { min: 140, max: 180 },
      volume: { min: -18, max: -6 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
      pauses: { min: 3, max: 8 },
    };

    Object.entries(optimalRanges).forEach(([metric, range]) => {
      const value = metrics[metric as keyof VoiceMetrics];
      
      if (value < range.min) {
        tips.push(this.getLowValueTip(metric, value, range.min));
      } else if (value > range.max) {
        tips.push(this.getHighValueTip(metric, value, range.max));
      }
    });

    return tips.sort((a, b) => {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
    });
  }

  /**
   * Create improvement goal with practice plan
   */
  createImprovementGoal(
    metric: string,
    currentValue: number,
    targetValue: number,
    deadline: Date
  ): ImprovementGoal {
    const exercises = this.generatePracticeExercises(metric, currentValue);
    const gap = Math.abs(targetValue - currentValue);
    const progress = this.calculateProgress(currentValue, targetValue);
    
    const milestones = this.generateMilestones(currentValue, targetValue, deadline);

    return {
      id: `goal_${metric}_${Date.now()}`,
      metric,
      currentValue,
      targetValue,
      deadline,
      progress,
      milestones,
      practicePlan: exercises.slice(0, 5), // Top 5 exercises
    };
  }

  /**
   * Generate daily challenge
   */
  generateDailyChallenge(profile: UserVoiceProfile | null): DailyChallenge {
    if (!profile) {
      return this.getDefaultChallenge();
    }

    // Find weakest metric
    const weaknesses = Object.entries(profile.improvementTrend)
      .filter(([_, trend]) => trend.trend === 'declining' || !this.isInOptimalRange(_, trend.current))
      .sort(([_, a], [__, b]) => {
        const aGap = Math.abs(a.current - this.getOptimalCenter(_));
        const bGap = Math.abs(b.current - this.getOptimalCenter(__));
        return bGap - aGap;
      });

    if (weaknesses.length === 0) {
      return this.getMaintenanceChallenge();
    }

    const [metric, trend] = weaknesses[0];
    const current = trend.current;
    const target = this.getOptimalCenter(metric);
    const goal = current + (target - current) * 0.2; // 20% improvement

    return {
      id: `challenge_${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      name: `Improve ${metric}`,
      description: `Focus on improving your ${metric} today`,
      targetMetric: metric,
      goal: Math.round(goal * 10) / 10,
      currentProgress: 0,
      reward: 'Achievement badge + 10 points',
      difficulty: Math.abs(goal - current) > 20 ? 'hard' : Math.abs(goal - current) > 10 ? 'medium' : 'easy',
    };
  }

  /**
   * Generate practice drill for specific metrics
   */
  generatePracticeDrill(metrics: string[]): PracticeDrill {
    const drills: PracticeDrill[] = [];

    if (metrics.includes('pace')) {
      drills.push(this.getPaceDrill());
    }
    if (metrics.includes('volume')) {
      drills.push(this.getVolumeDrill());
    }
    if (metrics.includes('clarity')) {
      drills.push(this.getClarityDrill());
    }
    if (metrics.includes('confidence')) {
      drills.push(this.getConfidenceDrill());
    }

    // Return combined drill if multiple metrics
    if (drills.length > 1) {
      return this.combineDrills(drills);
    }

    return drills[0] || this.getGeneralDrill();
  }

  // Pace exercises
  private getPaceExercises(currentValue: number): PracticeExercise[] {
    const exercises: PracticeExercise[] = [];

    if (currentValue < 140) {
      exercises.push({
        id: 'pace_slow_1',
        name: 'Metronome Practice',
        description: 'Use a metronome to practice speaking at optimal pace',
        targetMetric: 'pace',
        difficulty: 'beginner',
        duration: 10,
        instructions: [
          'Set metronome to 160 BPM',
          'Read a paragraph matching the beat',
          'Focus on one word per beat',
          'Gradually increase speed',
        ],
        tips: [
          'Start slow and build up',
          'Don\'t rush - clarity is more important',
          'Practice daily for best results',
        ],
        expectedImprovement: '5-10 WPM increase in 1 week',
      });

      exercises.push({
        id: 'pace_slow_2',
        name: 'Reading Speed Drill',
        description: 'Practice reading at target pace',
        targetMetric: 'pace',
        difficulty: 'intermediate',
        duration: 15,
        instructions: [
          'Choose a 200-word article',
          'Time yourself reading it',
          'Aim for 1.25 minutes (160 WPM)',
          'Repeat until you hit target',
        ],
        tips: [
          'Focus on smooth, even pace',
          'Avoid rushing or slowing down',
          'Record yourself to track progress',
        ],
        expectedImprovement: '10-15 WPM increase in 2 weeks',
      });
    } else if (currentValue > 180) {
      exercises.push({
        id: 'pace_fast_1',
        name: 'Pause Practice',
        description: 'Learn to slow down and add strategic pauses',
        targetMetric: 'pace',
        difficulty: 'beginner',
        duration: 10,
        instructions: [
          'Read a paragraph slowly',
          'Add a pause after each sentence',
          'Count to 2 during each pause',
          'Focus on clarity over speed',
        ],
        tips: [
          'Pauses help listeners process',
          'Slower is often clearer',
          'Practice breathing during pauses',
        ],
        expectedImprovement: '10-15 WPM reduction in 1 week',
      });
    }

    return exercises;
  }

  // Volume exercises
  private getVolumeExercises(currentValue: number): PracticeExercise[] {
    const exercises: PracticeExercise[] = [];

    if (currentValue < -18) {
      exercises.push({
        id: 'volume_low_1',
        name: 'Projection Practice',
        description: 'Learn to project your voice',
        targetMetric: 'volume',
        difficulty: 'beginner',
        duration: 10,
        instructions: [
          'Stand up straight',
          'Take a deep breath',
          'Speak from your diaphragm',
          'Imagine speaking to someone 10 feet away',
        ],
        tips: [
          'Use your chest voice, not throat',
          'Breathe from your belly',
          'Practice in a quiet room first',
        ],
        expectedImprovement: '3-5 dB increase in 1 week',
      });

      exercises.push({
        id: 'volume_low_2',
        name: 'Microphone Positioning',
        description: 'Optimize microphone distance',
        targetMetric: 'volume',
        difficulty: 'beginner',
        duration: 5,
        instructions: [
          'Position microphone 6-12 inches away',
          'Speak directly into microphone',
          'Test different positions',
          'Find optimal distance',
        ],
        tips: [
          'Too close causes distortion',
          'Too far reduces volume',
          '6-12 inches is optimal',
        ],
        expectedImprovement: 'Immediate 2-3 dB improvement',
      });
    }

    return exercises;
  }

  // Clarity exercises
  private getClarityExercises(currentValue: number): PracticeExercise[] {
    const exercises: PracticeExercise[] = [];

    if (currentValue < 70) {
      exercises.push({
        id: 'clarity_low_1',
        name: 'Tongue Twister Practice',
        description: 'Improve enunciation with tongue twisters',
        targetMetric: 'clarity',
        difficulty: 'beginner',
        duration: 10,
        instructions: [
          'Start with simple tongue twisters',
          'Speak slowly and clearly',
          'Focus on each sound',
          'Gradually increase speed',
        ],
        tips: [
          'Quality over speed',
          'Practice daily',
          'Record yourself to hear improvement',
        ],
        expectedImprovement: '5-10 point increase in 1 week',
      });

      exercises.push({
        id: 'clarity_low_2',
        name: 'Articulation Drill',
        description: 'Practice clear articulation',
        targetMetric: 'clarity',
        difficulty: 'intermediate',
        duration: 15,
        instructions: [
          'Read a paragraph slowly',
          'Over-enunciate each word',
          'Focus on consonants',
          'Record and listen back',
        ],
        tips: [
          'Exaggerate movements at first',
          'Focus on crisp consonants',
          'Practice in front of mirror',
        ],
        expectedImprovement: '10-15 point increase in 2 weeks',
      });
    }

    return exercises;
  }

  // Confidence exercises
  private getConfidenceExercises(currentValue: number): PracticeExercise[] {
    const exercises: PracticeExercise[] = [];

    if (currentValue < 70) {
      exercises.push({
        id: 'confidence_low_1',
        name: 'Preparation Practice',
        description: 'Build confidence through preparation',
        targetMetric: 'confidence',
        difficulty: 'beginner',
        duration: 15,
        instructions: [
          'Prepare 3-5 talking points',
          'Practice saying them out loud',
          'Anticipate questions',
          'Practice responses',
        ],
        tips: [
          'Preparation reduces anxiety',
          'Practice makes perfect',
          'Start with easy topics',
        ],
        expectedImprovement: '5-10 point increase in 1 week',
      });

      exercises.push({
        id: 'confidence_low_2',
        name: 'Positive Self-Talk',
        description: 'Build confidence with positive affirmations',
        targetMetric: 'confidence',
        difficulty: 'beginner',
        duration: 5,
        instructions: [
          'Write 5 positive affirmations',
          'Say them out loud daily',
          'Believe in yourself',
          'Visualize success',
        ],
        tips: [
          'Be specific and positive',
          'Say with conviction',
          'Practice before sessions',
        ],
        expectedImprovement: 'Gradual improvement over time',
      });
    }

    return exercises;
  }

  // Pause exercises
  private getPauseExercises(currentValue: number): PracticeExercise[] {
    const exercises: PracticeExercise[] = [];

    if (currentValue > 8) {
      exercises.push({
        id: 'pauses_high_1',
        name: 'Flow Practice',
        description: 'Reduce excessive pausing',
        targetMetric: 'pauses',
        difficulty: 'beginner',
        duration: 10,
        instructions: [
          'Prepare talking points in advance',
          'Practice smooth transitions',
          'Use filler words instead of pauses',
          'Record and review',
        ],
        tips: [
          'Preparation reduces pauses',
          'Practice thinking on your feet',
          'Use "um" sparingly',
        ],
        expectedImprovement: '2-3 pause reduction in 1 week',
      });
    }

    return exercises;
  }

  // Pitch exercises
  private getPitchExercises(currentValue: number): PracticeExercise[] {
    const exercises: PracticeExercise[] = [];

    exercises.push({
      id: 'pitch_general_1',
      name: 'Vocal Warm-up',
      description: 'Warm up your voice for better pitch control',
      targetMetric: 'pitch',
      difficulty: 'beginner',
      duration: 5,
      instructions: [
        'Hum at different pitches',
        'Practice scales',
        'Relax your vocal cords',
        'Breathe deeply',
      ],
      tips: [
        'Warm up before sessions',
        'Stay relaxed',
        'Practice daily',
      ],
      expectedImprovement: 'Better pitch control',
    });

    return exercises;
  }

  // Real-time tips
  private getLowValueTip(metric: string, current: number, target: number): RealTimeCoachingTip {
    const tips: Record<string, string> = {
      pace: `Your pace is ${current} WPM. Try speaking a bit faster. Aim for 160 WPM by adding energy to your delivery.`,
      volume: `Your volume is low at ${current}dB. Speak louder and project your voice. Imagine speaking to someone across the room.`,
      clarity: `Your clarity is ${current}/100. Focus on enunciating each word clearly. Slow down slightly if needed.`,
      confidence: `Your confidence is ${current}/100. Take a deep breath and remember: you've prepared for this. Speak with conviction.`,
      pauses: `You're pausing frequently. Try to maintain flow by preparing your thoughts in advance.`,
    };

    const gap = target - current;
    const urgency: 'low' | 'medium' | 'high' = gap > 30 ? 'high' : gap > 15 ? 'medium' : 'low';

    return {
      metric,
      currentValue: current,
      targetValue: target,
      tip: tips[metric] || `Your ${metric} needs improvement. Focus on this area.`,
      urgency,
      actionable: true,
    };
  }

  private getHighValueTip(metric: string, current: number, target: number): RealTimeCoachingTip {
    const tips: Record<string, string> = {
      pace: `Your pace is fast at ${current} WPM. Slow down to ${target} WPM. Add pauses between sentences for better clarity.`,
      volume: `Your volume is high at ${current}dB. Lower it slightly to ${target}dB for better balance.`,
      pauses: `You're pausing too much. Try to maintain flow and reduce pauses to ${target} per minute.`,
    };

    const gap = current - target;
    const urgency: 'low' | 'medium' | 'high' = gap > 30 ? 'high' : gap > 15 ? 'medium' : 'low';

    return {
      metric,
      currentValue: current,
      targetValue: target,
      tip: tips[metric] || `Your ${metric} is above optimal. Adjust to ${target}.`,
      urgency,
      actionable: true,
    };
  }

  // Practice drills
  private getPaceDrill(): PracticeDrill {
    return {
      id: 'drill_pace',
      name: 'Pace Control Drill',
      description: 'Practice maintaining optimal speaking pace',
      targetMetrics: ['pace'],
      duration: 15,
      difficulty: 'intermediate',
      frequency: 'daily',
      steps: [
        {
          step: 1,
          instruction: 'Read a paragraph at your current pace',
          duration: 60,
        },
        {
          step: 2,
          instruction: 'Read the same paragraph 10% faster',
          duration: 60,
        },
        {
          step: 3,
          instruction: 'Read at target pace (160 WPM)',
          duration: 60,
        },
        {
          step: 4,
          instruction: 'Repeat until comfortable',
          duration: 300,
        },
      ],
    };
  }

  private getVolumeDrill(): PracticeDrill {
    return {
      id: 'drill_volume',
      name: 'Volume Projection Drill',
      description: 'Practice projecting your voice',
      targetMetrics: ['volume'],
      duration: 10,
      difficulty: 'beginner',
      frequency: 'daily',
      steps: [
        {
          step: 1,
          instruction: 'Speak at normal volume',
          duration: 30,
        },
        {
          step: 2,
          instruction: 'Increase volume by 20%',
          duration: 30,
        },
        {
          step: 3,
          instruction: 'Project to someone 10 feet away',
          duration: 60,
        },
        {
          step: 4,
          instruction: 'Maintain projected volume',
          duration: 120,
        },
      ],
    };
  }

  private getClarityDrill(): PracticeDrill {
    return {
      id: 'drill_clarity',
      name: 'Clarity Enhancement Drill',
      description: 'Improve speech clarity',
      targetMetrics: ['clarity'],
      duration: 15,
      difficulty: 'intermediate',
      frequency: 'daily',
      steps: [
        {
          step: 1,
          instruction: 'Read tongue twisters slowly',
          duration: 120,
        },
        {
          step: 2,
          instruction: 'Focus on each consonant',
          duration: 120,
        },
        {
          step: 3,
          instruction: 'Read a paragraph with clear enunciation',
          duration: 180,
        },
        {
          step: 4,
          instruction: 'Record and listen back',
          duration: 120,
        },
      ],
    };
  }

  private getConfidenceDrill(): PracticeDrill {
    return {
      id: 'drill_confidence',
      name: 'Confidence Building Drill',
      description: 'Build speaking confidence',
      targetMetrics: ['confidence'],
      duration: 20,
      difficulty: 'beginner',
      frequency: 'daily',
      steps: [
        {
          step: 1,
          instruction: 'Prepare 3 talking points',
          duration: 300,
        },
        {
          step: 2,
          instruction: 'Practice saying them out loud',
          duration: 180,
        },
        {
          step: 3,
          instruction: 'Practice with confidence',
          duration: 180,
        },
        {
          step: 4,
          instruction: 'Record yourself',
          duration: 120,
        },
      ],
    };
  }

  private getGeneralDrill(): PracticeDrill {
    return {
      id: 'drill_general',
      name: 'General Voice Practice',
      description: 'Overall voice improvement',
      targetMetrics: ['pace', 'volume', 'clarity'],
      duration: 15,
      difficulty: 'beginner',
      frequency: 'daily',
      steps: [
        {
          step: 1,
          instruction: 'Warm up your voice',
          duration: 120,
        },
        {
          step: 2,
          instruction: 'Practice reading aloud',
          duration: 300,
        },
        {
          step: 3,
          instruction: 'Focus on clarity and pace',
          duration: 300,
        },
        {
          step: 4,
          instruction: 'Record and review',
          duration: 120,
        },
      ],
    };
  }

  private combineDrills(drills: PracticeDrill[]): PracticeDrill {
    const allSteps: DrillStep[] = [];
    let stepNumber = 1;

    drills.forEach(drill => {
      drill.steps.forEach(step => {
        allSteps.push({
          ...step,
          step: stepNumber++,
        });
      });
    });

    return {
      id: 'drill_combined',
      name: 'Combined Practice Drill',
      description: 'Practice multiple metrics together',
      targetMetrics: drills.flatMap(d => d.targetMetrics),
      duration: drills.reduce((sum, d) => sum + d.duration, 0),
      difficulty: 'intermediate',
      frequency: 'daily',
      steps: allSteps,
    };
  }

  // Helper methods
  private calculateProgress(current: number, target: number): number {
    const range = Math.abs(target - current);
    if (range === 0) return 100;
    const progress = Math.max(0, Math.min(100, ((target - current) / range) * 100));
    return Math.round(progress);
  }

  private generateMilestones(current: number, target: number, deadline: Date): GoalMilestone[] {
    const steps = 3;
    const increment = (target - current) / steps;
    const timeIncrement = (deadline.getTime() - Date.now()) / steps;

    return Array.from({ length: steps }, (_, i) => {
      const milestoneValue = current + increment * (i + 1);
      const milestoneDate = new Date(Date.now() + timeIncrement * (i + 1));

      return {
        value: Math.round(milestoneValue * 10) / 10,
        date: milestoneDate,
        achieved: false,
        reward: `Milestone ${i + 1} achieved!`,
      };
    });
  }

  private isInOptimalRange(metric: string, value: number): boolean {
    const ranges = this.getOptimalRanges();
    const range = ranges[metric];
    if (!range) return true;
    return value >= range.min && value <= range.max;
  }

  private getOptimalCenter(metric: string): number {
    const ranges = this.getOptimalRanges();
    const range = ranges[metric];
    if (!range) return 0;
    return (range.min + range.max) / 2;
  }

  private getOptimalRanges(): Record<string, { min: number; max: number }> {
    return {
      pace: { min: 140, max: 180 },
      volume: { min: -18, max: -6 },
      clarity: { min: 70, max: 100 },
      confidence: { min: 70, max: 100 },
      pauses: { min: 3, max: 8 },
      pitch: { min: 85, max: 255 },
    };
  }

  private getDefaultChallenge(): DailyChallenge {
    return {
      id: 'challenge_default',
      date: new Date().toISOString().split('T')[0],
      name: 'Daily Practice',
      description: 'Complete a practice session today',
      targetMetric: 'pace',
      goal: 160,
      currentProgress: 0,
      reward: 'Practice badge',
      difficulty: 'easy',
    };
  }

  private getMaintenanceChallenge(): DailyChallenge {
    return {
      id: 'challenge_maintenance',
      date: new Date().toISOString().split('T')[0],
      name: 'Maintain Excellence',
      description: 'Keep all metrics in optimal range',
      targetMetric: 'overall',
      goal: 85,
      currentProgress: 0,
      reward: 'Excellence badge',
      difficulty: 'medium',
    };
  }
}

