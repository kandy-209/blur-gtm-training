import { NextResponse } from 'next/server';
import { register } from '@/lib/metrics';

/**
 * Prometheus Metrics Endpoint
 * Exposes metrics in Prometheus format for scraping
 */
export async function GET() {
  try {
    const metrics = await register.metrics();
    
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to generate metrics', message: error.message },
      { status: 500 }
    );
  }
}





