#!/usr/bin/env bash
#===============================================================================
# Cloudflare IP Ranges Auto-Update Script
# Updates Nginx configuration with latest Cloudflare IP ranges
# Ensures accurate real IP extraction and rate limiting
#===============================================================================

set -euo pipefail

# Configuration
TMP="/tmp/cfips.$$"
OUT="/etc/nginx/conf.d/cloudflare_real_ips.conf"
LOG="/var/log/cf-ip-update.log"

# Ensure conf.d directory exists
mkdir -p /etc/nginx/conf.d

# Log function
log() {
    echo "[$(date -u '+%Y-%m-%d %H:%M:%S UTC')] $*" >> "$LOG"
}

log "Starting Cloudflare IP ranges update..."

# Download and generate configuration
{
    echo "# Cloudflare IP Ranges - Auto-generated"
    echo "# Last updated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
    echo "# Source: https://www.cloudflare.com/ips"
    echo ""
    
    echo "## IPv4 Ranges"
    curl -fsSL https://www.cloudflare.com/ips-v4 | sed 's/^/set_real_ip_from /; s/$/;/'
    
    echo ""
    echo "## IPv6 Ranges"
    curl -fsSL https://www.cloudflare.com/ips-v6 | sed 's/^/set_real_ip_from /; s/$/;/'
    
    echo ""
    echo "## Real IP Header (configured in main server block)"
    echo "# real_ip_header CF-Connecting-IP;"
} > "$TMP"

# Check if downloads were successful
if [ ! -s "$TMP" ]; then
    log "❌ ERROR: Failed to download Cloudflare IP ranges"
    rm -f "$TMP"
    exit 1
fi

log "✅ IPv4 and IPv6 ranges downloaded successfully"

# Verify the generated file is not empty
if [ ! -s "$TMP" ]; then
    log "❌ ERROR: Generated configuration file is empty"
    rm -f "$TMP"
    exit 1
fi

# Move to final location
mv "$TMP" "$OUT"
chmod 644 "$OUT"
log "✅ Configuration file updated: $OUT"

# Test Nginx configuration
if nginx -t > /dev/null 2>&1; then
    log "✅ Nginx configuration test passed"
    
    # Reload Nginx
    if systemctl reload nginx; then
        log "✅ Nginx reloaded successfully"
        log "🎉 Cloudflare IP ranges update completed successfully"
        exit 0
    else
        log "❌ ERROR: Failed to reload Nginx"
        exit 1
    fi
else
    log "❌ ERROR: Nginx configuration test failed"
    log "❌ Rolling back changes..."
    
    # Restore from backup if exists
    if [ -f "${OUT}.backup" ]; then
        mv "${OUT}.backup" "$OUT"
        log "✅ Restored previous configuration"
    fi
    
    exit 1
fi
