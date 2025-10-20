#!/bin/bash
# =============================================================================
# TITAN Trading System - Pre-SSL Deployment Check
# =============================================================================
# Purpose: Verify system readiness before SSL Full (strict) deployment
# Usage: ./scripts/pre-ssl-check.sh
# =============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo -e "${BLUE}$1${NC}"
    echo "═══════════════════════════════════════════════════════════════════════════════"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((CHECKS_PASSED++))
}

print_failure() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((CHECKS_FAILED++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  WARN:${NC} $1"
    ((CHECKS_WARNING++))
}

# =============================================================================
# Check Functions
# =============================================================================

check_root_access() {
    print_header "1. Checking Root/Sudo Access"
    
    if sudo -n true 2>/dev/null; then
        print_success "Sudo access available"
        return 0
    else
        print_failure "Sudo access not available or requires password"
        echo "  Run: sudo -v"
        return 1
    fi
}

check_required_files() {
    print_header "2. Checking Required Project Files"
    
    local all_passed=true
    
    # Documentation
    if [ -f "docs/ops/SSL_SETUP.md" ]; then
        print_success "SSL_SETUP.md found"
    else
        print_failure "docs/ops/SSL_SETUP.md not found"
        all_passed=false
    fi
    
    # Scripts
    if [ -f "scripts/test-ssl-acceptance.sh" ]; then
        print_success "test-ssl-acceptance.sh found"
    else
        print_failure "scripts/test-ssl-acceptance.sh not found"
        all_passed=false
    fi
    
    # Nginx config
    if [ -f "infra/nginx-ssl-strict.conf" ]; then
        print_success "nginx-ssl-strict.conf found"
    else
        print_failure "infra/nginx-ssl-strict.conf not found"
        all_passed=false
    fi
    
    # Migration
    if [ -f "database/migrations/003_ensure_admin_role.sql" ]; then
        print_success "003_ensure_admin_role.sql found"
    else
        print_failure "database/migrations/003_ensure_admin_role.sql not found"
        all_passed=false
    fi
    
    [ "$all_passed" = true ]
}

check_nginx() {
    print_header "3. Checking Nginx"
    
    if command -v nginx &> /dev/null; then
        print_success "Nginx installed"
        
        if systemctl is-active --quiet nginx; then
            print_success "Nginx is running"
            
            if sudo nginx -t &> /dev/null; then
                print_success "Nginx configuration is valid"
                return 0
            else
                print_failure "Nginx configuration has errors"
                echo "  Run: sudo nginx -t"
                return 1
            fi
        else
            print_failure "Nginx is not running"
            echo "  Run: sudo systemctl start nginx"
            return 1
        fi
    else
        print_failure "Nginx is not installed"
        return 1
    fi
}

check_pm2() {
    print_header "4. Checking PM2 and Backend"
    
    if command -v pm2 &> /dev/null; then
        print_success "PM2 installed"
        
        # Check if any process is running
        if pm2 list | grep -q "online"; then
            print_success "PM2 processes running"
            
            # Check backend specifically
            if pm2 list | grep -i "backend\|titan" | grep -q "online"; then
                print_success "Backend process is online"
                return 0
            else
                print_warning "Backend process not found or not online"
                echo "  Check: pm2 list"
                return 0
            fi
        else
            print_warning "No PM2 processes running"
            return 0
        fi
    else
        print_warning "PM2 not installed (optional)"
        return 0
    fi
}

check_database() {
    print_header "5. Checking Database Connectivity"
    
    if command -v psql &> /dev/null; then
        print_success "PostgreSQL client installed"
        
        # Try to connect (will need environment variables)
        if [ -n "$PGPASSWORD" ]; then
            if psql -h localhost -p 5433 -U titan_user -d titan_trading -c "SELECT 1;" &> /dev/null; then
                print_success "Database connection successful"
                return 0
            else
                print_warning "Database connection failed (check credentials)"
                echo "  Set: export PGPASSWORD='your_password'"
                return 0
            fi
        else
            print_warning "PGPASSWORD not set (will be needed for migration)"
            echo "  Set: export PGPASSWORD='your_password'"
            return 0
        fi
    else
        print_warning "PostgreSQL client not installed"
        return 0
    fi
}

check_dependencies() {
    print_header "6. Checking Required Dependencies"
    
    local all_passed=true
    
    # jq
    if command -v jq &> /dev/null; then
        print_success "jq installed"
    else
        print_failure "jq not installed"
        echo "  Install: sudo apt-get install -y jq"
        all_passed=false
    fi
    
    # openssl
    if command -v openssl &> /dev/null; then
        print_success "openssl installed"
    else
        print_failure "openssl not installed"
        all_passed=false
    fi
    
    # curl
    if command -v curl &> /dev/null; then
        print_success "curl installed"
    else
        print_failure "curl not installed"
        all_passed=false
    fi
    
    [ "$all_passed" = true ]
}

check_current_site() {
    print_header "7. Checking Current Site Status"
    
    # Test HTTP/HTTPS
    if curl -s -o /dev/null -w "%{http_code}" https://www.zala.ir 2>/dev/null | grep -q "200"; then
        print_success "Site is accessible via HTTPS"
        
        # Test API
        if curl -s https://www.zala.ir/api/health 2>/dev/null | jq -e '.data.status == "healthy"' &> /dev/null; then
            print_success "API health check passed"
            return 0
        else
            print_warning "API health check failed or returned non-healthy"
            return 0
        fi
    else
        print_warning "Site not accessible or returned non-200 status"
        return 0
    fi
}

check_ssl_directory() {
    print_header "8. Checking SSL Directory"
    
    if [ -d "/etc/ssl/cloudflare" ]; then
        print_warning "SSL directory already exists"
        
        if [ -f "/etc/ssl/cloudflare/origin-cert.pem" ]; then
            print_warning "Origin certificate already exists"
        fi
        
        if [ -f "/etc/ssl/cloudflare/origin-key.pem" ]; then
            print_warning "Origin key already exists"
        fi
        
        echo "  Note: Existing certificates will be used. Create new ones if needed."
    else
        print_success "SSL directory does not exist (will be created)"
    fi
    
    return 0
}

check_git_status() {
    print_header "9. Checking Git Status"
    
    if [ -d ".git" ]; then
        print_success "Git repository initialized"
        
        # Check current branch
        BRANCH=$(git branch --show-current)
        echo "  Current branch: $BRANCH"
        
        # Check for uncommitted changes
        if git diff-index --quiet HEAD --; then
            print_success "No uncommitted changes"
        else
            print_warning "Uncommitted changes detected"
            echo "  Run: git status"
        fi
        
        return 0
    else
        print_failure "Not a git repository"
        return 1
    fi
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                               ║"
    echo "║          TITAN Trading System - Pre-SSL Deployment Check                     ║"
    echo "║                                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Date: $(date)"
    echo "User: $(whoami)"
    echo "Path: $(pwd)"
    echo ""
    
    # Run all checks
    check_root_access || true
    check_required_files || true
    check_nginx || true
    check_pm2 || true
    check_database || true
    check_dependencies || true
    check_current_site || true
    check_ssl_directory || true
    check_git_status || true
    
    # Summary
    print_header "Summary"
    echo "Checks Passed:  ${CHECKS_PASSED}"
    echo -e "${YELLOW}Checks Warning: ${CHECKS_WARNING}${NC}"
    echo -e "${RED}Checks Failed:  ${CHECKS_FAILED}${NC}"
    echo ""
    
    if [ ${CHECKS_FAILED} -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                                                               ║${NC}"
        echo -e "${GREEN}║              ✅ SYSTEM READY FOR SSL DEPLOYMENT ✅                            ║${NC}"
        echo -e "${GREEN}║                                                                               ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "Next steps:"
        echo "1. Review PHASE4_SSL_DEPLOYMENT_GUIDE.md"
        echo "2. Proceed with SSL certificate generation in Cloudflare"
        echo "3. Follow the deployment guide"
        echo ""
        exit 0
    else
        echo -e "${RED}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                                                                               ║${NC}"
        echo -e "${RED}║        ❌ SYSTEM NOT READY - FIX FAILURES BEFORE PROCEEDING ❌               ║${NC}"
        echo -e "${RED}║                                                                               ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "Please fix the failed checks above before proceeding."
        echo ""
        exit 1
    fi
}

# Run main function
main "$@"
