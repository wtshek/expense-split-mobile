#!/bin/bash

# Quick Deployment Setup Script
# This script helps you set up the deployment environment quickly

set -e

echo "🚀 Expense Split PWA - Deployment Setup"
echo "======================================="
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed."
    echo "Please install it first: https://aws.amazon.com/cli/"
    exit 1
fi

# Check if user is logged into AWS
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ You are not logged into AWS."
    echo "Please run: aws configure"
    exit 1
fi

echo "✅ AWS CLI is configured"

# Get user input for deployment settings
echo ""
echo "📝 Please provide the following information:"
echo ""

read -p "Enter your desired S3 bucket name (must be globally unique): " BUCKET_NAME
read -p "Enter AWS region (default: us-east-1): " AWS_REGION
AWS_REGION=${AWS_REGION:-us-east-1}

read -p "Do you have a custom domain? (y/n): " HAS_DOMAIN
if [ "$HAS_DOMAIN" = "y" ]; then
    read -p "Enter your domain name: " DOMAIN_NAME
fi

echo ""
echo "🔧 Configuration Summary:"
echo "  Bucket Name: $BUCKET_NAME"
echo "  AWS Region: $AWS_REGION"
if [ "$HAS_DOMAIN" = "y" ]; then
    echo "  Domain: $DOMAIN_NAME"
fi
echo ""

read -p "Proceed with AWS infrastructure setup? (y/n): " PROCEED
if [ "$PROCEED" != "y" ]; then
    echo "Setup cancelled."
    exit 0
fi

# Run the infrastructure setup
echo "🏗️ Setting up AWS infrastructure..."
if [ "$HAS_DOMAIN" = "y" ]; then
    ./scripts/setup-aws-infrastructure.sh "$BUCKET_NAME" "$AWS_REGION" "$DOMAIN_NAME"
else
    ./scripts/setup-aws-infrastructure.sh "$BUCKET_NAME" "$AWS_REGION"
fi

echo ""
echo "📋 Next Steps:"
echo "1. Copy the GitHub secrets information above"
echo "2. Go to your GitHub repository"
echo "3. Navigate to Settings → Secrets and variables → Actions"
echo "4. Add all the required secrets"
echo "5. Push your code to trigger the first deployment"
echo ""
echo "📖 For detailed instructions, see: DEPLOYMENT_GUIDE.md"
echo ""
echo "🎉 Setup complete! Your PWA is ready for deployment." 