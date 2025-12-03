/**
 * Company and Contact Enrichment APIs
 * Integrates with Clearbit, ZoomInfo, and Apollo.io for enhanced prospect data
 */

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

  try {
    const response = await fetch(`https://company.clearbit.com/v2/companies/find?domain=${encodeURIComponent(domain)}`, {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

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
    const response = await fetch(`https://person.clearbit.com/v2/combined/find?domain=${encodeURIComponent(domain)}`, {
      headers: {
        Authorization: `Bearer ${key}`,
      },
    });

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
  // Try Clearbit first if domain is available
  if (domain) {
    const clearbitResult = await enrichCompanyClearbit(domain);
    if (clearbitResult.company && !clearbitResult.error) {
      return clearbitResult;
    }
  }

  // Fallback: Use Alpha Vantage company search
  try {
    const searchResponse = await fetch(`/api/alphavantage/search?keyword=${encodeURIComponent(companyName)}`);
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.results && searchData.results.length > 0) {
        const symbol = searchData.results[0].symbol;
        const overviewResponse = await fetch(`/api/alphavantage/overview?symbol=${symbol}`);
        if (overviewResponse.ok) {
          const overviewData = await overviewResponse.json();
          if (overviewData.overview) {
            return {
              company: {
                name: overviewData.overview.name,
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
    // Silent fallback
  }

  return { error: 'Could not enrich company data from available sources' };
}

