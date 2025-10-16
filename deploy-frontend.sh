#!/bin/bash

#########################################
# TITAN Frontend Deployment Script
# این اسکریپت frontend را deploy می‌کند
#########################################

set -e  # Exit on error

echo "========================================="
echo "🚀 TITAN Frontend Deployment"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/tmp/webapp/Titan"

echo -e "${BLUE}📍 Working Directory: ${PROJECT_DIR}${NC}"
echo ""

# Step 1: Verify files
echo -e "${BLUE}Step 1: Verifying files...${NC}"
if [ ! -f "$PROJECT_DIR/public/index.html" ]; then
    echo -e "${RED}❌ Error: public/index.html not found!${NC}"
    exit 1
fi

if [ ! -d "$PROJECT_DIR/public/static" ]; then
    echo -e "${RED}❌ Error: public/static/ directory not found!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All files verified${NC}"
echo ""

# Step 2: Backup current nginx config
echo -e "${BLUE}Step 2: Backing up Nginx config...${NC}"
BACKUP_FILE="/etc/nginx/sites-available/titan.backup.$(date +%Y%m%d_%H%M%S)"
sudo cp /etc/nginx/sites-available/titan "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"
echo ""

# Step 3: Deploy new nginx config
echo -e "${BLUE}Step 3: Deploying new Nginx config...${NC}"
sudo cp "$PROJECT_DIR/nginx-titan-updated.conf" /etc/nginx/sites-available/titan
echo -e "${GREEN}✅ Nginx config updated${NC}"
echo ""

# Step 4: Test nginx config
echo -e "${BLUE}Step 4: Testing Nginx configuration...${NC}"
if sudo nginx -t; then
    echo -e "${GREEN}✅ Nginx config is valid${NC}"
else
    echo -e "${RED}❌ Nginx config test failed!${NC}"
    echo -e "${YELLOW}Restoring backup...${NC}"
    sudo cp "$BACKUP_FILE" /etc/nginx/sites-available/titan
    exit 1
fi
echo ""

# Step 5: Reload nginx
echo -e "${BLUE}Step 5: Reloading Nginx...${NC}"
sudo systemctl reload nginx
echo -e "${GREEN}✅ Nginx reloaded${NC}"
echo ""

# Step 6: Verify backend is running
echo -e "${BLUE}Step 6: Checking backend status...${NC}"
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is running${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Backend might not be running${NC}"
    echo -e "${YELLOW}Check with: pm2 status${NC}"
fi
echo ""

# Step 7: Test the website
echo -e "${BLUE}Step 7: Testing website...${NC}"
if curl -f https://www.zala.ir > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Website is accessible!${NC}"
else
    echo -e "${RED}❌ Website not accessible${NC}"
    echo -e "${YELLOW}Check nginx logs: sudo tail -50 /var/log/nginx/titan-ssl-error.log${NC}"
fi
echo ""

# Summary
echo "========================================="
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo "========================================="
echo ""
echo -e "${BLUE}📊 Summary:${NC}"
echo "  • Frontend: /tmp/webapp/Titan/public/"
echo "  • Static files: /tmp/webapp/Titan/public/static/"
echo "  • Nginx config: /etc/nginx/sites-available/titan"
echo "  • Backup: $BACKUP_FILE"
echo ""
echo -e "${BLUE}🌐 URLs:${NC}"
echo "  • Website: https://www.zala.ir"
echo "  • API Health: https://www.zala.ir/api/health"
echo ""
echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo "  • Check Nginx logs: sudo tail -f /var/log/nginx/titan-ssl-error.log"
echo "  • Check backend: pm2 status"
echo "  • Backend logs: pm2 logs titan-backend"
echo "  • Restart backend: pm2 restart titan-backend"
echo ""
echo -e "${GREEN}🎉 You can now open https://www.zala.ir in your browser!${NC}"
echo ""
