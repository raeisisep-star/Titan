#!/bin/bash
# Script to push security changes and create PR

set -e

echo "🚀 Pushing Security Enhancements to GitHub..."
echo ""

# Navigate to repo
cd /home/ubuntu/Titan

# Check current branch
BRANCH=$(git branch --show-current)
echo "📍 Current branch: $BRANCH"

# Show commits to be pushed
echo ""
echo "📝 Commits to push:"
git log --oneline origin/main..HEAD | head -10

# Count commits
COMMIT_COUNT=$(git log --oneline origin/main..HEAD | wc -l)
echo ""
echo "Total: $COMMIT_COUNT commits"

# Push to remote
echo ""
echo "⬆️  Pushing to origin/$BRANCH..."
git push origin "$BRANCH"

echo ""
echo "✅ Push completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to: https://github.com/raeisisep-star/Titan/pulls"
echo "2. Click 'New Pull Request'"
echo "3. Base: main ← Compare: $BRANCH"
echo "4. Title: feat(security): Database migration + Fail2ban protection"
echo "5. Use READY_FOR_PR.md as description template"
echo ""
echo "🔗 Direct PR creation link:"
echo "https://github.com/raeisisep-star/Titan/compare/main...$BRANCH?expand=1"
