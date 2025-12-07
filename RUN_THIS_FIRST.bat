@echo off
echo ========================================
echo GIT FIX - RUN THIS FIRST
echo ========================================
echo.
echo This script will:
echo 1. Remove lock files
echo 2. Remove problematic workflow file
echo 3. Stage and commit changes
echo 4. Push to GitHub
echo.
echo Press Ctrl+C to cancel, or
pause

REM Remove locks
echo Removing lock files...
del /f /q .git\index.lock >nul 2>&1
del /f /q .git\*.lock >nul 2>&1

REM Remove workflow
echo Removing workflow file...
if exist .github\workflows\daily-dependency-check.yml (
    git rm --cached .github\workflows\daily-dependency-check.yml >nul 2>&1
    del /f /q .github\workflows\daily-dependency-check.yml >nul 2>&1
)

REM Stage all
echo Staging changes...
git add . >nul 2>&1

REM Commit
echo Committing...
git commit -m "Fix: Remove workflow file and commit changes" 2>&1

REM Pull
echo Pulling latest...
git pull origin main --no-rebase --no-edit 2>&1

REM Push
echo Pushing...
git push origin main 2>&1

echo.
echo Done! Check output above.
pause




