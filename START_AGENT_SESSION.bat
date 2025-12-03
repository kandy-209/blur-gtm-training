@echo off
echo ========================================
echo   Start New Agent Session
echo ========================================
echo.

echo [1/3] Pulling latest from main...
git pull origin main
if errorlevel 1 (
    echo ERROR: Failed to pull. Check your connection.
    pause
    exit /b 1
)
echo.

echo [2/3] Checking status...
git status
echo.

echo [3/3] Installing dependencies...
call npm ci
echo.

echo ========================================
echo   ✅ Ready to work with agent!
echo ========================================
echo.
echo You're on branch: 
git branch --show-current
echo.
echo Latest commit:
git log --oneline -1
echo.
pause

