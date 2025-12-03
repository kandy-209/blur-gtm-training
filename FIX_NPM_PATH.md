# Fix npm PATH Issue on Windows

## Problem
`npm` is not recognized because Node.js is not in your system PATH.

## Quick Fix Options

### Option 1: Use Node.js Command Prompt (Easiest)
1. Search for "Node.js command prompt" in Windows Start menu
2. Open it - it will have Node.js in PATH
3. Navigate to your project: `cd "C:\Users\Laxmo\Modal Test\cursor-gtm-training"`
4. Run commands normally: `npm run sync`

### Option 2: Add Node.js to PATH Permanently
1. Find where Node.js is installed (common locations):
   - `C:\Program Files\nodejs\`
   - `C:\Program Files (x86)\nodejs\`
   - `C:\Users\Laxmo\AppData\Roaming\npm\`

2. Add to PATH:
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → "Environment Variables"
   - Under "System variables", find "Path" → Edit
   - Add Node.js installation path (e.g., `C:\Program Files\nodejs\`)
   - Click OK on all dialogs
   - **Restart PowerShell/terminal**

### Option 3: Reinstall Node.js with PATH Option
1. Download Node.js LTS from https://nodejs.org/
2. During installation, check "Add to PATH" option
3. Restart your terminal

### Option 4: Use Git Bash (if installed)
Git Bash often has Node.js in PATH:
```bash
cd "/c/Users/Laxmo/Modal Test/cursor-gtm-training"
npm run sync
```

## Verify Fix
After fixing, test with:
```powershell
node --version
npm --version
```

## Workaround: Use Git Commands Directly
Since git sync is already complete, you can use git commands directly:
```powershell
# Sync script equivalent:
git fetch origin
git pull origin main --rebase
git push origin main
```

