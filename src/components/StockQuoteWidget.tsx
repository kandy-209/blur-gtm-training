'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, TrendingUp, TrendingDown } from 'lucide-react';

export default function StockQuoteWidget() {
  const [symbol, setSymbol] = useState('');
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!symbol.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/alphavantage/quote?symbol=${encodeURIComponent(symbol.trim())}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch quote');
      }

      setQuote(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock quote');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Stock Quote</CardTitle>
        <CardDescription>
          Search for a stock symbol to get real-time quote information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter symbol (e.g., AAPL, MSFT)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch} disabled={loading || !symbol.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {quote && (
          <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">{quote.symbol}</h3>
                <p className="text-sm text-gray-600">{quote.name}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${quote.price}</div>
                <div className={`text-sm flex items-center gap-1 ${quote.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {quote.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {quote.change >= 0 ? '+' : ''}{quote.change} ({quote.changePercent}%)
                </div>
              </div>
            </div>
            {quote.volume && (
              <div className="text-xs text-gray-500 pt-2 border-t border-gray-200">
                Volume: {quote.volume.toLocaleString()}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
