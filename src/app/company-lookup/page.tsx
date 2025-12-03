'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, Building2, TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import StockQuoteWidget from '@/components/StockQuoteWidget';
import CompanyAnalysisInsights from '@/components/CompanyAnalysisInsights';
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

    // #region debug log
    fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'company-lookup/page.tsx:39',message:'handleSearch called',data:{searchTerm:searchTerm.trim()},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion

    try {
      const url = `/api/alphavantage/search?keyword=${encodeURIComponent(searchTerm.trim())}`;
      
      // #region debug log
      fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'company-lookup/page.tsx:52',message:'Fetching search API',data:{url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      const response = await fetch(url);
      
      // #region debug log
      fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'company-lookup/page.tsx:56',message:'Search response received',data:{ok:response.ok,status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      // #endregion
      
      if (!response.ok) {
        const errorText = await response.text();
        // #region debug log
        fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'company-lookup/page.tsx:61',message:'Response not ok',data:{status:response.status,errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        // #endregion
        throw new Error(`Failed to search: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // #region debug log
      fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'company-lookup/page.tsx:68',message:'Search data parsed',data:{hasError:!!data.error,resultsCount:data.results?.length||0,error:data.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      
      if (data.error) {
        // Show helpful error message
        if (data.error.includes('API key not configured')) {
          setError('Alpha Vantage API key is not configured. Please add ALPHA_VANTAGE_API_KEY to your .env.local file.');
        } else {
          setError(data.error);
        }
        setSearchResults([]);
      } else {
        const results = data.results || [];
        if (results.length === 0 && data.message) {
          // Show helpful message when no results found
          setError(data.message);
        }
        setSearchResults(results);
        // #region debug log
        fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'company-lookup/page.tsx:75',message:'Search results set',data:{resultsCount:results.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
      }
    } catch (err: any) {
      // #region debug log
      fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'company-lookup/page.tsx:78',message:'Search error caught',data:{message:err.message,stack:err.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'G'})}).catch(()=>{});
      // #endregion
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
          <h1 className="text-3xl font-bold">Company Intelligence & ROI Analysis</h1>
          <p className="text-gray-600">Discover how Cursor Enterprise can help companies based on their financial profile</p>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle>Search Companies</CardTitle>
            <CardDescription>Enter a company name or stock symbol to analyze ROI potential and generate sales insights</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="e.g., Apple, AAPL, Microsoft, MSFT, Coinbase"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !loading) {
                    e.preventDefault();
                    handleSearch();
                  }
                }}
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

        {/* Company Overview - Collapsed Summary */}
        {overview && (
          <>
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

            {/* Value-Added Analysis - This is the key differentiator */}
            <CompanyAnalysisInsights
              symbol={overview.symbol}
              companyName={overview.name}
              sector={overview.sector}
              industry={overview.industry}
            />
          </>
        )}
      </div>
    </div>
  );
}


