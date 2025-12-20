# Phase 2: ML Model Training & Recommendation System - COMPLETE ✅

## What's Been Implemented

### 1. ICP Scoring System ✅

**File**: `src/lib/ml/icp-scorer.ts`

- **Rule-based baseline scoring** (immediate value)
- Scores accounts 1-10 based on:
  - Engineering hiring signals
  - Company size
  - Recent funding
  - Tech stack alignment
  - Engineering blog presence
- Returns priority level (high/medium/low) and confidence score
- Can be upgraded to ML model when enough training data is available

**API**: `GET /api/ml/icp-score?accountDomain=example.com`
- Score a single account
- Batch scoring: `?batch=domain1.com,domain2.com`

### 2. Account Recommendation System ✅

**File**: `src/lib/ml/recommendations.ts`

- **Personalized recommendations** based on user interaction history
- **Contextual ranking** using:
  - ICP scores
  - Intent signals (engineering roles, recent research)
  - User engagement patterns
  - Recency of research
- **Top accounts by intent** (for new users)

**API**: `GET /api/ml/recommendations`
- Query params:
  - `limit`: Number of recommendations (default 10)
  - `minICPScore`: Minimum ICP score (default 6)
  - `priorityLevel`: high|medium|low|all
  - `includeEngaged`: Include accounts user already engaged with

### 3. UI Components ✅

**File**: `src/components/ml/AccountRecommendations.tsx`

- Displays top recommended accounts
- Shows ICP scores, priority levels, intent signals
- Reasoning for each recommendation
- Direct links to research accounts

## How It Works

### ICP Scoring Flow

1. User requests ICP score → `GET /api/ml/icp-score?accountDomain=...`
2. System fetches account signals from database
3. Extracts features (engineering roles, company size, etc.)
4. Applies rule-based scoring algorithm
5. Returns score, priority, confidence, and reasoning

### Recommendation Flow

1. User requests recommendations → `GET /api/ml/recommendations`
2. System fetches user's interaction history
3. Queries accounts with high intent signals
4. Scores each account based on:
   - ICP score
   - Intent signals
   - User engagement
   - Recency
5. Ranks and returns top accounts

## Usage Examples

### Score an Account

```typescript
const response = await fetch('/api/ml/icp-score?accountDomain=example.com');
const { score, priorityLevel, confidence, reasoning } = await response.json();
```

### Get Recommendations

```typescript
const response = await fetch('/api/ml/recommendations?limit=10&minICPScore=7');
const { recommendations } = await response.json();
```

### Display in UI

```tsx
import AccountRecommendations from '@/components/ml/AccountRecommendations';

<AccountRecommendations />
```

## Next Steps: Phase 3 (Future)

Once you have enough data (500+ research runs, 1000+ interactions):

1. **Train ML Models**
   - Replace rule-based ICP scoring with XGBoost/Random Forest
   - Train on historical `account_signals` data
   - A/B test ML vs rule-based

2. **Contextual Bandits**
   - Implement LinUCB or Thompson Sampling
   - Learn from user feedback (deal_won, deal_lost)
   - Continuously improve recommendations

3. **Advanced Features**
   - Multi-armed bandit for A/B testing
   - Real-time model updates
   - Feature engineering pipeline
   - Model versioning and rollback

## Current Status

✅ **Phase 1**: Data collection (complete)
✅ **Phase 2**: ML scoring & recommendations (complete)
⏳ **Phase 3**: Advanced ML training (pending data)

## Testing

Test the APIs:

```bash
# Score an account
curl "http://localhost:3000/api/ml/icp-score?accountDomain=example.com"

# Get recommendations
curl "http://localhost:3000/api/ml/recommendations?limit=5"
```

## Files Created

- `src/lib/ml/icp-scorer.ts` - ICP scoring logic
- `src/lib/ml/recommendations.ts` - Recommendation system
- `src/app/api/ml/icp-score/route.ts` - ICP scoring API
- `src/app/api/ml/recommendations/route.ts` - Recommendations API
- `src/components/ml/AccountRecommendations.tsx` - UI component
- `PHASE_2_PLAN.md` - Architecture documentation

---

**Phase 2 is complete! The system can now score accounts and provide personalized recommendations.** 🎉
