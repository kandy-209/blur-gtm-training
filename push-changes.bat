@echo off
REM Simple Git Push Script - No Hanging!
REM Just double-click this file to push your changes

echo ========================================
echo   Git Push Script
echo ========================================
echo.

echo Step 1: Removing workflow file from commit...
git reset HEAD .github/workflows/daily-dependency-check.yml
if errorlevel 1 (
    echo Warning: Could not reset workflow file
)

echo.
echo Step 2: Committing changes...
git commit -m "Fix: Add null checks for dataSources in company enrich API"
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
    echo Possible solutions:
    echo 1. Check your GitHub token permissions
    echo 2. Try: git push origin main
    echo 3. Check: git status
    pause
    exit /b 1
)

echo.
echo ========================================
echo   SUCCESS! Changes pushed to GitHub!
echo ========================================
echo.
pause

