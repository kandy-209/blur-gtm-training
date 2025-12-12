/**
 * Sales Call API - Vercel + Modal Integration
 * Routes call initiation to Vapi, analysis to Modal
 */

import { NextRequest, NextResponse } from 'next/server';
import { sanitizeInput } from '@/lib/security';
import { scenarios } from '@/data/scenarios';

// MODAL_FUNCTION_URL is only used for GET requests and doesn't have testing issues
const MODAL_FUNCTION_URL = process.env.MODAL_FUNCTION_URL || '';

/**
 * POST /api/vapi/sales-call
 * Initiate sales training call
 */
export async function POST(request: NextRequest) {
  // Read VAPI_API_KEY dynamically to support testing and runtime updates
  const VAPI_API_KEY = process.env.VAPI_API_KEY || '';
  
  try {
    let body: any;
    try {
      body = await request.json();
    } catch (jsonError: any) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON in request body',
          message: jsonError.message || 'Failed to parse request body',
        },
        { status: 400 }
      );
    }
    
    const { phoneNumber, userId, scenarioId, trainingMode = 'practice' } = body;

    console.log('Vapi call request:', { phoneNumber, userId, scenarioId, trainingMode, hasApiKey: !!VAPI_API_KEY });

    // Validate input
    if (!phoneNumber || !userId || !scenarioId) {
      return NextResponse.json(
        { error: 'phoneNumber, userId, and scenarioId are required' },
        { status: 400 }
      );
    }

    // Validate phone number format - remove all formatting first
    // Handle both formatted strings and already-cleaned numbers
    let cleanedPhone: string;
    if (phoneNumber.startsWith('+')) {
      // Already in E.164 format, just remove + and validate
      cleanedPhone = phoneNumber.replace(/\D/g, '');
    } else {
      // Remove all non-digits
      cleanedPhone = phoneNumber.replace(/\D/g, '');
    }
    
    if (!cleanedPhone || cleanedPhone.length < 10) {
      return NextResponse.json(
        { 
          error: 'Invalid phone number format',
          message: 'Phone number must contain at least 10 digits',
          received: phoneNumber,
          cleaned: cleanedPhone,
          hint: 'Please use format: (555) 123-4567 or +1 (555) 123-4567'
        },
        { status: 400 }
      );
    }
    
    if (cleanedPhone.length > 15) {
      return NextResponse.json(
        { 
          error: 'Invalid phone number format',
          message: 'Phone number is too long (max 15 digits)',
          received: phoneNumber,
          cleaned: cleanedPhone,
          length: cleanedPhone.length
        },
        { status: 400 }
      );
    }
    
    // Format as E.164: +[country code][number]
    let phoneForVapi: string;
    if (cleanedPhone.length === 10) {
      // US number without country code - add +1
      phoneForVapi = `+1${cleanedPhone}`;
    } else if (cleanedPhone.length === 11 && cleanedPhone.startsWith('1')) {
      // US number with country code already
      phoneForVapi = `+${cleanedPhone}`;
    } else if (cleanedPhone.length >= 10 && cleanedPhone.length <= 15) {
      // International number - add +
      phoneForVapi = `+${cleanedPhone}`;
    } else {
      return NextResponse.json(
        { 
          error: 'Invalid phone number format',
          message: 'Phone number must be 10-15 digits',
          received: phoneNumber,
          cleaned: cleanedPhone,
          length: cleanedPhone.length
        },
        { status: 400 }
      );
    }
    
    // Final validation: E.164 format
    // E.164 allows: + followed by 1-15 digits, where the first digit after + can be 0-9
    // But for practical purposes, we allow +1 for US numbers
    const e164Pattern = /^\+[1-9]\d{9,14}$/;
    if (!e164Pattern.test(phoneForVapi)) {
      console.error('Invalid phone number format:', { 
        original: phoneNumber, 
        cleaned: cleanedPhone, 
        formatted: phoneForVapi,
        length: phoneForVapi.length,
        pattern: e164Pattern.toString()
      });
      return NextResponse.json(
        { 
          error: 'Invalid phone number format',
          message: 'Phone number must be in E.164 format (e.g., +12094702824)',
          received: phoneNumber,
          cleaned: cleanedPhone,
          formatted: phoneForVapi,
          hint: 'Ensure phone number is in E.164 format (e.g., +1234567890). For US numbers, use +1 followed by 10 digits.'
        },
        { status: 400 }
      );
    }
    
    console.log('Phone number validated:', {
      original: phoneNumber,
      cleaned: cleanedPhone,
      formatted: phoneForVapi,
      length: phoneForVapi.length
    });

    // Validate scenario exists
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario) {
      return NextResponse.json(
        { 
          error: 'Scenario not found',
          scenarioId,
          availableScenarios: scenarios.map(s => s.id),
        },
        { status: 404 }
      );
    }

    // Validate scenario has required fields
    if (!scenario.persona) {
      return NextResponse.json(
        { 
          error: 'Scenario missing persona data',
          scenarioId: scenario.id,
        },
        { status: 400 }
      );
    }

    if (!VAPI_API_KEY || VAPI_API_KEY.trim() === '') {
      console.error('⚠️ Vapi API key not configured. Please add VAPI_API_KEY to your .env.local file');
      console.error('Current VAPI_API_KEY value:', VAPI_API_KEY ? 'Set but empty' : 'Not set');
      return NextResponse.json(
        { 
          error: 'Vapi API key not configured. Please add VAPI_API_KEY to your environment variables.',
          helpUrl: 'https://vapi.ai/dashboard',
          debug: {
            hasKey: !!VAPI_API_KEY,
            keyLength: VAPI_API_KEY?.length || 0,
            keyPrefix: VAPI_API_KEY?.substring(0, 10) || 'none'
          }
        },
        { status: 503 }
      );
    }
    
    console.log('Vapi API key found, length:', VAPI_API_KEY.length);

    // Build system prompt safely
    let systemPrompt: string;
    try {
      systemPrompt = buildSystemPrompt(scenario);
      if (!systemPrompt || systemPrompt.trim().length === 0) {
        // Fallback prompt - ensure we have valid data
        const personaName = scenario.persona?.name || 'a prospect';
        const objectionStatement = scenario.objection_statement || 'I need to think about it';
        
        systemPrompt = `You are ${personaName} evaluating Cursor Enterprise. 
Respond naturally to the sales rep's questions and objections. 
Objection: ${objectionStatement}`;
        
        if (!systemPrompt || systemPrompt.trim().length === 0) {
          return NextResponse.json(
            { 
              error: 'Failed to create system prompt',
              message: 'Unable to generate prompt from scenario data',
            },
            { status: 500 }
          );
        }
      }
      console.log('System prompt built successfully, length:', systemPrompt.length);
    } catch (promptError: any) {
      console.error('Error building system prompt:', promptError);
      console.error('Scenario data:', {
        id: scenario.id,
        hasPersona: !!scenario.persona,
        personaName: scenario.persona?.name,
        hasObjection: !!scenario.objection_statement,
        hasKeyPoints: !!scenario.keyPoints
      });
      // Fallback prompt - ensure we have valid data
      const personaName = scenario.persona?.name || 'a prospect';
      const objectionStatement = scenario.objection_statement || 'I need to think about it';
      
      systemPrompt = `You are ${personaName} evaluating Cursor Enterprise. 
Respond naturally to the sales rep's questions and objections. 
Objection: ${objectionStatement}`;
      
      if (!systemPrompt || systemPrompt.trim().length === 0) {
        return NextResponse.json(
          { 
            error: 'Failed to create system prompt',
            message: 'Unable to generate prompt from scenario data',
          },
          { status: 500 }
        );
      }
      console.log('Using fallback system prompt, length:', systemPrompt.length);
    }

    // Create Vapi assistant with scenario context
    // Vapi requires: name <= 40 chars, provider = '11labs' (not 'elevenlabs'), no transcriptionEnabled
    const personaName = scenario.persona?.name || scenario.id || 'Unknown';
    // Truncate persona name if needed to ensure total name is <= 40 chars
    // Format: "Sales - [Persona]" where "Sales - " is 9 chars, leaving 31 for persona
    const prefix = 'Sales - ';
    const maxPersonaLength = 40 - prefix.length; // 31 chars for persona
    let truncatedPersona = personaName;
    if (personaName.length > maxPersonaLength) {
      // Truncate and add ellipsis, ensuring total doesn't exceed maxPersonaLength
      truncatedPersona = personaName.substring(0, maxPersonaLength - 3).trim() + '...';
    }
    const assistantName = `${prefix}${truncatedPersona}`.substring(0, 40); // Final safety check
    
    if (!assistantName || assistantName.length === 0 || assistantName.length > 40) {
      console.error('Invalid assistant name generated:', { assistantName, length: assistantName?.length });
      return NextResponse.json(
        { 
          error: 'Failed to generate valid assistant name',
          message: `Assistant name is invalid (length: ${assistantName?.length || 0})`,
          scenarioId: scenario.id,
          personaName: personaName,
        },
        { status: 500 }
      );
    }
    
    console.log('Generated assistant name:', { assistantName, length: assistantName.length });
    
    // Validate required fields before creating request
    const voiceId = process.env.NEXT_PUBLIC_ELEVENLABS_VOICE_ID || '21m00Tcm4TlvDq8ikWAM';
    const firstMessage = scenario.objection_statement || 'Hello, I received your call.';
    
    if (!voiceId || voiceId.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'ElevenLabs voice ID is required',
          message: 'NEXT_PUBLIC_ELEVENLABS_VOICE_ID environment variable is not set',
        },
        { status: 500 }
      );
    }
    
    if (!firstMessage || firstMessage.trim().length === 0) {
      return NextResponse.json(
        { 
          error: 'First message is required',
          message: 'Scenario missing objection_statement',
          scenarioId: scenario.id,
        },
        { status: 400 }
      );
    }
    
    const assistantRequest = {
      name: assistantName,
      model: {
        provider: 'openai',
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
        ],
      },
      voice: {
        provider: '11labs', // Must be '11labs' not 'elevenlabs'
        voiceId: voiceId,
      },
      firstMessage: firstMessage,
      recordingEnabled: true,
      // transcriptionEnabled is not a valid property - removed
    };
    
    // Validate request structure
    if (!assistantRequest.name || assistantRequest.name.length > 40) {
      return NextResponse.json(
        { 
          error: 'Invalid assistant name',
          message: `Assistant name is invalid: ${assistantRequest.name} (length: ${assistantRequest.name?.length || 0})`,
        },
        { status: 400 }
      );
    }
    
    if (!assistantRequest.voice.provider || assistantRequest.voice.provider !== '11labs') {
      return NextResponse.json(
        { 
          error: 'Invalid voice provider',
          message: `Voice provider must be '11labs', got: ${assistantRequest.voice.provider}`,
        },
        { status: 400 }
      );
    }

    // Validate JSON serialization before sending
    let requestBody: string;
    try {
      requestBody = JSON.stringify(assistantRequest);
      // Test that it can be parsed back
      JSON.parse(requestBody);
    } catch (jsonError: any) {
      console.error('Failed to serialize assistant request:', jsonError);
      return NextResponse.json(
        { 
          error: 'Invalid assistant request data',
          message: `Failed to serialize request: ${jsonError.message}`,
        },
        { status: 500 }
      );
    }
    
    console.log('Creating Vapi assistant with request:', {
      name: assistantRequest.name,
      nameLength: assistantRequest.name.length,
      model: assistantRequest.model.model,
      voiceProvider: assistantRequest.voice.provider,
      voiceId: assistantRequest.voice.voiceId,
      hasFirstMessage: !!assistantRequest.firstMessage,
      firstMessageLength: assistantRequest.firstMessage?.length || 0,
      systemPromptLength: systemPrompt.length,
      requestBodyLength: requestBody.length,
    });

    let assistantResponse: Response;
    try {
      assistantResponse = await fetch('https://api.vapi.ai/assistant', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: requestBody,
      });
    } catch (fetchError: any) {
      console.error('❌ Network error creating Vapi assistant:', {
        error: fetchError.message,
        stack: fetchError.stack,
        name: fetchError.name,
      });
      return NextResponse.json(
        { 
          error: 'Network error connecting to Vapi API',
          message: fetchError.message || 'Failed to connect to Vapi service',
          hint: 'Check your internet connection and Vapi API status',
        },
        { status: 503 }
      );
    }

    if (!assistantResponse.ok) {
      let errorText = '';
      try {
        errorText = await assistantResponse.text();
      } catch (textError) {
        errorText = `Failed to read error response: ${textError}`;
      }
      
      let errorMessage = 'Failed to create assistant';
      let errorDetails: any = {};
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.message || error.error || error.details || errorMessage;
        errorDetails = error;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      console.error('Vapi assistant creation error:', {
        status: assistantResponse.status,
        statusText: assistantResponse.statusText,
        error: errorMessage,
        details: errorDetails,
        requestBody: {
          name: assistantRequest.name,
          hasVoice: !!assistantRequest.voice.voiceId,
          hasSystemPrompt: !!systemPrompt,
          systemPromptLength: systemPrompt.length,
        }
      });
      return NextResponse.json(
        { 
          error: `Vapi assistant error (${assistantResponse.status})`,
          message: errorMessage,
          details: errorDetails,
        },
        { status: assistantResponse.status >= 400 && assistantResponse.status < 500 ? assistantResponse.status : 502 }
      );
    }

    let assistant: any;
    try {
      assistant = await assistantResponse.json();
    } catch (jsonError: any) {
      console.error('Failed to parse assistant response:', jsonError);
      return NextResponse.json(
        { 
          error: 'Invalid response from Vapi API',
          message: 'Failed to parse assistant creation response',
        },
        { status: 502 }
      );
    }
    
    if (!assistant || !assistant.id) {
      console.error('Invalid assistant response:', assistant);
      return NextResponse.json(
        { 
          error: 'Invalid assistant response from Vapi API',
          message: 'Missing assistant ID in response',
        },
        { status: 502 }
      );
    }
    
    console.log('Assistant created successfully:', {
      id: assistant.id,
      name: assistant.name,
    });

    // Use the already formatted phone number (phoneForVapi)
    console.log('Initiating Vapi call:', {
      phoneNumber: phoneForVapi,
      assistantId: assistant.id,
      hasAssistant: !!assistant.id
    });

    // Initiate call - Vapi API format
    // Vapi requires phone number in customer object with number property
    const callRequestBody: any = {
      assistantId: assistant.id,
      customer: {
        number: phoneForVapi, // E.164 format: +1234567890
      },
    };
    
    // Add metadata if supported
    if (userId || scenarioId) {
      callRequestBody.metadata = {
        userId,
        scenarioId,
        trainingMode,
        type: 'sales-training',
      };
    }

    console.log('Call request body:', {
      assistantId: callRequestBody.assistantId,
      customerNumber: callRequestBody.customer?.number,
      phoneNumberLength: callRequestBody.customer?.number?.length,
      phoneNumberFormat: /^\+[1-9]\d{9,14}$/.test(callRequestBody.customer?.number) ? 'E.164' : 'INVALID',
      hasMetadata: !!callRequestBody.metadata,
    });

    let callResponse: Response;
    try {
      callResponse = await fetch('https://api.vapi.ai/call', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${VAPI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(callRequestBody),
      });
    } catch (fetchError: any) {
      console.error('❌ Network error initiating Vapi call:', {
        error: fetchError.message,
        stack: fetchError.stack,
        name: fetchError.name,
        assistantId: assistant.id,
        phoneNumber: phoneForVapi,
      });
      return NextResponse.json(
        { 
          error: 'Network error connecting to Vapi API',
          message: fetchError.message || 'Failed to connect to Vapi service',
          hint: 'Check your internet connection and Vapi API status',
        },
        { status: 503 }
      );
    }

    if (!callResponse.ok) {
      let errorText = '';
      try {
        errorText = await callResponse.text();
      } catch (textError) {
        errorText = `Failed to read error response: ${textError}`;
      }
      
      let errorMessage = 'Failed to initiate call';
      let errorDetails: any = {};
      try {
        const error = JSON.parse(errorText);
        errorMessage = error.message || error.error || error.details || errorMessage;
        errorDetails = error;
      } catch {
        errorMessage = errorText || errorMessage;
      }
      
      // Log the FULL request body that was sent
      console.error('❌ Vapi call initiation error:', {
        status: callResponse.status,
        statusText: callResponse.statusText,
        error: errorMessage,
        errorText: errorText,
        errorDetails: errorDetails,
        requestBodySent: callRequestBody,
        requestBodyStringified: JSON.stringify(callRequestBody),
        phoneNumberValue: phoneForVapi,
        phoneNumberType: typeof phoneForVapi,
        phoneNumberLength: phoneForVapi?.length,
        assistantId: assistant.id,
        assistantIdType: typeof assistant.id,
      });
      
      return NextResponse.json(
        { 
          error: `Vapi call error (${callResponse.status})`,
          message: errorMessage,
          details: errorDetails,
          hint: errorMessage.includes('phoneNumber') || errorMessage.includes('phone')
            ? 'Ensure phone number is in E.164 format (e.g., +1234567890)'
            : 'Check Vapi API key and account status',
        },
        { status: callResponse.status >= 400 && callResponse.status < 500 ? callResponse.status : 502 }
      );
    }

    let callData: any;
    try {
      callData = await callResponse.json();
    } catch (jsonError: any) {
      console.error('Failed to parse call response:', jsonError);
      return NextResponse.json(
        { 
          error: 'Invalid response from Vapi API',
          message: 'Failed to parse call initiation response',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      callId: callData.id,
      status: callData.status,
      scenario: {
        id: scenario.id,
        persona: scenario.persona?.name || 'Unknown',
        objectionCategory: scenario.objection_category || 'general',
      },
    });
  } catch (error: any) {
    console.error('❌ Sales call initiation error:', {
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause,
      status: error.status,
      response: error.response,
      hasApiKey: !!VAPI_API_KEY,
      apiKeyLength: VAPI_API_KEY?.length || 0,
    });
    
    const errorMessage = error.message || 'Failed to initiate call';
    const statusCode = error.status || 500;
    
    // Return more detailed error information
    return NextResponse.json(
      { 
        error: errorMessage,
        message: errorMessage,
        // Include helpful hints based on error type
        hint: errorMessage.includes('API key') || errorMessage.includes('VAPI_API_KEY')
          ? 'Check your VAPI_API_KEY in environment variables'
          : errorMessage.includes('phone') || errorMessage.includes('number')
          ? 'Ensure phone number is in E.164 format (e.g., +1234567890)'
          : errorMessage.includes('assistant')
          ? 'Failed to create Vapi assistant - check API key permissions and Vapi dashboard'
          : errorMessage.includes('Vapi') || errorMessage.includes('network')
          ? 'Check Vapi API key and account status at https://vapi.ai/dashboard'
          : 'Check server logs for detailed error information',
        // Include debug info in development
        ...(process.env.NODE_ENV === 'development' && {
          debug: {
            hasApiKey: !!VAPI_API_KEY,
            apiKeyLength: VAPI_API_KEY?.length || 0,
            errorType: error.name,
            errorStack: error.stack?.split('\n').slice(0, 5).join('\n')
          }
        })
      },
      { status: statusCode }
    );
  }
}

