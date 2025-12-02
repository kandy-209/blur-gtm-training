#!/bin/bash
# Test Fix Workflow
echo "🔧 Fixing all test failures..."

# Run tests and capture failures
npm test 2>&1 | tee test-output.log

# Count failures
FAILURES=$(npm test 2>&1 | grep -c "FAIL" || echo "0")
PASSING=$(npm test 2>&1 | grep "Tests:" | tail -1 | grep -oE "[0-9]+ passed" | grep -oE "[0-9]+" || echo "0")

echo "📊 Current status: $FAILURES failures, $PASSING passing"

if [ "$FAILURES" -eq "0" ]; then
  echo "✅ All tests passing!"
  exit 0
else
  echo "❌ Still have failures to fix"
  exit 1
fi

