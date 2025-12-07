/**
 * Export User Data API
 * Export ALL user data points in various formats
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComprehensiveDataCollector } from '@/lib/voice-coaching/data-collector';

/**
 * GET /api/voice-coaching/export-data
 * Export all user data
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const format = searchParams.get('format') || 'json'; // json, csv

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const collector = new ComprehensiveDataCollector(userId);
    const allData = await collector.collectAllData();

    if (format === 'csv') {
      return exportAsCSV(allData);
    }

    // Default: JSON
    return NextResponse.json({
      success: true,
      data: allData,
      exportedAt: new Date().toISOString(),
      format: 'json',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="voice-coaching-data-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export user data', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/voice-coaching/export-data
 * Export with custom options
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, format = 'json', includeRawData = true } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const collector = new ComprehensiveDataCollector(userId);
    let allData = await collector.collectAllData();

    // Optionally exclude raw data for smaller exports
    if (!includeRawData) {
      allData.rawMetrics = [];
      allData.rawFeedback = [];
      allData.rawSuggestions = [];
    }

    if (format === 'csv') {
      return exportAsCSV(allData);
    }

    return NextResponse.json({
      success: true,
      data: allData,
      exportedAt: new Date().toISOString(),
      format: 'json',
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="voice-coaching-data-${userId}-${Date.now()}.json"`,
      },
    });
  } catch (error: any) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export user data', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Export data as CSV
 */
function exportAsCSV(data: any): NextResponse {
  // Convert to CSV format
  const csvLines: string[] = [];

  // Header
  csvLines.push('Voice Coaching Data Export');
  csvLines.push(`User ID: ${data.userId}`);
  csvLines.push(`Export Date: ${data.exportDate}`);
  csvLines.push('');

  // Summary
  csvLines.push('SUMMARY');
  csvLines.push(`Total Sessions,${data.totalSessions}`);
  csvLines.push(`Total Practice Time (ms),${data.totalPracticeTime}`);
  csvLines.push(`First Session,${data.firstSessionDate || 'N/A'}`);
  csvLines.push(`Last Session,${data.lastSessionDate || 'N/A'}`);
  csvLines.push('');

  // Sessions
  csvLines.push('SESSIONS');
  csvLines.push('Session ID,Date,Duration (ms),Pace,Pitch,Volume,Pauses,Clarity,Confidence,Session Score');
  data.sessions.forEach((session: any) => {
    csvLines.push([
      session.sessionId,
      session.date,
      session.duration,
      session.metrics.pace,
      session.metrics.pitch,
      session.metrics.volume,
      session.metrics.pauses,
      session.metrics.clarity,
      session.metrics.confidence,
      session.sessionScore,
    ].join(','));
  });
  csvLines.push('');

  // Metrics Statistics
  csvLines.push('METRICS STATISTICS');
  csvLines.push('Metric,Min,Max,Mean,Median,Std Dev,Optimal Range %');
  Object.entries(data.allTimeMetrics).forEach(([metric, stats]: [string, any]) => {
    csvLines.push([
      metric,
      stats.min,
      stats.max,
      stats.mean,
      stats.median,
      stats.standardDeviation,
      stats.optimalRangeFrequency,
    ].join(','));
  });
  csvLines.push('');

  // Raw Metrics
  if (data.rawMetrics.length > 0) {
    csvLines.push('RAW METRICS');
    csvLines.push('Timestamp,Session ID,Pace,Pitch,Volume,Pauses,Clarity,Confidence');
    data.rawMetrics.forEach((point: any) => {
      csvLines.push([
        point.timestamp,
        point.sessionId,
        point.pace,
        point.pitch,
        point.volume,
        point.pauses,
        point.clarity,
        point.confidence,
      ].join(','));
    });
    csvLines.push('');
  }

  const csvContent = csvLines.join('\n');

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="voice-coaching-data-${data.userId}-${Date.now()}.csv"`,
    },
  });
}

