'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Search, TrendingUp, BarChart3, DollarSign, Building2, Calculator } from 'lucide-react';
import StockQuoteWidget from '@/components/StockQuoteWidget';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function FinancialDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Financial Dashboard</h1>
            <p className="text-gray-600">Access financial data and company insights</p>
          </div>

          <Tabs defaultValue="quote" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="quote">Quick Quote</TabsTrigger>
              <TabsTrigger value="lookup">Company Lookup</TabsTrigger>
              <TabsTrigger value="analysis">ROI Analysis</TabsTrigger>
            </TabsList>

            <TabsContent value="quote" className="space-y-4">
              <StockQuoteWidget />
            </TabsContent>

            <TabsContent value="lookup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Search</CardTitle>
                  <CardDescription>
                    Search for companies and view detailed financial information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/company-lookup">
                    <Button className="w-full">
                      <Search className="mr-2 h-4 w-4" />
                      Go to Company Lookup
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company ROI Analysis</CardTitle>
                  <CardDescription>
                    Analyze how Cursor can impact a specific company's engineering productivity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/company-lookup">
                    <Button className="w-full">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      Start Company Analysis
                    </Button>
                  </Link>
                  <p className="text-sm text-gray-600 mt-4">
                    Search for a company, then click "Calculate ROI" to see how Browserbase 
                    can impact their engineering team's productivity and ROI.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="grid gap-4 md:grid-cols-3 mt-6">
            <Link href="/roi-calculator">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    ROI Calculator
                  </CardTitle>
                  <CardDescription>
                    Calculate ROI for your organization
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/company-lookup">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Company Lookup
                  </CardTitle>
                  <CardDescription>
                    Search and analyze companies
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>

            <Link href="/api/company-analysis">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Advanced Analysis
                  </CardTitle>
                  <CardDescription>
                    Deep company analysis with AI
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

