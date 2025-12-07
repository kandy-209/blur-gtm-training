/**
 * User Impact Dashboard
 * Comprehensive dashboard showing user improvement and impact analysis
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, TrendingDown, Minus, Target, Award, Clock, 
  Zap, Calendar, Briefcase, CheckCircle2, AlertCircle, Info
} from 'lucide-react';
import type { UserVoiceProfile, ImpactAnalysis } from '@/lib/voice-coaching/user-model';
import type { ImprovementTrend } from '@/lib/voice-coaching/user-model';

interface UserImpactDashboardProps {
  userId: string;
  profile: UserVoiceProfile;
  impactAnalysis: ImpactAnalysis;
}

export function UserImpactDashboard({ userId, profile, impactAnalysis }: UserImpactDashboardProps) {
  const [selectedMetric, setSelectedMetric] = useState<keyof ImprovementTrend>('pace');

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getImpactColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPriorityColor = (priority: 'high' | 'medium' | 'low'): string => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Impact Scores Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Immediate Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getImpactColor(impactAnalysis.immediateImpact.score)}`}>
              {impactAnalysis.immediateImpact.score}
            </div>
            <Progress 
              value={impactAnalysis.immediateImpact.score} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Current session performance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Mid-Term Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getImpactColor(impactAnalysis.midTermImpact.score)}`}>
              {impactAnalysis.midTermImpact.score}
            </div>
            <Progress 
              value={impactAnalysis.midTermImpact.score} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {impactAnalysis.midTermImpact.timeframe}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Briefcase className="h-4 w-4" />
              Long-Term Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getImpactColor(impactAnalysis.longTermImpact.score)}`}>
              {impactAnalysis.longTermImpact.score}
            </div>
            <Progress 
              value={impactAnalysis.longTermImpact.score} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {impactAnalysis.longTermImpact.timeframe}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4" />
              Overall Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${getImpactColor(profile.impactScore.overall)}`}>
              {profile.impactScore.overall}
            </div>
            <Progress 
              value={profile.impactScore.overall} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Weighted average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Trends</CardTitle>
          <CardDescription>
            Track your progress across all voice metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pace" onValueChange={(v) => setSelectedMetric(v as keyof ImprovementTrend)}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="pace">Pace</TabsTrigger>
              <TabsTrigger value="pitch">Pitch</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
              <TabsTrigger value="pauses">Pauses</TabsTrigger>
              <TabsTrigger value="clarity">Clarity</TabsTrigger>
              <TabsTrigger value="confidence">Confidence</TabsTrigger>
            </TabsList>

            {(['pace', 'pitch', 'volume', 'pauses', 'clarity', 'confidence'] as const).map((metric) => {
              const trend = profile.improvementTrend[metric];
              return (
                <TabsContent key={metric} value={metric}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold capitalize">{metric}</h3>
                        <p className="text-sm text-muted-foreground">
                          {trend.change > 0 ? '+' : ''}{trend.change.toFixed(1)}% change from baseline
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getTrendIcon(trend.trend)}
                        <Badge variant={trend.trend === 'improving' ? 'default' : 'secondary'}>
                          {trend.trend}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Baseline</p>
                        <p className="text-2xl font-bold">{trend.baseline.toFixed(1)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Current</p>
                        <p className="text-2xl font-bold">{trend.current.toFixed(1)}</p>
                      </div>
                    </div>

                    {/* Trend Chart */}
                    <div className="h-32 bg-gray-100 rounded p-2 flex items-end gap-1">
                      {trend.sessions.map((session, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-blue-500 rounded-t"
                          style={{
                            height: `${(session.value / Math.max(...trend.sessions.map(s => s.value))) * 100}%`,
                            minHeight: '2px'
                          }}
                          title={`${session.value.toFixed(1)} - ${new Date(session.date).toLocaleDateString()}`}
                        />
                      ))}
                    </div>
                  </div>
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Impact Analysis Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Immediate Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Immediate Impact
            </CardTitle>
            <CardDescription>Current session performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Impact Score</span>
                <span className={`text-2xl font-bold ${getImpactColor(impactAnalysis.immediateImpact.score)}`}>
                  {impactAnalysis.immediateImpact.score}
                </span>
              </div>
              <Progress value={impactAnalysis.immediateImpact.score} />
            </div>
            <p className="text-sm text-muted-foreground">
              {impactAnalysis.immediateImpact.description}
            </p>
            <div>
              <h4 className="text-sm font-medium mb-2">Key Improvements:</h4>
              <ul className="space-y-1">
                {impactAnalysis.immediateImpact.improvements.map((imp, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-3 w-3 text-green-600" />
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Mid-Term Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Mid-Term Impact
            </CardTitle>
            <CardDescription>{impactAnalysis.midTermImpact.timeframe}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Projected Score</span>
                <span className={`text-2xl font-bold ${getImpactColor(impactAnalysis.midTermImpact.score)}`}>
                  {impactAnalysis.midTermImpact.score}
                </span>
              </div>
              <Progress value={impactAnalysis.midTermImpact.score} />
            </div>
            <p className="text-sm text-muted-foreground">
              {impactAnalysis.midTermImpact.description}
            </p>
            <div>
              <h4 className="text-sm font-medium mb-2">Projected Improvements:</h4>
              <ul className="space-y-1">
                {impactAnalysis.midTermImpact.projectedImprovements.map((imp, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <Target className="h-3 w-3 text-blue-600" />
                    {imp}
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Long-Term Impact */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Long-Term Impact
          </CardTitle>
          <CardDescription>{impactAnalysis.longTermImpact.timeframe}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Career Impact Score</span>
              <span className={`text-2xl font-bold ${getImpactColor(impactAnalysis.longTermImpact.score)}`}>
                {impactAnalysis.longTermImpact.score}
              </span>
            </div>
            <Progress value={impactAnalysis.longTermImpact.score} />
          </div>
          <p className="text-sm text-muted-foreground">
            {impactAnalysis.longTermImpact.description}
          </p>
          <div>
            <h4 className="text-sm font-medium mb-2">Career Benefits:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {impactAnalysis.longTermImpact.careerBenefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 p-2 bg-green-50 rounded">
                  <Award className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Personalized Recommendations
          </CardTitle>
          <CardDescription>
            Prioritized actions for maximum impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {impactAnalysis.recommendations.map((rec, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${getPriorityColor(rec.priority)}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {rec.priority === 'high' && <AlertCircle className="h-4 w-4" />}
                    {rec.priority === 'medium' && <Info className="h-4 w-4" />}
                    {rec.priority === 'low' && <CheckCircle2 className="h-4 w-4" />}
                    <Badge variant="outline" className="capitalize">
                      {rec.priority} Priority
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">{rec.timeframe}</span>
                </div>
                <h4 className="font-medium mb-1">{rec.action}</h4>
                <p className="text-sm opacity-90">{rec.expectedImpact}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sessions Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{profile.sessionsCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Total practice sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Practice Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(profile.totalPracticeTime / 60000)}m
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total practice time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {new Date(profile.lastSessionDate).toLocaleDateString()}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {new Date(profile.lastSessionDate).toLocaleTimeString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strengths & Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Your Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.strengths.length > 0 ? (
                profile.strengths.map((strength, i) => (
                  <Badge key={i} variant="default" className="bg-green-100 text-green-800">
                    {strength}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Keep practicing to identify strengths!</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {profile.areasForImprovement.length > 0 ? (
                profile.areasForImprovement.map((area, i) => (
                  <Badge key={i} variant="outline" className="border-orange-300 text-orange-700">
                    {area}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Excellent! All metrics are optimal.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

