import { NextRequest, NextResponse } from 'next/server';
import { ScenarioInput, AgentResponse, Persona } from '@/types/roleplay';
import { sanitizeInput, validateText, validateJSONStructure } from '@/lib/security';
import { db } from '@/lib/db';
import { getAIProvider, type LLMProvider } from '@/lib/ai-providers';
import { handleError, withErrorHandler, generateRequestId } from '@/lib/error-handler';
import { log } from '@/lib/logger';
import { recordApiCall, roleplayTurnsTotal } from '@/lib/metrics';
import { captureException } from '@/lib/sentry';

function buildSystemPrompt(persona: Persona, scenarioInput: ScenarioInput): string {
  return `# 1. Agent Persona: The Enterprise Decision-Maker

You are a sophisticated, skeptical, and realistic enterprise buyer or decision-maker evaluating Blur Enterprise. Your persona is defined below.

## Persona: ${persona.name}

* **Current Solution:** ${persona.currentSolution}

* **Primary Goal:** ${persona.primaryGoal}

* **Skepticism:** ${persona.skepticism}

* **Tone:** ${persona.tone}

# 2. Scenario and Mandate - BLUR ENTERPRISE GTM FOCUS

The user (the Sales Rep) is selling Blur Enterprise. Your goal is to continue the conversation until ONE of these outcomes:
- **MEETING_BOOKED**: The rep successfully books a meeting/demo (you agree to a specific time/date)
- **ENTERPRISE_SALE**: The rep successfully convinces you to move forward with Blur Enterprise (you express strong commitment to purchase)

## Your Mandate:

1. **Present Objection:** Start with the pre-defined scenario objection (see INPUT below).

2. **Continue Conversation:** Keep the conversation going back and forth. As the prospect, you should:
   - Raise concerns and objections naturally
   - Ask follow-up questions about Enterprise features, pricing, security, implementation
   - Show increasing interest as the rep addresses your concerns well
   - Gradually warm up to the idea of Blur Enterprise

3. **Evaluate Rep's Responses:**
   - **PASS**: Rep adequately addresses concerns using Blur Enterprise value props (codebase understanding, enterprise security, team collaboration, ROI, etc.)
   - **FAIL**: Rep's response is vague or doesn't address the concern
   - **REJECT**: Rep's response is poor or off-topic

4. **Progress Towards Sale:**
   - Early turns: Focus on objections and concerns
   - Middle turns: Ask about Enterprise features, pricing, implementation
   - Later turns: Show interest, ask about next steps, discuss timelines
   - Final turns: Agree to meeting OR commit to Enterprise purchase

5. **End Conditions - ONLY end when:**
   - **MEETING_BOOKED**: Rep successfully books a meeting (you agree to specific time/date like "Yes, let's schedule for next Tuesday at 2pm")
   - **ENTERPRISE_SALE**: Rep successfully closes (you commit like "Yes, let's move forward with Enterprise" or "I'm ready to purchase")
   - **END_SCENARIO**: Only if conversation goes completely off-track or rep gives up

6. **Enterprise Focus**: Always think about Enterprise needs:
   - Team size and collaboration
   - Security and compliance requirements
   - Integration with existing tools
   - ROI and productivity metrics
   - Implementation and onboarding
   - Support and training

# 3. Input Data

Turn Number: ${scenarioInput.turn_number}
Scenario ID: ${scenarioInput.scenario_id}
Objection Category: ${scenarioInput.objection_category}
Objection Statement: ${scenarioInput.objection_statement}

# 4. Strict JSON Output Format (Mandatory)

You must only reply with a single JSON object. Do not include any preceding or trailing text, markdown, or commentary.

{
  "agent_response_text": "[Your response as the prospect. Continue the conversation naturally. If rep books meeting or closes sale, respond positively]",
  "scoring_feedback": "[Brief assessment: Did rep address concerns? Are they progressing towards meeting/sale?]",
  "response_evaluation": "[PASS | FAIL | REJECT]",
  "next_step_action": "[FOLLOW_UP | REJECT_AND_RESTATE | MEETING_BOOKED | ENTERPRISE_SALE | END_SCENARIO]",
  "confidence_score": [50-100],
  "sale_indicators": {
    "meeting_agreed": [true if rep booked meeting, false otherwise],
    "enterprise_interest": [true if showing strong Enterprise interest, false otherwise],
    "next_steps_discussed": [true if discussing next steps, false otherwise]
  }
}

**CRITICAL**: Only set next_step_action to MEETING_BOOKED or ENTERPRISE_SALE when the rep has ACTUALLY booked a meeting or closed the sale. Keep the conversation going until then!`;
}

