import { NextRequest } from 'next/server';
import { sessionManager } from '@/lib/live-session-manager';

/**
 * Server-Sent Events (SSE) endpoint for real-time live chat updates
 * Uses Next.js 16 streaming capabilities for efficient real-time communication
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('sessionId');

  if (!sessionId) {
    return new Response('sessionId is required', { status: 400 });
  }

  // Create a ReadableStream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      let lastMessageCount = 0;
      let isActive = true;

      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected', sessionId })}\n\n`)
      );

      // Poll for updates and stream them
      const interval = setInterval(async () => {
        if (!isActive) {
          clearInterval(interval);
          return;
        }

        try {
          const session = sessionManager.getSession(sessionId);
          
          if (!session) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Session not found' })}\n\n`)
            );
            clearInterval(interval);
            controller.close();
            return;
          }

          const currentMessageCount = session.conversationHistory?.length || 0;

          // Send updates if messages changed
          if (currentMessageCount !== lastMessageCount) {
            const newMessages = session.conversationHistory?.slice(lastMessageCount) || [];
            
            for (const message of newMessages) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ type: 'message', message })}\n\n`)
              );
            }

            // Send session update
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ 
                type: 'session_update', 
                session: {
                  id: session.id,
                  status: session.status,
                  repUserId: session.repUserId,
                  prospectUserId: session.prospectUserId,
                  scenarioId: session.scenarioId,
                  createdAt: session.createdAt,
                  startedAt: session.startedAt,
                  completedAt: session.completedAt,
                }
              })}\n\n`)
            );

            lastMessageCount = currentMessageCount;
          }

          // Send heartbeat to keep connection alive
          controller.enqueue(
            encoder.encode(`: heartbeat\n\n`)
          );
        } catch (error) {
          console.error('SSE stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'Stream error' })}\n\n`)
          );
        }
      }, 500); // Check every 500ms for near real-time updates

      // Cleanup on client disconnect
      request.signal.addEventListener('abort', () => {
        isActive = false;
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering for nginx
    },
  });
}

