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

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50/50">
        {/* Hero Section - Premium Design */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="text-center space-y-6 mb-16">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 text-shine">
              Master Enterprise Sales with AI-Powered Training
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Practice real sales scenarios, get instant feedback, and improve your skills with AI-powered role-play training
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
              <Link href="/scenarios">
                <Button size="lg" className="w-full sm:w-auto">
                  <PlayCircle className="mr-2 h-5 w-5" />
                  Start Training Now
                </Button>
              </Link>
              <Link href="/sales-skills">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Learn Sales Fundamentals
                </Button>
              </Link>
            </div>
          </div>

          {/* Value Proposition Cards - Premium Glass Effect */}
          <div className="grid gap-6 md:grid-cols-3 mb-16">
            <Card className="card-premium border-2 border-gray-200/50">
              <CardHeader>
                <div className="relative h-12 w-12 rounded-xl bg-black flex items-center justify-center mb-4 shadow-glow hover:shadow-glow-lg transition-all duration-300 gloss-overlay">
                  <Target className="h-6 w-6 text-white relative z-10" />
                </div>
                <CardTitle>Real-World Practice</CardTitle>
                <CardDescription>
                  Practice with AI prospects that respond like real Enterprise buyers
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-premium border-2 border-gray-200/50">
              <CardHeader>
                <div className="relative h-12 w-12 rounded-xl bg-black flex items-center justify-center mb-4 shadow-glow hover:shadow-glow-lg transition-all duration-300 gloss-overlay">
                  <TrendingUp className="h-6 w-6 text-white relative z-10" />
                </div>
                <CardTitle>Instant Feedback</CardTitle>
                <CardDescription>
                  Get AI-powered evaluation and scoring after every interaction
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-premium border-2 border-gray-200/50">
              <CardHeader>
                <div className="relative h-12 w-12 rounded-xl bg-black flex items-center justify-center mb-4 shadow-glow hover:shadow-glow-lg transition-all duration-300 gloss-overlay">
                  <Trophy className="h-6 w-6 text-white relative z-10" />
                </div>
                <CardTitle>Track Progress</CardTitle>
                <CardDescription>
                  Monitor your improvement with detailed analytics and leaderboards
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Main Feature Cards - Premium Glass Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-16">
            <Link href="/scenarios" className="group">
              <Card className="h-full card-premium border border-gray-200/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative h-12 w-12 rounded-xl bg-black flex items-center justify-center group-hover:bg-gray-900 transition-all duration-300 shadow-glow group-hover:shadow-glow-lg gloss-overlay">
                      <PlayCircle className="h-6 w-6 text-white relative z-10" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Practice Scenarios</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Role-play with AI prospects and practice objection handling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                    Start Training
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/sales-skills" className="group">
              <Card className="h-full card-premium border border-gray-200/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative h-12 w-12 rounded-xl bg-black flex items-center justify-center group-hover:bg-gray-900 transition-all duration-300 shadow-glow group-hover:shadow-glow-lg gloss-overlay">
                      <BookOpen className="h-6 w-6 text-white relative z-10" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Sales Skills Training</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Learn outbound and inbound sales fundamentals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                    Learn Skills
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/roi-calculator" className="group">
              <Card className="h-full card-premium border border-gray-200/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative h-12 w-12 rounded-xl bg-black flex items-center justify-center group-hover:bg-gray-900 transition-all duration-300 shadow-glow group-hover:shadow-glow-lg gloss-overlay">
                      <Calculator className="h-6 w-6 text-white relative z-10" />
                    </div>
                    <CardTitle className="text-lg font-semibold">ROI Calculator</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Calculate the business impact and ROI of Cursor Enterprise
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/company-lookup" className="group">
              <Card className="h-full card-premium border border-gray-200/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="relative h-12 w-12 rounded-xl bg-black flex items-center justify-center group-hover:bg-gray-900 transition-all duration-300 shadow-glow group-hover:shadow-glow-lg gloss-overlay">
                      <Search className="h-6 w-6 text-white relative z-10" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Company Lookup</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Search companies and analyze financial data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                    Search Companies
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Start Scenarios */}
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Quick Start Scenarios</h2>
              <p className="text-gray-600">
                Start practicing with these {scenarios.length} ready-to-use scenarios
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scenarios.slice(0, 6).map((scenario) => (
                <Link 
                  key={scenario.id} 
                  href={`/roleplay/${scenario.id}`}
                  className="group"
                >
                  <Card className="h-full card-premium border border-gray-200/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-semibold mb-1 group-hover:text-gray-900 transition-colors">
                        {scenario.persona.name}
                      </CardTitle>
                      <CardDescription className="text-sm text-gray-600">
                        {scenario.objection_category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                        Start Scenario
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {scenarios.length > 6 && (
              <div className="mt-6 text-center">
                <Link href="/scenarios">
                  <Button variant="outline">
                    View All {scenarios.length} Scenarios
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Help & Feedback Section - Premium */}
          <Card className="card-premium border-2 border-gray-200/50 mt-12">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="relative h-10 w-10 rounded-xl bg-black flex items-center justify-center shadow-glow gloss-overlay">
                  <HelpCircle className="h-5 w-5 text-white relative z-10" />
                </div>
                <div>
                  <CardTitle className="text-xl">Need Help? Share Feedback!</CardTitle>
                  <CardDescription>
                    Help us improve by sharing your feedback or get help from the community
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
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
