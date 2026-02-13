# Quick Reference: Branch Protection Settings

This document provides a quick reference for the branch protection settings used in the kids-guard-parental-control repository, to be replicated for the video-filter repository.

## Branch: `main`

### Protection Status
✅ **Protected**: Yes

### Settings Applied

#### 1. Require Pull Request Before Merging
- **Status**: Enabled
- **Required Approvals**: 1 (minimum)
- **Dismiss Stale Reviews**: Recommended (when new commits pushed)
- **Require Review from Code Owners**: Optional (if CODEOWNERS file exists)

#### 2. Require Status Checks to Pass Before Merging
- **Status**: Enabled
- **Require Branches to be Up to Date**: Enabled

**Required Status Checks**:
Based on the GitHub Actions workflows, configure these as required checks:

From `test-suites.yml`:
- ✅ `All Tests Passed ✅` (final aggregated check)

From `pr-tests.yml`:
- ✅ `Run All Tests`

From `required-tests.yml`:
- ✅ `Quick Test Check`

Individual test suite checks (optional, can use aggregated instead):
- `Storage Tests` → Adapt to `Core Tests` for video-filter
- `Screen Tests` → Adapt to `UI Tests` for video-filter
- `Volume Control Tests` → Adapt to `Video Filter Tests`
- `Brightness Control Tests` → Can be removed or replaced

**Recommendation**: Use the aggregated check `All Tests Passed ✅` as the required status check for cleaner PR interface.

#### 3. Require Conversation Resolution Before Merging
- **Status**: Recommended
- **Effect**: All PR review comments must be resolved before merge

#### 4. Require Signed Commits
- **Status**: Optional (not required in source repo, but recommended for security)
- **Effect**: All commits must be signed with GPG/SSH keys

#### 5. Require Linear History
- **Status**: Optional
- **Effect**: Prevents merge commits, enforces rebase or squash merge

#### 6. Include Administrators
- **Status**: Recommended
- **Effect**: Rules apply to repository administrators too

#### 7. Restrict Who Can Push
- **Status**: Optional
- **Effect**: Limit direct pushes to specific users/teams

#### 8. Allow Force Pushes
- **Status**: Disabled (default)
- **Effect**: Prevents force pushes to main branch

#### 9. Allow Deletions
- **Status**: Disabled (default)
- **Effect**: Prevents branch deletion

## GitHub Actions Workflow Status Checks

### Current Workflows (kids-guard-parental-control)

1. **pr-tests.yml**
   - Trigger: PR to main, push to main
   - Job Name: `Run All Tests`
   - Actions: Checkout, Setup Node, Install deps, Run tests, Upload coverage, Comment PR
   - Required Check: ✅

2. **test-suites.yml**
   - Trigger: PR to main, push to main
   - Jobs: 
     - `Storage Tests`
     - `Screen Tests`
     - `Volume Control Tests`
     - `Brightness Control Tests`
     - `All Tests Passed ✅` (aggregates above)
   - Required Check: `All Tests Passed ✅`

3. **required-tests.yml**
   - Trigger: PR to main, push to main
   - Job: `Quick Test Check` (matrix strategy)
   - Actions: Fast parallel test execution
   - Required Check: ✅

4. **deploy-playstore.yml** (not shown in detail)
   - Trigger: Manual or on release
   - Purpose: Deployment to Google Play Store
   - Required Check: ❌ (not required for PRs)

### Adapted Workflows for video-filter

1. **pr-tests.yml** - Keep as is
2. **test-suites.yml** - Replace test suite jobs:
   - `Storage Tests` → `Core Tests`
   - `Screen Tests` → `UI Tests`
   - `Volume Control Tests` → `Video Filter Tests`
   - `Brightness Control Tests` → Remove or replace
3. **required-tests.yml** - Update matrix suite names
4. **deploy-playstore.yml** - Skip or adapt for video-filter deployment

## Repository Settings Summary

### General Settings
- Issues: ✅ Enabled
- Projects: Optional
- Wiki: Optional
- Discussions: Optional

### Pull Request Settings
- Allow merge commits: ✅
- Allow squash merging: ✅ (recommended as default)
- Allow rebase merging: ✅
- Always suggest updating PR branches: ✅
- Allow auto-merge: ✅
- Automatically delete head branches: ✅

### Code Security Settings
- Dependency graph: ✅
- Dependabot alerts: ✅
- Dependabot security updates: ✅
- Code scanning: Optional
- Secret scanning: ✅ (automatic for public repos)

### Actions Settings
- Actions permissions: Allow all actions
- Workflow permissions: Read and write
- Allow GitHub Actions to create/approve PRs: ✅

## Configuration Commands (Using GitHub CLI)

If you have GitHub CLI (`gh`) installed, you can configure some settings via command line:

```bash
# Enable branch protection (basic)
gh api repos/{owner}/{repo}/branches/main/protection \
  -X PUT \
  -H "Accept: application/vnd.github.v3+json" \
  -f "required_status_checks[strict]=true" \
  -f "required_status_checks[contexts][]=All Tests Passed ✅" \
  -f "enforce_admins=true" \
  -f "required_pull_request_reviews[required_approving_review_count]=1"

# Note: Full configuration is easier through the GitHub web interface
```

## Manual Configuration Steps

1. **Go to Repository Settings**
   - Navigate to: `https://github.com/{owner}/video-filter/settings`

2. **Navigate to Branches**
   - Settings → Branches → Branch protection rules

3. **Add Rule for Main**
   - Branch name pattern: `main`
   - Apply all settings listed above

4. **Configure Required Status Checks**
   - After first PR creates the workflows
   - The status checks will appear in the list
   - Select the required ones

5. **Save Changes**
   - Click "Create" or "Save changes"

## Verification Steps

After configuration:

1. ✅ Create a test PR
2. ✅ Verify status checks appear and run
3. ✅ Verify PR cannot be merged until checks pass
4. ✅ Verify approval is required
5. ✅ Try to push directly to main (should fail)
6. ✅ Verify conversation resolution requirement

## Differences from Parent Repository

The video-filter repository should adapt:
- Test suite names (storage/volume/brightness → core/filters/ui)
- Number of tests in documentation
- Deployment workflows (if needed)
- Test coverage targets (if different)

## Additional Resources

- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)
