'use client';

import { useState, useMemo } from 'react';
import { enterpriseFeatures, enterpriseCategories, EnterpriseFeature } from '@/data/enterprise-features';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import ProtectedRoute from '@/components/ProtectedRoute';
import { EmptyState } from '@/components/ui/empty-state';
import { EnterpriseChat } from '@/components/EnterpriseChat';
import { 
  Search, 
  Shield, 
  Users, 
  Lock, 
  Settings, 
  BarChart3,
  CheckCircle2,
  Rocket,
  Link2,
  ChevronRight,
  Building2,
  ExternalLink,
  FileText,
  Youtube,
  CheckCircle,
  ArrowRight,
  Code,
  Terminal,
  Cloud,
  Lightbulb
} from 'lucide-react';
import Link from 'next/link';

const categoryIcons: Record<string, any> = {
  security: Shield,
  access: Users,
  privacy: Lock,
  controls: Settings,
  analytics: BarChart3,
  compliance: CheckCircle2,
  deployment: Rocket,
  integration: Link2,
};

const categoryColors: Record<string, string> = {
  security: 'bg-red-100 text-red-700 border-red-200',
  access: 'bg-blue-100 text-blue-700 border-blue-200',
  privacy: 'bg-purple-100 text-purple-700 border-purple-200',
  controls: 'bg-orange-100 text-orange-700 border-orange-200',
  analytics: 'bg-green-100 text-green-700 border-green-200',
  compliance: 'bg-teal-100 text-teal-700 border-teal-200',
  deployment: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  integration: 'bg-pink-100 text-pink-700 border-pink-200',
};

