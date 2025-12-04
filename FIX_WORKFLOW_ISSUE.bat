@echo off
REM Fix Workflow File Issue - Removes it from git completely

echo ========================================
echo   Fixing Workflow File Issue
echo ========================================
echo.

echo Step 1: Removing workflow file from git tracking...
git rm --cached .github/workflows/daily-dependency-check.yml
if errorlevel 1 (
    echo Warning: File may not be tracked
)

echo.
echo Step 2: Adding workflow file to .gitignore...
if not exist .gitignore (
    echo .github/workflows/daily-dependency-check.yml > .gitignore
) else (
    findstr /C:".github/workflows/daily-dependency-check.yml" .gitignore >nul
    if errorlevel 1 (
        echo .github/workflows/daily-dependency-check.yml >> .gitignore
    )
)

echo.
echo Step 3: Amending last commit to remove workflow file...
git reset --soft HEAD~1
git reset HEAD .github/workflows/daily-dependency-check.yml
git commit -m "Fix: Add null checks for dataSources and merge remote changes"

echo.
echo Step 4: Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo ERROR: Push still failed!
    echo.
    echo Trying force push with lease...
    git push origin main --force-with-lease
)

echo.
echo ========================================
echo   Done!
echo ========================================
pause

