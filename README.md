# Browserbase GTM Training Platform

A comprehensive training application for Browserbase's GTM team to practice sales positioning and objection handling.

## Features

- 🤖 **AI-Powered Role-Play Engine**: Practice with realistic AI prospects
- 📊 **Analytics Dashboard**: Track training progress and performance
- 🎯 **Multiple Scenarios**: 6+ objection scenarios covering common sales challenges
- 🛠️ **Scenario Builder**: Create and manage custom training scenarios
- 📈 **Real-time Feedback**: Get instant evaluation and scoring
- 🔍 **Prospect Intelligence**: Automatically research prospect companies (tech stack, hiring, culture, ICP scoring)

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Add your API keys to `.env.local`:
```
OPENAI_API_KEY=sk-...
BROWSERBASE_API_KEY=your_browserbase_api_key
BROWSERBASE_PROJECT_ID=your_browserbase_project_id
ANTHROPIC_API_KEY=sk-ant-... (optional, for Claude)
GOOGLE_GEMINI_API_KEY=AIza-... (optional, for Gemini)
```

For detailed setup instructions, see:
- [Prospect Intelligence Setup](./PROSPECT_INTELLIGENCE_SETUP.md) - For Browserbase configuration
- [Environment Variables Setup](./ADD_ENV_VARS.md) - For Vercel deployment

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

## Usage

1. **Start a Scenario**: Navigate to Scenarios page and select a training scenario
2. **Role-Play**: Respond to the AI prospect's objections
3. **Get Feedback**: Receive real-time evaluation and scoring
4. **Track Progress**: View analytics dashboard for performance metrics
5. **Create Scenarios**: Use Admin panel to build custom scenarios

## Project Structure

- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/src/data` - Scenario data and content
- `/src/lib` - Utilities and analytics
- `/src/types` - TypeScript type definitions

## Technologies

- Next.js 14
- TypeScript
- Tailwind CSS
- Radix UI
- Multi-LLM Support: Claude (Anthropic), Gemini (Google), OpenAI GPT-4