export default function EnterprisePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedView, setSelectedView] = useState<'overview' | 'leadership' | 'technical'>('overview');
  const [selectedFeature, setSelectedFeature] = useState<EnterpriseFeature | null>(null);

  const filteredFeatures = useMemo(() => {
    return enterpriseFeatures.filter(feature => {
      const matchesSearch = 
        feature.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        feature.keyBenefits.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || feature.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const getCategoryIcon = (category: string) => {
    const Icon = categoryIcons[category] || Settings;
    return <Icon className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || 'bg-gray-100 text-gray-700 border-gray-200';
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-gray-900 mb-3">
              Cursor Enterprise
            </h1>
            <p className="text-lg text-gray-600">
              Enterprise-grade security, compliance, and administrative controls
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
              <BarChart3 className="h-4 w-4" />
              Leadership Value
            </button>
            <button
              onClick={() => setSelectedView('technical')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                selectedView === 'technical'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Code className="h-4 w-4" />
              Technical Details
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
              <Input
                placeholder="Search enterprise features..."
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
                {enterpriseCategories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Quick Links */}
          <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-4">
            <a 
              href="https://trust.cursor.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Trust Center</p>
                      <p className="text-xs text-gray-600 group-hover:text-gray-900 flex items-center gap-1 mt-1">
                        View certifications <ExternalLink className="h-3 w-3" />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
            <a 
              href="https://cursor.com/docs/enterprise" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Enterprise Docs</p>
                      <p className="text-xs text-gray-600 group-hover:text-gray-900 flex items-center gap-1 mt-1">
                        Read documentation <ExternalLink className="h-3 w-3" />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
            <a 
              href="https://cursor.com/security" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group"
            >
              <Card className="border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg h-full">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="h-5 w-5 text-gray-600 group-hover:text-gray-900 transition-colors" />
                    <div>
                      <p className="font-semibold text-sm text-gray-900">Security Page</p>
                      <p className="text-xs text-gray-600 group-hover:text-gray-900 flex items-center gap-1 mt-1">
                        Security details <ExternalLink className="h-3 w-3" />
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>
          </div>

          {/* Enterprise Chat Assistant */}
          <div className="mb-12">
            <EnterpriseChat initialView={selectedView} />
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
                const CategoryIcon = categoryIcons[feature.category] || Settings;

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
                        <Badge variant="outline" className="text-xs border-gray-200">
                          {feature.category.replace('-', ' ')}
                        </Badge>
                      </div>
                      <CardDescription className="text-sm text-gray-600 line-clamp-2">
                        {feature.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Value Preview based on view */}
                      {selectedView === 'leadership' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <BarChart3 className="h-4 w-4 text-gray-600" />
                            <span className="text-xs font-medium text-gray-900">Value:</span>
                          </div>
                          <p className="text-xs text-gray-700">{feature.salesTalkingPoints.leadership.value}</p>
                        </div>
                      )}

                      {selectedView === 'technical' && (
                        <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                          <div className="flex items-center gap-2 mb-1">
                            <Code className="h-4 w-4 text-gray-600" />
                            <span className="text-xs font-medium text-gray-900">Capabilities:</span>
                          </div>
                          <ul className="text-xs text-gray-700 space-y-1">
                            {feature.salesTalkingPoints.technical.capabilities.slice(0, 2).map((cap, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-gray-400 mt-0.5">•</span>
                                <span className="line-clamp-1">{cap}</span>
                              </li>
                            ))}
                          </ul>
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
            <EnterpriseFeatureModal
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

function EnterpriseFeatureModal({ 
  feature, 
  view,
  onClose 
}: { 
  feature: EnterpriseFeature; 
  view: 'overview' | 'leadership' | 'technical';
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
                <BarChart3 className="h-5 w-5 text-green-700" />
                <h3 className="text-lg font-semibold text-green-900">Leadership Value</h3>
              </div>
              
              <div className="mb-4">
                <p className="font-medium text-green-900 mb-2">Value Proposition:</p>
                <p className="text-sm text-green-800">{feature.salesTalkingPoints.leadership.value}</p>
              </div>

              <div className="mb-4">
                <p className="font-medium text-green-900 mb-2">Key Metrics:</p>
                <ul className="space-y-1">
                  {feature.salesTalkingPoints.leadership.metrics.map((metric, idx) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{metric}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-medium text-green-900 mb-2">Business Value:</p>
                <ul className="space-y-1">
                  {feature.salesTalkingPoints.leadership.businessValue.map((value, idx) => (
                    <li key={idx} className="text-sm text-green-800 flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Technical View */}
          {(view === 'overview' || view === 'technical') && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <div className="flex items-center gap-2 mb-4">
                <Code className="h-5 w-5 text-blue-700" />
                <h3 className="text-lg font-semibold text-blue-900">Technical Details</h3>
              </div>

              <div className="mb-4">
                <p className="font-medium text-blue-900 mb-2">Capabilities:</p>
                <ul className="space-y-1">
                  {feature.salesTalkingPoints.technical.capabilities.map((cap, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mb-4">
                <p className="font-medium text-blue-900 mb-2">Implementation:</p>
                <ul className="space-y-1">
                  {feature.salesTalkingPoints.technical.implementation.map((impl, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                      <Settings className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{impl}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <p className="font-medium text-blue-900 mb-2">Advantages:</p>
                <ul className="space-y-1">
                  {feature.salesTalkingPoints.technical.advantages.map((adv, idx) => (
                    <li key={idx} className="text-sm text-blue-800 flex items-start gap-2">
                      <ArrowRight className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span>{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Documentation */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">Documentation & Setup</h3>
            </div>

            <div className="mb-4">
              <p className="font-medium text-gray-900 mb-2">Overview:</p>
              <p className="text-sm text-gray-800">{feature.documentation.overview}</p>
            </div>

            <div className="mb-4">
              <p className="font-medium text-gray-900 mb-2">Setup Steps:</p>
              <ol className="space-y-2">
                {feature.documentation.setupSteps.map((step, idx) => (
                  <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                    <span className="font-semibold text-gray-600 mt-0.5">{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mb-4">
              <p className="font-medium text-gray-900 mb-2">Key Points:</p>
              <ul className="space-y-1">
                {feature.documentation.keyPoints.map((point, idx) => (
                  <li key={idx} className="text-sm text-gray-800 flex items-start gap-2">
                    <CheckCircle className="h-3 w-3 text-gray-600 mt-0.5 flex-shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            {(feature.documentation.resources.docsUrl || 
              feature.documentation.resources.blogLinks?.length || 
              feature.documentation.resources.youtubeLinks?.length) && (
              <div className="pt-4 border-t border-gray-300">
                <p className="font-medium text-gray-900 mb-2">Resources:</p>
                <div className="space-y-2">
                  {feature.documentation.resources.docsUrl && (
                    <a
                      href={feature.documentation.resources.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-800 hover:text-gray-900 hover:underline transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      <span>Official Documentation</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  {feature.documentation.resources.blogLinks?.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-800 hover:text-gray-900 hover:underline transition-colors"
                    >
                      <FileText className="h-3 w-3" />
                      <span>{link.title}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                  {feature.documentation.resources.youtubeLinks?.map((link, idx) => (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-gray-800 hover:text-gray-900 hover:underline transition-colors"
                    >
                      <Youtube className="h-3 w-3" />
                      <span>{link.title}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </div>
            )}
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

