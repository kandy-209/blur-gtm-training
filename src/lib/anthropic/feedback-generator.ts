/**
 * Anthropic API Integration for Voice Coaching Feedback
 * Uses Claude to generate personalized feedback and ratings
 */

import Anthropic from '@anthropic-ai/sdk';
import type { VoiceMetrics, FeedbackMessage } from '@/lib/voice-coaching/types';
import type { UserVoiceProfile, ImpactAnalysis } from '@/lib/voice-coaching/user-model';
import type { CompleteUserData } from '@/lib/voice-coaching/data-collector';
import { buildCursorContextPrompt } from './cursor-context';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export interface AnthropicFeedback {
  overallRating: number; // 0-100
  ratingBreakdown: {
    pace: number;
    pitch: number;
    volume: number;
    pauses: number;
    clarity: number;
    confidence: number;
  };
  personalizedFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  specificRecommendations: string[];
  motivationalMessage: string;
  nextSteps: string[];
  encouragement: string;
}

export interface AnthropicSessionFeedback {
  sessionRating: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  specificTips: string[];
  comparisonToPrevious?: string;
  encouragement: string;
}

export class AnthropicFeedbackGenerator {
  /**
   * Generate comprehensive feedback using Claude
   */
  async generateComprehensiveFeedback(
    userData: CompleteUserData,
    currentMetrics?: VoiceMetrics
  ): Promise<AnthropicFeedback> {
    const prompt = this.buildComprehensivePrompt(userData, currentMetrics);

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return this.parseFeedbackResponse(content.text);
      }

