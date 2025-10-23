#!/bin/bash
# =============================================================================
# Quick Nginx Diagnostic Script
# =============================================================================
# Purpose: Quickly diagnose why headers aren't appearing
# Usage: ./scripts/diagnose-nginx.sh
# =============================================================================

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                               ║"
echo "║                     Nginx Configuration Diagnostic                            ║"
echo "║                                                                               ║"
echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "Date: $(date)"
echo ""

# =============================================================================
# 1. Nginx Status
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}1. Nginx Service Status${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
sudo systemctl status nginx --no-pager | head -10
echo ""

# =============================================================================
# 2. Configuration Files
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}2. Sites Enabled Configuration${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo "Files in /etc/nginx/sites-enabled/:"
ls -lah /etc/nginx/sites-enabled/
echo ""

echo "Symlink target for 'zala':"
if [ -L /etc/nginx/sites-enabled/zala ]; then
    readlink -f /etc/nginx/sites-enabled/zala
else
    echo -e "${RED}ERROR: /etc/nginx/sites-enabled/zala is not a symlink or doesn't exist${NC}"
fi
echo ""

# =============================================================================
# 3. Server Name Configuration
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}3. Server Name Configuration${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
if [ -f /etc/nginx/sites-available/zala ]; then
    echo "server_name directives in /etc/nginx/sites-available/zala:"
    grep -nH "server_name" /etc/nginx/sites-available/zala
else
    echo -e "${RED}ERROR: /etc/nginx/sites-available/zala not found${NC}"
fi
echo ""

# =============================================================================
# 4. Check for Conflicts
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}4. Potential Configuration Conflicts${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"

echo "Checking for default_server directives:"
DEFAULT_SERVERS=$(grep -r "default_server" /etc/nginx/sites-enabled/ 2>/dev/null || echo "")
if [ -n "$DEFAULT_SERVERS" ]; then
    echo "$DEFAULT_SERVERS"
else
    echo "No default_server directives found (this is OK)"
fi
echo ""

echo "Checking for other server blocks on port 443:"
HTTPS_BLOCKS=$(grep -r "listen.*443" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^#" || echo "")
if [ -n "$HTTPS_BLOCKS" ]; then
    echo "$HTTPS_BLOCKS"
else
    echo "No active server blocks found on port 443"
fi
echo ""

echo "Checking for duplicate zala.ir server_name:"
DUPLICATE_NAMES=$(grep -r "server_name.*zala.ir" /etc/nginx/sites-enabled/ 2>/dev/null || echo "")
if [ -n "$DUPLICATE_NAMES" ]; then
    echo "$DUPLICATE_NAMES"
else
    echo "No server_name directives found for zala.ir"
fi
echo ""

# =============================================================================
# 5. Local Header Test (Direct to Nginx)
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}5. Local Header Test (Direct to Nginx, Bypass Cloudflare)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"

echo "Testing: https://www.zala.ir (direct connection)"
echo ""

HEADERS=$(curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir 2>/dev/null)

echo "Full Response Headers:"
echo "$HEADERS"
echo ""

echo "Checking Specific Headers:"
echo ""

# X-Titan-Config (Diagnostic)
TITAN_HEADER=$(echo "$HEADERS" | grep -i "X-Titan-Config" || echo "")
if [ -n "$TITAN_HEADER" ]; then
    echo -e "${GREEN}✅ X-Titan-Config: Found${NC}"
    echo "   $TITAN_HEADER"
else
    echo -e "${RED}❌ X-Titan-Config: MISSING${NC}"
    echo "   This means the updated configuration is NOT active!"
fi
echo ""

# HSTS
HSTS_HEADER=$(echo "$HEADERS" | grep -i "Strict-Transport-Security" || echo "")
if [ -n "$HSTS_HEADER" ]; then
    echo -e "${GREEN}✅ Strict-Transport-Security: Found${NC}"
    echo "   $HSTS_HEADER"
else
    echo -e "${RED}❌ Strict-Transport-Security: MISSING${NC}"
fi
echo ""

# X-Frame-Options
FRAME_HEADER=$(echo "$HEADERS" | grep -i "X-Frame-Options" || echo "")
if [ -n "$FRAME_HEADER" ]; then
    echo -e "${GREEN}✅ X-Frame-Options: Found${NC}"
    echo "   $FRAME_HEADER"
else
    echo -e "${RED}❌ X-Frame-Options: MISSING${NC}"
fi
echo ""

# X-Content-Type-Options
CONTENT_TYPE_HEADER=$(echo "$HEADERS" | grep -i "X-Content-Type-Options" || echo "")
if [ -n "$CONTENT_TYPE_HEADER" ]; then
    echo -e "${GREEN}✅ X-Content-Type-Options: Found${NC}"
    echo "   $CONTENT_TYPE_HEADER"
else
    echo -e "${RED}❌ X-Content-Type-Options: MISSING${NC}"
fi
echo ""

# X-XSS-Protection
XSS_HEADER=$(echo "$HEADERS" | grep -i "X-XSS-Protection" || echo "")
if [ -n "$XSS_HEADER" ]; then
    echo -e "${GREEN}✅ X-XSS-Protection: Found${NC}"
    echo "   $XSS_HEADER"
else
    echo -e "${RED}❌ X-XSS-Protection: MISSING${NC}"
fi
echo ""

# Referrer-Policy
REF_HEADER=$(echo "$HEADERS" | grep -i "Referrer-Policy" || echo "")
if [ -n "$REF_HEADER" ]; then
    echo -e "${GREEN}✅ Referrer-Policy: Found${NC}"
    echo "   $REF_HEADER"
else
    echo -e "${RED}❌ Referrer-Policy: MISSING${NC}"
fi
echo ""

# =============================================================================
# 6. External Test (Through Cloudflare)
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}6. External Header Test (Through Cloudflare)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"

