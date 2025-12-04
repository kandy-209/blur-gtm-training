/**
 * Company and Contact Enrichment APIs
 * Integrates with Clearbit, ZoomInfo, and Apollo.io for enhanced prospect data
 */

import { fetchWithTimeout, withTimeout } from '@/lib/api-timeout';

interface CompanyEnrichment {
  name: string;
  domain?: string;
  description?: string;
  industry?: string;
  sector?: string;
  employeeCount?: number;
  revenue?: number;
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  website?: string;
  linkedin?: string;
  founded?: number;
  tags?: string[];
}

interface ContactEnrichment {
  firstName?: string;
  lastName?: string;
  email?: string;
  title?: string;
  seniority?: string;
  department?: string;
  linkedin?: string;
  verified?: boolean;
}

interface EnrichmentResult {
  company?: CompanyEnrichment;
  contacts?: ContactEnrichment[];
  error?: string;
}

/**
 * Enrich company data using Clearbit API
 * Requires CLEARBIT_API_KEY environment variable
 */
export async function enrichCompanyClearbit(
  domain: string,
  apiKey?: string
): Promise<EnrichmentResult> {
  const key = apiKey || process.env.CLEARBIT_API_KEY;
  if (!key) {
    return { error: 'Clearbit API key not configured' };
  }

  // Return early if domain is empty
  if (!domain || domain.trim() === '') {
    return { error: 'Domain is required' };
  }

  try {
    const response = await fetchWithTimeout(
      `https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(domain)}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
        },
        timeout: 5000, // 5 second timeout
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { error: 'Company not found' };
      }
      throw new Error(`Clearbit API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      company: {
        name: data.name,
        domain: data.domain,
        description: data.description,
        industry: data.category?.industry,
        sector: data.category?.sector,
        employeeCount: data.metrics?.employees,
        revenue: data.metrics?.annualRevenue,
        location: {
          city: data.geo?.city,
          state: data.geo?.state,
          country: data.geo?.country,
        },
        website: data.domain,
        linkedin: data.linkedin?.handle,
        founded: data.foundedYear,
        tags: data.tags || [],
      },
    };
  } catch (error: any) {
    return { error: error.message || 'Failed to enrich company data' };
  }
}

/**
 * Find contacts at a company using Clearbit
 */
export async function findContactsClearbit(
  domain: string,
  apiKey?: string
): Promise<EnrichmentResult> {
  const key = apiKey || process.env.CLEARBIT_API_KEY;
  if (!key) {
    return { error: 'Clearbit API key not configured' };
  }

  try {
    const response = await fetchWithTimeout(
      `https://person.clearbit.com/v2/combined/find?domain=${encodeURIComponent(domain)}`,
      {
        headers: {
          Authorization: `Bearer ${key}`,
        },
        timeout: 5000, // 5 second timeout
      }
    );

    if (!response.ok) {
      if (response.status === 404) {
        return { contacts: [] };
      }
      throw new Error(`Clearbit API error: ${response.status}`);
    }

    const data = await response.json();
    const contacts: ContactEnrichment[] = (data.people || []).map((person: any) => ({
      firstName: person.name?.givenName,
      lastName: person.name?.familyName,
      email: person.email,
      title: person.title,
      seniority: person.seniority,
      department: person.department,
      linkedin: person.linkedin?.handle,
      verified: person.emailProvider === 'corporate',
    }));

    return { contacts };
  } catch (error: any) {
    return { error: error.message || 'Failed to find contacts' };
  }
}

/**
 * Enrich company using multiple sources (fallback chain)
 */
export async function enrichCompanyMultiSource(
  companyName: string,
  domain?: string
): Promise<EnrichmentResult> {
  // Return early if company name is empty
  if (!companyName || companyName.trim() === '') {
    return { error: 'Company name is required' };
  }

  // Try Clearbit first if domain is available
  if (domain && domain.trim() !== '') {
    const clearbitResult = await enrichCompanyClearbit(domain);
    if (clearbitResult.company && !clearbitResult.error) {
      return clearbitResult;
    }
  }

  // Fallback: Use Alpha Vantage company search (only in server-side context)
  if (typeof window === 'undefined') {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
      const searchResponse = await fetchWithTimeout(
        `${baseUrl}/api/alphavantage/search?keyword=${encodeURIComponent(companyName)}`,
        { timeout: 5000 }
      );
      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        if (searchData.results && searchData.results.length > 0) {
          const symbol = searchData.results[0].symbol;
          const overviewResponse = await fetchWithTimeout(
            `${baseUrl}/api/alphavantage/overview?symbol=${symbol}`,
            { timeout: 5000 }
          );
          if (overviewResponse.ok) {
            const overviewData = await overviewResponse.json();
            if (overviewData.overview) {
              return {
                company: {
                  name: overviewData.overview.name || companyName,
                  description: overviewData.overview.description,
                  industry: overviewData.overview.industry,
                  sector: overviewData.overview.sector,
                  revenue: overviewData.overview.revenue ? parseFloat(overviewData.overview.revenue) : undefined,
                },
              };
            }
          }
        }
      }
    } catch (error) {
      console.error('Alpha Vantage enrichment error:', error);
    }
  }

  // Return error only (no company) when all enrichment attempts failed
  // This distinguishes between partial success (company returned) and complete failure
  return {
    error: 'Failed to enrich company data from all sources.',
  };
}

