# 📁 Folder Reorganization Guide

## Current Structure
```
C:\Users\Laxmo\
└── Modal Test\
    └── cursor-gtm-training\    ← Project is here
```

## Option A: Move Project Out (Recommended)
```
C:\Users\Laxmo\
├── cursor-gtm-training\        ← Project moved here
└── Modal Test\                 ← Keep for other projects
    └── ...
```

## Option B: Rename Parent Folder
```
C:\Users\Laxmo\
└── Projects\                   ← Rename "Modal Test" to "Projects"
    └── cursor-gtm-training\
```

---

## 🚀 Quick Move Instructions

### Method 1: Use PowerShell Script (Easiest)

1. **Close Cursor IDE** completely
2. **Close all terminals**
3. Open PowerShell as Administrator
4. Navigate to project:
   ```powershell
   cd "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
   ```
5. Run the move script:
   ```powershell
   powershell -ExecutionPolicy Bypass -File scripts/move-project.ps1
   ```

### Method 2: Manual Move

1. **Close Cursor IDE** completely
2. Open File Explorer
3. Navigate to: `C:\Users\Laxmo\Modal Test\`
4. Right-click `cursor-gtm-training` → **Cut**
5. Navigate to: `C:\Users\Laxmo\`
6. Right-click → **Paste**
7. Reopen Cursor and open the new location

### Method 3: Command Line

**In PowerShell (run as Administrator):**
```powershell
# Stop Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Move folder
Move-Item "C:\Users\Laxmo\Modal Test\cursor-gtm-training" "C:\Users\Laxmo\cursor-gtm-training"

# Verify
cd C:\Users\Laxmo\cursor-gtm-training
ls package.json
```

---

## ✅ After Moving

1. **Open Cursor IDE**
2. **File → Open Folder**
3. Select: `C:\Users\Laxmo\cursor-gtm-training`
4. **Verify project works:**
   - Check if files load
   - Run `npm install` if needed
   - Test build: `npm run build`

---

## 🔧 What Changes

### ✅ Automatically Updated
- Git repository paths
- Relative imports in code
- Package.json paths

### ⚠️ May Need Updates
- Cursor workspace settings (will auto-update when you reopen)
- Terminal bookmarks (if any)
- Other IDE settings

### 🔄 Will Regenerate
- `.next` folder (build cache)
- `node_modules` (if you reinstall)

---

## 💡 Recommended Structure

```
C:\Users\Laxmo\
├── cursor-gtm-training\          ← Main project (standalone)
│   ├── src\
│   ├── public\
│   ├── scripts\
│   ├── package.json
│   └── ...
├── Modal Test\                    ← Keep for other test projects
│   └── ...
└── Other Projects\                ← Future projects
    └── ...
```

---

## 🎯 Benefits of Moving Out

1. ✅ Cleaner structure
2. ✅ Easier to find
3. ✅ Standalone project
4. ✅ Better for version control
5. ✅ Easier to share/deploy

---

**Ready?** Close Cursor, then run the move! 🚀


