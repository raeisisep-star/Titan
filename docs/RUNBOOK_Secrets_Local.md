# 🔐 RUNBOOK: Local Secrets Management

**For**: Production deployment on self-hosted servers  
**Purpose**: Secure storage and rotation of sensitive credentials without cloud dependencies

---

## Table of Contents

1. [Initial Setup](#initial-setup)
2. [Creating Secrets File](#creating-secrets-file)
3. [Backup & Recovery](#backup--recovery)
4. [Secret Rotation](#secret-rotation)
5. [PM2 Integration](#pm2-integration)
6. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### 1. Create Secure Directory

```bash
sudo mkdir -p /etc/titan
sudo chown ubuntu:ubuntu /etc/titan
chmod 700 /etc/titan
```

### 2. Create Empty Secrets File

```bash
touch /etc/titan/.env.prod
chmod 600 /etc/titan/.env.prod
```

**Permissions Explained:**
- `700` (directory): Only owner can read/write/execute
- `600` (file): Only owner can read/write, no one else

---

## Creating Secrets File

### Template

Edit `/etc/titan/.env.prod`:

```bash
# Server Configuration
NODE_ENV=production
PORT=5000
HOST=0.0.0.0
CORS_ORIGIN=https://www.zala.ir

# Database (PostgreSQL)
DATABASE_URL=postgresql://titan_user:STRONG_PASSWORD_HERE@localhost:5432/titan_prod
DB_HOST=localhost
DB_PORT=5432
DB_USER=titan_user
DB_PASSWORD=STRONG_PASSWORD_HERE
DB_NAME=titan_prod

# Redis
REDIS_URL=redis://localhost:6379

# JWT Secret (MUST be at least 32 characters)
JWT_SECRET=GENERATE_SECURE_RANDOM_STRING_AT_LEAST_32_CHARS

# Rate Limiting
RATE_LIMIT_BACKEND=redis
RATE_LIMIT_DEFAULT_POINTS=60
RATE_LIMIT_DEFAULT_DURATION=60

# Exchange Configuration
EXCHANGE_NAME=paper
# For live trading, add MEXC or other exchange credentials

# Logging
LOG_LEVEL=info
DEBUG_RATE_LIMIT=false
```

### Generate Strong Secrets

```bash
# Generate 64-character random string for JWT_SECRET
openssl rand -base64 48

# Or using /dev/urandom
head -c 32 /dev/urandom | base64

# Generate strong password for database
openssl rand -base64 24
```

### Validate Secrets File

```bash
# Check file permissions
ls -l /etc/titan/.env.prod
# Should show: -rw------- 1 ubuntu ubuntu

# Test loading (without exposing values)
set -a && source /etc/titan/.env.prod && set +a
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
# Verify JWT_SECRET length
echo ${#JWT_SECRET}  # Should be >= 32
```

---

## Backup & Recovery

### Option A: Using `age` (Recommended)

**Install age:**
```bash
sudo apt-get update && sudo apt-get install -y age
```

**Generate encryption key (one time):**
```bash
age-keygen -o /etc/titan/keys.txt
chmod 600 /etc/titan/keys.txt
```

**⚠️ CRITICAL: Backup `/etc/titan/keys.txt` to secure offline location!**

**Create encrypted backup:**
```bash
# Extract public key
PUBLIC_KEY=$(grep -m1 public /etc/titan/keys.txt | awk '{print $3}')

# Encrypt secrets file
age -r "$PUBLIC_KEY" \
  -o /etc/titan/.env.prod.age \
  /etc/titan/.env.prod

chmod 600 /etc/titan/.env.prod.age
```

**Recovery from backup:**
```bash
age -d -i /etc/titan/keys.txt \
  /etc/titan/.env.prod.age > /etc/titan/.env.prod
chmod 600 /etc/titan/.env.prod
```

### Option B: Using `gpg`

**Encrypt:**
```bash
gpg --symmetric --cipher-algo AES256 /etc/titan/.env.prod
# Enter strong passphrase when prompted
chmod 600 /etc/titan/.env.prod.gpg
```

**Decrypt:**
```bash
gpg -d /etc/titan/.env.prod.gpg > /etc/titan/.env.prod
chmod 600 /etc/titan/.env.prod
```

### Backup Schedule

**Automated daily backup:**
```bash
# Add to crontab: crontab -e
0 2 * * * /home/ubuntu/scripts/backup-secrets.sh
```

**Backup script** (`/home/ubuntu/scripts/backup-secrets.sh`):
```bash
#!/bin/bash
set -e

BACKUP_DIR="/var/backups/titan/secrets"
DATE=$(date +%Y%m%d_%H%M%S)
PUBLIC_KEY=$(grep -m1 public /etc/titan/keys.txt | awk '{print $3}')

mkdir -p "$BACKUP_DIR"

# Encrypt and backup
age -r "$PUBLIC_KEY" \
  -o "$BACKUP_DIR/.env.prod.$DATE.age" \
  /etc/titan/.env.prod

# Keep only last 7 days
find "$BACKUP_DIR" -name ".env.prod.*.age" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/.env.prod.$DATE.age"
```

Make executable:
```bash
chmod +x /home/ubuntu/scripts/backup-secrets.sh
```

---

## Secret Rotation

### When to Rotate

- **JWT_SECRET**: Every 90 days
- **Database passwords**: Every 6 months
- **API keys**: When compromised or every 90 days
- **Emergency**: Immediately if breach suspected

### Rotation Procedure (Zero Downtime)

#### 1. Prepare New Secret

```bash
# Generate new JWT secret
NEW_JWT_SECRET=$(openssl rand -base64 48)
echo "New JWT_SECRET: $NEW_JWT_SECRET"
# Store securely in password manager
```

#### 2. Backup Current Configuration

```bash
# Create timestamped backup
PUBLIC_KEY=$(grep -m1 public /etc/titan/keys.txt | awk '{print $3}')
age -r "$PUBLIC_KEY" \
  -o "/etc/titan/.env.prod.$(date +%Y%m%d_%H%M%S).age" \
  /etc/titan/.env.prod
```

#### 3. Update Secrets File

```bash
# Edit safely
nano /etc/titan/.env.prod

# Update JWT_SECRET line
# OLD: JWT_SECRET=old_secret_here
# NEW: JWT_SECRET=new_secret_here

# Verify permissions
chmod 600 /etc/titan/.env.prod
```

#### 4. Reload Application (Zero Downtime)

```bash
cd /home/ubuntu/Titan
pm2 reload titan-backend
```

**⚠️ Note:** `pm2 reload` performs rolling restart - instances restart one at a time, maintaining service availability.

#### 5. Verify Health

```bash
# Check PM2 status
pm2 status

# Test health endpoint
curl -i https://www.zala.ir/health

# Check logs for errors
pm2 logs titan-backend --lines 50 --nostream
```

#### 6. Create New Encrypted Backup

```bash
PUBLIC_KEY=$(grep -m1 public /etc/titan/keys.txt | awk '{print $3}')
age -r "$PUBLIC_KEY" \
  -o /etc/titan/.env.prod.age \
  /etc/titan/.env.prod
```

### Rotation Checklist

- [ ] Generate new secret value
- [ ] Backup current `.env.prod` (encrypted)
- [ ] Update `.env.prod` with new value
- [ ] Verify file permissions (600)
- [ ] `pm2 reload titan-backend`
- [ ] Check `pm2 status` (all online)
- [ ] Test `/health` endpoint
- [ ] Review logs (no errors)
- [ ] Create new encrypted backup
- [ ] Document rotation in change log

---

## PM2 Integration

### Configuration File

Create `/home/ubuntu/Titan/ecosystem.config.js`:

```javascript
require('dotenv').config({ path: '/etc/titan/.env.prod' });

module.exports = {
  apps: [{
    name: "titan-backend",
    script: "npm",
    args: "run start",
    instances: 2,
    exec_mode: "cluster",
    env: process.env,
    max_restarts: 10,
    error_file: "./logs/backend-error.log",
    out_file: "./logs/backend-out.log",
  }]
};
```

### Start/Reload Commands

```bash
# Initial start
cd /home/ubuntu/Titan
pm2 start ecosystem.config.js --env production
pm2 save

# Reload after secret rotation (zero downtime)
pm2 reload titan-backend

# Restart (brief downtime)
pm2 restart titan-backend

# Stop
pm2 stop titan-backend

# Delete
pm2 delete titan-backend
```

### Verify No Secret Leakage

```bash
# Check PM2 logs - should NOT contain actual secret values
pm2 logs titan-backend --lines 100 --nostream | grep -i "secret\|password\|key"

# Check process environment (only root can see)
sudo cat /proc/$(pm2 pid titan-backend)/environ | tr '\0' '\n' | grep JWT
```

---

## Troubleshooting

### Problem: Application Won't Start

**Symptom:** PM2 shows "errored" status

**Solution:**
```bash
# Check PM2 logs
pm2 logs titan-backend --lines 50

# Common issues:
# 1. Missing required secret
#    Fix: Add missing variable to .env.prod

# 2. Invalid secret format (JWT_SECRET < 32 chars)
#    Fix: Generate longer secret

# 3. Database connection failure
#    Fix: Verify DATABASE_URL format and credentials
```

### Problem: Secrets Not Loading

**Symptom:** Application uses default/fallback values

**Solution:**
```bash
# Verify .env.prod location
ls -la /etc/titan/.env.prod

# Check ecosystem.config.js path
cat ecosystem.config.js | grep dotenv

# Test manual load
node -e "require('dotenv').config({ path: '/etc/titan/.env.prod' }); console.log(process.env.NODE_ENV)"
```

### Problem: Permission Denied

**Symptom:** `EACCES` error reading secrets file

**Solution:**
```bash
# Fix ownership
sudo chown ubuntu:ubuntu /etc/titan/.env.prod

# Fix permissions
chmod 600 /etc/titan/.env.prod

# Verify
ls -la /etc/titan/.env.prod
# Should show: -rw------- 1 ubuntu ubuntu
```

### Problem: Backup Decryption Fails

**Symptom:** `age: decryption failed` or `gpg: decryption failed`

**Solution:**
```bash
# For age: Verify keys.txt exists and is readable
ls -la /etc/titan/keys.txt

# For gpg: Verify passphrase
gpg --list-keys

# Test with verbose output
age -d -v -i /etc/titan/keys.txt /etc/titan/.env.prod.age
```

---

## Security Best Practices

1. **Never commit secrets to git**
   - Verify `.gitignore` includes `.env*`
   - Use `git secrets` tool to scan

2. **Limit access**
   - Only ubuntu user and root can read
   - Use `sudo` for emergency access only

3. **Rotate regularly**
   - JWT_SECRET: 90 days
   - Passwords: 180 days
   - Immediately if compromised

4. **Monitor access**
   ```bash
   # Check who accessed secrets file
   sudo ausearch -f /etc/titan/.env.prod
   ```

5. **Backup encryption keys offline**
   - Store `keys.txt` in password manager
   - Print and store in safe
   - Test recovery procedure quarterly

---

## Emergency Procedures

### Suspected Compromise

1. **Immediate actions:**
   ```bash
   # Rotate ALL secrets immediately
   # Generate new values
   NEW_JWT=$(openssl rand -base64 48)
   NEW_DB_PASS=$(openssl rand -base64 24)
   
   # Update .env.prod
   nano /etc/titan/.env.prod
   
   # Reload
   pm2 reload titan-backend
   ```

2. **Investigation:**
   ```bash
   # Check access logs
   sudo last
   sudo lastlog
   
   # Check file access
   sudo ausearch -f /etc/titan/.env.prod
   
   # Review PM2 logs for suspicious activity
   pm2 logs titan-backend --lines 1000 | grep -i "unauthorized\|failed\|error"
   ```

3. **Post-incident:**
   - Document timeline
   - Update passwords on all related services
   - Review and tighten access controls
   - Consider 2FA for server access

---

## Appendix: Quick Reference

```bash
# Health check
curl -i https://www.zala.ir/health

# PM2 status
pm2 status

# View logs
pm2 logs titan-backend --lines 50

# Reload (zero downtime)
pm2 reload titan-backend

# Backup secrets
age -r "$(grep -m1 public /etc/titan/keys.txt | awk '{print $3}')" \
  -o /etc/titan/.env.prod.age /etc/titan/.env.prod

# Restore secrets
age -d -i /etc/titan/keys.txt /etc/titan/.env.prod.age > /etc/titan/.env.prod
chmod 600 /etc/titan/.env.prod
```

---

**Last Updated:** 2025-11-02  
**Version:** 1.0  
**Owner:** DevOps Team
