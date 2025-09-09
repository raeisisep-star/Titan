#!/bin/bash

# TITAN Trading System - Cloudflare Secrets Setup Script
# This script helps set up production secrets in Cloudflare Pages

set -e  # Exit on any error

echo "🚀 TITAN Trading System - Production Secrets Setup"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI is not installed. Please install it first:"
    echo "npm install -g wrangler"
    exit 1
fi

# Check if user is logged in to Cloudflare
if ! wrangler whoami &> /dev/null; then
    print_error "You are not logged in to Cloudflare. Please login first:"
    echo "wrangler login"
    exit 1
fi

print_success "Wrangler CLI is ready"

# Get project name from wrangler.jsonc
PROJECT_NAME=$(grep -o '"name": *"[^"]*"' wrangler.jsonc | cut -d'"' -f4)
if [ -z "$PROJECT_NAME" ]; then
    PROJECT_NAME="titan-trading"
    print_warning "Could not detect project name from wrangler.jsonc, using default: $PROJECT_NAME"
else
    print_status "Project name: $PROJECT_NAME"
fi

echo ""
print_status "This script will help you set up the following secrets:"
echo "  🤖 AI Services: OpenAI, Anthropic, Google AI"
echo "  🏦 Exchanges: Binance, Coinbase, KuCoin"
echo "  📢 Notifications: SMTP, Telegram, SMS"
echo "  🔐 Security: JWT, Session secrets"
echo "  📊 Market Data: CoinGecko, CoinMarketCap"
echo ""

read -p "Do you want to continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled."
    exit 1
fi

echo ""
print_status "Setting up secrets..."

# Function to set secret with confirmation
set_secret() {
    local key=$1
    local description=$2
    local optional=${3:-false}
    
    echo ""
    print_status "Setting up $description"
    
    if [ "$optional" = true ]; then
        echo "This secret is optional. Press Enter to skip."
    fi
    
    read -s -p "Enter $description (will be hidden): " value
    echo
    
    if [ -z "$value" ] && [ "$optional" = true ]; then
        print_warning "Skipped $key"
        return
    fi
    
    if [ -z "$value" ]; then
        print_warning "Empty value provided for $key. Skipping..."
        return
    fi
    
    # Set the secret using wrangler
    echo "$value" | wrangler pages secret put "$key" --project-name "$PROJECT_NAME"
    
    if [ $? -eq 0 ]; then
        print_success "✅ $key set successfully"
    else
        print_error "❌ Failed to set $key"
    fi
}

# Set required secrets
echo ""
print_status "=== AI Services Secrets ==="
set_secret "OPENAI_API_KEY" "OpenAI API Key (for ChatGPT)" true
set_secret "ANTHROPIC_API_KEY" "Anthropic API Key (for Claude)" true
set_secret "GOOGLE_API_KEY" "Google AI API Key (for Gemini)" true

echo ""
print_status "=== Exchange API Secrets ==="
set_secret "BINANCE_API_KEY" "Binance API Key" true
set_secret "BINANCE_SECRET_KEY" "Binance Secret Key" true
set_secret "COINBASE_API_KEY" "Coinbase Pro API Key" true
set_secret "COINBASE_SECRET" "Coinbase Pro Secret" true
set_secret "COINBASE_PASSPHRASE" "Coinbase Pro Passphrase" true
set_secret "KUCOIN_API_KEY" "KuCoin API Key" true
set_secret "KUCOIN_SECRET_KEY" "KuCoin Secret Key" true
set_secret "KUCOIN_PASSPHRASE" "KuCoin Passphrase" true

echo ""
print_status "=== Notification Services Secrets ==="
set_secret "SMTP_PASS" "SMTP Password (Gmail App Password)" true
set_secret "TELEGRAM_BOT_TOKEN" "Telegram Bot Token" true
set_secret "KAVENEGAR_API_KEY" "Kavenegar SMS API Key" true
set_secret "DISCORD_WEBHOOK_URL" "Discord Webhook URL" true

echo ""
print_status "=== Security Secrets ==="
# Generate secure JWT secret if not provided
echo ""
print_status "JWT Secret (leave empty to auto-generate secure key):"
read -s -p "Enter JWT Secret: " jwt_secret
echo

if [ -z "$jwt_secret" ]; then
    jwt_secret=$(openssl rand -base64 64 | tr -d "\\n")
    print_success "Auto-generated secure JWT secret (64 bytes)"
fi

echo "$jwt_secret" | wrangler pages secret put "JWT_SECRET" --project-name "$PROJECT_NAME"
print_success "✅ JWT_SECRET set successfully"

# Generate secure session secret if not provided
echo ""
print_status "Session Secret (leave empty to auto-generate secure key):"
read -s -p "Enter Session Secret: " session_secret
echo

if [ -z "$session_secret" ]; then
    session_secret=$(openssl rand -base64 64 | tr -d "\\n")
    print_success "Auto-generated secure session secret (64 bytes)"
fi

echo "$session_secret" | wrangler pages secret put "SESSION_SECRET" --project-name "$PROJECT_NAME"
print_success "✅ SESSION_SECRET set successfully"

echo ""
print_status "=== Market Data Secrets ==="
set_secret "COINGECKO_API_KEY" "CoinGecko API Key" true
set_secret "COINMARKETCAP_API_KEY" "CoinMarketCap API Key" true
set_secret "ALPHA_VANTAGE_API_KEY" "Alpha Vantage API Key" true

echo ""
print_status "=== Additional Configuration ==="

# Set non-secret environment variables
print_status "Setting environment variables..."

echo "production" | wrangler pages secret put "NODE_ENV" --project-name "$PROJECT_NAME"
echo "false" | wrangler pages secret put "DEBUG_MODE" --project-name "$PROJECT_NAME"
echo "false" | wrangler pages secret put "BINANCE_TESTNET" --project-name "$PROJECT_NAME"
echo "false" | wrangler pages secret put "COINBASE_SANDBOX" --project-name "$PROJECT_NAME"
echo "false" | wrangler pages secret put "KUCOIN_SANDBOX" --project-name "$PROJECT_NAME"

print_success "Environment variables set for production"

echo ""
print_status "=== Setup Complete ==="

# List all secrets
echo ""
print_status "Listing configured secrets:"
wrangler pages secret list --project-name "$PROJECT_NAME"

echo ""
print_success "🎉 All secrets have been configured successfully!"
echo ""
print_status "Next steps:"
echo "  1. Test your configuration: curl https://your-domain.pages.dev/api/system/config/health"
echo "  2. Deploy your application: npm run deploy"
echo "  3. Monitor the logs: wrangler pages deployment tail --project-name $PROJECT_NAME"
echo ""
print_warning "Security reminders:"
echo "  • Never share these API keys"
echo "  • Regularly rotate your secrets"
echo "  • Monitor API usage and costs"
echo "  • Use testnet/sandbox for development"
echo ""
print_success "TITAN Trading System is ready for production! 🚀"