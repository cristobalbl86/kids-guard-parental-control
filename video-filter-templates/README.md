# Video Filter Repository Templates

This directory contains template files and documentation for setting up a new `video-filter` repository with the same branch protection rules and CI/CD configuration as `kids-guard-parental-control`.

## 📁 Contents

### Documentation
- **`BRANCH_PROTECTION_QUICK_REFERENCE.md`** - Quick reference for branch protection settings
- This README file

### Template Files
- **`.github/workflows/`** - GitHub Actions workflow files
  - `pr-tests.yml` - Main PR test workflow
  - `test-suites.yml` - Parallel test suite execution
  - `required-tests.yml` - Fast-fail test checks
- **`.github/pull_request_template.md`** - Standardized PR template
- **`.gitignore`** - Git ignore rules for Node.js projects
- **`package.json`** - NPM package configuration with test scripts
- **`CONTRIBUTING.md`** - Contribution guidelines

### Automation
- **`setup.sh`** - Automated setup script (Linux/macOS)

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)

Run the setup script to automatically configure the new repository:

```bash
# From the kids-guard-parental-control directory
./video-filter-templates/setup.sh
```

The script will:
1. Prompt for repository details
2. Create/clone the video-filter repository
3. Copy all template files
4. Initialize git if needed
5. Create initial commit
6. Optionally push to remote

### Option 2: Manual Setup

1. **Create the repository on GitHub**
   - Go to https://github.com/new
   - Name: `video-filter`
   - Do not initialize with README

2. **Clone and setup locally**
   ```bash
   # Clone the new repository
   git clone https://github.com/[your-username]/video-filter.git
   cd video-filter
   
   # Copy template files from kids-guard-parental-control
   cp -r ../kids-guard-parental-control/video-filter-templates/.github .
   cp ../kids-guard-parental-control/video-filter-templates/.gitignore .
   cp ../kids-guard-parental-control/video-filter-templates/package.json .
   cp ../kids-guard-parental-control/video-filter-templates/CONTRIBUTING.md .
   ```

3. **Commit and push**
   ```bash
   git add .
   git commit -m "Initial commit: Setup repository structure"
   git push origin main
   ```

4. **Configure branch protection** (see below)

## 🔒 Branch Protection Configuration

After pushing the initial code:

1. Navigate to: `Settings` → `Branches` → `Add branch protection rule`

2. **Branch name pattern:** `main`

3. **Enable these settings:**
   - ✅ Require a pull request before merging
     - Required approvals: 1
   - ✅ Require status checks to pass before merging
     - ✅ Require branches to be up to date
     - Required checks:
       - `All Tests Passed ✅`
       - `Run All Tests`
       - `Quick Test Check`
   - ✅ Require conversation resolution before merging
   - ✅ Include administrators

4. Click **Create** or **Save changes**

> **Note:** Required status checks will only appear after the workflows have run at least once. Create a test PR to trigger them.

## 📋 Configuration Checklist

Use this checklist when setting up the video-filter repository:

### Repository Setup
- [ ] Repository created on GitHub
- [ ] Repository cloned locally
- [ ] Template files copied
- [ ] Initial commit created and pushed

### GitHub Actions
- [ ] `.github/workflows/pr-tests.yml` in place
- [ ] `.github/workflows/test-suites.yml` in place
- [ ] `.github/workflows/required-tests.yml` in place
- [ ] Workflows running successfully (check Actions tab)

### Branch Protection
- [ ] Main branch protection rule created
- [ ] Pull request required before merge
- [ ] At least 1 approval required
- [ ] Status checks required:
  - [ ] All Tests Passed ✅
  - [ ] Run All Tests
  - [ ] Quick Test Check
- [ ] Conversation resolution required
- [ ] Rules apply to administrators

### Repository Settings
- [ ] Issues enabled
- [ ] Allow squash merging
- [ ] Auto-delete head branches enabled
- [ ] Dependabot alerts enabled
- [ ] Dependabot security updates enabled

### Documentation
- [ ] README.md customized for video-filter
- [ ] CONTRIBUTING.md reviewed
- [ ] PR template in place

### Testing
- [ ] Test PR created and verified
- [ ] All status checks running
- [ ] Cannot merge without passing checks
- [ ] Cannot merge without approval

## 🔄 Adapting for Video Filter

The templates are pre-configured for a video-filter application but may need customization:

### Test Suites
Current template includes:
- Core Tests (`test:core`)
- Video Filter Tests (`test:filters`)
- UI Tests (`test:ui`)

Modify `.github/workflows/test-suites.yml` if you need different test suites.

### Package Scripts
Update `package.json` scripts to match your actual test structure:
```json
{
  "scripts": {
    "test:core": "jest --testPathPattern=core",
    "test:filters": "jest --testPathPattern=filters",
    "test:ui": "jest --testPathPattern=ui"
  }
}
```

## 📖 Detailed Documentation

For comprehensive setup instructions, see:
- **`../VIDEO_FILTER_REPOSITORY_SETUP.md`** - Complete setup guide with all details
- **`BRANCH_PROTECTION_QUICK_REFERENCE.md`** - Quick reference for branch protection

## ❓ Troubleshooting

### Workflows not appearing as status checks
1. Make sure workflows have run at least once
2. Create a test PR to trigger them
3. Check the Actions tab for any errors
4. Verify workflow files are in `.github/workflows/` directory

### Cannot push to main
This is expected! Branch protection is working.
1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and commit
3. Push: `git push origin feature/my-feature`
4. Create a PR on GitHub

### Setup script fails
1. Ensure you're in the `kids-guard-parental-control` directory
2. Check that `video-filter-templates/` directory exists
3. Make script executable: `chmod +x video-filter-templates/setup.sh`
4. Run with bash: `bash video-filter-templates/setup.sh`

## 🔗 Related Documentation

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [GitHub Actions](https://docs.github.com/en/actions)
- [Required Status Checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches#require-status-checks-before-merging)

## 📝 Notes

- The templates are based on the `kids-guard-parental-control` repository structure
- Main branch protection includes requirement for status checks to pass
- All workflows use Node.js 18.x
- Test naming and structure can be customized for your specific needs

## 🎯 Summary

This template package provides everything needed to create a `video-filter` repository with:
- ✅ Same branch protection rules as kids-guard-parental-control
- ✅ GitHub Actions CI/CD workflows
- ✅ Required status checks for PRs
- ✅ Professional repository structure
- ✅ Contribution guidelines
- ✅ Automated setup option

Follow the Quick Start guide above to get started! 🚀
