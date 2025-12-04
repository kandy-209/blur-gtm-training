# 🔍 Check Supabase Connection - Quick Test

## ✅ Test Your Connection

I've created a verification endpoint that will check your Supabase connection.

### Step 1: Visit the Test Endpoint

**On your live site:**
```
https://howtosellcursor.me/api/verify-supabase
```

**Or locally:**
```
http://localhost:3000/api/verify-supabase
```

### Step 2: Check the Results

The endpoint will return JSON showing:

```json
{
  "status": "success" | "partial" | "failed",
  "checks": {
    "url": true/false,
    "anonKey": true/false,
    "serviceRoleKey": true/false,
    "connection": true/false,
    "tables": true/false
  },
  "details": {
    "url": "your-supabase-url",
    "hasAnonKey": true/false,
    "hasServiceRoleKey": true/false,
    "connectionError": "error message if any",
    "tablesFound": ["table names"]
  }
}
```

### Step 3: Interpret Results

#### ✅ **status: "success"**
- All environment variables are set correctly
- Connection to Supabase works
- Everything is configured properly!

#### ⚠️ **status: "partial"**
- Some variables are set but not all
- Connection might work but missing service_role key
- Check which variables are missing

#### ❌ **status: "failed"**
- Missing required environment variables
- Connection failed
- Check Vercel environment variables

---

## 🔧 What Each Check Means

### `checks.url`
- ✅ `true`: `NEXT_PUBLIC_SUPABASE_URL` is set correctly
- ❌ `false`: URL is missing or invalid

### `checks.anonKey`
- ✅ `true`: `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set (JWT format)
- ❌ `false`: Anon key is missing or wrong format

### `checks.serviceRoleKey`
- ✅ `true`: `SUPABASE_SERVICE_ROLE_KEY` is set (JWT format)
- ❌ `false`: Service role key is missing (this is needed for API routes!)

### `checks.connection`
- ✅ `true`: Successfully connected to Supabase
- ❌ `false`: Connection failed (check error message)

### `checks.tables`
- ✅ `true`: Database tables exist
- ❌ `false`: Tables might not exist (migration needed)

---

## 🚨 Common Issues & Fixes

### Issue: `serviceRoleKey: false`
**Problem:** `SUPABASE_SERVICE_ROLE_KEY` is not set
**Fix:** Add it to Vercel → Settings → Environment Variables

### Issue: `connection: false` with "Invalid API key"
**Problem:** Keys are wrong or don't match Supabase project
**Fix:** 
1. Go to Supabase Dashboard → Settings → API
2. Copy correct keys
3. Update Vercel environment variables
4. Redeploy

### Issue: `tables: false`
**Problem:** Database migration not run
**Fix:** Run migration SQL in Supabase Dashboard → SQL Editor

---

## 📋 Quick Action Checklist

After checking the endpoint:

- [ ] If `status: "success"` → ✅ Everything is working!
- [ ] If `status: "partial"` → Add missing environment variables
- [ ] If `status: "failed"` → Check all environment variables in Vercel
- [ ] If `connectionError` → Fix the specific error mentioned

---

## 🎯 Next Steps

1. **Visit:** `https://howtosellcursor.me/api/verify-supabase`
2. **Check the JSON response**
3. **Share the results** if you need help fixing issues

The endpoint will tell you exactly what's configured and what's missing! 🚀

