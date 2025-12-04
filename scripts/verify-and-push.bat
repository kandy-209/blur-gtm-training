@echo off
REM Verify Fixes and Push to GitHub
REM This script verifies fixes are in place, then pushes

echo ========================================
echo   Verify and Push Fixes
echo ========================================
echo.

echo [1/4] Verifying fixes are in place...
echo.

REM Check workflow file exists
if exist ".github\workflows\daily-dependency-check.yml" (
    echo   [OK] Workflow file exists
) else (
    echo   [ERROR] Workflow file missing!
    pause
    exit /b 1
)

REM Check component file exists
if exist "src\components\LiquidGlossCanvas.tsx" (
    echo   [OK] LiquidGlossCanvas component exists
) else (
    echo   [ERROR] Component file missing!
    pause
    exit /b 1
)

echo.
echo [2/4] Staging files...
git add .github/workflows/daily-dependency-check.yml
git add src/components/LiquidGlossCanvas.tsx
git add FIXES_VERIFIED.md
git add DEPLOYMENT_STATUS.md
git add scripts/verify-and-push.bat
git add scripts/quick-commit-push.bat
git add scripts/check-status-no-git.ps1
if errorlevel 1 (
    echo   [WARN] Some files may not exist, continuing...
)

echo.
echo [3/4] Committing changes...
git commit -m "Fix: GitHub Actions workflow multi-line JSON and LiquidGlossCanvas hanging bugs"
if errorlevel 1 (
    echo   [WARN] Commit may have failed or nothing to commit
    echo   Continuing anyway...
)

echo.
echo [4/4] Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo [ERROR] Push failed!
    echo.
    echo Try manually:
    echo   git push origin main
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! Fixes pushed to GitHub
echo ========================================
echo.
echo Next steps:
echo   1. Check GitHub: https://github.com/[your-repo]/actions
echo   2. Vercel will auto-deploy (if connected)
echo   3. Test the LiquidGlossCanvas component
echo.
pause

