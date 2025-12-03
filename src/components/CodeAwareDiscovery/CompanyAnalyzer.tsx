'use client';

/**
 * Company Analyzer Component
 * UI for analyzing companies from multiple sources
 */

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, CheckCircle2 } from 'lucide-react';

export function CompanyAnalyzer() {
  const [input, setInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeCompany = async () => {
    if (!input.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/company-intelligence/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input: input.trim(),
          forceRefresh: false,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze company');
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-4">Company Intelligence Analyzer</h1>
        <p className="text-gray-600 mb-6">
          Analyze companies from GitHub repositories, domains, or company names.
          Get comprehensive intelligence including codebase analysis, financial data, and insights.
        </p>

        <div className="space-y-4">
          <div>
            <Label htmlFor="company-input">Company Input</Label>
            <div className="flex gap-2 mt-2">
              <Input
                id="company-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    analyzeCompany();
                  }
                }}
                placeholder="e.g., github.com/acme/platform or acme.com or Acme Corp"
                disabled={isAnalyzing}
                className="flex-1"
              />
              <Button
                onClick={analyzeCompany}
                disabled={!input.trim() || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Analyze
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <div className="text-red-800">{error}</div>
        </Card>
      )}

      {result && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <h2 className="text-xl font-semibold">Analysis Complete</h2>
          </div>

          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="financial">Financial</TabsTrigger>
              <TabsTrigger value="codebase">Codebase</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-gray-600">Company Name</div>
                  <div className="text-lg font-semibold">{result.company.name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Domain</div>
                  <div className="text-lg">{result.company.domain}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Industry</div>
                  <div className="text-lg">{result.company.industry}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Size</div>
                  <div className="text-lg capitalize">{result.company.size}</div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="financial" className="mt-4">
              <div className="space-y-4">
                {result.financial.revenue && (
                  <div>
                    <div className="text-sm text-gray-600">Revenue</div>
                    <div className="text-lg font-semibold">
                      ${(result.financial.revenue / 1000000).toFixed(2)}M
                    </div>
                  </div>
                )}
                {result.financial.employeeCount && (
                  <div>
                    <div className="text-sm text-gray-600">Employees</div>
                    <div className="text-lg font-semibold">
                      {result.financial.employeeCount.toLocaleString()}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="codebase" className="mt-4">
              {result.codebase ? (
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Tech Stack</div>
                    <div className="flex flex-wrap gap-2">
                      {result.codebase.techStack.languages.map((lang: string) => (
                        <span
                          key={lang}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm"
                        >
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Architecture</div>
                    <div className="text-lg capitalize">{result.codebase.architecture.type}</div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No codebase data available</div>
              )}
            </TabsContent>

            <TabsContent value="insights" className="mt-4">
              <div className="space-y-4">
                {result.insights.painPoints.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Pain Points</div>
                    <ul className="list-disc list-inside space-y-1">
                      {result.insights.painPoints.map((point: string, idx: number) => (
                        <li key={idx}>{point}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.insights.priorities.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">Priorities</div>
                    <ul className="list-disc list-inside space-y-1">
                      {result.insights.priorities.map((priority: string, idx: number) => (
                        <li key={idx}>{priority}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      )}
    </div>
  );
}

