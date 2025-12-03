@echo off
title Cursor GTM Training - Starting Server
color 0A
echo.
echo ========================================
echo   Cursor GTM Training Platform
echo   Premium Design System Server
echo ========================================
echo.

cd /d "%~dp0"

REM Try to find Node.js in common locations
set NODE_PATH=
if exist "%ProgramFiles%\nodejs\node.exe" set NODE_PATH=%ProgramFiles%\nodejs
if exist "%ProgramFiles(x86)%\nodejs\node.exe" set NODE_PATH=%ProgramFiles(x86)%\nodejs
if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" set NODE_PATH=%LOCALAPPDATA%\Programs\nodejs

if "%NODE_PATH%"=="" (
    echo [ERROR] Node.js not found!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Or add Node.js to your system PATH
    echo.
    pause
    exit /b 1
)

echo [OK] Found Node.js at: %NODE_PATH%
echo.

REM Add Node.js to PATH for this session
set "PATH=%NODE_PATH%;%PATH%"

echo Checking npm...
call npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm not found
    pause
    exit /b 1
)

echo [OK] npm version:
call npm --version
echo.

echo ========================================
echo   Installing Dependencies
echo ========================================
echo.
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Starting Development Server
echo ========================================
echo.
echo Server will be available at:
echo   http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo Waiting for server to start...
echo.

call npm run dev

pause

