# Debugging Guide

## Server-Side Debugging

### Starting with Debugger
```bash
npm run dev -- --inspect
# or
next dev --inspect
```

### Chrome DevTools
1. Open `chrome://inspect` in Chrome
2. Find your Next.js app in "Remote Target" section
3. Click "inspect"
4. Go to Sources tab
5. Search files with `Ctrl+P` (or `Cmd+P` on Mac)
6. Files will be under `webpack://{app-name}/./`

### Firefox DevTools
1. Open `about:debugging` in Firefox
2. Click "This Firefox" in sidebar
3. Find app under "Remote Targets"
4. Click "Inspect"
5. Go to Debugger tab

### Advanced Options
```bash
# Break on start
NODE_OPTIONS=--inspect-brk next dev

# Wait for debugger
NODE_OPTIONS=--inspect-wait next dev

# Remote debugging (Docker)
next dev --inspect=0.0.0.0
```

## Common Issues Fixed

### ✅ Date Validation Errors
- **Issue**: `Invalid time value` errors in analytics
- **Fix**: Added `safeDate()` utility to validate all dates
- **Files**: `src/lib/date-utils.ts`, `src/lib/analytics-cache.ts`

### ✅ Hydration Mismatch
- **Issue**: Server/client className mismatch
- **Fix**: Added `relative` to base Button component classes
- **Files**: `src/components/ui/button.tsx`

## Debugging Tips

1. **Set Breakpoints**: Click line numbers in Sources tab
2. **Watch Variables**: Add to Watch panel
3. **Call Stack**: See execution path
4. **Console**: Run code in current context
5. **Network**: Check API calls in Network tab

## Recent Fixes Summary

- ✅ Date validation for analytics
- ✅ Hydration mismatch in buttons
- ✅ Fluid design optimizations
- ✅ Performance improvements

