# Video Filter Repository Setup Guide

This guide provides step-by-step instructions to create a new repository called `video-filter` with the same branch protection rules and GitHub Actions configuration as `kids-guard-parental-control`.

## Table of Contents
- [Repository Creation](#repository-creation)
- [Branch Protection Rules](#branch-protection-rules)
- [GitHub Actions Workflows](#github-actions-workflows)
- [Repository Settings](#repository-settings)
- [Initial Setup](#initial-setup)

## Repository Creation

### Step 1: Create the Repository

1. Go to GitHub and click "New repository" or visit: https://github.com/new
2. Set the following details:
   - **Repository name:** `video-filter`
   - **Description:** Add an appropriate description for your video filtering application
   - **Visibility:** Choose Public or Private based on your needs
   - **Initialize with:** Do NOT initialize with README, .gitignore, or license (we'll add these manually)

3. Click "Create repository"

### Step 2: Clone the Repository

```bash
git clone https://github.com/[your-username]/video-filter.git
cd video-filter
```

## Branch Protection Rules

Based on the `kids-guard-parental-control` repository, the `main` branch has protection enabled.

### Configure Main Branch Protection

1. Navigate to: `Settings` → `Branches` → `Branch protection rules`
2. Click "Add rule" or "Add branch protection rule"
3. Configure the following settings:

#### Branch Name Pattern
```
main
```

#### Protection Settings (Recommended Configuration)

**Protect matching branches:**
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1` (or more based on team size)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
  - ✅ Require review from Code Owners (if using CODEOWNERS file)

- ✅ **Require status checks to pass before merging**
  - ✅ Require branches to be up to date before merging
  - **Required status checks** (based on GitHub Actions workflows):
    - `All Tests Passed ✅` (from test-suites.yml)
    - `Quick Test Check` (from required-tests.yml)
    - `Run All Tests` (from pr-tests.yml)
    - Or configure specific test suite checks:
      - `Storage Tests`
      - `Screen Tests`
      - `Volume Control Tests` (adapt for video-filter specific tests)
      - `Brightness Control Tests` (adapt for video-filter specific tests)

- ✅ **Require conversation resolution before merging**
  - Ensures all PR comments are addressed

- ✅ **Require signed commits** (optional but recommended for security)

- ✅ **Require linear history** (optional, prevents merge commits)

- ✅ **Do not allow bypassing the above settings**
  - Ensures even admins follow the rules

- ✅ **Restrict who can push to matching branches** (optional)
  - Limit direct pushes to specific users/teams

**Rules applied to everyone including administrators:**
- ✅ Include administrators (recommended)

4. Click "Create" or "Save changes"

## GitHub Actions Workflows

The `kids-guard-parental-control` repository uses the following workflows. Adapt these for the video-filter repository:

### Required Workflows to Create

Create a `.github/workflows/` directory in your repository and add the following workflow files:

#### 1. PR Tests Workflow (`pr-tests.yml`)

```yaml
name: PR Tests

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  test:
    name: Run All Tests
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [18.x]

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:serial
        env:
          CI: true

      - name: Upload coverage reports
        uses: codecov/codecov-action@v4
        if: always()
        with:
          file: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
          fail_ci_if_error: false
        continue-on-error: true

      - name: Archive test results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-results
          path: |
            coverage/
            junit.xml
          retention-days: 30

      - name: Comment PR with test results
        if: github.event_name == 'pull_request' && always()
        uses: actions/github-script@v7
        with:
          script: |
            const testsPassed = '${{ job.status }}' === 'success';
            const emoji = testsPassed ? '✅' : '❌';
            const status = testsPassed ? 'All tests passed!' : 'Tests failed!';

            const comment = `## ${emoji} Test Results

            **Status:** ${status}

            - **Job Status:** ${{ job.status }}
            - **Node Version:** ${{ matrix.node-version }}
            - **Tests Command:** \`npm run test:serial\`

            ${testsPassed ? '✅ All tests passed successfully!' : '❌ Some tests failed. Check the logs above for details.'}

            [View detailed results](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

#### 2. Test Suites Workflow (`test-suites.yml`)

Adapt the test suites based on video-filter specific functionality:

```yaml
name: Test Suites (Parallel)

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  # Adapt these test suites for video-filter specific modules
  core-tests:
    name: Core Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:core
        env:
          CI: true

  filter-tests:
    name: Video Filter Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:filters
        env:
          CI: true

  ui-tests:
    name: UI Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18.x'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:ui
        env:
          CI: true

  all-tests-passed:
    name: All Tests Passed ✅
    runs-on: ubuntu-latest
    needs: [core-tests, filter-tests, ui-tests]
    if: always()
    steps:
      - name: Check all test suites passed
        run: |
          if [[ "${{ needs.core-tests.result }}" != "success" ]] || \
             [[ "${{ needs.filter-tests.result }}" != "success" ]] || \
             [[ "${{ needs.ui-tests.result }}" != "success" ]]; then
            echo "❌ One or more test suites failed!"
            echo "Core: ${{ needs.core-tests.result }}"
            echo "Filters: ${{ needs.filter-tests.result }}"
            echo "UI: ${{ needs.ui-tests.result }}"
            exit 1
          fi
          echo "✅ All test suites passed!"

      - name: Comment on PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const coreResult = '${{ needs.core-tests.result }}';
            const filterResult = '${{ needs.filter-tests.result }}';
            const uiResult = '${{ needs.ui-tests.result }}';

            const emoji = (result) => result === 'success' ? '✅' : '❌';

            const comment = `## Test Results Summary

            | Test Suite | Status |
            |------------|--------|
            | Core Tests | ${emoji(coreResult)} ${coreResult} |
            | Video Filter Tests | ${emoji(filterResult)} ${filterResult} |
            | UI Tests | ${emoji(uiResult)} ${uiResult} |

            ${
              [coreResult, filterResult, uiResult].every(r => r === 'success')
                ? '✅ **All tests passed!** Ready to merge.'
                : '❌ **Tests failed.** Please fix failing tests before merging.'
            }

            [View detailed results](${{ github.server_url }}/${{ github.repository }}/actions/runs/${{ github.run_id }})
            `;

            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: comment
            });
```

#### 3. Required Tests Workflow (`required-tests.yml`)

```yaml
name: Required Tests

# This workflow runs all tests and is the required check for PRs
# Configure this as a required status check in branch protection rules

on:
  pull_request:
    branches: [ main ]
  push:
    branches: [ main ]

jobs:
  # Fast-fail check - runs individual suites in parallel for faster feedback
  quick-check:
    name: Quick Test Check
    runs-on: ubuntu-latest
    timeout-minutes: 5
    strategy:
      fail-fast: false
      matrix:
        suite:
          - { name: 'Core', command: 'test:core' }
          - { name: 'Filters', command: 'test:filters' }
          - { name: 'UI', command: 'test:ui' }

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - name: Run ${{ matrix.suite.name }} tests
        run: npm run ${{ matrix.suite.command }}
        env:
          CI: true
```

## Repository Settings

### General Settings

1. Navigate to `Settings` → `General`

**Features to enable:**
- ✅ Issues
- ✅ Projects (optional)
- ✅ Wiki (optional)
- ✅ Discussions (optional)

**Pull Requests:**
- ✅ Allow merge commits
- ✅ Allow squash merging (recommended as default)
- ✅ Allow rebase merging
- ✅ Always suggest updating pull request branches
- ✅ Allow auto-merge
- ✅ Automatically delete head branches (keeps repository clean)

### Code Security and Analysis

1. Navigate to `Settings` → `Code security and analysis`

**Enable the following:**
- ✅ Dependency graph
- ✅ Dependabot alerts
- ✅ Dependabot security updates
- ✅ Grouped security updates
- ✅ Code scanning (optional but recommended)
- ✅ Secret scanning (for public repos, automatic)

### Actions Settings

1. Navigate to `Settings` → `Actions` → `General`

**Actions permissions:**
- ✅ Allow all actions and reusable workflows

**Workflow permissions:**
- ✅ Read and write permissions (needed for PR comments and updates)
- ✅ Allow GitHub Actions to create and approve pull requests

## Initial Setup

### 1. Create Essential Files

Create the following files in your repository:

#### `.gitignore`
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Testing
coverage/
junit.xml
.jest/

# Production
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db
```

#### `README.md`
```markdown
# Video Filter

[Add your project description here]

## Features

- [List main features]

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn

### Installation

\`\`\`bash
npm install
\`\`\`

### Running the Application

\`\`\`bash
npm start
\`\`\`

### Running Tests

\`\`\`bash
npm test
\`\`\`

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

[Add your license information]
```

#### `package.json` (basic structure)
```json
{
  "name": "video-filter",
  "version": "1.0.0",
  "description": "Video filtering application",
  "main": "index.js",
  "scripts": {
    "test": "jest",
    "test:serial": "jest --runInBand",
    "test:core": "jest --testPathPattern=core",
    "test:filters": "jest --testPathPattern=filters",
    "test:ui": "jest --testPathPattern=ui",
    "lint": "eslint .",
    "start": "node index.js"
  },
  "keywords": ["video", "filter"],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "jest": "^29.0.0",
    "eslint": "^8.0.0"
  }
}
```

### 2. Initial Commit and Push

```bash
# Initialize git if not already done
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Setup video-filter repository"

# Add remote (if not already added)
git remote add origin https://github.com/[your-username]/video-filter.git

# Push to main branch
git push -u origin main
```

### 3. Configure Branch Protection

After the initial push:
1. Go to your repository on GitHub
2. Follow the [Branch Protection Rules](#branch-protection-rules) section above
3. Configure the main branch protection

### 4. Test GitHub Actions

Create a test PR to verify:
1. All GitHub Actions workflows trigger correctly
2. Required status checks appear in the PR
3. Branch protection rules prevent merging until checks pass

```bash
# Create a new branch
git checkout -b test/verify-ci

# Make a small change
echo "# Test" >> README.md

# Commit and push
git add README.md
git commit -m "Test: Verify CI/CD pipeline"
git push origin test/verify-ci
```

Then create a PR on GitHub and verify all checks run.

## Summary Checklist

Use this checklist when setting up the video-filter repository:

- [ ] Create repository on GitHub
- [ ] Clone repository locally
- [ ] Create `.github/workflows/` directory
- [ ] Add `pr-tests.yml` workflow
- [ ] Add `test-suites.yml` workflow
- [ ] Add `required-tests.yml` workflow
- [ ] Create `.gitignore` file
- [ ] Create `README.md` file
- [ ] Create `package.json` file
- [ ] Make initial commit and push
- [ ] Configure main branch protection rules
- [ ] Enable required status checks
- [ ] Configure repository settings (features, security, actions)
- [ ] Create test PR to verify CI/CD
- [ ] Verify branch protection prevents merging without passing tests
- [ ] Delete test branch after verification

## Additional Recommendations

1. **CODEOWNERS File**: Create a `.github/CODEOWNERS` file to automatically request reviews from specific people
   ```
   # Default owners for everything in the repo
   *       @your-username @team-name

   # Specific paths
   *.yml   @devops-team
   /tests/ @qa-team
   ```

2. **Issue Templates**: Create `.github/ISSUE_TEMPLATE/` with templates for bug reports and feature requests

3. **Pull Request Template**: Create `.github/pull_request_template.md` to standardize PR descriptions

4. **Contributing Guide**: Add `CONTRIBUTING.md` with guidelines for contributors

5. **Code of Conduct**: Add `CODE_OF_CONDUCT.md` for community guidelines

## Differences to Consider

While replicating the branch rules from `kids-guard-parental-control`, consider these adaptations for `video-filter`:

1. **Test Suites**: Adapt test names from storage/volume/brightness to video-filter specific modules
2. **Coverage Requirements**: Adjust if different coverage thresholds are needed
3. **Node Version**: Keep Node.js 18.x or update to latest LTS
4. **Additional Workflows**: Add deployment workflows if needed (the parent repo has `deploy-playstore.yml`)
5. **Secrets**: Configure any necessary secrets in repository settings for CI/CD

## Support

For questions or issues with this setup:
1. Review GitHub's official documentation on [branch protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
2. Check [GitHub Actions documentation](https://docs.github.com/en/actions)
3. Refer back to the `kids-guard-parental-control` repository for working examples
