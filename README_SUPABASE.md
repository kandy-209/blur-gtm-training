# 🗄️ Supabase Database Setup

## Quick Start

1. **Create Supabase Project**: [supabase.com](https://supabase.com) → New Project
2. **Run Migration**: Copy `scripts/create-supabase-tables.sql` → Supabase SQL Editor → Run
3. **Enable Auth**: Dashboard → Authentication → Providers → Enable Email
4. **Set Env Vars**: Create `.env.local` with your Supabase credentials
5. **Done!** Restart dev server and test at `/auth`

## Database Schema

### Tables Created:
- ✅ `user_profiles` - User information and roles
- ✅ `user_ratings` - Session ratings between users
- ✅ `live_sessions` - Competitive role-play sessions
- ✅ `live_messages` - Chat messages in sessions

### Security:
- ✅ Row Level Security (RLS) enabled
- ✅ Policies configured for data access
- ✅ Indexes for performance

## Files:
- `scripts/create-supabase-tables.sql` - Complete database setup
- `QUICK_SUPABASE_SETUP.md` - 5-minute setup guide
- `SUPABASE_SETUP.md` - Detailed setup instructions

## Need Help?
See `QUICK_SUPABASE_SETUP.md` for step-by-step instructions!

