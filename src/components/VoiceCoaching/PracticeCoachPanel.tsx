/**
 * Practice Coach Panel
 * Provides exercises, drills, and real-time coaching tips
 */

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  PlayCircle, Target, Award, Clock, TrendingUp, Lightbulb,
  CheckCircle2, AlertCircle, BookOpen, Zap
} from 'lucide-react';
import { PracticeCoach } from '@/lib/voice-coaching/practice-coach';
import type { VoiceMetrics } from '@/lib/voice-coaching/types';
import type { UserVoiceProfile } from '@/lib/voice-coaching/user-model';

interface PracticeCoachPanelProps {
  userId: string;
  currentMetrics?: VoiceMetrics | null;
  userProfile?: UserVoiceProfile | null;
}

export function PracticeCoachPanel({ userId, currentMetrics, userProfile }: PracticeCoachPanelProps) {
  const [coach] = useState(() => new PracticeCoach());
  const [realTimeTips, setRealTimeTips] = useState<any[]>([]);
  const [dailyChallenge, setDailyChallenge] = useState<any>(null);
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [activeDrill, setActiveDrill] = useState<any>(null);
  const [drillProgress, setDrillProgress] = useState(0);

  useEffect(() => {
    if (currentMetrics) {
      const tips = coach.generateRealTimeTips(currentMetrics);
      setRealTimeTips(tips);
    }
  }, [currentMetrics, coach]);

  useEffect(() => {
    const challenge = coach.generateDailyChallenge(userProfile || null);
    setDailyChallenge(challenge);
  }, [userProfile, coach]);

  const getUrgencyColor = (urgency: string): string => {
    switch (urgency) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-300';
    }
  };

  const getDifficultyColor = (difficulty: string): string => {
    switch (difficulty) {
      case 'advanced':
        return 'bg-red-100 text-red-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-Time Coaching Tips */}
      {realTimeTips.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-600" />
              Real-Time Coaching Tips
            </CardTitle>
            <CardDescription>
              Live feedback to help you improve right now
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {realTimeTips.map((tip, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${getUrgencyColor(tip.urgency)}`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {tip.urgency === 'high' && <AlertCircle className="h-4 w-4" />}
                      <span className="font-medium capitalize">{tip.metric}</span>
                      <Badge variant="outline" className="capitalize">
                        {tip.urgency} priority
                      </Badge>
                    </div>
                    <div className="text-sm">
                      {tip.currentValue.toFixed(1)} → {tip.targetValue.toFixed(1)}
                    </div>
                  </div>
                  <p className="text-sm">{tip.tip}</p>
                  {tip.example && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <strong>Example:</strong> {tip.example}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Challenge */}
      {dailyChallenge && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Today's Challenge
            </CardTitle>
            <CardDescription>{dailyChallenge.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">
                    {dailyChallenge.currentProgress.toFixed(1)} / {dailyChallenge.goal}
                  </span>
                </div>
                <Progress 
                  value={(dailyChallenge.currentProgress / dailyChallenge.goal) * 100} 
                  className="h-2"
                />
              </div>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className={getDifficultyColor(dailyChallenge.difficulty)}>
                  {dailyChallenge.difficulty}
                </Badge>
                <div className="text-sm text-muted-foreground">
                  Reward: {dailyChallenge.reward}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Practice Exercises */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Practice Exercises
          </CardTitle>
          <CardDescription>
            Targeted exercises to improve specific metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pace">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="pace">Pace</TabsTrigger>
              <TabsTrigger value="volume">Volume</TabsTrigger>
              <TabsTrigger value="clarity">Clarity</TabsTrigger>
              <TabsTrigger value="confidence">Confidence</TabsTrigger>
              <TabsTrigger value="pauses">Pauses</TabsTrigger>
              <TabsTrigger value="pitch">Pitch</TabsTrigger>
            </TabsList>

            {(['pace', 'volume', 'clarity', 'confidence', 'pauses', 'pitch'] as const).map((metric) => {
              const currentValue = currentMetrics?.[metric] || 0;
              const exercises = coach.generatePracticeExercises(metric, currentValue);

              return (
                <TabsContent key={metric} value={metric}>
                  {exercises.length > 0 ? (
                    <div className="space-y-4">
                      {exercises.map((exercise) => (
                        <div
                          key={exercise.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setSelectedExercise(exercise)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold">{exercise.name}</h4>
                              <p className="text-sm text-muted-foreground">{exercise.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getDifficultyColor(exercise.difficulty)}>
                                {exercise.difficulty}
                              </Badge>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {exercise.duration}m
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-blue-600 mt-2">
                            Expected: {exercise.expectedImprovement}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                      <p>Great job! Your {metric} is in optimal range.</p>
                      <p className="text-xs mt-1">Keep practicing to maintain it.</p>
                    </div>
                  )}
                </TabsContent>
              );
            })}
          </Tabs>
        </CardContent>
      </Card>

      {/* Exercise Detail Modal */}
      {selectedExercise && (
        <Card className="border-2 border-blue-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedExercise.name}</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedExercise(null)}
              >
                ×
              </Button>
            </div>
            <CardDescription>{selectedExercise.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm">
                {selectedExercise.instructions.map((instruction: string, i: number) => (
                  <li key={i}>{instruction}</li>
                ))}
              </ol>
            </div>
            <div>
              <h4 className="font-medium mb-2">Tips:</h4>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {selectedExercise.tips.map((tip: string, i: number) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between pt-2 border-t">
              <div className="text-sm">
                <strong>Duration:</strong> {selectedExercise.duration} minutes
              </div>
              <div className="text-sm text-blue-600">
                <strong>Expected:</strong> {selectedExercise.expectedImprovement}
              </div>
            </div>
            <Button className="w-full" onClick={() => setSelectedExercise(null)}>
              <PlayCircle className="h-4 w-4 mr-2" />
              Start Exercise
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Practice Drills */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Practice Drills
          </CardTitle>
          <CardDescription>
            Structured practice sessions for multiple metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentMetrics ? (
            <div className="space-y-4">
              {!activeDrill ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose a drill to practice multiple metrics together
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['pace', 'volume', 'clarity', 'confidence'].map((metric) => {
                      const drill = coach.generatePracticeDrill([metric]);
                      return (
                        <div
                          key={metric}
                          className="p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => setActiveDrill(drill)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{drill.name}</h4>
                            <Badge variant="outline">{drill.difficulty}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{drill.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {drill.duration}m
                            </div>
                            <div className="flex items-center gap-1">
                              <Target className="h-3 w-3" />
                              {drill.targetMetrics.join(', ')}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">{activeDrill.name}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setActiveDrill(null);
                        setDrillProgress(0);
                      }}
                    >
                      Stop Drill
                    </Button>
                  </div>
                  <Progress value={drillProgress} className="h-2" />
                  <div className="space-y-2">
                    {activeDrill.steps.map((step: any, i: number) => (
                      <div
                        key={i}
                        className={`p-3 rounded border ${
                          drillProgress > (i / activeDrill.steps.length) * 100
                            ? 'bg-green-50 border-green-200'
                            : drillProgress >= ((i - 0.5) / activeDrill.steps.length) * 100
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-6 w-6 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs font-bold">
                            {step.step}
                          </div>
                          <span className="font-medium text-sm">{step.instruction}</span>
                        </div>
                        <div className="text-xs text-muted-foreground ml-8">
                          Duration: {step.duration}s
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => {
                      // Simulate drill progress
                      const interval = setInterval(() => {
                        setDrillProgress(prev => {
                          if (prev >= 100) {
                            clearInterval(interval);
                            return 100;
                          }
                          return prev + 2;
                        });
                      }, 1000);
                    }}
                  >
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Start Drill
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-2" />
              <p>Start a session to see practice drills</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

