@echo off
REM Remove workflow file from ALL git history

echo ========================================
echo   Removing Workflow File from History
echo ========================================
echo.

echo Step 1: Deleting workflow file...
if exist .github\workflows\daily-dependency-check.yml (
    del .github\workflows\daily-dependency-check.yml
    echo File deleted
) else (
    echo File already deleted
)

echo.
echo Step 2: Removing from git history using filter-branch...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .github/workflows/daily-dependency-check.yml" --prune-empty --tag-name-filter cat -- --all

if errorlevel 1 (
    echo Filter-branch failed, trying alternative method...
    git filter-branch --force --tree-filter "rm -f .github/workflows/daily-dependency-check.yml" --prune-empty HEAD
)

echo.
echo Step 3: Force pushing to GitHub...
git push origin main --force-with-lease

if errorlevel 1 (
    echo.
    echo Force-with-lease failed, trying regular force push...
    echo WARNING: This will overwrite remote history!
    git push origin main --force
)

echo.
echo ========================================
echo   Done!
echo ========================================
echo.
echo Note: You may need to run this on other machines:
echo   git fetch origin
echo   git reset --hard origin/main
pause


