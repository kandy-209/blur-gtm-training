'use client';

export interface UserProfile {
  userId: string;
  preferences: Record<string, unknown>;
  behaviorPatterns: BehaviorPattern[];
  interests: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  lastUpdated: number;
}

export interface BehaviorPattern {
  action: string;
  frequency: number;
  context: Record<string, unknown>;
  outcome: 'positive' | 'negative' | 'neutral';
  timestamp: number;
}

export interface PersonalizationRule {
  condition: (profile: UserProfile) => boolean;
  action: (profile: UserProfile) => Partial<UserProfile>;
  priority: number;
}

export class PersonalizationEngine {
  private profile: UserProfile | null = null;
  private rules: PersonalizationRule[] = [];
  private behaviorHistory: BehaviorPattern[] = [];

  loadProfile(userId: string): UserProfile | null {
    try {
      const stored = localStorage.getItem(`user_profile_${userId}`);
      if (stored) {
        this.profile = JSON.parse(stored);
        return this.profile;
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }

    // Create default profile
    this.profile = {
      userId,
      preferences: {},
      behaviorPatterns: [],
      interests: [],
      skillLevel: 'beginner',
      lastUpdated: Date.now(),
    };

    return this.profile;
  }

  saveProfile(): void {
    if (!this.profile) return;

    try {
      this.profile.lastUpdated = Date.now();
      localStorage.setItem(
        `user_profile_${this.profile.userId}`,
        JSON.stringify(this.profile)
      );
    } catch (error) {
      console.error('Failed to save user profile:', error);
    }
  }

  recordBehavior(
    action: string,
    context: Record<string, unknown> = {},
    outcome: 'positive' | 'negative' | 'neutral' = 'neutral'
  ): void {
    if (!this.profile) return;

    const pattern: BehaviorPattern = {
      action,
      frequency: 1,
      context,
      outcome,
      timestamp: Date.now(),
    };

    // Check if pattern exists
    const existing = this.profile.behaviorPatterns.find(
      (p) => p.action === action && JSON.stringify(p.context) === JSON.stringify(context)
    );

    if (existing) {
      existing.frequency++;
      existing.outcome = outcome;
      existing.timestamp = Date.now();
    } else {
      this.profile.behaviorPatterns.push(pattern);
    }

    this.behaviorHistory.push(pattern);
    this.applyRules();
    this.saveProfile();
  }

  registerRule(rule: PersonalizationRule): void {
    this.rules.push(rule);
    this.rules.sort((a, b) => b.priority - a.priority);
  }

  private applyRules(): void {
    if (!this.profile) return;

    for (const rule of this.rules) {
      if (rule.condition(this.profile)) {
        const updates = rule.action(this.profile);
        this.profile = { ...this.profile, ...updates };
      }
    }
  }

  getRecommendations(limit: number = 5): string[] {
    if (!this.profile) return [];

    // Analyze behavior patterns to generate recommendations
    const positivePatterns = this.profile.behaviorPatterns.filter(
      (p) => p.outcome === 'positive'
    );

    const recommendations: string[] = [];

    // Recommend based on positive patterns
    for (const pattern of positivePatterns.slice(0, limit)) {
      if (pattern.action.includes('scenario')) {
        recommendations.push(`Try more ${pattern.action} scenarios`);
      }
    }

    // Recommend based on skill level
    if (this.profile.skillLevel === 'beginner') {
      recommendations.push('Start with basic scenarios');
    } else if (this.profile.skillLevel === 'advanced') {
      recommendations.push('Try competitive roleplay');
    }

    return recommendations;
  }

  predictNextAction(): string | null {
    if (!this.profile || this.profile.behaviorPatterns.length === 0) {
      return null;
    }

    // Find most frequent positive action
    const positivePatterns = this.profile.behaviorPatterns
      .filter((p) => p.outcome === 'positive')
      .sort((a, b) => b.frequency - a.frequency);

    return positivePatterns[0]?.action || null;
  }

  adaptUI(): {
    showAdvancedFeatures: boolean;
    defaultDifficulty: string;
    recommendedScenarios: string[];
  } {
    if (!this.profile) {
      return {
        showAdvancedFeatures: false,
        defaultDifficulty: 'medium',
        recommendedScenarios: [],
      };
    }

    const showAdvanced =
      this.profile.skillLevel === 'advanced' || this.profile.skillLevel === 'expert';

    const defaultDifficulty =
      this.profile.skillLevel === 'beginner'
        ? 'easy'
        : this.profile.skillLevel === 'expert'
        ? 'hard'
        : 'medium';

    const recommendedScenarios = this.getRecommendations(3);

    return {
      showAdvancedFeatures: showAdvanced,
      defaultDifficulty,
      recommendedScenarios,
    };
  }

  updateSkillLevel(): void {
    if (!this.profile) return;

    const totalInteractions = this.profile.behaviorPatterns.length;
    const positiveOutcomes = this.profile.behaviorPatterns.filter(
      (p) => p.outcome === 'positive'
    ).length;

    const successRate = totalInteractions > 0 ? positiveOutcomes / totalInteractions : 0;

    if (totalInteractions < 10) {
      this.profile.skillLevel = 'beginner';
    } else if (successRate > 0.8 && totalInteractions > 50) {
      this.profile.skillLevel = 'expert';
    } else if (successRate > 0.6 && totalInteractions > 30) {
      this.profile.skillLevel = 'advanced';
    } else if (totalInteractions > 20) {
      this.profile.skillLevel = 'intermediate';
    }

    this.saveProfile();
  }

  getProfile(): UserProfile | null {
    return this.profile;
  }
}

export const personalizationEngine = new PersonalizationEngine();

// Initialize default rules
personalizationEngine.registerRule({
  condition: (profile) => profile.behaviorPatterns.length > 10,
  action: (profile) => ({
    skillLevel: profile.skillLevel === 'beginner' ? 'intermediate' : profile.skillLevel,
  }),
  priority: 1,
});

personalizationEngine.registerRule({
  condition: (profile) => {
    const recentPositive = profile.behaviorPatterns.filter(
      (p) => p.outcome === 'positive' && Date.now() - p.timestamp < 86400000
    );
    return recentPositive.length > 5;
  },
  action: (profile) => ({
    skillLevel:
      profile.skillLevel === 'intermediate'
        ? 'advanced'
        : profile.skillLevel === 'advanced'
        ? 'expert'
        : profile.skillLevel,
  }),
  priority: 2,
});

