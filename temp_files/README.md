# Cursor GTM Training Platform

A comprehensive training application for Cursor's GTM team to practice sales positioning and objection handling.

## Features

- 🤖 **AI-Powered Role-Play Engine**: Practice with realistic AI prospects
- 📊 **Analytics Dashboard**: Track training progress and performance
- 🎯 **Multiple Scenarios**: 6+ objection scenarios covering common sales challenges
- 🛠️ **Scenario Builder**: Create and manage custom training scenarios
- 📈 **Real-time Feedback**: Get instant evaluation and scoring

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

3. Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=sk-...
```

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
- OpenAI GPT-4

