# 🚀 Prospect Intelligence - Quick Start Guide

## Access the Feature

### Main Research Page
**URL**: http://localhost:3000/prospect-intelligence

**What you can do:**
- Enter a company website URL
- Research prospect companies
- View comprehensive intelligence reports
- Export data as JSON or CSV

### Saved Prospects Page
**URL**: http://localhost:3000/prospect-intelligence/saved

**What you can do:**
- View all your saved prospect research
- Search and filter prospects
- See statistics dashboard
- Delete prospects

## Quick Test

1. **Start Research:**
   - Go to: http://localhost:3000/prospect-intelligence
   - Enter: `https://www.notion.so`
   - Click "Start Research"
   - Wait 30-120 seconds for results

2. **View Results:**
   - See ICP score (1-10)
   - Tech stack detection
   - Hiring activity
   - Engineering culture insights
   - Talking points for outreach

3. **Save & View:**
   - Results are automatically saved (if authenticated)
   - Go to: http://localhost:3000/prospect-intelligence/saved
   - See your saved prospects with statistics

## Features Available

✅ **Real-time Progress Indicators**
- See progress percentage during research
- Stage updates (navigating → extracting → analyzing)

✅ **Caching**
- Results cached for 24 hours
- Faster retrieval for recently researched companies

✅ **Database Persistence**
- All research saved to database
- Access your prospects anytime

✅ **Search & Filter**
- Search by company name or website
- Filter by priority level (high/medium/low)
- Filter by minimum ICP score

✅ **Export Options**
- Export as JSON (full data)
- Export as CSV (spreadsheet-friendly)

✅ **Statistics Dashboard**
- Total prospects researched
- Priority breakdown
- Average ICP score
- Recent activity count

## Test Companies

Try researching these companies to test the feature:

- **Notion**: `https://www.notion.so`
- **Figma**: `https://www.figma.com`
- **Retool**: `https://retool.com`
- **Vercel**: `https://vercel.com`
- **Linear**: `https://linear.app`

## Troubleshooting

**If research fails:**
- Check that Browserbase API keys are configured
- Verify at least one LLM API key is set (Claude, Gemini, or OpenAI)
- Check browser console for errors

**If saved prospects don't show:**
- Make sure you're signed in
- Verify database migration was run successfully
- Check that Supabase is configured in `.env.local`

## Next Steps

1. Research your first prospect
2. View saved prospects
3. Export data for your CRM
4. Use talking points for outreach

Happy prospecting! 🎯
