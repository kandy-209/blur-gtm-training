# PowerShell script to check for dependency updates
# Run daily to check for outdated packages and security vulnerabilities

Write-Host "🔍 Checking for dependency updates..." -ForegroundColor Cyan
Write-Host ""

# Check for outdated packages
Write-Host "📦 Checking outdated packages..." -ForegroundColor Yellow
$outdated = npm outdated --json 2>$null | ConvertFrom-Json

if ($outdated) {
    Write-Host "⚠️  Found outdated packages:" -ForegroundColor Yellow
    $outdated.PSObject.Properties | ForEach-Object {
        $name = $_.Name
        $current = $_.Value.current
        $wanted = $_.Value.wanted
        $latest = $_.Value.latest
        
        Write-Host "  • $name" -ForegroundColor White
        Write-Host "    Current: $current → Wanted: $wanted → Latest: $latest" -ForegroundColor Gray
    }
} else {
    Write-Host "✅ All packages are up to date!" -ForegroundColor Green
}

Write-Host ""

# Check for security vulnerabilities
Write-Host "🔒 Checking for security vulnerabilities..." -ForegroundColor Yellow
$audit = npm audit --json 2>$null | ConvertFrom-Json

if ($audit.vulnerabilities) {
    $vulnCount = ($audit.vulnerabilities | Measure-Object).Count
    Write-Host "⚠️  Found $vulnCount vulnerabilities:" -ForegroundColor Red
    
    $critical = 0
    $high = 0
    $moderate = 0
    $low = 0
    
    $audit.vulnerabilities.PSObject.Properties | ForEach-Object {
        $severity = $_.Value.severity
        switch ($severity) {
            "critical" { $critical++ }
            "high" { $high++ }
            "moderate" { $moderate++ }
            "low" { $low++ }
        }
    }
    
    Write-Host "  Critical: $critical" -ForegroundColor Red
    Write-Host "  High: $high" -ForegroundColor Yellow
    Write-Host "  Moderate: $moderate" -ForegroundColor Cyan
    Write-Host "  Low: $low" -ForegroundColor Gray
    
    Write-Host ""
    Write-Host "💡 Run 'npm audit fix' to automatically fix vulnerabilities" -ForegroundColor Cyan
} else {
    Write-Host "✅ No security vulnerabilities found!" -ForegroundColor Green
}

Write-Host ""

# Check for deprecated packages
Write-Host "📋 Checking for deprecated packages..." -ForegroundColor Yellow
$deprecated = npm list --json 2>$null | ConvertFrom-Json

if ($deprecated.dependencies) {
    $deprecatedList = @()
    function CheckDeprecated($deps, $path = "") {
        foreach ($dep in $deps.PSObject.Properties) {
            $depPath = if ($path) { "$path > $($dep.Name)" } else { $dep.Name }
            if ($dep.Value.deprecated) {
                $deprecatedList += [PSCustomObject]@{
                    Package = $depPath
                    Deprecated = $dep.Value.deprecated
                }
            }
            if ($dep.Value.dependencies) {
                CheckDeprecated $dep.Value.dependencies $depPath
            }
        }
    }
    
    CheckDeprecated $deprecated.dependencies
    
    if ($deprecatedList.Count -gt 0) {
        Write-Host "⚠️  Found deprecated packages:" -ForegroundColor Yellow
        $deprecatedList | ForEach-Object {
            Write-Host "  • $($_.Package)" -ForegroundColor White
            Write-Host "    $($_.Deprecated)" -ForegroundColor Gray
        }
    } else {
        Write-Host "✅ No deprecated packages found!" -ForegroundColor Green
    }
} else {
    Write-Host "✅ No deprecated packages found!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📊 Summary:" -ForegroundColor Cyan
Write-Host "  Outdated packages: $($outdated.PSObject.Properties.Count)" -ForegroundColor White
Write-Host "  Vulnerabilities: $($audit.vulnerabilities.PSObject.Properties.Count)" -ForegroundColor White
Write-Host "  Deprecated packages: $($deprecatedList.Count)" -ForegroundColor White
Write-Host ""
Write-Host "✅ Dependency check complete!" -ForegroundColor Green




