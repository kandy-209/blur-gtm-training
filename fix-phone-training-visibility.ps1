# Fix Phone Training Visibility
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Fix Phone Training Visibility" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if navigation link exists
Write-Host "1. Checking Navigation Link..." -ForegroundColor Yellow
$navFile = "src/components/NavUser.tsx"
if (Test-Path $navFile) {
    $navContent = Get-Content $navFile -Raw
    if ($navContent -match "sales-training.*Phone Training") {
        Write-Host "   ✓ Navigation link found in code" -ForegroundColor Green
    } else {
        Write-Host "   ✗ Navigation link NOT found!" -ForegroundColor Red
        Write-Host "   Adding navigation link..." -ForegroundColor Yellow
        
        # Read file - force array to handle single-line files correctly
        $lines = @(Get-Content $navFile)
        $newLines = @()
        $foundNavLinks = $false
        $linkAdded = $false
        
        foreach ($line in $lines) {
            $newLines += $line
            if ($line -match "const navLinks = \[") {
                $foundNavLinks = $true
            }
            if ($foundNavLinks -and -not $linkAdded -and $line -match "'/scenarios'") {
                # Add Phone Training link after Scenarios (only once)
                $newLines += "    { href: '/sales-training', label: 'Phone Training' },"
                $linkAdded = $true
            }
        }
        
        $newLines | Set-Content $navFile
        Write-Host "   ✓ Navigation link added" -ForegroundColor Green
    }
} else {
    Write-Host "   ✗ NavUser.tsx not found!" -ForegroundColor Red
}

Write-Host ""

# Check if sales-training page exists
Write-Host "2. Checking Sales Training Page..." -ForegroundColor Yellow
$pageFile = "src/app/sales-training/page.tsx"
if (Test-Path $pageFile) {
    Write-Host "   ✓ Sales training page exists" -ForegroundColor Green
} else {
    Write-Host "   ✗ Sales training page NOT found!" -ForegroundColor Red
    Write-Host "   Creating page..." -ForegroundColor Yellow
    
    # Create directory
    $pageDir = "src/app/sales-training"
    if (-not (Test-Path $pageDir)) {
        New-Item -ItemType Directory -Path $pageDir -Force | Out-Null
    }
    
    # Create page file
    $pageContent = @'
/**
 * Sales Training Page
 * Phone call training for sales reps
 */

'use client';

import { PhoneCallTraining } from '@/components/SalesTraining/PhoneCallTraining';
import CallTrainingAnalytics from '@/components/CallTrainingAnalytics';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Target, TrendingUp, Award, Radio } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function SalesTrainingPage() {
  const { user } = useAuth();
  const userId = user?.id || `guest_${Date.now()}`;

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-6 w-6" />
                Sales Phone Call Training
              </CardTitle>
              <CardDescription>
                Practice real sales calls with AI prospects. Get instant feedback and improve your skills.
              </CardDescription>
            </div>
            <Link href="/live-call-dashboard">
              <Button variant="outline" className="gap-2">
                <Radio className="h-4 w-4" />
                Live Dashboard
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <Target className="h-8 w-8 text-blue-600 mb-2" />
              <h3 className="font-semibold mb-1">Real Scenarios</h3>
              <p className="text-sm text-muted-foreground">
                Practice with realistic enterprise prospects and objections
              </p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <h3 className="font-semibold mb-1">AI Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Get instant feedback on objection handling and closing
              </p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <Award className="h-8 w-8 text-purple-600 mb-2" />
              <h3 className="font-semibold mb-1">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your improvement over time with detailed metrics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <PhoneCallTraining userId={userId} />
      
      {/* Call Training Analytics */}
      <div className="mt-8">
        <CallTrainingAnalytics />
      </div>
    </div>
  );
}
'@
    
    $pageContent | Out-File -FilePath $pageFile -Encoding utf8
    Write-Host "   ✓ Sales training page created" -ForegroundColor Green
}

Write-Host ""

# Check git status
Write-Host "3. Checking Git Status..." -ForegroundColor Yellow
$gitStatus = git status --short 2>&1
if ($gitStatus) {
    Write-Host "   ⚠ Uncommitted changes found" -ForegroundColor Yellow
    Write-Host "   Files:" -ForegroundColor White
    $gitStatus | ForEach-Object { Write-Host "     $_" -ForegroundColor Gray }
} else {
    Write-Host "   ✓ No uncommitted changes" -ForegroundColor Green
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Next Steps" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Clear Next.js cache:" -ForegroundColor White
Write-Host "   Remove-Item -Recurse -Force .next" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Restart dev server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Deploy to production:" -ForegroundColor White
Write-Host "   .\DEPLOY_NOW.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Verify on live site:" -ForegroundColor White
Write-Host "   https://howtosellcursor.me/sales-training" -ForegroundColor Cyan
Write-Host ""
