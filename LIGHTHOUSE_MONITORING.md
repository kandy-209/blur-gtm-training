# 📊 Lighthouse Performance Monitoring Guide

## Automated Weekly Lighthouse Testing

This project includes automated Lighthouse performance testing that runs every week to track Core Web Vitals and other performance metrics.

---

## 🚀 Quick Start

### Manual Testing

Run Lighthouse tests locally:

```bash
chmod +x test-lighthouse.sh
./test-lighthouse.sh
```

Or test a specific domain:

```bash
./test-lighthouse.sh cursorsalestrainer.com
```

### Automated Weekly Testing

The GitHub Actions workflow runs automatically every **Monday at 9 AM UTC**.

**To trigger manually:**
1. Go to: **GitHub** → **Actions** → **Lighthouse Weekly Performance Test**
2. Click **"Run workflow"**
3. Select branch and click **"Run workflow"**

---

## 📊 What Gets Tested

### Categories:
- ✅ **Performance** - Core Web Vitals (LCP, INP, CLS)
- ✅ **Accessibility** - WCAG compliance
- ✅ **Best Practices** - Security, modern web standards
- ✅ **SEO** - Search engine optimization

### Devices:
- 📱 **Mobile** - Mobile-first performance
- 🖥️ **Desktop** - Desktop experience

---

## 📈 Understanding Scores

### Performance Score Targets:
- **90-100**: Excellent ✅
- **50-89**: Needs Improvement ⚠️
- **0-49**: Poor ❌

### Core Web Vitals Targets:
- **LCP** (Largest Contentful Paint): < 2.5s
- **INP** (Interaction to Next Paint): < 200ms
- **CLS** (Cumulative Layout Shift): < 0.1

---

## 📋 Weekly Reports

### Where to Find Reports:

1. **GitHub Actions Artifacts**:
   - Go to: **Actions** → **Lighthouse Weekly Performance Test**
   - Click on latest run
   - Download **"lighthouse-reports"** artifact
   - Open HTML files in browser

2. **Local Reports**:
   - Reports saved to: `./lighthouse-reports/`
   - Open HTML files directly in browser

---

## 🔍 Reading Lighthouse Reports

### Performance Metrics:
- **First Contentful Paint (FCP)**: Time to first content
- **Largest Contentful Paint (LCP)**: Time to largest content
- **Total Blocking Time (TBT)**: Time page is blocked
- **Speed Index**: How quickly content is displayed
- **Time to Interactive (TTI)**: When page becomes interactive

### Opportunities:
- Lighthouse suggests optimizations
- Click on each opportunity for details
- Prioritize by "Potential Savings"

---

## 🎯 Performance Optimization Tips

### Common Issues & Fixes:

1. **Large Images**
   - Use Next.js Image component
   - Optimize images (WebP, AVIF)
   - Implement lazy loading

2. **Unused JavaScript**
   - Code splitting
   - Tree shaking
   - Remove unused dependencies

3. **Render-Blocking Resources**
   - Defer non-critical CSS
   - Async load JavaScript
   - Preload critical resources

4. **Large Bundle Size**
   - Dynamic imports
   - Route-based code splitting
   - Optimize dependencies

5. **Poor Caching**
   - Set proper cache headers
   - Use CDN caching
   - Implement service workers

---

## 📊 Tracking Performance Over Time

### Weekly Trends:

Check GitHub Actions history to see:
- Performance score trends
- Regression detection
- Improvement tracking

### Performance Budget:

The workflow fails if:
- Mobile Performance < 90
- Desktop Performance < 90

This ensures performance regressions are caught early.

---

## 🔧 Configuration

### Change Schedule:

Edit `.github/workflows/lighthouse-weekly.yml`:

```yaml
schedule:
  - cron: '0 9 * * 1'  # Monday 9 AM UTC
```

Cron format: `minute hour day month weekday`

### Change Thresholds:

Edit the "Check Performance Thresholds" step:

```yaml
if [ "$MOBILE_PERF" -lt 90 ]; then
  # Change 90 to your desired threshold
```

---

## 📱 Mobile-First Priority

Google prioritizes mobile performance, so:
- ✅ Focus on mobile scores
- ✅ Test on real mobile devices
- ✅ Use mobile-first CSS
- ✅ Optimize for slower connections

---

## 🔗 Related Tools

- **PageSpeed Insights**: https://pagespeed.web.dev/
- **WebPageTest**: https://www.webpagetest.org/
- **Chrome DevTools**: Built-in Lighthouse
- **Google Search Console**: Real user metrics (CrUX)

---

## 📝 Best Practices

1. **Run tests regularly**: Weekly automated + before major releases
2. **Compare trends**: Track scores over time
3. **Fix regressions**: Address issues immediately
4. **Set budgets**: Prevent performance degradation
5. **Monitor real users**: Combine with CrUX data

---

## 🆘 Troubleshooting

### Tests Failing?

1. **Check GitHub Actions logs**
2. **Run tests locally** to debug
3. **Verify site is accessible** from GitHub Actions
4. **Check for deployment issues**

### Low Scores?

1. **Review Lighthouse opportunities**
2. **Check Core Web Vitals**
3. **Optimize largest issues first**
4. **Test improvements incrementally**

---

**Your site is now monitored weekly for performance! Check GitHub Actions every Monday for the latest report.** 🚀

