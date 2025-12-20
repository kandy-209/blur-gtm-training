'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Building2, 
  TrendingUp,
  Calendar,
  Target,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import type { ProspectIntelligence } from '@/lib/prospect-intelligence/types';

interface SavedProspect {
  id: string;
  websiteUrl: string;
  companyName: string;
  data: ProspectIntelligence;
  icpScore: number;
  priorityLevel: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
}

interface ProspectStats {
  total: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
  averageIcpScore: number;
  recentCount: number;
}

export default function SavedProspectsPage() {
  const [prospects, setProspects] = useState<SavedProspect[]>([]);
  const [stats, setStats] = useState<ProspectStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [minIcpScore, setMinIcpScore] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadProspects();
  }, [priorityFilter, minIcpScore, searchQuery]);

  const loadProspects = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (priorityFilter !== 'all') {
        params.set('priority', priorityFilter);
      }
      if (minIcpScore !== undefined) {
        params.set('minIcpScore', minIcpScore.toString());
      }
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const response = await fetch(`/api/prospect-intelligence/saved?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to load saved prospects');
      }

      const result = await response.json();
      if (result.success) {
        setProspects(result.data.prospects);
        setStats(result.data.stats);
      } else {
        throw new Error(result.error || 'Failed to load prospects');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load saved prospects');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prospect?')) {
      return;
    }

    try {
      const response = await fetch(`/api/prospect-intelligence/saved/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete prospect');
      }

      // Reload prospects
      loadProspects();
    } catch (err: any) {
      alert(`Failed to delete prospect: ${err.message}`);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getIcpScoreColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <ProtectedRoute>
      <ErrorBoundaryWithContext component="SavedProspectsPage">
        <div className="min-h-screen py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight mb-2">
                    Saved Prospects
                  </h1>
                  <p className="text-gray-600">
                    View and manage your researched prospect companies
                  </p>
                </div>
                <Link href="/prospect-intelligence">
                  <Button>
                    <Search className="h-4 w-4 mr-2" />
                    Research New Prospect
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Total Prospects</div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">High Priority</div>
                    <div className="text-2xl font-bold text-red-600">{stats.highPriority}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Medium Priority</div>
                    <div className="text-2xl font-bold text-yellow-600">{stats.mediumPriority}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Low Priority</div>
                    <div className="text-2xl font-bold text-gray-600">{stats.lowPriority}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="text-sm text-gray-600 mb-1">Avg ICP Score</div>
                    <div className="text-2xl font-bold">{stats.averageIcpScore.toFixed(1)}</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by company name or website..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as any)}
                      className="px-3 py-2 border rounded-md"
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low Priority</option>
                    </select>
                    <Input
                      type="number"
                      placeholder="Min ICP Score"
                      value={minIcpScore || ''}
                      onChange={(e) => setMinIcpScore(e.target.value ? parseInt(e.target.value) : undefined)}
                      className="w-32"
                      min="1"
                      max="10"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Error State */}
            {error && (
              <Card className="border-red-200 bg-red-50 mb-6">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 text-red-700">
                    <XCircle className="h-5 w-5" />
                    <span>{error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Loading State */}
            {loading && (
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading prospects...</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Prospects List */}
            {!loading && !error && (
              <div className="space-y-4">
                {prospects.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <h3 className="text-lg font-semibold mb-2">No saved prospects</h3>
                      <p className="text-gray-600 mb-4">
                        Start researching companies to save them here
                      </p>
                      <Link href="/prospect-intelligence">
                        <Button>
                          <Search className="h-4 w-4 mr-2" />
                          Research Your First Prospect
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ) : (
                  prospects.map((prospect) => (
                    <Card key={prospect.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-xl font-bold">{prospect.companyName}</h3>
                              <Badge className={getPriorityColor(prospect.priorityLevel)}>
                                {prospect.priorityLevel.toUpperCase()}
                              </Badge>
                              <Badge variant="outline" className={getIcpScoreColor(prospect.icpScore)}>
                                ICP: {prospect.icpScore}/10
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{prospect.data.companyDescription}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {new Date(prospect.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                {prospect.data.industry}
                              </span>
                              {prospect.data.techStack.primaryFramework && (
                                <span className="flex items-center gap-1">
                                  <Target className="h-4 w-4" />
                                  {prospect.data.techStack.primaryFramework}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2 ml-4">
                            <Link href={`/prospect-intelligence?url=${encodeURIComponent(prospect.websiteUrl)}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(prospect.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </ErrorBoundaryWithContext>
    </ProtectedRoute>
  );
}
