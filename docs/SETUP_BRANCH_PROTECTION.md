# Branch Protection Setup Guide

This guide explains how to configure branch protection rules for the `main` branch through GitHub's web interface.

## Why Branch Protection?

Branch protection ensures:
- ✅ All code goes through Pull Request review
- ✅ CI tests must pass before merging
- ✅ At least one team member approves changes
- ✅ No direct pushes to main branch
- ✅ Consistent code quality and security

## Prerequisites

- Repository admin access
- GitHub repository: `raeisisep-star/Titan`

## Step-by-Step Configuration

### Step 1: Navigate to Settings

1. Go to your GitHub repository: https://github.com/raeisisep-star/Titan
2. Click on **Settings** tab (top right)
3. In the left sidebar, click **Branches**
4. Under "Branch protection rules", click **Add rule** or **Add branch protection rule**

### Step 2: Configure Rule Pattern

1. In the "Branch name pattern" field, enter: `main`
2. This will protect the main branch

### Step 3: Enable Required Settings

#### ✅ Protect matching branches

- [x] **Require a pull request before merging**
  - [x] Require approvals: **1**
  - [x] Dismiss stale pull request approvals when new commits are pushed
  - [x] Require review from Code Owners (if CODEOWNERS file exists)

#### ✅ Require status checks to pass before merging

- [x] **Require status checks to pass before merging**
  - [x] Require branches to be up to date before merging
  - Status checks that are required:
    - `backend` (from ci.yml)
    - `Contract Tests (Isolated Environment)` (from ci.yml)
    - `Integration Tests` (from ci.yml)
    - `Code Quality Checks` (from ci.yml)
    - `Security Scan` (from ci.yml)
    - `Build Check` (from ci.yml)

**Note**: Status checks will appear in the list after the first CI run. You can add them after creating your first PR.

#### ✅ Require conversation resolution before merging

- [x] **Require conversation resolution before merging**
  - All review comments must be resolved before merge

#### ✅ Do not allow bypassing the above settings

- [x] **Include administrators**
  - Enforce all configured restrictions for administrators too

#### ⚠️ Optional but Recommended

- [ ] Require signed commits (if you have GPG keys configured)
- [ ] Require linear history (no merge commits, only squash/rebase)
- [ ] Lock branch (prevent all pushes - only for emergency use)

### Step 4: Save Changes

1. Scroll to the bottom
2. Click **Create** or **Save changes**

## Verification

After setting up branch protection, verify it works:

### Test 1: Try Direct Push (Should Fail)

```bash
# This should be rejected
git checkout main
git commit --allow-empty -m "test: direct push"
git push origin main

# Expected error:
# remote: error: GH006: Protected branch update failed for refs/heads/main.
```

### Test 2: Create PR (Should Work)

```bash
# Create feature branch
git checkout -b test-branch-protection
git commit --allow-empty -m "test: branch protection"
git push origin test-branch-protection

# Create PR through GitHub UI
# CI should run automatically
# Merge should require approval
```

## Status Checks Configuration

After your first CI run, add required status checks:

1. Go to **Settings** > **Branches** > Edit the `main` rule
2. Search for status checks in the list:
   - `backend`
   - `Contract Tests (Isolated Environment)`
   - `Integration Tests`
   - `Code Quality Checks`
   - `Security Scan`
   - `Build Check`
3. Check each one to make it required
4. Save changes

## Troubleshooting

### Problem: Can't find status checks in the list

**Solution**: Status checks only appear after they've run at least once. Create a test PR first, let CI run, then add the status checks.

### Problem: Administrators can still bypass

**Solution**: Make sure "Include administrators" is checked in the branch protection settings.

### Problem: PR can be merged without approval

**Solution**: Verify "Require approvals: 1" is set under "Require a pull request before merging".

### Problem: Status checks not running

**Solution**: 
1. Check `.github/workflows/ci.yml` exists
2. Verify workflow file syntax is correct
3. Check GitHub Actions is enabled in repository settings
4. Review Actions tab for error messages

## Best Practices

### For Administrators

- ✅ Don't bypass branch protection (even though you can)
- ✅ Lead by example - use PRs for your changes too
- ✅ Review and approve PRs promptly
- ✅ Keep status checks updated as CI evolves

### For Developers

- ✅ Always work in feature branches
- ✅ Create PRs for all changes
- ✅ Ensure CI passes before requesting review
- ✅ Address review comments promptly
- ✅ Keep PRs small and focused

### For Reviewers

- ✅ Check that CI has passed
- ✅ Review code for security issues
- ✅ Verify no secrets are exposed
- ✅ Test changes locally if possible
- ✅ Provide constructive feedback

## Emergency Procedures

If you need to make an urgent fix and bypass protection:

1. **DON'T** disable branch protection
2. **DO** use the proper workflow:
   - Create hotfix branch
   - Make minimal changes
   - Create PR with "HOTFIX" label
   - Get expedited review (still required)
   - Merge after approval and CI pass

Only repository owners should temporarily disable protection in true emergencies (production down, security breach).

## Related Documentation

- [GitHub Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
- [Pull Request Reviews](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews)

## Summary

✅ Branch protection is now configured  
✅ All changes require PR + review + CI pass  
✅ Main branch is protected from direct pushes  
✅ Code quality is enforced automatically  

Your repository is now following best practices for collaborative development!
