# Prospect Intelligence - Complete Setup Guide

## 🗄️ Database Setup

### Step 1: Create the Database Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Click **New Query**
5. Copy and paste the SQL from `supabase/migrations/create_prospect_intelligence_table.sql`
6. Click **Run** to execute the migration

The migration will:
- ✅ Create the `prospect_intelligence` table
- ✅ Add all necessary indexes for performance
- ✅ Set up Row Level Security (RLS) policies
- ✅ Create triggers for `updated_at` timestamp
- ✅ Ensure users can only access their own prospects

### Step 2: Verify the Table

After running the migration, verify the table was created:

```sql
SELECT * FROM prospect_intelligence LIMIT 1;
```

You should see the table structure (it will be empty initially).

## 🔐 Authentication Setup

Authentication is now integrated! The API routes automatically:
- ✅ Get the current user from Supabase auth session
- ✅ Require authentication for saved prospects features
- ✅ Allow anonymous research (results won't be saved without auth)

### How It Works

1. **Research Endpoint** (`/api/prospect-intelligence/research`):
   - Works for both authenticated and anonymous users
   - If authenticated: Results are saved to database
   - If anonymous: Results are only cached (not persisted)

2. **Saved Prospects Endpoints**:
   - Require authentication
   - Users can only see their own saved prospects
   - Protected by Row Level Security (RLS) in Supabase

## 🚀 Quick Start

### 1. Run the Database Migration

```bash
# Option 1: Use Supabase Dashboard (Recommended)
# - Go to SQL Editor
# - Copy/paste the migration SQL
# - Click Run

# Option 2: Use Supabase CLI (if installed)
supabase db push
```

### 2. Verify Environment Variables

Make sure these are set in your `.env.local`:

```bash
# Required for database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Required for research
BROWSERBASE_API_KEY=your_browserbase_key
BROWSERBASE_PROJECT_ID=your_project_id

# At least one LLM API key
ANTHROPIC_API_KEY=your_anthropic_key  # Recommended
# OR
GOOGLE_GEMINI_API_KEY=your_gemini_key
# OR
OPENAI_API_KEY=your_openai_key
```

### 3. Test the Setup

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Test research (anonymous):**
   - Go to: http://localhost:3000/prospect-intelligence
   - Enter a website URL (e.g., `https://www.notion.so`)
   - Click "Start Research"
   - Results will be cached but not saved (no auth)

3. **Test with authentication:**
   - Sign in to your app
   - Research a prospect
   - Results will be saved to database
   - Go to: http://localhost:3000/prospect-intelligence/saved
   - You should see your saved prospects

## 📊 Features Now Available

### ✅ Research Prospects
- Navigate to `/prospect-intelligence`
- Enter website URL
- Get comprehensive research results

### ✅ Save & View Prospects
- Research results are automatically saved (if authenticated)
- View all saved prospects at `/prospect-intelligence/saved`
- Search and filter saved prospects
- Delete prospects you no longer need

### ✅ Export Data
- Export as JSON
- Export as CSV
- Both formats include all prospect data

### ✅ Caching
- Results cached for 24 hours
- Faster retrieval for recently researched companies
- Cache → Database → New Research (in that order)

## 🔍 Troubleshooting

### "Authentication required" Error
- Make sure you're signed in
- Check that Supabase auth is configured
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set

### "Table does not exist" Error
- Run the database migration (Step 1 above)
- Verify the table exists in Supabase Dashboard → Table Editor

### "Permission denied" Error
- Check Row Level Security (RLS) policies are enabled
- Verify the migration ran successfully
- Check that you're authenticated with the correct user

### Research Not Saving
- Check if you're authenticated (sign in required)
- Verify database connection (check Supabase dashboard)
- Check browser console for errors

## 📝 Database Schema

The `prospect_intelligence` table structure:

```sql
- id: UUID (primary key)
- user_id: UUID (references auth.users)
- website_url: TEXT
- company_name: TEXT
- data: JSONB (full prospect intelligence data)
- icp_score: INTEGER (1-10)
- priority_level: TEXT ('high', 'medium', 'low')
- extracted_at: TIMESTAMPTZ
- extraction_duration_ms: INTEGER
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## 🔒 Security

- ✅ Row Level Security (RLS) enabled
- ✅ Users can only access their own prospects
- ✅ All API routes validate authentication
- ✅ Database policies prevent unauthorized access

## 🎯 Next Steps

1. ✅ Database table created
2. ✅ Authentication integrated
3. ✅ API routes updated
4. 🧪 Test the complete flow
5. 🚀 Deploy to production

Everything is now set up and ready to use! 🎉
