#!/bin/bash
# =============================================================================
# TITAN Trading System - SSL Acceptance Tests
# =============================================================================
# Purpose: Validate SSL Full (strict) configuration
# Usage: ./scripts/test-ssl-acceptance.sh
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="www.zala.ir"
BASE_URL="https://${DOMAIN}"
API_URL="${BASE_URL}/api"

# Test counters
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

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

print_test() {
    echo -e "${YELLOW}TEST $1:${NC} $2"
}

print_success() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    ((TESTS_PASSED++))
}

print_failure() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    ((TESTS_FAILED++))
}

print_info() {
    echo -e "${BLUE}ℹ️  INFO:${NC} $1"
}

run_test() {
    ((TESTS_RUN++))
}

# =============================================================================
# Test Functions
# =============================================================================

test_ssl_chain() {
    print_header "Test 1: SSL Certificate Chain Validation"
    run_test
    
    print_test "${TESTS_RUN}" "Validating SSL certificate chain"
    
    OUTPUT=$(openssl s_client -connect ${DOMAIN}:443 -servername ${DOMAIN} < /dev/null 2>&1)
    VERIFY_CODE=$(echo "$OUTPUT" | grep "Verify return code" | awk '{print $4}')
    
    if [ "$VERIFY_CODE" == "0" ]; then
        print_success "SSL certificate chain is valid (Verify return code: 0)"
        echo "$OUTPUT" | grep "Verify return code"
        return 0
    else
        print_failure "SSL certificate chain validation failed (Verify return code: ${VERIFY_CODE})"
        echo "$OUTPUT" | grep "Verify return code"
        return 1
    fi
}

test_hsts_header() {
    print_header "Test 2: HSTS Header Validation"
    run_test
    
    print_test "${TESTS_RUN}" "Checking Strict-Transport-Security header"
    
    HSTS_HEADER=$(curl -sS -I ${BASE_URL} | grep -i "Strict-Transport-Security" || echo "")
    
    if [[ "$HSTS_HEADER" =~ "max-age=31536000" ]] && [[ "$HSTS_HEADER" =~ "includeSubDomains" ]] && [[ "$HSTS_HEADER" =~ "preload" ]]; then
        print_success "HSTS header is correctly configured"
        echo "  ${HSTS_HEADER}"
        return 0
    else
        print_failure "HSTS header is missing or misconfigured"
        if [ -n "$HSTS_HEADER" ]; then
            echo "  Found: ${HSTS_HEADER}"
        else
            echo "  Header not found"
        fi
        return 1
    fi
}

