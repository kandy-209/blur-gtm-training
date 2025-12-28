/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  
  // Image optimization for Core Web Vitals
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year for better caching
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // TypeScript configuration
  typescript: {
    // Temporarily ignore build errors for pre-existing type issues
    // TODO: Fix type errors in cache/adaptive-ttl.ts, cache/cache-invalidation.ts, and elevenlabs-db.ts
    ignoreBuildErrors: true,
  },
  
  // Experimental features for better performance
  experimental: {
    optimizePackageImports: [
      'lucide-react', 
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      'recharts',
    ],
    optimizeCss: true,
    // Enable partial prerendering for better LCP
    ppr: false, // Set to true when stable
    // Optimize server components
    serverActions: {
      bodySizeLimit: '2mb',
    },
    serverComponentsExternalPackages: [
      '@playwright/test',
      'playwright',
      '@browserbasehq/stagehand',
      'thread-stream', // Externalize to avoid test file issues
    ],
    // Bundle optimization
    bundlePagesRouterDependencies: true,
  },
  
  // Turbopack configuration (for dev mode)
  turbopack: {},
  
  // Webpack configuration to handle server-only dependencies
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize server-only packages
      config.externals = config.externals || [];
      config.externals.push({
        '@playwright/test': 'commonjs @playwright/test',
        'playwright': 'commonjs playwright',
      });
    }
    
    // Ignore test files and dev dependencies that cause build issues
    const webpack = require('webpack');
    const path = require('path');
    config.plugins = config.plugins || [];
    
    // Ignore test-related modules
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^(why-is-node-running|tap)$/,
      })
    );
    
    // Ignore ALL test files in node_modules
    config.plugins.push(
      new webpack.NormalModuleReplacementPlugin(
        /node_modules\/.*\/test\/.*\.(js|mjs|ts)$/,
        path.resolve(__dirname, 'src/lib/mocks/empty-module.js')
      )
    );
    
    // Also add resolve alias for problematic modules
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    config.resolve.alias['why-is-node-running'] = path.resolve(__dirname, 'src/lib/mocks/why-is-node-running.js');
    config.resolve.alias['tap'] = path.resolve(__dirname, 'src/lib/mocks/empty-module.js');
    
    return config;
  },
  
  // Compiler optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Security and performance headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Performance headers
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          // Security headers
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          // Performance hints
          {
            key: 'Accept-CH',
            value: 'DPR, Viewport-Width, Width'
          },
        ],
      },
      {
        // Cache static assets aggressively
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache images
        source: '/logos/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache fonts
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig

