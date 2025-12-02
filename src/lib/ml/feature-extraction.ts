/**
 * Feature extraction for ML data learning
 * Extracts meaningful features from user responses and conversations
 */

export interface ResponseFeatures {
  // Text features
  length: number;
  wordCount: number;
  sentenceCount: number;
  avgSentenceLength: number;
  
  // Content features
  keyTerms: string[];
  technicalTerms: string[];
  valuePropositions: string[];
  objectionHandling: boolean;
  
  // Structure features
  hasQuestion: boolean;
  hasExample: boolean;
  hasComparison: boolean;
  hasCallToAction: boolean;
  
  // Sentiment features
  sentimentScore: number;
  confidenceIndicators: number;
  
  // Context features
  turnNumber: number;
  conversationLength: number;
  previousScore?: number;
  
  // Performance features
  successRate?: number;
  averageScore?: number;
  usageCount?: number;
}

export class FeatureExtractor {
  private static keyTerms = [
    'codebase', 'cursor', 'context', 'understanding', 'productivity',
    'index', 'autocomplete', 'refactor', 'edit', 'completion',
    'ai', 'assistant', 'copilot', 'integration', 'api'
  ];

  private static technicalTerms = [
    'codebase', 'index', 'context', 'api', 'integration', 'architecture',
    'refactor', 'autocomplete', 'completion', 'syntax', 'semantic',
    'embedding', 'vector', 'llm', 'model', 'inference'
  ];

  private static valuePropositions = [
    'productivity', 'efficiency', 'speed', 'quality', 'accuracy',
    'understanding', 'context', 'codebase', 'refactor', 'edit',
    'autocomplete', 'completion', 'assistant', 'help'
  ];

  private static confidenceIndicators = [
    'definitely', 'certainly', 'absolutely', 'clearly', 'obviously',
    'proven', 'demonstrated', 'evidence', 'show', 'demonstrate'
  ];

  /**
   * Extract features from a user response
   */
  static extractFeatures(
    text: string,
    context?: {
      turnNumber?: number;
      conversationLength?: number;
      previousScore?: number;
      successRate?: number;
      averageScore?: number;
      usageCount?: number;
    }
  ): ResponseFeatures {
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    
    return {
      // Text features
      length: text.length,
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgSentenceLength: sentences.length > 0 
        ? words.length / sentences.length 
        : 0,
      
      // Content features
      keyTerms: this.extractKeyTerms(text),
      technicalTerms: this.extractTechnicalTerms(text),
      valuePropositions: this.extractValuePropositions(text),
      objectionHandling: this.hasObjectionHandling(text),
      
      // Structure features
      hasQuestion: /[?]/.test(text),
      hasExample: /\b(example|instance|case|like|such as)\b/i.test(text),
      hasComparison: /\b(versus|vs|compared|better|worse|than|instead)\b/i.test(text),
      hasCallToAction: /\b(try|use|start|begin|get|see|check|learn)\b/i.test(text),
      
      // Sentiment features
      sentimentScore: this.calculateSentiment(text),
      confidenceIndicators: this.countConfidenceIndicators(text),
      
      // Context features
      turnNumber: context?.turnNumber || 1,
      conversationLength: context?.conversationLength || 1,
      previousScore: context?.previousScore,
      
      // Performance features
      successRate: context?.successRate,
      averageScore: context?.averageScore,
      usageCount: context?.usageCount,
    };
  }

  /**
   * Extract key terms from text
   */
  private static extractKeyTerms(text: string): string[] {
    const lowerText = text.toLowerCase();
    return this.keyTerms.filter(term => lowerText.includes(term));
  }

  /**
   * Extract technical terms from text
   */
  private static extractTechnicalTerms(text: string): string[] {
    const lowerText = text.toLowerCase();
    return this.technicalTerms.filter(term => lowerText.includes(term));
  }

  /**
   * Extract value propositions from text
   */
  private static extractValuePropositions(text: string): string[] {
    const lowerText = text.toLowerCase();
    return this.valuePropositions.filter(prop => lowerText.includes(prop));
  }

