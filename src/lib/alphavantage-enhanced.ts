/**
 * Enhanced Alpha Vantage API Integration
 * Pulls comprehensive financial and company data with caching
 */

import { cachedRouteHandler } from './next-cache-wrapper';
import { retryWithBackoff } from './error-recovery';
import { log } from './logger';

const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || '';
const BASE_URL = 'https://www.alphavantage.co/query';
const REQUEST_TIMEOUT = 15000; // 15 seconds

export interface EnhancedQuoteData {
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
  // Additional metrics
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  beta?: number;
  eps?: number;
  fiftyTwoWeekHigh?: number;
  fiftyTwoWeekLow?: number;
}

export interface EnhancedCompanyOverview {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  address?: string;
  fullTimeEmployees?: number;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  beta?: number;
  eps?: number;
  revenue?: number;
  profitMargin?: number;
  operatingMargin?: number;
  returnOnEquity?: number;
  returnOnAssets?: number;
  debtToEquity?: number;
  currentRatio?: number;
  bookValue?: number;
  earningsGrowth?: number;
  revenueGrowth?: number;
  dividendDate?: string;
  exDividendDate?: string;
  sharesOutstanding?: number;
  sharesFloat?: number;
}

export interface EarningsData {
  symbol: string;
  annualEarnings: Array<{
    fiscalDateEnding: string;
    reportedEPS: string;
  }>;
  quarterlyEarnings: Array<{
    fiscalDateEnding: string;
    reportedDate: string;
    reportedEPS: string;
    estimatedEPS: string;
    surprise: string;
    surprisePercentage: string;
  }>;
}

export interface BalanceSheetData {
  symbol: string;
  annualReports: Array<{
    fiscalDateEnding: string;
    totalAssets: string;
    totalLiabilities: string;
    totalShareholderEquity: string;
    cashAndCashEquivalents: string;
    currentAssets: string;
    currentLiabilities: string;
    longTermDebt: string;
  }>;
}

/**
 * Get enhanced quote with additional metrics
 */
