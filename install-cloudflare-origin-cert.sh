#!/bin/bash
# =============================================================================
# Install Cloudflare Origin Certificate
# =============================================================================
# This script will help you install the Cloudflare Origin Certificate
# securely on your server
# =============================================================================

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                               ║${NC}"
echo -e "${BLUE}║              Cloudflare Origin Certificate Installation                       ║${NC}"
echo -e "${BLUE}║                                                                               ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Function to read multiline input
read_certificate() {
    echo -e "${YELLOW}Paste the certificate content and press Ctrl+D when done:${NC}"
    cat
}

read_private_key() {
    echo -e "${YELLOW}Paste the private key content and press Ctrl+D when done:${NC}"
    cat
}

# Step 1: Create directory
echo -e "${BLUE}Step 1: Creating directory...${NC}"
sudo mkdir -p /etc/ssl/cloudflare
echo -e "${GREEN}✅ Directory created${NC}"
echo ""

# Step 2: Get certificate
echo -e "${BLUE}Step 2: Certificate Input${NC}"
echo -e "${YELLOW}Please paste the Origin Certificate (including -----BEGIN CERTIFICATE----- and -----END CERTIFICATE-----)${NC}"
echo ""

CERT_CONTENT=$(read_certificate)

if [[ -z "$CERT_CONTENT" ]]; then
    echo -e "${RED}❌ Error: No certificate content provided${NC}"
    exit 1
fi

echo "$CERT_CONTENT" | sudo tee /etc/ssl/cloudflare/zala.ir.origin.crt > /dev/null
echo -e "${GREEN}✅ Certificate saved to /etc/ssl/cloudflare/zala.ir.origin.crt${NC}"
echo ""

# Step 3: Get private key
echo -e "${BLUE}Step 3: Private Key Input${NC}"
echo -e "${YELLOW}Please paste the Private Key (including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)${NC}"
echo ""

KEY_CONTENT=$(read_private_key)

if [[ -z "$KEY_CONTENT" ]]; then
    echo -e "${RED}❌ Error: No private key content provided${NC}"
    exit 1
fi

echo "$KEY_CONTENT" | sudo tee /etc/ssl/cloudflare/zala.ir.origin.key > /dev/null
echo -e "${GREEN}✅ Private key saved to /etc/ssl/cloudflare/zala.ir.origin.key${NC}"
echo ""

# Step 4: Download Cloudflare Origin CA root
echo -e "${BLUE}Step 4: Downloading Cloudflare Origin CA root certificate...${NC}"
if [ ! -f /etc/ssl/cloudflare/origin_ca_rsa_root.pem ]; then
    sudo curl -sS https://developers.cloudflare.com/ssl/static/origin_ca_rsa_root.pem -o /etc/ssl/cloudflare/origin_ca_rsa_root.pem
    echo -e "${GREEN}✅ Origin CA root downloaded${NC}"
else
    echo -e "${GREEN}✅ Origin CA root already exists${NC}"
fi
echo ""

# Step 5: Create full chain certificate
echo -e "${BLUE}Step 5: Creating full chain certificate...${NC}"
sudo bash -c 'cat /etc/ssl/cloudflare/zala.ir.origin.crt /etc/ssl/cloudflare/origin_ca_rsa_root.pem > /etc/ssl/cloudflare/zala.ir.origin.fullchain.crt'
echo -e "${GREEN}✅ Full chain certificate created${NC}"
echo ""

# Step 6: Set correct permissions
echo -e "${BLUE}Step 6: Setting permissions...${NC}"
sudo chmod 600 /etc/ssl/cloudflare/zala.ir.origin.key
sudo chmod 644 /etc/ssl/cloudflare/zala.ir.origin.crt
sudo chmod 644 /etc/ssl/cloudflare/zala.ir.origin.fullchain.crt
sudo chmod 644 /etc/ssl/cloudflare/origin_ca_rsa_root.pem
sudo chown root:root /etc/ssl/cloudflare/zala.ir.origin.*
sudo chown root:root /etc/ssl/cloudflare/origin_ca_rsa_root.pem
echo -e "${GREEN}✅ Permissions set correctly${NC}"
echo ""

# Step 7: Verify certificate
echo -e "${BLUE}Step 7: Verifying certificate...${NC}"
CERT_SUBJECT=$(openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.crt -noout -subject)
CERT_ISSUER=$(openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.crt -noout -issuer)
CERT_DATES=$(openssl x509 -in /etc/ssl/cloudflare/zala.ir.origin.crt -noout -dates)

echo "Subject: $CERT_SUBJECT"
echo "Issuer: $CERT_ISSUER"
echo "$CERT_DATES"
echo ""

if [[ "$CERT_ISSUER" == *"CloudFlare"* ]]; then
    echo -e "${GREEN}✅ Valid Cloudflare Origin Certificate!${NC}"
else
    echo -e "${YELLOW}⚠️  Warning: Issuer doesn't appear to be Cloudflare${NC}"
fi
echo ""

# Step 8: List installed files
echo -e "${BLUE}Step 8: Installed files:${NC}"
ls -lh /etc/ssl/cloudflare/
echo ""

echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                               ║${NC}"
echo -e "${GREEN}║                    ✅ Certificate Installation Complete                       ║${NC}"
echo -e "${GREEN}║                                                                               ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
echo ""

echo -e "${YELLOW}Next steps:${NC}"
echo "1. Update Nginx configuration to use the new certificate"
echo "2. Test Nginx configuration: sudo nginx -t"
echo "3. Reload Nginx: sudo systemctl reload nginx"
echo "4. Test origin connection: curl -I -k --resolve www.zala.ir:443:127.0.0.1 https://www.zala.ir"
echo "5. Switch Cloudflare to Full (strict) mode"
echo ""
