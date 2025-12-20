/**
 * Test endpoint for Vapi API connectivity
 * Helps diagnose issues with the sales-call API
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const VAPI_API_KEY = process.env.VAPI_API_KEY || '';
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasApiKey: !!VAPI_API_KEY,
      apiKeyLength: VAPI_API_KEY?.length || 0,
      apiKeyPrefix: VAPI_API_KEY ? VAPI_API_KEY.substring(0, 10) + '...' : 'none',
    },
    vapiApi: {
      assistantEndpoint: 'https://api.vapi.ai/assistant',
      callEndpoint: 'https://api.vapi.ai/call',
    },
    tests: {} as Record<string, any>,
  };

  // Test 1: Check API key format
  try {
    if (!VAPI_API_KEY) {
      diagnostics.tests.apiKeyCheck = {
        status: 'FAIL',
        error: 'VAPI_API_KEY not set',
      };
    } else if (VAPI_API_KEY.length < 10) {
      diagnostics.tests.apiKeyCheck = {
        status: 'FAIL',
        error: 'VAPI_API_KEY appears to be too short',
      };
    } else {
      diagnostics.tests.apiKeyCheck = {
        status: 'PASS',
        message: 'API key format looks valid',
      };
    }
  } catch (error: any) {
    diagnostics.tests.apiKeyCheck = {
      status: 'ERROR',
      error: error.message,
    };
  }

  // Test 2: Test Vapi API connectivity
  try {
    const testResponse = await fetch('https://api.vapi.ai/assistant', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${VAPI_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });
    
    diagnostics.tests.vapiConnectivity = {
      status: testResponse.ok ? 'PASS' : 'FAIL',
      httpStatus: testResponse.status,
      statusText: testResponse.statusText,
      message: testResponse.ok 
        ? 'Successfully connected to Vapi API'
        : `Vapi API returned ${testResponse.status}`,
    };
  } catch (error: any) {
    diagnostics.tests.vapiConnectivity = {
      status: 'ERROR',
      error: error.message,
      errorType: error.name,
    };
  }

  // Test 3: Test phone number formatting
  const testPhoneNumbers = [
    '+12094702824',
    '+1 (209) 470-2824',
    '(209) 470-2824',
    '2094702824',
  ];

  diagnostics.tests.phoneNumberFormatting = testPhoneNumbers.map(phone => {
    const cleaned = phone.replace(/\D/g, '');
    let formatted = '';
    
    if (cleaned.length === 10) {
      formatted = `+1${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      formatted = `+${cleaned}`;
    } else {
      formatted = `+${cleaned}`;
    }
    
    const isValid = /^\+[1-9]\d{9,14}$/.test(formatted);
    
    return {
      original: phone,
      cleaned,
      formatted,
      isValid,
    };
  });

  return NextResponse.json(diagnostics, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
