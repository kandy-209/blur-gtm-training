# Phase 2: ML Model Training & Recommendation System

## Overview

Phase 2 builds on Phase 1's data collection to create intelligent systems for:
1. **ICP Scoring** - Predict account fit using ML models
2. **Account Recommendations** - Serve top-tier accounts based on intent signals
3. **Contextual Bandits** - Learn from user interactions to improve recommendations

## Architecture

### 1. ICP Scoring Model
- **Input**: Features from `account_signals` table
- **Output**: ICP score (1-10) and priority level (high/medium/low)
- **Model**: XGBoost or Random Forest (start simple, can upgrade to neural nets later)
- **Features**:
  - `engineering_role_count`
  - `has_open_engineering_roles`
  - `total_open_roles`
  - `has_engineering_blog`
  - Company size (from research data)
  - Recent funding (from research data)
  - Tech stack alignment (from research data)

### 2. Account Recommendation System
- **Input**: User history from `user_interactions`, account signals
- **Output**: Ranked list of top accounts to pursue
- **Algorithm**: Contextual bandit (LinUCB or Thompson Sampling)
- **Features**:
  - User's past engagement patterns
  - Account intent signals
  - Recency of research
  - ICP scores

### 3. Training Pipeline
- **Data Source**: All Phase 1 tables
- **Frequency**: Daily/weekly retraining
- **Storage**: Model artifacts in Supabase or S3
- **Evaluation**: Cross-validation, A/B testing framework

## Implementation Plan

### Step 1: ML Training Infrastructure
- [ ] Create ML training service
- [ ] Data preprocessing pipeline
- [ ] Model training scripts
- [ ] Model evaluation metrics

### Step 2: ICP Scoring API
- [ ] `/api/ml/icp-score` - Score a single account
- [ ] `/api/ml/icp-score/batch` - Score multiple accounts
- [ ] Model loading and inference

### Step 3: Account Recommendations API
- [ ] `/api/ml/recommendations` - Get personalized account recommendations
- [ ] Contextual bandit implementation
- [ ] Ranking algorithm

### Step 4: UI Components
- [ ] ICP Score display component
- [ ] Recommended accounts dashboard
- [ ] Intent signals visualization

### Step 5: Training & Deployment
- [ ] Automated training pipeline
- [ ] Model versioning
- [ ] A/B testing framework

## Data Requirements

**Minimum for Training:**
- 50+ research runs (for ICP scoring)
- 100+ user interactions (for recommendations)
- 20+ unique accounts (for diversity)

**Optimal:**
- 500+ research runs
- 1000+ interactions
- 100+ unique accounts

## Next Steps

1. Start with simple rule-based ICP scoring (baseline)
2. Collect more data
3. Train first ML model
4. Deploy and iterate
