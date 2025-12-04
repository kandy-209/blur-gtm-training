# 🗄️ How to Run Database Migration

## Step-by-Step Instructions

### Step 1: Open Supabase SQL Editor

1. Go to: https://supabase.com/dashboard/project/dxgjaznmtsgvxnfnzhbn
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Copy the SQL Content

**DO NOT** copy the file path. Instead:

1. Open `scripts/migrate-database.sql` from your project
2. **Select ALL** the content (Cmd+A / Ctrl+A)
3. **Copy** it (Cmd+C / Ctrl+C)

### Step 3: Paste and Run

1. **Paste** the SQL into the Supabase SQL Editor
2. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
3. You should see: "Success. No rows returned"

## What the Migration Does

- Creates `user_responses` table
- Creates `technical_questions` table  
- Adds indexes for performance
- Sets up Row Level Security policies
- Creates helper functions

## Verify Migration Worked

After running, check:

1. Go to **Table Editor** in Supabase
2. You should see:
   - ✅ `user_responses` table
   - ✅ `technical_questions` table

## Common Errors

### "syntax error at or near 'scripts'"
- ❌ You copied the file path instead of the SQL content
- ✅ Copy the actual SQL code from inside the file

### "relation already exists"
- The tables already exist (migration was run before)
- This is OK - you can ignore or drop tables first

### "permission denied"
- Make sure you're using the SQL Editor (not trying to run via API)
- SQL Editor has full permissions

## Need Help?

If you see any errors, copy the full error message and I can help troubleshoot!

