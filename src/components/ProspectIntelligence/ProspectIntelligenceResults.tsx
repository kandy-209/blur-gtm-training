'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building2, Code, Briefcase, Users, BookOpen, TrendingUp, Copy, Download, Mail, Target, AlertCircle, CheckCircle2, Zap, MessageSquare } from 'lucide-react';
import { ICPScoreCard } from './ICPScoreCard';
import { TechStackCard } from './TechStackCard';
import { HiringCard } from './HiringCard';
import { EmailGenerator } from './EmailGenerator';
import ProspectIntelligenceEnhancer from '@/components/ProspectIntelligenceEnhancer';
import type { ProspectIntelligence } from '@/lib/prospect-intelligence/types';
import { useState } from 'react';

interface ProspectIntelligenceResultsProps {
  data: ProspectIntelligence;
}

export function ProspectIntelligenceResults({ data }: ProspectIntelligenceResultsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (format: 'json' | 'csv' = 'json') => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prospect-intelligence-${data.companyName.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else {
      // CSV export
      const csvRows: string[] = [];
      
      // Header row
      csvRows.push([
        'Company Name',
        'Website',
        'Industry',
        'B2B SaaS',
        'Primary Framework',
        'ICP Score',
        'Priority',
        'Engineering Roles',
        'Has Engineering Blog',
        'Company Description',
        'Positive Signals',
        'Negative Signals',
        'Talking Points',
      ].join(','));
      
      // Data row
      csvRows.push([
        `"${data.companyName.replace(/"/g, '""')}"`,
        `"${data.companyWebsite.replace(/"/g, '""')}"`,
        `"${data.industry.replace(/"/g, '""')}"`,
        data.isB2BSaaS ? 'Yes' : 'No',
        `"${(data.techStack.primaryFramework || 'Unknown').replace(/"/g, '""')}"`,
        data.icpScore.overallScore.toString(),
        data.icpScore.priorityLevel,
        (data.hiring.engineeringRoleCount || 0).toString(),
        data.engineeringCulture.hasEngineeringBlog ? 'Yes' : 'No',
        `"${data.companyDescription.replace(/"/g, '""')}"`,
        `"${data.icpScore.positiveSignals.join('; ').replace(/"/g, '""')}"`,
        `"${data.icpScore.negativeSignals.join('; ').replace(/"/g, '""')}"`,
        `"${data.icpScore.recommendedTalkingPoints.join('; ').replace(/"/g, '""')}"`,
      ].join(','));
      
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `prospect-intelligence-${data.companyName.replace(/\s+/g, '-').toLowerCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Calculate key insights for sales
  const keyInsights = {
    isHotLead: data.icpScore.overallScore >= 8,
    hasUrgentHiring: data.hiring.engineeringRoleCount && data.hiring.engineeringRoleCount >= 5,
    modernStack: data.techStack.isModernStack,
    hasBlog: data.engineeringCulture.hasEngineeringBlog,
    b2bSaaS: data.isB2BSaaS,
  };

  const browserbaseValueProps = [
    ...data.icpScore.recommendedTalkingPoints,
    data.techStack.primaryFramework && `Seamless integration with ${data.techStack.primaryFramework}`,
    data.hiring.hasOpenEngineeringRoles && `Perfect timing - you're scaling your engineering team`,
    data.techStack.isModernStack && `Cloud-based browser automation for modern JavaScript stacks`,
  ].filter(Boolean) as string[];

  return (
    <div className="space-y-6">
      {/* Hero Section - Key Info at a Glance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Company Overview & ICP Score */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-2 border-gray-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Building2 className="h-6 w-6" />
                    {data.companyName}
                  </CardTitle>
                  <CardDescription className="mt-2 text-base">
                    {data.companyDescription}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy Data
                      </>
                    )}
                  </Button>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleDownload('json')}>
                      <Download className="h-4 w-4 mr-2" />
                      JSON
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDownload('csv')}>
                      <Download className="h-4 w-4 mr-2" />
                      CSV
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Industry</div>
                  <div className="font-semibold">{data.industry}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Type</div>
                  <div className="font-semibold">
                    {data.isB2BSaaS ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        B2B SaaS
                      </Badge>
                    ) : (
                      <Badge variant="outline">Other</Badge>
                    )}
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Tech Stack</div>
                  <div className="font-semibold">{data.techStack.primaryFramework || 'Unknown'}</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Engineering Roles</div>
                  <div className="font-semibold">{data.hiring.engineeringRoleCount || 0}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* ICP Score - Prominent Display */}
          <ICPScoreCard icpScore={data.icpScore} />

          {/* AI-Powered Prospect Insights */}
          <ProspectIntelligenceEnhancer
            companyData={{
              name: data.companyName,
              techStack: data.techStack?.technologies?.map((t: any) => t.name || t) || [],
              hiring: data.hiring,
              financials: data.financials,
              news: data.news,
            }}
          />

          {/* Key Insights for Sales */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-600" />
                Key Insights for Outreach
              </CardTitle>
              <CardDescription>
                Quick facts to guide your conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {keyInsights.isHotLead && (
                  <div className="flex items-center gap-2 p-2 bg-green-100 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-900">Hot Lead</span>
                  </div>
                )}
                {keyInsights.hasUrgentHiring && (
                  <div className="flex items-center gap-2 p-2 bg-orange-100 rounded-lg">
                    <Briefcase className="h-4 w-4 text-orange-600" />
                    <span className="text-sm font-semibold text-orange-900">Urgent Hiring</span>
                  </div>
                )}
                {keyInsights.modernStack && (
                  <div className="flex items-center gap-2 p-2 bg-purple-100 rounded-lg">
                    <Code className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-semibold text-purple-900">Modern Stack</span>
                  </div>
                )}
                {keyInsights.hasBlog && (
                  <div className="flex items-center gap-2 p-2 bg-indigo-100 rounded-lg">
                    <BookOpen className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-indigo-900">Tech Blog</span>
                  </div>
                )}
                {keyInsights.b2bSaaS && (
                  <div className="flex items-center gap-2 p-2 bg-teal-100 rounded-lg">
                    <Target className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-semibold text-teal-900">B2B SaaS</span>
                  </div>
                )}
                {data.icpScore.priorityLevel === 'high' && (
                  <div className="flex items-center gap-2 p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-900">High Priority</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Email Generator */}
        <div>
          <EmailGenerator prospectData={data} />
        </div>
      </div>

      {/* Browserbase Value Props */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-purple-600" />
            Browserbase Talking Points
          </CardTitle>
          <CardDescription>
            Key value propositions tailored to this prospect
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {browserbaseValueProps.map((point, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-100">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 text-sm">{point}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Tabs */}
      <Tabs defaultValue="tech" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="tech">
            <Code className="h-4 w-4 mr-2" />
            Tech Stack
          </TabsTrigger>
          <TabsTrigger value="hiring">
            <Briefcase className="h-4 w-4 mr-2" />
            Hiring
          </TabsTrigger>
          <TabsTrigger value="culture">
            <BookOpen className="h-4 w-4 mr-2" />
            Culture
          </TabsTrigger>
          <TabsTrigger value="size">
            <Users className="h-4 w-4 mr-2" />
            Company Size
          </TabsTrigger>
          <TabsTrigger value="talking-points">
            <TrendingUp className="h-4 w-4 mr-2" />
            Talking Points
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tech" className="mt-4">
          <TechStackCard techStack={data.techStack} thirdPartyTools={data.thirdPartyTools} />
        </TabsContent>

        <TabsContent value="hiring" className="mt-4">
          <HiringCard hiring={data.hiring} />
        </TabsContent>

        <TabsContent value="culture" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Engineering Culture
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.engineeringCulture.hasEngineeringBlog ? (
                <div>
                  <div className="font-semibold mb-2">Engineering Blog</div>
                  {data.engineeringCulture.engineeringBlogUrl && (
                    <a
                      href={data.engineeringCulture.engineeringBlogUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      {data.engineeringCulture.engineeringBlogUrl}
                    </a>
                  )}
                  {data.engineeringCulture.recentBlogTopics.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-semibold mb-2">Recent Topics</div>
                      <ul className="space-y-1">
                        {data.engineeringCulture.recentBlogTopics.map((topic, idx) => (
                          <li key={idx} className="text-sm text-gray-600">• {topic}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-600">No engineering blog detected</div>
              )}

              {data.engineeringCulture.developmentPractices.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Development Practices</div>
                  <div className="flex flex-wrap gap-2">
                    {data.engineeringCulture.developmentPractices.map((practice, idx) => (
                      <Badge key={idx} variant="outline">{practice}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {data.engineeringCulture.techCultureHighlights.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Culture Highlights</div>
                  <ul className="space-y-2">
                    {data.engineeringCulture.techCultureHighlights.map((highlight, idx) => (
                      <li key={idx} className="text-sm text-gray-600">"{highlight}"</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.engineeringCulture.opensourcePresence && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Open Source Presence
                </Badge>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="size" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Company Size
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.companySize.estimatedEmployeeRange ? (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">Estimated Employees</div>
                  <div className="text-2xl font-bold">{data.companySize.estimatedEmployeeRange}</div>
                </div>
              ) : (
                <div className="text-gray-600">Employee count not available</div>
              )}

              {data.companySize.growthIndicators.length > 0 && (
                <div>
                  <div className="font-semibold mb-2">Growth Indicators</div>
                  <ul className="space-y-1">
                    {data.companySize.growthIndicators.map((indicator, idx) => (
                      <li key={idx} className="text-sm text-gray-600">• {indicator}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.companySize.fundingInfo && (
                <div>
                  <div className="font-semibold mb-2">Funding</div>
                  <div className="text-sm text-gray-600">{data.companySize.fundingInfo}</div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="talking-points" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Recommended Talking Points
              </CardTitle>
              <CardDescription>
                Key points to mention in outreach
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data.icpScore.recommendedTalkingPoints.length > 0 ? (
                <ul className="space-y-3">
                  {data.icpScore.recommendedTalkingPoints.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-black text-white flex items-center justify-center text-xs font-bold">
                        {idx + 1}
                      </div>
                      <div className="flex-1 text-sm">{point}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-gray-600">No specific talking points generated</div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
