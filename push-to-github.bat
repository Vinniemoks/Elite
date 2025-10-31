@echo off
echo ========================================
echo Kenya Unfiltered - GitHub Push Script
echo ========================================
echo.

REM Check if git is installed
git --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

echo Step 1: Initializing Git repository...
git init
if errorlevel 1 (
    echo Git already initialized or error occurred
)

echo.
echo Step 2: Configuring Git...
set /p USERNAME="Enter your name: "
set /p EMAIL="Enter your email: "
git config user.name "%USERNAME%"
git config user.email "%EMAIL%"

echo.
echo Step 3: Adding all files...
git add .

echo.
echo Step 4: Creating initial commit...
git commit -m "Initial commit: Kenya Unfiltered platform - Production ready with SEO, dual currency, and complete documentation"

echo.
echo Step 5: Setting up remote repository...
set /p GITHUB_USERNAME="Enter your GitHub username: "
set /p REPO_NAME="Enter repository name (default: kenya-unfiltered): "
if "%REPO_NAME%"=="" set REPO_NAME=kenya-unfiltered

git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

echo.
echo Step 6: Pushing to GitHub...
git branch -M main
git push -u origin main

echo.
echo ========================================
echo SUCCESS! Your code is now on GitHub!
echo ========================================
echo.
echo Repository URL: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
echo.
echo Next steps:
echo 1. Visit your repository on GitHub
echo 2. Add a description and topics
echo 3. Enable GitHub Pages for free hosting (optional)
echo.
pause
