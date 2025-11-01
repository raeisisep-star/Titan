#!/usr/bin/env bash
set -euo pipefail

###############################################################################
# Release Tagging Script
# 
# Purpose: Create and push semantic version tags for releases
# Usage: ./scripts/release-tag.sh v1.0.0 "Optional release notes"
###############################################################################

VERSION="$1"
NOTES="${2:-Release $VERSION}"

# Validation
if [[ ! "$VERSION" =~ ^v[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9]+)?$ ]]; then
  echo "❌ Invalid version format: $VERSION"
  echo "Expected format: v1.0.0 or v1.0.0-rc1"
  exit 1
fi

echo "🏷️  Creating release tag: $VERSION"
echo "📝 Notes: $NOTES"
echo ""

# Fetch latest from remote
echo "📥 Fetching latest from origin..."
git fetch origin --tags

# Check if tag already exists
if git rev-parse "$VERSION" >/dev/null 2>&1; then
  echo "❌ Tag $VERSION already exists!"
  echo "Use a different version or delete the existing tag:"
  echo "  git tag -d $VERSION"
  echo "  git push origin :refs/tags/$VERSION"
  exit 1
fi

# Ensure we're on main branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [[ "$CURRENT_BRANCH" != "main" ]]; then
  echo "⚠️  Warning: Not on main branch (currently on: $CURRENT_BRANCH)"
  read -p "Continue anyway? (y/N): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborting."
    exit 1
  fi
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin "$CURRENT_BRANCH"

# Show current commit
echo ""
echo "📍 Current commit:"
git log -1 --oneline

# Confirm
echo ""
read -p "Create tag $VERSION at this commit? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Aborting."
  exit 1
fi

# Create annotated tag
echo "🏷️  Creating tag..."
git tag -a "$VERSION" -m "$NOTES"

# Push tag
echo "⬆️  Pushing tag to origin..."
git push origin "$VERSION"

echo ""
echo "✅ Successfully created and pushed tag: $VERSION"
echo ""
echo "🔗 View on GitHub:"
echo "   https://github.com/raeisisep-star/Titan/releases/tag/$VERSION"
echo ""
echo "📝 Next steps:"
echo "   1. Create GitHub Release from this tag"
echo "   2. Trigger production deployment"
echo "   3. Update CHANGELOG.md"
echo ""
