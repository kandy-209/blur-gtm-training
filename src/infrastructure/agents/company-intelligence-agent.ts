/**
 * Company Intelligence Agent - Multi-API Analysis
 * Integrates Alpha Vantage, Clearbit, GitHub, and data science
 */

import { CompanyIntelligence, CompanyIntelligenceData } from '@/domain/value-objects/company-intelligence';
import { fetchAlphaVantageData } from '@/lib/company-analysis/financial-data';
import { enrichCompanyClearbit, findContactsClearbit } from '@/lib/sales-enhancements/company-enrichment';
import { getLLMProvider } from '@/lib/company-analysis/llm-provider';

export interface CompanyInfo {
  domain: string;
  githubRepo?: string;
  companyName?: string;
  ticker?: string;
}

export class CompanyIntelligenceAgent {
  /**
   * Analyze company from multiple sources
   * Integrates: Alpha Vantage, Clearbit, GitHub, LLM analysis
   */
  async analyze(info: CompanyInfo): Promise<CompanyIntelligence> {
    const sources: string[] = [];
    const data: Partial<CompanyIntelligenceData> = {
      company: {
        name: info.companyName || info.domain,
        domain: info.domain,
        industry: '',
        sector: '',
        size: 'startup',
        founded: null,
        headquarters: null,
      },
      financial: {
        revenue: null,
        revenueGrowth: null,
        employeeCount: null,
        marketCap: null,
        rndSpending: null,
        estimatedEngineeringCost: null,
        estimatedEngineeringHeadcount: null,
      },
      codebase: null,
      contacts: [],
      insights: {
        painPoints: [],
        priorities: [],
        buyingSignals: [],
        concerns: [],
        decisionFactors: {
          technical: 0.6,
          business: 0.3,
          team: 0.1,
        },
      },
      sources: [],
      analyzedAt: new Date(),
    };

    // 1. Fetch from Clearbit (company enrichment)
    try {
      const clearbitData = await enrichCompanyClearbit(info.domain);
      if (clearbitData.company) {
        data.company = {
          ...(data.company || {}),
          domain: info.domain,
          name: clearbitData.company.name || data.company?.name || '',
          industry: clearbitData.company.industry || data.company?.industry || '',
          sector: clearbitData.company.sector || data.company?.sector || '',
          size: clearbitData.company.employeeCount ? this.inferSize(clearbitData.company.employeeCount) : (data.company?.size || 'startup'),
          founded: clearbitData.company.founded || data.company?.founded || null,
          headquarters: typeof clearbitData.company.location === 'string' ? clearbitData.company.location : (typeof data.company?.headquarters === 'string' ? data.company.headquarters : null),
        };
        sources.push('Clearbit');
      }

      // Get contacts
      const contactsData = await findContactsClearbit(info.domain);
      if (contactsData.contacts) {
        data.contacts = contactsData.contacts.map(c => ({
          name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
          title: c.title || '',
          email: c.email || '',
          department: c.department || '',
          seniority: c.seniority || '',
          linkedin: c.linkedin,
        }));
      }
    } catch (error) {
      console.error('Clearbit enrichment error:', error);
    }

    // 2. Fetch financial data from Alpha Vantage (if ticker available)
    if (info.ticker) {
      try {
        const financialData = await fetchAlphaVantageData(info.ticker);
        if (financialData) {
          const existingFinancial = data.financial || {
            revenue: null,
            revenueGrowth: null,
            employeeCount: null,
            marketCap: null,
            rndSpending: null,
            estimatedEngineeringCost: null,
            estimatedEngineeringHeadcount: null,
          };
          data.financial = {
            revenue: (financialData as any).revenue ?? existingFinancial.revenue ?? null,
            revenueGrowth: (financialData as any).revenueGrowth ?? existingFinancial.revenueGrowth ?? null,
            rndSpending: (financialData as any).rndSpending ?? existingFinancial.rndSpending ?? null,
            employeeCount: existingFinancial.employeeCount ?? null,
            marketCap: existingFinancial.marketCap ?? null,
            estimatedEngineeringCost: existingFinancial.estimatedEngineeringCost ?? null,
            estimatedEngineeringHeadcount: existingFinancial.estimatedEngineeringHeadcount ?? null,
          };
          sources.push('Alpha Vantage');
        }
      } catch (error) {
        console.error('Alpha Vantage fetch error:', error);
      }
    }

    // 3. Analyze GitHub repo (if provided)
    if (info.githubRepo) {
      try {
        const codebaseData = await this.analyzeGitHubRepo(info.githubRepo);
        if (codebaseData) {
          data.codebase = codebaseData;
          sources.push('GitHub');
        }
      } catch (error) {
        console.error('GitHub analysis error:', error);
      }
    }

    // 4. Generate insights using LLM
    try {
      const insights = await this.generateInsights(data);
      if (insights) {
        data.insights = insights;
        sources.push('LLM Analysis');
      }
    } catch (error) {
      console.error('LLM insights generation error:', error);
    }

    // Estimate engineering metrics if we have financial data
    if (data.financial?.revenue) {
      const estimates = this.estimateEngineeringMetrics(data);
      data.financial.estimatedEngineeringCost = estimates.cost;
      data.financial.estimatedEngineeringHeadcount = estimates.headcount;
    }

    return new CompanyIntelligence({
      ...data,
      sources,
    } as CompanyIntelligenceData);
  }

