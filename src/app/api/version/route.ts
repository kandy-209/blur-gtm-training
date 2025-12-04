import { NextResponse } from 'next/server';

/**
 * Version API endpoint
 * Returns the current app version and update information
 */
export async function GET() {
  try {
    const version = process.env.NEXT_PUBLIC_APP_VERSION || '0.1.0';
    const releaseDate = process.env.NEXT_PUBLIC_RELEASE_DATE || new Date().toISOString();

    return NextResponse.json({
      version,
      releaseDate,
      updateInfo: {
        version,
        releaseDate,
        changelog: [
          'Improved responsive design',
          'Enhanced UI components',
          'Better mobile experience',
          'Performance optimizations',
        ],
        critical: false,
      },
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error getting version:', error);
    return NextResponse.json(
      { error: 'Failed to get version' },
      { status: 500 }
    );
  }
}


