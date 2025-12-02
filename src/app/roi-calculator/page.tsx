'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ProtectedRoute from '@/components/ProtectedRoute';
import { calculateAdvancedTEImpact, TierData, ROICalculatorResult } from '@/lib/roi-calculator';
import { Calculator, Plus, Trash2, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ROICalculatorPage() {
  const [tierData, setTierData] = useState<TierData[]>([
    { name: 'Junior', N: 133, C_hourly: 100, P_weighted: 0.30 },
    { name: 'Mid', N: 350, C_hourly: 150, P_weighted: 0.25 },
    { name: 'Senior', N: 150, C_hourly: 200, P_weighted: 0.18 },
  ]);

  const [params, setParams] = useState({
    cost_per_seat_monthly: 40,
    discount_factor: 0.15,
    discount_rate: 0.10,
    annual_productive_hours: 1800,
    cost_replace_engineer: 180000,
    p_churn_reduction: 0.005,
    p_debt_reduction: 0.05,
    cost_setup_one_time: 50000,
    training_hours_per_dev: 4,
    s_outage_cost: 5000000,
    p_outage_reduction: 0.03,
    p_cross_functional_gain: 0.05,
  });

  const [results, setResults] = useState<ROICalculatorResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCalculate = () => {
    setError(null);
    const result = calculateAdvancedTEImpact({ tier_data: tierData, ...params });
    
    if ('error' in result) {
      setError(result.error);
      setResults(null);
    } else {
      setResults(result);
      setError(null);
    }
  };

  const addTier = () => {
    setTierData([...tierData, { name: 'New Tier', N: 0, C_hourly: 100, P_weighted: 0.20 }]);
  };

  const removeTier = (index: number) => {
    if (tierData.length > 1) {
      setTierData(tierData.filter((_, i) => i !== index));
    }
  };

  const updateTier = (index: number, field: keyof TierData, value: string | number) => {
    const updated = [...tierData];
    // Handle numeric fields properly
    if (field === 'N' || field === 'C_hourly' || field === 'P_weighted') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      updated[index] = { ...updated[index], [field]: isNaN(numValue) ? 0 : numValue };
    } else {
      updated[index] = { ...updated[index], [field]: typeof value === 'string' ? value : value };
    }
    setTierData(updated);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50/50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="h-8 w-8 text-gray-900" />
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">ROI Calculator</h1>
            </div>
            <p className="text-lg text-gray-600">
              Calculate the Total Economic Impact (TEI) and ROI for Cursor Enterprise
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Input Section */}
            <div className="space-y-6">
              {/* Tier Data */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Developer Tiers
                    </CardTitle>
                    <Button onClick={addTier} size="sm" variant="outline">
                      <Plus className="h-4 w-4 mr-1" />
                      Add Tier
                    </Button>
                  </div>
                  <CardDescription>
                    Define your engineering team structure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tierData.map((tier, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="font-semibold">Tier {index + 1}</Label>
                        {tierData.length > 1 && (
                          <Button
                            onClick={() => removeTier(index)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`tier-${index}-name`}>Tier Name</Label>
                          <Input
                            id={`tier-${index}-name`}
                            value={tier.name}
                            onChange={(e) => updateTier(index, 'name', e.target.value)}
                            placeholder="e.g., Senior"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`tier-${index}-n`}># Engineers</Label>
                          <Input
                            id={`tier-${index}-n`}
                            type="text"
                            inputMode="numeric"
                            value={tier.N || ''}
                            onKeyDown={(e) => {
                              // Allow: backspace, delete, tab, escape, enter
                              if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                // Allow: home, end, left, right
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              // Only allow numbers (0-9) from both keyboard and numpad
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              if (val === '') {
                                updateTier(index, 'N', 0);
                              } else {
                                const num = parseInt(val, 10);
                                if (!isNaN(num) && num >= 0) {
                                  updateTier(index, 'N', num);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              if (val === '' || isNaN(parseInt(val, 10))) {
                                updateTier(index, 'N', 0);
                              } else {
                                updateTier(index, 'N', parseInt(val, 10));
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`tier-${index}-hourly`}>Hourly Cost ($)</Label>
                          <Input
                            id={`tier-${index}-hourly`}
                            type="text"
                            inputMode="decimal"
                            value={tier.C_hourly || ''}
                            onKeyDown={(e) => {
                              // Allow: backspace, delete, tab, escape, enter, decimal point
                              if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                // Allow: home, end, left, right
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              // Only allow numbers and decimal point
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                              if (val === '' || val === '.') {
                                updateTier(index, 'C_hourly', 0);
                              } else {
                                const num = parseFloat(val);
                                if (!isNaN(num) && num >= 0) {
                                  updateTier(index, 'C_hourly', num);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                              if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                                updateTier(index, 'C_hourly', 0);
                              } else {
                                updateTier(index, 'C_hourly', parseFloat(val));
                              }
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`tier-${index}-productivity`}>Productivity Gain</Label>
                          <Input
                            id={`tier-${index}-productivity`}
                            type="text"
                            inputMode="decimal"
                            value={tier.P_weighted !== undefined && tier.P_weighted !== null ? (tier.P_weighted * 100).toString() : ''}
                            onKeyDown={(e) => {
                              // Allow: backspace, delete, tab, escape, enter, decimal point
                              if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                                // Allow: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                // Allow: home, end, left, right
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              // Only allow numbers and decimal point
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                              if (val === '' || val === '.') {
                                updateTier(index, 'P_weighted', 0);
                              } else {
                                const num = parseFloat(val);
                                if (!isNaN(num) && num >= 0 && num <= 100) {
                                  updateTier(index, 'P_weighted', num / 100);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                              if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                                updateTier(index, 'P_weighted', 0);
                              } else {
                                const num = Math.min(Math.max(parseFloat(val), 0), 100);
                                updateTier(index, 'P_weighted', num / 100);
                              }
                            }}
                          />
                          <p className="text-xs text-gray-500 mt-1">% (e.g., 30 for 30%)</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Financial Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Financial Parameters
                  </CardTitle>
                  <CardDescription>
                    Configure pricing and discount settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cost_per_seat">Cost per Seat/Month ($)</Label>
                      <Input
                        id="cost_per_seat"
                        type="text"
                        inputMode="decimal"
                        value={params.cost_per_seat_monthly || ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.') {
                            setParams({ ...params, cost_per_seat_monthly: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0) {
                              // Cap at $40/month maximum per seat per user
                              const cappedValue = Math.min(num, 40);
                              setParams({ ...params, cost_per_seat_monthly: cappedValue });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                            setParams({ ...params, cost_per_seat_monthly: 0 });
                          } else {
                            const num = Math.min(Math.max(parseFloat(val), 0), 40);
                            setParams({ ...params, cost_per_seat_monthly: num });
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">Maximum: $40/month per seat per user</p>
                    </div>
                    <div>
                      <Label htmlFor="discount_factor">Discount Factor</Label>
                      <Input
                        id="discount_factor"
                        type="text"
                        inputMode="decimal"
                        value={params.discount_factor !== undefined && params.discount_factor !== null ? (params.discount_factor * 100).toString() : ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.') {
                            setParams({ ...params, discount_factor: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0 && num <= 100) {
                              setParams({ ...params, discount_factor: num / 100 });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                            setParams({ ...params, discount_factor: 0 });
                          } else {
                            const num = Math.min(Math.max(parseFloat(val), 0), 100);
                            setParams({ ...params, discount_factor: num / 100 });
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">% (e.g., 15 for 15%)</p>
                    </div>
                    <div>
                      <Label htmlFor="discount_rate">Discount Rate (WACC)</Label>
                      <Input
                        id="discount_rate"
                        type="text"
                        inputMode="decimal"
                        value={params.discount_rate !== undefined && params.discount_rate !== null ? (params.discount_rate * 100).toString() : ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.') {
                            setParams({ ...params, discount_rate: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0 && num <= 100) {
                              setParams({ ...params, discount_rate: num / 100 });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                            setParams({ ...params, discount_rate: 0 });
                          } else {
                            const num = Math.min(Math.max(parseFloat(val), 0), 100);
                            setParams({ ...params, discount_rate: num / 100 });
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">% (e.g., 10 for 10%)</p>
                    </div>
                    <div>
                      <Label htmlFor="setup_cost">One-Time Setup Cost ($)</Label>
                      <Input
                        id="setup_cost"
                        type="text"
                        inputMode="numeric"
                        value={params.cost_setup_one_time || ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val === '') {
                            setParams({ ...params, cost_setup_one_time: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0) {
                              setParams({ ...params, cost_setup_one_time: num });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val === '' || isNaN(parseFloat(val))) {
                            setParams({ ...params, cost_setup_one_time: 0 });
                          } else {
                            setParams({ ...params, cost_setup_one_time: parseFloat(val) });
                          }
                        }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Operational Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle>Operational Parameters</CardTitle>
                  <CardDescription>
                    Configure productivity and risk settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="annual_hours">Annual Productive Hours</Label>
                      <Input
                        id="annual_hours"
                        type="text"
                        inputMode="numeric"
                        value={params.annual_productive_hours || ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val === '') {
                            setParams({ ...params, annual_productive_hours: 0 });
                          } else {
                            const num = parseInt(val, 10);
                            if (!isNaN(num) && num >= 0) {
                              setParams({ ...params, annual_productive_hours: num });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val === '' || isNaN(parseInt(val, 10))) {
                            setParams({ ...params, annual_productive_hours: 0 });
                          } else {
                            setParams({ ...params, annual_productive_hours: parseInt(val, 10) });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="training_hours">Training Hours/Dev</Label>
                      <Input
                        id="training_hours"
                        type="text"
                        inputMode="decimal"
                        value={params.training_hours_per_dev || ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.') {
                            setParams({ ...params, training_hours_per_dev: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0) {
                              setParams({ ...params, training_hours_per_dev: num });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                            setParams({ ...params, training_hours_per_dev: 0 });
                          } else {
                            setParams({ ...params, training_hours_per_dev: parseFloat(val) });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="replace_cost">Cost to Replace Engineer ($)</Label>
                      <Input
                        id="replace_cost"
                        type="text"
                        inputMode="numeric"
                        value={params.cost_replace_engineer || ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val === '') {
                            setParams({ ...params, cost_replace_engineer: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0) {
                              setParams({ ...params, cost_replace_engineer: num });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val === '' || isNaN(parseFloat(val))) {
                            setParams({ ...params, cost_replace_engineer: 0 });
                          } else {
                            setParams({ ...params, cost_replace_engineer: parseFloat(val) });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="outage_cost">Outage Cost ($)</Label>
                      <Input
                        id="outage_cost"
                        type="text"
                        inputMode="numeric"
                        value={params.s_outage_cost || ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val === '') {
                            setParams({ ...params, s_outage_cost: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0) {
                              setParams({ ...params, s_outage_cost: num });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9]/g, '');
                          if (val === '' || isNaN(parseFloat(val))) {
                            setParams({ ...params, s_outage_cost: 0 });
                          } else {
                            setParams({ ...params, s_outage_cost: parseFloat(val) });
                          }
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor="churn_reduction">Churn Reduction</Label>
                      <Input
                        id="churn_reduction"
                        type="text"
                        inputMode="decimal"
                        value={params.p_churn_reduction !== undefined && params.p_churn_reduction !== null ? (params.p_churn_reduction * 100).toString() : ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.') {
                            setParams({ ...params, p_churn_reduction: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0 && num <= 100) {
                              setParams({ ...params, p_churn_reduction: num / 100 });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                            setParams({ ...params, p_churn_reduction: 0 });
                          } else {
                            const num = Math.min(Math.max(parseFloat(val), 0), 100);
                            setParams({ ...params, p_churn_reduction: num / 100 });
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">%</p>
                    </div>
                    <div>
                      <Label htmlFor="debt_reduction">Debt Reduction</Label>
                      <Input
                        id="debt_reduction"
                        type="text"
                        inputMode="decimal"
                        value={params.p_debt_reduction !== undefined && params.p_debt_reduction !== null ? (params.p_debt_reduction * 100).toString() : ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.') {
                            setParams({ ...params, p_debt_reduction: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0 && num <= 100) {
                              setParams({ ...params, p_debt_reduction: num / 100 });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                            setParams({ ...params, p_debt_reduction: 0 });
                          } else {
                            const num = Math.min(Math.max(parseFloat(val), 0), 100);
                            setParams({ ...params, p_debt_reduction: num / 100 });
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">%</p>
                    </div>
                    <div>
                      <Label htmlFor="outage_reduction">Outage Reduction</Label>
                      <Input
                        id="outage_reduction"
                        type="text"
                        inputMode="decimal"
                        value={params.p_outage_reduction !== undefined && params.p_outage_reduction !== null ? (params.p_outage_reduction * 100).toString() : ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.') {
                            setParams({ ...params, p_outage_reduction: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0 && num <= 100) {
                              setParams({ ...params, p_outage_reduction: num / 100 });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                            setParams({ ...params, p_outage_reduction: 0 });
                          } else {
                            const num = Math.min(Math.max(parseFloat(val), 0), 100);
                            setParams({ ...params, p_outage_reduction: num / 100 });
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">%</p>
                    </div>
                    <div>
                      <Label htmlFor="cross_functional">Cross-Functional Gain</Label>
                      <Input
                        id="cross_functional"
                        type="text"
                        inputMode="decimal"
                        value={params.p_cross_functional_gain !== undefined && params.p_cross_functional_gain !== null ? (params.p_cross_functional_gain * 100).toString() : ''}
                        onKeyDown={(e) => {
                          if ([8, 9, 27, 13, 46, 110, 190].indexOf(e.keyCode) !== -1 ||
                                (e.keyCode === 65 && e.ctrlKey === true) ||
                                (e.keyCode === 67 && e.ctrlKey === true) ||
                                (e.keyCode === 86 && e.ctrlKey === true) ||
                                (e.keyCode === 88 && e.ctrlKey === true) ||
                                (e.keyCode >= 35 && e.keyCode <= 39)) {
                                return;
                              }
                              if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105) && e.keyCode !== 190 && e.keyCode !== 110) {
                                e.preventDefault();
                              }
                        }}
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.') {
                            setParams({ ...params, p_cross_functional_gain: 0 });
                          } else {
                            const num = parseFloat(val);
                            if (!isNaN(num) && num >= 0 && num <= 100) {
                              setParams({ ...params, p_cross_functional_gain: num / 100 });
                            }
                          }
                        }}
                        onBlur={(e) => {
                          const val = e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                          if (val === '' || val === '.' || isNaN(parseFloat(val))) {
                            setParams({ ...params, p_cross_functional_gain: 0 });
                          } else {
                            const num = Math.min(Math.max(parseFloat(val), 0), 100);
                            setParams({ ...params, p_cross_functional_gain: num / 100 });
                          }
                        }}
                      />
                      <p className="text-xs text-gray-500 mt-1">%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button onClick={handleCalculate} className="w-full" size="lg">
                <Calculator className="h-5 w-5 mr-2" />
                Calculate ROI
              </Button>
            </div>

            {/* Results Section */}
            <div className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {results && (
                <>
                  {/* Key Metrics */}
                  <Card className="border-2 border-gray-900">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Key Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">3-Year NPV</p>
                          <p className="text-2xl font-bold text-gray-900">
                            {formatCurrency(results.Final_3Y_NPV)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">ROI</p>
                          <p className="text-2xl font-bold text-green-600">
                            {results.Adjusted_ROI_Percentage.toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Engineers</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {results.Total_Engineers}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Annual Subscription</p>
                          <p className="text-xl font-semibold text-gray-900">
                            {formatCurrency(results.Annual_Subscription_Cost)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Investment & Benefits */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Investment & Benefits</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Initial Investment</span>
                        <span className="font-semibold">{formatCurrency(results.Total_Initial_Investment)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Gross Annual Benefit</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(results.Total_Gross_Annual_Benefit)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Net Cash Flow Breakdown */}
                  <Card>
                    <CardHeader>
                      <CardTitle>3-Year Net Cash Flow</CardTitle>
                      <CardDescription>Adoption curve: 80% Year 1, 95% Year 2, 100% Year 3</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Year 1</span>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(results.NCF_Breakdown.Year_1_NCF)}</p>
                          <p className="text-xs text-gray-500">PV: {formatCurrency(results.NCF_Breakdown.Year_1_PV)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Year 2</span>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(results.NCF_Breakdown.Year_2_NCF)}</p>
                          <p className="text-xs text-gray-500">PV: {formatCurrency(results.NCF_Breakdown.Year_2_PV)}</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Year 3</span>
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(results.NCF_Breakdown.Year_3_NCF)}</p>
                          <p className="text-xs text-gray-500">PV: {formatCurrency(results.NCF_Breakdown.Year_3_PV)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Granular Savings */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Steady-State Net Savings</CardTitle>
                      <CardDescription>Based on 100% adoption</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Annual</span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(results.Granular_Savings.Annual_Net_Savings)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Monthly</span>
                        <span className="font-semibold">
                          {formatCurrency(results.Granular_Savings.Monthly_Net_Savings)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Weekly</span>
                        <span className="font-semibold">
                          {formatCurrency(results.Granular_Savings.Weekly_Net_Savings)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Daily</span>
                        <span className="font-semibold">
                          {formatCurrency(results.Granular_Savings.Daily_Net_Savings)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {!results && !error && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Configure your parameters and click "Calculate ROI" to see results</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

