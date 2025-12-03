# 📊 Google Core Web Vitals (CrUX) Testing Guide

## What is Google CrUX?

Chrome User Experience Report (CrUX) provides real-world performance metrics from actual Chrome users. It measures:
- **LCP** (Largest Contentful Paint) - Loading performance
- **FID** (First Input Delay) / **INP** (Interaction to Next Paint) - Interactivity
- **CLS** (Cumulative Layout Shift) - Visual stability

---

## 🚀 Quick Setup Steps

### Step 1: Set Up Google Search Console

1. Go to: **https://search.google.com/search-console**
2. Click **"Add Property"**
3. Enter your domain: `cursorsalestrainer.com`
4. Verify ownership using one of these methods:
   - **HTML file upload** (easiest)
   - **HTML tag** (add to your site)
   - **DNS record** (if you have access)
   - **Google Analytics** (if already connected)

### Step 2: Verify Domain Ownership

**Option A: HTML File Upload**
1. Download the HTML verification file
2. Upload it to your site's root: `/public/google-site-verification.html`
3. Access it at: `https://cursorsalestrainer.com/google-site-verification.html`
4. Click "Verify" in Search Console

**Option B: HTML Tag**
1. Copy the meta tag from Search Console
2. Add it to `src/app/layout.tsx` in the `<head>` section
3. Deploy and verify

### Step 3: Submit Your Sitemap

1. In Search Console, go to **Sitemaps**
2. Enter: `https://cursorsalestrainer.com/sitemap.xml`
3. Click **Submit**
4. Wait for Google to crawl (can take a few days)

### Step 4: Check Core Web Vitals

1. In Search Console, go to **Experience** → **Core Web Vitals**
2. Wait 28 days for data to accumulate (CrUX needs real user data)
3. View metrics for mobile and desktop

---

## 🔍 Alternative: PageSpeed Insights (Immediate Testing)

While CrUX needs real user data, PageSpeed Insights gives instant results:

### Option 1: Web Interface

1. Go to: **https://pagespeed.web.dev/**
2. Enter: `https://cursorsalestrainer.com`
3. Click **Analyze**
4. View Core Web Vitals scores

### Option 2: API Testing

Use the script below to test programmatically.

---

## 📊 Understanding Core Web Vitals Scores

### LCP (Largest Contentful Paint) - Loading
- **Good**: ≤ 2.5 seconds
- **Needs Improvement**: 2.5 - 4.0 seconds
- **Poor**: > 4.0 seconds

### FID/INP (First Input Delay / Interaction to Next Paint) - Interactivity
- **Good**: ≤ 100ms (FID) / ≤ 200ms (INP)
- **Needs Improvement**: 100-300ms (FID) / 200-500ms (INP)
- **Poor**: > 300ms (FID) / > 500ms (INP)

### CLS (Cumulative Layout Shift) - Visual Stability
- **Good**: ≤ 0.1
- **Needs Improvement**: 0.1 - 0.25
- **Poor**: > 0.25

---

## 🎯 Target Scores

For optimal SEO and user experience:
- ✅ **LCP**: < 2.5s
- ✅ **INP**: < 200ms
- ✅ **CLS**: < 0.1

---

## 📝 Next Steps After Setup

1. **Monitor regularly**: Check Search Console weekly
2. **Fix issues**: Address any "Poor" or "Needs Improvement" metrics
3. **Track improvements**: Watch scores improve over time
4. **Mobile-first**: Focus on mobile performance (Google's priority)

---

## 🔗 Useful Links

- **Google Search Console**: https://search.google.com/search-console
- **PageSpeed Insights**: https://pagespeed.web.dev/
- **CrUX Dashboard**: https://developers.google.com/web/tools/chrome-user-experience-report
- **Core Web Vitals Guide**: https://web.dev/vitals/

---

## ⚠️ Important Notes

1. **CrUX requires real user data**: Takes 28 days to accumulate
2. **PageSpeed Insights**: Gives instant results but uses lab data (simulated)
3. **Both are important**: CrUX = real users, PSI = optimization opportunities
4. **Mobile priority**: Google prioritizes mobile performance

---

**Start with PageSpeed Insights for immediate feedback, then set up Search Console for long-term monitoring!** 🚀

