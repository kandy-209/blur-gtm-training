@echo off
echo ========================================
echo   Pull Latest from Main
echo ========================================
echo.

echo [1/2] Pulling latest changes from main...
git pull origin main
echo.

echo [2/2] Installing dependencies (if needed)...
call npm ci
echo.

echo ========================================
echo   Ready to work!
echo ========================================
echo.
echo Current status:
git status
echo.
pause

