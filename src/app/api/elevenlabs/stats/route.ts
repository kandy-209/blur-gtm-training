/**
 * ElevenLabs User Statistics API
 */

import { NextRequest, NextResponse } from 'next/server';
import { conversationDB } from '@/lib/elevenlabs-db';
import { sanitizeInput } from '@/lib/security';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const sanitizedUserId = sanitizeInput(userId, 100);
    const stats = await conversationDB.getUserStats(sanitizedUserId);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}




