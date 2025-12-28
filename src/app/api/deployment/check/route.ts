import { NextRequest, NextResponse } from 'next/server';
import { deploymentChecker } from '@/lib/deployment-checker';

export async function GET(request: NextRequest) {
  try {
    const checks = await deploymentChecker.checkDeploymentReadiness();
    const summary = deploymentChecker.getReadinessSummary(checks);

    return NextResponse.json({
      ready: summary.ready,
      summary,
      checks,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

