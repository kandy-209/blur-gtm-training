'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  Mail, 
  Phone, 
  MessageSquare, 
  Target, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  PlayCircle
} from 'lucide-react';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProspectResearch from '@/components/ProspectResearch';
import EmailTemplateGenerator from '@/components/EmailTemplateGenerator';

interface SkillModule {
  id: string;
  title: string;
  description: string;
  duration: string;
  topics: string[];
  practiceLink?: string;
}

const outboundModules: SkillModule[] = [
  {
    id: 'outbound-1',
    title: 'Cold Outreach Fundamentals',
    description: 'Learn how to craft effective cold emails and LinkedIn messages',
    duration: '30 min',
    topics: [
      'Subject line best practices',
      'Personalization techniques',
      'Value proposition crafting',
      'Call-to-action optimization',
      'Follow-up sequences'
    ],
  },
  {
    id: 'outbound-2',
    title: 'Cold Calling Mastery',
    description: 'Master the art of cold calling and phone prospecting',
    duration: '45 min',
    topics: [
      'Opening statements',
      'Handling gatekeepers',
      'Objection handling',
      'Closing techniques',
      'Call scripts and templates'
    ],
  },
  {
    id: 'outbound-3',
    title: 'LinkedIn Outreach',
    description: 'Effective LinkedIn prospecting and connection strategies',
    duration: '25 min',
    topics: [
      'Profile optimization',
      'Connection requests',
      'InMail best practices',
      'Engagement strategies',
      'Content sharing'
    ],
  },
];

const inboundModules: SkillModule[] = [
  {
    id: 'inbound-1',
    title: 'Lead Qualification',
    description: 'Learn BANT and other qualification frameworks',
    duration: '35 min',
    topics: [
      'BANT framework',
      'Discovery questions',
      'Pain point identification',
      'Budget qualification',
      'Timeline assessment'
    ],
  },
  {
    id: 'inbound-2',
    title: 'Discovery Calls',
    description: 'Master the discovery process to understand customer needs',
    duration: '40 min',
    topics: [
      'Call structure',
      'Question frameworks',
      'Active listening',
      'Needs assessment',
      'Next steps planning'
    ],
  },
  {
    id: 'inbound-3',
    title: 'Demo Best Practices',
    description: 'Deliver compelling product demonstrations',
    duration: '50 min',
    topics: [
      'Demo preparation',
      'Feature prioritization',
      'Objection handling',
      'Engagement techniques',
      'Closing demos'
    ],
  },
];

export default function SalesSkillsPage() {
  const [selectedModule, setSelectedModule] = useState<SkillModule | null>(null);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Sales Skills Training
            </h1>
            <p className="text-gray-600 text-lg">
              Master outbound and inbound sales fundamentals
            </p>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="outbound" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="outbound" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Outbound Sales
              </TabsTrigger>
              <TabsTrigger value="inbound" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Inbound Sales
              </TabsTrigger>
            </TabsList>

            {/* Outbound Sales */}
            <TabsContent value="outbound" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Outbound Sales Fundamentals
                  </CardTitle>
                  <CardDescription>
                    Learn how to proactively reach out to prospects and generate new business
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {outboundModules.map((module) => (
                      <Card 
                        key={module.id}
                        className="hover:border-gray-900 transition-all cursor-pointer"
                        onClick={() => setSelectedModule(module)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <CardTitle className="text-base">{module.title}</CardTitle>
                            <Badge variant="outline">{module.duration}</Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {module.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            {module.topics.slice(0, 3).map((topic, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{topic}</span>
                              </li>
                            ))}
                            {module.topics.length > 3 && (
                              <li className="text-xs text-gray-500">
                                +{module.topics.length - 3} more topics
                              </li>
                            )}
                          </ul>
                          <Button 
                            variant="outline" 
                            className="w-full mt-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModule(module);
                            }}
                          >
                            Learn More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Inbound Sales */}
            <TabsContent value="inbound" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Inbound Sales Fundamentals
                  </CardTitle>
                  <CardDescription>
                    Master the art of qualifying and converting inbound leads
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {inboundModules.map((module) => (
                      <Card 
                        key={module.id}
                        className="hover:border-gray-900 transition-all cursor-pointer"
                        onClick={() => setSelectedModule(module)}
                      >
                        <CardHeader>
                          <div className="flex items-start justify-between mb-2">
                            <CardTitle className="text-base">{module.title}</CardTitle>
                            <Badge variant="outline">{module.duration}</Badge>
                          </div>
                          <CardDescription className="text-sm">
                            {module.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2 text-sm">
                            {module.topics.slice(0, 3).map((topic, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600">{topic}</span>
                              </li>
                            ))}
                            {module.topics.length > 3 && (
                              <li className="text-xs text-gray-500">
                                +{module.topics.length - 3} more topics
                              </li>
                            )}
                          </ul>
                          <Button 
                            variant="outline" 
                            className="w-full mt-4"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedModule(module);
                            }}
                          >
                            Learn More
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Module Detail Modal */}
          {selectedModule && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedModule(null)}
            >
              <Card 
                className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-2xl mb-2">{selectedModule.title}</CardTitle>
                      <CardDescription className="text-base">{selectedModule.description}</CardDescription>
                    </div>
                    <Badge>{selectedModule.duration}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-3">Topics Covered</h3>
                    <ul className="space-y-2">
                      {selectedModule.topics.map((topic, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <span>{topic}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {selectedModule.practiceLink && (
                    <Link href={selectedModule.practiceLink}>
                      <Button className="w-full">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Practice This Skill
                      </Button>
                    </Link>
                  )}
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => setSelectedModule(null)}
                    >
                      Close
                    </Button>
                    <Link href="/scenarios" className="flex-1">
                      <Button className="w-full">
                        Practice in Scenarios
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Prospect Research Tool */}
          <div className="mt-8">
            <ProspectResearch />
          </div>

          {/* Email Template Generator */}
          <div className="mt-8">
            <EmailTemplateGenerator />
          </div>

          {/* Quick Links */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Ready to Practice?</CardTitle>
              <CardDescription>
                Apply what you've learned in real role-play scenarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/scenarios" className="flex-1">
                  <Button className="w-full" size="lg">
                    <PlayCircle className="mr-2 h-5 w-5" />
                    Start Role-Play Practice
                  </Button>
                </Link>
                <Link href="/features" className="flex-1">
                  <Button variant="outline" className="w-full" size="lg">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Learn Cursor Features
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}

