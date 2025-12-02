/**
 * ROI Calculator - Total Economic Impact (TEI) v7.0
 * Converted from Python to TypeScript
 */

export interface TierData {
  name: string;
  N: number; // Number of engineers in this tier
  C_hourly: number; // Hourly cost per engineer
  P_weighted: number; // Productivity gain as decimal (e.g., 0.30 for 30%)
}

export interface ROICalculatorParams {
  tier_data: TierData[];
  cost_per_seat_monthly?: number;
  discount_factor?: number;
  discount_rate?: number;
  annual_productive_hours?: number;
  cost_replace_engineer?: number;
  p_churn_reduction?: number;
  p_debt_reduction?: number;
  cost_setup_one_time?: number;
  training_hours_per_dev?: number;
  s_outage_cost?: number;
  p_outage_reduction?: number;
  p_cross_functional_gain?: number;
}

export interface ROICalculatorResult {
  Total_Engineers: number;
  Annual_Subscription_Cost: number;
  Total_Initial_Investment: number;
  Total_Gross_Annual_Benefit: number;
  Final_3Y_NPV: number;
  Adjusted_ROI_Percentage: number;
  NCF_Breakdown: {
    Year_1_NCF: number;
    Year_1_PV: number;
    Year_2_NCF: number;
    Year_2_PV: number;
    Year_3_NCF: number;
    Year_3_PV: number;
  };
  Granular_Savings: {
    Annual_Net_Savings: number;
    Monthly_Net_Savings: number;
    Weekly_Net_Savings: number;
    Daily_Net_Savings: number;
  };
}

export function calculateAdvancedTEImpact(params: ROICalculatorParams): ROICalculatorResult | { error: string } {
  const {
    tier_data,
    cost_per_seat_monthly = 40,
    discount_factor = 0.15,
    discount_rate = 0.10,
    annual_productive_hours = 1800,
    cost_replace_engineer = 180000,
    p_churn_reduction = 0.005,
    p_debt_reduction = 0.05,
    cost_setup_one_time = 50000,
    training_hours_per_dev = 4,
    s_outage_cost = 5000000,
    p_outage_reduction = 0.03,
    p_cross_functional_gain = 0.05,
  } = params;

  // Enforce maximum cost per seat of $40/month per user
  const MAX_COST_PER_SEAT_MONTHLY = 40;
  const cost_per_seat_capped = Math.min(cost_per_seat_monthly, MAX_COST_PER_SEAT_MONTHLY);

  // --- 1. Aggregate Inputs and Calculate Investment ---
  const N_Users = tier_data.reduce((sum, tier) => sum + tier.N, 0);
  
  if (N_Users === 0) {
    return { error: "Number of engineers cannot be zero." };
  }

  // Calculate weighted average hourly cost for the Total Training Cost component
  const avg_hourly_cost = tier_data.reduce((sum, tier) => sum + tier.N * tier.C_hourly, 0) / N_Users;

  // 1a. Annual Subscription Cost (C_Annual)
  // Use capped cost per seat (max $40/month per user)
  const C_Cursor_Annual_Unadj = N_Users * cost_per_seat_capped * 12;
  const C_Cursor_Annual_Adj = C_Cursor_Annual_Unadj * (1 - discount_factor);

  // 1b. Total Initial Investment (I_Y0 = Recurring Cost + One-Time Costs)
  const C_Training_Total = N_Users * training_hours_per_dev * avg_hourly_cost;
  const I_Y0 = C_Cursor_Annual_Adj + cost_setup_one_time + C_Training_Total;

  // --- 2. Calculate BASE Tiered Productivity Savings (V_Tiered) ---
  let V_Tiered = 0;
  for (const tier of tier_data) {
    // V_Tiered = N * H_Annual * P_weighted * C_hourly
    V_Tiered += tier.N * annual_productive_hours * tier.P_weighted * tier.C_hourly;
  }

  // --- 3. Calculate Strategic Value Components ---
  // S_Debt: Technical Debt Reduction Value (Based on 25% rework time)
  const S_Debt = N_Users * avg_hourly_cost * annual_productive_hours * 0.25 * p_debt_reduction;
  
  // S_Churn: Engineer Retention Value
  const S_Churn = N_Users * cost_replace_engineer * p_churn_reduction;
  
  // S_Risk: High-Severity Incident Mitigation Value
  const S_Risk = s_outage_cost * p_outage_reduction;
  
  // S_Cross: Cross-Functional Value
  const S_Cross = C_Cursor_Annual_Adj * p_cross_functional_gain;

  const Total_Gross_Benefit_Annual = V_Tiered + S_Debt + S_Churn + S_Risk + S_Cross;

  // --- 4. Calculate Year-by-Year NPV ---
  let npv = -I_Y0;
  const Alpha: Record<number, number> = { 1: 0.80, 2: 0.95, 3: 1.00 }; // Adoption S-Curve

  const NCF_Yearly_Data: Record<string, number> = {};

  for (let t = 1; t <= 3; t++) {
    const Adoption_Factor = Alpha[t];
    const NCF_t = Total_Gross_Benefit_Annual * Adoption_Factor - C_Cursor_Annual_Adj;
    const PV_t = NCF_t / Math.pow(1 + discount_rate, t);
    npv += PV_t;

    // Store data for granular reporting
    NCF_Yearly_Data[`Year_${t}_NCF`] = Math.round(NCF_t * 100) / 100;
    NCF_Yearly_Data[`Year_${t}_PV`] = Math.round(PV_t * 100) / 100;
  }

  // --- 5. Final Metrics and Granular Breakdowns ---
  const Adjusted_ROI = (npv / I_Y0) * 100;

  // 5a. Granular Savings Breakdown (using 100% adoption NCF as steady-state)
  const NCF_Steady_State = Total_Gross_Benefit_Annual * Alpha[3] - C_Cursor_Annual_Adj;

  const DAYS_PER_YEAR = 250;
  const WEEKS_PER_YEAR = 52;
  const MONTHS_PER_YEAR = 12;

  const Granular_Savings = {
    Annual_Net_Savings: Math.round(NCF_Steady_State * 100) / 100,
    Monthly_Net_Savings: Math.round((NCF_Steady_State / MONTHS_PER_YEAR) * 100) / 100,
    Weekly_Net_Savings: Math.round((NCF_Steady_State / WEEKS_PER_YEAR) * 100) / 100,
    Daily_Net_Savings: Math.round((NCF_Steady_State / DAYS_PER_YEAR) * 100) / 100,
  };

  return {
    Total_Engineers: N_Users,
    Annual_Subscription_Cost: Math.round(C_Cursor_Annual_Adj * 100) / 100,
    Total_Initial_Investment: Math.round(I_Y0 * 100) / 100,
    Total_Gross_Annual_Benefit: Math.round(Total_Gross_Benefit_Annual * 100) / 100,
    Final_3Y_NPV: Math.round(npv * 100) / 100,
    Adjusted_ROI_Percentage: Math.round(Adjusted_ROI * 100) / 100,
    NCF_Breakdown: {
      Year_1_NCF: NCF_Yearly_Data.Year_1_NCF,
      Year_1_PV: NCF_Yearly_Data.Year_1_PV,
      Year_2_NCF: NCF_Yearly_Data.Year_2_NCF,
      Year_2_PV: NCF_Yearly_Data.Year_2_PV,
      Year_3_NCF: NCF_Yearly_Data.Year_3_NCF,
      Year_3_PV: NCF_Yearly_Data.Year_3_PV,
    },
    Granular_Savings,
  };
}

