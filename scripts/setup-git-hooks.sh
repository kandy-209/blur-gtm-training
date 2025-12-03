#!/bin/bash

# Setup Git Hooks for Consistent Development Pipeline
# Run this script on both Mac and PC to ensure consistent workflow

set -e

echo "🔧 Setting up Git hooks for consistent development pipeline..."

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Pre-commit hook: Run linting and type checking before commit
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash

echo "🔍 Running pre-commit checks..."

# Run linting
echo "  → Running ESLint..."
npm run lint --silent || {
    echo "❌ Linting failed. Please fix errors before committing."
    exit 1
}

# Run type checking (skip test files - they have different type requirements)
echo "  → Running TypeScript type check..."
npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "__tests__" | grep -v "test.ts" | grep -v "test.tsx" || {
    # Only fail if there are non-test errors
    TSC_OUTPUT=$(npx tsc --noEmit --skipLibCheck 2>&1 | grep -v "__tests__" | grep -v "test.ts" | grep -v "test.tsx" || true)
    if [ -n "$TSC_OUTPUT" ]; then
        echo "❌ Type checking failed. Please fix type errors before committing."
        echo "$TSC_OUTPUT"
        exit 1
    fi
}

echo "✅ Pre-commit checks passed!"
exit 0
EOF

# Pre-push hook: Run tests before pushing
cat > .git/hooks/pre-push << 'EOF'
#!/bin/bash

echo "🧪 Running pre-push checks..."

# Run tests
echo "  → Running tests..."
npm test -- --passWithNoTests --silent || {
    echo "❌ Tests failed. Please fix failing tests before pushing."
    exit 1
}

echo "✅ Pre-push checks passed!"
exit 0
EOF

# Commit-msg hook: Enforce commit message format
cat > .git/hooks/commit-msg << 'EOF'
#!/bin/bash

commit_msg=$(cat "$1")

# Check if commit message follows conventional commits format
# Format: type(scope): description
# Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build
if ! echo "$commit_msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?: .+"; then
    echo "❌ Invalid commit message format!"
    echo ""
    echo "Commit messages must follow Conventional Commits format:"
    echo "  type(scope): description"
    echo ""
    echo "Types: feat, fix, docs, style, refactor, test, chore, perf, ci, build"
    echo ""
    echo "Examples:"
    echo "  feat(api): add user authentication"
    echo "  fix(ui): resolve button styling issue"
    echo "  docs: update README with setup instructions"
    echo ""
    exit 1
fi

exit 0
EOF

# Make hooks executable
chmod +x .git/hooks/pre-commit
chmod +x .git/hooks/pre-push
chmod +x .git/hooks/commit-msg

echo "✅ Git hooks installed successfully!"
echo ""
echo "Hooks installed:"
echo "  • pre-commit: Runs linting and type checking"
echo "  • pre-push: Runs tests before pushing"
echo "  • commit-msg: Enforces Conventional Commits format"
echo ""
echo "To bypass hooks (not recommended):"
echo "  git commit --no-verify"
echo "  git push --no-verify"

