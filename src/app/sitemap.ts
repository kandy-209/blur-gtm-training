import { MetadataRoute } from 'next'
import { scenarios } from '@/data/scenarios'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://blursalestrainer.com'
  const now = new Date()
  
  // Core pages with high priority for SEO
  const corePages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/scenarios`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/roi-calculator`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/sales-skills`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/analytics`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/prospect-intelligence`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/enterprise`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/company-lookup`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/financial-dashboard`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sales-training`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]
  
  // Dynamic roleplay scenario pages - critical for SEO discovery
  const scenarioPages: MetadataRoute.Sitemap = scenarios.map((scenario) => ({
    url: `${baseUrl}/roleplay/${scenario.id}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))
  
  return [...corePages, ...scenarioPages]
}
