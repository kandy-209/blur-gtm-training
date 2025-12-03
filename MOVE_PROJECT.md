# 📁 Reorganize to Mac-like Structure

## Current Structure (Windows)
```
C:\Users\Laxmo\Modal Test\cursor-gtm-training
```

## Target Structure (Mac-like)
```
C:\Users\Laxmo\Projects\cursor-gtm-training
```

**This matches Mac structure:** `~/Projects/cursor-gtm-training`

---

## 🚀 Quick Move (Recommended)

### Step 1: Close Everything
- ✅ Close Cursor IDE completely
- ✅ Close all terminals
- ✅ Stop any running processes (`npm run dev`, etc.)

### Step 2: Create Projects Folder (if needed)
```powershell
New-Item -ItemType Directory -Path "C:\Users\Laxmo\Projects" -Force
```

### Step 3: Move the Project
**In PowerShell (run as Administrator):**

```powershell
# Stop Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Create Projects folder (if it doesn't exist)
New-Item -ItemType Directory -Path "C:\Users\Laxmo\Projects" -Force | Out-Null

# Move the project
Move-Item "C:\Users\Laxmo\Modal Test\cursor-gtm-training" "C:\Users\Laxmo\Projects\cursor-gtm-training" -Force

# Verify
cd C:\Users\Laxmo\Projects\cursor-gtm-training
ls package.json
```

### Step 4: Reopen in Cursor
1. Open Cursor IDE
2. **File → Open Folder**
3. Navigate to: `C:\Users\Laxmo\Projects\cursor-gtm-training`

---

## 🎯 Mac-like Structure Comparison

### Mac Structure
```
~/Projects/
├── cursor-gtm-training/
├── other-project/
└── ...
```

### Windows Structure (After Move)
```
C:\Users\Laxmo\Projects\
├── cursor-gtm-training\
├── other-project\
└── ...
```

**Perfect match!** ✅

---

## 📋 Alternative Structures (Mac-like)

### Option 1: Projects Folder (Recommended)
```
C:\Users\Laxmo\Projects\cursor-gtm-training
```
**Matches:** `~/Projects/cursor-gtm-training`

### Option 2: Development Folder
```
C:\Users\Laxmo\Development\cursor-gtm-training
```
**Matches:** `~/Development/cursor-gtm-training`

### Option 3: Direct Under Home
```
C:\Users\Laxmo\cursor-gtm-training
```
**Matches:** `~/cursor-gtm-training`

---

## 🔧 Automated Script

Run this PowerShell script (as Administrator):

```powershell
# Create Projects folder (Mac-like)
$projectsPath = "C:\Users\Laxmo\Projects"
if (-not (Test-Path $projectsPath)) {
    New-Item -ItemType Directory -Path $projectsPath -Force | Out-Null
    Write-Host "✅ Created Projects folder" -ForegroundColor Green
}

# Stop Node processes
Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force

# Move project
$source = "C:\Users\Laxmo\Modal Test\cursor-gtm-training"
$destination = "$projectsPath\cursor-gtm-training"

if (Test-Path $source) {
    Move-Item -Path $source -Destination $destination -Force
    Write-Host "✅ Moved to: $destination" -ForegroundColor Green
    Write-Host ""
    Write-Host "📍 New location: $destination" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Next steps:" -ForegroundColor Yellow
    Write-Host "   1. Open Cursor IDE" -ForegroundColor White
    Write-Host "   2. File → Open Folder" -ForegroundColor White
    Write-Host "   3. Navigate to: $destination" -ForegroundColor White
} else {
    Write-Host "❌ Source not found: $source" -ForegroundColor Red
}
```

---

## ✅ After Moving

1. **Open Cursor IDE**
2. **File → Open Folder**
3. Select: `C:\Users\Laxmo\Projects\cursor-gtm-training`
4. **Verify:**
   ```powershell
   cd C:\Users\Laxmo\Projects\cursor-gtm-training
   npm --version  # Once Node.js is configured
   ```

---

## 🎯 Benefits of Mac-like Structure

1. ✅ **Clean organization** - All projects in one place
2. ✅ **Easy to find** - Standard location
3. ✅ **Cross-platform** - Same structure on Mac/Windows
4. ✅ **Professional** - Industry standard
5. ✅ **Scalable** - Easy to add more projects

---

## 📊 Final Structure

```
C:\Users\Laxmo\
├── Projects\                    ← Mac-like Projects folder
│   └── cursor-gtm-training\    ← Your project here
│       ├── src\
│       ├── public\
│       ├── package.json
│       └── ...
├── Modal Test\                  ← Keep for other test projects
│   └── ...
└── ...
```

**This matches Mac:** `~/Projects/cursor-gtm-training` ✅

---

**Ready?** Close Cursor, then run the move command! 🚀
