@echo off
REM HopperFlix AWS Deployment Script for Windows
REM This script helps deploy the application to AWS using SST

echo 🚀 Starting HopperFlix deployment...

REM Check if required environment variables are set
if "%OPENAI_API_KEY%"=="" (
    echo ❌ Error: OPENAI_API_KEY environment variable is not set
    echo Please set it in your .env file or export it:
    echo set OPENAI_API_KEY=your_api_key_here
    exit /b 1
)

REM Check if AWS CLI is configured
aws sts get-caller-identity >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: AWS CLI is not configured
    echo Please run 'aws configure' first
    exit /b 1
)

REM Check if SST CLI is installed
sst --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: SST CLI is not installed
    echo Please install it with: npm install -g sst
    exit /b 1
)

REM Determine deployment stage
set STAGE=%1
if "%STAGE%"=="" set STAGE=dev
echo 📦 Deploying to stage: %STAGE%

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Build the application
echo 🔨 Building application...
call npm run build

REM Deploy using SST
if "%STAGE%"=="production" (
    echo 🚀 Deploying to production...
    call npm run deploy:prod
) else (
    echo 🚀 Deploying to development...
    call npm run deploy
)

echo ✅ Deployment completed successfully!
echo 🌐 Your application should be available at the URL shown above
echo 📊 You can monitor your deployment at: https://console.aws.amazon.com/cloudformation 