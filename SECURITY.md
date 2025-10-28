# 🔒 Security Guidelines - TITAN Trading System

## Critical Security Requirements

### 1. Environment Variables

**❌ NEVER commit these files to git:**
- `.env`
- `.env.local`
- `.env.production`
- Any file containing API keys or secrets

**✅ Always use:**
- `.env.example` for documentation (with placeholders only)
- Server environment variables for production
- Secret management services (AWS Secrets Manager, HashiCorp Vault, etc.)

### 2. Exchange Integration Security

#### Production Lock-down

**Current Production Setting:**
```bash
EXCHANGE_NAME=paper  # Locked to paper trading
```

**⚠️ NEVER enable live exchange in production without:**
1. **IP Whitelisting:** Restrict API access to known server IPs
2. **Sub-account:** Use isolated sub-account with minimal funds
3. **Scope Limitation:** Only enable required permissions (no withdrawal)
4. **Rate Limits:** Set conservative rate limits on exchange side
5. **Monitoring:** Enable real-time alerting for suspicious activity
6. **Key Rotation:** Regular rotation schedule (30-60 days)

#### Staging Environment

For testing with real exchange (staging only):

```bash
# staging.env (NOT IN GIT)
EXCHANGE_NAME=mexc
MEXC_API_KEY=staging_key_here
MEXC_API_SECRET=staging_secret_here
```

**Requirements:**
- Separate sub-account from production
- Max balance: $100 USD equivalent
- IP whitelist to staging server only
- Alerts on unusual activity

### 3. API Key Security

#### Key Management

**✅ DO:**
- Store keys in environment variables
- Use secure secret management services
- Rotate keys regularly (30-60 days)
- Use read-only keys when possible
- Enable IP whitelisting
- Monitor key usage

**❌ NEVER:**
- Commit keys to git (even private repos)
- Share keys via email/Slack
- Use production keys in development
- Reuse keys across environments
- Store keys in code/config files
- Use keys without IP restrictions

#### If Keys are Compromised

**Immediate Actions:**
1. Deactivate/delete compromised keys immediately
2. Generate new keys
3. Update server environment variables
4. Review recent API activity
5. Check for unauthorized transactions
6. Notify team/stakeholders
7. Document incident

### 4. Log Masking

Our system automatically masks sensitive data in logs:

**Masked Fields:**
- `api_key`, `apiKey`
- `token`, `bearer`, `jwt`
- `secret`, `password`, `pwd`
- `email` (partially masked)
- `phone`, `ssn`
- `cardNumber`, `cvv`

**Example:**
```javascript
const { logger } = require('./utils/logMasking');

// This will automatically mask the API key
logger.info('User authenticated', { 
  userId: '123',
  apiKey: 'secret123456789'  // Logged as: 'secr********6789'
});
```

### 5. Database Security

**Connection Security:**
- Use SSL/TLS for database connections
- Strong passwords (16+ characters, mixed)
- Limit connection pool size
- Use connection timeouts
- Enable query logging (without sensitive data)

**Data Security:**
- Encrypt sensitive columns (PII, financial data)
- Use prepared statements (prevent SQL injection)
- Regular backups (automated daily)
- Backup encryption
- Secure backup storage

### 6. Rate Limiting

**Current Setup:**
- 50 requests per 60 seconds per IP
- Using Memory backend (production)
- Redis backend available (staging)

**Security Benefits:**
- Prevents brute force attacks
- Mitigates DDoS attempts
- Protects against API abuse

### 7. Authentication & Authorization

**JWT Security:**
- Strong secret key (256-bit minimum)
- Short token expiration (15-60 minutes)
- Refresh token rotation
- Secure cookie flags (HttpOnly, Secure, SameSite)

**RBAC:**
- Principle of least privilege
- Role-based access control
- Admin endpoints protected
- Audit logging for sensitive operations

### 8. Incident Response

**If Security Incident Detected:**

1. **Immediate:**
   - Isolate affected systems
   - Rotate all credentials
   - Enable maintenance mode if needed

2. **Investigation:**
   - Review logs for breach timeline
   - Identify compromised data
   - Check for persistent access

3. **Remediation:**
   - Patch vulnerabilities
   - Update security measures
   - Restore from clean backup if needed

4. **Post-Incident:**
   - Document findings
   - Update security procedures
   - Team training/awareness

### 9. Dependency Security

**Regular Updates:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically
npm audit fix

# Review and fix manually
npm audit fix --force  # Use with caution
```

**Best Practices:**
- Review dependencies before adding
- Keep dependencies updated
- Use lock files (package-lock.json)
- Monitor security advisories
- Remove unused dependencies

### 10. Deployment Security

**Production Checklist:**
- [ ] All secrets in environment variables (not in code)
- [ ] `.env` in `.gitignore`
- [ ] `EXCHANGE_NAME=paper` (until approved for live)
- [ ] Log masking enabled
- [ ] HTTPS/SSL enabled
- [ ] Rate limiting active
- [ ] Database backups automated
- [ ] Monitoring and alerts configured
- [ ] Security headers set (CORS, CSP, etc.)
- [ ] Error messages don't leak sensitive info

---

## Security Contacts

**For security issues:**
- DO NOT open public GitHub issues
- Contact: [security email here]
- PGP Key: [if available]

**Response Time:**
- Critical: < 4 hours
- High: < 24 hours
- Medium: < 1 week

---

## Compliance

**Data Protection:**
- GDPR compliance (EU users)
- Data minimization
- Right to deletion
- Data encryption

**Financial Regulations:**
- KYC/AML procedures (if applicable)
- Transaction monitoring
- Audit trail maintenance

---

## Security Audit History

| Date | Type | Findings | Status |
|------|------|----------|--------|
| 2025-10-27 | Code Review | .env tracking issue | ✅ Fixed |
| - | - | - | - |

---

**Last Updated:** 2025-10-27  
**Next Review:** 2025-11-27
