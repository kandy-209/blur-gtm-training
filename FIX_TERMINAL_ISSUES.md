# 🔧 Fix Terminal Issues

## Common Terminal Problems & Solutions

### Problem 1: Commands Hang/Freeze

**Solution:**
- Use **Command Prompt** (`cmd`) instead of PowerShell
- Or use **Git Bash**
- Or use **VS Code integrated terminal**

### Problem 2: PowerShell Execution Policy Errors

**Solution:**
Run this once (as Administrator):
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or just use `cmd` instead:
```cmd
git add .
git commit -m "Your message"
git push origin main
```

### Problem 3: Git Commands Hang on `git add`

**Solution:**
1. Check if git is working:
   ```bash
   git --version
   ```

2. Try staging specific files:
   ```bash
   git add src/app/api/company/enrich/route.ts
   git add package.json
   ```

3. Check for large files:
   ```bash
   git status
   ```

### Problem 4: Terminal Not Responding

**Solution:**
1. **Close terminal** and open new one
2. **Restart VS Code/Cursor**
3. **Use different terminal** (cmd, Git Bash, PowerShell)

---

## ✅ Recommended: Use Command Prompt

**Easiest solution:**

1. Press `Windows Key + R`
2. Type: `cmd`
3. Press Enter
4. Navigate (use `/d` flag for drive change):
   ```cmd
   cd /d "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
   ```
   
   **Or navigate step by step:**
   ```cmd
   C:
   cd \Users\Laxmo
   cd "Modal Test"
   cd cursor-gtm-training
   ```
5. Run git commands:
   ```cmd
   git add .
   git commit -m "Fix: Add null checks for dataSources"
   git push origin main
   ```

---

## 🎯 Quick Test

**Test if git works:**
```bash
git --version
```

**If that works, try:**
```bash
git status
```

**If that works, you're good to go!**

---

**The issue is likely PowerShell execution policy or terminal hanging. Use `cmd` instead!**

