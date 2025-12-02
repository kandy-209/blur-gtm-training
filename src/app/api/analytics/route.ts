import { NextRequest, NextResponse } from 'next/server';
import { TrainingEvent } from '@/lib/analytics';
import { sanitizeInput, validateJSONStructure } from '@/lib/security';

// In production, you'd save to a database
// For now, we'll just log and return success
const events: TrainingEvent[] = [];

export async function POST(request: NextRequest) {
  try {
    // Validate content type
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const event: TrainingEvent = await request.json();

    // Validate event structure
    const validEventTypes = ['scenario_start', 'scenario_complete', 'turn_submit', 'feedback_view', 'module_complete'];
    if (!event.eventType || !validEventTypes.includes(event.eventType)) {
      return NextResponse.json(
        { error: 'Invalid event type' },
        { status: 400 }
      );
    }

    // Sanitize event data
    const sanitizedEvent: TrainingEvent = {
      ...event,
      scenarioId: event.scenarioId ? sanitizeInput(event.scenarioId, 100) : undefined,
      userId: event.userId ? sanitizeInput(event.userId, 100) : undefined,
    };

    // Limit events array size (prevent memory issues)
    if (events.length > 10000) {
      events.splice(0, 1000); // Remove oldest 1000 events
    }

    events.push(sanitizedEvent);
    
    // Here you would save to your database (e.g., Supabase, PostgreSQL, etc.)
    // await db.trainingEvents.create({ data: event });
    
    // Log without sensitive data
    console.log('Analytics event:', {
      eventType: sanitizedEvent.eventType,
      scenarioId: sanitizedEvent.scenarioId,
      timestamp: sanitizedEvent.timestamp,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');
  
  // Sanitize userId if provided
  const sanitizedUserId = userId ? sanitizeInput(userId, 100) : null;
  
  // Limit results to prevent large responses
  const userEvents = sanitizedUserId 
    ? events.filter(e => e.userId === sanitizedUserId).slice(-100) // Last 100 events
    : events.slice(-100); // Last 100 events
  
  return NextResponse.json({ 
    events: userEvents,
    total: events.length,
    returned: userEvents.length,
  });
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventIndex, userId, timestamp } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Find and remove the event
    const sanitizedUserId = sanitizeInput(userId, 100);
    const eventTimestamp = timestamp ? new Date(timestamp) : null;

    // Remove from in-memory array
    const initialLength = events.length;
    const filteredEvents = events.filter((event, index) => {
      // Match by userId and timestamp if provided, or by index
      if (event.userId !== sanitizedUserId) return true;
      if (eventTimestamp && new Date(event.timestamp).getTime() !== eventTimestamp.getTime()) return true;
      if (typeof eventIndex === 'number' && index !== eventIndex) return true;
      return false;
    });

    // Only remove one event if timestamp matches, otherwise remove all matching
    if (eventTimestamp) {
      const indexToRemove = events.findIndex(e => 
        e.userId === sanitizedUserId && 
        new Date(e.timestamp).getTime() === eventTimestamp.getTime()
      );
      if (indexToRemove > -1) {
        events.splice(indexToRemove, 1);
      }
    } else {
      // Remove all events for this user (or just update the array)
      events.length = 0;
      events.push(...filteredEvents);
    }

    return NextResponse.json({ 
      success: true,
      deleted: initialLength - events.length,
    });
  } catch (error) {
    console.error('Delete analytics event error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}

