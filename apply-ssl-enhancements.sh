#!/bin/bash
# =============================================================================
# TITAN Trading System - Apply SSL Enhancements Script
# =============================================================================
# Purpose: Apply Phase 4 SSL Full (strict) enhancements to Nginx
# Usage: sudo ./apply-ssl-enhancements.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                               ║"
echo "║       TITAN Phase 4 - SSL Full (strict) Enhancement Application              ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ ERROR: This script must be run as root (use sudo)${NC}"
    echo "Usage: sudo ./apply-ssl-enhancements.sh"
    exit 1
fi

echo -e "${BLUE}📋 Step 1: Backup current Nginx configuration${NC}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/etc/nginx/sites-available/zala.backup.$TIMESTAMP"
echo "   Creating backup: $BACKUP_FILE"
cp /etc/nginx/sites-available/zala "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup created successfully${NC}"
echo ""

echo -e "${BLUE}📋 Step 2: Copy enhanced configuration${NC}"
echo "   Source: /home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf"
echo "   Target: /etc/nginx/sites-available/zala"
cp /home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf /etc/nginx/sites-available/zala
echo -e "${GREEN}✅ Configuration copied${NC}"
echo ""

echo -e "${BLUE}📋 Step 3: Test Nginx configuration${NC}"
if nginx -t; then
    echo -e "${GREEN}✅ Nginx configuration test passed${NC}"
else
    echo -e "${RED}❌ ERROR: Nginx configuration test failed${NC}"
    echo -e "${YELLOW}⚠️  Rolling back to previous configuration...${NC}"
    cp "$BACKUP_FILE" /etc/nginx/sites-available/zala
    echo -e "${YELLOW}⚠️  Rollback complete. Please check the configuration and try again.${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}📋 Step 4: Reload Nginx${NC}"
if systemctl reload nginx; then
    echo -e "${GREEN}✅ Nginx reloaded successfully${NC}"
else
    echo -e "${RED}❌ ERROR: Nginx reload failed${NC}"
    echo -e "${YELLOW}⚠️  Rolling back to previous configuration...${NC}"
    cp "$BACKUP_FILE" /etc/nginx/sites-available/zala
    nginx -t && systemctl reload nginx
    echo -e "${YELLOW}⚠️  Rollback complete.${NC}"
    exit 1
fi
echo ""

echo -e "${BLUE}📋 Step 5: Verify Nginx status${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx is running${NC}"
else
    echo -e "${RED}❌ ERROR: Nginx is not running${NC}"
    exit 1
fi
echo ""

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                               ║${NC}"
echo -e "${GREEN}║              ✅ SSL ENHANCEMENTS APPLIED SUCCESSFULLY ✅                      ║${NC}"
echo -e "${GREEN}║                                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Run SSL acceptance tests:"
echo "   cd /home/ubuntu/Titan && ./scripts/test-ssl-acceptance.sh"
echo ""
echo "2. Check specific features:"
echo "   # HSTS Header"
echo "   curl -I https://www.zala.ir | grep -i strict-transport-security"
echo ""
echo "   # Security Headers"
echo "   curl -I https://www.zala.ir | grep -E 'X-Frame-Options|X-Content-Type-Options|X-XSS-Protection'"
echo ""
echo "   # SSL Certificate"
echo "   openssl s_client -connect www.zala.ir:443 -servername www.zala.ir < /dev/null | grep 'Verify return code'"
echo ""
echo "3. If all tests pass, verify Cloudflare SSL mode:"
echo "   - Go to: Cloudflare Dashboard → zala.ir → SSL/TLS → Overview"
echo "   - Ensure mode is set to: Full (strict)"
echo ""
echo "4. Document results in PR #10:"
echo "   https://github.com/raeisisep-star/Titan/pull/10"
echo ""
echo -e "${YELLOW}⚠️  Backup location: $BACKUP_FILE${NC}"
echo -e "${YELLOW}⚠️  To rollback if needed: sudo cp $BACKUP_FILE /etc/nginx/sites-available/zala && sudo nginx -t && sudo systemctl reload nginx${NC}"
echo ""
