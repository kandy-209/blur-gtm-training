# 🔄 Cross-Platform Git Sync Guide (Mac ↔ Windows)

## Current Setup

**Repository:** `https://github.com/kandy-209/cursor-gtm-training.git`
**Main Branch:** `main`

---

## 🚀 Quick Sync Workflow

### On Windows (Current Machine)

```powershell
# 1. Check status
git status

# 2. Complete any pending rebase
git add .
git rebase --continue

# 3. Pull latest changes
git pull origin main

# 4. Push your changes
git push origin main
```

### On Mac

```bash
# 1. Clone repository (first time only)
git clone https://github.com/kandy-209/cursor-gtm-training.git
cd cursor-gtm-training

# 2. Pull latest changes
git pull origin main

# 3. Make changes, commit
git add .
git commit -m "Your commit message"

# 4. Push changes
git push origin main
```

---

## 🔄 Daily Sync Workflow

### Before Starting Work (Both Platforms)

```bash
# Always pull first
git pull origin main
```

### After Making Changes (Both Platforms)

```bash
# 1. Check what changed
git status

# 2. Stage changes
git add .

# 3. Commit
git commit -m "Description of changes"

# 4. Pull (in case others pushed)
git pull origin main --rebase

# 5. Push
git push origin main
```

---

## 🌿 Recommended Branch Strategy

### Option 1: Feature Branches (Recommended)

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Work on feature
git add .
git commit -m "Add feature"

# Push feature branch
git push origin feature/your-feature-name

# Merge to main (on GitHub or locally)
git checkout main
git pull origin main
git merge feature/your-feature-name
git push origin main
```

### Option 2: Direct to Main (Current)

```bash
# Always pull first
git pull origin main --rebase

# Make changes
git add .
git commit -m "Your changes"

# Push
git push origin main
```

---

## 🔧 Best Practices

### 1. Always Pull Before Push
```bash
git pull origin main --rebase
git push origin main
```

### 2. Commit Often, Push Regularly
- Commit small, logical changes
- Push at least once per day
- Use descriptive commit messages

### 3. Handle Conflicts Gracefully
```bash
# If conflicts occur
git pull origin main --rebase
# Resolve conflicts in files
git add .
git rebase --continue
git push origin main
```

### 4. Use Descriptive Commit Messages
```bash
git commit -m "feat: Add testing infrastructure"
git commit -m "fix: Resolve accessibility issues"
git commit -m "docs: Update README"
```

---

## 📋 Sync Checklist

### Before Switching Machines

- [ ] Commit all changes
- [ ] Push to remote
- [ ] Verify push succeeded

### After Switching Machines

- [ ] Pull latest changes
- [ ] Verify you're on correct branch
- [ ] Check for conflicts

---

## 🛠️ Troubleshooting

### "Your branch is behind"
```bash
git pull origin main --rebase
git push origin main
```

### "Non-fast-forward" error
```bash
git pull origin main --rebase
git push origin main
```

### Merge conflicts
```bash
# Resolve conflicts in files
git add .
git rebase --continue
git push origin main
```

---

## 🎯 Recommended Workflow

1. **Start of day:** `git pull origin main`
2. **Make changes:** Work normally
3. **Commit often:** `git add . && git commit -m "message"`
4. **End of day:** `git pull origin main --rebase && git push origin main`

---

**This ensures both Mac and Windows stay in sync!** 🔄


