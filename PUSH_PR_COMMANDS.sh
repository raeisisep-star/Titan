#!/bin/bash
# =============================================================================
# Commands to Push Branch and Create PR
# =============================================================================
# Since git credentials require manual setup, run these commands manually
# after configuring GitHub access token
# =============================================================================

echo "🚀 Phase 4 SSL - Push and Create PR"
echo ""

# Current status
echo "✅ Branch created: feature/phase4-ssl-full-strict"
echo "✅ Changes committed"
echo "✅ Ready to push"
echo ""

# Commands to run manually:
echo "📋 Commands to run:"
echo ""
echo "1. Push branch to GitHub:"
echo "   cd /home/ubuntu/Titan"
echo "   git push -u origin feature/phase4-ssl-full-strict"
echo ""

echo "2. Create Pull Request on GitHub:"
echo "   - Go to: https://github.com/raeisisep-star/Titan/pulls"
echo "   - Click 'New Pull Request'"
echo "   - Select: feature/phase4-ssl-full-strict → main"
echo "   - Copy content from: /home/ubuntu/Titan/PR_TEMPLATE.md"
echo "   - Add screenshots:"
echo "     a) Cloudflare SSL/TLS settings"
echo "     b) Security headers test output"
echo ""

echo "3. Alternative: Use GitHub CLI (if installed):"
echo "   cd /home/ubuntu/Titan"
echo "   gh pr create --base main --head feature/phase4-ssl-full-strict --title \"Phase 4 - SSL Full (strict) Implementation\" --body-file PR_TEMPLATE.md"
echo ""

echo "📊 Test Results to Include in PR:"
echo ""
echo "Local test (copy this output):"
curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir 2>/dev/null | grep -iE "(x-titan|strict-transport|x-frame|x-content|x-xss|referrer)"

echo ""
echo "External test (copy this output):"
curl -I https://www.zala.ir 2>/dev/null | grep -iE "(strict-transport|x-frame|x-content|x-xss|referrer)"

echo ""
echo "🎯 PR is ready to be created!"
