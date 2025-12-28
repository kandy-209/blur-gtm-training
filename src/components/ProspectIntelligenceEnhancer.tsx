'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  Lightbulb,
  Target
} from 'lucide-react';
import { prospectIntelligenceAgent } from '@/infrastructure/agents/prospect-intelligence-agent';

interface BuyingSignal {
  type: 'strong' | 'moderate' | 'weak';
  indicator: string;
  description: string;
  confidence: number;
}

interface ProspectInsight {
  buyingSignals: BuyingSignal[];
  recommendedActions: string[];
  bestContactTime: string;
  painPoints: string[];
  decisionMakers: string[];
}

interface ProspectIntelligenceEnhancerProps {
  companyData?: {
    name: string;
    techStack?: string[];
    hiring?: any;
    financials?: any;
    news?: any[];
  };
}

/**
 * ProspectIntelligenceEnhancer - Provides AI-powered insights for prospects
 */
export default function ProspectIntelligenceEnhancer({
  companyData,
}: ProspectIntelligenceEnhancerProps) {
  const [insights, setInsights] = useState<ProspectInsight | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!companyData) return;

    setLoading(true);
    
    // Use AI prospect intelligence agent
    const analyzeWithAgent = async () => {
      try {
        const analysis = await prospectIntelligenceAgent.analyzeProspect(companyData);
        
        setInsights({
          buyingSignals: analysis.buyingSignals,
          recommendedActions: analysis.recommendedActions,
          painPoints: analysis.painPoints,
          decisionMakers: analysis.decisionMakers,
          bestContactTime: analysis.bestContactTime,
        });
        
        setLoading(false);
      } catch (error) {
        console.error('Prospect intelligence agent error:', error);
        // Fallback to rule-based analysis
        fallbackAnalysis();
      }
    };

    // Fallback rule-based analysis
    const fallbackAnalysis = () => {
      const buyingSignals: BuyingSignal[] = [];
      const recommendedActions: string[] = [];
      const painPoints: string[] = [];
      const decisionMakers: string[] = [];

      // Analyze tech stack for buying signals
      if (companyData.techStack) {
        const hasAutomation = companyData.techStack.some((tech) =>
          tech.toLowerCase().includes('automation') ||
          tech.toLowerCase().includes('scraping') ||
          tech.toLowerCase().includes('puppeteer') ||
          tech.toLowerCase().includes('playwright')
        );

        if (hasAutomation) {
          buyingSignals.push({
            type: 'strong',
            indicator: 'Active Automation User',
            description: 'Company is already using browser automation tools',
            confidence: 85,
          });
          recommendedActions.push('Highlight Browserbase advantages over their current solution');
          painPoints.push('Likely experiencing infrastructure management overhead');
        }
      }

      // Analyze hiring for buying signals
      if (companyData.hiring) {
        const engineeringHires = companyData.hiring?.engineering || 0;
        if (engineeringHires > 10) {
          buyingSignals.push({
            type: 'moderate',
            indicator: 'Rapid Engineering Growth',
            description: 'Company is scaling engineering team significantly',
            confidence: 70,
          });
          recommendedActions.push('Emphasize team collaboration and scaling features');
          painPoints.push('Likely need better tooling for growing team');
        }
      }

      // Analyze financials
      if (companyData.financials) {
        const revenue = companyData.financials.revenue;
        if (revenue && revenue > 10000000) {
          buyingSignals.push({
            type: 'strong',
            indicator: 'Strong Financial Position',
            description: 'Company has budget for enterprise solutions',
            confidence: 80,
          });
          recommendedActions.push('Focus on enterprise features and ROI');
        }
      }

      // Analyze news for buying signals
      if (companyData.news && companyData.news.length > 0) {
        const recentNews = companyData.news.slice(0, 5);
        const hasProductLaunch = recentNews.some((news: any) =>
          news.title?.toLowerCase().includes('launch') ||
          news.title?.toLowerCase().includes('product')
        );

        if (hasProductLaunch) {
          buyingSignals.push({
            type: 'moderate',
            indicator: 'Product Launch Activity',
            description: 'Company is actively launching products',
            confidence: 65,
          });
          recommendedActions.push('Position Browserbase for product testing and QA automation');
        }
      }

      // Default insights if no specific signals
      if (buyingSignals.length === 0) {
        buyingSignals.push({
          type: 'weak',
          indicator: 'Limited Signals',
          description: 'Not enough data to identify strong buying signals',
          confidence: 40,
        });
      }

      // Generate recommended actions
      if (recommendedActions.length === 0) {
        recommendedActions.push('Research company more deeply to identify specific needs');
        recommendedActions.push('Reach out with general Browserbase value proposition');
      }

      // Generate pain points
      if (painPoints.length === 0) {
        painPoints.push('Likely managing browser automation infrastructure');
        painPoints.push('May need better scaling and reliability');
      }

      // Generate decision makers (placeholder - would come from actual research)
      decisionMakers.push('VP of Engineering');
      decisionMakers.push('CTO');
      decisionMakers.push('Head of Infrastructure');

      setInsights({
        buyingSignals,
        recommendedActions,
        bestContactTime: 'Tuesday-Thursday, 10am-2pm',
        painPoints,
        decisionMakers,
      });

      setLoading(false);
    };

    analyzeWithAgent();
  }, [companyData]);

  if (!companyData) {
    return null;
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Analyzing Prospect...</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Generating AI-powered insights...</p>
        </CardContent>
      </Card>
    );
  }

  if (!insights) {
    return null;
  }

  const getSignalColor = (type: BuyingSignal['type']) => {
    switch (type) {
      case 'strong':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSignalIcon = (type: BuyingSignal['type']) => {
    switch (type) {
      case 'strong':
        return <CheckCircle className="h-4 w-4" />;
      case 'moderate':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          AI-Powered Prospect Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Buying Signals */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
            <TrendingUp className="h-3 w-3" />
            Buying Signals
          </h4>
          <div className="space-y-2">
            {insights.buyingSignals.map((signal, index) => (
              <div
                key={index}
                className={`p-2 rounded border ${getSignalColor(signal.type)}`}
              >
                <div className="flex items-start gap-2">
                  {getSignalIcon(signal.type)}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium">{signal.indicator}</span>
                      <Badge variant="secondary" className="text-xs">
                        {signal.confidence}%
                      </Badge>
                    </div>
                    <p className="text-xs">{signal.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Actions */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
            <Target className="h-3 w-3" />
            Recommended Actions
          </h4>
          <ul className="space-y-1">
            {insights.recommendedActions.map((action, index) => (
              <li key={index} className="text-xs flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Pain Points */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
            <AlertCircle className="h-3 w-3" />
            Likely Pain Points
          </h4>
          <ul className="space-y-1">
            {insights.painPoints.map((pain, index) => (
              <li key={index} className="text-xs flex items-start gap-2">
                <span className="text-orange-600 mt-0.5">•</span>
                <span>{pain}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Decision Makers */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
            <Users className="h-3 w-3" />
            Target Decision Makers
          </h4>
          <div className="flex flex-wrap gap-2">
            {insights.decisionMakers.map((dm, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {dm}
              </Badge>
            ))}
          </div>
        </div>

        {/* Best Contact Time */}
        <div>
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            Best Contact Time
          </h4>
          <p className="text-xs text-muted-foreground">{insights.bestContactTime}</p>
        </div>
      </CardContent>
    </Card>
  );
}

