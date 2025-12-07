# Database Connection Setup

## Overview
All database connections have been centralized and standardized across the application. All API routes now use a single Supabase client instance for consistent connection handling.

## Changes Made

### 1. Centralized Supabase Client (`src/lib/supabase-client.ts`)
- Created a single source of truth for database connections
- Provides `getSupabaseClient()` function that returns a singleton Supabase client
- Includes connection verification utilities
- Handles environment variable checking gracefully

### 2. Updated API Routes
All API routes have been updated to use the centralized client:

- ✅ `src/app/api/users/activity/route.ts`
- ✅ `src/app/api/users/profile/route.ts`
- ✅ `src/app/api/users/stats/route.ts`
- ✅ `src/app/api/users/preferences/route.ts`
- ✅ `src/app/api/analytics/route.ts`
- ✅ `src/app/api/leaderboard/route.ts`
- ✅ `src/app/api/ratings/route.ts`
- ✅ `src/app/api/analytics/top-responses/route.ts`
- ✅ `src/app/api/auth/admin/signup/route.ts`
- ✅ `src/app/api/admin/clear-all-now/route.ts`
- ✅ `src/app/api/admin/clear-responses/route.ts`
- ✅ `src/app/api/admin/grant-access/route.ts`
- ✅ `src/app/api/analytics/top-responses/delete-top/route.ts`
- ✅ `src/app/api/live/sessions/save/route.ts`

### 3. Database Health Check Endpoint
Created `/api/db/health` endpoint to verify database connection status:
- Checks configuration
- Verifies connection
- Returns detailed status information

## Usage

### In API Routes
```typescript
import { getSupabaseClient } from '@/lib/supabase-client';

const supabase = getSupabaseClient();

if (!supabase) {
  return NextResponse.json(
    { error: 'Database not configured' },
    { status: 500 }
  );
}
```

### Verify Connection
```typescript
import { verifyConnection, isDatabaseConfigured } from '@/lib/supabase-client';

// Check if configured
if (!isDatabaseConfigured()) {
  console.warn('Database not configured');
}

// Verify connection
const check = await verifyConnection();
if (check.connected) {
  console.log('Database connected successfully');
}
```

## Environment Variables Required

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
# OR
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

**Note:** `SUPABASE_SERVICE_ROLE_KEY` is preferred for server-side operations as it bypasses Row Level Security (RLS).

## Testing Connection

1. **Health Check Endpoint:**
   ```bash
   curl http://localhost:3000/api/db/health
   ```

2. **Verify Supabase Endpoint:**
   ```bash
   curl http://localhost:3000/api/verify-supabase
   ```

## Benefits

1. **Consistency:** All routes use the same connection pattern
2. **Maintainability:** Single place to update connection logic
3. **Error Handling:** Centralized error handling and logging
4. **Type Safety:** Proper TypeScript types throughout
5. **Graceful Degradation:** Handles missing configuration gracefully

## Next Steps

1. Ensure environment variables are set in `.env.local`
2. Run database migrations if tables don't exist
3. Test API endpoints to verify connections
4. Monitor `/api/db/health` endpoint for connection status


