'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { scenarios } from '@/data/scenarios';
import { PlayCircle, BarChart3, Settings, Users, Trophy, BookOpen, MessageSquare } from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { PermissionAwareChat } from '@/components/PermissionAwareChat';

export default function HomePage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      {/* Hero Section */}
      <div className="text-center space-y-4 mb-16">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight">
          Cursor Enterprise GTM Training
        </h1>
        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Master Cursor Enterprise sales positioning and objection handling. Practice until you book meetings and close Enterprise deals.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid gap-6 md:grid-cols-3 mb-16">
        <Card className="hover-lift border-gray-200 transition-smooth">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center mb-4">
              <PlayCircle className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-xl">Practice Enterprise Sales</CardTitle>
            <CardDescription className="text-sm">
              Role-play with Enterprise prospects until you book meetings or close Enterprise deals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/scenarios">
              <Button className="w-full bg-black hover:bg-gray-900 text-white">Start Training</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-lift border-gray-200 transition-smooth">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
              <BarChart3 className="h-6 w-6 text-gray-900" />
            </div>
            <CardTitle className="text-xl">View Analytics</CardTitle>
            <CardDescription className="text-sm">
              Track your progress and performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analytics">
              <Button className="w-full" variant="outline">View Dashboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-lift border-gray-200 transition-smooth">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-gray-900" />
            </div>
            <CardTitle className="text-xl">Live Role-Play</CardTitle>
            <CardDescription className="text-sm">
              Practice with teammates in real-time competitive sessions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/live">
              <Button className="w-full bg-black hover:bg-gray-900 text-white">Start Live Session</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-lift border-gray-200 transition-smooth">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center mb-4">
              <Trophy className="h-6 w-6 text-yellow-700" />
            </div>
            <CardTitle className="text-xl">Leaderboard</CardTitle>
            <CardDescription className="text-sm">
              See top performers and compete for the #1 spot
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/leaderboard">
              <Button className="w-full" variant="outline">View Leaderboard</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-lift border-gray-200 transition-smooth">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-indigo-700" />
            </div>
            <CardTitle className="text-xl">Learn Cursor Features</CardTitle>
            <CardDescription className="text-sm">
              Understand features, ROI for leadership, and impact for ICs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/features">
              <Button className="w-full bg-black hover:bg-gray-900 text-white">Explore Features</Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="hover-lift border-gray-200 transition-smooth">
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-gray-900" />
            </div>
            <CardTitle className="text-xl">Manage Scenarios</CardTitle>
            <CardDescription className="text-sm">
              Create and edit training scenarios (Admin)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/scenarios">
              <Button className="w-full" variant="outline">Admin Panel</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Chat Assistant */}
      <Card className="border-gray-200 mb-8">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <CardTitle className="text-xl">Ask Questions</CardTitle>
          </div>
          <CardDescription>
            Get help with Cursor features, ROI, and technical questions (permission-based access)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PermissionAwareChat initialChatType="general" />
        </CardContent>
      </Card>

      {/* Scenarios Grid */}
      <Card className="border-gray-200">
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Enterprise Sales Scenarios</CardTitle>
              <CardDescription className="mt-1">
                {scenarios.length} Enterprise scenarios - Practice until you book meetings or close deals
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <Link 
                key={scenario.id} 
                href={`/roleplay/${scenario.id}`}
                className="group"
              >
                <div className="p-5 border border-gray-200 rounded-lg hover:border-gray-900 transition-all hover-lift">
                  <h3 className="font-semibold text-base mb-2 group-hover:text-gray-900 transition-colors">
                    {scenario.persona.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {scenario.objection_category}
                  </p>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="w-full group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors"
                  >
                    Start Scenario
                  </Button>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  );
}

