'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { scenarios } from '@/data/scenarios';
import { PlayCircle, BarChart3, Users, Trophy, BookOpen, MessageSquare, Building2, ArrowRight, Calculator } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PermissionAwareChat } from '@/components/PermissionAwareChat';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          {/* Hero Section */}
          <div className="text-center space-y-6 mb-20">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900">
              Cursor Enterprise GTM Training
            </h1>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto font-light">
              Master Cursor Enterprise sales positioning and objection handling
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-20">
            <Link href="/scenarios" className="group">
              <Card className="h-full border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                      <PlayCircle className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Practice Enterprise Sales</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Role-play with Enterprise prospects until you book meetings or close deals
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                    Start Training
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/analytics" className="group">
              <Card className="h-full border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold">View Analytics</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Track your progress and performance metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                    View Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/live" className="group">
              <Card className="h-full border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Live Role-Play</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Practice with teammates in real-time competitive sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                    Start Live Session
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/leaderboard" className="group">
              <Card className="h-full border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Leaderboard</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    See top performers and compete for the #1 spot
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                    View Leaderboard
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/features" className="group">
              <Card className="h-full border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                      <BookOpen className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Learn Cursor Features</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Understand features, ROI for leadership, and impact for ICs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                    Explore Features
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/enterprise" className="group">
              <Card className="h-full border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold">Enterprise Features</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Learn about security, compliance, and administrative controls
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                    Explore Enterprise
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/roi-calculator" className="group">
              <Card className="h-full border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-lg bg-gray-900 flex items-center justify-center group-hover:bg-gray-800 transition-colors">
                      <Calculator className="h-5 w-5 text-white" />
                    </div>
                    <CardTitle className="text-lg font-semibold">ROI Calculator</CardTitle>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Calculate Total Economic Impact and ROI for Cursor Enterprise
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all">
                    Calculate ROI
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Chat Assistant */}
          <Card className="border border-gray-200 mb-12">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-gray-900" />
                <CardTitle className="text-lg font-semibold">Ask Questions</CardTitle>
              </div>
              <CardDescription className="text-sm text-gray-600">
                Get help with Cursor features, ROI, and technical questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PermissionAwareChat initialChatType="general" />
            </CardContent>
          </Card>

          {/* Scenarios Grid */}
          <div>
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Enterprise Sales Scenarios</h2>
              <p className="text-gray-600">
                {scenarios.length} scenarios - Practice until you book meetings or close deals
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {scenarios.map((scenario) => (
                <Link 
                  key={scenario.id} 
                  href={`/roleplay/${scenario.id}`}
                  className="group"
                >
                  <Card className="h-full border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg">
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
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
