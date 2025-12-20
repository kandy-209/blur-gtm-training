/**
 * AI-powered extraction and analysis of company financial data
 * Uses Claude (Anthropic) or OpenAI to extract structured metrics from unstructured financial documents
 */

import { getLLMProvider, parseLLMJSON } from './llm-provider';
import type { FinancialMetrics, CompanyInfo } from './types';

/**
 * Extract financial metrics from 10-K filing text using AI
 */
export async function extractMetricsFrom10K(
  filingText: string,
  companyInfo: CompanyInfo
): Promise<Partial<FinancialMetrics> | null> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured');
    return null;
  }

  try {
    const prompt = `You are a financial analyst extracting key metrics from a 10-K filing.

Company: ${companyInfo.companyName} (${companyInfo.ticker})
Industry: ${companyInfo.industry}

Extract the following metrics from the 10-K filing text. Return ONLY a valid JSON object with these exact fields:
{
  "revenue": number,
  "revenueGrowth": number (YoY %),
  "revenueGrowth3Year": number (3-year CAGR %),
  "rndSpending": number,
  "rndAsPercentOfRevenue": number,
  "operatingMargin": number,
  "grossMargin": number,
  "operatingExpenses": number,
  "fiscalYear": number,
  "employeeCount": number (if mentioned),
  "productReleasesPerYear": number (if mentioned, otherwise null),
  "timeToMarket": number (months, if mentioned, otherwise null)
}

If a metric is not found, use null. Be precise with numbers.

10-K Text (first 10000 characters):
${filingText.substring(0, 10000)}`;

    const llm = getLLMProvider();
    if (!llm) {
      console.warn('No LLM provider available');
      return null;
    }

    const response = await llm.extractMetrics(
      prompt,
      'You are a financial analyst expert at extracting structured data from SEC filings. Always return valid JSON.'
    );

    if (!response) {
      return null;
    }

    const content = response.content;
    if (!content) {
      return null;
    }

    // Parse JSON from content
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return null;
    }

    const metrics = JSON.parse(jsonMatch[0]);
    return metrics as Partial<FinancialMetrics>;
  } catch (error) {
    console.error('Error extracting metrics with AI:', error);
    return null;
  }
}

/**
 * Analyze company and provide Browserbase-specific insights
 */
export async function analyzeCompanyForCursor(
  financialMetrics: FinancialMetrics[],
  companyInfo: CompanyInfo
): Promise<{
  estimatedProductivityGain: number;
  estimatedCostSavings: number;
  estimatedRevenueImpact: number;
  riskFactors: string[];
  confidenceLevel: number;
  reasoning: string;
}> {
  const llm = getLLMProvider();
  if (!llm) {
    // Fallback to rule-based analysis
    return analyzeCompanyRuleBased(financialMetrics, companyInfo);
  }

  try {
    const latestMetrics = financialMetrics[0];
    const metricsSummary = financialMetrics.map(m => ({
      year: m.fiscalYear,
      revenue: m.revenue,
      rndPercent: m.rndAsPercentOfRevenue,
      engineeringCost: m.estimatedEngineeringCost,
      headcount: m.estimatedEngineeringHeadcount,
    }));

    const systemPrompt = 'You are a business analyst expert at evaluating software tool ROI. Use data-driven analysis and industry benchmarks. Always return valid JSON.';
    
    const prompt = `You are a business analyst evaluating how Browserbase browser automation platform can impact a company.

Company: ${companyInfo.companyName} (${companyInfo.ticker})
Industry: ${companyInfo.industry}
Sector: ${companyInfo.sector}

Financial Profile:
${JSON.stringify(metricsSummary, null, 2)}

Latest Metrics:
- Revenue: $${latestMetrics.revenue.toLocaleString()}
- R&D as % of Revenue: ${latestMetrics.rndAsPercentOfRevenue.toFixed(2)}%
- Estimated Engineering Cost: $${latestMetrics.estimatedEngineeringCost?.toLocaleString() || 'N/A'}
- Estimated Engineering Headcount: ${latestMetrics.estimatedEngineeringHeadcount || 'N/A'}
- Revenue Growth: ${latestMetrics.revenueGrowth.toFixed(2)}%

Based on Browserbase's typical productivity gains (reduced infrastructure management, improved reliability, faster scaling), analyze:

1. Estimated productivity gain percentage (consider company size, industry, R&D intensity)
2. Estimated annual cost savings from productivity gains
3. Estimated revenue impact from faster time-to-market (consider growth rate, competitive position)
4. Key risk factors that might affect ROI
5. Confidence level (0-100) in these estimates
6. Brief reasoning for each estimate

Return ONLY a valid JSON object:
{
  "estimatedProductivityGain": number (20-40%),
  "estimatedCostSavings": number (annual $),
  "estimatedRevenueImpact": number (annual $ from faster releases),
  "riskFactors": string[],
  "confidenceLevel": number (0-100),
  "reasoning": string
}`;

    const response = await llm.analyzeCompany(prompt, systemPrompt);
    if (!response) {
      return analyzeCompanyRuleBased(financialMetrics, companyInfo);
    }

    const analysis = parseLLMJSON(response.content);
    return analysis;
  } catch (error) {
    console.error('Error analyzing company with AI:', error);
    return analyzeCompanyRuleBased(financialMetrics, companyInfo);
  }
}

