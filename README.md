# Blur Sales Trainer

A comprehensive AI-powered sales training platform for GTM teams to practice sales positioning, objection handling, and prospect intelligence.

## 🚀 Features

### Core Training
- 🤖 **AI-Powered Role-Play Engine**: Practice with realistic AI prospects using advanced LLMs
- 🎯 **Multiple Scenarios**: 6+ objection scenarios covering common sales challenges
- 🛠️ **Scenario Builder**: Create and manage custom training scenarios
- 📈 **Real-time Feedback**: Get instant evaluation and scoring with detailed metrics
- 🎤 **Voice Mode**: Practice with voice using ElevenLabs TTS and OpenAI Whisper STT

### Intelligence & Analytics
- 🔍 **Prospect Intelligence**: Automatically research prospect companies (tech stack, hiring, culture, ICP scoring)
- 📊 **Analytics Dashboard**: Track training progress and performance over time
- 💼 **Company Analysis**: Deep-dive into prospect companies with financial data and insights
- 📧 **Email Generation**: AI-powered email templates with BBQ (Brevity, Boldness, Quirkiness) style

### Advanced Features
- ⚡ **Smart Caching**: Adaptive TTL caching system for improved performance
- 🔄 **Multi-LLM Support**: Switch between Claude (Anthropic), Gemini (Google), and OpenAI GPT-4
- 🎨 **Modern UI**: Beautiful, responsive design with fluid animations
- 🔐 **Authentication**: Secure user authentication with Supabase
- 📱 **Mobile Responsive**: Works seamlessly on all devices

## 📋 Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for database and auth)
- API keys for at least one LLM provider

### Installation

1. **Clone and install dependencies:**
```bash
npm install
```

2. **Create `.env.local` file:**
```bash
cp .env.local.example .env.local
```

3. **Add your API keys to `.env.local`:**
```env
# Required
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# LLM Providers (at least one required)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...  # Optional
GOOGLE_GEMINI_API_KEY=AIza-...  # Optional

# Browserbase (for Prospect Intelligence)
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id

# ElevenLabs (for Voice Mode)
ELEVENLABS_API_KEY=your_elevenlabs_api_key
NEXT_PUBLIC_ELEVENLABS_VOICE_ID=your_voice_id  # Optional

# Optional: Redis (for advanced caching)
REDIS_URL=redis://...  # Optional
```

4. **Set up database:**
```bash
# Run database migrations in Supabase SQL Editor
# See database-migration.sql for schema
```

5. **Run the development server:**
```bash
npm run dev
```

6. **Open [http://localhost:3000](http://localhost:3000)**

### Detailed Setup Guides
- [Prospect Intelligence Setup](./PROSPECT_INTELLIGENCE_SETUP.md) - Browserbase configuration
- [Environment Variables Setup](./ADD_ENV_VARS.md) - Vercel deployment
- [Voice Setup](./VOICE_SETUP.md) - ElevenLabs voice features
- [Database Setup](./DATABASE.md) - Supabase configuration

## 💡 Usage

1. **Start a Scenario**: Navigate to Scenarios page and select a training scenario
2. **Role-Play**: Respond to the AI prospect's objections (text or voice)
3. **Get Feedback**: Receive real-time evaluation and scoring
4. **Track Progress**: View analytics dashboard for performance metrics
5. **Research Prospects**: Use Prospect Intelligence to analyze companies
6. **Create Scenarios**: Use Scenario Builder to build custom scenarios

## 🏗️ Project Structure

```
/src
  /app              # Next.js app router pages
  /components        # React components
  /lib               # Utilities, APIs, and business logic
    /agents          # AI agent implementations
    /cache           # Caching system
    /company-analysis # Company research features
    /prospect-intelligence # Prospect intelligence
    /sales-enhancements # Sales tools
    /voice-coaching  # Voice training features
  /data              # Scenario data and content
  /types             # TypeScript type definitions
  /hooks             # React hooks
  /infrastructure    # Infrastructure agents
```

## 🛠️ Technologies

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **Database**: Supabase (PostgreSQL)
- **Caching**: Redis (optional)
- **AI/LLM**: 
  - OpenAI GPT-4
  - Anthropic Claude
  - Google Gemini
- **Voice**: ElevenLabs (TTS), OpenAI Whisper (STT)
- **Monitoring**: Sentry
- **Deployment**: Vercel

## 📜 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run dev:debug        # Start with debugging

# Testing
npm test                 # Run tests
npm run test:coverage    # Run with coverage
npm run test:watch       # Watch mode

# Building
npm run build            # Production build
npm run start            # Start production server

# Database
npm run setup:prospect-db    # Setup prospect intelligence DB
npm run verify:supabase      # Verify Supabase connection

# Deployment
npm run deploy           # Deploy to Vercel
```

## 🌐 Deployment

The application is configured for deployment on Vercel. See [DEPLOYMENT.md](./docs/deployment/README_DEPLOYMENT.md) for detailed instructions.

**Live URLs:**
- Production: https://blursalestrainer.com
- Alternative: https://howtosell.tech

## 📚 Documentation

- [Architecture](./ARCHITECTURE.md) - System architecture overview
- [API Documentation](./docs/api/) - API endpoints
- [Agent Workflow](./AGENT_WORKFLOW.md) - AI agent implementation
- [Security](./SECURITY.md) - Security best practices

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test`
4. Submit a pull request

## 📄 License

Private - Browserbase Internal Use

