@echo off
REM Quick deployment script for Windows

echo ========================================
echo   Deploying to Vercel
echo ========================================
echo.

REM Check if Vercel CLI is installed
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing Vercel CLI...
    call npm install -g vercel
    if %errorlevel% neq 0 (
        echo Failed to install Vercel CLI
        pause
        exit /b 1
    )
)

echo.
echo Building application...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo Build successful!
echo.
echo Deploying to Vercel...
echo.

call vercel --prod

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Add environment variables in Vercel dashboard
echo 2. Redeploy if needed
echo.
pause