export async function getEnhancedQuote(symbol: string): Promise<EnhancedQuoteData | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    log.warn('Alpha Vantage API key not configured');
    return null;
  }

  const cachedResult = await cachedRouteHandler(
    `enhanced-quote:${symbol}`,
    async () => {
      // Validate symbol
      if (!symbol || symbol.length > 10 || !/^[A-Z0-9.]+$/.test(symbol)) {
        throw new Error('Invalid symbol format');
      }
      
      const quoteResult = await retryWithBackoff(
        async () => {
          const url = `${BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
          
          const response = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
          }

          const data = await response.json();
          
          if (data.Note || data['Error Message']) {
            const errorMsg = data.Note || data['Error Message'];
            if (errorMsg.includes('rate limit')) {
              throw new Error('Rate limit exceeded');
            }
            throw new Error(errorMsg);
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
        },
        {
          maxRetries: 3,
          retryDelay: 1000,
          shouldRetry: (error) => {
            return error.message?.includes('timeout') || 
                   error.message?.includes('rate limit') ||
                   error.message?.includes('503') ||
                   error.message?.includes('429');
          }
        }
      );

      if (!quoteResult.success || !quoteResult.data) {
        return null;
      }

      // Fetch overview for additional metrics
      const overview = await getEnhancedCompanyOverview(symbol);
      if (overview) {
        return {
          ...quoteResult.data,
          marketCap: overview.marketCap,
          peRatio: overview.peRatio,
          dividendYield: overview.dividendYield,
          beta: overview.beta,
          eps: overview.eps,
        };
      }

      return quoteResult.data;
    },
    {
      revalidate: 60,
      tags: [`quote-${symbol}`, 'alphavantage'],
      useRedis: true,
    }
  );

  return cachedResult.data;
}

/**
 * Get enhanced company overview with comprehensive metrics
 */
export async function getEnhancedCompanyOverview(symbol: string): Promise<EnhancedCompanyOverview | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    return null;
  }

  const cachedResult = await cachedRouteHandler(
    `enhanced-overview:${symbol}`,
    async () => {
      const url = `${BASE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Note || data['Error Message'] || !data.Symbol) {
        return null;
      }

      return {
        symbol: data.Symbol,
        name: data.Name,
        description: data.Description,
        sector: data.Sector,
        industry: data.Industry,
        address: data.Address,
        fullTimeEmployees: data.FullTimeEmployees ? parseInt(data.FullTimeEmployees) : undefined,
        marketCap: data.MarketCapitalization ? parseFloat(data.MarketCapitalization) : undefined,
        peRatio: data.PERatio ? parseFloat(data.PERatio) : undefined,
        dividendYield: data.DividendYield ? parseFloat(data.DividendYield) : undefined,
        beta: data.Beta ? parseFloat(data.Beta) : undefined,
        eps: data.EPS ? parseFloat(data.EPS) : undefined,
        revenue: data.RevenueTTM ? parseFloat(data.RevenueTTM) : undefined,
        profitMargin: data.ProfitMargin ? parseFloat(data.ProfitMargin) : undefined,
        operatingMargin: data.OperatingMarginTTM ? parseFloat(data.OperatingMarginTTM) : undefined,
        returnOnEquity: data.ReturnOnEquityTTM ? parseFloat(data.ReturnOnEquityTTM) : undefined,
        returnOnAssets: data.ReturnOnAssetsTTM ? parseFloat(data.ReturnOnAssetsTTM) : undefined,
        debtToEquity: data.DebtToEquity ? parseFloat(data.DebtToEquity) : undefined,
        currentRatio: data.CurrentRatio ? parseFloat(data.CurrentRatio) : undefined,
        bookValue: data.BookValue ? parseFloat(data.BookValue) : undefined,
        earningsGrowth: data.EarningsGrowth ? parseFloat(data.EarningsGrowth) : undefined,
        revenueGrowth: data.RevenueGrowthTTM ? parseFloat(data.RevenueGrowthTTM) : undefined,
        dividendDate: data.DividendDate,
        exDividendDate: data.ExDividendDate,
        sharesOutstanding: data.SharesOutstanding ? parseFloat(data.SharesOutstanding) : undefined,
        sharesFloat: data.SharesFloat ? parseFloat(data.SharesFloat) : undefined,
      };
    },
    {
      revalidate: 3600, // 1 hour
      tags: [`overview-${symbol}`, 'alphavantage'],
      useRedis: true,
    }
  );

  return cachedResult.data;
}

/**
 * Get earnings data (annual and quarterly)
 */
export async function getEarningsData(symbol: string): Promise<EarningsData | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    return null;
  }

  const cachedResult = await cachedRouteHandler(
    `earnings:${symbol}`,
    async () => {
      const url = `${BASE_URL}?function=EARNINGS&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Note || data['Error Message'] || !data.symbol) {
        return null;
      }

      return {
        symbol: data.symbol,
        annualEarnings: data.annualEarnings || [],
        quarterlyEarnings: data.quarterlyEarnings || [],
      };
    },
    {
      revalidate: 86400, // 24 hours
      tags: [`earnings-${symbol}`, 'alphavantage'],
      useRedis: true,
    }
  );

  return cachedResult.data;
}

/**
 * Get balance sheet data
 */
export async function getBalanceSheet(symbol: string): Promise<BalanceSheetData | null> {
  if (!ALPHA_VANTAGE_API_KEY) {
    return null;
  }

  const cachedResult = await cachedRouteHandler(
    `balance-sheet:${symbol}`,
    async () => {
      const url = `${BASE_URL}?function=BALANCE_SHEET&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.Note || data['Error Message'] || !data.symbol) {
        return null;
      }

      return {
        symbol: data.symbol,
        annualReports: data.annualReports || [],
      };
    },
    {
      revalidate: 86400, // 24 hours
      tags: [`balance-sheet-${symbol}`, 'alphavantage'],
      useRedis: true,
    }
  );

  return cachedResult.data;
}

/**
 * Get comprehensive company data (all endpoints combined)
 */
export async function getComprehensiveCompanyData(symbol: string): Promise<{
  quote: EnhancedQuoteData | null;
  overview: EnhancedCompanyOverview | null;
  earnings: EarningsData | null;
  balanceSheet: BalanceSheetData | null;
}> {
  // Fetch all data in parallel
  const [quote, overview, earnings, balanceSheet] = await Promise.allSettled([
    getEnhancedQuote(symbol),
    getEnhancedCompanyOverview(symbol),
    getEarningsData(symbol),
    getBalanceSheet(symbol),
  ]);

  return {
    quote: quote.status === 'fulfilled' ? quote.value : null,
    overview: overview.status === 'fulfilled' ? overview.value : null,
    earnings: earnings.status === 'fulfilled' ? earnings.value : null,
    balanceSheet: balanceSheet.status === 'fulfilled' ? balanceSheet.value : null,
  };
}

