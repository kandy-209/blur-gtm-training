@echo off
REM Quick Commit and Push - No Hanging!
REM This batch file commits and pushes changes without hanging

echo ========================================
echo   Quick Commit and Push
echo ========================================
echo.

echo Step 1: Staging files...
git add .github/workflows/daily-dependency-check.yml
git add src/components/LiquidGlossCanvas.tsx
git add FIXES_VERIFIED.md
if errorlevel 1 (
    echo Warning: Some files may not exist
)

echo.
echo Step 2: Committing changes...
git commit -m "Fix: GitHub Actions workflow and LiquidGlossCanvas bugs"
if errorlevel 1 (
    echo Warning: Commit may have failed or nothing to commit
)

echo.
echo Step 3: Pushing to GitHub...
git push origin main
if errorlevel 1 (
    echo.
    echo ERROR: Push failed!
    echo.
    echo Try manually:
    echo   git push origin main
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! Changes pushed!
echo ========================================
echo.
pause

