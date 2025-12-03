import { NextResponse } from 'next/server';
import { GET as healthGET } from '../../health/route';

/**
 * Versioned Health Check Endpoint
 * /api/v1/health
 */
export const GET = healthGET;

