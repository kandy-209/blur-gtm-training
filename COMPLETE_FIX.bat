@echo off
REM Complete Fix - Handles everything

echo ========================================
echo   Complete Git Fix
echo ========================================
echo.

echo Step 1: Stashing uncommitted changes...
git stash

echo.
echo Step 2: Removing workflow file from tracking...
git rm --cached .github/workflows/daily-dependency-check.yml 2>nul

echo.
echo Step 3: Pulling remote changes...
git pull origin main --rebase

if errorlevel 1 (
    echo Merge conflict detected, aborting rebase...
    git rebase --abort
    git pull origin main --no-rebase
)

echo.
echo Step 4: Restoring stashed changes...
git stash pop

echo.
echo Step 5: Staging all changes...
git add .

echo.
echo Step 6: Committing...
git commit -m "Fix: Add null checks for dataSources and merge remote changes"

echo.
echo Step 7: Pushing...
git push origin main

if errorlevel 1 (
    echo.
    echo Push failed, trying force-with-lease...
    git push origin main --force-with-lease
)

echo.
echo ========================================
echo   Done!
echo ========================================
pause




