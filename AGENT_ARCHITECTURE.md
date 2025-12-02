# Agent-Based Architecture Implementation

## ✅ Implementation Complete

All agent files have been created and integrated into the system. The build passes successfully.

## 📁 File Structure

```
src/lib/agents/
├── base/
│   ├── Agent.ts                    # Base agent class
│   ├── AgentContext.ts             # Shared types
│   └── AgentOrchestrator.ts        # Agent coordinator
├── generation/
│   ├── ResponseGenerationAgent.ts  # Generates sales responses
│   └── ImprovementGenerationAgent.ts # Generates improvements
├── ranking/
│   ├── ResponseRankingAgent.ts     # Ranks responses
│   └── QualityScoringAgent.ts     # Scores quality
├── matching/
│   └── ResourceMatchingAgent.ts   # Matches resources
└── analysis/
    └── FeedbackAnalysisAgent.ts    # Analyzes feedback

src/app/api/agents/
├── orchestrate/route.ts           # Workflow orchestration
└── [agentName]/route.ts           # Single agent execution
```

## 🤖 Available Agents

1. **ResponseGenerationAgent** (`generate`)
   - Generates contextual sales responses using AI
   - Input: objection, conversation history, persona, turn number
   - Output: Generated response with confidence and key points

2. **ResponseRankingAgent** (`rank`)
   - Ranks and scores multiple response options
   - Input: Array of responses, context
   - Output: Ranked responses with scores and factors

3. **ImprovementGenerationAgent** (`improve`)
   - Generates improvement suggestions for messages
   - Input: Original message, feedback, objection category
   - Output: Array of improvement suggestions with explanations

4. **ResourceMatchingAgent** (`match-resources`)
   - Matches relevant resources to messages
   - Input: Message, objection category
   - Output: Top 5 matched resources with relevance scores

5. **FeedbackAnalysisAgent** (`analyze-feedback`)
   - Analyzes user feedback quality and impact
   - Input: Feedback, original message, context
   - Output: Quality scores, recommendations, implementation decision

6. **QualityScoringAgent** (`score-quality`)
   - Scores response quality across dimensions
   - Input: Response text
   - Output: Overall score with breakdown and strengths/weaknesses

## 🔄 Available Workflows

1. **generate-and-rank**
   - Generates a response and ranks it
   - Combines ResponseGenerationAgent + ResponseRankingAgent

2. **improve-with-resources**
   - Generates improvements and matches resources
   - Combines ImprovementGenerationAgent + ResourceMatchingAgent

3. **analyze-feedback-complete**
   - Analyzes feedback and generates improvements if needed
   - Combines FeedbackAnalysisAgent + ImprovementGenerationAgent

## 📡 API Usage

### Single Agent Execution

```bash
POST /api/agents/[agentName]
{
  "input": {
    // Agent-specific input
  },
  "context": {
    // Optional context
  }
}
```

### Workflow Execution

```bash
POST /api/agents/orchestrate
{
  "workflow": "generate-and-rank",
  "input": {
    // Workflow-specific input
  },
  "context": {
    // Optional context
  }
}
```

## 💻 Code Examples

### Using Orchestrator Directly

```typescript
import { orchestrator } from '@/lib/agents/base/AgentOrchestrator';

// Execute single agent
const result = await orchestrator.execute('generate', {
  objection: 'Why should we switch?',
  conversationHistory: [],
  persona: { /* ... */ },
  turnNumber: 1,
});

// Execute workflow
const workflowResult = await orchestrator.orchestrateWorkflow(
  'improve-with-resources',
  {
    originalMessage: 'Cursor is better',
    objectionCategory: 'Competitive_Copilot',
  }
);
```

### Using API Routes

```typescript
// Single agent
const response = await fetch('/api/agents/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    input: {
      objection: 'Why switch?',
      conversationHistory: [],
      persona: { /* ... */ },
      turnNumber: 1,
    },
  }),
});

// Workflow
const workflowResponse = await fetch('/api/agents/orchestrate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    workflow: 'improve-with-resources',
    input: {
      originalMessage: 'Cursor is better',
      objectionCategory: 'Competitive_Copilot',
    },
  }),
});
```

## 🗄️ Database Methods Added

- `getResourcesByCategory(category: string)` - Gets resources by objection category
- `getResponsePerformance(responseId: string)` - Gets performance metrics for a response

## 🧪 Testing

All agents are ready for integration testing. Example test structure:

```typescript
import { orchestrator } from '@/lib/agents/base/AgentOrchestrator';

describe('ResponseGenerationAgent', () => {
  it('should generate a response', async () => {
    const result = await orchestrator.execute('generate', {
      objection: 'Test objection',
      conversationHistory: [],
      persona: { /* ... */ },
      turnNumber: 1,
    });
    
    expect(result.success).toBe(true);
    expect(result.data?.response).toBeDefined();
  });
});
```

## 🚀 Next Steps

1. **Integration**: Integrate agents into existing components (TopResponses, RoleplayEngine)
2. **UI Components**: Create UI components for agent-powered features
3. **Testing**: Add comprehensive unit and integration tests
4. **Monitoring**: Add logging and monitoring for agent performance
5. **Optimization**: Fine-tune agent prompts and scoring algorithms

## 📝 Notes

- All agents extend `BaseAgent` for consistent behavior
- Agents use retry logic with exponential backoff
- Error handling is built into each agent
- Metadata includes execution time and confidence scores
- Agents are designed to be composable into workflows

