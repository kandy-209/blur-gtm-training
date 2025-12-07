@echo off
REM THE FIX - Removes workflow file from ALL commits

echo Removing workflow file from git history...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .github/workflows/daily-dependency-check.yml" --prune-empty HEAD

echo Force pushing...
git push origin main --force-with-lease

pause

