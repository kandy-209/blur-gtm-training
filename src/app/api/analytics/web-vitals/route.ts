import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to collect Web Vitals metrics
 * This helps track Core Web Vitals (LCP, FID, CLS) in production
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate Web Vitals data
    const { name, value, rating, url, userAgent } = body;
    
    if (!name || typeof value !== 'number') {
      return NextResponse.json(
        { error: 'Invalid Web Vitals data' },
        { status: 400 }
      );
    }
    
    // Log Web Vitals (in production, you'd send to analytics service)
    if (process.env.NODE_ENV === 'production') {
      console.log('[Web Vitals]', {
        name,
        value,
        rating,
        url,
        timestamp: new Date().toISOString(),
      });
      
      // TODO: Send to analytics service (e.g., Google Analytics, Vercel Analytics)
      // Example:
      // await sendToAnalytics({ name, value, rating, url, userAgent });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging Web Vitals:', error);
    return NextResponse.json(
      { error: 'Failed to log Web Vitals' },
      { status: 500 }
    );
  }
}

