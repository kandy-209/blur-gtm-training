/**
 * Simple Alpha Vantage API utilities
 * Clean, easy-to-use functions for common financial data queries
 */

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';

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

interface TimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

/**
 * Get real-time quote for a stock symbol
 */
export async function getQuote(symbol: string): Promise<QuoteData | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('Alpha Vantage API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Note || data['Error Message']) {
      console.error('Alpha Vantage error:', data.Note || data['Error Message']);
      return null;
    }

    const quote = data['Global Quote'];
    if (!quote || !quote['05. price']) {
      return null;
    }

    const price = parseFloat(quote['05. price']);
    const previousClose = parseFloat(quote['08. previous close']);
    const change = price - previousClose;
    const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

    return {
      symbol: quote['01. symbol'],
      price,
      change,
      changePercent,
      volume: parseInt(quote['06. volume'] || '0', 10),
      high: parseFloat(quote['03. high'] || '0'),
      low: parseFloat(quote['04. low'] || '0'),
      open: parseFloat(quote['02. open'] || '0'),
      previousClose,
      timestamp: quote['07. latest trading day'],
    };
  } catch (error) {
    console.error('Error fetching quote:', error);
    return null;
  }
}

/**
 * Get company overview/profile
 */
export async function getCompanyOverview(symbol: string): Promise<CompanyOverview | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('Alpha Vantage API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Note || data['Error Message'] || !data.Symbol) {
      console.error('Alpha Vantage error:', data.Note || data['Error Message']);
      return null;
    }

    return {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: data.MarketCapitalization,
      peRatio: data.PERatio,
      dividendYield: data.DividendYield,
      beta: data.Beta,
      eps: data.EPS,
      revenue: data.RevenueTTM,
      profitMargin: data.ProfitMargin,
    };
  } catch (error) {
    console.error('Error fetching company overview:', error);
    return null;
  }
}

/**
 * Search for company symbols by keyword
 */
export async function searchSymbol(keyword: string): Promise<Array<{ symbol: string; name: string }> | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('Alpha Vantage API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${BASE_URL}?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(keyword)}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Note || data['Error Message']) {
      console.error('Alpha Vantage error:', data.Note || data['Error Message']);
      return null;
    }

    const matches = data.bestMatches || [];
    return matches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
    }));
  } catch (error) {
    console.error('Error searching symbols:', error);
    return null;
  }
}

/**
 * Get daily time series data (last 100 days)
 */
export async function getDailyTimeSeries(symbol: string): Promise<TimeSeriesData[] | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('Alpha Vantage API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&outputsize=compact&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Note || data['Error Message']) {
      console.error('Alpha Vantage error:', data.Note || data['Error Message']);
      return null;
    }

    const timeSeries = data['Time Series (Daily)'];
    if (!timeSeries) {
      return null;
    }

    return Object.entries(timeSeries)
      .map(([date, values]: [string, any]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'], 10),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching time series:', error);
    return null;
  }
}

/**
 * Get income statement (annual)
 */
export async function getIncomeStatement(symbol: string): Promise<any | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    console.warn('Alpha Vantage API key not configured');
    return null;
  }

  try {
    const response = await fetch(
      `${BASE_URL}?function=INCOME_STATEMENT&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`
    );

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.Note || data['Error Message']) {
      console.error('Alpha Vantage error:', data.Note || data['Error Message']);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching income statement:', error);
    return null;
  }
}


