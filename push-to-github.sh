#!/bin/bash

echo "========================================"
echo "Elite Events Kenya - GitHub Push Script"
echo "========================================"
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "ERROR: Git is not installed!"
    echo "Please install Git from: https://git-scm.com"
    exit 1
fi

echo "Step 1: Initializing Git repository..."
git init

echo ""
echo "Step 2: Configuring Git..."
read -p "Enter your name: " USERNAME
read -p "Enter your email: " EMAIL
git config user.name "$USERNAME"
git config user.email "$EMAIL"

echo ""
echo "Step 3: Adding all files..."
git add .

echo ""
echo "Step 4: Creating initial commit..."
git commit -m "Initial commit: Elite Events Kenya platform - Production ready with SEO, dual currency, and complete documentation"

echo ""
echo "Step 5: Setting up remote repository..."
read -p "Enter your GitHub username: " GITHUB_USERNAME
read -p "Enter repository name (default: kenya-unfiltered): " REPO_NAME
REPO_NAME=${REPO_NAME:-kenya-unfiltered}

git remote add origin https://github.com/$GITHUB_USERNAME/$REPO_NAME.git

echo ""
echo "Step 6: Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "========================================"
echo "SUCCESS! Your code is now on GitHub!"
echo "========================================"
echo ""
echo "Repository URL: https://github.com/$GITHUB_USERNAME/$REPO_NAME"
echo ""
echo "Next steps:"
echo "1. Visit your repository on GitHub"
echo "2. Add a description and topics"
echo "3. Enable GitHub Pages for free hosting (optional)"
echo ""
