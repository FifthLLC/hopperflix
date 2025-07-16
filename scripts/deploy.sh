#!/bin/bash

# HopperFlix AWS Deployment Script
# This script helps deploy the application to AWS using SST

set -e

echo "🚀 Starting HopperFlix deployment..."

# Check if required environment variables are set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable is not set"
    echo "Please set it in your .env file or export it:"
    echo "export OPENAI_API_KEY=your_api_key_here"
    exit 1
fi

# Check if AWS CLI is configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ Error: AWS CLI is not configured"
    echo "Please run 'aws configure' first"
    exit 1
fi

# Check if SST CLI is installed
if ! command -v sst &> /dev/null; then
    echo "❌ Error: SST CLI is not installed"
    echo "Please install it with: npm install -g sst"
    exit 1
fi

# Determine deployment stage
STAGE=${1:-dev}
echo "📦 Deploying to stage: $STAGE"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Deploy using SST
if [ "$STAGE" = "production" ]; then
    echo "🚀 Deploying to production..."
    npm run deploy:prod
else
    echo "🚀 Deploying to development..."
    npm run deploy
fi

echo "✅ Deployment completed successfully!"
echo "🌐 Your application should be available at the URL shown above"
echo "📊 You can monitor your deployment at: https://console.aws.amazon.com/cloudformation" 