import { BaseAgent, AgentContext, AgentResult } from './Agent';
import { ResponseGenerationAgent } from '../generation/ResponseGenerationAgent';
import { ResponseRankingAgent } from '../ranking/ResponseRankingAgent';
import { ImprovementGenerationAgent } from '../generation/ImprovementGenerationAgent';
import { ResourceMatchingAgent } from '../matching/ResourceMatchingAgent';
import { FeedbackAnalysisAgent } from '../analysis/FeedbackAnalysisAgent';
import { QualityScoringAgent } from '../ranking/QualityScoringAgent';

export class AgentOrchestrator {
  private agents: Map<string, BaseAgent>;
  
  constructor() {
    this.agents = new Map();
    this.initializeAgents();
  }
  
  private initializeAgents(): void {
    this.agents.set('generate', new ResponseGenerationAgent());
    this.agents.set('rank', new ResponseRankingAgent());
    this.agents.set('improve', new ImprovementGenerationAgent());
    this.agents.set('match-resources', new ResourceMatchingAgent());
    this.agents.set('analyze-feedback', new FeedbackAnalysisAgent());
    this.agents.set('score-quality', new QualityScoringAgent());
  }
  
  async execute(
    agentName: string,
    input: any,
    context?: AgentContext
  ): Promise<AgentResult> {
    const agent = this.agents.get(agentName);
    
    if (!agent) {
      return {
        success: false,
        error: `Agent '${agentName}' not found. Available: ${Array.from(this.agents.keys()).join(', ')}`,
      };
    }
    
    return await agent.execute(input, context);
  }
  
  async orchestrateWorkflow(
    workflow: string,
    input: any,
    context?: AgentContext
  ): Promise<AgentResult> {
    switch (workflow) {
      case 'generate-and-rank':
        return await this.generateAndRank(input, context);
      
      case 'improve-with-resources':
        return await this.improveWithResources(input, context);
      
      case 'analyze-feedback-complete':
        return await this.analyzeFeedbackComplete(input, context);
      
      default:
        return {
          success: false,
          error: `Unknown workflow: ${workflow}. Available: generate-and-rank, improve-with-resources, analyze-feedback-complete`,
        };
    }
  }
  
  private async generateAndRank(
    input: any,
    context?: AgentContext
  ): Promise<AgentResult> {
    // Step 1: Generate responses
    const generateResult = await this.execute('generate', input, context);
    
    if (!generateResult.success) {
      return generateResult;
    }
    
    // Step 2: Rank responses
    const rankResult = await this.execute('rank', {
      responses: [{ text: generateResult.data?.response || '' }],
      context: context || {},
    }, context);
    
    return {
      success: rankResult.success,
      data: {
        generated: generateResult.data,
        ranked: rankResult.data,
      },
      metadata: {
        agent: 'orchestrator',
        executionTime: (generateResult.metadata?.executionTime || 0) + (rankResult.metadata?.executionTime || 0),
        ...generateResult.metadata,
        ...rankResult.metadata,
      },
    };
  }
  
  private async improveWithResources(
    input: any,
    context?: AgentContext
  ): Promise<AgentResult> {
    // Step 1: Generate improvements
    const improveResult = await this.execute('improve', input, context);
    
    if (!improveResult.success) {
      return improveResult;
    }
    
    // Step 2: Match resources for each improvement
    const improvements = improveResult.data || [];
    const improvementsWithResources = await Promise.all(
      improvements.map(async (improvement: any) => {
        const resourceResult = await this.execute('match-resources', {
          message: improvement.improvedMessage,
          objectionCategory: input.objectionCategory,
          context,
        }, context);
        
        return {
          ...improvement,
          matchedResources: resourceResult.data || [],
        };
      })
    );
    
    return {
      success: true,
      data: improvementsWithResources,
      metadata: improveResult.metadata || {
        agent: 'orchestrator',
        executionTime: 0,
      },
    };
  }
  
  private async analyzeFeedbackComplete(
    input: any,
    context?: AgentContext
  ): Promise<AgentResult> {
    // Step 1: Analyze feedback
    const analysisResult = await this.execute('analyze-feedback', input, context);
    
    if (!analysisResult.success || !analysisResult.data?.shouldImplement) {
      return analysisResult;
    }
    
    // Step 2: If should implement, generate improvement
    const improveResult = await this.execute('improve', {
      originalMessage: input.originalMessage,
      feedback: input.feedback.text,
      objectionCategory: context?.objectionCategory || '',
      context,
    }, context);
    
    return {
      success: true,
      data: {
        analysis: analysisResult.data,
        improvement: improveResult.data,
      },
      metadata: {
        agent: 'orchestrator',
        executionTime: (analysisResult.metadata?.executionTime || 0) + (improveResult.metadata?.executionTime || 0),
        ...analysisResult.metadata,
        ...improveResult.metadata,
      },
    };
  }
}

export const orchestrator = new AgentOrchestrator();

