'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, TrendingUp, Building2, Users, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface AccountRecommendation {
  accountDomain: string;
  companyName: string;
  icpScore: number;
  priorityLevel: 'high' | 'medium' | 'low';
  intentSignals: {
    hasOpenEngineeringRoles: boolean;
    engineeringRoleCount: number;
    recentResearch: boolean;
    userEngagement: number;
  };
  reasoning: string[];
  lastResearchAt?: string;
}

export default function AccountRecommendations() {
  const [recommendations, setRecommendations] = useState<AccountRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/ml/recommendations?limit=10&minICPScore=6');
      const data = await response.json();

      if (data.success) {
        setRecommendations(data.recommendations || []);
      } else {
        setError(data.error || 'Failed to load recommendations');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Accounts</CardTitle>
          <CardDescription>Top accounts based on intent signals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Accounts</CardTitle>
          <CardDescription>Top accounts based on intent signals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>{error}</p>
            <Button onClick={fetchRecommendations} variant="outline" className="mt-4">
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recommended Accounts</CardTitle>
          <CardDescription>Top accounts based on intent signals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No recommendations available yet.</p>
            <p className="text-sm mt-2">Start researching prospects to get personalized recommendations.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Recommended Accounts
        </CardTitle>
        <CardDescription>
          Top {recommendations.length} accounts based on ICP scores and intent signals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((account, index) => (
            <div
              key={account.accountDomain}
              className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-semibold">{account.companyName}</h3>
                    <Badge className={getPriorityColor(account.priorityLevel)}>
                      {account.priorityLevel}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{account.accountDomain}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {account.icpScore}/10
                  </div>
                  <div className="text-xs text-muted-foreground">ICP Score</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-3 mb-3">
                {account.intentSignals.hasOpenEngineeringRoles && (
                  <Badge variant="outline" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {account.intentSignals.engineeringRoleCount} Eng Roles
                  </Badge>
                )}
                {account.intentSignals.recentResearch && (
                  <Badge variant="outline" className="text-xs">
                    <Calendar className="h-3 w-3 mr-1" />
                    Recent Research
                  </Badge>
                )}
                {account.intentSignals.userEngagement > 0.5 && (
                  <Badge variant="outline" className="text-xs">
                    High Engagement
                  </Badge>
                )}
              </div>

              {account.reasoning.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs text-muted-foreground mb-1">Why recommended:</p>
                  <ul className="text-xs text-muted-foreground list-disc list-inside space-y-0.5">
                    {account.reasoning.map((reason, i) => (
                      <li key={i}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-3 pt-3 border-t">
                <Link
                  href={`/prospect-intelligence?url=${encodeURIComponent(`https://${account.accountDomain}`)}`}
                >
                  <Button variant="outline" size="sm" className="w-full">
                    Research This Account
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
