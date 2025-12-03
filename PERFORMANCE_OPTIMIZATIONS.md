# Core Web Vitals & Lighthouse Optimizations

## Overview
This document outlines the performance optimizations implemented to improve Core Web Vitals (CrUX) and Lighthouse scores.

## Core Web Vitals Targets

### Mobile
- **LCP (Largest Contentful Paint)**: < 2.5s (Good)
- **FID (First Input Delay)**: < 100ms (Good)
- **CLS (Cumulative Layout Shift)**: < 0.1 (Good)
- **FCP (First Contentful Paint)**: < 1.8s (Good)
- **TTFB (Time to First Byte)**: < 800ms (Good)

### Desktop
- **LCP**: < 2.5s (Good)
- **FID**: < 100ms (Good)
- **CLS**: < 0.1 (Good)
- **FCP**: < 1.8s (Good)
- **TTFB**: < 800ms (Good)

## Implemented Optimizations

### 1. Next.js Configuration (`next.config.js`)

#### Image Optimization
- **AVIF & WebP formats**: Modern image formats for better compression
- **Device sizes**: Optimized for various screen sizes
- **Cache TTL**: 1 year for better caching
- **SVG support**: With security policies

#### Performance Features
- **SWC Minification**: Faster builds and smaller bundles
- **Package Import Optimization**: Tree-shaking for lucide-react and Radix UI
- **CSS Optimization**: Experimental CSS optimization enabled
- **Console Removal**: Removes console.log in production (keeps errors/warnings)

#### Caching Headers
- **Static Assets**: 1 year cache with immutable flag
- **Images**: 1 year cache
- **Fonts**: 1 year cache

### 2. Resource Hints (`src/app/layout.tsx`)

#### Preconnect
- Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
- External APIs (ElevenLabs, OpenAI)

#### DNS Prefetch
- External API domains for faster connection

#### Preload
- Critical logo SVG
- Critical fonts

#### Prefetch
- Important routes (scenarios, sales-skills)

### 3. Core Web Vitals Tracking (`src/lib/performance.ts`)

#### Metrics Tracked
- LCP (Largest Contentful Paint)
- FID (First Input Delay) / INP (Interaction to Next Paint)
- CLS (Cumulative Layout Shift)
- FCP (First Contentful Paint)
- TTFB (Time to First Byte)

#### Implementation
- Uses `web-vitals` library for accurate measurements
- Falls back to Performance Observer API if library unavailable
- Reports to analytics endpoint
- Logs in development mode

### 4. Image Loading Optimization

#### Lazy Loading
- Images below the fold use Intersection Observer
- `data-src` attribute for deferred loading
- Automatic loading when in viewport

#### Critical Resource Preloading
- Preloads critical images and fonts
- Improves LCP by loading above-the-fold content faster

### 5. Lighthouse Workflow Enhancements

#### Throttling Configuration
- **Mobile**: 4x CPU slowdown, 150ms RTT, 1600 Kbps
- **Desktop**: 1x CPU slowdown, 40ms RTT, 10240 Kbps

#### Core Web Vitals Extraction
- Extracts LCP, FID, CLS, FCP, TTFB from Lighthouse reports
- Displays metrics in workflow summary
- Compares against targets

## Performance Monitoring

### Real User Monitoring (RUM)
- Web Vitals component tracks metrics in production
- Sends data to `/api/analytics/web-vitals`
- Integrates with Vercel Analytics

### Lighthouse CI
- Weekly automated Lighthouse runs
- Tracks performance regressions
- Threshold checks (90+ score required)

## Best Practices

### Images
1. Use Next.js Image component for automatic optimization
2. Specify width and height to prevent layout shift
3. Use `loading="lazy"` for below-the-fold images
4. Prefer AVIF/WebP formats

### Fonts
1. Use `next/font` for automatic optimization
2. Preload critical fonts
3. Use `font-display: swap` for better FCP

### JavaScript
1. Code splitting with dynamic imports
2. Remove unused code (tree-shaking)
3. Minimize bundle size
4. Use SWC for faster compilation

### CSS
1. Critical CSS inlined
2. Non-critical CSS loaded asynchronously
3. Remove unused CSS

### Caching
1. Aggressive caching for static assets
2. Appropriate cache headers for API responses
3. Service Worker for offline support (future)

## Monitoring & Alerts

### Lighthouse CI
- Runs every Monday at 9 AM UTC
- Fails if performance < 90
- Uploads reports as artifacts

### Core Web Vitals
- Tracked in production via WebVitals component
- Logged to analytics endpoint
- Can be viewed in Google Search Console

## Future Optimizations

1. **Service Worker**: Offline support and caching
2. **HTTP/3**: Faster connection with QUIC
3. **Partial Prerendering**: Enable when stable in Next.js
4. **Edge Functions**: Move API routes to edge for lower latency
5. **Image CDN**: Use Vercel Image Optimization or Cloudinary
6. **Font Subsetting**: Reduce font file sizes
7. **Resource Hints**: Add more preconnect/prefetch for critical resources

## Testing

### Local Testing
```bash
# Run Lighthouse locally
npm install -g lighthouse
lighthouse http://localhost:3000 --view

# Test Core Web Vitals
# Open Chrome DevTools > Performance > Record
# Check Web Vitals in the Performance panel
```

### CI Testing
- Lighthouse runs automatically in GitHub Actions
- Check workflow runs for performance scores
- Review artifacts for detailed reports

## Resources

- [Web Vitals](https://web.dev/vitals/)
- [Lighthouse Scoring](https://web.dev/performance-scoring/)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Core Web Vitals Thresholds](https://web.dev/vitals/#core-web-vitals)

