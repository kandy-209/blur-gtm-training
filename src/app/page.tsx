'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { scenarios } from '@/data/scenarios';
import { 
  PlayCircle, 
  BarChart3, 
  Trophy, 
  BookOpen, 
  MessageSquare, 
  Building2, 
  ArrowRight, 
  Calculator,
  TrendingUp,
  Target,
  HelpCircle,
  ThumbsUp,
  Search
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect } from 'react';

export default function HomePage() {
  // Add structured data for homepage
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Cursor Enterprise GTM Training Platform',
      description: 'Master Enterprise sales with AI-powered role-play training',
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: scenarios.length,
        itemListElement: scenarios.slice(0, 6).map((scenario, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Course',
            name: scenario.persona.name,
            description: scenario.objection_statement,
          },
        })),
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        
        {/* Hero Section - Clean Modern Design */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 max-w-6xl">
          <div className="text-center space-y-6 mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-sm font-medium text-gray-700">
              <Trophy className="h-3.5 w-3.5" />
              Enterprise Sales Training Platform
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 leading-tight">
                Master Enterprise Sales with{' '}
                <span className="text-black">AI-Powered</span>
                {' '}Training
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Practice real sales scenarios, get instant feedback, and improve your skills with AI-powered role-play training designed for enterprise sales teams
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mt-8">
              <Link href="/scenarios">
                <Button size="lg" className="w-full sm:w-auto">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Training Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/sales-skills">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Learn Sales Fundamentals
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 sm:gap-12 pt-12 mt-12 border-t border-gray-200">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{scenarios.length}+</div>
                <div className="text-sm text-gray-500 mt-1">Training Scenarios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">100%</div>
                <div className="text-sm text-gray-500 mt-1">AI-Powered Feedback</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">24/7</div>
                <div className="text-sm text-gray-500 mt-1">Available Training</div>
              </div>
            </div>
          </div>

          {/* Value Proposition Cards - Clean Modern Design */}
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            <Card className="card-premium group">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold mb-2">Real-World Practice</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600">
                  Practice with AI prospects that respond like real Enterprise buyers with realistic objections and scenarios
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-premium group">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold mb-2">Instant Feedback</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600">
                  Get AI-powered evaluation and scoring after every interaction with actionable insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-premium group">
              <CardHeader className="pb-4">
                <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center mb-4">
                  <Trophy className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg font-semibold mb-2">Track Progress</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-gray-600">
                  Monitor your improvement with detailed analytics, leaderboards, and performance metrics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Main Feature Cards - Clean Modern Design */}
          <div className="mb-16">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Everything You Need</h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Comprehensive tools and training to master enterprise sales
              </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/scenarios" className="group">
                <Card className="h-full card-premium">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                        <PlayCircle className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold mb-1">Practice Scenarios</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          Role-play with AI prospects and practice objection handling
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      Start Training
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/sales-skills" className="group">
                <Card className="h-full card-premium">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold mb-1">Sales Skills Training</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          Learn outbound and inbound sales fundamentals
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      Learn Skills
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/roi-calculator" className="group">
                <Card className="h-full card-premium">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                        <Calculator className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold mb-1">ROI Calculator</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          Calculate the business impact and ROI of Cursor Enterprise
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      Calculate ROI
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/company-lookup" className="group">
                <Card className="h-full card-premium">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-10 w-10 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                        <Search className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold mb-1">Company Lookup</CardTitle>
                        <CardDescription className="text-sm text-gray-600">
                          Search companies and analyze financial data
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                      Search Companies
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Quick Start Scenarios - Clean Design */}
          <div className="mb-16">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Quick Start Scenarios</h2>
              <p className="text-base text-gray-600 max-w-2xl mx-auto">
                Start practicing with these {scenarios.length} ready-to-use scenarios designed for enterprise sales
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scenarios.slice(0, 6).map((scenario) => (
                <Link 
                  key={scenario.id} 
                  href={`/roleplay/${scenario.id}`}
                  className="group"
                >
                  <Card className="h-full card-premium">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-base font-semibold mb-1">
                            {scenario.persona.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600">
                            {scenario.objection_category}
                          </CardDescription>
                        </div>
                        <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ml-3">
                          <PlayCircle className="h-4 w-4 text-gray-600" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                        Start Scenario
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {scenarios.length > 6 && (
              <div className="mt-10 text-center">
                <Link href="/scenarios">
                  <Button variant="outline" size="lg" className="hover:bg-gray-50 hover:border-gray-400 transition-all duration-300">
                    View All {scenarios.length} Scenarios
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Help & Feedback Section - Clean Design */}
          <Card className="card-premium">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">Need Help? Share Feedback!</CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    Help us improve by sharing your feedback or get help from the community. Your input makes this platform better for everyone.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3 md:grid-cols-2">
                <Link href="/feedback">
                  <Button variant="outline" className="w-full justify-start">
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Share Feedback
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="outline" className="w-full justify-start">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Get Help
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
