# Renovate Bot Setup Guide

Renovate automatically creates PRs to update dependencies, keeping your project secure and up-to-date.

## Quick Setup

### 1. Install Renovate GitHub App

Visit: https://github.com/apps/renovate

1. Click "Install"
2. Select "Only select repositories"
3. Choose `raeisisep-star/Titan`
4. Click "Install"

### 2. Enable Renovate

After merging this PR, Renovate will:
- Create an onboarding PR
- Start monitoring dependencies
- Create update PRs according to `renovate.json` config

## Configuration Overview

### Schedule
- **Timing**: After 21:00 and before 06:00 (Tehran timezone)
- **Days**: Weekdays only (Mon-Fri)
- **Why**: Avoids disrupting work hours

### Update Strategy

#### Production Dependencies (`dependencies`)
- ❌ **Not automerged** - Requires manual review
- ✅ Grouped together
- ⏳ 3-day stability period

**Example PR:**
```
chore(deps): update production dependencies
- axios 1.5.0 → 1.5.1
- hono 4.0.0 → 4.0.1
```

#### Dev Dependencies (`devDependencies`)
**Minor/Patch Updates:**
- ✅ **Automerged** to branch
- ⚡ Fast updates
- 🔒 Stabilized for 3 days

**Major Updates:**
- ❌ **Not automerged** - Requires review
- 🚨 May have breaking changes

### Security Patches
- 🚨 **High priority**
- ✅ Automerged immediately
- ⏳ 0-day stability (urgent)

### Grouping

Dependencies are grouped for easier review:

| Group | Packages | Automerge |
|-------|----------|-----------|
| Production deps | All `dependencies` | ❌ No |
| DevDeps (minor/patch) | All `devDependencies` | ✅ Yes |
| DevDeps (major) | Major version bumps | ❌ No |
| Security patches | All packages | ✅ Yes |
| ESLint packages | `eslint*`, `@typescript-eslint/*` | By type |
| TypeScript packages | `typescript`, `@types/*` | By type |
| Playwright packages | `@playwright/*` | By type |

### Rate Limits
- **Hourly**: 2 PRs max
- **Concurrent**: 5 PRs max
- **Why**: Prevents PR spam

### Lockfile Maintenance
- **Schedule**: Mondays before 6 AM
- **Purpose**: Keep `package-lock.json` fresh
- **Benefit**: Fixes transitive dependency issues

## How It Works

### Typical Week with Renovate

**Monday Morning:**
- Renovate checks for updates (overnight)
- Creates PRs for outdated dependencies
- Automerges dev dependencies (minor/patch)

**During Week:**
- You review production dependency PRs
- CI runs on all PRs (Build, Lint, Test)
- Merge when comfortable

**Example PR Flow:**

```
Day 1: Renovate creates PR
       ├─ CI runs (Build ✅, Lint ✅, Test ✅)
       ├─ Waits 3 days (stability period)
       └─ If it's devDependency minor/patch: Automerges

Day 4: If it's production dependency: 
       └─ Waits for your manual review
```

## Reviewing Renovate PRs

### Checklist

- [ ] CI is passing (Build, Lint, Test)
- [ ] Check changelog/release notes
- [ ] No breaking changes
- [ ] Review dependency changes in PR description
- [ ] Check for security advisories

### Quick Review

```bash
# Check what changed
gh pr view <PR_NUMBER> --json body --jq '.body'

# Check CI status
gh pr checks <PR_NUMBER>

# Merge if looks good
gh pr merge <PR_NUMBER> --squash
```

## Renovate PR Labels

| Label | Meaning |
|-------|---------|
| `dependencies` | Dependency update |
| `renovate` | Created by Renovate |
| `security` | Security vulnerability fix |

## Troubleshooting

### Too Many PRs
Increase `minimumReleaseAge` in `renovate.json`:
```json
{
  "minimumReleaseAge": "7 days"
}
```

### Want Manual Control
Disable automerge for devDependencies:
```json
{
  "packageRules": [{
    "matchDepTypes": ["devDependencies"],
    "automerge": false
  }]
}
```

### Renovate Not Running
1. Check GitHub Actions tab for Renovate runs
2. Verify Renovate app is installed
3. Check `renovate.json` syntax (use schema validation)

### Emergency: Pause Renovate
Add to `renovate.json`:
```json
{
  "enabled": false
}
```

## Best Practices

✅ **DO:**
- Review production dependency updates carefully
- Check changelogs for breaking changes
- Keep `renovate.json` up-to-date
- Monitor automerged PRs (check CI)

❌ **DON'T:**
- Ignore security patches
- Blindly merge major version updates
- Disable Renovate permanently
- Skip CI checks

## Advanced Configuration

### Pin Specific Package
```json
{
  "packageRules": [{
    "matchPackageNames": ["@cloudflare/workers-types"],
    "enabled": false
  }]
}
```

### Update Specific Package More Frequently
```json
{
  "packageRules": [{
    "matchPackageNames": ["axios"],
    "schedule": ["at any time"],
    "minimumReleaseAge": "0 days"
  }]
}
```

### Exclude Package from Updates
```json
{
  "packageRules": [{
    "matchPackageNames": ["legacy-package"],
    "enabled": false
  }]
}
```

## Monitoring

### Renovate Dashboard
Check: https://github.com/raeisisep-star/Titan/issues

Renovate creates a dashboard issue showing:
- Pending updates
- Suppressed PRs
- Configuration warnings

### Renovate Logs
Check: https://github.com/raeisisep-star/Titan/actions

Look for "Renovate" workflow runs to debug issues.

## Related

- Renovate Docs: https://docs.renovatebot.com/
- Renovate Config Reference: https://docs.renovatebot.com/configuration-options/
- Renovate GitHub App: https://github.com/apps/renovate
