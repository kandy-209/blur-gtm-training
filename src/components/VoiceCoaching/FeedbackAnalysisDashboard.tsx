/**
 * Feedback Analysis Dashboard
 * Comprehensive feedback analysis display with ML-like insights
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, 
  Target, Zap, Calendar, Briefcase, Lightbulb, AlertCircle, Info,
  Award, BarChart3, Activity
} from 'lucide-react';
import type { FeedbackAnalysis } from '@/lib/voice-coaching/feedback-analyzer';
import { Loader2 } from 'lucide-react';

interface FeedbackAnalysisDashboardProps {
  userId: string;
}

export function FeedbackAnalysisDashboard({ userId }: FeedbackAnalysisDashboardProps) {
  const [analysis, setAnalysis] = useState<FeedbackAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, [userId]);

  const loadAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `/api/voice-coaching/feedback-analysis?userId=${userId}`
      );

      if (!response.ok) {
        throw new Error('Failed to load analysis');
      }

      const data = await response.json();
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analysis');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>Analyzing your performance data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analysis) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            {error || 'No analysis data available. Complete more sessions to generate analysis.'}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'moderate':
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI-Powered Feedback Analysis
          </CardTitle>
          <CardDescription>
            Comprehensive analysis based on {analysis.patterns.length} patterns and multiple data points
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-4xl font-bold">{analysis.overallScore}</div>
              <div className="text-sm text-muted-foreground">Overall Performance Score</div>
            </div>
            <div className="text-right">
              <Badge variant={analysis.overallScore >= 80 ? 'default' : analysis.overallScore >= 60 ? 'secondary' : 'destructive'}>
                {analysis.overallScore >= 80 ? 'Excellent' : analysis.overallScore >= 60 ? 'Good' : 'Needs Improvement'}
              </Badge>
            </div>
          </div>
          <Progress value={analysis.overallScore} className="h-3" />
        </CardContent>
      </Card>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Your Strengths
            </CardTitle>
            <CardDescription>{analysis.strengths.length} areas of strength</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.strengths.length > 0 ? (
                analysis.strengths.map((strength, i) => (
                  <div key={i} className="p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{strength.metric}</span>
                      <div className="flex items-center gap-2">
                        {strength.trend === 'improving' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        <Badge variant="outline" className="bg-green-100">
                          {strength.score}/100
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{strength.description}</p>
                    <div className="flex items-center gap-4 text-xs">
                      <span>Consistency: {strength.consistency}%</span>
                      <span className="capitalize">Impact: {strength.impact}</span>
                    </div>
                    {strength.examples.length > 0 && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        <strong>Examples:</strong> {strength.examples.join(', ')}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Complete more sessions to identify strengths
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Weaknesses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Areas for Improvement
            </CardTitle>
            <CardDescription>{analysis.weaknesses.length} areas need attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.weaknesses.length > 0 ? (
                analysis.weaknesses.map((weakness, i) => (
                  <div key={i} className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium capitalize">{weakness.metric}</span>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${getSeverityColor(weakness.severity)}`} />
                        <Badge variant="outline" className="capitalize">
                          {weakness.severity}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{weakness.description}</p>
                    <div className="mb-2">
                      <p className="text-xs font-medium mb-1">Root Cause:</p>
                      <p className="text-xs text-muted-foreground">{weakness.rootCause}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs mb-2">
                      <span>Frequency: {weakness.frequency}%</span>
                      <span className="capitalize">Impact: {weakness.impact}</span>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Solutions:</p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        {weakness.solutions.slice(0, 2).map((sol, j) => (
                          <li key={j}>{sol}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      <strong>Expected:</strong> {weakness.expectedImprovement}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Great job! All metrics are in optimal range
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Patterns
          </CardTitle>
          <CardDescription>AI-identified patterns across your sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analysis.patterns.map((pattern, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  pattern.type === 'positive'
                    ? 'bg-green-50 border-green-200'
                    : pattern.type === 'negative'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{pattern.pattern}</span>
                  {pattern.type === 'positive' && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  {pattern.type === 'negative' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {pattern.type === 'neutral' && <Info className="h-4 w-4 text-gray-600" />}
                </div>
                <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                <div className="flex items-center gap-4 text-xs">
                  <span>Frequency: {pattern.frequency}%</span>
                  <span className="capitalize">Impact: {pattern.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prioritized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            AI Recommendations
          </CardTitle>
          <CardDescription>
            Prioritized actions based on data analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="critical">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="high">High</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
            </TabsList>

            {(['critical', 'high', 'medium', 'low'] as const).map((priority) => {
              const recs = analysis.recommendations.filter(r => r.priority === priority);
              return (
                <TabsContent key={priority} value={priority}>
                  <div className="space-y-4">
                    {recs.length > 0 ? (
                      recs.map((rec) => (
                        <div
                          key={rec.id}
                          className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold mb-1">{rec.title}</h4>
                              <p className="text-sm opacity-90 mb-2">{rec.description}</p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {rec.priority}
                            </Badge>
                          </div>

                          <div className="mb-3">
                            <p className="text-xs font-medium mb-1">Action Items:</p>
                            <ul className="text-xs list-disc list-inside space-y-1">
                              {rec.actionItems.map((item, j) => (
                                <li key={j}>{item}</li>
                              ))}
                            </ul>
                          </div>

                          <div className="grid grid-cols-3 gap-2 mb-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Immediate</div>
                              <div className="text-sm font-bold">{rec.expectedImpact.immediate}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Mid-Term</div>
                              <div className="text-sm font-bold">{rec.expectedImpact.midTerm}%</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Long-Term</div>
                              <div className="text-sm font-bold">{rec.expectedImpact.longTerm}%</div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs">
                            <span>Effort: {rec.effort} | Timeframe: {rec.timeframe}</span>
                            <span className="text-muted-foreground">
                              {rec.dataPoints.length} data points
                            </span>
                          </div>

                          <div className="mt-2">
                            <p className="text-xs font-medium mb-1">Success Criteria:</p>
                            <div className="flex flex-wrap gap-1">
                              {rec.successCriteria.map((criteria, j) => (
                                <Badge key={j} variant="outline" className="text-xs">
                                  {criteria}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No {priority} priority recommendations
                      </p>
                    )}
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Your Action Plan
          </CardTitle>
          <CardDescription>Structured plan for improvement</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="immediate">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="immediate">
                <Zap className="h-4 w-4 mr-2" />
                Immediate (1-2 weeks)
              </TabsTrigger>
              <TabsTrigger value="shortTerm">
                <Calendar className="h-4 w-4 mr-2" />
                Short-Term (2-4 weeks)
              </TabsTrigger>
              <TabsTrigger value="longTerm">
                <Briefcase className="h-4 w-4 mr-2" />
                Long-Term (1-3 months)
              </TabsTrigger>
            </TabsList>

            <TabsContent value="immediate">
              <div className="space-y-3">
                {analysis.actionPlan.immediate.map((item) => (
                  <div key={item.id} className="p-3 bg-red-50 rounded border border-red-200">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <Badge variant="outline">Priority {item.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <div className="text-xs">
                      <strong>Expected:</strong> {item.expectedOutcome}
                    </div>
                  </div>
                ))}
                {analysis.actionPlan.immediate.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No immediate actions needed
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="shortTerm">
              <div className="space-y-3">
                {analysis.actionPlan.shortTerm.map((item) => (
                  <div key={item.id} className="p-3 bg-yellow-50 rounded border border-yellow-200">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <Badge variant="outline">Priority {item.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <div className="text-xs">
                      <strong>Expected:</strong> {item.expectedOutcome}
                    </div>
                  </div>
                ))}
                {analysis.actionPlan.shortTerm.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No short-term actions planned
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="longTerm">
              <div className="space-y-3">
                {analysis.actionPlan.longTerm.map((item) => (
                  <div key={item.id} className="p-3 bg-blue-50 rounded border border-blue-200">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-medium text-sm">{item.title}</h4>
                      <Badge variant="outline">Priority {item.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                    <div className="text-xs">
                      <strong>Expected:</strong> {item.expectedOutcome}
                    </div>
                  </div>
                ))}
                {analysis.actionPlan.longTerm.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No long-term goals set
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Success Factors & Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Success Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.successFactors.map((factor, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{factor.factor}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={factor.strength} className="w-24 h-2" />
                      <span className="text-xs font-medium">{factor.strength}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{factor.description}</p>
                  <div className="text-xs text-muted-foreground">
                    Contribution: {factor.contribution.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysis.riskFactors.length > 0 ? (
                analysis.riskFactors.map((risk, i) => (
                  <div key={i} className="p-3 bg-red-50 rounded border border-red-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{risk.factor}</span>
                      <Badge variant="destructive">{risk.risk}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{risk.description}</p>
                    <div>
                      <p className="text-xs font-medium mb-1">Mitigation:</p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        {risk.mitigation.map((mit, j) => (
                          <li key={j}>{mit}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No significant risk factors identified
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predicted Outcome */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Predicted Outcome
          </CardTitle>
          <CardDescription>Based on current trends and patterns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(['best', 'likely', 'worst'] as const).map((scenario) => {
              const outcome = analysis.predictedOutcome;
              const isActive = outcome.scenario === scenario;
              
              return (
                <div
                  key={scenario}
                  className={`p-4 rounded-lg border-2 ${
                    isActive
                      ? scenario === 'best'
                        ? 'bg-green-50 border-green-300'
                        : scenario === 'worst'
                        ? 'bg-red-50 border-red-300'
                        : 'bg-blue-50 border-blue-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium capitalize">{scenario} Case</span>
                    {isActive && <Badge>Current Prediction</Badge>}
                  </div>
                  {isActive && (
                    <>
                      <div className="text-2xl font-bold mb-1">{outcome.impactScore}</div>
                      <div className="text-xs text-muted-foreground mb-2">
                        Impact Score | {outcome.probability}% probability
                      </div>
                      <p className="text-sm mb-2">{outcome.description}</p>
                      <div className="text-xs text-muted-foreground">
                        Timeframe: {outcome.timeframe}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Improvement Areas with Milestones */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Improvement Areas & Milestones
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {analysis.improvementAreas.map((area, i) => (
              <div key={i} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold capitalize">{area.metric}</h4>
                    <p className="text-sm text-muted-foreground">{area.improvementStrategy}</p>
                  </div>
                  <Badge variant="outline">Priority {area.priority.toFixed(1)}</Badge>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Current: {area.currentValue.toFixed(1)}</span>
                    <span>Target: {area.targetValue.toFixed(1)}</span>
                    <span className="text-red-600">Gap: {area.gap.toFixed(1)}</span>
                  </div>
                  <Progress 
                    value={(area.currentValue / area.targetValue) * 100} 
                    className="h-2"
                  />
                </div>

                <div>
                  <p className="text-xs font-medium mb-2">Milestones:</p>
                  <div className="space-y-2">
                    {area.milestones.map((milestone, j) => (
                      <div key={j} className="flex items-center gap-3 text-xs">
                        <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                          {j + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{milestone.description}</div>
                          <div className="text-muted-foreground">{milestone.timeframe}</div>
                        </div>
                        <Badge variant="outline">{milestone.target}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

