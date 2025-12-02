# Route Structure Documentation

## Public Routes

### Main Pages
- `/` - Homepage
- `/scenarios` - Browse training scenarios
- `/features` - Cursor features overview
- `/chat` - Permission-aware chatbot
- `/auth` - Authentication (sign in/sign up/guest)

### Training & Analytics
- `/roleplay/:scenarioId` - Individual role-play scenario
- `/analytics` - Training analytics dashboard
- `/leaderboard` - User leaderboard

### Live Features
- `/live` - Live peer-to-peer role-play lobby

### Admin
- `/admin/scenarios` - Admin scenario management

## API Routes

### Authentication
- `/api/auth/signup` - User registration
- `/api/auth/signin` - User login
- `/api/auth/signout` - User logout

### Role-Play
- `/api/roleplay` - AI role-play engine
- `/api/tts` - Text-to-speech
- `/api/transcribe` - Speech-to-text

### Chat
- `/api/chat/general` - General chat (all users)
- `/api/chat/technical` - Technical chat (authenticated)
- `/api/chat/roi` - ROI chat (authenticated)
- `/api/features/chat` - Features chat (all users)

### Analytics & Data
- `/api/analytics` - Analytics tracking
- `/api/analytics/top-responses` - Top user responses
- `/api/responses` - User response management
- `/api/questions` - Technical questions

### Live Sessions
- `/api/live/lobby` - Live session lobby
- `/api/live/sessions` - Live session management
- `/api/live/messages` - Live session messages

### Social & Ratings
- `/api/ratings` - User ratings
- `/api/leaderboard` - Leaderboard data
- `/api/slack/notify` - Slack notifications

### ML & Agents
- `/api/ml/learn` - ML learning system
- `/api/ai-insights` - AI insights
- `/api/agents/:agentName` - Agent endpoints
- `/api/agents/orchestrate` - Agent orchestration
- `/api/messaging/feedback` - Messaging feedback

## Route Optimization

### Redirects (configured in vercel.json)
- `/home` → `/` (permanent redirect)
- `/dashboard` → `/analytics` (temporary redirect)

### Middleware Protection
- All routes go through middleware for:
  - Security headers
  - Rate limiting (API routes)
  - CORS handling
  - Vercel protection bypass

## Custom Domain Setup

To add a custom domain:

1. **Via Vercel Dashboard**:
   - Go to Project Settings → Domains
   - Add your domain
   - Follow DNS configuration instructions

2. **Via CLI**:
   ```bash
   npx vercel domains add yourdomain.com
   ```

3. **DNS Configuration**:
   - Add CNAME record: `yourdomain.com` → `cname.vercel-dns.com`
   - Or A record: Point to Vercel IPs (see dashboard)

## Route Performance

- Static pages: `/`, `/scenarios`, `/features`, `/auth`
- Dynamic pages: `/roleplay/:scenarioId`, `/analytics`, `/leaderboard`
- API routes: All serverless functions

## Security

- All routes protected by security headers
- API routes have rate limiting
- Authentication required for certain routes
- Permission checks via OSO-style authorization

