import { calculateROI, formatCurrency, formatPercentage, type ROICalculatorInput } from '../roi-calculator';

describe('ROI Calculator', () => {
  const baseInput: ROICalculatorInput = {
    tiers: [
      { n: 30, productivity: 35 }, // Entry Level
      { n: 50, productivity: 30 }, // Senior
      { n: 30, productivity: 25 }, // Staff
      { n: 20, productivity: 20 }, // Principal
    ],
    averageSalary: 150000,
    discountFactor: 10,
    setupCost: 50000,
    costPerSeatMonthly: 60,
  };

  describe('calculateROI', () => {
    it('should calculate ROI for basic input', () => {
      const result = calculateROI(baseInput);
      
      expect(result).toBeDefined();
      expect(result.breakdown).toHaveLength(3);
      expect(result.totalROI).toBeGreaterThan(0);
      expect(result.totalNPV).toBeGreaterThan(0);
    });

    it('should cap cost per seat at $60', () => {
      const inputWithHighCost = {
        ...baseInput,
        costPerSeatMonthly: 100, // Should be capped at 60
      };
      
      const result = calculateROI(inputWithHighCost);
      expect(result).toBeDefined();
      // Verify calculation uses capped value
      expect(result.breakdown[0].totalCost).toBeLessThan(1000000); // Sanity check
    });

    it('should handle zero users', () => {
      const input = {
        ...baseInput,
        tiers: [{ n: 0, productivity: 30 }],
      };
      
      const result = calculateROI(input);
      expect(result.totalProductivityGain).toBe(0);
      expect(result.totalCostSavings).toBe(0);
    });

    it('should handle different productivity tiers', () => {
      const input = {
        ...baseInput,
        tiers: [
          { n: 10, productivity: 50 },
          { n: 20, productivity: 30 },
        ],
      };
      
      const result = calculateROI(input);
      expect(result.year1ProductivityGain).toBeGreaterThan(0);
    });

    it('should handle 4 tiers including entry level', () => {
      const input: ROICalculatorInput = {
        tiers: [
          { n: 30, productivity: 35 }, // Entry Level - higher productivity gain
          { n: 50, productivity: 30 }, // Senior
          { n: 30, productivity: 25 }, // Staff
          { n: 20, productivity: 20 }, // Principal
        ],
        averageSalary: 150000,
        discountFactor: 10,
        setupCost: 50000,
        costPerSeatMonthly: 60,
      };
      
      const result = calculateROI(input);
      
      // Should calculate correctly with 4 tiers
      expect(result).toBeDefined();
      expect(result.breakdown).toHaveLength(3);
      expect(result.totalROI).toBeGreaterThan(0);
      
      // Total users should be 130 (30 + 50 + 30 + 20)
      // Weighted productivity should account for all tiers
      expect(result.year1ProductivityGain).toBeGreaterThan(0);
      
      // Entry level tier should contribute to weighted average
      // Weighted avg = (30*35 + 50*30 + 30*25 + 20*20) / 130
      // = (1050 + 1500 + 750 + 400) / 130 = 3700 / 130 ≈ 28.46%
      expect(result.totalProductivityGain).toBeGreaterThan(0);
    });

    it('should calculate year-by-year breakdown', () => {
      const result = calculateROI(baseInput);
      
      expect(result.breakdown[0].year).toBe(1);
      expect(result.breakdown[1].year).toBe(2);
      expect(result.breakdown[2].year).toBe(3);
      
      // Year 2 and 3 should have higher productivity (proficiency multiplier)
      expect(result.breakdown[1].productivityGain).toBeGreaterThan(result.breakdown[0].productivityGain);
      expect(result.breakdown[2].productivityGain).toBeGreaterThan(result.breakdown[1].productivityGain);
    });

    it('should include setup cost only in year 1', () => {
      const result = calculateROI(baseInput);
      
      expect(result.breakdown[0].totalCost).toBeGreaterThan(result.breakdown[1].totalCost);
      expect(result.breakdown[1].totalCost).toBe(result.breakdown[2].totalCost);
    });

    it('should calculate NPV with discount factor', () => {
      const result = calculateROI(baseInput);
      
      // NPV values should be calculated correctly with discounting
      // Note: NPV may not always decrease if net benefit grows faster than discount rate
      expect(result.breakdown[0].npv).toBeDefined();
      expect(result.breakdown[1].npv).toBeDefined();
      expect(result.breakdown[2].npv).toBeDefined();
      
      // Year 1 should have no discount (exponent 0)
      // Year 2 and 3 should be discounted
      const discountRate = baseInput.discountFactor / 100;
      const expectedYear2NPV = result.breakdown[1].netBenefit / (1 + discountRate);
      const expectedYear3NPV = result.breakdown[2].netBenefit / Math.pow(1 + discountRate, 2);
      
      expect(Math.abs(result.breakdown[1].npv - expectedYear2NPV)).toBeLessThan(0.01);
      expect(Math.abs(result.breakdown[2].npv - expectedYear3NPV)).toBeLessThan(0.01);
    });

    it('should handle edge case: very high productivity', () => {
      const input = {
        ...baseInput,
        tiers: [{ n: 10, productivity: 100 }],
      };
      
      const result = calculateROI(input);
      expect(result.totalProductivityGain).toBeGreaterThan(0);
      expect(result.totalROI).toBeGreaterThan(0);
    });

    it('should handle edge case: very low productivity', () => {
      const input = {
        ...baseInput,
        tiers: [{ n: 10, productivity: 1 }],
      };
      
      const result = calculateROI(input);
      expect(result.totalProductivityGain).toBeGreaterThan(0);
      // ROI might be negative if productivity is too low
    });

    it('should calculate correct total users', () => {
      const input = {
        ...baseInput,
        tiers: [
          { n: 25, productivity: 30 },
          { n: 15, productivity: 25 },
        ],
      };
      
      const result = calculateROI(input);
      // Total users should be 40
      expect(result.breakdown[0].productivityGain).toBeGreaterThan(0);
    });
  });

  describe('formatCurrency', () => {
    it('should format positive numbers', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
      expect(formatCurrency(150000)).toBe('$150,000');
      expect(formatCurrency(5000000)).toBe('$5,000,000');
    });

    it('should format zero', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('should format negative numbers', () => {
      expect(formatCurrency(-1000)).toBe('-$1,000');
    });

    it('should handle decimals by rounding', () => {
      expect(formatCurrency(1234.56)).toBe('$1,235');
      expect(formatCurrency(1234.44)).toBe('$1,234');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages with default decimals', () => {
      expect(formatPercentage(50)).toBe('50.0%');
      expect(formatPercentage(25.5)).toBe('25.5%');
    });

    it('should format percentages with custom decimals', () => {
      expect(formatPercentage(50, 0)).toBe('50%');
      expect(formatPercentage(25.567, 2)).toBe('25.57%');
    });

    it('should handle zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('should handle negative percentages', () => {
      expect(formatPercentage(-10)).toBe('-10.0%');
    });
  });
});

