# 🤖 Anthropic API Integration

## Overview

Integration with Anthropic's Claude API to provide AI-powered personalized feedback and ratings for voice coaching users.

---

## 🎯 Features

### 1. **Comprehensive Feedback**
- Overall rating (0-100)
- Rating breakdown for each metric
- Personalized feedback paragraph
- Strengths identification
- Areas for improvement
- Specific recommendations
- Motivational messages
- Next steps
- Encouragement

### 2. **Session Feedback**
- Session-specific rating
- Real-time feedback
- Comparison to previous session
- Immediate tips for improvement
- Strengths and improvements

### 3. **Rating System**
- Overall rating with explanation
- Per-metric ratings (0-100)
- Based on optimal ranges
- Considers improvement trends
- Takes consistency into account

---

## 📁 Files Created

### Core Library
- `src/lib/anthropic/feedback-generator.ts`
  - `AnthropicFeedbackGenerator` class
  - Comprehensive feedback generation
  - Session feedback generation
  - Rating generation

### API Route
- `src/app/api/voice-coaching/anthropic-feedback/route.ts`
  - POST: Generate comprehensive/session/rating feedback
  - GET: Generate comprehensive feedback

### UI Component
- `src/components/VoiceCoaching/AnthropicFeedbackPanel.tsx`
  - Display comprehensive feedback
  - Display session feedback
  - Rating visualization
  - Recommendations display

---

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install @anthropic-ai/sdk
```

### 2. Set Environment Variable
Add to `.env.local`:
```
ANTHROPIC_API_KEY=your_api_key_here
```

### 3. Get API Key
1. Sign up at https://console.anthropic.com/
2. Create an API key
3. Add to environment variables

---

## 📊 Usage

### API Endpoints

#### Comprehensive Feedback
```typescript
POST /api/voice-coaching/anthropic-feedback
{
  "userId": "user_123",
  "type": "comprehensive"
}
```

#### Session Feedback
```typescript
POST /api/voice-coaching/anthropic-feedback
{
  "userId": "user_123",
  "type": "session",
  "currentMetrics": { ... },
  "previousMetrics": { ... }
}
```

#### Rating Only
```typescript
POST /api/voice-coaching/anthropic-feedback
{
  "userId": "user_123",
  "type": "rating",
  "currentMetrics": { ... }
}
```

### UI Component
```tsx
<AnthropicFeedbackPanel
  userId={userId}
  currentMetrics={metrics}
  previousMetrics={previousMetrics}
/>
```

---

## 🎨 Feedback Structure

### Comprehensive Feedback
```typescript
{
  overallRating: number; // 0-100
  ratingBreakdown: {
    pace: number;
    pitch: number;
    volume: number;
    pauses: number;
    clarity: number;
    confidence: number;
  };
  personalizedFeedback: string;
  strengths: string[];
  areasForImprovement: string[];
  specificRecommendations: string[];
  motivationalMessage: string;
  nextSteps: string[];
  encouragement: string;
}
```

### Session Feedback
```typescript
{
  sessionRating: number; // 0-100
  feedback: string;
  strengths: string[];
  improvements: string[];
  specificTips: string[];
  comparisonToPrevious?: string;
  encouragement: string;
}
```

---

## 🧠 AI Model

- **Model**: `claude-3-5-sonnet-20241022`
- **Max Tokens**: 2000 (comprehensive), 1500 (session), 1000 (rating)
- **Temperature**: Default (balanced)

---

## 📈 Data Used for Feedback

### Comprehensive Feedback Uses:
- Total sessions and practice time
- Current metrics
- All-time statistics
- Improvement trends
- Performance patterns
- Practice habits
- Best sessions
- All collected data points

### Session Feedback Uses:
- Current session metrics
- Previous session metrics (if available)
- Recent session history
- Trend analysis

### Rating Uses:
- Current metrics
- Baseline metrics
- Improvement trends
- Impact scores
- Optimal ranges

---

## 🎯 Key Features

✅ **Personalized**: Uses all user data for context  
✅ **Comprehensive**: Multiple feedback types  
✅ **Actionable**: Specific recommendations  
✅ **Motivational**: Encouraging messages  
✅ **Visual**: Rating breakdowns and progress bars  
✅ **Real-time**: Session feedback available immediately  

---

## 🔒 Privacy & Security

- API key stored in environment variables
- All data processing on backend
- No data sent to Anthropic beyond what's needed
- User-specific feedback only

---

## 💰 Cost Considerations

- Claude 3.5 Sonnet pricing applies
- ~$3 per million input tokens
- ~$15 per million output tokens
- Typical feedback: ~2000 tokens input, ~500 tokens output
- Cost per feedback: ~$0.01-0.02

---

## 🎓 Example Output

### Comprehensive Feedback
```
Overall Rating: 75/100

Rating Breakdown:
- Pace: 80
- Volume: 70
- Clarity: 75
- Confidence: 80

Personalized Feedback:
"Your voice coaching journey shows strong improvement, particularly in pace and confidence. Your consistent practice is paying off, with clear progress in clarity and volume control."

Strengths:
- Excellent pace control
- Strong confidence levels
- Consistent practice habits

Areas for Improvement:
- Volume projection
- Clarity enunciation
- Pause management

Recommendations:
1. Practice volume projection exercises daily
2. Focus on clear enunciation with tongue twisters
3. Work on strategic pause placement
```

---

**Status**: ✅ Complete and Ready to Use!

Make sure to:
1. Install `@anthropic-ai/sdk`
2. Set `ANTHROPIC_API_KEY` environment variable
3. Click "Show AI Feedback" button to see it in action!

