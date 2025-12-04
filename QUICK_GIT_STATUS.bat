@echo off
echo Quick Git Status Check
echo ======================
timeout /t 1 /nobreak >nul
git status --short
echo.
echo Done.