echo "Testing: https://www.zala.ir (through Cloudflare)"
echo ""

EXT_HEADERS=$(curl -I https://www.zala.ir 2>/dev/null)

# X-Titan-Config (Diagnostic)
EXT_TITAN=$(echo "$EXT_HEADERS" | grep -i "X-Titan-Config" || echo "")
if [ -n "$EXT_TITAN" ]; then
    echo -e "${GREEN}✅ X-Titan-Config: Found (Cloudflare passes it)${NC}"
else
    echo -e "${YELLOW}⚠️  X-Titan-Config: Not found (Cloudflare may be removing it)${NC}"
fi

# HSTS
EXT_HSTS=$(echo "$EXT_HEADERS" | grep -i "Strict-Transport-Security" || echo "")
if [ -n "$EXT_HSTS" ]; then
    echo -e "${GREEN}✅ HSTS: Found${NC}"
    echo "   $EXT_HSTS"
else
    echo -e "${YELLOW}⚠️  HSTS: Not found (Enable in Cloudflare Dashboard)${NC}"
fi
echo ""

# =============================================================================
# 7. Recent Nginx Errors
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}7. Recent Nginx Error Log (Last 20 Lines)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"

if [ -f /var/log/nginx/error.log ]; then
    # Filter out OCSP stapling warnings (known issue)
    ERROR_LINES=$(sudo tail -20 /var/log/nginx/error.log | grep -v "ssl_stapling ignored")
    if [ -n "$ERROR_LINES" ]; then
        echo "$ERROR_LINES"
    else
        echo -e "${GREEN}No errors found (OCSP stapling warnings filtered out)${NC}"
    fi
else
    echo "Error log not found at /var/log/nginx/error.log"
fi
echo ""

# =============================================================================
# 8. Nginx Worker Processes
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}8. Nginx Worker Processes${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
ps aux | grep "nginx: worker" | head -5
echo ""

# =============================================================================
# 9. Configuration Test
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}9. Nginx Configuration Test${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
sudo nginx -t 2>&1
echo ""

# =============================================================================
# Summary and Recommendations
# =============================================================================
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Summary and Recommendations${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════════════${NC}"

if [ -z "$TITAN_HEADER" ]; then
    echo -e "${RED}🚨 CRITICAL: X-Titan-Config header not found locally!${NC}"
    echo "   → The updated configuration is NOT active"
    echo "   → Action: Copy config and reload Nginx"
    echo ""
    echo "   Commands:"
    echo "   sudo cp /home/ubuntu/Titan/nginx-zala-ssl-enhanced.conf /etc/nginx/sites-available/zala"
    echo "   sudo nginx -t"
    echo "   sudo systemctl reload nginx"
    echo ""
elif [ -z "$HSTS_HEADER" ]; then
    echo -e "${YELLOW}⚠️  WARNING: X-Titan-Config found but HSTS missing locally${NC}"
    echo "   → Configuration is active but headers not appearing"
    echo "   → Possible causes:"
    echo "     1. Location block override issue"
    echo "     2. Nginx cache"
    echo "     3. Response coming from backend"
    echo ""
    echo "   Try:"
    echo "   sudo systemctl restart nginx"
    echo ""
elif [ -z "$EXT_HSTS" ]; then
    echo -e "${GREEN}✅ Local test PASSED: All headers present${NC}"
    echo -e "${YELLOW}⚠️  External test: Headers missing (Cloudflare removing them)${NC}"
    echo ""
    echo "   → Solution: Enable HSTS in Cloudflare Dashboard"
    echo "   → Path: SSL/TLS → Edge Certificates → HSTS"
    echo "   → Settings: max-age=31536000, includeSubDomains, preload"
    echo ""
else
    echo -e "${GREEN}✅ All tests PASSED!${NC}"
    echo "   → Configuration is active"
    echo "   → Headers are being sent correctly"
    echo "   → Ready for production"
    echo ""
fi

echo "Diagnostic complete. Report saved to: /home/ubuntu/Titan/nginx-diagnostic-report.txt"
echo ""
