import { BaseAgent, AgentConfig, AgentContext, AgentResult } from '../base/Agent';

export interface QualityScoringInput {
  response: string;
  evaluationCriteria?: {
    clarity?: number;
    persuasiveness?: number;
    technicalAccuracy?: number;
    objectionHandling?: number;
  };
}

export interface QualityScore {
  overall: number;
  breakdown: {
    clarity: number;
    persuasiveness: number;
    technicalAccuracy: number;
    objectionHandling: number;
    length: number;
    keyPointsCoverage: number;
  };
  strengths: string[];
  weaknesses: string[];
}

export class QualityScoringAgent extends BaseAgent {
  constructor() {
    super({
      name: 'QualityScoringAgent',
      description: 'Scores response quality across multiple dimensions',
      version: '1.0.0',
      timeout: 5000,
    });
  }

  async execute(
    input: QualityScoringInput,
    context?: AgentContext
  ): Promise<AgentResult<QualityScore>> {
    const startTime = Date.now();
    
    try {
      const breakdown = this.analyzeResponse(input.response);
      const overall = this.calculateOverall(breakdown);
      const { strengths, weaknesses } = this.identifyStrengthsWeaknesses(breakdown);
      
      return {
        success: true,
        data: {
          overall,
          breakdown,
          strengths,
          weaknesses,
        },
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
          confidence: overall,
        },
      };
    } catch (error: any) {
      this.error('Failed to score quality', error);
      return {
        success: false,
        error: error.message || 'Failed to score quality',
        metadata: {
          agent: this.config.name,
          executionTime: Date.now() - startTime,
        },
      };
    }
  }

  private analyzeResponse(response: string): QualityScore['breakdown'] {
    return {
      clarity: this.scoreClarity(response),
      persuasiveness: this.scorePersuasiveness(response),
      technicalAccuracy: this.scoreTechnicalAccuracy(response),
      objectionHandling: this.scoreObjectionHandling(response),
      length: this.scoreLength(response),
      keyPointsCoverage: this.scoreKeyPointsCoverage(response),
    };
  }

  private scoreClarity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 50;
    
    const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;
    
    // Optimal: 15-25 words per sentence
    const optimalLength = 20;
    const lengthScore = 100 - Math.abs(avgSentenceLength - optimalLength) * 2;
    
    return Math.max(0, Math.min(100, lengthScore));
  }

  private scorePersuasiveness(text: string): number {
    const persuasiveWords = ['because', 'proven', 'results', 'benefit', 'value', 'advantage', 'improve'];
    const matches = persuasiveWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    return (matches / persuasiveWords.length) * 100;
  }

  private scoreTechnicalAccuracy(text: string): number {
    const technicalTerms = ['codebase', 'index', 'context', 'api', 'integration', 'architecture'];
    const matches = technicalTerms.filter(term => 
      text.toLowerCase().includes(term)
    ).length;
    
    return (matches / technicalTerms.length) * 100;
  }

  private scoreObjectionHandling(text: string): number {
    const objectionWords = ['however', 'understand', 'address', 'concern', 'solution', 'resolve'];
    const matches = objectionWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    return Math.min(100, matches * 20);
  }

  private scoreLength(text: string): number {
    const length = text.length;
    if (length >= 100 && length <= 300) return 100;
    if (length < 100) return (length / 100) * 100;
    return Math.max(0, 100 - ((length - 300) / 10));
  }

  private scoreKeyPointsCoverage(text: string): number {
    const keyPoints = ['codebase', 'cursor', 'productivity', 'understanding', 'context'];
    const matches = keyPoints.filter(point => 
      text.toLowerCase().includes(point)
    ).length;
    
    return (matches / keyPoints.length) * 100;
  }

  private calculateOverall(breakdown: QualityScore['breakdown']): number {
    return (
      breakdown.clarity * 0.2 +
      breakdown.persuasiveness * 0.2 +
      breakdown.technicalAccuracy * 0.2 +
      breakdown.objectionHandling * 0.2 +
      breakdown.length * 0.1 +
      breakdown.keyPointsCoverage * 0.1
    );
  }

  private identifyStrengthsWeaknesses(
    breakdown: QualityScore['breakdown']
  ): { strengths: string[]; weaknesses: string[] } {
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    
    if (breakdown.clarity >= 80) strengths.push('Clear and concise');
    else if (breakdown.clarity < 60) weaknesses.push('Could be clearer');
    
    if (breakdown.persuasiveness >= 80) strengths.push('Persuasive messaging');
    else if (breakdown.persuasiveness < 60) weaknesses.push('Needs more persuasive language');
    
    if (breakdown.technicalAccuracy >= 80) strengths.push('Technically accurate');
    else if (breakdown.technicalAccuracy < 60) weaknesses.push('Missing technical details');
    
    if (breakdown.objectionHandling >= 80) strengths.push('Addresses objections well');
    else if (breakdown.objectionHandling < 60) weaknesses.push('Could better address objections');
    
    return { strengths, weaknesses };
  }
}

