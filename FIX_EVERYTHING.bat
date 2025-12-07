@echo off
REM ========================================
REM COMPLETE GIT FIX - NO HANGING
REM ========================================
echo.
echo Starting Git Fix Process...
echo.

REM Change to project directory
cd /d "%~dp0"

REM Step 1: Remove lock files
echo [1/7] Removing lock files...
if exist .git\index.lock del /f /q .git\index.lock >nul 2>&1
if exist .git\*.lock del /f /q .git\*.lock >nul 2>&1
echo    Done.

REM Step 2: Remove workflow file
echo [2/7] Removing problematic workflow file...
if exist .github\workflows\daily-dependency-check.yml (
    git rm --cached .github\workflows\daily-dependency-check.yml >nul 2>&1
    del /f /q .github\workflows\daily-dependency-check.yml >nul 2>&1
    echo    Workflow file removed.
) else (
    echo    Workflow file not found (already removed).
)

REM Step 3: Ensure .gitignore has workflow file
echo [3/7] Updating .gitignore...
findstr /C:".github/workflows/daily-dependency-check.yml" .gitignore >nul 2>&1
if errorlevel 1 (
    echo. >> .gitignore
    echo # GitHub Actions workflow (requires workflow scope) >> .gitignore
    echo .github/workflows/daily-dependency-check.yml >> .gitignore
    echo    Added to .gitignore.
) else (
    echo    Already in .gitignore.
)

REM Step 4: Stage all changes
echo [4/7] Staging all changes...
git add . >nul 2>&1
echo    Done.

REM Step 5: Show status
echo [5/7] Current git status:
git status --short
echo.

REM Step 6: Commit
echo [6/7] Committing changes...
git commit -m "Fix: Remove workflow file and commit all changes" 2>&1
if errorlevel 1 (
    echo    Note: Commit may have failed (nothing to commit or already committed).
) else (
    echo    Committed successfully.
)

REM Step 7: Pull and Push
echo [7/7] Syncing with GitHub...
echo    Pulling latest changes...
git pull origin main --no-rebase --no-edit 2>&1
if errorlevel 1 (
    echo    Warning: Pull had issues. Continuing anyway...
)
echo.
echo    Pushing to GitHub...
git push origin main 2>&1
if errorlevel 1 (
    echo.
    echo    ERROR: Push failed. Check the error above.
    echo    Common issues:
    echo    - Personal Access Token needs 'workflow' scope (if workflow file still exists)
    echo    - Branch diverged (run: git pull origin main --no-rebase first)
    echo    - Network issues
) else (
    echo    Push successful!
)

echo.
echo ========================================
echo PROCESS COMPLETE
echo ========================================
echo.
pause




