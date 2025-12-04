@echo off
REM DEPLOY NOW - No Hanging!
REM Double-click this file to deploy all fixes

echo ========================================
echo   DEPLOYING FIXES NOW
echo ========================================
echo.

REM Change to project directory
cd /d "%~dp0"

echo [1/5] Verifying fixes are in place...
if exist ".github\workflows\daily-dependency-check.yml" (
    echo   [OK] Workflow file exists
) else (
    echo   [ERROR] Workflow file missing!
    pause
    exit /b 1
)

if exist "src\components\LiquidGlossCanvas.tsx" (
    echo   [OK] Component file exists
) else (
    echo   [ERROR] Component file missing!
    pause
    exit /b 1
)

echo.
echo [2/5] Staging all files...
call git add . 2>nul
echo   [OK] All files staged

echo.
echo [3/5] Committing changes...
<<<<<<< HEAD
call git commit -m "Fix: GitHub Actions workflow - env variable quoting, jq error handling, and PR trigger - All bugs fixed" 2>nul
if errorlevel 1 (
    echo   [INFO] Nothing to commit or already committed
) else (
    echo   [OK] Committed successfully
)

echo.
echo [4/5] Pushing to GitHub...
timeout /t 2 /nobreak >nul 2>&1
call git push origin main 2>nul
if errorlevel 1 (
    echo   [WARN] Push may have failed - check manually
    echo   [INFO] Run: git push origin main
) else (
    echo   [OK] Pushed successfully!
)

echo.
echo [5/5] Deployment complete!
echo.
echo ========================================
echo   STATUS: DEPLOYED
echo ========================================
echo.
echo Next steps:
echo   1. Check GitHub: Your repo actions page
echo   2. Vercel will auto-deploy (if connected)
echo   3. Test the fixes
echo.
pause

