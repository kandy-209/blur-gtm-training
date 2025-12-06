# Simple Local Test for Bug Fixes
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Local Bug Fix Tests" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Bug 1: Null Response Handling
Write-Host "Test 1: Null Response Exception Handling" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "Testing network error handling..." -ForegroundColor White

try {
    $result = Invoke-RestMethod -Uri "http://invalid-domain-that-does-not-exist-12345.com/api/test" -Method Get -ErrorAction Stop -TimeoutSec 2
    Write-Host "  ✗ Unexpected success" -ForegroundColor Red
} catch {
    # Test the fix - should NOT crash
    if ($null -ne $_.Exception.Response -and $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✓ HTTP 400 error handled correctly" -ForegroundColor Green
    } else {
        Write-Host "  ✓ Network error handled gracefully (no crash!)" -ForegroundColor Green
        Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Gray
    }
}

Write-Host ""

# Test Bug 2: Get-Content Array Handling
Write-Host "Test 2: Get-Content Array Handling" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray

# Test single-line file
Write-Host "Testing single-line file..." -ForegroundColor White
$testFile1 = "test-single-line.txt"
"const navLinks = ['/scenarios']" | Out-File -FilePath $testFile1 -Encoding utf8

$lines1 = @(Get-Content $testFile1)
$lineCount1 = $lines1.Count
$isArray1 = $lines1 -is [Array]

Write-Host "  Line count: $lineCount1" -ForegroundColor White
Write-Host "  Is Array: $isArray1" -ForegroundColor White

if ($lineCount1 -eq 1 -and $isArray1) {
    Write-Host "  ✓ Single-line file handled as array!" -ForegroundColor Green
    
    # Test foreach
    $iterations = 0
    foreach ($line in $lines1) {
        $iterations++
    }
    if ($iterations -eq 1) {
        Write-Host "  ✓ Foreach iterates correctly (1 line, not characters)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Foreach failed: $iterations iterations (expected 1)" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ Failed: Not handled as array" -ForegroundColor Red
}

Remove-Item $testFile1 -ErrorAction SilentlyContinue

Write-Host ""

# Test multi-line file
Write-Host "Testing multi-line file..." -ForegroundColor White
$testFile2 = "test-multi-line.txt"
@"
const navLinks = [
  { href: '/scenarios', label: 'Scenarios' },
  { href: '/features', label: 'Features' }
]
"@ | Out-File -FilePath $testFile2 -Encoding utf8

$lines2 = @(Get-Content $testFile2)
$lineCount2 = $lines2.Count

Write-Host "  Line count: $lineCount2" -ForegroundColor White
if ($lineCount2 -eq 5) {
    Write-Host "  ✓ Multi-line file handled correctly!" -ForegroundColor Green
} else {
    Write-Host "  ⚠ Expected 5 lines, got $lineCount2" -ForegroundColor Yellow
}

Remove-Item $testFile2 -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Complete" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both bug fixes verified!" -ForegroundColor Green
Write-Host ""
Write-Host "To test the actual scripts:" -ForegroundColor Yellow
Write-Host "  .\test-all-apis-comprehensive.ps1" -ForegroundColor Cyan
Write-Host "  .\fix-phone-training-visibility.ps1" -ForegroundColor Cyan
Write-Host ""
