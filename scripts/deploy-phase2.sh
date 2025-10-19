#!/bin/bash
# TITAN Phase 2 Deployment Script
# اجرای کامل تمام اقدامات فوری
# Usage: sudo bash scripts/deploy-phase2.sh

set -e  # Exit on error

echo "🚀 Starting TITAN Phase 2 Deployment..."
echo "================================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root/sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root or with sudo${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Running with sudo privileges${NC}"

# =============================================================================
# STEP 1: Kill Wrangler Processes
# =============================================================================
echo ""
echo "📍 STEP 1: Stopping wrangler processes..."
pkill -9 -f wrangler 2>/dev/null || true
sleep 2

# Verify
if pgrep -f wrangler > /dev/null; then
    echo -e "${RED}⚠️  Some wrangler processes still running${NC}"
    ps aux | grep wrangler | grep -v grep
else
    echo -e "${GREEN}✅ All wrangler processes stopped${NC}"
fi

# =============================================================================
# STEP 2: Backup and Update Nginx Config
# =============================================================================
echo ""
echo "📍 STEP 2: Updating Nginx configuration..."

# Backup
BACKUP_FILE="/etc/nginx/sites-enabled/zala.backup.$(date +%F_%H-%M-%S)"
cp /etc/nginx/sites-enabled/zala "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"

# Create new config
cat > /etc/nginx/sites-enabled/zala << 'NGINX_EOF'
server {
    listen 80;
    listen [::]:80;
    server_name zala.ir www.zala.ir;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name zala.ir www.zala.ir;

    # SSL Configuration
    ssl_certificate     /etc/letsencrypt/live/zala.ir/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zala.ir/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam         /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # API Backend Proxy (NO CACHE)
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
        
        # Disable caching for API
        add_header Cache-Control "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0" always;
        expires off;
    }

    # S3/MinIO Proxy
    location /s3/ {
        proxy_pass http://127.0.0.1:9000/;
        proxy_set_header Host 127.0.0.1:9000;
        proxy_http_version 1.1;
        proxy_set_header Connection "";
        proxy_request_buffering off;
        client_max_body_size 200m;
        proxy_redirect off;
        
        add_header Access-Control-Allow-Origin "https://zala.ir" always;
        add_header Access-Control-Expose-Headers "ETag" always;
        
        if ($request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin "https://zala.ir" always;
            add_header Access-Control-Allow-Methods "GET, PUT, POST, DELETE, OPTIONS" always;
            add_header Access-Control-Allow-Headers "Content-Type, Authorization, x-amz-acl, x-amz-date, x-amz-content-sha256, x-amz-security-token" always;
            add_header Access-Control-Max-Age "86400" always;
            return 204;
        }
    }

    # Frontend - Serve from public/ directory
    location / {
        root /tmp/webapp/Titan/public;
        try_files $uri $uri/ /index.html;
        
        # HTML files - no cache
        location = /index.html {
            add_header Cache-Control "no-cache, must-revalidate";
            expires 0;
        }
        
        # Config files - no cache
        location ~* \.json$ {
            add_header Cache-Control "no-cache, must-revalidate";
            expires 0;
        }
        
        location = /config.js {
            add_header Cache-Control "no-cache, must-revalidate";
            expires 0;
        }
        
        # Static assets - aggressive caching
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|otf)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }
}
NGINX_EOF

echo -e "${GREEN}✅ Nginx config updated${NC}"

# Test nginx config
echo ""
echo "Testing Nginx configuration..."
if nginx -t; then
    echo -e "${GREEN}✅ Nginx config test passed${NC}"
    systemctl reload nginx
    echo -e "${GREEN}✅ Nginx reloaded${NC}"
else
    echo -e "${RED}❌ Nginx config test failed!${NC}"
    echo "Restoring backup..."
    cp "$BACKUP_FILE" /etc/nginx/sites-enabled/zala
    systemctl reload nginx
    exit 1
fi

