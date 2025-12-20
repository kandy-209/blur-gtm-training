/**
 * Enhanced ROI calculator that incorporates company financial analysis
 * Combines standard ROI model with company-specific financial data
 */

import { calculateROI, type ROICalculatorInput, type ROICalculatorOutput } from '@/lib/roi-calculator';
import type { CompanyAnalysis, FinancialMetrics } from './types';

/**
 * Calculate ROI with company-specific financial data
 */
export function calculateCompanyROI(
  companyAnalysis: CompanyAnalysis,
  customInput?: Partial<ROICalculatorInput>
): ROICalculatorOutput & {
  companySpecific: {
    revenueImpact: number;
    totalBenefit: number; // Cost savings + revenue impact
    enhancedROI: number;
    paybackPeriod: number; // months
  };
} {
  const latestMetrics = companyAnalysis.latestMetrics;
  const cursorImpact = companyAnalysis.cursorImpact;

  // Use company data to enhance ROI calculation
  const input: ROICalculatorInput = {
    tiers: [
      {
        n: latestMetrics.estimatedEngineeringHeadcount || 100,
        productivity: cursorImpact.estimatedProductivityGain,
      },
    ],
    averageSalary: latestMetrics.estimatedEngineeringCost 
      ? latestMetrics.estimatedEngineeringCost / (latestMetrics.estimatedEngineeringHeadcount || 1)
      : 150000,
    discountFactor: 10,
    setupCost: 50000,
    costPerSeatMonthly: 40,
    ...customInput,
  };

  const baseROI = calculateROI(input);

  // Add revenue impact from faster time-to-market
  const revenueImpact = cursorImpact.estimatedRevenueImpact;
  
  // Calculate enhanced total benefit (cost savings + revenue impact)
  const totalBenefit = baseROI.totalNetBenefit + revenueImpact;

  // Enhanced ROI calculation
  const totalInvestment = input.setupCost + (input.costPerSeatMonthly * 12 * input.tiers.reduce((sum, t) => sum + t.n, 0) * 3);
  const enhancedROI = totalInvestment > 0 
    ? ((totalBenefit / totalInvestment) * 100)
    : 0;

  // Calculate payback period (when cumulative benefit exceeds investment)
  let cumulativeBenefit = 0;
  let paybackPeriod = 36; // Default to 3 years if not reached
  
  for (let i = 0; i < baseROI.breakdown.length; i++) {
    const year = baseROI.breakdown[i];
    cumulativeBenefit += year.netBenefit + (revenueImpact / 3); // Distribute revenue impact over 3 years
    
    if (cumulativeBenefit >= totalInvestment && paybackPeriod === 36) {
      paybackPeriod = (i + 1) * 12; // Convert to months
      break;
    }
  }

  return {
    ...baseROI,
    companySpecific: {
      revenueImpact,
      totalBenefit,
      enhancedROI,
      paybackPeriod,
    },
  };
}

/**
 * Generate detailed breakdown with company-specific insights
 */
export function generateCompanyROIBreakdown(
  companyAnalysis: CompanyAnalysis,
  roiResult: ReturnType<typeof calculateCompanyROI>
): CompanyAnalysis['breakdown'] {
  const revenueImpactPerYear = roiResult.companySpecific.revenueImpact / 3;
  
  return roiResult.breakdown.map((year, index) => {
    const yearRevenueImpact = revenueImpactPerYear;
    const totalBenefit = year.netBenefit + yearRevenueImpact;
    const totalInvestment = index === 0 
      ? roiResult.breakdown[0].totalCost 
      : roiResult.breakdown[index].totalCost;
    
    const cumulativeInvestment = roiResult.breakdown
      .slice(0, index + 1)
      .reduce((sum, y) => sum + y.totalCost, 0);
    
    const cumulativeBenefit = roiResult.breakdown
      .slice(0, index + 1)
      .reduce((sum, y) => sum + y.netBenefit + yearRevenueImpact, 0);
    
    const roi = cumulativeInvestment > 0 
      ? ((cumulativeBenefit / cumulativeInvestment) * 100)
      : 0;

    return {
      year: year.year,
      productivityGain: year.productivityGain,
      costSavings: year.costSavings,
      revenueImpact: yearRevenueImpact,
      totalBenefit,
      investment: totalInvestment,
      netBenefit: totalBenefit - totalInvestment,
      roi,
    };
  });
}
















