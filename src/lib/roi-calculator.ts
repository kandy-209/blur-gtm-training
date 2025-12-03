/**
 * ROI Calculator for Cursor Enterprise
 * 
 * Calculates Total Economic Impact (TEI) and Net Present Value (NPV)
 * Based on productivity improvements and cost savings
 */

export interface ROICalculatorInput {
  // User tiers with productivity improvements
  tiers: Array<{
    n: number; // Number of users in tier
    productivity: number; // Productivity improvement percentage (0-100)
  }>;
  
  // Financial parameters
  averageSalary: number; // Average developer salary per year
  discountFactor: number; // Discount rate percentage (0-100)
  setupCost: number; // One-time setup cost
  costPerSeatMonthly: number; // Monthly cost per seat (capped at $60)
}

export interface ROICalculatorOutput {
  // Year 1 metrics
  year1ProductivityGain: number;
  year1CostSavings: number;
  year1NetBenefit: number;
  
  // 3-year metrics
  year3ProductivityGain: number;
  year3CostSavings: number;
  year3NetBenefit: number;
  year3NPV: number;
  year3ROI: number;
  
  // Total metrics
  totalProductivityGain: number;
  totalCostSavings: number;
  totalNetBenefit: number;
  totalNPV: number;
  totalROI: number;
  
  // Breakdown
  breakdown: {
    year: number;
    productivityGain: number;
    costSavings: number;
    totalCost: number;
    netBenefit: number;
    npv: number;
  }[];
}

/**
 * Calculate ROI for Cursor Enterprise
 */
export function calculateROI(input: ROICalculatorInput): ROICalculatorOutput {
  // Cap cost per seat at $60/month
  const costPerSeatMonthly = Math.min(input.costPerSeatMonthly, 60);
  const costPerSeatYearly = costPerSeatMonthly * 12;
  
  // Calculate total users
  const totalUsers = input.tiers.reduce((sum, tier) => sum + tier.n, 0);
  
  // Handle zero users case
  if (totalUsers === 0) {
    return {
      year1ProductivityGain: 0,
      year1CostSavings: 0,
      year1NetBenefit: 0,
      year3ProductivityGain: 0,
      year3CostSavings: 0,
      year3NetBenefit: 0,
      year3NPV: 0,
      year3ROI: 0,
      totalProductivityGain: 0,
      totalCostSavings: 0,
      totalNetBenefit: 0,
      totalNPV: 0,
      totalROI: 0,
      breakdown: [
        { year: 1, productivityGain: 0, costSavings: 0, totalCost: input.setupCost, netBenefit: -input.setupCost, npv: -input.setupCost },
        { year: 2, productivityGain: 0, costSavings: 0, totalCost: 0, netBenefit: 0, npv: 0 },
        { year: 3, productivityGain: 0, costSavings: 0, totalCost: 0, netBenefit: 0, npv: 0 },
      ],
    };
  }
  
  // Calculate weighted average productivity improvement
  const weightedProductivity = input.tiers.reduce((sum, tier) => {
    return sum + (tier.n * tier.productivity);
  }, 0) / totalUsers;
  
  // Calculate annual productivity gain per user
  const annualProductivityGainPerUser = (input.averageSalary * weightedProductivity) / 100;
  
  // Calculate for 3 years
  const years = 3;
  const discountRate = input.discountFactor / 100;
  
  const breakdown: ROICalculatorOutput['breakdown'] = [];
  let totalProductivityGain = 0;
  let totalCostSavings = 0;
  let totalCost = input.setupCost;
  let totalNetBenefit = 0;
  let totalNPV = 0;
  
  for (let year = 1; year <= years; year++) {
    // Productivity gain (increases each year as users get more proficient)
    const proficiencyMultiplier = 1 + (year - 1) * 0.1; // 10% improvement each year
    const yearProductivityGain = annualProductivityGainPerUser * totalUsers * proficiencyMultiplier;
    
    // Cost savings (productivity gain is a cost saving)
    const yearCostSavings = yearProductivityGain;
    
    // Total cost (setup cost only in year 1, then monthly costs)
    const yearCost = year === 1 
      ? input.setupCost + (costPerSeatYearly * totalUsers)
      : costPerSeatYearly * totalUsers;
    
    // Net benefit
    const yearNetBenefit = yearCostSavings - yearCost;
    
    // NPV (discounted)
    const yearNPV = yearNetBenefit / Math.pow(1 + discountRate, year - 1);
    
    breakdown.push({
      year,
      productivityGain: yearProductivityGain,
      costSavings: yearCostSavings,
      totalCost: yearCost,
      netBenefit: yearNetBenefit,
      npv: yearNPV,
    });
    
    totalProductivityGain += yearProductivityGain;
    totalCostSavings += yearCostSavings;
    totalCost += year === 1 ? 0 : costPerSeatYearly * totalUsers;
    totalNetBenefit += yearNetBenefit;
    totalNPV += yearNPV;
  }
  
  // Calculate ROI
  const totalROI = ((totalNetBenefit - input.setupCost) / (input.setupCost + (costPerSeatYearly * totalUsers * years))) * 100;
  const year3ROI = ((breakdown[2].netBenefit - input.setupCost) / (input.setupCost + (costPerSeatYearly * totalUsers * 3))) * 100;
  
  return {
    year1ProductivityGain: breakdown[0].productivityGain,
    year1CostSavings: breakdown[0].costSavings,
    year1NetBenefit: breakdown[0].netBenefit,
    
    year3ProductivityGain: breakdown[2].productivityGain,
    year3CostSavings: breakdown[2].costSavings,
    year3NetBenefit: breakdown[2].netBenefit,
    year3NPV: breakdown[2].npv,
    year3ROI,
    
    totalProductivityGain,
    totalCostSavings,
    totalNetBenefit,
    totalNPV,
    totalROI,
    breakdown,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

