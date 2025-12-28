'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AdvancedFeedback } from '@/lib/feedback-enhancements-advanced';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  CheckCircle2, 
  AlertCircle, 
  Lightbulb,
  BarChart3,
  Award,
  Sparkles,
  Brain,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface AdvancedFeedbackDisplayProps {
  feedback: AdvancedFeedback;
  onClose?: () => void;
}

export default function AdvancedFeedbackDisplay({ feedback, onClose }: AdvancedFeedbackDisplayProps) {
  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern':
        return <Brain className="h-4 w-4" />;
      case 'opportunity':
        return <Zap className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'strength':
        return <Award className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* AI Insights */}
      {feedback.aiInsights.length > 0 && (
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-800">
              <Sparkles className="h-5 w-5" />
              AI-Powered Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.aiInsights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${getImpactColor(insight.impact)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getInsightIcon(insight.type)}
                    <span className="font-semibold">{insight.title}</span>
                    <Badge className={getImpactColor(insight.impact)}>
                      {insight.impact.toUpperCase()}
                    </Badge>
                  </div>
                  <Badge variant="outline">
                    {insight.confidence}% confidence
                  </Badge>
                </div>
                <p className="text-sm mb-2">{insight.description}</p>
                {insight.evidence.length > 0 && (
                  <div className="text-xs text-gray-600 mb-2">
                    <strong>Evidence:</strong> {insight.evidence.join(', ')}
                  </div>
                )}
                <p className="text-sm font-medium">{insight.recommendation}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Advanced Skills */}
      {feedback.advancedSkills.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Advanced Skill Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback.advancedSkills.map((skill, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{skill.skill}</span>
                    <Badge>{skill.level}</Badge>
                    {skill.trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-600" />}
                    {skill.trend === 'declining' && <TrendingDown className="h-4 w-4 text-red-600" />}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">{skill.score}/100</div>
                    <div className="text-xs text-gray-500">
                      {skill.benchmark.percentile}th percentile
                    </div>
                  </div>
                </div>
                
                <Progress value={skill.score} className="h-2" />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">Benchmark</div>
                    <div className="font-medium">
                      {skill.benchmark.vsAverage === 'above' ? 'Above' : skill.benchmark.vsAverage === 'below' ? 'Below' : 'At'} average
                      {skill.benchmark.gap !== 0 && ` (${skill.benchmark.gap > 0 ? '+' : ''}${skill.benchmark.gap} pts)`}
                    </div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Improvement Path</div>
                    <div className="font-medium">
                      {skill.improvementPath.current} → {skill.improvementPath.next}
                    </div>
                    <div className="text-xs text-gray-500">
                      Est: {skill.improvementPath.estimatedTime}
                    </div>
                  </div>
                </div>

                {skill.detailedFeedback.whatWentWell.length > 0 && (
                  <div className="p-2 bg-green-50 rounded">
                    <div className="text-xs font-semibold text-green-800 mb-1">What Went Well</div>
                    <ul className="text-xs text-green-700 space-y-1">
                      {skill.detailedFeedback.whatWentWell.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skill.detailedFeedback.whatNeedsWork.length > 0 && (
                  <div className="p-2 bg-orange-50 rounded">
                    <div className="text-xs font-semibold text-orange-800 mb-1">Needs Work</div>
                    <ul className="text-xs text-orange-700 space-y-1">
                      {skill.detailedFeedback.whatNeedsWork.map((item, idx) => (
                        <li key={idx}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skill.practiceRecommendations.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-1">Practice Recommendations</div>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {skill.practiceRecommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <Lightbulb className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Conversation Quality */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Conversation Quality Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Quality</span>
              <span className="text-2xl font-bold">{feedback.conversationQuality.overall.toFixed(0)}/100</span>
            </div>
            <Progress value={feedback.conversationQuality.overall} className="h-3" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(feedback.conversationQuality.breakdown).map(([key, value]) => (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                  <span className="text-sm font-semibold">{value.toFixed(0)}</span>
                </div>
                <Progress value={value} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      {feedback.personalizedRecommendations.length > 0 && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Lightbulb className="h-5 w-5" />
              Personalized Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedback.personalizedRecommendations
              .sort((a, b) => {
                const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
                return priorityOrder[b.priority] - priorityOrder[a.priority];
              })
              .map((rec, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border-2 ${
                    rec.priority === 'critical'
                      ? 'bg-red-50 border-red-300'
                      : rec.priority === 'high'
                      ? 'bg-orange-50 border-orange-300'
                      : rec.priority === 'medium'
                      ? 'bg-yellow-50 border-yellow-300'
                      : 'bg-blue-50 border-blue-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <Badge className={
                      rec.priority === 'critical'
                        ? 'bg-red-100 text-red-800'
                        : rec.priority === 'high'
                        ? 'bg-orange-100 text-orange-800'
                        : rec.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-blue-100 text-blue-800'
                    }>
                      {rec.priority.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{rec.category}</Badge>
                  </div>
                  <p className="font-semibold mb-1">{rec.recommendation}</p>
                  <p className="text-sm text-gray-600 mb-2">{rec.rationale}</p>
                  <p className="text-xs text-gray-500 mb-2">
                    <strong>Expected Impact:</strong> {rec.expectedImpact}
                  </p>
                  <div>
                    <div className="text-xs font-semibold mb-1">Action Steps:</div>
                    <ol className="text-xs space-y-1 ml-4">
                      {rec.actionSteps.map((step, stepIndex) => (
                        <li key={stepIndex} className="list-decimal">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Comparative Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Comparative Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-semibold mb-2">vs Peers</div>
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-2xl font-bold mb-1">{feedback.comparativeAnalysis.vsPeers.percentile}th Percentile</div>
              {feedback.comparativeAnalysis.vsPeers.strengths.length > 0 && (
                <div className="text-xs mb-1">
                  <strong>Strengths:</strong> {feedback.comparativeAnalysis.vsPeers.strengths.join(', ')}
                </div>
              )}
              {feedback.comparativeAnalysis.vsPeers.gaps.length > 0 && (
                <div className="text-xs">
                  <strong>Gaps:</strong> {feedback.comparativeAnalysis.vsPeers.gaps.join(', ')}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

