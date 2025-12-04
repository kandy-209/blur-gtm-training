'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { calculateROI, formatCurrency, formatPercentage, type ROICalculatorInput } from '@/lib/roi-calculator';
import { Calculator, TrendingUp, DollarSign, Users, Building2, Loader2, AlertCircle } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import { Slider } from '@/components/ui/slider';
import ROIExecutiveDashboard from '@/components/ROIExecutiveDashboard';

interface TierData {
  n: number;
  productivity: number;
  title: string;
  payRange: string;
  productivityType: string;
}

function ROICalculatorContent() {
  const searchParams = useSearchParams();
  const symbolParam = searchParams?.get('symbol');

  // Preset averages based on Cursor productivity data
  const [tiers, setTiers] = useState<TierData[]>([
    { n: 30, productivity: 38, title: 'Entry Level Engineer', payRange: '$80k - $120k', productivityType: 'Learning acceleration & code completion' },
    { n: 50, productivity: 32, title: 'Senior Engineer', payRange: '$150k - $200k', productivityType: 'Code completion & architecture planning' },
    { n: 30, productivity: 28, title: 'Staff Engineer', payRange: '$200k - $250k', productivityType: 'Complex problem solving & system design' },
    { n: 20, productivity: 22, title: 'Principal Engineer', payRange: '$250k - $350k', productivityType: 'Strategic planning & technical leadership' },
  ]);
  const [averageSalary, setAverageSalary] = useState(150000);
  const [discountFactor, setDiscountFactor] = useState(10);
  const [setupCost, setSetupCost] = useState(50000);
  const [costPerSeatMonthly, setCostPerSeatMonthly] = useState(40);
  const [results, setResults] = useState<ReturnType<typeof calculateROI> | null>(null);
  const [companyData, setCompanyData] = useState<{ name: string; symbol: string; revenue?: string } | null>(null);
  const [loadingCompany, setLoadingCompany] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);

  // Auto-load company data if symbol is provided
  useEffect(() => {
    if (symbolParam) {
      loadCompanyData(symbolParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolParam]);

  const loadCompanyData = async (symbol: string) => {
    setLoadingCompany(true);
    setCompanyError(null);
    try {
      const response = await fetch(`/api/alphavantage/overview?symbol=${encodeURIComponent(symbol)}`);
      if (response.ok) {
        const data = await response.json();
        if (data.overview) {
          setCompanyData({
            name: data.overview.name,
            symbol: data.overview.symbol,
            revenue: data.overview.revenue,
          });
          // Estimate engineering headcount from revenue if available
          if (data.overview.revenue && data.overview.revenue !== 'None') {
            const revenueNum = parseFloat(data.overview.revenue);
            if (!isNaN(revenueNum) && revenueNum > 0) {
              // Rough estimate: assume 10-15% of revenue goes to engineering
              // Average engineer cost: $175k/year
              const estimatedEngineeringCost = revenueNum * 0.12;
              const estimatedHeadcount = Math.round(estimatedEngineeringCost / 175000);
              if (estimatedHeadcount > 0) {
                // Distribute across tiers proportionally
                const totalCurrent = tiers.reduce((sum, t) => sum + t.n, 0);
                if (totalCurrent === 0) {
                  // Auto-populate if empty
                  const newTiers = [...tiers];
                  newTiers[0].n = Math.min(estimatedHeadcount, 50);
                  newTiers[1].n = Math.min(Math.max(0, estimatedHeadcount - 50), 50);
                  setTiers(newTiers);
                }
              }
            }
          }
        } else {
          setCompanyError('Company data not found. Please check the symbol and try again.');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setCompanyError(errorData.error || 'Failed to load company data. Please try again.');
      }
    } catch (error) {
      console.error('Failed to load company data:', error);
      setCompanyError('Network error. Please check your connection and try again.');
    } finally {
      setLoadingCompany(false);
    }
  };

  const updateTier = (index: number, field: 'n' | 'productivity', value: string) => {
    const newTiers = [...tiers];
    // Handle empty string - allow it temporarily for better UX
    if (value === '' || value === '-') {
      newTiers[index] = { ...newTiers[index], [field]: 0 };
    } else {
      const numValue = field === 'n' ? parseInt(value, 10) : parseFloat(value);
      if (!isNaN(numValue)) {
        newTiers[index] = { ...newTiers[index], [field]: Math.max(0, numValue) };
      }
    }
    setTiers(newTiers);
  };

  const handleCalculate = () => {
    const input: ROICalculatorInput = {
      tiers: tiers.map(t => ({ n: t.n, productivity: t.productivity })),
      averageSalary,
      discountFactor,
      setupCost,
      costPerSeatMonthly: Math.min(costPerSeatMonthly, 60), // Cap at $60
    };
    const calculated = calculateROI(input);
    setResults(calculated);
  };

  const totalUsers = tiers.reduce((sum, tier) => sum + tier.n, 0);

  return (
    <ProtectedRoute>
      <ErrorBoundaryWithContext component="ROICalculatorContent">
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  ROI Calculator
                </h1>
                <p className="text-gray-600">
                  Calculate the business impact and return on investment for Cursor Enterprise
                </p>
              </div>
              {companyData && (
                <Card className="border-2 border-blue-200 bg-blue-50">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-blue-900">{companyData.name}</div>
                        <div className="text-sm text-blue-700">{companyData.symbol}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            {symbolParam && !companyData && !loadingCompany && (
              <div className="mb-4">
                <Button 
                  variant="outline" 
                  onClick={() => loadCompanyData(symbolParam)}
                  className="text-sm"
                >
                  Load Company Data
                </Button>
              </div>
            )}
            {loadingCompany && (
              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading company data...
              </div>
            )}
            {companyError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Error</p>
                  <p className="text-sm text-red-700 mt-1">{companyError}</p>
                </div>
                <button
                  onClick={() => setCompanyError(null)}
                  className="text-red-600 hover:text-red-800"
                  aria-label="Dismiss error"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          <div className={`grid gap-6 ${results ? 'lg:grid-cols-1' : 'lg:grid-cols-2'}`}>
            {/* Input Section */}
            <Card className={results ? 'lg:col-span-1' : ''}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Input Parameters
                </CardTitle>
                <CardDescription>
                  Enter your organization's details to calculate ROI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* User Tiers */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">User Tiers</Label>
                  {tiers.map((tier, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="mb-2">
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-6 w-6 rounded bg-gray-900 text-white text-xs font-semibold flex items-center justify-center">
                            {index + 1}
                          </div>
                          <Label className="text-sm font-semibold text-gray-900">
                            {tier.title}
                          </Label>
                        </div>
                        <div className="text-xs text-gray-600 ml-8 space-y-0.5">
                          <div>Pay Range: {tier.payRange}</div>
                          <div>Productivity: {tier.productivityType}</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor={`tier-${index}-n`} className="text-sm">
                            Number of Users
                          </Label>
                          <Input
                            id={`tier-${index}-n`}
                            type="number"
                            min="0"
                            value={tier.n || ''}
                            onChange={(e) => updateTier(index, 'n', e.target.value)}
                            onBlur={(e) => {
                              // Ensure value is set to 0 if empty on blur
                              if (e.target.value === '' || isNaN(parseInt(e.target.value, 10))) {
                                updateTier(index, 'n', '0');
                              }
                            }}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor={`tier-${index}-productivity`} className="text-sm">
                              Productivity Gain (%)
                            </Label>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-gray-900 min-w-[3rem] text-right">
                                {tier.productivity.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Slider
                              id={`tier-${index}-productivity`}
                              min={0}
                              max={100}
                              step={0.5}
                              value={[tier.productivity]}
                              onValueChange={(values) => {
                                const newTiers = [...tiers];
                                newTiers[index] = { ...newTiers[index], productivity: values[0] };
                                setTiers(newTiers);
                              }}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 px-1">
                              <span>0%</span>
                              <span>50%</span>
                              <span>100%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div className="text-sm text-gray-600 pt-2">
                    Total Users: <strong>{totalUsers}</strong>
                  </div>
                </div>

                {/* Financial Parameters */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Financial Parameters</Label>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="averageSalary">Average Developer Salary ($ per year)</Label>
                      <span className="text-sm font-semibold text-gray-900">
                        ${averageSalary.toLocaleString()}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Slider
                        id="averageSalary"
                        min={80000}
                        max={300000}
                        step={5000}
                        value={[averageSalary]}
                        onValueChange={(values) => setAverageSalary(values[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>$80k</span>
                        <span>$190k</span>
                        <span>$300k</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label htmlFor="costPerSeatMonthly">
                        Cost per Seat ($ monthly) - Max $60
                      </Label>
                      <span className="text-sm font-semibold text-gray-900">
                        ${costPerSeatMonthly.toFixed(0)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <Slider
                        id="costPerSeatMonthly"
                        min={0}
                        max={60}
                        step={1}
                        value={[costPerSeatMonthly]}
                        onValueChange={(values) => setCostPerSeatMonthly(values[0])}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>$0</span>
                        <span>$30</span>
                        <span>$60</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Automatically capped at $60/month per user
                    </p>
                  </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="discountFactor">Discount Rate (%)</Label>
                            <span className="text-sm font-semibold text-gray-900">
                              {discountFactor.toFixed(1)}%
                            </span>
                          </div>
                          <div className="space-y-2">
                            <Slider
                              id="discountFactor"
                              min={0}
                              max={20}
                              step={0.5}
                              value={[discountFactor]}
                              onValueChange={(values) => setDiscountFactor(values[0])}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 px-1">
                              <span>0%</span>
                              <span>10%</span>
                              <span>20%</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="setupCost">One-Time Setup Cost ($)</Label>
                            <span className="text-sm font-semibold text-gray-900">
                              ${setupCost.toLocaleString()}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <Slider
                              id="setupCost"
                              min={0}
                              max={200000}
                              step={5000}
                              value={[setupCost]}
                              onValueChange={(values) => setSetupCost(values[0])}
                              className="w-full"
                            />
                            <div className="flex justify-between text-xs text-gray-500 px-1">
                              <span>$0</span>
                              <span>$100k</span>
                              <span>$200k</span>
                            </div>
                          </div>
                        </div>
                </div>

                <Button onClick={handleCalculate} className="w-full" size="lg">
                  Calculate ROI
                </Button>
              </CardContent>
            </Card>

            {/* Results Section - Executive Dashboard */}
            {results ? (
              <div className="lg:col-span-2">
                <ROIExecutiveDashboard 
                  results={results}
                  totalUsers={totalUsers}
                  averageSalary={averageSalary}
                />
              </div>
            ) : (
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Results
                  </CardTitle>
                  <CardDescription>
                    ROI and financial impact analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-gray-500">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Enter parameters and click "Calculate ROI" to see results</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      </ErrorBoundaryWithContext>
    </ProtectedRoute>
  );
}

export default function ROICalculatorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    }>
      <ROICalculatorContent />
    </Suspense>
  );
}