  /**
   * Check if text handles objections
   */
  private static hasObjectionHandling(text: string): boolean {
    const objectionHandlingPatterns = [
      /\b(however|but|although|while|despite)\b/i,
      /\b(understand|see|appreciate|recognize)\b/i,
      /\b(address|resolve|solve|handle|deal with)\b/i,
      /\b(concern|worry|issue|problem)\b/i,
    ];
    
    return objectionHandlingPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Calculate sentiment score (-1 to 1)
   */
  private static calculateSentiment(text: string): number {
    const positiveWords = [
      'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
      'good', 'better', 'best', 'improve', 'help', 'benefit',
      'advantage', 'value', 'effective', 'efficient'
    ];
    
    const negativeWords = [
      'bad', 'worse', 'worst', 'terrible', 'awful', 'poor',
      'problem', 'issue', 'concern', 'worry', 'difficult',
      'hard', 'complex', 'complicated'
    ];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(w => lowerText.includes(w)).length;
    const negativeCount = negativeWords.filter(w => lowerText.includes(w)).length;
    
    const total = positiveCount + negativeCount;
    if (total === 0) return 0;
    
    return (positiveCount - negativeCount) / total;
  }

  /**
   * Count confidence indicators
   */
  private static countConfidenceIndicators(text: string): number {
    const lowerText = text.toLowerCase();
    return this.confidenceIndicators.filter(indicator => 
      lowerText.includes(indicator)
    ).length;
  }

  /**
   * Calculate similarity between two responses
   */
  static calculateSimilarity(text1: string, text2: string): number {
    const features1 = this.extractFeatures(text1);
    const features2 = this.extractFeatures(text2);
    
    // Jaccard similarity for key terms
    const terms1 = new Set(features1.keyTerms);
    const terms2 = new Set(features2.keyTerms);
    const intersection = new Set(Array.from(terms1).filter(x => terms2.has(x)));
    const union = new Set([...Array.from(terms1), ...Array.from(terms2)]);
    const termSimilarity = union.size > 0 ? intersection.size / union.size : 0;
    
    // Length similarity
    const lengthSimilarity = 1 - Math.abs(features1.length - features2.length) / 
      Math.max(features1.length, features2.length, 1);
    
    // Structure similarity
    const structureSimilarity = (
      (features1.hasQuestion === features2.hasQuestion ? 1 : 0) +
      (features1.hasExample === features2.hasExample ? 1 : 0) +
      (features1.hasComparison === features2.hasComparison ? 1 : 0) +
      (features1.hasCallToAction === features2.hasCallToAction ? 1 : 0)
    ) / 4;
    
    // Weighted combination
    return (
      termSimilarity * 0.5 +
      lengthSimilarity * 0.2 +
      structureSimilarity * 0.3
    );
  }

  /**
   * Extract patterns from multiple responses
   */
  static extractPatterns(responses: Array<{
    text: string;
    score?: number;
    successRate?: number;
  }>): {
    commonTerms: string[];
    optimalLength: number;
    structurePattern: {
      hasQuestion: number;
      hasExample: number;
      hasComparison: number;
      hasCallToAction: number;
    };
    topPerformers: string[];
  } {
    const highPerformers = responses
      .filter(r => (r.score || 0) >= 80 || (r.successRate || 0) >= 0.8)
      .map(r => r.text);
    
    const allTerms = new Map<string, number>();
    const lengths: number[] = [];
    const structures = {
      hasQuestion: 0,
      hasExample: 0,
      hasComparison: 0,
      hasCallToAction: 0,
    };
    
    highPerformers.forEach(text => {
      const features = this.extractFeatures(text);
      
      // Collect terms
      features.keyTerms.forEach(term => {
        allTerms.set(term, (allTerms.get(term) || 0) + 1);
      });
      
      // Collect lengths
      lengths.push(features.length);
      
      // Collect structures
      if (features.hasQuestion) structures.hasQuestion++;
      if (features.hasExample) structures.hasExample++;
      if (features.hasComparison) structures.hasComparison++;
      if (features.hasCallToAction) structures.hasCallToAction++;
    });
    
    const total = highPerformers.length || 1;
    
    return {
      commonTerms: Array.from(allTerms.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([term]) => term),
      optimalLength: lengths.length > 0
        ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
        : 150,
      structurePattern: {
        hasQuestion: structures.hasQuestion / total,
        hasExample: structures.hasExample / total,
        hasComparison: structures.hasComparison / total,
        hasCallToAction: structures.hasCallToAction / total,
      },
      topPerformers: highPerformers.slice(0, 5),
    };
  }
}

