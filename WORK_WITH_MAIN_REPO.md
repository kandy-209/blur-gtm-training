# 🔄 Work with Main Repo - Complete Guide

## ✅ Current Repository Status

**Repository:** `cursor-gtm-training`  
**Remote:** `https://github.com/kandy-209/cursor-gtm-training.git`  
**Branch:** `main`  
**Status:** ✅ Correct repo

---

## Daily Workflow

### 1. Before Starting Work (Always Do This First!)

```powershell
# Pull latest changes from main
git pull origin main

# Check status
git status

# Install dependencies if package.json changed
npm ci
```

### 2. Make Your Changes

Work on your features, fixes, or improvements...

### 3. Commit Your Changes

```powershell
# Stage all changes
git add .

# Commit with descriptive message
git commit -m "feat(scope): your description"
# OR
git commit -m "fix(scope): your description"
# OR
git commit -m "docs: your description"
```

**Commit Message Format:**
- `feat(scope):` - New feature
- `fix(scope):` - Bug fix
- `docs:` - Documentation
- `chore:` - Maintenance tasks

### 4. Push to Main

```powershell
# Push to main branch
git push origin main
```

---

## Sync Between Windows and Mac

### Windows → Mac

**On Windows (before switching):**
```powershell
git add .
git commit -m "chore: sync Windows changes"
git push origin main
```

**On Mac (after switching):**
```bash
git pull origin main
npm ci  # If dependencies changed
```

### Mac → Windows

**On Mac (before switching):**
```bash
git add .
git commit -m "chore: sync Mac changes"
git push origin main
```

**On Windows (after switching):**
```powershell
git pull origin main
npm ci  # If dependencies changed
```

---

## If You Have Conflicts

### Option 1: Pull with Rebase (Recommended)
```powershell
git pull --rebase origin main
# Resolve conflicts if any
git add .
git rebase --continue
git push origin main
```

### Option 2: Merge
```powershell
git pull origin main
# Resolve conflicts if any
git add .
git commit -m "chore: merge conflicts resolved"
git push origin main
```

---

## Verify You're on Main

```powershell
# Check current branch
git branch

# Should show: * main

# Check remote
git remote -v

# Should show:
# origin  https://github.com/kandy-209/cursor-gtm-training.git (fetch)
# origin  https://github.com/kandy-209/cursor-gtm-training.git (push)
```

---

## Quick Commands Reference

```powershell
# Check status
git status

# See recent commits
git log --oneline -5

# Pull latest
git pull origin main

# Push changes
git push origin main

# See what changed
git diff

# See staged changes
git diff --staged
```

---

## Common Issues & Solutions

### Issue: "Your branch is behind"
```powershell
git pull origin main
```

### Issue: "Your branch is ahead"
```powershell
git push origin main
```

### Issue: "Merge conflicts"
```powershell
# See conflicts
git status

# Resolve conflicts in files, then:
git add .
git commit -m "chore: resolve merge conflicts"
git push origin main
```

### Issue: "Permission denied"
- Check you're authenticated: `git config user.name`
- Make sure you have push access to the repo

---

## Best Practices

1. ✅ **Always pull before starting work**
2. ✅ **Commit frequently** (small, focused commits)
3. ✅ **Push regularly** (don't let changes pile up)
4. ✅ **Use descriptive commit messages**
5. ✅ **Test before pushing** (run `npm test` if available)

---

## Current Status

✅ **Repository:** Correct (`cursor-gtm-training`)  
✅ **Remote:** Correct (`https://github.com/kandy-209/cursor-gtm-training.git`)  
✅ **Branch:** `main`  
✅ **Ready to work!**

---

*Always pull before starting work, commit frequently, and push regularly!*
