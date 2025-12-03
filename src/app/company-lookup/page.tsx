'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Building2, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import StockQuoteWidget from '@/components/StockQuoteWidget';
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

    try {
      const response = await fetch(`/api/alphavantage/search?keyword=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) {
        throw new Error('Failed to search');
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setSearchResults([]);
      } else {
        setSearchResults(data.results || []);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to search');
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
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Company Lookup</h1>
          <p className="text-gray-600">Search for companies and view financial data</p>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Companies</CardTitle>
            <CardDescription>Enter a company name or stock symbol</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Apple, AAPL, Microsoft, MSFT"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-semibold text-gray-700">Search Results:</div>
                <div className="grid gap-2">
                  {searchResults.map((result) => (
                    <button
                      key={result.symbol}
                      onClick={() => handleSelectSymbol(result.symbol)}
                      className="text-left p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-semibold">{result.symbol}</div>
                      <div className="text-sm text-gray-600">{result.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Overview */}
        {overview && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                {overview.name} ({overview.symbol})
              </CardTitle>
              <CardDescription>{overview.sector} • {overview.industry}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-sm text-gray-600">{overview.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Market Cap</div>
                    <div className="font-semibold">{formatCurrency(overview.marketCap)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Revenue (TTM)</div>
                    <div className="font-semibold">{formatCurrency(overview.revenue)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">P/E Ratio</div>
                    <div className="font-semibold">{overview.peRatio || 'N/A'}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <BarChart3 className="h-5 w-5 text-gray-600" />
                  <div>
                    <div className="text-sm text-gray-600">Profit Margin</div>
                    <div className="font-semibold">{overview.profitMargin || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Link href={`/roi-calculator?symbol=${overview.symbol}`}>
                  <Button className="w-full">
                    Calculate ROI for {overview.symbol}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stock Quote Widget */}
        <StockQuoteWidget />
      </div>
    </div>
  );
}


