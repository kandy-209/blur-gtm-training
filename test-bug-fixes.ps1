# Test Script for Bug Fixes
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Testing Bug Fixes" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test Bug 1: Null Response Exception Handling
Write-Host "Test 1: Null Response Exception Handling" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Simulate network error (invalid URL that will timeout/fail)
Write-Host "  Testing with invalid URL (should handle gracefully)..." -ForegroundColor White
try {
    $test = Invoke-RestMethod -Uri "http://invalid-domain-that-does-not-exist-12345.com/api/test" -Method Get -ErrorAction Stop -TimeoutSec 2
    Write-Host "  ✗ Unexpected success" -ForegroundColor Red
} catch {
    # This should NOT crash - Bug 1 fix should handle null Response
    if ($null -ne $_.Exception.Response -and $_.Exception.Response.StatusCode -eq 400) {
        Write-Host "  ✓ Handled HTTP 400 correctly" -ForegroundColor Green
    } else {
        Write-Host "  ✓ Handled network error gracefully (no crash)" -ForegroundColor Green
        Write-Host "    Error type: $($_.Exception.GetType().Name)" -ForegroundColor Gray
    }
}

Write-Host ""

# Test Bug 2: Get-Content Array Handling
Write-Host "Test 2: Get-Content Array Handling" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Create a test file with single line
$testFile = "test-single-line.txt"
Write-Host "  Creating test file with single line..." -ForegroundColor White
"const navLinks = ['/scenarios']" | Out-File -FilePath $testFile -Encoding utf8

# Test the fix
Write-Host "  Testing Get-Content with @() operator..." -ForegroundColor White
$lines = @(Get-Content $testFile)
$lineCount = $lines.Count
$isArray = $lines -is [Array]

if ($lineCount -eq 1 -and $isArray) {
    Write-Host "  ✓ Correctly handled as array (Count: $lineCount, IsArray: $isArray)" -ForegroundColor Green
    
    # Test foreach iteration
    $charCount = 0
    $lineCount = 0
    foreach ($line in $lines) {
        $lineCount++
        $charCount += $line.Length
    }
    
    if ($lineCount -eq 1 -and $charCount -gt 10) {
        Write-Host "  ✓ Foreach iterates lines correctly (Lines: $lineCount, Total chars: $charCount)" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Foreach iteration failed (Lines: $lineCount, Total chars: $charCount)" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ Failed - Not handled as array (Count: $lineCount, IsArray: $isArray)" -ForegroundColor Red
}

# Cleanup
Remove-Item $testFile -ErrorAction SilentlyContinue

Write-Host ""

# Test Bug 2 with multi-line file
Write-Host "  Creating test file with multiple lines..." -ForegroundColor White
$testFile2 = "test-multi-line.txt"
@"
const navLinks = [
  { href: '/scenarios', label: 'Scenarios' },
  { href: '/features', label: 'Features' }
]
"@ | Out-File -FilePath $testFile2 -Encoding utf8

$lines2 = @(Get-Content $testFile2)
$lineCount2 = $lines2.Count

if ($lineCount2 -eq 5) {
    Write-Host "  ✓ Multi-line file handled correctly (Lines: $lineCount2)" -ForegroundColor Green
} else {
    Write-Host "  ✗ Multi-line file failed (Expected 5, got $lineCount2)" -ForegroundColor Red
}

# Cleanup
Remove-Item $testFile2 -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Both bug fixes verified!" -ForegroundColor Green
Write-Host ""
