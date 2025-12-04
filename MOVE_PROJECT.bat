@echo off
echo Moving project out of "Modal Test" folder...
echo.
echo Make sure Cursor IDE is completely closed!
echo.
pause

powershell -ExecutionPolicy Bypass -File scripts/move-to-projects-simple.ps1

echo.
echo Done! Press any key to exit...
pause >nul


