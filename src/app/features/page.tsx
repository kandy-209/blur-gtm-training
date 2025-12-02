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
  BookOpen,
  ExternalLink,
  Youtube,
  FileText,
  PlayCircle,
  X
} from 'lucide-react';
import Link from 'next/link';

const categoryIcons: Record<string, any> = {
  productivity: TrendingUp,
  collaboration: Users,
  security: Shield,
  'code-quality': Sparkles,
  'developer-experience': Code,
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

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-3">
              Cursor Features
            </h1>
            <p className="text-lg text-gray-600">
              Learn how Cursor features impact engineering teams and ROI
            </p>
          </div>

          {/* View Toggle */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setSelectedView('overview')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedView === 'overview'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setSelectedView('leadership')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedView === 'leadership'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <DollarSign className="h-4 w-4" />
              Leadership ROI
            </button>
            <button
              onClick={() => setSelectedView('ic')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedView === 'ic'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users className="h-4 w-4" />
              IC Impact
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search features..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200 focus:border-gray-400"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full sm:w-[200px] border-gray-200">
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

          {/* Feature Chat Assistant */}
          <div className="mb-12">
            <FeatureChat initialRole={selectedView} />
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

                return (
                  <Card
                    key={feature.id}
                    className="border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg cursor-pointer group"
                    onClick={() => setSelectedFeature(feature)}
                  >
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <CategoryIcon className="h-5 w-5 text-gray-600" />
                          <CardTitle className="text-lg font-semibold">{feature.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {(feature.impactOnTeams.leadership.videoLinks?.length || 
                            feature.impactOnTeams.leadership.youtubeLinks?.length ||
                            feature.impactOnTeams.leadership.blogLinks?.length ||
                            feature.impactOnTeams.ic.videoLinks?.length ||
                            feature.impactOnTeams.ic.youtubeLinks?.length ||
                            feature.impactOnTeams.ic.blogLinks?.length) && (
                            <Badge variant="outline" className="text-xs border-blue-200 text-blue-700">
                              <PlayCircle className="h-3 w-3 mr-1" />
                              Media
                            </Badge>
                          )}
                          <Badge variant="outline" className="text-xs border-gray-200">
                            {feature.category.replace('-', ' ')}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* ROI Preview based on view */}
                      {selectedView === 'leadership' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-gray-600" />
                            <span className="text-xs font-medium text-gray-900">ROI:</span>
                          </div>
                          <p className="text-xs text-gray-700">{feature.impactOnTeams.leadership.roi}</p>
                        </div>
                      )}

                      {selectedView === 'ic' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="h-4 w-4 text-gray-600" />
                            <span className="text-xs font-medium text-gray-900">Time Saved:</span>
                          </div>
                          <p className="text-xs text-gray-700">{feature.impactOnTeams.ic.timeSaved}</p>
                        </div>
                      )}

                      {/* Key Benefits */}
                      <div>
                        <p className="text-xs font-medium text-gray-900 mb-2">Key Benefits:</p>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {feature.keyBenefits.slice(0, 3).map((benefit, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <span className="text-gray-400 mt-0.5">•</span>
                              <span className="line-clamp-1">{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 group-hover:gap-3 transition-all pt-2">
                        Learn More
                        <ChevronRight className="h-4 w-4" />
                      </div>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="relative z-50 bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white">
          <h2 className="text-2xl font-bold text-gray-900">{feature.name}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6 space-y-8">
          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
          </div>

          {/* Leadership View */}
          {(view === 'overview' || view === 'leadership') && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <DollarSign className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Leadership ROI</h3>
              </div>
              
              <div className="mb-4">
                <p className="font-medium text-gray-900 mb-2">ROI Summary:</p>
                <p className="text-sm text-gray-700">{feature.impactOnTeams.leadership.roi}</p>
              </div>

              <div className="mb-4">
                <p className="font-medium text-gray-900 mb-2">Key Metrics:</p>
                <ul className="space-y-2">
                  {feature.impactOnTeams.leadership.metrics.map((metric, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-2">Business Value:</p>
                <ul className="space-y-2">
                  {feature.impactOnTeams.leadership.businessValue.map((value, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <Target className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Blog Links */}
              {feature.impactOnTeams.leadership.blogLinks && feature.impactOnTeams.leadership.blogLinks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Related Blog Posts:
                  </p>
                  <div className="space-y-2">
                    {feature.impactOnTeams.leadership.blogLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:underline transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Links */}
              {feature.impactOnTeams.leadership.youtubeLinks && feature.impactOnTeams.leadership.youtubeLinks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Youtube className="h-4 w-4" />
                    Related Videos:
                  </p>
                  <div className="space-y-2">
                    {feature.impactOnTeams.leadership.youtubeLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:underline transition-colors"
                      >
                        <Youtube className="h-3 w-3" />
                        <span>{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Links */}
              {feature.impactOnTeams.leadership.videoLinks && feature.impactOnTeams.leadership.videoLinks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Demo Videos:
                  </p>
                  <div className="space-y-4">
                    {feature.impactOnTeams.leadership.videoLinks.map((video, idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">{video.title}</p>
                        <video
                          controls
                          className="w-full rounded-lg border border-gray-200"
                          preload="metadata"
                        >
                          <source src={video.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* IC View */}
          {(view === 'overview' || view === 'ic') && (
            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-gray-700" />
                <h3 className="text-lg font-semibold text-gray-900">Individual Contributor Impact</h3>
              </div>

              <div className="mb-4">
                <p className="font-medium text-gray-900 mb-2">Productivity Impact:</p>
                <p className="text-sm text-gray-700">{feature.impactOnTeams.ic.productivity}</p>
              </div>

              <div className="mb-4">
                <p className="font-medium text-gray-900 mb-2">Daily Impact:</p>
                <ul className="space-y-2">
                  {feature.impactOnTeams.ic.dailyImpact.map((impact, idx) => (
                    <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                      <Clock className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span>{impact}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-medium text-gray-900 mb-2">Time Saved:</p>
                <p className="text-sm text-gray-700 font-semibold">{feature.impactOnTeams.ic.timeSaved}</p>
              </div>

              {/* Blog Links */}
              {feature.impactOnTeams.ic.blogLinks && feature.impactOnTeams.ic.blogLinks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Related Blog Posts:
                  </p>
                  <div className="space-y-2">
                    {feature.impactOnTeams.ic.blogLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:underline transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        <span>{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* YouTube Links */}
              {feature.impactOnTeams.ic.youtubeLinks && feature.impactOnTeams.ic.youtubeLinks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <Youtube className="h-4 w-4" />
                    Related Videos:
                  </p>
                  <div className="space-y-2">
                    {feature.impactOnTeams.ic.youtubeLinks.map((link, idx) => (
                      <a
                        key={idx}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 hover:underline transition-colors"
                      >
                        <Youtube className="h-3 w-3" />
                        <span>{link.title}</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Video Links */}
              {feature.impactOnTeams.ic.videoLinks && feature.impactOnTeams.ic.videoLinks.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                    <PlayCircle className="h-4 w-4" />
                    Demo Videos:
                  </p>
                  <div className="space-y-4">
                    {feature.impactOnTeams.ic.videoLinks.map((video, idx) => (
                      <div key={idx} className="space-y-2">
                        <p className="text-sm font-medium text-gray-900">{video.title}</p>
                        <video
                          controls
                          className="w-full rounded-lg border border-gray-200"
                          preload="metadata"
                        >
                          <source src={video.url} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Key Benefits */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Key Benefits</h3>
            <ul className="space-y-2">
              {feature.keyBenefits.map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                  <span className="text-gray-400 mt-0.5">•</span>
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Use Cases */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Use Cases</h3>
            <div className="grid grid-cols-2 gap-3">
              {feature.useCases.map((useCase, idx) => (
                <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 border border-gray-100">
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
