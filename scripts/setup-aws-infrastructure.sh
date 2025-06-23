#!/bin/bash

# AWS Infrastructure Setup for PWA Deployment
# This script sets up S3 bucket and CloudFront distribution for hosting the PWA

set -e

# Configuration
BUCKET_NAME=${1:-"expense-split-pwa-$(date +%s)"}
AWS_REGION=${2:-"us-east-1"}
DOMAIN_NAME=${3:-""}

echo "🚀 Setting up AWS infrastructure for PWA deployment..."
echo "📦 Bucket Name: $BUCKET_NAME"
echo "🌍 Region: $AWS_REGION"

# Create S3 bucket
echo "📦 Creating S3 bucket..."
aws s3 mb s3://$BUCKET_NAME --region $AWS_REGION

# Enable static website hosting
echo "🌐 Configuring static website hosting..."
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

# Set bucket policy for public read access
echo "🔓 Setting bucket policy..."
cat > /tmp/bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket $BUCKET_NAME --policy file:///tmp/bucket-policy.json

# Enable CORS for PWA
echo "🔄 Setting CORS configuration..."
cat > /tmp/cors-config.json << EOF
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
EOF

aws s3api put-bucket-cors --bucket $BUCKET_NAME --cors-configuration file:///tmp/cors-config.json

# Create CloudFront distribution
echo "🚀 Creating CloudFront distribution..."
cat > /tmp/cloudfront-config.json << EOF
{
  "CallerReference": "$BUCKET_NAME-$(date +%s)",
  "Comment": "PWA Distribution for Expense Split App",
  "DefaultCacheBehavior": {
    "TargetOriginId": "$BUCKET_NAME-origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": {
      "Quantity": 7,
      "Items": ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"],
      "CachedMethods": {
        "Quantity": 2,
        "Items": ["GET", "HEAD"]
      }
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000,
    "Compress": true
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "$BUCKET_NAME-origin",
        "DomainName": "$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com",
        "CustomOriginConfig": {
          "HTTPPort": 80,
          "HTTPSPort": 443,
          "OriginProtocolPolicy": "http-only"
        }
      }
    ]
  },
  "Enabled": true,
  "CustomErrorResponses": {
    "Quantity": 2,
    "Items": [
      {
        "ErrorCode": 404,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      },
      {
        "ErrorCode": 403,
        "ResponsePagePath": "/index.html",
        "ResponseCode": "200",
        "ErrorCachingMinTTL": 300
      }
    ]
  },
  "PriceClass": "PriceClass_100"
}
EOF

# Create the distribution
DISTRIBUTION_OUTPUT=$(aws cloudfront create-distribution --distribution-config file:///tmp/cloudfront-config.json)
DISTRIBUTION_ID=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.Id')
DISTRIBUTION_DOMAIN=$(echo $DISTRIBUTION_OUTPUT | jq -r '.Distribution.DomainName')

echo "✅ AWS Infrastructure setup complete!"
echo ""
echo "📝 Configuration Summary:"
echo "  S3 Bucket: $BUCKET_NAME"
echo "  Bucket URL: http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com"
echo "  CloudFront Distribution ID: $DISTRIBUTION_ID"
echo "  CloudFront Domain: $DISTRIBUTION_DOMAIN"
echo ""
echo "🔧 GitHub Secrets to add:"
echo "  AWS_ACCESS_KEY_ID: <your-aws-access-key>"
echo "  AWS_SECRET_ACCESS_KEY: <your-aws-secret-key>"
echo "  S3_BUCKET_NAME: $BUCKET_NAME"
echo "  CLOUDFRONT_DISTRIBUTION_ID: $DISTRIBUTION_ID"
echo ""
echo "⏳ Note: CloudFront distribution may take 15-20 minutes to fully deploy."
echo "🌐 Your PWA will be available at: https://$DISTRIBUTION_DOMAIN"

# Save configuration to file
cat > aws-config.json << EOF
{
  "bucketName": "$BUCKET_NAME",
  "region": "$AWS_REGION",
  "bucketUrl": "http://$BUCKET_NAME.s3-website-$AWS_REGION.amazonaws.com",
  "distributionId": "$DISTRIBUTION_ID",
  "distributionDomain": "$DISTRIBUTION_DOMAIN",
  "setupDate": "$(date -u +%Y-%m-%dT%H:%M:%SZ)"
}
EOF

echo "💾 Configuration saved to aws-config.json"

# Cleanup temp files
rm -f /tmp/bucket-policy.json /tmp/cors-config.json /tmp/cloudfront-config.json

echo "🎉 Setup complete! Your PWA infrastructure is ready for deployment." 