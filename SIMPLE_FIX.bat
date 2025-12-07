@echo off
REM Simple Fix - Delete file and rewrite history

echo Deleting workflow file...
if exist .github\workflows\daily-dependency-check.yml del .github\workflows\daily-dependency-check.yml

echo Removing from git history...
git filter-branch --force --index-filter "git rm --cached --ignore-unmatch .github/workflows/daily-dependency-check.yml" --prune-empty HEAD

echo Force pushing...
git push origin main --force-with-lease

pause

