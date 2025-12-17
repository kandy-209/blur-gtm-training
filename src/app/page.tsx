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
  Search,
  Phone
} from 'lucide-react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useEffect, useRef } from 'react';
import OptimizedFluidBackground from '@/components/OptimizedFluidBackground';
import { useOptimizedMousePosition } from '@/hooks/useOptimizedMousePosition';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useOptimizedMousePosition(containerRef);

  // Add structured data for homepage
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: 'Blur Enterprise GTM Training Platform',
      description: 'Transform into a world-class GTM Operator with AI-powered role-play training that builds unshakeable confidence',
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
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <ProtectedRoute>
      <div ref={containerRef} className="min-h-screen bg-gradient-to-b from-white via-gray-50/30 to-white relative overflow-hidden">
        {/* Optimized Fluid Background */}
        <OptimizedFluidBackground intensity="subtle" color="gradient" />
        
        {/* Hero Section - Premium Design */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32 max-w-6xl relative z-10">
          <div className="text-center space-y-12">
            {/* Badge */}
            <div className="inline-flex items-center gap-2.5 px-5 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold tracking-wide uppercase shadow-lg backdrop-blur-sm">
              <Trophy className="h-3.5 w-3.5" />
              <span>Elite GTM Training Academy</span>
            </div>
            
            <div className="space-y-6 max-w-4xl mx-auto">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.05]">
                Transform Into a{' '}
                <span className="relative">
                  <span className="relative z-10">World-Class</span>
                  <span className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 opacity-10 blur-2xl"></span>
                </span>
                {' '}GTM Operator
              </h1>
              <p className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
                Dominate enterprise sales conversations with AI-powered role-play that sharpens your instincts, builds unshakeable confidence, and turns objections into opportunities
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link href="/scenarios" suppressHydrationWarning className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto btn-liquid bg-gray-900 hover:bg-gray-800 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-semibold px-6 py-3 min-h-[48px] flex items-center justify-center gap-2.5">
                  <PlayCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Begin Your Transformation</span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0" />
                </Button>
              </Link>
              <Link href="/sales-training" suppressHydrationWarning className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto btn-liquid bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 font-semibold px-6 py-3 min-h-[48px] flex items-center justify-center gap-2.5">
                  <Phone className="h-5 w-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Phone Call Training</span>
                </Button>
              </Link>
              <Link href="/analytics" suppressHydrationWarning className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto btn-liquid border-2 border-gray-200 hover:border-gray-300 hover:bg-white/80 backdrop-blur-sm transition-all duration-300 font-semibold px-6 py-3 min-h-[48px] flex items-center justify-center gap-2.5">
                  <BarChart3 className="h-5 w-5 flex-shrink-0" />
                  <span className="whitespace-nowrap">Track Your Progress</span>
                </Button>
              </Link>
            </div>
            
            {/* Stats - Premium Design */}
            <div className="flex flex-wrap justify-center gap-12 sm:gap-20 pt-16 mt-16 border-t border-gray-200/60">
              <div className="text-center group">
                <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">{scenarios.length}+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">Real-World Scenarios</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">Instant</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">AI-Powered Insights</div>
              </div>
              <div className="text-center group">
                <div className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-2 group-hover:scale-110 transition-transform duration-300">Always</div>
                <div className="text-sm text-gray-500 uppercase tracking-wider font-medium">Available When You Are</div>
              </div>
            </div>
          </div>

          {/* Phone Training Feature Card */}
          <div className="mt-32 sm:mt-40">
            <Link href="/sales-training" suppressHydrationWarning className="block mb-16">
              <Card className="card-premium card-liquid hover:shadow-2xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 bg-gradient-to-br from-blue-50 to-white hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center shadow-lg">
                        <Phone className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                        Real Phone Call Training
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600 mb-4">
                        Practice with real phone calls using AI. Get instant AI analysis on your objection handling, closing techniques, and communication skills.
                      </CardDescription>
                      <div className="flex items-center gap-2 text-blue-600 font-semibold">
                        <span>Start Phone Training</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Prospect Intelligence Feature Card */}
          <div className="mt-8">
            <Link href="/prospect-intelligence" suppressHydrationWarning className="block mb-16">
              <Card className="card-premium card-liquid hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 bg-gradient-to-br from-purple-50 to-white hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-shrink-0">
                      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg">
                        <Search className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 text-center md:text-left">
                      <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                        Prospect Intelligence
                      </CardTitle>
                      <CardDescription className="text-base text-gray-600 mb-4">
                        Automatically research prospect companies. Get tech stack, hiring activity, engineering culture, and ICP fit scores in under a minute.
                      </CardDescription>
                      <div className="flex items-center gap-2 text-purple-600 font-semibold">
                        <span>Research Prospects</span>
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Quick Start Scenarios - Premium Design */}
          <div className="mt-16">
            <div className="mb-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">Ready to Level Up?</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Jump into these high-stakes scenarios and prove you can handle anything prospects throw at you
              </p>
            </div>
            <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
              {scenarios.slice(0, 3).map((scenario, index) => (
                <Link 
                  key={scenario.id} 
                  href={`/roleplay/${scenario.id}`}
                  className="group"
                  suppressHydrationWarning
                >
                  <Card className="h-full card-premium card-liquid hover:shadow-2xl transition-all duration-300 border border-gray-200/80 hover:border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:-translate-y-1">
                    <CardHeader className="pb-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-1.5 w-1.5 rounded-full bg-gray-900"></div>
                            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Scenario {index + 1}</span>
                          </div>
                          <CardTitle className="text-lg font-bold mb-2.5 text-gray-900 line-clamp-2 leading-snug">
                            {scenario.persona.name}
                          </CardTitle>
                          <CardDescription className="text-sm text-gray-500 font-medium">
                            {scenario.objection_category.replace(/_/g, ' ')}
                          </CardDescription>
                        </div>
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0 group-hover:from-gray-900 group-hover:to-gray-800 transition-all duration-300 shadow-sm group-hover:shadow-lg">
                          <PlayCircle className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors duration-300" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pb-6">
                      <div className="flex items-center gap-2.5 text-sm font-semibold text-gray-900 group-hover:text-gray-900">
                        <span>Conquer This Challenge</span>
                        <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
            {scenarios.length > 3 && (
              <div className="mt-16 text-center">
                <Link href="/scenarios" suppressHydrationWarning>
                  <Button variant="outline" size="lg" className="btn-liquid border-2 border-gray-200 hover:bg-gray-900 hover:text-white hover:border-gray-900 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl">
                    Explore All {scenarios.length} Scenarios
                    <ArrowRight className="ml-2.5 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
