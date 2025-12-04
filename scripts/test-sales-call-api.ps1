# Sales Call API Test Script
# Tests the sales call API endpoints

Write-Host "🧪 Testing Sales Call API" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"
$testUserId = "test_user_123"
$testScenarioId = "SKEPTIC_VPE_001"
$testPhoneNumber = "+15551234567"

# Test 1: Initiate Call
Write-Host "Test 1: Initiate Sales Call" -ForegroundColor Yellow
try {
    $body = @{
        phoneNumber = $testPhoneNumber
        userId = $testUserId
        scenarioId = $testScenarioId
        trainingMode = "practice"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/vapi/sales-call" -Method POST -Body $body -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Call initiated successfully" -ForegroundColor Green
        Write-Host "   Call ID: $($response.callId)" -ForegroundColor White
        Write-Host "   Status: $($response.status)" -ForegroundColor White
        $callId = $response.callId
    } else {
        Write-Host "❌ Failed to initiate call" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get Call Analysis (if callId exists)
if ($callId) {
    Write-Host "Test 2: Get Call Analysis" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/api/vapi/sales-call?callId=$callId&scenarioId=$testScenarioId" -Method GET
        
        if ($response.success) {
            Write-Host "✅ Analysis retrieved successfully" -ForegroundColor Green
            Write-Host "   Metrics: $($response.metrics | ConvertTo-Json -Depth 1)" -ForegroundColor White
        } else {
            Write-Host "❌ Failed to get analysis" -ForegroundColor Red
        }
    } catch {
        Write-Host "⚠️  Analysis not available (call may still be in progress)" -ForegroundColor Yellow
    }
}

Write-Host ""

# Test 3: Validation Tests
Write-Host "Test 3: Validation Tests" -ForegroundColor Yellow

# Missing required fields
try {
    $body = @{
        phoneNumber = $testPhoneNumber
        # Missing userId and scenarioId
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/vapi/sales-call" -Method POST -Body $body -ContentType "application/json" -ErrorAction Stop
    Write-Host "❌ Should have failed validation" -ForegroundColor Red
} catch {
    Write-Host "✅ Validation working (correctly rejected invalid request)" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ API Tests Complete!" -ForegroundColor Green