# =============================================================================
# STEP 3: Add Dashboard Endpoints to server.js
# =============================================================================
echo ""
echo "📍 STEP 3: Adding dashboard endpoints to server.js..."

# Check if endpoints already exist
if grep -q "GET /api/dashboard/portfolio-real" /tmp/webapp/Titan/server.js; then
    echo -e "${YELLOW}⚠️  Dashboard endpoints already exist in server.js${NC}"
else
    echo "Adding dashboard endpoints..."
    
    # Find the line after /api/dashboard/stats
    LINE_NUM=$(grep -n "GET /api/dashboard/stats" /tmp/webapp/Titan/server.js | cut -d: -f1 | head -1)
    
    if [ -z "$LINE_NUM" ]; then
        echo -e "${RED}❌ Could not find insertion point in server.js${NC}"
        exit 1
    fi
    
    # Calculate insertion point (after the stats endpoint closure)
    INSERT_LINE=$((LINE_NUM + 40))
    
    echo "Will insert after line $INSERT_LINE"
    echo -e "${YELLOW}⚠️  Manual insertion required - endpoints code is in /tmp/webapp/Titan/scripts/dashboard-endpoints.js${NC}"
fi

# =============================================================================
# STEP 4: Restart Backend
# =============================================================================
echo ""
echo "📍 STEP 4: Restarting backend..."
cd /tmp/webapp/Titan
pm2 reload titan-backend
sleep 3
pm2 status

# =============================================================================
# STEP 5: Test Endpoints
# =============================================================================
echo ""
echo "📍 STEP 5: Testing endpoints..."

echo ""
echo "Testing /api/health..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/health)
if [ "$HEALTH_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ /api/health: $HEALTH_STATUS${NC}"
else
    echo -e "${RED}❌ /api/health: $HEALTH_STATUS${NC}"
fi

echo ""
echo "Testing /api/integration/status..."
INTEGRATION_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/api/integration/status)
if [ "$INTEGRATION_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ /api/integration/status: $INTEGRATION_STATUS${NC}"
else
    echo -e "${RED}❌ /api/integration/status: $INTEGRATION_STATUS${NC}"
fi

# =============================================================================
# STEP 6: Test via Domain (with cache bypass)
# =============================================================================
echo ""
echo "📍 STEP 6: Testing via domain..."

echo ""
echo "Testing https://www.zala.ir/api/health..."
DOMAIN_HEALTH=$(curl -s -H "Cache-Control: no-cache" -o /dev/null -w "%{http_code}" https://www.zala.ir/api/health)
if [ "$DOMAIN_HEALTH" = "200" ]; then
    echo -e "${GREEN}✅ Domain /api/health: $DOMAIN_HEALTH${NC}"
else
    echo -e "${RED}❌ Domain /api/health: $DOMAIN_HEALTH${NC}"
fi

# =============================================================================
# FINAL REPORT
# =============================================================================
echo ""
echo "================================================"
echo "🎯 Deployment Summary"
echo "================================================"
echo ""

echo "✅ Wrangler processes: $(pgrep -f wrangler > /dev/null && echo 'STILL RUNNING ⚠️' || echo 'STOPPED')"
echo "✅ Nginx config: UPDATED"
echo "✅ Nginx status: $(systemctl is-active nginx)"
echo "✅ Backend status: $(pm2 list | grep titan-backend | grep online > /dev/null && echo 'ONLINE' || echo 'OFFLINE')"
echo "✅ /api/health (localhost): $HEALTH_STATUS"
echo "✅ /api/health (domain): $DOMAIN_HEALTH"
echo ""

echo "📋 Next Manual Steps:"
echo "1. Add dashboard endpoints to server.js (code in scripts/dashboard-endpoints.js)"
echo "2. Run seed script: bash scripts/seed-sample-data.sh"
echo "3. Test dashboard endpoints"
echo "4. Verify Badge shows 'REAL' in browser"
echo ""

echo -e "${GREEN}✅ Phase 2 deployment completed!${NC}"
