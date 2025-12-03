@echo off
echo ========================================
echo   Push to Main Repository
echo ========================================
echo.

echo [1/4] Checking git status...
git status
echo.

echo [2/4] Adding all changes...
git add .
echo.

echo [3/4] Committing changes...
git commit -m "chore: sync changes to main"
echo.

echo [4/4] Pushing to main...
git push origin main
echo.

echo ========================================
echo   Done!
echo ========================================
pause


