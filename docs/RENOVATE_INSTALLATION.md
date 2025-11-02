# 🤖 Renovate Bot Installation Guide

## Overview

Renovate is an automated dependency update tool that will keep your npm packages up-to-date with minimal manual intervention.

## Current Configuration

✅ `renovate.json` is already configured in the main branch with:

- **Schedule**: 21:00-06:00 Tehran time (nights only)
- **Production dependencies**: Manual review required
- **Dev dependencies (minor/patch)**: Auto-merge enabled
- **Security patches**: Auto-merge with high priority
- **Stability days**: 3 days minimum before updates
- **Grouped updates**: ESLint, TypeScript, Playwright packages
- **Lockfile maintenance**: Every Monday morning

## Installation Steps

### Option 1: GitHub App Installation (Recommended)

1. **Navigate to Renovate GitHub App**

   ```
   https://github.com/apps/renovate
   ```

2. **Click "Install" or "Configure"**
   - If you haven't installed Renovate before, click **"Install"**
   - If Renovate is already installed on your account, click **"Configure"**

3. **Select Repository**
   - Choose **"Only select repositories"**
   - Select: `raeisisep-star/Titan`
   - Click **"Install"** or **"Save"**

4. **Authorize the App**
   - Grant necessary permissions:
     - ✅ Read access to code
     - ✅ Read and write access to pull requests
     - ✅ Read access to security events
   - Click **"Authorize"**

5. **Wait for Onboarding PR**
   - Within 1-2 minutes, Renovate will create an onboarding PR
   - PR title: `Configure Renovate`
   - This PR will show you what Renovate will do
   - **Merge this PR** to activate Renovate

### Option 2: Self-Hosted Renovate (Advanced)

If you prefer to run Renovate on your own infrastructure:

```bash
# Using Docker
docker run --rm \
  -e RENOVATE_TOKEN="ghp_your_token_here" \
  -e RENOVATE_REPOSITORIES="raeisisep-star/Titan" \
  renovate/renovate:latest

# Using npm
npm install -g renovate
RENOVATE_TOKEN=ghp_your_token_here renovate raeisisep-star/Titan
```

## Verification

After installation, verify Renovate is working:

### 1. Check for Onboarding PR

```bash
gh pr list --author "renovate[bot]"
```

Expected output:

```
#XX  Configure Renovate  renovate/configure  OPEN
```

### 2. Check Renovate Dashboard

- Go to: `https://github.com/raeisisep-star/Titan/issues`
- Look for: **Dependency Dashboard** issue created by Renovate

### 3. Wait for First Dependency Update PRs

- Based on schedule: 21:00-06:00 Tehran time
- Check next day morning for automatic PRs

## What Renovate Will Do

### Automatic Actions (No Manual Intervention)

✅ **Dev dependencies (minor/patch updates)**

- Example: `jest 30.2.0` → `30.2.1`
- Auto-merged after 3 days stability

✅ **Security patches**

- Critical/High severity vulnerabilities
- Auto-merged immediately (no stability wait)

✅ **Lockfile maintenance**

- Every Monday morning before 6 AM
- Updates package-lock.json

### Manual Review Required

⚠️ **Production dependencies (any update)**

- Example: `@hono/node-server 1.19.5` → `1.20.0`
- Creates PR, waits for your approval

⚠️ **Dev dependencies (major updates)**

- Example: `jest 30.x` → `31.x`
- Breaking changes possible, needs review

⚠️ **Major version bumps**

- Any package going from `v1.x` → `v2.x`
- Requires manual testing

## Expected PR Volume

Based on your configuration:

- **Weekly**: 2-5 PRs (dev dependencies)
- **Monthly**: 5-10 PRs (production dependencies)
- **Security**: As needed (immediate)
- **Lockfile**: 1 PR every Monday

## Renovate Configuration File

Current `renovate.json` highlights:

```json
{
  "schedule": ["after 21:00 and before 06:00 on every weekday"],
  "timezone": "Asia/Tehran",
  "prHourlyLimit": 2,
  "prConcurrentLimit": 5,
  "minimumReleaseAge": "3 days",
  "stabilityDays": 3,
  "packageRules": [
    {
      "matchDepTypes": ["dependencies"],
      "automerge": false
    },
    {
      "matchDepTypes": ["devDependencies"],
      "matchUpdateTypes": ["minor", "patch"],
      "automerge": true
    }
  ]
}
```

## Troubleshooting

### Renovate Not Creating PRs?

1. **Check Installation**

   ```bash
   gh api repos/raeisisep-star/Titan/installation
   ```

2. **Check Logs**
   - Go to: https://app.renovatebot.com/dashboard
   - Login with GitHub
   - View logs for `raeisisep-star/Titan`

3. **Manual Trigger**
   - Go to repository settings
   - Find Renovate app
   - Click "Sync now"

### Too Many PRs?

Adjust `renovate.json`:

```json
{
  "prHourlyLimit": 1,
  "prConcurrentLimit": 2
}
```

### Want to Pause Renovate?

Create `.github/renovate.json5`:

```json5
{
  enabled: false,
}
```

## Support

- **Renovate Docs**: https://docs.renovatebot.com
- **GitHub Issues**: https://github.com/renovatebot/renovate/issues
- **Community**: https://github.com/renovatebot/renovate/discussions

## Post-Installation Checklist

After Renovate is installed and onboarding PR is merged:

- [ ] Merge onboarding PR
- [ ] Verify Dependency Dashboard issue exists
- [ ] Wait 24 hours for first PRs
- [ ] Review and merge first few PRs manually
- [ ] Monitor auto-merge behavior
- [ ] Adjust configuration if needed

---

**Status**: ⏳ Awaiting manual installation via GitHub App

**Installation URL**: https://github.com/apps/renovate

**Estimated Setup Time**: 5 minutes
