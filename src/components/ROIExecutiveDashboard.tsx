'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency, formatPercentage, type ROICalculatorOutput } from '@/lib/roi-calculator';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, DollarSign, Users, Zap, Calendar } from 'lucide-react';

interface ROIExecutiveDashboardProps {
  results: ROICalculatorOutput;
  totalUsers: number;
  averageSalary: number;
}

export default function ROIExecutiveDashboard({ 
  results, 
  totalUsers,
  averageSalary 
}: ROIExecutiveDashboardProps) {
  // Prepare data for charts
  const yearOverYearData = results.breakdown.map((year) => ({
    year: `Year ${year.year}`,
    productivityGain: Math.round(year.productivityGain),
    costSavings: Math.round(year.costSavings),
    totalCost: Math.round(year.totalCost),
    netBenefit: Math.round(year.netBenefit),
    npv: Math.round(year.npv),
    // Calculate release increase percentage (productivity gain as % of salary = % more releases)
    releaseIncrease: Math.round((year.productivityGain / (averageSalary * totalUsers)) * 100),
  }));

  const costBenefitData = results.breakdown.map((year) => ({
    year: `Y${year.year}`,
    'Cost Savings': Math.round(year.costSavings / 1000), // In thousands
    'Total Cost': Math.round(year.totalCost / 1000),
    'Net Benefit': Math.round(year.netBenefit / 1000),
  }));

  const cumulativeData = results.breakdown.reduce((acc, year, index) => {
    const prevCumulative = index > 0 ? acc[index - 1] : { cumulativeBenefit: 0, cumulativeCost: 0 };
    return [
      ...acc,
      {
        year: `Year ${year.year}`,
        cumulativeBenefit: prevCumulative.cumulativeBenefit + year.netBenefit,
        cumulativeCost: prevCumulative.cumulativeCost + year.totalCost,
      },
    ];
  }, [] as Array<{ year: string; cumulativeBenefit: number; cumulativeCost: number }>);

  const roiBreakdown = [
    { name: 'Productivity Gains', value: Math.round(results.totalProductivityGain) },
    { name: 'Setup & Operating Costs', value: Math.round(results.breakdown.reduce((sum, y) => sum + y.totalCost, 0)) },
  ];

  // Calculate average productivity gain percentage
  const avgProductivityGain = results.breakdown.reduce((sum, y) => {
    const yearProductivity = (y.productivityGain / (averageSalary * totalUsers)) * 100;
    return sum + yearProductivity;
  }, 0) / results.breakdown.length;

  const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'];

  return (
    <div className="space-y-6">
      {/* Executive Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              3-Year ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900">
              {formatPercentage(results.year3ROI)}
            </div>
            <p className="text-xs text-gray-600 mt-1">Return on Investment</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total NPV
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900">
              {formatCurrency(results.totalNPV)}
            </div>
            <p className="text-xs text-gray-600 mt-1">Net Present Value</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Avg Release Increase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900">
              {formatPercentage(avgProductivityGain)}
            </div>
            <p className="text-xs text-gray-600 mt-1">More Features/Releases</p>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Payback Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {results.breakdown.findIndex(y => y.netBenefit > 0) >= 0 
                ? `${results.breakdown.findIndex(y => y.netBenefit > 0) + 1} Year${results.breakdown.findIndex(y => y.netBenefit > 0) > 0 ? 's' : ''}`
                : '3+ Years'}
            </div>
            <p className="text-xs text-gray-600 mt-1">Time to Positive ROI</p>
          </CardContent>
        </Card>
      </div>

      {/* Year-over-Year Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Year-over-Year Performance</CardTitle>
          <CardDescription>
            Productivity gains, costs, and net benefits over 3 years
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={yearOverYearData}>
              <defs>
                <linearGradient id="colorProductivity" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorNetBenefit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#6b7280" />
              <YAxis 
                stroke="#6b7280"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="productivityGain" 
                stroke="#10b981" 
                fillOpacity={1} 
                fill="url(#colorProductivity)"
                name="Productivity Gain"
              />
              <Area 
                type="monotone" 
                dataKey="netBenefit" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorNetBenefit)"
                name="Net Benefit"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Cost vs Benefit Comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Cost vs Benefit Analysis</CardTitle>
            <CardDescription>
              Annual comparison of costs and savings (in thousands)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costBenefitData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#6b7280" />
                <YAxis 
                  stroke="#6b7280"
                  tickFormatter={(value) => `$${value}k`}
                />
                <Tooltip 
                  formatter={(value: number) => `$${value}k`}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="Cost Savings" fill="#10b981" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Total Cost" fill="#ef4444" radius={[8, 8, 0, 0]} />
                <Bar dataKey="Net Benefit" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Release Increase Over Time */}
        <Card>
          <CardHeader>
            <CardTitle>Release Velocity Increase</CardTitle>
            <CardDescription>
              Productivity gains translated to % more releases/features per year
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={yearOverYearData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="year" stroke="#6b7280" />
                <YAxis 
                  stroke="#6b7280"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value: number) => `${value}%`}
                  labelFormatter={(label) => label}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="releaseIncrease" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  dot={{ fill: '#8b5cf6', r: 6 }}
                  name="Release Increase %"
                />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>What this means:</strong> With an average {formatPercentage(avgProductivityGain)} productivity gain, 
                your team can deliver {formatPercentage(avgProductivityGain)} more features, releases, or improvements 
                in the same timeframe.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cumulative ROI Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Cumulative ROI Trend</CardTitle>
          <CardDescription>
            Running total of benefits vs costs over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={cumulativeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" stroke="#6b7280" />
              <YAxis 
                stroke="#6b7280"
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="cumulativeBenefit" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 6 }}
                name="Cumulative Benefits"
              />
              <Line 
                type="monotone" 
                dataKey="cumulativeCost" 
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ fill: '#ef4444', r: 6 }}
                name="Cumulative Costs"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ROI Breakdown Pie Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Breakdown</CardTitle>
          <CardDescription>
            Total productivity gains vs total investment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roiBreakdown}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roiBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Productivity Gains</span>
                  <span className="text-lg font-bold text-green-900">
                    {formatCurrency(results.totalProductivityGain)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Value created through increased developer productivity
                </p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Investment</span>
                  <span className="text-lg font-bold text-red-900">
                    {formatCurrency(roiBreakdown[1].value)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Setup costs + 3 years of operating costs
                </p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Net Benefit</span>
                  <span className="text-lg font-bold text-blue-900">
                    {formatCurrency(results.totalNetBenefit)}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Total value after subtracting all costs
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



