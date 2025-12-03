# 🌿 Git Workflow Best Practices

## Current Repository Structure

```
main (production-ready)
├── feature branches (development)
└── hotfix branches (urgent fixes)
```

---

## 🎯 Recommended Workflow

### Option A: Feature Branch Workflow (Best for Teams)

```bash
# 1. Create feature branch
git checkout -b feature/new-feature

# 2. Work on feature
# ... make changes ...
git add .
git commit -m "feat: Add new feature"

# 3. Push feature branch
git push origin feature/new-feature

# 4. Create Pull Request on GitHub
# 5. Review and merge to main
# 6. Delete feature branch after merge
```

### Option B: Direct Main Workflow (Current - Good for Solo)

```bash
# 1. Always pull first
git pull origin main --rebase

# 2. Make changes
# ... work ...
git add .
git commit -m "feat: Description"

# 3. Pull again (in case others pushed)
git pull origin main --rebase

# 4. Push
git push origin main
```

---

## 📝 Commit Message Convention

Use conventional commits:

```
feat: Add new feature
fix: Fix bug
docs: Update documentation
style: Formatting changes
refactor: Code restructuring
test: Add tests
chore: Maintenance tasks
```

Examples:
```bash
git commit -m "feat: Add testing infrastructure"
git commit -m "fix: Resolve accessibility issues"
git commit -m "docs: Update README with setup instructions"
```

---

## 🔄 Daily Workflow

### Morning Routine
```bash
# Pull latest changes
git pull origin main

# Check status
git status

# See what changed
git log --oneline -10
```

### During Work
```bash
# Commit frequently
git add .
git commit -m "feat: Add component"

# Push regularly
git push origin main
```

### End of Day
```bash
# Final sync
git pull origin main --rebase
git push origin main

# Verify
git status
```

---

## 🌿 Branch Strategy

### Main Branch
- **Purpose:** Production-ready code
- **Protection:** Should always be stable
- **Merges:** Only tested, reviewed code

### Feature Branches
- **Naming:** `feature/feature-name`
- **Purpose:** New features, improvements
- **Lifetime:** Short-lived, delete after merge

### Hotfix Branches
- **Naming:** `hotfix/issue-name`
- **Purpose:** Urgent production fixes
- **Lifetime:** Very short, merge immediately

---

## 🔧 Useful Commands

### Check Status
```bash
git status
git log --oneline -10
git branch -a
```

### Sync with Remote
```bash
git fetch origin
git pull origin main --rebase
git push origin main
```

### Undo Changes
```bash
# Unstage files
git reset HEAD <file>

# Discard changes
git checkout -- <file>

# Undo last commit (keep changes)
git reset --soft HEAD~1
```

---

## 🚨 Conflict Resolution

### When Conflicts Occur
```bash
# 1. Pull with rebase
git pull origin main --rebase

# 2. Git will show conflicts
# 3. Edit files to resolve conflicts
# 4. Stage resolved files
git add .

# 5. Continue rebase
git rebase --continue

# 6. Push
git push origin main
```

---

## ✅ Pre-Push Checklist

- [ ] Code works locally
- [ ] Tests pass (if applicable)
- [ ] No console errors
- [ ] Committed all changes
- [ ] Pulled latest changes
- [ ] Resolved any conflicts
- [ ] Descriptive commit message

---

## 🎯 Best Practices

1. **Pull before push** - Always sync first
2. **Commit often** - Small, logical commits
3. **Push regularly** - Don't let changes pile up
4. **Use branches** - For major features
5. **Write good messages** - Clear commit descriptions
6. **Review before push** - Check `git status` and `git diff`

---

**Follow this workflow for smooth collaboration!** 🌿