/**
 * GET /api/vapi/sales-call/[callId]/analysis
 * Get call analysis from Modal
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const callId = searchParams.get('callId');
    const scenarioId = searchParams.get('scenarioId');
    const transcript = searchParams.get('transcript'); // Optional

    if (!callId || !scenarioId) {
      return NextResponse.json(
        { error: 'callId and scenarioId are required' },
        { status: 400 }
      );
    }

    if (!MODAL_FUNCTION_URL) {
      return NextResponse.json(
        { error: 'Modal function URL not configured' },
        { status: 500 }
      );
    }

    // Call Modal function for analysis
    const modalResponse = await fetch(MODAL_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        call_id: callId,
        scenario_id: scenarioId,
        transcript: transcript || undefined,
      }),
    });

    if (!modalResponse.ok) {
      let errorMessage = 'Failed to analyze call';
      try {
        const error = await modalResponse.json();
        errorMessage = error.error || errorMessage;
      } catch {
        errorMessage = `Modal API returned ${modalResponse.status}`;
      }
      return NextResponse.json(
        { 
          error: 'Failed to analyze call',
          message: errorMessage,
        },
        { status: modalResponse.status >= 400 && modalResponse.status < 500 ? modalResponse.status : 502 }
      );
    }

    const analysis = await modalResponse.json();

    return NextResponse.json({
      success: true,
      metrics: analysis.metrics,
      analysis: analysis.analysis,
      processedAt: analysis.processed_at,
    });
  } catch (error: any) {
    console.error('Call analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze call', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Build system prompt for Vapi assistant
 */
