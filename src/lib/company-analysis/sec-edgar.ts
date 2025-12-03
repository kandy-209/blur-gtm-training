/**
 * SEC EDGAR API integration for fetching 10-K filings
 * 
 * SEC EDGAR API Documentation: https://www.sec.gov/edgar/sec-api-documentation
 * Rate Limits: 10 requests per second
 */

const SEC_API_BASE = 'https://data.sec.gov';
const USER_AGENT = 'CursorGTMTraining/1.0 (contact@cursor.com)'; // SEC requires user agent

interface SECCompanyTicker {
  cik: string;
  name: string;
  ticker: string;
}

interface SECFiling {
  accessionNumber: string;
  filingDate: string;
  reportDate: string;
  acceptanceDateTime: string;
  act: string;
  form: string;
  fileNumber: string;
  filmNumber: string;
  items: string;
  size: number;
  isXBRL: number;
  isInlineXBRL: number;
  primaryDocument: string;
  primaryDocDescription: string;
}

/**
 * Search for company by ticker symbol
 */
export async function searchCompanyByTicker(ticker: string): Promise<SECCompanyTicker | null> {
  try {
    // SEC provides a company tickers JSON file
    const response = await fetch(`${SEC_API_BASE}/files/company_tickers.json`, {
      headers: {
        'User-Agent': USER_AGENT,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`SEC API error: ${response.status}`);
    }

    const data = await response.json();
    const tickerUpper = ticker.toUpperCase();
    
    // Find company by ticker
    for (const [key, company] of Object.entries(data)) {
      if ((company as SECCompanyTicker).ticker === tickerUpper) {
        return company as SECCompanyTicker;
      }
    }

    return null;
  } catch (error) {
    console.error('Error searching company:', error);
    return null;
  }
}

/**
 * Get company filings (10-K, 10-Q, etc.)
 */
export async function getCompanyFilings(cik: string, formType: string = '10-K'): Promise<SECFiling[]> {
  try {
    // Pad CIK to 10 digits
    const paddedCik = cik.padStart(10, '0');
    
    const response = await fetch(
      `${SEC_API_BASE}/submissions/CIK${paddedCik}.json`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`SEC API error: ${response.status}`);
    }

    const data = await response.json();
    const filings = data.filings?.recent || [];
    
    // Filter by form type and return most recent
    return filings
      .filter((filing: SECFiling) => filing.form === formType)
      .slice(0, 5) // Get last 5 filings
      .map((filing: SECFiling, index: number) => ({
        ...filing,
        cik: paddedCik,
      }));
  } catch (error) {
    console.error('Error fetching filings:', error);
    return [];
  }
}

/**
 * Extract financial metrics from 10-K filing using AI
 * This would typically parse the XBRL data or use AI to extract from HTML/text
 */
export async function extractFinancialMetricsFromFiling(
  filing: SECFiling,
  cik: string
): Promise<Partial<import('./types').FinancialMetrics> | null> {
  // In production, this would:
  // 1. Fetch the actual filing document
  // 2. Parse XBRL data if available
  // 3. Use AI to extract metrics from text/HTML
  // 4. Return structured financial metrics
  
  // For now, return null - this will be implemented with AI extraction
  return null;
}



