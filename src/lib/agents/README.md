# Agent-Based Architecture

This directory contains the agent-based system for ML-powered sales messaging.

## Architecture Overview

The system is broken down into specialized agents, each with a single responsibility:

### Base Infrastructure
- **`base/Agent.ts`** - Base agent class with common functionality
- **`base/AgentContext.ts`** - Shared types and interfaces
- **`base/AgentOrchestrator.ts`** - Coordinates agents and workflows

### Generation Agents
- **`generation/ResponseGenerationAgent.ts`** - Generates sales responses using AI
- **`generation/ImprovementGenerationAgent.ts`** - Generates improvement suggestions

### Ranking Agents
- **`ranking/ResponseRankingAgent.ts`** - Ranks and scores multiple response options
- **`ranking/QualityScoringAgent.ts`** - Scores response quality across dimensions

### Matching Agents
- **`matching/ResourceMatchingAgent.ts`** - Matches relevant resources to messages

### Analysis Agents
- **`analysis/FeedbackAnalysisAgent.ts`** - Analyzes user feedback quality and impact

## Usage

### Single Agent Execution

```typescript
import { orchestrator } from '@/lib/agents/base/AgentOrchestrator';

// Execute a single agent
const result = await orchestrator.execute('generate', {
  objection: 'Why should we switch from self-hosted Puppeteer/Playwright?',
  conversationHistory: [],
  persona: { /* ... */ },
  turnNumber: 1,
}, context);
```

### Workflow Execution

```typescript
// Execute a workflow
const result = await orchestrator.orchestrateWorkflow('improve-with-resources', {
  originalMessage: 'Browserbase is better than self-hosted solutions',
  objectionCategory: 'Competitive_SelfHosted',
}, context);
```

### API Usage

```typescript
// POST /api/agents/orchestrate
{
  "workflow": "generate-and-rank",
  "input": { /* ... */ },
  "context": { /* ... */ }
}

// POST /api/agents/[agentName]
{
  "input": { /* ... */ },
  "context": { /* ... */ }
}
```

## Available Agents

- `generate` - ResponseGenerationAgent
- `rank` - ResponseRankingAgent
- `improve` - ImprovementGenerationAgent
- `match-resources` - ResourceMatchingAgent
- `analyze-feedback` - FeedbackAnalysisAgent
- `score-quality` - QualityScoringAgent

## Available Workflows

- `generate-and-rank` - Generate response and rank it
- `improve-with-resources` - Generate improvements with resource matching
- `analyze-feedback-complete` - Analyze feedback and generate improvements if needed

## Adding New Agents

1. Create agent class extending `BaseAgent`
2. Implement `execute` method
3. Register in `AgentOrchestrator.initializeAgents()`
4. Add API route if needed

