# ✅ Simple Git Commands - No Hanging!

## 🎯 Quick Fix - Run These Commands Directly

**Copy and paste these commands ONE AT A TIME in your terminal:**

### Step 0: Navigate to Project Folder

**In Command Prompt (cmd), run:**
```cmd
cd /d "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
```

**Or if that doesn't work, try:**
```cmd
cd C:\Users\Laxmo
cd "Modal Test"
cd cursor-gtm-training
```

### Step 1: Check Status
```bash
git status
```

### Step 2: Stage Files (if status shows changes)
```bash
git add .
```

### Step 3: Commit
```bash
git commit -m "Fix: Add null checks for dataSources in company enrich API"
```

### Step 4: Push
```bash
git push origin main
```

---

## 🚨 If Commands Hang

### Option 1: Use Command Prompt (not PowerShell)
1. Press `Windows Key + R`
2. Type: `cmd` and press Enter
3. Navigate: `cd "C:\Users\Laxmo\Modal Test\cursor-gtm-training"`
4. Run git commands above

### Option 2: Use Git Bash
1. Right-click in folder
2. Select "Git Bash Here"
3. Run git commands above

### Option 3: Use VS Code Terminal
1. Open VS Code
2. Press `` Ctrl + ` `` (backtick) to open terminal
3. Run git commands above

---

## 🔧 If Git Add Hangs

Try staging specific files instead:
```bash
git add src/app/api/company/enrich/route.ts
git add package.json
git add scripts/safe-git-push.ps1
git add scripts/quick-git-push.sh
git add GIT_WORKFLOW_FIXED.md
```

---

## ✅ What We Fixed

1. ✅ **Bug Fix**: Added null checks for `dataSources` in company enrich API
2. ✅ **Git Scripts**: Created safe push scripts (but you can use manual commands)
3. ✅ **Documentation**: Added git workflow guide

---

## 📝 Current Changes Ready to Commit

- `src/app/api/company/enrich/route.ts` - Fixed null check bug
- `package.json` - Added git:push scripts
- `scripts/safe-git-push.ps1` - Safe git push script
- `scripts/quick-git-push.sh` - Mac/Linux git push script
- `GIT_WORKFLOW_FIXED.md` - Documentation

---

**Just run the 4 commands above one at a time!**

