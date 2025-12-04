'use client';

import { useState, useMemo, memo, useEffect } from 'react';
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
  Eye
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

function ScenariosPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'category' | 'difficulty'>('name');
  const [previewScenario, setPreviewScenario] = useState<Scenario | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

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

  // Filter and sort scenarios
  const filteredScenarios = useMemo(() => {
    let filtered = scenarios.filter(scenario => {
      const matchesSearch = 
        scenario.persona.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.objection_statement.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scenario.keyPoints.some(kp => kp.toLowerCase().includes(searchQuery.toLowerCase()));
      
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
  }, [searchQuery, selectedCategory, sortBy]);

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || Target;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Training Scenarios</h1>
              <p className="text-muted-foreground mt-1">
                Master Enterprise sales with {scenarios.length} realistic scenarios
              </p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-6">
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Scenarios</p>
                    <p className="text-2xl font-bold">{scenarios.length}</p>
                  </div>
                  <PlayCircle className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Categories</p>
                    <p className="text-2xl font-bold">{categories.length}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Now</p>
                    <p className="text-2xl font-bold">{filteredScenarios.length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card className="border-gray-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Practice Mode</p>
                    <p className="text-lg font-bold text-green-600">Active</p>
                  </div>
                  <Target className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
              <Input
                placeholder="Search scenarios by name, objection, or key points..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                aria-label="Search scenarios"
                aria-describedby="search-help"
              />
              <div id="search-help" className="sr-only">
                Search scenarios by persona name, objection statement, or key points
              </div>
            </div>

            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
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
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Sort by Name</SelectItem>
                <SelectItem value="category">Sort by Category</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters */}
          {(searchQuery || selectedCategory !== 'all') && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              {searchQuery && (
                <Badge variant="secondary" className="gap-1">
                  Search: {searchQuery}
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {selectedCategory.replace(/_/g, ' ')}
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>

        {/* Scenarios Grid */}
        {isLoading ? (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3" role="status" aria-live="polite" aria-label="Loading scenarios">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredScenarios.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No scenarios found"
            description="Try adjusting your search or filter criteria"
            action={{
              label: 'Clear Filters',
              onClick: () => {
                setSearchQuery('');
                setSelectedCategory('all');
              }
            }}
          />
        ) : (
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {filteredScenarios.map((scenario) => {
              const CategoryIcon = categoryIcons[scenario.objection_category] || Target;
              const categoryColor = getCategoryColor(scenario.objection_category);

              return (
                <Card
                  key={scenario.id}
                  className="hover-lift border-gray-200 transition-smooth group relative overflow-hidden"
                >
                  {/* Category Badge */}
                  <div className={`absolute top-4 right-4 ${categoryColor} px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1`}>
                    <CategoryIcon className="h-3 w-3" />
                    {scenario.objection_category.replace(/_/g, ' ')}
                  </div>

                  <CardHeader className="pb-4 pt-6">
                    <CardTitle className="text-lg font-semibold mb-2 pr-20">
                      {scenario.persona.name}
                    </CardTitle>
                    <CardDescription className="text-xs line-clamp-2">
                      {scenario.persona.currentSolution}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Objection Preview */}
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Objection:</p>
                      <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
                        {scenario.objection_statement}
                      </p>
                    </div>

                    {/* Key Points */}
                    <div>
                      <p className="text-xs font-semibold mb-2 text-foreground flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Key Points ({scenario.keyPoints.length}):
                      </p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {scenario.keyPoints.slice(0, 3).map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span className="line-clamp-1">{point}</span>
                          </li>
                        ))}
                        {scenario.keyPoints.length > 3 && (
                          <li className="text-xs text-muted-foreground italic">
                            +{scenario.keyPoints.length - 3} more
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Persona Info */}
                    <div className="pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Goal: </span>
                          <span className="text-foreground line-clamp-1">
                            {scenario.persona.primaryGoal.split('.')[0]}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tone: </span>
                          <span className="text-foreground line-clamp-1">
                            {scenario.persona.tone.split('.')[0]}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setPreviewScenario(scenario)}
                        aria-label={`Preview scenario: ${scenario.persona.name}`}
                      >
                        <Eye className="h-4 w-4 mr-2" aria-hidden="true" />
                        Preview
                      </Button>
                      <Link href={`/roleplay/${scenario.id}`} className="flex-1" aria-label={`Start scenario: ${scenario.persona.name}`}>
                        <Button className="w-full bg-black hover:bg-gray-900 text-white transition-smooth group-hover:shadow-lg">
                          <PlayCircle className="h-4 w-4 mr-2" aria-hidden="true" />
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

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Card className="border-gray-200 bg-gray-50">
            <CardContent className="py-6">
              <p className="text-sm text-muted-foreground">
                💡 <strong>Tip:</strong> Practice each scenario multiple times to master different objection handling approaches.
                Track your progress in the Analytics dashboard.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Modal */}
      <ScenarioPreviewModal
        scenario={previewScenario}
        open={!!previewScenario}
        onClose={() => setPreviewScenario(null)}
      />
    </ProtectedRoute>
  );
}

export default memo(ScenariosPage);
