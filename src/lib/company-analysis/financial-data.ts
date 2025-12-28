/**
 * Financial data APIs integration
 * Supports multiple providers: Alpha Vantage, Yahoo Finance, Polygon.io
 */

import type { FinancialMetrics, CompanyInfo } from './types';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

/**
 * Fetch company financial data from Alpha Vantage
 */
export async function fetchAlphaVantageData(ticker: string): Promise<Partial<FinancialMetrics> | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('Alpha Vantage API key not configured');
    return null;
  }

  try {
    // Fetch income statement
    const incomeResponse = await fetch(
      `https://www.alphavantage.co/query?function=INCOME_STATEMENT&symbol=${ticker}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );
    
    if (!incomeResponse.ok) {
      throw new Error(`Alpha Vantage API error: ${incomeResponse.status}`);
    }

    const incomeData = await incomeResponse.json();
    
    if (incomeData.Note || incomeData['Error Message']) {
      console.error('Alpha Vantage API error:', incomeData.Note || incomeData['Error Message']);
      return null;
    }

    const annualReports = incomeData.annualReports || [];
    if (annualReports.length === 0) {
      return null;
    }

    const latest = annualReports[0];
    const previous = annualReports[1] || latest;

    // Calculate growth rates
    const revenue = parseFloat(latest.totalRevenue || latest.revenue || '0');
    const previousRevenue = parseFloat(previous.totalRevenue || previous.revenue || '0');
    const revenueGrowth = previousRevenue > 0 
      ? ((revenue - previousRevenue) / previousRevenue) * 100 
      : 0;

    // Calculate 3-year CAGR if we have 3+ years
    let revenueGrowth3Year = 0;
    if (annualReports.length >= 3) {
      const oldestRevenue = parseFloat(annualReports[annualReports.length - 1].totalRevenue || annualReports[annualReports.length - 1].revenue || '0');
      if (oldestRevenue > 0) {
        const years = annualReports.length - 1;
        revenueGrowth3Year = (Math.pow(revenue / oldestRevenue, 1 / years) - 1) * 100;
      }
    }

    // R&D from income statement
    const rndValue = parseFloat(latest.researchAndDevelopment || '0');
    const rndSpending = rndValue;
    const rndAsPercentOfRevenue = revenue > 0 ? (rndValue / revenue) * 100 : 0;

    // Operating metrics
    const operatingIncome = parseFloat(latest.operatingIncome || '0');
    const grossProfit = parseFloat(latest.grossProfit || '0');
    const operatingExpenses = parseFloat(latest.operatingExpenses || '0');
    
    const operatingMargin = revenue > 0 ? (operatingIncome / revenue) * 100 : 0;
    const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;

    return {
      revenue,
      revenueGrowth,
      revenueGrowth3Year,
      rndSpending,
      rndAsPercentOfRevenue,
      operatingMargin,
      grossMargin,
      operatingExpenses,
      fiscalYear: parseInt(latest.fiscalDateEnding.split('-')[0]),
    };
  } catch (error) {
    console.error('Error fetching Alpha Vantage data:', error);
    return null;
  }
}

/**
 * Fetch company data from Polygon.io
 */
export async function fetchPolygonData(ticker: string): Promise<Partial<FinancialMetrics> | null> {
  if (!POLYGON_API_KEY) {
    console.warn('Polygon API key not configured');
    return null;
  }

  try {
    // Fetch company financials
    const response = await fetch(
      `https://api.polygon.io/v2/reference/financials?ticker=${ticker}&timeframe=annual&limit=5&apiKey=${POLYGON_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      return null;
    }

    const latest = data.results[0];
    const financials = latest.financials || {};
    
    // Extract metrics (structure varies by provider)
    const revenue = financials.revenue || financials.total_revenue || 0;
    const rnd = financials.research_and_development || financials.rnd || 0;
    
    return {
      revenue: parseFloat(revenue) || 0,
      rndSpending: parseFloat(rnd) || 0,
      rndAsPercentOfRevenue: revenue > 0 ? (rnd / revenue) * 100 : 0,
    };
  } catch (error) {
    console.error('Error fetching Polygon data:', error);
    return null;
  }
}

/**
 * Estimate engineering metrics from financial data
 * Uses industry benchmarks and R&D spending patterns
 */
export function estimateEngineeringMetrics(
  financialMetrics: Partial<FinancialMetrics>,
  companyInfo?: CompanyInfo
): Partial<FinancialMetrics> {
  const { revenue, rndSpending, rndAsPercentOfRevenue } = financialMetrics;
  
  if (!revenue || !rndSpending) {
    return {};
  }

  // Industry benchmarks for engineering as % of R&D
  // Tech companies: 60-80% of R&D is engineering
  // Other industries: 40-60%
  const isTechIndustry = companyInfo?.industry?.toLowerCase().includes('tech') ||
                        companyInfo?.sector?.toLowerCase().includes('technology') ||
                        companyInfo?.sector?.toLowerCase().includes('software');
  
  const engineeringPercentOfRnd = isTechIndustry ? 0.7 : 0.5;
  const estimatedEngineeringCost = rndSpending * engineeringPercentOfRnd;
  
  // Estimate headcount: Average engineer cost $150k-200k/year
  const avgEngineerCost = 175000;
  const estimatedEngineeringHeadcount = Math.round(estimatedEngineeringCost / avgEngineerCost);
  
  // Estimate releases per year based on company size
  // Small (<100 engineers): 4-6 releases/year
  // Medium (100-500): 6-12 releases/year
  // Large (500+): 12-24 releases/year
  let productReleasesPerYear = 6;
  if (estimatedEngineeringHeadcount < 100) {
    productReleasesPerYear = 5;
  } else if (estimatedEngineeringHeadcount < 500) {
    productReleasesPerYear = 9;
  } else {
    productReleasesPerYear = 18;
  }

  return {
    estimatedEngineeringHeadcount,
    estimatedEngineeringCost,
    engineeringCostAsPercentOfRevenue: revenue > 0 ? (estimatedEngineeringCost / revenue) * 100 : 0,
    productReleasesPerYear,
    featuresPerRelease: 5, // Industry average
    timeToMarket: 6, // months average
  };
}

















