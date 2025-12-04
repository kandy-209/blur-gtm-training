'use client';

import { useState, useMemo, memo, useEffect, useCallback, Suspense } from 'react';
import { scenarios } from '@/data/scenarios';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/useAuth';
import { ScenarioPreviewModal } from '@/components/ScenarioPreviewModal';
import { EmptyState } from '@/components/ui/empty-state';
import { Scenario } from '@/types/roleplay';
import { Skeleton, SkeletonCard } from '@/components/ui/skeleton';
import { ErrorBoundaryWithContext } from '@/components/ErrorBoundaryWithContext';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Target, 
  Shield, 
  DollarSign, 
  Puzzle,
  CheckCircle2,
  PlayCircle,
  BarChart3,
  Sparkles,
  Eye,
  X,
  Loader2
} from 'lucide-react';

const categoryIcons: Record<string, any> = {
  'Competitive_Copilot': Puzzle,
  'Security_Privacy': Shield,
  'Pricing_Value': DollarSign,
  'Integration_Complexity': Clock,
  'Adoption_Concerns': TrendingUp,
  'Code_Quality': Target,
};

const categoryColors: Record<string, string> = {
  'Competitive_Copilot': 'bg-blue-100 text-blue-700 border-blue-200',
  'Security_Privacy': 'bg-red-100 text-red-700 border-red-200',
  'Pricing_Value': 'bg-green-100 text-green-700 border-green-200',
  'Integration_Complexity': 'bg-purple-100 text-purple-700 border-purple-200',
  'Adoption_Concerns': 'bg-orange-100 text-orange-700 border-orange-200',
  'Code_Quality': 'bg-indigo-100 text-indigo-700 border-indigo-200',
};

// Debounce hook for search
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

function ScenariosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'difficulty'>('name');
  const [previewScenario, setPreviewScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const { user } = useAuth();

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Update searching state
  useEffect(() => {
    setIsSearching(searchQuery !== debouncedSearchQuery);
  }, [searchQuery, debouncedSearchQuery]);

  // Simulate loading for scenarios (in real app, this would be API call)
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(scenarios.map(s => s.objection_category));
    return Array.from(cats);
  }, []);

  // Filter and sort scenarios with debounced search
  const filteredScenarios = useMemo(() => {
    let filtered = scenarios.filter(scenario => {
      const matchesSearch = 
        scenario.persona.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        scenario.objection_statement.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        scenario.keyPoints.some(kp => kp.toLowerCase().includes(debouncedSearchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || scenario.objection_category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort scenarios
    filtered.sort((a, b) => {
      if (sortBy === 'name') {
        return a.persona.name.localeCompare(b.persona.name);
      } else if (sortBy === 'category') {
        return a.objection_category.localeCompare(b.objection_category);
      }
      return 0;
    });

    return filtered;
  }, [debouncedSearchQuery, selectedCategory, sortBy]);

  // Clear filters handler
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSortBy('name');
  }, []);

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || Target;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  // Add structured data for SEO
  useEffect(() => {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Training Scenarios',
      description: `Practice ${scenarios.length}+ realistic enterprise sales scenarios with AI-powered role-play training`,
      mainEntity: {
        '@type': 'ItemList',
        numberOfItems: scenarios.length,
        itemListElement: scenarios.map((scenario, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'Course',
            name: scenario.persona.name,
            description: scenario.objection_statement,
            courseCode: scenario.id,
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
      <ErrorBoundaryWithContext component="ScenariosPage" severity="high">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 md:py-12">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-lg bg-black flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight truncate">Training Scenarios</h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-0.5 sm:mt-1">
                Master Enterprise sales with {scenarios.length} realistic scenarios
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-4 sm:mt-6">
            <Card className="border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Scenarios</p>
                    <p className="text-xl sm:text-2xl font-bold mt-0.5">{scenarios.length}</p>
                  </div>
                  <PlayCircle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Categories</p>
                    <p className="text-xl sm:text-2xl font-bold mt-0.5">{categories.length}</p>
                  </div>
                  <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Available Now</p>
                    <p className="text-xl sm:text-2xl font-bold mt-0.5">{filteredScenarios.length}</p>
                  </div>
                  <CheckCircle2 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200 hover:border-gray-300 transition-colors">
              <CardContent className="pt-3 sm:pt-4 px-3 sm:px-4">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm text-muted-foreground truncate">Practice Mode</p>
                    <p className="text-base sm:text-lg font-bold text-green-600 mt-0.5">Active</p>
                  </div>
                  <Target className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0 ml-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                placeholder="Search scenarios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 h-10 sm:h-11 text-sm sm:text-base"
                aria-label="Search scenarios"
                aria-describedby="search-help"
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
              )}
              {searchQuery && !isSearching && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <div id="search-help" className="sr-only">
                Search scenarios by persona name, objection statement, or key points
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[180px] md:w-[200px] h-10 sm:h-11 text-sm sm:text-base">
                <Filter className="h-4 w-4 mr-2 flex-shrink-0" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] h-10 sm:h-11 text-sm sm:text-base">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="category">Sort by Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(debouncedSearchQuery || selectedCategory !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm text-muted-foreground">Active filters:</span>
              {debouncedSearchQuery && (
                <Badge variant="secondary" className="gap-1 text-xs sm:text-sm px-2 py-1">
                  <span className="truncate max-w-[120px] sm:max-w-none">Search: {debouncedSearchQuery}</span>
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-destructive flex-shrink-0"
                    aria-label="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1 text-xs sm:text-sm px-2 py-1">
                  <span>{selectedCategory.replace(/_/g, ' ')}</span>
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-destructive flex-shrink-0"
                    aria-label="Clear category filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {(debouncedSearchQuery || selectedCategory !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-7 text-xs sm:text-sm"
                >
                  Clear all
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Scenarios Grid */}
        {isLoading ? (
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" role="status" aria-live="polite" aria-label="Loading scenarios">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredScenarios.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No scenarios found"
            description={
              debouncedSearchQuery || selectedCategory !== 'all'
                ? "Try adjusting your search or filter criteria"
                : "No scenarios available at this time"
            }
            action={
              debouncedSearchQuery || selectedCategory !== 'all'
                ? {
                    label: 'Clear Filters',
                    onClick: clearFilters
                  }
                : undefined
            }
          />
        ) : (
          <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {filteredScenarios.map((scenario) => {
              const CategoryIcon = categoryIcons[scenario.objection_category] || Target;
              const categoryColor = getCategoryColor(scenario.objection_category);

              return (
                <Card
                  key={scenario.id}
                  className="hover-lift border-gray-200 transition-all duration-200 group relative overflow-hidden hover:border-gray-300 hover:shadow-md"
                >
                  {/* Category Badge */}
                  <Badge 
                    className={`absolute top-3 right-3 sm:top-4 sm:right-4 ${categoryColor} px-2 py-1 rounded-md text-[10px] sm:text-xs font-medium flex items-center gap-1 z-10 shadow-sm max-w-[120px] sm:max-w-[140px]`}
                    variant="outline"
                    aria-label={`Category: ${scenario.objection_category.replace(/_/g, ' ')}`}
                  >
                    <CategoryIcon className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{scenario.objection_category.replace(/_/g, ' ')}</span>
                  </Badge>

                  <CardHeader className="pb-3 sm:pb-4 pt-5 sm:pt-6 px-4 sm:px-6 relative">
                    <CardTitle className="text-base sm:text-lg font-semibold mb-1.5 sm:mb-2 pr-28 sm:pr-36 line-clamp-2">
                      {scenario.persona.name}
                    </CardTitle>
                    <CardDescription className="text-xs sm:text-sm line-clamp-2 leading-relaxed">
                      {scenario.persona.currentSolution}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6 pb-4 sm:pb-6">
                    {/* Objection Preview */}
                    <div className="bg-gray-50 rounded-lg p-2.5 sm:p-3 border border-gray-200">
                      <p className="text-[10px] sm:text-xs font-semibold text-muted-foreground mb-1">Objection:</p>
                      <p className="text-xs sm:text-sm text-foreground line-clamp-3 leading-relaxed">
                        {scenario.objection_statement}
                      </p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <p className="text-[10px] sm:text-xs font-semibold mb-1.5 sm:mb-2 text-foreground flex items-center gap-1">
                        <Target className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                        Key Points ({scenario.keyPoints.length}):
                      </p>
                      <ul className="text-[10px] sm:text-xs text-muted-foreground space-y-1">
                        {scenario.keyPoints.slice(0, 3).map((point, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 sm:gap-2">
                            <span className="text-gray-400 mt-0.5 flex-shrink-0">•</span>
                            <span className="line-clamp-1 flex-1 min-w-0">{point}</span>
                          </li>
                        ))}
                        {scenario.keyPoints.length > 3 && (
                          <li className="text-[10px] sm:text-xs text-muted-foreground italic">
                            +{scenario.keyPoints.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Persona Info */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-[10px] sm:text-xs">
                        <div className="min-w-0">
                          <span className="text-muted-foreground">Goal: </span>
                          <span className="text-foreground line-clamp-1 block">
                            {scenario.persona.primaryGoal.split('.')[0]}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-muted-foreground">Tone: </span>
                          <span className="text-foreground line-clamp-1 block">
                            {scenario.persona.tone.split('.')[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
                        onClick={() => setPreviewScenario(scenario)}
                        aria-label={`Preview scenario: ${scenario.persona.name}`}
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" aria-hidden="true" />
                        <span className="hidden sm:inline">Preview</span>
                        <span className="sm:hidden">View</span>
                      </Button>
                      <Link href={`/roleplay/${scenario.id}`} className="flex-1" aria-label={`Start scenario: ${scenario.persona.name}`}>
                        <Button 
                          size="sm"
                          className="w-full h-9 sm:h-10 bg-black hover:bg-gray-900 text-white transition-all duration-200 group-hover:shadow-lg text-xs sm:text-sm"
                        >
                          <PlayCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" aria-hidden="true" />
                          Start
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Results Count */}
        {!isLoading && filteredScenarios.length > 0 && (
          <div className="mt-4 sm:mt-6 text-sm text-muted-foreground">
            Showing {filteredScenarios.length} of {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8 sm:mt-10 md:mt-12 text-center">
          <Card className="border-gray-200 bg-gray-50 hover:bg-gray-100/50 transition-colors">
            <CardContent className="py-4 sm:py-5 md:py-6 px-4 sm:px-6">
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                💡 <strong>Tip:</strong> Practice each scenario multiple times to master different objection handling approaches.
                Track your progress in the Analytics dashboard.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Preview Modal */}
        <ErrorBoundaryWithContext component="ScenarioPreviewModal" severity="low">
          <ScenarioPreviewModal
            scenario={previewScenario}
            open={!!previewScenario}
            onClose={() => setPreviewScenario(null)}
          />
        </ErrorBoundaryWithContext>
      </div>
      </ErrorBoundaryWithContext>
    </ProtectedRoute>
  );
}

export default memo(ScenariosPage);