/**
 * Rule-based fallback analysis when AI is unavailable
 */
function analyzeCompanyRuleBased(
  financialMetrics: FinancialMetrics[],
  companyInfo: CompanyInfo
): {
  estimatedProductivityGain: number;
  estimatedCostSavings: number;
  estimatedRevenueImpact: number;
  riskFactors: string[];
  confidenceLevel: number;
  reasoning: string;
} {
  const latest = financialMetrics[0];
  
  // Base productivity gain: 30% average
  // Adjust based on R&D intensity (higher R&D = more code = more benefit)
  const rndIntensity = latest.rndAsPercentOfRevenue;
  let productivityGain = 30;
  
  if (rndIntensity > 15) {
    productivityGain = 35; // High R&D companies benefit more
  } else if (rndIntensity > 10) {
    productivityGain = 32;
  } else if (rndIntensity < 5) {
    productivityGain = 25; // Lower R&D = less code-focused
  }

  // Cost savings = engineering cost * productivity gain
  const engineeringCost = latest.estimatedEngineeringCost || latest.rndSpending * 0.6;
  const costSavings = engineeringCost * (productivityGain / 100);

  // Revenue impact: faster releases = more revenue in growth companies
  // Conservative estimate: 2-5% revenue increase from faster time-to-market
  const revenueImpact = latest.revenueGrowth > 20 
    ? latest.revenue * 0.03 // High growth: 3% impact
    : latest.revenue * 0.01; // Low growth: 1% impact

  const riskFactors: string[] = [];
  if (latest.revenueGrowth < 0) riskFactors.push('Declining revenue may limit ROI');
  if (rndIntensity < 3) riskFactors.push('Low R&D intensity suggests limited engineering focus');
  if (!latest.estimatedEngineeringHeadcount || latest.estimatedEngineeringHeadcount < 10) {
    riskFactors.push('Small engineering team may limit impact');
  }

  const confidenceLevel = latest.estimatedEngineeringHeadcount 
    ? 75 
    : 60; // Lower confidence without headcount data

  return {
    estimatedProductivityGain: productivityGain,
    estimatedCostSavings: costSavings,
    estimatedRevenueImpact: revenueImpact,
    riskFactors,
    confidenceLevel,
    reasoning: `Based on R&D intensity of ${rndIntensity.toFixed(2)}% and revenue growth of ${latest.revenueGrowth.toFixed(2)}%, estimated ${productivityGain}% productivity gain.`,
  };
}

