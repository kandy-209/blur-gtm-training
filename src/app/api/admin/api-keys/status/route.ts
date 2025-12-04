/**
 * API Keys Status Endpoint
 * Returns status of all API keys (without exposing values)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getApiKeyStatus, validateAllApiKeys } from '@/lib/api-keys';

export async function GET(request: NextRequest) {
  try {
    const status = getApiKeyStatus();
    const validation = validateAllApiKeys();

    return NextResponse.json({
      success: true,
      status,
      summary: validation.summary,
      allValid: validation.valid,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('API keys status error:', error);
    return NextResponse.json(
      { error: 'Failed to get API keys status', message: error.message },
      { status: 500 }
    );
  }
}

