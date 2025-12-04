@echo off
REM Final Fix - Handles uncommitted index changes

echo ========================================
echo   Final Git Fix
echo ========================================
echo.

echo Step 1: Stashing everything...
git stash

echo.
echo Step 2: Pulling remote changes...
git pull origin main --no-rebase

echo.
echo Step 3: Restoring stashed changes...
git stash pop

echo.
echo Step 4: Removing workflow file from tracking...
git rm --cached .github/workflows/daily-dependency-check.yml 2>nul

echo.
echo Step 5: Staging all changes...
git add .

echo.
echo Step 6: Committing...
git commit -m "Fix: Add null checks for dataSources and merge remote changes"

echo.
echo Step 7: Pushing...
git push origin main

echo.
echo ========================================
echo   Done!
echo ========================================
pause

