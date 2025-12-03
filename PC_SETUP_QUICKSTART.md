# PC Setup Quick Start

## One-Time Setup (Run Once on PC)

```bash
# 1. Navigate to project directory
cd "path/to/Blurred Lines"

# 2. Pull latest changes
git pull

# 3. Run PC setup script
bash scripts/setup-pc.sh

# 4. Configure Git commit template
git config commit.template .gitmessage
```

## Daily Workflow

### Before Starting Work
```bash
git pull
npm ci  # Only if package.json changed
```

### Making Changes
```bash
# Make your changes...

# Stage changes
git add .

# Commit (format: type(scope): description)
git commit -m "feat(api): add new endpoint"
# OR
git commit -m "fix(ui): resolve styling issue"

# Push
git push
```

### Before Switching to Mac
```bash
git add .
git commit -m "feat(scope): description"
git push
```

## Commit Message Format

**Required format:** `type(scope): description`

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Code style
- `refactor` - Refactoring
- `perf` - Performance
- `test` - Tests
- `build` - Build system
- `ci` - CI/CD
- `chore` - Other

**Examples:**
```bash
✅ git commit -m "feat(api): add user authentication"
✅ git commit -m "fix(ui): resolve button styling"
✅ git commit -m "docs: update README"

❌ git commit -m "fixed bug"        # Wrong format
❌ git commit -m "update"           # Wrong format
```

## Git Hooks (Automatic Checks)

The hooks will automatically:
- ✅ Run linting before commit
- ✅ Run type checking before commit
- ✅ Run tests before push
- ✅ Validate commit message format

**If checks fail:** Fix the issues, then commit/push again.

## Troubleshooting

### Hooks Not Working
```bash
bash scripts/setup-git-hooks.sh
```

### Verify Setup
```bash
bash scripts/verify-setup.sh
```

### Conflicts with Mac
```bash
git pull --rebase
# Resolve conflicts, then:
git add .
git rebase --continue
```

## Need Help?

See `MULTI_MACHINE_SETUP.md` for detailed documentation.

