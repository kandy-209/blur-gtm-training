'use client';

import { useState, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import { Loader2, Search, Building2, TrendingUp, DollarSign, BarChart3, X, AlertCircle } from 'lucide-react';
import StockQuoteWidget from '@/components/StockQuoteWidget';
import CompanyAnalysisInsights from '@/components/CompanyAnalysisInsights';
import { EmptyState } from '@/components/ui/empty-state';
import Link from 'next/link';

interface SearchResult {
  symbol: string;
  name: string;
}

interface CompanyOverview {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: string;
  peRatio: string;
  dividendYield: string;
  beta: string;
  eps: string;
  revenue: string;
  profitMargin: string;
}

export default function CompanyLookupPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [overview, setOverview] = useState<CompanyOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setError('Please enter a company name or symbol');
      return;
    }

    setLoading(true);
    setError(null);
    setOverview(null);
    setSearchResults([]);

    try {
      const url = `/api/alphavantage/search?keyword=${encodeURIComponent(searchTerm.trim())}`;
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to search: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        // Show helpful error message
        if (data.error.includes('API key not configured') || response.status === 503) {
          setError('Company search is currently unavailable. The Alpha Vantage API key needs to be configured. This feature will be available once configured.');
        } else {
          setError(data.error || 'Failed to search for companies. Please try again.');
        }
        setSearchResults([]);
      } else {
        const results = data.results || [];
        if (results.length === 0) {
          setError(null);
          setSearchResults([]);
        } else {
          setError(null);
          setSearchResults(results);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search. Please check your connection and try again.');
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSymbol = async (symbol: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/alphavantage/overview?symbol=${encodeURIComponent(symbol)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch company overview');
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setOverview(null);
      } else {
        setOverview(data.overview);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch overview');
      setOverview(null);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: string) => {
    if (!value || value === 'None') return 'N/A';
    const num = parseFloat(value);
    if (isNaN(num)) return value;
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    return `$${num.toLocaleString()}`;
  };

  return (
    <ErrorBoundaryWithContext component="CompanyLookupPage" severity="medium">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Company Intelligence & ROI Analysis</h1>
            <p className="text-gray-600">Discover how Cursor Enterprise can help companies based on their financial profile</p>
          </div>

          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search Companies
              </CardTitle>
              <CardDescription>Enter a company name or stock symbol to analyze ROI potential and generate sales insights</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="e.g., Apple, AAPL, Microsoft, MSFT, Coinbase"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !loading && searchTerm.trim()) {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                    className="pl-10 pr-10"
                    disabled={loading}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label="Clear search"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button onClick={handleSearch} disabled={loading || !searchTerm.trim()}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">{error}</div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-600 hover:text-red-800 flex-shrink-0"
                    aria-label="Dismiss error"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}

              {loading && searchResults.length === 0 && !overview && (
                <div className="space-y-2">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-12 w-full" />
                </div>
              )}

              {!loading && searchResults.length === 0 && searchTerm && !error && (
                <EmptyState
                  icon={Search}
                  title="No companies found"
                  description="Try a different search term or check the spelling"
                />
              )}

              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-700">
                      Search Results ({searchResults.length})
                    </div>
                    <Badge variant="secondary">{searchResults.length} found</Badge>
                  </div>
                  <div className="grid gap-2">
                    {searchResults.map((result) => (
                      <button
                        key={result.symbol}
                        onClick={() => handleSelectSymbol(result.symbol)}
                        disabled={loading}
                        className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <div className="font-semibold flex items-center gap-2">
                          {result.symbol}
                          {loading && <Loader2 className="h-3 w-3 animate-spin" />}
                        </div>
                        <div className="text-sm text-gray-600">{result.name}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Overview */}
          {loading && overview && (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          )}

          {overview && !loading && (
            <Suspense fallback={
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            }>
              <ErrorBoundaryWithContext component="CompanyOverview" severity="low">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {overview.name} ({overview.symbol})
                    </CardTitle>
                    <CardDescription>{overview.sector} • {overview.industry}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Market Cap</div>
                        <div className="font-semibold">{formatCurrency(overview.marketCap)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Revenue</div>
                        <div className="font-semibold">{formatCurrency(overview.revenue)}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">P/E Ratio</div>
                        <div className="font-semibold">{overview.peRatio || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Profit Margin</div>
                        <div className="font-semibold">{overview.profitMargin || 'N/A'}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Value-Added Analysis */}
                <ErrorBoundaryWithContext component="CompanyAnalysisInsights" severity="low">
                  <CompanyAnalysisInsights
                    symbol={overview.symbol}
                    companyName={overview.name}
                    sector={overview.sector}
                    industry={overview.industry}
                  />
                </ErrorBoundaryWithContext>
              </ErrorBoundaryWithContext>
            </Suspense>
          )}
        </div>
      </div>
    </ErrorBoundaryWithContext>
  );
}


