# GitHub Actions Setup for PR Tests

This guide shows you how to set up mandatory test checks for Pull Requests.

## ✅ What's Already Set Up

Three GitHub Actions workflows are configured:

### 1. **Required Tests** (Mandatory Check)
- **File:** `.github/workflows/required-tests.yml`
- **Runs:** All 130 tests
- **When:** On every PR and push to main
- **Status Check Name:** `All Tests Must Pass`
- **Purpose:** This is the check you'll make mandatory

### 2. **PR Tests** (Detailed Report)
- **File:** `.github/workflows/pr-tests.yml`
- **Runs:** All tests with coverage
- **When:** On every PR and push to main
- **Posts:** Comment on PR with results

### 3. **Test Suites** (Parallel Execution)
- **File:** `.github/workflows/test-suites.yml`
- **Runs:** Tests in parallel (faster)
- **When:** On every PR and push to main
- **Shows:** Individual suite results

## 🔧 Setting Up Branch Protection

### Step 1: Go to Repository Settings

1. Navigate to your repository on GitHub
2. Click **Settings** (top menu)
3. Click **Branches** (left sidebar)

### Step 2: Add Branch Protection Rule

1. Click **Add branch protection rule**
2. In **Branch name pattern**, enter: `main`

### Step 3: Configure Required Checks

Enable these settings:

- ✅ **Require a pull request before merging**
  - ☐ Require approvals: `0` (since you self-approve)
  - ✅ **Dismiss stale pull request approvals when new commits are pushed**

- ✅ **Require status checks to pass before merging**
  - ✅ **Require branches to be up to date before merging**
  - Search and add: `All Tests Must Pass`
  - Search and add: `Quick Test Check` (optional, for faster feedback)

- ✅ **Require conversation resolution before merging** (optional)

- ✅ **Do not allow bypassing the above settings**
  - ☐ Uncheck "Allow administrators to bypass" for strictest enforcement
  - ✅ Check this if you want to allow yourself to bypass in emergencies

### Step 4: Save

Click **Create** or **Save changes**

## 📋 How It Works

### When You Create a PR:

1. **GitHub Actions automatically runs** all test workflows
2. **You see 3 status checks:**
   - ✅ Required Tests (mandatory)
   - ✅ PR Tests (detailed)
   - ✅ Test Suites (parallel)

3. **If tests pass:**
   ```
   ✅ All Tests Must Pass — Passed (130/130 tests)
   ✅ PR Tests — Passed
   ✅ Test Suites (Parallel) — Passed
   ```
   **Merge button becomes available** ✅

4. **If tests fail:**
   ```
   ❌ All Tests Must Pass — Failed
   ```
   **Merge button is disabled** ❌

### Timeline:

```
Push to PR branch
    ↓
GitHub Actions triggers (automatic)
    ↓
Tests run (~2-3 minutes)
    ↓
Status checks update
    ↓
✅ Tests Pass → Can merge
❌ Tests Fail → Cannot merge (fix required)
```

## 🚀 Testing the Setup

### Test Locally First:

```bash
# Run the same command that CI uses
npm run test:ci
```

If this passes locally, it will pass in CI.

### Create a Test PR:

1. Create a new branch:
   ```bash
   git checkout -b test/verify-ci
   ```

2. Make a small change (add comment):
   ```bash
   echo "// Test CI" >> src/utils/storage.js
   git add .
   git commit -m "test: Verify CI workflow"
   git push -u origin test/verify-ci
   ```

3. Create PR on GitHub

4. Watch the checks run ✅

5. Close/delete the test PR when done

## 📊 Understanding Test Results

### In GitHub PR:

You'll see a comment like this:

```markdown
## Test Results Summary

| Test Suite | Status | Tests |
|------------|--------|-------|
| Storage | ✅ success | 45 tests |
| Screens | ✅ success | 85 tests |
| Volume Control | ✅ success | 43 tests |
| Brightness Control | ✅ success | 43 tests |

**Total:** 130 tests

✅ **All tests passed!** Ready to merge.
```

### Status Check Details:

