@echo off
echo ========================================
echo   Starting Cursor GTM Training Server
echo ========================================
echo.

cd /d "%~dp0"

echo Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found in PATH
    echo Please install Node.js or add it to PATH
    pause
    exit /b 1
)

echo Checking npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: npm not found in PATH
    echo Please install Node.js or add it to PATH
    pause
    exit /b 1
)

echo.
echo Installing dependencies (if needed)...
call npm install

echo.
echo ========================================
echo   Starting Dev Server
echo ========================================
echo.
echo Server will start at: http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm run dev

pause


