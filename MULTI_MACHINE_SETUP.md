# Multi-Machine Development Setup Guide

This guide ensures consistent development workflow across Mac and PC.

## Initial Setup

### On Mac (First Time)
```bash
# Run setup script
bash scripts/setup-mac.sh

# Configure Git commit template
git config commit.template .gitmessage
```

### On PC (First Time)
```bash
# Clone repository (if not already cloned)
git clone <your-repo-url>
cd <repo-name>

# Run setup script
bash scripts/setup-pc.sh

# Configure Git commit template
git config commit.template .gitmessage
```

## Daily Workflow

### Before Starting Work (Both Machines)
```bash
# 1. Pull latest changes
git pull

# 2. Check status
git status

# 3. Install dependencies if package.json changed
npm ci
```

### While Working
```bash
# Make your changes...

# Stage changes
git add .

# Commit (hooks will run automatically)
git commit -m "feat(scope): your description"

# Push (hooks will run automatically)
git push
```

### Before Switching Machines
```bash
# 1. Commit all changes
git add .
git commit -m "feat(scope): description of changes"

# 2. Push to remote
git push

# 3. Note what you were working on (optional)
```

## Git Hooks

The setup scripts install three git hooks:

### 1. Pre-commit Hook
- Runs ESLint
- Runs TypeScript type checking
- **Blocks commit if checks fail**

### 2. Pre-push Hook
- Runs test suite
- **Blocks push if tests fail**

### 3. Commit-msg Hook
- Enforces Conventional Commits format
- **Blocks commit if format is invalid**

## Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `build`: Build system changes
- `ci`: CI/CD changes
- `chore`: Other changes

### Examples
```bash
# Good
git commit -m "feat(api): add user authentication endpoint"
git commit -m "fix(ui): resolve button styling issue"
git commit -m "docs: update README with setup instructions"
git commit -m "perf(cache): improve caching strategy"

# Bad (will be rejected)
git commit -m "fixed bug"
git commit -m "update"
git commit -m "changes"
```

## Bypassing Hooks (Not Recommended)

If you absolutely need to bypass hooks:

```bash
# Skip pre-commit hook
git commit --no-verify -m "message"

# Skip pre-push hook
git push --no-verify
```

**Warning**: Only use `--no-verify` in emergencies. It bypasses important checks.

## Troubleshooting

### Hooks Not Running
```bash
# Reinstall hooks
bash scripts/setup-git-hooks.sh
```

### Conflicts Between Machines
```bash
# On machine with conflicts
git pull --rebase

# Resolve conflicts, then
git add .
git rebase --continue
```

### Different Node Versions
Ensure both machines use Node.js 20.x or higher:
```bash
# Check version
node -v

# Use nvm to manage versions
nvm install 20
nvm use 20
```

### Environment Variables
- `.env.local` is gitignored (different per machine)
- Document required variables in `.env.example`
- Keep API keys separate per machine if needed

## Best Practices

1. **Always pull before starting work**
   ```bash
   git pull
   ```

2. **Commit frequently with small, logical changes**
   ```bash
   git add .
   git commit -m "feat(component): add new feature"
   ```

3. **Push before switching machines**
   ```bash
   git push
   ```

4. **Use feature branches for major work**
   ```bash
   git checkout -b feature/new-feature
   # Make changes
   git push -u origin feature/new-feature
   ```

5. **Coordinate with yourself**
   - If working on same files, use branches
   - Communicate via commit messages
   - Review your own PRs if using branches

## Quick Reference

### Mac → PC Switch
```bash
# On Mac
git add .
git commit -m "feat(scope): description"
git push

# On PC
git pull
```

### PC → Mac Switch
```bash
# On PC
git add .
git commit -m "feat(scope): description"
git push

# On Mac
git pull
```

## CI/CD Pipeline

The repository includes:
- **Pre-commit**: Linting + Type checking
- **Pre-push**: Tests
- **CI**: Full test suite + build + security scans
- **CD**: Automated deployment on main branch

All checks must pass before code reaches production.

