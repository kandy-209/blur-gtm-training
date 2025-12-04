@echo off
REM Simple deployment - no hanging
echo Deploying via GitHub + Vercel Dashboard...
echo.
echo Step 1: Push to GitHub
git add .
git commit -m "Deploy to production" 2>nul
git push origin main
echo.
echo Step 2: Go to https://vercel.com
echo Step 3: Import repository: kandy-209/cursor-gtm-training
echo Step 4: Add environment variables
echo Step 5: Click Deploy
echo.
echo Done! No hanging commands.
pause