      throw new Error('Invalid response format from Anthropic API');
    } catch (error) {
      console.error('Error generating Anthropic feedback:', error);
      throw error;
    }
  }

  /**
   * Generate session-specific feedback
   */
  async generateSessionFeedback(
    currentMetrics: VoiceMetrics,
    previousMetrics?: VoiceMetrics,
    sessionHistory?: CompleteSessionData[]
  ): Promise<AnthropicSessionFeedback> {
    const prompt = this.buildSessionPrompt(currentMetrics, previousMetrics, sessionHistory);

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return this.parseSessionFeedbackResponse(content.text);
      }

      throw new Error('Invalid response format from Anthropic API');
    } catch (error) {
      console.error('Error generating session feedback:', error);
      throw error;
    }
  }

  /**
   * Generate rating with detailed breakdown
   */
  async generateRating(
    metrics: VoiceMetrics,
    context?: {
      profile?: UserVoiceProfile;
      impactAnalysis?: ImpactAnalysis;
      recentTrends?: any;
    }
  ): Promise<AnthropicFeedback['ratingBreakdown'] & { overall: number; explanation: string }> {
    const prompt = this.buildRatingPrompt(metrics, context);

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      const content = message.content[0];
      if (content.type === 'text') {
        return this.parseRatingResponse(content.text);
      }

      throw new Error('Invalid response format from Anthropic API');
    } catch (error) {
      console.error('Error generating rating:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive feedback prompt
   */
  private buildComprehensivePrompt(userData: CompleteUserData, currentMetrics?: VoiceMetrics): string {
    return `You are an expert voice coach analyzing a user's comprehensive voice coaching data. Provide detailed, personalized feedback.

USER DATA SUMMARY:
- Total Sessions: ${userData.totalSessions}
- Total Practice Time: ${Math.round(userData.totalPracticeTime / 60000)} minutes
- First Session: ${userData.firstSessionDate || 'N/A'}
- Last Session: ${userData.lastSessionDate || 'N/A'}

CURRENT METRICS:
${currentMetrics ? this.formatMetrics(currentMetrics) : 'Not available'}

ALL-TIME STATISTICS:
${this.formatStatistics(userData.allTimeMetrics)}

IMPROVEMENT TRENDS:
${this.formatTrends(userData.improvementTrends)}

PATTERNS IDENTIFIED:
- Consistent Improvement: ${userData.patterns.consistentImprovement.join(', ') || 'None'}
- Declining Metrics: ${userData.patterns.decliningMetrics.join(', ') || 'None'}
- Volatile Metrics: ${userData.patterns.volatileMetrics.join(', ') || 'None'}
- Plateau Metrics: ${userData.patterns.plateauMetrics.join(', ') || 'None'}

PRACTICE HABITS:
- Sessions per week: ${userData.practiceHabits.sessionsPerWeek}
- Longest streak: ${userData.practiceHabits.longestStreak} days
- Current streak: ${userData.practiceHabits.currentStreak} days
- Preferred time: ${userData.practiceHabits.preferredTimeOfDay}

BEST SESSIONS:
${userData.bestSessions.slice(0, 3).map(s => `- ${s.date}: Score ${s.overallScore}`).join('\n')}

Please provide:
1. Overall rating (0-100) with explanation
2. Rating breakdown for each metric (pace, pitch, volume, pauses, clarity, confidence) with scores 0-100
3. Personalized feedback paragraph (2-3 sentences)
4. Top 3 strengths
5. Top 3 areas for improvement
6. 3-5 specific, actionable recommendations
7. Motivational message
8. Next steps (2-3 items)
9. Encouragement message

Format your response as JSON with these exact keys:
{
  "overallRating": <number>,
  "ratingBreakdown": {
    "pace": <number>,
    "pitch": <number>,
    "volume": <number>,
    "pauses": <number>,
    "clarity": <number>,
    "confidence": <number>
  },
  "personalizedFeedback": "<string>",
  "strengths": ["<string>", "<string>", "<string>"],
  "areasForImprovement": ["<string>", "<string>", "<string>"],
  "specificRecommendations": ["<string>", "<string>", "<string>", "<string>", "<string>"],
  "motivationalMessage": "<string>",
  "nextSteps": ["<string>", "<string>", "<string>"],
  "encouragement": "<string>"
}`;
  }

  /**
   * Build session-specific prompt
   */
  private buildSessionPrompt(
    currentMetrics: VoiceMetrics,
    previousMetrics?: VoiceMetrics,
    sessionHistory?: CompleteSessionData[]
  ): string {
    const cursorContext = buildCursorContextPrompt();
    let prompt = `${cursorContext}

You are an expert voice coach providing real-time feedback on a voice coaching session. Make your feedback relevant to developers and technical professionals.

CURRENT SESSION METRICS:
${this.formatMetrics(currentMetrics)}`;

    if (previousMetrics) {
      prompt += `\n\nPREVIOUS SESSION METRICS:
${this.formatMetrics(previousMetrics)}`;
    }

    if (sessionHistory && sessionHistory.length > 0) {
      prompt += `\n\nRECENT SESSION TREND:
${sessionHistory.slice(-5).map((s, i) => `Session ${i + 1}: Score ${s.sessionScore}`).join('\n')}`;
    }

    prompt += `\n\nPlease provide:
1. Session rating (0-100) with brief explanation
2. Feedback paragraph (2-3 sentences) on current performance
3. Top 2 strengths from this session
4. Top 2 areas to improve
5. 3 specific, actionable tips for immediate improvement
${previousMetrics ? '6. Comparison to previous session (1-2 sentences)' : ''}
7. Encouragement message

Format your response as JSON with these exact keys:
{
  "sessionRating": <number>,
  "feedback": "<string>",
  "strengths": ["<string>", "<string>"],
  "improvements": ["<string>", "<string>"],
  "specificTips": ["<string>", "<string>", "<string>"],
  ${previousMetrics ? '"comparisonToPrevious": "<string>",' : ''}
  "encouragement": "<string>"
}`;

    return prompt;
  }

  /**
   * Build rating prompt
   */
  private buildRatingPrompt(
    metrics: VoiceMetrics,
    context?: {
      profile?: UserVoiceProfile;
      impactAnalysis?: ImpactAnalysis;
      recentTrends?: any;
    }
  ): string {
    const cursorContext = buildCursorContextPrompt();
    let prompt = `${cursorContext}

You are an expert voice coach rating a user's voice metrics. Consider how these metrics impact technical communication, presentations, and team collaboration.

CURRENT METRICS:
${this.formatMetrics(metrics)}

OPTIMAL RANGES:
- Pace: 140-180 WPM
- Volume: -18 to -6 dB
- Clarity: 70-100
- Confidence: 70-100
- Pauses: 3-8 per minute
- Pitch: 85-255 Hz`;

    if (context?.profile) {
      prompt += `\n\nBASELINE METRICS:
${this.formatMetrics(context.profile.baselineMetrics)}

IMPROVEMENT FROM BASELINE:
${Object.entries(context.profile.improvementTrend).map(([metric, trend]) => 
  `${metric}: ${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}%`
).join('\n')}`;
    }

    if (context?.impactAnalysis) {
      prompt += `\n\nIMPACT SCORES:
- Immediate: ${context.impactAnalysis.immediateImpact.score}
- Mid-Term: ${context.impactAnalysis.midTermImpact.score}
- Long-Term: ${context.impactAnalysis.longTermImpact.score}`;
    }

    prompt += `\n\nPlease provide:
1. Overall rating (0-100) with explanation
2. Rating breakdown for each metric (0-100) based on:
   - Distance from optimal range
   - Improvement trend (if available)
   - Consistency
3. Brief explanation of ratings

Format your response as JSON:
{
  "overall": <number>,
  "pace": <number>,
  "pitch": <number>,
  "volume": <number>,
  "pauses": <number>,
  "clarity": <number>,
  "confidence": <number>,
  "explanation": "<string>"
}`;

    return prompt;
  }

  /**
   * Format metrics for prompt
   */
  private formatMetrics(metrics: VoiceMetrics): string {
    return `- Pace: ${metrics.pace} WPM
- Pitch: ${metrics.pitch} Hz
- Volume: ${metrics.volume} dB
- Pauses: ${metrics.pauses} per minute
- Clarity: ${metrics.clarity}/100
- Confidence: ${metrics.confidence}/100`;
  }

  /**
   * Format statistics for prompt
   */
  private formatStatistics(stats: CompleteUserData['allTimeMetrics']): string {
    return Object.entries(stats).map(([metric, stat]) => 
      `${metric.toUpperCase()}:
  - Mean: ${stat.mean.toFixed(1)}
  - Range: ${stat.min.toFixed(1)} - ${stat.max.toFixed(1)}
  - Optimal Range Frequency: ${stat.optimalRangeFrequency.toFixed(1)}%`
    ).join('\n\n');
  }

  /**
   * Format trends for prompt
   */
  private formatTrends(trends: CompleteUserData['improvementTrends']): string {
    return Object.entries(trends).map(([metric, trend]) => 
      `${metric.toUpperCase()}:
  - Baseline: ${trend.baseline.toFixed(1)}
  - Current: ${trend.current.toFixed(1)}
  - Change: ${trend.change > 0 ? '+' : ''}${trend.change.toFixed(1)}%
  - Trend: ${trend.trend} (${trend.trendStrength})`
    ).join('\n\n');
  }

  /**
   * Parse comprehensive feedback response
   */
  private parseFeedbackResponse(text: string): AnthropicFeedback {
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      const parsed = JSON.parse(jsonText);

      return {
        overallRating: parsed.overallRating || 0,
        ratingBreakdown: {
          pace: parsed.ratingBreakdown?.pace || 0,
          pitch: parsed.ratingBreakdown?.pitch || 0,
          volume: parsed.ratingBreakdown?.volume || 0,
          pauses: parsed.ratingBreakdown?.pauses || 0,
          clarity: parsed.ratingBreakdown?.clarity || 0,
          confidence: parsed.ratingBreakdown?.confidence || 0,
        },
        personalizedFeedback: parsed.personalizedFeedback || '',
        strengths: parsed.strengths || [],
        areasForImprovement: parsed.areasForImprovement || [],
        specificRecommendations: parsed.specificRecommendations || [],
        motivationalMessage: parsed.motivationalMessage || '',
        nextSteps: parsed.nextSteps || [],
        encouragement: parsed.encouragement || '',
      };
    } catch (error) {
      console.error('Error parsing feedback response:', error);
      // Return fallback response
      return this.getFallbackFeedback();
    }
  }

  /**
   * Parse session feedback response
   */
  private parseSessionFeedbackResponse(text: string): AnthropicSessionFeedback {
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      const parsed = JSON.parse(jsonText);

      return {
        sessionRating: parsed.sessionRating || 0,
        feedback: parsed.feedback || '',
        strengths: parsed.strengths || [],
        improvements: parsed.improvements || [],
        specificTips: parsed.specificTips || [],
        comparisonToPrevious: parsed.comparisonToPrevious,
        encouragement: parsed.encouragement || '',
      };
    } catch (error) {
      console.error('Error parsing session feedback:', error);
      return {
        sessionRating: 0,
        feedback: 'Unable to generate feedback at this time.',
        strengths: [],
        improvements: [],
        specificTips: [],
        encouragement: 'Keep practicing!',
      };
    }
  }

  /**
   * Parse rating response
   */
  private parseRatingResponse(text: string): AnthropicFeedback['ratingBreakdown'] & { overall: number; explanation: string } {
    try {
      const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[1] || jsonMatch[0] : text;
      const parsed = JSON.parse(jsonText);

      return {
        overall: parsed.overall || 0,
        pace: parsed.pace || 0,
        pitch: parsed.pitch || 0,
        volume: parsed.volume || 0,
        pauses: parsed.pauses || 0,
        clarity: parsed.clarity || 0,
        confidence: parsed.confidence || 0,
        explanation: parsed.explanation || '',
      };
    } catch (error) {
      console.error('Error parsing rating response:', error);
      return {
        overall: 0,
        pace: 0,
        pitch: 0,
        volume: 0,
        pauses: 0,
        clarity: 0,
        confidence: 0,
        explanation: 'Unable to generate rating at this time.',
      };
    }
  }

  /**
   * Fallback feedback if API fails
   */
  private getFallbackFeedback(): AnthropicFeedback {
    return {
      overallRating: 0,
      ratingBreakdown: {
        pace: 0,
        pitch: 0,
        volume: 0,
        pauses: 0,
        clarity: 0,
        confidence: 0,
      },
      personalizedFeedback: 'Feedback generation is temporarily unavailable. Please try again later.',
      strengths: [],
      areasForImprovement: [],
      specificRecommendations: [],
      motivationalMessage: 'Keep practicing!',
      nextSteps: [],
      encouragement: 'You\'re doing great!',
    };
  }
}

// Re-export types
export type { CompleteSessionData } from '@/lib/voice-coaching/data-collector';

