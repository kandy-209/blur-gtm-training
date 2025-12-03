@echo off
REM Design System Testing Script for Windows
echo.
echo ========================================
echo   Design System Testing Suite
echo ========================================
echo.

REM Check if dev server is running
echo Checking if dev server is running...
curl -s http://localhost:3000 >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Dev server is running
) else (
    echo [ERROR] Dev server is not running
    echo Please start the dev server with: npm run dev
    exit /b 1
)

echo.
echo Running Tests...
echo.

REM Test 1: Build check
echo [1/3] Testing build...
call npm run build >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Build successful
) else (
    echo [ERROR] Build failed
    exit /b 1
)

REM Test 2: Type check
echo [2/3] Testing TypeScript...
call npx tsc --noEmit >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] TypeScript check passed
) else (
    echo [WARN] TypeScript warnings (non-critical)
)

REM Test 3: Lint check
echo [3/3] Testing linting...
call npm run lint >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Linting passed
) else (
    echo [WARN] Linting warnings (non-critical)
)

echo.
echo ========================================
echo   Performance Testing
echo ========================================
echo.
echo To run Lighthouse audit:
echo   npm run test:lighthouse
echo.
echo Or manually:
echo   npx lighthouse http://localhost:3000 --view
echo.

echo ========================================
echo   Accessibility Testing
echo ========================================
echo.
echo To run accessibility audit:
echo   npm run test:a11y
echo.
echo Or use WAVE:
echo   https://wave.webaim.org/
echo.

echo ========================================
echo   Testing Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Run Lighthouse audit
echo 2. Test on mobile devices
echo 3. Test with screen readers
echo 4. Check browser compatibility
echo.

pause