export const POST = withErrorHandler(async function POST(request: NextRequest) {
  const requestId = generateRequestId();
  const startTime = Date.now();
  
  try {
    // Validate content type
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Validate request body is an object
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Request body must be a JSON object' },
        { status: 400 }
      );
    }

    // Check payload size (rough estimate)
    const payloadSize = JSON.stringify(body).length;
    const MAX_PAYLOAD_SIZE = 500000; // 500KB limit
    if (payloadSize > MAX_PAYLOAD_SIZE) {
      return NextResponse.json(
        { error: `Payload too large: ${payloadSize} bytes (max ${MAX_PAYLOAD_SIZE})` },
        { status: 413 } // Payload Too Large
      );
    }
    
    // Validate request body structure
    if (!body.scenarioInput || !body.persona || !body.conversationHistory) {
      return NextResponse.json(
        { error: 'Missing required fields: scenarioInput, persona, conversationHistory' },
        { status: 400 }
      );
    }

    // Validate data types
    if (typeof body.scenarioInput !== 'object' || body.scenarioInput === null) {
      return NextResponse.json(
        { error: 'scenarioInput must be an object' },
        { status: 400 }
      );
    }

    if (typeof body.persona !== 'object' || body.persona === null) {
      return NextResponse.json(
        { error: 'persona must be an object' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.conversationHistory)) {
      return NextResponse.json(
        { error: 'conversationHistory must be an array' },
        { status: 400 }
      );
    }

    const { 
      scenarioInput, 
      persona, 
      conversationHistory,
      llmProvider
    }: { 
      scenarioInput: ScenarioInput;
      persona: Persona;
      conversationHistory: Array<{ role: string; message: string }>;
      llmProvider?: LLMProvider;
    } = body;

    // Validate llmProvider if provided
    if (llmProvider && !['claude', 'gemini', 'openai'].includes(llmProvider)) {
      return NextResponse.json(
        { error: 'Invalid llmProvider. Must be one of: claude, gemini, openai' },
        { status: 400 }
      );
    }

    // Validate and sanitize inputs
    if (!validateJSONStructure<ScenarioInput>(scenarioInput, {
      turn_number: (v) => typeof v === 'number' && v > 0 && v < 100,
      scenario_id: (v) => typeof v === 'string' && v.length > 0 && v.length < 100,
      objection_category: (v) => typeof v === 'string' && v.length > 0 && v.length < 100,
      objection_statement: (v) => typeof v === 'string' && v.length > 0 && v.length < 5000,
    })) {
      return NextResponse.json(
        { error: 'Invalid scenarioInput structure' },
        { status: 400 }
      );
    }

    // Sanitize persona data
    const sanitizedPersona: Persona = {
      name: sanitizeInput(persona.name, 200),
      currentSolution: sanitizeInput(persona.currentSolution, 1000),
      primaryGoal: sanitizeInput(persona.primaryGoal, 1000),
      skepticism: sanitizeInput(persona.skepticism, 2000),
      tone: sanitizeInput(persona.tone, 500),
    };

    // Validate and sanitize conversation history
    if (!Array.isArray(conversationHistory) || conversationHistory.length > 50) {
      return NextResponse.json(
        { error: 'Invalid conversation history: must be an array with max 50 messages' },
        { status: 400 }
      );
    }

    const sanitizedHistory = conversationHistory.map((msg) => ({
      role: msg.role === 'rep' || msg.role === 'agent' ? msg.role : 'rep',
      message: sanitizeInput(msg.message, 5000),
    }));

    const systemPrompt = buildSystemPrompt(sanitizedPersona, scenarioInput);

    // Build messages for AI
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];
    
    // Add conversation history
    sanitizedHistory.forEach((msg) => {
      if (msg.role === 'rep') {
        messages.push({ role: 'user', content: `Sales Rep: ${msg.message}` });
      } else {
        messages.push({ role: 'assistant', content: `Prospect: ${msg.message}` });
      }
    });

    // Get AI provider
    let aiProvider;
    let content: string;
    
    try {
      // Use specified provider or auto-selection
      console.log('[Roleplay API] Selecting AI provider...');
      if (llmProvider) {
        console.log('[Roleplay API] Using specified provider:', llmProvider);
      } else {
        console.log('[Roleplay API] Auto-selecting provider based on available API keys...');
      }
      console.log('[Roleplay API] Environment check:', {
        ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? 'SET' : 'NOT SET',
        GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY ? 'SET' : 'NOT SET',
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'SET' : 'NOT SET',
      });
      
      aiProvider = getAIProvider(llmProvider);
      
      if (!aiProvider) {
        throw new Error('Failed to initialize AI provider. Check your API keys.');
      }
      
      console.log('[Roleplay API] Selected provider:', aiProvider.name);
      
      console.log('[Roleplay API] Using AI Provider:', aiProvider.name);
      
      content = await aiProvider.generateResponse(messages, systemPrompt);
      console.log('[Roleplay API] Got response from', aiProvider.name, '- length:', content.length);
      
    } catch (providerError: any) {
      const providerName = aiProvider?.name || 'unknown';
      console.error('[Roleplay API] Provider Error:', {
        message: providerError.message,
        stack: providerError.stack,
        provider: providerName,
        env: {
          AI_PROVIDER: process.env.AI_PROVIDER,
          hasHF: !!process.env.HUGGINGFACE_API_KEY,
          hasAnthropic: !!process.env.ANTHROPIC_API_KEY,
          hasOpenAI: !!process.env.OPENAI_API_KEY,
        }
      });
      
      // Handle provider-specific errors
      if (providerError?.message?.includes('quota exceeded') || providerError?.message?.includes('429')) {
        throw new Error(`${providerName} API quota exceeded. Try setting ANTHROPIC_API_KEY (free tier, recommended) or HUGGINGFACE_API_KEY (free but requires special permissions).`);
      }
      if (providerError?.message?.includes('permissions') || providerError?.message?.includes('403')) {
        if (providerName === 'huggingface') {
          throw new Error('Hugging Face API key lacks Inference Provider permissions. Get a FREE Anthropic Claude key instead: https://console.anthropic.com/ (recommended - more reliable)');
        }
        throw new Error(`${providerName} API permissions error: ${providerError.message}`);
      }
      if (providerError?.message?.includes('not configured') || providerError?.message?.includes('NOT SET')) {
        throw new Error(`${providerName} provider not configured: ${providerError.message}`);
      }
      if (providerError?.message?.includes('not found') || providerError?.message?.includes('404')) {
        throw new Error(`${providerName} API error: ${providerError.message}. Try using ANTHROPIC_API_KEY instead (free, recommended).`);
      }
      // Include provider name in generic errors
      throw new Error(`${providerName} API error: ${providerError.message || 'Unknown error'}`);
    }

    if (!content || !content.trim()) {
      throw new Error(`No response from AI provider (${aiProvider.name}). Please check your API key.`);
    }

    // Parse JSON response
    let agentResponse: AgentResponse;
    try {
      agentResponse = JSON.parse(content);
    } catch (parseError) {
      // Fallback: try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        agentResponse = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        throw new Error('Failed to parse JSON response');
      }
    }

    // Validate response structure
    if (!agentResponse.agent_response_text || !agentResponse.response_evaluation) {
      throw new Error('Invalid response structure from AI');
    }

    // Validate next_step_action
    const validActions = ['FOLLOW_UP', 'REJECT_AND_RESTATE', 'MEETING_BOOKED', 'ENTERPRISE_SALE', 'END_SCENARIO'];
    if (!validActions.includes(agentResponse.next_step_action)) {
      console.warn(`Invalid next_step_action: ${agentResponse.next_step_action}, defaulting to FOLLOW_UP`);
      agentResponse.next_step_action = 'FOLLOW_UP';
    }

    // Sanitize AI response
    agentResponse.agent_response_text = sanitizeInput(agentResponse.agent_response_text, 10000);
    agentResponse.scoring_feedback = sanitizeInput(agentResponse.scoring_feedback, 1000);
    
    // Validate confidence score range
    if (agentResponse.confidence_score < 50 || agentResponse.confidence_score > 100) {
      agentResponse.confidence_score = Math.max(50, Math.min(100, agentResponse.confidence_score));
    }

    // Ensure sale_indicators exists
    if (!agentResponse.sale_indicators) {
      agentResponse.sale_indicators = {
        meeting_agreed: agentResponse.next_step_action === 'MEETING_BOOKED',
        enterprise_interest: agentResponse.next_step_action === 'ENTERPRISE_SALE' || agentResponse.confidence_score >= 85,
        next_steps_discussed: agentResponse.next_step_action === 'MEETING_BOOKED' || agentResponse.next_step_action === 'ENTERPRISE_SALE',
      };
    }

    // Enhance AI response with insights from database (if available)
    try {
      if (db && typeof db.getAIInsights === 'function') {
        const insights = await db.getAIInsights(scenarioInput.scenario_id, scenarioInput.objection_category);
        
        // If we have top responses, we can optionally include them in the system prompt
        // For now, we'll just log them for future enhancement
        if (insights && insights.topResponses && insights.topResponses.length > 0 && insights.averageScore > 0) {
          // Future: Use insights to improve AI responses
          console.log('AI Insights available:', {
            topResponsesCount: insights.topResponses.length,
            averageScore: insights.averageScore,
            successRate: insights.successRate,
          });
        }
      }
    } catch (error) {
      // Don't fail the request if insights fail
      console.error('Failed to get AI insights:', error);
    }

    // Save response for ML learning (async, don't wait)
    try {
      if (db && typeof db.saveUserResponse === 'function') {
        await db.saveUserResponse({
          userId: 'system',
          scenarioId: scenarioInput.scenario_id,
          turnNumber: scenarioInput.turn_number,
          objectionCategory: scenarioInput.objection_category,
          userMessage: sanitizedHistory[sanitizedHistory.length - 1]?.message || '',
          aiResponse: agentResponse.agent_response_text,
          evaluation: agentResponse.response_evaluation as 'PASS' | 'FAIL' | 'REJECT',
          confidenceScore: agentResponse.confidence_score,
          keyPointsMentioned: [],
        });
      }
    } catch (error) {
      // Don't fail the request if saving fails
      log.warn('Failed to save response for ML learning', { error: error instanceof Error ? error.message : String(error), requestId });
    }

    const duration = Date.now() - startTime;
    
    // Record metrics
    recordApiCall('roleplay', 'generate_response', 'success', duration / 1000);
    roleplayTurnsTotal.inc({ 
      scenario_id: scenarioInput.scenario_id,
      evaluation: agentResponse.response_evaluation || 'unknown'
    });
    
    log.info('Roleplay response generated', {
      scenarioId: scenarioInput.scenario_id,
      turnNumber: scenarioInput.turn_number,
      duration,
      requestId,
    });

    return NextResponse.json({ agentResponse }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
        'X-Request-ID': requestId,
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Record error metrics
    recordApiCall('roleplay', 'generate_response', 'error', duration / 1000);
    
    // Log and track error
    log.error('Roleplay API error', error instanceof Error ? error : new Error(String(error)), { requestId });
    captureException(error instanceof Error ? error : new Error(String(error)), { requestId });
    
    // Use centralized error handler
    return handleError(error, requestId);
  }
});
