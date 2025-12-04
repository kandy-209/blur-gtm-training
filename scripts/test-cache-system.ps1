# Test Cache System Script
# Runs all cache-related tests

Write-Host "🧪 Testing Cache System..." -ForegroundColor Cyan

# Set execution policy for this session
Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

# Run cache-related tests
Write-Host "`n📦 Running Cache Wrapper Tests..." -ForegroundColor Yellow
npx jest src/lib/__tests__/next-cache-wrapper.test.ts --no-coverage --silent 2>&1 | Out-String

Write-Host "`n📋 Running Cache Headers Tests..." -ForegroundColor Yellow
npx jest src/lib/__tests__/cache-headers.test.ts --no-coverage --silent 2>&1 | Out-String

Write-Host "`n🔍 Running Edge Case Tests..." -ForegroundColor Yellow
npx jest src/lib/__tests__/next-cache-wrapper-edge-cases.test.ts --no-coverage --silent 2>&1 | Out-String

Write-Host "`n🔗 Running Integration Tests..." -ForegroundColor Yellow
npx jest src/lib/__tests__/integration-cache-flow.test.ts --no-coverage --silent 2>&1 | Out-String

Write-Host "`n✅ Cache System Tests Complete!" -ForegroundColor Green

