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

    const sanitizedSymbol = symbol.trim().toUpperCase();
    
    // #region debug log
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
      fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StockQuoteWidget.tsx:28',message:'fetchQuote called',data:{symbol:sanitizedSymbol,originalSymbol:symbol},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    }
    // #endregion

    setLoading(true);
    setError(null);

    try {
      const url = `/api/alphavantage/quote?symbol=${encodeURIComponent(sanitizedSymbol)}`;
      
      // #region debug log
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StockQuoteWidget.tsx:38',message:'Fetching quote',data:{url},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      }
      // #endregion
      
      const response = await fetch(url);
      
      // #region debug log
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StockQuoteWidget.tsx:42',message:'Response received',data:{ok:response.ok,status:response.status,statusText:response.statusText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
      }
      // #endregion
      
      if (!response.ok) {
        const errorText = await response.text();
        // #region debug log
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
          fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StockQuoteWidget.tsx:47',message:'Response not ok',data:{status:response.status,errorText},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'D'})}).catch(()=>{});
        }
        // #endregion
        throw new Error(`Failed to fetch quote: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // #region debug log
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StockQuoteWidget.tsx:54',message:'Response data parsed',data:{hasError:!!data.error,hasQuote:!!data.quote,error:data.error},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
      }
      // #endregion
      
      if (data.error) {
        setError(data.error);
        setQuote(null);
      } else {
        setQuote(data.quote);
      }
    } catch (err: any) {
      // #region debug log
      if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'test') {
        fetch('http://127.0.0.1:7242/ingest/07b364a5-6862-4730-a70c-26891b09d092',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'StockQuoteWidget.tsx:62',message:'Error caught',data:{message:err.message,stack:err.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'F'})}).catch(()=>{});
      }
      // #endregion
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


