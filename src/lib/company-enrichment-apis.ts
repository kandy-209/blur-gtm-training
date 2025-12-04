/**
 * Company Enrichment APIs
 * Multiple free/affordable APIs for comprehensive company data
 */

import { cachedRouteHandler } from './next-cache-wrapper';
import { retryWithBackoff } from './error-recovery';
import { log } from './logger';

// Free APIs (no key required for basic tier)
const CLEARBIT_FREE_API = 'https://company.clearbit.com/v2/companies/find';
const CLEARBIT_API_KEY = process.env.CLEARBIT_API_KEY; // Optional, free tier available

/**
 * Company enrichment data from multiple sources
 */
export interface EnrichedCompanyData {
  // Basic info
  name: string;
  domain?: string;
  description?: string;
  
  // Company metrics
  employeeCount?: number;
  employeeRange?: string; // e.g., "51-200"
  revenue?: number;
  revenueRange?: string; // e.g., "$10M-$50M"
  funding?: number;
  fundingTotal?: number;
  lastFundingDate?: string;
  valuation?: number;
  
  // Location
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  
  // Industry
  industry?: string;
  sector?: string;
  subIndustry?: string;
  
  // Technology stack (from BuiltWith)
  technologies?: string[];
  techCategories?: string[];
  
  // Social/Web presence
  website?: string;
  linkedin?: string;
  twitter?: string;
  facebook?: string;
  crunchbase?: string;
  
  // Financial health
  yearFounded?: number;
  isPublic?: boolean;
  ticker?: string;
  
  // Growth indicators
  growthRate?: number;
  employeeGrowth?: number;
  
  // Data sources
  dataSources: string[];
}

/**
 * Enrich company data from Clearbit (free tier available)
 */
export async function enrichFromClearbit(domain: string): Promise<Partial<EnrichedCompanyData> | null> {
  if (!domain) return null;

  const cachedResult = await cachedRouteHandler(
    `clearbit:${domain}`,
    async () => {
      const url = `${CLEARBIT_FREE_API}?domain=${encodeURIComponent(domain)}`;
      const headers: HeadersInit = {
        'Accept': 'application/json',
      };
      
      // Add API key if available (for higher rate limits)
      if (CLEARBIT_API_KEY) {
        headers['Authorization'] = `Bearer ${CLEARBIT_API_KEY}`;
      }

      const apiResult = await retryWithBackoff(
        async () => {
          const response = await fetch(url, { headers });
          
          if (response.status === 404) {
            return null; // Company not found
          }
          
          if (!response.ok) {
            throw new Error(`Clearbit API error: ${response.status}`);
          }

          return await response.json();
        },
        {
          maxRetries: 2,
          retryDelay: 500,
        }
      );

      if (!apiResult.success || !apiResult.data) {
        return null;
      }

      const data = apiResult.data;
      
      return {
        name: data.name,
        domain: data.domain,
        description: data.description,
        employeeCount: data.metrics?.employees,
        employeeRange: data.metrics?.employeesRange,
        revenue: data.metrics?.annualRevenue,
        location: data.geo?.city,
        city: data.geo?.city,
        state: data.geo?.state,
        country: data.geo?.country,
        industry: data.category?.industry,
        sector: data.category?.sector,
        subIndustry: data.category?.subIndustry,
        website: data.domain,
        linkedin: data.linkedin?.handle,
        twitter: data.twitter?.handle,
        facebook: data.facebook?.handle,
        yearFounded: data.foundedYear,
        dataSources: ['clearbit'],
      };
    },
    {
      revalidate: 86400, // 24 hours
      tags: [`clearbit-${domain}`, 'company-enrichment'],
      useRedis: true,
    }
  );

  return cachedResult.data;
}

/**
 * Multi-source company enrichment
 */
export async function enrichCompanyMultiSource(
  companyName: string,
  domain?: string,
  ticker?: string
): Promise<EnrichedCompanyData> {
  const enriched: Partial<EnrichedCompanyData> = {
    name: companyName,
    domain,
    dataSources: [],
  };

  // Try Clearbit if domain available
  if (domain) {
    try {
      const clearbitData = await enrichFromClearbit(domain);
      if (clearbitData) {
        Object.assign(enriched, clearbitData);
        enriched.dataSources?.push('clearbit');
      }
    } catch (error) {
      log.warn('Clearbit enrichment failed', { 
        domain, 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  }

  return enriched as EnrichedCompanyData;
}

