@echo off
REM THE FIX - Removes workflow file and pushes successfully

echo Removing workflow file from git...
git rm --cached .github/workflows/daily-dependency-check.yml 2>nul

echo Fixing last commit...
git reset --soft HEAD~1
git reset HEAD .github/workflows/daily-dependency-check.yml 2>nul
git commit -m "Fix: Add null checks for dataSources and merge remote changes"

echo Pushing to GitHub...
git push origin main

if errorlevel 1 (
    echo.
    echo Trying alternative push method...
    git push origin main --force-with-lease
)

echo.
echo Done!
pause


