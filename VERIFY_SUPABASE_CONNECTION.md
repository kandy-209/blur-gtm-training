# ✅ Verify Supabase Connection to Vercel

## How to Check if Supabase is Connected

### Step 1: Check Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your project: **cursor-gtm-training**

2. **Check Environment Variables**
   - Go to: **Settings** → **Environment Variables**
   - Look for these 3 variables:

   ✅ **Required Variables:**
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://dxgjaznmtsgvxnfnzhbn.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = Should be a long JWT token (starts with `eyJ...`)
   - `SUPABASE_SERVICE_ROLE_KEY` = Should be a long JWT token (starts with `eyJ...`)

3. **Verify They're Set for All Environments**
   - Each variable should be checked for:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

---

## ✅ What to Look For

### Correct Setup:
- ✅ All 3 variables are present
- ✅ Values are set (not empty)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` matches your Supabase project URL
- ✅ Keys are long JWT tokens (200+ characters, start with `eyJ...`)
- ✅ Variables are enabled for Production, Preview, and Development

### Missing Setup:
- ❌ Variables are missing
- ❌ Values are empty
- ❌ Only 1-2 variables are set (need all 3)
- ❌ Variables only set for one environment

---

## 🧪 Test the Connection

### Option 1: Check Deployment Logs

1. **Go to Vercel Dashboard** → **Deployments**
2. **Click on latest deployment**
3. **Check Build Logs** for:
   - ✅ No "Invalid API key" errors
   - ✅ No "Database not configured" errors
   - ✅ Build completes successfully

### Option 2: Test on Live Site

1. **Visit your live site:** https://howtosellcursor.me/
2. **Go to Leaderboard page:** `/leaderboard`
3. **Check browser console** (F12 → Console tab):
   - ✅ No "Invalid API key" errors
   - ✅ Leaderboard loads (even if empty)

### Option 3: Check Server Logs

1. **Go to Vercel Dashboard** → **Functions** tab
2. **Click on a function** (e.g., `/api/leaderboard`)
3. **Check logs** for:
   - ✅ No Supabase connection errors
   - ✅ Successful API calls

---

## 🔍 Quick Verification Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel
- [ ] All variables are enabled for Production, Preview, Development
- [ ] Latest deployment completed successfully
- [ ] No "Invalid API key" errors in logs
- [ ] Leaderboard page loads without errors

---

## 🚨 Common Issues

### Issue: Variables Not Set
**Solution:** Add all 3 variables to Vercel → Settings → Environment Variables

### Issue: Wrong Key Format
**Problem:** Keys don't start with `eyJ...` (might be Stripe keys instead)
**Solution:** Get correct Supabase keys from Supabase Dashboard → Settings → API

### Issue: Variables Only Set for One Environment
**Solution:** Make sure to check Production, Preview, AND Development when adding variables

### Issue: "Invalid API key" Error Still Appears
**Solution:** 
1. Verify `SUPABASE_SERVICE_ROLE_KEY` is set (not just anon key)
2. Make sure keys match exactly from Supabase dashboard
3. Redeploy after adding/updating variables

---

## 📋 Next Steps After Verification

If everything is set correctly:

1. ✅ **Redeploy** (if you just added variables)
   - Vercel Dashboard → Deployments → Latest → Redeploy

2. ✅ **Test the site**
   - Visit `/leaderboard` page
   - Should load without errors

3. ✅ **Check Supabase Dashboard**
   - Go to Supabase → Table Editor
   - Should see tables: `user_ratings`, `user_profiles`, etc.

---

## 🎯 Summary

**To verify Supabase is connected:**
1. Check Vercel → Settings → Environment Variables (all 3 should be there)
2. Check deployment logs (no errors)
3. Test live site (leaderboard loads)

**If all checks pass → Supabase is connected! ✅**




