# Voice Coaching Module

Real-time voice analysis and coaching feedback system for sales training conversations.

## Features

- **Real-time Voice Metrics**: Pace (WPM), Pitch, Volume, Pauses, Clarity, Confidence
- **Coaching Feedback**: Automatic suggestions based on voice metrics
- **Benchmark Comparison**: Compare to historical averages and top performers
- **Non-intrusive UI**: Subtle feedback that doesn't interrupt conversations

## Usage

### Basic Setup

```typescript
import { AudioAnalyzer, CoachingEngine } from '@/lib/voice-coaching';

// Initialize analyzer
const analyzer = new AudioAnalyzer(
  conversationId,
  userId,
  {
    enabled: true,
    updateInterval: 200,
    feedbackEnabled: true
  },
  (metrics) => {
    // Handle metrics update
    console.log('Current metrics:', metrics);
  }
);

// Start analysis
await analyzer.startAnalysis();

// Stop analysis
analyzer.stopAnalysis();
```

### Coaching Feedback

```typescript
import { CoachingEngine } from '@/lib/voice-coaching';

const coachingEngine = new CoachingEngine();
const feedback = coachingEngine.analyzeMetrics(metrics);
const suggestions = coachingEngine.generateSuggestions(metrics);
```

### API Integration

```typescript
// Save metrics
await fetch('/api/voice-coaching/metrics', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversationId,
    userId,
    metrics: {
      pace: 165,
      pitch: 180,
      volume: -10,
      pauses: 5,
      clarity: 85,
      confidence: 78
    }
  })
});

// Get feedback
const response = await fetch(`/api/voice-coaching/feedback?conversationId=${conversationId}`);
const { feedback, suggestions } = await response.json();
```

## Components

- **AudioAnalyzer**: Main analysis engine
- **PaceTracker**: Tracks words per minute
- **PitchDetector**: Detects voice pitch
- **VolumeMeter**: Measures volume levels
- **PauseDetector**: Detects pauses in speech
- **CoachingEngine**: Generates feedback and suggestions

## Target Metrics

Default target ranges:
- **Pace**: 140-180 WPM
- **Pitch**: 85-255 Hz
- **Volume**: -18 to -6 dB
- **Pauses**: 3-8 per minute
- **Clarity**: 70-100
- **Confidence**: 70-100

