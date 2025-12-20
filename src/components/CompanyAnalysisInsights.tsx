'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Target, AlertTriangle, DollarSign, Users, Code, Lightbulb, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface CompanyAnalysisInsightsProps {
  symbol: string;
  companyName: string;
  sector?: string;
  industry?: string;
}

interface AnalysisData {
  estimatedProductivityGain: number;
  estimatedCostSavings: number;
  estimatedRevenueImpact: number;
  estimatedEngineeringHeadcount: number;
  estimatedEngineeringCost: number;
  painPoints: string[];
  buyingSignals: string[];
  priorities: string[];
  concerns: string[];
  roiBreakdown: {
    year1: number;
    year2: number;
    year3: number;
    total3Year: number;
  };
  prospectPersona: {
    title: string;
    concerns: string[];
    decisionFactors: string[];
  };
}

export default function CompanyAnalysisInsights({ symbol, companyName, sector, industry }: CompanyAnalysisInsightsProps) {
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalysis = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/company-intelligence/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: `${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
            ticker: symbol,
            companyName,
            sector,
            industry,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to analyze company');
        }

        const data = await response.json();
        
        if (data.error) {
          setError(data.error);
          return;
        }

        // Transform the intelligence data into analysis format
        const intelligence = data.intelligence;
        const financial = intelligence.financial || {};
        const insights = intelligence.insights || {};

        // Calculate ROI breakdown
        const engineeringCost = financial.estimatedEngineeringCost || (financial.rndSpending || 0) * 0.6;
        const productivityGain = 30; // Default, will be updated from AI analysis
        const annualSavings = engineeringCost * (productivityGain / 100);
        
        const roiBreakdown = {
          year1: annualSavings * 0.8, // 80% in first year (ramp-up)
          year2: annualSavings * 1.0, // Full impact
          year3: annualSavings * 1.1, // 110% (compounding benefits)
          total3Year: annualSavings * 2.9,
        };

        setAnalysis({
          estimatedProductivityGain: productivityGain,
          estimatedCostSavings: annualSavings,
          estimatedRevenueImpact: financial.revenue ? financial.revenue * 0.02 : 0, // 2% revenue impact
          estimatedEngineeringHeadcount: financial.estimatedEngineeringHeadcount || 0,
          estimatedEngineeringCost: engineeringCost,
          painPoints: insights.painPoints || [],
          buyingSignals: insights.buyingSignals || [],
          priorities: insights.priorities || [],
          concerns: insights.concerns || [],
          roiBreakdown,
          prospectPersona: {
            title: financial.estimatedEngineeringHeadcount 
              ? financial.estimatedEngineeringHeadcount > 100 
                ? 'VP of Engineering at Large Enterprise'
                : 'CTO at Mid-Size Company'
              : 'Engineering Leader',
            concerns: insights.concerns || [],
            decisionFactors: Object.entries(insights.decisionFactors || {}).map(([key, value]) => 
              `${key}: ${(Number(value) * 100).toFixed(0)}%`
            ),
          },
        });
      } catch (err: any) {
        setError(err.message || 'Failed to analyze company');
      } finally {
        setLoading(false);
      }
    };

    if (symbol && companyName) {
      fetchAnalysis();
    }
  }, [symbol, companyName, sector, industry]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Analyzing how Browserbase can help {companyName}...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ROI Summary */}
      <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Estimated Impact for {companyName}
          </CardTitle>
          <CardDescription>
            Based on financial analysis and industry benchmarks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">Productivity Gain</div>
              <div className="text-2xl font-bold text-blue-600">{analysis.estimatedProductivityGain}%</div>
              <div className="text-xs text-gray-500 mt-1">Engineering team efficiency</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">Annual Cost Savings</div>
              <div className="text-2xl font-bold text-green-600">
                ${(analysis.estimatedCostSavings / 1e6).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-500 mt-1">From productivity gains</div>
            </div>
            <div className="p-4 bg-white rounded-lg border border-blue-100">
              <div className="text-sm text-gray-600 mb-1">Revenue Impact</div>
              <div className="text-2xl font-bold text-purple-600">
                ${(analysis.estimatedRevenueImpact / 1e6).toFixed(1)}M
              </div>
              <div className="text-xs text-gray-500 mt-1">From faster time-to-market</div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-700">3-Year ROI Projection</span>
              <span className="text-lg font-bold text-green-600">
                ${(analysis.roiBreakdown.total3Year / 1e6).toFixed(1)}M
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <div className="text-gray-500">Year 1</div>
                <div className="font-semibold">${(analysis.roiBreakdown.year1 / 1e6).toFixed(1)}M</div>
              </div>
              <div>
                <div className="text-gray-500">Year 2</div>
                <div className="font-semibold">${(analysis.roiBreakdown.year2 / 1e6).toFixed(1)}M</div>
              </div>
              <div>
                <div className="text-gray-500">Year 3</div>
                <div className="font-semibold">${(analysis.roiBreakdown.year3 / 1e6).toFixed(1)}M</div>
              </div>
            </div>
          </div>

          <Link href={`/roi-calculator?symbol=${symbol}&company=${encodeURIComponent(companyName)}`}>
            <Button className="w-full" size="lg">
              View Detailed ROI Calculator
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Pain Points & Buying Signals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-orange-600" />
              Key Pain Points
            </CardTitle>
            <CardDescription>Areas where Browserbase can help</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.painPoints.length > 0 ? (
              <ul className="space-y-2">
                {analysis.painPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Analysis in progress...</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Lightbulb className="h-5 w-5 text-green-600" />
              Buying Signals
            </CardTitle>
            <CardDescription>Indicators of strong fit</CardDescription>
          </CardHeader>
          <CardContent>
            {analysis.buyingSignals.length > 0 ? (
              <ul className="space-y-2">
                {analysis.buyingSignals.map((signal, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{signal}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Analysis in progress...</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Prospect Persona */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="h-5 w-5 text-purple-600" />
            Recommended Prospect Persona
          </CardTitle>
          <CardDescription>Best-fit buyer profile for this company</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant="outline" className="text-base px-3 py-1">
              {analysis.prospectPersona.title}
            </Badge>
          </div>
          
          {analysis.prospectPersona.concerns.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Key Concerns:</div>
              <ul className="space-y-1">
                {analysis.prospectPersona.concerns.map((concern, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                    <span className="text-gray-400">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {analysis.prospectPersona.decisionFactors.length > 0 && (
            <div>
              <div className="text-sm font-semibold text-gray-700 mb-2">Decision Factors:</div>
              <div className="flex flex-wrap gap-2">
                {analysis.prospectPersona.decisionFactors.map((factor, idx) => (
                  <Badge key={idx} variant="secondary" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Link href={`/scenario-builder?company=${encodeURIComponent(companyName)}&symbol=${symbol}`}>
            <Button variant="outline" className="w-full">
              Create Custom Scenario for {companyName}
              <Code className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Engineering Metrics */}
      {analysis.estimatedEngineeringHeadcount > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Code className="h-5 w-5 text-blue-600" />
              Engineering Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Estimated Engineering Headcount</div>
                <div className="text-xl font-bold">{analysis.estimatedEngineeringHeadcount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Estimated Engineering Cost</div>
                <div className="text-xl font-bold">
                  ${(analysis.estimatedEngineeringCost / 1e6).toFixed(1)}M/year
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}














