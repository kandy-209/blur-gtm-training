/**
 * ElevenLabs Conversations API
 * Handles saving and retrieving conversation data
 */

import { NextRequest, NextResponse } from 'next/server';
import { conversationDB } from '@/lib/elevenlabs-db';
import { sanitizeInput } from '@/lib/security';

// GET - Retrieve conversations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const scenarioId = searchParams.get('scenarioId');
    const conversationId = searchParams.get('conversationId');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    if (conversationId) {
      // Get specific conversation
      const conversation = await conversationDB.getConversation(conversationId);
      if (!conversation) {
        return NextResponse.json(
          { error: 'Conversation not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(conversation);
    }

    if (scenarioId) {
      // Get conversations for a scenario
      const conversations = await conversationDB.getScenarioConversations(
        scenarioId,
        limit,
        offset
      );
      return NextResponse.json({ conversations, count: conversations.length });
    }

    if (userId) {
      // Get conversations for a user
      const conversations = await conversationDB.getUserConversations(
        userId,
        limit,
        offset
      );
      return NextResponse.json({ conversations, count: conversations.length });
    }

    return NextResponse.json(
      { error: 'userId, scenarioId, or conversationId is required' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Save conversation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      conversationId,
      userId,
      scenarioId,
      agentId,
      metrics,
      messages
    } = body;

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    if (!metrics || !messages) {
      return NextResponse.json(
        { error: 'metrics and messages are required' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedConversationId = sanitizeInput(conversationId, 100);
    const sanitizedUserId = userId ? sanitizeInput(userId, 100) : undefined;
    const sanitizedScenarioId = scenarioId ? sanitizeInput(scenarioId, 100) : undefined;
    const sanitizedAgentId = agentId ? sanitizeInput(agentId, 100) : undefined;

    await conversationDB.saveConversation(
      sanitizedConversationId,
      sanitizedUserId,
      sanitizedScenarioId,
      sanitizedAgentId,
      {
        ...metrics,
        startTime: new Date(metrics.startTime),
        endTime: metrics.endTime ? new Date(metrics.endTime) : undefined,
      },
      messages
    );

    return NextResponse.json({ success: true, conversationId: sanitizedConversationId });
  } catch (error) {
    console.error('Error saving conversation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete conversation
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const conversationId = searchParams.get('conversationId');

    if (!conversationId) {
      return NextResponse.json(
        { error: 'conversationId is required' },
        { status: 400 }
      );
    }

    const sanitizedConversationId = sanitizeInput(conversationId, 100);
    await conversationDB.deleteConversation(sanitizedConversationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}