Click "Details" next to any check to see:
- Full test output
- Coverage report
- Timing information
- Any errors or failures

## ⚙️ Customizing Workflows

### Make Tests Faster:

Edit `.github/workflows/required-tests.yml`:

```yaml
- name: Run all tests
  run: npm run test:ci
  # Change to:
  run: npm run test:serial  # More reliable
  # Or:
  run: npm test -- --maxWorkers=4  # Faster parallel
```

### Add Linting:

Add before tests in `required-tests.yml`:

```yaml
- name: Run linter
  run: npm run lint
```

### Require Coverage Threshold:

Edit `.github/workflows/required-tests.yml`:

```yaml
- name: Check coverage threshold
  run: |
    npm run test:coverage
    # Fail if coverage below 60%
    npx jest --coverage --coverageThreshold='{"global":{"lines":60}}'
```

## 🔍 Troubleshooting

### Tests Pass Locally But Fail in CI:

**Cause:** Environment differences

**Fix:**
```bash
# Run in CI mode locally
CI=true npm run test:ci
```

### Checks Don't Appear on PR:

**Cause:** Workflow file not in main branch

**Fix:**
1. Merge workflow files to main first
2. Then create feature PRs

### "Required Check Not Found":

**Cause:** Check name doesn't match

**Fix:**
- Check name in workflow: `name: All Tests Must Pass`
- Must match exactly in branch protection

### Merge Button Still Disabled:

**Possible causes:**
1. Check is still running (wait)
2. Check failed (fix tests)
3. Branch not up to date (update from main)
4. Missing required review (add approval)

**Fix:** Check PR status checks section for details

## 📱 Slack/Email Notifications

### Get Notified When Tests Fail:

**Option 1: GitHub Notifications**
- Settings → Notifications → Check "Actions"

**Option 2: Slack Integration**

Add to workflow:

```yaml
- name: Slack notification
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 🎯 Best Practices

### Before Creating PR:

```bash
# Always run tests first
npm run test:ci

# If all pass, create PR
git push
```

### During Development:

```bash
# Use watch mode
npm run test:watch

# Run specific suites
npm run test:storage
```

### Before Merging:

1. ✅ All checks pass
2. ✅ Code reviewed (or self-approved)
3. ✅ Branch up to date
4. ✅ Conflicts resolved

## 📖 Quick Reference

### Essential Commands:

```bash
# What CI runs
npm run test:ci

# Test locally
npm test

# Test specific suite
npm run test:storage

# Watch mode
npm run test:watch
```

### Workflow Files:

```
.github/workflows/
├── required-tests.yml    ← Main required check
├── pr-tests.yml         ← Detailed reporting
└── test-suites.yml      ← Parallel execution
```

### Status Check Names:

- `All Tests Must Pass` ← Make this required
- `Quick Test Check` ← Optional, faster
- Test job names appear as sub-checks

## 🚨 Emergency: Bypass Checks

If you absolutely must merge without tests passing:

### Option 1: Administrator Override

If you're an admin and allowed bypass:
1. Checks will show as failed
2. "Merge" button still appears
3. Click "Merge without waiting for requirements"

### Option 2: Temporarily Disable

1. Go to Settings → Branches
2. Edit protection rule
3. Uncheck "Require status checks"
4. Merge PR
5. **Re-enable immediately**

**⚠️ Not recommended** - fixes the symptom, not the problem

## ✅ Verification Checklist

After setup, verify:

- [ ] Workflow files committed to `main` branch
- [ ] Branch protection rule created for `main`
- [ ] "Require status checks" enabled
- [ ] "All Tests Must Pass" added as required check
- [ ] Test PR created successfully
- [ ] Checks ran automatically
- [ ] Merge blocked when checks pending/failed
- [ ] Merge allowed when checks passed

## 📚 Additional Resources

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Branch Protection Rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/about-protected-branches)
- [Status Checks](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/collaborating-on-repositories-with-code-quality-features/about-status-checks)

---

**Ready to enforce quality!** 🎉

All PRs will now require passing tests before merge.
