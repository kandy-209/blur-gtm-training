'use client';

import { useState, useMemo } from 'react';
import { cursorFeatures, featureCategories, CursorFeature } from '@/data/cursor-features';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EmptyState } from '@/components/ui/empty-state';
import { FeatureChat } from '@/components/FeatureChat';
import { 
  Search, 
  TrendingUp, 
  Users, 
  Shield, 
  Sparkles, 
  Code,
  DollarSign,
  Clock,
  Target,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import Link from 'next/link';

const categoryIcons: Record<string, any> = {
  productivity: TrendingUp,
  collaboration: Users,
  security: Shield,
  'code-quality': Sparkles,
  'developer-experience': Code,
};

const categoryColors: Record<string, string> = {
  productivity: 'bg-blue-100 text-blue-700 border-blue-200',
  collaboration: 'bg-purple-100 text-purple-700 border-purple-200',
  security: 'bg-red-100 text-red-700 border-red-200',
  'code-quality': 'bg-green-100 text-green-700 border-green-200',
  'developer-experience': 'bg-orange-100 text-orange-700 border-orange-200',
};

export default function FeaturesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'overview' | 'leadership' | 'ic'>('overview');
  const [selectedFeature, setSelectedFeature] = useState<CursorFeature | null>(null);

  const filteredFeatures = useMemo(() => {
    return cursorFeatures.filter(feature => {
      const matchesSearch = 
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.keyBenefits.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || Code;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-12 w-12 rounded-lg bg-black flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">Cursor Features</h1>
              <p className="text-muted-foreground mt-1">
                Learn how Cursor features impact engineering teams and ROI
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex gap-2 mb-6">
            <Button
              variant={selectedView === 'overview' ? 'default' : 'outline'}
              onClick={() => setSelectedView('overview')}
              className={selectedView === 'overview' ? 'bg-black hover:bg-gray-900 text-white' : ''}
            >
              Overview
            </Button>
            <Button
              variant={selectedView === 'leadership' ? 'default' : 'outline'}
              onClick={() => setSelectedView('leadership')}
              className={selectedView === 'leadership' ? 'bg-black hover:bg-gray-900 text-white' : ''}
            >
              <DollarSign className="h-4 w-4 mr-2" />
              Leadership ROI
            </Button>
            <Button
              variant={selectedView === 'ic' ? 'default' : 'outline'}
              onClick={() => setSelectedView('ic')}
              className={selectedView === 'ic' ? 'bg-black hover:bg-gray-900 text-white' : ''}
            >
              <Users className="h-4 w-4 mr-2" />
              IC Impact
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                {featureCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Feature Chat Assistant */}
        <div className="mb-8">
          <FeatureChat />
        </div>

        {/* Features Grid */}
        {filteredFeatures.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No features found"
            description="Try adjusting your search or filter"
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFeatures.map((feature) => {
              const CategoryIcon = categoryIcons[feature.category] || Code;
              const categoryColor = getCategoryColor(feature.category);

              return (
                <Card
                  key={feature.id}
                  className="hover-lift border-gray-200 transition-smooth cursor-pointer"
                  onClick={() => setSelectedFeature(feature)}
                >
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle className="text-lg font-semibold pr-2">{feature.name}</CardTitle>
                      <Badge className={categoryColor}>
                        <CategoryIcon className="h-3 w-3 mr-1" />
                        {feature.category.replace('-', ' ')}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm line-clamp-2">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* ROI Preview based on view */}
                    {selectedView === 'leadership' && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-green-700" />
                          <span className="text-xs font-semibold text-green-900">ROI:</span>
                        </div>
                        <p className="text-xs text-green-800">{feature.impactOnTeams.leadership.roi}</p>
                      </div>
                    )}

                    {selectedView === 'ic' && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="h-4 w-4 text-blue-700" />
                          <span className="text-xs font-semibold text-blue-900">Time Saved:</span>
                        </div>
                        <p className="text-xs text-blue-800">{feature.impactOnTeams.ic.timeSaved}</p>
                      </div>
                    )}

                    {/* Key Benefits */}
                    <div>
                      <p className="text-xs font-semibold mb-2">Key Benefits:</p>
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {feature.keyBenefits.slice(0, 3).map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-gray-400 mt-0.5">•</span>
                            <span className="line-clamp-1">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFeature(feature);
                      }}
                    >
                      Learn More <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Feature Detail Modal */}
        {selectedFeature && (
          <FeatureDetailModal
            feature={selectedFeature}
            view={selectedView}
            onClose={() => setSelectedFeature(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

function FeatureDetailModal({ 
  feature, 
  view,
  onClose 
}: { 
  feature: CursorFeature; 
  view: 'overview' | 'leadership' | 'ic';
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-50 bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold">{feature.name}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </div>

        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>

          {/* Leadership View */}
          {(view === 'overview' || view === 'leadership') && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-green-700" />
                <h3 className="text-lg font-semibold text-green-900">Leadership ROI</h3>
              </div>
              
              <div className="mb-4">
                <p className="font-medium text-green-900 mb-2">ROI Summary:</p>
                <p className="text-sm text-green-800">{feature.impactOnTeams.leadership.roi}</p>
              </div>

              <div className="mb-4">
                <p className="font-medium text-green-900 mb-2">Key Metrics:</p>
                <ul className="space-y-1">
                  {feature.impactOnTeams.leadership.metrics.map((metric, idx) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-medium text-green-900 mb-2">Business Value:</p>
                <ul className="space-y-1">
                  {feature.impactOnTeams.leadership.businessValue.map((value, idx) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <Target className="h-4 w-4 text-green-600 mt-0.5" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* IC View */}
          {(view === 'overview' || view === 'ic') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-blue-700" />
                <h3 className="text-lg font-semibold text-blue-900">Individual Contributor Impact</h3>
              </div>

              <div className="mb-4">
                <p className="font-medium text-blue-900 mb-2">Productivity Impact:</p>
                <p className="text-sm text-blue-800">{feature.impactOnTeams.ic.productivity}</p>
              </div>

              <div className="mb-4">
                <p className="font-medium text-blue-900 mb-2">Daily Impact:</p>
                <ul className="space-y-1">
                  {feature.impactOnTeams.ic.dailyImpact.map((impact, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                      <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                      <span>{impact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-medium text-blue-900 mb-2">Time Saved:</p>
                <p className="text-sm text-blue-800 font-semibold">{feature.impactOnTeams.ic.timeSaved}</p>
              </div>
            </div>
          )}

          {/* Key Benefits */}
          <div>
            <h3 className="font-semibold mb-3">Key Benefits</h3>
            <ul className="space-y-2">
              {feature.keyBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="font-semibold mb-3">Use Cases</h3>
            <div className="grid grid-cols-2 gap-2">
              {feature.useCases.map((useCase, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                  {useCase}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

