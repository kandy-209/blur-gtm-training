@echo off
echo ========================================
echo FIXING GIT - NO HANG VERSION
echo ========================================
echo.

REM Remove any lock files
if exist .git\index.lock del /f /q .git\index.lock
if exist .git\*.lock del /f /q .git\*.lock

echo Step 1: Checking git status (with timeout)...
timeout /t 2 /nobreak >nul
git --version
if errorlevel 1 (
    echo ERROR: Git not found!
    pause
    exit /b 1
)

echo.
echo Step 2: Removing problematic workflow file from git...
git rm --cached .github\workflows\daily-dependency-check.yml 2>nul
if exist .github\workflows\daily-dependency-check.yml del /f /q .github\workflows\daily-dependency-check.yml

echo.
echo Step 3: Staging all changes...
git add .

echo.
echo Step 4: Checking what will be committed...
git status --short

echo.
echo Step 5: Committing changes...
git commit -m "Fix: Remove workflow file and commit all changes"

echo.
echo Step 6: Pulling latest changes...
git pull origin main --no-rebase --no-edit

echo.
echo Step 7: Pushing to GitHub...
git push origin main

echo.
echo ========================================
echo DONE! Check output above for errors.
echo ========================================
pause

