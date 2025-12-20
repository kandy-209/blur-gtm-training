import { NextRequest, NextResponse } from 'next/server';
import { searchCompanyByTicker, getCompanyFilings } from '@/lib/company-analysis/sec-edgar';
import { fetchAlphaVantageData, fetchPolygonData, estimateEngineeringMetrics } from '@/lib/company-analysis/financial-data';
import { extractMetricsFrom10K, analyzeCompanyForCursor } from '@/lib/company-analysis/ai-extractor';
import { calculateCompanyROI, generateCompanyROIBreakdown } from '@/lib/company-analysis/roi-calculator-enhanced';
import { storeAnalysis, getLatestAnalysis, isAnalysisCached, storeFiling } from '@/lib/company-analysis/s3-storage';
import { getProviderName } from '@/lib/company-analysis/llm-provider';
import type { CompanyAnalysis, AnalysisRequest, FinancialMetrics, CompanyInfo } from '@/lib/company-analysis/types';
import { sanitizeInput } from '@/lib/security';
import { CachePresets } from '@/lib/cache-headers';
import { log, generateRequestId } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';

/**
 * Analyze a company and generate Cursor-specific ROI analysis
 * 
 * POST /api/company-analysis
 * Body: { ticker?: string, companyName?: string, industry?: string, customMetrics?: Partial<FinancialMetrics> }
 */
