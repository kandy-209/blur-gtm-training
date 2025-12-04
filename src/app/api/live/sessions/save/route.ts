import { NextRequest, NextResponse } from 'next/server';
import { sessionManager } from '@/lib/live-session-manager';
import { getSupabaseClient } from '@/lib/supabase-client';

// Create Supabase client with service role key for server-side operations
const supabase = getSupabaseClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      );
    }

    const session = sessionManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Format all messages into a single conversation file
    const conversationText = session.conversationHistory
      .map((msg) => {
        const timestamp = typeof msg.timestamp === 'string' 
          ? new Date(msg.timestamp).toISOString()
          : msg.timestamp.toISOString();
        const role = msg.role === 'rep' ? 'Sales Rep' : 'Prospect';
        return `[${timestamp}] ${role}: ${msg.message}`;
      })
      .join('\n\n');

    // Create a formatted JSON file with all session data
    const sessionData = {
      sessionId: session.id,
      scenarioId: session.scenarioId,
      repUserId: session.repUserId,
      prospectUserId: session.prospectUserId,
      status: session.status,
      createdAt: session.createdAt.toISOString(),
      startedAt: session.startedAt?.toISOString(),
      completedAt: session.completedAt?.toISOString(),
      conversationHistory: session.conversationHistory.map(msg => ({
        id: msg.id,
        userId: msg.userId,
        role: msg.role,
        message: msg.message,
        timestamp: typeof msg.timestamp === 'string' ? msg.timestamp : msg.timestamp.toISOString(),
        type: msg.type,
      })),
      conversationText, // Plain text version
      messageCount: session.conversationHistory.length,
    };

    // Save to Supabase if available, otherwise save to file system
    if (supabase) {
      try {
        // First, mark session as completed
        sessionManager.completeSession(sessionId);
        
        // Save to Supabase live_sessions table - all messages in one record
        const { data, error } = await supabase
          .from('live_sessions')
          .upsert({
            id: session.id,
            scenario_id: session.scenarioId,
            rep_user_id: session.repUserId,
            prospect_user_id: session.prospectUserId,
            status: session.status,
            created_at: session.createdAt.toISOString(),
            started_at: session.startedAt?.toISOString(),
            completed_at: session.completedAt?.toISOString() || new Date().toISOString(),
            conversation_data: sessionData, // Store entire conversation as JSON
            conversation_text: conversationText, // Store plain text version
            message_count: session.conversationHistory.length,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
          });

        if (error) {
          console.error('Supabase save error:', error);
          // Fall through to file system save
        } else {
          return NextResponse.json({ 
            success: true,
            saved: true,
            sessionId: session.id,
            message: 'All messages saved together in one file',
            data: sessionData,
          });
        }
      } catch (error) {
        console.error('Supabase error:', error);
        // Fall through to file system save
      }
    }

    // Fallback: Return the session data for client-side download
    // In a production environment, you might want to save to a file storage service
    return NextResponse.json({ 
      success: true,
      saved: false,
      sessionId: session.id,
      message: 'Session data ready for download',
      data: sessionData,
      downloadUrl: `data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(sessionData, null, 2))}`,
    });
  } catch (error: any) {
    console.error('Session save error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save session' },
      { status: 500 }
    );
  }
}

