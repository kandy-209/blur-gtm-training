/**
 * Types for company financial analysis system
 */

export interface CompanyInfo {
  ticker: string;
  companyName: string;
  industry: string;
  sector: string;
  marketCap?: number;
  employeeCount?: number;
}

export interface FinancialMetrics {
  // Revenue metrics
  revenue: number;
  revenueGrowth: number; // YoY growth %
  revenueGrowth3Year: number; // 3-year CAGR
  
  // R&D metrics
  rndSpending: number;
  rndAsPercentOfRevenue: number;
  rndGrowth: number;
  
  // Engineering metrics (estimated from R&D)
  estimatedEngineeringHeadcount: number;
  estimatedEngineeringCost: number;
  engineeringCostAsPercentOfRevenue: number;
  
  // Development velocity indicators
  productReleasesPerYear?: number;
  featuresPerRelease?: number;
  timeToMarket?: number; // months
  
  // Cost structure
  operatingMargin: number;
  grossMargin: number;
  operatingExpenses: number;
  
  // Growth indicators
  customerGrowth: number;
  marketShareGrowth?: number;
  
  // Year
  fiscalYear: number;
  quarter?: string;
}

export interface CompanyAnalysis {
  company: CompanyInfo;
  financialMetrics: FinancialMetrics[];
  latestMetrics: FinancialMetrics;
  
  // Cursor-specific analysis
  cursorImpact: {
    // Productivity projections
    estimatedProductivityGain: number; // Based on company profile
    estimatedEngineeringProductivity: number; // % improvement
    
    // Financial impact
    estimatedCostSavings: number; // Annual
    estimatedRevenueImpact: number; // From faster time-to-market
    estimatedRoi: number; // 3-year ROI
    
    // Business outcomes
    estimatedReleaseVelocityIncrease: number; // % more releases
    estimatedTimeToMarketReduction: number; // % reduction
    estimatedFeatureDeliveryIncrease: number; // % more features
    
    // Risk factors
    riskFactors: string[];
    confidenceLevel: number; // 0-100
  };
  
  // Detailed breakdown
  breakdown: {
    year: number;
    productivityGain: number;
    costSavings: number;
    revenueImpact: number;
    totalBenefit: number;
    investment: number;
    netBenefit: number;
    roi: number;
  }[];
  
  // Analysis metadata
  analysisDate: string;
  dataSource: string;
  methodology: string;
}

export interface AnalysisRequest {
  ticker?: string;
  companyName?: string;
  industry?: string;
  customMetrics?: Partial<FinancialMetrics>;
}







