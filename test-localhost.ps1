# Test Localhost Server
Write-Host "Testing localhost server..." -ForegroundColor Cyan
Write-Host ""

# Check if port 3000 is in use
$portCheck = netstat -ano | findstr :3000
if ($portCheck) {
    Write-Host "✓ Port 3000 is active" -ForegroundColor Green
} else {
    Write-Host "✗ Port 3000 is not active" -ForegroundColor Red
    Write-Host "Starting server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Laxmo\Modal Test\cursor-gtm-training'; npm run dev"
    Write-Host "Waiting 20 seconds for server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 20
}

# Test server response
Write-Host ""
Write-Host "Testing http://localhost:3000..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Server is responding!" -ForegroundColor Green
    Write-Host "  Status Code: $($response.StatusCode)" -ForegroundColor White
    Write-Host "  Content Length: $($response.Content.Length) bytes" -ForegroundColor White
    Write-Host ""
    Write-Host "Opening browser..." -ForegroundColor Cyan
    Start-Process "http://localhost:3000"
    Write-Host ""
    Write-Host "✅ LOCALHOST SERVER IS WORKING!" -ForegroundColor Green
} catch {
    Write-Host "✗ Server is not responding" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Trying to start server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\Laxmo\Modal Test\cursor-gtm-training'; npm run dev"
    Write-Host "Wait 20-30 seconds, then refresh http://localhost:3000" -ForegroundColor Yellow
}
