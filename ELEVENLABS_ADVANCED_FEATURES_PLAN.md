# ElevenLabs Advanced Features Implementation Plan
## Real-Time Voice Coaching, Emotion Detection, and Conversation Replay

**Version:** 1.0  
**Date:** 2024  
**Status:** Planning Phase

---

## Executive Summary

This document outlines the comprehensive implementation plan for three advanced ElevenLabs features that will transform the sales training platform into a world-class voice-enabled learning system:

1. **Real-Time Voice Coaching & Tone Analysis** - Live feedback on voice metrics
2. **Emotion Detection & Sentiment Analysis** - Real-time emotional intelligence
3. **Conversation Replay with Original Voices** - Full audio replay with navigation

---

## Table of Contents

1. [Research & Technology Analysis](#research--technology-analysis)
2. [Feature 1: Real-Time Voice Coaching](#feature-1-real-time-voice-coaching)
3. [Feature 2: Emotion Detection](#feature-2-emotion-detection)
4. [Feature 3: Conversation Replay](#feature-3-conversation-replay)
5. [Architecture & Infrastructure](#architecture--infrastructure)
6. [Database Schema Changes](#database-schema-changes)
7. [API Design](#api-design)
8. [UI/UX Components](#uiux-components)
9. [Implementation Timeline](#implementation-timeline)
10. [Testing Strategy](#testing-strategy)
11. [Performance Considerations](#performance-considerations)
12. [Security & Privacy](#security--privacy)
13. [Cost Analysis](#cost-analysis)

---

## Research & Technology Analysis

### Current State Assessment

**Existing Infrastructure:**
- ✅ ElevenLabs Conversational AI Widget integration
- ✅ Conversation analytics tracking (`elevenlabs-analytics.ts`)
- ✅ Database persistence (`elevenlabs-db.ts`)
- ✅ Audio recording capabilities (`voice.ts`)
- ✅ Web Audio API access via MediaRecorder
- ✅ Supabase database for conversation storage

**Gaps Identified:**
- ❌ No real-time audio analysis during conversation
- ❌ No voice metrics tracking (pace, tone, clarity)
- ❌ No emotion detection from audio
- ❌ No conversation audio recording/playback
- ❌ No voice coaching feedback system

### Technology Research Findings

#### 1. Real-Time Voice Analysis

**Web Audio API Capabilities:**
- **AudioContext**: Provides real-time audio processing
- **AnalyserNode**: FFT analysis for frequency/amplitude
- **ScriptProcessorNode** (deprecated) / **AudioWorklet**: Real-time audio processing
- **MediaStreamAudioSourceNode**: Access microphone stream

**Voice Metrics to Track:**
- **Pace (WPM)**: Words per minute calculation
- **Pitch**: Fundamental frequency (F0) detection
- **Volume**: RMS (Root Mean Square) amplitude
- **Pause Detection**: Silence gaps between words
- **Clarity**: Formant analysis (F1, F2, F3)
- **Confidence**: Voice stability metrics

**Libraries & APIs:**
- **Web Audio API** (Native): Real-time audio analysis
- **Pitchfinder.js**: Pitch detection algorithms
- **Tone.js**: Advanced audio analysis
- **Web Speech API**: Speech recognition (already in use)

**Implementation Approach:**
- Use `AudioContext` + `AnalyserNode` for real-time analysis
- Process audio in chunks (128-512 samples)
- Calculate metrics every 100-200ms for smooth updates
- Store metrics in memory during conversation
- Persist to database after conversation ends

#### 2. Emotion Detection

**Audio-Based Emotion Recognition:**
- **Prosody Features**: Pitch, energy, tempo, rhythm
- **Spectral Features**: Formants, MFCCs (Mel-Frequency Cepstral Coefficients)
- **Temporal Features**: Pause duration, speech rate

**Emotion Categories:**
- **Primary Emotions**: Happy, Sad, Angry, Fearful, Surprised, Disgusted
- **Sales Context Emotions**: Excited, Skeptical, Frustrated, Interested, Confused, Confident

**ML/AI Approaches:**
- **Option A**: Use pre-trained models (e.g., OpenVINO emotion recognition)
- **Option B**: Build custom model using TensorFlow.js
- **Option C**: Use cloud APIs (AWS Comprehend, Google Cloud Speech-to-Text with emotion)
- **Option D**: Hybrid approach - extract features client-side, classify server-side

**Recommended Approach:**
- **Client-side feature extraction** (Web Audio API)
- **Server-side classification** (Python ML model or cloud API)
- **Real-time streaming** of audio features to backend
- **Batch processing** for accuracy (every 2-3 seconds)

**APIs Considered:**
- **ElevenLabs API**: Check if they provide emotion detection
- **OpenAI Whisper**: Transcription + potential emotion hints
- **Google Cloud Speech-to-Text**: Emotion detection beta
- **AWS Transcribe**: Emotion detection (premium feature)
- **Custom ML Model**: Train on sales conversation dataset

#### 3. Conversation Replay

**Audio Recording:**
- **MediaRecorder API**: Browser-native recording
- **Format**: WebM (default), MP3 (via encoder), WAV (uncompressed)
- **Streaming**: Record to chunks, upload to storage
- **Storage**: Supabase Storage or AWS S3

**Playback Features:**
- **HTML5 Audio**: Basic playback
- **WaveSurfer.js**: Waveform visualization + playback
- **Howler.js**: Advanced audio control
- **Plyr**: Modern audio player UI

**Navigation Features:**
- **Chapter markers**: Based on message timestamps
- **Transcript sync**: Highlight text as audio plays
- **Speed control**: 0.5x - 2x playback speed
- **Skip forward/back**: 5-10 second jumps

**Export Options:**
- **Audio file**: MP3, WAV download
- **Podcast format**: RSS feed generation
- **Video format**: Audio + transcript overlay (future)

---

## Feature 1: Real-Time Voice Coaching

### Overview

Provide live feedback on voice metrics during conversations, helping sales reps improve their delivery in real-time.

### Core Features

#### 1.1 Voice Metrics Tracking

**Metrics to Track:**

| Metric | Description | Target Range | Calculation Method |
|--------|-------------|--------------|-------------------|
| **Pace (WPM)** | Words per minute | 140-180 WPM | Count words / duration |
| **Pitch** | Voice frequency | 85-255 Hz (male), 165-255 Hz (female) | FFT analysis |
| **Volume** | Speaking volume | -12dB to -6dB RMS | RMS amplitude |
| **Pause Frequency** | Pauses per minute | 3-8 pauses/min | Silence detection |
| **Clarity Score** | Speech clarity | 0-100 | Formant analysis |
| **Confidence Score** | Voice stability | 0-100 | Pitch variance |

**Real-Time Display:**
- Visual indicators (gauges, progress bars)
- Color-coded feedback (green/yellow/red)
- Subtle notifications (non-intrusive)
- Historical trend visualization

#### 1.2 Coaching Feedback

**Feedback Types:**

1. **Immediate Feedback** (Real-time):
   - "Slow down" (pace > 180 WPM)
   - "Speak louder" (volume < -18dB)
   - "Add more confidence" (pitch variance high)
   - "Great pace!" (optimal range)

2. **Periodic Feedback** (Every 30 seconds):
   - Summary of metrics
   - Suggestions for improvement
   - Comparison to previous sessions

3. **Post-Conversation Feedback**:
   - Detailed analysis report
   - Improvement recommendations
   - Comparison to top performers

**Coaching Rules:**

```typescript
interface CoachingRule {
  metric: VoiceMetric;
  condition: (value: number) => boolean;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  priority: number;
}

const coachingRules: CoachingRule[] = [
  {
    metric: 'pace',
    condition: (wpm) => wpm > 200,
    message: 'You\'re speaking too fast. Slow down to help the prospect understand.',
    severity: 'warning',
    priority: 1
  },
  {
    metric: 'pace',
    condition: (wpm) => wpm < 100,
    message: 'You\'re speaking slowly. Pick up the pace to maintain engagement.',
    severity: 'info',
    priority: 2
  },
  // ... more rules
];
```

#### 1.3 Comparison to Benchmarks

**Benchmark Sources:**
- User's historical average
- Top performers in same scenario
- Industry standards
- Scenario-specific targets

**Visualization:**
- Radar chart comparing all metrics
- Progress bars showing improvement
- Trend lines over time

### Technical Implementation

#### 1.3.1 Audio Analysis Engine

**File:** `src/lib/voice-coaching/audio-analyzer.ts`

```typescript
export class VoiceAnalyzer {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private microphone: MediaStreamAudioSourceNode;
  private stream: MediaStream;
  private animationFrameId: number | null = null;
  
  // Metrics
  private paceTracker: PaceTracker;
  private pitchDetector: PitchDetector;
  private volumeMeter: VolumeMeter;
  private pauseDetector: PauseDetector;
  
  async startAnalysis(stream: MediaStream): Promise<void> {
    this.stream = stream;
    this.audioContext = new AudioContext({ sampleRate: 44100 });
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;
    
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.microphone.connect(this.analyser);
    
    // Initialize trackers
    this.paceTracker = new PaceTracker();
    this.pitchDetector = new PitchDetector(this.analyser);
    this.volumeMeter = new VolumeMeter(this.analyser);
    this.pauseDetector = new PauseDetector(this.analyser);
    
    // Start analysis loop
    this.analyze();
  }
  
  private analyze(): void {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Calculate metrics
    const metrics: VoiceMetrics = {
      pace: this.paceTracker.getCurrentWPM(),
      pitch: this.pitchDetector.getPitch(),
      volume: this.volumeMeter.getRMS(),
      pauses: this.pauseDetector.getPauseCount(),
      clarity: this.calculateClarity(dataArray),
      confidence: this.calculateConfidence(),
      timestamp: Date.now()
    };
    
    // Emit metrics event
    this.onMetricsUpdate(metrics);
    
    this.animationFrameId = requestAnimationFrame(() => this.analyze());
  }
  
  stopAnalysis(): void {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
}
```

#### 1.3.2 Pace Tracker

**File:** `src/lib/voice-coaching/pace-tracker.ts`

```typescript
export class PaceTracker {
  private wordCount: number = 0;
  private startTime: number = Date.now();
  private wordTimestamps: number[] = [];
  
  // Use Web Speech API or transcription to count words
  onWordDetected(): void {
    this.wordCount++;
    this.wordTimestamps.push(Date.now());
  }
  
  getCurrentWPM(): number {
    const durationMinutes = (Date.now() - this.startTime) / 60000;
    return durationMinutes > 0 ? Math.round(this.wordCount / durationMinutes) : 0;
  }
  
  getAveragePace(): number {
    // Calculate average pace over last 30 seconds
    const thirtySecondsAgo = Date.now() - 30000;
    const recentWords = this.wordTimestamps.filter(ts => ts > thirtySecondsAgo);
    const durationMinutes = 0.5; // 30 seconds
    return Math.round(recentWords.length / durationMinutes);
  }
}
```

#### 1.3.3 Pitch Detector

**File:** `src/lib/voice-coaching/pitch-detector.ts`

```typescript
import { YIN } from 'pitchfinder'; // or use custom implementation

export class PitchDetector {
  private detector: any;
  private analyser: AnalyserNode;
  private pitchHistory: number[] = [];
  
  constructor(analyser: AnalyserNode) {
    this.analyser = analyser;
    this.detector = YIN({ sampleRate: 44100 });
  }
  
  getPitch(): number {
    const bufferLength = this.analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(dataArray);
    
    const pitch = this.detector(dataArray);
    
    if (pitch && pitch > 50 && pitch < 500) { // Valid pitch range
      this.pitchHistory.push(pitch);
      // Keep only last 100 samples
      if (this.pitchHistory.length > 100) {
        this.pitchHistory.shift();
      }
      return pitch;
    }
    
    return this.getAveragePitch();
  }
  
  getAveragePitch(): number {
    if (this.pitchHistory.length === 0) return 0;
    const sum = this.pitchHistory.reduce((a, b) => a + b, 0);
    return sum / this.pitchHistory.length;
  }
  
  getPitchStability(): number {
    // Lower variance = more stable = higher confidence
    if (this.pitchHistory.length < 10) return 0;
    
    const mean = this.getAveragePitch();
    const variance = this.pitchHistory.reduce((sum, pitch) => {
      return sum + Math.pow(pitch - mean, 2);
    }, 0) / this.pitchHistory.length;
    
    // Convert variance to stability score (0-100)
    const stability = Math.max(0, 100 - (variance / 10));
    return Math.round(stability);
  }
}
```

#### 1.3.4 Coaching Engine

**File:** `src/lib/voice-coaching/coaching-engine.ts`

```typescript
export class CoachingEngine {
  private rules: CoachingRule[];
  private activeFeedback: Map<string, FeedbackMessage> = new Map();
  
  constructor() {
    this.rules = this.loadCoachingRules();
  }
  
  analyzeMetrics(metrics: VoiceMetrics): FeedbackMessage[] {
    const feedback: FeedbackMessage[] = [];
    
    for (const rule of this.rules) {
      if (rule.condition(metrics[rule.metric])) {
        const message: FeedbackMessage = {
          id: `${rule.metric}-${Date.now()}`,
          type: rule.severity,
          message: rule.message,
          metric: rule.metric,
          currentValue: metrics[rule.metric],
          targetValue: this.getTargetValue(rule.metric),
          priority: rule.priority,
          timestamp: Date.now()
        };
        
        // Only show if not already showing similar feedback
        const existingKey = `${rule.metric}-${rule.severity}`;
        if (!this.activeFeedback.has(existingKey) || 
            Date.now() - this.activeFeedback.get(existingKey)!.timestamp > 10000) {
          feedback.push(message);
          this.activeFeedback.set(existingKey, message);
        }
      }
    }
    
    // Sort by priority
    return feedback.sort((a, b) => b.priority - a.priority);
  }
  
  private getTargetValue(metric: string): number {
    const targets: Record<string, { min: number; max: number }> = {
      pace: { min: 140, max: 180 },
      pitch: { min: 85, max: 255 },
      volume: { min: -12, max: -6 },
      // ... more targets
    };
    
    const target = targets[metric];
    return target ? (target.min + target.max) / 2 : 0;
  }
}
```

### Database Schema

**New Table:** `voice_coaching_metrics`

```sql
CREATE TABLE IF NOT EXISTS voice_coaching_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES elevenlabs_conversations(conversation_id),
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Metrics
  pace_wpm NUMERIC,
  pitch_hz NUMERIC,
  volume_db NUMERIC,
  pause_count INTEGER,
  clarity_score NUMERIC,
  confidence_score NUMERIC,
  
  -- Aggregated metrics
  average_pace NUMERIC,
  average_pitch NUMERIC,
  average_volume NUMERIC,
  
  -- Feedback
  feedback_messages JSONB DEFAULT '[]'::jsonb,
  coaching_suggestions JSONB DEFAULT '[]'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_coaching_conversation_id ON voice_coaching_metrics(conversation_id);
CREATE INDEX idx_voice_coaching_user_id ON voice_coaching_metrics(user_id);
CREATE INDEX idx_voice_coaching_timestamp ON voice_coaching_metrics(timestamp);
```

### UI Components

#### 1.4.1 Voice Metrics Dashboard

**File:** `src/components/VoiceCoaching/VoiceMetricsDashboard.tsx`

**Features:**
- Real-time metric gauges
- Color-coded indicators
- Historical trends
- Comparison to benchmarks

#### 1.4.2 Coaching Feedback Panel

**File:** `src/components/VoiceCoaching/CoachingFeedback.tsx`

**Features:**
- Non-intrusive toast notifications
- Persistent feedback panel (optional)
- Feedback history
- Actionable suggestions

---

## Feature 2: Emotion Detection

### Overview

Detect emotions from both the sales rep and prospect's voice in real-time, providing emotional intelligence insights.

### Core Features

#### 2.1 Real-Time Emotion Detection

**Emotions to Detect:**

**Primary Emotions:**
- 😊 Happy / Excited
- 😢 Sad / Disappointed
- 😠 Angry / Frustrated
- 😨 Fearful / Anxious
- 😲 Surprised
- 😐 Neutral

**Sales-Specific Emotions:**
- 💡 Interested / Engaged
- 🤔 Skeptical / Doubtful
- 😌 Confident / Assured
- 😕 Confused / Uncertain
- 😤 Defensive
- 🎯 Focused / Determined

**Detection Approach:**
1. **Audio Feature Extraction** (Client-side):
   - Extract prosodic features (pitch, energy, tempo)
   - Extract spectral features (formants, MFCCs)
   - Extract temporal features (pause patterns)

2. **Emotion Classification** (Server-side):
   - Send features to ML model
   - Classify emotion with confidence score
   - Return emotion + confidence

3. **Real-Time Updates**:
   - Analyze every 2-3 seconds
   - Stream features to backend
   - Display emotion with confidence

#### 2.2 Emotion Timeline

**Visualization:**
- Timeline showing emotion changes
- Color-coded emotion bars
- Confidence indicators
- Key emotion moments highlighted

**Features:**
- Jump to specific emotion moments
- Filter by emotion type
- Compare rep vs prospect emotions
- Emotion transition analysis

#### 2.3 Emotional Intelligence Scoring

**EI Metrics:**
- **Emotion Recognition**: Ability to detect prospect emotions
- **Emotion Response**: Appropriateness of emotional responses
- **Emotional Regulation**: Rep's emotional stability
- **Empathy Score**: Matching prospect's emotional state

**Scoring Algorithm:**
```typescript
interface EIScore {
  emotionRecognition: number; // 0-100
  emotionResponse: number; // 0-100
  emotionalRegulation: number; // 0-100
  empathyScore: number; // 0-100
  overallEI: number; // Weighted average
}

function calculateEIScore(
  repEmotions: EmotionData[],
  prospectEmotions: EmotionData[],
  conversationContext: ConversationContext
): EIScore {
  // Calculate recognition score
  const recognitionScore = calculateRecognitionScore(prospectEmotions);
  
  // Calculate response appropriateness
  const responseScore = calculateResponseScore(repEmotions, prospectEmotions);
  
  // Calculate emotional regulation
  const regulationScore = calculateRegulationScore(repEmotions);
  
  // Calculate empathy
  const empathyScore = calculateEmpathyScore(repEmotions, prospectEmotions);
  
  return {
    emotionRecognition: recognitionScore,
    emotionResponse: responseScore,
    emotionalRegulation: regulationScore,
    empathyScore: empathyScore,
    overallEI: (recognitionScore * 0.3 + responseScore * 0.3 + 
                 regulationScore * 0.2 + empathyScore * 0.2)
  };
}
```

#### 2.4 Emotion-Based Coaching

**Coaching Suggestions:**

- **Prospect Skeptical**: "The prospect seems skeptical. Try addressing their concerns directly."
- **Prospect Excited**: "Great! The prospect is excited. This is a good time to close."
- **Rep Nervous**: "You seem nervous. Take a deep breath and slow down."
- **Emotion Mismatch**: "The prospect is frustrated, but you're staying calm. Good emotional regulation!"

### Technical Implementation

#### 2.4.1 Audio Feature Extractor

**File:** `src/lib/emotion-detection/audio-feature-extractor.ts`

```typescript
export class AudioFeatureExtractor {
  private analyser: AnalyserNode;
  private audioContext: AudioContext;
  
  constructor(analyser: AnalyserNode, audioContext: AudioContext) {
    this.analyser = analyser;
    this.audioContext = audioContext;
  }
  
  extractFeatures(): AudioFeatures {
    // Extract prosodic features
    const pitch = this.extractPitch();
    const energy = this.extractEnergy();
    const tempo = this.extractTempo();
    
    // Extract spectral features
    const formants = this.extractFormants();
    const mfccs = this.extractMFCCs();
    
    // Extract temporal features
    const pausePattern = this.extractPausePattern();
    const speechRate = this.extractSpeechRate();
    
    return {
      pitch,
      energy,
      tempo,
      formants,
      mfccs,
      pausePattern,
      speechRate,
      timestamp: Date.now()
    };
  }
  
  private extractPitch(): number {
    // Use pitch detection algorithm
    const bufferLength = this.analyser.fftSize;
    const dataArray = new Float32Array(bufferLength);
    this.analyser.getFloatTimeDomainData(dataArray);
    
    // Autocorrelation or YIN algorithm
    return this.calculatePitch(dataArray);
  }
  
  private extractEnergy(): number {
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);
    
    // Calculate RMS energy
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i] * dataArray[i];
    }
    return Math.sqrt(sum / bufferLength);
  }
  
  // ... more extraction methods
}
```

#### 2.4.2 Emotion Classifier API

**File:** `src/app/api/emotion-detection/classify/route.ts`

```typescript
export async function POST(request: NextRequest) {
  try {
    const { features, conversationId, userId, role } = await request.json();
    
    // Option 1: Use pre-trained ML model
    const emotion = await classifyWithMLModel(features);
    
    // Option 2: Use cloud API (if available)
    // const emotion = await classifyWithCloudAPI(features);
    
    // Option 3: Use rule-based system (fallback)
    // const emotion = classifyWithRules(features);
    
    // Save to database
    await saveEmotionData({
      conversationId,
      userId,
      role, // 'user' or 'assistant'
      emotion: emotion.label,
      confidence: emotion.confidence,
      features,
      timestamp: new Date()
    });
    
    return NextResponse.json({
      emotion: emotion.label,
      confidence: emotion.confidence,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Emotion classification error:', error);
    return NextResponse.json(
      { error: 'Failed to classify emotion' },
      { status: 500 }
    );
  }
}

async function classifyWithMLModel(features: AudioFeatures): Promise<EmotionResult> {
  // Load TensorFlow.js model or call Python ML service
  // This would use a pre-trained emotion recognition model
  // For now, return mock data
  return {
    label: 'neutral',
    confidence: 0.75
  };
}
```

#### 2.4.3 Emotion Detection Service

**File:** `src/lib/emotion-detection/emotion-detector.ts`

```typescript
export class EmotionDetector {
  private featureExtractor: AudioFeatureExtractor;
  private conversationId: string;
  private userId: string;
  private role: 'user' | 'assistant';
  private detectionInterval: number | null = null;
  private emotionHistory: EmotionData[] = [];
  
  constructor(
    analyser: AnalyserNode,
    audioContext: AudioContext,
    conversationId: string,
    userId: string,
    role: 'user' | 'assistant'
  ) {
    this.featureExtractor = new AudioFeatureExtractor(analyser, audioContext);
    this.conversationId = conversationId;
    this.userId = userId;
    this.role = role;
  }
  
  startDetection(): void {
    // Detect emotions every 2-3 seconds
    this.detectionInterval = window.setInterval(async () => {
      const features = this.featureExtractor.extractFeatures();
      
      try {
        const response = await fetch('/api/emotion-detection/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            features,
            conversationId: this.conversationId,
            userId: this.userId,
            role: this.role
          })
        });
        
        const emotionData = await response.json();
        this.emotionHistory.push({
          ...emotionData,
          timestamp: Date.now()
        });
        
        // Emit event
        this.onEmotionDetected(emotionData);
      } catch (error) {
        console.error('Emotion detection error:', error);
      }
    }, 2500); // Every 2.5 seconds
  }
  
  stopDetection(): void {
    if (this.detectionInterval) {
      clearInterval(this.detectionInterval);
      this.detectionInterval = null;
    }
  }
  
  getEmotionHistory(): EmotionData[] {
    return this.emotionHistory;
  }
  
  getDominantEmotion(): EmotionData | null {
    if (this.emotionHistory.length === 0) return null;
    
    // Find most frequent emotion
    const emotionCounts = new Map<string, number>();
    this.emotionHistory.forEach(emotion => {
      emotionCounts.set(emotion.emotion, (emotionCounts.get(emotion.emotion) || 0) + 1);
    });
    
    let maxCount = 0;
    let dominantEmotion = '';
    emotionCounts.forEach((count, emotion) => {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    });
    
    return this.emotionHistory.find(e => e.emotion === dominantEmotion) || null;
  }
  
  private onEmotionDetected(emotion: EmotionData): void {
    // Emit custom event
    window.dispatchEvent(new CustomEvent('emotion-detected', {
      detail: emotion
    }));
  }
}
```

### Database Schema

**New Table:** `emotion_detection_data`

```sql
CREATE TABLE IF NOT EXISTS emotion_detection_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES elevenlabs_conversations(conversation_id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Emotion data
  emotion TEXT NOT NULL,
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Audio features (for analysis)
  audio_features JSONB,
  
  -- Context
  message_id TEXT,
  conversation_turn INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_emotion_conversation_id ON emotion_detection_data(conversation_id);
CREATE INDEX idx_emotion_user_id ON emotion_detection_data(user_id);
CREATE INDEX idx_emotion_timestamp ON emotion_detection_data(timestamp);
CREATE INDEX idx_emotion_role ON emotion_detection_data(role);
```

### UI Components

#### 2.5.1 Emotion Indicator

**File:** `src/components/EmotionDetection/EmotionIndicator.tsx`

**Features:**
- Real-time emotion display
- Confidence indicator
- Emotion history
- Color-coded emotions

#### 2.5.2 Emotion Timeline

**File:** `src/components/EmotionDetection/EmotionTimeline.tsx`

**Features:**
- Visual timeline of emotions
- Rep vs prospect comparison
- Jump to emotion moments
- Filter by emotion type

---

## Feature 3: Conversation Replay

### Overview

Record full conversations with original voices and provide rich playback experience with navigation, chapters, and export options.

### Core Features

#### 3.1 Audio Recording

**Recording Strategy:**
- **Dual Recording**: Record both user and AI audio streams
- **Synchronized Recording**: Timestamp alignment
- **Format**: WebM (browser-native), convert to MP3 for storage
- **Quality**: 44.1kHz, 128kbps (good quality, reasonable size)

**Implementation:**
- Use `MediaRecorder` API for user audio
- Capture AI audio from ElevenLabs widget (if possible)
- Or use TTS generation for AI audio reconstruction
- Merge streams with proper timing

#### 3.2 Playback Features

**Basic Playback:**
- Play/pause
- Seek to position
- Speed control (0.5x - 2x)
- Volume control

**Advanced Playback:**
- Chapter navigation (by message)
- Transcript sync (highlight as audio plays)
- Waveform visualization
- Bookmark moments
- Skip silence

#### 3.3 Export Options

**Formats:**
- **MP3**: Compressed audio file
- **WAV**: Uncompressed (high quality)
- **Podcast RSS**: For podcast apps
- **Video**: Audio + transcript overlay (future)

**Export Features:**
- Download individual conversations
- Batch export multiple conversations
- Share via link (if storage allows)
- Generate highlight reels

#### 3.4 Best Moments

**Auto-Generation:**
- Identify key moments (high engagement, emotion changes)
- Extract clips (30-60 seconds)
- Create highlight reel
- Add chapter markers

**Manual Selection:**
- User selects moments
- Create custom highlight reel
- Add notes/comments

### Technical Implementation

#### 3.4.1 Conversation Recorder

**File:** `src/lib/conversation-replay/conversation-recorder.ts`

```typescript
export class ConversationRecorder {
  private userMediaRecorder: MediaRecorder | null = null;
  private aiAudioChunks: Blob[] = [];
  private userAudioChunks: Blob[] = [];
  private conversationId: string;
  private startTime: number = 0;
  private messageTimestamps: Map<string, number> = new Map();
  
  constructor(conversationId: string) {
    this.conversationId = conversationId;
  }
  
  async startRecording(userStream: MediaStream): Promise<void> {
    this.startTime = Date.now();
    
    // Record user audio
    this.userMediaRecorder = new MediaRecorder(userStream, {
      mimeType: 'audio/webm;codecs=opus'
    });
    
    this.userMediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.userAudioChunks.push(event.data);
      }
    };
    
    this.userMediaRecorder.start(1000); // Collect data every second
    
    // Listen for AI audio (from ElevenLabs widget)
    this.setupAIAudioCapture();
  }
  
  private setupAIAudioCapture(): void {
    // Hook into ElevenLabs widget audio output
    // This might require widget API access or audio element interception
    // Alternative: Reconstruct AI audio from TTS API
    
    window.addEventListener('elevenlabs-audio-chunk', (event: CustomEvent) => {
      const audioChunk = event.detail.chunk;
      this.aiAudioChunks.push(audioChunk);
    });
  }
  
  async stopRecording(): Promise<Blob> {
    return new Promise((resolve) => {
      if (this.userMediaRecorder && this.userMediaRecorder.state !== 'inactive') {
        this.userMediaRecorder.onstop = async () => {
          const userAudioBlob = new Blob(this.userAudioChunks, { type: 'audio/webm' });
          const aiAudioBlob = new Blob(this.aiAudioChunks, { type: 'audio/webm' });
          
          // Merge audio streams
          const mergedAudio = await this.mergeAudioStreams(userAudioBlob, aiAudioBlob);
          resolve(mergedAudio);
        };
        
        this.userMediaRecorder.stop();
      } else {
        resolve(new Blob());
      }
    });
  }
  
  private async mergeAudioStreams(userBlob: Blob, aiBlob: Blob): Promise<Blob> {
    // Use Web Audio API to merge streams
    // This is complex - might need server-side processing
    // For now, return user audio (AI audio can be reconstructed)
    return userBlob;
  }
  
  addMessageTimestamp(messageId: string, timestamp: number): void {
    this.messageTimestamps.set(messageId, timestamp - this.startTime);
  }
  
  getMessageTimestamps(): Map<string, number> {
    return this.messageTimestamps;
  }
}
```

#### 3.4.2 Audio Player Component

**File:** `src/components/ConversationReplay/AudioPlayer.tsx`

**Features:**
- Waveform visualization (WaveSurfer.js)
- Playback controls
- Transcript sync
- Chapter navigation
- Speed control

#### 3.4.3 Audio Storage Service

**File:** `src/lib/conversation-replay/audio-storage.ts`

```typescript
export class AudioStorageService {
  async uploadAudio(conversationId: string, audioBlob: Blob): Promise<string> {
    // Upload to Supabase Storage or AWS S3
    const formData = new FormData();
    formData.append('file', audioBlob, `${conversationId}.mp3`);
    
    const response = await fetch('/api/conversation-replay/upload', {
      method: 'POST',
      body: formData
    });
    
    const { url } = await response.json();
    return url;
  }
  
  async getAudioUrl(conversationId: string): Promise<string | null> {
    const response = await fetch(`/api/conversation-replay/audio/${conversationId}`);
    const { url } = await response.json();
    return url || null;
  }
  
  async deleteAudio(conversationId: string): Promise<void> {
    await fetch(`/api/conversation-replay/audio/${conversationId}`, {
      method: 'DELETE'
    });
  }
}
```

### Database Schema

**Update Table:** `elevenlabs_conversations`

```sql
-- Add audio recording fields
ALTER TABLE elevenlabs_conversations
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS audio_file_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS audio_format TEXT,
ADD COLUMN IF NOT EXISTS chapter_markers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS highlight_moments JSONB DEFAULT '[]'::jsonb;
```

**New Table:** `conversation_audio_chapters`

```sql
CREATE TABLE IF NOT EXISTS conversation_audio_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES elevenlabs_conversations(conversation_id),
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_time_seconds NUMERIC NOT NULL,
  end_time_seconds NUMERIC,
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audio_chapters_conversation_id ON conversation_audio_chapters(conversation_id);
```

### UI Components

#### 3.5.1 Conversation Replay Player

**File:** `src/components/ConversationReplay/ReplayPlayer.tsx`

**Features:**
- Full-featured audio player
- Waveform visualization
- Transcript sync
- Chapter navigation
- Export options

---

## Architecture & Infrastructure

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Client (Browser)                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ ElevenLabs   │  │ Voice        │  │ Emotion      │     │
│  │ Widget       │  │ Coaching    │  │ Detection    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                 │              │
│         └─────────────────┼─────────────────┘              │
│                           │                                │
│                  ┌────────▼────────┐                       │
│                  │  Audio Context  │                       │
│                  │  & AnalyserNode │                       │
│                  └────────┬────────┘                       │
│                           │                                │
└───────────────────────────┼────────────────────────────────┘
                            │
                            │ WebSocket / HTTP
                            │
┌───────────────────────────▼────────────────────────────────┐
│                    Next.js API Routes                      │
├────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Voice        │  │ Emotion      │  │ Audio        │   │
│  │ Coaching API │  │ Detection API│  │ Storage API  │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │            │
└─────────┼─────────────────┼─────────────────┼────────────┘
          │                 │                 │
          │                 │                 │
┌─────────▼─────────────────▼─────────────────▼────────────┐
│              Supabase Database & Storage                 │
├───────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Conversations│  │ Voice Metrics │  │ Emotion Data │  │
│  │ Table        │  │ Table        │  │ Table        │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │           Supabase Storage (Audio Files)             │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React / Next.js (existing)
- Web Audio API (native)
- WaveSurfer.js (waveform visualization)
- TensorFlow.js (optional, for client-side ML)

**Backend:**
- Next.js API Routes (existing)
- Python ML Service (optional, for emotion detection)
- Supabase (database + storage)

**Libraries:**
- `pitchfinder` - Pitch detection
- `wavesurfer.js` - Audio visualization
- `howler.js` - Advanced audio playback
- `tensorflow.js` - ML model inference (optional)

---

## Database Schema Changes

### New Tables

1. **voice_coaching_metrics** - Voice metrics during conversations
2. **emotion_detection_data** - Emotion detection results
3. **conversation_audio_chapters** - Chapter markers for audio

### Updated Tables

1. **elevenlabs_conversations** - Add audio recording fields

### Migration Script

**File:** `scripts/create-elevenlabs-advanced-features-tables.sql`

```sql
-- Voice Coaching Metrics Table
CREATE TABLE IF NOT EXISTS voice_coaching_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES elevenlabs_conversations(conversation_id),
  user_id UUID REFERENCES auth.users(id),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  pace_wpm NUMERIC,
  pitch_hz NUMERIC,
  volume_db NUMERIC,
  pause_count INTEGER,
  clarity_score NUMERIC,
  confidence_score NUMERIC,
  average_pace NUMERIC,
  average_pitch NUMERIC,
  average_volume NUMERIC,
  feedback_messages JSONB DEFAULT '[]'::jsonb,
  coaching_suggestions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_voice_coaching_conversation_id ON voice_coaching_metrics(conversation_id);
CREATE INDEX idx_voice_coaching_user_id ON voice_coaching_metrics(user_id);
CREATE INDEX idx_voice_coaching_timestamp ON voice_coaching_metrics(timestamp);

-- Emotion Detection Data Table
CREATE TABLE IF NOT EXISTS emotion_detection_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES elevenlabs_conversations(conversation_id),
  user_id UUID REFERENCES auth.users(id),
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
  emotion TEXT NOT NULL,
  confidence NUMERIC NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  audio_features JSONB,
  message_id TEXT,
  conversation_turn INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_emotion_conversation_id ON emotion_detection_data(conversation_id);
CREATE INDEX idx_emotion_user_id ON emotion_detection_data(user_id);
CREATE INDEX idx_emotion_timestamp ON emotion_detection_data(timestamp);
CREATE INDEX idx_emotion_role ON emotion_detection_data(role);

-- Conversation Audio Chapters Table
CREATE TABLE IF NOT EXISTS conversation_audio_chapters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id TEXT NOT NULL REFERENCES elevenlabs_conversations(conversation_id),
  chapter_number INTEGER NOT NULL,
  title TEXT NOT NULL,
  start_time_seconds NUMERIC NOT NULL,
  end_time_seconds NUMERIC,
  message_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audio_chapters_conversation_id ON conversation_audio_chapters(conversation_id);

-- Update elevenlabs_conversations table
ALTER TABLE elevenlabs_conversations
ADD COLUMN IF NOT EXISTS audio_url TEXT,
ADD COLUMN IF NOT EXISTS audio_duration_seconds INTEGER,
ADD COLUMN IF NOT EXISTS audio_file_size_bytes BIGINT,
ADD COLUMN IF NOT EXISTS audio_format TEXT,
ADD COLUMN IF NOT EXISTS chapter_markers JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS highlight_moments JSONB DEFAULT '[]'::jsonb;

-- Enable RLS
ALTER TABLE voice_coaching_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_detection_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_audio_chapters ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own voice metrics" ON voice_coaching_metrics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own voice metrics" ON voice_coaching_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own emotion data" ON emotion_detection_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own emotion data" ON emotion_detection_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own audio chapters" ON conversation_audio_chapters
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM elevenlabs_conversations
      WHERE conversation_id = conversation_audio_chapters.conversation_id
      AND user_id = auth.uid()
    )
  );
```

---

## API Design

### Voice Coaching APIs

#### POST `/api/voice-coaching/metrics`
Save voice metrics during conversation.

**Request:**
```json
{
  "conversationId": "conv_123",
  "userId": "user_456",
  "metrics": {
    "pace": 165,
    "pitch": 180,
    "volume": -10,
    "pauses": 5,
    "clarity": 85,
    "confidence": 78
  },
  "timestamp": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "id": "metric_789"
}
```

#### GET `/api/voice-coaching/metrics/:conversationId`
Get all metrics for a conversation.

**Response:**
```json
{
  "metrics": [
    {
      "id": "metric_789",
      "timestamp": 1234567890,
      "pace": 165,
      "pitch": 180,
      "volume": -10,
      "pauses": 5,
      "clarity": 85,
      "confidence": 78
    }
  ],
  "averages": {
    "pace": 162,
    "pitch": 175,
    "volume": -11
  }
}
```

#### GET `/api/voice-coaching/feedback/:conversationId`
Get coaching feedback for a conversation.

**Response:**
```json
{
  "feedback": [
    {
      "type": "warning",
      "message": "You're speaking too fast. Slow down.",
      "metric": "pace",
      "timestamp": 1234567890
    }
  ],
  "suggestions": [
    "Try to maintain a pace of 140-180 WPM",
    "Your pitch is good, keep it steady"
  ]
}
```

### Emotion Detection APIs

#### POST `/api/emotion-detection/classify`
Classify emotion from audio features.

**Request:**
```json
{
  "features": {
    "pitch": 180,
    "energy": 0.75,
    "tempo": 120,
    "formants": [800, 1200, 2400],
    "mfccs": [0.1, 0.2, 0.3, ...]
  },
  "conversationId": "conv_123",
  "userId": "user_456",
  "role": "user"
}
```

**Response:**
```json
{
  "emotion": "excited",
  "confidence": 0.87,
  "timestamp": 1234567890
}
```

#### GET `/api/emotion-detection/timeline/:conversationId`
Get emotion timeline for a conversation.

**Response:**
```json
{
  "timeline": [
    {
      "timestamp": 1234567890,
      "emotion": "neutral",
      "confidence": 0.65,
      "role": "user"
    },
    {
      "timestamp": 1234567900,
      "emotion": "excited",
      "confidence": 0.89,
      "role": "assistant"
    }
  ],
  "dominantEmotions": {
    "user": "excited",
    "assistant": "confident"
  }
}
```

#### GET `/api/emotion-detection/ei-score/:conversationId`
Get emotional intelligence score.

**Response:**
```json
{
  "emotionRecognition": 85,
  "emotionResponse": 78,
  "emotionalRegulation": 92,
  "empathyScore": 80,
  "overallEI": 84
}
```

### Conversation Replay APIs

#### POST `/api/conversation-replay/upload`
Upload conversation audio.

**Request:** FormData with audio file

**Response:**
```json
{
  "success": true,
  "url": "https://storage.supabase.co/audio/conv_123.mp3",
  "duration": 180,
  "fileSize": 2880000
}
```

#### GET `/api/conversation-replay/audio/:conversationId`
Get audio URL for conversation.

**Response:**
```json
{
  "url": "https://storage.supabase.co/audio/conv_123.mp3",
  "duration": 180,
  "format": "mp3",
  "chapters": [
    {
      "number": 1,
      "title": "Introduction",
      "startTime": 0,
      "endTime": 30
    }
  ]
}
```

#### POST `/api/conversation-replay/chapters`
Create chapter markers.

**Request:**
```json
{
  "conversationId": "conv_123",
  "chapters": [
    {
      "number": 1,
      "title": "Introduction",
      "startTime": 0,
      "messageId": "msg_1"
    }
  ]
}
```

#### GET `/api/conversation-replay/highlights/:conversationId`
Get highlight moments.

**Response:**
```json
{
  "highlights": [
    {
      "startTime": 45,
      "endTime": 75,
      "title": "Key objection handling",
      "emotion": "confident"
    }
  ]
}
```

---

## UI/UX Components

### Voice Coaching Components

1. **VoiceMetricsDashboard** - Real-time metrics display
2. **CoachingFeedback** - Feedback messages
3. **VoiceMetricsChart** - Historical trends
4. **BenchmarkComparison** - Compare to benchmarks

### Emotion Detection Components

1. **EmotionIndicator** - Real-time emotion display
2. **EmotionTimeline** - Visual timeline
3. **EIScoreCard** - Emotional intelligence score
4. **EmotionComparison** - Rep vs prospect comparison

### Conversation Replay Components

1. **ReplayPlayer** - Full-featured audio player
2. **WaveformVisualizer** - Waveform display
3. **TranscriptSync** - Transcript synchronization
4. **ChapterNavigator** - Chapter navigation
5. **ExportDialog** - Export options

---

## Implementation Timeline

### Phase 1: Foundation (Week 1-2)

**Week 1:**
- Set up audio analysis infrastructure
- Implement basic voice metrics tracking (pace, volume)
- Create database tables
- Build API endpoints

**Week 2:**
- Implement pitch detection
- Add pause detection
- Create coaching engine
- Build basic UI components

### Phase 2: Voice Coaching (Week 3-4)

**Week 3:**
- Complete all voice metrics
- Implement coaching feedback system
- Add benchmark comparison
- Polish UI/UX

**Week 4:**
- Testing and refinement
- Performance optimization
- Documentation

### Phase 3: Emotion Detection (Week 5-7)

**Week 5:**
- Set up emotion detection infrastructure
- Implement audio feature extraction
- Create ML model or API integration
- Build basic emotion detection

**Week 6:**
- Complete emotion classification
- Build emotion timeline
- Implement EI scoring
- Create emotion-based coaching

**Week 7:**
- Testing and refinement
- Performance optimization
- Documentation

### Phase 4: Conversation Replay (Week 8-10)

**Week 8:**
- Implement audio recording
- Set up audio storage
- Build basic playback
- Create audio player component

**Week 9:**
- Add waveform visualization
- Implement transcript sync
- Create chapter navigation
- Add export features

**Week 10:**
- Implement highlight generation
- Add best moments feature
- Testing and refinement
- Documentation

### Phase 5: Integration & Polish (Week 11-12)

**Week 11:**
- Integrate all features
- End-to-end testing
- Performance optimization
- Bug fixes

**Week 12:**
- User testing
- Final refinements
- Documentation completion
- Launch preparation

---

## Testing Strategy

### Unit Tests

- Audio analysis functions
- Coaching engine logic
- Emotion classification
- Audio processing utilities

### Integration Tests

- API endpoints
- Database operations
- Audio recording/playback
- Feature interactions

### E2E Tests

- Full conversation flow
- Voice coaching feedback
- Emotion detection accuracy
- Audio replay functionality

### Performance Tests

- Real-time audio processing
- API response times
- Database query performance
- Audio file upload/download

---

## Performance Considerations

### Real-Time Processing

- **Audio Analysis**: Process in chunks (128-512 samples)
- **Update Frequency**: 100-200ms for smooth UI
- **Batch Processing**: Group API calls to reduce overhead
- **Web Workers**: Move heavy processing to background threads

### Storage Optimization

- **Audio Compression**: Use MP3 (128kbps) for storage
- **Lazy Loading**: Load audio on-demand
- **CDN**: Use CDN for audio file delivery
- **Cleanup**: Delete old audio files after retention period

### Database Optimization

- **Indexing**: Proper indexes on frequently queried fields
- **Pagination**: Limit query results
- **Caching**: Cache frequently accessed data
- **Archiving**: Archive old conversation data

---

## Security & Privacy

### Data Privacy

- **Audio Storage**: Encrypt audio files at rest
- **Access Control**: RLS policies for database access
- **User Consent**: Explicit consent for audio recording
- **Data Retention**: Configurable retention periods

### Security Measures

- **API Authentication**: Verify user identity
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Sanitize all inputs
- **HTTPS**: Encrypt all communications

### Compliance

- **GDPR**: Right to deletion, data portability
- **CCPA**: California privacy compliance
- **HIPAA**: If handling healthcare data (future)

---

## Cost Analysis

### Infrastructure Costs

**Supabase:**
- Database: Included in plan
- Storage: ~$0.021/GB/month
- Bandwidth: Included in plan

**ElevenLabs API:**
- Existing usage (no additional cost for features)
- TTS for replay reconstruction: ~$0.30 per 1000 characters

**Compute:**
- Next.js hosting: Existing
- ML model hosting (if needed): ~$20-50/month

### Estimated Monthly Costs

- **Small Scale** (100 users, 1000 conversations/month):
  - Storage: ~$5/month
  - API calls: ~$10/month
  - **Total: ~$15-20/month**

- **Medium Scale** (1000 users, 10000 conversations/month):
  - Storage: ~$50/month
  - API calls: ~$100/month
  - **Total: ~$150-200/month**

- **Large Scale** (10000 users, 100000 conversations/month):
  - Storage: ~$500/month
  - API calls: ~$1000/month
  - **Total: ~$1500-2000/month**

---

## Next Steps

1. **Review & Approval**: Review this plan with stakeholders
2. **Prioritization**: Decide on feature priority
3. **Resource Allocation**: Assign developers
4. **Kickoff Meeting**: Align team on implementation
5. **Start Phase 1**: Begin foundation work

---

## Appendix

### Research References

- Web Audio API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Pitch Detection: https://github.com/peterkhayes/pitchfinder
- Emotion Recognition: https://github.com/topics/emotion-recognition
- WaveSurfer.js: https://wavesurfer-js.org/

### Related Documentation

- ElevenLabs API Docs: https://elevenlabs.io/docs
- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs

---

**End of Document**

