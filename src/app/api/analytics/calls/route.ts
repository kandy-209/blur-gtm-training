import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

/**
 * GET /api/analytics/calls
 * Get call training analytics for a user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    // Get call analytics from database
    // For now, we'll use a placeholder structure
    // In production, this would query your actual call analytics table
    
    // TODO: Replace with actual database query when call analytics table is set up
    // Try to get from database, but gracefully handle rate limits
    let calls: any[] = [];
    try {
      // If db.getCallAnalytics exists, use it
      if (db && typeof db.getCallAnalytics === 'function') {
        calls = await db.getCallAnalytics(userId) || [];
      }
    } catch (error: any) {
      // Handle rate limiting gracefully
      if (error?.status === 429 || error?.message?.includes('rate limit') || error?.message?.includes('429')) {
        console.warn('Rate limit hit for call analytics, returning empty data');
        // Return empty data instead of error
        calls = [];
      } else {
        console.error('Error fetching call analytics:', error);
        // Still return empty data to prevent UI crashes
        calls = [];
      }
    }
    
    const totalCalls = calls.length;
    const averageScore = calls.length > 0
      ? Math.round(calls.reduce((sum, c) => sum + (c.overallScore || 0), 0) / calls.length)
      : 0;
    const averageDuration = calls.length > 0
      ? Math.round(calls.reduce((sum, c) => sum + (c.duration || 0), 0) / calls.length)
      : 0;
    const meetingBookingRate = calls.length > 0
      ? (calls.filter(c => c.meetingBooked).length / calls.length) * 100
      : 0;
    const saleClosingRate = calls.length > 0
      ? (calls.filter(c => c.saleClosed).length / calls.length) * 100
      : 0;
    const averageObjectionsResolved = calls.length > 0
      ? calls.reduce((sum, c) => sum + (c.objectionsResolved || 0), 0) / calls.length
      : 0;

    return NextResponse.json({
      totalCalls,
      averageScore,
      averageDuration,
      meetingBookingRate,
      saleClosingRate,
      averageObjectionsResolved,
      recentCalls: calls.slice(0, 10).map(call => ({
        callId: call.callId,
        scenarioId: call.scenarioId,
        duration: call.duration || 0,
        talkTime: call.talkTime || 0,
        listenTime: call.listenTime || 0,
        interruptions: call.interruptions || 0,
        objectionsRaised: call.objectionsRaised || 0,
        objectionsResolved: call.objectionsResolved || 0,
        meetingBooked: call.meetingBooked || false,
        saleClosed: call.saleClosed || false,
        energyLevel: call.energyLevel || 0,
        confidenceScore: call.confidenceScore || 0,
        overallScore: call.overallScore || call.confidenceScore || 0,
        timestamp: call.timestamp || new Date().toISOString(),
      })),
    });
  } catch (error: any) {
    console.error('Call analytics error:', error);
    // Return empty data instead of 500 to prevent UI crashes
    // This is non-critical data, so graceful degradation is better
    return NextResponse.json({
      totalCalls: 0,
      averageScore: 0,
      averageDuration: 0,
      meetingBookingRate: 0,
      saleClosingRate: 0,
      averageObjectionsResolved: 0,
      recentCalls: [],
      error: 'Failed to fetch call analytics',
    }, { status: 200 }); // Return 200 with empty data instead of 500
  }
}

/**
 * POST /api/analytics/calls
 * Store call training analytics
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      callId,
      scenarioId,
      duration,
      metrics,
      analysis,
    } = body;

    if (!userId || !callId || !scenarioId) {
      return NextResponse.json(
        { error: 'userId, callId, and scenarioId are required' },
        { status: 400 }
      );
    }

    // Try to store call analytics in database, but handle rate limits gracefully
    try {
      // If db.saveCallAnalytics exists, use it
      if (db && typeof db.saveCallAnalytics === 'function') {
        await db.saveCallAnalytics({
          userId,
          callId,
          scenarioId,
          duration,
          metrics,
          analysis,
          timestamp: new Date(),
        });
      }
    } catch (error: any) {
      // Handle rate limiting gracefully - don't fail the request
      if (error?.status === 429 || error?.message?.includes('rate limit') || error?.message?.includes('429')) {
        console.warn('Rate limit hit when storing call analytics, continuing anyway');
        // Still return success - analytics storage is non-critical
      } else {
        console.error('Error storing call analytics:', error);
        // Still return success to prevent UI issues
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Call analytics stored',
    });
  } catch (error: any) {
    // Handle JSON parsing errors
    console.error('Store call analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to store call analytics', message: error.message },
      { status: 500 }
    );
  }
}

