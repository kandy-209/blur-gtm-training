import { useState, useEffect } from 'react';
import { analytics } from '@/lib/analytics';
import { TrainingEvent } from '@/lib/analytics';

interface ScenarioStats {
  completed: number;
  averageScore: number;
  totalTurns: number;
  lastPlayed?: Date;
}

export function useScenarioStats(scenarioId: string) {
  const [stats, setStats] = useState<ScenarioStats>({
    completed: 0,
    averageScore: 0,
    totalTurns: 0,
  });

  useEffect(() => {
    // Get events from localStorage
    const stored = localStorage.getItem('training_events');
    if (!stored) return;

    try {
      const events: TrainingEvent[] = JSON.parse(stored);
      const scenarioEvents = events.filter(e => e.scenarioId === scenarioId);

      const completions = scenarioEvents.filter(e => e.eventType === 'scenario_complete');
      const turns = scenarioEvents.filter(e => e.eventType === 'turn_submit');
      
      const scores = completions
        .map(e => e.score)
        .filter((s): s is number => s !== undefined);
      
      const avgScore = scores.length > 0
        ? scores.reduce((sum, s) => sum + s, 0) / scores.length
        : 0;

      const lastCompletion = completions
        .map(e => new Date(e.timestamp))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      setStats({
        completed: completions.length,
        averageScore: Math.round(avgScore),
        totalTurns: turns.length,
        lastPlayed: lastCompletion,
      });
    } catch (error) {
      console.error('Error parsing scenario stats:', error);
    }
  }, [scenarioId]);

  return stats;
}