  private inferSize(employees?: number): 'startup' | 'mid-size' | 'enterprise' {
    if (!employees) return 'startup';
    if (employees < 100) return 'startup';
    if (employees < 1000) return 'mid-size';
    return 'enterprise';
  }

  private async analyzeGitHubRepo(repoUrl: string): Promise<CompanyIntelligenceData['codebase'] | null> {
    // Extract owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;

    const [, owner, repo] = match;

    try {
      // Fetch repo data from GitHub API
      const repoResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
        },
      });

      if (!repoResponse.ok) return null;

      const repoData = await repoResponse.json();

      // Fetch languages
      const languagesResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
        },
      });

      const languages = languagesResponse.ok ? await languagesResponse.json() : {};

      // Fetch contributors
      const contributorsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/contributors?per_page=1`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          ...(process.env.GITHUB_TOKEN ? { 'Authorization': `token ${process.env.GITHUB_TOKEN}` } : {}),
        },
      });

      const contributors = contributorsResponse.ok 
        ? parseInt(contributorsResponse.headers.get('link')?.match(/page=(\d+)>; rel="last"/)?.[1] || '0')
        : 0;

      return {
        repositories: [{
          name: repo,
          url: repoUrl,
          languages: Object.keys(languages),
          stars: repoData.stargazers_count || 0,
          contributors: contributors,
        }],
        techStack: {
          languages: Object.keys(languages),
          frameworks: [],
          infrastructure: [],
          databases: [],
          tools: [],
          ciCd: [],
        },
        architecture: {
          type: 'monolith',
          complexity: 'medium',
          patterns: [],
        },
        codeQuality: {
          testCoverage: 0,
          codeComplexity: 0,
          documentationScore: 0,
          maintainabilityIndex: 0,
        },
        teamMetrics: {
          totalContributors: contributors,
          activeContributors: Math.floor(contributors * 0.3),
          commitsPerWeek: 0,
          prsPerWeek: 0,
          averagePrSize: 0,
          averageReviewTime: 0,
          deploymentFrequency: 'weekly',
        },
      };
    } catch (error) {
      console.error('GitHub API error:', error);
      return null;
    }
  }

  private async generateInsights(data: Partial<CompanyIntelligenceData>): Promise<CompanyIntelligenceData['insights'] | null> {
    const llm = getLLMProvider();
    if (!llm) {
      // Rule-based insights
      return {
        painPoints: ['Scalability', 'Developer productivity', 'Code quality'],
        priorities: ['Innovation', 'Efficiency', 'Team collaboration'],
        buyingSignals: [],
        concerns: ['Cost', 'Implementation complexity', 'Team adoption'],
        decisionFactors: {
          technical: 0.6,
          business: 0.3,
          team: 0.1,
        },
      };
    }

    const prompt = `Analyze this company and provide insights:

Company: ${data.company?.name}
Industry: ${data.company?.industry}
Size: ${data.company?.size}
Revenue: ${data.financial?.revenue ? `$${(data.financial.revenue / 1000000).toFixed(0)}M` : 'Unknown'}
Tech Stack: ${data.codebase?.techStack.languages.join(', ') || 'Unknown'}

Provide insights about:
1. Likely pain points
2. Priorities
3. Potential buying signals
4. Concerns
5. Decision factors (technical vs business vs team)

Return JSON with these fields.`;

    try {
      const response = await llm.analyzeCompany(
        prompt,
        'You are a sales intelligence analyst. Provide actionable insights for sales teams.'
      );

      if (response && response.content) {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }
    } catch (error) {
      console.error('LLM insights error:', error);
    }

    return null;
  }

  private estimateEngineeringMetrics(data: Partial<CompanyIntelligenceData>): { cost: number; headcount: number } {
    if (!data.financial?.revenue || !data.company?.size) {
      return { cost: 0, headcount: 0 };
    }

    // Estimate engineering headcount based on company size and revenue
    let estimatedHeadcount = 0;
    if (data.company.size === 'startup') {
      estimatedHeadcount = Math.floor((data.financial.revenue / 1000000) * 2); // ~2 engineers per $1M revenue
    } else if (data.company.size === 'mid-size') {
      estimatedHeadcount = Math.floor((data.financial.revenue / 1000000) * 1.5);
    } else {
      estimatedHeadcount = Math.floor((data.financial.revenue / 1000000) * 1);
    }

    // Estimate cost (average $150k per engineer)
    const estimatedCost = estimatedHeadcount * 150000;

    return {
      cost: estimatedCost,
      headcount: estimatedHeadcount,
    };
  }
}