export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers?.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 400 }
      );
    }

    const body: AnalysisRequest = await request.json();
    const { ticker, companyName, industry, customMetrics } = body;

    if (!ticker && !companyName) {
      return NextResponse.json(
        { error: 'Either ticker or companyName is required' },
        { status: 400 }
      );
    }

    const sanitizedTicker = ticker ? sanitizeInput(ticker.toUpperCase(), 10) : null;

    const requestId = generateRequestId();
    const startTime = Date.now();

    // Check cache first (if ticker provided)
    if (sanitizedTicker && await isAnalysisCached(sanitizedTicker, 24)) {
      const cached = await getLatestAnalysis(sanitizedTicker);
      if (cached) {
        const duration = Date.now() - startTime;
        log.info('Company analysis cache hit', { ticker: sanitizedTicker, requestId, duration });
        
        return NextResponse.json({
          success: true,
          analysis: cached.analysis,
          roi: cached.roi,
          reasoning: cached.reasoning,
          cached: true,
          provider: cached.provider || 'Unknown',
        }, {
          headers: {
            'Cache-Control': CachePresets.companyAnalysis(),
            'X-Cache-Status': 'HIT',
            'X-Request-ID': requestId,
            'X-Response-Time': `${duration}ms`,
          },
        });
      }
    }

    // Step 1: Get company info from SEC
    let companyInfo: CompanyInfo | null = null;
    let cik: string | null = null;

    if (sanitizedTicker) {
      const secCompany = await searchCompanyByTicker(sanitizedTicker);
      
      if (secCompany) {
        cik = secCompany.cik;
        companyInfo = {
          ticker: sanitizedTicker,
          companyName: secCompany.name,
          industry: industry || 'Unknown',
          sector: 'Unknown',
        };
      }
    }

    if (!companyInfo && companyName) {
      // Fallback: use provided company name
      companyInfo = {
        ticker: ticker || 'N/A',
        companyName: sanitizeInput(companyName, 200),
        industry: sanitizeInput(industry || 'Unknown', 100),
        sector: 'Unknown',
      };
    }

    if (!companyInfo) {
      return NextResponse.json(
        { error: 'Could not find company information' },
        { status: 404 }
      );
    }

    // Step 2: Fetch financial data from multiple sources
    const financialMetrics: Partial<FinancialMetrics>[] = [];

    // Try Alpha Vantage first
    if (companyInfo.ticker && companyInfo.ticker !== 'N/A') {
      const alphaVantageData = await fetchAlphaVantageData(companyInfo.ticker);
      if (alphaVantageData) {
        financialMetrics.push(alphaVantageData);
      }
    }

    // Try Polygon as backup
    if (companyInfo.ticker && companyInfo.ticker !== 'N/A') {
      const polygonData = await fetchPolygonData(companyInfo.ticker);
      if (polygonData) {
        financialMetrics.push(polygonData);
      }
    }

    // Merge financial data (prioritize first source)
    let mergedMetrics: Partial<FinancialMetrics> = financialMetrics[0] || {};
    if (financialMetrics.length > 1) {
      mergedMetrics = { ...mergedMetrics, ...financialMetrics[1] };
    }

    // Add custom metrics if provided
    if (customMetrics) {
      mergedMetrics = { ...mergedMetrics, ...customMetrics };
    }

    // Step 3: Estimate engineering metrics
    const engineeringMetrics = estimateEngineeringMetrics(mergedMetrics, companyInfo);
    const completeMetrics: FinancialMetrics = {
      revenue: mergedMetrics.revenue || 0,
      revenueGrowth: mergedMetrics.revenueGrowth || 0,
      revenueGrowth3Year: mergedMetrics.revenueGrowth3Year || 0,
      rndSpending: mergedMetrics.rndSpending || 0,
      rndAsPercentOfRevenue: mergedMetrics.rndAsPercentOfRevenue || 0,
      rndGrowth: 0,
      estimatedEngineeringHeadcount: engineeringMetrics.estimatedEngineeringHeadcount || 100,
      estimatedEngineeringCost: engineeringMetrics.estimatedEngineeringCost || 0,
      engineeringCostAsPercentOfRevenue: engineeringMetrics.engineeringCostAsPercentOfRevenue || 0,
      productReleasesPerYear: engineeringMetrics.productReleasesPerYear || 6,
      featuresPerRelease: engineeringMetrics.featuresPerRelease || 5,
      timeToMarket: engineeringMetrics.timeToMarket || 6,
      operatingMargin: mergedMetrics.operatingMargin || 0,
      grossMargin: mergedMetrics.grossMargin || 0,
      operatingExpenses: mergedMetrics.operatingExpenses || 0,
      customerGrowth: 0,
      fiscalYear: mergedMetrics.fiscalYear || new Date().getFullYear() - 1,
    };

    // Step 4: Analyze with AI for Browserbase-specific insights
    const cursorAnalysis = await analyzeCompanyForCursor([completeMetrics], companyInfo);

    // Step 5: Calculate enhanced ROI
    const companyAnalysis: CompanyAnalysis = {
      company: companyInfo,
      financialMetrics: [completeMetrics],
      latestMetrics: completeMetrics,
      cursorImpact: {
        estimatedProductivityGain: cursorAnalysis.estimatedProductivityGain,
        estimatedEngineeringProductivity: cursorAnalysis.estimatedProductivityGain,
        estimatedCostSavings: cursorAnalysis.estimatedCostSavings,
        estimatedRevenueImpact: cursorAnalysis.estimatedRevenueImpact,
        estimatedRoi: 0, // Will be calculated below
        estimatedReleaseVelocityIncrease: cursorAnalysis.estimatedProductivityGain,
        estimatedTimeToMarketReduction: cursorAnalysis.estimatedProductivityGain * 0.8, // Assume 80% of productivity translates to time reduction
        estimatedFeatureDeliveryIncrease: cursorAnalysis.estimatedProductivityGain,
        riskFactors: cursorAnalysis.riskFactors,
        confidenceLevel: cursorAnalysis.confidenceLevel,
      },
      breakdown: [],
      analysisDate: new Date().toISOString(),
      dataSource: 'SEC EDGAR + Financial APIs + AI Analysis',
      methodology: 'Combined financial data extraction, AI-powered analysis, and enhanced ROI modeling',
    };

    // Calculate ROI with company-specific data
    const roiResult = calculateCompanyROI(companyAnalysis, {
      tiers: [{
        n: completeMetrics.estimatedEngineeringHeadcount,
        productivity: cursorAnalysis.estimatedProductivityGain,
      }],
      averageSalary: completeMetrics.estimatedEngineeringCost 
        ? completeMetrics.estimatedEngineeringCost / completeMetrics.estimatedEngineeringHeadcount
        : 150000,
    });

    // Update estimated ROI
    companyAnalysis.cursorImpact.estimatedRoi = roiResult.companySpecific.enhancedROI;

    // Generate detailed breakdown
    companyAnalysis.breakdown = generateCompanyROIBreakdown(companyAnalysis, roiResult);

    const providerName = getProviderName();

    // Store in S3 for caching
    if (sanitizedTicker) {
      await storeAnalysis(sanitizedTicker, {
        analysis: companyAnalysis,
        roi: roiResult,
        reasoning: cursorAnalysis.reasoning,
        provider: providerName,
      }, {
        companyName: companyInfo.companyName,
        analysisDate: companyAnalysis.analysisDate,
      });
    }

    const duration = Date.now() - startTime;
    log.info('Company analysis completed', {
      ticker: sanitizedTicker,
      companyName: companyInfo?.companyName,
      duration,
      requestId,
    });

    return NextResponse.json({
      success: true,
      analysis: companyAnalysis,
      roi: roiResult,
      reasoning: cursorAnalysis.reasoning,
      provider: providerName,
      cached: false,
    }, {
      headers: {
        'Cache-Control': CachePresets.companyAnalysis(),
        'X-Cache-Status': 'MISS',
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`,
      },
    });
  } catch (error: any) {
    const requestId = generateRequestId();
    log.error('Company analysis error', error instanceof Error ? error : new Error(String(error)), {
      requestId,
    });
    
    return handleError(error, requestId);
  }
}

