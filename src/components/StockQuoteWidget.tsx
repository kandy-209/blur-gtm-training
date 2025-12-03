'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, Loader2, Search } from 'lucide-react';

interface QuoteData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  timestamp: string;
}

export default function StockQuoteWidget() {
  const [symbol, setSymbol] = useState('');
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuote = async () => {
    if (!symbol.trim()) {
      setError('Please enter a symbol');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/alphavantage/quote?symbol=${encodeURIComponent(symbol.toUpperCase())}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch quote');
      }

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
        setQuote(null);
      } else {
        setQuote(data.quote);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch quote');
      setQuote(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      fetchQuote();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Stock Quote</CardTitle>
        <CardDescription>Get real-time stock prices</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Enter symbol (e.g., AAPL, MSFT)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button onClick={fetchQuote} disabled={loading}>
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

        {quote && (
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{quote.symbol}</div>
                <div className="text-sm text-gray-500">{quote.timestamp}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">${quote.price.toFixed(2)}</div>
                <div className={`flex items-center gap-1 text-sm ${
                  quote.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {quote.change >= 0 ? (
                    <TrendingUp className="h-4 w-4" />
                  ) : (
                    <TrendingDown className="h-4 w-4" />
                  )}
                  {quote.change >= 0 ? '+' : ''}{quote.change.toFixed(2)} 
                  ({quote.changePercent >= 0 ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
              <div>
                <div className="text-gray-500">Open</div>
                <div className="font-semibold">${quote.open.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Previous Close</div>
                <div className="font-semibold">${quote.previousClose.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">High</div>
                <div className="font-semibold">${quote.high.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-gray-500">Low</div>
                <div className="font-semibold">${quote.low.toFixed(2)}</div>
              </div>
              <div className="col-span-2">
                <div className="text-gray-500">Volume</div>
                <div className="font-semibold">{quote.volume.toLocaleString()}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}


