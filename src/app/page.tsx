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
      <div className="min-h-screen bg-liquid bg-liquid-pattern relative overflow-hidden">
        
        {/* Hero Section - Enhanced Premium Design */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 relative z-10">
          <div className="text-center space-y-8 mb-20">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-sm font-medium text-gray-700 hover:bg-black/10 transition-all duration-300">
              <Trophy className="h-3.5 w-3.5 text-gray-600" />
              Enterprise Sales Training Platform
            </div>
            
            <div className="space-y-6">
              <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight text-gray-900 text-shine leading-[1.1]">
                Master Enterprise Sales with{' '}
                <span className="relative inline-block">
                  <span className="relative z-10">AI-Powered</span>
                  <span className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-r from-blue-200/40 via-purple-200/40 to-blue-200/40 rounded-sm -z-0 opacity-60"></span>
                </span>
                {' '}Training
              </h1>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Practice real sales scenarios, get instant feedback, and improve your skills with AI-powered role-play training designed for enterprise sales teams
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
              <Link href="/scenarios" className="group">
                <Button size="lg" className="w-full sm:w-auto shadow-glow hover:shadow-glow-lg transition-all duration-300 group-hover:scale-105">
                  <PlayCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Start Training Now
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/sales-skills" className="group">
                <Button size="lg" variant="outline" className="w-full sm:w-auto hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 group-hover:scale-105">
                  <BookOpen className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Learn Sales Fundamentals
                </Button>
              </Link>
            </div>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 pt-8 border-t border-gray-200/50">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">{scenarios.length}+</div>
                <div className="text-sm text-gray-600 mt-1">Training Scenarios</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">AI-Powered</div>
                <div className="text-sm text-gray-600 mt-1">Real-time Feedback</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">Enterprise</div>
                <div className="text-sm text-gray-600 mt-1">Sales Focus</div>
              </div>
            </div>
          </div>

          {/* Value Proposition Cards - Enhanced Premium Glass Effect */}
          <div className="grid gap-6 md:grid-cols-3 mb-20">
            <Card className="card-premium border-2 border-gray-200/50 hover-lift group cursor-pointer">
              <CardHeader className="pb-6">
                <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center mb-5 shadow-glow group-hover:shadow-glow-lg transition-all duration-300 gloss-overlay group-hover:scale-110">
                  <Target className="h-7 w-7 text-white relative z-10" />
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-gray-900 transition-colors">Real-World Practice</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Practice with AI prospects that respond like real Enterprise buyers with realistic objections and scenarios
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-premium border-2 border-gray-200/50 hover-lift group cursor-pointer">
              <CardHeader className="pb-6">
                <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center mb-5 shadow-glow group-hover:shadow-glow-lg transition-all duration-300 gloss-overlay group-hover:scale-110">
                  <TrendingUp className="h-7 w-7 text-white relative z-10" />
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-gray-900 transition-colors">Instant Feedback</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Get AI-powered evaluation and scoring after every interaction with actionable insights
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="card-premium border-2 border-gray-200/50 hover-lift group cursor-pointer">
              <CardHeader className="pb-6">
                <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center mb-5 shadow-glow group-hover:shadow-glow-lg transition-all duration-300 gloss-overlay group-hover:scale-110">
                  <Trophy className="h-7 w-7 text-white relative z-10" />
                </div>
                <CardTitle className="text-xl mb-2 group-hover:text-gray-900 transition-colors">Track Progress</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  Monitor your improvement with detailed analytics, leaderboards, and performance metrics
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Main Feature Cards - Enhanced Premium Glass Cards */}
          <div className="mb-20">
            <div className="mb-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Everything You Need</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Comprehensive tools and training to master enterprise sales
              </p>
            </div>
            
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/scenarios" className="group">
                <Card className="h-full card-premium border border-gray-200/50 hover-lift">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow group-hover:shadow-glow-lg gloss-overlay flex-shrink-0">
                        <PlayCircle className="h-7 w-7 text-white relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold mb-2 group-hover:text-gray-900 transition-colors">Practice Scenarios</CardTitle>
                        <CardDescription className="text-sm text-gray-600 leading-relaxed">
                          Role-play with AI prospects and practice objection handling
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:gap-3 transition-all">
                      Start Training
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/sales-skills" className="group">
                <Card className="h-full card-premium border border-gray-200/50 hover-lift">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow group-hover:shadow-glow-lg gloss-overlay flex-shrink-0">
                        <BookOpen className="h-7 w-7 text-white relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold mb-2 group-hover:text-gray-900 transition-colors">Sales Skills Training</CardTitle>
                        <CardDescription className="text-sm text-gray-600 leading-relaxed">
                          Learn outbound and inbound sales fundamentals
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:gap-3 transition-all">
                      Learn Skills
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/roi-calculator" className="group">
                <Card className="h-full card-premium border border-gray-200/50 hover-lift">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow group-hover:shadow-glow-lg gloss-overlay flex-shrink-0">
                        <Calculator className="h-7 w-7 text-white relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold mb-2 group-hover:text-gray-900 transition-colors">ROI Calculator</CardTitle>
                        <CardDescription className="text-sm text-gray-600 leading-relaxed">
                          Calculate the business impact and ROI of Cursor Enterprise
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:gap-3 transition-all">
                      Calculate ROI
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href="/company-lookup" className="group">
                <Card className="h-full card-premium border border-gray-200/50 hover-lift">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-4 mb-3">
                      <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-glow group-hover:shadow-glow-lg gloss-overlay flex-shrink-0">
                        <Search className="h-7 w-7 text-white relative z-10" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold mb-2 group-hover:text-gray-900 transition-colors">Company Lookup</CardTitle>
                        <CardDescription className="text-sm text-gray-600 leading-relaxed">
                          Search companies and analyze financial data
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:gap-3 transition-all">
                      Search Companies
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>

          {/* Quick Start Scenarios - Enhanced */}
          <div className="mb-20">
            <div className="mb-10 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Quick Start Scenarios</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Start practicing with these {scenarios.length} ready-to-use scenarios designed for enterprise sales
              </p>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {scenarios.slice(0, 6).map((scenario, index) => (
                <Link 
                  key={scenario.id} 
                  href={`/roleplay/${scenario.id}`}
                  className="group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className="h-full card-premium border border-gray-200/50 hover-lift">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <CardTitle className="text-lg font-semibold mb-2 group-hover:text-gray-900 transition-colors">
                            {scenario.persona.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-600 leading-relaxed">
                            {scenario.objection_category}
                          </CardDescription>
                        </div>
                        <div className="relative h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center group-hover:bg-black/10 transition-all duration-300 flex-shrink-0 ml-3">
                          <PlayCircle className="h-5 w-5 text-gray-700 group-hover:text-gray-900 transition-colors" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 group-hover:gap-3 transition-all">
                        Start Scenario
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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

          {/* Help & Feedback Section - Enhanced Premium */}
          <Card className="card-premium border-2 border-gray-200/50 hover-lift">
            <CardHeader className="pb-6">
              <div className="flex items-start gap-4">
                <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-black to-gray-800 flex items-center justify-center shadow-glow gloss-overlay flex-shrink-0">
                  <HelpCircle className="h-7 w-7 text-white relative z-10" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">Need Help? Share Feedback!</CardTitle>
                  <CardDescription className="text-base leading-relaxed">
                    Help us improve by sharing your feedback or get help from the community. Your input makes this platform better for everyone.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-4 md:grid-cols-2">
                <Link href="/feedback" className="group">
                  <Button variant="outline" className="w-full justify-start h-12 text-base hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 group-hover:scale-[1.02]">
                    <ThumbsUp className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Share Feedback
                  </Button>
                </Link>
                <Link href="/help" className="group">
                  <Button variant="outline" className="w-full justify-start h-12 text-base hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 group-hover:scale-[1.02]">
                    <HelpCircle className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
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
