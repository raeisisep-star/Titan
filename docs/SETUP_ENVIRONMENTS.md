# GitHub Environments and Secrets Setup Guide

راهنمای کامل برای ساخت Environments در GitHub و تنظیم Secrets برای هر محیط.

## فهرست مطالب

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Create Environments](#create-environments)
4. [Configure Secrets](#configure-secrets)
5. [SSH Key Generation](#ssh-key-generation)
6. [Security Best Practices](#security-best-practices)
7. [Verification](#verification)
8. [Troubleshooting](#troubleshooting)

## Overview

GitHub Environments allow you to:
- ✅ Separate staging and production configurations
- ✅ Require manual approval for production deployments
- ✅ Protect sensitive secrets per environment
- ✅ Control who can deploy to each environment

## Prerequisites

- Repository admin access
- GitHub repository: `raeisisep-star/Titan`
- SSH access to servers (188.40.209.82)
- Database credentials for both environments

## Create Environments

### Step 1: Navigate to Environments

1. Go to repository: https://github.com/raeisisep-star/Titan
2. Click **Settings** tab
3. In left sidebar, click **Environments**
4. Click **New environment**

### Step 2: Create Staging Environment

1. Environment name: `staging`
2. Click **Configure environment**
3. **Deployment branches**: Select "Selected branches" → Add rule: `main`
4. **Environment protection rules**:
   - **DO NOT** check "Required reviewers" (staging auto-deploys)
   - **DO NOT** set wait timer
5. Click **Save protection rules**

### Step 3: Create Production Environment

1. Click **New environment** again
2. Environment name: `production`
3. Click **Configure environment**
4. **Deployment branches**: Select "Selected branches" → Add rule: `main` and tags matching `v*.*.*`
5. **Environment protection rules**:
   - ✅ **Required reviewers**: Add 1-2 trusted team members
   - ⚠️ Wait timer: Optional (e.g., 5 minutes to review before deployment)
6. Click **Save protection rules**

## Configure Secrets

### Staging Environment Secrets

Go to **Environments** → **staging** → **Add secret**

#### Required Secrets:

```yaml
Name: STAGING_SSH_HOST
Value: 188.40.209.82
Description: Staging server IP address

Name: STAGING_SSH_USER
Value: ubuntu
Description: SSH username for staging server

Name: STAGING_SSH_KEY
Value: (paste full SSH private key in PEM format)
Description: SSH private key for staging authentication

Name: STAGING_PROJECT_DIR
Value: /home/ubuntu/Titan-staging
Description: Project directory path on staging server

Name: STAGING_NODE_ENV
Value: staging
Description: Node environment variable

Name: STAGING_ENV_FILE
Value: (optional - full .env file content)
Description: Complete .env file for staging (if managed via GitHub)
```

#### Example STAGING_ENV_FILE Content:

```env
NODE_ENV=staging
PORT=5001
DATABASE_URL=postgresql://user:password@localhost:5432/titan_staging
REDIS_URL=redis://localhost:6379/1
JWT_SECRET=your_staging_jwt_secret_32_chars_min
EXCHANGE_NAME=paper
TELEGRAM_ALERT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

### Production Environment Secrets

Go to **Environments** → **production** → **Add secret**

#### Required Secrets:

```yaml
Name: PROD_SSH_HOST
Value: 188.40.209.82
Description: Production server IP address

Name: PROD_SSH_USER
Value: ubuntu
Description: SSH username for production server

Name: PROD_SSH_KEY
Value: (paste DIFFERENT SSH private key - separate from staging!)
Description: SSH private key for production authentication

Name: PROD_PROJECT_DIR
Value: /home/ubuntu/Titan
Description: Project directory path on production server

Name: PROD_NODE_ENV
Value: production
Description: Node environment variable

Name: PROD_ENV_FILE
Value: (optional - full .env file content)
Description: Complete .env file for production (if managed via GitHub)

Name: TELEGRAM_ALERT_TOKEN
Value: your_telegram_bot_token
Description: Telegram bot token for deployment notifications

Name: TELEGRAM_CHAT_ID
Value: your_telegram_chat_id
Description: Telegram chat ID for notifications
```

#### Example PROD_ENV_FILE Content:

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/titan_production
REDIS_URL=redis://localhost:6379/0
JWT_SECRET=your_production_jwt_secret_different_from_staging
EXCHANGE_NAME=binance
EXCHANGE_API_KEY=your_real_api_key
EXCHANGE_API_SECRET=your_real_api_secret
TELEGRAM_ALERT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

## SSH Key Generation

### Generate Staging SSH Key

```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -f ~/.ssh/titan_staging -N ""

# This creates two files:
# - ~/.ssh/titan_staging (private key - add to GitHub Secret)
# - ~/.ssh/titan_staging.pub (public key - add to server)

# Copy public key to staging server
ssh-copy-id -i ~/.ssh/titan_staging.pub ubuntu@188.40.209.82

# Or manually:
cat ~/.ssh/titan_staging.pub
# Copy output and add to server: echo "KEY_CONTENT" >> ~/.ssh/authorized_keys

# View private key to add to GitHub Secret
cat ~/.ssh/titan_staging
# Copy entire output including BEGIN and END lines
```

### Generate Production SSH Key (SEPARATE!)

```bash
# Generate DIFFERENT key for production
ssh-keygen -t rsa -b 4096 -f ~/.ssh/titan_production -N ""

# Copy to production server
ssh-copy-id -i ~/.ssh/titan_production.pub ubuntu@188.40.209.82

# View private key
cat ~/.ssh/titan_production
# Copy to PROD_SSH_KEY secret in GitHub
```

### Test SSH Keys

```bash
# Test staging key
ssh -i ~/.ssh/titan_staging ubuntu@188.40.209.82 "echo 'Staging SSH works!'"

# Test production key
ssh -i ~/.ssh/titan_production ubuntu@188.40.209.82 "echo 'Production SSH works!'"
```

## Security Best Practices

### ✅ DO:

1. **Separate Keys**: Use different SSH keys for staging and production
2. **Separate Secrets**: Use different JWT secrets, API keys
3. **Rotate Regularly**: Change secrets every 90 days
4. **Least Privilege**: Only give access to those who need it
5. **Audit Logs**: Review who deployed what and when
6. **Backup Secrets**: Store secrets securely offline (password manager)

### ❌ DON'T:

1. **Share Keys**: Never share SSH keys between environments
2. **Commit Secrets**: Never commit secrets to repository
3. **Reuse Passwords**: Don't use same secrets in staging and production
4. **Public Repos**: Be extra careful with public repositories
5. **Screenshot Secrets**: Avoid capturing secrets in images

## Verification

### Check Environments are Created

```bash
# Using GitHub CLI
gh api repos/raeisisep-star/Titan/environments | jq '.environments[].name'

# Expected output:
# "staging"
# "production"
```

### Check Secrets are Set

```bash
# Staging secrets
gh api repos/raeisisep-star/Titan/environments/staging/secrets | jq '.secrets[].name'

# Expected:
# STAGING_SSH_HOST
# STAGING_SSH_USER
# STAGING_SSH_KEY
# ...

# Production secrets
gh api repos/raeisisep-star/Titan/environments/production/secrets | jq '.secrets[].name'
```

### Test Deployment Workflow

Create a test PR to verify workflows can access secrets:

```yaml
# .github/workflows/test-secrets.yml
name: Test Secrets
on: workflow_dispatch

jobs:
  test-staging:
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - run: |
          echo "Host: ${{ secrets.STAGING_SSH_HOST }}"
          echo "User: ${{ secrets.STAGING_SSH_USER }}"
          echo "Key length: ${#STAGING_SSH_KEY}"
        env:
          STAGING_SSH_KEY: ${{ secrets.STAGING_SSH_KEY }}
```

## Troubleshooting

### Problem: Can't find Environments in Settings

**Solution**: Environments feature requires:
- GitHub Free/Pro/Team/Enterprise
- Repository settings access
- May not be available for forks

### Problem: Secrets not accessible in workflow

**Solution**:
1. Verify secret name matches exactly (case-sensitive)
2. Check workflow uses correct environment name
3. Ensure workflow is triggered correctly
4. Review GitHub Actions logs for access errors

### Problem: SSH connection fails in workflow

**Solution**:
```bash
# Verify SSH key format
# Should look like:
-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAACFwAAAAdz...
...
-----END OPENSSH PRIVATE KEY-----

# Check key has correct permissions on server
ssh ubuntu@188.40.209.82 "cat ~/.ssh/authorized_keys | grep 'titan'"

# Test key manually
ssh -i ~/.ssh/titan_staging ubuntu@188.40.209.82
```

### Problem: Production deployment doesn't require approval

**Solution**:
1. Go to **Environments** → **production**
2. Check "Required reviewers" is enabled
3. Add at least one reviewer
4. Save protection rules
5. Test with a new deployment

### Problem: Can't update secrets

**Solution**:
- Secrets can't be viewed after creation (by design)
- To update: Delete old secret and create new one with same name
- Or use GitHub CLI: `gh secret set SECRET_NAME -R raeisisep-star/Titan`

## Secret Management Tips

### Using GitHub CLI

```bash
# Set staging secret from file
gh secret set STAGING_SSH_KEY -R raeisisep-star/Titan -e staging < ~/.ssh/titan_staging

# Set from stdin
echo "my_secret_value" | gh secret set SECRET_NAME -R raeisisep-star/Titan -e production

# List secrets
gh secret list -R raeisisep-star/Titan -e staging

# Delete secret
gh secret remove SECRET_NAME -R raeisisep-star/Titan -e staging
```

### Secret Rotation Checklist

Every 90 days:

- [ ] Generate new SSH keys
- [ ] Update STAGING_SSH_KEY and PROD_SSH_KEY
- [ ] Generate new JWT secrets
- [ ] Update STAGING_ENV_FILE and PROD_ENV_FILE
- [ ] Test deployments with new secrets
- [ ] Remove old keys from server
- [ ] Update documentation with rotation date

## Summary

✅ Two environments created (staging, production)  
✅ Staging: No approval required, auto-deploy  
✅ Production: Manual approval required, tag-based  
✅ All secrets configured per environment  
✅ Separate SSH keys for security  
✅ Ready for CI/CD workflows  

Your GitHub Environments are now configured and secure! 🔒
