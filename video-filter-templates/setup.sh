#!/bin/bash

# Video Filter Repository Setup Script
# This script automates the initial setup of the video-filter repository
# with the same structure and configuration as kids-guard-parental-control

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="video-filter"
TEMPLATE_DIR="video-filter-templates"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Video Filter Repository Setup Script                ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo ""

# Function to print step headers
print_step() {
    echo -e "\n${GREEN}▶ $1${NC}"
}

# Function to print warnings
print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

# Function to print errors
print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "$TEMPLATE_DIR" ]; then
    print_error "Template directory '$TEMPLATE_DIR' not found!"
    print_warning "Please run this script from the kids-guard-parental-control repository root."
    exit 1
fi

# Get repository owner/URL
echo -e "${BLUE}Repository Configuration:${NC}"
read -p "Enter the repository owner/organization (e.g., your-username): " REPO_OWNER
read -p "Enter the full repository URL (or press Enter for https://github.com/$REPO_OWNER/$REPO_NAME): " REPO_URL

if [ -z "$REPO_URL" ]; then
    REPO_URL="https://github.com/$REPO_OWNER/$REPO_NAME"
fi

echo ""
echo -e "${BLUE}Configuration Summary:${NC}"
echo "  Repository: $REPO_NAME"
echo "  Owner: $REPO_OWNER"
echo "  URL: $REPO_URL"
echo ""
read -p "Is this correct? (y/n): " confirm

if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
    print_error "Setup cancelled."
    exit 1
fi

# Create temporary directory for setup
TEMP_DIR="/tmp/video-filter-setup-$$"
print_step "Creating temporary working directory: $TEMP_DIR"
mkdir -p "$TEMP_DIR"

# Check if repository already exists locally
if [ -d "../$REPO_NAME" ]; then
    print_warning "Directory '../$REPO_NAME' already exists!"
    read -p "Use existing directory? (y/n): " use_existing
    if [ "$use_existing" = "y" ] || [ "$use_existing" = "Y" ]; then
        REPO_DIR="../$REPO_NAME"
        cd "$REPO_DIR"
        print_success "Using existing directory: $REPO_DIR"
    else
        print_error "Please remove or rename the existing directory first."
        exit 1
    fi
else
    # Clone or initialize repository
    print_step "Initializing repository"
    REPO_DIR="../$REPO_NAME"
    
    read -p "Clone existing repository or create new? (clone/new): " repo_action
    
    if [ "$repo_action" = "clone" ]; then
        print_step "Cloning repository from $REPO_URL"
        git clone "$REPO_URL" "$REPO_DIR" || {
            print_error "Failed to clone repository"
            exit 1
        }
    else
        print_step "Creating new repository directory"
        mkdir -p "$REPO_DIR"
    fi
    
    cd "$REPO_DIR"
fi

# Copy template files
print_step "Copying template files"

# Copy GitHub workflows
print_step "Setting up GitHub Actions workflows"
mkdir -p .github/workflows
cp -v "$(dirs +1)/$TEMPLATE_DIR/.github/workflows/"*.yml .github/workflows/
print_success "Workflows copied"

# Copy or create other template files
if [ ! -f "README.md" ]; then
    print_step "Creating README.md"
    cp "$(dirs +1)/$TEMPLATE_DIR/README.md" README.md
    print_success "README.md created"
else
    print_warning "README.md already exists, skipping"
fi

if [ ! -f ".gitignore" ]; then
    print_step "Creating .gitignore"
    cp "$(dirs +1)/$TEMPLATE_DIR/.gitignore" .gitignore
    print_success ".gitignore created"
else
    print_warning ".gitignore already exists, skipping"
fi

if [ ! -f "package.json" ]; then
    print_step "Creating package.json"
    cp "$(dirs +1)/$TEMPLATE_DIR/package.json" package.json
    print_success "package.json created"
else
    print_warning "package.json already exists, skipping"
fi

if [ ! -f "CONTRIBUTING.md" ]; then
    print_step "Creating CONTRIBUTING.md"
    cp "$(dirs +1)/$TEMPLATE_DIR/CONTRIBUTING.md" CONTRIBUTING.md
    print_success "CONTRIBUTING.md created"
else
    print_warning "CONTRIBUTING.md already exists, skipping"
fi

if [ ! -f ".github/pull_request_template.md" ]; then
    print_step "Creating PR template"
    mkdir -p .github
    cp "$(dirs +1)/$TEMPLATE_DIR/.github/pull_request_template.md" .github/pull_request_template.md
    print_success "PR template created"
else
    print_warning "PR template already exists, skipping"
fi

# Initialize git if not already initialized
if [ ! -d ".git" ]; then
    print_step "Initializing git repository"
    git init
    git remote add origin "$REPO_URL"
    print_success "Git initialized"
else
    print_success "Git already initialized"
fi

# Show status
print_step "Repository status"
git status

# Ask if user wants to commit
echo ""
read -p "Create initial commit? (y/n): " create_commit

if [ "$create_commit" = "y" ] || [ "$create_commit" = "Y" ]; then
    print_step "Creating initial commit"
    git add .
    git commit -m "Initial commit: Setup video-filter repository with CI/CD workflows

- Added GitHub Actions workflows (pr-tests, test-suites, required-tests)
- Added README.md with project overview
- Added CONTRIBUTING.md with contribution guidelines
- Added .gitignore for Node.js project
- Added package.json with test scripts
- Added PR template for standardized pull requests

Based on kids-guard-parental-control repository structure."
    print_success "Initial commit created"
    
    # Ask if user wants to push
    read -p "Push to remote repository? (y/n): " push_commit
    if [ "$push_commit" = "y" ] || [ "$push_commit" = "Y" ]; then
        print_step "Pushing to remote"
        git branch -M main
        git push -u origin main || {
            print_warning "Push failed. You may need to create the repository on GitHub first."
            print_warning "Run: git push -u origin main"
        }
    fi
fi

# Summary
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   Setup Complete!                                      ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo ""
echo "1. Navigate to your repository:"
echo -e "   ${BLUE}cd $REPO_DIR${NC}"
echo ""
echo "2. Install dependencies:"
echo -e "   ${BLUE}npm install${NC}"
echo ""
echo "3. Configure branch protection on GitHub:"
echo "   - Go to: $REPO_URL/settings/branches"
echo "   - Add branch protection rule for 'main'"
echo "   - Enable required status checks:"
echo "     • All Tests Passed ✅"
echo "     • Run All Tests"
echo "     • Quick Test Check"
echo ""
echo "4. Review and customize the template files:"
echo "   - README.md"
echo "   - package.json"
echo "   - CONTRIBUTING.md"
echo "   - .github/workflows/*.yml"
echo ""
echo "5. Create your first feature branch:"
echo -e "   ${BLUE}git checkout -b feature/initial-setup${NC}"
echo ""
echo "6. Start development!"
echo ""
echo -e "${YELLOW}📖 For detailed setup instructions, see:${NC}"
echo "   VIDEO_FILTER_REPOSITORY_SETUP.md"
echo "   BRANCH_PROTECTION_QUICK_REFERENCE.md"
echo ""
print_success "Setup complete! Happy coding! 🚀"
