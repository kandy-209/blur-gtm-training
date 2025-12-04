# ✅ Corrected Navigation Commands

## 🎯 Fixed Syntax for Step 4

### Option 1: Use `/d` flag (Recommended)
```cmd
cd /d "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
```

### Option 2: Navigate Step by Step
```cmd
C:
cd \Users\Laxmo
cd "Modal Test"
cd cursor-gtm-training
```

### Option 3: Change Drive First
```cmd
C:
cd "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
```

---

## ✅ Complete Corrected Steps

1. **Open Command Prompt** (`Windows Key + R` → type `cmd` → Enter)

2. **Navigate to project:**
   ```cmd
   cd /d "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
   ```

3. **Check status:**
   ```cmd
   git status
   ```

4. **Stage files:**
   ```cmd
   git add .
   ```

5. **Commit:**
   ```cmd
   git commit -m "Fix: Add null checks for dataSources in company enrich API"
   ```

6. **Push:**
   ```cmd
   git push origin main
   ```

---

## 🔑 Key Fix

**Use `/d` flag** to change drive and directory in one command:
```cmd
cd /d "path with spaces"
```

This is the correct syntax for Command Prompt when navigating to paths with spaces!