test_http_redirect() {
    print_header "Test 3: HTTP to HTTPS Redirect"
    run_test
    
    print_test "${TESTS_RUN}" "Testing HTTP to HTTPS redirect"
    
    REDIRECT=$(curl -sS -I http://${DOMAIN} | grep -i "Location: https" || echo "")
    STATUS=$(curl -sS -I -o /dev/null -w "%{http_code}" http://${DOMAIN})
    
    if [ "$STATUS" == "301" ] && [ -n "$REDIRECT" ]; then
        print_success "HTTP correctly redirects to HTTPS (301)"
        echo "  ${REDIRECT}"
        return 0
    else
        print_failure "HTTP to HTTPS redirect failed (Status: ${STATUS})"
        return 1
    fi
}

test_health_check() {
    print_header "Test 4: Application Health Check"
    run_test
    
    print_test "${TESTS_RUN}" "Checking application health endpoint"
    
    HEALTH=$(curl -sS ${API_URL}/health | jq -r '.data.status' 2>/dev/null || echo "error")
    
    if [ "$HEALTH" == "healthy" ]; then
        print_success "Application health check passed"
        curl -sS ${API_URL}/health | jq '.data'
        return 0
    else
        print_failure "Application health check failed (Status: ${HEALTH})"
        curl -sS ${API_URL}/health | jq '.'
        return 1
    fi
}

test_authentication() {
    print_header "Test 5: Authentication over HTTPS"
    run_test
    
    print_test "${TESTS_RUN}" "Testing authentication and JWT token generation"
    
    LOGIN_RESPONSE=$(curl -sS -X POST ${API_URL}/auth/login \
        -H 'Content-Type: application/json' \
        -d '{"username":"admin","password":"admin123"}' 2>/dev/null)
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token' 2>/dev/null || echo "")
    SUCCESS=$(echo "$LOGIN_RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")
    
    if [ "$SUCCESS" == "true" ] && [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        print_success "Authentication successful, JWT token obtained"
        echo "  Token length: ${#TOKEN} characters"
        export TEST_TOKEN="$TOKEN"
        return 0
    else
        print_failure "Authentication failed"
        echo "$LOGIN_RESPONSE" | jq '.'
        return 1
    fi
}

test_authenticated_endpoint() {
    print_header "Test 6: Authenticated API Endpoint"
    run_test
    
    print_test "${TESTS_RUN}" "Testing authenticated endpoint with JWT"
    
    if [ -z "$TEST_TOKEN" ]; then
        print_failure "No JWT token available (authentication test must pass first)"
        return 1
    fi
    
    API_RESPONSE=$(curl -sS -H "Authorization: Bearer ${TEST_TOKEN}" \
        ${API_URL}/dashboard/portfolio-real 2>/dev/null)
    
    SUCCESS=$(echo "$API_RESPONSE" | jq -r '.success' 2>/dev/null || echo "false")
    SOURCE=$(echo "$API_RESPONSE" | jq -r '.meta.source' 2>/dev/null || echo "")
    
    if [ "$SUCCESS" == "true" ] && [ "$SOURCE" == "real" ]; then
        print_success "Authenticated endpoint working correctly"
        echo "$API_RESPONSE" | jq '{success, meta}'
        return 0
    else
        print_failure "Authenticated endpoint failed"
        echo "$API_RESPONSE" | jq '.'
        return 1
    fi
}

test_security_headers() {
    print_header "Test 7: Additional Security Headers"
    run_test
    
    print_test "${TESTS_RUN}" "Checking security headers"
    
    HEADERS=$(curl -sS -I ${BASE_URL})
    
    # Check multiple headers
    local all_passed=true
    
    # X-Content-Type-Options
    if echo "$HEADERS" | grep -iq "X-Content-Type-Options: nosniff"; then
        print_info "X-Content-Type-Options: nosniff ✓"
    else
        print_info "X-Content-Type-Options: missing ✗"
        all_passed=false
    fi
    
    # X-Frame-Options
    if echo "$HEADERS" | grep -iq "X-Frame-Options"; then
        print_info "X-Frame-Options: present ✓"
    else
        print_info "X-Frame-Options: missing ✗"
        all_passed=false
    fi
    
    # X-XSS-Protection
    if echo "$HEADERS" | grep -iq "X-XSS-Protection"; then
        print_info "X-XSS-Protection: present ✓"
    else
        print_info "X-XSS-Protection: missing ✗"
        all_passed=false
    fi
    
    if [ "$all_passed" = true ]; then
        print_success "Security headers are properly configured"
        return 0
    else
        print_failure "Some security headers are missing"
        return 1
    fi
}

test_tls_version() {
    print_header "Test 8: TLS Version Check"
    run_test
    
    print_test "${TESTS_RUN}" "Verifying TLS 1.2/1.3 support"
    
    # Test TLS 1.2
    TLS12=$(openssl s_client -connect ${DOMAIN}:443 -tls1_2 < /dev/null 2>&1 | grep "Protocol" || echo "")
    
    # Test TLS 1.3
    TLS13=$(openssl s_client -connect ${DOMAIN}:443 -tls1_3 < /dev/null 2>&1 | grep "Protocol" || echo "")
    
    if [[ "$TLS12" =~ "TLSv1.2" ]] || [[ "$TLS13" =~ "TLSv1.3" ]]; then
        print_success "Modern TLS versions supported"
        [ -n "$TLS12" ] && echo "  TLS 1.2: Supported"
        [ -n "$TLS13" ] && echo "  TLS 1.3: Supported"
        return 0
    else
        print_failure "TLS version check failed"
        return 1
    fi
}

# =============================================================================
# Main Test Execution
# =============================================================================

main() {
    echo ""
    echo "╔═══════════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                               ║"
    echo "║              TITAN Trading System - SSL Acceptance Tests                     ║"
    echo "║                                                                               ║"
    echo "╚═══════════════════════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Domain: ${DOMAIN}"
    echo "Base URL: ${BASE_URL}"
    echo "Started: $(date)"
    echo ""
    
    # Run all tests
    test_ssl_chain || true
    test_hsts_header || true
    test_http_redirect || true
    test_health_check || true
    test_authentication || true
    test_authenticated_endpoint || true
    test_security_headers || true
    test_tls_version || true
    
    # Summary
    print_header "Test Summary"
    echo "Tests Run:    ${TESTS_RUN}"
    echo -e "${GREEN}Tests Passed: ${TESTS_PASSED}${NC}"
    echo -e "${RED}Tests Failed: ${TESTS_FAILED}${NC}"
    echo ""
    
    if [ ${TESTS_FAILED} -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                                                               ║${NC}"
        echo -e "${GREEN}║                    ✅ ALL TESTS PASSED - SSL READY ✅                         ║${NC}"
        echo -e "${GREEN}║                                                                               ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        exit 0
    else
        echo -e "${RED}╔═══════════════════════════════════════════════════════════════════════════════╗${NC}"
        echo -e "${RED}║                                                                               ║${NC}"
        echo -e "${RED}║              ❌ SOME TESTS FAILED - REVIEW BEFORE DEPLOYMENT ❌               ║${NC}"
        echo -e "${RED}║                                                                               ║${NC}"
        echo -e "${RED}╚═══════════════════════════════════════════════════════════════════════════════╝${NC}"
        echo ""
        exit 1
    fi
}

# Run main function
main "$@"
