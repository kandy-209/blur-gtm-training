/**
 * Agent Cost Tracker
 * Track and estimate costs for AI agent API calls
 */

interface CostEstimate {
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedCost: number;
  currency: string;
}

interface ProviderPricing {
  inputCostPer1k: number;
  outputCostPer1k: number;
}

const PRICING: Record<string, Record<string, ProviderPricing>> = {
  claude: {
    'claude-3-5-sonnet-20241022': {
      inputCostPer1k: 0.003,
      outputCostPer1k: 0.015,
    },
    'claude-3-opus-20240229': {
      inputCostPer1k: 0.015,
      outputCostPer1k: 0.075,
    },
  },
  openai: {
    'gpt-4-turbo-preview': {
      inputCostPer1k: 0.01,
      outputCostPer1k: 0.03,
    },
    'gpt-4': {
      inputCostPer1k: 0.03,
      outputCostPer1k: 0.06,
    },
  },
  gemini: {
    'gemini-pro': {
      inputCostPer1k: 0.0005,
      outputCostPer1k: 0.0015,
    },
  },
};

export class AgentCostTracker {
  private costs: CostEstimate[] = [];
  private maxHistory = 1000;

  /**
   * Estimate cost for API call
   */
  estimateCost(
    provider: string,
    model: string,
    inputTokens: number,
    outputTokens: number
  ): CostEstimate {
    const pricing = PRICING[provider]?.[model];
    if (!pricing) {
      return {
        provider,
        model,
        inputTokens,
        outputTokens,
        estimatedCost: 0,
        currency: 'USD',
      };
    }

    const inputCost = (inputTokens / 1000) * pricing.inputCostPer1k;
    const outputCost = (outputTokens / 1000) * pricing.outputCostPer1k;
    const totalCost = inputCost + outputCost;

    const estimate: CostEstimate = {
      provider,
      model,
      inputTokens,
      outputTokens,
      estimatedCost: totalCost,
      currency: 'USD',
    };

    // Record cost
    this.recordCost(estimate);

    return estimate;
  }

  /**
   * Record cost estimate
   */
  private recordCost(estimate: CostEstimate): void {
    this.costs.push(estimate);

    // Keep only recent history
    if (this.costs.length > this.maxHistory) {
      this.costs.shift();
    }
  }

  /**
   * Get total costs
   */
  getTotalCosts(timeWindow?: number): {
    total: number;
    byProvider: Record<string, number>;
    byAgent: Record<string, number>;
    count: number;
  } {
    let relevantCosts = this.costs;

    if (timeWindow) {
      // Would need timestamps to filter by time window
      // For now, just return all
    }

    const total = relevantCosts.reduce((sum, cost) => sum + cost.estimatedCost, 0);

    const byProvider: Record<string, number> = {};
    const byAgent: Record<string, number> = {};

    relevantCosts.forEach(cost => {
      byProvider[cost.provider] = (byProvider[cost.provider] || 0) + cost.estimatedCost;
      // Would need agent name in cost estimate to track by agent
    });

    return {
      total,
      byProvider,
      byAgent,
      count: relevantCosts.length,
    };
  }

  /**
   * Get average cost per call
   */
  getAverageCost(): number {
    if (this.costs.length === 0) return 0;
    const total = this.costs.reduce((sum, cost) => sum + cost.estimatedCost, 0);
    return total / this.costs.length;
  }

  /**
   * Clear cost history
   */
  clearHistory(): void {
    this.costs = [];
  }
}

export const agentCostTracker = new AgentCostTracker();

