# 🤖 Working with Main Branch - Agent Iteration Guide

## ✅ Always Start Fresh (Before Each Agent Session)

**Every time you start working with a new agent, do this first:**

```powershell
# 1. Pull latest changes from main
git pull origin main

# 2. Check status
git status

# 3. Install dependencies if needed
npm ci
```

---

## 🔄 Standard Agent Workflow

### Step 1: Pull Latest (Always First!)
```powershell
git pull origin main
```

### Step 2: Make Your Changes
Work with the agent on features, fixes, improvements...

### Step 3: Commit Your Changes
```powershell
git add .
git commit -m "feat: description of what you did"
```

### Step 4: Push to Main
```powershell
git push origin main
```

---

## 🎯 Best Practices for Agent Iterations

### ✅ DO:
- **Always pull before starting** - `git pull origin main`
- **Commit frequently** - Small, focused commits
- **Push regularly** - Don't let changes pile up
- **Use descriptive commit messages** - Helps track what each agent did
- **Test before pushing** - Run `npm test` if available

### ❌ DON'T:
- Don't start work without pulling first
- Don't commit huge changes all at once
- Don't force push (`git push --force`)
- Don't skip pulling when switching agents

---

## 🔀 If You Have Conflicts

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
git commit -m "chore: resolve merge conflicts"
git push origin main
```

---

## 📋 Quick Reference Commands

### Start New Agent Session
```powershell
git pull origin main
git status
npm ci  # If dependencies changed
```

### During Agent Session
```powershell
# Check what changed
git status

# See differences
git diff

# Stage changes
git add .

# Commit
git commit -m "feat: what you did"

# Push
git push origin main
```

### End Agent Session
```powershell
# Make sure everything is pushed
git status
git push origin main
```

---

## 🚀 Automated Scripts

### Quick Pull Script
Create `PULL_LATEST.bat`:
```batch
@echo off
git pull origin main
npm ci
echo Ready to work!
pause
```

### Quick Push Script
Use existing `PUSH_TO_MAIN.bat` or:
```powershell
git add .
git commit -m "chore: sync changes"
git push origin main
```

---

## 💡 Pro Tips

1. **Start each session with pull** - Always!
2. **Commit after each feature** - Don't wait until the end
3. **Push when done** - Don't leave changes uncommitted
4. **Use clear commit messages** - Helps track agent work
5. **Check status before pushing** - `git status` first

---

## 🔍 Verify You're Ready

```powershell
# Check you're on main
git branch
# Should show: * main

# Check you're up to date
git status
# Should show: "Your branch is up to date with 'origin/main'"

# Check remote
git remote -v
# Should show: origin → https://github.com/kandy-209/cursor-gtm-training.git
```

---

## 📝 Example Agent Session

```powershell
# 1. START: Pull latest
git pull origin main

# 2. WORK: Make changes with agent
# ... (work on features)

# 3. COMMIT: Save your work
git add .
git commit -m "feat: add new feature X"

# 4. PUSH: Share with main
git push origin main

# 5. VERIFY: Check status
git status
# Should show: "Your branch is up to date"
```

---

## 🎯 Remember

**Golden Rule:** Always pull before you push!

Every agent session should follow this pattern:
1. Pull → 2. Work → 3. Commit → 4. Push

This keeps main branch clean and avoids conflicts! 🚀

