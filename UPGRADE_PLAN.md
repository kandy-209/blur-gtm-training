# 🚀 Dependency Upgrade Plan

## Current Status

From `npm outdated`, here are the packages that can be upgraded:

### Safe Minor/Patch Updates (Low Risk)
- ✅ **Next.js**: `16.0.6` → `16.0.7` (patch)
- ✅ **eslint-config-next**: `16.0.6` → `16.0.7` (patch)

### Major Version Updates (Requires Testing)
- ⚠️ **OpenAI**: `4.104.0` → `6.9.1` (major - breaking changes likely)
- ⚠️ **Tailwind CSS**: `3.4.18` → `4.1.17` (major - breaking changes)
- ⚠️ **Jest**: `29.7.0` → `30.2.0` (major - breaking changes)
- ⚠️ **@types/jest**: `29.5.14` → `30.0.0` (major - follows Jest)
- ⚠️ **ESLint**: `8.57.1` → `9.39.1` (major - breaking changes)

---

## Upgrade Strategy

### Phase 1: Safe Updates (Do First)
1. Next.js 16.0.7
2. eslint-config-next 16.0.7

### Phase 2: Major Updates (Test Carefully)
1. Jest 30 + @types/jest 30
2. ESLint 9
3. OpenAI 6 (check API changes)
4. Tailwind CSS 4 (check migration guide)

---

## Upgrade Steps

### Step 1: Safe Updates
```bash
npm install next@latest eslint-config-next@latest
```

### Step 2: Test
```bash
npm run build
npm test
npm run lint
```

### Step 3: Major Updates (One at a time)
```bash
# Jest first
npm install jest@latest @types/jest@latest jest-environment-jsdom@latest

# Then ESLint
npm install eslint@latest

# Then OpenAI (check breaking changes)
npm install openai@latest

# Finally Tailwind (check migration)
npm install tailwindcss@latest
```

---

## Breaking Changes to Watch

### OpenAI v6
- API structure may have changed
- Check: https://github.com/openai/openai-node/releases

### Tailwind CSS v4
- New configuration format
- Check: https://tailwindcss.com/docs/upgrade-guide

### Jest v30
- New features and potential breaking changes
- Check: https://jestjs.io/docs/upgrading-to-jest30

### ESLint v9
- Flat config format
- Check: https://eslint.org/docs/latest/use/migrate-to-9.0.0

---

## Testing Checklist

After each upgrade:
- [ ] `npm run build` succeeds
- [ ] `npm test` passes
- [ ] `npm run lint` passes
- [ ] Dev server starts: `npm run dev`
- [ ] Manual testing of key features
- [ ] Check for deprecation warnings

---

## Rollback Plan

If issues occur:
```bash
git checkout package.json package-lock.json
npm install
```
