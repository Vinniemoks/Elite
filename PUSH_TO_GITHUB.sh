#!/bin/bash

echo "========================================"
echo "Elite Events Kenya - GitHub Push Script"
echo "========================================"
echo ""
echo "This script will push your code to GitHub."
echo "Make sure you have created a repository on GitHub first!"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git is not installed!"
    echo "Please install Git from: https://git-scm.com"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo "ERROR: Not a git repository!"
    echo "Run 'git init' first."
    exit 1
fi

echo "Current Git Status:"
git status
echo ""

# Ask for GitHub details
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter repository name (e.g., elite-events-kenya): " REPO_NAME

if [ -z "$GITHUB_USERNAME" ] || [ -z "$REPO_NAME" ]; then
    echo "ERROR: Username and repository name are required!"
    exit 1
fi

# Check if remote already exists
if git remote | grep -q "origin"; then
    echo ""
    echo "Remote 'origin' already exists. Removing it..."
    git remote remove origin
fi

# Add remote
echo ""
echo "Adding remote repository..."
git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

# Rename branch to main if needed
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo ""
    echo "Renaming branch from '$CURRENT_BRANCH' to 'main'..."
    git branch -M main
fi

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
echo "You may be prompted for your GitHub credentials."
echo ""

if git push -u origin main; then
    echo ""
    echo "========================================"
    echo "✅ SUCCESS! Code pushed to GitHub!"
    echo "========================================"
    echo ""
    echo "Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
    echo "2. Add a description and topics"
    echo "3. Review the README.md"
    echo "4. Enable GitHub Pages for free hosting (optional)"
    echo ""
    echo "Backend Documentation Files Included:"
    echo "  ✅ MASTER_INDEX.md - Navigation guide"
    echo "  ✅ README_BACKEND_RECREATION.md - Start here"
    echo "  ✅ COMPLETE_BACKEND_PROMPT.md - Feature specs"
    echo "  ✅ API_ENDPOINTS_SPEC.md - All API endpoints"
    echo "  ✅ IMPLEMENTATION_DETAILS.md - Code examples"
    echo "  ✅ ENVIRONMENT_AND_DEPLOYMENT.md - Setup & deployment"
    echo "  ✅ EXISTING_BACKEND_ANALYSIS.md - Current state analysis"
    echo ""
else
    echo ""
    echo "========================================"
    echo "❌ ERROR: Push failed!"
    echo "========================================"
    echo ""
    echo "Common issues:"
    echo "1. Repository doesn't exist on GitHub"
    echo "   - Create it at: https://github.com/new"
    echo ""
    echo "2. Authentication failed"
    echo "   - Use a Personal Access Token instead of password"
    echo "   - Generate at: https://github.com/settings/tokens"
    echo ""
    echo "3. Permission denied"
    echo "   - Check repository access rights"
    echo ""
    exit 1
fi