function buildSystemPrompt(scenario: any): string {
  const persona = scenario.persona || {};
  const objectionStatement = scenario.objection_statement || 'I need to think about it';
  
  return `You are ${persona.name || 'a prospect'}, a real prospect evaluating Cursor Enterprise.

PERSONA DETAILS:
- Current Solution: ${persona.currentSolution || 'Unknown'}
- Primary Goal: ${persona.primaryGoal || 'Evaluate solutions'}
- Skepticism: ${persona.skepticism || 'Moderate'}
- Tone: ${persona.tone || 'Professional'}

YOUR ROLE:
You are on a phone call with a sales rep selling Cursor Enterprise. This is a training call.

CONVERSATION FLOW:
1. Start with the objection: "${objectionStatement}"
2. Raise concerns naturally as the conversation progresses
3. Ask follow-up questions about Enterprise features, pricing, security
4. Show increasing interest if the rep addresses your concerns well
5. Progress towards either:
   - MEETING_BOOKED: Agree to a specific meeting time/date
   - ENTERPRISE_SALE: Commit to purchasing Cursor Enterprise

KEY POINTS TO DISCUSS:
${(scenario.keyPoints || []).map((p: string) => `- ${p}`).join('\n') || '- General discussion points'}

PHONE CALL BEHAVIOR:
- Speak naturally and conversationally
- Allow pauses for the rep to respond
- Don't interrupt unless the rep is going off-topic
- Show engagement through your tone
- Ask clarifying questions when needed

END CONDITIONS:
- Only agree to a meeting if the rep successfully books it with a specific time
- Only commit to purchase if the rep successfully closes
- Keep the conversation going until one of these outcomes

Remember: This is a training call. Help the sales rep learn by being realistic but fair.`;
}

