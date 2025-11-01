@echo off
echo ========================================
echo Elite Events Kenya - GitHub Push Script
echo ========================================
echo.
echo This script will push your code to GitHub.
echo Make sure you have created a repository on GitHub first!
echo.

REM Check if git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed!
    echo Please install Git from: https://git-scm.com
    pause
    exit /b 1
)

REM Check if we're in a git repository
if not exist .git (
    echo ERROR: Not a git repository!
    echo Run 'git init' first.
    pause
    exit /b 1
)

echo Current Git Status:
git status
echo.

REM Ask for GitHub details
set /p GITHUB_USERNAME="Enter your GitHub username: "
set /p REPO_NAME="Enter repository name (e.g., elite-events-kenya): "

if "%GITHUB_USERNAME%"=="" (
    echo ERROR: Username is required!
    pause
    exit /b 1
)

if "%REPO_NAME%"=="" (
    echo ERROR: Repository name is required!
    pause
    exit /b 1
)

REM Check if remote already exists
git remote | findstr "origin" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo.
    echo Remote 'origin' already exists. Removing it...
    git remote remove origin
)

REM Add remote
echo.
echo Adding remote repository...
git remote add origin https://github.com/%GITHUB_USERNAME%/%REPO_NAME%.git

REM Rename branch to main if needed
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if not "%CURRENT_BRANCH%"=="main" (
    echo.
    echo Renaming branch from '%CURRENT_BRANCH%' to 'main'...
    git branch -M main
)

REM Push to GitHub
echo.
echo Pushing to GitHub...
echo You may be prompted for your GitHub credentials.
echo.

git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo SUCCESS! Code pushed to GitHub!
    echo ========================================
    echo.
    echo Repository URL: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
    echo.
    echo Next steps:
    echo 1. Visit your repository: https://github.com/%GITHUB_USERNAME%/%REPO_NAME%
    echo 2. Add a description and topics
    echo 3. Review the README.md
    echo 4. Enable GitHub Pages for free hosting (optional^)
    echo.
    echo Backend Documentation Files Included:
    echo   - MASTER_INDEX.md - Navigation guide
    echo   - README_BACKEND_RECREATION.md - Start here
    echo   - COMPLETE_BACKEND_PROMPT.md - Feature specs
    echo   - API_ENDPOINTS_SPEC.md - All API endpoints
    echo   - IMPLEMENTATION_DETAILS.md - Code examples
    echo   - ENVIRONMENT_AND_DEPLOYMENT.md - Setup and deployment
    echo   - EXISTING_BACKEND_ANALYSIS.md - Current state analysis
    echo.
) else (
    echo.
    echo ========================================
    echo ERROR: Push failed!
    echo ========================================
    echo.
    echo Common issues:
    echo 1. Repository doesn't exist on GitHub
    echo    - Create it at: https://github.com/new
    echo.
    echo 2. Authentication failed
    echo    - Use a Personal Access Token instead of password
    echo    - Generate at: https://github.com/settings/tokens
    echo.
    echo 3. Permission denied
    echo    - Check repository access rights
    echo.
)

pause
