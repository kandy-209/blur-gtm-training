# ✅ Quick Fix: Use Batch File Instead

## Problem
npm is not in PowerShell PATH, but Node.js is installed.

## Solution: Use Batch File

### Option 1: Double-Click (Easiest)
1. **Double-click:** `START_SERVER_EASY.bat`
2. It will:
   - Find Node.js automatically
   - Add it to PATH
   - Install dependencies
   - Start the server

### Option 2: Run PowerShell Script
1. **Right-click** `FIX_NPM_POWERSHELL.ps1`
2. **Select:** "Run with PowerShell"
3. It will find npm and start the server

### Option 3: Command Prompt
1. Open **Command Prompt** (not PowerShell)
2. Run:
   ```cmd
   cd "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
   npm run dev
   ```

---

## Why This Happens

PowerShell and Command Prompt use different PATH environments. Node.js might be installed but not added to PowerShell's PATH.

---

## Permanent Fix (Optional)

To add Node.js to PowerShell PATH permanently:

1. Find Node.js installation:
   - Usually: `C:\Program Files\nodejs`
   
2. Add to System PATH:
   - Win+R → `sysdm.cpl` → Advanced → Environment Variables
   - Add Node.js path to System PATH

3. Restart PowerShell

---

## Quick Start Now

**Just double-click:** `START_SERVER_EASY.bat`

It handles everything automatically!

---

*Batch file will work even if PowerShell doesn't have npm in PATH!*


